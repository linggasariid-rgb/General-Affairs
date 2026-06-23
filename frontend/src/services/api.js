import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BASE_URL = '/api/v1';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

async function request(endpoint, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data;
}

// Auth
export const authApi = {
  login: () => supabase.auth.signInWithOAuth({ provider: 'google' }),
  logout: () => supabase.auth.signOut(),
  getProfile: () => request('/auth/me'),
};

// Master Data
export const masterApi = {
  cabang: {
    list: (params) => request(`/master/cabang?${new URLSearchParams(params)}`),
    get: (id) => request(`/master/cabang/${id}`),
    create: (data) => request('/master/cabang', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/master/cabang/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/master/cabang/${id}`, { method: 'DELETE' }),
  },
  vendor: {
    list: (params) => request(`/master/vendor?${new URLSearchParams(params)}`),
    get: (id) => request(`/master/vendor/${id}`),
    create: (data) => request('/master/vendor', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/master/vendor/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
};

// Asset
export const assetApi = {
  list: (params) => request(`/asset?${new URLSearchParams(params)}`),
  get: (id) => request(`/asset/${id}`),
  create: (data) => request('/asset', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/asset/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/asset/${id}`, { method: 'DELETE' }),
  getHistory: (id) => request(`/asset/${id}/history`),
  generateQR: (id) => request(`/asset/${id}/generate-qr`, { method: 'POST' }),
  mutasi: {
    list: (params) => request(`/asset/mutasi?${new URLSearchParams(params)}`),
    create: (data) => request('/asset/mutasi', { method: 'POST', body: JSON.stringify(data) }),
    approve: (id) => request(`/asset/mutasi/${id}/approve`, { method: 'PUT' }),
    reject: (id, data) => request(`/asset/mutasi/${id}/reject`, { method: 'PUT', body: JSON.stringify(data) }),
    terima: (id, data) => request(`/asset/mutasi/${id}/terima`, { method: 'PUT', body: JSON.stringify(data) }),
  },
};

// Maintenance
export const maintenanceApi = {
  ticket: {
    list: (params) => request(`/maintenance/ticket?${new URLSearchParams(params)}`),
    get: (id) => request(`/maintenance/ticket/${id}`),
    create: (data) => request('/maintenance/ticket', { method: 'POST', body: JSON.stringify(data) }),
    approve: (id) => request(`/maintenance/ticket/${id}/approve`, { method: 'PUT' }),
    assign: (id, data) => request(`/maintenance/ticket/${id}/assign`, { method: 'PUT', body: JSON.stringify(data) }),
    start: (id) => request(`/maintenance/ticket/${id}/start`, { method: 'PUT' }),
    complete: (id, data) => request(`/maintenance/ticket/${id}/complete`, { method: 'PUT', body: JSON.stringify(data) }),
    verify: (id, data) => request(`/maintenance/ticket/${id}/verify`, { method: 'PUT', body: JSON.stringify(data) }),
    close: (id) => request(`/maintenance/ticket/${id}/close`, { method: 'PUT' }),
  },
};

// Procurement
export const procurementApi = {
  pr: {
    list: (params) => request(`/procurement/pr?${new URLSearchParams(params)}`),
    get: (id) => request(`/procurement/pr/${id}`),
    create: (data) => request('/procurement/pr', { method: 'POST', body: JSON.stringify(data) }),
    submit: (id) => request(`/procurement/pr/${id}/submit`, { method: 'PUT' }),
    approveKacab: (id, data) => request(`/procurement/pr/${id}/approve-kacab`, { method: 'PUT', body: JSON.stringify(data) }),
    approveHGA: (id, data) => request(`/procurement/pr/${id}/approve-headga`, { method: 'PUT', body: JSON.stringify(data) }),
    reject: (id, data) => request(`/procurement/pr/${id}/reject`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  po: {
    list: (params) => request(`/procurement/po?${new URLSearchParams(params)}`),
    get: (id) => request(`/procurement/po/${id}`),
    create: (data) => request('/procurement/po', { method: 'POST', body: JSON.stringify(data) }),
  },
};

// Dashboard
export const dashboardApi = {
  headGA: () => request('/dashboard/head-ga'),
};

// Report
export const reportApi = {
  asset: (params) => request(`/report/asset?${new URLSearchParams(params)}`),
  maintenance: (params) => request(`/report/maintenance?${new URLSearchParams(params)}`),
  procurement: (params) => request(`/report/procurement?${new URLSearchParams(params)}`),
};

export default { supabase, authApi, masterApi, assetApi, maintenanceApi, procurementApi, dashboardApi, reportApi };
