import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { atkApi } from '../../services/api';
import Swal from 'sweetalert2';

export default function PerjalananDinasFormPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nomor_spk: '', nama_pelaksana: '', divisi: '', tujuan: '',
    tanggal_berangkat: '', tanggal_kembali: '', keterangan: '',
    nomor_kartu: '', tanggal_pinjam: '',
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nomor_spk || !form.nama_pelaksana || !form.divisi || !form.tujuan || !form.tanggal_berangkat || !form.tanggal_kembali) {
      Swal.fire('Error', 'Semua field SPK harus diisi', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nomor_spk: form.nomor_spk,
        nama_pelaksana: form.nama_pelaksana,
        divisi: form.divisi,
        tujuan: form.tujuan,
        tanggal_berangkat: form.tanggal_berangkat,
        tanggal_kembali: form.tanggal_kembali,
        keterangan: form.keterangan,
      };
      if (form.nomor_kartu && form.tanggal_pinjam) {
        payload.nomor_kartu = form.nomor_kartu;
        payload.tanggal_pinjam = form.tanggal_pinjam;
      }
      await atkApi.perjalananDinas.create(payload);
      Swal.fire('Sukses', 'SPK berhasil dibuat', 'success');
      navigate('/atk/perjalanan-dinas');
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
          <h4 className="mb-1">Buat SPK Perjalanan Dinas</h4>
          <small className="text-muted">Input SPK dan terbitkan kartu E-Toll</small>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Data SPK</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">No. SPK <span className="text-danger">*</span></label>
                <input className="form-control" value={form.nomor_spk} onChange={(e) => setForm({ ...form, nomor_spk: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Nama Pelaksana <span className="text-danger">*</span></label>
                <input className="form-control" value={form.nama_pelaksana} onChange={(e) => setForm({ ...form, nama_pelaksana: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Divisi <span className="text-danger">*</span></label>
                <input className="form-control" value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })} required />
              </div>
              <div className="col-12">
                <label className="form-label">Tujuan <span className="text-danger">*</span></label>
                <textarea className="form-control" rows="2" value={form.tujuan} onChange={(e) => setForm({ ...form, tujuan: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Tanggal Berangkat <span className="text-danger">*</span></label>
                <input className="form-control" type="date" value={form.tanggal_berangkat} onChange={(e) => setForm({ ...form, tanggal_berangkat: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Tanggal Kembali <span className="text-danger">*</span></label>
                <input className="form-control" type="date" value={form.tanggal_kembali} onChange={(e) => setForm({ ...form, tanggal_kembali: e.target.value })} required />
              </div>
              <div className="col-12">
                <label className="form-label">Keterangan</label>
                <textarea className="form-control" rows="2" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Penerbitan Kartu E-Toll</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">No. Kartu E-Toll</label>
                <input className="form-control" value={form.nomor_kartu} onChange={(e) => setForm({ ...form, nomor_kartu: e.target.value })} placeholder="Kosongkan jika belum" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Tgl Peminjaman</label>
                <input className="form-control" type="date" value={form.tanggal_pinjam} onChange={(e) => setForm({ ...form, tanggal_pinjam: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-save me-1"></i>}
            Simpan SPK
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/atk/perjalanan-dinas')}>Batal</button>
        </div>
      </form>
    </div>
  );
}
