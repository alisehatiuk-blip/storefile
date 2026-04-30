import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  mysqlEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    phone: varchar('phone', { length: 20 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    role: mysqlEnum('role', ['user', 'admin', 'super_admin']).default('user').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),
    emailVerificationToken: varchar('email_verification_token', { length: 255 }),
    passwordResetToken: varchar('password_reset_token', { length: 255 }),
    passwordResetExpires: timestamp('password_reset_expires'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
    isActiveIdx: index('users_is_active_idx').on(table.isActive),
  })
);

export const refreshTokens = mysqlTable(
  'refresh_tokens',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    token: varchar('token', { length: 500 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    isRevoked: boolean('is_revoked').default(false).notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    userIdx: index('refresh_tokens_user_idx').on(table.userId),
    tokenIdx: uniqueIndex('refresh_tokens_token_idx').on(table.token),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
