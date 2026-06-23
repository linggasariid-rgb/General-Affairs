-- ============================================================
-- GA ENTERPRISE SYSTEM - ASSET MANAGEMENT TABLES
-- ============================================================

-- 1. ASSET
CREATE TABLE asset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_asset VARCHAR(30) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    id_kategori UUID NOT NULL REFERENCES kategori_asset(id),
    id_lokasi UUID REFERENCES lokasi_asset(id) ON DELETE SET NULL,
    id_cabang UUID REFERENCES cabang(id) ON DELETE SET NULL,
    id_gudang UUID REFERENCES gudang(id) ON DELETE SET NULL,
    id_vendor UUID REFERENCES vendor(id) ON DELETE SET NULL,
    id_pr_item UUID,
    merek VARCHAR(100),
    model VARCHAR(100),
    nomor_seri VARCHAR(100),
    tahun_perolehan INT,
    tanggal_perolehan DATE,
    harga_perolehan DECIMAL(18,2),
    nilai_residu DECIMAL(18,2) DEFAULT 0,
    nilai_buku DECIMAL(18,2),
    masa_manfaat INT,
    kondisi VARCHAR(30) DEFAULT 'baik' CHECK (kondisi IN ('baik', 'rusak_ringan', 'rusak_berat')),
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'aktif', 'rusak', 'perbaikan', 'hilang', 'dijual', 'dihapus')),
    qr_code_url TEXT,
    foto_utama_url TEXT,
    spesifikasi TEXT,
    keterangan TEXT,
    is_aset_tetap BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_asset_kategori ON asset(id_kategori);
CREATE INDEX idx_asset_cabang ON asset(id_cabang);
CREATE INDEX idx_asset_gudang ON asset(id_gudang);
CREATE INDEX idx_asset_status ON asset(status);
CREATE INDEX idx_asset_kondisi ON asset(kondisi);
CREATE INDEX idx_asset_kode ON asset(kode_asset);
CREATE INDEX idx_asset_deleted ON asset(deleted_at);
CREATE INDEX idx_asset_cabang_status ON asset(id_cabang, status);

-- 2. ASSET FOTO
CREATE TABLE asset_foto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_asset UUID NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
    foto_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INT,
    tipe_foto VARCHAR(30) DEFAULT 'laporan' CHECK (tipe_foto IN ('laporan', 'opname', 'mutasi')),
    is_utama BOOLEAN DEFAULT false,
    keterangan TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asset_foto_asset ON asset_foto(id_asset);

-- 3. ASSET MUTASI
CREATE TABLE asset_mutasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_mutasi VARCHAR(30) UNIQUE NOT NULL,
    id_asset UUID NOT NULL REFERENCES asset(id),
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('cabang', 'gudang', 'lokasi')),
    id_cabang_asal UUID REFERENCES cabang(id),
    id_cabang_tujuan UUID REFERENCES cabang(id),
    id_gudang_asal UUID REFERENCES gudang(id),
    id_gudang_tujuan UUID REFERENCES gudang(id),
    id_lokasi_asal UUID REFERENCES lokasi_asset(id),
    id_lokasi_tujuan UUID REFERENCES lokasi_asset(id),
    alasan TEXT NOT NULL,
    tanggal_mutasi DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'diajukan' CHECK (status IN ('diajukan', 'disetujui', 'ditolak', 'diproses', 'diterima', 'selesai')),
    catatan_pengirim TEXT,
    catatan_penerima TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    diterima_oleh UUID REFERENCES users(id),
    diterima_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mutasi_asset ON asset_mutasi(id_asset);
CREATE INDEX idx_mutasi_status ON asset_mutasi(status);
CREATE INDEX idx_mutasi_cabang_asal ON asset_mutasi(id_cabang_asal);
CREATE INDEX idx_mutasi_cabang_tujuan ON asset_mutasi(id_cabang_tujuan);

-- 4. ASSET PENYUSUTAN
CREATE TABLE asset_penyusutan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_asset UUID NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
    periode_tahun INT NOT NULL,
    periode_bulan INT NOT NULL CHECK (periode_bulan BETWEEN 1 AND 12),
    harga_perolehan DECIMAL(18,2) NOT NULL,
    nilai_residu DECIMAL(18,2) DEFAULT 0,
    masa_manfaat_bulan INT NOT NULL,
    nilai_penyusutan DECIMAL(18,2) NOT NULL,
    akumulasi_penyusutan DECIMAL(18,2) NOT NULL,
    nilai_buku_awal DECIMAL(18,2) NOT NULL,
    nilai_buku_akhir DECIMAL(18,2) NOT NULL,
    is_otomatis BOOLEAN DEFAULT true,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_asset, periode_tahun, periode_bulan)
);

CREATE INDEX idx_penyusutan_asset ON asset_penyusutan(id_asset);
CREATE INDEX idx_penyusutan_periode ON asset_penyusutan(periode_tahun, periode_bulan);

-- 5. ASSET PENGHAPUSAN (DISPOSAL)
CREATE TABLE asset_penghapusan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_penghapusan VARCHAR(30) UNIQUE,
    id_asset UUID NOT NULL REFERENCES asset(id),
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('dijual', 'dihapus', 'hilang')),
    alasan TEXT NOT NULL,
    tanggal DATE NOT NULL,
    nilai_buku DECIMAL(18,2),
    nilai_penjualan DECIMAL(18,2),
    dokumen_url TEXT,
    status VARCHAR(30) DEFAULT 'diajukan' CHECK (status IN ('diajukan', 'disetujui', 'ditolak', 'selesai')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_penghapusan_asset ON asset_penghapusan(id_asset);
CREATE INDEX idx_penghapusan_status ON asset_penghapusan(status);

-- 6. ASSET STOCK OPNAME
CREATE TABLE asset_stock_opname (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_opname VARCHAR(30) UNIQUE NOT NULL,
    id_cabang UUID REFERENCES cabang(id),
    id_gudang UUID REFERENCES gudang(id),
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('cabang', 'gudang', 'semua')),
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'berlangsung', 'rekonsiliasi', 'selesai', 'diverifikasi')),
    total_aset INT DEFAULT 0,
    total_checked INT DEFAULT 0,
    total_selisih INT DEFAULT 0,
    keterangan TEXT,
    created_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opname_cabang ON asset_stock_opname(id_cabang);
CREATE INDEX idx_opname_status ON asset_stock_opname(status);

-- 7. ASSET STOCK OPNAME DETAIL
CREATE TABLE asset_stock_opname_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_opname UUID NOT NULL REFERENCES asset_stock_opname(id) ON DELETE CASCADE,
    id_asset UUID NOT NULL REFERENCES asset(id),
    kondisi_catat VARCHAR(30),
    kondisi_fisik VARCHAR(30),
    lokasi_catat UUID REFERENCES lokasi_asset(id),
    lokasi_fisik UUID REFERENCES lokasi_asset(id),
    status_catat VARCHAR(30),
    status_fisik VARCHAR(30),
    ada_fisik BOOLEAN DEFAULT true,
    foto_url TEXT,
    catatan TEXT,
    is_selisih BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opname_detail_opname ON asset_stock_opname_detail(id_opname);
CREATE INDEX idx_opname_detail_asset ON asset_stock_opname_detail(id_asset);
CREATE INDEX idx_opname_detail_selisih ON asset_stock_opname_detail(is_selisih);

-- 8. ASSET HISTORY
CREATE TABLE asset_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_asset UUID NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
    tipe_event VARCHAR(30) NOT NULL CHECK (tipe_event IN ('created', 'updated', 'status_change', 'mutasi', 'maintenance', 'opname', 'disposal', 'penyusutan')),
    deskripsi TEXT NOT NULL,
    data_detail JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_asset ON asset_history(id_asset);
CREATE INDEX idx_history_tipe ON asset_history(tipe_event);
CREATE INDEX idx_history_created ON asset_history(created_at);

-- TRIGGER: update updated_at for asset tables
CREATE TRIGGER trg_asset_updated_at BEFORE UPDATE ON asset
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_asset_mutasi_updated_at BEFORE UPDATE ON asset_mutasi
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_asset_penghapusan_updated_at BEFORE UPDATE ON asset_penghapusan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_asset_stock_opname_updated_at BEFORE UPDATE ON asset_stock_opname
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
