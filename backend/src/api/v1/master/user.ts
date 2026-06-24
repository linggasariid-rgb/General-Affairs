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
    .from('users')
    .select('*, roles!inner(id, kode, nama), cabang!inner(id, nama, kode)', { count: 'exact' });

  if (c.req.query('search')) {
    query = query.or(`nama.ilike.%${c.req.query('search')}%,email.ilike.%${c.req.query('search')}%`);
  }
  if (c.req.query('id_role')) query = query.eq('id_role', c.req.query('id_role'));
  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));
  if (c.req.query('is_active')) query = query.eq('is_active', c.req.query('is_active') === 'true');

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
    .from('users')
    .select('*, roles(*), cabang(*), gudang(*)')
    .eq('id', id)
    .single();

  if (err || !data) return notFound(c, 'User tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!body.email || !body.nama || !body.id_role) {
    return validationError(c, 'Email, nama, dan role harus diisi');
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password || 'password123',
    email_confirm: true,
  });

  if (authError) return validationError(c, authError.message);

  const userInsert: any = {
    id: authData.user.id,
    email: body.email,
    nama: body.nama,
    id_role: body.id_role,
    id_cabang: body.id_cabang || null,
    id_gudang: body.id_gudang || null,
    telepon: body.telepon || null,
    is_active: true,
  };

  const { data, error: err } = await supabase.from('users').insert(userInsert).select('*, roles(*), cabang(*)').single();
  if (err) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return validationError(c, err.message);
  }

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.MASTER, nama_tabel: 'users', id_record: data.id, data_baru: data, deskripsi: `User ${body.nama} dibuat` });
  return created(c, data);
});

app.put('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase.from('users').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'User tidak ditemukan');

  const updateData: any = {};
  if (body.nama) updateData.nama = body.nama;
  if (body.id_role) updateData.id_role = body.id_role;
  if (body.id_cabang !== undefined) updateData.id_cabang = body.id_cabang;
  if (body.id_gudang !== undefined) updateData.id_gudang = body.id_gudang;
  if (body.telepon !== undefined) updateData.telepon = body.telepon;

  const { data, error: err } = await supabase.from('users').update(updateData).eq('id', id).select('*, roles(*), cabang(*)').single();
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.MASTER, nama_tabel: 'users', id_record: id, data_lama: existing, data_baru: data, deskripsi: `User ${existing.nama} diupdate` });
  return success(c, data, 'User berhasil diupdate');
});

app.patch('/:id/toggle-active', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('users').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'User tidak ditemukan');

  const newStatus = !existing.is_active;
  const { data, error: err } = await supabase.from('users').update({ is_active: newStatus }).eq('id', id).select('*, roles(*), cabang(*)').single();
  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.MASTER, nama_tabel: 'users', id_record: id, data_lama: existing, data_baru: data, deskripsi: `User ${existing.nama} ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}` });
  return success(c, data, newStatus ? 'User diaktifkan' : 'User dinonaktifkan');
});

export default app;
