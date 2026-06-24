import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorPO } from '../../../utils/generator';
import { AUDIT_ACTION, MODUL, PO_STATUS } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('purchase_order')
    .select('*, cabang!inner(nama), vendor!inner(nama), creator:users!created_by(nama), purchase_request!inner(nomor_pr)', { count: 'exact' });

  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));
  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));
  if (c.req.query('id_vendor')) query = query.eq('id_vendor', c.req.query('id_vendor'));

  query = query.order('created_at', { ascending: false });
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
    .from('purchase_order')
    .select('*, cabang(*), vendor(*), purchase_request(*), purchase_order_item(*), purchase_request_item(*), creator:users!created_by(*), approved_by:users!approved_by(*)')
    .eq('id', id)
    .single();

  if (err || !data) return notFound(c, 'PO tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.id_pr || !body.id_vendor) {
    return validationError(c, 'PR dan vendor harus diisi');
  }

  const { data: pr } = await supabase
    .from('purchase_request')
    .select('*, purchase_request_item(*)')
    .eq('id', body.id_pr)
    .single();

  if (!pr) return notFound(c, 'PR tidak ditemukan');
  if (pr.status !== 'disetujui_hga') return validationError(c, 'PR harus sudah disetujui Head GA');

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('purchase_order')
    .select('*', { count: 'exact', head: true })
    .like('nomor_po', `PO-${tahun}-%`);

  const nomorPO = generateNomorPO('', tahun, (count || 0) + 1);

  const poItems = (body.items || pr.purchase_request_item || []).map((item: any) => ({
    nama_barang: item.nama_barang,
    jumlah: item.jumlah,
    satuan: item.satuan,
    harga_satuan: item.harga_satuan || item.estimasi_harga || 0,
    id_pr_item: item.id || item.id_pr_item,
    id_produk: item.id_produk || null,
  }));

  const total = poItems.reduce((sum: number, item: any) => sum + item.jumlah * item.harga_satuan, 0);

  const { data: po, error: poErr } = await supabase
    .from('purchase_order')
    .insert({
      nomor_po: nomorPO,
      id_pr: body.id_pr,
      id_vendor: body.id_vendor,
      id_cabang: pr.id_cabang,
      id_gudang: body.id_gudang || pr.id_gudang,
      status: PO_STATUS.DRAFT,
      total: total + (body.biaya_kirim || 0) + (body.pajak || 0),
      biaya_kirim: body.biaya_kirim || 0,
      pajak: body.pajak || 0,
      termin_pembayaran: body.termin_pembayaran,
      catatan: body.catatan,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (poErr) return validationError(c, poErr.message);

  const { error: itemsErr } = await supabase
    .from('purchase_order_item')
    .insert(poItems.map((item: any) => ({ ...item, id_po: po.id })));

  if (itemsErr) return validationError(c, itemsErr.message);

  await supabase.from('purchase_request').update({ status: 'diproses' }).eq('id', body.id_pr);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.PROCUREMENT, nama_tabel: 'purchase_order', id_record: po.id, data_baru: po, deskripsi: `PO ${nomorPO} dibuat dari PR ${pr.nomor_pr}` });
  return created(c, { ...po, items: poItems }, `PO ${nomorPO} berhasil dibuat`);
});

app.patch('/:id/approve', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('purchase_order').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'PO tidak ditemukan');
  if (existing.status !== PO_STATUS.DRAFT) return validationError(c, 'PO sudah diproses');

  const { data, error: err } = await supabase
    .from('purchase_order')
    .update({ status: PO_STATUS.DIKIRIM, approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.APPROVE, modul: MODUL.PROCUREMENT, nama_tabel: 'purchase_order', id_record: id, deskripsi: `PO ${existing.nomor_po} disetujui` });
  return success(c, data, 'PO berhasil disetujui');
});

app.patch('/:id/selesai', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('purchase_order').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'PO tidak ditemukan');

  const { data, error: err } = await supabase
    .from('purchase_order')
    .update({ status: PO_STATUS.SELESAI, completed_by: user.id, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.PROCUREMENT, nama_tabel: 'purchase_order', id_record: id, deskripsi: `PO ${existing.nomor_po} selesai` });
  return success(c, data, 'PO selesai');
});

export default app;
