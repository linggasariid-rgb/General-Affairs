import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorPengajuanNonRutin } from '../../../utils/generator';
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
    .from('pengajuan_barang_non_rutin')
    .select('*, cabang(nama, kode), creator:users!created_by(nama)', { count: 'exact' });

  if (['KCB', 'PCB', 'KGD', 'PGD'].includes(roleCode)) {
    query = query.eq('created_by', user.id);
  }
  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));
  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));

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
    .from('pengajuan_barang_non_rutin')
    .select('*, cabang(*), creator:users!created_by(*), processed_by:users!processed_by(*), approved_by:users!approved_by(*), rejected_by:users!rejected_by(*), pengajuan_barang_non_rutin_item(*)')
    .eq('id', id)
    .single();

  if (error || !data) return notFound(c, 'Pengajuan tidak ditemukan');
  return success(c, data);
});

app.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.nama_pengaju || !body.jabatan || !body.lokasi_kerja || !body.items?.length) {
    return validationError(c, 'Nama pengaju, jabatan, lokasi kerja, dan minimal 1 item harus diisi');
  }

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('pengajuan_barang_non_rutin')
    .select('*', { count: 'exact', head: true })
    .like('nomor_pengajuan', `PBN-${tahun}-%`);

  const nomor = generateNomorPengajuanNonRutin(tahun, (count || 0) + 1);

  const { data: header, error: headerErr } = await supabase
    .from('pengajuan_barang_non_rutin')
    .insert({
      nomor_pengajuan: nomor,
      nama_pengaju: body.nama_pengaju,
      jabatan: body.jabatan,
      lokasi_kerja: body.lokasi_kerja,
      id_cabang: body.id_cabang || null,
      catatan: body.catatan || '',
      status: 'diajukan',
      created_by: user.id,
    })
    .select()
    .single();

  if (headerErr) return validationError(c, headerErr.message);

  const itemsToInsert = body.items.map((it: any) => ({
    id_pengajuan: header.id,
    nama_barang: it.nama_barang,
    spesifikasi: it.spesifikasi || '',
    jumlah: it.jumlah || 1,
    satuan: it.satuan || 'pcs',
    keterangan: it.keterangan || '',
  }));

  const { error: itemsErr } = await supabase
    .from('pengajuan_barang_non_rutin_item')
    .insert(itemsToInsert);

  if (itemsErr) {
    await supabase.from('pengajuan_barang_non_rutin').delete().eq('id', header.id);
    return validationError(c, itemsErr.message);
  }

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.ATK,
    nama_tabel: 'pengajuan_barang_non_rutin', id_record: header.id,
    data_baru: header, deskripsi: `Pengajuan ${nomor} dibuat oleh ${body.nama_pengaju}`,
  });

  return created(c, header);
});

app.put('/:id', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase
    .from('pengajuan_barang_non_rutin')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Pengajuan tidak ditemukan');
  if (existing.status !== 'draft' && existing.status !== 'diajukan') {
    return validationError(c, 'Hanya pengajuan draft/diajukan yang bisa diedit');
  }

  const { data, error } = await supabase
    .from('pengajuan_barang_non_rutin')
    .update({
      nama_pengaju: body.nama_pengaju,
      jabatan: body.jabatan,
      lokasi_kerja: body.lokasi_kerja,
      catatan: body.catatan,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return validationError(c, error.message);

  if (body.items) {
    await supabase.from('pengajuan_barang_non_rutin_item').delete().eq('id_pengajuan', id);
    await supabase.from('pengajuan_barang_non_rutin_item').insert(
      body.items.map((it: any) => ({
        id_pengajuan: id, nama_barang: it.nama_barang, spesifikasi: it.spesifikasi || '',
        jumlah: it.jumlah || 1, satuan: it.satuan || 'pcs', keterangan: it.keterangan || '',
      }))
    );
  }

  return success(c, data, 'Pengajuan berhasil diupdate');
});

app.post('/:id/proses', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase
    .from('pengajuan_barang_non_rutin')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Pengajuan tidak ditemukan');
  if (existing.status !== 'diajukan') return validationError(c, 'Status harus diajukan');

  const { data, error } = await supabase
    .from('pengajuan_barang_non_rutin')
    .update({ status: 'diproses_ga', processed_by: user.id, processed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return validationError(c, error.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.ATK, nama_tabel: 'pengajuan_barang_non_rutin', id_record: id, deskripsi: `Pengajuan ${existing.nomor_pengajuan} diproses GA` });
  return success(c, data, 'Pengajuan diproses');
});

app.post('/:id/setujui', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase
    .from('pengajuan_barang_non_rutin')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Pengajuan tidak ditemukan');
  if (existing.status !== 'diproses_ga') return validationError(c, 'Status harus diproses GA');

  const { data, error } = await supabase
    .from('pengajuan_barang_non_rutin')
    .update({ status: 'disetujui_spv', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return validationError(c, error.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.APPROVE, modul: MODUL.ATK, nama_tabel: 'pengajuan_barang_non_rutin', id_record: id, deskripsi: `Pengajuan ${existing.nomor_pengajuan} disetujui SPV` });
  return success(c, data, 'Pengajuan disetujui SPV');
});

app.post('/:id/tolak', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase
    .from('pengajuan_barang_non_rutin')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Pengajuan tidak ditemukan');
  if (!['diajukan', 'diproses_ga'].includes(existing.status)) return validationError(c, 'Tidak bisa ditolak');

  const { data, error } = await supabase
    .from('pengajuan_barang_non_rutin')
    .update({ status: 'ditolak', rejected_by: user.id, rejected_at: new Date().toISOString(), alasan_tolak: body.alasan || '' })
    .eq('id', id)
    .select()
    .single();

  if (error) return validationError(c, error.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.REJECT, modul: MODUL.ATK, nama_tabel: 'pengajuan_barang_non_rutin', id_record: id, deskripsi: `Pengajuan ${existing.nomor_pengajuan} ditolak` });
  return success(c, data, 'Pengajuan ditolak');
});

app.post('/:id/ajukan-finance', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase
    .from('pengajuan_barang_non_rutin')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Pengajuan tidak ditemukan');
  if (existing.status !== 'disetujui_spv') return validationError(c, 'Status harus disetujui SPV');

  const { data, error } = await supabase
    .from('pengajuan_barang_non_rutin')
    .update({ status: 'diajukan_ke_finance' })
    .eq('id', id)
    .select()
    .single();

  if (error) return validationError(c, error.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.ATK, nama_tabel: 'pengajuan_barang_non_rutin', id_record: id, deskripsi: `Pengajuan ${existing.nomor_pengajuan} diajukan ke Finance` });
  return success(c, data, 'Diajukan ke Finance');
});

export default app;
