import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { procurementApi } from '../../services/api';

const STATUS_BADGE = {
  draft: 'secondary', diajukan: 'info', disetujui_kacab: 'primary',
  disetujui_hga: 'success', ditolak: 'danger', diproses: 'warning',
  selesai: 'success', closed: 'dark',
};

export default function PRDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchPR(); }, [id]);

  async function fetchPR() {
    setLoading(true);
    try {
      const res = await procurementApi.pr.get(id);
      setPr(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action) {
    setActionLoading(action);
    try {
      const actions = {
        submit: () => procurementApi.pr.submit(id),
        approveKacab: () => procurementApi.pr.approveKacab(id, {}),
        approveHGA: () => procurementApi.pr.approveHGA(id, {}),
      };
      await actions[action]();
      setRejectModal(false);
      fetchPR();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  }

  async function handleReject() {
    setActionLoading('reject');
    try {
      await procurementApi.pr.reject(id, { alasan: rejectReason });
      setRejectModal(false);
      fetchPR();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  }

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  if (!pr) {
    return <div className="text-center py-5 text-muted">PR tidak ditemukan</div>;
  }

  const items = pr.purchase_request_item || [];
  const totalEstimasi = items.reduce((sum, i) => sum + Number(i.jumlah) * Number(i.estimasi_harga || 0), 0);

  const showActions = {
    submit: pr.status === 'draft',
    approveKacab: pr.status === 'diajukan' && hasRole(['KCB', 'SA', 'HGA']),
    approveHGA: pr.status === 'disetujui_kacab' && hasRole(['HGA', 'SA']),
    reject: (pr.status === 'diajukan' || pr.status === 'disetujui_kacab') && hasRole(['KCB', 'HGA', 'SA']),
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">{pr.judul}</h4>
          <small className="text-muted">{pr.nomor_pr}</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/app/procurement/pr')}>
          <i className="bi bi-arrow-left me-1"></i>Kembali
        </button>
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
        <span className={`badge bg-${STATUS_BADGE[pr.status]} fs-6`}>{pr.status}</span>
        {pr.cabang && <span className="badge bg-primary fs-6">{pr.cabang.nama}</span>}
        {pr.urgent && <span className="badge bg-danger fs-6">Urgent</span>}
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {showActions.submit && (
          <button className="btn btn-info btn-sm" onClick={() => handleAction('submit')} disabled={actionLoading === 'submit'}>
            {actionLoading === 'submit' ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            <i className="bi bi-send me-1"></i>Ajukan
          </button>
        )}
        {showActions.approveKacab && (
          <button className="btn btn-primary btn-sm" onClick={() => handleAction('approveKacab')} disabled={actionLoading === 'approveKacab'}>
            {actionLoading === 'approveKacab' ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            <i className="bi bi-check-lg me-1"></i>Setujui (Kacab)
          </button>
        )}
        {showActions.approveHGA && (
          <button className="btn btn-success btn-sm" onClick={() => handleAction('approveHGA')} disabled={actionLoading === 'approveHGA'}>
            {actionLoading === 'approveHGA' ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            <i className="bi bi-check-all me-1"></i>Setujui (HGA)
          </button>
        )}
        {showActions.reject && (
          <button className="btn btn-danger btn-sm" onClick={() => setRejectModal(true)}>
            <i className="bi bi-x-lg me-1"></i>Tolak
          </button>
        )}
        {pr.status === 'disetujui_hga' && (
          <button className="btn btn-warning btn-sm" onClick={() => navigate(`/app/procurement/po/create?pr_id=${pr.id}`)}>
            <i className="bi bi-file-earmark-text me-1"></i>Buat PO
          </button>
        )}
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          {/* Items Table */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white"><h6 className="mb-0">Item PR</h6></div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr><th>#</th><th>Nama Barang</th><th>Spesifikasi</th><th>Jumlah</th><th>Satuan</th><th>Estimasi Harga</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id || i}>
                      <td>{i + 1}</td>
                      <td>{item.nama_barang}</td>
                      <td className="small">{item.spesifikasi || '-'}</td>
                      <td>{item.jumlah}</td>
                      <td>{item.satuan}</td>
                      <td>Rp{Number(item.estimasi_harga || 0).toLocaleString('id-ID')}</td>
                      <td>Rp{Number(item.jumlah * (item.estimasi_harga || 0)).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <th colSpan="6" className="text-end">Total Estimasi</th>
                    <th>Rp{totalEstimasi.toLocaleString('id-ID')}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Approval History */}
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Riwayat Approval</h6></div>
            <div className="card-body">
              {pr.approval_history && pr.approval_history.length > 0 ? (
                <div>
                  {pr.approval_history.map((h, i) => (
                    <div className="d-flex gap-3 mb-3" key={i}>
                      <div className="d-flex flex-column align-items-center">
                        <div className={`rounded-circle bg-${h.tipe_aksi === 'approve' ? 'success' : h.tipe_aksi === 'reject' ? 'danger' : 'secondary'}`} style={{ width: '12px', height: '12px' }}></div>
                        {i < pr.approval_history.length - 1 && <div className="bg-light" style={{ width: '2px', flexGrow: 1 }}></div>}
                      </div>
                      <div>
                        <small className="text-muted">{new Date(h.created_at).toLocaleString('id-ID')}</small>
                        <p className="mb-0">
                          <strong className="text-capitalize">{h.tipe_aksi}</strong>
                          {' oleh '}{h.user?.nama || '-'}
                        </p>
                        {h.catatan && <small className="text-muted">{h.catatan}</small>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">Belum ada riwayat approval</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-white"><h6 className="mb-0">Informasi</h6></div>
            <div className="card-body">
              <table className="table table-sm mb-0">
                <tbody>
                  <tr><td className="text-muted">Pemohon</td><td><strong>{pr.creator?.nama || '-'}</strong></td></tr>
                  <tr><td className="text-muted">Cabang</td><td><strong>{pr.cabang?.nama || '-'}</strong></td></tr>
                  <tr><td className="text-muted">Dibuat</td><td><strong>{pr.created_at ? new Date(pr.created_at).toLocaleDateString('id-ID') : '-'}</strong></td></tr>
                  <tr><td className="text-muted">Jumlah Item</td><td><strong>{items.length}</strong></td></tr>
                  <tr><td className="text-muted">Estimasi Total</td><td><strong>Rp{totalEstimasi.toLocaleString('id-ID')}</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {pr.deskripsi && (
            <div className="card shadow-sm">
              <div className="card-header bg-white"><h6 className="mb-0">Deskripsi</h6></div>
              <div className="card-body">
                <p className="mb-0 small">{pr.deskripsi}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tolak PR</h5>
                <button type="button" className="btn-close" onClick={() => setRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Alasan Penolakan <span className="text-danger">*</span></label>
                  <textarea className="form-control" rows="3" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setRejectModal(false)}>Batal</button>
                <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading === 'reject' || !rejectReason}>
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
