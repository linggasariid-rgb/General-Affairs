import { useState, useEffect } from 'react';
import { atkApi } from '../../services/api';

export default function ATKItemPage() {
  const [data, setData] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKategori, setFilterKategori] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nama: '', spesifikasi: '', id_kategori: '', satuan: 'pcs', harga_estimasi: 0, stok_minimal: 0, stok_maksimal: 0, keterangan: '' });

  useEffect(() => {
    fetchData();
    atkApi.kategori.list().then(res => setKategoriList(res.data)).catch(console.error);
  }, []);

  async function fetchData() {
    try {
      const params = { perPage: '100' };
      if (filterKategori) params.id_kategori = filterKategori;
      const res = await atkApi.item.list(params);
      setData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await atkApi.item.update(editing.id, form);
      } else {
        await atkApi.item.create(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nama: '', spesifikasi: '', id_kategori: '', satuan: 'pcs', harga_estimasi: 0, stok_minimal: 0, stok_maksimal: 0, keterangan: '' });
      fetchData();
    } catch (err) { console.error(err); }
  }

  function handleEdit(item) {
    setForm({ nama: item.nama, spesifikasi: item.spesifikasi || '', id_kategori: item.id_kategori || '', satuan: item.satuan, harga_estimasi: item.harga_estimasi || 0, stok_minimal: item.stok_minimal || 0, stok_maksimal: item.stok_maksimal || 0, keterangan: item.keterangan || '' });
    setEditing(item);
    setShowForm(true);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Master Item ATK/RTK</h4>
          <small className="text-muted">{data.length} item</small>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ nama: '', spesifikasi: '', id_kategori: '', satuan: 'pcs', harga_estimasi: 0, stok_minimal: 0, stok_maksimal: 0, keterangan: '' }); setShowForm(true); }}>
          <i className="bi bi-plus-lg me-1"></i>Tambah Item
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body py-2">
          <select className="form-select form-select-sm w-auto" value={filterKategori} onChange={(e) => { setFilterKategori(e.target.value); fetchData(); }}>
            <option value="">Semua Kategori</option>
            {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-header bg-white">
            <h6 className="mb-0">{editing ? 'Edit Item' : 'Tambah Item Baru'}</h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nama Item <span className="text-danger">*</span></label>
                  <input className="form-control" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Kategori</label>
                  <select className="form-select" value={form.id_kategori} onChange={(e) => setForm({ ...form, id_kategori: e.target.value })}>
                    <option value="">-- Pilih --</option>
                    {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Satuan <span className="text-danger">*</span></label>
                  <select className="form-select" value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}>
                    <option value="pcs">pcs</option><option value="box">box</option><option value="pak">pak</option>
                    <option value="rim">rim</option><option value="liter">liter</option><option value="kg">kg</option>
                    <option value="roll">roll</option><option value="unit">unit</option><option value="set">set</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Spesifikasi</label>
                  <input className="form-control" value={form.spesifikasi} onChange={(e) => setForm({ ...form, spesifikasi: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Harga Estimasi</label>
                  <input className="form-control" type="number" min="0" value={form.harga_estimasi} onChange={(e) => setForm({ ...form, harga_estimasi: Number(e.target.value) })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Stok Minimal</label>
                  <input className="form-control" type="number" min="0" value={form.stok_minimal} onChange={(e) => setForm({ ...form, stok_minimal: Number(e.target.value) })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Stok Maksimal</label>
                  <input className="form-control" type="number" min="0" value={form.stok_maksimal} onChange={(e) => setForm({ ...form, stok_maksimal: Number(e.target.value) })} />
                </div>
                <div className="col-12">
                  <label className="form-label">Keterangan</label>
                  <textarea className="form-control" rows="2" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Simpan'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Kode</th><th>Nama</th><th>Kategori</th><th>Satuan</th><th>Harga</th><th>Stok Min</th><th>Stok Max</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.kode_item}</strong></td>
                  <td>{item.nama}</td>
                  <td>{item.atk_kategori?.nama || '-'}</td>
                  <td>{item.satuan}</td>
                  <td>Rp{(item.harga_estimasi || 0).toLocaleString()}</td>
                  <td>{item.stok_minimal}</td>
                  <td>{item.stok_maksimal}</td>
                  <td><span className={`badge bg-${item.status === 'aktif' ? 'success' : 'secondary'}`}>{item.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(item)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    {item.status === 'aktif' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={async () => { if (confirm('Nonaktifkan item ini?')) { await atkApi.item.delete(item.id); fetchData(); } }}>
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
