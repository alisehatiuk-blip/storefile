import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('marketplace_db'),

  JWT_SECRET: z.string().min(32).default('dev_jwt_secret_key_32chars_minimum!!'),
  JWT_REFRESH_SECRET: z.string().min(32).default('dev_refresh_secret_key_32chars_min'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  ADMIN_JWT_SECRET: z.string().min(32).default('dev_admin_jwt_secret_key_32chars!!'),

  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(52428800),

  FRONTEND_URL: z.string().default('http://localhost:3000'),
  ADMIN_URL: z.string().default('http://localhost:3001'),

  DOWNLOAD_SECRET: z.string().min(16).default('dev_download_secret_key_16chars!!'),

  APP_NAME: z.string().default('دیجی‌اسکریپت'),
  APP_URL: z.string().default('http://localhost:4000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
