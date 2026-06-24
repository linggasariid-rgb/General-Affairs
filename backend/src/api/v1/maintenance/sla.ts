import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { success, validationError } from '../../../utils/response';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);

  const { data: tickets, error: err } = await supabase
    .from('maintenance_ticket')
    .select('id, status, prioritas, sla_deadline, tanggal_selesai, sla_terpenuhi, created_at');

  if (err) return validationError(c, err.message);

  const total = tickets?.length || 0;
  const completed = tickets?.filter(t => t.status === 'selesai' || t.status === 'diverifikasi' || t.status === 'closed').length || 0;
  const slaTerpenuhi = tickets?.filter(t => t.sla_terpenuhi === true).length || 0;
  const totalWithSla = tickets?.filter(t => t.sla_terpenuhi !== null).length || 0;

  let totalResolutionTime = 0;
  let resolutionCount = 0;
  for (const t of tickets || []) {
    if (t.tanggal_selesai && t.created_at) {
      const created = new Date(t.created_at).getTime();
      const resolved = new Date(t.tanggal_selesai).getTime();
      totalResolutionTime += (resolved - created) / (1000 * 60 * 60);
      resolutionCount++;
    }
  }

  const avgResolutionHours = resolutionCount > 0 ? Math.round((totalResolutionTime / resolutionCount) * 100) / 100 : 0;

  return success(c, {
    total_tickets: total,
    completed_tickets: completed,
    completion_rate: total > 0 ? Math.round((completed / total) * 10000) / 100 : 0,
    sla_terpenuhi: slaTerpenuhi,
    total_dengan_sla: totalWithSla,
    sla_compliance_rate: totalWithSla > 0 ? Math.round((slaTerpenuhi / totalWithSla) * 10000) / 100 : 0,
    rata_rata_resolution_jam: avgResolutionHours,
    overdue_tickets: tickets?.filter(t => t.sla_deadline && new Date(t.sla_deadline) < new Date() && !['selesai', 'diverifikasi', 'closed'].includes(t.status)).length || 0,
  });
});

app.get('/breaches', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const perPage = parseInt(c.req.query('perPage') || '10');

  let query = supabase
    .from('maintenance_ticket')
    .select('*, cabang!inner(nama), asset(nama, kode_asset)', { count: 'exact' })
    .not('sla_terpenuhi', 'eq', true)
    .in('status', ['dibuat', 'disetujui', 'ditugaskan', 'dikerjakan']);

  if (c.req.query('prioritas')) query = query.eq('prioritas', c.req.query('prioritas'));
  if (c.req.query('id_cabang')) query = query.eq('id_cabang', c.req.query('id_cabang'));

  query = query.order('sla_deadline', { ascending: true });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, error: err, count } = await query;
  if (err) return validationError(c, err.message);

  return success(c, data, undefined, {
    page, perPage, total: count || 0, totalPages: Math.ceil((count || 0) / perPage),
  });
});

export default app;
