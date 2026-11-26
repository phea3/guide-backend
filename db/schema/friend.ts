import {
  boolean,
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { userSchema } from "./user";

export const userFriendSchema = mysqlTable("user_friend", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userId: varchar("user_id", { length: 256 }).references(() => userSchema.id, {
    onDelete: "set null",
  }),
  friendId: varchar("friend_id", { length: 256 }).references(
    () => userSchema.id,
    {
      onDelete: "set null",
    },
  ),
  status: mysqlEnum("status", [
    "request",
    "accepted",
    "rejected",
    "blocked",
  ]).default("request"),
  isViewedRequest: boolean("is_viewed_request").default(false),
  description: text("description"),
  isArchived: boolean("is_archived").default(false),
  createdAt: datetime("created_at", { mode: "string" }).default(
    sql`(utc_timestamp())`,
  ),
  updatedAt: datetime("updated_at", { mode: "string" }).default(
    sql`(utc_timestamp())`,
  ),
  timestamp: int("timestamp")
    .notNull()
    .default(sql`(unix_timestamp())`),
});

export const userFriendRelations = relations(userFriendSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [userFriendSchema.userId],
    references: [userSchema.id],
    relationName: "userFriends", // 👈 important
  }),
  friend: one(userSchema, {
    fields: [userFriendSchema.friendId],
    references: [userSchema.id],
    relationName: "friendOf", // 👈 important
  }),
}));

export type UserFriendType = typeof userFriendSchema.$inferSelect;
export type NewUserFriendType = typeof userFriendSchema.$inferInsert;
