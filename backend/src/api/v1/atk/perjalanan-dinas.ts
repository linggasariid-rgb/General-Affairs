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
    .from('spk_perjalanan_dinas')
    .select('*, creator:users!created_by(nama), etoll_peminjaman(nomor_kartu, status, tanggal_pinjam)', { count: 'exact' });

  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));

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
    .from('spk_perjalanan_dinas')
    .select('*, creator:users!created_by(*), etoll_peminjaman(*, etoll_pengeluaran(*))')
    .eq('id', id)
    .single();

  if (error || !data) return notFound(c, 'SPK tidak ditemukan');
  return success(c, data);
});

app.post('/', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.nomor_spk || !body.nama_pelaksana || !body.divisi || !body.tujuan || !body.tanggal_berangkat || !body.tanggal_kembali) {
    return validationError(c, 'Semua field SPK harus diisi');
  }

  const { data: spk, error: spkErr } = await supabase
    .from('spk_perjalanan_dinas')
    .insert({
      nomor_spk: body.nomor_spk,
      nama_pelaksana: body.nama_pelaksana,
      divisi: body.divisi,
      tujuan: body.tujuan,
      tanggal_berangkat: body.tanggal_berangkat,
      tanggal_kembali: body.tanggal_kembali,
      keterangan: body.keterangan || '',
      created_by: user.id,
    })
    .select()
    .single();

  if (spkErr) return validationError(c, spkErr.message);

  if (body.nomor_kartu && body.tanggal_pinjam) {
    const { error: pinjamErr } = await supabase.from('etoll_peminjaman').insert({
      id_spk: spk.id,
      nomor_kartu: body.nomor_kartu,
      tanggal_pinjam: body.tanggal_pinjam,
      created_by: user.id,
    });
    if (pinjamErr) return validationError(c, pinjamErr.message);
  }

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.ATK, nama_tabel: 'spk_perjalanan_dinas', id_record: spk.id, data_baru: spk, deskripsi: `SPK ${body.nomor_spk} - ${body.nama_pelaksana}` });
  return created(c, spk);
});

app.put('/:id', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing } = await supabase.from('spk_perjalanan_dinas').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'SPK tidak ditemukan');
  if (existing.status !== 'dipakai') return validationError(c, 'Hanya SPK aktif yang bisa diedit');

  const { data, error } = await supabase.from('spk_perjalanan_dinas').update({
    nomor_spk: body.nomor_spk, nama_pelaksana: body.nama_pelaksana, divisi: body.divisi,
    tujuan: body.tujuan, tanggal_berangkat: body.tanggal_berangkat, tanggal_kembali: body.tanggal_kembali,
    keterangan: body.keterangan,
  }).eq('id', id).select().single();

  if (error) return validationError(c, error.message);
  return success(c, data, 'SPK berhasil diupdate');
});

app.delete('/:id', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();

  const { data: existing } = await supabase.from('spk_perjalanan_dinas').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'SPK tidak ditemukan');
  if (existing.status !== 'dipakai') return validationError(c, 'Hanya SPK aktif yang bisa dihapus');

  const { error } = await supabase.from('spk_perjalanan_dinas').delete().eq('id', id);
  if (error) return validationError(c, error.message);
  return success(c, null, 'SPK berhasil dihapus');
});

app.post('/upload', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const env = c.env;
  const body = await c.req.json();

  const matches = body.file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches) return validationError(c, 'Format file tidak valid');

  const mimeType = matches[1];
  const base64Data = matches[2];
  const raw = atob(base64Data);
  const buffer = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buffer[i] = raw.charCodeAt(i);

  const ext = mimeType.split('/')[1] || 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;

  const bucket = 'bukti-pengeluaran';

  await fetch(`${env.SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: bucket, public: true, allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] }),
  });

  const uploadRes = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': mimeType },
    body: buffer,
  });

  if (!uploadRes.ok) return validationError(c, 'Gagal upload file');

  const url = `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
  return success(c, { url, filename });
});

app.post('/:id/kembali', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: spk } = await supabase.from('spk_perjalanan_dinas').select('*').eq('id', id).single();
  if (!spk) return notFound(c, 'SPK tidak ditemukan');

  const { data: peminjaman } = await supabase
    .from('etoll_peminjaman')
    .select('*')
    .eq('id_spk', id)
    .eq('status', 'dipinjam')
    .maybeSingle();

  if (peminjaman) {
    await supabase
      .from('etoll_peminjaman')
      .update({ status: 'dikembalikan', tanggal_kembali: body.tanggal_kembali || new Date().toISOString().split('T')[0] })
      .eq('id', peminjaman.id);

    if (body.pengeluaran?.length) {
      const pengeluaran = body.pengeluaran.map((p: any) => ({
        id_peminjaman: peminjaman.id,
        jenis: p.jenis,
        jumlah: p.jumlah,
        keterangan: p.keterangan || '',
        bukti: p.bukti || null,
      }));
      await supabase.from('etoll_pengeluaran').insert(pengeluaran);
    }
  }

  await supabase.from('spk_perjalanan_dinas').update({ status: 'selesai' }).eq('id', id);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.ATK, nama_tabel: 'spk_perjalanan_dinas', id_record: id, deskripsi: `SPK ${spk.nomor_spk} selesai` });
  return success(c, null, 'Pengembalian berhasil dicatat');
});

export default app;
