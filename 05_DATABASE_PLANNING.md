# DATABASE PLANNING
## General Affairs Enterprise System - Supabase PostgreSQL

---

**Dokumen Versi:** 1.0
**Tanggal:** 23 Juni 2026
**Database Engine:** PostgreSQL 15+ (Supabase)
**Schema:** `ga_enterprise`

---

## DAFTAR ISI

1. [Daftar Seluruh Tabel](#1-daftar-seluruh-tabel)
2. [Relasi Antar Tabel](#2-relasi-antar-tabel)
3. [ERD Konseptual](#3-erd-konseptual)
4. [Data Dictionary Lengkap](#4-data-dictionary-lengkap)
5. [Master Data](#5-master-data)
6. [Transaction Data](#6-transaction-data)
7. [Audit & Log Data](#7-audit--log-data)

---

## 1. DAFTAR SELURUH TABEL

### 1.1 Master Data (12 Tabel)

| No | Nama Tabel | Kode | Kategori |
|----|-----------|------|----------|
| 1 | cabang | MST_CAB | Master |
| 2 | gudang | MST_GDG | Master |
| 3 | roles | MST_ROL | Master |
| 4 | users | MST_USR | Master |
| 5 | vendor_kategori | MST_VKT | Master |
| 6 | vendor | MST_VEN | Master |
| 7 | vendor_kontrak | MST_VKO | Master |
| 8 | vendor_penilaian | MST_VPN | Master |
| 9 | kategori_asset | MST_KAT | Master |
| 10 | lokasi_asset | MST_LOK | Master |
| 11 | jenis_maintenance | MST_JMT | Master |
| 12 | building_checklist_template | MST_BCT | Master |

### 1.2 Asset Management (7 Tabel)

| No | Nama Tabel | Kode | Kategori |
|----|-----------|------|----------|
| 13 | asset | TRX_ASM | Transaction |
| 14 | asset_foto | TRX_ASF | Transaction |
| 15 | asset_mutasi | TRX_ASM | Transaction |
| 16 | asset_penyusutan | TRX_ASP | Transaction |
| 17 | asset_penghapusan | TRX_ASH | Transaction |
| 18 | asset_stock_opname | TRX_ASO | Transaction |
| 19 | asset_stock_opname_detail | TRX_ASD | Transaction |

### 1.3 Vehicle Management (4 Tabel)

| No | Nama Tabel | Kode | Kategori |
|----|-----------|------|----------|
| 20 | kendaraan | TRX_KND | Transaction |
| 21 | kendaraan_service | TRX_KNS | Transaction |
| 22 | kendaraan_bbm | TRX_KNB | Transaction |
| 23 | kendaraan_booking | TRX_KNBK | Transaction |

### 1.4 Maintenance Management (5 Tabel)

| No | Nama Tabel | Kode | Kategori |
|----|-----------|------|----------|
| 24 | maintenance_ticket | TRX_MTT | Transaction |
| 25 | maintenance_foto | TRX_MTF | Transaction |
| 26 | maintenance_tracking | TRX_MTR | Transaction |
| 27 | maintenance_reminder | TRX_MTRM | Transaction |
| 28 | maintenance_sparepart | TRX_MTSP | Transaction |

### 1.5 Procurement Management (7 Tabel)

| No | Nama Tabel | Kode | Kategori |
|----|-----------|------|----------|
| 29 | purchase_request | TRX_PRR | Transaction |
| 30 | purchase_request_item | TRX_PRI | Transaction |
| 31 | purchase_request_approval | TRX_PRA | Transaction |
| 32 | purchase_order | TRX_PO | Transaction |
| 33 | purchase_order_item | TRX_POI | Transaction |
| 34 | penerimaan_barang | TRX_PNB | Transaction |
| 35 | penerimaan_barang_item | TRX_PNI | Transaction |

### 1.6 Building & Facility Management (3 Tabel)

| No | Nama Tabel | Kode | Kategori |
|----|-----------|------|----------|
| 36 | building_checklist | TRX_BCL | Transaction |
| 37 | building_issue | TRX_BIS | Transaction |
| 38 | building_checklist_kategori | TRX_BCK | Master |

### 1.7 Support System (4 Tabel)

| No | Nama Tabel | Kode | Kategori |
|----|-----------|------|----------|
| 39 | notifications | SYS_NOT | System |
| 40 | audit_log | SYS_AUD | System |
| 41 | user_sessions | SYS_USS | System |
| 42 | system_settings | SYS_SET | System |

---

## 2. RELASI ANTAR TABEL

### 2.1 Diagram Relasi Master Data

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   cabang    │1──N│    users     │N──1│    roles     │
│             │     │              │     │              │
│             │     │              │     │              │
│             │     │              │     │              │
└──────┬──────┘     └──────┬───────┘     └──────────────┘
       │                   │
       │                   │
       │                   │
       │     ┌─────────────┘
       │     │
       │     │
       │     │     ┌──────────────┐
       │     │     │   gudang     │
       │     └────N│              │
       │           │              │
       │           └──────────────┘
       │
       │     ┌─────────────────────┐
       │     │   kategori_asset    │
       ├────N│   lokasi_asset      │
       │     │   jenis_maintenance │
       │     └─────────────────────┘
       │
       │     ┌─────────────────────┐
       └────N│   vendor            │
             │   vendor_kategori   │N──1
             │   vendor_kontrak    │
             │   vendor_penilaian  │
             └─────────────────────┘
```

### 2.2 Diagram Relasi Asset Management

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  users      │1──N│   asset          │N──1│kategori_asset│
│             │     │                  │     │              │
└─────────────┘     └────┬─────────────┘     └──────────────┘
                         │
               ┌─────────┼──────────────────┐
               │         │                  │
        ┌──────▼──┐ ┌───▼────────┐  ┌──────▼──────┐
        │ asset_  │ │ asset_     │  │ asset_      │
        │ foto    │ │ mutasi     │  │ penghapusan │
        └─────────┘ └────────────┘  └─────────────┘
                            │
                     ┌──────▼─────────┐
                     │ asset_         │
                     │ penyusutan     │
                     └────────────────┘

┌────────────────┐     ┌──────────────────────────┐
│asset_stock_    │1──N│ asset_stock_opname_detail │
│opname          │     │                          │
└────────────────┘     └──────────┬───────────────┘
                                  │
                                  │N
                          ┌───────▼─────────┐
                          │   asset         │
                          └─────────────────┘
```

### 2.3 Diagram Relasi Maintenance

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    asset         │1──N│ maintenance_     │N──1│ jenis_maintenance │
│                  │     │ ticket           │     │                   │
└──────────────────┘     └────┬─────────────┘     └──────────────────┘
                              │
                    ┌─────────┼─────────────┐
                    │         │             │
             ┌──────▼──┐ ┌───▼──────┐ ┌────▼────────┐
             │ maint_  │ │ maint_   │ │ maint_      │
             │ foto    │ │ tracking │ │ sparepart   │
             └─────────┘ └──────────┘ └─────────────┘
                              │
                              │N
                       ┌──────▼──────┐
                       │   vendor    │
                       └─────────────┘
```

### 2.4 Diagram Relasi Procurement

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    users         │1──N│ purchase_request │     │cabang / gudang   │
│                  │     │                  │     │                  │
└──────────────────┘     └────┬─────────────┘     └──────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
             ┌──────▼────────┐   ┌──────▼──────────┐
             │ pr_item       │   │ pr_approval     │
             │ (detail)      │   │ (approval log)  │
             └──────┬────────┘   └─────────────────┘
                    │
                    │1
             ┌──────▼────────┐     ┌──────────────────┐
             │ purchase_order│N──1│    vendor        │
             │               │     │                  │
             └──────┬────────┘     └──────────────────┘
                    │
             ┌──────▼────────┐
             │ po_item       │
             │ (detail)      │
             └──────┬────────┘
                    │
             ┌──────▼────────────┐     ┌──────────────────┐
             │ penerimaan_barang │N──1│   cabang/gudang  │
             │                   │     │                  │
             └──────┬───────────┘     └──────────────────┘
                    │
             ┌──────▼────────────────┐
             │ penerimaan_barang_item│
             └───────────────────────┘
```

---

## 3. ERD KONSEPTUAL

### 3.1 ERD Level 0 (Context Diagram)

```
                        ┌───────────────────┐
                        │   AUDIT TRAIL     │
                        │   (audit_log)     │
                        └─────────┬─────────┘
                                  │
      ┌───────────┐     ┌────────┴────────┐     ┌───────────┐
      │  NOTIF    │     │   GA ENTERPRISE │     │  USERS    │
      │(notif.)   │◄────│   DATABASE      │────►│(all roles)│
      └───────────┘     │                 │     └───────────┘
                        │                 │
      ┌───────────┐     │                 │     ┌───────────┐
      │ SETTINGS  │     │  42 Tables      │     │  STORAGE  │
      │(sys_set)  │────►│  PostgreSQL 15  │     │(foto + QR)│
      └───────────┘     │                 │────►└───────────┘
                        └─────────────────┘
```

### 3.2 ERD Level 1 - Per Domain

```
┌──────────────────────────────────────────────────────────────────┐
│                         MASTER DOMAIN                            │
│  cabang ───1:N─── users ───N:1─── roles                          │
│  gudang ───N:1─── cabang                                         │
│  vendor ───N:1─── vendor_kategori                                │
│  vendor ───1:N─── vendor_kontrak                                 │
│  vendor ───1:N─── vendor_penilaian                               │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│                         ASSET DOMAIN                             │
│  asset ───N:1─── kategori_asset                                  │
│  asset ───N:1─── lokasi_asset                                    │
│  asset ───N:1─── cabang                                          │
│  asset ───N:1─── gudang                                          │
│  asset ───1:N─── asset_foto                                      │
│  asset ───1:N─── asset_mutasi                                    │
│  asset ───1:N─── asset_penyusutan                                │
│  asset ───1:N─── asset_penghapusan                               │
│  asset ───1:N─── asset_stock_opname_detail                       │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│                       MAINTENANCE DOMAIN                         │
│  maintenance_ticket ───N:1─── asset                              │
│  maintenance_ticket ───N:1─── jenis_maintenance                  │
│  maintenance_ticket ───1:N─── maintenance_foto                   │
│  maintenance_ticket ───1:N─── maintenance_tracking               │
│  maintenance_ticket ───N:1─── users (teknisi)                    │
│  maintenance_ticket ───N:1─── vendor                             │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│                      PROCUREMENT DOMAIN                          │
│  purchase_request ───1:N─── purchase_request_item                │
│  purchase_request ───1:N─── purchase_request_approval            │
│  purchase_request ───N:1─── cabang                               │
│  purchase_order ───1:N─── purchase_order_item                    │
│  purchase_order ───N:1─── vendor                                 │
│  purchase_order ───N:1─── purchase_request                       │
│  penerimaan_barang ───N:1─── purchase_order                      │
│  penerimaan_barang ───1:N─── penerimaan_barang_item              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. DATA DICTIONARY LENGKAP

### 4.1 cabang (MST_CAB)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK, DEFAULT gen_random_uuid() | Primary Key |
| kode | VARCHAR | 10 | UNIQUE, NOT NULL | Kode cabang (JKT, BDG, SBY) |
| nama | VARCHAR | 200 | NOT NULL | Nama lengkap cabang |
| alamat | TEXT | - | - | Alamat lengkap |
| kota | VARCHAR | 100 | NOT NULL | Kota |
| provinsi | VARCHAR | 100 | NOT NULL | Provinsi |
| telepon | VARCHAR | 30 | - | Nomor telepon cabang |
| email | VARCHAR | 100 | - | Email cabang |
| kode_pos | VARCHAR | 10 | - | Kode pos |
| lat | DECIMAL | 10,7 | - | Latitude (maps) |
| lng | DECIMAL | 10,7 | - | Longitude (maps) |
| status | BOOLEAN | - | DEFAULT true | Aktif/non-aktif |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | Waktu dibuat |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | Waktu diupdate |

### 4.2 gudang (MST_GDG)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| kode | VARCHAR | 10 | UNIQUE, NOT NULL | Kode gudang (GDG-A, GDG-B) |
| nama | VARCHAR | 200 | NOT NULL | Nama gudang |
| tipe | VARCHAR | 20 | NOT NULL, CHECK | 'pusat' atau 'cabang' |
| id_cabang | UUID | - | FK -> cabang.id, NULLABLE | Cabang (jika tipe=cabang) |
| alamat | TEXT | - | - | Alamat gudang |
| telepon | VARCHAR | 30 | - | Telepon |
| pic_nama | VARCHAR | 100 | - | Nama PIC gudang |
| pic_telepon | VARCHAR | 30 | - | Telepon PIC |
| status | BOOLEAN | - | DEFAULT true | Aktif/non-aktif |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.3 roles (MST_ROL)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| kode | VARCHAR | 10 | UNIQUE, NOT NULL | Kode role (SA, HGA, SGA, KCB, KGD, PCB, PGD, AUD) |
| nama | VARCHAR | 100 | NOT NULL | Nama role |
| deskripsi | TEXT | - | - | Deskripsi role |
| level | INT | - | NOT NULL | Level hierarki (99, 80, 60, 50, 40, 30) |
| is_system | BOOLEAN | - | DEFAULT false | System role (tidak bisa dihapus) |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.4 users (MST_USR)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| email | VARCHAR | 255 | UNIQUE, NOT NULL | Email (Google Login) |
| nama | VARCHAR | 200 | NOT NULL | Nama lengkap |
| id_role | UUID | - | FK -> roles.id, NOT NULL | Role user |
| id_cabang | UUID | - | FK -> cabang.id, NULLABLE | Cabang tempat bertugas |
| id_gudang | UUID | - | FK -> gudang.id, NULLABLE | Gudang tempat bertugas |
| telepon | VARCHAR | 30 | - | Nomor telepon |
| foto_url | TEXT | - | - | URL foto profil |
| is_active | BOOLEAN | - | DEFAULT true | Status aktif |
| last_login | TIMESTAMPTZ | - | - | Terakhir login |
| auth_provider | VARCHAR | 50 | DEFAULT 'google' | Provider auth |
| auth_id | VARCHAR | 255 | - | ID dari provider |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.5 vendor_kategori (MST_VKT)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| nama | VARCHAR | 100 | UNIQUE, NOT NULL | Nama kategori |
| deskripsi | TEXT | - | - | Deskripsi |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.6 vendor (MST_VEN)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| kode | VARCHAR | 20 | UNIQUE, NOT NULL | Kode vendor (VEN-XXX-NNNN) |
| nama | VARCHAR | 255 | NOT NULL | Nama vendor/perusahaan |
| id_kategori | UUID | - | FK -> vendor_kategori.id | Kategori vendor |
| pic_nama | VARCHAR | 200 | - | Nama PIC vendor |
| pic_telepon | VARCHAR | 30 | - | Telepon PIC |
| pic_email | VARCHAR | 100 | - | Email PIC |
| alamat | TEXT | - | - | Alamat |
| kota | VARCHAR | 100 | - | Kota |
| provinsi | VARCHAR | 100 | - | Provinsi |
| npwp | VARCHAR | 30 | - | NPWP |
| bank | VARCHAR | 100 | - | Nama bank |
| no_rekening | VARCHAR | 50 | - | No rekening |
| atas_nama | VARCHAR | 200 | - | Atas nama rekening |
| rating | DECIMAL | 3,2 | DEFAULT 0 | Rata-rata rating (0-5) |
| total_kontrak | INT | - | DEFAULT 0 | Total kontrak aktif |
| status | VARCHAR | 20 | DEFAULT 'aktif', CHECK | 'aktif', 'nonaktif', 'diblokir' |
| created_by | UUID | - | FK -> users.id | Dibuat oleh |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.7 vendor_kontrak (MST_VKO)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| id_vendor | UUID | - | FK -> vendor.id, NOT NULL | Vendor |
| nomor_kontrak | VARCHAR | 50 | UNIQUE, NOT NULL | No kontrak |
| judul | VARCHAR | 255 | NOT NULL | Judul kontrak |
| deskripsi | TEXT | - | - | Deskripsi pekerjaan |
| nilai | DECIMAL | 18,2 | NOT NULL | Nilai kontrak |
| tanggal_mulai | DATE | - | NOT NULL | Mulai berlaku |
| tanggal_berakhir | DATE | - | NOT NULL | Berakhir |
| durasi_bulan | INT | - | - | Durasi dalam bulan |
| file_url | TEXT | - | - | URL file kontrak |
| file_name | VARCHAR | 255 | - | Nama file asli |
| status | VARCHAR | 20 | DEFAULT 'aktif', CHECK | 'aktif', 'expired', 'terminated', 'draft' |
| reminder_hari | INT | - | DEFAULT 30 | H-? untuk reminder |
| notes | TEXT | - | - | Catatan internal |
| created_by | UUID | - | FK -> users.id | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.8 vendor_penilaian (MST_VPN)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| id_vendor | UUID | - | FK -> vendor.id, NOT NULL | Vendor dinilai |
| id_user | UUID | - | FK -> users.id, NOT NULL | Penilai |
| skor_kualitas | INT | - | CHECK 1-100 | Kualitas barang/jasa |
| skor_tepat_waktu | INT | - | CHECK 1-100 | Ketepatan waktu |
| skor_harga | INT | - | CHECK 1-100 | Harga kompetitif |
| skor_responsif | INT | - | CHECK 1-100 | Responsivitas |
| skor_kepatuhan | INT | - | CHECK 1-100 | Kepatuhan kontrak |
| skor_total | DECIMAL | 5,2 | - | (bobot * skor) |
| komentar | TEXT | - | - | Catatan evaluasi |
| periode | VARCHAR | 20 | NOT NULL | 'Q1-2026', 'H1-2026', etc |
| tanggal | DATE | - | DEFAULT CURRENT_DATE | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.9 kategori_asset (MST_KAT)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| kode | VARCHAR | 20 | UNIQUE, NOT NULL | Kode kategori (IT, FURN, MESIN, KEND, BANG) |
| nama | VARCHAR | 200 | NOT NULL | Nama kategori |
| deskripsi | TEXT | - | - | - |
| masa_manfaat_tahun | INT | - | NOT NULL, DEFAULT 4 | Masa manfaat untuk penyusutan |
| metode_penyusutan | VARCHAR | 30 | DEFAULT 'straight_line' | Metode penyusutan |
| akun_aset | VARCHAR | 50 | - | Kode akun (untuk integrasi akuntansi) |
| akun_akumulasi | VARCHAR | 50 | - | Kode akun akumulasi |
| akun_beban | VARCHAR | 50 | - | Kode akun beban |
| icon | VARCHAR | 50 | - | Icon untuk UI |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.10 lokasi_asset (MST_LOK)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| kode | VARCHAR | 20 | UNIQUE, NOT NULL | Kode lokasi |
| nama | VARCHAR | 200 | NOT NULL | Nama lokasi (Ruang IT, Ruang Direktur, dll) |
| id_cabang | UUID | - | FK -> cabang.id, NULLABLE | Cabang |
| id_gudang | UUID | - | FK -> gudang.id, NULLABLE | Gudang |
| lantai | VARCHAR | 50 | - | Lantai |
| gedung | VARCHAR | 100 | - | Nama gedung |
| keterangan | TEXT | - | - | - |
| status | BOOLEAN | - | DEFAULT true | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.11 jenis_maintenance (MST_JMT)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| kode | VARCHAR | 20 | UNIQUE, NOT NULL | Kode |
| nama | VARCHAR | 200 | NOT NULL | Nama jenis maintenance |
| deskripsi | TEXT | - | - | - |
| kategori | VARCHAR | 20 | NOT NULL, CHECK | 'preventive' atau 'corrective' |
| estimasi_jam | INT | - | - | Estimasi durasi (jam) |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

---

### 4.12 asset (TRX_ASM)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | Primary Key |
| kode_asset | VARCHAR | 30 | UNIQUE, NOT NULL | Kode unik (AST-JKT-2026-00001) |
| nama | VARCHAR | 255 | NOT NULL | Nama aset |
| id_kategori | UUID | - | FK -> kategori_asset.id, NOT NULL | Kategori |
| id_lokasi | UUID | - | FK -> lokasi_asset.id | Lokasi saat ini |
| id_cabang | UUID | - | FK -> cabang.id | Cabang saat ini |
| id_gudang | UUID | - | FK -> gudang.id, NULLABLE | Gudang saat ini |
| id_vendor | UUID | - | FK -> vendor.id, NULLABLE | Vendor pembelian |
| id_pr_item | UUID | - | FK -> pr_item.id, NULLABLE | Dari pengadaan |
| merek | VARCHAR | 100 | - | Merek |
| model | VARCHAR | 100 | - | Model/tipe |
| nomor_seri | VARCHAR | 100 | - | Serial number |
| tahun_perolehan | INT | - | - | Tahun perolehan |
| tanggal_perolehan | DATE | - | - | Tanggal perolehan |
| harga_perolehan | DECIMAL | 18,2 | - | Harga beli |
| nilai_residu | DECIMAL | 18,2 | DEFAULT 0 | Nilai sisa |
| nilai_buku | DECIMAL | 18,2 | - | Nilai buku saat ini |
| masa_manfaat | INT | - | - | Masa manfaat (bulan) |
| kondisi | VARCHAR | 30 | DEFAULT 'baik', CHECK | 'baik', 'rusak_ringan', 'rusak_berat' |
| status | VARCHAR | 30 | DEFAULT 'draft', CHECK | 'draft', 'aktif', 'rusak', 'perbaikan', 'hilang', 'dijual', 'dihapus' |
| qr_code_url | TEXT | - | - | URL QR Code |
| foto_utama_url | TEXT | - | - | URL foto utama |
| spesifikasi | TEXT | - | - | Spesifikasi detail |
| keterangan | TEXT | - | - | - |
| is_asset_tetap | BOOLEAN | - | DEFAULT true | Apakah aset tetap |
| created_by | UUID | - | FK -> users.id | - |
| updated_by | UUID | - | FK -> users.id | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| deleted_at | TIMESTAMPTZ | - | NULLABLE | Soft delete |

### 4.13 asset_foto (TRX_ASF)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_asset | UUID | - | FK -> asset.id, NOT NULL | - |
| foto_url | TEXT | - | NOT NULL | URL foto di Supabase Storage |
| file_name | VARCHAR | 255 | - | Nama file asli |
| file_size | INT | - | - | Ukuran file (bytes) |
| tipe_foto | VARCHAR | 30 | DEFAULT 'laporan' | 'laporan', 'opname', 'mutasi' |
| is_utama | BOOLEAN | - | DEFAULT false | Foto utama |
| keterangan | TEXT | - | - | - |
| uploaded_by | UUID | - | FK -> users.id | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.14 asset_mutasi (TRX_ASMT)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nomor_mutasi | VARCHAR | 30 | UNIQUE, NOT NULL | MTS-2026-0001 |
| id_asset | UUID | - | FK -> asset.id, NOT NULL | Aset dimutasi |
| tipe | VARCHAR | 20 | NOT NULL, CHECK | 'cabang', 'gudang', 'lokasi' |
| id_cabang_asal | UUID | - | FK -> cabang.id | - |
| id_cabang_tujuan | UUID | - | FK -> cabang.id | - |
| id_gudang_asal | UUID | - | FK -> gudang.id | - |
| id_gudang_tujuan | UUID | - | FK -> gudang.id | - |
| id_lokasi_asal | UUID | - | FK -> lokasi_asset.id | - |
| id_lokasi_tujuan | UUID | - | FK -> lokasi_asset.id | - |
| alasan | TEXT | - | NOT NULL | Alasan mutasi |
| tanggal_mutasi | DATE | - | NOT NULL | - |
| status | VARCHAR | 30 | DEFAULT 'diajukan' | 'diajukan', 'disetujui', 'ditolak', 'diproses', 'diterima', 'selesai' |
| catatan_pengirim | TEXT | - | - | - |
| catatan_penerima | TEXT | - | - | - |
| approved_by | UUID | - | FK -> users.id, NULLABLE | - |
| approved_at | TIMESTAMPTZ | - | - | - |
| diterima_oleh | UUID | - | FK -> users.id, NULLABLE | - |
| diterima_at | TIMESTAMPTZ | - | - | - |
| created_by | UUID | - | FK -> users.id | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.15 asset_penyusutan (TRX_ASP)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_asset | UUID | - | FK -> asset.id, NOT NULL | Aset |
| periode_tahun | INT | - | NOT NULL | Tahun penyusutan |
| periode_bulan | INT | - | NOT NULL | Bulan penyusutan (1-12) |
| harga_perolehan | DECIMAL | 18,2 | NOT NULL | - |
| nilai_residu | DECIMAL | 18,2 | DEFAULT 0 | - |
| masa_manfaat_bulan | INT | - | NOT NULL | - |
| nilai_penyusutan | DECIMAL | 18,2 | NOT NULL | Nilai penyusutan bulan ini |
| akumulasi_penyusutan | DECIMAL | 18,2 | NOT NULL | Total penyusutan s.d. bulan ini |
| nilai_buku_awal | DECIMAL | 18,2 | NOT NULL | Nilai buku awal periode |
| nilai_buku_akhir | DECIMAL | 18,2 | NOT NULL | Nilai buku setelah penyusutan |
| is_otomatis | BOOLEAN | - | DEFAULT true | Dihitung otomatis |
| keterangan | TEXT | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.16 asset_penghapusan (TRX_ASHP)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nomor_penghapusan | VARCHAR | 30 | UNIQUE | PHP-2026-0001 |
| id_asset | UUID | - | FK -> asset.id, NOT NULL | - |
| tipe | VARCHAR | 20 | NOT NULL, CHECK | 'dijual', 'dihapus', 'hilang' |
| alasan | TEXT | - | NOT NULL | - |
| tanggal | DATE | - | NOT NULL | - |
| nilai_buku | DECIMAL | 18,2 | - | Nilai buku saat penghapusan |
| nilai_penjualan | DECIMAL | 18,2 | - | Jika dijual |
| dokumen_url | TEXT | - | - | Dokumen pendukung |
| status | VARCHAR | 30 | DEFAULT 'diajukan' | 'diajukan', 'disetujui', 'ditolak', 'selesai' |
| approved_by | UUID | - | FK -> users.id | - |
| approved_at | TIMESTAMPTZ | - | - | - |
| notes | TEXT | - | - | - |
| created_by | UUID | - | FK -> users.id | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.17 asset_stock_opname (TRX_ASO)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nomor_opname | VARCHAR | 30 | UNIQUE, NOT NULL | STO-2026-0001 |
| id_cabang | UUID | - | FK -> cabang.id, NULLABLE | - |
| id_gudang | UUID | - | FK -> gudang.id, NULLABLE | - |
| tipe | VARCHAR | 20 | NOT NULL | 'cabang', 'gudang', 'semua' |
| tanggal_mulai | DATE | - | NOT NULL | - |
| tanggal_selesai | DATE | - | - | - |
| status | VARCHAR | 30 | DEFAULT 'draft' | 'draft', 'berlangsung', 'rekonsiliasi', 'selesai', 'diverifikasi' |
| total_aset | INT | - | 0 | Jumlah aset di-opname |
| total_checked | INT | - | 0 | Jumlah sudah dicek |
| total_selisih | INT | - | 0 | Jumlah selisih |
| keterangan | TEXT | - | - | - |
| created_by | UUID | - | FK -> users.id | - |
| verified_by | UUID | - | FK -> users.id, NULLABLE | Auditor |
| verified_at | TIMESTAMPTZ | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.18 asset_stock_opname_detail (TRX_ASD)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_opname | UUID | - | FK -> asset_stock_opname.id, NOT NULL | - |
| id_asset | UUID | - | FK -> asset.id, NOT NULL | - |
| kondisi_catat | VARCHAR | 30 | - | Kondisi di sistem |
| kondisi_fisik | VARCHAR | 30 | - | Kondisi di lapangan |
| lokasi_catat | UUID | - | FK -> lokasi_asset.id | Lokasi di sistem |
| lokasi_fisik | UUID | - | FK -> lokasi_asset.id | Lokasi di lapangan |
| status_catat | VARCHAR | 30 | - | Status di sistem |
| status_fisik | VARCHAR | 30 | - | Status di lapangan |
| ada_fisik | BOOLEAN | - | DEFAULT true | Aset ditemukan? |
| foto_url | TEXT | - | - | Foto kondisi fisik |
| catatan | TEXT | - | - | - |
| is_selisih | BOOLEAN | - | DEFAULT false | Ada selisih? |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

---

### 4.19 kendaraan (TRX_KND)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| kode | VARCHAR | 20 | UNIQUE, NOT NULL | Kode kendaraan (KND-001) |
| nomor_polisi | VARCHAR | 15 | UNIQUE, NOT NULL | Plat nomor |
| merk | VARCHAR | 100 | NOT NULL | Toyota, Honda, dll |
| model | VARCHAR | 200 | NOT NULL | Avanza, CRV, dll |
| tahun | INT | - | - | Tahun kendaraan |
| warna | VARCHAR | 50 | - | - |
| jenis | VARCHAR | 50 | - | 'mobil', 'motor', 'truk' |
| id_cabang | UUID | - | FK -> cabang.id | Cabang pemilik |
| status | VARCHAR | 30 | DEFAULT 'aktif' | 'aktif', 'service', 'rusak', 'dihapus' |
| kilometer_terakhir | INT | - | DEFAULT 0 | KM terakhir |
| masa_berlaku_stnk | DATE | - | - | Masa berlaku STNK |
| masa_berlaku_pajak | DATE | - | - | Masa berlaku pajak |
| masa_berlaku_kir | DATE | - | - | Untuk kendaraan angkut |
| foto_url | TEXT | - | - | - |
| keterangan | TEXT | - | - | - |
| created_by | UUID | - | FK -> users.id | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.20 kendaraan_service (TRX_KNS)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_kendaraan | UUID | - | FK -> kendaraan.id, NOT NULL | - |
| tipe_service | VARCHAR | 30 | NOT NULL | 'ringan', 'sedang', 'besar', 'perbaikan' |
| tanggal | DATE | - | NOT NULL | - |
| kilometer | INT | - | - | KM saat service |
| biaya | DECIMAL | 18,2 | - | - |
| id_vendor | UUID | - | FK -> vendor.id, NULLABLE | Bengkel |
| keterangan | TEXT | - | - | Catatan service |
| status | VARCHAR | 30 | DEFAULT 'selesai' | 'dijadwalkan', 'dilaksanakan', 'selesai' |
| tanggal_service_berikutnya | DATE | - | - | Estimasi service berikutnya |
| kilometer_berikutnya | INT | - | - | Estimasi KM berikutnya |
| created_by | UUID | - | FK -> users.id | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.21 kendaraan_bbm (TRX_KNB)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_kendaraan | UUID | - | FK -> kendaraan.id, NOT NULL | - |
| tanggal | DATE | - | NOT NULL | - |
| jumlah_liter | DECIMAL | 10,2 | NOT NULL | - |
| harga_per_liter | DECIMAL | 12,2 | - | - |
| total_biaya | DECIMAL | 18,2 | - | - |
| kilometer | INT | - | - | KM saat isi BBM |
| jenis_bbm | VARCHAR | 30 | - | Pertalite, Pertamax, Solar |
| nama_pom | VARCHAR | 100 | - | Nama SPBU |
| nota_url | TEXT | - | - | Foto nota |
| created_by | UUID | - | FK -> users.id | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.22 kendaraan_booking (TRX_KNBK)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nomor_booking | VARCHAR | 30 | UNIQUE, NOT NULL | BKG-2026-0001 |
| id_kendaraan | UUID | - | FK -> kendaraan.id, NOT NULL | - |
| id_user | UUID | - | FK -> users.id, NOT NULL | Peminjam |
| tujuan | TEXT | - | NOT NULL | - |
| lokasi_tujuan | TEXT | - | - | - |
| tanggal_mulai | TIMESTAMPTZ | - | NOT NULL | - |
| tanggal_selesai | TIMESTAMPTZ | - | NOT NULL | - |
| keperluan | VARCHAR | 50 | - | 'dinas', 'operasional', 'pribadi' |
| jumlah_penumpang | INT | - | - | - |
| driver | VARCHAR | 100 | - | Nama driver (jika ada) |
| status | VARCHAR | 30 | DEFAULT 'diajukan' | 'diajukan', 'disetujui', 'ditolak', 'dipakai', 'selesai', 'batal' |
| approved_by | UUID | - | FK -> users.id | - |
| approved_at | TIMESTAMPTZ | - | - | - |
| kilometer_awal | INT | - | - | - |
| kilometer_akhir | INT | - | - | - |
| catatan | TEXT | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

---

### 4.23 maintenance_ticket (TRX_MTT)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nomor_ticket | VARCHAR | 30 | UNIQUE, NOT NULL | TKT-2026-00001 |
| judul | VARCHAR | 255 | NOT NULL | Judul ticket |
| deskripsi | TEXT | - | NOT NULL | Deskripsi masalah |
| id_asset | UUID | - | FK -> asset.id, NULLABLE | Aset yang diperbaiki |
| id_kendaraan | UUID | - | FK -> kendaraan.id, NULLABLE | Kendaraan diperbaiki |
| id_jenis_maintenance | UUID | - | FK -> jenis_maintenance.id | - |
| id_cabang | UUID | - | FK -> cabang.id, NOT NULL | Cabang |
| id_lokasi | UUID | - | FK -> lokasi_asset.id | Lokasi spesifik |
| prioritas | VARCHAR | 10 | NOT NULL, CHECK | 'low', 'medium', 'high', 'critical' |
| status | VARCHAR | 30 | DEFAULT 'dibuat' | 'dibuat', 'disetujui', 'ditolak', 'ditugaskan', 'dikerjakan', 'selesai', 'diverifikasi', 'closed' |
| tipe | VARCHAR | 20 | NOT NULL | 'corrective', 'preventive' |
| id_teknisi | UUID | - | FK -> users.id, NULLABLE | Teknisi internal ditugaskan |
| id_vendor | UUID | - | FK -> vendor.id, NULLABLE | Vendor ditugaskan |
| biaya | DECIMAL | 18,2 | - | Biaya total |
| biaya_part | DECIMAL | 18,2 | - | Biaya sparepart |
| biaya_jasa | DECIMAL | 18,2 | - | Biaya jasa |
| tanggal_rencana | DATE | - | - | Tanggal rencana (PM) |
| tanggal_mulai | TIMESTAMPTZ | - | - | Mulai dikerjakan |
| tanggal_selesai | TIMESTAMPTZ | - | - | Selesai dikerjakan |
| sla_deadline | TIMESTAMPTZ | - | - | Deadline SLA |
| sla_terpenuhi | BOOLEAN | - | - | - |
| foto_kerusakan_url | TEXT | - | - | - |
| foto_hasil_url | TEXT | - | - | - |
| catatan_teknisi | TEXT | - | - | - |
| catatan_verifikasi | TEXT | - | - | - |
| created_by | UUID | - | FK -> users.id, NOT NULL | Pelapor |
| approved_by | UUID | - | FK -> users.id | - |
| approved_at | TIMESTAMPTZ | - | - | - |
| verified_by | UUID | - | FK -> users.id | - |
| verified_at | TIMESTAMPTZ | - | - | - |
| closed_by | UUID | - | FK -> users.id | - |
| closed_at | TIMESTAMPTZ | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.24 maintenance_tracking (TRX_MTR)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_ticket | UUID | - | FK -> maintenance_ticket.id, NOT NULL | - |
| status_dari | VARCHAR | 30 | - | Status sebelumnya |
| status_ke | VARCHAR | 30 | NOT NULL | Status baru |
| keterangan | TEXT | - | - | - |
| user_id | UUID | - | FK -> users.id | Yang melakukan |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

---

### 4.25 purchase_request (TRX_PRR)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nomor_pr | VARCHAR | 30 | UNIQUE, NOT NULL | PR-2026-00001 |
| judul | VARCHAR | 255 | NOT NULL | Judul PR |
| deskripsi | TEXT | - | - | - |
| id_cabang | UUID | - | FK -> cabang.id, NOT NULL | Cabang pemohon |
| id_gudang | UUID | - | FK -> gudang.id, NULLABLE | Gudang tujuan |
| status | VARCHAR | 30 | DEFAULT 'draft' | 'draft', 'diajukan', 'disetujui_kacab', 'disetujui_hga', 'ditolak', 'diproses', 'selesai', 'closed' |
| urgent | BOOLEAN | - | DEFAULT false | - |
| estimasi_total | DECIMAL | 18,2 | - | Estimasi total harga |
| realisasi_total | DECIMAL | 18,2 | - | - |
| catatan | TEXT | - | - | - |
| created_by | UUID | - | FK -> users.id, NOT NULL | - |
| dibatalkan_oleh | UUID | - | FK -> users.id | - |
| alasan_batal | TEXT | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.26 purchase_request_item (TRX_PRI)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_pr | UUID | - | FK -> purchase_request.id, NOT NULL | - |
| nama_barang | VARCHAR | 255 | NOT NULL | - |
| spesifikasi | TEXT | - | - | - |
| jumlah | INT | - | NOT NULL | - |
| satuan | VARCHAR | 30 | NOT NULL | pcs, unit, box, liter |
| estimasi_harga | DECIMAL | 18,2 | - | Harga per unit |
| total_estimasi | DECIMAL | 18,2 | - | Jumlah * estimasi |
| keterangan | TEXT | - | - | - |
| id_kategori_asset | UUID | - | FK -> kategori_asset.id | Untuk mapping aset |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.27 purchase_request_approval (TRX_PRA)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_pr | UUID | - | FK -> purchase_request.id, NOT NULL | - |
| tahap | VARCHAR | 20 | NOT NULL | 'kacab', 'headga' |
| status | VARCHAR | 20 | NOT NULL | 'approved', 'rejected' |
| catatan | TEXT | - | - | - |
| approved_by | UUID | - | FK -> users.id, NOT NULL | - |
| approved_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.28 purchase_order (TRX_PO)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nomor_po | VARCHAR | 30 | UNIQUE, NOT NULL | PO-2026-00001 |
| id_pr | UUID | - | FK -> purchase_request.id, NOT NULL | PR asal |
| id_vendor | UUID | - | FK -> vendor.id, NOT NULL | Vendor terpilih |
| tanggal_po | DATE | - | NOT NULL | - |
| status | VARCHAR | 30 | DEFAULT 'draft' | 'draft', 'dikirim', 'dikonfirmasi', 'dalam_pengiriman', 'selesai', 'dibatalkan' |
| total_harga | DECIMAL | 18,2 | - | Total PO |
| biaya_kirim | DECIMAL | 18,2 | DEFAULT 0 | - |
| pajak | DECIMAL | 18,2 | DEFAULT 0 | PPN |
| grand_total | DECIMAL | 18,2 | - | Total + biaya kirim + pajak |
| termin_pembayaran | VARCHAR | 100 | - | Syarat pembayaran |
| tanggal_pengiriman | DATE | - | - | - |
| estimasi_terima | DATE | - | - | - |
| catatan | TEXT | - | - | - |
| file_po_url | TEXT | - | - | PDF PO |
| created_by | UUID | - | FK -> users.id | - |
| dibatalkan_oleh | UUID | - | FK -> users.id | - |
| alasan_batal | TEXT | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.29 purchase_order_item (TRX_POI)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_po | UUID | - | FK -> purchase_order.id, NOT NULL | - |
| id_pr_item | UUID | - | FK -> purchase_request_item.id | - |
| nama_barang | VARCHAR | 255 | NOT NULL | - |
| spesifikasi | TEXT | - | - | - |
| jumlah | INT | - | NOT NULL | - |
| satuan | VARCHAR | 30 | NOT NULL | - |
| harga_satuan | DECIMAL | 18,2 | NOT NULL | - |
| subtotal | DECIMAL | 18,2 | - | - |
| keterangan | TEXT | - | - | - |

### 4.30 penerimaan_barang (TRX_PNB)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nomor_penerimaan | VARCHAR | 30 | UNIQUE, NOT NULL | PNB-2026-00001 |
| id_po | UUID | - | FK -> purchase_order.id, NOT NULL | - |
| id_cabang | UUID | - | FK -> cabang.id, NULLABLE | - |
| id_gudang | UUID | - | FK -> gudang.id, NULLABLE | - |
| tanggal_terima | DATE | - | NOT NULL | - |
| status | VARCHAR | 30 | DEFAULT 'diterima' | 'diterima', 'diterima_sebagian', 'ditolak', 'direkonsiliasi', 'selesai' |
| nomor_surat_jalan | VARCHAR | 100 | - | - |
| catatan | TEXT | - | - | - |
| received_by | UUID | - | FK -> users.id | - |
| verified_by | UUID | - | FK -> users.id | - |
| verified_at | TIMESTAMPTZ | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.31 penerimaan_barang_item (TRX_PNI)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_penerimaan | UUID | - | FK -> penerimaan_barang.id | - |
| id_po_item | UUID | - | FK -> purchase_order_item.id | - |
| jumlah_dipesan | INT | - | NOT NULL | - |
| jumlah_diterima | INT | - | NOT NULL | - |
| jumlah_rusak | INT | - | DEFAULT 0 | - |
| jumlah_kurang | INT | - | DEFAULT 0 | - |
| kondisi | VARCHAR | 30 | DEFAULT 'baik' | 'baik', 'rusak', 'kurang', 'salah' |
| catatan | TEXT | - | - | - |

---

### 4.32 building_checklist_template (MST_BCT)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_kategori | UUID | - | FK -> building_checklist_kategori.id | - |
| kode_item | VARCHAR | 30 | UNIQUE, NOT NULL | CKL-001 |
| nama_item | VARCHAR | 255 | NOT NULL | "Cek kebersihan toilet" |
| frekuensi | VARCHAR | 20 | NOT NULL | 'harian', 'mingguan', 'bulanan' |
| wajib_foto | BOOLEAN | - | DEFAULT false | Wajib upload foto? |
| urutan | INT | - | DEFAULT 0 | Urutan tampilan |
| is_active | BOOLEAN | - | DEFAULT true | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.33 building_checklist_kategori (TRX_BCK)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nama | VARCHAR | 100 | NOT NULL | CCTV, Listrik, Internet, Air, dll |
| icon | VARCHAR | 50 | - | Icon |
| urutan | INT | - | DEFAULT 0 | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.34 building_checklist (TRX_BCL)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_template | UUID | - | FK -> building_checklist_template.id, NOT NULL | - |
| id_cabang | UUID | - | FK -> cabang.id, NOT NULL | - |
| id_gudang | UUID | - | FK -> gudang.id, NULLABLE | - |
| tanggal | DATE | - | NOT NULL | - |
| status | VARCHAR | 30 | NOT NULL | 'ok', 'issue', 'na' |
| keterangan | TEXT | - | - | - |
| foto_url | TEXT | - | - | - |
| checked_by | UUID | - | FK -> users.id | - |
| checked_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.35 building_issue (TRX_BIS)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| nomor_issue | VARCHAR | 30 | UNIQUE | ISS-2026-0001 |
| id_cabang | UUID | - | FK -> cabang.id, NOT NULL | - |
| id_gudang | UUID | - | FK -> gudang.id, NULLABLE | - |
| kategori | VARCHAR | 30 | NOT NULL | 'cctv', 'listrik', 'internet', 'air', 'kebersihan', 'keamanan', 'fasilitas' |
| deskripsi | TEXT | - | NOT NULL | - |
| prioritas | VARCHAR | 10 | DEFAULT 'medium' | 'low', 'medium', 'high', 'critical' |
| status | VARCHAR | 30 | DEFAULT 'dilaporkan' | 'dilaporkan', 'ditangani', 'selesai' |
| foto_url | TEXT | - | - | - |
| id_maintenance_ticket | UUID | - | FK -> maintenance_ticket.id | Jika ditindaklanjuti |
| reported_by | UUID | - | FK -> users.id | - |
| handled_by | UUID | - | FK -> users.id | - |
| handled_at | TIMESTAMPTZ | - | - | - |
| resolved_at | TIMESTAMPTZ | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

---

### 4.36 notifications (SYS_NOT)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_user | UUID | - | FK -> users.id, NOT NULL | Penerima notif |
| judul | VARCHAR | 255 | NOT NULL | - |
| pesan | TEXT | - | NOT NULL | - |
| modul | VARCHAR | 50 | - | Asset, Maintenance, dll |
| tipe | VARCHAR | 30 | DEFAULT 'info' | 'info', 'warning', 'success', 'error' |
| id_referensi | VARCHAR | 50 | - | ID record terkait |
| link | TEXT | - | - | URL terkait |
| is_read | BOOLEAN | - | DEFAULT false | - |
| read_at | TIMESTAMPTZ | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.37 audit_log (SYS_AUD)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_user | UUID | - | FK -> users.id, NULLABLE | User (NULL = system) |
| email_user | VARCHAR | 255 | - | Email user (redundant untuk history) |
| tipe_aksi | VARCHAR | 20 | NOT NULL | 'login', 'logout', 'insert', 'update', 'delete', 'approve', 'reject', 'mutasi', 'export', 'view' |
| modul | VARCHAR | 50 | NOT NULL | 'asset', 'maintenance', 'procurement', 'vendor', 'vehicle', 'building', 'master', 'auth', 'report' |
| nama_tabel | VARCHAR | 100 | - | Tabel yang diubah |
| id_record | VARCHAR | 50 | - | UUID record |
| data_lama | JSONB | - | - | Data sebelum diubah |
| data_baru | JSONB | - | - | Data setelah diubah |
| deskripsi | TEXT | - | - | Deskripsi aksi |
| ip_address | VARCHAR | 50 | - | IP asal |
| user_agent | TEXT | - | - | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

### 4.38 user_sessions (SYS_USS)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| id_user | UUID | - | FK -> users.id, NOT NULL | - |
| token | TEXT | - | NOT NULL | JWT token |
| ip_address | VARCHAR | 50 | - | - |
| user_agent | TEXT | - | - | - |
| login_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| logout_at | TIMESTAMPTZ | - | - | - |
| is_active | BOOLEAN | - | DEFAULT true | - |

### 4.39 system_settings (SYS_SET)

| Kolom | Type | Length | Constraint | Deskripsi |
|-------|------|--------|-----------|-----------|
| id | UUID | - | PK | - |
| key | VARCHAR | 100 | UNIQUE, NOT NULL | Setting key |
| value | TEXT | - | - | Setting value |
| kategori | VARCHAR | 50 | - | 'general', 'notification', 'sla', 'asset' |
| deskripsi | TEXT | - | - | - |
| updated_by | UUID | - | FK -> users.id | - |
| created_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |
| updated_at | TIMESTAMPTZ | - | DEFAULT NOW() | - |

---

## 5. MASTER DATA

### 5.1 Data Referensi Roles

| Kode | Nama | Level | System |
|------|------|-------|--------|
| SA | Super Admin | 99 | YES |
| HGA | Head General Affairs | 80 | YES |
| SGA | Staff General Affairs | 60 | YES |
| KCB | Kepala Cabang | 50 | YES |
| KGD | Kepala Gudang | 50 | YES |
| PCB | PIC Cabang | 40 | YES |
| PGD | PIC Gudang | 40 | YES |
| AUD | Auditor | 30 | YES |

### 5.2 Data Referensi Kategori Asset

| Kode | Nama | Masa Manfaat |
|------|------|-------------|
| IT | IT & Elektronik | 4 tahun |
| FURN | Furniture | 8 tahun |
| MESIN | Mesin & Peralatan | 10 tahun |
| KEND | Kendaraan | 8 tahun |
| BANG | Bangunan | 20 tahun |
| TANAH | Tanah | - (tidak disusutkan) |
| LAIN | Lainnya | 5 tahun |

### 5.3 Data Referensi Vendor Kategori

| Nama | Deskripsi |
|------|-----------|
| IT & Elektronik | Vendor komputer, printer, dll |
| Furniture | Vendor meja, kursi, lemari |
| ATK | Vendor alat tulis kantor |
| Maintenance | Vendor jasa perbaikan |
| Kebersihan | Vendor cleaning service |
| Keamanan | Vendor security |
| Catering | Vendor makanan |
| Transportasi | Vendor rental kendaraan |
| Konstruksi | Vendor renovasi gedung |
| Lainnya | Vendor umum |

### 5.4 Data Referensi Checklist Kategori

| Nama | Icon | Item Checklist |
|------|------|---------------|
| CCTV | camera-video | Kamera berfungsi, Rekaman tersimpan, Monitor |
| Listrik | lightning | Panel listrik, Lampu, Stop kontak, Genset |
| Internet | wifi | Koneksi WiFi, Router, Modem, Bandwidth |
| Air | droplet | Kran air, Toilet, Wastafel, Pipa, Tandon |
| Kebersihan | broom | Lantai, Meja, Kaca, Toilet, Parkir, Taman |
| Keamanan | shield | Pintu, Jendela, Pagar, Satpam, Buku tamu |
| AC | snowflake | Suhu, Filter, Outdoor unit, Kebocoran |
| Fire Safety | fire | APAR, Hydrant, Smoke detector, Sprinkler |
| Gudang | warehouse | Rak, Pallet, Atap, Dinding, Ventilasi |

---

## 6. TRANSACTION DATA

### 6.1 Kategorisasi Tabel

| Kategori | Tabel | Volume/Bulan | Retensi |
|----------|-------|-------------|---------|
| **High Volume** | audit_log, notifications, asset_penyusutan | 10.000+ | 5 tahun |
| **Medium Volume** | maintenance_ticket, maintenance_tracking, kendaraan_bbm | 1.000-5.000 | 5 tahun |
| **Low Volume** | asset, asset_mutasi, purchase_request, purchase_order | 100-500 | 10 tahun |
| **Reference** | cabang, gudang, users, vendor | 10-100 | Permanent |

### 6.2 Strategi Index

| Tabel | Index | Type |
|-------|-------|------|
| asset | (id_cabang, status) | B-tree |
| asset | (id_kategori) | B-tree |
| asset | (kode_asset) | UNIQUE |
| maintenance_ticket | (id_cabang, status) | B-tree |
| maintenance_ticket | (prioritas, sla_deadline) | B-tree |
| purchase_request | (id_cabang, status) | B-tree |
| audit_log | (id_user, created_at) | B-tree |
| audit_log | (modul, tipe_aksi) | B-tree |
| audit_log | (created_at) | BRIN (for range queries) |
| notifications | (id_user, is_read) | B-tree |

### 6.3 Row Level Security (RLS) Policy

```sql
-- Contoh RLS untuk tabel asset
-- Policy: Staff GA dan Head GA bisa melihat semua
-- Policy: PIC Cabang hanya bisa melihat aset cabangnya
-- Policy: PIC Gudang hanya bisa melihat aset gudangnya

CREATE POLICY asset_cabang_policy ON asset
  FOR ALL
  USING (
    id_cabang IN (
      SELECT id_cabang FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND id_role IN (
        SELECT id FROM roles WHERE kode IN ('SA', 'HGA', 'SGA', 'AUD')
      )
    )
  );
```

---

## 7. AUDIT & LOG DATA

### 7.1 Strategi Audit

| Level Audit | Tabel | Detail |
|-------------|-------|--------|
| **Full** | asset, asset_mutasi, asset_penghapusan | Simpan data_lama dan data_baru (JSONB) |
| **Standard** | purchase_request, purchase_order, maintenance_ticket | Simpan perubahan status + data baru |
| **Minimal** | master tables (cabang, vendor, user) | Simpan tipe aksi + id record |
| **Authentication** | user_sessions | Login/logout timestamp |

### 7.2 Retention Policy

| Tabel | Periode Retensi | Aksi |
|-------|----------------|------|
| audit_log | 5 tahun | Archive ke cold storage |
| notifications | 1 tahun | Hapus yang sudah dibaca > 6 bulan |
| user_sessions | 3 bulan | Hapus yang tidak aktif |
| asset_penyusutan | 10 tahun | Permanent (data aset) |

---

> **Lanjut ke: 06_DASHBOARD_REPORTING.md**
