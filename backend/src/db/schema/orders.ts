import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  decimal,
  mysqlEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const orders = mysqlTable(
  'orders',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    orderNumber: varchar('order_number', { length: 50 }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    status: mysqlEnum('status', ['pending', 'completed', 'cancelled', 'refunded']).default('pending').notNull(),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }).default('mock').notNull(),
    paymentStatus: mysqlEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']).default('pending').notNull(),
    paymentReference: varchar('payment_reference', { length: 255 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    orderNumberIdx: uniqueIndex('orders_order_number_idx').on(table.orderNumber),
    userIdx: index('orders_user_idx').on(table.userId),
    statusIdx: index('orders_status_idx').on(table.status),
  })
);

export const orderItems = mysqlTable(
  'order_items',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    orderId: varchar('order_id', { length: 36 }).notNull(),
    productId: varchar('product_id', { length: 36 }).notNull(),
    productTitle: varchar('product_title', { length: 255 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    includesSupport: boolean('includes_support').default(false).notNull(),
    supportPrice: decimal('support_price', { precision: 10, scale: 2 }).default('0'),
    supportExpiresAt: timestamp('support_expires_at'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    orderIdx: index('order_items_order_idx').on(table.orderId),
    productIdx: index('order_items_product_idx').on(table.productId),
  })
);

export const licenses = mysqlTable(
  'licenses',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    licenseKey: varchar('license_key', { length: 64 }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    productId: varchar('product_id', { length: 36 }).notNull(),
    orderId: varchar('order_id', { length: 36 }).notNull(),
    status: mysqlEnum('status', ['active', 'expired', 'revoked']).default('active').notNull(),
    expiresAt: timestamp('expires_at'),
    activatedAt: timestamp('activated_at'),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    licenseKeyIdx: uniqueIndex('licenses_key_idx').on(table.licenseKey),
    userIdx: index('licenses_user_idx').on(table.userId),
    productIdx: index('licenses_product_idx').on(table.productId),
    orderIdx: index('licenses_order_idx').on(table.orderId),
  })
);

export const downloads = mysqlTable(
  'downloads',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    productId: varchar('product_id', { length: 36 }).notNull(),
    fileId: varchar('file_id', { length: 36 }).notNull(),
    orderId: varchar('order_id', { length: 36 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    attempts: int('attempts').default(0).notNull(),
    maxAttempts: int('max_attempts').default(3).notNull(),
    ipAddress: varchar('ip_address', { length: 50 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    tokenIdx: uniqueIndex('downloads_token_idx').on(table.token),
    userIdx: index('downloads_user_idx').on(table.userId),
    productIdx: index('downloads_product_idx').on(table.productId),
    orderIdx: index('downloads_order_idx').on(table.orderId),
  })
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type License = typeof licenses.$inferSelect;
export type Download = typeof downloads.$inferSelect;
