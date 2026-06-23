import { Context, Next } from 'hono';
import { serverError } from '../utils/response';
import type { AppEnv } from '../config/database';

export async function errorHandler(c: Context<AppEnv>, next: Next) {
  try {
    await next();
  } catch (err: any) {
    console.error('Unhandled error:', err);

    if (err.status && err.message) {
      return c.json(
        { success: false, error: { code: 'ERROR', message: err.message } },
        err.status,
      );
    }

    return serverError(c, 'Terjadi kesalahan internal');
  }
}
