import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onToggle }) {
  const { profile, logout } = useAuth();

  return (
    <nav className="navbar navbar-light bg-white border-bottom px-3 px-lg-4 shadow-sm flex-shrink-0">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-sm btn-light d-lg-none border-0" onClick={onToggle}>
          <i className="bi bi-list fs-5"></i>
        </button>
        <span className="text-muted small d-none d-sm-inline">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </span>
      </div>

      <div className="dropdown">
        <button className="btn btn-light dropdown-toggle d-flex align-items-center border-0 py-1" data-bs-toggle="dropdown">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
               style={{ width: '32px', height: '32px', fontSize: '14px', flexShrink: 0 }}>
            {profile?.nama?.charAt(0) || 'U'}
          </div>
          <div className="text-start d-none d-sm-block">
            <small className="d-block fw-bold" style={{ lineHeight: 1.2 }}>{profile?.nama || 'User'}</small>
            <small className="text-muted" style={{ fontSize: '11px' }}>{profile?.email}</small>
          </div>
        </button>
        <div className="dropdown-menu dropdown-menu-end shadow">
          <h6 className="dropdown-header">{profile?.roles?.nama}</h6>
          <button className="dropdown-item" onClick={logout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
