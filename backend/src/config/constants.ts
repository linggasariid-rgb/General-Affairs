export const ROLES = {
  SUPER_ADMIN: 'SA',
  HEAD_GA: 'HGA',
  STAFF_GA: 'SGA',
  KEPALA_CABANG: 'KCB',
  KEPALA_GUDANG: 'KGD',
  PIC_CABANG: 'PCB',
  PIC_GUDANG: 'PGD',
  AUDITOR: 'AUD',
} as const;

export const ASSET_STATUS = {
  DRAFT: 'draft',
  AKTIF: 'aktif',
  RUSAK: 'rusak',
  PERBAIKAN: 'perbaikan',
  HILANG: 'hilang',
  DIJUAL: 'dijual',
  DIHAPUS: 'dihapus',
} as const;

export const ASSET_KONDISI = {
  BAIK: 'baik',
  RUSAK_RINGAN: 'rusak_ringan',
  RUSAK_BERAT: 'rusak_berat',
} as const;

export const MAINTENANCE_STATUS = {
  DIBUAT: 'dibuat',
  DISETUJUI: 'disetujui',
  DITOLAK: 'ditolak',
  DITUGASKAN: 'ditugaskan',
  DIKERJAKAN: 'dikerjakan',
  SELESAI: 'selesai',
  DIVERIFIKASI: 'diverifikasi',
  CLOSED: 'closed',
} as const;

export const MAINTENANCE_PRIORITAS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const PR_STATUS = {
  DRAFT: 'draft',
  DIAJUKAN: 'diajukan',
  DISETUJUI_KACAB: 'disetujui_kacab',
  DISETUJUI_HGA: 'disetujui_hga',
  DITOLAK: 'ditolak',
  DIPROSES: 'diproses',
  SELESAI: 'selesai',
  CLOSED: 'closed',
} as const;

export const PO_STATUS = {
  DRAFT: 'draft',
  DIKIRIM: 'dikirim',
  DIKONFIRMASI: 'dikonfirmasi',
  DALAM_PENGIRIMAN: 'dalam_pengiriman',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
} as const;

export const AUDIT_ACTION = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  INSERT: 'insert',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  MUTASI: 'mutasi',
  EXPORT: 'export',
  VIEW: 'view',
} as const;

export const MODUL = {
  AUTH: 'auth',
  MASTER: 'master',
  ASSET: 'asset',
  MAINTENANCE: 'maintenance',
  PROCUREMENT: 'procurement',
  VENDOR: 'vendor',
  VEHICLE: 'vehicle',
  BUILDING: 'building',
  DASHBOARD: 'dashboard',
  REPORT: 'report',
  AUDIT: 'audit',
} as const;

export const SLA_HOURS: Record<string, number> = {
  low: 48,
  medium: 24,
  high: 4,
  critical: 1,
};
