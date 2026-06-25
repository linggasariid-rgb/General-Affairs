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

  let query = supabase
    .from('kendaraan_service')
    .select('id, tipe_service, tanggal, kilometer, biaya, id_vendor, keterangan, status, kendaraan!id_kendaraan(nomor_polisi, merk)', { count: 'exact' });

  query = query.order('tanggal', { ascending: false });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return c.json({ success: false, error: err.message }, 500);

  const mapped = (data || []).map(v => ({
    ...v,
    kendaraan: v.kendaraan ? { ...v.kendaraan, nopol: v.kendaraan.nomor_polisi } : undefined,
  }));

  return success(c, mapped, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

export default app;
