import { Hono } from 'hono';
import type { AppEnv } from '../config/database';

// Master
import cabang from './v1/master/cabang';
import gudang from './v1/master/gudang';
import user from './v1/master/user';
import vendor from './v1/master/vendor';
import kategoriAsset from './v1/master/kategori-asset';
import lokasiAsset from './v1/master/lokasi-asset';
import jenisMaintenance from './v1/master/jenis-maintenance';
import produk from './v1/master/produk';
import vendorKategori from './v1/master/vendor-kategori';

// Transaction
import asset from './v1/asset/index';
import assetMutasi from './v1/asset/mutasi';
import assetStockOpname from './v1/asset/stock-opname';
import assetPenyusutan from './v1/asset/penyusutan';
import assetPenghapusan from './v1/asset/penghapusan';
import maintTicket from './v1/maintenance/ticket';
import maintPreventive from './v1/maintenance/preventive';
import maintSLA from './v1/maintenance/sla';
import purchaseRequest from './v1/procurement/purchase-request';
import purchaseOrder from './v1/procurement/purchase-order';
import penerimaan from './v1/procurement/penerimaan';
import vehicleBooking from './v1/vehicle/booking';
import buildingChecklist from './v1/building/checklist';
import buildingIssue from './v1/building/issue';

// ATK
import atkItem from './v1/atk/item';
import atkKategori from './v1/atk/kategori';
import atkStock from './v1/atk/stock';
import atkDistribusi from './v1/atk/distribusi';
import atkPenerimaan from './v1/atk/penerimaan';

// System
import auth from './v1/auth';
import dashboard from './v1/dashboard/head-ga';
import audit from './v1/audit/index';

const router = new Hono<AppEnv>();

// Health check
router.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Auth
router.route('/auth', auth);

// Master Data
router.route('/master/cabang', cabang);
router.route('/master/gudang', gudang);
router.route('/master/user', user);
router.route('/master/vendor', vendor);
router.route('/master/kategori-asset', kategoriAsset);
router.route('/master/lokasi-asset', lokasiAsset);
router.route('/master/jenis-maintenance', jenisMaintenance);
router.route('/master/produk', produk);
router.route('/master/vendor/kategori', vendorKategori);

// Asset Management
router.route('/asset', asset);
router.route('/asset/mutasi', assetMutasi);
router.route('/asset/stock-opname', assetStockOpname);
router.route('/asset/penyusutan', assetPenyusutan);
router.route('/asset/penghapusan', assetPenghapusan);

// Maintenance
router.route('/maintenance/ticket', maintTicket);
router.route('/maintenance/preventive', maintPreventive);
router.route('/maintenance/sla', maintSLA);

// Procurement
router.route('/procurement/pr', purchaseRequest);
router.route('/procurement/po', purchaseOrder);
router.route('/procurement/penerimaan', penerimaan);

// Vehicle
router.route('/vehicle/booking', vehicleBooking);

// Building
router.route('/building/checklist', buildingChecklist);
router.route('/building/issue', buildingIssue);

// ATK
router.route('/atk/item', atkItem);
router.route('/atk/kategori', atkKategori);
router.route('/atk/stock', atkStock);
router.route('/atk/distribusi', atkDistribusi);
router.route('/atk/penerimaan', atkPenerimaan);

// Dashboard
router.route('/dashboard/head-ga', dashboard);

// Audit
router.route('/audit', audit);

export default router;
