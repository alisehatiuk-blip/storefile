import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ProductsService } from './products.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';
import { authenticate, requireAdmin } from '../../middleware/auth';

const createProductSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'اسلاگ فقط می‌تواند شامل حروف کوچک، اعداد و خط تیره باشد'),
  shortDescription: z.string().min(10),
  fullDescription: z.string().min(20),
  features: z.array(z.string()).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  supportPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  demoUrl: z.string().url().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export async function productsRoutes(fastify: FastifyInstance) {
  const service = new ProductsService();

  // Public: list products
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 12));

      const { products, total } = await service.getProducts({
        page,
        limit,
        search: query.search,
        categoryId: query.categoryId,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      return sendPaginated(reply, products, total, page, limit);
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در دریافت محصولات', 500);
    }
  });

  // Public: get product by slug
  fastify.get('/:slug', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { slug } = request.params as { slug: string };
      const product = await service.getProductBySlug(slug);
      return sendSuccess(reply, product);
    } catch (error) {
      return sendError(reply, (error as Error).message || 'محصول یافت نشد', 404);
    }
  });

  // Admin: create product
  fastify.post('/', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createProductSchema.parse(request.body);
      const product = await service.createProduct(data);
      return sendSuccess(reply, product, 'محصول با موفقیت ایجاد شد', 201);
    } catch (error) {
      if ((error as any).issues) {
        return sendError(reply, 'داده‌های ورودی نامعتبر است', 422);
      }
      return sendError(reply, (error as Error).message || 'خطا در ایجاد محصول');
    }
  });

  // Admin: update product
  fastify.put('/:id', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const data = createProductSchema.partial().parse(request.body);
      const product = await service.updateProduct(id, data);
      return sendSuccess(reply, product, 'محصول با موفقیت به‌روزرسانی شد');
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در به‌روزرسانی محصول');
    }
  });

  // Admin: delete product
  fastify.delete('/:id', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await service.deleteProduct(id);
      return sendSuccess(reply, null, 'محصول با موفقیت حذف شد');
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در حذف محصول');
    }
  });
}
