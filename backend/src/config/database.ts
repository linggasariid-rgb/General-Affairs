import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabase(env: Env): SupabaseClient<any, any, any> {
  if (!supabase) {
    supabase = createClient<any>(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  }
  return supabase;
}

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  JWT_SECRET: string;
  APP_NAME: string;
  APP_ENV: string;
}

export interface Variables {
  user: any;
  userId: string;
  roleCode: string;
}

export type AppEnv = { Bindings: Env; Variables: Variables };
