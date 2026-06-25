import { useState, useEffect } from 'react';
import { atkApi } from '../../services/api';

const STATUS_BADGE = {
  diterima: 'success', diterima_sebagian: 'warning', ditolak: 'danger', selesai: 'primary',
};

export default function ATKPenerimaanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [distribusiList, setDistribusiList] = useState([]);
  const [selectedDistribusi, setSelectedDistribusi] = useState(null);
  const [form, setForm] = useState({ id_distribusi: '', id_cabang: '', tanggal_terima: new Date().toISOString().split('T')[0], catatan: '' });
  const [receiveItems, setReceiveItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await atkApi.penerimaan.list({ perPage: '50' });
      setData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleSelectDistribusi(idDistribusi) {
    try {
      const res = await atkApi.distribusi.get(idDistribusi);
      const dist = res.data;
      setSelectedDistribusi(dist);
      setForm({
        id_distribusi: dist.id,
        id_cabang: dist.id_cabang,
        tanggal_terima: new Date().toISOString().split('T')[0],
        catatan: '',
      });
      setReceiveItems((dist.atk_distribusi_item || []).map((item) => ({
        id_distribusi_item: item.id,
        id_item: item.id_item,
        qty_direncanakan: item.qty_direncanakan,
        qty_dikirim: item.qty_dikirim || item.qty_direncanakan,
        qty_diterima: item.qty_dikirim || item.qty_direncanakan,
        qty_rusak: 0,
        qty_kurang: 0,
        kondisi: 'baik',
        catatan: '',
        nama_item: item.atk_item?.nama || '',
        kode_item: item.atk_item?.kode_item || '',
      })));
    } catch (err) { console.error(err); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await atkApi.penerimaan.create({
        ...form,
        items: receiveItems,
      });
      setShowForm(false);
      setSelectedDistribusi(null);
      setReceiveItems([]);
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  async function openForm() {
    setSelectedDistribusi(null);
    setReceiveItems([]);
    setForm({ id_distribusi: '', id_cabang: '', tanggal_terima: new Date().toISOString().split('T')[0], catatan: '' });
    const res = await atkApi.distribusi.list({ perPage: '100', status: 'dikirim' });
    setDistribusiList(res.data);
    setShowForm(true);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Penerimaan ATK/RTK</h4>
          <small className="text-muted">{data.length} total penerimaan</small>
        </div>
        <button className="btn btn-primary" onClick={openForm}>
          <i className="bi bi-plus-lg me-1"></i>Catat Penerimaan
        </button>
      </div>

      {showForm && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-header bg-white"><h6 className="mb-0">Catat Penerimaan Barang</h6></div>
          <div className="card-body">
            {!selectedDistribusi ? (
              <div>
                <label className="form-label">Pilih Distribusi yang Dikirim</label>
                <select className="form-select" value={form.id_distribusi} onChange={(e) => handleSelectDistribusi(e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {distribusiList.map(d => <option key={d.id} value={d.id}>{d.nomor_distribusi} - {d.cabang?.nama} ({d.bulan}/{d.tahun})</option>)}
                </select>
                {distribusiList.length === 0 && (
                  <div className="alert alert-info mt-2 mb-0 py-2 small">Belum ada distribusi dengan status Dikirim. Buat distribusi terlebih dahulu dan ubah statusnya menjadi Dikirim.</div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Distribusi</label>
                    <input className="form-control" value={selectedDistribusi.nomor_distribusi} disabled />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Tanggal Terima <span className="text-danger">*</span></label>
                    <input className="form-control" type="date" value={form.tanggal_terima} onChange={(e) => setForm({ ...form, tanggal_terima: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Catatan</label>
                    <textarea className="form-control" rows="2" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
                  </div>
                </div>

                <h6 className="mb-2">Item Diterima</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr><th>Item</th><th>Direncanakan</th><th>Dikirim</th><th>Diterima</th><th>Rusak</th><th>Kurang</th><th>Kondisi</th></tr>
                    </thead>
                    <tbody>
                      {receiveItems.map((item, i) => (
                        <tr key={i}>
                          <td><strong>{item.kode_item}</strong> - {item.nama_item}</td>
                          <td>{item.qty_direncanakan}</td>
                          <td>{item.qty_dikirim}</td>
                          <td><input className="form-control form-control-sm" type="number" min="0" value={item.qty_diterima} onChange={(e) => { const updated = [...receiveItems]; updated[i].qty_diterima = Number(e.target.value); setReceiveItems(updated); }} required /></td>
                          <td><input className="form-control form-control-sm" type="number" min="0" value={item.qty_rusak} onChange={(e) => { const updated = [...receiveItems]; updated[i].qty_rusak = Number(e.target.value); setReceiveItems(updated); }} /></td>
                          <td><input className="form-control form-control-sm" type="number" min="0" value={item.qty_kurang} onChange={(e) => { const updated = [...receiveItems]; updated[i].qty_kurang = Number(e.target.value); setReceiveItems(updated); }} /></td>
                          <td>
                            <select className="form-select form-select-sm" value={item.kondisi} onChange={(e) => { const updated = [...receiveItems]; updated[i].kondisi = e.target.value; setReceiveItems(updated); }}>
                              <option value="baik">Baik</option>
                              <option value="rusak">Rusak</option>
                              <option value="kurang">Kurang</option>
                              <option value="salah">Salah</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                    Simpan Penerimaan
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setSelectedDistribusi(null); }}>Batal</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>No Penerimaan</th><th>Distribusi</th><th>Cabang</th><th>Tanggal</th><th>Status</th><th>Diterima Oleh</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.nomor_penerimaan}</strong></td>
                  <td>{item.distribusi?.nomor_distribusi || '-'}</td>
                  <td>{item.cabang?.nama || '-'}</td>
                  <td>{item.tanggal_terima}</td>
                  <td><span className={`badge bg-${STATUS_BADGE[item.status]}`}>{item.status}</span></td>
                  <td>{item.received_by?.nama || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
