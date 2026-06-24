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
  gudang: {
    list: (params) => request(`/master/gudang?${new URLSearchParams(params)}`),
    get: (id) => request(`/master/gudang/${id}`),
    create: (data) => request('/master/gudang', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/master/gudang/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
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

// Produk
export const produkApi = {
  list: (params) => request(`/master/produk?${new URLSearchParams(params)}`),
  all: (params) => request(`/master/produk/all?${new URLSearchParams(params)}`),
  get: (id) => request(`/master/produk/${id}`),
  create: (data) => request('/master/produk', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/master/produk/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ATK
export const atkApi = {
  item: {
    list: (params) => request(`/atk/item?${new URLSearchParams(params)}`),
    all: (params) => request(`/atk/item/all?${new URLSearchParams(params)}`),
    get: (id) => request(`/atk/item/${id}`),
    create: (data) => request('/atk/item', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/atk/item/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/atk/item/${id}`, { method: 'DELETE' }),
  },
  kategori: {
    list: () => request('/atk/kategori'),
    get: (id) => request(`/atk/kategori/${id}`),
    create: (data) => request('/atk/kategori', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/atk/kategori/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/atk/kategori/${id}`, { method: 'DELETE' }),
  },
  stock: {
    list: (params) => request(`/atk/stock?${new URLSearchParams(params)}`),
    byGudang: (idGudang) => request(`/atk/stock/gudang/${idGudang}`),
    adjust: (data) => request('/atk/stock/adjust', { method: 'POST', body: JSON.stringify(data) }),
    mutasi: (data) => request('/atk/stock/mutasi', { method: 'POST', body: JSON.stringify(data) }),
  },
  distribusi: {
    list: (params) => request(`/atk/distribusi?${new URLSearchParams(params)}`),
    get: (id) => request(`/atk/distribusi/${id}`),
    create: (data) => request('/atk/distribusi', { method: 'POST', body: JSON.stringify(data) }),
    submit: (id) => request(`/atk/distribusi/${id}/submit`, { method: 'PUT' }),
    approve: (id) => request(`/atk/distribusi/${id}/approve`, { method: 'PUT' }),
    reject: (id) => request(`/atk/distribusi/${id}/reject`, { method: 'PUT' }),
    kirim: (id, data) => request(`/atk/distribusi/${id}/kirim`, { method: 'PUT', body: JSON.stringify(data) }),
    selesai: (id) => request(`/atk/distribusi/${id}/selesai`, { method: 'PUT' }),
  },
  penerimaan: {
    list: (params) => request(`/atk/penerimaan?${new URLSearchParams(params)}`),
    get: (id) => request(`/atk/penerimaan/${id}`),
    create: (data) => request('/atk/penerimaan', { method: 'POST', body: JSON.stringify(data) }),
  },
  perjalananDinas: {
    list: (params) => request(`/atk/perjalanan-dinas?${new URLSearchParams(params)}`),
    get: (id) => request(`/atk/perjalanan-dinas/${id}`),
    create: (data) => request('/atk/perjalanan-dinas', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/atk/perjalanan-dinas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    kembali: (id, data) => request(`/atk/perjalanan-dinas/${id}/kembali`, { method: 'POST', body: JSON.stringify(data) }),
  },
  pengajuan: {
    list: (params) => request(`/atk/pengajuan-barang-non-rutin?${new URLSearchParams(params)}`),
    get: (id) => request(`/atk/pengajuan-barang-non-rutin/${id}`),
    create: (data) => request('/atk/pengajuan-barang-non-rutin', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/atk/pengajuan-barang-non-rutin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    proses: (id) => request(`/atk/pengajuan-barang-non-rutin/${id}/proses`, { method: 'POST' }),
    setujui: (id) => request(`/atk/pengajuan-barang-non-rutin/${id}/setujui`, { method: 'POST' }),
    tolak: (id, data) => request(`/atk/pengajuan-barang-non-rutin/${id}/tolak`, { method: 'POST', body: JSON.stringify(data) }),
    ajukanFinance: (id) => request(`/atk/pengajuan-barang-non-rutin/${id}/ajukan-finance`, { method: 'POST' }),
  },
  laporan: {
    list: (params) => request(`/atk/laporan-stok-cabang?${new URLSearchParams(params)}`),
    get: (id) => request(`/atk/laporan-stok-cabang/${id}`),
    create: (data) => request('/atk/laporan-stok-cabang', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/atk/laporan-stok-cabang/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    submit: (id) => request(`/atk/laporan-stok-cabang/${id}/submit`, { method: 'POST' }),
    verifikasi: (id, data) => request(`/atk/laporan-stok-cabang/${id}/verifikasi`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/atk/laporan-stok-cabang/${id}`, { method: 'DELETE' }),
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

async function apiFetch(endpoint, options = {}) {
  return request(endpoint, options);
}

export { request as apiFetch };

export default { supabase, authApi, masterApi, assetApi, maintenanceApi, procurementApi, produkApi, atkApi, dashboardApi, reportApi };
