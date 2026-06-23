export interface User {
  id: string;
  email: string;
  nama: string;
  id_role: string;
  id_cabang: string | null;
  id_gudang: string | null;
  telepon: string | null;
  foto_url: string | null;
  is_active: boolean;
  last_login: string | null;
}

export interface RoleInfo {
  id: string;
  kode: string;
  nama: string;
  level: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface AssetPayload {
  nama: string;
  id_kategori: string;
  id_lokasi?: string;
  id_cabang: string;
  id_gudang?: string;
  id_vendor?: string;
  merek?: string;
  model?: string;
  nomor_seri?: string;
  tahun_perolehan?: number;
  tanggal_perolehan?: string;
  harga_perolehan?: number;
  nilai_residu?: number;
  masa_manfaat?: number;
  spesifikasi?: string;
  keterangan?: string;
}

export interface MutasiPayload {
  id_asset: string;
  tipe: 'cabang' | 'gudang' | 'lokasi';
  id_cabang_tujuan?: string;
  id_gudang_tujuan?: string;
  id_lokasi_tujuan?: string;
  alasan: string;
  tanggal_mutasi: string;
}

export interface TicketPayload {
  judul: string;
  deskripsi: string;
  id_asset?: string;
  id_kendaraan?: string;
  id_jenis_maintenance?: string;
  id_cabang: string;
  id_lokasi?: string;
  prioritas: 'low' | 'medium' | 'high' | 'critical';
  tipe: 'corrective' | 'preventive';
  tanggal_rencana?: string;
}

export interface PRPayload {
  judul: string;
  deskripsi?: string;
  id_cabang: string;
  id_gudang?: string;
  urgent?: boolean;
  items: PRItemPayload[];
}

export interface PRItemPayload {
  nama_barang: string;
  spesifikasi?: string;
  jumlah: number;
  satuan: string;
  estimasi_harga?: number;
  keterangan?: string;
}

export interface POPayload {
  id_pr: string;
  id_vendor: string;
  items: POItemPayload[];
  biaya_kirim?: number;
  pajak?: number;
  termin_pembayaran?: string;
  catatan?: string;
}

export interface POItemPayload {
  id_pr_item?: string;
  nama_barang: string;
  jumlah: number;
  satuan: string;
  harga_satuan: number;
}

export interface VehicleBookingPayload {
  id_kendaraan: string;
  tujuan: string;
  lokasi_tujuan?: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keperluan?: string;
  jumlah_penumpang?: number;
  driver?: string;
}

export interface ChecklistPayload {
  id_template: string;
  id_cabang: string;
  id_gudang?: string;
  tanggal: string;
  status: 'ok' | 'issue' | 'na';
  keterangan?: string;
  foto_url?: string;
}
