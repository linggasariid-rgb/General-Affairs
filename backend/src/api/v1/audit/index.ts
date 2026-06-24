import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { success, validationError } from '../../../utils/response';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('audit_log')
    .select('*, users!id_user(email, nama)', { count: 'exact' });

  if (c.req.query('modul')) query = query.eq('modul', c.req.query('modul'));
  if (c.req.query('tipe_aksi')) query = query.eq('tipe_aksi', c.req.query('tipe_aksi'));
  if (c.req.query('id_user')) query = query.eq('id_user', c.req.query('id_user'));
  if (c.req.query('tanggal_mulai')) query = query.gte('created_at', c.req.query('tanggal_mulai'));
  if (c.req.query('tanggal_selesai')) query = query.lte('created_at', c.req.query('tanggal_selesai'));

  query = query.order('created_at', { ascending: false });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return validationError(c, err.message);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

export default app;
