import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorDistribusi } from '../../../utils/generator';
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
    .from('atk_distribusi')
    .select('*, cabang!id_cabang(nama), gudang!id_gudang(nama), creator:users!created_by(nama), approved_by:users!approved_by(nama)', { count: 'exact' });

  if (['KCB', 'PCB'].includes(roleCode) && user.id_cabang) {
    query = query.eq('id_cabang', user.id_cabang);
  }
  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));
  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));
  if (c.req.query('bulan')) query = query.eq('bulan', parseInt(c.req.query('bulan')!));
  if (c.req.query('tahun')) query = query.eq('tahun', parseInt(c.req.query('tahun')!));

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
    .from('atk_distribusi')
    .select('*, cabang(*), gudang(*), creator:users!created_by(*), approved_by:users!approved_by(*), atk_distribusi_item(*, atk_item(id, kode_item, nama, spesifikasi, satuan))')
    .eq('id', id)
    .single();

  if (error || !data) return notFound(c, 'Distribusi tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.id_cabang || !body.id_gudang || !body.bulan || !body.tahun || !body.items?.length) {
    return validationError(c, 'Cabang, gudang, bulan, tahun, dan minimal 1 item harus diisi');
  }

  for (const item of body.items) {
    if (!item.id_item || !item.qty_direncanakan) {
      return validationError(c, 'Item: id_item dan qty_direncanakan harus diisi');
    }
  }

  const { count } = await supabase
    .from('atk_distribusi')
    .select('*', { count: 'exact', head: true })
    .like('nomor_distribusi', `DST-${body.tahun}-%`);

  const nomorDistribusi = generateNomorDistribusi('', body.tahun, (count || 0) + 1);

  const { data: distribusi, error: err } = await supabase
    .from('atk_distribusi')
    .insert({
      nomor_distribusi: nomorDistribusi,
      judul: body.judul || `Distribusi ATK/RTK ${body.bulan}/${body.tahun}`,
      id_cabang: body.id_cabang,
      id_gudang: body.id_gudang,
      bulan: body.bulan,
      tahun: body.tahun,
      status: 'draft',
      catatan: body.catatan,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  const items = body.items.map((item: any) => ({
    id_distribusi: distribusi.id,
    id_item: item.id_item,
    qty_direncanakan: item.qty_direncanakan,
  }));

  const { error: itemsError } = await supabase.from('atk_distribusi_item').insert(items);
  if (itemsError) return validationError(c, itemsError.message);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.ASSET,
    nama_tabel: 'atk_distribusi', id_record: distribusi.id,
    data_baru: distribusi, deskripsi: `Distribusi ${nomorDistribusi} dibuat`,
  });

  return created(c, { ...distribusi, items }, `Distribusi ${nomorDistribusi} berhasil dibuat`);
});

app.put('/:id/submit', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from('atk_distribusi')
    .update({ status: 'diajukan' })
    .eq('id', id)
    .eq('status', 'draft')
    .select('*')
    .single();

  if (error || !data) return validationError(c, 'Distribusi tidak ditemukan atau sudah diajukan');
  return success(c, data, 'Distribusi berhasil diajukan');
});

app.put('/:id/approve', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('atk_distribusi').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Distribusi tidak ditemukan');
  if (existing.status !== 'diajukan') return validationError(c, 'Status distribusi tidak valid');

  const { data, error } = await supabase
    .from('atk_distribusi')
    .update({ status: 'disetujui', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);
  logAudit(c, { tipe_aksi: AUDIT_ACTION.APPROVE, modul: MODUL.ASSET, id_record: id, deskripsi: `Distribusi ${existing.nomor_distribusi} disetujui` });
  return success(c, data, 'Distribusi disetujui');
});

app.put('/:id/reject', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from('atk_distribusi')
    .update({ status: 'ditolak' })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);
  return success(c, data, 'Distribusi ditolak');
});

app.put('/:id/kirim', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase
    .from('atk_distribusi')
    .select('*, atk_distribusi_item(*)')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Distribusi tidak ditemukan');
  if (existing.status !== 'disetujui') return validationError(c, 'Distribusi harus disetujui terlebih dahulu');

  for (const item of body.items || []) {
    await supabase
      .from('atk_distribusi_item')
      .update({ qty_dikirim: item.qty_dikirim })
      .eq('id', item.id);

    const { data: stock } = await supabase
      .from('atk_stock')
      .select('*')
      .eq('id_item', item.id_item)
      .eq('id_gudang', existing.id_gudang)
      .maybeSingle();

    if (stock) {
      await supabase.from('atk_stock').update({ qty: stock.qty - item.qty_dikirim }).eq('id', stock.id);
    }
  }

  const { data, error } = await supabase
    .from('atk_distribusi')
    .update({ status: 'dikirim', dikirim_oleh: user.id, dikirim_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);
  return success(c, data, 'Barang berhasil dikirim');
});

app.put('/:id/selesai', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from('atk_distribusi')
    .update({ status: 'selesai' })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);
  return success(c, data, 'Distribusi selesai');
});

export default app;
