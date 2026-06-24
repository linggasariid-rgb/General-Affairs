-- PRODUK / BARANG MASTER DATA
CREATE TABLE produk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_produk VARCHAR(30) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    spesifikasi TEXT,
    satuan VARCHAR(30) NOT NULL DEFAULT 'pcs',
    id_kategori UUID REFERENCES vendor_kategori(id) ON DELETE SET NULL,
    harga_estimasi DECIMAL(18,2) DEFAULT 0,
    keterangan TEXT,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_produk_kategori ON produk(id_kategori);
CREATE INDEX idx_produk_status ON produk(status);
CREATE INDEX idx_produk_nama ON produk USING gin(nama gin_trgm_ops);

CREATE TRIGGER trg_produk_updated_at BEFORE UPDATE ON produk
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE produk ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produk_all" ON produk FOR ALL USING (true) WITH CHECK (true);

-- ALTER purchase_request_item dan purchase_order_item: tambah id_produk
ALTER TABLE purchase_request_item ADD COLUMN IF NOT EXISTS id_produk UUID REFERENCES produk(id) ON DELETE SET NULL;
ALTER TABLE purchase_order_item ADD COLUMN IF NOT EXISTS id_produk UUID REFERENCES produk(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pr_item_produk ON purchase_request_item(id_produk);
CREATE INDEX IF NOT EXISTS idx_po_item_produk ON purchase_order_item(id_produk);
