import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetApi, masterApi } from '../../services/api';

export default function AssetFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cabangList, setCabangList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [gudangList, setGudangList] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);

  const [form, setForm] = useState({
    nama: '', id_kategori: '', id_cabang: '', id_gudang: '', id_lokasi: '',
    merek: '', model: '', nomor_seri: '',
    tahun_perolehan: '', tanggal_perolehan: '', harga_perolehan: '',
    nilai_residu: '', masa_manfaat: '',
    spesifikasi: '', keterangan: '',
  });

  useEffect(() => {
    fetchReferences();
    if (isEdit) fetchAsset();
  }, [id]);

  async function fetchReferences() {
    try {
      const [cabang, kategori, gudang, lokasi] = await Promise.all([
        masterApi.cabang.list({ perPage: '100' }),
        masterApi.kategoriAsset.list({ perPage: '100' }),
        masterApi.gudang.list({ perPage: '100' }),
        masterApi.lokasiAsset.list({ perPage: '100' }),
      ]);
      setCabangList(cabang.data);
      setKategoriList(kategori.data);
      setGudangList(gudang.data);
      setLokasiList(lokasi.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAsset() {
    setLoading(true);
    try {
      const res = await assetApi.get(id);
      const a = res.data;
      setForm({
        nama: a.nama || '', id_kategori: a.id_kategori || '', id_cabang: a.id_cabang || '',
        id_gudang: a.id_gudang || '', id_lokasi: a.id_lokasi || '',
        merek: a.merek || '', model: a.model || '', nomor_seri: a.nomor_seri || '',
        tahun_perolehan: a.tahun_perolehan || '', tanggal_perolehan: a.tanggal_perolehan ? a.tanggal_perolehan.slice(0, 10) : '',
        harga_perolehan: a.harga_perolehan || '', nilai_residu: a.nilai_residu || '',
        masa_manfaat: a.masa_manfaat || '', spesifikasi: a.spesifikasi || '', keterangan: a.keterangan || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await assetApi.update(id, form);
      } else {
        await assetApi.create(form);
      }
      navigate('/asset');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">{isEdit ? 'Edit Asset' : 'Registrasi Asset Baru'}</h4>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Informasi Umum</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nama Asset <span className="text-danger">*</span></label>
                <input className="form-control" name="nama" value={form.nama} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Kategori <span className="text-danger">*</span></label>
                <select className="form-select" name="id_kategori" value={form.id_kategori} onChange={handleChange} required>
                  <option value="">-- Pilih --</option>
                  {kategoriList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Cabang <span className="text-danger">*</span></label>
                <select className="form-select" name="id_cabang" value={form.id_cabang} onChange={handleChange} required>
                  <option value="">-- Pilih --</option>
                  {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Gudang</label>
                <select className="form-select" name="id_gudang" value={form.id_gudang} onChange={handleChange}>
                  <option value="">-- Pilih --</option>
                  {gudangList.map((g) => <option key={g.id} value={g.id}>{g.nama}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Lokasi</label>
                <select className="form-select" name="id_lokasi" value={form.id_lokasi} onChange={handleChange}>
                  <option value="">-- Pilih --</option>
                  {lokasiList.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Detail Asset</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Merek</label>
                <input className="form-control" name="merek" value={form.merek} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Model</label>
                <input className="form-control" name="model" value={form.model} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Nomor Seri</label>
                <input className="form-control" name="nomor_seri" value={form.nomor_seri} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Informasi Perolehan</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Tahun Perolehan</label>
                <input className="form-control" name="tahun_perolehan" type="number" value={form.tahun_perolehan} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Tanggal Perolehan</label>
                <input className="form-control" name="tanggal_perolehan" type="date" value={form.tanggal_perolehan} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Harga Perolehan (Rp)</label>
                <input className="form-control" name="harga_perolehan" type="number" value={form.harga_perolehan} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Nilai Residu (Rp)</label>
                <input className="form-control" name="nilai_residu" type="number" value={form.nilai_residu} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Masa Manfaat (Bulan)</label>
                <input className="form-control" name="masa_manfaat" type="number" value={form.masa_manfaat} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Catatan</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Spesifikasi</label>
                <textarea className="form-control" name="spesifikasi" rows="3" value={form.spesifikasi} onChange={handleChange}></textarea>
              </div>
              <div className="col-12">
                <label className="form-label">Keterangan</label>
                <textarea className="form-control" name="keterangan" rows="2" value={form.keterangan} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            {isEdit ? 'Update Asset' : 'Simpan Asset'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/app/asset')}>Batal</button>
        </div>
      </form>
    </div>
  );
}
