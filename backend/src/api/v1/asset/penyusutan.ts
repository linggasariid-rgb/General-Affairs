import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('asset_penyusutan')
    .select('*, asset!inner(kode_asset, nama, harga_perolehan, masa_manfaat)', { count: 'exact' });

  const idAsset = c.req.query('id_asset');
  if (idAsset) query = query.eq('id_asset', idAsset);
  const bulan = c.req.query('bulan');
  if (bulan) query = query.eq('bulan', bulan);
  const tahun = c.req.query('tahun');
  if (tahun) query = query.eq('tahun', parseInt(tahun));

  query = query.order('tahun', { ascending: false });
  query = query.order('bulan', { ascending: false });
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
    .from('asset_penyusutan')
    .select('*, asset(*, kategori_asset(*))')
    .eq('id', id)
    .single();

  if (err || !data) return notFound(c, 'Penyusutan tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  const bulan = body.bulan || new Date().getMonth() + 1;
  const tahun = body.tahun || new Date().getFullYear();

  const { data: assets, error: assetErr } = await supabase
    .from('asset')
    .select('id, kode_asset, nama, harga_perolehan, nilai_residu, masa_manfaat, tgl_penyusutan_terakhir')
    .eq('status', 'aktif')
    .is('deleted_at', null);

  if (assetErr) return validationError(c, assetErr.message);

  const penyusutanEntries = [];
  for (const asset of assets) {
    const hargaPerolehan = Number(asset.harga_perolehan) || 0;
    const nilaiResidu = Number(asset.nilai_residu) || 0;
    const masaManfaat = Number(asset.masa_manfaat) || 5;
    const penyusutanBulanan = masaManfaat > 0 ? (hargaPerolehan - nilaiResidu) / (masaManfaat * 12) : 0;

    penyusutanEntries.push({
      id_asset: asset.id,
      bulan,
      tahun,
      harga_perolehan: hargaPerolehan,
      nilai_residu: nilaiResidu,
      masa_manfaat: masaManfaat,
      nilai_penyusutan: Math.round(penyusutanBulanan),
      akumulasi_penyusutan: Math.round(penyusutanBulanan),
      created_by: user.id,
    });
  }

  if (penyusutanEntries.length === 0) {
    return validationError(c, 'Tidak ada asset aktif untuk dihitung penyusutan');
  }

  const { data, error: err } = await supabase
    .from('asset_penyusutan')
    .insert(penyusutanEntries)
    .select('*');

  if (err) return validationError(c, err.message);

  await supabase
    .from('asset')
    .update({ tgl_penyusutan_terakhir: new Date().toISOString() })
    .eq('status', 'aktif')
    .is('deleted_at', null);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.ASSET, nama_tabel: 'asset_penyusutan', deskripsi: `Penyusutan bulk ${bulan}/${tahun} untuk ${penyusutanEntries.length} asset` });
  return created(c, data, `Penyusutan ${bulan}/${tahun} untuk ${penyusutanEntries.length} asset berhasil`);
});

export default app;
