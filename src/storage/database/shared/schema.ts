import { sql } from "drizzle-orm";
import { pgTable, varchar, date, timestamp, serial, index, uniqueIndex } from "drizzle-orm/pg-core";

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 打卡记录表 - 每天早中晚三次打卡
export const checkinRecords = pgTable(
  "checkin_records",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    checkin_date: date("checkin_date").notNull(),
    period: varchar("period", { length: 10 }).notNull(), // morning / noon / evening
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("checkin_records_date_idx").on(table.checkin_date),
    index("checkin_records_period_idx").on(table.period),
    uniqueIndex("checkin_records_date_period_idx").on(table.checkin_date, table.period),
  ]
);
