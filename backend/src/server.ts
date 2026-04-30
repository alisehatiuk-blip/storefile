import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';

import { env } from './config/env';
import { createDbConnection } from './db';
import { authRoutes } from './modules/auth/auth.controller';
import { productsRoutes } from './modules/products/products.controller';
import { categoriesRoutes } from './modules/categories/categories.controller';
import { ordersRoutes } from './modules/orders/orders.controller';
import { downloadsRoutes } from './modules/downloads/downloads.controller';
import { ticketsRoutes } from './modules/tickets/tickets.controller';
import { usersRoutes } from './modules/users/users.controller';
import { adminRoutes } from './modules/admin/admin.controller';
import { uploadsRoutes } from './modules/uploads/uploads.controller';
import { licensesRoutes } from './modules/licenses/licenses.controller';

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'warn' : 'info',
    },
    trustProxy: true,
  });

  // Ensure upload directories exist
  const uploadDirs = [
    env.UPLOAD_DIR,
    path.join(env.UPLOAD_DIR, 'images', 'products'),
    path.join(env.UPLOAD_DIR, 'files', 'products'),
  ];
  for (const dir of uploadDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Register plugins
  await fastify.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  });

  await fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      const allowed = [
        env.FRONTEND_URL,
        env.ADMIN_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ];
      // Allow Cloudflare tunnels and localtunnel in dev
      if (
        !origin ||
        allowed.includes(origin) ||
        origin.endsWith('.trycloudflare.com') ||
        origin.endsWith('.loca.lt') ||
        env.NODE_ENV === 'development'
      ) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      message: 'تعداد درخواست‌های شما از حد مجاز تجاوز کرده. لطفاً کمی صبر کنید.',
    }),
  });

  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE,
    },
  });

  // Serve static files (uploaded images only - not product download files)
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), env.UPLOAD_DIR, 'images'),
    prefix: '/uploads/images/',
    decorateReply: false,
  });

  // Connect to database
  await createDbConnection();

  // Register API routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(productsRoutes, { prefix: '/api/products' });
  await fastify.register(categoriesRoutes, { prefix: '/api/categories' });
  await fastify.register(ordersRoutes, { prefix: '/api/orders' });
  await fastify.register(downloadsRoutes, { prefix: '/api/downloads' });
  await fastify.register(ticketsRoutes, { prefix: '/api/tickets' });
  await fastify.register(usersRoutes, { prefix: '/api/users' });
  await fastify.register(adminRoutes, { prefix: '/api/admin' });
  await fastify.register(uploadsRoutes, { prefix: '/api/uploads' });
  await fastify.register(licensesRoutes, { prefix: '/api/licenses' });

  // Auth rate limiting (stricter for auth endpoints)
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/auth/login') || request.url.startsWith('/api/auth/register')) {
      // Additional rate limiting logic could be added here
    }
  });

  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }));

  return fastify;
}

async function main() {
  try {
    const server = await buildServer();
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://0.0.0.0:${env.PORT}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
