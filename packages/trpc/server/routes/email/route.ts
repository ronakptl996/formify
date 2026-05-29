import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { getEmails } from "../../utils/email-store";

const TAGS = ["Email Simulation"];

export const emailRouter = router({
  listSimulatedEmails: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/emails", tags: TAGS } })
    .input(z.undefined())
    .output(
      z.array(
        z.object({
          id: z.string(),
          to: z.string(),
          subject: z.string(),
          body: z.string(),
          sentAt: z.date(),
          type: z.string(),
        })
      )
    )
    .query(async ({ ctx }) => {
      const allEmails = getEmails();

      // Filter emails sent to the logged-in creator's email address
      const creatorEmail = ctx.user.email.toLowerCase();
      const filtered = allEmails.filter(
        (email) => email.to.toLowerCase() === creatorEmail
      );

      return filtered;
    }),
});
