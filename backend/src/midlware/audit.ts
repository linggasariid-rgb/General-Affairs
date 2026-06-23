import { Context, Next } from 'hono';
import { getSupabase, type AppEnv } from '../config/database';

interface AuditData {
  tipe_aksi: string;
  modul: string;
  nama_tabel?: string;
  id_record?: string;
  data_lama?: any;
  data_baru?: any;
  deskripsi: string;
}

export async function logAudit(
  c: Context<AppEnv>,
  data: AuditData,
) {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for');

  try {
    await supabase.from('audit_log').insert({
      id_user: user?.id || null,
      email_user: user?.email || null,
      tipe_aksi: data.tipe_aksi,
      modul: data.modul,
      nama_tabel: data.nama_tabel,
      id_record: data.id_record,
      data_lama: data.data_lama,
      data_baru: data.data_baru,
      deskripsi: data.deskripsi,
      ip_address: ip,
      user_agent: c.req.header('User-Agent'),
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

export function auditMiddleware(action: string, module: string) {
  return async (c: Context<AppEnv>, next: Next) => {
    await next();
    if (c.res.status < 400) {
      const user = c.get('user');
      if (user) {
        logAudit(c, {
          tipe_aksi: action,
          modul: module,
          deskripsi: `${action} di modul ${module}`,
        });
      }
    }
  };
}
