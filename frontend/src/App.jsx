import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import HeadGADashboard from './pages/dashboard/HeadGADashboard';
import AssetListPage from './pages/asset/AssetListPage';
import TicketListPage from './pages/maintenance/TicketListPage';
import PRListPage from './pages/procurement/PRListPage';
import CabangPage from './pages/master/CabangPage';
import VendorPage from './pages/master/VendorPage';
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
        <Route path="asset" element={<AssetListPage />} />
        <Route path="maintenance/ticket" element={<TicketListPage />} />
        <Route path="procurement/pr" element={<PRListPage />} />
        <Route path="master/cabang" element={<CabangPage />} />
        <Route path="master/vendor" element={<VendorPage />} />
        <Route path="audit" element={<AuditLogPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
