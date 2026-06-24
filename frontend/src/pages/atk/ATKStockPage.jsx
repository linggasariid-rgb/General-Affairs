import { useState, useEffect } from 'react';
import { atkApi } from '../../services/api';

export default function ATKStockPage() {
  const [data, setData] = useState([]);
  const [gudangList, setGudangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idGudang, setIdGudang] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ id_item: '', id_gudang: '', qty: 0 });

  useEffect(() => {
    fetch('/api/v1/master/gudang?perPage=100').then(r => r.json()).then(res => {
      if (res.success) setGudangList(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [idGudang]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = { perPage: '100' };
      if (idGudang) params.id_gudang = idGudang;
      const res = await atkApi.stock.list(params);
      setData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleAdjust(e) {
    e.preventDefault();
    try {
      await atkApi.stock.adjust(adjustForm);
      setShowAdjust(false);
      setAdjustForm({ id_item: '', id_gudang: '', qty: 0 });
      fetchData();
    } catch (err) { console.error(err); }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Stock ATK/RTK</h4>
          <small className="text-muted">Monitoring stok barang habis pakai</small>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdjust(true)}>
          <i className="bi bi-plus-lg me-1"></i>Adjust Stock
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body py-2">
          <select className="form-select form-select-sm w-auto" value={idGudang} onChange={(e) => setIdGudang(e.target.value)}>
            <option value="">Semua Gudang</option>
            {gudangList.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
          </select>
        </div>
      </div>

      {showAdjust && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-header bg-white"><h6 className="mb-0">Adjust Stock</h6></div>
          <div className="card-body">
            <form onSubmit={handleAdjust}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Item</label>
                  <select className="form-select" value={adjustForm.id_item} onChange={(e) => setAdjustForm({ ...adjustForm, id_item: e.target.value })} required>
                    <option value="">-- Pilih --</option>
                    {data.map(d => (
                      <option key={d.atk_item?.id} value={d.atk_item?.id}>{d.atk_item?.kode_item} - {d.atk_item?.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Gudang</label>
                  <select className="form-select" value={adjustForm.id_gudang} onChange={(e) => setAdjustForm({ ...adjustForm, id_gudang: e.target.value })} required>
                    <option value="">-- Pilih --</option>
                    {gudangList.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Qty Baru</label>
                  <input className="form-control" type="number" min="0" value={adjustForm.qty} onChange={(e) => setAdjustForm({ ...adjustForm, qty: Number(e.target.value) })} required />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm">Simpan</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdjust(false)}>Batal</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Item</th><th>Kategori</th><th>Gudang</th><th>Qty</th><th>Reserved</th><th>Stok Min</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.map((s) => {
                const item = s.atk_item || {};
                const isLow = item.stok_minimal > 0 && s.qty <= item.stok_minimal;
                return (
                  <tr key={s.id} className={isLow ? 'table-warning' : ''}>
                    <td><strong>{item.kode_item}</strong><br /><small>{item.nama}</small></td>
                    <td>{item.atk_kategori?.nama || '-'}</td>
                    <td>{s.gudang?.nama || '-'}</td>
                    <td className={`fw-bold ${isLow ? 'text-danger' : ''}`}>{s.qty}</td>
                    <td>{s.qty_reserved}</td>
                    <td>{item.stok_minimal || '-'}</td>
                    <td>{isLow ? <span className="badge bg-warning text-dark">Low Stock</span> : <span className="badge bg-success">Aman</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
