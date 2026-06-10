import { sql } from "drizzle-orm";
import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

export const userSchema = mysqlTable("user", {
  id: varchar("id", { length: 256 }).primaryKey(),
  fullName: varchar("full_name", { length: 256 }),
  username: varchar("username", { length: 256 }),
  email: varchar("email", { length: 256 }),
  phoneNumber: varchar("phone_number", { length: 256 }),
  verifiedEmail: varchar("verified_email", { length: 256 }),
  hashPassword: varchar("hash_password", { length: 256 }),
  imageProfile: varchar("image_profile", { length: 500 }),
  role: mysqlEnum("role", ["Guide", "Agency"]),
  status: mysqlEnum("status", ["Active", "Inactive"]).$defaultFn(
    () => "Active",
  ),
  isRegisterUser: boolean("is_register_user").$defaultFn(() => false),
  isVerified: boolean("is_verified").$defaultFn(() => false),
  isFirstLogin: boolean("is_first_login").$defaultFn(() => true),
  otpCode: varchar("otp_code", { length: 256 }),
  expireOtp: int("expireOtp"),
  description: text("description"),
  lastResetPasswordAt: datetime("last_reset_password_at", { mode: "string" }),
  lastLoginAt: datetime("last_login_at", { mode: "string" }),
  createdAt: datetime("created_at", { mode: "string" }).default(
    sql`(utc_timestamp())`,
  ),
  timestamp: int("timestamp")
    .notNull()
    .default(sql`(unix_timestamp())`),
});

export type UserType = typeof userSchema.$inferSelect; // return type when queried
export type NewUserType = typeof userSchema.$inferInsert; // insert type
