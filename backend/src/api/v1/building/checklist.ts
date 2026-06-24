import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { logAudit } from '../../../midlware/audit';
import { success, created, notFound, validationError } from '../../../utils/response';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/template', async (c) => {
  const supabase = getSupabase(c.env);
  const idCabang = c.req.query('id_cabang');
  const today = new Date().toISOString().split('T')[0];

  if (!idCabang) return validationError(c, 'id_cabang harus diisi');

  const { data, error: err } = await supabase
    .from('checklist_template')
    .select('*')
    .eq('aktif', true)
    .order('urutan', { ascending: true });

  if (err) return validationError(c, err.message);

  return success(c, {
    tanggal: today,
    id_cabang: idCabang,
    items: data || [],
  });
});

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('building_checklist')
    .select('*, cabang!inner(nama), user:users!created_by(nama)', { count: 'exact' });

  if (c.req.query('tanggal')) query = query.eq('tanggal', c.req.query('tanggal'));
  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));
  if (c.req.query('kategori')) query = query.eq('kategori', c.req.query('kategori'));

  query = query.order('tanggal', { ascending: false });
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
    .from('building_checklist')
    .select('*, cabang(*), gudang(*), creator:users!created_by(*), building_checklist_item(*)')
    .eq('id', id)
    .single();

  if (err || !data) return notFound(c, 'Checklist tidak ditemukan');
  return success(c, data);
});

app.post('/', async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.id_cabang || !body.tanggal || !body.items?.length) {
    return validationError(c, 'Cabang, tanggal, dan minimal 1 item harus diisi');
  }

  const { data, error: err } = await supabase
    .from('building_checklist')
    .insert({
      id_cabang: body.id_cabang,
      id_gudang: body.id_gudang || null,
      tanggal: body.tanggal,
      kategori: body.kategori || 'kebersihan',
      catatan: body.catatan,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (err) return validationError(c, err.message);

  const checklistItems = body.items.map((item: any) => ({
    id_checklist: data.id,
    id_template: item.id_template || null,
    nama_item: item.nama_item,
    status: item.status || 'ok',
    keterangan: item.keterangan,
    foto_url: item.foto_url,
  }));

  const { error: itemsErr } = await supabase
    .from('building_checklist_item')
    .insert(checklistItems);

  if (itemsErr) return validationError(c, itemsErr.message);

  logAudit(c, { tipe_aksi: AUDIT_ACTION.INSERT, modul: MODUL.BUILDING, nama_tabel: 'building_checklist', id_record: data.id, data_baru: data, deskripsi: `Checklist ${body.kategori} untuk ${body.tanggal}` });
  return created(c, { ...data, items: checklistItems }, 'Checklist berhasil disubmit');
});

export default app;
