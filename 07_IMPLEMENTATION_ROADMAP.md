# IMPLEMENTATION ROADMAP
## General Affairs Enterprise System

---

**Dokumen Versi:** 1.0
**Tanggal:** 23 Juni 2026
**Target Rilis:** 10 Phase / 6 Bulan

---

## DAFTAR ISI

1. [Strategy Overview](#1-strategy-overview)
2. [Phase 1: Foundation](#2-phase-1-foundation---master-data--auth)
3. [Phase 2: Asset Management](#3-phase-2-asset-management)
4. [Phase 3: Maintenance Management](#4-phase-3-maintenance-management)
5. [Phase 4: Procurement Management](#5-phase-4-procurement-management)
6. [Phase 5: Vendor Management](#6-phase-5-vendor-management)
7. [Phase 6: Vehicle Management](#7-phase-6-vehicle-management)
8. [Phase 7: Building & Facility](#8-phase-7-building--facility)
9. [Phase 8: Dashboard & Reporting](#9-phase-8-dashboard--reporting)
10. [Phase 9: Audit Trail](#10-phase-9-audit-trail--system-enhancement)
11. [Phase 10: Production & UAT](#11-phase-10-production-release--uat)
12. [Timeline Summary](#12-timeline-summary)

---

## 1. STRATEGY OVERVIEW

### 1.1 Pendekatan Pengembangan

```
Phase 1: Foundation   ████████████░░░░░░░░░░░░░░   (2 minggu)
Phase 2: Asset        ░░████████████████████████   (3 minggu)
Phase 3: Maintenance  ░░░░██████████████████████   (3 minggu)
Phase 4: Procurement  ░░░░░░████████████████████   (2 minggu)
Phase 5: Vendor       ░░░░░░░███████████████████   (1 minggu)
Phase 6: Vehicle      ░░░░░░░░██████████████████   (2 minggu)
Phase 7: Building     ░░░░░░░░░█████████████████   (2 minggu)
Phase 8: Dashboard    ░░░░░░░░░░████████████████   (3 minggu)
Phase 9: Audit Trail  ░░░░░░░░░░████████████████   (1 minggu)
Phase 10: Production  ░░░░░░░░░░░░██████████████   (3 minggu)
                     ──────────────────────────→ waktu
                    M1    M2    M3    M4    M5    M6
```

### 1.2 Prinsip Pengembangan

| Prinsip | Penerapan |
|---------|-----------|
| **API-First** | Semua fungsi backend via Cloudflare Workers API |
| **Modular** | Setiap modul independen, bisa di-deploy terpisah |
| **Mobile-First** | UI responsif, akses via tablet di lapangan |
| **Security by Design** | RLS, RBAC, validasi input ketat |
| **Idempotent** | API aman untuk repeat request |
| **Auditable** | Semua transaksi tercatat di audit_log |

### 1.3 Tech Stack Final

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Cloudflare Pages + React/Vite (atau SvelteKit) |
| **Backend API** | Cloudflare Workers (Hono.js) |
| **Database** | Supabase PostgreSQL 15 |
| **Auth** | Supabase Auth (Google OAuth) |
| **Storage** | Supabase Storage (foto, QR, dokumen) |
| **Realtime** | Supabase Realtime (notifikasi) |
| **Hosting** | Cloudflare Pages + Workers |
| **Edge Cache** | Cloudflare Cache API |

---

## 2. PHASE 1: FOUNDATION - MASTER DATA & AUTH

### 2.1 Scope

| Area | Deliverables |
|------|-------------|
| **Project Setup** | Setup Cloudflare Pages, Workers, Supabase project |
| **Database** | Create schema, tables, indexes, RLS policies |
| **Auth** | Supabase Auth integration, Google OAuth, JWT |
| **Master Data** | Full CRUD: cabang, gudang, roles, users, kategori_asset, lokasi_asset, jenis_maintenance |
| **UI Framework** | Base layout, sidebar menu, responsive template |
| **Supabase Storage** | Buckets for: asset-foto, asset-qr, dokumen-kontrak, maintenance-foto, building-foto |

### 2.2 Database Deliverables

```sql
-- Execute in order:
1. CREATE SCHEMA ga_enterprise
2. CREATE TABLE cabang, gudang, roles, users
3. CREATE TABLE kategori_asset, lokasi_asset, jenis_maintenance
4. CREATE INDEXES
5. INSERT seed data (roles, sample branches)
6. ENABLE RLS
7. CREATE POLICIES
8. CREATE STORAGE BUCKETS
```

### 2.3 API Endpoints (Workers)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | /api/v1/cabang | List cabang |
| POST | /api/v1/cabang | Create cabang |
| PUT | /api/v1/cabang/:id | Update cabang |
| DELETE | /api/v1/cabang/:id | Soft delete cabang |
| GET | /api/v1/gudang | List gudang |
| ... | ... | ... dan seterusnya untuk semua master |

### 2.4 Frontend Pages

| Route | Page | Fitur |
|-------|------|-------|
| /login | Login Page | Google OAuth button |
| / | Redirect to dashboard | Based on role |
| /master/cabang | Master Cabang | DataTable + Form Modal |
| /master/gudang | Master Gudang | DataTable + Form Modal |
| /master/user | Master User | DataTable + Form Modal |
| /master/kategori-asset | Kategori Asset | DataTable |
| /master/lokasi-asset | Lokasi Asset | DataTable |
| /master/jenis-maintenance | Jenis Maintenance | DataTable |

### 2.5 Acceptance Criteria

- [ ] User bisa login dengan Google
- [ ] Role-based redirect setelah login
- [ ] CRUD semua master data berfungsi
- [ ] RLS aktif: user hanya bisa akses sesuai role
- [ ] Storage bucket bisa upload/download file

### 2.6 Effort: 2 minggu

---

## 3. PHASE 2: ASSET MANAGEMENT

### 3.1 Scope

| Area | Deliverables |
|------|-------------|
| **Asset CRUD** | Registrasi, edit, detail, list, filter, search |
| **Kode Asset** | Generate otomatis: AST-CAB-TAHUN-NO |
| **QR Code** | Generate QR via API, print/download |
| **Upload Foto** | Multi-file upload, foto utama, thumbnail |
| **Mutasi** | Workflow: ajukan → approve → proses → terima |
| **Stock Opname** | Buat opname → execute → rekonsiliasi → approve |
| **Penyusutan** | Perhitungan bulanan otomatis |
| **Penghapusan** | Workflow: ajukan → approve → selesai |

### 3.2 Database Deliverables

```sql
-- New tables:
CREATE TABLE asset (with all columns)
CREATE TABLE asset_foto
CREATE TABLE asset_mutasi
CREATE TABLE asset_penyusutan
CREATE TABLE asset_penghapusan
CREATE TABLE asset_stock_opname
CREATE TABLE asset_stock_opname_detail
CREATE TABLE asset_history
```

### 3.3 API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET/POST | /api/v1/asset | List/Create asset |
| GET/PUT | /api/v1/asset/:id | Detail/Update asset |
| DELETE | /api/v1/asset/:id | Soft delete |
| POST | /api/v1/asset/:id/generate-qr | Generate QR Code |
| POST | /api/v1/asset/:id/upload-foto | Upload foto |
| GET | /api/v1/asset/:id/history | Histori asset |
| POST | /api/v1/asset-mutasi | Ajukan mutasi |
| PUT | /api/v1/asset-mutasi/:id/approve | Approve mutasi |
| PUT | /api/v1/asset-mutasi/:id/reject | Reject mutasi |
| POST | /api/v1/asset-stock-opname | Buat opname |
| PUT | /api/v1/asset-stock-opname/:id/exec | Execute opname |
| POST | /api/v1/asset-penyusutan/calculate | Hitung penyusutan |
| POST | /api/v1/asset-penghapusan | Ajukan penghapusan |

### 3.4 Effort: 3 minggu

---

## 4. PHASE 3: MAINTENANCE MANAGEMENT

### 4.1 Scope

| Area | Deliverables |
|------|-------------|
| **Ticket CRUD** | Buat, edit, detail, list dengan filter |
| **Ticket Workflow** | Buat → Approve → Assign → Kerjakan → Verify → Close |
| **Prioritas & SLA** | Low/Med/High/Critical dengan SLA otomatis |
| **Assign** | Assign ke teknisi internal atau vendor |
| **Foto** | Upload foto kerusakan dan hasil perbaikan |
| **Tracking** | Timeline/status log setiap ticket |
| **Preventive** | Jadwal PM, reminder, eksekusi |
| **SLA Monitoring** | Dashboard SLA, overdue alert |

### 4.2 Database Deliverables

```sql
CREATE TABLE maintenance_ticket
CREATE TABLE maintenance_foto
CREATE TABLE maintenance_tracking
CREATE TABLE maintenance_reminder
CREATE TABLE maintenance_sparepart
```

### 4.3 API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET/POST | /api/v1/maintenance/ticket | List/Create ticket |
| GET/PUT | /api/v1/maintenance/ticket/:id | Detail/Update |
| PUT | /api/v1/maintenance/ticket/:id/approve | Approve |
| PUT | /api/v1/maintenance/ticket/:id/reject | Reject |
| PUT | /api/v1/maintenance/ticket/:id/assign | Assign teknisi/vendor |
| PUT | /api/v1/maintenance/ticket/:id/start | Mulai kerjakan |
| PUT | /api/v1/maintenance/ticket/:id/complete | Selesai |
| PUT | /api/v1/maintenance/ticket/:id/verify | Verifikasi |
| PUT | /api/v1/maintenance/ticket/:id/close | Close |
| GET | /api/v1/maintenance/ticket/:id/tracking | Timeline |
| GET/POST | /api/v1/maintenance/preventive | Jadwal PM |
| GET | /api/v1/maintenance/sla | SLA dashboard |

### 4.4 Effort: 3 minggu

---

## 5. PHASE 4: PROCUREMENT MANAGEMENT

### 5.1 Scope

| Area | Deliverables |
|------|-------------|
| **PR CRUD** | Buat PR, detail, list |
| **PR Approval** | Approval berjenjang: Kacab → Head GA |
| **PO CRUD** | Buat PO dari PR approved |
| **Penerimaan** | Input penerimaan, cek kondisi, selisih |
| **Asset Creation** | Opsi registrasi aset dari penerimaan |
| **Monitoring** | Status pengadaan end-to-end |

### 5.2 Database Deliverables

```sql
CREATE TABLE purchase_request
CREATE TABLE purchase_request_item
CREATE TABLE purchase_request_approval
CREATE TABLE purchase_order
CREATE TABLE purchase_order_item
CREATE TABLE penerimaan_barang
CREATE TABLE penerimaan_barang_item
```

### 5.3 API Endpoints

| Method | Endpoint |
|--------|----------|
| GET/POST | /api/v1/procurement/pr |
| GET/PUT | /api/v1/procurement/pr/:id |
| POST | /api/v1/procurement/pr/:id/submit |
| PUT | /api/v1/procurement/pr/:id/approve-kacab |
| PUT | /api/v1/procurement/pr/:id/approve-headga |
| PUT | /api/v1/procurement/pr/:id/reject |
| GET/POST | /api/v1/procurement/po |
| GET/PUT | /api/v1/procurement/po/:id |
| POST | /api/v1/procurement/po/:id/send |
| GET/POST | /api/v1/procurement/receiving |
| GET/PUT | /api/v1/procurement/receiving/:id |

### 5.4 Effort: 2 minggu

---

## 6. PHASE 5: VENDOR MANAGEMENT

### 6.1 Scope

| Area | Deliverables |
|------|-------------|
| **Vendor CRUD** | Data vendor, kategori, upload dokumen |
| **Kontrak** | Create kontrak, monitoring masa berlaku |
| **Evaluasi** | Penilaian vendor, rating otomatis |
| **Reminder** | Notifikasi kontrak akan expired |

### 6.2 Effort: 1 minggu

---

## 7. PHASE 6: VEHICLE MANAGEMENT

### 7.1 Scope

| Area | Deliverables |
|------|-------------|
| **Kendaraan CRUD** | Data kendaraan + foto |
| **Service** | Catat service, jadwal berikutnya |
| **BBM** | Catat pengisian BBM, efisiensi |
| **Booking** | Booking workflow: ajukan → approve → pakai → selesai |
| **Reminder** | STNK, Pajak, Service reminder |

### 7.2 Effort: 2 minggu

---

## 8. PHASE 7: BUILDING & FACILITY

### 8.1 Scope

| Area | Deliverables |
|------|-------------|
| **Checklist** | Template, eksekusi harian, issue reporting |
| **Issue** | Report issue → tindak lanjut → selesai |
| **Monitoring** | CCTV, Listrik, Internet, Air, Keamanan |

### 8.2 Effort: 2 minggu

---

## 9. PHASE 8: DASHBOARD & REPORTING

### 9.1 Scope

| Area | Deliverables |
|------|-------------|
| **Dashboard Head GA** | 6 KPI cards, 4 charts, 1 table |
| **Dashboard Staff GA** | Task overview, activity feed |
| **Dashboard Cabang** | Branch-specific KPIs |
| **Dashboard Gudang** | Warehouse-specific KPIs |
| **Reports** | 20+ laporan dengan export PDF & Excel |
| **Charts** | Chart.js integration (bar, line, donut) |

### 9.2 Effort: 3 minggu

---

## 10. PHASE 9: AUDIT TRAIL & SYSTEM ENHANCEMENT

### 10.1 Scope

| Area | Deliverables |
|------|-------------|
| **Audit Log** | Config audit di semua endpoint |
| **Activity Log** | UI untuk filter, search, export audit |
| **Notification** | In-app notification system |
| **System Settings** | Configurable SLA, reminder, dll |
| **Performance** | Query optimization, pagination, caching |
| **Error Handling** | Global error handler, logging |

### 10.2 Effort: 1 minggu

---

## 11. PHASE 10: PRODUCTION RELEASE & UAT

### 11.1 Scope

| Area | Deliverables |
|------|-------------|
| **UAT** | User Acceptance Test dengan sample user |
| **Training** | Dokumentasi user, video tutorial |
| **Data Migration** | Import data existing (Excel/CSV) |
| **Security Audit** | Penetration test, RLS review |
| **Go-Live** | Production deployment, DNS setup |
| **Hypercare** | 2 minggu support pasca go-live |

### 11.2 Effort: 3 minggu

---

## 12. TIMELINE SUMMARY

### 12.1 Gantt Chart

```
Phase                        Minggu
                   1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
                   ─────────────────────────────────────────────────────────────────────────
P1: Foundation    ██▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
P2: Asset         ░░░░██████████████▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
P3: Maintenance   ░░░░░░░░░░██████████████████▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
P4: Procurement   ░░░░░░░░░░░░░░░████████████████▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
P5: Vendor        ░░░░░░░░░░░░░░░░░░██████▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
P6: Vehicle       ░░░░░░░░░░░░░░░░░░░░░░████████████▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░
P7: Building      ░░░░░░░░░░░░░░░░░░░░░░░░░░████████████▓▓░░░░░░░░░░░░░░░░░░░░░░
P8: Dashboard     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████▓▓░░░░░░░░░░░░
P9: Audit         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████▓▓░░░░░░░░░░░░░░
P10: Production   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████████████▓▓

Legenda: ██ = Development  ▓▓ = Testing  ░░ = Not Active
```

### 12.2 Milestones

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| **M1** | End of Week 2 | Foundation done - Auth + Master Data |
| **M2** | End of Week 5 | Asset Management Live |
| **M3** | End of Week 8 | Maintenance Management Live |
| **M4** | End of Week 10 | Procurement Live |
| **M5** | End of Week 11 | Vendor Management Live |
| **M6** | End of Week 13 | Vehicle Management Live |
| **M7** | End of Week 15 | Building & Facility Live |
| **M8** | End of Week 18 | Dashboard & Reporting Live |
| **M9** | End of Week 19 | Audit Trail Live |
| **M10** | End of Week 24 | GO-LIVE 🚀 |

### 12.3 Resource Plan

| Role | Jumlah | Involvement |
|------|--------|-------------|
| Project Manager | 1 | Full-time, 24 minggu |
| Frontend Developer | 2 | Full-time, 24 minggu |
| Backend Developer (Workers) | 2 | Full-time, 24 minggu |
| Database Architect | 1 | Phase 1-2 (part-time) |
| UI/UX Designer | 1 | Phase 1 + 8 (part-time) |
| QA Tester | 1 | Phase 2-10 (part-time) |
| Business Analyst | 1 | Phase 1-3 (full-time) |

### 12.4 Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Perubahan requirement | High | Medium | Sprint review tiap 2 minggu |
| SLA complexity | Medium | High | Implementasi bertahap |
| Data migration existing | Medium | Medium | Mapping data sebelum import |
| User adoption | Medium | High | Training bertahap, UI sederhana |
| Integrasi dengan sistem lain | Low | High | API contract jelas |

---

## 13. ESTIMASI BIAYA

### 13.1 Infrastructure Cost (Monthly)

| Layanan | Estimasi | Notes |
|---------|----------|-------|
| Cloudflare Pages | $0 | Free tier cukup |
| Cloudflare Workers | $5-20 | 5M request/bln |
| Supabase Pro | $25 | 8GB DB, 100GB bandwidth |
| Supabase Storage | $0-5 | 1GB included |
| Domain | $0-15/year | - |
| **Total** | **~$50/bulan** | |

### 13.2 Development Cost Estimate

| Item | Estimasi |
|------|----------|
| Development (6 bulan) | sesuai kesepakatan tim |
| Infrastructure (6 bulan) | ~$300 |
| Domain & SSL | ~$15/tahun |
| **Total (approx)** | **~$315 + SDC** |

---

> **Dokumen ini adalah blueprint lengkap untuk pengembangan GA Enterprise System.**
> Lanjut ke persiapan implementasi setelah dokumen disetujui.
