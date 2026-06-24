import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { atkApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function PengajuanNonRutinDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  async function fetchData() {
    try {
      const res = await atkApi.pengajuan.get(id);
      setData(res.data);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
      navigate('/atk/pengajuan-barang-non-rutin');
    } finally { setLoading(false); }
  }

  async function handleProses() {
    try { await atkApi.pengajuan.proses(id); Swal.fire('Sukses', 'Pengajuan diproses', 'success'); fetchData(); }
    catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  async function handleSetujui() {
    try { await atkApi.pengajuan.setujui(id); Swal.fire('Sukses', 'Pengajuan disetujui', 'success'); fetchData(); }
    catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  async function handleTolak() {
    const { value: alasan } = await Swal.fire({ title: 'Alasan ditolak', input: 'textarea', inputLabel: 'Alasan', showCancelButton: true, confirmButtonText: 'Tolak', confirmButtonColor: '#dc3545' });
    if (!alasan) return;
    try { await atkApi.pengajuan.tolak(id, { alasan }); Swal.fire('Ditolak', 'Pengajuan ditolak', 'success'); fetchData(); }
    catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  async function handleAjukanFinance() {
    const { isConfirmed } = await Swal.fire({ title: 'Ajukan ke Finance?', icon: 'question', showCancelButton: true, confirmButtonText: 'Ya, ajukan' });
    if (!isConfirmed) return;
    try { await atkApi.pengajuan.ajukanFinance(id); Swal.fire('Sukses', 'Diajukan ke Finance', 'success'); fetchData(); }
    catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  function statusBadge(s) {
    const map = { diajukan: 'primary', diproses_ga: 'info', disetujui_spv: 'success', diajukan_ke_finance: 'warning', ditolak: 'danger' };
    return <span className={`badge bg-${map[s] || 'secondary'} fs-6`}>{s?.replace(/_/g, ' ')}</span>;
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (!data) return null;

  const canProses = profile && ['SA', 'HGA', 'SGA'].includes(profile.roles?.kode) && data.status === 'diajukan';
  const canSetujui = profile && ['SA', 'HGA'].includes(profile.roles?.kode) && data.status === 'diproses_ga';
  const canTolak = profile && ['SA', 'HGA', 'SGA'].includes(profile.roles?.kode) && ['diajukan', 'diproses_ga'].includes(data.status);
  const canAjukanFinance = profile && ['SA', 'HGA', 'SGA'].includes(profile.roles?.kode) && data.status === 'disetujui_spv';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">{data.nomor_pengajuan}</h4>
          <small className="text-muted">Detail pengajuan barang non rutin</small>
        </div>
        <div className="d-flex gap-2">
          {canProses && <button className="btn btn-primary" onClick={handleProses}><i className="bi bi-check2 me-1"></i>Proses</button>}
          {canSetujui && <button className="btn btn-success" onClick={handleSetujui}><i className="bi bi-check-lg me-1"></i>Setujui</button>}
          {canTolak && <button className="btn btn-danger" onClick={handleTolak}><i className="bi bi-x-lg me-1"></i>Tolak</button>}
          {canAjukanFinance && <button className="btn btn-warning" onClick={handleAjukanFinance}><i className="bi bi-send me-1"></i>Ajukan ke Finance</button>}
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Kembali</button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white"><h6 className="mb-0">Informasi Pengajuan</h6></div>
            <div className="card-body">
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{ width: 140 }}>Nomor</td><td className="fw-bold">{data.nomor_pengajuan}</td></tr>
                  <tr><td className="text-muted">Status</td><td>{statusBadge(data.status)}</td></tr>
                  <tr><td className="text-muted">Nama Pengaju</td><td>{data.nama_pengaju}</td></tr>
                  <tr><td className="text-muted">Jabatan</td><td>{data.jabatan}</td></tr>
                  <tr><td className="text-muted">Lokasi Kerja</td><td>{data.lokasi_kerja}</td></tr>
                  <tr><td className="text-muted">Cabang</td><td>{data.cabang?.nama || '-'}</td></tr>
                  <tr><td className="text-muted">Catatan</td><td>{data.catatan || '-'}</td></tr>
                  <tr><td className="text-muted">Tgl Pengajuan</td><td>{new Date(data.created_at).toLocaleDateString()}</td></tr>
                  <tr><td className="text-muted">Dibuat oleh</td><td>{data.creator?.nama}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Barang yang Diajukan</h6></div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr><th>No</th><th>Nama Barang</th><th>Spesifikasi</th><th>Jumlah</th><th>Satuan</th><th>Keterangan</th></tr>
                </thead>
                <tbody>
                  {data.pengajuan_barang_non_rutin_item?.map((it, i) => (
                    <tr key={it.id}>
                      <td>{i + 1}</td>
                      <td className="fw-bold">{it.nama_barang}</td>
                      <td>{it.spesifikasi || '-'}</td>
                      <td className="text-center">{it.jumlah}</td>
                      <td>{it.satuan}</td>
                      <td>{it.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {data.status === 'ditolak' && data.alasan_tolak && (
            <div className="card shadow-sm mb-4 border-danger">
              <div className="card-header bg-danger text-white"><h6 className="mb-0">Alasan Ditolak</h6></div>
              <div className="card-body"><p className="mb-0">{data.alasan_tolak}</p></div>
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Riwayat Proses</h6></div>
            <div className="card-body">
              <ul className="timeline list-unstyled mb-0">
                <li className="mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: 10 }}></i>
                    <div><small className="text-muted d-block">Diajukan</small><strong>{data.creator?.nama}</strong><br /><small className="text-muted">{new Date(data.created_at).toLocaleString()}</small></div>
                  </div>
                </li>
                {data.processed_by && (
                  <li className="mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-circle-fill text-info me-2" style={{ fontSize: 10 }}></i>
                      <div><small className="text-muted d-block">Diproses GA</small><strong>{data.processed_by?.nama}</strong><br /><small className="text-muted">{data.processed_at ? new Date(data.processed_at).toLocaleString() : ''}</small></div>
                    </div>
                  </li>
                )}
                {data.approved_by && (
                  <li className="mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: 10 }}></i>
                      <div><small className="text-muted d-block">Disetujui SPV</small><strong>{data.approved_by?.nama}</strong><br /><small className="text-muted">{data.approved_at ? new Date(data.approved_at).toLocaleString() : ''}</small></div>
                    </div>
                  </li>
                )}
                {data.status === 'diajukan_ke_finance' && (
                  <li className="mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-circle-fill text-warning me-2" style={{ fontSize: 10 }}></i>
                      <div><small className="text-muted d-block">Diajukan ke Finance</small></div>
                    </div>
                  </li>
                )}
                {data.status === 'ditolak' && (
                  <li className="mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-circle-fill text-danger me-2" style={{ fontSize: 10 }}></i>
                      <div><small className="text-muted d-block">Ditolak</small><strong>{data.rejected_by?.nama}</strong><br /><small className="text-muted">{data.rejected_at ? new Date(data.rejected_at).toLocaleString() : ''}</small></div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
