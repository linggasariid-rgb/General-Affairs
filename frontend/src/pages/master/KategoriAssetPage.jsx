import { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';

export default function KategoriAssetPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ kode: '', nama: '', deskripsi: '', masa_manfaat_tahun: '' });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await apiFetch('/master/kategori-asset?perPage=100');
      setData(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openModal(item = null) {
    if (item) {
      setEditItem(item);
      setForm({ kode: item.kode, nama: item.nama, deskripsi: item.deskripsi || '', masa_manfaat_tahun: item.masa_manfaat_tahun || '' });
    } else {
      setEditItem(null);
      setForm({ kode: '', nama: '', deskripsi: '', masa_manfaat_tahun: '' });
    }
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const method = editItem ? 'PUT' : 'POST';
      const endpoint = editItem ? `/master/kategori-asset/${editItem.id}` : '/master/kategori-asset';
      await apiFetch(endpoint, { method, body: JSON.stringify(form) });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await apiFetch(`/master/kategori-asset/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Kategori Asset</h4>
          <small className="text-muted">Kelola kategori asset</small>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="bi bi-plus-lg me-1"></i>Tambah Kategori
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Kode</th><th>Nama Kategori</th><th>Deskripsi</th><th>Masa Manfaat (Thn)</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">Belum ada data kategori</td></tr>
              ) : data.map((k) => (
                <tr key={k.id}>
                  <td><strong>{k.kode}</strong></td>
                  <td>{k.nama}</td>
                  <td className="small">{k.deskripsi || '-'}</td>
                  <td>{k.masa_manfaat_tahun || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openModal(k)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(k.id)}>
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
                <h5 className="modal-title">{editItem ? 'Edit Kategori' : 'Tambah Kategori'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Kode <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nama Kategori <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Deskripsi</label>
                    <textarea className="form-control" rows="2" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Masa Manfaat (Tahun)</label>
                    <input className="form-control" type="number" min="0" value={form.masa_manfaat_tahun} onChange={(e) => setForm({ ...form, masa_manfaat_tahun: e.target.value })} />
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
