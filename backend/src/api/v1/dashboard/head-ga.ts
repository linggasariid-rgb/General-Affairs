import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { success, error as apiError } from '../../../utils/response';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);

  try {
    const results = await Promise.allSettled([
      supabase.from('asset').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('asset').select('id_kategori, kategori_asset(id, nama)').is('deleted_at', null),
      supabase.from('maintenance_ticket').select('status'),
      supabase.from('purchase_request').select('status'),
      supabase.from('maintenance_ticket')
        .select('*', { count: 'exact', head: true })
        .in('status', ['dibuat', 'disetujui', 'ditugaskan', 'dikerjakan'])
        .lt('sla_deadline', new Date().toISOString()),
      supabase.from('maintenance_ticket').select('sla_terpenuhi').not('sla_terpenuhi', 'is', null),
      supabase.from('maintenance_ticket').select('biaya')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .not('biaya', 'is', null),
      supabase.from('audit_log')
        .select('*, users!inner(email, nama)')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('asset').select('*', { count: 'exact', head: true }).eq('status', 'aktif').is('deleted_at', null),
      supabase.from('asset').select('*', { count: 'exact', head: true }).eq('status', 'rusak').is('deleted_at', null),
      supabase.from('asset').select('*', { count: 'exact', head: true }).eq('status', 'dipinjam').is('deleted_at', null),
    ]);

    const r = results.map(res => res.status === 'fulfilled' ? res.value : { data: [], count: 0 });

    const kategoriMap: Record<string, any> = {};
    (r[1]?.data || []).forEach((a: any) => {
      const k = a.kategori_asset;
      if (k) {
        kategoriMap[k.id] = kategoriMap[k.id] || { id: k.id, nama: k.nama, total: 0 };
        kategoriMap[k.id].total++;
      }
    });

    const buildCountMap = (arr: any) => {
      const map: Record<string, number> = {};
      (arr?.data || []).forEach((item: any) => {
        map[item.status] = (map[item.status] || 0) + 1;
      });
      return Object.entries(map).map(([status, count]) => ({ status, count }));
    };

    const totalSla = r[5]?.data?.length || 0;
    const slaOk = r[5]?.data?.filter(s => s.sla_terpenuhi === true).length || 0;

    return success(c, {
      totalAsset: r[0]?.count || 0,
      assetAktif: r[8]?.count || 0,
      assetRusak: r[9]?.count || 0,
      assetDipinjam: r[10]?.count || 0,
      assetPerCabang: [],
      assetPerKategori: Object.values(kategoriMap),
      ticketStats: buildCountMap(r[2]),
      prStats: buildCountMap(r[3]),
      openTicket: (r[2]?.data || []).filter(t => !['closed', 'selesai', 'diverifikasi'].includes(t.status)).length,
      prPending: (r[3]?.data || []).filter(p => !['selesai', 'ditolak'].includes(p.status)).length,
      overdueTicket: r[4]?.count || 0,
      slaCompliance: totalSla > 0 ? Math.round((slaOk / totalSla) * 100) : 100,
      biayaMaintenance: r[6]?.data?.reduce((s, t) => s + (Number(t.biaya) || 0), 0) || 0,
      recentActivities: r[7]?.data || [],
    });
  } catch (err: any) {
    return apiError(c, 'DASHBOARD_ERROR', err.message, 500);
  }
});

export default app;
