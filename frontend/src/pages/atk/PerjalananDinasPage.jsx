import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { atkApi } from '../../services/api';

export default function PerjalananDinasPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '' });

  useEffect(() => { fetchData(); }, [filter]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filter).filter(([_, v]) => v));
      const res = await atkApi.perjalananDinas.list({ ...params, perPage: '100' });
      setData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  function statusBadge(s) {
    const map = { dipakai: 'primary', selesai: 'success' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  }

  function cardStatusBadge(s) {
    const map = { dipinjam: 'warning', dikembalikan: 'secondary' };
    return <span className={`badge bg-${map[s] || 'secondary'} ms-1`} style={{ fontSize: 10 }}>{s}</span>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Perjalanan Dinas</h4>
          <small className="text-muted">SPK, peminjaman E-Toll, dan pengeluaran bensin/tol</small>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/atk/perjalanan-dinas/new')}>
          <i className="bi bi-plus-lg me-1"></i>Buat SPK
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-auto">
              <select className="form-select form-select-sm" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                <option value="">Semua Status</option>
                <option value="dipakai">Aktif</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>No. SPK</th><th>Pelaksana</th><th>Divisi</th><th>Tujuan</th><th>Tanggal</th><th>E-Toll</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.map(item => {
                const card = item.etoll_peminjaman?.[0];
                return (
                  <tr key={item.id}>
                    <td><strong>{item.nomor_spk}</strong></td>
                    <td>{item.nama_pelaksana}</td>
                    <td>{item.divisi}</td>
                    <td>{item.tujuan}</td>
                    <td><small>{item.tanggal_berangkat} s/d {item.tanggal_kembali}</small></td>
                    <td>{card ? <>{card.nomor_kartu}{cardStatusBadge(card.status)}</> : '-'}</td>
                    <td>{statusBadge(item.status)}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-info" onClick={() => navigate(`/atk/perjalanan-dinas/${item.id}`)} title="Detail">
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
