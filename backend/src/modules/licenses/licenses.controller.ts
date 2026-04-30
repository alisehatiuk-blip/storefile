import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LicensesRepository } from './licenses.repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticate } from '../../middleware/auth';
import { JwtPayload } from '../../types';

export async function licensesRoutes(fastify: FastifyInstance) {
  const repo = new LicensesRepository();

  // Get user's licenses
  fastify.get('/my', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JwtPayload;
      const licenses = await repo.findByUser(user.userId);
      return sendSuccess(reply, licenses);
    } catch (error) {
      return sendError(reply, 'خطا در دریافت لایسنس‌ها', 500);
    }
  });

  // Verify license key
  fastify.get('/verify/:key', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { key } = request.params as { key: string };
      const license = await repo.findByKey(key);

      if (!license) {
        return sendError(reply, 'لایسنس نامعتبر است', 404);
      }

      if (license.status !== 'active') {
        return sendError(reply, `لایسنس ${license.status === 'expired' ? 'منقضی شده' : 'ابطال شده'} است`, 400);
      }

      await repo.update(license.id, { lastUsedAt: new Date() });

      return sendSuccess(reply, {
        valid: true,
        productId: license.productId,
        status: license.status,
        expiresAt: license.expiresAt,
      });
    } catch (error) {
      return sendError(reply, 'خطا در تایید لایسنس', 500);
    }
  });
}
