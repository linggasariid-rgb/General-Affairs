import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import KPICard from '../../components/dashboard/KPICard';

export default function CabangDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const idCabang = profile?.cabang?.id;

  useEffect(() => {
    if (!idCabang) return;
    fetchDashboard();
  }, [idCabang]);

  async function fetchDashboard() {
    try {
      const data = await apiFetch(`/dashboard/cabang?id_cabang=${idCabang}`);
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
    { title: 'Total Asset', value: stats?.totalAsset || 0, icon: 'bi-box', color: 'primary', path: '/app/asset' },
    { title: 'Asset Rusak', value: stats?.assetRusak || 0, icon: 'bi-exclamation-triangle', color: 'danger', path: '/app/asset' },
    { title: 'Ticket Open', value: stats?.openTicket || 0, icon: 'bi-wrench', color: 'warning', path: '/app/maintenance/ticket' },
    { title: 'PR Pending', value: stats?.prPending || 0, icon: 'bi-cart', color: 'info', path: '/app/procurement/pr' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Dashboard Cabang</h4>
          <small className="text-muted">{profile?.cabang?.nama || 'Cabang'} - Overview</small>
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
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Mutasi Terbaru</h6>
              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/app/asset/mutasi')}>Lihat Semua</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr><th>Asset</th><th>Tipe</th><th>Status</th><th>Tanggal</th></tr>
                </thead>
                <tbody>
                  {(stats?.recentMutasi || []).map((m) => (
                    <tr key={m.id}>
                      <td>{m.asset?.nama || '-'}</td>
                      <td>{m.tipe_mutasi}</td>
                      <td><span className="badge bg-secondary">{m.status}</span></td>
                      <td className="text-nowrap">{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                  {(stats?.recentMutasi || []).length === 0 && (
                    <tr><td colSpan="4" className="text-center text-muted py-3">Belum ada mutasi</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Ticket Terbaru</h6>
              <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/app/maintenance/ticket')}>Lihat Semua</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr><th>Ticket</th><th>Judul</th><th>Status</th><th>Prioritas</th></tr>
                </thead>
                <tbody>
                  {(stats?.recentTickets || []).map((t) => (
                    <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/app/maintenance/ticket/${t.id}`)}>
                      <td><strong>{t.nomor_ticket}</strong></td>
                      <td>{t.judul}</td>
                      <td><span className="badge bg-secondary">{t.status}</span></td>
                      <td><span className={`badge bg-${t.prioritas === 'critical' ? 'danger' : t.prioritas === 'high' ? 'warning' : 'primary'}`}>{t.prioritas}</span></td>
                    </tr>
                  ))}
                  {(stats?.recentTickets || []).length === 0 && (
                    <tr><td colSpan="4" className="text-center text-muted py-3">Belum ada ticket</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
