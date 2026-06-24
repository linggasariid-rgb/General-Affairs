import { useState, useEffect } from 'react';
import { procurementApi, apiFetch } from '../../services/api';

const STATUS_BADGE = {
  draft: 'secondary', dikirim: 'primary', diterima: 'success', ditolak: 'danger',
};

export default function PenerimaanPage() {
  const [penerimaan, setPenerimaan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [poList, setPoList] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [poItems, setPoItems] = useState([]);
  const [form, setForm] = useState({ id_po: '', catatan: '' });

  useEffect(() => { fetchPenerimaan(); }, []);

  async function fetchPenerimaan() {
    setLoading(true);
    try {
      const data = await apiFetch('/procurement/penerimaan?perPage=50');
      setPenerimaan(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openModal() {
    try {
      const res = await procurementApi.po.list({ perPage: '100', status: 'dikirim' });
      setPoList(res.data);
    } catch (err) {
      console.error(err);
    }
    setForm({ id_po: '', catatan: '' });
    setSelectedPO(null);
    setPoItems([]);
    setShowModal(true);
  }

  async function selectPO(e) {
    const poId = e.target.value;
    setForm({ ...form, id_po: poId });
    if (!poId) { setSelectedPO(null); setPoItems([]); return; }
    try {
      const res = await procurementApi.po.get(poId);
      setSelectedPO(res.data);
      setPoItems((res.data.po_item || []).map((item) => ({
        ...item,
        diterima: item.jumlah,
        catatan: '',
      })));
    } catch (err) {
      console.error(err);
    }
  }

  function updateDiterima(index, value) {
    const updated = [...poItems];
    updated[index].diterima = Number(value);
    setPoItems(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiFetch('/procurement/penerimaan', {
        method: 'POST',
        body: JSON.stringify({
          id_po: form.id_po,
          catatan: form.catatan,
          items: poItems.map((item) => ({ id_po_item: item.id, jumlah_diterima: item.diterima, catatan: item.catatan })),
        }),
      });
      setShowModal(false);
      fetchPenerimaan();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Penerimaan Barang</h4>
          <small className="text-muted">{penerimaan.length} total penerimaan</small>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <i className="bi bi-plus-lg me-1"></i>Terima Barang
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>No. Penerimaan</th><th>PO</th><th>Vendor</th><th>Tanggal</th><th>Status</th><th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : penerimaan.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Belum ada penerimaan</td></tr>
              ) : penerimaan.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.nomor_penerimaan}</strong></td>
                  <td>{p.po?.nomor_po || '-'}</td>
                  <td>{p.po?.vendor?.nama || '-'}</td>
                  <td className="text-nowrap">{p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'}</td>
                  <td><span className={`badge bg-${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                  <td className="small">{p.catatan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Terima Barang</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Purchase Order <span className="text-danger">*</span></label>
                    <select className="form-select" value={form.id_po} onChange={selectPO} required>
                      <option value="">-- Pilih PO --</option>
                      {poList.map((po) => (
                        <option key={po.id} value={po.id}>{po.nomor_po} - {po.vendor?.nama || '-'}</option>
                      ))}
                    </select>
                  </div>

                  {selectedPO && (
                    <>
                      <p className="mb-2"><strong>Item dari PO: {selectedPO.nomor_po}</strong></p>
                      <table className="table table-sm mb-3">
                        <thead className="table-light">
                          <tr><th>Barang</th><th>Jumlah PO</th><th>Diterima</th><th>Catatan</th></tr>
                        </thead>
                        <tbody>
                          {poItems.map((item, i) => (
                            <tr key={i}>
                              <td>{item.nama_barang}</td>
                              <td>{item.jumlah}</td>
                              <td style={{ width: '100px' }}>
                                <input className="form-control form-control-sm" type="number" min="0" max={item.jumlah}
                                  value={item.diterima} onChange={(e) => updateDiterima(i, e.target.value)} />
                              </td>
                              <td>
                                <input className="form-control form-control-sm" value={item.catatan} onChange={(e) => {
                                  const updated = [...poItems]; updated[i].catatan = e.target.value; setPoItems(updated);
                                }} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Catatan Penerimaan</label>
                    <textarea className="form-control" rows="2" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary">Konfirmasi Terima</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
