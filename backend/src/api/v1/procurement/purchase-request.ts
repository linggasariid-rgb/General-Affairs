import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorPR } from '../../../utils/generator';
import { AUDIT_ACTION, MODUL, PR_STATUS } from '../../../config/constants';
import type { PRPayload } from '../../../types';

const pr = new Hono<AppEnv>();

pr.use('*', authMiddleware);

// GET - List PR
pr.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const roleCode = c.get('roleCode');
  const { page = '1', perPage = '10', status, id_cabang } = c.req.query();

  let query = supabase
    .from('purchase_request')
    .select('*, cabang!inner(nama), creator:users!created_by(nama), purchase_request_item(*)', { count: 'exact' });

  if (['KCB', 'PCB'].includes(roleCode) && user.id_cabang) {
    query = query.eq('id_cabang', user.id_cabang);
  }
  if (status) query = query.eq('status', status);
  if (id_cabang) query = query.eq('id_cabang', id_cabang);

  query = query.order('created_at', { ascending: false });
  query = query.range((Number(page) - 1) * Number(perPage), Number(page) * Number(perPage) - 1);

  const { data, error, count } = await query;
  if (error) return c.json({ success: false, error: error.message }, 500);

  return success(c, data, undefined, {
    page: Number(page), perPage: Number(perPage),
    total: count || 0, totalPages: Math.ceil((count || 0) / Number(perPage)),
  });
});

// GET /:id
pr.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from('purchase_request')
    .select('*, cabang(*), gudang(*), creator:users!created_by(*), purchase_request_item(*), purchase_request_approval(*, approved_by:users!approved_by(*))')
    .eq('id', id)
    .single();

  if (error || !data) return notFound(c, 'PR tidak ditemukan');
  return success(c, data);
});

// POST - Create PR
pr.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body: PRPayload = await c.req.json();

  if (!body.judul || !body.id_cabang || !body.items?.length) {
    return validationError(c, 'Judul, cabang, dan minimal 1 item harus diisi');
  }

  for (const item of body.items) {
    if (!item.nama_barang || !item.jumlah || !item.satuan) {
      return validationError(c, 'Item: nama, jumlah, dan satuan harus diisi');
    }
  }

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('purchase_request')
    .select('*', { count: 'exact', head: true })
    .like('nomor_pr', `PR-${tahun}-%`);

  const nomorPR = generateNomorPR('', tahun, (count || 0) + 1);
  const estimasiTotal = body.items.reduce((sum, item) => sum + (item.estimasi_harga || 0) * item.jumlah, 0);

  const { data: prData, error: prError } = await supabase
    .from('purchase_request')
    .insert({
      nomor_pr: nomorPR,
      judul: body.judul,
      deskripsi: body.deskripsi,
      id_cabang: body.id_cabang,
      id_gudang: body.id_gudang,
      status: PR_STATUS.DIAJUKAN,
      urgent: body.urgent || false,
      estimasi_total: estimasiTotal,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (prError) return validationError(c, prError.message);

  // Insert items
  const prItems = body.items.map(item => ({
    id_pr: prData.id,
    nama_barang: item.nama_barang,
    spesifikasi: item.spesifikasi,
    jumlah: item.jumlah,
    satuan: item.satuan,
    estimasi_harga: item.estimasi_harga,
    total_estimasi: (item.estimasi_harga || 0) * item.jumlah,
    keterangan: item.keterangan,
    id_produk: item.id_produk || null,
  }));

  const { error: itemsError } = await supabase
    .from('purchase_request_item')
    .insert(prItems);

  if (itemsError) return validationError(c, itemsError.message);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.PROCUREMENT,
    nama_tabel: 'purchase_request', id_record: prData.id,
    data_baru: prData, deskripsi: `PR ${nomorPR} dibuat`,
  });

  return created(c, { ...prData, items: prItems }, `PR ${nomorPR} berhasil dibuat`);
});

// PUT /:id/submit
pr.put('/:id/submit', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from('purchase_request')
    .update({ status: PR_STATUS.DIAJUKAN })
    .eq('id', id)
    .eq('status', PR_STATUS.DRAFT)
    .select('*')
    .single();

  if (error || !data) return validationError(c, 'PR tidak ditemukan atau sudah diajukan');
  return success(c, data, 'PR berhasil diajukan');
});

// PUT /:id/approve-kacab
pr.put('/:id/approve-kacab', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan } = await c.req.json();

  const { data: existing } = await supabase
    .from('purchase_request')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'PR tidak ditemukan');
  if (existing.status !== PR_STATUS.DIAJUKAN) return validationError(c, 'Status PR tidak valid');

  const { data, error } = await supabase
    .from('purchase_request')
    .update({ status: PR_STATUS.DISETUJUI_KACAB })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  await supabase.from('purchase_request_approval').insert({
    id_pr: id, tahap: 'kacab', status: 'approved', catatan, approved_by: user.id,
  });

  logAudit(c, { tipe_aksi: AUDIT_ACTION.APPROVE, modul: MODUL.PROCUREMENT, id_record: id, deskripsi: `PR ${existing.nomor_pr} disetujui Kacab` });
  return success(c, data, 'PR disetujui Kepala Cabang');
});

// PUT /:id/approve-headga
pr.put('/:id/approve-headga', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan } = await c.req.json();

  const { data: existing } = await supabase
    .from('purchase_request')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'PR tidak ditemukan');
  if (existing.status !== PR_STATUS.DISETUJUI_KACAB) return validationError(c, 'PR harus disetujui Kacab terlebih dahulu');

  const { data, error } = await supabase
    .from('purchase_request')
    .update({ status: PR_STATUS.DISETUJUI_HGA })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  await supabase.from('purchase_request_approval').insert({
    id_pr: id, tahap: 'headga', status: 'approved', catatan, approved_by: user.id,
  });

  logAudit(c, { tipe_aksi: AUDIT_ACTION.APPROVE, modul: MODUL.PROCUREMENT, id_record: id, deskripsi: `PR ${existing.nomor_pr} disetujui Head GA` });
  return success(c, data, 'PR disetujui Head GA');
});

// PUT /:id/reject
pr.put('/:id/reject', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan, tahap } = await c.req.json();

  const { data, error } = await supabase
    .from('purchase_request')
    .update({ status: PR_STATUS.DITOLAK })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  await supabase.from('purchase_request_approval').insert({
    id_pr: id, tahap: tahap || 'kacab', status: 'rejected', catatan, approved_by: user.id,
  });

  return success(c, data, 'PR ditolak');
});

export default pr;
