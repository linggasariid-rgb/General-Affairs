import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { procurementApi, masterApi } from '../../services/api';

function ProductAutocomplete({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query || query.length < 1) { setSuggestions([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/master/produk/all?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data || []);
          setShow(true);
        }
      } catch {} finally { setLoading(false); }
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setShow(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="position-relative">
      <input className="form-control form-control-sm" value={query}
        placeholder="Ketik nama barang..."
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); }}
        onFocus={() => { if (suggestions.length) setShow(true); }}
        autoComplete="off" required />
      {loading && <div className="position-absolute end-0 top-0 mt-1 me-2"><div className="spinner-border spinner-border-sm" /></div>}
      {show && suggestions.length > 0 && (
        <ul className="list-group position-absolute w-100 z-3 shadow" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.map((p) => (
            <li key={p.id} className="list-group-item list-group-item-action py-1 small" style={{ cursor: 'pointer' }}
              onMouseDown={(e) => { e.preventDefault(); setQuery(p.nama); setShow(false); onSelect(p); }}>
              <strong>{p.nama}</strong>
              {p.spesifikasi && <span className="text-muted ms-2">— {p.spesifikasi}</span>}
              <span className="badge bg-light text-dark ms-2">{p.satuan}</span>
              {p.harga_estimasi > 0 && <span className="text-muted ms-2">Rp{(Number(p.harga_estimasi)).toLocaleString('id-ID')}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PRFormPage() {
  const navigate = useNavigate();
  const [cabangList, setCabangList] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ judul: '', deskripsi: '', id_cabang: '', urgent: false });
  const [items, setItems] = useState([{ nama_barang: '', spesifikasi: '', jumlah: 1, satuan: 'pcs', estimasi_harga: 0, id_produk: null }]);

  useEffect(() => {
    masterApi.cabang.list({ perPage: '100' }).then((res) => setCabangList(res.data)).catch(console.error);
  }, []);

  function addItem() {
    setItems([...items, { nama_barang: '', spesifikasi: '', jumlah: 1, satuan: 'pcs', estimasi_harga: 0, id_produk: null }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  function handleProductSelect(index, product) {
    const updated = [...items];
    updated[index] = {
      nama_barang: product.nama,
      spesifikasi: product.spesifikasi || '',
      jumlah: updated[index].jumlah,
      satuan: product.satuan,
      estimasi_harga: Number(product.harga_estimasi) || 0,
      id_produk: product.id,
    };
    setItems(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        items: items.map((item) => ({
          ...item,
          jumlah: Number(item.jumlah),
          estimasi_harga: Number(item.estimasi_harga),
          id_produk: item.id_produk || undefined,
        })),
      };
      await procurementApi.pr.create(payload);
      navigate('/app/procurement/pr');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const totalEstimasi = items.reduce((sum, item) => sum + Number(item.jumlah) * Number(item.estimasi_harga || 0), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Buat Purchase Request</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Informasi PR</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Judul <span className="text-danger">*</span></label>
                <input className="form-control" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Cabang <span className="text-danger">*</span></label>
                <select className="form-select" value={form.id_cabang} onChange={(e) => setForm({ ...form, id_cabang: e.target.value })} required>
                  <option value="">-- Pilih --</option>
                  {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="urgent" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} />
                  <label className="form-check-label" htmlFor="urgent">Urgent</label>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Deskripsi</label>
                <textarea className="form-control" rows="2" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Item Barang</h6>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
              <i className="bi bi-plus-lg me-1"></i>Tambah Item
            </button>
          </div>
          <div className="table-responsive">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '30px' }}>#</th>
                  <th>Nama Barang <span className="text-danger">*</span></th>
                  <th>Spesifikasi</th>
                  <th style={{ width: '80px' }}>Jumlah</th>
                  <th style={{ width: '100px' }}>Satuan</th>
                  <th style={{ width: '150px' }}>Estimasi Harga</th>
                  <th style={{ width: '150px' }}>Subtotal</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ minWidth: '250px' }}>
                      <ProductAutocomplete
                        value={item.nama_barang}
                        onChange={(v) => updateItem(i, 'nama_barang', v)}
                        onSelect={(p) => handleProductSelect(i, p)}
                      />
                    </td>
                    <td>
                      <input className="form-control form-control-sm" value={item.spesifikasi} onChange={(e) => updateItem(i, 'spesifikasi', e.target.value)} />
                    </td>
                    <td>
                      <input className="form-control form-control-sm" type="number" min="1" value={item.jumlah} onChange={(e) => updateItem(i, 'jumlah', e.target.value)} required />
                    </td>
                    <td>
                      <select className="form-select form-select-sm" value={item.satuan} onChange={(e) => updateItem(i, 'satuan', e.target.value)}>
                        <option value="pcs">pcs</option>
                        <option value="unit">unit</option>
                        <option value="box">box</option>
                        <option value="kg">kg</option>
                        <option value="liter">liter</option>
                        <option value="meter">meter</option>
                        <option value="set">set</option>
                        <option value="paket">paket</option>
                      </select>
                    </td>
                    <td>
                      <input className="form-control form-control-sm" type="number" min="0" value={item.estimasi_harga} onChange={(e) => updateItem(i, 'estimasi_harga', e.target.value)} />
                    </td>
                    <td className="text-end">
                      Rp{Number(item.jumlah * item.estimasi_harga || 0).toLocaleString('id-ID')}
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
              <tfoot className="table-light">
                <tr>
                  <td colSpan="6" className="text-end fw-bold">Total Estimasi</td>
                  <td className="text-end fw-bold">Rp{totalEstimasi.toLocaleString('id-ID')}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Simpan PR
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/app/procurement/pr')}>Batal</button>
        </div>
      </form>
    </div>
  );
}
