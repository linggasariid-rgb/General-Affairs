-- ============================================================
-- GA ENTERPRISE SYSTEM - INDEXES & RLS POLICIES
-- ============================================================

-- ============================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================

-- Full-text search
CREATE INDEX idx_asset_nama_search ON asset USING GIN(to_tsvector('indonesian', nama));
CREATE INDEX idx_asset_keterangan_search ON asset USING GIN(to_tsvector('indonesian', COALESCE(keterangan, '')));
CREATE INDEX idx_vendor_nama_search ON vendor USING GIN(to_tsvector('indonesian', nama));
CREATE INDEX idx_ticket_judul_search ON maintenance_ticket USING GIN(to_tsvector('indonesian', judul));

-- Composite indexes for common queries
CREATE INDEX idx_asset_cabang_kategori ON asset(id_cabang, id_kategori);
CREATE INDEX idx_asset_cabang_kondisi ON asset(id_cabang, kondisi);
CREATE INDEX idx_ticket_cabang_prioritas ON maintenance_ticket(id_cabang, prioritas);
CREATE INDEX idx_ticket_teknisi_status ON maintenance_ticket(id_teknisi, status);
CREATE INDEX idx_pr_cabang_urgent ON purchase_request(id_cabang, urgent);

-- Partial indexes for active data
CREATE INDEX idx_asset_aktif ON asset(id) WHERE status = 'aktif';
CREATE INDEX idx_ticket_open ON maintenance_ticket(id) WHERE status NOT IN ('closed', 'ditolak');
CREATE INDEX idx_pr_active ON purchase_request(id) WHERE status NOT IN ('closed', 'ditolak');

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE cabang ENABLE ROW LEVEL SECURITY;
ALTER TABLE gudang ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_kontrak ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_penilaian ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE lokasi_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE jenis_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_foto ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_mutasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_penyusutan ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_penghapusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_stock_opname ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_stock_opname_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_foto ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_reminder ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_sparepart ENABLE ROW LEVEL SECURITY;
ALTER TABLE kendaraan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kendaraan_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE kendaraan_bbm ENABLE ROW LEVEL SECURITY;
ALTER TABLE kendaraan_booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_request_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_request_approval ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE penerimaan_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE penerimaan_barang_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_checklist_kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_checklist_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_issue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: Get current user's role code
-- ============================================================
CREATE OR REPLACE FUNCTION get_current_role_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    role_code VARCHAR(10);
BEGIN
    SELECT r.kode INTO role_code
    FROM users u
    JOIN roles r ON r.id = u.id_role
    WHERE u.id = auth.uid();
    RETURN role_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- HELPER FUNCTION: Get current user's cabang
-- ============================================================
CREATE OR REPLACE FUNCTION get_current_cabang_id()
RETURNS UUID AS $$
DECLARE
    cabang_id UUID;
BEGIN
    SELECT u.id_cabang INTO cabang_id
    FROM users u
    WHERE u.id = auth.uid();
    RETURN cabang_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- HELPER FUNCTION: Check if user has role
-- ============================================================
CREATE OR REPLACE FUNCTION has_role(role_codes TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_role_code() = ANY(role_codes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- MASTER DATA POLICIES
-- ============================================================

-- CABANG: Only SA and HGA can modify, all can read active
CREATE POLICY cabang_select ON cabang FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD', 'AUD'])
);
CREATE POLICY cabang_insert ON cabang FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA'])
);
CREATE POLICY cabang_update ON cabang FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA']));
CREATE POLICY cabang_delete ON cabang FOR DELETE USING (
    has_role(ARRAY['SA'])
);

-- USERS: Users can see all (for lookup), but only SA/HGA can manage
CREATE POLICY users_select ON users FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD', 'AUD'])
);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA'])
);
CREATE POLICY users_update ON users FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA']) OR id = auth.uid()
) WITH CHECK (has_role(ARRAY['SA', 'HGA']) OR id = auth.uid());
CREATE POLICY users_delete ON users FOR DELETE USING (
    has_role(ARRAY['SA'])
);

-- VENDOR: All can read, SA/HGA/SGA can modify
CREATE POLICY vendor_select ON vendor FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD', 'AUD'])
);
CREATE POLICY vendor_insert ON vendor FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
CREATE POLICY vendor_update ON vendor FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));
CREATE POLICY vendor_delete ON vendor FOR DELETE USING (
    has_role(ARRAY['SA', 'HGA'])
);

-- ============================================================
-- ASSET POLICIES
-- ============================================================

-- ASSET: SA/HGA/SGA/AUD see all. Kacab/PCB see cabang. Kagud/PGD see gudang.
CREATE POLICY asset_select_all ON asset FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD'])
);
CREATE POLICY asset_select_cabang ON asset FOR SELECT USING (
    (has_role(ARRAY['KCB', 'PCB']) AND id_cabang = get_current_cabang_id())
);
CREATE POLICY asset_select_gudang ON asset FOR SELECT USING (
    (has_role(ARRAY['KGD', 'PGD']) AND id_gudang IN (
        SELECT id FROM gudang WHERE id_cabang = get_current_cabang_id()
    ))
);

CREATE POLICY asset_insert ON asset FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'PCB', 'PGD'])
);
CREATE POLICY asset_update ON asset FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));
CREATE POLICY asset_delete ON asset FOR DELETE USING (
    has_role(ARRAY['SA', 'HGA'])
);

-- ASSET MUTASI
CREATE POLICY mutasi_select ON asset_mutasi FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD']) OR
    id_cabang_asal = get_current_cabang_id() OR
    id_cabang_tujuan = get_current_cabang_id()
);
CREATE POLICY mutasi_insert ON asset_mutasi FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'PCB', 'PGD'])
);
CREATE POLICY mutasi_update ON asset_mutasi FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

-- ============================================================
-- MAINTENANCE TICKET POLICIES
-- ============================================================

CREATE POLICY ticket_select_all ON maintenance_ticket FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD'])
);
CREATE POLICY ticket_select_cabang ON maintenance_ticket FOR SELECT USING (
    (has_role(ARRAY['KCB', 'PCB']) AND id_cabang = get_current_cabang_id())
);
CREATE POLICY ticket_select_teknisi ON maintenance_ticket FOR SELECT USING (
    has_role(ARRAY['KGD', 'PGD']) AND id_teknisi = auth.uid()
);

CREATE POLICY ticket_insert ON maintenance_ticket FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD'])
);
CREATE POLICY ticket_update ON maintenance_ticket FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));

-- ============================================================
-- PROCUREMENT POLICIES
-- ============================================================

-- PR: SA/HGA/SGA all. Kacab/PCB see cabang. KGD/PGD see gudang.
CREATE POLICY pr_select_all ON purchase_request FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD'])
);
CREATE POLICY pr_select_cabang ON purchase_request FOR SELECT USING (
    has_role(ARRAY['KCB', 'PCB']) AND id_cabang = get_current_cabang_id()
);
CREATE POLICY pr_select_gudang ON purchase_request FOR SELECT USING (
    has_role(ARRAY['KGD', 'PGD']) AND id_gudang IN (
        SELECT id FROM gudang WHERE id_cabang = get_current_cabang_id()
    )
);
CREATE POLICY pr_insert ON purchase_request FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD'])
);
CREATE POLICY pr_update ON purchase_request FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB']));

-- ============================================================
-- VEHICLE POLICIES
-- ============================================================

CREATE POLICY kendaraan_select ON kendaraan FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD', 'AUD'])
);
CREATE POLICY kendaraan_insert ON kendaraan FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
);
CREATE POLICY kendaraan_update ON kendaraan FOR UPDATE USING (
    has_role(ARRAY['SA', 'HGA', 'SGA'])
) WITH CHECK (has_role(ARRAY['SA', 'HGA', 'SGA']));
CREATE POLICY kendaraan_delete ON kendaraan FOR DELETE USING (
    has_role(ARRAY['SA'])
);

-- BOOKING: SA/HGA/SGA all. Others see own or cabang
CREATE POLICY booking_select_all ON kendaraan_booking FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD'])
);
CREATE POLICY booking_select_self ON kendaraan_booking FOR SELECT USING (
    id_user = auth.uid()
);
CREATE POLICY booking_insert ON kendaraan_booking FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'KCB', 'KGD', 'PCB', 'PGD'])
);

-- ============================================================
-- BUILDING POLICIES
-- ============================================================

CREATE POLICY checklist_select ON building_checklist FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'AUD']) OR id_cabang = get_current_cabang_id()
);
CREATE POLICY checklist_insert ON building_checklist FOR INSERT WITH CHECK (
    has_role(ARRAY['SA', 'HGA', 'SGA', 'PCB', 'PGD'])
);

-- ============================================================
-- AUDIT LOG POLICIES (SA, HGA, AUD only)
-- ============================================================

CREATE POLICY audit_select ON audit_log FOR SELECT USING (
    has_role(ARRAY['SA', 'HGA', 'AUD'])
);

-- ============================================================
-- NOTIFICATION POLICIES (users see own notifications)
-- ============================================================

CREATE POLICY notif_select ON notifications FOR SELECT USING (
    id_user = auth.uid() OR has_role(ARRAY['SA'])
);
CREATE POLICY notif_update ON notifications FOR UPDATE USING (
    id_user = auth.uid()
) WITH CHECK (id_user = auth.uid());
