import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, desc, count } from 'drizzle-orm';
import { getDb } from '../../db';
import { tickets, ticketMessages } from '../../db/schema';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { generateTicketNumber } from '../../utils/crypto';
import { JwtPayload } from '../../types';

const createTicketSchema = z.object({
  subject: z.string().min(5, 'موضوع باید حداقل ۵ کاراکتر باشد').max(255),
  message: z.string().min(10, 'پیام باید حداقل ۱۰ کاراکتر باشد'),
  productId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

const replyTicketSchema = z.object({
  message: z.string().min(5, 'پیام باید حداقل ۵ کاراکتر باشد'),
});

export async function ticketsRoutes(fastify: FastifyInstance) {
  const db = () => getDb();

  // Create ticket
  fastify.post('/', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const data = createTicketSchema.parse(request.body);

      const ticketId = uuidv4();
      const ticketNumber = generateTicketNumber();

      await db().insert(tickets).values({
        id: ticketId,
        ticketNumber,
        userId: user.userId,
        productId: data.productId,
        orderId: data.orderId,
        subject: data.subject,
        priority: data.priority,
        status: 'open',
      });

      await db().insert(ticketMessages).values({
        id: uuidv4(),
        ticketId,
        senderId: user.userId,
        senderRole: 'user',
        message: data.message,
      });

      const ticket = await db()
        .select()
        .from(tickets)
        .where(eq(tickets.id, ticketId))
        .limit(1);

      return sendSuccess(reply, ticket[0], 'تیکت با موفقیت ایجاد شد', 201);
    } catch (error) {
      if ((error as any).issues) {
        return sendError(reply, 'داده‌های ورودی نامعتبر است', 422);
      }
      return sendError(reply, (error as Error).message || 'خطا در ایجاد تیکت');
    }
  });

  // Get user's tickets
  fastify.get('/my', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const userTickets = await db()
        .select()
        .from(tickets)
        .where(eq(tickets.userId, user.userId))
        .orderBy(desc(tickets.createdAt));

      return sendSuccess(reply, userTickets);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت تیکت‌ها', 500);
    }
  });

  // Get ticket by ID with messages
  fastify.get('/:id', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const { id } = request.params as { id: string };

      const [ticket] = await db()
        .select()
        .from(tickets)
        .where(eq(tickets.id, id))
        .limit(1);

      if (!ticket) return sendError(reply, 'تیکت یافت نشد', 404);

      if (ticket.userId !== user.userId && !['admin', 'super_admin'].includes(user.role)) {
        return sendError(reply, 'دسترسی غیرمجاز', 403);
      }

      const messages = await db()
        .select()
        .from(ticketMessages)
        .where(eq(ticketMessages.ticketId, id))
        .orderBy(desc(ticketMessages.createdAt));

      return sendSuccess(reply, { ...ticket, messages });
    } catch (error) {
      return sendError(reply, 'خطا در دریافت تیکت', 500);
    }
  });

  // Reply to ticket
  fastify.post('/:id/reply', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const { id } = request.params as { id: string };
      const { message } = replyTicketSchema.parse(request.body);

      const [ticket] = await db()
        .select()
        .from(tickets)
        .where(eq(tickets.id, id))
        .limit(1);

      if (!ticket) return sendError(reply, 'تیکت یافت نشد', 404);

      const isAdmin = ['admin', 'super_admin'].includes(user.role);
      if (!isAdmin && ticket.userId !== user.userId) {
        return sendError(reply, 'دسترسی غیرمجاز', 403);
      }

      const msgId = uuidv4();
      await db().insert(ticketMessages).values({
        id: msgId,
        ticketId: id,
        senderId: user.userId,
        senderRole: isAdmin ? 'admin' : 'user',
        message,
      });

      if (isAdmin && ticket.status === 'open') {
        await db().update(tickets).set({ status: 'in_progress' }).where(eq(tickets.id, id));
      }

      return sendSuccess(reply, { id: msgId, message }, 'پاسخ با موفقیت ارسال شد', 201);
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در ارسال پاسخ');
    }
  });

  // Close ticket
  fastify.patch('/:id/close', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const { id } = request.params as { id: string };

      const [ticket] = await db()
        .select()
        .from(tickets)
        .where(eq(tickets.id, id))
        .limit(1);

      if (!ticket) return sendError(reply, 'تیکت یافت نشد', 404);

      const isAdmin = ['admin', 'super_admin'].includes(user.role);
      if (!isAdmin && ticket.userId !== user.userId) {
        return sendError(reply, 'دسترسی غیرمجاز', 403);
      }

      await db()
        .update(tickets)
        .set({ status: 'closed', closedAt: new Date() })
        .where(eq(tickets.id, id));

      return sendSuccess(reply, null, 'تیکت با موفقیت بسته شد');
    } catch (error) {
      return sendError(reply, 'خطا در بستن تیکت');
    }
  });

  // Admin: get all tickets
  fastify.get('/', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      const page = parseInt(query.page) || 1;
      const limit = Math.min(50, parseInt(query.limit) || 20);
      const offset = (page - 1) * limit;

      const conditions: any[] = [];
      if (query.status) conditions.push(eq(tickets.status, query.status));
      if (query.priority) conditions.push(eq(tickets.priority, query.priority));

      const { and } = await import('drizzle-orm');

      const rows = await db()
        .select()
        .from(tickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(tickets.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db()
        .select({ total: count() })
        .from(tickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return sendPaginated(reply, rows, total, page, limit);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت تیکت‌ها', 500);
    }
  });
}
