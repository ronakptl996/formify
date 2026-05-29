import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@repo/database";
import { formsTable } from "@repo/database";
import { eq, and, desc } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { FormField } from "@repo/database/models/form";

const TAGS = ["Forms"];

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "email", "number", "select", "checkbox", "rating", "date"]),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

const formOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  published: z.boolean(),
  visibility: z.string(),
  fields: z.array(formFieldSchema),
  theme: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const formRouter = router({
  listCreatorForms: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/dashboard", tags: TAGS } })
    .input(z.undefined())
    .output(z.array(formOutputSchema))
    .query(async ({ ctx }) => {
      const forms = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.userId, ctx.user.id))
        .orderBy(desc(formsTable.createdAt));

      return forms;
    }),

  listPublicForms: publicProcedure
    .meta({ openapi: { method: "GET", path: "/forms/explore", tags: TAGS } })
    .input(z.undefined())
    .output(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().nullable(),
          theme: z.string(),
          fieldsCount: z.number(),
        })
      )
    )
    .query(async () => {
      const forms = await db
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.published, true), eq(formsTable.visibility, "public")))
        .orderBy(desc(formsTable.createdAt));

      return forms.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        theme: f.theme,
        fieldsCount: f.fields.length,
      }));
    }),

  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/forms", tags: TAGS } })
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      // Default forms are initialized with a standard first name field
      const defaultFields: FormField[] = [
        {
          id: "field_" + Math.random().toString(36).substring(2, 9),
          type: "text",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
        },
      ];

      const [newForm] = await db
        .insert(formsTable)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description || "",
          fields: defaultFields,
          theme: "default",
          published: false,
          visibility: "unlisted",
        })
        .returning();

      if (!newForm) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create form.",
        });
      }

      return newForm;
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PUT", path: "/forms/{id}", tags: TAGS } })
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional().nullable(),
        published: z.boolean(),
        visibility: z.enum(["public", "unlisted"]),
        theme: z.string(),
        fields: z.array(formFieldSchema),
      })
    )
    .output(formOutputSchema)
    .mutation(async ({ input, ctx }) => {
      // Check ownership
      const [existingForm] = await db
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!existingForm) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or you do not have permission to modify it.",
        });
      }

      const [updatedForm] = await db
        .update(formsTable)
        .set({
          title: input.title,
          description: input.description || "",
          published: input.published,
          visibility: input.visibility,
          theme: input.theme,
          fields: input.fields as FormField[],
        })
        .where(eq(formsTable.id, input.id))
        .returning();

      if (!updatedForm) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update form.",
        });
      }

      return updatedForm;
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/forms/{id}", tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      // Check ownership
      const [existingForm] = await db
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!existingForm) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or you do not have permission to delete it.",
        });
      }

      await db.delete(formsTable).where(eq(formsTable.id, input.id));

      return { success: true };
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{id}", tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(formOutputSchema)
    .query(async ({ input, ctx }) => {
      const [form] = await db
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.id, input.id), eq(formsTable.userId, ctx.user.id)))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or access denied.",
        });
      }

      return form;
    }),

  getPublicForm: publicProcedure
    .meta({ openapi: { method: "GET", path: "/forms/{id}/public", tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        fields: z.array(formFieldSchema),
        theme: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [form] = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.id, input.id))
        .limit(1);

      if (!form || !form.published) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found, has been unpublished, or is unavailable.",
        });
      }

      return {
        id: form.id,
        title: form.title,
        description: form.description,
        fields: form.fields,
        theme: form.theme,
      };
    }),
});
