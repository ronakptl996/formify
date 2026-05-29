import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "@repo/database";
import { usersTable, sessionsTable } from "@repo/database";
import { eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { hashPassword, verifyPassword, generateToken } from "../../utils/crypto";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";

const TAGS = ["Authentication"];
const getPath = generatePath("/auth");

const userOutputSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  profileImageUrl: z.string().nullable(),
  apiKey: z.string().nullable(),
  createdAt: z.date().nullable(),
});

export const authRouter = router({
  // Compatibility with starter repo
  getSupportedAuthenticationProviders: publicProcedure
    .meta({ openapi: { method: "GET", path: "/auth/supported-providers", tags: TAGS } })
    .input(z.undefined())
    .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
    .query(async () => {
      const supportedMethods = await userService.getAuthenticationMethods();
      return supportedMethods;
    }),

  register: publicProcedure
    .meta({ openapi: { method: "POST", path: "/auth/register", tags: TAGS } })
    .input(
      z.object({
        fullName: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .output(
      z.object({
        user: userOutputSchema,
        sessionToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if email already registered
      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, input.email.toLowerCase()))
        .limit(1);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email address is already in use.",
        });
      }

      // Hash password
      const passwordHash = hashPassword(input.password);
      // Generate default API key for developer Scalar sandbox
      const apiKey = "formify_" + generateToken().substring(0, 24);

      const [newUser] = await db
        .insert(usersTable)
        .values({
          fullName: input.fullName,
          email: input.email.toLowerCase(),
          passwordHash,
          apiKey,
        })
        .returning();

      if (!newUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user profile.",
        });
      }

      // Create session
      const sessionToken = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session

      await db.insert(sessionsTable).values({
        id: sessionToken,
        userId: newUser.id,
        expiresAt,
      });

      // Set cookie in response if available
      if (ctx.res) {
        ctx.res.setHeader(
          "Set-Cookie",
          `session=${sessionToken}; Path=/; HttpOnly; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`
        );
      }

      return {
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          profileImageUrl: newUser.profileImageUrl,
          apiKey: newUser.apiKey,
          createdAt: newUser.createdAt,
        },
        sessionToken,
      };
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: "/auth/login", tags: TAGS } })
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .output(
      z.object({
        user: userOutputSchema,
        sessionToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [dbUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, input.email.toLowerCase()))
        .limit(1);

      if (!dbUser || !dbUser.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const isValid = verifyPassword(input.password, dbUser.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      // Create session
      const sessionToken = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session

      await db.insert(sessionsTable).values({
        id: sessionToken,
        userId: dbUser.id,
        expiresAt,
      });

      // Set cookie
      if (ctx.res) {
        ctx.res.setHeader(
          "Set-Cookie",
          `session=${sessionToken}; Path=/; HttpOnly; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`
        );
      }

      return {
        user: {
          id: dbUser.id,
          fullName: dbUser.fullName,
          email: dbUser.email,
          profileImageUrl: dbUser.profileImageUrl,
          apiKey: dbUser.apiKey,
          createdAt: dbUser.createdAt,
        },
        sessionToken,
      };
    }),

  me: publicProcedure
    .meta({ openapi: { method: "GET", path: "/auth/me", tags: TAGS } })
    .input(z.undefined())
    .output(userOutputSchema.nullable())
    .query(async ({ ctx }) => {
      if (!ctx.user) return null;
      return {
        id: ctx.user.id,
        fullName: ctx.user.fullName,
        email: ctx.user.email,
        profileImageUrl: ctx.user.profileImageUrl,
        apiKey: ctx.user.apiKey,
        createdAt: ctx.user.createdAt,
      };
    }),

  logout: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/auth/logout", tags: TAGS } })
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      if (ctx.sessionToken) {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, ctx.sessionToken));
      }

      if (ctx.res) {
        ctx.res.setHeader("Set-Cookie", "session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax");
      }

      return { success: true };
    }),

  regenerateApiKey: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/auth/api-key", tags: TAGS } })
    .input(z.undefined())
    .output(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx }) => {
      const newApiKey = "formify_" + generateToken().substring(0, 24);

      await db
        .update(usersTable)
        .set({ apiKey: newApiKey })
        .where(eq(usersTable.id, ctx.user.id));

      return { apiKey: newApiKey };
    }),
});
