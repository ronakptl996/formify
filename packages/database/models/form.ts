import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export interface FormField {
  id: string;
  type: "text" | "email" | "number" | "select" | "checkbox" | "rating" | "date";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select type
  validation?: {
    min?: number;
    max?: number;
  };
}

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  published: boolean("published").default(false).notNull(),
  visibility: varchar("visibility", { length: 50 }).default("unlisted").notNull(), // 'public' | 'unlisted'
  fields: jsonb("fields").$type<FormField[]>().default([]).notNull(),
  theme: varchar("theme", { length: 100 }).default("default").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).defaultNow().notNull(),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
