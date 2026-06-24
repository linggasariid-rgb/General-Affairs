import { useState, useEffect } from 'react';
import { masterApi, apiFetch } from '../../services/api';

const PRIORITY_BADGE = { low: 'secondary', medium: 'primary', high: 'warning', critical: 'danger' };
const STATUS_BADGE = { dilaporkan: 'secondary', diproses: 'warning', selesai: 'success', ditutup: 'dark' };

export default function BuildingIssuePage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cabangList, setCabangList] = useState([]);
  const [form, setForm] = useState({
    judul: '', deskripsi: '', id_cabang: '', prioritas: 'medium',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchIssues(); }, []);

  async function fetchIssues() {
    setLoading(true);
    try {
      const data = await apiFetch('/building/issue?perPage=50');
      setIssues(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openModal() {
    try {
      const res = await masterApi.cabang.list({ perPage: '100' });
      setCabangList(res.data);
    } catch (err) {
      console.error(err);
    }
    setForm({ judul: '', deskripsi: '', id_cabang: '', prioritas: 'medium' });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/building/issue', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setShowModal(false);
      fetchIssues();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAction(id, action) {
    try {
      await apiFetch(`/building/issue/${id}/${action}`, { method: 'PUT' });
      fetchIssues();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Building Issues</h4>
          <small className="text-muted">{issues.length} total laporan</small>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <i className="bi bi-plus-lg me-1"></i>Laporkan Issue
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Tanggal</th><th>Judul</th><th>Cabang</th><th>Prioritas</th><th>Status</th><th>PIC</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : issues.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Belum ada laporan issue</td></tr>
              ) : issues.map((issue) => (
                <tr key={issue.id}>
                  <td className="text-nowrap">{issue.created_at ? new Date(issue.created_at).toLocaleDateString('id-ID') : '-'}</td>
                  <td><strong>{issue.judul}</strong></td>
                  <td>{issue.cabang?.nama || '-'}</td>
                  <td><span className={`badge bg-${PRIORITY_BADGE[issue.prioritas] || 'secondary'}`}>{issue.prioritas}</span></td>
                  <td><span className={`badge bg-${STATUS_BADGE[issue.status] || 'secondary'}`}>{issue.status}</span></td>
                  <td>{issue.pic?.nama || '-'}</td>
                  <td>
                    {issue.status === 'dilaporkan' && (
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleAction(issue.id, 'proses')}>
                        <i className="bi bi-play-fill"></i>
                      </button>
                    )}
                    {issue.status === 'diproses' && (
                      <button className="btn btn-sm btn-outline-success" onClick={() => handleAction(issue.id, 'selesai')}>
                        <i className="bi bi-check-lg"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Laporkan Issue Bangunan</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Judul <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Deskripsi</label>
                    <textarea className="form-control" rows="3" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cabang <span className="text-danger">*</span></label>
                    <select className="form-select" value={form.id_cabang} onChange={(e) => setForm({ ...form, id_cabang: e.target.value })} required>
                      <option value="">-- Pilih --</option>
                      {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Prioritas</label>
                    <select className="form-select" value={form.prioritas} onChange={(e) => setForm({ ...form, prioritas: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                    Laporkan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
