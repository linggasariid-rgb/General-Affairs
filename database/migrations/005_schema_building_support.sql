-- ============================================================
-- GA ENTERPRISE SYSTEM - BUILDING & SUPPORT TABLES
-- ============================================================

-- 1. BUILDING CHECKLIST
CREATE TABLE building_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_template UUID NOT NULL REFERENCES building_checklist_template(id),
    id_cabang UUID NOT NULL REFERENCES cabang(id),
    id_gudang UUID REFERENCES gudang(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('ok', 'issue', 'na')),
    keterangan TEXT,
    foto_url TEXT,
    checked_by UUID NOT NULL REFERENCES users(id),
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checklist_template ON building_checklist(id_template);
CREATE INDEX idx_checklist_cabang ON building_checklist(id_cabang);
CREATE INDEX idx_checklist_tanggal ON building_checklist(tanggal);
CREATE INDEX idx_checklist_status ON building_checklist(status);
CREATE INDEX idx_checklist_cabang_tanggal ON building_checklist(id_cabang, tanggal);

-- 2. BUILDING ISSUE
CREATE TABLE building_issue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_issue VARCHAR(30) UNIQUE,
    id_cabang UUID NOT NULL REFERENCES cabang(id),
    id_gudang UUID REFERENCES gudang(id) ON DELETE SET NULL,
    kategori VARCHAR(30) NOT NULL CHECK (kategori IN (
        'cctv', 'listrik', 'internet', 'air', 'kebersihan', 'keamanan', 'fasilitas', 'lainnya'
    )),
    deskripsi TEXT NOT NULL,
    prioritas VARCHAR(10) DEFAULT 'medium' CHECK (prioritas IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(30) DEFAULT 'dilaporkan' CHECK (status IN ('dilaporkan', 'ditangani', 'selesai')),
    foto_url TEXT,
    id_maintenance_ticket UUID REFERENCES maintenance_ticket(id) ON DELETE SET NULL,
    reported_by UUID NOT NULL REFERENCES users(id),
    handled_by UUID REFERENCES users(id),
    handled_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_issue_cabang ON building_issue(id_cabang);
CREATE INDEX idx_issue_kategori ON building_issue(kategori);
CREATE INDEX idx_issue_status ON building_issue(status);
CREATE INDEX idx_issue_prioritas ON building_issue(prioritas);

-- ============================================================
-- SUPPORT TABLES
-- ============================================================

-- 3. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    judul VARCHAR(255) NOT NULL,
    pesan TEXT NOT NULL,
    modul VARCHAR(50),
    tipe VARCHAR(30) DEFAULT 'info' CHECK (tipe IN ('info', 'warning', 'success', 'error')),
    id_referensi VARCHAR(50),
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(id_user);
CREATE INDEX idx_notif_read ON notifications(is_read);
CREATE INDEX idx_notif_created ON notifications(created_at);
CREATE INDEX idx_notif_user_unread ON notifications(id_user, is_read) WHERE is_read = false;

-- 4. AUDIT LOG
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID REFERENCES users(id) ON DELETE SET NULL,
    email_user VARCHAR(255),
    tipe_aksi VARCHAR(20) NOT NULL CHECK (tipe_aksi IN (
        'login', 'logout', 'insert', 'update', 'delete', 'approve', 'reject', 'mutasi', 'export', 'view'
    )),
    modul VARCHAR(50) NOT NULL CHECK (modul IN (
        'auth', 'master', 'asset', 'maintenance', 'procurement', 'vendor', 'vehicle', 'building', 'dashboard', 'report', 'audit'
    )),
    nama_tabel VARCHAR(100),
    id_record VARCHAR(50),
    data_lama JSONB,
    data_baru JSONB,
    deskripsi TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(id_user);
CREATE INDEX idx_audit_aksi ON audit_log(tipe_aksi);
CREATE INDEX idx_audit_modul ON audit_log(modul);
CREATE INDEX idx_audit_tabel ON audit_log(nama_tabel);
CREATE INDEX idx_audit_created ON audit_log(created_at);
CREATE INDEX idx_audit_modul_created ON audit_log(modul, created_at);

-- BRIN index for range queries on timestamp
CREATE INDEX idx_audit_created_brin ON audit_log USING BRIN(created_at) WITH (pages_per_range = 32);

-- 5. USER SESSIONS
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    login_at TIMESTAMPTZ DEFAULT NOW(),
    logout_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_sessions_user ON user_sessions(id_user);
CREATE INDEX idx_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_sessions_token ON user_sessions(token);

-- 6. SYSTEM SETTINGS
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    kategori VARCHAR(50) DEFAULT 'general' CHECK (kategori IN ('general', 'notification', 'sla', 'asset', 'maintenance', 'procurement')),
    deskripsi TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRIGGERS
CREATE TRIGGER trg_building_issue_updated_at BEFORE UPDATE ON building_issue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
