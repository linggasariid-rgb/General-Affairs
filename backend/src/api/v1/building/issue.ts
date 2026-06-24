import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { generateNomorIssue } from '../../../utils/generator';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('building_issue')
    .select('*, cabang!inner(nama), pelapor:users!created_by(nama), pic:users!id_pic(nama)', { count: 'exact' });

  if (c.req.query('status')) query = query.eq('status', c.req.query('status'));
  if (c.req.query('prioritas')) query = query.eq('prioritas', c.req.query('prioritas'));
  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));

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
  const body = await c.req.json();

  if (!body.judul || !body.deskripsi || !body.id_cabang) {
    return validationError(c, 'Judul, deskripsi, dan cabang harus diisi');
  }


  const tahun = new Date().getFullYear();
  const { count } = await supabase
    .from('building_issue')
    .select('*', { count: 'exact', head: true })
    .like('nomor_issue', `ISS-${tahun}-%`);

  const nomorIssue = generateNomorIssue(tahun, (count || 0) + 1);

  const { data, error: err } = await supabase
    .from('building_issue')
    .insert({
      nomor_issue: nomorIssue,
      judul: body.judul,
      deskripsi: body.deskripsi,
      id_cabang: body.id_cabang,
      id_lokasi: body.id_lokasi,
      prioritas: body.prioritas || 'medium',
      kategori: body.kategori || 'umum',
      status: 'dilaporkan',
      created_by: user.id,
    })
    .select('*, cabang(nama)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.BUILDING, nama_tabel: 'building_issue', id_record: data.id, data_baru: data, deskripsi: `Issue ${nomorIssue}: ${body.judul}` });
  return created(c, data, `Issue ${nomorIssue} berhasil dilaporkan`);
});

app.patch('/:id/assign', requireRole(['SA', 'HGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { id_pic, catatan } = await c.req.json();

  if (!id_pic) return validationError(c, 'PIC harus diisi');

  const { data: existing } = await supabase.from('building_issue').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Issue tidak ditemukan');

  const { data, error: err } = await supabase
    .from('building_issue')
    .update({ id_pic: id_pic, status: 'ditugaskan', catatan_assign: catatan, assigned_by: user.id, assigned_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, cabang(nama), pic:users!id_pic(nama)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.BUILDING, nama_tabel: 'building_issue', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Issue ${existing.nomor_issue} diassign ke PIC` });
  return success(c, data, 'Issue berhasil diassign');
});

app.patch('/:id/selesai', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { id } = c.req.param();
  const { catatan, foto_url } = await c.req.json();

  const { data: existing } = await supabase.from('building_issue').select('*').eq('id', id).single();
  if (!existing) return notFound(c, 'Issue tidak ditemukan');

  const { data, error: err } = await supabase
    .from('building_issue')
    .update({ status: 'selesai', catatan_selesai: catatan, foto_selesai_url: foto_url, completed_by: user.id, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, cabang(nama)')
    .single();

  if (err) return validationError(c, err.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.BUILDING, nama_tabel: 'building_issue', id_record: id, data_lama: existing, data_baru: data, deskripsi: `Issue ${existing.nomor_issue} selesai` });
  return success(c, data, 'Issue selesai');
});

export default app;
