-- ============================================================
-- GA ENTERPRISE SYSTEM - PROCUREMENT TABLES
-- ============================================================

-- 1. PURCHASE REQUEST
CREATE TABLE purchase_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_pr VARCHAR(30) UNIQUE NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    id_cabang UUID NOT NULL REFERENCES cabang(id),
    id_gudang UUID REFERENCES gudang(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'diajukan', 'disetujui_kacab', 'disetujui_hga',
        'ditolak', 'diproses', 'selesai', 'closed'
    )),
    urgent BOOLEAN DEFAULT false,
    estimasi_total DECIMAL(18,2),
    realisasi_total DECIMAL(18,2),
    catatan TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    dibatalkan_oleh UUID REFERENCES users(id),
    alasan_batal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pr_cabang ON purchase_request(id_cabang);
CREATE INDEX idx_pr_status ON purchase_request(status);
CREATE INDEX idx_pr_created_by ON purchase_request(created_by);
CREATE INDEX idx_pr_urgent ON purchase_request(urgent);
CREATE INDEX idx_pr_cabang_status ON purchase_request(id_cabang, status);

-- 2. PURCHASE REQUEST ITEM
CREATE TABLE purchase_request_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pr UUID NOT NULL REFERENCES purchase_request(id) ON DELETE CASCADE,
    nama_barang VARCHAR(255) NOT NULL,
    spesifikasi TEXT,
    jumlah INT NOT NULL,
    satuan VARCHAR(30) NOT NULL,
    estimasi_harga DECIMAL(18,2),
    total_estimasi DECIMAL(18,2),
    keterangan TEXT,
    id_kategori_asset UUID REFERENCES kategori_asset(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pr_item_pr ON purchase_request_item(id_pr);

-- 3. PURCHASE REQUEST APPROVAL
CREATE TABLE purchase_request_approval (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pr UUID NOT NULL REFERENCES purchase_request(id) ON DELETE CASCADE,
    tahap VARCHAR(20) NOT NULL CHECK (tahap IN ('kacab', 'headga')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected')),
    catatan TEXT,
    approved_by UUID NOT NULL REFERENCES users(id),
    approved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pr_approval_pr ON purchase_request_approval(id_pr);

-- 4. PURCHASE ORDER
CREATE TABLE purchase_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_po VARCHAR(30) UNIQUE NOT NULL,
    id_pr UUID NOT NULL REFERENCES purchase_request(id),
    id_vendor UUID NOT NULL REFERENCES vendor(id),
    tanggal_po DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'dikirim', 'dikonfirmasi', 'dalam_pengiriman', 'selesai', 'dibatalkan'
    )),
    total_harga DECIMAL(18,2),
    biaya_kirim DECIMAL(18,2) DEFAULT 0,
    pajak DECIMAL(18,2) DEFAULT 0,
    grand_total DECIMAL(18,2),
    termin_pembayaran VARCHAR(100),
    tanggal_pengiriman DATE,
    estimasi_terima DATE,
    catatan TEXT,
    file_po_url TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    dibatalkan_oleh UUID REFERENCES users(id),
    alasan_batal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_pr ON purchase_order(id_pr);
CREATE INDEX idx_po_vendor ON purchase_order(id_vendor);
CREATE INDEX idx_po_status ON purchase_order(status);

-- 5. PURCHASE ORDER ITEM
CREATE TABLE purchase_order_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_po UUID NOT NULL REFERENCES purchase_order(id) ON DELETE CASCADE,
    id_pr_item UUID REFERENCES purchase_request_item(id) ON DELETE SET NULL,
    nama_barang VARCHAR(255) NOT NULL,
    spesifikasi TEXT,
    jumlah INT NOT NULL,
    satuan VARCHAR(30) NOT NULL,
    harga_satuan DECIMAL(18,2) NOT NULL,
    subtotal DECIMAL(18,2),
    keterangan TEXT
);

CREATE INDEX idx_po_item_po ON purchase_order_item(id_po);

-- 6. PENERIMAAN BARANG
CREATE TABLE penerimaan_barang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_penerimaan VARCHAR(30) UNIQUE NOT NULL,
    id_po UUID NOT NULL REFERENCES purchase_order(id),
    id_cabang UUID REFERENCES cabang(id),
    id_gudang UUID REFERENCES gudang(id),
    tanggal_terima DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'diterima' CHECK (status IN (
        'diterima', 'diterima_sebagian', 'ditolak', 'direkonsiliasi', 'selesai'
    )),
    nomor_surat_jalan VARCHAR(100),
    catatan TEXT,
    received_by UUID NOT NULL REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_penerimaan_po ON penerimaan_barang(id_po);
CREATE INDEX idx_penerimaan_cabang ON penerimaan_barang(id_cabang);
CREATE INDEX idx_penerimaan_status ON penerimaan_barang(status);

-- 7. PENERIMAAN BARANG ITEM
CREATE TABLE penerimaan_barang_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_penerimaan UUID NOT NULL REFERENCES penerimaan_barang(id) ON DELETE CASCADE,
    id_po_item UUID REFERENCES purchase_order_item(id),
    jumlah_dipesan INT NOT NULL,
    jumlah_diterima INT NOT NULL,
    jumlah_rusak INT DEFAULT 0,
    jumlah_kurang INT DEFAULT 0,
    kondisi VARCHAR(30) DEFAULT 'baik' CHECK (kondisi IN ('baik', 'rusak', 'kurang', 'salah')),
    catatan TEXT
);

CREATE INDEX idx_penerimaan_item_penerimaan ON penerimaan_barang_item(id_penerimaan);

-- TRIGGERS
CREATE TRIGGER trg_pr_updated_at BEFORE UPDATE ON purchase_request
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_po_updated_at BEFORE UPDATE ON purchase_order
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_penerimaan_updated_at BEFORE UPDATE ON penerimaan_barang
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
