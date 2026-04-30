import bcrypt from 'bcryptjs';
import { createHmac, randomBytes } from 'crypto';
import { env } from '../config/env';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

export function generateLicenseKey(): string {
  const segments = Array.from({ length: 4 }, () =>
    randomBytes(4).toString('hex').toUpperCase()
  );
  return segments.join('-');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `TKT-${timestamp}`;
}

export function generateDownloadToken(
  userId: string,
  fileId: string,
  orderId: string,
  expiresAt: Date
): string {
  const payload = `${userId}:${fileId}:${orderId}:${expiresAt.getTime()}`;
  const signature = createHmac('sha256', env.DOWNLOAD_SECRET)
    .update(payload)
    .digest('hex');
  const tokenData = Buffer.from(payload).toString('base64url');
  return `${tokenData}.${signature}`;
}

export function verifyDownloadToken(token: string): {
  userId: string;
  fileId: string;
  orderId: string;
  expiresAt: Date;
} | null {
  try {
    const [tokenData, signature] = token.split('.');
    if (!tokenData || !signature) return null;

    const payload = Buffer.from(tokenData, 'base64url').toString('utf8');
    const expectedSignature = createHmac('sha256', env.DOWNLOAD_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) return null;

    const [userId, fileId, orderId, expiresAtMs] = payload.split(':');
    const expiresAt = new Date(parseInt(expiresAtMs));

    if (expiresAt < new Date()) return null;

    return { userId, fileId, orderId, expiresAt };
  } catch {
    return null;
  }
}
