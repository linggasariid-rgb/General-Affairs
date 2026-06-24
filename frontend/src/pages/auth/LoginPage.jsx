import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loginWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleGoogle() {
    try {
      setError('');
      await login();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    try {
      setError('');
      await loginWithEmail(email, password);
    } catch (err) {
      setError(err.message);
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

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleEmailLogin}>
            <div className="mb-3 text-start">
              <label className="form-label small">Email</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@company.com" required />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label small">Password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <hr className="my-4" />
          <div className="text-muted small mb-3">atau</div>

          <button className="btn btn-light border btn-lg w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleGoogle} disabled={loading}>
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
