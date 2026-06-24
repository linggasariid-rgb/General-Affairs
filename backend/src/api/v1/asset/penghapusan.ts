import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorPenghapusan } from '../../../utils/generator';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('asset_penghapusan')
    .select('*, asset!inner(kode_asset, nama), creator:users!created_by(nama)', { count: 'exact' });

  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));
  if (c.req.query('id_asset')) query = query.eq('id_asset', c.req.query('id_asset'));

  query = query.order('created_at', { ascending: false });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return validationError(c, err.message);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

app.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.id_asset || !body.alasan) {
    return validationError(c, 'Asset dan alasan penghapusan harus diisi');
  }

  const { data: asset } = await supabase.from('asset').select('*').eq('id', body.id_asset).single();
  if (!asset) return notFound(c, 'Asset tidak ditemukan');

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('asset_penghapusan')
    .select('*', { count: 'exact', head: true })
    .like('nomor_penghapusan', `PHP-${tahun}-%`);

  const nomorPenghapusan = generateNomorPenghapusan(tahun, (count || 0) + 1);

  const { data, error: err } = await supabase
    .from('asset_penghapusan')
    .insert({
      nomor_penghapusan: nomorPenghapusan,
      id_asset: body.id_asset,
      alasan: body.alasan,
      keterangan: body.keterangan,
      status: 'diajukan',
      created_by: user.id,
    })
    .select('*, asset(kode_asset, nama)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.ASSET, nama_tabel: 'asset_penghapusan', id_record: data.id, data_baru: data, deskripsi: `Penghapusan ${nomorPenghapusan} diajukan untuk ${asset.kode_asset}` });
  return created(c, data, `Penghapusan ${nomorPenghapusan} berhasil diajukan`);
});

app.patch('/:id/approve', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase
    .from('asset_penghapusan')
    .select('*, asset(*)')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Penghapusan tidak ditemukan');
  if (existing.status !== 'diajukan') return validationError(c, 'Penghapusan sudah diproses');

  const { data, error: err } = await supabase
    .from('asset_penghapusan')
    .update({ status: 'disetujui', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  await supabase.from('asset').update({ status: 'dihapus' }).eq('id', existing.id_asset);

  await supabase.from('asset_history').insert({
    id_asset: existing.id_asset, tipe_event: 'penghapusan',
    deskripsi: `Asset dihapus via ${existing.nomor_penghapusan}`,
    user_id: user.id,
  });

  logAudit(c, { tipe_aksi: AUDIT_ACTION.APPROVE, modul: MODUL.ASSET, nama_tabel: 'asset_penghapusan', id_record: id, deskripsi: `Penghapusan ${existing.nomor_penghapusan} disetujui` });
  return success(c, data, 'Penghapusan disetujui');
});

app.patch('/:id/reject', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan } = await c.req.json();

  const { data: existing } = await supabase.from('asset_penghapusan').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Penghapusan tidak ditemukan');

  const { data, error: err } = await supabase
    .from('asset_penghapusan')
    .update({ status: 'ditolak', catatan_penolakan: catatan, approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.REJECT, modul: MODUL.ASSET, nama_tabel: 'asset_penghapusan', id_record: id, deskripsi: `Penghapusan ${existing.nomor_penghapusan} ditolak` });
  return success(c, data, 'Penghapusan ditolak');
});

export default app;
