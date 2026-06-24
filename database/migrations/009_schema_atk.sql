-- ============================================================
-- GA ENTERPRISE SYSTEM - ATK/RTK MANAGEMENT TABLES
-- ============================================================

-- 1. ATK/RTK KATEGORI
CREATE TABLE atk_kategori (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    icon VARCHAR(50),
    urutan INT DEFAULT 0,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ATK/RTK ITEM MASTER
CREATE TABLE atk_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_item VARCHAR(30) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    spesifikasi TEXT,
    id_kategori UUID REFERENCES atk_kategori(id) ON DELETE SET NULL,
    satuan VARCHAR(30) NOT NULL DEFAULT 'pcs',
    harga_estimasi DECIMAL(18,2) DEFAULT 0,
    stok_minimal INT DEFAULT 0,
    stok_maksimal INT DEFAULT 0,
    keterangan TEXT,
    foto_url TEXT,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ATK/RTK STOCK PER GUDANG PUSAT
CREATE TABLE atk_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_item UUID NOT NULL REFERENCES atk_item(id) ON DELETE CASCADE,
    id_gudang UUID NOT NULL REFERENCES gudang(id) ON DELETE CASCADE,
    qty INT NOT NULL DEFAULT 0,
    qty_reserved INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_item, id_gudang)
);

-- 4. ATK/RTK DISTRIBUSI (pengiriman bulanan ke cabang)
CREATE TABLE atk_distribusi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_distribusi VARCHAR(30) UNIQUE NOT NULL,
    judul VARCHAR(255) NOT NULL,
    id_cabang UUID NOT NULL REFERENCES cabang(id),
    id_gudang UUID NOT NULL REFERENCES gudang(id),
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun INT NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'diajukan', 'disetujui', 'diproses', 'dikirim', 'diterima_sebagian', 'selesai', 'ditolak'
    )),
    catatan TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    dikirim_oleh UUID REFERENCES users(id),
    dikirim_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ATK/RTK DISTRIBUSI ITEM
CREATE TABLE atk_distribusi_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_distribusi UUID NOT NULL REFERENCES atk_distribusi(id) ON DELETE CASCADE,
    id_item UUID NOT NULL REFERENCES atk_item(id),
    qty_direncanakan INT NOT NULL,
    qty_dikirim INT DEFAULT 0,
    qty_diterima INT DEFAULT 0,
    keterangan TEXT
);

-- 6. ATK/RTK PENERIMAAN (konfirmasi dari cabang)
CREATE TABLE atk_penerimaan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_penerimaan VARCHAR(30) UNIQUE NOT NULL,
    id_distribusi UUID NOT NULL REFERENCES atk_distribusi(id),
    id_cabang UUID NOT NULL REFERENCES cabang(id),
    tanggal_terima DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'diterima' CHECK (status IN (
        'diterima', 'diterima_sebagian', 'ditolak', 'selesai'
    )),
    catatan TEXT,
    received_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATK/RTK PENERIMAAN ITEM
CREATE TABLE atk_penerimaan_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_penerimaan UUID NOT NULL REFERENCES atk_penerimaan(id) ON DELETE CASCADE,
    id_distribusi_item UUID NOT NULL REFERENCES atk_distribusi_item(id),
    id_item UUID NOT NULL REFERENCES atk_item(id),
    qty_direncanakan INT NOT NULL,
    qty_dikirim INT NOT NULL,
    qty_diterima INT NOT NULL,
    qty_rusak INT DEFAULT 0,
    qty_kurang INT DEFAULT 0,
    kondisi VARCHAR(30) DEFAULT 'baik' CHECK (kondisi IN ('baik', 'rusak', 'kurang', 'salah')),
    catatan TEXT
);

-- INDEXES
CREATE INDEX idx_atk_item_kategori ON atk_item(id_kategori);
CREATE INDEX idx_atk_item_status ON atk_item(status);
CREATE INDEX idx_atk_stock_item ON atk_stock(id_item);
CREATE INDEX idx_atk_stock_gudang ON atk_stock(id_gudang);
CREATE INDEX idx_atk_distribusi_cabang ON atk_distribusi(id_cabang);
CREATE INDEX idx_atk_distribusi_status ON atk_distribusi(status);
CREATE INDEX idx_atk_distribusi_bulan ON atk_distribusi(bulan, tahun);
CREATE INDEX idx_atk_distribusi_item_distribusi ON atk_distribusi_item(id_distribusi);
CREATE INDEX idx_atk_penerimaan_distribusi ON atk_penerimaan(id_distribusi);
CREATE INDEX idx_atk_penerimaan_item_penerimaan ON atk_penerimaan_item(id_penerimaan);

-- TRIGGERS
CREATE TRIGGER trg_atk_item_updated_at BEFORE UPDATE ON atk_item
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_atk_stock_updated_at BEFORE UPDATE ON atk_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_atk_distribusi_updated_at BEFORE UPDATE ON atk_distribusi
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY
ALTER TABLE atk_kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE atk_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE atk_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE atk_distribusi ENABLE ROW LEVEL SECURITY;
ALTER TABLE atk_distribusi_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE atk_penerimaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE atk_penerimaan_item ENABLE ROW LEVEL SECURITY;

-- POLICIES: ATK KATEGORI
CREATE POLICY atk_kategori_select ON atk_kategori FOR SELECT USING (has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD', 'AUD']));
CREATE POLICY atk_kategori_insert ON atk_kategori FOR INSERT WITH CHECK (has_role(ARRAY['SA', 'HGA']));
CREATE POLICY atk_kategori_update ON atk_kategori FOR UPDATE USING (has_role(ARRAY['SA', 'HGA'])) WITH CHECK (has_role(ARRAY['SA', 'HGA']));
CREATE POLICY atk_kategori_delete ON atk_kategori FOR DELETE USING (has_role(ARRAY['SA']));

-- POLICIES: ATK ITEM
CREATE POLICY atk_item_select ON atk_item FOR SELECT USING (has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD', 'AUD']));
CREATE POLICY atk_item_insert ON atk_item FOR INSERT WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));
CREATE POLICY atk_item_update ON atk_item FOR UPDATE USING (has_role(ARRAY['SA', 'HGA', 'SGA'])) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));
CREATE POLICY atk_item_delete ON atk_item FOR DELETE USING (has_role(ARRAY['SA', 'HGA']));

-- POLICIES: ATK STOCK
CREATE POLICY atk_stock_select ON atk_stock FOR SELECT USING (has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD', 'AUD']));
CREATE POLICY atk_stock_insert ON atk_stock FOR INSERT WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));
CREATE POLICY atk_stock_update ON atk_stock FOR UPDATE USING (has_role(ARRAY['SA', 'HGA', 'SGA'])) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

-- POLICIES: ATK DISTRIBUSI
CREATE POLICY atk_distribusi_select_all ON atk_distribusi FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD'])
);
CREATE POLICY atk_distribusi_select_cabang ON atk_distribusi FOR SELECT USING (
    has_role(ARRAY['KCB', 'PCB']) AND id_cabang = get_current_cabang_id()
);
CREATE POLICY atk_distribusi_insert ON atk_distribusi FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
CREATE POLICY atk_distribusi_update ON atk_distribusi FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

-- POLICIES: ATK DISTRIBUSI ITEM
CREATE POLICY atk_distribusi_item_select ON atk_distribusi_item FOR SELECT USING (
    id_distribusi IN (SELECT id FROM atk_distribusi WHERE true)
);
CREATE POLICY atk_distribusi_item_insert ON atk_distribusi_item FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
CREATE POLICY atk_distribusi_item_update ON atk_distribusi_item FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

-- POLICIES: ATK PENERIMAAN
CREATE POLICY atk_penerimaan_select ON atk_penerimaan FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD']) OR id_cabang = get_current_cabang_id()
);
CREATE POLICY atk_penerimaan_insert ON atk_penerimaan FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'PCB', 'PGD'])
);
CREATE POLICY atk_penerimaan_update ON atk_penerimaan FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

-- POLICIES: ATK PENERIMAAN ITEM
CREATE POLICY atk_penerimaan_item_select ON atk_penerimaan_item FOR SELECT USING (
    id_penerimaan IN (SELECT id FROM atk_penerimaan WHERE true)
);
CREATE POLICY atk_penerimaan_item_insert ON atk_penerimaan_item FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'PCB', 'PGD'])
);
CREATE POLICY atk_penerimaan_item_update ON atk_penerimaan_item FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

-- INSERT SEED DATA
INSERT INTO atk_kategori (kode, nama, deskripsi, icon, urutan) VALUES
('ATK', 'ATK - Alat Tulis Kantor', 'Pulpen, pensil, kertas, stapler, dll', 'bi-pencil', 1),
('RTK', 'RTK - Rumah Tangga Kantor', 'Tisu, sabun, air mineral, alat kebersihan', 'bi-droplet', 2),
('CETAK', 'Bahan Cetak', 'Amplop, kop surat, nota, stiker', 'bi-printer', 3),
('ELEKTRONIK', 'Elektronik Kecil', 'Flashdisk, mouse, keyboard, kabel', 'bi-usb-drive', 4),
('LAIN', 'Lainnya', 'Barang habis pakai lainnya', 'bi-box', 5);
