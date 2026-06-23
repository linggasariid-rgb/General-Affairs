-- ============================================================
-- GA ENTERPRISE SYSTEM - MASTER TABLES
-- Supabase PostgreSQL 15+
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CABANG (BRANCHES)
CREATE TABLE cabang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(10) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    alamat TEXT,
    kota VARCHAR(100) NOT NULL,
    provinsi VARCHAR(100) NOT NULL,
    telepon VARCHAR(30),
    email VARCHAR(100),
    kode_pos VARCHAR(10),
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cabang_kota ON cabang(kota);
CREATE INDEX idx_cabang_status ON cabang(status);

-- 2. GUDANG (WAREHOUSES)
CREATE TABLE gudang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(10) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('pusat', 'cabang')),
    id_cabang UUID REFERENCES cabang(id) ON DELETE SET NULL,
    alamat TEXT,
    telepon VARCHAR(30),
    pic_nama VARCHAR(100),
    pic_telepon VARCHAR(30),
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gudang_tipe ON gudang(tipe);
CREATE INDEX idx_gudang_cabang ON gudang(id_cabang);

-- 3. ROLES
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(10) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    level INT NOT NULL,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    id_role UUID NOT NULL REFERENCES roles(id),
    id_cabang UUID REFERENCES cabang(id) ON DELETE SET NULL,
    id_gudang UUID REFERENCES gudang(id) ON DELETE SET NULL,
    telepon VARCHAR(30),
    foto_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    auth_provider VARCHAR(50) DEFAULT 'google',
    auth_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(id_role);
CREATE INDEX idx_users_cabang ON users(id_cabang);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- 5. VENDOR KATEGORI
CREATE TABLE vendor_kategori (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) UNIQUE NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VENDOR
CREATE TABLE vendor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    id_kategori UUID REFERENCES vendor_kategori(id) ON DELETE SET NULL,
    pic_nama VARCHAR(200),
    pic_telepon VARCHAR(30),
    pic_email VARCHAR(100),
    alamat TEXT,
    kota VARCHAR(100),
    provinsi VARCHAR(100),
    npwp VARCHAR(30),
    bank VARCHAR(100),
    no_rekening VARCHAR(50),
    atas_nama VARCHAR(200),
    rating DECIMAL(3,2) DEFAULT 0,
    total_kontrak INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'diblokir')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_kategori ON vendor(id_kategori);
CREATE INDEX idx_vendor_status ON vendor(status);
CREATE INDEX idx_vendor_kota ON vendor(kota);

-- 7. VENDOR KONTRAK
CREATE TABLE vendor_kontrak (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_vendor UUID NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
    nomor_kontrak VARCHAR(50) UNIQUE NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    nilai DECIMAL(18,2) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_berakhir DATE NOT NULL,
    durasi_bulan INT,
    file_url TEXT,
    file_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('draft', 'aktif', 'expired', 'terminated')),
    reminder_hari INT DEFAULT 30,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kontrak_vendor ON vendor_kontrak(id_vendor);
CREATE INDEX idx_kontrak_status ON vendor_kontrak(status);
CREATE INDEX idx_kontrak_berakhir ON vendor_kontrak(tanggal_berakhir);

-- 8. VENDOR PENILAIAN
CREATE TABLE vendor_penilaian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_vendor UUID NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
    id_user UUID NOT NULL REFERENCES users(id),
    skor_kualitas INT CHECK (skor_kualitas >= 1 AND skor_kualitas <= 100),
    skor_tepat_waktu INT CHECK (skor_tepat_waktu >= 1 AND skor_tepat_waktu <= 100),
    skor_harga INT CHECK (skor_harga >= 1 AND skor_harga <= 100),
    skor_responsif INT CHECK (skor_responsif >= 1 AND skor_responsif <= 100),
    skor_kepatuhan INT CHECK (skor_kepatuhan >= 1 AND skor_kepatuhan <= 100),
    skor_total DECIMAL(5,2),
    komentar TEXT,
    periode VARCHAR(20) NOT NULL,
    tanggal DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_penilaian_vendor ON vendor_penilaian(id_vendor);
CREATE INDEX idx_penilaian_periode ON vendor_penilaian(periode);

-- 9. KATEGORI ASSET
CREATE TABLE kategori_asset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    masa_manfaat_tahun INT NOT NULL DEFAULT 4,
    metode_penyusutan VARCHAR(30) DEFAULT 'straight_line',
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. LOKASI ASSET
CREATE TABLE lokasi_asset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    id_cabang UUID REFERENCES cabang(id) ON DELETE SET NULL,
    id_gudang UUID REFERENCES gudang(id) ON DELETE SET NULL,
    lantai VARCHAR(50),
    gedung VARCHAR(100),
    keterangan TEXT,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. JENIS MAINTENANCE
CREATE TABLE jenis_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('preventive', 'corrective')),
    estimasi_jam INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CHECKLIST KATEGORI (BUILDING)
CREATE TABLE building_checklist_kategori (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    urutan INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CHECKLIST TEMPLATE
CREATE TABLE building_checklist_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kategori UUID NOT NULL REFERENCES building_checklist_kategori(id) ON DELETE CASCADE,
    kode_item VARCHAR(30) UNIQUE NOT NULL,
    nama_item VARCHAR(255) NOT NULL,
    frekuensi VARCHAR(20) NOT NULL CHECK (frekuensi IN ('harian', 'mingguan', 'bulanan')),
    wajib_foto BOOLEAN DEFAULT false,
    urutan INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_template_kategori ON building_checklist_template(id_kategori);
CREATE INDEX idx_template_frekuensi ON building_checklist_template(frekuensi);

-- TRIGGER: auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cabang_updated_at BEFORE UPDATE ON cabang
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_gudang_updated_at BEFORE UPDATE ON gudang
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vendor_updated_at BEFORE UPDATE ON vendor
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vendor_kontrak_updated_at BEFORE UPDATE ON vendor_kontrak
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
