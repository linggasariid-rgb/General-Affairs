import { useState, useEffect } from 'react';
import { masterApi, apiFetch } from '../../services/api';

export default function UserPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [cabangList, setCabangList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [form, setForm] = useState({ email: '', nama: '', id_role: '', id_cabang: '', telepon: '', active: true });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await apiFetch('/master/user?perPage=100');
      setData(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openModal(item = null) {
    try {
      const [cabang, roles] = await Promise.all([
        masterApi.cabang.list({ perPage: '100' }),
        apiFetch('/master/role?perPage=100'),
      ]);
      setCabangList(cabang.data);
      setRoleList(roles.data || []);
    } catch (err) {
      console.error(err);
    }

    if (item) {
      setEditItem(item);
      setForm({
        email: item.email, nama: item.nama, id_role: item.id_role || '',
        id_cabang: item.id_cabang || '', telepon: item.telepon || '', active: item.active !== false,
      });
    } else {
      setEditItem(null);
      setForm({ email: '', nama: '', id_role: '', id_cabang: '', telepon: '', active: true });
    }
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const method = editItem ? 'PUT' : 'POST';
      const endpoint = editItem ? `/master/user/${editItem.id}` : '/master/user';
      await apiFetch(endpoint, { method, body: JSON.stringify(form) });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleActive(user) {
    try {
      await apiFetch(`/master/user/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !user.active }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Master User</h4>
          <small className="text-muted">Kelola pengguna sistem</small>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <i className="bi bi-plus-lg me-1"></i>Tambah User
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Email</th><th>Nama</th><th>Role</th><th>Cabang</th><th>Telepon</th><th>Status</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Belum ada data user</td></tr>
              ) : data.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td><strong>{u.nama}</strong></td>
                  <td>{u.role?.nama || '-'}</td>
                  <td>{u.cabang?.nama || '-'}</td>
                  <td>{u.telepon || '-'}</td>
                  <td>
                    <span className={`badge bg-${u.active !== false ? 'success' : 'secondary'}`}>
                      {u.active !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openModal(u)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className={`btn btn-sm ${u.active !== false ? 'btn-outline-warning' : 'btn-outline-success'}`} onClick={() => toggleActive(u)}>
                      <i className={`bi ${u.active !== false ? 'bi-lock' : 'bi-unlock'}`}></i>
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
                <h5 className="modal-title">{editItem ? 'Edit User' : 'Tambah User'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Email <span className="text-danger">*</span></label>
                    <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nama <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={form.id_role} onChange={(e) => setForm({ ...form, id_role: e.target.value })}>
                      <option value="">-- Pilih --</option>
                      {roleList.map((r) => <option key={r.id} value={r.id}>{r.nama}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cabang</label>
                    <select className="form-select" value={form.id_cabang} onChange={(e) => setForm({ ...form, id_cabang: e.target.value })}>
                      <option value="">-- Pilih --</option>
                      {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Telepon</label>
                    <input className="form-control" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} />
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    <label className="form-check-label" htmlFor="active">Aktif</label>
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
