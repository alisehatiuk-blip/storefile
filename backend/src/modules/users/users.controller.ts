import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { eq, like, count, desc } from 'drizzle-orm';
import { getDb } from '../../db';
import { users } from '../../db/schema';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { hashPassword } from '../../utils/crypto';
import { JwtPayload } from '../../types';

const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^09\d{9}$/).optional(),
  avatarUrl: z.string().url().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است'),
  newPassword: z
    .string()
    .min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد')
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

export async function usersRoutes(fastify: FastifyInstance) {
  const db = () => getDb();

  // Get own profile
  fastify.get('/me', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const [profile] = await db()
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          avatarUrl: users.avatarUrl,
          role: users.role,
          isEmailVerified: users.isEmailVerified,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, user.userId))
        .limit(1);

      if (!profile) return sendError(reply, 'کاربر یافت نشد', 404);
      return sendSuccess(reply, profile);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت پروفایل', 500);
    }
  });

  // Update profile
  fastify.put('/me', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const data = updateProfileSchema.parse(request.body);

      await db().update(users).set(data).where(eq(users.id, user.userId));

      const [updated] = await db()
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, user.userId))
        .limit(1);

      return sendSuccess(reply, updated, 'پروفایل با موفقیت به‌روزرسانی شد');
    } catch (error) {
      if ((error as any).issues) {
        return sendError(reply, 'داده‌های ورودی نامعتبر است', 422);
      }
      return sendError(reply, 'خطا در به‌روزرسانی پروفایل');
    }
  });

  // Admin: get all users
  fastify.get('/', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      const page = parseInt(query.page) || 1;
      const limit = Math.min(50, parseInt(query.limit) || 20);
      const offset = (page - 1) * limit;

      const conditions: any[] = [];
      if (query.search) {
        const { or } = await import('drizzle-orm');
        conditions.push(
          or(like(users.email, `%${query.search}%`), like(users.firstName, `%${query.search}%`))
        );
      }

      const { and } = await import('drizzle-orm');

      const rows = await db()
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          isEmailVerified: users.isEmailVerified,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ total }] = await db()
        .select({ total: count() })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return sendPaginated(reply, rows, total, page, limit);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت کاربران', 500);
    }
  });

  // Admin: get user by ID
  fastify.get('/:id', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const [user] = await db()
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          isEmailVerified: users.isEmailVerified,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) return sendError(reply, 'کاربر یافت نشد', 404);
      return sendSuccess(reply, user);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت اطلاعات کاربر', 500);
    }
  });

  // Admin: update user
  fastify.put('/:id', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = z
        .object({
          isActive: z.boolean().optional(),
          role: z.enum(['user', 'admin', 'super_admin']).optional(),
          isEmailVerified: z.boolean().optional(),
        })
        .parse(request.body);

      await db().update(users).set(data).where(eq(users.id, id));
      return sendSuccess(reply, null, 'کاربر با موفقیت به‌روزرسانی شد');
    } catch (error) {
      return sendError(reply, 'خطا در به‌روزرسانی کاربر');
    }
  });
}
