import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  mysqlEnum,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const tickets = mysqlTable(
  'tickets',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    ticketNumber: varchar('ticket_number', { length: 20 }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    productId: varchar('product_id', { length: 36 }),
    orderId: varchar('order_id', { length: 36 }),
    subject: varchar('subject', { length: 255 }).notNull(),
    status: mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']).default('open').notNull(),
    priority: mysqlEnum('priority', ['low', 'medium', 'high', 'urgent']).default('medium').notNull(),
    closedAt: timestamp('closed_at'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    userIdx: index('tickets_user_idx').on(table.userId),
    statusIdx: index('tickets_status_idx').on(table.status),
    ticketNumberIdx: index('tickets_number_idx').on(table.ticketNumber),
  })
);

export const ticketMessages = mysqlTable(
  'ticket_messages',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    ticketId: varchar('ticket_id', { length: 36 }).notNull(),
    senderId: varchar('sender_id', { length: 36 }).notNull(),
    senderRole: mysqlEnum('sender_role', ['user', 'admin']).notNull(),
    message: text('message').notNull(),
    attachmentUrl: varchar('attachment_url', { length: 500 }),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    ticketIdx: index('ticket_messages_ticket_idx').on(table.ticketId),
    senderIdx: index('ticket_messages_sender_idx').on(table.senderId),
  })
);

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketMessage = typeof ticketMessages.$inferSelect;
