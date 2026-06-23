import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorMutasi } from '../../../utils/generator';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';
import type { MutasiPayload } from '../../../types';

const mutasi = new Hono<AppEnv>();

mutasi.use('*', authMiddleware);

// GET /asset/mutasi - List mutasi
mutasi.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const roleCode = c.get('roleCode');
  const { page = '1', perPage = '10', status } = c.req.query();

  let query = supabase
    .from('asset_mutasi')
    .select('*, asset!inner(kode_asset, nama), cabang_asal:cabang!id_cabang_asal(*), cabang_tujuan:cabang!id_cabang_tujuan(*), creator:users!created_by(nama)', { count: 'exact' });

  if (['KCB', 'PCB'].includes(roleCode) && user.id_cabang) {
    query = query.or(`id_cabang_asal.eq.${user.id_cabang},id_cabang_tujuan.eq.${user.id_cabang}`);
  }

  if (status) query = query.eq('status', status);

  query = query.order('created_at', { ascending: false });
  query = query.range((Number(page) - 1) * Number(perPage), Number(page) * Number(perPage) - 1);

  const { data, error, count } = await query;
  if (error) return c.json({ success: false, error: error.message }, 500);

  return success(c, data, undefined, {
    page: Number(page),
    perPage: Number(perPage),
    total: count || 0,
    totalPages: Math.ceil((count || 0) / Number(perPage)),
  });
});

// POST /asset/mutasi - Ajukan mutasi
mutasi.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body: MutasiPayload = await c.req.json();

  if (!body.id_asset || !body.alasan || !body.tipe) {
    return validationError(c, 'Asset, tipe mutasi, dan alasan harus diisi');
  }

  if (body.tipe === 'cabang' && !body.id_cabang_tujuan) {
    return validationError(c, 'Cabang tujuan harus diisi');
  }

  if (body.tipe === 'gudang' && !body.id_gudang_tujuan) {
    return validationError(c, 'Gudang tujuan harus diisi');
  }

  const { data: asset } = await supabase
    .from('asset')
    .select('*')
    .eq('id', body.id_asset)
    .single();

  if (!asset) return notFound(c, 'Asset tidak ditemukan');
  if (asset.status !== 'aktif') return validationError(c, 'Hanya asset aktif yang bisa dimutasi');

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('asset_mutasi')
    .select('*', { count: 'exact', head: true })
    .like('nomor_mutasi', `MTS-${tahun}-%`);

  const nomorMutasi = generateNomorMutasi(tahun, (count || 0) + 1);

  const mutasiData: any = {
    nomor_mutasi: nomorMutasi,
    id_asset: body.id_asset,
    tipe: body.tipe,
    alasan: body.alasan,
    tanggal_mutasi: body.tanggal_mutasi || new Date().toISOString().split('T')[0],
    status: 'diajukan',
    created_by: user.id,
  };

  if (asset.id_cabang) mutasiData.id_cabang_asal = asset.id_cabang;
  if (asset.id_gudang) mutasiData.id_gudang_asal = asset.id_gudang;
  if (body.id_cabang_tujuan) mutasiData.id_cabang_tujuan = body.id_cabang_tujuan;
  if (body.id_gudang_tujuan) mutasiData.id_gudang_tujuan = body.id_gudang_tujuan;

  const { data, error } = await supabase
    .from('asset_mutasi')
    .insert(mutasiData)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  // Create history
  await supabase.from('asset_history').insert({
    id_asset: body.id_asset,
    tipe_event: 'mutasi',
    deskripsi: `Mutasi ${body.tipe} diajukan: ${nomorMutasi}`,
    data_detail: mutasiData,
    user_id: user.id,
  });

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.MUTASI,
    modul: MODUL.ASSET,
    nama_tabel: 'asset_mutasi',
    id_record: data.id,
    data_baru: data,
    deskripsi: `Mutasi ${body.tipe} asset ${asset.kode_asset}`,
  });

  return created(c, data, `Mutasi ${nomorMutasi} berhasil diajukan`);
});

// PUT /asset/mutasi/:id/approve
mutasi.put('/:id/approve', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: mutasi } = await supabase
    .from('asset_mutasi')
    .select('*, asset(*)')
    .eq('id', id)
    .single();

  if (!mutasi) return notFound(c, 'Mutasi tidak ditemukan');
  if (mutasi.status !== 'diajukan') return validationError(c, 'Mutasi sudah diproses');

  const updateData: any = {
    status: 'disetujui',
    approved_by: user.id,
    approved_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('asset_mutasi')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.APPROVE,
    modul: MODUL.ASSET,
    nama_tabel: 'asset_mutasi',
    id_record: id,
    deskripsi: `Mutasi ${mutasi.nomor_mutasi} disetujui`,
  });

  return success(c, data, 'Mutasi berhasil disetujui');
});

// PUT /asset/mutasi/:id/reject
mutasi.put('/:id/reject', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan } = await c.req.json();

  const { data: mutasi } = await supabase
    .from('asset_mutasi')
    .select('*')
    .eq('id', id)
    .single();

  if (!mutasi) return notFound(c, 'Mutasi tidak ditemukan');

  const { data, error } = await supabase
    .from('asset_mutasi')
    .update({
      status: 'ditolak',
      catatan_pengirim: catatan,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.REJECT,
    modul: MODUL.ASSET,
    nama_tabel: 'asset_mutasi',
    id_record: id,
    deskripsi: `Mutasi ${mutasi.nomor_mutasi} ditolak`,
  });

  return success(c, data, 'Mutasi ditolak');
});

// PUT /asset/mutasi/:id/terima - Konfirmasi penerimaan
mutasi.put('/:id/terima', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan } = await c.req.json();

  const { data: mutasiData } = await supabase
    .from('asset_mutasi')
    .select('*')
    .eq('id', id)
    .single();

  if (!mutasiData) return notFound(c, 'Mutasi tidak ditemukan');

  // Update mutasi status
  await supabase
    .from('asset_mutasi')
    .update({
      status: 'selesai',
      catatan_penerima: catatan,
      diterima_oleh: user.id,
      diterima_at: new Date().toISOString(),
    })
    .eq('id', id);

  // Update asset location
  const updateAsset: any = {};
  if (mutasiData.id_cabang_tujuan) updateAsset.id_cabang = mutasiData.id_cabang_tujuan;
  if (mutasiData.id_gudang_tujuan) updateAsset.id_gudang = mutasiData.id_gudang_tujuan;
  if (mutasiData.id_lokasi_tujuan) updateAsset.id_lokasi = mutasiData.id_lokasi_tujuan;

  await supabase
    .from('asset')
    .update(updateAsset)
    .eq('id', mutasiData.id_asset);

  return success(c, null, 'Penerimaan asset berhasil dikonfirmasi');
});

export default mutasi;
