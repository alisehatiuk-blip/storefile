import { eq, desc, count } from 'drizzle-orm';
import { getDb } from '../../db';
import { orders, orderItems, licenses, Order, NewOrder } from '../../db/schema';

export class OrdersRepository {
  private get db() {
    return getDb();
  }

  async findAll(opts: { page: number; limit: number; userId?: string; status?: string }) {
    const offset = (opts.page - 1) * opts.limit;
    const conditions: any[] = [];

    if (opts.userId) conditions.push(eq(orders.userId, opts.userId));
    if (opts.status) conditions.push(eq(orders.status, opts.status as Order['status']));

    const { and } = await import('drizzle-orm');

    const rows = await this.db
      .select()
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(opts.limit)
      .offset(offset);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return { rows, total };
  }

  async findById(id: string): Promise<Order | undefined> {
    const rows = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return rows[0];
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);
    return rows[0];
  }

  async create(data: NewOrder): Promise<void> {
    await this.db.insert(orders).values(data);
  }

  async update(id: string, data: Partial<Order>): Promise<void> {
    await this.db.update(orders).set(data).where(eq(orders.id, id));
  }

  async getOrderItems(orderId: string) {
    return this.db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(data: {
    id: string;
    orderId: string;
    productId: string;
    productTitle: string;
    price: string;
    includesSupport?: boolean;
    supportPrice?: string;
    supportExpiresAt?: Date;
  }): Promise<void> {
    await this.db.insert(orderItems).values(data);
  }

  async getUserOrders(userId: string) {
    return this.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        eq(orders.userId, userId)
      )
      .limit(1);

    // Check if any order item matches the product
    const { and } = await import('drizzle-orm');
    const purchased = await this.db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orderItems.productId, productId),
          eq(orders.status, 'completed')
        )
      )
      .limit(1);

    return purchased.length > 0;
  }
}
