# WORKFLOW BISNIS - GENERAL AFFAIRS ENTERPRISE

---

**Dokumen Versi:** 1.0
**Tanggal:** 23 Juni 2026
**Author:** Senior Business Analyst & System Architect

---

## DAFTAR ISI

1. [Asset Management](#1-asset-management)
2. [Maintenance Management](#2-maintenance-management)
3. [Procurement Management](#3-procurement-management)
4. [Vendor Management](#4-vendor-management)
5. [Vehicle Management](#5-vehicle-management)
6. [Building & Facility Management](#6-building--facility-management)

---

## FORMAT WORKFLOW

Setiap workflow akan mencakup:

| Elemen | Deskripsi |
|--------|-----------|
| **Aktor** | Pihak yang terlibat dalam proses |
| **Trigger** | Kejadian yang memulai proses |
| **Proses** | Langkah-langkah detail |
| **Approval Point** | Titik di mana persetujuan diperlukan |
| **Status Flow** | Status yang dilalui |
| **Output** | Hasil dari proses |
| **Notifikasi** | Pemberitahuan yang dikirim |
| **SLA** | Target waktu penyelesaian |

---

## 1. ASSET MANAGEMENT

### 1.1 REGISTRASI ASSET

**Deskripsi:** Proses pencatatan dan aktivasi aset baru ke dalam sistem.

#### Flow Diagram (Textual)

```
PIC CABANG/GUDANG               STAFF GA                  HEAD GA
     │                              │                         │
     │ [1] Ajukan Reg Aset          │                         │
     │     - Data Aset              │                         │
     │     - Upload Foto            │                         │
     │───────►                       │                         │
     │                              │ [2] Verifikasi Data     │
     │                              │     - Validasi          │
     │                              │     - Generate Kode     │
     │                              │     - Generate QR       │
     │                              │                         │
     │                              │ [3] Approval?           │
     │                              │     ├─ Ya ─────────────► │
     │                              │     │                    │ [4] Approve/Reject
     │                              │     │◄───────────────── │
     │                              │     │                    │
     │                              │ [5] Aktivasi Aset       │
     │                              │     - Status: AKTIF      │
     │◄─────────────────────────────│                         │
     │ [6] Notifikasi               │                         │
     │     - Aset Aktif             │                         │
```

#### Detail Workflow

| Step | Proses | Aktor | Status Asset | Aksi Sistem |
|------|--------|-------|-------------|-------------|
| 1 | PIC mengisi form registrasi aset (nama, kategori, merek, model, seri, harga, lokasi, upload foto) | PIC Cabang / PIC Gudang | DRAFT | Simpan draft, notifikasi ke Staff GA |
| 2 | Staff GA memverifikasi kelengkapan data, mencocokkan dengan fisik (jika ada) | Staff GA | DRAFT | Staff GA dapat edit/melengkapi data |
| 3 | Staff GA mengajukan approval ke Head GA | Staff GA | MENUNGGU_APPROVAL | Generate kode aset sementara, kirim notifikasi ke Head GA |
| 4a | **Approval**: Head GA menyetujui | Head GA | AKTIF | Generate kode aset final, generate QR code, set status AKTIF |
| 4b | **Rejection**: Head GA menolak (beri alasan) | Head GA | DITOLAK | Kembali ke Staff GA untuk revisi |
| 5 | Sistem mencatat nilai perolehan dan menghitung penyusutan awal | Sistem | AKTIF | Generate jadwal penyusutan |
| 6 | Notifikasi dikirim ke PIC bahwa aset sudah aktif | Sistem | - | Kirim notifikasi + QR Code |

#### Output
- Kode Asset unik (format: AST-XXX-YYYY-NNNNN)
- QR Code Asset (berisi kode aset + link detail)
- Foto Asset tersimpan di Supabase Storage
- Data penyusutan awal tercatat
- Histori asset: "Asset Created"

#### Notifikasi yang Dikirim
| Event | Ke | Channel |
|-------|----|---------|
| Registrasi baru | Staff GA | In-app |
| Menunggu approval | Head GA | In-app + Email |
| Asset disetujui | PIC + Staff GA | In-app |
| Asset ditolak | PIC + Staff GA | In-app |

#### SLA
- Verifikasi Staff GA: **1x24 jam** sejak registrasi
- Approval Head GA: **2x24 jam** sejak diajukan

---

### 1.2 APPROVAL ASSET

**Deskripsi:** Proses persetujuan registrasi aset baru oleh Head GA.

#### Detail Workflow

| Step | Proses | Aktor | Status |
|------|--------|-------|--------|
| 1 | Head GA melihat daftar aset menunggu approval | Head GA | MENUNGGU_APPROVAL |
| 2 | Head GA review detail aset (data, foto, kelengkapan) | Head GA | MENUNGGU_APPROVAL |
| 3a | **Setuju**: Klik Approve | Head GA | AKTIF |
| 3b | **Tolak**: Klik Reject + isi alasan | Head GA | DITOLAK |
| 4 | Sistem generate QR Code untuk aset yang disetujui | Sistem | AKTIF |
| 5 | QR Code tersedia untuk di-download / dicetak | Sistem | - |

#### Status Asset
```
DRAFT ──► MENUNGGU_APPROVAL ──► AKTIF
                                └──► DITOLAK
```

---

### 1.3 MUTASI ASSET

**Deskripsi:** Proses pemindahan aset antar cabang, antar gudang, atau antar lokasi.

#### Flow Diagram

```
PIC ASAL                 KEPALA UNIT ASAL        STAFF GA             PIC TUJUAN
   │                          │                      │                     │
   │ [1] Ajukan Mutasi        │                      │                     │
   │     - Pilih Aset         │                      │                     │
   │     - Tujuan             │                      │                     │
   │     - Alasan             │                      │                     │
   │───►                      │                      │                     │
   │                          │ [2] Approve/Reject   │                     │
   │                          │     Asal             │                     │
   │                          │───►                  │                     │
   │                          │                      │ [3] Proses Mutasi   │
   │                          │                      │     - Update Lokasi │
   │                          │                      │     - Catat Histori │
   │                          │                      │───►                  │
   │                          │                      │                     │ [4] Terima Aset
   │                          │                      │                     │     - Konfirmasi
   │                          │                      │◄────────────────── │
   │                          │                      │                     │
   │                          │                      │ [5] Selesai         │
   │◄─────────────────────────│──────────────────────│──────────────────── │
```

#### Detail Workflow

| Step | Proses | Aktor | Status Mutasi | Status Asset |
|------|--------|-------|---------------|--------------|
| 1 | PIC mengajukan mutasi (pilih aset, tentukan tujuan, isi alasan) | PIC Asal | DIAJUKAN | AKTIF |
| 2a | **Approval**: Kepala unit asal menyetujui | Kepala Cabang / Kepala Gudang | DISETUJUI | DALAM_MUTASI |
| 2b | **Rejection**: Kepala unit asal menolak | Kepala Cabang / Kepala Gudang | DITOLAK | AKTIF |
| 3 | Staff GA memproses mutasi di sistem, mengupdate lokasi | Staff GA | DIPROSES | DALAM_MUTASI |
| 4 | PIC tujuan mengkonfirmasi penerimaan aset | PIC Tujuan | DITERIMA | AKTIF (lokasi baru) |
| 5 | Sistem mencatat histori dan mengirim notifikasi selesai | Sistem | SELESAI | AKTIF |

#### Notifikasi
| Event | Ke | Pesan |
|-------|----|-------|
| Mutasi diajukan | Kepala Unit Asal | "Mutasi aset X ke Y diajukan" |
| Mutasi disetujui | Staff GA | "Mutasi aset X ke Y disetujui, proses pengiriman" |
| Mutasi ditolak | PIC Asal | "Mutasi aset X ditolak: alasan" |
| Menunggu konfirmasi | PIC Tujuan | "Konfirmasi penerimaan aset X dari Y" |
| Mutasi selesai | Semua terkait | "Mutasi aset X selesai" |

#### SLA
- Approval Kepala Unit: **1x24 jam**
- Proses Staff GA: **3x24 jam**
- Konfirmasi PIC Tujuan: **2x24 jam**

---

### 1.4 STOCK OPNAME

**Deskripsi:** Proses pencocokan data aset di sistem dengan kondisi fisik di lapangan.

#### Flow Diagram

```
HEAD GA                    STAFF GA                 PIC CAB/GUDANG          AUDITOR
   │                          │                          │                    │
   │ [1] Buat Jadwal          │                          │                    │
   │     Opname               │                          │                    │
   │───►                      │                          │                    │
   │                          │ [2] Persiapan Opname     │                    │
   │                          │     - Generate List Aset │                    │
   │                          │     - Assign Tim         │                    │
   │                          │───►                      │                    │
   │                          │                          │ [3] Cek Fisik      │
   │                          │                          │     - Scan QR      │
   │                          │                          │     - Catat Kondisi│
   │                          │                          │     - Foto         │
   │                          │                          │───►                │
   │                          │                          │                    │ [4] Verifikasi
   │                          │                          │                    │     - Sampling
   │                          │                          │◄────────────────── │
   │                          │◄─────────────────────────│                    │
   │                          │ [5] Rekonsiliasi         │                    │
   │                          │     - Selisih?           │                    │
   │                          │     - Buat Laporan       │                    │
   │◄─────────────────────────│                          │                    │
   │ [6] Approve Hasil        │                          │                    │
   │     Opname               │                          │                    │
```

#### Detail Workflow

| Step | Proses | Aktor | Status Opname |
|------|--------|-------|---------------|
| 1 | Head GA membuat jadwal stock opname (cabang/gudang, rentang tanggal) | Head GA | DRAFT |
| 2 | Staff GA mempersiapkan: generate list aset, cetak form/scan QR | Staff GA | BERLANGSUNG |
| 3 | PIC melakukan pengecekan fisik: scan QR, catat kondisi, foto jika ada selisih | PIC Cabang / PIC Gudang | BERLANGSUNG |
| 4 | Auditor melakukan verifikasi sampling (min 10% aset) | Auditor | BERLANGSUNG |
| 5 | Staff GA melakukan rekonsiliasi data sistem dengan temuan lapangan | Staff GA | REKONSILIASI |
| 6 | Head GA menyetujui hasil opname | Head GA | SELESAI / DIBATALKAN |

#### Output
- Laporan hasil stock opname
- Daftar selisih (jika ada): aset hilang, rusak, tidak ditemukan
- Rekomendasi tindak lanjut

#### Notifikasi
| Event | Ke |
|-------|----|
| Jadwal opname dibuat | Staff GA, PIC, Auditor |
| Opname dimulai | Semua terkait |
| Ada selisih > threshold | Head GA |
| Opname selesai | Head GA |

---

### 1.5 PENGHAPUSAN ASSET (DISPOSAL)

**Deskripsi:** Proses penghapusan aset dari sistem karena dijual, hilang, atau rusak total.

#### Workflow Detail

| Step | Proses | Aktor | Status Penghapusan | Status Asset |
|------|--------|-------|-------------------|-------------|
| 1 | PIC/Staff mengajukan penghapusan (pilih aset, tipe: jual/hapus, alasan, upload dokumen) | PIC / Staff GA | DIAJUKAN | AKTIF |
| 2 | Head GA melakukan review dan approval | Head GA | DISETUJUI / DITOLAK | MENUNGGU / AKTIF |
| 3 | Finance / terkait memverifikasi (jika dijual: nilai penjualan) | Staff GA | DIPROSES | DALAM_PROSES |
| 4 | Aset dihapus dari list aset aktif | Sistem | SELESAI | DIJUAL / DIHAPUS |

#### Notifikasi
- Pengajuan disposal → Head GA
- Disposal disetujui → Staff GA, PIC
- Disposal selesai → Semua terkait

---

### 1.6 PENYUSUTAN ASSET

**Deskripsi:** Proses perhitungan penurunan nilai aset secara periodik (bulanan).

#### Workflow Detail

| Step | Proses | Aktor | Keterangan |
|------|--------|-------|------------|
| 1 | Sistem menghitung penyusutan otomatis setiap bulan | Sistem | Berdasarkan metode garis lurus (straight-line) |
| 2 | Staff GA mereview hasil penyusutan | Staff GA | Memastikan tidak ada anomali |
| 3 | Head GA mengesahkan penyusutan bulanan | Head GA | Approval hasil perhitungan |
| 4 | Sistem mengupdate nilai buku aset | Sistem | Nilai buku = harga perolehan - akumulasi penyusutan |

#### Metode Penyusutan
- **Metode**: Straight Line (Garis Lurus)
- **Rumus**: (Harga Perolehan - Nilai Residu) / Masa Manfaat
- **Periode**: Bulanan
- **Masa Manfaat**: Berdasarkan kategori aset (IT: 4 thn, Furniture: 8 thn, Mesin: 10 thn, Kendaraan: 8 thn, Bangunan: 20 thn)

---

## 2. MAINTENANCE MANAGEMENT

### 2.1 CORRECTIVE MAINTENANCE (TICKETING)

**Deskripsi:** Proses pelaporan dan perbaikan aset yang rusak/mengalami masalah.

#### Flow Diagram

```
PIC CAB/GUDANG         KEPALA CAB/GUDANG         STAFF GA              TEKNISI/VENDOR
     │                        │                      │                      │
     │ [1] Buat Ticket        │                      │                      │
     │     - Pilih Aset       │                      │                      │
     │     - Deskripsi        │                      │                      │
     │     - Prioritas        │                      │                      │
     │     - Upload Foto      │                      │                      │
     │───►                    │                      │                      │
     │                        │ [2] Approve/Reject  │                      │
     │                        │───►                  │                      │
     │                        │                      │ [3] Assign Teknisi   │
     │                        │                      │     / Vendor         │
     │                        │                      │     - Tentukan SLA   │
     │                        │                      │───►                  │
     │                        │                      │                      │ [4] Mulai Perbaikan
     │                        │                      │                      │     - Update Status
     │                        │                      │                      │     - Catat Progress
     │                        │                      │                      │───►
     │                        │                      │◄────────────────── │
     │                        │                      │ [5] Update Hasil    │
     │                        │                      │     - Upload Foto   │
     │                        │                      │                      │
     │◄───────────────────────│──────────────────────│                      │
     │ [6] Verifikasi         │                      │                      │
     │     - Cek Hasil        │                      │                      │
     │     - Approve/Reject   │                      │                      │
     │───►                    │                      │                      │
     │                        │                      │ [7] Close Ticket    │
     │                        │                      │     - Catat Biaya   │
     │                        │                      │     - Update Status │
     │                        │                      │       Aset          │
```

#### Detail Workflow

| Step | Proses | Aktor | Status Ticket | Status Aset | SLA |
|------|--------|-------|---------------|-------------|-----|
| 1 | PIC membuat ticket (pilih aset, deskripsi kerusakan, prioritas, upload foto) | PIC Cabang / PIC Gudang | DIBUAT | AKTIF | - |
| 2a | **Approval**: Kepala unit menyetujui | Kepala Cabang / Kepala Gudang | DISETUJUI | AKTIF | 1x24 jam |
| 2b | **Rejection**: Kepala unit menolak | Kepala Cabang / Kepala Gudang | DITOLAK | AKTIF | 1x24 jam |
| 3 | Staff GA Menugaskan ke teknisi internal atau vendor | Staff GA | DITUGASKAN | AKTIF | 4 jam |
| 4 | Teknisi memulai pengerjaan, update progress | Teknisi / Vendor | DIKERJAKAN | PERBAIKAN | Sesuai SLA |
| 5 | Teknisi menyelesaikan, upload foto hasil perbaikan | Teknisi / Vendor | SELESAI | PERBAIKAN | Sesuai SLA |
| 6a | **Verifikasi**: PIC memverifikasi hasil perbaikan | PIC | DIIVERIFIKASI | AKTIF | 1x24 jam |
| 6b | **Reject**: PIC meminta perbaikan ulang | PIC | DIKERJAKAN | PERBAIKAN | - |
| 7 | Staff GA menutup ticket, mencatat biaya | Staff GA | CLOSED | AKTIF | 1x24 jam |

#### Prioritas dan SLA

| Prioritas | Kode | Target Respon | Target Perbaikan |
|-----------|------|---------------|------------------|
| Low | LOW | 2x24 jam | 5 hari kerja |
| Medium | MED | 1x24 jam | 3 hari kerja |
| High | HGH | 4 jam | 1x24 jam |
| Critical | CRT | 1 jam | 4 jam |

#### Notifikasi
| Step | Event | Ke |
|------|-------|----|
| 1 | Ticket dibuat | Kepala Unit + Staff GA |
| 2 | Ticket disetujui | Staff GA (untuk assign) |
| 2 | Ticket ditolak | PIC |
| 3 | Ada penugasan baru | Teknisi / Vendor |
| 4 | Pengerjaan dimulai | Staff GA |
| 5 | Perbaikan selesai | PIC (untuk verifikasi) |
| 6 | Verifikasi ok | Staff GA (untuk close) |
| 6 | Perbaikan ditolak | Teknisi |
| 7 | Ticket closed | Semua terkait |
| - | SLA overdue | Staff GA + Head GA |

---

### 2.2 PREVENTIVE MAINTENANCE

**Deskripsi:** Proses perawatan terjadwal untuk mencegah kerusakan aset.

#### Detail Workflow

| Step | Proses | Aktor | Keterangan |
|------|--------|-------|------------|
| 1 | Staff GA membuat jadwal PM berdasarkan kategori/jenis aset | Staff GA | Bulanan, triwulan, semester, tahunan |
| 2 | Head GA menyetujui jadwal PM | Head GA | - |
| 3 | Sistem mengingatkan H-7, H-3, H-1 sebelum jadwal | Sistem | Notifikasi otomatis |
| 4 | PIC/Staff mempersiapkan aset untuk PM | PIC / Staff GA | - |
| 5 | Teknisi melaksanakan PM sesuai checklist | Teknisi | - |
| 6 | PIC memverifikasi hasil PM | PIC | - |
| 7 | Staff GA mengupdate jadwal PM berikutnya | Staff GA | Otomatis berdasarkan interval |

#### Status PM Ticket
```
JADWAL ──► READY ──► ON_PROGRESS ──► COMPLETED ──► VERIFIED
                                           └──► RESCHEDULE
```

---

## 3. PROCUREMENT MANAGEMENT

### 3.1 PURCHASE REQUEST → PURCHASE ORDER → PENERIMAAN

**Deskripsi:** Proses pengadaan barang/jasa dari permintaan hingga penerimaan.

#### Flow Diagram

```
PIC CAB/GUDANG         KEPALA CABANG          HEAD GA              STAFF GA        VENDOR
     │                      │                     │                    │              │
     │ [1] Buat PR          │                     │                    │              │
     │     - Pilih Barang   │                     │                    │              │
     │     - Jumlah         │                     │                    │              │
     │     - Estimasi Harga │                     │                    │              │
     │     - Urgensi        │                     │                    │              │
     │───►                  │                     │                    │              │
     │                      │ [2] Approve Kacab  │                    │              │
     │                      │───►                 │                    │              │
     │                      │                     │ [3] Approve HGA   │              │
     │                      │                     │───►                │              │
     │                      │                     │                    │ [4] Buat PO  │
     │                      │                     │                    │     - Pilih  │
     │                      │                     │                    │       Vendor │
     │                      │                     │                    │     - Negos  │
     │                      │                     │                    │       Harga  │
     │                      │                     │                    │───►          │
     │                      │                     │                    │              │ [5] Kirim
     │                      │                     │                    │              │     Barang
     │                      │                     │                    │◄─────────── │
     │◄─────────────────────│─────────────────────│────────────────────│              │
     │ [6] Terima Barang    │                     │                    │              │
     │     - Cek Fisik      │                     │                    │              │
     │     - Cocokkan PO    │                     │                    │              │
     │     - Catat Kondisi  │                     │                    │              │
     │───►                  │                     │                    │              │
     │                      │                     │                    │ [7] Closed   │
     │                      │                     │                    │     - Rekons │
     │                      │                     │                    │     - Catat  │
     │                      │                     │                    │       Aset   │
```

#### Detail Workflow PR

| Step | Proses | Aktor | Status PR |
|------|--------|-------|-----------|
| 1 | PIC membuat PR (nama barang, spesifikasi, jumlah, estimasi harga, urgensi, upload dokumen pendukung) | PIC Cabang / PIC Gudang | DRAFT → DIAJUKAN |
| 2a | **Approval Kacab**: Kepala Cabang menyetujui (khusus PR cabang) | Kepala Cabang | DISETUJUI_KACAB |
| 2b | **Reject Kacab**: Kepala Cabang menolak | Kepala Cabang | DITOLAK |
| 3a | **Approval HGA**: Head GA menyetujui | Head GA | DISETUJUI_HGA |
| 3b | **Reject HGA**: Head GA menolak | Head GA | DITOLAK |
| 4 | PR masuk antrian untuk dibuatkan PO | Sistem | APPROVED |

#### Detail Workflow PO

| Step | Proses | Aktor | Status PO |
|------|--------|-------|-----------|
| 1 | Staff GA memilih PR yang sudah approved, memilih vendor, negosiasi harga | Staff GA | DRAFT |
| 2 | PO dikirim ke vendor (via email/system) | Staff GA | DIKIRIM |
| 3 | Vendor mengkonfirmasi PO (opsional) | Vendor | DIKONFIRMASI |
| 4 | Barang dikirim vendor | Vendor | DALAM_PENGIRIMAN |

#### Detail Workflow Penerimaan

| Step | Proses | Aktor | Status Penerimaan |
|------|--------|-------|-------------------|
| 1 | PIC menerima barang, melakukan pengecekan fisik (jumlah, kondisi, spesifikasi) | PIC Cabang / PIC Gudang | DITERIMA |
| 2 | Jika ada ketidaksesuaian, PIC mencatat (jumlah kurang, barang rusak, salah spesifikasi) | PIC | DITERIMA_DENGAN_CATATAN |
| 3 | Staff GA melakukan rekonsiliasi dengan PO | Staff GA | DIIREKONSILIASI |
| 4 | Jika aset: Staff GA melakukan registrasi aset dari penerimaan | Staff GA | - |
| 5 | Proses procurement selesai | Sistem | CLOSED |

#### Status Flow
```
PR:
DRAFT ──► DIAJUKAN ──► DISETUJUI_KACAB ──► DISETUJUI_HGA ──► APPROVED
                         └──► DITOLAK        └──► DITOLAK

PO:
DRAFT ──► DIKIRIM ──► DIKONFIRMASI ──► DALAM_PENGIRIMAN ──► SELESAI ──► CLOSED

PENERIMAAN:
DIJADWALKAN ──► DITERIMA ──► DIIREKONSILIASI ──► CLOSED
                    └──► DITERIMA_DENGAN_CATATAN
```

#### Notifikasi
| Event | Ke |
|-------|----|
| PR diajukan | Kepala Cabang |
| PR disetujui Kacab | Head GA |
| PR ditolak | PIC + Staff GA |
| PR approved penuh | Staff GA |
| PO diterbitkan | Vendor |
| Barang dikirim | PIC |
| Barang diterima | Staff GA |
| Ada ketidaksesuaian | Staff GA + Head GA |

#### SLA
| Proses | SLA |
|--------|-----|
| Approval Kacab | 1x24 jam |
| Approval HGA | 2x24 jam |
| Pembuatan PO | 3x24 jam sejak PR approved |
| Pengiriman vendor | Sesuai kontrak |
| Penerimaan & laporan | 1x24 jam sejak barang sampai |

---

## 4. VENDOR MANAGEMENT

### 4.1 REGISTRASI VENDOR

**Deskripsi:** Proses pendaftaran vendor baru ke dalam database vendor.

#### Detail Workflow

| Step | Proses | Aktor | Status Vendor |
|------|--------|-------|---------------|
| 1 | Staff GA mengisi data vendor (nama, kontak, kategori, NPWP, rekening, alamat) | Staff GA | DRAFT |
| 2 | Staff GA mengupload dokumen pendukung (SIUP, NPWP, Akta, Domisili) | Staff GA | DRAFT |
| 3 | Head GA melakukan review dan approval | Head GA | DIAJUKAN |
| 4a | **Approval**: Head GA menyetujui | Head GA | AKTIF |
| 4b | **Rejection**: Head GA menolak (beri alasan) | Head GA | DITOLAK |
| 5 | Vendor masuk database vendor aktif | Sistem | AKTIF |

---

### 4.2 EVALUASI VENDOR

**Deskripsi:** Proses penilaian kinerja vendor secara periodik.

#### Detail Workflow

| Step | Proses | Aktor | Keterangan |
|------|--------|-------|------------|
| 1 | Staff GA membuat jadwal evaluasi vendor (kuartalan/tahunan) | Staff GA | - |
| 2 | Head GA menentukan kriteria evaluasi | Head GA | Kualitas, harga, ketepatan waktu, responsivitas |
| 3 | Staff GA mengisi penilaian berdasarkan data historis | Staff GA | Skor 1-100 per kriteria |
| 4 | Head GA mereview dan mengesahkan hasil evaluasi | Head GA | - |
| 5 | Sistem mengupdate rating vendor | Sistem | Average skor |

#### Kriteria Penilaian

| No | Kriteria | Bobot |
|----|----------|-------|
| 1 | Kualitas Barang/Jasa | 30% |
| 2 | Ketepatan Waktu Pengiriman | 25% |
| 3 | Harga Kompetitif | 20% |
| 4 | Responsivitas & Komunikasi | 15% |
| 5 | Kepatuhan Kontrak | 10% |

---

### 4.3 KONTRAK VENDOR

**Deskripsi:** Proses pengelolaan kontrak dengan vendor.

#### Alur Kontrak
1. Staff GA membuat kontrak baru → DRAFT
2. Head GA review kontrak → REVIEW
3. Kontrak ditandatangani → AKTIF
4. Sistem memonitor masa berlaku → AKTIF
5. H-30 otomatis reminder perpanjangan → AKTIF
6. Kontrak berakhir → EXPIRED
7. Diperpanjang / Terminasi

---

## 5. VEHICLE MANAGEMENT

### 5.1 BOOKING KENDARAAN

**Deskripsi:** Proses pemesanan kendaraan operasional oleh karyawan.

#### Detail Workflow

| Step | Proses | Aktor | Status Booking |
|------|--------|-------|---------------|
| 1 | PIC/Staff mengisi booking (pilih kendaraan, tanggal, tujuan, driver) | PIC / Staff | DIAJUKAN |
| 2 | Sistem cek ketersediaan kendaraan | Sistem | DIAJUKAN |
| 3a | **Approval**: Kepala unit / Staff GA menyetujui | Kepala Unit / Staff GA | DISETUJUI |
| 3b | **Rejection**: Ditolak (kendaraan tidak tersedia / alasan lain) | Kepala Unit / Staff GA | DITOLAK |
| 4 | Pengguna menggunakan kendaraan | Pengguna | DIGUNAKAN |
| 5 | Pengguna mengembalikan kendaraan, laporan kondisi | Pengguna | SELESAI |

---

### 5.2 PENCATATAN BBM

**Deskripsi:** Pencatatan pengisian bahan bakar kendaraan.

#### Detail Workflow
| Step | Proses | Aktor |
|------|--------|-------|
| 1 | Pengguna mengisi BBM | Pengguna |
| 2 | Pengguna mencatat (tanggal, liter, harga, km, jenis BBM) | Pengguna / PIC |
| 3 | Staff GA memverifikasi (jika diperlukan) | Staff GA |
| 4 | Sistem update riwayat BBM | Sistem |

---

### 5.3 SERVICE BERKALA

**Deskripsi:** Perawatan rutin kendaraan sesuai jadwal.

#### Detail Workflow
| Step | Proses | Aktor |
|------|--------|-------|
| 1 | Sistem reminder H-7 berdasarkan jadwal / kilometer | Sistem |
| 2 | Staff GA menjadwalkan service ke bengkel | Staff GA |
| 3 | Kendaraan dibawa ke bengkel | Driver |
| 4 | Bengkel melakukan service | Bengkel |
| 5 | PIC/Staff mencatat hasil service (biaya, kilometer, service berikutnya) | Staff GA |
| 6 | Sistem update jadwal berikutnya | Sistem |

#### Jadwal Service
| Tipe Service | Interval |
|-------------|----------|
| Service Ringan (ganti oli) | Setiap 5.000 km atau 3 bulan |
| Service Sedang | Setiap 10.000 km atau 6 bulan |
| Service Besar | Setiap 20.000 km atau 12 bulan |

---

### 5.4 PAJAK DAN STNK

**Deskripsi:** Monitoring masa berlaku pajak dan STNK kendaraan.

#### Detail Workflow
| Step | Proses | Aktor |
|------|--------|-------|
| 1 | Sistem menyimpan data STNK dan pajak saat registrasi kendaraan | Staff GA |
| 2 | Sistem mengirim reminder H-30, H-14, H-7 | Sistem |
| 3 | Staff GA mengurus perpanjangan | Staff GA |
| 4 | Staff GA mengupdate masa berlaku baru | Staff GA |
| 5 | Sistem reset counter reminder | Sistem |

---

## 6. BUILDING & FACILITY MANAGEMENT

### 6.1 CHECKLIST GEDUNG / GUDANG

**Deskripsi:** Pengecekan rutin kondisi gedung dan fasilitas.

#### Format Checklist per Kategori

| Kategori | Item Checklist | Frekuensi |
|----------|---------------|-----------|
| **CCTV** | Kamera berfungsi, rekaman tersimpan, monitor berfungsi | Harian |
| **Listrik** | Panel listrik, lampu, stop kontak, genset, stabilizer | Harian |
| **Internet** | Koneksi wifi, kabel LAN, router, modem, bandwidth | Harian |
| **Air** | Kran air, toilet, wastafel, pipa, tandon air | Harian |
| **Kebersihan** | Lantai, meja, kaca, toilet, area parkir, taman | Harian |
| **Keamanan** | Pintu, jendela, pagar, satpam, buku tamu, alarm | Harian |
| **AC** | Suhu, kebocoran, filter, outdoor unit | Mingguan |
| **Fire Safety** | APAR, hydrant, detektor asap, sprinkler, jalur evakuasi | Bulanan |
| **Elevator** | Fungsi tombol, penerangan, keamanan pintu | Harian (jika ada) |
| **Parkir** | Marka, pagar, drainase, penerangan | Harian |
| **Gudang** | Rak, pallet, atap, dinding, lantai, ventilasi, penerangan | Harian |

#### Detail Workflow Checklist

| Step | Proses | Aktor | Status |
|------|--------|-------|--------|
| 1 | Sistem menampilkan checklist harian berdasarkan jadwal | Sistem | PENDING |
| 2 | PIC melakukan pengecekan satu per satu | PIC | ON_PROGRESS |
| 3 | Untuk setiap item: OK / ISSUE / N/A | PIC | CHECKED |
| 4 | Jika ISSUE: PIC upload foto, beri deskripsi | PIC | ISSUE_REPORTED |
| 5 | PIC menyelesaikan checklist | PIC | COMPLETED |
| 6 | Staff GA mereview hasil checklist | Staff GA | REVIEWED |
| 7 | Issue ditindaklanjuti (buat ticket maintenance) | Staff GA | - |

#### Notifikasi
| Event | Ke |
|-------|----|
| Checklist belum diisi > 12 jam | PIC + Staff GA |
| Ada issue dilaporkan | Staff GA |
| Issue kritis (listrik padam, kebocoran, dll) | Staff GA + Head GA |

---

### 6.2 MONITORING FASILITAS

**Deskripsi:** Monitoring real-time kondisi fasilitas utama.

#### CCTV Monitoring
- Status kamera: Online / Offline / Error
- Durasi rekaman tersimpan
- Notifikasi jika kamera mati > 1 jam

#### Internet Monitoring
- Status koneksi: Connected / Disconnected
- Bandwidth usage
- Notifikasi jika downtime > 30 menit

#### Listrik Monitoring
- Status PLN: On / Off
- Status Genset: Standby / Running / Maintenance
- Notifikasi jika PLN mati → otomatis alih ke genset

#### Keamanan
- Jadwal satpam
- Log kunjungan tamu
- Laporan insiden keamanan

---

## RINGKASAN WORKFLOW APPROVAL

| Modul | Approval 1 | Approval 2 | Final |
|-------|-----------|-----------|-------|
| **Asset Registration** | Staff GA (Verifikasi) | Head GA (Approve) | - |
| **Asset Mutation** | Kepala Unit Asal | - | Staff GA (Proses) |
| **Asset Disposal** | Head GA | - | - |
| **Stock Opname** | - | Head GA | Auditor (Verifikasi) |
| **Maintenance Ticket** | Kepala Unit | - | Staff GA (Assign) |
| **Purchase Request** | Kepala Cabang | Head GA | Staff GA (Buat PO) |
| **Vehicle Booking** | Kepala Unit / Staff GA | - | - |
| **Vendor Registration** | - | Head GA | - |
| **Contract Vendor** | - | Head GA | - |

---

> **Lanjut ke: 03_ROLE_PERMISSION_MATRIX.md**
