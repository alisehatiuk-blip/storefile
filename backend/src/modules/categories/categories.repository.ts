import { eq, isNull, count } from 'drizzle-orm';
import { getDb } from '../../db';
import { categories, NewCategory, Category } from '../../db/schema';

export class CategoriesRepository {
  private get db() {
    return getDb();
  }

  async findAll() {
    return this.db.select().from(categories).where(eq(categories.isActive, true));
  }

  async findById(id: string): Promise<Category | undefined> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return rows[0];
  }

  async findBySlug(slug: string): Promise<Category | undefined> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return rows[0];
  }

  async findRoots() {
    return this.db
      .select()
      .from(categories)
      .where(isNull(categories.parentId));
  }

  async create(data: NewCategory): Promise<void> {
    await this.db.insert(categories).values(data);
  }

  async update(id: string, data: Partial<Category>): Promise<void> {
    await this.db.update(categories).set(data).where(eq(categories.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id));
  }
}
