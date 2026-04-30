import { eq, like, and, or, inArray, sql, desc, asc, count } from 'drizzle-orm';
import { getDb } from '../../db';
import {
  products,
  categories,
  productCategories,
  productImages,
  productFiles,
  NewProduct,
  Product,
} from '../../db/schema';

export class ProductsRepository {
  private get db() {
    return getDb();
  }

  async findAll(opts: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const offset = (opts.page - 1) * opts.limit;
    const conditions = [];

    if (opts.status) {
      conditions.push(eq(products.status, opts.status as 'draft' | 'published' | 'archived'));
    } else {
      conditions.push(eq(products.status, 'published'));
    }

    if (opts.search) {
      conditions.push(
        or(
          like(products.title, `%${opts.search}%`),
          like(products.shortDescription, `%${opts.search}%`)
        )
      );
    }

    const orderBy =
      opts.sortBy === 'price'
        ? opts.sortOrder === 'asc'
          ? asc(products.price)
          : desc(products.price)
        : opts.sortOrder === 'asc'
        ? asc(products.createdAt)
        : desc(products.createdAt);

    const rows = await this.db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(opts.limit)
      .offset(offset);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(products)
      .where(and(...conditions));

    return { rows, total };
  }

  async findBySlug(slug: string): Promise<Product | undefined> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    return rows[0];
  }

  async findById(id: string): Promise<Product | undefined> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return rows[0];
  }

  async create(data: NewProduct): Promise<void> {
    await this.db.insert(products).values(data);
  }

  async update(id: string, data: Partial<Product>): Promise<void> {
    await this.db.update(products).set(data).where(eq(products.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(products).where(eq(products.id, id));
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.db
      .update(products)
      .set({ viewCount: sql`${products.viewCount} + 1` })
      .where(eq(products.id, id));
  }

  async getImages(productId: string) {
    return this.db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.sortOrder));
  }

  async getFiles(productId: string) {
    return this.db
      .select()
      .from(productFiles)
      .where(and(eq(productFiles.productId, productId), eq(productFiles.isActive, true)));
  }

  async getCategories(productId: string) {
    return this.db
      .select({ category: categories })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(eq(productCategories.productId, productId));
  }

  async setCategories(productId: string, categoryIds: string[]): Promise<void> {
    await this.db
      .delete(productCategories)
      .where(eq(productCategories.productId, productId));

    if (categoryIds.length > 0) {
      await this.db.insert(productCategories).values(
        categoryIds.map((categoryId) => ({ productId, categoryId }))
      );
    }
  }

  async addImage(data: {
    id: string;
    productId: string;
    url: string;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
  }): Promise<void> {
    await this.db.insert(productImages).values(data);
  }

  async deleteImage(imageId: string): Promise<void> {
    await this.db.delete(productImages).where(eq(productImages.id, imageId));
  }

  async addFile(data: {
    id: string;
    productId: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType?: string;
    version?: string;
  }): Promise<void> {
    await this.db.insert(productFiles).values(data);
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.db.delete(productFiles).where(eq(productFiles.id, fileId));
  }

  async findFileById(fileId: string) {
    const rows = await this.db
      .select()
      .from(productFiles)
      .where(eq(productFiles.id, fileId))
      .limit(1);
    return rows[0];
  }
}
