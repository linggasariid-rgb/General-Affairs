-- ============================================================
-- GA ENTERPRISE SYSTEM - SEED DATA
-- ============================================================

-- 1. ROLES
INSERT INTO roles (kode, nama, deskripsi, level, is_system) VALUES
('SA',  'Super Admin',          'Administrator sistem dengan akses penuh', 99, true),
('HGA', 'Head General Affairs', 'Kepala Divisi General Affairs',           80, true),
('SGA', 'Staff General Affairs','Staff Divisi General Affairs',            60, true),
('KCB', 'Kepala Cabang',        'Kepala Cabang / Branch Manager',          50, true),
('KGD', 'Kepala Gudang',        'Kepala Gudang / Warehouse Manager',       50, true),
('PCB', 'PIC Cabang',           'PIC General Affairs di Cabang',           40, true),
('PGD', 'PIC Gudang',           'PIC General Affairs di Gudang',           40, true),
('AUD', 'Auditor',              'Auditor Internal (read-only)',            30, true);

-- 2. KATEGORI ASSET
INSERT INTO kategori_asset (kode, nama, deskripsi, masa_manfaat_tahun, icon) VALUES
('IT',     'IT & Elektronik',  'Komputer, laptop, printer, server, dll',        4, 'computer'),
('FURN',   'Furniture',        'Meja, kursi, lemari, rak, sofa, dll',           8, 'table'),
('MESIN',  'Mesin & Peralatan','AC, genset, pompa, alat kerja, dll',           10, 'tool'),
('KEND',   'Kendaraan',        'Mobil, motor, truk operasional',                8, 'truck'),
('BANG',   'Bangunan',         'Gedung, ruangan, infrastruktur',               20, 'building'),
('TANAH',  'Tanah',            'Tanah dan lahan',                                20, 'map'),
('LAIN',   'Lainnya',          'Aset lain yang tidak terkategori',               5, 'package');

-- 3. JENIS MAINTENANCE
INSERT INTO jenis_maintenance (kode, nama, deskripsi, kategori, estimasi_jam) VALUES
('PM-IT',   'Maintenance IT',        'Perawatan rutin komputer, server, jaringan',  'preventive',  4),
('PM-AC',   'Service AC',            'Pembersihan dan perawatan AC',                'preventive',  3),
('PM-ELEC', 'Cek Instalasi Listrik', 'Pemeriksaan panel dan instalasi listrik',     'preventive',  4),
('CM-IT',   'Perbaikan IT',          'Perbaikan kerusakan IT',                      'corrective',  8),
('CM-AC',   'Perbaikan AC',          'Perbaikan AC rusak',                          'corrective',  6),
('CM-ELEC', 'Perbaikan Listrik',     'Perbaikan kerusakan listrik',                 'corrective',  4),
('CM-FURN', 'Perbaikan Furniture',   'Perbaikan meja, kursi, lemari rusak',         'corrective',  3),
('CM-OTH',  'Perbaikan Umum',        'Perbaikan aset lainnya',                      'corrective',  4);

-- 4. VENDOR KATEGORI
INSERT INTO vendor_kategori (nama, deskripsi) VALUES
('IT & Elektronik',  'Vendor komputer, printer, dan perangkat IT'),
('Furniture',        'Vendor meja, kursi, lemari kantor'),
('ATK',              'Vendor alat tulis kantor'),
('Maintenance',      'Vendor jasa perbaikan dan maintenance'),
('Kebersihan',       'Vendor cleaning service'),
('Keamanan',         'Vendor security'),
('Catering',         'Vendor makanan dan minuman'),
('Konstruksi',       'Vendor renovasi dan konstruksi'),
('Transportasi',     'Vendor rental kendaraan'),
('Lainnya',          'Vendor umum lainnya');

-- 5. BUILDING CHECKLIST KATEGORI
INSERT INTO building_checklist_kategori (nama, icon, urutan) VALUES
('CCTV',       'camera-video',   1),
('Listrik',    'lightning',      2),
('Internet',   'wifi',           3),
('Air',        'droplet',        4),
('Kebersihan', 'broom',          5),
('Keamanan',   'shield',         6),
('AC',         'snowflake',      7),
('Fire Safety','fire',           8),
('Gudang',     'warehouse',      9);

-- 6. BUILDING CHECKLIST TEMPLATE
INSERT INTO building_checklist_template (id_kategori, kode_item, nama_item, frekuensi, wajib_foto, urutan)
SELECT id, 'CCTV-001', 'Semua kamera CCTV berfungsi normal',  'harian',   false, 1 FROM building_checklist_kategori WHERE nama = 'CCTV' UNION ALL
SELECT id, 'CCTV-002', 'Rekaman CCTV tersimpan dengan baik',  'harian',   false, 2 FROM building_checklist_kategori WHERE nama = 'CCTV' UNION ALL
SELECT id, 'CCTV-003', 'Monitor CCTV menampilkan semua kamera','harian',  false, 3 FROM building_checklist_kategori WHERE nama = 'CCTV' UNION ALL
SELECT id, 'LST-001', 'Panel listrik dalam kondisi baik',      'harian',   false, 1 FROM building_checklist_kategori WHERE nama = 'Listrik' UNION ALL
SELECT id, 'LST-002', 'Semua lampu berfungsi normal',          'harian',   false, 2 FROM building_checklist_kategori WHERE nama = 'Listrik' UNION ALL
SELECT id, 'LST-003', 'Stop kontak dan saklar berfungsi',      'harian',   false, 3 FROM building_checklist_kategori WHERE nama = 'Listrik' UNION ALL
SELECT id, 'LST-004', 'Genset siap pakai',                     'harian',   false, 4 FROM building_checklist_kategori WHERE nama = 'Listrik' UNION ALL
SELECT id, 'INT-001', 'Koneksi internet berfungsi normal',     'harian',   false, 1 FROM building_checklist_kategori WHERE nama = 'Internet' UNION ALL
SELECT id, 'INT-002', 'Router dan modem berfungsi',            'harian',   false, 2 FROM building_checklist_kategori WHERE nama = 'Internet' UNION ALL
SELECT id, 'AIR-001', 'Kran air berfungsi normal',             'harian',   false, 1 FROM building_checklist_kategori WHERE nama = 'Air' UNION ALL
SELECT id, 'AIR-002', 'Toilet bersih dan berfungsi',           'harian',   true,  2 FROM building_checklist_kategori WHERE nama = 'Air' UNION ALL
SELECT id, 'AIR-003', 'Wastafel berfungsi normal',             'harian',   false, 3 FROM building_checklist_kategori WHERE nama = 'Air' UNION ALL
SELECT id, 'AIR-004', 'Tandon air terisi penuh',               'harian',   false, 4 FROM building_checklist_kategori WHERE nama = 'Air' UNION ALL
SELECT id, 'KBR-001','Kebersihan lantai dan area kerja',       'harian',   false, 1 FROM building_checklist_kategori WHERE nama = 'Kebersihan' UNION ALL
SELECT id, 'KBR-002','Kebersihan toilet dan kamar mandi',      'harian',   true,  2 FROM building_checklist_kategori WHERE nama = 'Kebersihan' UNION ALL
SELECT id, 'KBR-003','Kebersihan area parkir',                 'harian',   false, 3 FROM building_checklist_kategori WHERE nama = 'Kebersihan' UNION ALL
SELECT id, 'KMN-001','Pintu dan jendela dalam kondisi aman',   'harian',   false, 1 FROM building_checklist_kategori WHERE nama = 'Keamanan' UNION ALL
SELECT id, 'KMN-002','Pagar dalam kondisi baik',               'harian',   false, 2 FROM building_checklist_kategori WHERE nama = 'Keamanan' UNION ALL
SELECT id, 'KMN-003','Buku tamu terisi lengkap',               'harian',   false, 3 FROM building_checklist_kategori WHERE nama = 'Keamanan' UNION ALL
SELECT id, 'AC-001', 'AC berfungsi normal (suhu tercapai)',    'harian',   false, 1 FROM building_checklist_kategori WHERE nama = 'AC' UNION ALL
SELECT id, 'AC-002', 'Tidak ada kebocoran AC',                 'harian',   false, 2 FROM building_checklist_kategori WHERE nama = 'AC' UNION ALL
SELECT id, 'AC-003', 'Filter AC dalam kondisi bersih',         'mingguan', false, 3 FROM building_checklist_kategori WHERE nama = 'AC' UNION ALL
SELECT id, 'FIR-001','APAR dalam kondisi siap pakai',          'bulanan',  false, 1 FROM building_checklist_kategori WHERE nama = 'Fire Safety' UNION ALL
SELECT id, 'FIR-002','Hydrant berfungsi normal',               'bulanan',  false, 2 FROM building_checklist_kategori WHERE nama = 'Fire Safety' UNION ALL
SELECT id, 'FIR-003','Detektor asap berfungsi',                'bulanan',  false, 3 FROM building_checklist_kategori WHERE nama = 'Fire Safety' UNION ALL
SELECT id, 'FIR-004','Jalur evakuasi tidak terhalang',         'bulanan',  false, 4 FROM building_checklist_kategori WHERE nama = 'Fire Safety';

-- 7. SYSTEM SETTINGS
INSERT INTO system_settings (key, value, kategori, deskripsi) VALUES
('sla_low_hours',      '48',   'sla',  'SLA jam untuk prioritas Low'),
('sla_medium_hours',   '24',   'sla',  'SLA jam untuk prioritas Medium'),
('sla_high_hours',     '4',    'sla',  'SLA jam untuk prioritas High'),
('sla_critical_hours', '1',    'sla',  'SLA jam untuk prioritas Critical'),
('asset_qr_url',       '/asset/', 'asset', 'Base URL untuk QR Code asset'),
('reminder_kontrak_hari', '30', 'notification', 'H-? kontrak akan expired'),
('reminder_pajak_hari',   '30', 'notification', 'H-? pajak akan expired'),
('reminder_stnk_hari',    '30', 'notification', 'H-? STNK akan expired'),
('app_name', 'GA Enterprise System', 'general', 'Nama aplikasi'),
('app_version', '1.0.0', 'general', 'Versi aplikasi');
