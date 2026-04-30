import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { activityLogs } from '../db/schema';

export async function logActivity(
  action: string,
  resource: string,
  resourceId: string | null,
  details: string | null,
  request: FastifyRequest,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
) {
  try {
    const db = getDb();
    const user = request.user as { userId?: string } | undefined;

    await db.insert(activityLogs).values({
      id: uuidv4(),
      userId: user?.userId,
      action,
      resource,
      resourceId: resourceId ?? undefined,
      details: details ?? undefined,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      severity,
    });
  } catch {
    // Non-blocking - log to console if DB insert fails
    console.error('Failed to write activity log');
  }
}
