import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';

import HeadGADashboard from './pages/dashboard/HeadGADashboard';
import CabangDashboard from './pages/dashboard/CabangDashboard';
import GudangDashboard from './pages/dashboard/GudangDashboard';

import AssetListPage from './pages/asset/AssetListPage';
import AssetFormPage from './pages/asset/AssetFormPage';
import AssetDetailPage from './pages/asset/AssetDetailPage';
import MutasiPage from './pages/asset/MutasiPage';

import TicketListPage from './pages/maintenance/TicketListPage';
import TicketDetailPage from './pages/maintenance/TicketDetailPage';
import TicketFormPage from './pages/maintenance/TicketFormPage';

import PRListPage from './pages/procurement/PRListPage';
import PRDetailPage from './pages/procurement/PRDetailPage';
import PRFormPage from './pages/procurement/PRFormPage';
import POListPage from './pages/procurement/POListPage';
import POFormPage from './pages/procurement/POFormPage';
import PenerimaanPage from './pages/procurement/PenerimaanPage';

import VehiclePage from './pages/vehicle/VehiclePage';
import BookingFormPage from './pages/vehicle/BookingFormPage';

import ChecklistPage from './pages/building/ChecklistPage';
import BuildingIssuePage from './pages/building/BuildingIssuePage';

import CabangPage from './pages/master/CabangPage';
import VendorPage from './pages/master/VendorPage';
import UserPage from './pages/master/UserPage';
import KategoriAssetPage from './pages/master/KategoriAssetPage';
import LokasiAssetPage from './pages/master/LokasiAssetPage';
import ProdukPage from './pages/master/ProdukPage';

import ATKItemPage from './pages/atk/ATKItemPage';
import ATKStockPage from './pages/atk/ATKStockPage';
import ATKDistribusiPage from './pages/atk/ATKDistribusiPage';
import ATKDistribusiFormPage from './pages/atk/ATKDistribusiFormPage';
import ATKDistribusiDetailPage from './pages/atk/ATKDistribusiDetailPage';
import ATKPenerimaanPage from './pages/atk/ATKPenerimaanPage';
import LaporanStokCabangPage from './pages/atk/LaporanStokCabangPage';
import LaporanStokCabangFormPage from './pages/atk/LaporanStokCabangFormPage';
import PengajuanNonRutinPage from './pages/atk/PengajuanNonRutinPage';
import PengajuanNonRutinFormPage from './pages/atk/PengajuanNonRutinFormPage';
import PengajuanNonRutinDetailPage from './pages/atk/PengajuanNonRutinDetailPage';

import AuditLogPage from './pages/audit/AuditLogPage';

function ProtectedRoute({ children, roles }) {
  const { user, profile, hasRole } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !hasRole(roles)) return <div className="container py-5"><h3>Akses Ditolak</h3><p>Anda tidak memiliki izin untuk mengakses halaman ini.</p></div>;
  return children;
}

function DashboardRouter() {
  const { profile } = useAuth();
  const role = profile?.roles?.kode;
  if (role === 'HGA' || role === 'SA') return <HeadGADashboard />;
  if (role === 'KCB') return <CabangDashboard />;
  if (role === 'KGD') return <GudangDashboard />;
  return <HeadGADashboard />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" /></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardRouter />} />

        {/* Asset */}
        <Route path="asset" element={<AssetListPage />} />
        <Route path="asset/new" element={<AssetFormPage />} />
        <Route path="asset/:id" element={<AssetDetailPage />} />
        <Route path="asset/:id/edit" element={<AssetFormPage />} />
        <Route path="asset/mutasi" element={<MutasiPage />} />

        {/* Maintenance */}
        <Route path="maintenance/ticket" element={<TicketListPage />} />
        <Route path="maintenance/ticket/new" element={<TicketFormPage />} />
        <Route path="maintenance/ticket/:id" element={<TicketDetailPage />} />

        {/* Procurement */}
        <Route path="procurement/pr" element={<PRListPage />} />
        <Route path="procurement/pr/new" element={<PRFormPage />} />
        <Route path="procurement/pr/:id" element={<PRDetailPage />} />
        <Route path="procurement/po" element={<POListPage />} />
        <Route path="procurement/po/create" element={<POFormPage />} />
        <Route path="procurement/penerimaan" element={<PenerimaanPage />} />

        {/* Vehicle */}
        <Route path="vehicle" element={<VehiclePage />} />
        <Route path="vehicle/booking/create" element={<BookingFormPage />} />

        {/* Building */}
        <Route path="building/checklist" element={<ChecklistPage />} />
        <Route path="building/issue" element={<BuildingIssuePage />} />

        {/* Master Data */}
        <Route path="master/cabang" element={<CabangPage />} />
        <Route path="master/vendor" element={<VendorPage />} />
        <Route path="master/user" element={<UserPage />} />
        <Route path="master/kategori-asset" element={<KategoriAssetPage />} />
        <Route path="master/lokasi-asset" element={<LokasiAssetPage />} />
        <Route path="master/produk" element={<ProdukPage />} />

        {/* ATK */}
        <Route path="atk/item" element={<ATKItemPage />} />
        <Route path="atk/stock" element={<ATKStockPage />} />
        <Route path="atk/distribusi" element={<ATKDistribusiPage />} />
        <Route path="atk/distribusi/new" element={<ATKDistribusiFormPage />} />
        <Route path="atk/distribusi/:id" element={<ATKDistribusiDetailPage />} />
        <Route path="atk/penerimaan" element={<ATKPenerimaanPage />} />
        <Route path="atk/laporan-stok-cabang" element={<LaporanStokCabangPage />} />
        <Route path="atk/laporan-stok-cabang/new" element={<LaporanStokCabangFormPage />} />
        <Route path="atk/laporan-stok-cabang/:id/edit" element={<LaporanStokCabangFormPage />} />
        <Route path="atk/pengajuan-barang-non-rutin" element={<PengajuanNonRutinPage />} />
        <Route path="atk/pengajuan-barang-non-rutin/new" element={<PengajuanNonRutinFormPage />} />
        <Route path="atk/pengajuan-barang-non-rutin/:id" element={<PengajuanNonRutinDetailPage />} />

        {/* Audit */}
        <Route path="audit" element={<AuditLogPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
