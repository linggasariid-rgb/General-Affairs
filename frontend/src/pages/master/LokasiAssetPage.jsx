import { useState, useEffect } from 'react';
import { masterApi, apiFetch } from '../../services/api';

export default function LokasiAssetPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [cabangList, setCabangList] = useState([]);
  const [filterCabang, setFilterCabang] = useState('');
  const [form, setForm] = useState({ nama: '', kode: '', id_cabang: '', keterangan: '' });

  useEffect(() => {
    masterApi.cabang.list({ perPage: '100' }).then((res) => setCabangList(res.data)).catch(console.error);
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ perPage: '100' });
      if (filterCabang) params.set('id_cabang', filterCabang);
      const data = await apiFetch(`/master/lokasi-asset?${params}`);
      setData(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [filterCabang]);

  function openModal(item = null) {
    if (item) {
      setEditItem(item);
      setForm({ nama: item.nama, kode: item.kode || '', id_cabang: item.id_cabang || '', keterangan: item.keterangan || '' });
    } else {
      setEditItem(null);
      setForm({ nama: '', kode: '', id_cabang: filterCabang || '', keterangan: '' });
    }
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const method = editItem ? 'PUT' : 'POST';
      const endpoint = editItem ? `/master/lokasi-asset/${editItem.id}` : '/master/lokasi-asset';
      await apiFetch(endpoint, { method, body: JSON.stringify(form) });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus lokasi ini?')) return;
    try {
      await apiFetch(`/master/lokasi-asset/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Lokasi Asset</h4>
          <small className="text-muted">{data.length} total lokasi</small>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="bi bi-plus-lg me-1"></i>Tambah Lokasi
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <label className="form-label mb-0">Filter Cabang:</label>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filterCabang} onChange={(e) => setFilterCabang(e.target.value)}>
                <option value="">Semua Cabang</option>
                {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Kode</th><th>Nama Lokasi</th><th>Cabang</th><th>Keterangan</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">Belum ada data lokasi</td></tr>
              ) : data.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.kode || '-'}</strong></td>
                  <td>{l.nama}</td>
                  <td>{l.cabang?.nama || '-'}</td>
                  <td className="small">{l.keterangan || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openModal(l)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(l.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
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
                <h5 className="modal-title">{editItem ? 'Edit Lokasi' : 'Tambah Lokasi'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nama Lokasi <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Kode</label>
                    <input className="form-control" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cabang</label>
                    <select className="form-select" value={form.id_cabang} onChange={(e) => setForm({ ...form, id_cabang: e.target.value })}>
                      <option value="">-- Pilih --</option>
                      {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Keterangan</label>
                    <textarea className="form-control" rows="2" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
