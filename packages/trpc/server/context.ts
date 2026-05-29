import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { db } from "@repo/database";
import { sessionsTable, usersTable } from "@repo/database";
import { eq } from "drizzle-orm";

export async function createContext(opts?: CreateExpressContextOptions | any) {
  const req = opts?.req;
  const res = opts?.res;

  let user = null;
  let sessionToken = null;

  if (req) {
    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      sessionToken = authHeader.substring(7);
    }

    // 2. Check Cookie (for browser requests)
    if (!sessionToken && req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split(";").map((c: string) => {
          const parts = c.trim().split("=");
          return [parts[0], parts.slice(1).join("=")];
        })
      );
      sessionToken = cookies["session"];
    }

    // 3. Check X-API-Key header (for third-party API / Scalar docs requests)
    const apiKey = req.headers["x-api-key"] || req.query?.apiKey;
    if (apiKey) {
      const [dbUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.apiKey, apiKey as string))
        .limit(1);
      if (dbUser) {
        user = dbUser;
      }
    }

    // 4. Resolve session token
    if (sessionToken && !user) {
      const [session] = await db
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.id, sessionToken))
        .limit(1);

      if (session && session.expiresAt > new Date()) {
        const [dbUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, session.userId))
          .limit(1);
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  }

  return {
    req,
    res,
    user,
    sessionToken,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
