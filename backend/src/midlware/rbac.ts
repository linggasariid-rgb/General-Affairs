import { Context, Next } from 'hono';
import { forbidden } from '../utils/response';
import type { AppEnv } from '../config/database';

export function requireRole(allowedRoles: string[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const roleCode = c.get('roleCode');
    if (!roleCode || !allowedRoles.includes(roleCode)) {
      return forbidden(c, 'Anda tidak memiliki akses');
    }
    await next();
  };
}

export function requireCabang(c: Context<AppEnv>, next: Next) {
  const user = c.get('user');
  const roleCode = c.get('roleCode');

  if (['KCB', 'PCB'].includes(roleCode) && !user.id_cabang) {
    return forbidden(c, 'User tidak memiliki cabang');
  }

  return next();
}
