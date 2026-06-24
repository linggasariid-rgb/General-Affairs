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
  const { data, error: err } = await supabase
    .from('atk_kategori')
    .select('*')
    .order('urutan', { ascending: true });
  if (err) return validationError(c, err.message);
  return success(c, data);
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const { data, error: err } = await supabase.from('atk_kategori').select('*').eq('id', id).single();
  if (err || !data) return notFound(c, 'Kategori tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  if (!body.kode || !body.nama) return validationError(c, 'Kode dan nama harus diisi');
  const { data, error: err } = await supabase.from('atk_kategori').insert(body).select('*').single();
  if (err) return validationError(c, err.message);
  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.MASTER, nama_tabel: 'atk_kategori', id_record: data.id, data_baru: data, deskripsi: `Kategori ATK ${body.nama} dibuat` });
  return created(c, data);
});

app.put('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();
  const { data: existing } = await supabase.from('atk_kategori').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Kategori tidak ditemukan');
  const { data, error: err } = await supabase.from('atk_kategori').update(body).eq('id', id).select('*').single();
  if (err) return validationError(c, err.message);
  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.MASTER, nama_tabel: 'atk_kategori', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Kategori ATK ${existing.nama} diupdate` });
  return success(c, data, 'Kategori berhasil diupdate');
});

app.delete('/:id', requireRole(['SA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const { error: err } = await supabase.from('atk_kategori').delete().eq('id', id);
  if (err) return validationError(c, err.message);
  return success(c, null, 'Kategori berhasil dihapus');
});

export default app;
