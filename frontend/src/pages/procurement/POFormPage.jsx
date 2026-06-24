import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { procurementApi, masterApi } from '../../services/api';

function ProductAutocomplete({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query || query.length < 1) { setSuggestions([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/master/produk/all?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) { setSuggestions(data.data || []); setShow(true); }
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
        autoComplete="off" />
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

export default function POFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prId = searchParams.get('pr_id');

  const [saving, setSaving] = useState(false);
  const [prList, setPrList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    id_purchase_request: prId || '', id_vendor: '',
    biaya_kirim: 0, pajak: 0, termin_pembayaran: '', catatan: '',
  });

  useEffect(() => {
    Promise.all([
      procurementApi.pr.list({ perPage: '100', status: 'disetujui_hga' }),
      masterApi.vendor.list({ perPage: '100' }),
    ]).then(([prRes, vendorRes]) => {
      setPrList(prRes.data);
      setVendorList(vendorRes.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.id_purchase_request) {
      procurementApi.pr.get(form.id_purchase_request).then((res) => {
        setSelectedPR(res.data);
        setItems((res.data.purchase_request_item || []).map((item) => ({
          id_pr_item: item.id,
          nama_barang: item.nama_barang,
          spesifikasi: item.spesifikasi,
          jumlah: item.jumlah,
          satuan: item.satuan,
          estimasi_harga: item.estimasi_harga || 0,
          harga_satuan: item.estimasi_harga || 0,
          id_produk: item.id_produk || null,
        })));
      }).catch(console.error);
    } else {
      setSelectedPR(null);
      setItems([]);
    }
  }, [form.id_purchase_request]);

  function updateHarga(index, value) {
    const updated = [...items];
    updated[index].harga_satuan = Number(value);
    setItems(updated);
  }

  function addItem() {
    setItems([...items, { nama_barang: '', spesifikasi: '', jumlah: 1, satuan: 'pcs', estimasi_harga: 0, harga_satuan: 0, id_produk: null, id_pr_item: null }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function handleProductSelect(index, product) {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      nama_barang: product.nama,
      spesifikasi: product.spesifikasi || '',
      satuan: product.satuan,
      estimasi_harga: Number(product.harga_estimasi) || 0,
      harga_satuan: Number(product.harga_estimasi) || 0,
      id_produk: product.id,
    };
    setItems(updated);
  }

  const subtotalItems = items.reduce((sum, item) => sum + Number(item.jumlah) * Number(item.harga_satuan || 0), 0);
  const totalPajak = Number(form.pajak || 0);
  const totalKirim = Number(form.biaya_kirim || 0);
  const grandTotal = subtotalItems + totalPajak + totalKirim;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        biaya_kirim: Number(form.biaya_kirim),
        pajak: Number(form.pajak),
        items: items.map((item) => ({
          id_pr_item: item.id_pr_item,
          nama_barang: item.nama_barang,
          jumlah: item.jumlah,
          satuan: item.satuan,
          harga_satuan: Number(item.harga_satuan),
          id_produk: item.id_produk || undefined,
        })),
      };
      await procurementApi.po.create(payload);
      navigate('/app/procurement/po');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Buat Purchase Order</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Informasi PO</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Purchase Request <span className="text-danger">*</span></label>
                <select className="form-select" value={form.id_purchase_request} onChange={(e) => setForm({ ...form, id_purchase_request: e.target.value })} required>
                  <option value="">-- Pilih PR --</option>
                  {prList.map((pr) => (
                    <option key={pr.id} value={pr.id}>{pr.nomor_pr} - {pr.judul}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Vendor <span className="text-danger">*</span></label>
                <select className="form-select" value={form.id_vendor} onChange={(e) => setForm({ ...form, id_vendor: e.target.value })} required>
                  <option value="">-- Pilih Vendor --</option>
                  {vendorList.map((v) => <option key={v.id} value={v.id}>{v.nama}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">{selectedPR ? `Item dari PR: ${selectedPR.nomor_pr}` : 'Item Barang'}</h6>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
              <i className="bi bi-plus-lg me-1"></i>Tambah Item
            </button>
          </div>
          <div className="table-responsive">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th><th>Nama Barang</th><th>Spesifikasi</th>
                  <th style={{ width: '80px' }}>Jumlah</th><th>Satuan</th>
                  <th style={{ width: '150px' }}>Estimasi</th>
                  <th style={{ width: '150px' }}>Harga Satuan</th>
                  <th style={{ width: '150px' }}>Subtotal</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ minWidth: '250px' }}>
                      {item.id_pr_item ? (
                        item.nama_barang
                      ) : (
                        <ProductAutocomplete
                          value={item.nama_barang}
                          onChange={(v) => { const u = [...items]; u[i].nama_barang = v; setItems(u); }}
                          onSelect={(p) => handleProductSelect(i, p)}
                        />
                      )}
                    </td>
                    <td className="small">{item.spesifikasi || '-'}</td>
                    <td>
                      <input className="form-control form-control-sm" type="number" min="1" value={item.jumlah}
                        onChange={(e) => { const u = [...items]; u[i].jumlah = e.target.value; setItems(u); }} />
                    </td>
                    <td>{item.satuan}</td>
                    <td>Rp{Number(item.estimasi_harga || 0).toLocaleString('id-ID')}</td>
                    <td>
                      <input className="form-control form-control-sm" type="number" min="0" value={item.harga_satuan} onChange={(e) => updateHarga(i, e.target.value)} />
                    </td>
                    <td className="text-end">
                      Rp{Number(item.jumlah * item.harga_satuan || 0).toLocaleString('id-ID')}
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

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Biaya Tambahan</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Biaya Kirim (Rp)</label>
                <input className="form-control" type="number" min="0" value={form.biaya_kirim} onChange={(e) => setForm({ ...form, biaya_kirim: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Pajak (Rp)</label>
                <input className="form-control" type="number" min="0" value={form.pajak} onChange={(e) => setForm({ ...form, pajak: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Termin Pembayaran</label>
                <select className="form-select" value={form.termin_pembayaran} onChange={(e) => setForm({ ...form, termin_pembayaran: e.target.value })}>
                  <option value="">-- Pilih --</option>
                  <option value="cash">Cash</option>
                  <option value="30_hari">30 Hari</option>
                  <option value="60_hari">60 Hari</option>
                  <option value="90_hari">90 Hari</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Catatan</label>
                <textarea className="form-control" rows="2" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })}></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row justify-content-end">
              <div className="col-md-4">
                <table className="table table-sm mb-0">
                  <tbody>
                    <tr><td>Subtotal Item</td><td className="text-end">Rp{subtotalItems.toLocaleString('id-ID')}</td></tr>
                    <tr><td>Biaya Kirim</td><td className="text-end">Rp{totalKirim.toLocaleString('id-ID')}</td></tr>
                    <tr><td>Pajak</td><td className="text-end">Rp{totalPajak.toLocaleString('id-ID')}</td></tr>
                    <tr className="fw-bold"><td>Grand Total</td><td className="text-end">Rp{grandTotal.toLocaleString('id-ID')}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Simpan PO
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/app/procurement/po')}>Batal</button>
        </div>
      </form>
    </div>
  );
}
