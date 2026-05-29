import { pgTable, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const responsesTable = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => formsTable.id, { onDelete: "cascade" })
    .notNull(),
  answers: jsonb("answers").$type<Record<string, any>>().notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  meta: jsonb("meta").$type<{
    ip?: string;
    userAgent?: string;
  }>(),
});

export type SelectResponse = typeof responsesTable.$inferSelect;
export type InsertResponse = typeof responsesTable.$inferInsert;
