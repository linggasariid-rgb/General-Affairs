import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { atkApi } from '../../services/api';

const STATUS_BADGE = {
  draft: 'secondary', diajukan: 'info', disetujui: 'primary',
  diproses: 'warning', dikirim: 'info', diterima_sebagian: 'warning',
  selesai: 'success', ditolak: 'danger',
};

export default function ATKDistribusiPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await atkApi.distribusi.list({ perPage: '50' });
      setData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const filtered = filter ? data.filter((item) => item.status === filter) : data;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Distribusi ATK/RTK</h4>
          <small className="text-muted">{data.length} total distribusi</small>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/atk/distribusi/new')}>
          <i className="bi bi-plus-lg me-1"></i>Buat Distribusi
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group btn-group-sm">
            <button className={`btn btn-outline-secondary ${!filter ? 'active' : ''}`} onClick={() => setFilter('')}>Semua</button>
            <button className={`btn btn-outline-info ${filter === 'diajukan' ? 'active' : ''}`} onClick={() => setFilter('diajukan')}>Diajukan</button>
            <button className={`btn btn-outline-primary ${filter === 'disetujui' ? 'active' : ''}`} onClick={() => setFilter('disetujui')}>Disetujui</button>
            <button className={`btn btn-outline-info ${filter === 'dikirim' ? 'active' : ''}`} onClick={() => setFilter('dikirim')}>Dikirim</button>
            <button className={`btn btn-outline-success ${filter === 'selesai' ? 'active' : ''}`} onClick={() => setFilter('selesai')}>Selesai</button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>No Distribusi</th><th>Judul</th><th>Cabang</th><th>Gudang</th><th>Periode</th><th>Status</th><th>Dibuat</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.nomor_distribusi}</strong></td>
                  <td>{item.judul}</td>
                  <td>{item.cabang?.nama || '-'}</td>
                  <td>{item.gudang?.nama || '-'}</td>
                  <td>{item.bulan}/{item.tahun}</td>
                  <td><span className={`badge bg-${STATUS_BADGE[item.status]}`}>{item.status}</span></td>
                  <td>{item.creator?.nama || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/atk/distribusi/${item.id}`)}>
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
