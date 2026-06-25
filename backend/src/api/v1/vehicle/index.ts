import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { success } from '../../../utils/response';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');
  const status = c.req.query('status');

  let query = supabase
    .from('kendaraan')
    .select('id, nomor_polisi, merk, model, tahun, warna, status, id_cabang', { count: 'exact' });

  if (status) query = query.eq('status', status);

  query = query.order('merk', { ascending: true });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return c.json({ success: false, error: err.message }, 500);

  const mapped = (data || []).map(v => ({
    ...v,
    nopol: v.nomor_polisi,
    tipe: v.model,
  }));

  return success(c, mapped, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

export default app;
