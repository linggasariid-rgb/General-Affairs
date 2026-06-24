import { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ modul: '', tipe_aksi: '' });

  useEffect(() => { fetchLogs(); }, []);

  async function fetchLogs() {
    try {
      const params = new URLSearchParams({ page: '1', perPage: '50', ...filter });
      const data = await apiFetch(`/audit?${params}`);
      if (data.success) setLogs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const MODULES = ['', 'auth', 'master', 'asset', 'maintenance', 'procurement', 'vendor', 'vehicle', 'building', 'report'];
  const ACTIONS = ['', 'login', 'logout', 'insert', 'update', 'delete', 'approve', 'reject', 'mutasi', 'export'];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Audit Trail</h4>
          <small className="text-muted">Log aktivitas seluruh sistem</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchLogs}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-auto">
              <select className="form-select form-select-sm" value={filter.modul} onChange={(e) => setFilter({ ...filter, modul: e.target.value })}>
                {MODULES.map((m) => <option key={m} value={m}>{m || 'Semua Modul'}</option>)}
              </select>
            </div>
            <div className="col-auto">
              <select className="form-select form-select-sm" value={filter.tipe_aksi} onChange={(e) => setFilter({ ...filter, tipe_aksi: e.target.value })}>
                {ACTIONS.map((a) => <option key={a} value={a}>{a || 'Semua Aksi'}</option>)}
              </select>
            </div>
            <div className="col-auto">
              <button className="btn btn-sm btn-primary" onClick={fetchLogs}>Filter</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Waktu</th>
                <th>User</th>
                <th>Aksi</th>
                <th>Modul</th>
                <th>Deskripsi</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Belum ada data audit</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id}>
                  <td className="text-nowrap small">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                  <td>{log.email_user || '-'}</td>
                  <td>
                    <span className={`badge bg-${log.tipe_aksi === 'delete' ? 'danger' : log.tipe_aksi === 'insert' ? 'success' : log.tipe_aksi === 'approve' ? 'primary' : log.tipe_aksi === 'reject' ? 'warning' : 'secondary'}`}>
                      {log.tipe_aksi}
                    </span>
                  </td>
                  <td>{log.modul}</td>
                  <td className="small">{log.deskripsi || '-'}</td>
                  <td className="small text-muted">{log.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
