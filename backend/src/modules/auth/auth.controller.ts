import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AuthService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticate } from '../../middleware/auth';
import { logActivity } from '../../middleware/logger';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify);

  // Register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = registerSchema.parse(request.body);
      const result = await authService.register(input);
      await logActivity('REGISTER', 'auth', result.user.id, `New user registered: ${result.user.email}`, request);
      return sendSuccess(reply, result, 'ثبت‌نام با موفقیت انجام شد', 201);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(reply, 'داده‌های ورودی نامعتبر است', 422, error.flatten().fieldErrors as Record<string, string[]>);
      }
      return sendError(reply, (error as Error).message || 'خطا در ثبت‌نام');
    }
  });

  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = loginSchema.parse(request.body);
      const result = await authService.login(input);
      await logActivity('LOGIN', 'auth', result.user.id, `User logged in: ${result.user.email}`, request);
      return sendSuccess(reply, result, 'ورود با موفقیت انجام شد');
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(reply, 'داده‌های ورودی نامعتبر است', 422);
      }
      await logActivity('LOGIN_FAILED', 'auth', null, `Failed login attempt: ${(request.body as any)?.email}`, request, 'warning');
      return sendError(reply, (error as Error).message || 'خطا در ورود', 401);
    }
  });

  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(request.body);
      const result = await authService.refreshToken(refreshToken);
      return sendSuccess(reply, result, 'توکن با موفقیت تجدید شد');
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در تجدید توکن', 401);
    }
  });

  // Logout
  fastify.post('/logout', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as { userId: string };
      await authService.logout(user.userId);
      return sendSuccess(reply, null, 'خروج با موفقیت انجام شد');
    } catch (error) {
      return sendError(reply, 'خطا در خروج');
    }
  });

  // Verify email
  fastify.get('/verify-email/:token', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token } = request.params as { token: string };
      await authService.verifyEmail(token);
      return sendSuccess(reply, null, 'ایمیل با موفقیت تایید شد');
    } catch (error) {
      return sendError(reply, (error as Error).message || 'خطا در تایید ایمیل');
    }
  });

  // Forgot password
  fastify.post('/forgot-password', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email } = forgotPasswordSchema.parse(request.body);
      await authService.forgotPassword(email);
      return sendSuccess(reply, null, 'اگر ایمیل شما در سیستم موجود باشد، لینک بازیابی ارسال خواهد شد');
    } catch (error) {
      return sendSuccess(reply, null, 'اگر ایمیل شما در سیستم موجود باشد، لینک بازیابی ارسال خواهد شد');
    }
  });

  // Reset password
  fastify.post('/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token, password } = resetPasswordSchema.parse(request.body);
      await authService.resetPassword(token, password);
      return sendSuccess(reply, null, 'رمز عبور با موفقیت تغییر یافت');
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(reply, 'داده‌های ورودی نامعتبر است', 422);
      }
      return sendError(reply, (error as Error).message || 'خطا در بازیابی رمز عبور');
    }
  });

  // Get current user
  fastify.get('/me', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as { userId: string; email: string; role: string };
      return sendSuccess(reply, user, 'اطلاعات کاربر');
    } catch (error) {
      return sendError(reply, 'خطا در دریافت اطلاعات کاربر', 401);
    }
  });
}
