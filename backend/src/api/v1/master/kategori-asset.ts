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

  let query = supabase.from('kategori_asset').select('*', { count: 'exact' });

  if (c.req.query('search')) query = query.ilike('nama', `%${c.req.query('search')}%`);

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

  if (!body.nama) return validationError(c, 'Nama kategori harus diisi');

  const { data, error: err } = await supabase.from('kategori_asset').insert(body).select().single();
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.MASTER, nama_tabel: 'kategori_asset', id_record: data.id, data_baru: data, deskripsi: `Kategori asset ${body.nama} dibuat` });
  return created(c, data);
});

app.put('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase.from('kategori_asset').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Kategori tidak ditemukan');

  const { data, error: err } = await supabase.from('kategori_asset').update(body).eq('id', id).select().single();
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.MASTER, nama_tabel: 'kategori_asset', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Kategori asset ${existing.nama} diupdate` });
  return success(c, data, 'Kategori berhasil diupdate');
});

app.delete('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('kategori_asset').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Kategori tidak ditemukan');

  const { error: err } = await supabase.from('kategori_asset').update({ status: false }).eq('id', id);
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.DELETE, modul: MODUL.MASTER, nama_tabel: 'kategori_asset', id_record: id, data_lama: existing, deskripsi: `Kategori asset ${existing.nama} dinonaktifkan` });
  return success(c, null, 'Kategori berhasil dinonaktifkan');
});

export default app;
