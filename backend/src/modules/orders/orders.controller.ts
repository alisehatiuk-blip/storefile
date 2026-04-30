import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { OrdersService } from './orders.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { JwtPayload } from '../../types';

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('شناسه محصول نامعتبر است'),
        includesSupport: z.boolean().default(false),
      })
    )
    .min(1, 'حداقل یک محصول باید انتخاب شود'),
});

export async function ordersRoutes(fastify: FastifyInstance) {
  const service = new OrdersService();

  // Create order
  fastify.post('/', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const { items } = createOrderSchema.parse(request.body);
      const order = await service.createOrder(user.userId, items);
      return sendSuccess(reply, order, 'سفارش با موفقیت ثبت شد', 201);
    } catch (error) {
      if ((error as any).issues) {
        return sendError(reply, 'داده‌های ورودی نامعتبر است', 422);
      }
      return sendError(reply, (error as Error).message || 'خطا در ثبت سفارش');
    }
  });

  // Get user's orders
  fastify.get('/my', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const orders = await service.getUserOrders(user.userId);
      return sendSuccess(reply, orders);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت سفارش‌ها', 500);
    }
  });

  // Get order by ID
  fastify.get('/:id', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const { id } = request.params as { id: string };
      const order = await service.getOrderById(id);

      if (order.userId !== user.userId && !['admin', 'super_admin'].includes(user.role)) {
        return sendError(reply, 'دسترسی غیرمجاز', 403);
      }

      return sendSuccess(reply, order);
    } catch (error) {
      return sendError(reply, (error as Error).message || 'سفارش یافت نشد', 404);
    }
  });

  // Admin: get all orders
  fastify.get('/', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      const page = parseInt(query.page) || 1;
      const limit = Math.min(50, parseInt(query.limit) || 20);

      const { orders, total } = await service.getOrders({
        page,
        limit,
        userId: query.userId,
        status: query.status,
      });

      return sendPaginated(reply, orders, total, page, limit);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت سفارش‌ها', 500);
    }
  });
}
