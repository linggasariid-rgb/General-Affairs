import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceApi } from '../../services/api';

const PRIORITY_BADGE = { low: 'secondary', medium: 'primary', high: 'warning', critical: 'danger' };
const STATUS_BADGE = {
  dibuat: 'secondary', disetujui: 'info', ditolak: 'danger',
  ditugaskan: 'primary', dikerjakan: 'warning', selesai: 'success',
  diverifikasi: 'info', closed: 'dark',
};

export default function TicketListPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: '1', perPage: '20', status: '' });

  useEffect(() => { fetchTickets(); }, [filters]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await maintenanceApi.ticket.list(filters);
      setTickets(res.data);
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
          <h4 className="mb-1">Maintenance Ticket</h4>
          <small className="text-muted">Kelola ticket perbaikan dan perawatan</small>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/maintenance/ticket/add')}>
          <i className="bi bi-plus-lg me-1"></i>Buat Ticket
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-auto">
              <select className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: '1' })}>
                <option value="">Semua Status</option>
                <option value="dibuat">Dibuat</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditugaskan">Ditugaskan</option>
                <option value="dikerjakan">Dikerjakan</option>
                <option value="selesai">Selesai</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Ticket</th>
                <th>Judul</th>
                <th>Asset</th>
                <th>Cabang</th>
                <th>Prioritas</th>
                <th>Status</th>
                <th>Teknisi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">Belum ada ticket</td></tr>
              ) : tickets.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.nomor_ticket}</strong></td>
                  <td>{t.judul}</td>
                  <td>{t.asset?.nama || '-'}</td>
                  <td>{t.cabang?.nama || '-'}</td>
                  <td><span className={`badge bg-${PRIORITY_BADGE[t.prioritas]}`}>{t.prioritas}</span></td>
                  <td><span className={`badge bg-${STATUS_BADGE[t.status]}`}>{t.status}</span></td>
                  <td>{t.teknisi?.nama || t.vendor?.nama || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/maintenance/ticket/${t.id}`)}>
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
