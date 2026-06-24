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
    .from('maintenance_preventive')
    .select('*, asset!inner(nama, kode_asset), cabang!inner(nama), jenis_maintenance(nama)', { count: 'exact' });

  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));
  if (c.req.query('id_asset')) query = query.eq('id_asset', c.req.query('id_asset'));
  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));
  if (c.req.query('tanggal_mulai')) query = query.gte('tanggal_rencana', c.req.query('tanggal_mulai'));
  if (c.req.query('tanggal_selesai')) query = query.lte('tanggal_rencana', c.req.query('tanggal_selesai'));

  query = query.order('tanggal_rencana', { ascending: true });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return validationError(c, err.message);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

app.post('/', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.id_asset || !body.id_cabang || !body.tanggal_rencana || !body.id_jenis_maintenance) {
    return validationError(c, 'Asset, cabang, tanggal rencana, dan jenis maintenance harus diisi');
  }

  const { data, error: err } = await supabase
    .from('maintenance_preventive')
    .insert({
      id_asset: body.id_asset,
      id_cabang: body.id_cabang,
      id_jenis_maintenance: body.id_jenis_maintenance,
      deskripsi: body.deskripsi,
      tanggal_rencana: body.tanggal_rencana,
      frekuensi: body.frekuensi || 'bulanan',
      status: 'dijadwalkan',
      catatan: body.catatan,
      created_by: user.id,
    })
    .select('*, asset(nama, kode_asset), cabang(nama)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.MAINTENANCE, nama_tabel: 'maintenance_preventive', id_record: data.id, data_baru: data, deskripsi: `Preventive maintenance untuk ${body.id_asset} dijadwalkan` });
  return created(c, data, 'Jadwal preventive berhasil dibuat');
});

app.patch('/:id/selesai', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan, biaya } = await c.req.json();

  const { data: existing } = await supabase
    .from('maintenance_preventive')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Jadwal preventive tidak ditemukan');

  const { data, error: err } = await supabase
    .from('maintenance_preventive')
    .update({
      status: 'selesai',
      tanggal_selesai: new Date().toISOString(),
      catatan_teknisi: catatan,
      biaya: biaya,
      completed_by: user.id,
    })
    .eq('id', id)
    .select('*, asset(nama, kode_asset)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.MAINTENANCE, nama_tabel: 'maintenance_preventive', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Preventive maintenance selesai` });
  return success(c, data, 'Preventive maintenance selesai');
});

export default app;
