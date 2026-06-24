import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorPenerimaan } from '../../../utils/generator';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('penerimaan_barang')
    .select('*, purchase_order!inner(nomor_po), vendor!inner(nama), cabang!inner(nama)', { count: 'exact' });

  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));
  if (c.req.query('id_po')) query = query.eq('id_po', c.req.query('id_po'));

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
    .from('penerimaan_barang')
    .select('*, purchase_order(*, vendor(*)), cabang(*), gudang(*), penerimaan_barang_item(*), creator:users!created_by(*)')
    .eq('id', id)
    .single();

  if (err || !data) return notFound(c, 'Penerimaan tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.id_po) return validationError(c, 'PO harus diisi');

  const { data: po } = await supabase
    .from('purchase_order')
    .select('*, purchase_order_item(*)')
    .eq('id', body.id_po)
    .single();

  if (!po) return notFound(c, 'PO tidak ditemukan');

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('penerimaan_barang')
    .select('*', { count: 'exact', head: true })
    .like('nomor_penerimaan', `PNB-${tahun}-%`);

  const nomorPenerimaan = generateNomorPenerimaan(tahun, (count || 0) + 1);

  const items = (body.items || []).map((item: any) => {
    const poItem = po.purchase_order_item?.find((pi: any) => pi.id === item.id_po_item);
    return {
      id_po_item: item.id_po_item,
      nama_barang: item.nama_barang || poItem?.nama_barang,
      jumlah_dipesan: poItem?.jumlah || 0,
      jumlah_diterima: item.jumlah_diterima || 0,
      satuan: item.satuan || poItem?.satuan,
      kondisi: item.kondisi || 'baik',
      catatan: item.catatan,
    };
  });

  if (items.length === 0) {
    return validationError(c, 'Minimal 1 item penerimaan harus diisi');
  }

  const { data, error: err } = await supabase
    .from('penerimaan_barang')
    .insert({
      nomor_penerimaan: nomorPenerimaan,
      id_po: body.id_po,
      id_vendor: po.id_vendor,
      id_cabang: po.id_cabang,
      id_gudang: body.id_gudang || po.id_gudang,
      tanggal_terima: body.tanggal_terima || new Date().toISOString().split('T')[0],
      status: 'draft',
      catatan: body.catatan,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  const { error: itemsErr } = await supabase
    .from('penerimaan_barang_item')
    .insert(items.map((item: any) => ({ ...item, id_penerimaan: data.id })));

  if (itemsErr) return validationError(c, itemsErr.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.PROCUREMENT, nama_tabel: 'penerimaan_barang', id_record: data.id, data_baru: data, deskripsi: `Penerimaan ${nomorPenerimaan} untuk PO ${po.nomor_po}` });
  return created(c, { ...data, items }, `Penerimaan ${nomorPenerimaan} berhasil dibuat`);
});

app.patch('/:id/terima', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan } = await c.req.json();

  const { data: existing } = await supabase
    .from('penerimaan_barang')
    .select('*, purchase_order(nomor_po)')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Penerimaan tidak ditemukan');

  const { data, error: err } = await supabase
    .from('penerimaan_barang')
    .update({ status: 'diterima', diterima_oleh: user.id, diterima_at: new Date().toISOString(), catatan })
    .eq('id', id)
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.PROCUREMENT, nama_tabel: 'penerimaan_barang', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Penerimaan ${existing.nomor_penerimaan} dikonfirmasi` });
  return success(c, data, 'Penerimaan barang berhasil dikonfirmasi');
});

export default app;
