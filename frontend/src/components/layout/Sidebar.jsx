import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = {
  SA: [
    { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
    { to: '/master/cabang', icon: 'bi-building', label: 'Master Cabang' },
    { to: '/master/gudang', icon: 'bi-archive', label: 'Master Gudang' },
    { to: '/master/vendor', icon: 'bi-truck', label: 'Master Vendor' },
    { to: '/asset', icon: 'bi-box', label: 'Asset' },
    { to: '/maintenance/ticket', icon: 'bi-wrench', label: 'Maintenance' },
    { to: '/procurement/pr', icon: 'bi-cart', label: 'Procurement' },
    { to: '/audit', icon: 'bi-journal-text', label: 'Audit Trail' },
  ],
  HGA: [
    { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
    { to: '/master/cabang', icon: 'bi-building', label: 'Cabang' },
    { to: '/master/vendor', icon: 'bi-truck', label: 'Vendor' },
    { to: '/asset', icon: 'bi-box', label: 'Asset' },
    { to: '/maintenance/ticket', icon: 'bi-wrench', label: 'Maintenance' },
    { to: '/procurement/pr', icon: 'bi-cart', label: 'Procurement' },
    { to: '/audit', icon: 'bi-journal-text', label: 'Audit' },
  ],
  SGA: [
    { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
    { to: '/asset', icon: 'bi-box', label: 'Asset' },
    { to: '/maintenance/ticket', icon: 'bi-wrench', label: 'Maintenance' },
    { to: '/procurement/pr', icon: 'bi-cart', label: 'Procurement' },
    { to: '/master/vendor', icon: 'bi-truck', label: 'Vendor' },
  ],
};

export default function Sidebar() {
  const { profile } = useAuth();
  const roleCode = profile?.roles?.kode || 'SGA';
  const items = menuItems[roleCode] || menuItems.SGA;

  return (
    <div className="d-flex flex-column bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="p-3 border-bottom border-secondary">
        <h5 className="mb-0">
          <i className="bi bi-building me-2"></i>GA Enterprise
        </h5>
        <small className="text-secondary">{profile?.roles?.nama}</small>
      </div>

      <nav className="flex-grow-1 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `d-flex align-items-center px-3 py-2 text-decoration-none ${isActive ? 'bg-primary text-white' : 'text-white-50'}`
            }
            style={{ transition: 'all 0.2s' }}
          >
            <i className={`bi ${item.icon} me-3`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-top border-secondary">
        <small className="text-secondary">GA Enterprise v1.0</small>
      </div>
    </div>
  );
}
