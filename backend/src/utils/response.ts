import { FastifyReply } from 'fastify';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  message?: string,
  statusCode = 200
) {
  return reply.code(statusCode).send({
    success: true,
    data,
    message,
  } satisfies ApiResponse<T>);
}

export function sendError(
  reply: FastifyReply,
  message: string,
  statusCode = 400,
  errors?: Record<string, string[]>
) {
  return reply.code(statusCode).send({
    success: false,
    message,
    errors,
  } satisfies ApiResponse);
}

export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
) {
  return reply.code(200).send({
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  } satisfies ApiResponse<T[]>);
}
