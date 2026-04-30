import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { CategoriesRepository } from './categories.repository';
import { sendSuccess, sendError } from '../../utils/response';
import { requireAdmin } from '../../middleware/auth';

const categorySchema = z.object({
  name: z.string().min(2, 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  iconUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export async function categoriesRoutes(fastify: FastifyInstance) {
  const repo = new CategoriesRepository();

  // Public: get all categories
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const cats = await repo.findAll();
      return sendSuccess(reply, cats);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت دسته‌بندی‌ها', 500);
    }
  });

  // Public: get category by slug
  fastify.get('/:slug', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { slug } = request.params as { slug: string };
      const cat = await repo.findBySlug(slug);
      if (!cat) return sendError(reply, 'دسته‌بندی یافت نشد', 404);
      return sendSuccess(reply, cat);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت دسته‌بندی', 500);
    }
  });

  // Admin: create category
  fastify.post('/', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = categorySchema.parse(request.body);
      const existing = await repo.findBySlug(data.slug);
      if (existing) return sendError(reply, 'دسته‌بندی با این اسلاگ قبلاً وجود دارد');

      const id = uuidv4();
      await repo.create({ id, ...data });
      const cat = await repo.findById(id);
      return sendSuccess(reply, cat, 'دسته‌بندی با موفقیت ایجاد شد', 201);
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در ایجاد دسته‌بندی');
    }
  });

  // Admin: update category
  fastify.put('/:id', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = categorySchema.partial().parse(request.body);
      await repo.update(id, data as any);
      const cat = await repo.findById(id);
      return sendSuccess(reply, cat, 'دسته‌بندی با موفقیت به‌روزرسانی شد');
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در به‌روزرسانی دسته‌بندی');
    }
  });

  // Admin: delete category
  fastify.delete('/:id', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await repo.delete(id);
      return sendSuccess(reply, null, 'دسته‌بندی با موفقیت حذف شد');
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در حذف دسته‌بندی');
    }
  });
}
