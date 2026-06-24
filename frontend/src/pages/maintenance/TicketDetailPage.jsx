import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { maintenanceApi } from '../../services/api';

const PRIORITY_BADGE = { low: 'secondary', medium: 'primary', high: 'warning', critical: 'danger' };
const STATUS_BADGE = {
  dibuat: 'secondary', disetujui: 'info', ditolak: 'danger',
  ditugaskan: 'primary', dikerjakan: 'warning', selesai: 'success',
  diverifikasi: 'info', closed: 'dark',
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, hasRole } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [assignModal, setAssignModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchTicket(); }, [id]);

  async function fetchTicket() {
    setLoading(true);
    try {
      const res = await maintenanceApi.ticket.get(id);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action, data = {}) {
    setActionLoading(action);
    try {
      const actions = {
        approve: () => maintenanceApi.ticket.approve(id),
        start: () => maintenanceApi.ticket.start(id),
        assign: () => maintenanceApi.ticket.assign(id, data),
        complete: () => maintenanceApi.ticket.complete(id, data),
        verify: () => maintenanceApi.ticket.verify(id, data),
        close: () => maintenanceApi.ticket.close(id),
      };
      await actions[action]();
      setAssignModal(false); setCompleteModal(false); setVerifyModal(false); setRejectModal(false);
      fetchTicket();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  }

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  if (!ticket) {
    return <div className="text-center py-5 text-muted">Ticket tidak ditemukan</div>;
  }

  const showActions = {
    approve: ticket.status === 'dibuat',
    assign: ticket.status === 'disetujui',
    start: ticket.status === 'ditugaskan',
    complete: ticket.status === 'dikerjakan',
    verify: ticket.status === 'selesai',
    close: ticket.status === 'diverifikasi',
    reject: ticket.status === 'dibuat' || ticket.status === 'disetujui',
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">{ticket.judul}</h4>
          <small className="text-muted">{ticket.nomor_ticket}</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/app/maintenance/ticket')}>
          <i className="bi bi-arrow-left me-1"></i>Kembali
        </button>
      </div>

      {/* Status Bar */}
      <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
        <span className={`badge bg-${STATUS_BADGE[ticket.status]} fs-6`}>{ticket.status}</span>
        <span className={`badge bg-${PRIORITY_BADGE[ticket.prioritas]} fs-6`}>{ticket.prioritas}</span>
        <span className="badge bg-info fs-6">{ticket.tipe}</span>
        {ticket.cabang && <span className="badge bg-primary fs-6">{ticket.cabang.nama}</span>}
        {ticket.sla_deadline && (
          <small className={`ms-2 ${new Date(ticket.sla_deadline) < new Date() ? 'text-danger' : 'text-success'}`}>
            SLA: {new Date(ticket.sla_deadline).toLocaleDateString('id-ID')}
          </small>
        )}
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {showActions.approve && (
          <button className="btn btn-success btn-sm" onClick={() => handleAction('approve')} disabled={actionLoading === 'approve'}>
            {actionLoading === 'approve' ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            <i className="bi bi-check-lg me-1"></i>Setujui
          </button>
        )}
        {showActions.assign && (
          <button className="btn btn-primary btn-sm" onClick={() => setAssignModal(true)}>
            <i className="bi bi-person-plus me-1"></i>Assign Teknisi
          </button>
        )}
        {showActions.start && (
          <button className="btn btn-warning btn-sm" onClick={() => handleAction('start')} disabled={actionLoading === 'start'}>
            {actionLoading === 'start' ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            <i className="bi bi-play-fill me-1"></i>Mulai Pengerjaan
          </button>
        )}
        {showActions.complete && (
          <button className="btn btn-success btn-sm" onClick={() => setCompleteModal(true)}>
            <i className="bi bi-check-circle me-1"></i>Selesai
          </button>
        )}
        {showActions.verify && (
          <button className="btn btn-info btn-sm" onClick={() => setVerifyModal(true)}>
            <i className="bi bi-shield-check me-1"></i>Verifikasi
          </button>
        )}
        {showActions.close && (
          <button className="btn btn-dark btn-sm" onClick={() => handleAction('close')} disabled={actionLoading === 'close'}>
            {actionLoading === 'close' ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            <i className="bi bi-x-circle me-1"></i>Close
          </button>
        )}
        {showActions.reject && (
          <button className="btn btn-danger btn-sm" onClick={() => setRejectModal(true)}>
            <i className="bi bi-x-lg me-1"></i>Tolak
          </button>
        )}
      </div>

      <div className="row g-4">
        {/* Detail */}
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white"><h6 className="mb-0">Detail Ticket</h6></div>
            <div className="card-body">
              <table className="table table-sm mb-0">
                <tbody>
                  {[
                    ['Deskripsi', ticket.deskripsi || '-'],
                    ['Asset', ticket.asset?.nama || '-'],
                    ['Kendaraan', ticket.kendaraan?.nopol || '-'],
                    ['Cabang', ticket.cabang?.nama || '-'],
                    ['Jenis Maintenance', ticket.jenis_maintenance?.nama || '-'],
                    ['Prioritas', ticket.prioritas],
                    ['Tipe', ticket.tipe],
                    ['Tanggal Rencana', ticket.tanggal_rencana ? new Date(ticket.tanggal_rencana).toLocaleDateString('id-ID') : '-'],
                    ['Tanggal Selesai', ticket.tanggal_selesai ? new Date(ticket.tanggal_selesai).toLocaleDateString('id-ID') : '-'],
                    ['Teknisi', ticket.teknisi?.nama || ticket.vendor?.nama || '-'],
                    ['Biaya', ticket.biaya ? `Rp${Number(ticket.biaya).toLocaleString('id-ID')}` : '-'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="text-muted" style={{ width: '200px' }}>{label}</td>
                      <td><strong>{value}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline */}
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Timeline</h6></div>
            <div className="card-body">
              {ticket.timeline && ticket.timeline.length > 0 ? (
                <div className="timeline">
                  {ticket.timeline.map((t, i) => (
                    <div className="d-flex gap-3 mb-3" key={i}>
                      <div className="d-flex flex-column align-items-center">
                        <div className="rounded-circle bg-primary" style={{ width: '12px', height: '12px' }}></div>
                        {i < ticket.timeline.length - 1 && <div className="bg-light" style={{ width: '2px', flexGrow: 1 }}></div>}
                      </div>
                      <div>
                        <small className="text-muted">{new Date(t.created_at).toLocaleString('id-ID')}</small>
                        <p className="mb-0"><strong>{t.status}</strong></p>
                        {t.catatan && <small className="text-muted">{t.catatan}</small>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">Belum ada timeline</p>
              )}
            </div>
          </div>
        </div>

        {/* Side Info */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-white"><h6 className="mb-0">SLA Information</h6></div>
            <div className="card-body">
              <p className="mb-1"><small className="text-muted">Deadline:</small></p>
              <p className="mb-0"><strong>{ticket.sla_deadline ? new Date(ticket.sla_deadline).toLocaleDateString('id-ID') : '-'}</strong></p>
              {ticket.sla_deadline && (
                <span className={`badge ${new Date(ticket.sla_deadline) < new Date() ? 'bg-danger' : 'bg-success'} mt-2`}>
                  {new Date(ticket.sla_deadline) < new Date() ? 'Overdue' : 'On Track'}
                </span>
              )}
            </div>
          </div>

          {ticket.keterangan && (
            <div className="card shadow-sm">
              <div className="card-header bg-white"><h6 className="mb-0">Keterangan</h6></div>
              <div className="card-body">
                <p className="mb-0 small">{ticket.keterangan}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Teknisi</h5>
                <button type="button" className="btn-close" onClick={() => setAssignModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nama Teknisi/Vendor</label>
                  <input className="form-control" value={formData.id_teknisi || ''} onChange={(e) => setFormData({ ...formData, id_teknisi: e.target.value })} placeholder="ID Teknisi" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Catatan</label>
                  <textarea className="form-control" rows="2" value={formData.catatan || ''} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setAssignModal(false)}>Batal</button>
                <button className="btn btn-primary" onClick={() => handleAction('assign', formData)} disabled={actionLoading === 'assign'}>
                  {actionLoading === 'assign' ? <span className="spinner-border spinner-border-sm me-1" /> : null}Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selesaikan Ticket</h5>
                <button type="button" className="btn-close" onClick={() => setCompleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Catatan Penyelesaian</label>
                  <textarea className="form-control" rows="3" value={formData.catatan || ''} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Biaya (Rp)</label>
                  <input className="form-control" type="number" value={formData.biaya || ''} onChange={(e) => setFormData({ ...formData, biaya: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setCompleteModal(false)}>Batal</button>
                <button className="btn btn-success" onClick={() => handleAction('complete', formData)} disabled={actionLoading === 'complete'}>
                  {actionLoading === 'complete' ? <span className="spinner-border spinner-border-sm me-1" /> : null}Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Verifikasi Ticket</h5>
                <button type="button" className="btn-close" onClick={() => setVerifyModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Catatan Verifikasi</label>
                  <textarea className="form-control" rows="3" value={formData.catatan || ''} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setVerifyModal(false)}>Batal</button>
                <button className="btn btn-info" onClick={() => handleAction('verify', formData)} disabled={actionLoading === 'verify'}>
                  {actionLoading === 'verify' ? <span className="spinner-border spinner-border-sm me-1" /> : null}Verifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tolak Ticket</h5>
                <button type="button" className="btn-close" onClick={() => setRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Alasan Penolakan <span className="text-danger">*</span></label>
                  <textarea className="form-control" rows="3" value={formData.alasan || ''} onChange={(e) => setFormData({ ...formData, alasan: e.target.value })} required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setRejectModal(false)}>Batal</button>
                <button className="btn btn-danger" onClick={() => handleAction('reject', formData)} disabled={actionLoading === 'reject'}>
                  {actionLoading === 'reject' ? <span className="spinner-border spinner-border-sm me-1" /> : null}Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
