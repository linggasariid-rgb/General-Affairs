import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementApi } from '../../services/api';

const STATUS_BADGE = {
  draft: 'secondary', diajukan: 'info', disetujui_kacab: 'primary',
  disetujui_hga: 'success', ditolak: 'danger', diproses: 'warning',
  selesai: 'success', closed: 'dark',
};

export default function PRListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await procurementApi.pr.list({ perPage: '50' });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter ? data.filter((item) => item.status === filter) : data;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Purchase Request</h4>
          <small className="text-muted">{data.length} total PR</small>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/procurement/pr/add')}>
          <i className="bi bi-plus-lg me-1"></i>Buat PR
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group btn-group-sm">
            <button className={`btn btn-outline-secondary ${!filter ? 'active' : ''}`} onClick={() => setFilter('')}>Semua</button>
            <button className={`btn btn-outline-info ${filter === 'diajukan' ? 'active' : ''}`} onClick={() => setFilter('diajukan')}>Diajukan</button>
            <button className={`btn btn-outline-warning ${filter === 'diproses' ? 'active' : ''}`} onClick={() => setFilter('diproses')}>Diproses</button>
            <button className={`btn btn-outline-success ${filter === 'selesai' ? 'active' : ''}`} onClick={() => setFilter('selesai')}>Selesai</button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>No PR</th><th>Judul</th><th>Cabang</th><th>Items</th><th>Estimasi</th><th>Status</th><th>Pemohon</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.nomor_pr}</strong></td>
                  <td>{item.judul}</td>
                  <td>{item.cabang?.nama || '-'}</td>
                  <td>{item.purchase_request_item?.length || 0}</td>
                  <td>Rp{(item.estimasi_total || 0).toLocaleString()}</td>
                  <td><span className={`badge bg-${STATUS_BADGE[item.status]}`}>{item.status}</span></td>
                  <td>{item.creator?.nama || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/procurement/pr/${item.id}`)}>
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
