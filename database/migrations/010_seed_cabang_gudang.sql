-- ============================================================
-- SEED DATA: GUDANG PUSAT GENERAL AFFAIRS
-- ============================================================
-- Gudang ini digunakan sebagai default gudang asal di distribusi ATK/RTK
INSERT INTO gudang (kode, nama, tipe, pic_nama) VALUES
('GA-PST', 'General Affairs - Gudang Pusat', 'pusat', 'Budi Santoso')
ON CONFLICT (kode) DO NOTHING;
