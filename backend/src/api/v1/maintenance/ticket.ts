import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorTicket } from '../../../utils/generator';
import { SLA_HOURS, AUDIT_ACTION, MODUL, MAINTENANCE_STATUS } from '../../../config/constants';
import type { TicketPayload } from '../../../types';

const ticket = new Hono<AppEnv>();

ticket.use('*', authMiddleware);

// GET - List tickets
ticket.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const roleCode = c.get('roleCode');
  const { page = '1', perPage = '10', status, prioritas, id_cabang } = c.req.query();

  let query = supabase
    .from('maintenance_ticket')
    .select('*, cabang!inner(nama), asset(nama, kode_asset), jenis_maintenance(nama), teknisi:users!id_teknisi(nama), vendor(nama)', { count: 'exact' });

  if (['KCB', 'PCB'].includes(roleCode) && user.id_cabang) {
    query = query.eq('id_cabang', user.id_cabang);
  }
  if (status) query = query.eq('status', status);
  if (prioritas) query = query.eq('prioritas', prioritas);
  if (id_cabang) query = query.eq('id_cabang', id_cabang);

  query = query.order('created_at', { ascending: false });
  query = query.range((Number(page) - 1) * Number(perPage), Number(page) * Number(perPage) - 1);

  const { data, error, count } = await query;
  if (error) return c.json({ success: false, error: error.message }, 500);

  return success(c, data, undefined, {
    page: Number(page), perPage: Number(perPage),
    total: count || 0, totalPages: Math.ceil((count || 0) / Number(perPage)),
  });
});

// GET /:id - Detail ticket
ticket.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from('maintenance_ticket')
    .select('*, cabang(*), asset(*), jenis_maintenance(*), teknisi:users!id_teknisi(*), vendor(*), maintenance_foto(*), maintenance_tracking(*)')
    .eq('id', id)
    .single();

  if (error || !data) return notFound(c, 'Ticket tidak ditemukan');
  return success(c, data);
});

// POST - Buat ticket
ticket.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body: TicketPayload = await c.req.json();

  if (!body.judul || !body.deskripsi || !body.id_cabang || !body.prioritas) {
    return validationError(c, 'Judul, deskripsi, cabang, dan prioritas harus diisi');
  }

  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('maintenance_ticket')
    .select('*', { count: 'exact', head: true })
    .like('nomor_ticket', `TKT-${tahun}-%`);

  const nomorTicket = generateNomorTicket(tahun, (count || 0) + 1);

  // Calculate SLA deadline
  const slaHours = SLA_HOURS[body.prioritas] || 48;
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('maintenance_ticket')
    .insert({
      nomor_ticket: nomorTicket,
      judul: body.judul,
      deskripsi: body.deskripsi,
      id_asset: body.id_asset,
      id_kendaraan: body.id_kendaraan,
      id_jenis_maintenance: body.id_jenis_maintenance,
      id_cabang: body.id_cabang,
      id_lokasi: body.id_lokasi,
      prioritas: body.prioritas,
      status: MAINTENANCE_STATUS.DIBUAT,
      tipe: body.tipe || 'corrective',
      sla_deadline: slaDeadline,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  // Create tracking entry
  await supabase.from('maintenance_tracking').insert({
    id_ticket: data.id,
    status_dari: null,
    status_ke: MAINTENANCE_STATUS.DIBUAT,
    keterangan: 'Ticket dibuat',
    user_id: user.id,
  });

  // Asset history if asset linked
  if (body.id_asset) {
    await supabase.from('asset_history').insert({
      id_asset: body.id_asset,
      tipe_event: 'maintenance',
      deskripsi: `Ticket ${nomorTicket} dibuat: ${body.judul}`,
      user_id: user.id,
    });
  }

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.INSERT,
    modul: MODUL.MAINTENANCE,
    nama_tabel: 'maintenance_ticket',
    id_record: data.id,
    data_baru: data,
    deskripsi: `Ticket ${nomorTicket} dibuat`,
  });

  return created(c, data, `Ticket ${nomorTicket} berhasil dibuat`);
});

// PUT /:id/approve
ticket.put('/:id/approve', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase
    .from('maintenance_ticket')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Ticket tidak ditemukan');
  if (existing.status !== MAINTENANCE_STATUS.DIBUAT) return validationError(c, 'Status ticket tidak valid');

  const { data, error } = await supabase
    .from('maintenance_ticket')
    .update({ status: MAINTENANCE_STATUS.DISETUJUI, approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  await supabase.from('maintenance_tracking').insert({
    id_ticket: id, status_dari: existing.status, status_ke: MAINTENANCE_STATUS.DISETUJUI,
    keterangan: 'Ticket disetujui', user_id: user.id,
  });

  logAudit(c, { tipe_aksi: AUDIT_ACTION.APPROVE, modul: MODUL.MAINTENANCE, nama_tabel: 'maintenance_ticket', id_record: id, deskripsi: `Ticket ${existing.nomor_ticket} disetujui` });
  return success(c, data, 'Ticket disetujui');
});

// PUT /:id/assign
ticket.put('/:id/assign', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { id_teknisi, id_vendor, catatan } = await c.req.json();

  if (!id_teknisi && !id_vendor) {
    return validationError(c, 'Pilih teknisi atau vendor');
  }

  const { data: existing } = await supabase
    .from('maintenance_ticket')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Ticket tidak ditemukan');

  const update: any = { status: MAINTENANCE_STATUS.DITUGASKAN };
  if (id_teknisi) update.id_teknisi = id_teknisi;
  if (id_vendor) update.id_vendor = id_vendor;

  const { data, error } = await supabase
    .from('maintenance_ticket')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  await supabase.from('maintenance_tracking').insert({
    id_ticket: id, status_dari: existing.status, status_ke: MAINTENANCE_STATUS.DITUGASKAN,
    keterangan: catatan || 'Ditugaskan ke teknisi/vendor', user_id: user.id,
  });

  return success(c, data, 'Ticket berhasil di-assign');
});

// PUT /:id/start - Mulai kerjakan
ticket.put('/:id/start', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data, error } = await supabase
    .from('maintenance_ticket')
    .update({ status: MAINTENANCE_STATUS.DIKERJAKAN, tanggal_mulai: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  await supabase.from('maintenance_tracking').insert({
    id_ticket: id, status_dari: MAINTENANCE_STATUS.DITUGASKAN, status_ke: MAINTENANCE_STATUS.DIKERJAKAN,
    keterangan: 'Pengerjaan dimulai', user_id: user.id,
  });

  return success(c, data, 'Pengerjaan dimulai');
});

// PUT /:id/complete - Selesai dikerjakan
ticket.put('/:id/complete', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { biaya, catatan, foto_hasil_url } = await c.req.json();

  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from('maintenance_ticket')
    .select('*')
    .eq('id', id)
    .single();

  const slaTerpenuhi = existing?.sla_deadline ? new Date(now) <= new Date(existing.sla_deadline) : true;

  const { data, error } = await supabase
    .from('maintenance_ticket')
    .update({
      status: MAINTENANCE_STATUS.SELESAI,
      tanggal_selesai: now,
      biaya: biaya,
      catatan_teknisi: catatan,
      foto_hasil_url: foto_hasil_url,
      sla_terpenuhi: slaTerpenuhi,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  await supabase.from('maintenance_tracking').insert({
    id_ticket: id, status_dari: MAINTENANCE_STATUS.DIKERJAKAN, status_ke: MAINTENANCE_STATUS.SELESAI,
    keterangan: catatan || 'Perbaikan selesai', user_id: user.id,
  });

  return success(c, data, 'Perbaikan selesai');
});

// PUT /:id/verify - Verifikasi
ticket.put('/:id/verify', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan, status_verifikasi } = await c.req.json();

  const newStatus = status_verifikasi === 'diterima' ? MAINTENANCE_STATUS.DIVERIFIKASI : MAINTENANCE_STATUS.DIKERJAKAN;

  const { data, error } = await supabase
    .from('maintenance_ticket')
    .update({
      status: newStatus,
      catatan_verifikasi: catatan,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  await supabase.from('maintenance_tracking').insert({
    id_ticket: id, status_dari: MAINTENANCE_STATUS.SELESAI, status_ke: newStatus,
    keterangan: catatan || (status_verifikasi === 'diterima' ? 'Verifikasi OK' : 'Verifikasi ditolak, perlu perbaikan ulang'),
    user_id: user.id,
  });

  return success(c, data, status_verifikasi === 'diterima' ? 'Perbaikan diverifikasi' : 'Perbaikan ditolak');
});

// PUT /:id/close - Tutup ticket
ticket.put('/:id/close', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();

  const { data: existing } = await supabase
    .from('maintenance_ticket')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) return notFound(c, 'Ticket tidak ditemukan');

  const { data, error } = await supabase
    .from('maintenance_ticket')
    .update({ status: MAINTENANCE_STATUS.CLOSED, closed_by: user.id, closed_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return validationError(c, error.message);

  await supabase.from('maintenance_tracking').insert({
    id_ticket: id, status_dari: existing.status, status_ke: MAINTENANCE_STATUS.CLOSED,
    keterangan: 'Ticket ditutup', user_id: user.id,
  });

  // Update asset status back to aktif if it was in perbaikan
  if (existing.id_asset) {
    await supabase.from('asset').update({ status: 'aktif' }).eq('id', existing.id_asset);
    await supabase.from('asset_history').insert({
      id_asset: existing.id_asset, tipe_event: 'status_change',
      deskripsi: `Status kembali ke Aktif setelah ticket ${existing.nomor_ticket} closed`,
      user_id: user.id,
    });
  }

  return success(c, data, 'Ticket ditutup');
});

export default ticket;
