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
  json,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const categories = mysqlTable(
  'categories',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).notNull(),
    description: text('description'),
    iconUrl: varchar('icon_url', { length: 500 }),
    parentId: varchar('parent_id', { length: 36 }),
    sortOrder: int('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('categories_slug_idx').on(table.slug),
    parentIdx: index('categories_parent_idx').on(table.parentId),
  })
);

export const products = mysqlTable(
  'products',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 300 }).notNull(),
    shortDescription: text('short_description').notNull(),
    fullDescription: text('full_description').notNull(),
    features: json('features').$type<string[]>().default([]),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    supportPrice: decimal('support_price', { precision: 10, scale: 2 }).default('0'),
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft').notNull(),
    demoUrl: varchar('demo_url', { length: 500 }),
    version: varchar('version', { length: 50 }).default('1.0.0').notNull(),
    tags: json('tags').$type<string[]>().default([]),
    downloadCount: int('download_count').default(0).notNull(),
    viewCount: int('view_count').default(0).notNull(),
    rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
    ratingCount: int('rating_count').default(0).notNull(),
    fileSize: varchar('file_size', { length: 50 }),
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('products_slug_idx').on(table.slug),
    statusIdx: index('products_status_idx').on(table.status),
    createdAtIdx: index('products_created_at_idx').on(table.createdAt),
  })
);

export const productCategories = mysqlTable(
  'product_categories',
  {
    productId: varchar('product_id', { length: 36 }).notNull(),
    categoryId: varchar('category_id', { length: 36 }).notNull(),
  },
  (table) => ({
    productIdx: index('pc_product_idx').on(table.productId),
    categoryIdx: index('pc_category_idx').on(table.categoryId),
  })
);

export const productImages = mysqlTable(
  'product_images',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    productId: varchar('product_id', { length: 36 }).notNull(),
    url: varchar('url', { length: 500 }).notNull(),
    altText: varchar('alt_text', { length: 255 }),
    sortOrder: int('sort_order').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    productIdx: index('product_images_product_idx').on(table.productId),
  })
);

export const productFiles = mysqlTable(
  'product_files',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    productId: varchar('product_id', { length: 36 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    filePath: varchar('file_path', { length: 500 }).notNull(),
    fileSize: int('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 100 }),
    version: varchar('version', { length: 50 }).default('1.0.0'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    productIdx: index('product_files_product_idx').on(table.productId),
  })
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductFile = typeof productFiles.$inferSelect;
