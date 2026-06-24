import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorBooking } from '../../../utils/generator';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';
import type { VehicleBookingPayload } from '../../../types';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const roleCode = c.get('roleCode');
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('vehicle_booking')
    .select('*, kendaraan!inner(nomor_plat, merek, model), cabang!inner(nama), peminjam:users!created_by(nama)', { count: 'exact' });

  if (['KCB', 'PCB'].includes(roleCode) && user.id_cabang) {
    query = query.eq('id_cabang', user.id_cabang);
  }
  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));
  if (c.req.query('id_kendaraan')) query = query.eq('id_kendaraan', c.req.query('id_kendaraan'));
  if (c.req.query('tanggal_mulai')) query = query.gte('tanggal_mulai', c.req.query('tanggal_mulai'));
  if (c.req.query('tanggal_selesai')) query = query.lte('tanggal_selesai', c.req.query('tanggal_selesai'));

  query = query.order('created_at', { ascending: false });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return validationError(c, err.message);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

app.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body: VehicleBookingPayload = await c.req.json();

  if (!body.id_kendaraan || !body.tujuan || !body.tanggal_mulai || !body.tanggal_selesai) {
    return validationError(c, 'Kendaraan, tujuan, tanggal mulai, dan tanggal selesai harus diisi');
  }

  const { data: kendaraan } = await supabase
    .from('kendaraan')
    .select('*, cabang!inner(id)')
    .eq('id', body.id_kendaraan)
    .single();

  if (!kendaraan) return notFound(c, 'Kendaraan tidak ditemukan');

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('vehicle_booking')
    .select('*', { count: 'exact', head: true })
    .like('nomor_booking', `BKG-${tahun}-%`);

  const nomorBooking = generateNomorBooking(tahun, (count || 0) + 1);

  const { data, error: err } = await supabase
    .from('vehicle_booking')
    .insert({
      nomor_booking: nomorBooking,
      id_kendaraan: body.id_kendaraan,
      id_cabang: kendaraan.id_cabang,
      tujuan: body.tujuan,
      lokasi_tujuan: body.lokasi_tujuan,
      tanggal_mulai: body.tanggal_mulai,
      tanggal_selesai: body.tanggal_selesai,
      keperluan: body.keperluan,
      jumlah_penumpang: body.jumlah_penumpang,
      driver: body.driver,
      status: 'diajukan',
      created_by: user.id,
    })
    .select('*, kendaraan(nomor_plat, merek, model)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.VEHICLE, nama_tabel: 'vehicle_booking', id_record: data.id, data_baru: data, deskripsi: `Booking ${nomorBooking} untuk ${kendaraan.nomor_plat}` });
  return created(c, data, `Booking ${nomorBooking} berhasil diajukan`);
});

app.patch('/:id/setujui', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('vehicle_booking').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Booking tidak ditemukan');
  if (existing.status !== 'diajukan') return validationError(c, 'Booking sudah diproses');

  const { data, error: err } = await supabase
    .from('vehicle_booking')
    .update({ status: 'disetujui', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, kendaraan(nomor_plat, merek, model)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.APPROVE, modul: MODUL.VEHICLE, nama_tabel: 'vehicle_booking', id_record: id, deskripsi: `Booking ${existing.nomor_booking} disetujui` });
  return success(c, data, 'Booking disetujui');
});

app.patch('/:id/tolak', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan } = await c.req.json();

  const { data: existing } = await supabase.from('vehicle_booking').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Booking tidak ditemukan');

  const { data, error: err } = await supabase
    .from('vehicle_booking')
    .update({ status: 'ditolak', catatan_penolakan: catatan, approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, kendaraan(nomor_plat, merek, model)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.REJECT, modul: MODUL.VEHICLE, nama_tabel: 'vehicle_booking', id_record: id, deskripsi: `Booking ${existing.nomor_booking} ditolak` });
  return success(c, data, 'Booking ditolak');
});

app.patch('/:id/selesai', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan, jarak_tempuh } = await c.req.json();

  const { data: existing } = await supabase.from('vehicle_booking').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Booking tidak ditemukan');

  const { data, error: err } = await supabase
    .from('vehicle_booking')
    .update({
      status: 'selesai',
      catatan_selesai: catatan,
      jarak_tempuh: jarak_tempuh,
      completed_by: user.id,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, kendaraan(nomor_plat, merek, model)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.VEHICLE, nama_tabel: 'vehicle_booking', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Booking ${existing.nomor_booking} selesai` });
  return success(c, data, 'Booking selesai');
});

export default app;
