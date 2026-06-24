import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase.from('lokasi_asset').select('*, cabang!inner(nama, kode)', { count: 'exact' });

  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));

  query = query.order('nama', { ascending: true });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return validationError(c, err.message);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!body.nama || !body.id_cabang) return validationError(c, 'Nama dan cabang harus diisi');

  const { data, error: err } = await supabase.from('lokasi_asset').insert(body).select().single();
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.MASTER, nama_tabel: 'lokasi_asset', id_record: data.id, data_baru: data, deskripsi: `Lokasi asset ${body.nama} dibuat` });
  return created(c, data);
});

app.put('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase.from('lokasi_asset').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Lokasi tidak ditemukan');

  const { data, error: err } = await supabase.from('lokasi_asset').update(body).eq('id', id).select().single();
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.MASTER, nama_tabel: 'lokasi_asset', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Lokasi asset ${existing.nama} diupdate` });
  return success(c, data, 'Lokasi berhasil diupdate');
});

app.delete('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('lokasi_asset').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Lokasi tidak ditemukan');

  const { error: err } = await supabase.from('lokasi_asset').update({ status: false }).eq('id', id);
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.DELETE, modul: MODUL.MASTER, nama_tabel: 'lokasi_asset', id_record: id, data_lama: existing, deskripsi: `Lokasi asset ${existing.nama} dinonaktifkan` });
  return success(c, null, 'Lokasi berhasil dinonaktifkan');
});

export default app;
