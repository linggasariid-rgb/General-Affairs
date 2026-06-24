import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { atkApi } from '../../services/api';

export default function ATKDistribusiFormPage() {
  const navigate = useNavigate();
  const [cabangList, setCabangList] = useState([]);
  const [gudangGA, setGudangGA] = useState(null);
  const [itemList, setItemList] = useState([]);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const [form, setForm] = useState({ judul: '', id_cabang: '', id_gudang: '', bulan: now.getMonth() + 1, tahun: now.getFullYear(), catatan: '' });
  const [items, setItems] = useState([{ id_item: '', nama_item: '', qty_direncanakan: 1 }]);

  useEffect(() => {
    fetch('/api/v1/master/cabang?perPage=100').then(r => r.json()).then(res => { if (res.success) setCabangList(res.data); }).catch(console.error);
    fetch('/api/v1/master/gudang?perPage=100').then(r => r.json()).then(res => {
      if (res.success) {
        const ga = res.data.find(g => g.tipe === 'pusat');
        setGudangGA(ga);
        if (ga) setForm(f => ({ ...f, id_gudang: ga.id }));
      }
    }).catch(console.error);
    atkApi.item.all().then(res => setItemList(res.data)).catch(console.error);
  }, []);

  function addItem() {
    setItems([...items, { id_item: '', nama_item: '', qty_direncanakan: 1 }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'id_item') {
      const selected = itemList.find(i => i.id === value);
      updated[index].nama_item = selected ? selected.nama : '';
    }
    setItems(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        items: items.map(item => ({
          id_item: item.id_item,
          qty_direncanakan: Number(item.qty_direncanakan),
        })),
      };
      await atkApi.distribusi.create(payload);
      navigate('/atk/distribusi');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Buat Distribusi ATK/RTK</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Informasi Distribusi</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Judul</label>
                <input className="form-control" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} placeholder="Distribusi ATK/RTK Bulanan" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Cabang Tujuan <span className="text-danger">*</span></label>
                <select className="form-select" value={form.id_cabang} onChange={(e) => setForm({ ...form, id_cabang: e.target.value })} required>
                  <option value="">-- Pilih --</option>
                  {cabangList.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Gudang Asal</label>
                <input className="form-control" value={gudangGA?.nama || '-'} disabled />
              </div>
              <div className="col-md-2">
                <label className="form-label">Bulan</label>
                <select className="form-select" value={form.bulan} onChange={(e) => setForm({ ...form, bulan: Number(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Tahun</label>
                <input className="form-control" type="number" min="2024" max="2030" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })} />
              </div>
              <div className="col-12">
                <label className="form-label">Catatan</label>
                <textarea className="form-control" rows="2" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Item ATK/RTK</h6>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
              <i className="bi bi-plus-lg me-1"></i>Tambah Item
            </button>
          </div>
          <div className="table-responsive">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '30px' }}>#</th>
                  <th>Item <span className="text-danger">*</span></th>
                  <th style={{ width: '120px' }}>Jumlah</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ minWidth: '300px' }}>
                      <select className="form-select" value={item.id_item} onChange={(e) => updateItem(i, 'id_item', e.target.value)} required>
                        <option value="">-- Pilih Item --</option>
                        {itemList.map(p => <option key={p.id} value={p.id}>{p.kode_item} - {p.nama} ({p.satuan})</option>)}
                      </select>
                    </td>
                    <td>
                      <input className="form-control" type="number" min="1" value={item.qty_direncanakan} onChange={(e) => updateItem(i, 'qty_direncanakan', e.target.value)} required />
                    </td>
                    <td>
                      {items.length > 1 && (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i)}>
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

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Simpan Distribusi
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/atk/distribusi')}>Batal</button>
        </div>
      </form>
    </div>
  );
}
