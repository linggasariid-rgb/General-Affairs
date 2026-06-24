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

  let query = supabase
    .from('atk_item')
    .select('*, atk_kategori!id_kategori(id, kode, nama), creator:users!created_by(nama)', { count: 'exact' });

  if (c.req.query('search')) {
    query = query.or(`nama.ilike.%${c.req.query('search')}%,kode_item.ilike.%${c.req.query('search')}%`);
  }
  if (c.req.query('id_kategori')) query = query.eq('id_kategori', c.req.query('id_kategori'));
  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));

  query = query.order('nama', { ascending: true });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return validationError(c, err.message);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

app.get('/all', async (c) => {
  const supabase = getSupabase(c.env);
  let query = supabase.from('atk_item').select('id, kode_item, nama, spesifikasi, satuan, harga_estimasi').eq('status', 'aktif');
  if (c.req.query('search')) {
    query = query.or(`nama.ilike.%${c.req.query('search')}%,kode_item.ilike.%${c.req.query('search')}%`);
  }
  query = query.order('nama', { ascending: true }).limit(50);
  const { data, error: err } = await query;
  if (err) return validationError(c, err.message);
  return success(c, data);
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const { data, error: err } = await supabase
    .from('atk_item')
    .select('*, atk_kategori!id_kategori(*), creator:users!created_by(nama)')
    .eq('id', id)
    .single();
  if (err || !data) return notFound(c, 'Item tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.nama || !body.satuan) return validationError(c, 'Nama dan satuan harus diisi');

  const { count } = await supabase.from('atk_item').select('*', { count: 'exact', head: true });
  const kodeItem = `ATK-${String((count || 0) + 1).padStart(4, '0')}`;

  const { data, error: err } = await supabase
    .from('atk_item')
    .insert({ ...body, kode_item: kodeItem, created_by: user.id })
    .select('*, atk_kategori!id_kategori(*)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.MASTER, nama_tabel: 'atk_item', id_record: data.id, data_baru: data, deskripsi: `Item ATK ${body.nama} (${kodeItem}) dibuat` });
  return created(c, data);
});

app.put('/:id', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase.from('atk_item').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Item tidak ditemukan');

  const { data, error: err } = await supabase
    .from('atk_item')
    .update(body)
    .eq('id', id)
    .select('*, atk_kategori!id_kategori(*)')
    .single();

  if (err) return validationError(c, err.message);
  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.MASTER, nama_tabel: 'atk_item', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Item ATK ${existing.nama} diupdate` });
  return success(c, data, 'Item berhasil diupdate');
});

app.delete('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('atk_item').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Item tidak ditemukan');

  const { error: err } = await supabase.from('atk_item').update({ status: 'nonaktif' }).eq('id', id);
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.DELETE, modul: MODUL.MASTER, nama_tabel: 'atk_item', id_record: id, data_lama: existing, deskripsi: `Item ATK ${existing.nama} dinonaktifkan` });
  return success(c, null, 'Item berhasil dinonaktifkan');
});

export default app;
