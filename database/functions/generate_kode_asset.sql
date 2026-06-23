-- ============================================================
-- FUNCTION: Generate Kode Asset Otomatis
-- Format: AST-{KODE_CABANG}-{TAHUN}-{NO_URUT}
-- Contoh: AST-JKT-2026-00001
-- ============================================================

CREATE OR REPLACE FUNCTION generate_kode_asset(p_id_cabang UUID)
RETURNS VARCHAR(30) AS $$
DECLARE
    v_kode_cabang VARCHAR(10);
    v_tahun VARCHAR(4);
    v_nomor INT;
    v_kode VARCHAR(30);
BEGIN
    -- Get cabang code
    SELECT kode INTO v_kode_cabang FROM cabang WHERE id = p_id_cabang;
    v_tahun := EXTRACT(YEAR FROM NOW())::VARCHAR;

    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SPLIT_PART(kode_asset, '-', 3) AS INT)), 0) + 1
    INTO v_nomor
    FROM asset
    WHERE kode_asset LIKE 'AST-' || v_kode_cabang || '-' || v_tahun || '-%';

    -- Handle first entry
    IF v_nomor IS NULL OR v_nomor = 0 THEN
        v_nomor := 1;
    END IF;

    -- Format: AST-JKT-2026-00001
    v_kode := 'AST-' || v_kode_cabang || '-' || v_tahun || '-' || LPAD(v_nomor::TEXT, 5, '0');

    RETURN v_kode;
END;
$$ LANGUAGE plpgsql;
