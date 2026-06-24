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

  let query = supabase.from('gudang').select('*, cabang!inner(nama, kode)', { count: 'exact' });

  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));
  if (c.req.query('tipe')) query = query.eq('tipe', c.req.query('tipe'));

  query = query.order('nama', { ascending: true });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return validationError(c, err.message);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error: err } = await supabase.from('gudang').select('*, cabang(*)').eq('id', id).single();
  if (err || !data) return notFound(c, 'Gudang tidak ditemukan');

  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!body.nama || !body.id_cabang) return validationError(c, 'Nama dan cabang harus diisi');

  const { data, error: err } = await supabase.from('gudang').insert(body).select().single();
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.MASTER, nama_tabel: 'gudang', id_record: data.id, data_baru: data, deskripsi: `Gudang ${body.nama} dibuat` });
  return created(c, data);
});

app.put('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase.from('gudang').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Gudang tidak ditemukan');

  const { data, error: err } = await supabase.from('gudang').update(body).eq('id', id).select().single();
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.MASTER, nama_tabel: 'gudang', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Gudang ${existing.nama} diupdate` });
  return success(c, data, 'Gudang berhasil diupdate');
});

app.delete('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('gudang').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Gudang tidak ditemukan');

  const { error: err } = await supabase.from('gudang').update({ status: false }).eq('id', id);
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.DELETE, modul: MODUL.MASTER, nama_tabel: 'gudang', id_record: id, data_lama: existing, deskripsi: `Gudang ${existing.nama} dinonaktifkan` });
  return success(c, null, 'Gudang berhasil dinonaktifkan');
});

export default app;
