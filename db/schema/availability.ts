import { relations, sql } from "drizzle-orm";
import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
  date,
} from "drizzle-orm/mysql-core";
import { userSchema } from "./user";

export const availableDaySchema = mysqlTable("available_day", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userId: varchar("user_id", { length: 256 }).references(() => userSchema.id, {
    onDelete: "cascade",
  }),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  remark: text("remark"),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]),
  createdAt: datetime("created_at", { mode: "string" }).default(
    sql`(utc_timestamp())`,
  ),
  timestamp: int("timestamp")
    .notNull()
    .default(sql`(unix_timestamp())`),
});

export const availableTimeSchema = mysqlTable("available_time", {
  id: varchar("id", { length: 256 }).primaryKey(),
  availableDayId: varchar("available_day_id", { length: 256 }).references(
    () => availableDaySchema.id,
    {
      onDelete: "cascade",
    },
  ),
  startTime: datetime("start_time", { mode: "string" }),
  endTime: datetime("end_time", { mode: "string" }),
  remark: text("remark"),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]),
  createdAt: datetime("created_at", { mode: "string" }).default(
    sql`(utc_timestamp())`,
  ),
  timestamp: int("timestamp")
    .notNull()
    .default(sql`(unix_timestamp())`),
});

export const availableDayRelations = relations(
  availableDaySchema,
  ({ one, many }) => ({
    user: one(userSchema, {
      fields: [availableDaySchema.userId],
      references: [userSchema.id],
    }),
    availableTimes: many(availableTimeSchema),
  }),
);

export const availableTimeRelations = relations(
  availableTimeSchema,
  ({ one }) => ({
    availableDay: one(availableDaySchema, {
      fields: [availableTimeSchema.availableDayId],
      references: [availableDaySchema.id],
    }),
  }),
);

export type AvailableDayType = typeof availableDaySchema.$inferSelect; // return type when queried
export type NewAvailableDayType = typeof availableDaySchema.$inferInsert; // insert type

export type AvailableTimeType = typeof availableTimeSchema.$inferSelect; // return type when queried
export type NewAvailableTimeType = typeof availableTimeSchema.$inferInsert; // insert type
