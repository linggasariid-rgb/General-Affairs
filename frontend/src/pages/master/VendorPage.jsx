import { useState, useEffect } from 'react';
import { masterApi } from '../../services/api';

const STATUS_BADGE = { aktif: 'success', nonaktif: 'secondary', diblokir: 'danger' };

export default function VendorPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await masterApi.vendor.list({ perPage: '50' });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Master Vendor</h4>
          <small className="text-muted">Database vendor dan supplier</small>
        </div>
        <button className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1"></i>Tambah Vendor
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Kode</th><th>Nama Vendor</th><th>Kategori</th><th>PIC</th><th>Kota</th><th>Rating</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.map((v) => (
                <tr key={v.id}>
                  <td><strong>{v.kode}</strong></td>
                  <td>{v.nama}</td>
                  <td>{v.vendor_kategori?.nama || '-'}</td>
                  <td>{v.pic_nama || '-'}</td>
                  <td>{v.kota || '-'}</td>
                  <td>{v.rating || '-'}</td>
                  <td><span className={`badge bg-${STATUS_BADGE[v.status]}`}>{v.status}</span></td>
                  <td><button className="btn btn-sm btn-outline-primary"><i className="bi bi-eye"></i></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
