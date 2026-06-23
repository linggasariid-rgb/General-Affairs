import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { ASSET_STATUS } from '../../../config/constants';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';
import type { AssetPayload } from '../../../types';

const asset = new Hono<AppEnv>();

asset.use('*', authMiddleware);

// GET /asset - List semua asset
asset.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const roleCode = c.get('roleCode');
  const { page = '1', perPage = '10', search, status, id_cabang, id_kategori, sortBy = 'created_at', sortOrder = 'desc' } = c.req.query();

  let query = supabase
    .from('asset')
    .select('*, kategori_asset!inner(*), cabang!inner(*), lokasi_asset(*)', { count: 'exact' });

  // Filter by cabang for KCB/PCB
  if (['KCB', 'PCB'].includes(roleCode) && user.id_cabang) {
    query = query.eq('id_cabang', user.id_cabang);
  }

  // Filter by gudang for KGD/PGD
  if (['KGD', 'PGD'].includes(roleCode) && user.id_gudang) {
    query = query.eq('id_gudang', user.id_gudang);
  }

  if (status) query = query.eq('status', status);
  if (id_cabang) query = query.eq('id_cabang', id_cabang);
  if (id_kategori) query = query.eq('id_kategori', id_kategori);
  if (search) {
    query = query.or(`nama.ilike.%${search}%,kode_asset.ilike.%${search}%,nomor_seri.ilike.%${search}%`);
  }

  query = query.is('deleted_at', null);
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
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

// GET /asset/:id - Detail asset
asset.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from('asset')
    .select('*, kategori_asset(*), cabang(*), gudang(*), lokasi_asset(*), vendor(*), asset_foto(*), created_by(*), updated_by(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !data) return notFound(c, 'Asset tidak ditemukan');

  return success(c, data);
});

// POST /asset - Create asset
asset.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body: AssetPayload = await c.req.json();

  if (!body.nama || !body.id_kategori || !body.id_cabang) {
    return validationError(c, 'Nama, kategori, dan cabang harus diisi');
  }

  // Generate kode asset
  const { data: cabang } = await supabase
    .from('cabang')
    .select('kode')
    .eq('id', body.id_cabang)
    .single();

  if (!cabang) return validationError(c, 'Cabang tidak valid');

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('asset')
    .select('*', { count: 'exact', head: true })
    .like('kode_asset', `AST-${cabang.kode}-${tahun}-%`);

  const urutan = (count || 0) + 1;
  const kodeAsset = `AST-${cabang.kode}-${tahun}-${String(urutan).padStart(5, '0')}`;

  const { data, error: insertError } = await supabase
    .from('asset')
    .insert({
      kode_asset: kodeAsset,
      nama: body.nama,
      id_kategori: body.id_kategori,
      id_lokasi: body.id_lokasi,
      id_cabang: body.id_cabang,
      id_gudang: body.id_gudang,
      id_vendor: body.id_vendor,
      merek: body.merek,
      model: body.model,
      nomor_seri: body.nomor_seri,
      tahun_perolehan: body.tahun_perolehan,
      tanggal_perolehan: body.tanggal_perolehan,
      harga_perolehan: body.harga_perolehan,
      nilai_residu: body.nilai_residu || 0,
      masa_manfaat: body.masa_manfaat,
      spesifikasi: body.spesifikasi,
      keterangan: body.keterangan,
      status: ASSET_STATUS.DRAFT,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (insertError) return validationError(c, insertError.message);

  // Audit log
  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.INSERT,
    modul: MODUL.ASSET,
    nama_tabel: 'asset',
    id_record: data.id,
    data_baru: data,
    deskripsi: `Registrasi asset baru: ${kodeAsset} - ${body.nama}`,
  });

  return created(c, data, `Asset ${kodeAsset} berhasil dibuat`);
});

// PUT /asset/:id - Update asset
asset.put('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase
    .from('asset')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Asset tidak ditemukan');

  const { data, error: updateError } = await supabase
    .from('asset')
    .update({ ...body, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) return validationError(c, updateError.message);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.UPDATE,
    modul: MODUL.ASSET,
    nama_tabel: 'asset',
    id_record: id,
    data_lama: existing,
    data_baru: data,
    deskripsi: `Update asset: ${existing.kode_asset}`,
  });

  return success(c, data, 'Asset berhasil diupdate');
});

// DELETE /asset/:id - Soft delete
asset.delete('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase
    .from('asset')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Asset tidak ditemukan');

  const { error } = await supabase
    .from('asset')
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id);

  if (error) return validationError(c, error.message);

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.DELETE,
    modul: MODUL.ASSET,
    nama_tabel: 'asset',
    id_record: id,
    data_lama: existing,
    deskripsi: `Hapus asset: ${existing.kode_asset}`,
  });

  return success(c, null, 'Asset berhasil dihapus');
});

// POST /asset/:id/generate-qr
asset.post('/:id/generate-qr', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: asset } = await supabase
    .from('asset')
    .select('*')
    .eq('id', id)
    .single();

  if (!asset) return notFound(c, 'Asset tidak ditemukan');

  const qrData = JSON.stringify({
    kode: asset.kode_asset,
    nama: asset.nama,
    id: asset.id,
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

  await supabase
    .from('asset')
    .update({ qr_code_url: qrUrl })
    .eq('id', id);

  return success(c, { qr_code_url: qrUrl }, 'QR Code berhasil digenerate');
});

// GET /asset/:id/history
asset.get('/:id/history', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const { page = '1', perPage = '20' } = c.req.query();

  const { data, error, count } = await supabase
    .from('asset_history')
    .select('*, users!inner(nama, email)', { count: 'exact' })
    .eq('id_asset', id)
    .order('created_at', { ascending: false })
    .range((Number(page) - 1) * Number(perPage), Number(page) * Number(perPage) - 1);

  if (error) return c.json({ success: false, error: error.message }, 500);

  return success(c, data, undefined, {
    page: Number(page),
    perPage: Number(perPage),
    total: count || 0,
    totalPages: Math.ceil((count || 0) / Number(perPage)),
  });
});

export default asset;
