import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  mysqlEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const settings = mysqlTable(
  'settings',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    key: varchar('key', { length: 100 }).notNull(),
    value: text('value'),
    type: mysqlEnum('type', ['string', 'number', 'boolean', 'json']).default('string').notNull(),
    group: varchar('group', { length: 50 }).default('general').notNull(),
    label: varchar('label', { length: 255 }),
    description: text('description'),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex('settings_key_idx').on(table.key),
    groupIdx: index('settings_group_idx').on(table.group),
  })
);

export const activityLogs = mysqlTable(
  'activity_logs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }),
    action: varchar('action', { length: 100 }).notNull(),
    resource: varchar('resource', { length: 100 }),
    resourceId: varchar('resource_id', { length: 36 }),
    details: text('details'),
    ipAddress: varchar('ip_address', { length: 50 }),
    userAgent: text('user_agent'),
    severity: mysqlEnum('severity', ['info', 'warning', 'error', 'critical']).default('info').notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    userIdx: index('activity_logs_user_idx').on(table.userId),
    actionIdx: index('activity_logs_action_idx').on(table.action),
    createdAtIdx: index('activity_logs_created_at_idx').on(table.createdAt),
    severityIdx: index('activity_logs_severity_idx').on(table.severity),
  })
);

export type Setting = typeof settings.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
