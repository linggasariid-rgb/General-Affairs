import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';

export default function BookingFormPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_kendaraan: '', tujuan: '', lokasi_tujuan: '',
    tanggal_mulai: '', tanggal_selesai: '', keperluan: '',
    jumlah_penumpang: 1, driver: '',
  });

  useEffect(() => {
    apiFetch('/vehicle?perPage=100&status=tersedia')
      .then((res) => setVehicles(res.data || []))
      .catch(console.error);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/vehicle/booking', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      navigate('/app/vehicle');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Booking Kendaraan</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Informasi Booking</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Kendaraan <span className="text-danger">*</span></label>
                <select className="form-select" name="id_kendaraan" value={form.id_kendaraan} onChange={handleChange} required>
                  <option value="">-- Pilih Kendaraan --</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.nopol} - {v.merk} {v.tipe}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Driver</label>
                <input className="form-control" name="driver" value={form.driver} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Tujuan <span className="text-danger">*</span></label>
                <input className="form-control" name="tujuan" value={form.tujuan} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Lokasi Tujuan</label>
                <input className="form-control" name="lokasi_tujuan" value={form.lokasi_tujuan} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Tanggal Mulai <span className="text-danger">*</span></label>
                <input className="form-control" name="tanggal_mulai" type="date" value={form.tanggal_mulai} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Tanggal Selesai <span className="text-danger">*</span></label>
                <input className="form-control" name="tanggal_selesai" type="date" value={form.tanggal_selesai} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Jumlah Penumpang</label>
                <input className="form-control" name="jumlah_penumpang" type="number" min="1" value={form.jumlah_penumpang} onChange={handleChange} />
              </div>
              <div className="col-12">
                <label className="form-label">Keperluan</label>
                <textarea className="form-control" name="keperluan" rows="3" value={form.keperluan} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Simpan Booking
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/app/vehicle')}>Batal</button>
        </div>
      </form>
    </div>
  );
}
