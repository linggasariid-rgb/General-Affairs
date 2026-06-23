-- ============================================================
-- GA ENTERPRISE SYSTEM - MAINTENANCE & VEHICLE TABLES
-- ============================================================

-- 1. MAINTENANCE TICKET
CREATE TABLE maintenance_ticket (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_ticket VARCHAR(30) UNIQUE NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT NOT NULL,
    id_asset UUID REFERENCES asset(id) ON DELETE SET NULL,
    id_kendaraan UUID,
    id_jenis_maintenance UUID REFERENCES jenis_maintenance(id) ON DELETE SET NULL,
    id_cabang UUID NOT NULL REFERENCES cabang(id),
    id_lokasi UUID REFERENCES lokasi_asset(id) ON DELETE SET NULL,
    prioritas VARCHAR(10) NOT NULL CHECK (prioritas IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(30) DEFAULT 'dibuat' CHECK (status IN ('dibuat', 'disetujui', 'ditolak', 'ditugaskan', 'dikerjakan', 'selesai', 'diverifikasi', 'closed')),
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('corrective', 'preventive')),
    id_teknisi UUID REFERENCES users(id) ON DELETE SET NULL,
    id_vendor UUID REFERENCES vendor(id) ON DELETE SET NULL,
    biaya DECIMAL(18,2),
    biaya_part DECIMAL(18,2),
    biaya_jasa DECIMAL(18,2),
    tanggal_rencana DATE,
    tanggal_mulai TIMESTAMPTZ,
    tanggal_selesai TIMESTAMPTZ,
    sla_deadline TIMESTAMPTZ,
    sla_terpenuhi BOOLEAN,
    prioritas_awal VARCHAR(10),
    foto_kerusakan_url TEXT,
    foto_hasil_url TEXT,
    catatan_teknisi TEXT,
    catatan_verifikasi TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    closed_by UUID REFERENCES users(id),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_asset ON maintenance_ticket(id_asset);
CREATE INDEX idx_ticket_cabang ON maintenance_ticket(id_cabang);
CREATE INDEX idx_ticket_status ON maintenance_ticket(status);
CREATE INDEX idx_ticket_prioritas ON maintenance_ticket(prioritas);
CREATE INDEX idx_ticket_teknisi ON maintenance_ticket(id_teknisi);
CREATE INDEX idx_ticket_vendor ON maintenance_ticket(id_vendor);
CREATE INDEX idx_ticket_sla ON maintenance_ticket(sla_deadline);
CREATE INDEX idx_ticket_created ON maintenance_ticket(created_by);
CREATE INDEX idx_ticket_tipe ON maintenance_ticket(tipe);
CREATE INDEX idx_ticket_cabang_status ON maintenance_ticket(id_cabang, status);

-- 2. MAINTENANCE FOTO
CREATE TABLE maintenance_foto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_ticket UUID NOT NULL REFERENCES maintenance_ticket(id) ON DELETE CASCADE,
    tipe_foto VARCHAR(30) DEFAULT 'kerusakan' CHECK (tipe_foto IN ('kerusakan', 'perbaikan', 'lainnya')),
    foto_url TEXT NOT NULL,
    file_name VARCHAR(255),
    keterangan TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maint_foto_ticket ON maintenance_foto(id_ticket);

-- 3. MAINTENANCE TRACKING
CREATE TABLE maintenance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_ticket UUID NOT NULL REFERENCES maintenance_ticket(id) ON DELETE CASCADE,
    status_dari VARCHAR(30),
    status_ke VARCHAR(30) NOT NULL,
    keterangan TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracking_ticket ON maintenance_tracking(id_ticket);
CREATE INDEX idx_tracking_created ON maintenance_tracking(created_at);

-- 4. MAINTENANCE REMINDER (PREVENTIVE)
CREATE TABLE maintenance_reminder (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_asset UUID REFERENCES asset(id) ON DELETE CASCADE,
    id_kendaraan UUID,
    id_jenis_maintenance UUID REFERENCES jenis_maintenance(id),
    interval_hari INT NOT NULL,
    tanggal_terakhir DATE,
    tanggal_berikutnya DATE NOT NULL,
    aktif BOOLEAN DEFAULT true,
    keterangan TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminder_asset ON maintenance_reminder(id_asset);
CREATE INDEX idx_reminder_tanggal ON maintenance_reminder(tanggal_berikutnya);
CREATE INDEX idx_reminder_aktif ON maintenance_reminder(aktif);

-- 5. MAINTENANCE SPAREPART
CREATE TABLE maintenance_sparepart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_ticket UUID NOT NULL REFERENCES maintenance_ticket(id) ON DELETE CASCADE,
    nama_part VARCHAR(255) NOT NULL,
    jumlah INT NOT NULL,
    satuan VARCHAR(30) DEFAULT 'pcs',
    harga DECIMAL(18,2),
    subtotal DECIMAL(18,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sparepart_ticket ON maintenance_sparepart(id_ticket);

-- ============================================================
-- VEHICLE TABLES
-- ============================================================

-- 6. KENDARAAN
CREATE TABLE kendaraan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(20) UNIQUE NOT NULL,
    nomor_polisi VARCHAR(15) UNIQUE NOT NULL,
    merk VARCHAR(100) NOT NULL,
    model VARCHAR(200) NOT NULL,
    tahun INT,
    warna VARCHAR(50),
    jenis VARCHAR(50) CHECK (jenis IN ('mobil', 'motor', 'truk')),
    id_cabang UUID REFERENCES cabang(id),
    status VARCHAR(30) DEFAULT 'aktif' CHECK (status IN ('aktif', 'service', 'rusak', 'dihapus')),
    kilometer_terakhir INT DEFAULT 0,
    masa_berlaku_stnk DATE,
    masa_berlaku_pajak DATE,
    masa_berlaku_kir DATE,
    foto_url TEXT,
    keterangan TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kendaraan_cabang ON kendaraan(id_cabang);
CREATE INDEX idx_kendaraan_status ON kendaraan(status);
CREATE INDEX idx_kendaraan_pajak ON kendaraan(masa_berlaku_pajak);
CREATE INDEX idx_kendaraan_stnk ON kendaraan(masa_berlaku_stnk);

-- 7. KENDARAAN SERVICE
CREATE TABLE kendaraan_service (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kendaraan UUID NOT NULL REFERENCES kendaraan(id) ON DELETE CASCADE,
    tipe_service VARCHAR(30) NOT NULL CHECK (tipe_service IN ('ringan', 'sedang', 'besar', 'perbaikan')),
    tanggal DATE NOT NULL,
    kilometer INT,
    biaya DECIMAL(18,2),
    id_vendor UUID REFERENCES vendor(id) ON DELETE SET NULL,
    keterangan TEXT,
    status VARCHAR(30) DEFAULT 'selesai' CHECK (status IN ('dijadwalkan', 'dilaksanakan', 'selesai')),
    tanggal_service_berikutnya DATE,
    kilometer_berikutnya INT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_kendaraan ON kendaraan_service(id_kendaraan);
CREATE INDEX idx_service_tanggal ON kendaraan_service(tanggal);

-- 8. KENDARAAN BBM
CREATE TABLE kendaraan_bbm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kendaraan UUID NOT NULL REFERENCES kendaraan(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    jumlah_liter DECIMAL(10,2) NOT NULL,
    harga_per_liter DECIMAL(12,2),
    total_biaya DECIMAL(18,2),
    kilometer INT,
    jenis_bbm VARCHAR(30),
    nama_pom VARCHAR(100),
    nota_url TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bbm_kendaraan ON kendaraan_bbm(id_kendaraan);
CREATE INDEX idx_bbm_tanggal ON kendaraan_bbm(tanggal);

-- 9. KENDARAAN BOOKING
CREATE TABLE kendaraan_booking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_booking VARCHAR(30) UNIQUE NOT NULL,
    id_kendaraan UUID NOT NULL REFERENCES kendaraan(id),
    id_user UUID NOT NULL REFERENCES users(id),
    tujuan TEXT NOT NULL,
    lokasi_tujuan TEXT,
    tanggal_mulai TIMESTAMPTZ NOT NULL,
    tanggal_selesai TIMESTAMPTZ NOT NULL,
    keperluan VARCHAR(50) DEFAULT 'dinas',
    jumlah_penumpang INT,
    driver VARCHAR(100),
    status VARCHAR(30) DEFAULT 'diajukan' CHECK (status IN ('diajukan', 'disetujui', 'ditolak', 'dipakai', 'selesai', 'batal')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    kilometer_awal INT,
    kilometer_akhir INT,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_kendaraan ON kendaraan_booking(id_kendaraan);
CREATE INDEX idx_booking_user ON kendaraan_booking(id_user);
CREATE INDEX idx_booking_status ON kendaraan_booking(status);
CREATE INDEX idx_booking_tanggal ON kendaraan_booking(tanggal_mulai);

-- TRIGGERS
CREATE TRIGGER trg_maintenance_ticket_updated_at BEFORE UPDATE ON maintenance_ticket
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kendaraan_updated_at BEFORE UPDATE ON kendaraan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kendaraan_booking_updated_at BEFORE UPDATE ON kendaraan_booking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reminder_updated_at BEFORE UPDATE ON maintenance_reminder
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
