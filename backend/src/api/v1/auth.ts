import { Hono } from 'hono';
import type { AppEnv } from '../../config/database';
import { authMiddleware } from '../../midlware/auth';
import { success, unauthorized } from '../../utils/response';

const app = new Hono<AppEnv>();

app.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) return unauthorized(c, 'User tidak ditemukan');
  return success(c, user);
});

export default app;
