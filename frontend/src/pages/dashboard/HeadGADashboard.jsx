import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import KPICard from '../../components/dashboard/KPICard';
import { dashboardApi } from '../../services/api';

Chart.register(...registerables);

export default function HeadGADashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const assetChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const assetChartInstance = useRef(null);
  const statusChartInstance = useRef(null);
  const trendChartInstance = useRef(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!stats) return;
    if (assetChartInstance.current) assetChartInstance.current.destroy();
    if (statusChartInstance.current) statusChartInstance.current.destroy();
    if (trendChartInstance.current) trendChartInstance.current.destroy();

    const colors = ['#0d6efd','#6610f2','#6f42c1','#d63384','#dc3545','#fd7e14','#ffc107','#198754','#20c997','#0dcaf0'];
    const cabangLabels = (stats.assetPerCabang || []).map(c => c.nama);
    const cabangData = (stats.assetPerCabang || []).map(c => c.total);

    if (assetChartRef.current) {
      assetChartInstance.current = new Chart(assetChartRef.current, {
        type: 'bar',
        data: {
          labels: cabangLabels.length ? cabangLabels : ['Cabang A','Cabang B'],
          datasets: [{ label: 'Jumlah Asset', data: cabangData.length ? cabangData : [0,0], backgroundColor: colors.slice(0, cabangData.length || 2) }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
      });
    }

    if (statusChartRef.current) {
      statusChartInstance.current = new Chart(statusChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Aktif', 'Rusak', 'Dipinjam', 'Hapus'],
          datasets: [{ data: [stats.assetAktif||0, stats.assetRusak||0, stats.assetDipinjam||0, stats.assetDihapus||0], backgroundColor: ['#198754','#dc3545','#ffc107','#6c757d'] }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
      });
    }

    if (trendChartRef.current) {
      const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      trendChartInstance.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            { label: 'Ticket Masuk', data: stats.trendTicket || Array(12).fill(0), borderColor: '#0d6efd', fill: false, tension: 0.3 },
            { label: 'PR Dibuat', data: stats.trendPR || Array(12).fill(0), borderColor: '#198754', fill: false, tension: 0.3 },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' } },
      });
    }
  }, [stats]);

  async function fetchDashboard() {
    try {
      const data = await dashboardApi.headGA();
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
            <div className="card-body" style={{ height: 300 }}>
              <canvas ref={assetChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Status Donut */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Status Asset</h6>
            </div>
            <div className="card-body" style={{ height: 300 }}>
              <canvas ref={statusChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Trend Bulanan</h6>
            </div>
            <div className="card-body" style={{ height: 250 }}>
              <canvas ref={trendChartRef}></canvas>
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
