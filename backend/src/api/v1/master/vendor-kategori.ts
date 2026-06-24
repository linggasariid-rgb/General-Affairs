import { Hono } from 'hono';
import { getSupabase, type AppEnv } from '../../../config/database';
import { authMiddleware } from '../../../midlware/auth';
import { success } from '../../../utils/response';

const app = new Hono<AppEnv>();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error: err } = await supabase
    .from('vendor_kategori')
    .select('*')
    .order('nama', { ascending: true });

  if (err) return c.json({ success: false, error: err.message }, 500);
  return success(c, data);
});

export default app;
