import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { DownloadsRepository } from './downloads.repository';
import { OrdersRepository } from '../orders/orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticate } from '../../middleware/auth';
import { generateDownloadToken } from '../../utils/crypto';
import { logActivity } from '../../middleware/logger';
import { JwtPayload } from '../../types';
import { env } from '../../config/env';

export async function downloadsRoutes(fastify: FastifyInstance) {
  const downloadsRepo = new DownloadsRepository();
  const ordersRepo = new OrdersRepository();
  const productsRepo = new ProductsRepository();

  // Generate download link
  fastify.post('/generate/:fileId', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const { fileId } = request.params as { fileId: string };
      const { orderId } = request.body as { orderId: string };

      // Verify user has purchased this product
      const hasPurchased = await ordersRepo.hasUserPurchasedProduct(user.userId, fileId);
      // Check via order
      const order = await ordersRepo.findById(orderId);
      if (!order || order.userId !== user.userId || order.status !== 'completed') {
        return sendError(reply, 'شما این محصول را خریداری نکرده‌اید', 403);
      }

      // Check file exists
      const file = await productsRepo.findFileById(fileId);
      if (!file) return sendError(reply, 'فایل یافت نشد', 404);

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      const token = generateDownloadToken(user.userId, fileId, orderId, expiresAt);

      const downloadId = uuidv4();
      await downloadsRepo.create({
        id: downloadId,
        userId: user.userId,
        productId: file.productId,
        fileId,
        orderId,
        token,
        expiresAt,
        maxAttempts: 3,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      const downloadUrl = `${env.APP_URL}/api/downloads/file/${token}`;
      return sendSuccess(reply, {
        downloadUrl,
        expiresAt,
        maxAttempts: 3,
      }, 'لینک دانلود با موفقیت ایجاد شد');
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در ایجاد لینک دانلود');
    }
  });

  // Download file using token
  fastify.get('/file/:token', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token } = request.params as { token: string };

      const downloadRecord = await downloadsRepo.findByToken(token);
      if (!downloadRecord) {
        return sendError(reply, 'لینک دانلود نامعتبر است', 404);
      }

      if (downloadRecord.expiresAt < new Date()) {
        return sendError(reply, 'لینک دانلود منقضی شده است', 410);
      }

      if (downloadRecord.attempts >= downloadRecord.maxAttempts) {
        return sendError(reply, 'تعداد دفعات دانلود تجاوز کرده است', 429);
      }

      const file = await productsRepo.findFileById(downloadRecord.fileId);
      if (!file) return sendError(reply, 'فایل یافت نشد', 404);

      const filePath = path.join(process.cwd(), file.filePath);
      if (!fs.existsSync(filePath)) {
        await logActivity('DOWNLOAD_FILE_MISSING', 'download', downloadRecord.id, `File not found: ${file.filePath}`, request, 'error');
        return sendError(reply, 'فایل موجود نیست', 404);
      }

      await downloadsRepo.incrementAttempts(downloadRecord.id);
      await downloadsRepo.markUsed(downloadRecord.id);

      await logActivity('DOWNLOAD', 'download', downloadRecord.id, `File downloaded: ${file.fileName}`, request);

      reply.header('Content-Disposition', `attachment; filename="${file.fileName}"`);
      reply.header('Content-Type', file.mimeType || 'application/octet-stream');

      const stream = fs.createReadStream(filePath);
      return reply.send(stream);
    } catch (error) {
      return sendError(reply, 'خطا در دانلود فایل', 500);
    }
  });

  // Get user download history
  fastify.get('/my', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const downloads = await downloadsRepo.getUserDownloads(user.userId);
      return sendSuccess(reply, downloads);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت تاریخچه دانلود', 500);
    }
  });
}
