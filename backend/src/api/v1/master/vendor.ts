import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateKodeVendor } from '../../../utils/generator';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('vendor')
    .select('*, vendor_kategori!inner(*)', { count: 'exact' });

  if (c.req.query('search')) {
    query = query.or(`nama.ilike.%${c.req.query('search')}%,kode_vendor.ilike.%${c.req.query('search')}%`);
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

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error: err } = await supabase
    .from('vendor')
    .select('*, vendor_kategori(*)')
    .eq('id', id)
    .single();

  if (err || !data) return notFound(c, 'Vendor tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!body.nama) return validationError(c, 'Nama vendor harus diisi');

  const { count } = await supabase.from('vendor').select('*', { count: 'exact', head: true });
  const kodeVendor = generateKodeVendor((count || 0) + 1);

  const { data, error: err } = await supabase
    .from('vendor')
    .insert({ ...body, kode_vendor: kodeVendor, status: 'aktif' })
    .select('*, vendor_kategori(*)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.VENDOR, nama_tabel: 'vendor', id_record: data.id, data_baru: data, deskripsi: `Vendor ${body.nama} (${kodeVendor}) dibuat` });
  return created(c, data);
});

app.put('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase.from('vendor').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Vendor tidak ditemukan');

  const { data, error: err } = await supabase
    .from('vendor')
    .update(body)
    .eq('id', id)
    .select('*, vendor_kategori(*)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.VENDOR, nama_tabel: 'vendor', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Vendor ${existing.nama} diupdate` });
  return success(c, data, 'Vendor berhasil diupdate');
});

app.delete('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('vendor').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Vendor tidak ditemukan');

  const { error: err } = await supabase.from('vendor').update({ status: 'nonaktif' }).eq('id', id);
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.DELETE, modul: MODUL.VENDOR, nama_tabel: 'vendor', id_record: id, data_lama: existing, deskripsi: `Vendor ${existing.nama} dinonaktifkan` });
  return success(c, null, 'Vendor berhasil dinonaktifkan');
});

export default app;
