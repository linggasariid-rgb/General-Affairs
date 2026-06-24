import { useState, useEffect } from 'react';
import { assetApi, masterApi } from '../../services/api';

const STATUS_BADGE = {
  diajukan: 'secondary', disetujui: 'success', ditolak: 'danger', selesai: 'primary',
};

export default function MutasiPage() {
  const [mutasi, setMutasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [form, setForm] = useState({
    id_asset: '', tipe_mutasi: 'cabang', id_cabang_tujuan: '',
    id_gudang_tujuan: '', keterangan: '',
  });

  useEffect(() => { fetchMutasi(); }, []);

  async function fetchMutasi() {
    setLoading(true);
    try {
      const res = await assetApi.mutasi.list({ perPage: '50' });
      setMutasi(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openModal() {
    setForm({ id_asset: '', tipe_mutasi: 'cabang', id_cabang_tujuan: '', id_gudang_tujuan: '', keterangan: '' });
    try {
      const [a, c] = await Promise.all([
        assetApi.list({ perPage: '100', status: 'aktif' }),
        masterApi.cabang.list({ perPage: '100' }),
      ]);
      setAssets(a.data);
      setCabangList(c.data);
    } catch (err) {
      console.error(err);
    }
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        id_asset: form.id_asset,
        tipe_mutasi: form.tipe_mutasi,
        keterangan: form.keterangan,
      };
      if (form.tipe_mutasi === 'cabang') payload.id_cabang_tujuan = form.id_cabang_tujuan;
      else payload.id_gudang_tujuan = form.id_gudang_tujuan;
      await assetApi.mutasi.create(payload);
      setShowModal(false);
      fetchMutasi();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Mutasi Asset</h4>
          <small className="text-muted">{mutasi.length} total mutasi</small>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <i className="bi bi-plus-lg me-1"></i>Ajukan Mutasi
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Tanggal</th><th>Asset</th><th>Tipe</th><th>Dari</th><th>Tujuan</th><th>Status</th><th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : mutasi.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Belum ada data mutasi</td></tr>
              ) : mutasi.map((m) => (
                <tr key={m.id}>
                  <td className="text-nowrap">{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                  <td><strong>{m.asset?.nama || '-'}</strong></td>
                  <td>{m.tipe_mutasi}</td>
                  <td>{m.cabang_asal?.nama || m.gudang_asal?.nama || '-'}</td>
                  <td>{m.cabang_tujuan?.nama || m.gudang_tujuan?.nama || '-'}</td>
                  <td><span className={`badge bg-${STATUS_BADGE[m.status] || 'secondary'}`}>{m.status}</span></td>
                  <td className="small">{m.keterangan || '-'}</td>
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
                <h5 className="modal-title">Ajukan Mutasi Asset</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Asset <span className="text-danger">*</span></label>
                    <select className="form-select" value={form.id_asset} onChange={(e) => setForm({ ...form, id_asset: e.target.value })} required>
                      <option value="">-- Pilih Asset --</option>
                      {assets.map((a) => <option key={a.id} value={a.id}>{a.nama} ({a.kode_asset})</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipe Mutasi</label>
                    <select className="form-select" value={form.tipe_mutasi} onChange={(e) => setForm({ ...form, tipe_mutasi: e.target.value })}>
                      <option value="cabang"> Antar Cabang</option>
                      <option value="gudang"> Ke Gudang</option>
                    </select>
                  </div>
                  {form.tipe_mutasi === 'cabang' ? (
                    <div className="mb-3">
                      <label className="form-label">Cabang Tujuan <span className="text-danger">*</span></label>
                      <select className="form-select" value={form.id_cabang_tujuan} onChange={(e) => setForm({ ...form, id_cabang_tujuan: e.target.value })} required>
                        <option value="">-- Pilih Cabang --</option>
                        {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label">Gudang Tujuan <span className="text-danger">*</span></label>
                      <select className="form-select" value={form.id_gudang_tujuan} onChange={(e) => setForm({ ...form, id_gudang_tujuan: e.target.value })} required>
                        <option value="">-- Pilih Gudang --</option>
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Keterangan</label>
                    <textarea className="form-control" rows="2" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary">Ajukan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
