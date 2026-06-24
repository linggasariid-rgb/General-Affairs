import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const atkItems = [
  { to: '/atk/item', icon: 'bi-box-seam', label: 'Master Item' },
  { to: '/atk/stock', icon: 'bi-cpu', label: 'Stock' },
  { to: '/atk/distribusi', icon: 'bi-truck', label: 'Distribusi' },
  { to: '/atk/penerimaan', icon: 'bi-check-circle', label: 'Penerimaan' },
  { to: '/atk/laporan-stok-cabang', icon: 'bi-clipboard-data', label: 'Laporan Stok Cabang' },
  { to: '/atk/pengajuan-barang-non-rutin', icon: 'bi-file-earmark-text', label: 'Pengajuan Non Rutin' },
];

const menuItems = {
  SA: [
    { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
    { to: '/master/cabang', icon: 'bi-building', label: 'Master Cabang' },
    { to: '/master/gudang', icon: 'bi-archive', label: 'Master Gudang' },
    { to: '/master/vendor', icon: 'bi-truck', label: 'Master Vendor' },
    { to: '/master/produk', icon: 'bi-box-seam', label: 'Master Produk' },
    { to: '/asset', icon: 'bi-box', label: 'Asset' },
    { to: '/maintenance/ticket', icon: 'bi-wrench', label: 'Maintenance' },
    { to: '/procurement/pr', icon: 'bi-cart', label: 'Procurement' },
    ...atkItems,
    { to: '/audit', icon: 'bi-journal-text', label: 'Audit Trail' },
  ],
  HGA: [
    { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
    { to: '/master/cabang', icon: 'bi-building', label: 'Cabang' },
    { to: '/master/vendor', icon: 'bi-truck', label: 'Vendor' },
    { to: '/master/produk', icon: 'bi-box-seam', label: 'Produk' },
    { to: '/asset', icon: 'bi-box', label: 'Asset' },
    { to: '/maintenance/ticket', icon: 'bi-wrench', label: 'Maintenance' },
    { to: '/procurement/pr', icon: 'bi-cart', label: 'Procurement' },
    ...atkItems,
    { to: '/audit', icon: 'bi-journal-text', label: 'Audit' },
  ],
  SGA: [
    { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
    { to: '/asset', icon: 'bi-box', label: 'Asset' },
    { to: '/maintenance/ticket', icon: 'bi-wrench', label: 'Maintenance' },
    { to: '/procurement/pr', icon: 'bi-cart', label: 'Procurement' },
    { to: '/master/vendor', icon: 'bi-truck', label: 'Vendor' },
    ...atkItems,
  ],
};

export default function Sidebar({ show, onClose }) {
  const { profile } = useAuth();
  const roleCode = profile?.roles?.kode || 'SGA';
  const items = menuItems[roleCode] || menuItems.SGA;

  return (
    <>
      {/* Desktop sidebar */}
      <div className={`sidebar d-none d-lg-flex flex-column bg-dark text-white`}>
        <div className="p-3 border-bottom border-secondary flex-shrink-0">
          <h5 className="mb-0 fs-6">
            <i className="bi bi-building me-2"></i>GA Enterprise
          </h5>
          <small className="text-secondary">{profile?.roles?.nama}</small>
        </div>
        <nav className="flex-grow-1 py-2 overflow-auto">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `d-flex align-items-center px-3 py-2 text-decoration-none sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <i className={`bi ${item.icon} me-3`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-top border-secondary flex-shrink-0">
          <small className="text-secondary">GA Enterprise v1.0</small>
        </div>
      </div>

      {/* Mobile offcanvas */}
      <div className={`d-lg-none sidebar-mobile bg-dark text-white ${show ? 'show' : ''}`}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
          <h5 className="mb-0 fs-6">
            <i className="bi bi-building me-2"></i>GA Enterprise
          </h5>
          <button className="btn btn-sm text-white border-0" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <nav className="py-2">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.exact} onClick={onClose}
              className={({ isActive }) =>
                `d-flex align-items-center px-3 py-2 text-decoration-none sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <i className={`bi ${item.icon} me-3`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
