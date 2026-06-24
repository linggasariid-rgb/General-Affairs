-- ============================================================
-- GA ENTERPRISE SYSTEM - PENGAJUAN BARANG NON RUTIN
-- ============================================================

CREATE TABLE pengajuan_barang_non_rutin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_pengajuan VARCHAR(30) UNIQUE NOT NULL,
    nama_pengaju VARCHAR(200) NOT NULL,
    jabatan VARCHAR(200) NOT NULL,
    lokasi_kerja VARCHAR(200) NOT NULL,
    id_cabang UUID REFERENCES cabang(id),
    catatan TEXT,
    status VARCHAR(30) DEFAULT 'diajukan' CHECK (status IN (
        'draft', 'diajukan', 'diproses_ga', 'disetujui_spv', 'diajukan_ke_finance', 'ditolak'
    )),
    created_by UUID NOT NULL REFERENCES users(id),
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMPTZ,
    alasan_tolak TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pengajuan_barang_non_rutin_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengajuan UUID NOT NULL REFERENCES pengajuan_barang_non_rutin(id) ON DELETE CASCADE,
    nama_barang VARCHAR(255) NOT NULL,
    spesifikasi TEXT,
    jumlah INT NOT NULL DEFAULT 1,
    satuan VARCHAR(30) NOT NULL DEFAULT 'pcs',
    keterangan TEXT
);

CREATE INDEX idx_pengajuan_non_rutin_cabang ON pengajuan_barang_non_rutin(id_cabang);
CREATE INDEX idx_pengajuan_non_rutin_status ON pengajuan_barang_non_rutin(status);
CREATE INDEX idx_pengajuan_non_rutin_created ON pengajuan_barang_non_rutin(created_by);
CREATE INDEX idx_pengajuan_non_rutin_item_pengajuan ON pengajuan_barang_non_rutin_item(id_pengajuan);

CREATE TRIGGER trg_pengajuan_non_rutin_updated_at BEFORE UPDATE ON pengajuan_barang_non_rutin
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pengajuan_barang_non_rutin ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengajuan_barang_non_rutin_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY pbnr_select_all ON pengajuan_barang_non_rutin FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD'])
);
CREATE POLICY pbnr_select_own ON pengajuan_barang_non_rutin FOR SELECT USING (
    created_by = auth.uid()
);
CREATE POLICY pbnr_insert ON pengajuan_barang_non_rutin FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
CREATE POLICY pbnr_update ON pengajuan_barang_non_rutin FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

CREATE POLICY pbnr_item_select ON pengajuan_barang_non_rutin_item FOR SELECT USING (
    id_pengajuan IN (SELECT id FROM pengajuan_barang_non_rutin)
);
CREATE POLICY pbnr_item_insert ON pengajuan_barang_non_rutin_item FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
CREATE POLICY pbnr_item_update ON pengajuan_barang_non_rutin_item FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));
