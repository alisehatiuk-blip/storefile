import { eq, and, lt, count } from 'drizzle-orm';
import { getDb } from '../../db';
import { downloads, Download } from '../../db/schema';
import { sql } from 'drizzle-orm';

export class DownloadsRepository {
  private get db() {
    return getDb();
  }

  async create(data: {
    id: string;
    userId: string;
    productId: string;
    fileId: string;
    orderId: string;
    token: string;
    expiresAt: Date;
    maxAttempts?: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.db.insert(downloads).values(data);
  }

  async findByToken(token: string): Promise<Download | undefined> {
    const rows = await this.db
      .select()
      .from(downloads)
      .where(eq(downloads.token, token))
      .limit(1);
    return rows[0];
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.db
      .update(downloads)
      .set({ attempts: sql`${downloads.attempts} + 1` })
      .where(eq(downloads.id, id));
  }

  async markUsed(id: string): Promise<void> {
    await this.db
      .update(downloads)
      .set({ usedAt: new Date() })
      .where(eq(downloads.id, id));
  }

  async getUserDownloads(userId: string) {
    return this.db
      .select()
      .from(downloads)
      .where(eq(downloads.userId, userId));
  }

  async getDownloadHistory(opts: { page: number; limit: number }) {
    const offset = (opts.page - 1) * opts.limit;

    const rows = await this.db
      .select()
      .from(downloads)
      .limit(opts.limit)
      .offset(offset);

    const [{ total }] = await this.db.select({ total: count() }).from(downloads);

    return { rows, total };
  }
}
