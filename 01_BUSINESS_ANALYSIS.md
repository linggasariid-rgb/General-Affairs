# BUSINESS ANALYSIS DOCUMENT
## General Affairs Enterprise System

---

**Dokumen Versi:** 1.0
**Tanggal:** 23 Juni 2026
**Platform:** Cloudflare Pages + Workers + Supabase
**Author:** Senior Business Analyst & System Architect

---

## DAFTAR ISI

1. [Tujuan Sistem](#1-tujuan-sistem)
2. [Ruang Lingkup Sistem](#2-ruang-lingkup-sistem)
3. [Struktur Organisasi Terkait](#3-struktur-organisasi-terkait)
4. [Daftar Stakeholder](#4-daftar-stakeholder)
5. [Daftar Role User](#5-daftar-role-user)
6. [Hak Akses Setiap Role](#6-hak-akses-setiap-role)
7. [KPI yang Dipantau oleh Head GA](#7-kpi-yang-dipantau-oleh-head-ga)

---

## 1. TUJUAN SISTEM

### 1.1 Visi Sistem
Menjadi sistem informasi General Affairs enterprise yang terintegrasi, real-time, dan paperless untuk mendukung operasional perusahaan multi-cabang dan multi-gudang secara efektif dan efisien.

### 1.2 Misi Sistem
1. **Digitalisasi** - Mengubah seluruh proses manual GA menjadi digital dan paperless
2. **Integrasi** - Menyatukan seluruh modul GA dalam satu platform terpadu
3. **Otomatisasi** - Mengotomatiskan workflow approval, notifikasi, dan reminder
4. **Transparansi** - Memberikan visibilitas penuh atas seluruh aset dan operasional GA
5. **Akuntabilitas** - Menyediakan audit trail lengkap untuk setiap transaksi
6. **Efisiensi** - Mengurangi waktu siklus pengadaan, maintenance, dan approval
7. **Pengendalian** - Memberikan kontrol biaya operasional GA secara real-time
8. **Prediktabilitas** - Menyediakan data historis untuk pengambilan keputusan strategis

### 1.3 Tujuan Fungsional

| No | Modul | Tujuan |
|----|-------|--------|
| 1 | Asset Management | Mengelola siklus hidup aset dari pengadaan hingga penghapusan |
| 2 | Maintenance Management | Memastikan keandalan aset melalui maintenance terjadwal dan responsif |
| 3 | Procurement Management | Mengelola pengadaan barang/jasa secara transparan dan efisien |
| 4 | Vendor Management | Mengelola hubungan dan kinerja vendor secara terstruktur |
| 5 | Vehicle Management | Mengoptimalkan penggunaan dan perawatan kendaraan operasional |
| 6 | Building & Facility | Memastikan kondisi gedung dan fasilitas selalu prima |
| 7 | Dashboard & Reporting | Menyediakan informasi real-time untuk pengambilan keputusan |
| 8 | Audit Trail | Mencatat seluruh aktivitas sistem untuk kepentingan audit |

### 1.4 Tujuan Non-Fungsional

| Aspek | Target |
|-------|--------|
| Availability | 99.9% uptime (kecuali maintenance terjadwal) |
| Response Time | Halaman < 2 detik, API < 500ms |
| Security | RBAC, enkripsi data, audit logging |
| Scalability | Mendukung hingga 100 cabang, 50 gudang |
| Multi-tenant | Isolasi data per cabang/gudang |
| Mobile Friendly | Responsif di desktop dan tablet |

---

## 2. RUANG LINGKUP SISTEM

### 2.1 Cakupan Organisasi
- **10 Cabang** tersebar di seluruh Indonesia
- **2 Gudang Pusat** (Gudang A dan Gudang B)
- **Multi-departemen** yang membutuhkan layanan GA

### 2.2 Cakupan Modul

```
┌─────────────────────────────────────────────────────┐
│                  GA ENTERPRISE SYSTEM                │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │                 MASTER DATA                      │ │
│ │  Cabang │ Gudang │ User │ Vendor │ Kategori     │ │
│ │  Lokasi │ Kendaraan │ Jenis Maintenance         │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │              TRANSACTION MODULES                 │ │
│ │                                                  │ │
│ │  Asset ──── Maintenance ──── Procurement        │ │
│ │     │            │               │               │ │
│ │     └──┐         │               │               │ │
│ │        ▼         ▼               ▼               │ │
│ │  Vehicle ──── Building ──── Vendor              │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │         SUPPORTING MODULES                       │ │
│ │                                                  │ │
│ │  Dashboard │ Reporting │ Audit Trail │ Notifikasi│ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 2.3 Batasan Sistem
- Tidak mencakup modul HR, Finance, atau Inventory umum
- Tidak mencakup modul CRM atau Customer Management
- Integrasi dengan sistem akuntansi dilakukan via API terpisah
- Notifikasi terbatas pada in-app notification dan email

### 2.4 Entitas yang Dikelola
1. **Asset** - Seluruh aset perusahaan (IT, Furniture, Mesin, dll)
2. **Maintenance** - Ticket perbaikan dan jadwal preventive maintenance
3. **Purchase Request/Order** - Seluruh pengadaan non-produksi
4. **Vendor** - Vendor jasa dan barang GA
5. **Kendaraan** - Mobil operasional, motor, kendaraan angkut
6. **Gedung/Fasilitas** - Kantor cabang, gudang, dan fasilitas di dalamnya

---

## 3. STRUKTUR ORGANISASI TERKAIT

### 3.1 Struktur Organisasi General Affairs

```
┌─────────────────────────────────────────┐
│           DIREKTUR OPERASI              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          HEAD GENERAL AFFAIRS           │
│         (Kepala Divisi GA)              │
└────────────────┬────────────────────────┘
                 │
         ┌───────┼───────┬─────────────────┐
         │       │       │                 │
┌────────▼──┐ ┌──▼──────┐ ┌▼─────────┐ ┌───▼────────┐
│ STAFF GA 1│ │STAFF GA │ │ STAFF GA │ │ADMIN GA   │
│ (Asset &  │ │2 (Main- │ │3 (Procure│ │(Reporting &│
│  Facility)│ │tenance &│ │  -ment & │ │  Document) │
│           │ │Vehicle) │ │  Vendor) │ │            │
└───────────┘ └─────────┘ └──────────┘ └────────────┘
```

### 3.2 Struktur Cabang

```
┌─────────────────────────────────────────┐
│          KEPALA CABANG                   │
│         (Branch Manager)                │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          PIC CABANG                      │
│    (General Affairs - Cabang)           │
└─────────────────────────────────────────┘
```

### 3.3 Struktur Gudang

```
┌─────────────────────────────────────────┐
│          KEPALA GUDANG                   │
│         (Warehouse Manager)             │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          PIC GUDANG                      │
│    (General Affairs - Gudang)           │
└─────────────────────────────────────────┘
```

### 3.4 Hirarki Pelaporan

| Level | Jabatan | Melapor ke |
|-------|---------|------------|
| 1 | PIC Cabang/Gudang | Kepala Cabang/Kepala Gudang (line) & Staff GA (fungsional) |
| 2 | Staff GA | Head GA |
| 3 | Kepala Cabang | Head GA (untuk urusan GA) & Direktur Operasi (line) |
| 4 | Kepala Gudang | Head GA (untuk urusan GA) & Direktur Operasi (line) |
| 5 | Head GA | Direktur Operasi |
| 6 | Auditor | Direktur Utama / Audit Committee |

---

## 4. DAFTAR STAKEHOLDER

### 4.1 Tabel Stakeholder

| No | Stakeholder | Role di Sistem | Kepentingan |
|----|-------------|----------------|-------------|
| 1 | **Direktur Operasi** | - (Sponsor) | Visibilitas operasional, efisiensi biaya GA |
| 2 | **Head GA** | Super Admin / Head GA | Pengelolaan seluruh fungsi GA, monitoring KPI |
| 3 | **Staff GA** | Staff GA | Operasional harian GA |
| 4 | **Kepala Cabang** | Kepala Cabang | Approval pengadaan, monitoring aset cabang |
| 5 | **Kepala Gudang** | Kepala Gudang | Monitoring aset gudang, koordinasi stok |
| 6 | **PIC Cabang** | PIC Cabang | Pelaksana GA di cabang, pelapor kerusakan |
| 7 | **PIC Gudang** | PIC Gudang | Pelaksana GA di gudang, pelapor kerusakan |
| 8 | **Auditor Internal** | Auditor | Audit kepatuhan dan inventarisasi |
| 9 | **Tim IT** | - (Integrator) | Integrasi sistem, pemeliharaan platform |
| 10 | **Vendor/Supplier** | - (External) | Pemenuhan barang/jasa, penagihan |

### 4.2 Kebutuhan Stakeholder

| Stakeholder | Kebutuhan Utama |
|-------------|-----------------|
| **Head GA** | Dashboard real-time, monitoring biaya, laporan kinerja, kontrol approval |
| **Staff GA** | Form input cepat, workflow jelas, tracking tugas, notifikasi |
| **Kepala Cabang** | Approval mobile, monitoring aset cabang, laporan ringkas |
| **PIC Cabang** | Akses cepat buat ticket, form sederhana, upload foto |
| **Auditor** | Akses read-only seluruh data, export PDF/Excel, audit trail |

---

## 5. DAFTAR ROLE USER

### 5.1 Definisi Role

| No | Role | Kode | Level | Unit | Jabatan Terkait |
|----|------|------|-------|------|-----------------|
| 1 | **Super Admin** | SA | 99 | IT/GASystem | Tim IT, Developer |
| 2 | **Head General Affairs** | HGA | 80 | Divisi GA | Kepala Divisi GA |
| 3 | **Staff General Affairs** | SGA | 60 | Divisi GA | Staff GA |
| 4 | **Kepala Cabang** | KCB | 50 | Cabang | Branch Manager |
| 5 | **Kepala Gudang** | KGD | 50 | Gudang | Warehouse Manager |
| 6 | **PIC Cabang** | PCB | 40 | Cabang | PIC GA Cabang |
| 7 | **PIC Gudang** | PGD | 40 | Gudang | PIC GA Gudang |
| 8 | **Auditor** | AUD | 30 | Audit | Auditor Internal |

### 5.2 Karakteristik Role

**5.2.1 Super Admin (SA)**
- Full akses ke seluruh sistem
- Konfigurasi master data, role, user
- Tidak terlibat dalam workflow bisnis
- Hanya 1-2 orang

**5.2.2 Head General Affairs (HGA)**
- Akses penuh ke seluruh modul
- Approval tingkat akhir (PR, Maintenance, Mutasi)
- Melihat dashboard dan laporan strategis
- 1 orang

**5.2.3 Staff General Affairs (SGA)**
- Operasional harian modul Asset, Maintenance, Procurement, Vendor, Vehicle, Building
- Membuat Purchase Order
- Assign teknisi / vendor maintenance
- 2-3 orang

**5.2.4 Kepala Cabang (KCB)**
- Approval PR tingkat cabang
- Monitoring aset dan maintenance di cabangnya
- Akses laporan cabang

**5.2.5 Kepala Gudang (KGD)**
- Monitoring aset di gudang
- Approval penerimaan barang di gudang
- Koordinasi stock opname gudang

**5.2.6 PIC Cabang (PCB)**
- Membuat request (PR, Ticket Maintenance, Booking Kendaraan)
- Melakukan pengecekan dan checklist harian
- Verifikasi perbaikan/kontrak di cabang

**5.2.7 PIC Gudang (PGD)**
- Membuat request terkait gudang
- Melakukan pengecekan gudang
- Menerima barang di gudang

**5.2.8 Auditor (AUD)**
- Read-only seluruh data
- Akses audit trail
- Export laporan

---

## 6. HAK AKSES SETIAP ROLE

### 6.1 Kategori Hak Akses

| Kode | Hak Akses | Deskripsi |
|------|-----------|-----------|
| C | Create | Membuat data baru |
| R | Read | Melihat data |
| U | Update | Mengubah data |
| D | Delete | Menghapus data |
| A | Approve | Menyetujui |
| RJ | Reject | Menolak |
| E | Export | Export ke PDF/Excel |
| V | View Dashboard | Melihat dashboard |

### 6.2 Master Data

| Modul | Fitur | SA | HGA | SGA | KCB | KGD | PCB | PGD | AUD |
|-------|-------|----|-----|-----|-----|-----|-----|-----|-----|
| **Cabang** | Read | R | R | R | R | - | R | - | R |
| | Create/Update/Delete | CRUD | RU | - | - | - | - | - | - |
| **Gudang** | Read | R | R | R | - | R | - | R | R |
| | Create/Update/Delete | CRUD | RU | - | - | - | - | - | - |
| **User** | Read | R | R | R | R | R | R | R | R |
| | Create/Update/Delete | CRUD | CRU | - | - | - | - | - | - |
| **Vendor** | Read | CRUD | CRUD | CRUD | R | R | R | R | R |
| | Create/Update/Delete | CRUD | CRUD | CRU | - | - | - | - | - |
| **Kategori Asset** | Read | CRUD | CRUD | CRUD | R | R | R | R | R |
| | Create/Update/Delete | CRUD | CRUD | CRU(D) | - | - | - | - | - |
| **Lokasi Asset** | Read | CRUD | CRUD | CRUD | R | R | R | R | R |
| | Create/Update/Delete | CRUD | CRUD | CRU(D) | - | - | - | - | - |
| **Kendaraan** | Read | CRUD | CRUD | CRUD | R | R | R | R | R |
| | Create/Update/Delete | CRUD | CRUD | CRU(D) | - | - | - | - | - |
| **Jenis Maintenance** | Read | CRUD | CRUD | CRUD | R | R | R | R | R |
| | Create/Update/Delete | CRUD | CRUD | CRU(D) | - | - | - | - | - |

### 6.3 Asset Management

| Fitur | SA | HGA | SGA | KCB | KGD | PCB | PGD | AUD |
|-------|----|-----|-----|-----|-----|-----|-----|-----|
| **Registrasi Asset** | CRUD | CRUD | CRUD | - | - | CR | CR | R |
| **Approval Asset** | A/RJ | A/RJ | - | - | - | - | - | - |
| **Kode Asset (Generate)** | CRUD | CRUD | CRUD | - | - | - | - | - |
| **Upload Foto Asset** | CRUD | CRUD | CRUD | - | - | CR | CR | - |
| **QR Code Asset** | R | R | R | R | R | R | R | R |
| **Mutasi Asset** | CRUD | CRUD | CRUD | A/RJ | A/RJ | CR | CR | R |
| **Histori Asset** | R | R | R | R | R | R | R | R |
| **Penyusutan Asset** | CRUD | CRUD | CRUD | - | - | - | - | R |
| **Penghapusan Asset** | CRUD | A/RJ | CR | - | - | - | - | R |
| **Stock Opname** | CRUD | CRUD | CRUD | A/RJ | A/RJ | CRUD | CRUD | R |
| **Export Asset** | E | E | E | E | E | - | - | E |

### 6.4 Maintenance Management

| Fitur | SA | HGA | SGA | KCB | KGD | PCB | PGD | AUD |
|-------|----|-----|-----|-----|-----|-----|-----|-----|
| **Buat Ticket** | CRUD | CRUD | CRUD | CR | CR | CRUD | CRUD | R |
| **Approval Ticket** | A/RJ | A/RJ | - | A/RJ | A/RJ | - | - | - |
| **Assign Teknisi** | CRUD | CRUD | CRUD | - | - | - | - | - |
| **Assign Vendor** | CRUD | CRUD | CRUD | - | - | - | - | - |
| **Upload Foto Kerusakan** | CRUD | CRUD | CRUD | - | - | CRUD | CRUD | - |
| **Tracking Status** | R | R | R | R | R | R | R | R |
| **Verifikasi Perbaikan** | CRUD | CRUD | - | - | - | A/RJ | A/RJ | - |
| **Close Ticket** | CRUD | A/RJ | - | - | - | CRUD | CRUD | - |
| **Jadwal Preventive** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **SLA Monitoring** | R | R | R | R | R | - | - | R |
| **Export Maintenance** | E | E | E | E | E | - | - | E |

### 6.5 Procurement Management

| Fitur | SA | HGA | SGA | KCB | KGD | PCB | PGD | AUD |
|-------|----|-----|-----|-----|-----|-----|-----|-----|
| **Purchase Request** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | R |
| **Approval PR (Kacab)** | - | - | - | A/RJ | - | - | - | - |
| **Approval PR (Head GA)** | A/RJ | A/RJ | - | - | - | - | - | - |
| **Purchase Order** | CRUD | CRUD | CRUD | - | - | - | - | R |
| **Penerimaan Barang** | CRUD | CRUD | CRUD | - | - | CRUD | CRUD | R |
| **Monitoring Pengadaan** | R | R | R | R | R | R | R | R |
| **Export Procurement** | E | E | E | E | E | - | - | E |

### 6.6 Vehicle Management

| Fitur | SA | HGA | SGA | KCB | KGD | PCB | PGD | AUD |
|-------|----|-----|-----|-----|-----|-----|-----|-----|
| **Data Kendaraan** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **Jadwal Service** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **Reminder STNK** | CRUD | CRUD | CRUD | R | R | R | R | - |
| **Reminder Pajak** | CRUD | CRUD | CRUD | R | R | R | R | - |
| **Riwayat BBM** | CRUD | CRUD | CRUD | R | R | CRUD | CRUD | R |
| **Riwayat Service** | CRUD | CRUD | CRUD | R | R | CRUD | CRUD | R |
| **Booking Kendaraan** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | R |
| **Approval Booking** | A/RJ | A/RJ | A/RJ | A/RJ | A/RJ | - | - | - |
| **Export Vehicle** | E | E | E | E | E | - | - | E |

### 6.7 Building & Facility

| Fitur | SA | HGA | SGA | KCB | KGD | PCB | PGD | AUD |
|-------|----|-----|-----|-----|-----|-----|-----|-----|
| **Checklist Gedung** | CRUD | CRUD | CRUD | R | R | CRUD | CRUD | R |
| **Checklist Gudang** | CRUD | CRUD | CRUD | - | R | - | CRUD | R |
| **Monitoring CCTV** | R | R | R | R | R | CRUD | CRUD | - |
| **Monitoring Listrik** | R | R | R | R | R | CRUD | CRUD | - |
| **Monitoring Internet** | R | R | R | R | R | CRUD | CRUD | - |
| **Monitoring Air** | R | R | R | R | R | CRUD | CRUD | - |
| **Monitoring Keamanan** | R | R | R | R | R | CRUD | CRUD | - |
| **Laporan Issue** | CRUD | CRUD | CRUD | R | R | CRUD | CRUD | R |
| **Export Building** | E | E | E | E | E | - | - | E |

### 6.8 Dashboard

| Dashboard | SA | HGA | SGA | KCB | KGD | PCB | PGD | AUD |
|-----------|----|-----|-----|-----|-----|-----|-----|-----|
| **Dashboard Head GA** | V | V | V | - | - | - | - | V |
| **Dashboard Cabang** | V | V | V | V | - | V | - | V |
| **Dashboard Gudang** | V | V | V | - | V | - | V | V |
| **Dashboard Staff** | V | V | V | - | - | - | - | - |

### 6.9 Reports

| Report | SA | HGA | SGA | KCB | KGD | PCB | PGD | AUD |
|--------|----|-----|-----|-----|-----|-----|-----|-----|
| **Laporan Asset** | E | E | E | E | E | R | R | E |
| **Laporan Maintenance** | E | E | E | E | E | R | R | E |
| **Laporan Procurement** | E | E | E | E | E | R | R | E |
| **Laporan Vendor** | E | E | E | E | E | R | R | E |
| **Laporan Vehicle** | E | E | E | E | E | R | R | E |
| **Laporan Building** | E | E | E | E | E | R | R | E |
| **Laporan Audit Trail** | E | E | E | - | - | - | - | E |

### 6.10 Audit Trail

| Fitur | SA | HGA | SGA | KCB | KGD | PCB | PGD | AUD |
|-------|----|-----|-----|-----|-----|-----|-----|-----|
| **View Audit Log** | V | V | - | - | - | - | - | V |
| **Export Audit Log** | E | E | - | - | - | - | - | E |
| **Hapus Audit Log** | - | - | - | - | - | - | - | - |

---

## 7. KPI YANG DIPANTAU OLEH HEAD GA

### 7.1 KPI Asset Management

| No | KPI | Target | Periode | Formula |
|----|-----|--------|---------|---------|
| 1 | Asset Utilization Rate | > 85% | Bulanan | (Aset Aktif / Total Aset) x 100% |
| 2 | Asset Damage Rate | < 5% | Bulanan | (Aset Rusak / Total Aset) x 100% |
| 3 | Asset Disposal Accuracy | 100% | Tahunan | (Aset Dihapus sesuai prosedur / Total Aset Dihapus) x 100% |
| 4 | Stock Opname Completion | 100% | Bulanan | (Opname Selesai / Opname Terjadwal) x 100% |
| 5 | Asset Data Completeness | > 95% | Bulanan | (Aset dengan data lengkap / Total Aset) x 100% |

### 7.2 KPI Maintenance Management

| No | KPI | Target | Periode | Formula |
|----|-----|--------|---------|---------|
| 1 | SLA Compliance Rate | > 90% | Bulanan | (Ticket selesai tepat SLA / Total Ticket) x 100% |
| 2 | Mean Time to Repair (MTTR) | < 24 jam | Bulanan | Rata-rata waktu dari ticket ke close |
| 3 | Preventive Maintenance Compliance | > 85% | Bulanan | (PM terlaksana / PM Terjadwal) x 100% |
| 4 | Ticket Resolution Rate | > 95% | Bulanan | (Ticket Closed / Total Ticket) x 100% |
| 5 | Re-work Rate | < 5% | Bulanan | (Ticket re-open / Total Ticket) x 100% |

### 7.3 KPI Procurement Management

| No | KPI | Target | Periode | Formula |
|----|-----|--------|---------|---------|
| 1 | PR to PO Cycle Time | < 5 hari | Bulanan | Rata-rata waktu dari PR ke PO |
| 2 | PO Accuracy | > 98% | Bulanan | (PO tanpa revisi / Total PO) x 100% |
| 3 | On-Time Delivery | > 90% | Bulanan | (Barang diterima tepat waktu / Total PO) x 100% |
| 4 | Budget Variance | < 10% | Bulanan | (Realisasi - Anggaran) / Anggaran x 100% |
| 5 | PR Approval Rate | > 95% | Bulanan | (PR disetujui / Total PR) x 100% |

### 7.4 KPI Vendor Management

| No | KPI | Target | Periode | Formula |
|----|-----|--------|---------|---------|
| 1 | Vendor Performance Score | > 75 | Kuartalan | Rata-rata skor penilaian vendor |
| 2 | Contract Compliance | > 90% | Kuartalan | (Kontrak sesuai SLA / Total Kontrak) x 100% |
| 3 | Active Vendor Ratio | > 70% | Bulanan | (Vendor Aktif / Total Vendor) x 100% |
| 4 | Contract Renewal Rate | > 80% | Tahunan | (Kontrak diperpanjang / Total Kontrak habis) x 100% |

### 7.5 KPI Vehicle Management

| No | KPI | Target | Periode | Formula |
|----|-----|--------|---------|---------|
| 1 | Vehicle Availability Rate | > 90% | Bulanan | (Hari tersedia / Total hari) x 100% |
| 2 | Fuel Efficiency | Standar | Bulanan | Km/liter rata-rata per kendaraan |
| 3 | Service Compliance | 100% | Bulanan | (Service tepat waktu / Service terjadwal) x 100% |
| 4 | Vehicle Utilization Rate | > 70% | Bulanan | (Jam pakai / Jam tersedia) x 100% |

### 7.6 KPI Building & Facility

| No | KPI | Target | Periode | Formula |
|----|-----|--------|---------|---------|
| 1 | Checklist Completion | > 95% | Bulanan | (Checklist selesai / Total checklist) x 100% |
| 2 | Issue Resolution Rate | > 90% | Bulanan | (Issue selesai / Total issue) x 100% |
| 3| Facility Downtime | < 2 jam/insiden | Bulanan | Rata-rata durasi issue fasilitas |
| 4 | Security Incident Rate | 0 | Bulanan | Jumlah insiden keamanan |

### 7.7 KPI Keuangan GA

| No | KPI | Target | Periode | Formula |
|----|-----|--------|---------|---------|
| 1 | GA Cost per Branch | Budget | Bulanan | Total biaya GA per cabang |
| 2 | Maintenance Cost vs Asset Value | < 5% | Tahunan | (Total biaya maintenance / Nilai aset) x 100% |
| 3 | Procurement Savings | > 10% | Bulanan | (Harga estimasi - Harga riil) / Harga estimasi x 100% |
| 4 | Budget Realization | 90-100% | Bulanan | (Realisasi / Budget) x 100% |

### 7.8 Dashboard Head GA - Tampilan KPI

```
 ╔══════════════════════════════════════════════════════════════╗
 ║                    DASHBOARD HEAD GA                         ║
 ╠══════════════════════════════════════════════════════════════╣
 ║ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ║
 ║ │  Total    │ │  Asset   │ │ Open     │ │ Vendor   │       ║
 ║ │  Asset    │ │  Rusak   │ │ Ticket   │ │ Aktif    │       ║
 ║ │  1,234    │ │  47      │ │  23      │ │  45      │       ║
 ║ └──────────┘ └──────────┘ └──────────┘ └──────────┘       ║
 ║ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       ║
 ║ │  Biaya   │ │  SLA     │ │  PR      │ │  Budget  │       ║
 ║ │  Maint   │ │  Compliance │  Pending │ │  Realiz. │       ║
 ║ │  Rp 45jt │ │  92%     │ │  12      │ │  78%     │       ║
 ║ └──────────┘ └──────────┘ └──────────┘ └──────────┘       ║
 ╠══════════════════════════════════════════════════════════════╣
 ║ ┌────────────────────────────────────────────────────────┐  ║
 ║ │  GRAFIK - Distribusi Aset per Cabang                   │  ║
 ║ │  [BAR CHART]                                          │  ║
 ║ └────────────────────────────────────────────────────────┘  ║
 ║ ┌─────────────────────────┐ ┌────────────────────────────┐  ║
 ║ │  GRAFIK - Tren Ticket   │ │  GRAFIK - Biaya per Bulan │  ║
 ║ │  [LINE CHART]           │ │  [LINE CHART]             │  ║
 ║ └─────────────────────────┘ └────────────────────────────┘  ║
 ╠══════════════════════════════════════════════════════════════╣
 ║ ┌────────────────────────────────────────────────────────┐  ║
 ║ │  TABEL - Ticket Overdue SLA                            │  ║
 ║ │  ┌──────┬────────────┬────────┬────────┬────────┐    │  ║
 ║ │  │ No   │ Ticket     │ Cabang │ Durasi │ Status │    │  ║
 ║ │  │ 1    │ TKT-001    │ JKT    │ 48 jam │ CRIT   │    │  ║
 ║ │  │ 2    │ TKT-002    │ BDG    │ 36 jam │ HIGH   │    │  ║
 ║ │  └──────┴────────────┴────────┴────────┴────────┘    │  ║
 ║ └────────────────────────────────────────────────────────┘  ║
 ╚══════════════════════════════════════════════════════════════╝
```

---

> **Dokumen ini adalah blueprint awal untuk pengembangan GA Enterprise System.**
> Lanjut ke **02_WORKFLOW.md** untuk detail workflow setiap modul.
