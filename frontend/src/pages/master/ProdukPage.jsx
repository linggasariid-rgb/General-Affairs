import { useState, useEffect, useCallback } from 'react';
import { produkApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProdukPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole(['SA', 'HGA']);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kategoriList, setKategoriList] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nama: '', spesifikasi: '', satuan: 'pcs', id_kategori: '', harga_estimasi: 0, keterangan: '' });

  useEffect(() => {
    fetch('/api/v1/master/vendor/kategori').then(async (res) => {
      try {
        const data = await res.json();
        if (data.success) setKategoriList(data.data || []);
      } catch {}
    }).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: String(page), perPage: '20' };
      if (search) params.search = search;
      const res = await produkApi.list(params);
      setList(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openCreate() {
    setEditing(null);
    setForm({ nama: '', spesifikasi: '', satuan: 'pcs', id_kategori: '', harga_estimasi: 0, keterangan: '' });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      nama: item.nama,
      spesifikasi: item.spesifikasi || '',
      satuan: item.satuan,
      id_kategori: item.id_kategori || '',
      harga_estimasi: item.harga_estimasi || 0,
      keterangan: item.keterangan || '',
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await produkApi.update(editing.id, form);
      } else {
        await produkApi.create(form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Nonaktifkan produk ini?')) return;
    try {
      await produkApi.update(id, { status: 'nonaktif' });
      fetchData();
    } catch (err) { alert(err.message); }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Master Produk / Barang</h4>
        {canEdit && (
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i>Tambah Produk
          </button>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="mb-3">
            <input className="form-control" placeholder="Cari nama atau kode produk..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>

          {loading ? (
            <div className="text-center py-4"><div className="spinner-border" /></div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Kode</th><th>Nama</th><th>Spesifikasi</th><th>Satuan</th><th>Harga Estimasi</th><th>Status</th>
                      {canEdit && <th style={{ width: '100px' }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 ? (
                      <tr><td colSpan={canEdit ? 7 : 6} className="text-center text-muted py-4">Belum ada data produk</td></tr>
                    ) : list.map((item) => (
                      <tr key={item.id}>
                        <td><span className="badge bg-secondary">{item.kode_produk}</span></td>
                        <td>{item.nama}</td>
                        <td className="small text-muted">{item.spesifikasi || '-'}</td>
                        <td>{item.satuan}</td>
                        <td>Rp{(Number(item.harga_estimasi) || 0).toLocaleString('id-ID')}</td>
                        <td>
                          <span className={`badge ${item.status === 'aktif' ? 'bg-success' : 'bg-secondary'}`}>
                            {item.status}
                          </span>
                        </td>
                        {canEdit && (
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(item)} title="Edit">
                                <i className="bi bi-pencil"></i>
                              </button>
                              {item.status === 'aktif' && (
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)} title="Nonaktifkan">
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <nav><ul className="pagination pagination-sm justify-content-center mb-0 mt-3">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                </ul></nav>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5 className="modal-title">{editing ? 'Edit Produk' : 'Tambah Produk'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nama Produk <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Spesifikasi</label>
                    <textarea className="form-control" rows="2" value={form.spesifikasi} onChange={(e) => setForm({ ...form, spesifikasi: e.target.value })} />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Satuan <span className="text-danger">*</span></label>
                      <select className="form-select" value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} required>
                        <option value="pcs">pcs</option>
                        <option value="unit">unit</option>
                        <option value="box">box</option>
                        <option value="kg">kg</option>
                        <option value="liter">liter</option>
                        <option value="meter">meter</option>
                        <option value="set">set</option>
                        <option value="paket">paket</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Kategori</label>
                      <select className="form-select" value={form.id_kategori} onChange={(e) => setForm({ ...form, id_kategori: e.target.value })}>
                        <option value="">-- Pilih --</option>
                        {kategoriList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Harga Estimasi (Rp)</label>
                      <input className="form-control" type="number" min="0" value={form.harga_estimasi} onChange={(e) => setForm({ ...form, harga_estimasi: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Keterangan</label>
                    <textarea className="form-control" rows="2" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                    {editing ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
