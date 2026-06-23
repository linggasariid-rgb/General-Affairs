import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/dashboard/KPICard';

export default function HeadGADashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/v1/dashboard/head-ga');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const kpiData = [
    { title: 'Total Asset', value: stats?.totalAsset || 0, icon: 'bi-box', color: 'primary', change: '+12', path: '/asset' },
    { title: 'Asset Rusak', value: stats?.assetRusak || 0, icon: 'bi-exclamation-triangle', color: 'danger', change: stats?.assetRusakPct + '%', path: '/asset' },
    { title: 'Open Ticket', value: stats?.openTicket || 0, icon: 'bi-wrench', color: 'warning', change: `${stats?.ticketBaru || 0} baru`, path: '/maintenance/ticket' },
    { title: 'PR Pending', value: stats?.prPending || 0, icon: 'bi-cart', color: 'info', change: `${stats?.prUrgent || 0} urgent`, path: '/procurement/pr' },
    { title: 'Vendor Aktif', value: stats?.vendorAktif || 0, icon: 'bi-truck', color: 'success', change: `Rating ${stats?.vendorRating || 0}`, path: '/master/vendor' },
    { title: 'Biaya Maint.', value: `Rp${(stats?.biayaMaintenance || 0).toLocaleString()}`, icon: 'bi-cash', color: 'secondary', change: '', path: '/maintenance/ticket' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Dashboard Head GA</h4>
          <small className="text-muted">Overview General Affairs - Seluruh Cabang</small>
        </div>
        <div>
          <button className="btn btn-outline-primary btn-sm me-2" onClick={() => navigate('/maintenance/ticket')}>
            <i className="bi bi-wrench me-1"></i>Cek SLA
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/procurement/pr')}>
            <i className="bi bi-plus-lg me-1"></i>Buat PR
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {kpiData.map((kpi, i) => (
          <div className="col-md-4 col-lg-2" key={i}>
            <KPICard {...kpi} onClick={() => navigate(kpi.path)} />
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Chart Section */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Asset per Cabang</h6>
              <small className="text-muted">Distribusi aset aktif</small>
            </div>
            <div className="card-body">
              <canvas id="assetChart" height="250"></canvas>
            </div>
          </div>
        </div>

        {/* Status Donut */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Status Asset</h6>
            </div>
            <div className="card-body">
              <canvas id="statusChart" height="250"></canvas>
            </div>
          </div>
        </div>

        {/* Overdue Tickets */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Ticket Overdue SLA</h6>
              <span className="badge bg-danger">{stats?.overdueTicket || 0} Overdue</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ticket</th>
                      <th>Cabang</th>
                      <th>Asset</th>
                      <th>Prioritas</th>
                      <th>Durasi</th>
                      <th>Teknisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.overdueTickets || []).map((t) => (
                      <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/maintenance/ticket/${t.id}`)}>
                        <td><strong>{t.nomor_ticket}</strong></td>
                        <td>{t.cabang?.nama || '-'}</td>
                        <td>{t.asset?.nama || '-'}</td>
                        <td><span className={`badge bg-${t.prioritas === 'critical' ? 'danger' : t.prioritas === 'high' ? 'warning' : 'secondary'}`}>{t.prioritas}</span></td>
                        <td>{t.durasi || '-'}</td>
                        <td>{t.teknisi?.nama || t.vendor?.nama || '-'}</td>
                      </tr>
                    ))}
                    {(!stats?.overdueTickets || stats.overdueTickets.length === 0) && (
                      <tr><td colSpan="6" className="text-center text-muted py-3">Tidak ada ticket overdue</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
