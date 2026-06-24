import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { atkApi, masterApi } from '../../services/api';
import Swal from 'sweetalert2';

export default function PengajuanNonRutinFormPage() {
  const navigate = useNavigate();
  const [cabangList, setCabangList] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nama_pengaju: '', jabatan: '', lokasi_kerja: '', id_cabang: '', catatan: '',
  });
  const [items, setItems] = useState([{ nama_barang: '', spesifikasi: '', jumlah: 1, satuan: 'pcs', keterangan: '' }]);

  useEffect(() => {
    masterApi.cabang.list({ perPage: '100' }).then(r => { if (r.success) setCabangList(r.data); }).catch(console.error);
  }, []);

  function addItem() {
    setItems([...items, { nama_barang: '', spesifikasi: '', jumlah: 1, satuan: 'pcs', keterangan: '' }]);
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx, field, value) {
    setItems(items.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nama_pengaju || !form.jabatan || !form.lokasi_kerja) {
      Swal.fire('Error', 'Nama pengaju, jabatan, dan lokasi kerja harus diisi', 'error');
      return;
    }
    const validItems = items.filter(it => it.nama_barang.trim());
    if (!validItems.length) {
      Swal.fire('Error', 'Minimal satu item harus diisi', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        id_cabang: form.id_cabang || null,
        items: validItems.map(it => ({
          nama_barang: it.nama_barang,
          spesifikasi: it.spesifikasi,
          jumlah: Number(it.jumlah) || 1,
          satuan: it.satuan,
          keterangan: it.keterangan,
        })),
      };
      await atkApi.pengajuan.create(payload);
      Swal.fire('Sukses', 'Pengajuan berhasil dikirim', 'success');
      navigate('/atk/pengajuan-barang-non-rutin');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Buat Pengajuan Barang Non Rutin</h4>
          <small className="text-muted">Pengajuan barang ke General Affairs</small>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Informasi Pengaju</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Nama Pengaju <span className="text-danger">*</span></label>
                <input className="form-control" value={form.nama_pengaju} onChange={(e) => setForm({ ...form, nama_pengaju: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Jabatan <span className="text-danger">*</span></label>
                <input className="form-control" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Lokasi Kerja <span className="text-danger">*</span></label>
                <input className="form-control" value={form.lokasi_kerja} onChange={(e) => setForm({ ...form, lokasi_kerja: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Cabang (opsional)</label>
                <select className="form-select" value={form.id_cabang} onChange={(e) => setForm({ ...form, id_cabang: e.target.value })}>
                  <option value="">-- Pilih --</option>
                  {cabangList.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
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
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Barang yang Diajukan</h6>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}><i className="bi bi-plus-lg me-1"></i>Tambah Item</button>
          </div>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr><th style={{ width: '25%' }}>Nama Barang</th><th style={{ width: '30%' }}>Spesifikasi</th><th style={{ width: 80 }}>Jumlah</th><th style={{ width: 100 }}>Satuan</th><th>Keterangan</th><th style={{ width: 40 }}></th></tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td><input className="form-control form-control-sm" value={it.nama_barang} onChange={(e) => updateItem(i, 'nama_barang', e.target.value)} required /></td>
                    <td><input className="form-control form-control-sm" value={it.spesifikasi} onChange={(e) => updateItem(i, 'spesifikasi', e.target.value)} /></td>
                    <td><input className="form-control form-control-sm text-center" type="number" min="1" value={it.jumlah} onChange={(e) => updateItem(i, 'jumlah', e.target.value)} required /></td>
                    <td>
                      <select className="form-select form-select-sm" value={it.satuan} onChange={(e) => updateItem(i, 'satuan', e.target.value)}>
                        {['pcs', 'unit', 'box', 'pak', 'kg', 'liter', 'meter', 'set', 'lembar', 'buah'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><input className="form-control form-control-sm" value={it.keterangan} onChange={(e) => updateItem(i, 'keterangan', e.target.value)} /></td>
                    <td>
                      {items.length > 1 && (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i)}><i className="bi bi-trash"></i></button>
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
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-send me-1"></i>}
            Kirim Pengajuan
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/atk/pengajuan-barang-non-rutin')}>Batal</button>
        </div>
      </form>
    </div>
  );
}
