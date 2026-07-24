import { sql } from "drizzle-orm";
import { pgTable, varchar, text, date, timestamp, serial, index } from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 打卡任务表
export const checkinTasks = pgTable(
  "checkin_tasks",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 10 }).notNull().default("✅"),
    color: varchar("color", { length: 20 }).notNull().default("#6366f1"),
    description: text("description"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("checkin_tasks_created_at_idx").on(table.created_at),
  ]
);

// 打卡记录表
export const checkinRecords = pgTable(
  "checkin_records",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    task_id: varchar("task_id", { length: 36 }).notNull().references(() => checkinTasks.id, { onDelete: "cascade" }),
    checkin_date: date("checkin_date").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("checkin_records_task_id_idx").on(table.task_id),
    index("checkin_records_date_idx").on(table.checkin_date),
    index("checkin_records_task_date_idx").on(table.task_id, table.checkin_date),
  ]
);

const { createInsertSchema } = createSchemaFactory({ coerce: { date: true } });
export const insertTaskSchema = createInsertSchema(checkinTasks).pick({ name: true, icon: true, color: true, description: true });
export const insertRecordSchema = createInsertSchema(checkinRecords).pick({ task_id: true, checkin_date: true });
