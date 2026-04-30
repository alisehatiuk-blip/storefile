import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/response';
import { JwtPayload } from '../types';

// User property is provided by @fastify/jwt plugin

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return sendError(reply, 'توکن احراز هویت نامعتبر است', 401);
  }
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const user = request.user as JwtPayload;
      if (!roles.includes(user.role)) {
        return sendError(reply, 'دسترسی غیرمجاز', 403);
      }
    } catch {
      return sendError(reply, 'توکن احراز هویت نامعتبر است', 401);
    }
  };
}

export const requireAdmin = requireRole('admin', 'super_admin');
export const requireSuperAdmin = requireRole('super_admin');
