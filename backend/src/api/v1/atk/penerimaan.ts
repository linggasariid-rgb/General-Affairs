import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const roleCode = c.get('roleCode');
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('atk_penerimaan')
    .select('*, cabang!id_cabang(nama), distribusi:atk_distribusi!id_distribusi(nomor_distribusi, judul), received_by:users!received_by(nama)', { count: 'exact' });

  if (['KCB', 'PCB'].includes(roleCode) && user.id_cabang) {
    query = query.eq('id_cabang', user.id_cabang);
  }
  if (c.req.query('id_distribusi')) query = query.eq('id_distribusi', c.req.query('id_distribusi'));
  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));

  query = query.order('created_at', { ascending: false });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error, count } = await query;
  if (error) return c.json({ success: false, error: error.message }, 500);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from('atk_penerimaan')
    .select('*, cabang(*), distribusi:atk_distribusi!id_distribusi(*), received_by:users!received_by(*), atk_penerimaan_item(*, atk_item(id, kode_item, nama, spesifikasi, satuan))')
    .eq('id', id)
    .single();

  if (error || !data) return notFound(c, 'Penerimaan tidak ditemukan');
  return success(c, data);
});

app.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.id_distribusi || !body.id_cabang || !body.tanggal_terima || !body.items?.length) {
    return validationError(c, 'Distribusi, cabang, tanggal terima, dan minimal 1 item harus diisi');
  }

  const { count } = await supabase
    .from('atk_penerimaan')
    .select('*', { count: 'exact', head: true })
    .like('nomor_penerimaan', `PNB-ATK-${new Date(body.tanggal_terima).getFullYear()}-%`);

  const tahun = new Date(body.tanggal_terima).getFullYear();
  const nomorPenerimaan = `PNB-ATK-${tahun}-${String((count || 0) + 1).padStart(5, '0')}`;

  const allReceived = body.items.every((item: any) => item.qty_diterima >= item.qty_dikirim);
  const partialReceived = body.items.some((item: any) => item.qty_diterima < item.qty_dikirim);
  const status = allReceived ? 'diterima' : partialReceived ? 'diterima_sebagian' : 'diterima';

  const { data: penerimaan, error: err } = await supabase
    .from('atk_penerimaan')
    .insert({
      nomor_penerimaan: nomorPenerimaan,
      id_distribusi: body.id_distribusi,
      id_cabang: body.id_cabang,
      tanggal_terima: body.tanggal_terima,
      status,
      catatan: body.catatan,
      received_by: user.id,
    })
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  const items = body.items.map((item: any) => ({
    id_penerimaan: penerimaan.id,
    id_distribusi_item: item.id_distribusi_item,
    id_item: item.id_item,
    qty_direncanakan: item.qty_direncanakan,
    qty_dikirim: item.qty_dikirim,
    qty_diterima: item.qty_diterima,
    qty_rusak: item.qty_rusak || 0,
    qty_kurang: item.qty_kurang || 0,
    kondisi: item.kondisi || 'baik',
    catatan: item.catatan,
  }));

  const { error: itemsError } = await supabase.from('atk_penerimaan_item').insert(items);
  if (itemsError) return validationError(c, itemsError.message);

  await supabase
    .from('atk_distribusi')
    .update({ status: status === 'diterima' ? 'selesai' : 'diterima_sebagian' })
    .eq('id', body.id_distribusi);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.ASSET,
    nama_tabel: 'atk_penerimaan', id_record: penerimaan.id,
    deskripsi: `Penerimaan ATK ${nomorPenerimaan} dicatat`,
  });

  return created(c, { ...penerimaan, items }, `Penerimaan ${nomorPenerimaan} berhasil dicatat`);
});

export default app;
