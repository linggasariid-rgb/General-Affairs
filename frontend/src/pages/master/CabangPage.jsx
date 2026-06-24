import { useState, useEffect } from 'react';
import { masterApi } from '../../services/api';
import Swal from 'sweetalert2';

export default function CabangPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ kode: '', nama: '', kota: '', provinsi: '', alamat: '', telepon: '', email: '', kode_pos: '' });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await masterApi.cabang.list({ perPage: '100' });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openModal(item = null) {
    if (item) {
      setEditItem(item);
      setForm({ kode: item.kode, nama: item.nama, kota: item.kota, provinsi: item.provinsi, alamat: item.alamat || '', telepon: item.telepon || '', email: item.email || '', kode_pos: item.kode_pos || '' });
    } else {
      setEditItem(null);
      setForm({ kode: '', nama: '', kota: '', provinsi: '', alamat: '', telepon: '', email: '', kode_pos: '' });
    }
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editItem) {
        await masterApi.cabang.update(editItem.id, form);
        Swal.fire('Sukses', 'Cabang berhasil diupdate', 'success');
      } else {
        await masterApi.cabang.create(form);
        Swal.fire('Sukses', 'Cabang berhasil dibuat', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  }

  async function toggleActive(item) {
    try {
      await masterApi.cabang.update(item.id, { status: !item.status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Master Cabang</h4>
          <small className="text-muted">Kelola data cabang perusahaan</small>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="bi bi-plus-lg me-1"></i>Tambah Cabang
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Kode</th>
                <th>Nama Cabang</th>
                <th>Kota</th>
                <th>Provinsi</th>
                <th>Telepon</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.kode}</strong></td>
                  <td>{item.nama}</td>
                  <td>{item.kota}</td>
                  <td>{item.provinsi}</td>
                  <td>{item.telepon || '-'}</td>
                  <td><span className={`badge bg-${item.status ? 'success' : 'secondary'}`}>{item.status ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openModal(item)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className={`btn btn-sm ${item.status ? 'btn-outline-warning' : 'btn-outline-success'}`} onClick={() => toggleActive(item)}>
                      <i className={`bi ${item.status ? 'bi-toggle-off' : 'bi-toggle-on'}`}></i>
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editItem ? 'Edit Cabang' : 'Tambah Cabang'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Kode</label>
                      <input className="form-control" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">Nama Cabang</label>
                      <input className="form-control" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Kota</label>
                      <input className="form-control" value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Provinsi</label>
                      <input className="form-control" value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Alamat</label>
                      <textarea className="form-control" rows="2" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}></textarea>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Telepon</label>
                      <input className="form-control" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Email</label>
                      <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Kode Pos</label>
                      <input className="form-control" value={form.kode_pos} onChange={(e) => setForm({ ...form, kode_pos: e.target.value })} />
                    </div>
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
