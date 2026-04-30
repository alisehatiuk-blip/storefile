import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, count, sum, desc, and, gte } from 'drizzle-orm';
import { getDb } from '../../db';
import { users, products, orders, tickets, activityLogs } from '../../db/schema';
import { sendSuccess, sendError } from '../../utils/response';
import { requireAdmin } from '../../middleware/auth';

export async function adminRoutes(fastify: FastifyInstance) {
  const db = () => getDb();

  // Dashboard stats
  fastify.get('/dashboard', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [
        [{ totalUsers }],
        [{ totalProducts }],
        [{ totalOrders }],
        [{ openTickets }],
        [{ monthlyRevenue }],
        recentOrders,
        recentLogs,
      ] = await Promise.all([
        db().select({ totalUsers: count() }).from(users),
        db().select({ totalProducts: count() }).from(products),
        db().select({ totalOrders: count() }).from(orders),
        db().select({ openTickets: count() }).from(tickets).where(eq(tickets.status, 'open')),
        db()
          .select({ monthlyRevenue: sum(orders.totalAmount) })
          .from(orders)
          .where(
            and(
              eq(orders.paymentStatus, 'paid'),
              gte(orders.createdAt, thirtyDaysAgo)
            )
          ),
        db()
          .select()
          .from(orders)
          .orderBy(desc(orders.createdAt))
          .limit(5),
        db()
          .select()
          .from(activityLogs)
          .orderBy(desc(activityLogs.createdAt))
          .limit(10),
      ]);

      return sendSuccess(reply, {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          openTickets,
          monthlyRevenue: monthlyRevenue ?? 0,
        },
        recentOrders,
        recentActivity: recentLogs,
      });
    } catch (error) {
      return sendError(reply, 'خطا در دریافت آمار داشبورد', 500);
    }
  });

  // Activity logs
  fastify.get('/logs', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      const page = parseInt(query.page) || 1;
      const limit = Math.min(100, parseInt(query.limit) || 50);
      const offset = (page - 1) * limit;

      const logs = await db()
        .select()
        .from(activityLogs)
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db().select({ total: count() }).from(activityLogs);

      return sendSuccess(reply, { logs, total, page, limit });
    } catch (error) {
      return sendError(reply, 'خطا در دریافت لاگ‌ها', 500);
    }
  });

  // Settings
  fastify.get('/settings', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { settings } = await import('../../db/schema');
      const allSettings = await db().select().from(settings);
      return sendSuccess(reply, allSettings);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت تنظیمات', 500);
    }
  });

  fastify.put('/settings/:key', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { key } = request.params as { key: string };
      const { value } = request.body as { value: string };
      const { settings } = await import('../../db/schema');

      await db().update(settings).set({ value }).where(eq(settings.key, key as any));
      return sendSuccess(reply, null, 'تنظیمات با موفقیت به‌روزرسانی شد');
    } catch (error) {
      return sendError(reply, 'خطا در به‌روزرسانی تنظیمات');
    }
  });
}
