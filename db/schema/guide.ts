import { sql } from "drizzle-orm";
import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

export const guideSchema = mysqlTable("guide", {
  id: varchar("id", { length: 256 }).primaryKey(),
  guideName: varchar("guide_name", { length: 256 }),
  dateOfBirth: datetime("date_of_birth", { mode: "string" }),
  nationality: varchar("nationality", { length: 256 }),
  email: varchar("email", { length: 256 }),
  phoneNumber: varchar("phone_number", { length: 256 }),
  address: text("address"),
  profileImage: varchar("profile_image", { length: 256 }),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]),
  createdAt: datetime("created_at", { mode: "string" }).default(
    sql`(utc_timestamp())`,
  ),
  timestamp: int("timestamp")
    .notNull()
    .default(sql`(unix_timestamp())`),
});

export type GuideType = typeof guideSchema.$inferSelect; // return type when queried
export type NewGuideType = typeof guideSchema.$inferInsert; // insert type
