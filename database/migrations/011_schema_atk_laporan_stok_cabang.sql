-- ============================================================
-- GA ENTERPRISE SYSTEM - LAPORAN STOK CABANG (ATK/RTK)
-- ============================================================

-- 1. LAPORAN STOK CABANG HEADER
CREATE TABLE atk_laporan_stok_cabang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_laporan VARCHAR(30) UNIQUE NOT NULL,
    id_cabang UUID NOT NULL REFERENCES cabang(id),
    id_gudang UUID NOT NULL REFERENCES gudang(id),
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun INT NOT NULL,
    tanggal_laporan DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'dilaporkan', 'diverifikasi'
    )),
    catatan TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LAPORAN STOK CABANG ITEM
CREATE TABLE atk_laporan_stok_cabang_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_laporan UUID NOT NULL REFERENCES atk_laporan_stok_cabang(id) ON DELETE CASCADE,
    id_item UUID NOT NULL REFERENCES atk_item(id),
    stok_sistem INT NOT NULL DEFAULT 0,
    stok_fisik INT NOT NULL DEFAULT 0,
    selisih INT GENERATED ALWAYS AS (stok_fisik - stok_sistem) STORED,
    keterangan TEXT
);

-- INDEXES
CREATE INDEX idx_atk_lap_stok_cabang_cabang ON atk_laporan_stok_cabang(id_cabang);
CREATE INDEX idx_atk_lap_stok_cabang_status ON atk_laporan_stok_cabang(status);
CREATE INDEX idx_atk_lap_stok_cabang_bulan ON atk_laporan_stok_cabang(bulan, tahun);
CREATE INDEX idx_atk_lap_stok_item_laporan ON atk_laporan_stok_cabang_item(id_laporan);
CREATE INDEX idx_atk_lap_stok_item_item ON atk_laporan_stok_cabang_item(id_item);

-- TRIGGER updated_at
CREATE TRIGGER trg_atk_laporan_stok_cabang_updated_at BEFORE UPDATE ON atk_laporan_stok_cabang
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE atk_laporan_stok_cabang ENABLE ROW LEVEL SECURITY;
ALTER TABLE atk_laporan_stok_cabang_item ENABLE ROW LEVEL SECURITY;

-- POLICIES: LAPORAN STOK CABANG
CREATE POLICY atk_lap_stok_cabang_select_all ON atk_laporan_stok_cabang FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD'])
);
CREATE POLICY atk_lap_stok_cabang_select_cabang ON atk_laporan_stok_cabang FOR SELECT USING (
    has_role(ARRAY['KCB', 'PCB']) AND id_cabang = get_current_cabang_id()
);
CREATE POLICY atk_lap_stok_cabang_insert ON atk_laporan_stok_cabang FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'PCB'])
);
CREATE POLICY atk_lap_stok_cabang_update ON atk_laporan_stok_cabang FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

-- POLICIES: LAPORAN STOK CABANG ITEM
CREATE POLICY atk_lap_stok_item_select ON atk_laporan_stok_cabang_item FOR SELECT USING (
    id_laporan IN (SELECT id FROM atk_laporan_stok_cabang WHERE true)
);
CREATE POLICY atk_lap_stok_item_insert ON atk_laporan_stok_cabang_item FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'PCB'])
);
CREATE POLICY atk_lap_stok_item_update ON atk_laporan_stok_cabang_item FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));
