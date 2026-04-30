import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { sendSuccess, sendError } from '../../utils/response';
import { requireAdmin } from '../../middleware/auth';
import { env } from '../../config/env';
import { ProductsRepository } from '../products/products.repository';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_FILE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/pdf',
  'application/octet-stream',
  'text/plain',
];

export async function uploadsRoutes(fastify: FastifyInstance) {
  const productsRepo = new ProductsRepository();

  // Upload product image
  fastify.post('/images/product/:productId', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { productId } = request.params as { productId: string };
      const data = await request.file();

      if (!data) return sendError(reply, 'فایلی ارسال نشده است');
      if (!ALLOWED_IMAGE_TYPES.includes(data.mimetype)) {
        return sendError(reply, 'فرمت فایل مجاز نیست. فقط JPEG، PNG، WebP و GIF قابل قبول است');
      }

      const dir = path.join(env.UPLOAD_DIR, 'images', 'products', productId);
      fs.mkdirSync(dir, { recursive: true });

      const ext = data.filename.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${ext}`;
      const filePath = path.join(dir, fileName);

      const buffer = await data.toBuffer();
      if (buffer.length > 5 * 1024 * 1024) {
        return sendError(reply, 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد');
      }

      fs.writeFileSync(filePath, buffer);

      const relativePath = `/uploads/images/products/${productId}/${fileName}`;
      const imageId = uuidv4();

      await productsRepo.addImage({
        id: imageId,
        productId,
        url: relativePath,
        altText: data.filename,
        sortOrder: 0,
        isPrimary: false,
      });

      return sendSuccess(reply, {
        id: imageId,
        url: relativePath,
        fullUrl: `${env.APP_URL}${relativePath}`,
      }, 'تصویر با موفقیت آپلود شد', 201);
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در آپلود تصویر', 500);
    }
  });

  // Upload product file
  fastify.post('/files/product/:productId', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { productId } = request.params as { productId: string };
      const data = await request.file();

      if (!data) return sendError(reply, 'فایلی ارسال نشده است');

      const dir = path.join(env.UPLOAD_DIR, 'files', 'products', productId);
      fs.mkdirSync(dir, { recursive: true });

      const buffer = await data.toBuffer();
      if (buffer.length > env.MAX_FILE_SIZE) {
        return sendError(reply, `حجم فایل نباید بیشتر از ${Math.floor(env.MAX_FILE_SIZE / 1024 / 1024)} مگابایت باشد`);
      }

      const safeFileName = data.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(dir, `${uuidv4()}_${safeFileName}`);
      fs.writeFileSync(filePath, buffer);

      const relPath = `/uploads/files/products/${productId}/${path.basename(filePath)}`;
      const fileId = uuidv4();

      await productsRepo.addFile({
        id: fileId,
        productId,
        fileName: data.filename,
        filePath: relPath,
        fileSize: buffer.length,
        mimeType: data.mimetype,
        version: '1.0.0',
      });

      return sendSuccess(reply, {
        id: fileId,
        fileName: data.filename,
        fileSize: buffer.length,
      }, 'فایل با موفقیت آپلود شد', 201);
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در آپلود فایل', 500);
    }
  });

  // Delete image
  fastify.delete('/images/:imageId', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { imageId } = request.params as { imageId: string };
      await productsRepo.deleteImage(imageId);
      return sendSuccess(reply, null, 'تصویر با موفقیت حذف شد');
    } catch (error) {
      return sendError(reply, 'خطا در حذف تصویر');
    }
  });

  // Delete file
  fastify.delete('/files/:fileId', { preHandler: [requireAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { fileId } = request.params as { fileId: string };
      await productsRepo.deleteFile(fileId);
      return sendSuccess(reply, null, 'فایل با موفقیت حذف شد');
    } catch (error) {
      return sendError(reply, 'خطا در حذف فایل');
    }
  });
}
