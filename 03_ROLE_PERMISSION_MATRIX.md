# ROLE PERMISSION MATRIX
## General Affairs Enterprise System

---

**Dokumen Versi:** 1.0
**Tanggal:** 23 Juni 2026

---

## 1. LEGENDA

| Simbol | Arti |
|--------|------|
| C | Create - Membuat data baru |
| R | Read - Melihat / membaca data |
| U | Update - Mengubah data |
| D | Delete - Menghapus data |
| A | Approve - Menyetujui |
| RJ | Reject - Menolak |
| E | Export - Export PDF/Excel |
| V | View Dashboard - Melihat dashboard |
| - | Tidak memiliki akses |
| S | Self Only - Hanya data milik sendiri |

---

## 2. MATRIKS HAK AKSES PER MODUL

### 2.1 MASTER DATA

| ENTITY | FITUR | SUPER ADMIN | HEAD GA | STAFF GA | KEPALA CABANG | KEPALA GUDANG | PIC CABANG | PIC GUDANG | AUDITOR |
|--------|-------|:-----------:|:-------:|:--------:|:-------------:|:-------------:|:----------:|:----------:|:-------:|
| **Cabang** | Read | R | R | R | R | - | R | - | R |
| | Create | C | C | - | - | - | - | - | - |
| | Update | U | U | - | - | - | - | - | - |
| | Delete | D | - | - | - | - | - | - | - |
| **Gudang** | Read | R | R | R | - | R | - | R | R |
| | Create | C | C | - | - | - | - | - | - |
| | Update | U | U | U | - | - | - | - | - |
| | Delete | D | - | - | - | - | - | - | - |
| **User** | Read | R | R | R | R | R | S | S | R |
| | Create | C | C | - | - | - | - | - | - |
| | Update | U | U | S | - | - | S | S | - |
| | Delete | D | - | - | - | - | - | - | - |
| **Roles** | Full | CRUD | R | - | - | - | - | - | - |
| **Vendor** | Read | R | R | R | R | R | R | R | R |
| | Create | C | C | C | - | - | - | - | - |
| | Update | U | U | U | - | - | - | - | - |
| | Delete | D | D | - | - | - | - | - | - |
| | Approve | - | A/RJ | - | - | - | - | - | - |
| | Rating/Eval | - | C | CU | - | - | - | - | - |
| **Kategori Asset** | Read | R | R | R | R | R | R | R | R |
| | Manage | CRUD | CRUD | CRU | - | - | - | - | - |
| **Lokasi Asset** | Read | R | R | R | R | R | R | R | R |
| | Manage | CRUD | CRUD | CRU | - | - | - | - | - |
| **Kendaraan** | Read | R | R | R | R | R | R | R | R |
| | Manage | CRUD | CRUD | CRU | - | - | - | - | - |
| **Jenis Maintenance** | Read | R | R | R | R | R | R | R | R |
| | Manage | CRUD | CRUD | CRU | - | - | - | - | - |
| **Checklist Template** | Read | R | R | R | R | R | R | R | - |
| | Manage | CRUD | CRUD | CRU | - | - | - | - | - |

### 2.2 ASSET MANAGEMENT

| ENTITY | FITUR | SUPER ADMIN | HEAD GA | STAFF GA | KEPALA CABANG | KEPALA GUDANG | PIC CABANG | PIC GUDANG | AUDITOR |
|--------|-------|:-----------:|:-------:|:--------:|:-------------:|:-------------:|:----------:|:----------:|:-------:|
| **Asset** | Read | R | R | R | R | R | R | R | R |
| | Create | C | C | C | - | - | C | C | - |
| | Update | U | U | U | - | - | S | S | - |
| | Delete | D | D | D | - | - | - | - | - |
| | Approve | A/RJ | A/RJ | - | - | - | - | - | - |
| | Generate QR | U | U | U | - | - | - | - | - |
| | Upload Foto | C | C | C | - | - | C | C | - |
| **Mutasi** | Read | R | R | R | R | R | S | S | R |
| | Create | C | C | C | - | - | C | C | - |
| | Update | U | U | U | - | - | S | S | - |
| | Approve | A/RJ | A/RJ | - | A/RJ | A/RJ | - | - | - |
| | Delete | D | D | - | - | - | - | - | - |
| **Stock Opname** | Read | R | R | R | R | R | R | R | R |
| | Create | C | C | C | - | - | - | - | - |
| | Execute | - | - | - | - | - | C | C | - |
| | Verify | - | - | - | - | - | - | - | V |
| | Approve | - | A/RJ | - | - | - | - | - | - |
| **Penyusutan** | Manage | CRUD | CRUD | CRU | R | R | - | - | R |
| **Penghapusan** | Read | R | R | R | R | R | S | S | R |
| | Create | C | C | C | - | - | C | C | - |
| | Approve | A/RJ | A/RJ | - | - | - | - | - | - |
| **History Asset** | Read | R | R | R | R | R | R | R | R |

### 2.3 MAINTENANCE MANAGEMENT

| ENTITY | FITUR | SUPER ADMIN | HEAD GA | STAFF GA | KEPALA CABANG | KEPALA GUDANG | PIC CABANG | PIC GUDANG | AUDITOR |
|--------|-------|:-----------:|:-------:|:--------:|:-------------:|:-------------:|:----------:|:----------:|:-------:|
| **Ticket** | Read | R | R | R | R | R | S | S | R |
| | Create | C | C | C | C | C | C | C | - |
| | Update | U | U | U | U | U | S | S | - |
| | Delete | D | D | - | - | - | - | - | - |
| | Approve | A/RJ | A/RJ | - | A/RJ | A/RJ | - | - | - |
| | Assign Teknisi | U | U | U | - | - | - | - | - |
| | Assign Vendor | U | U | U | - | - | - | - | - |
| | Verify | - | - | - | - | - | V/RJ | V/RJ | - |
| | Close | A/RJ | A/RJ | - | - | - | - | - | - |
| | Upload Foto | C | C | C | - | - | C | C | - |
| **SLA** | View | R | R | R | R | R | - | - | R |
| **Jadwal PM** | Read | R | R | R | R | R | R | R | - |
| | Manage | CRUD | CRUD | CRUD | - | - | - | - | - |

### 2.4 PROCUREMENT MANAGEMENT

| ENTITY | FITUR | SUPER ADMIN | HEAD GA | STAFF GA | KEPALA CABANG | KEPALA GUDANG | PIC CABANG | PIC GUDANG | AUDITOR |
|--------|-------|:-----------:|:-------:|:--------:|:-------------:|:-------------:|:----------:|:----------:|:-------:|
| **PR** | Read | R | R | R | R | R | S | S | R |
| | Create | C | C | C | C | C | C | C | - |
| | Update | U | U | U | U | U | S | S | - |
| | Delete | D | D | - | - | - | - | - | - |
| | Approve Kacab | - | - | - | A/RJ | - | - | - | - |
| | Approve HGA | A/RJ | A/RJ | - | - | - | - | - | - |
| **PO** | Read | R | R | R | R | R | R | R | R |
| | Create | C | C | C | - | - | - | - | - |
| | Update | U | U | U | - | - | - | - | - |
| | Delete | D | D | - | - | - | - | - | - |
| | Send to Vendor | U | U | U | - | - | - | - | - |
| **Penerimaan** | Read | R | R | R | R | R | S | S | R |
| | Create | C | C | C | - | - | C | C | - |
| | Update | U | U | U | - | - | S | S | - |
| | Verify | - | - | V | - | - | - | - | - |

### 2.5 VEHICLE MANAGEMENT

| ENTITY | FITUR | SUPER ADMIN | HEAD GA | STAFF GA | KEPALA CABANG | KEPALA GUDANG | PIC CABANG | PIC GUDANG | AUDITOR |
|--------|-------|:-----------:|:-------:|:--------:|:-------------:|:-------------:|:----------:|:----------:|:-------:|
| **Kendaraan** | Full | CRUD | CRUD | CRU | R | R | R | R | R |
| **Service** | Read | R | R | R | R | R | R | R | R |
| | Manage | CRUD | CRUD | CRUD | - | - | CU | CU | - |
| **BBM** | Read | R | R | R | R | R | R | R | R |
| | Manage | CRUD | CRUD | CRUD | - | - | CU | CU | - |
| **Booking** | Read | R | R | R | R | R | S | S | R |
| | Create | C | C | C | C | C | C | C | - |
| | Approve | A/RJ | A/RJ | A/RJ | A/RJ | A/RJ | - | - | - |
| **Reminder** | Manage | CRUD | CRUD | CRUD | R | R | R | R | - |

### 2.6 BUILDING & FACILITY

| ENTITY | FITUR | SUPER ADMIN | HEAD GA | STAFF GA | KEPALA CABANG | KEPALA GUDANG | PIC CABANG | PIC GUDANG | AUDITOR |
|--------|-------|:-----------:|:-------:|:--------:|:-------------:|:-------------:|:----------:|:----------:|:-------:|
| **Checklist** | Read | R | R | R | R | R | R | R | R |
| | Execute | C | C | C | - | - | CU | CU | - |
| | Verify | V | V | V | - | - | - | - | - |
| **Issue** | Read | R | R | R | R | R | R | R | - |
| | Report | C | C | C | C | C | C | C | - |
| | Tindak Lanjut | U | U | U | - | - | - | - | - |

---

## 3. SUMMARY VISIBILITY PER ROLE

| Role | Cakupan Data |
|------|-------------|
| **Super Admin** | Seluruh data, seluruh cabang, seluruh gudang |
| **Head GA** | Seluruh data, seluruh cabang, seluruh gudang |
| **Staff GA** | Seluruh data operasional, seluruh cabang, seluruh gudang |
| **Kepala Cabang** | Data cabang sendiri (cabang tempat bertugas) |
| **Kepala Gudang** | Data gudang sendiri (gudang tempat bertugas) |
| **PIC Cabang** | Data cabang sendiri + data yang dibuat sendiri |
| **PIC Gudang** | Data gudang sendiri + data yang dibuat sendiri |
| **Auditor** | Seluruh data (READ ONLY), tidak bisa membuat transaksi |

---

## 4. HIERARKI APPROVAL

| Transaksi | Level 1 | Level 2 (Jika perlu) | Final |
|-----------|---------|---------------------|-------|
| **Asset Registration** | Staff GA (Verifikasi) | Head GA (Approve) | - |
| **Asset Mutation (Cabang)** | Kepala Cabang Asal | Kepala Cabang Tujuan | Staff GA |
| **Asset Mutation (Gudang)** | Kepala Gudang Asal | Kepala Gudang Tujuan | Staff GA |
| **Asset Disposal** | Head GA | - | - |
| **Stock Opname** | Staff GA (Laporan) | Head GA (Approve) | Auditor (Verifikasi) |
| **Maintenance (Low/Med)** | Staff GA (Assign) | - | PIC (Verify) |
| **Maintenance (High/Critical)** | Kepala Unit (Approve) | Staff GA (Assign) | PIC (Verify) |
| **PR (Nilai < 5jt)** | Kepala Cabang | - | Head GA |
| **PR (Nilai 5-25jt)** | Kepala Cabang | Head GA | - |
| **PR (Nilai > 25jt)** | Kepala Cabang | Head GA | Direktur (External) |
| **PO (semua)** | Staff GA (Buat) | - | Head GA (Tandatangan) |
| **Vendor Registration** | Staff GA (Input) | - | Head GA (Approve) |
| **Vehicle Booking** | Staff GA / Kepala Unit | - | - |
| **Vendor Evaluation** | Staff GA (Nilai) | - | Head GA (Approve) |

---

> **Lanjut ke: 04_MENU_SITEMAP.md**
