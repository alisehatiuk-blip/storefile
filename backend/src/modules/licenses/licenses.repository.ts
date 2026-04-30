import { eq, and } from 'drizzle-orm';
import { getDb } from '../../db';
import { licenses, License } from '../../db/schema';

export class LicensesRepository {
  private get db() {
    return getDb();
  }

  async create(data: {
    id: string;
    licenseKey: string;
    userId: string;
    productId: string;
    orderId: string;
    status: 'active' | 'expired' | 'revoked';
    activatedAt?: Date;
    expiresAt?: Date;
  }): Promise<void> {
    await this.db.insert(licenses).values(data);
  }

  async findByUser(userId: string) {
    return this.db.select().from(licenses).where(eq(licenses.userId, userId));
  }

  async findByKey(licenseKey: string): Promise<License | undefined> {
    const rows = await this.db
      .select()
      .from(licenses)
      .where(eq(licenses.licenseKey, licenseKey))
      .limit(1);
    return rows[0];
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<License | undefined> {
    const rows = await this.db
      .select()
      .from(licenses)
      .where(and(eq(licenses.userId, userId), eq(licenses.productId, productId)))
      .limit(1);
    return rows[0];
  }

  async update(id: string, data: Partial<License>): Promise<void> {
    await this.db.update(licenses).set(data).where(eq(licenses.id, id));
  }
}
