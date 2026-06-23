import { Context, Next } from 'hono';
import { getSupabase, type AppEnv } from '../config/database';
import { unauthorized } from '../utils/response';

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(c, 'Token tidak ditemukan');
  }

  const token = authHeader.slice(7);
  const supabase = getSupabase(c.env);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return unauthorized(c, 'Token tidak valid');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, roles(*)')
      .eq('email', String(user.email))
      .single();

    if (userError || !userData) {
      return unauthorized(c, 'User tidak ditemukan di sistem');
    }

    if (!userData.is_active) {
      return unauthorized(c, 'Akun non-aktif');
    }

    c.set('user', userData);
    c.set('userId', userData.id);
    c.set('roleCode', userData.roles.kode);

    await next();
  } catch (err) {
    return unauthorized(c, 'Token tidak valid');
  }
}
