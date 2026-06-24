import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceApi, masterApi, apiFetch } from '../../services/api';

export default function TicketFormPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState([]);
  const [kendaraan, setKendaraan] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [jenisMaint, setJenisMaint] = useState([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  const [form, setForm] = useState({
    judul: '', deskripsi: '', id_asset: '', id_kendaraan: '',
    id_jenis_maintenance: '', id_cabang: '', prioritas: 'medium',
    tipe: 'internal', tanggal_rencana: '',
  });

  useEffect(() => {
    Promise.all([
      masterApi.cabang.list({ perPage: '100' }),
      apiFetch('/master/jenis-maintenance?perPage=100'),
      apiFetch('/vehicle?perPage=100'),
    ]).then(([cabang, jm, kend]) => {
      setCabangList(cabang.data);
      setJenisMaint(jm.data || []);
      setKendaraan(kend.data || []);
    }).catch(console.error);
  }, []);

  async function searchAsset(q) {
    setAssetSearch(q);
    if (q.length < 2) return;
    try {
      const data = await apiFetch(`/asset?perPage=20&search=${q}`);
      setAssets(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await maintenanceApi.ticket.create(form);
      navigate('/app/maintenance/ticket');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Buat Ticket Maintenance</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Informasi Ticket</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Judul <span className="text-danger">*</span></label>
                <input className="form-control" name="judul" value={form.judul} onChange={handleChange} required />
              </div>
              <div className="col-12">
                <label className="form-label">Deskripsi</label>
                <textarea className="form-control" name="deskripsi" rows="3" value={form.deskripsi} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-4">
                <label className="form-label">Cabang <span className="text-danger">*</span></label>
                <select className="form-select" name="id_cabang" value={form.id_cabang} onChange={handleChange} required>
                  <option value="">-- Pilih --</option>
                  {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Jenis Maintenance <span className="text-danger">*</span></label>
                <select className="form-select" name="id_jenis_maintenance" value={form.id_jenis_maintenance} onChange={handleChange} required>
                  <option value="">-- Pilih --</option>
                  {jenisMaint.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Prioritas <span className="text-danger">*</span></label>
                <select className="form-select" name="prioritas" value={form.prioritas} onChange={handleChange} required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Tipe</label>
                <select className="form-select" name="tipe" value={form.tipe} onChange={handleChange}>
                  <option value="internal">Internal</option>
                  <option value="eksternal">Eksternal</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Tanggal Rencana</label>
                <input className="form-control" name="tanggal_rencana" type="date" value={form.tanggal_rencana} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Kendaraan</label>
                <select className="form-select" name="id_kendaraan" value={form.id_kendaraan} onChange={handleChange}>
                  <option value="">-- Pilih --</option>
                  {kendaraan.map((k) => <option key={k.id} value={k.id}>{k.nopol} - {k.merk}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Selector */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Asset</h6>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setShowAssetPicker(!showAssetPicker)}>
              <i className="bi bi-search me-1"></i>Cari Asset
            </button>
          </div>
          <div className="card-body">
            {form.id_asset ? (
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary fs-6">Asset Terpilih</span>
                <span>{assets.find((a) => a.id === form.id_asset)?.nama || form.id_asset}</span>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setForm({ ...form, id_asset: '' })}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
            ) : (
              <p className="text-muted mb-0">Belum ada asset dipilih</p>
            )}

            {showAssetPicker && (
              <div className="mt-3">
                <input className="form-control form-control-sm mb-2" placeholder="Cari asset..." value={assetSearch} onChange={(e) => searchAsset(e.target.value)} />
                <div className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {assets.filter((a) => a.nama?.toLowerCase().includes(assetSearch.toLowerCase())).map((a) => (
                    <button type="button" key={a.id} className="list-group-item list-group-item-action py-2"
                      onClick={() => { setForm({ ...form, id_asset: a.id }); setShowAssetPicker(false); }}>
                      <strong>{a.nama}</strong> <small className="text-muted">({a.kode_asset})</small>
                    </button>
                  ))}
                  {assets.length === 0 && assetSearch.length >= 2 && (
                    <div className="list-group-item text-muted">Tidak ditemukan</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Simpan Ticket
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/app/maintenance/ticket')}>Batal</button>
        </div>
      </form>
    </div>
  );
}
