import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@repo/database";
import { formsTable, responsesTable, usersTable } from "@repo/database";
import { eq, and, desc, gt } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { addEmail } from "../../utils/email-store";

const TAGS = ["Responses"];

export const responseRouter = router({
  submit: publicProcedure
    .meta({ openapi: { method: "POST", path: "/responses/submit", tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid(),
        answers: z.record(z.string(), z.any()),
      })
    )
    .output(z.object({ success: z.boolean(), responseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 1. Fetch form
      const [form] = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.id, input.formId))
        .limit(1);

      if (!form || !form.published) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The form does not exist or has been unpublished by the creator.",
        });
      }

      // Resolve client IP
      const clientIp = ctx.req
        ? ctx.req.headers["x-forwarded-for"] || ctx.req.socket.remoteAddress
        : "127.0.0.1";
      const ipString = Array.isArray(clientIp) ? clientIp[0] : (clientIp as string) || "127.0.0.1";

      // 2. Rate Limiting Spam Check (5 submissions per minute)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentSubmissions = await db
        .select()
        .from(responsesTable)
        .where(and(eq(responsesTable.formId, form.id), gt(responsesTable.submittedAt, oneMinuteAgo)));

      const ipMatches = recentSubmissions.filter((r) => r.meta?.ip === ipString);
      if (ipMatches.length >= 5) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please wait a minute before submitting again to prevent spam.",
        });
      }

      // 3. Dynamic Field & Validation Checking
      const answers: Record<string, any> = {};

      for (const field of form.fields) {
        const value = input.answers[field.id];

        // Required check
        if (field.required && (value === undefined || value === null || value === "")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Field "${field.label}" is required.`,
          });
        }

        if (value !== undefined && value !== null && value !== "") {
          // Specific validation types
          if (field.type === "email") {
            const emailParse = z.string().email().safeParse(value);
            if (!emailParse.success) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Field "${field.label}" must be a valid email address.`,
              });
            }
          } else if (field.type === "number") {
            const numValue = Number(value);
            if (isNaN(numValue)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Field "${field.label}" must be a number.`,
              });
            }
          }
          answers[field.id] = value;
        }
      }

      const [newResponse] = await db
        .insert(responsesTable)
        .values({
          formId: form.id,
          answers: answers,
          meta: {
            ip: ipString,
            userAgent: ctx.req ? ctx.req.headers["user-agent"] : "API Agent",
          },
        })
        .returning();

      if (!newResponse) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record response.",
        });
      }

      // 5. Trigger Simulated Email Notifications
      const [creatorUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, form.userId))
        .limit(1);

      if (creatorUser) {
        // A. Send Notification to Creator
        const answerSummary = Object.entries(answers)
          .map(([key, val]) => {
            const fieldDef = form.fields.find((f) => f.id === key);
            const label = fieldDef ? fieldDef.label : key;
            return `• ${label}: ${val}`;
          })
          .join("\n");

        addEmail({
          to: creatorUser.email,
          subject: `New Response: ${form.title} 🛎️`,
          body: `Hi ${creatorUser.fullName}!\n\nYour form "${form.title}" just received a new submission!\n\nSubmission Details:\n${answerSummary}\n\nReview this in your Analytics Dashboard at any time!\n\nBest,\nFormify System`,
          type: "creator_notification",
        });

        // B. Send Confirmation to Respondent (if email field is present)
        const emailField = form.fields.find((f) => f.type === "email");
        if (emailField && answers[emailField.id]) {
          const respondentEmail = answers[emailField.id];
          addEmail({
            to: respondentEmail,
            subject: `Submission Confirmed: ${form.title} ✅`,
            body: `Hi there!\n\nThank you for filling out "${form.title}". Your answers have been successfully recorded.\n\nWe appreciate your response!\n\nCheers,\nThe Formify Team`,
            type: "respondent_confirmation",
          });
        }
      }

      return {
        success: true,
        responseId: newResponse.id,
      };
    }),

  listByForm: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/responses/form/{formId}", tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(
      z.object({
        form: z.object({
          id: z.string(),
          title: z.string(),
          fields: z.array(z.any()),
        }),
        responses: z.array(z.any()),
        analytics: z.object({
          totalResponses: z.number(),
          averageRating: z.number().nullable(),
          optionCounts: z.record(z.string(), z.record(z.string(), z.number())), // maps selectFieldId -> { optionName -> count }
          checkboxCounts: z.record(z.string(), z.number()), // maps checkboxFieldId -> checkedCount
          recentHistory: z.array(z.object({ date: z.string(), count: z.number() })),
        }),
      })
    )
    .query(async ({ input, ctx }) => {
      // Confirm ownership
      const [form] = await db
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.id, input.formId), eq(formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or access denied.",
        });
      }

      // Fetch all responses
      const responses = await db
        .select()
        .from(responsesTable)
        .where(eq(responsesTable.formId, form.id))
        .orderBy(desc(responsesTable.submittedAt));

      // Calculate Analytics
      const totalResponses = responses.length;

      // Average ratings calculation
      let totalRating = 0;
      let ratingCount = 0;

      // Option frequencies map
      const optionCounts: Record<string, Record<string, number>> = {};
      // Checkbox positives map
      const checkboxCounts: Record<string, number> = {};

      // Initialize structures based on fields
      form.fields.forEach((field) => {
        if (field.type === "select" && field.options) {
          const counts: Record<string, number> = {};
          field.options.forEach((opt) => {
            counts[opt] = 0;
          });
          optionCounts[field.id] = counts;
        }
        if (field.type === "checkbox") {
          checkboxCounts[field.id] = 0;
        }
      });

      // Date timeline map
      const dateHistoryMap: Record<string, number> = {};

      responses.forEach((resp) => {
        // Date mapping
        const dateStr = new Date(resp.submittedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        dateHistoryMap[dateStr] = (dateHistoryMap[dateStr] || 0) + 1;

        // Dynamic answers parsing
        Object.entries(resp.answers).forEach(([fieldId, ansVal]) => {
          const fieldDef = form.fields.find((f) => f.id === fieldId);
          if (!fieldDef) return;

          if (fieldDef.type === "rating") {
            totalRating += Number(ansVal);
            ratingCount++;
          } else if (fieldDef.type === "select") {
            const counts = optionCounts[fieldId];
            if (counts) {
              const selectVal = String(ansVal);
              if (counts[selectVal] !== undefined) {
                counts[selectVal]++;
              }
            }
          } else if (fieldDef.type === "checkbox") {
            const currentCount = checkboxCounts[fieldId];
            if (currentCount !== undefined) {
              if (ansVal === true || ansVal === "true") {
                checkboxCounts[fieldId] = currentCount + 1;
              }
            }
          }
        });
      });

      // Convert timeline history to sorted list
      const recentHistory = Object.entries(dateHistoryMap)
        .map(([date, count]) => ({ date, count }))
        .slice(-7); // Last 7 unique active days

      return {
        form: {
          id: form.id,
          title: form.title,
          fields: form.fields,
        },
        responses,
        analytics: {
          totalResponses,
          averageRating: ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : null,
          optionCounts,
          checkboxCounts,
          recentHistory,
        },
      };
    }),
});
