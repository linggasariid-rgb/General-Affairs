import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();

  async function handleLogin() {
    try {
      await login();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ width: '420px' }}>
        <div className="card-body p-5 text-center">
          <div className="mb-4">
            <i className="bi bi-building text-primary" style={{ fontSize: '48px' }}></i>
            <h3 className="mt-2 fw-bold">GA Enterprise</h3>
            <p className="text-muted small">General Affairs Management System</p>
          </div>

          <button
            className="btn btn-light border btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogin}
            disabled={loading}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" width="20" />
            <span>Masuk dengan Google</span>
          </button>

          <hr className="my-4" />

          <div className="text-start small text-muted">
            <p className="mb-1"><strong>Akses berdasarkan role:</strong></p>
            <div>Super Admin | Head GA | Staff GA</div>
            <div>Kepala Cabang | Kepala Gudang</div>
            <div>PIC Cabang | PIC Gudang | Auditor</div>
          </div>
        </div>
      </div>
    </div>
  );
}
