import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { requireRole } from '../../../midlware/rbac';
import { logAudit } from '../../../midlware/audit';
import { success, validationError } from '../../../utils/response';
import { AUDIT_ACTION, MODUL } from '../../../config/constants';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('atk_stock')
    .select('*, atk_item!id_item(id, kode_item, nama, satuan, stok_minimal, stok_maksimal, atk_kategori(nama)), gudang!id_gudang(id, kode, nama)', { count: 'exact' });

  if (c.req.query('id_gudang')) query = query.eq('id_gudang', c.req.query('id_gudang'));
  if (c.req.query('id_item')) query = query.eq('id_item', c.req.query('id_item'));
  if (c.req.query('low_stock') === 'true') {
    query = query.lte('qty', supabase.rpc('get_low_stock_threshold', {}));
  }

  query = query.order('atk_item(nama)', { ascending: true });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return validationError(c, err.message);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

app.get('/gudang/:id_gudang', async (c) => {
  const supabase = getSupabase(c.env);
  const { id_gudang } = c.req.param();
  const { data, error: err } = await supabase
    .from('atk_stock')
    .select('*, atk_item!id_item(id, kode_item, nama, spesifikasi, satuan, stok_minimal, stok_maksimal, atk_kategori(nama))')
    .eq('id_gudang', id_gudang)
    .order('atk_item(nama)', { ascending: true });
  if (err) return validationError(c, err.message);
  return success(c, data);
});

app.post('/adjust', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!body.id_item || !body.id_gudang || body.qty === undefined) {
    return validationError(c, 'Item, gudang, dan qty harus diisi');
  }

  const { data: existing } = await supabase
    .from('atk_stock')
    .select('*')
    .eq('id_item', body.id_item)
    .eq('id_gudang', body.id_gudang)
    .maybeSingle();

  let result;
  if (existing) {
    const { data, error: err } = await supabase
      .from('atk_stock')
      .update({ qty: body.qty })
      .eq('id', existing.id)
      .select('*, atk_item(id, kode_item, nama), gudang(id, kode, nama)')
      .single();
    if (err) return validationError(c, err.message);
    result = data;
  } else {
    const { data, error: err } = await supabase
      .from('atk_stock')
      .insert({ id_item: body.id_item, id_gudang: body.id_gudang, qty: body.qty })
      .select('*, atk_item(id, kode_item, nama), gudang(id, kode, nama)')
      .single();
    if (err) return validationError(c, err.message);
    result = data;
  }

  logAudit(c, {
    tipe_aksi: AUDIT_ACTION.UPDATE, modul: MODUL.MASTER,
    nama_tabel: 'atk_stock', id_record: result.id,
    deskripsi: `Stock ATK ${result.atk_item?.nama || ''} di ${result.gudang?.nama || ''} diadjust ke ${body.qty}`,
  });
  return success(c, result, 'Stock berhasil diadjust');
});

app.post('/mutasi', requireRole(['SA', 'HGA', 'SGA']), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!body.id_item || !body.id_gudang_asal || !body.id_gudang_tujuan || !body.qty) {
    return validationError(c, 'Item, gudang asal, gudang tujuan, dan qty harus diisi');
  }

  const { data: stockAsal } = await supabase
    .from('atk_stock')
    .select('*')
    .eq('id_item', body.id_item)
    .eq('id_gudang', body.id_gudang_asal)
    .maybeSingle();

  if (!stockAsal || stockAsal.qty < body.qty) {
    return validationError(c, 'Stock tidak mencukupi');
  }

  await supabase.from('atk_stock').update({ qty: stockAsal.qty - body.qty }).eq('id', stockAsal.id);

  const { data: stockTujuan } = await supabase
    .from('atk_stock')
    .select('*')
    .eq('id_item', body.id_item)
    .eq('id_gudang', body.id_gudang_tujuan)
    .maybeSingle();

  if (stockTujuan) {
    await supabase.from('atk_stock').update({ qty: stockTujuan.qty + body.qty }).eq('id', stockTujuan.id);
  } else {
    await supabase.from('atk_stock').insert({ id_item: body.id_item, id_gudang: body.id_gudang_tujuan, qty: body.qty });
  }

  return success(c, null, 'Mutasi stock berhasil');
});

export default app;
