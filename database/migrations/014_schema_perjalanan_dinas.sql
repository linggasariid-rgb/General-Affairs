-- ============================================================
-- GA ENTERPRISE SYSTEM - PERJALANAN DINAS & E-TOLL
-- ============================================================

CREATE TABLE spk_perjalanan_dinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_spk VARCHAR(50) NOT NULL,
    nama_pelaksana VARCHAR(200) NOT NULL,
    divisi VARCHAR(200) NOT NULL,
    tujuan TEXT NOT NULL,
    tanggal_berangkat DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    keterangan TEXT,
    status VARCHAR(30) DEFAULT 'dipakai' CHECK (status IN ('dipakai', 'selesai')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE etoll_peminjaman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_spk UUID NOT NULL REFERENCES spk_perjalanan_dinas(id) ON DELETE CASCADE,
    nomor_kartu VARCHAR(50) NOT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE,
    status VARCHAR(30) DEFAULT 'dipinjam' CHECK (status IN ('dipinjam', 'dikembalikan')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE etoll_pengeluaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_peminjaman UUID NOT NULL REFERENCES etoll_peminjaman(id) ON DELETE CASCADE,
    jenis VARCHAR(30) NOT NULL CHECK (jenis IN ('bensin', 'tol', 'parkir', 'lainnya')),
    jumlah DECIMAL(18,2) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spk_status ON spk_perjalanan_dinas(status);
CREATE INDEX idx_spk_created ON spk_perjalanan_dinas(created_by);
CREATE INDEX idx_etoll_pinjam_spk ON etoll_peminjaman(id_spk);
CREATE INDEX idx_etoll_pinjam_status ON etoll_peminjaman(status);
CREATE INDEX idx_etoll_pengeluaran_pinjam ON etoll_pengeluaran(id_peminjaman);

CREATE TRIGGER trg_spk_updated_at BEFORE UPDATE ON spk_perjalanan_dinas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE spk_perjalanan_dinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE etoll_peminjaman ENABLE ROW LEVEL SECURITY;
ALTER TABLE etoll_pengeluaran ENABLE ROW LEVEL SECURITY;

CREATE POLICY spk_select ON spk_perjalanan_dinas FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD'])
);
CREATE POLICY spk_insert ON spk_perjalanan_dinas FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
CREATE POLICY spk_update ON spk_perjalanan_dinas FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

CREATE POLICY etoll_pinjam_select ON etoll_peminjaman FOR SELECT USING (
    id_spk IN (SELECT id FROM spk_perjalanan_dinas)
);
CREATE POLICY etoll_pinjam_insert ON etoll_peminjaman FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
CREATE POLICY etoll_pinjam_update ON etoll_peminjaman FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

CREATE POLICY etoll_pengeluaran_select ON etoll_pengeluaran FOR SELECT USING (
    id_peminjaman IN (SELECT id FROM etoll_peminjaman)
);
CREATE POLICY etoll_pengeluaran_insert ON etoll_pengeluaran FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
CREATE POLICY etoll_pengeluaran_delete ON etoll_pengeluaran FOR DELETE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
