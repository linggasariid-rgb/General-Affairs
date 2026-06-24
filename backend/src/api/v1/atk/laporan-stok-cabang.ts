import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorLaporanStokCabang } from '../../../utils/generator';
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
    .from('atk_laporan_stok_cabang')
    .select('*, cabang!id_cabang(nama, kode), gudang!id_gudang(nama), creator:users!created_by(nama), verifier:users!verified_by(nama)', { count: 'exact' });

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
    .from('atk_laporan_stok_cabang')
    .select('*, cabang(*), gudang(*), creator:users!created_by(*), verifier:users!verified_by(*), atk_laporan_stok_cabang_item(*, atk_item(id, kode_item, nama, spesifikasi, satuan))')
    .eq('id', id)
    .single();

  if (error || !data) return notFound(c, 'Laporan tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA', 'SGA', 'KCB', 'PCB']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.id_cabang || !body.id_gudang) {
    return validationError(c, 'Cabang dan gudang harus diisi');
  }
  if (!body.items || !body.items.length) {
    return validationError(c, 'Minimal satu item harus diisi');
  }

  const now = new Date();
  const bulan = body.bulan || now.getMonth() + 1;
  const tahun = body.tahun || now.getFullYear();

  const { count } = await supabase
    .from('atk_laporan_stok_cabang')
    .select('*', { count: 'exact', head: true })
    .eq('tahun', tahun);

  const nomor = generateNomorLaporanStokCabang(tahun, (count || 0) + 1);

  const { data: header, error: headerErr } = await supabase
    .from('atk_laporan_stok_cabang')
    .insert({
      nomor_laporan: nomor,
      id_cabang: body.id_cabang,
      id_gudang: body.id_gudang,
      bulan,
      tahun,
      tanggal_laporan: body.tanggal_laporan || new Date().toISOString().split('T')[0],
      catatan: body.catatan || '',
      created_by: user.id,
    })
    .select()
    .single();

  if (headerErr) return validationError(c, headerErr.message);

  const itemsToInsert = body.items.map((item: any) => ({
    id_laporan: header.id,
    id_item: item.id_item,
    stok_sistem: item.stok_sistem || 0,
    stok_fisik: item.stok_fisik || 0,
    keterangan: item.keterangan || '',
  }));

  const { error: itemsErr } = await supabase
    .from('atk_laporan_stok_cabang_item')
    .insert(itemsToInsert);

  if (itemsErr) {
    await supabase.from('atk_laporan_stok_cabang').delete().eq('id', header.id);
    return validationError(c, itemsErr.message);
  }

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.INSERT,
    modul: MODUL.ATK,
    nama_tabel: 'atk_laporan_stok_cabang',
    id_record: header.id,
    data_baru: header,
    deskripsi: `Laporan stok cabang ${nomor} dibuat`,
  });

  return created(c, header);
});

app.put('/:id', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase
    .from('atk_laporan_stok_cabang')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Laporan tidak ditemukan');
  if (existing.status !== 'draft') return validationError(c, 'Hanya laporan draft yang bisa diedit');

  const { data, error } = await supabase
    .from('atk_laporan_stok_cabang')
    .update({
      catatan: body.catatan,
      tanggal_laporan: body.tanggal_laporan,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return validationError(c, error.message);

  if (body.items) {
    await supabase.from('atk_laporan_stok_cabang_item').delete().eq('id_laporan', id);

    const itemsToInsert = body.items.map((item: any) => ({
      id_laporan: id,
      id_item: item.id_item,
      stok_sistem: item.stok_sistem || 0,
      stok_fisik: item.stok_fisik || 0,
      keterangan: item.keterangan || '',
    }));

    const { error: itemsErr } = await supabase
      .from('atk_laporan_stok_cabang_item')
      .insert(itemsToInsert);

    if (itemsErr) return validationError(c, itemsErr.message);
  }

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.UPDATE,
    modul: MODUL.ATK,
    nama_tabel: 'atk_laporan_stok_cabang',
    id_record: id,
    data_lama: existing,
    data_baru: data,
    deskripsi: `Laporan stok cabang ${existing.nomor_laporan} diupdate`,
  });

  return success(c, data, 'Laporan berhasil diupdate');
});

app.post('/:id/submit', requireRole(['SA', 'HGA', 'SGA', 'KCB', 'PCB']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase
    .from('atk_laporan_stok_cabang')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Laporan tidak ditemukan');
  if (existing.status !== 'draft') return validationError(c, 'Hanya laporan draft yang bisa diajukan');

  const { data, error } = await supabase
    .from('atk_laporan_stok_cabang')
    .update({ status: 'dilaporkan' })
    .eq('id', id)
    .select()
    .single();

  if (error) return validationError(c, error.message);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.UPDATE,
    modul: MODUL.ATK,
    nama_tabel: 'atk_laporan_stok_cabang',
    id_record: id,
    data_lama: existing,
    data_baru: data,
    deskripsi: `Laporan stok cabang ${existing.nomor_laporan} diajukan`,
  });

  return success(c, data, 'Laporan berhasil diajukan');
});

app.post('/:id/verifikasi', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase
    .from('atk_laporan_stok_cabang')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Laporan tidak ditemukan');
  if (existing.status !== 'dilaporkan') return validationError(c, 'Hanya laporan yang sudah dilaporkan yang bisa diverifikasi');

  const { data, error } = await supabase
    .from('atk_laporan_stok_cabang')
    .update({
      status: 'diverifikasi',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      catatan: body.catatan !== undefined ? body.catatan : existing.catatan,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return validationError(c, error.message);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.APPROVE,
    modul: MODUL.ATK,
    nama_tabel: 'atk_laporan_stok_cabang',
    id_record: id,
    data_lama: existing,
    data_baru: data,
    deskripsi: `Laporan stok cabang ${existing.nomor_laporan} diverifikasi`,
  });

  return success(c, data, 'Laporan berhasil diverifikasi');
});

app.delete('/:id', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase
    .from('atk_laporan_stok_cabang')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Laporan tidak ditemukan');
  if (existing.status !== 'draft') return validationError(c, 'Hanya laporan draft yang bisa dihapus');

  const { error } = await supabase.from('atk_laporan_stok_cabang').delete().eq('id', id);
  if (error) return validationError(c, error.message);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.DELETE,
    modul: MODUL.ATK,
    nama_tabel: 'atk_laporan_stok_cabang',
    id_record: id,
    data_lama: existing,
    deskripsi: `Laporan stok cabang ${existing.nomor_laporan} dihapus`,
  });

  return success(c, null, 'Laporan berhasil dihapus');
});

export default app;
