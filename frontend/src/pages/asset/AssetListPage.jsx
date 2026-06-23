import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetApi } from '../../services/api';

const STATUS_BADGE = {
  draft: 'secondary',
  aktif: 'success',
  rusak: 'danger',
  perbaikan: 'warning',
  hilang: 'dark',
  dijual: 'info',
  dihapus: 'secondary',
};

export default function AssetListPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ page: '1', perPage: '20', status: '' });

  useEffect(() => { fetchAssets(); }, [filters]);

  async function fetchAssets() {
    setLoading(true);
    try {
      const res = await assetApi.list(filters);
      setAssets(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Daftar Asset</h4>
          <small className="text-muted">Total {meta.total} asset</small>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/asset/add')}>
          <i className="bi bi-plus-lg me-1"></i>Registrasi Asset
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <select className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: '1' })}>
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="rusak">Rusak</option>
                <option value="perbaikan">Perbaikan</option>
                <option value="hilang">Hilang</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="col">
              <input className="form-control form-control-sm" placeholder="Cari asset..." />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Kode Asset</th>
                <th>Nama Asset</th>
                <th>Kategori</th>
                <th>Cabang</th>
                <th>Status</th>
                <th>Nilai Buku</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Belum ada data asset</td></tr>
              ) : assets.map((asset) => (
                <tr key={asset.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/asset/${asset.id}`)}>
                  <td><strong>{asset.kode_asset}</strong></td>
                  <td>{asset.nama}</td>
                  <td>{asset.kategori_asset?.nama || '-'}</td>
                  <td>{asset.cabang?.nama || '-'}</td>
                  <td>
                    <span className={`badge bg-${STATUS_BADGE[asset.status] || 'secondary'}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>Rp{(asset.nilai_buku || 0).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={(e) => { e.stopPropagation(); navigate(`/asset/${asset.id}`); }}>
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination pagination-sm justify-content-center">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${filters.page === String(p) ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setFilters({ ...filters, page: String(p) })}>{p}</button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
