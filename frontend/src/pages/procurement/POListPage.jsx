import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementApi } from '../../services/api';

const STATUS_BADGE = {
  draft: 'secondary', disetujui: 'success', dikirim: 'primary',
  diterima: 'info', selesai: 'success', dibatalkan: 'danger',
};

export default function POListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', dateFrom: '', dateTo: '' });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const params = { perPage: '50', ...filter };
      const res = await procurementApi.po.list(params);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = data.filter((item) => {
    if (filter.status && item.status !== filter.status) return false;
    if (filter.dateFrom && new Date(item.created_at) < new Date(filter.dateFrom)) return false;
    if (filter.dateTo && new Date(item.created_at) > new Date(filter.dateTo + 'T23:59:59')) return false;
    return true;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Purchase Order</h4>
          <small className="text-muted">{data.length} total PO</small>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/app/procurement/po/create')}>
          <i className="bi bi-plus-lg me-1"></i>Buat PO
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <select className="form-select form-select-sm" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="disetujui">Disetujui</option>
                <option value="dikirim">Dikirim</option>
                <option value="diterima">Diterima</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>
            <div className="col-auto">
              <input className="form-control form-control-sm" type="date" value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} placeholder="Dari" />
            </div>
            <div className="col-auto">
              <input className="form-control form-control-sm" type="date" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} placeholder="Sampai" />
            </div>
            <div className="col-auto">
              <button className="btn btn-sm btn-primary" onClick={fetchData}><i className="bi bi-funnel me-1"></i>Filter</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>No PO</th><th>PR</th><th>Vendor</th><th>Total</th><th>Status</th><th>Tanggal</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Belum ada data PO</td></tr>
              ) : filtered.map((po) => (
                <tr key={po.id}>
                  <td><strong>{po.nomor_po}</strong></td>
                  <td>{po.purchase_request?.nomor_pr || '-'}</td>
                  <td>{po.vendor?.nama || '-'}</td>
                  <td>Rp{Number(po.total || 0).toLocaleString('id-ID')}</td>
                  <td><span className={`badge bg-${STATUS_BADGE[po.status] || 'secondary'}`}>{po.status}</span></td>
                  <td className="text-nowrap">{po.created_at ? new Date(po.created_at).toLocaleDateString('id-ID') : '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/app/procurement/po/${po.id}`)}>
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
