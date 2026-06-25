import { useState, useEffect } from 'react';
import { masterApi, apiFetch } from '../../services/api';
import Swal from 'sweetalert2';

const STATUS_BADGE = { aktif: 'success', nonaktif: 'secondary', diblokir: 'danger' };

export default function VendorPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [form, setForm] = useState({
    kode: '', nama: '', id_kategori: '', pic_nama: '', pic_telepon: '', pic_email: '',
    npwp: '', bank: '', no_rekening: '', atas_nama: '',
    alamat: '', kota: '', provinsi: '', telepon: '', email: '',
  });

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

  async function fetchKategori() {
    try {
      const res = await apiFetch('/master/vendor/kategori');
      setKategoriList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function openModal(item = null) {
    if (item) {
      setEditItem(item);
      setForm({
        kode: item.kode || '', nama: item.nama || '', id_kategori: item.id_kategori || '',
        pic_nama: item.pic_nama || '', pic_telepon: item.pic_telepon || '', pic_email: item.pic_email || '',
        npwp: item.npwp || '', bank: item.bank || '', no_rekening: item.no_rekening || '', atas_nama: item.atas_nama || '',
        alamat: item.alamat || '', kota: item.kota || '', provinsi: item.provinsi || '',
        telepon: item.telepon || '', email: item.email || '',
      });
    } else {
      setEditItem(null);
      setForm({
        kode: '', nama: '', id_kategori: '', pic_nama: '', pic_telepon: '', pic_email: '',
        npwp: '', bank: '', no_rekening: '', atas_nama: '',
        alamat: '', kota: '', provinsi: '', telepon: '', email: '',
      });
    }
    fetchKategori();
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editItem) {
        await masterApi.vendor.update(editItem.id, form);
        Swal.fire('Sukses', 'Vendor berhasil diupdate', 'success');
      } else {
        await masterApi.vendor.create(form);
        Swal.fire('Sukses', 'Vendor berhasil dibuat', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  }

  async function toggleActive(item) {
    try {
      const newStatus = item.status === 'aktif' ? 'nonaktif' : 'aktif';
      await masterApi.vendor.update(item.id, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Master Vendor</h4>
          <small className="text-muted">Database vendor dan supplier</small>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
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
              ) : data.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">Belum ada data vendor</td></tr>
              ) : data.map((v) => (
                <tr key={v.id}>
                  <td><strong>{v.kode}</strong></td>
                  <td>{v.nama}</td>
                  <td>{v.vendor_kategori?.nama || '-'}</td>
                  <td>{v.pic_nama || '-'}</td>
                  <td>{v.kota || '-'}</td>
                  <td>{v.rating || '-'}</td>
                  <td><span className={`badge bg-${STATUS_BADGE[v.status]}`}>{v.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openModal(v)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className={`btn btn-sm ${v.status === 'aktif' ? 'btn-outline-warning' : 'btn-outline-success'}`} onClick={() => toggleActive(v)}>
                      <i className={`bi ${v.status === 'aktif' ? 'bi-toggle-off' : 'bi-toggle-on'}`}></i>
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
                <h5 className="modal-title">{editItem ? 'Edit Vendor' : 'Tambah Vendor'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Kode Vendor</label>
                      <input className="form-control" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">Nama Vendor</label>
                      <input className="form-control" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Kategori</label>
                      <select className="form-select" value={form.id_kategori} onChange={(e) => setForm({ ...form, id_kategori: e.target.value })} required>
                        <option value="">-- Pilih --</option>
                        {kategoriList.map((k) => (
                          <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Kota</label>
                      <input className="form-control" value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Provinsi</label>
                      <input className="form-control" value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Alamat</label>
                      <textarea className="form-control" rows="2" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Telepon Vendor</label>
                      <input className="form-control" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Vendor</label>
                      <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="col-12"><hr className="my-1" /><small className="text-muted">Kontak PIC</small></div>
                    <div className="col-md-4">
                      <label className="form-label">Nama PIC</label>
                      <input className="form-control" value={form.pic_nama} onChange={(e) => setForm({ ...form, pic_nama: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Telepon PIC</label>
                      <input className="form-control" value={form.pic_telepon} onChange={(e) => setForm({ ...form, pic_telepon: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Email PIC</label>
                      <input className="form-control" type="email" value={form.pic_email} onChange={(e) => setForm({ ...form, pic_email: e.target.value })} />
                    </div>
                    <div className="col-12"><hr className="my-1" /><small className="text-muted">Informasi Pembayaran</small></div>
                    <div className="col-md-4">
                      <label className="form-label">NPWP</label>
                      <input className="form-control" value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Bank</label>
                      <input className="form-control" value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">No. Rekening</label>
                      <input className="form-control" value={form.no_rekening} onChange={(e) => setForm({ ...form, no_rekening: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Atas Nama</label>
                      <input className="form-control" value={form.atas_nama} onChange={(e) => setForm({ ...form, atas_nama: e.target.value })} />
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
