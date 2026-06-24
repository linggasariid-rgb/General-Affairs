import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorOpname } from '../../../utils/generator';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('stock_opname')
    .select('*, cabang!inner(nama), creator:users!created_by(nama)', { count: 'exact' });

  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));
  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));

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
    .from('stock_opname')
    .select('*, cabang(*), gudang(*), creator:users!created_by(*), stock_opname_item(*, asset(nama, kode_asset))')
    .eq('id', id)
    .single();

  if (err || !data) return notFound(c, 'Stock opname tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.id_cabang) return validationError(c, 'Cabang harus diisi');

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('stock_opname')
    .select('*', { count: 'exact', head: true })
    .like('nomor_opname', `STO-${tahun}-%`);

  const nomorOpname = generateNomorOpname(tahun, (count || 0) + 1);

  const { data, error: err } = await supabase
    .from('stock_opname')
    .insert({
      nomor_opname: nomorOpname,
      id_cabang: body.id_cabang,
      id_gudang: body.id_gudang || null,
      tanggal: body.tanggal || new Date().toISOString().split('T')[0],
      status: 'berlangsung',
      catatan: body.catatan,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.ASSET, nama_tabel: 'stock_opname', id_record: data.id, data_baru: data, deskripsi: `Stock opname ${nomorOpname} dibuat` });
  return created(c, data, `Stock opname ${nomorOpname} berhasil dibuat`);
});

app.post('/:id/items', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: opname } = await supabase.from('stock_opname').select('*').eq('id', id).single();
  if (!opname) return notFound(c, 'Stock opname tidak ditemukan');
  if (opname.status === 'selesai') return validationError(c, 'Stock opname sudah selesai');

  if (!body.id_asset || body.jumlah_fisik === undefined) {
    return validationError(c, 'Asset dan jumlah fisik harus diisi');
  }

  const { data, error: err } = await supabase
    .from('stock_opname_item')
    .insert({
      id_opname: id,
      id_asset: body.id_asset,
      jumlah_sistem: body.jumlah_sistem || 0,
      jumlah_fisik: body.jumlah_fisik,
      selisih: (body.jumlah_fisik || 0) - (body.jumlah_sistem || 0),
      catatan: body.catatan,
      kondisi: body.kondisi,
    })
    .select('*, asset(nama, kode_asset)')
    .single();

  if (err) return validationError(c, err.message);
  return created(c, data, 'Item opname berhasil ditambahkan');
});

app.patch('/:id/selesai', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('stock_opname').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Stock opname tidak ditemukan');
  if (existing.status === 'selesai') return validationError(c, 'Stock opname sudah selesai');

  const { data, error: err } = await supabase
    .from('stock_opname')
    .update({ status: 'selesai', completed_by: user.id, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.ASSET, nama_tabel: 'stock_opname', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Stock opname ${existing.nomor_opname} selesai` });
  return success(c, data, 'Stock opname selesai');
});

export default app;
