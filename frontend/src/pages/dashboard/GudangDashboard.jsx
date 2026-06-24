import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import KPICard from '../../components/dashboard/KPICard';

export default function GudangDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const idGudang = profile?.gudang?.id;

  useEffect(() => {
    if (!idGudang) return;
    fetchDashboard();
  }, [idGudang]);

  async function fetchDashboard() {
    try {
      const data = await apiFetch(`/dashboard/gudang?id_gudang=${idGudang}`);
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  }

  const kpiData = [
    { title: 'Total Asset di Gudang', value: stats?.totalAsset || 0, icon: 'bi-box', color: 'primary', path: '/app/asset' },
    { title: 'Penerimaan Pending', value: stats?.penerimaanPending || 0, icon: 'bi-truck', color: 'warning', path: '/app/procurement/penerimaan' },
    { title: 'Stock Opname', value: stats?.stockOpname || 0, icon: 'bi-clipboard-check', color: 'info', path: '/app/asset' },
    { title: 'Asset Rusak', value: stats?.assetRusak || 0, icon: 'bi-exclamation-triangle', color: 'danger', path: '/app/asset' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Dashboard Gudang</h4>
          <small className="text-muted">{profile?.gudang?.nama || 'Gudang'} - Overview</small>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {kpiData.map((kpi, i) => (
          <div className="col-md-3" key={i}>
            <KPICard {...kpi} onClick={() => navigate(kpi.path)} />
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Penerimaan Terbaru</h6></div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr><th>No. Penerimaan</th><th>PO</th><th>Tanggal</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {(stats?.recentPenerimaan || []).map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.nomor_penerimaan}</strong></td>
                      <td>{p.po?.nomor_po || '-'}</td>
                      <td className="text-nowrap">{p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'}</td>
                      <td><span className="badge bg-secondary">{p.status}</span></td>
                    </tr>
                  ))}
                  {(stats?.recentPenerimaan || []).length === 0 && (
                    <tr><td colSpan="4" className="text-center text-muted py-3">Belum ada penerimaan</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Jadwal Stock Opname</h6></div>
            <div className="card-body">
              {(stats?.stockOpnameSchedule || []).length > 0 ? (
                <ul className="list-group list-group-flush">
                  {stats.stockOpnameSchedule.map((s, i) => (
                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span>{s.nama}</span>
                      <small className="text-muted">{s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID') : '-'}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Tidak ada jadwal stock opname</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
