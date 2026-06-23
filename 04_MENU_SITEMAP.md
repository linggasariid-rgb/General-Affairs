# MENU STRUCTURE & SITEMAP
## General Affairs Enterprise System

---

**Dokumen Versi:** 1.0
**Tanggal:** 23 Juni 2026

---

## 1. STRUKTUR MENU SIDEBAR

### 1.1 Menu untuk Super Admin & Head GA

```
┌──────────────────────────────────────────────────┐
│ [LOGO] GA Enterprise                    [User] ▼ │
├──────────────────────────────────────────────────┤
│ ☰                                                    │
│                                                    │
│ ◉ DASHBOARD                                        │
│   ├─ Dashboard Head GA                             │
│   ├─ Dashboard Cabang                              │
│   └─ Dashboard Gudang                              │
│                                                    │
│ ◉ MASTER DATA                                      │
│   ├─ Data Cabang                                   │
│   ├─ Data Gudang                                   │
│   ├─ Data User                                     │
│   ├─ Data Vendor                                   │
│   ├─ Kategori Asset                                │
│   ├─ Lokasi Asset                                  │
│   ├─ Data Kendaraan                                │
│   ├─ Jenis Maintenance                             │
│   └─ Template Checklist                            │
│                                                    │
│ ◉ ASSET MANAGEMENT                                 │
│   ├─ Daftar Asset                                  │
│   ├─ Registrasi Asset Baru                         │
│   ├─ Mutasi Asset                                  │
│   ├─ Stock Opname                                  │
│   ├─ Penyusutan Asset                              │
│   ├─ Penghapusan Asset                             │
│   ├─ QR Code Generator                             │
│   └─ Laporan Asset                                 │
│                                                    │
│ ◉ MAINTENANCE                                      │
│   ├─ Semua Ticket                                  │
│   ├─ Buat Ticket                                   │
│   ├─ Preventive Schedule                           │
│   ├─ Assign Teknisi/Vendor                         │
│   ├─ SLA Monitoring                                │
│   └─ Laporan Maintenance                           │
│                                                    │
│ ◉ PROCUREMENT                                      │
│   ├─ Purchase Request                              │
│   │   ├─ Semua PR                                  │
│   │   ├─ PR Menunggu Approval                      │
│   │   └─ Buat PR                                   │
│   ├─ Purchase Order                                │
│   │   ├─ Semua PO                                  │
│   │   └─ Buat PO                                   │
│   ├─ Penerimaan Barang                             │
│   └─ Laporan Procurement                           │
│                                                    │
│ ◉ VENDOR                                           │
│   ├─ Daftar Vendor                                 │
│   ├─ Registrasi Vendor Baru                        │
│   ├─ Kontrak Vendor                                │
│   ├─ Evaluasi Vendor                               │
│   └─ Laporan Vendor                                │
│                                                    │
│ ◉ VEHICLE                                          │
│   ├─ Daftar Kendaraan                              │
│   ├─ Jadwal Service                                │
│   ├─ Booking Kendaraan                             │
│   ├─ Riwayat BBM                                   │
│   ├─ Reminder Pajak & STNK                         │
│   └─ Laporan Kendaraan                             │
│                                                    │
│ ◉ BUILDING & FACILITY                              │
│   ├─ Checklist Harian                              │
│   ├─ Monitoring CCTV                               │
│   ├─ Monitoring Internet                           │
│   ├─ Monitoring Listrik                            │
│   ├─ Laporan Issue                                 │
│   └─ Laporan Building                              │
│                                                    │
│ ◉ REPORTING                                        │
│   ├─ Laporan Asset                                 │
│   ├─ Laporan Maintenance                           │
│   ├─ Laporan Procurement                           │
│   ├─ Laporan Vendor                                │
│   ├─ Laporan Kendaraan                             │
│   ├─ Laporan Building                              │
│   └─ Laporan Audit Trail                           │
│                                                    │
│ ◉ AUDIT TRAIL                                      │
│   ├─ Log Aktivitas                                 │
│   └─ Export Audit Log                              │
│                                                    │
│ ⚙ SETTINGS                                         │
│   ├─ Profile                                       │
│   ├─ Role Management                               │
│   ├─ Notifications                                 │
│   └─ Logout                                        │
└──────────────────────────────────────────────────┘
```

### 1.2 Menu untuk Staff GA

```
┌──────────────────────────────────────────────────┐
│ [LOGO] GA Enterprise                    [User] ▼ │
├──────────────────────────────────────────────────┤
│ ☰                                                    │
│                                                    │
│ ◉ DASHBOARD                                        │
│   └─ Dashboard Staff GA                            │
│                                                    │
│ ◉ ASSET MANAGEMENT                                 │
│   ├─ Daftar Asset                                  │
│   ├─ Registrasi Asset Baru                         │
│   ├─ Mutasi Asset                                  │
│   ├─ Stock Opname                                  │
│   ├─ Penyusutan Asset                              │
│   └─ Penghapusan Asset                             │
│                                                    │
│ ◉ MAINTENANCE                                      │
│   ├─ Semua Ticket                                  │
│   ├─ Buat Ticket                                   │
│   ├─ Assign Teknisi/Vendor                         │
│   └─ Preventive Schedule                           │
│                                                    │
│ ◉ PROCUREMENT                                      │
│   ├─ Purchase Request                              │
│   ├─ Purchase Order                                │
│   └─ Penerimaan Barang                             │
│                                                    │
│ ◉ VENDOR                                           │
│   ├─ Daftar Vendor                                 │
│   ├─ Registrasi Vendor Baru                        │
│   └─ Kontrak Vendor                                │
│                                                    │
│ ◉ VEHICLE                                          │
│   ├─ Daftar Kendaraan                              │
│   ├─ Jadwal Service                                │
│   ├─ Booking Kendaraan                             │
│   └─ Riwayat BBM                                   │
│                                                    │
│ ◉ BUILDING                                         │
│   ├─ Checklist Harian                              │
│   └─ Laporan Issue                                 │
│                                                    │
│ ⚙ PROFILE                                          │
└──────────────────────────────────────────────────┘
```

### 1.3 Menu untuk Kepala Cabang

```
┌──────────────────────────────────────────────────┐
│ [LOGO] GA Enterprise                    [User] ▼ │
├──────────────────────────────────────────────────┤
│ ☰                                                    │
│                                                    │
│ ◉ DASHBOARD CABANG                                 │
│                                                    │
│ ◉ ASSET (CABANG SAYA)                              │
│   ├─ Daftar Asset                                  │
│   ├─ Mutasi Asset                                  │
│   └─ Stock Opname                                  │
│                                                    │
│ ◉ MAINTENANCE                                      │
│   ├─ Ticket Cabang Saya                            │
│   └─ Approval Ticket                               │
│                                                    │
│ ◉ PROCUREMENT                                      │
│   ├─ PR Cabang Saya                                │
│   ├─ Approval PR                                   │
│   └─ Penerimaan Barang                             │
│                                                    │
│ ◉ VEHICLE                                          │
│   ├─ Booking Kendaraan                             │
│   └─ Riwayat Kendaraan                             │
│                                                    │
│ ◉ BUILDING                                         │
│   └─ Monitoring Cabang                             │
│                                                    │
│ ◉ LAPORAN                                          │
│   ├─ Laporan Asset Cabang                          │
│   ├─ Laporan Maintenance Cabang                    │
│   └─ Laporan Pengadaan Cabang                      │
│                                                    │
│ ⚙ PROFILE                                          │
└──────────────────────────────────────────────────┘
```

### 1.4 Menu untuk PIC Cabang

```
┌──────────────────────────────────────────────────┐
│ [LOGO] GA Enterprise                    [User] ▼ │
├──────────────────────────────────────────────────┤
│ ☰                                                    │
│                                                    │
│ ◉ DASHBOARD CABANG                                 │
│                                                    │
│ ◉ ASSET                                            │
│   ├─ Daftar Asset Cabang                           │
│   ├─ Registrasi Asset Baru                         │
│   └─ Ajukan Mutasi                                 │
│                                                    │
│ ◉ MAINTENANCE                                      │
│   ├─ Buat Ticket                                   │
│   ├─ Ticket Saya                                   │
│   └─ Verifikasi Perbaikan                          │
│                                                    │
│ ◉ PROCUREMENT                                      │
│   ├─ Buat PR                                       │
│   └─ Terima Barang                                 │
│                                                    │
│ ◉ VEHICLE                                          │
│   ├─ Booking Kendaraan                             │
│   ├─ Catat BBM                                     │
│   └─ Catat Service                                 │
│                                                    │
│ ◉ BUILDING                                         │
│   ├─ Checklist Harian                              │
│   └─ Laporkan Issue                                │
│                                                    │
│ ⚙ PROFILE                                          │
└──────────────────────────────────────────────────┘
```

### 1.5 Menu untuk Auditor

```
┌──────────────────────────────────────────────────┐
│ [LOGO] GA Enterprise                    [User] ▼ │
├──────────────────────────────────────────────────┤
│ ☰                                                    │
│                                                    │
│ ◉ DASHBOARD                                        │
│                                                    │
│ ◉ ASSET                                            │
│   ├─ Seluruh Asset                                 │
│   ├─ Stock Opname                                  │
│   └─ Histori Asset                                 │
│                                                    │
│ ◉ MAINTENANCE                                      │
│   └─ Semua Ticket                                  │
│                                                    │
│ ◉ PROCUREMENT                                      │
│   ├─ Semua PR                                      │
│   ├─ Semua PO                                      │
│   └─ Penerimaan                                    │
│                                                    │
│ ◉ VENDOR                                           │
│   └─ Daftar Vendor + Kontrak                       │
│                                                    │
│ ◉ REPORTING                                        │
│   ├─ Laporan Asset                                 │
│   ├─ Laporan Maintenance                           │
│   ├─ Laporan Procurement                           │
│   ├─ Laporan Vendor                                │
│   ├─ Laporan Kendaraan                             │
│   └─ Laporan Building                              │
│                                                    │
│ ◉ AUDIT TRAIL                                      │
│   ├─ Log Aktivitas Lengkap                         │
│   └─ Filter Log                                    │
│                                                    │
│ ⚙ PROFILE                                          │
└──────────────────────────────────────────────────┘
```

---

## 2. SITEMAP APLIKASI

### 2.1 Struktur URL / Rute Aplikasi

```
/                               → Login / Landing Page
/dashboard                      → Dashboard routing by role
├── /dashboard/head-ga          → Dashboard Head GA
├── /dashboard/staff            → Dashboard Staff GA
├── /dashboard/cabang           → Dashboard Kepala Cabang
└── /dashboard/gudang           → Dashboard Kepala Gudang

/master                         → Master Data
├── /master/cabang              → CRUD Cabang
├── /master/gudang              → CRUD Gudang
├── /master/user                → CRUD User
├── /master/vendor              → CRUD Vendor
├── /master/vendor/add          → Form Vendor Baru
├── /master/vendor/:id          → Detail Vendor
├── /master/vendor/:id/evaluate → Evaluasi Vendor
├── /master/kategori-asset      → CRUD Kategori Asset
├── /master/lokasi-asset        → CRUD Lokasi Asset
├── /master/kendaraan           → CRUD Kendaraan
├── /master/jenis-maintenance   → CRUD Jenis Maintenance
└── /master/checklist-template  → Template Checklist Building

/asset                          → Asset Management
├── /asset/list                 → Daftar Semua Asset
├── /asset/add                  → Registrasi Asset Baru
├── /asset/:id                  → Detail Asset
├── /asset/:id/edit             → Edit Asset
├── /asset/:id/qr               → Download QR Code
├── /asset/:id/history          → Histori Asset
├── /asset/:id/mutate           → Ajukan Mutasi
├── /asset/:id/dispose          → Ajukan Penghapusan
├── /asset/mutasi               → Daftar Mutasi
├── /asset/mutasi/:id           → Detail Mutasi
├── /asset/stock-opname         → Daftar Stock Opname
├── /asset/stock-opname/new     → Stock Opname Baru
├── /asset/stock-opname/:id     → Detail Opname
├── /asset/penyusutan           → Data Penyusutan
└── /asset/disposal             → Daftar Penghapusan

/maintenance                    → Maintenance Management
├── /maintenance/ticket         → Semua Ticket
├── /maintenance/ticket/add     → Buat Ticket Baru
├── /maintenance/ticket/:id     → Detail Ticket
├── /maintenance/ticket/:id/assign  → Assign Teknisi/Vendor
├── /maintenance/ticket/:id/verify  → Verifikasi
├── /maintenance/preventive     → Jadwal Preventive
├── /maintenance/preventive/add → Tambah Jadwal PM
└── /maintenance/sla            → SLA Monitoring

/procurement                    → Procurement Management
├── /procurement/pr             → Daftar PR
├── /procurement/pr/add         → Buat PR Baru
├── /procurement/pr/:id         → Detail PR
├── /procurement/pr/:id/approve → Halaman Approval
├── /procurement/po             → Daftar PO
├── /procurement/po/add         → Buat PO Baru
├── /procurement/po/:id         → Detail PO
├── /procurement/receiving       → Penerimaan Barang
├── /procurement/receiving/:id  → Detail Penerimaan
└── /procurement/receiving/add  → Input Penerimaan

/vendor                         → Vendor Management
├── /vendor/list                → Daftar Vendor
├── /vendor/contract            → Daftar Kontrak
├── /vendor/contract/add        → Kontrak Baru
├── /vendor/contract/:id        → Detail Kontrak
└── /vendor/evaluation          → Hasil Evaluasi

/vehicle                        → Vehicle Management
├── /vehicle/list               → Daftar Kendaraan
├── /vehicle/:id                → Detail Kendaraan
├── /vehicle/:id/bbm            → Riwayat BBM
├── /vehicle/:id/service        → Riwayat Service
├── /vehicle/booking            → Booking Kendaraan
├── /vehicle/booking/add        → Booking Baru
├── /vehicle/booking/:id        → Detail Booking
├── /vehicle/reminder           → Reminder Pajak & STNK
└── /vehicle/service-schedule   → Jadwal Service

/building                       → Building & Facility
├── /building/checklist         → Checklist Harian
├── /building/checklist/:date   → Checklist by Date
├── /building/cctv              → Monitoring CCTV
├── /building/internet          → Monitoring Internet
├── /building/electric          → Monitoring Listrik
├── /building/issue             → Laporan Issue
├── /building/issue/add         → Laporkan Issue Baru
└── /building/issue/:id         → Detail Issue

/reports                        → Reporting
├── /reports/asset              → Report Asset
├── /reports/maintenance        → Report Maintenance
├── /reports/procurement        → Report Procurement
├── /reports/vendor             → Report Vendor
├── /reports/vehicle            → Report Vehicle
├── /reports/building           → Report Building
├── /reports/audit              → Audit Trail Report
└── /reports/export             → Export All

/audit                          → Audit Trail
├── /audit/log                  → Log Aktivitas
├── /audit/log?module=asset     → Filter by Module
├── /audit/log?user=:id         → Filter by User
├── /audit/log?date=:range      → Filter by Date
└── /audit/export               → Export Audit Log

/settings                       → Settings
├── /settings/profile           → Profile Saya
├── /settings/roles             → Manajemen Role (SA only)
├── /settings/users             → Manajemen User
└── /settings/notifications     → Pengaturan Notifikasi
```

---

## 3. DASHBOARD PER ROLE

### 3.1 Dashboard Head GA (Strategis)

```
┌─────────────────────────────────────────────────────────────────────┐
│  DASHBOARD HEAD GA                                      Juni 2026  │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ASSET     │ │MAINTENANCE│ │PROCURE   │ │VENDOR   │ │BUDGET   │ │
│ │1,234     │ │23 Open   │ │12 PR     │ │45 Aktif │ │78%      │ │
│ │47 Rusak ▼│ │5 Overdue │ │8 PO      │ │Rating 82│ │Rp 890jt │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
├──────┬──────────────────────┬──────────────────────┬──────────────┤
│CHART │  ASSET DISTRIBUTION  │  MAINTENANCE TREND   │  CABANG MAP  │
│      │  ┌──────────────┐   │  ┌──────────────┐   │  ┌────────┐  │
│AREA  │  │  BAR CHART   │   │  │  LINE CHART  │   │  │ JKT ●  │  │
│      │  │ Per Cabang   │   │  │ Per Bulan    │   │  │ BDG ●  │  │
│      │  └──────────────┘   │  └──────────────┘   │  │ SBY ●  │  │
├──────┴──────────────────────┴──────────────────────┴──────────────┤
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │  TABLE: TICKET OVERDUE SLA                                   │  │
│ │  Ticket │ Cabang │ Asset │ Durasi │ Prioritas │ Teknisi    │  │
│ │  TKT-045│ JKT    │ AC-03 │ 48 jam  │ CRITICAL  │ PT ABC     │  │
│ │  TKT-046│ BDG    │ PC-12 │ 36 jam  │ HIGH      │ Internal   │  │
│ │  TKT-047│ SBY    │ PRJ-05│ 24 jam  │ MEDIUM    │ PT XYZ     │  │
│ └──────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS: [Buat PR] [Approve Ticket] [Cek SLA] [Stock Opname]│
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Dashboard Staff GA (Operasional)

```
┌─────────────────────────────────────────────────────────────────────┐
│  DASHBOARD STAFF GA                      Selasa, 23 Juni 2026      │
├─────────────────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│ │Tugas   │ │Ticket  │ │PR Baru │ │PO      │ │Reminder│            │
│ │Saya   5 │ │Baru  3 │ │Hari ini│ │Perlu   │ │STNK  2 │            │
│ │        │ │        │ │2       │ │Dibuat 4│ │Service3│            │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘            │
├─────────────────────────────────────────────────────────────────────┤
│ ACTIVITY FEED                                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ● 09:45 - Ticket TKT-048 diajukan PIC JKT - AC Mati (CRIT) │   │
│ │ ● 09:30 - PR-2026-001 disetujui Head GA                    │   │
│ │ ● 09:15 - Asset AST-001-2026-00001 diaktivasi              │   │
│ │ ● 08:45 - PO-2026-001 perlu dibuat (vendor: PT ABC)        │   │
│ │ ● 08:00 - Checklist Gedung JKT belum diisi                 │   │
│ └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│ PENDING ACTIONS                                                      │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ [Approve] 3 PR menunggu approval Head GA                   │   │
│ │ [Assign]  2 Ticket belum di-assign                         │   │
│ │ [Create]  4 PO siap diterbitkan                            │   │
│ │ [Verify]  1 Penerimaan barang perlu diverifikasi           │   │
│ └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Dashboard Kepala Cabang

```
┌─────────────────────────────────────────────────────────────────────┐
│  DASHBOARD CABANG JAKARTA                           Juni 2026      │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ASSET     │ │MAINTE-   │ │PR Pending│ │VEHICLE  │ │BUILDING  │ │
│ │CABANG    │ │NANCE     │ │          │ │AKTIF    │ │CHECKLIST │ │
│ │245       │ │3 Open    │ │2 Menunggu│ │8 Unit   │ │95%       │ │
│ │8 Rusak   │ │0 Overdue │ │Approval  │ │2 Booking│ │1 Issue   │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌──────────────────────┐ │
│ │  KONDISI ASSET CABANG JAKARTA       │  │  GRAFIK TICKET/BULAN │ │
│ │  ┌────────────────────────────────┐  │  │  ┌────────────────┐ │ │
│ │  │  Baik: 210  │ Rusak: 8         │  │  │  │ LINE CHART    │ │ │
│ │  │  Perbaikan: 12 │ Hilang: 1     │  │  │  │ Jan-Jun 2026  │ │ │
│ │  │  Dijual: 4  │ Dihapus: 10     │  │  │  └────────────────┘ │ │
│ │  └────────────────────────────────┘  │  └──────────────────────┘ │
│ └──────────────────────────────────────┘                           │
├─────────────────────────────────────────────────────────────────────┤
│ PENDING APPROVAL: [2 PR] [1 Ticket] [0 Mutasi]                      │
│ QUICK LINKS: [Cek Asset] [Approve PR] [Lihat Ticket]               │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 Dashboard PIC Cabang (Tah Harian)

```
┌─────────────────────────────────────────────────────────────────────┐
│  TUGAS SAYA - PIC JAKARTA                  Selasa, 23 Juni 2026    │
├─────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐     │
│ │  ⬜ CHECKLIST BELUM DIISI                                  │     │
│ │  ● Gedung - Cek Kebersihan                                │     │
│ │  ● Gedung - Cek CCTV                                      │     │
│ │  ● Gedung - Cek Listrik                                   │     │
│ │  [ISI CHECKLIST]                                           │     │
│ └────────────────────────────────────────────────────────────┘     │
│ ┌────────────────────────────────────────────────────────────┐     │
│ │  TICKET SAYA                                               │     │
│ │  Ticket │ Asset │ Status │ Prioritas │ Teknisi            │     │
│ │  TKT-045│ AC-03 │ DIKERJAKAN │ CRIT │ PT ABC             │     │
│ │  TKT-040│ PC-12 │ MENUNGGU   │ MED  │ -                  │     │
│ └────────────────────────────────────────────────────────────┘     │
│ ┌────────────────────────────────────────────────────────────┐     │
│ │  QUICK ACTIONS                                              │     │
│ │  [Buat Ticket] [Buat PR] [Booking Kendaraan] [Ceklist]    │     │
│ └────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. NAVIGASI ANTAR MODUL

### 4.1 Relasi Antar Halaman

```
                    ┌──────────┐
                    │ DASHBOARD │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────────┐
         │               │                   │
    ┌────▼────┐   ┌─────▼──────┐   ┌────────▼──────┐
    │ MASTER  │   │ TRANSACTIONS│   │   REPORTS     │
    │ DATA    │   │            │   │               │
    └─────────┘   └─────┬──────┘   └───────────────┘
                        │
        ┌───────────────┼───────────────────────────┐
        │               │           │               │
   ┌────▼───┐   ┌───────▼──┐  ┌────▼────┐  ┌──────▼────┐
   │ ASSET  │   │MAINTENANCE│  │PROCURE  │  │  VEHICLE  │
   │        │   │          │  │         │  │           │
   └───┬────┘   └────┬─────┘  └────┬────┘  └─────┬─────┘
       │             │             │              │
       └─────────────┼─────────────┘              │
                     │                            │
              ┌──────▼──────┐            ┌────────▼──────┐
              │   VENDOR    │            │   BUILDING    │
              │             │            │               │
              └─────────────┘            └───────────────┘
```

### 4.2 Link Antar Halaman

| Dari Halaman | Link Ke | Konteks |
|-------------|---------|---------|
| Detail Asset | Buat Ticket Maintenance | "Buat Ticket Perbaikan" |
| Detail Asset | Ajukan Mutasi | "Mutasi Aset" |
| Detail Asset | Histori | "Lihat Histori" |
| Detail Asset | QR Code | "Cetak QR" |
| Ticket Maintenance | Detail Asset | "Lihat Detail Asset" |
| Ticket Maintenance | Assign Vendor | "Pilih Vendor" |
| PR Approved | Buat PO | "Buat Purchase Order" |
| PO | Detail Vendor | "Lihat Detail Vendor" |
| PO | Penerimaan Barang | "Input Penerimaan" |
| Penerimaan Barang | Registrasi Asset | "Registrasi Sebagai Asset" |
| Checklist Building | Buat Issue | "Laporkan Issue" |
| Issue Building | Buat Ticket | "Buat Ticket Maintenance" |
| Vendor | Kontrak Vendor | "Lihat Kontrak" |
| Vendor | Evaluasi | "Evaluasi Vendor" |
| Booking Kendaraan | Detail Kendaraan | "Lihat Kendaraan" |
| Dashboard | Semua modul | Link cepat |

---

> **Lanjut ke: 05_DATABASE_PLANNING.md**
