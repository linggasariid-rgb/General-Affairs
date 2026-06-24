-- ============================================================
-- SEED DATA: CABANG & GUDANG
-- ============================================================

-- 1. CABANG
INSERT INTO cabang (kode, nama, kota, provinsi, alamat, telepon, email) VALUES
('PST', 'Pusat',          'Jakarta',       'DKI Jakarta',     'Jl. Jenderal Sudirman No. 1',         '(021) 5550-001', 'pusat@example.com'),
('SBY', 'Surabaya',       'Surabaya',      'Jawa Timur',      'Jl. Tunjungan No. 10',                '(031) 5550-002', 'surabaya@example.com'),
('BDG', 'Bandung',        'Bandung',       'Jawa Barat',      'Jl. Asia Afrika No. 15',              '(022) 5550-003', 'bandung@example.com'),
('MDN', 'Medan',          'Medan',         'Sumatera Utara',  'Jl. Balai Kota No. 5',                '(061) 5550-004', 'medan@example.com'),
('MKS', 'Makassar',       'Makassar',      'Sulawesi Selatan','Jl. Jenderal Ahmad Yani No. 20',      '(0411) 5550-05', 'makassar@example.com'),
('PLM', 'Palembang',      'Palembang',     'Sumatera Selatan','Jl. Kapten A. Rivai No. 8',           '(0711) 5550-06', 'palembang@example.com'),
('SMG', 'Semarang',       'Semarang',      'Jawa Tengah',     'Jl. Pemuda No. 25',                   '(024) 5550-007', 'semarang@example.com'),
('DPS', 'Denpasar',       'Denpasar',      'Bali',            'Jl. Teuku Umar No. 12',               '(0361) 5550-08', 'denpasar@example.com'),
('PNK', 'Pontianak',      'Pontianak',     'Kalimantan Barat','Jl. Ahmad Yani No. 30',               '(0561) 5550-09', 'pontianak@example.com'),
('UPG', 'Yogyakarta',     'Yogyakarta',    'DI Yogyakarta',   'Jl. Malioboro No. 50',                '(0274) 5550-10', 'yogyakarta@example.com')
ON CONFLICT (kode) DO NOTHING;

-- 2. GUDANG PUSAT
INSERT INTO gudang (kode, nama, tipe, alamat, telepon, pic_nama, pic_telepon) VALUES
('GA-PST', 'General Affairs - Gudang Pusat', 'pusat', 'Jl. Jenderal Sudirman No. 1 Gd. GA Lt.1', '(021) 5550-100', 'Budi Santoso', '(021) 5550-101')
ON CONFLICT (kode) DO NOTHING;

-- 3. GUDANG CABANG
INSERT INTO gudang (kode, nama, tipe, id_cabang, alamat, telepon, pic_nama, pic_telepon)
SELECT
    'GD-' || c.kode,
    'Gudang ' || c.nama,
    'cabang',
    c.id,
    c.alamat,
    c.telepon,
    NULL,
    NULL
FROM cabang c
WHERE c.kode != 'PST'
ON CONFLICT (kode) DO NOTHING;
