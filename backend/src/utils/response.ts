import { Context } from 'hono';
import type { ApiResponse, PaginationMeta } from '../types/index';

export function success<T>(c: Context, data: T, message?: string, meta?: PaginationMeta, status = 200) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta,
  };
  return c.json(body, status as any);
}

export function created<T>(c: Context, data: T, message = 'Data berhasil dibuat') {
  return success(c, data, message, undefined, 201);
}

export function error(c: Context, code: string, message: string, status = 400, details?: any) {
  const body: ApiResponse = {
    success: false,
    error: { code, message, details },
  };
  return c.json(body, status as any);
}

export function notFound(c: Context, message = 'Data tidak ditemukan') {
  return error(c, 'NOT_FOUND', message, 404);
}

export function unauthorized(c: Context, message = 'Unauthorized') {
  return error(c, 'UNAUTHORIZED', message, 401);
}

export function forbidden(c: Context, message = 'Forbidden') {
  return error(c, 'FORBIDDEN', message, 403);
}

export function validationError(c: Context, message: string, details?: any) {
  return error(c, 'VALIDATION_ERROR', message, 400, details);
}

export function serverError(c: Context, message = 'Internal server error') {
  return error(c, 'SERVER_ERROR', message, 500);
}
