import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { atkApi, masterApi } from '../../services/api';
import Swal from 'sweetalert2';

export default function PengajuanNonRutinPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '' });

  useEffect(() => {
    masterApi.cabang.list({ perPage: '100' }).then(r => { if (r.success) setCabangList(r.data); }).catch(console.error);
  }, []);

  useEffect(() => { fetchData(); }, [filter]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filter).filter(([_, v]) => v));
      const res = await atkApi.pengajuan.list(params);
      setData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleProses(id) {
    try { await atkApi.pengajuan.proses(id); Swal.fire('Sukses', 'Pengajuan diproses', 'success'); fetchData(); }
    catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  async function handleSetujui(id) {
    try { await atkApi.pengajuan.setujui(id); Swal.fire('Sukses', 'Pengajuan disetujui', 'success'); fetchData(); }
    catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  async function handleTolak(id) {
    const { value: alasan } = await Swal.fire({ title: 'Alasan ditolak', input: 'textarea', inputLabel: 'Alasan', showCancelButton: true, confirmButtonText: 'Tolak', confirmButtonColor: '#dc3545' });
    if (!alasan) return;
    try { await atkApi.pengajuan.tolak(id, { alasan }); Swal.fire('Ditolak', 'Pengajuan ditolak', 'success'); fetchData(); }
    catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  async function handleAjukanFinance(id) {
    const { isConfirmed } = await Swal.fire({ title: 'Ajukan ke Finance?', icon: 'question', showCancelButton: true, confirmButtonText: 'Ya, ajukan' });
    if (!isConfirmed) return;
    try { await atkApi.pengajuan.ajukanFinance(id); Swal.fire('Sukses', 'Diajukan ke Finance', 'success'); fetchData(); }
    catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  function statusBadge(s) {
    const map = { diajukan: 'primary', diproses_ga: 'info', disetujui_spv: 'success', diajukan_ke_finance: 'warning', ditolak: 'danger' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s?.replace(/_/g, ' ')}</span>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Pengajuan Barang Non Rutin</h4>
          <small className="text-muted">Pengajuan barang dari seluruh cabang/HO ke General Affairs</small>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/atk/pengajuan-barang-non-rutin/new')}>
          <i className="bi bi-plus-lg me-1"></i>Buat Pengajuan
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-auto">
              <select className="form-select form-select-sm" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                <option value="">Semua Status</option>
                <option value="diajukan">Diajukan</option>
                <option value="diproses_ga">Diproses GA</option>
                <option value="disetujui_spv">Disetujui SPV</option>
                <option value="diajukan_ke_finance">Diajukan ke Finance</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>No. Pengajuan</th><th>Pengaju</th><th>Jabatan</th><th>Lokasi</th><th>Status</th><th>Tgl</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.nomor_pengajuan}</strong></td>
                  <td>{item.nama_pengaju}<br /><small className="text-muted">{item.creator?.nama}</small></td>
                  <td>{item.jabatan}</td>
                  <td>{item.lokasi_kerja}<br /><small className="text-muted">{item.cabang?.nama || '-'}</small></td>
                  <td>{statusBadge(item.status)}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info me-1" onClick={() => navigate(`/atk/pengajuan-barang-non-rutin/${item.id}`)} title="Detail">
                      <i className="bi bi-eye"></i>
                    </button>
                    {item.status === 'diajukan' && (
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleProses(item.id)} title="Proses">
                        <i className="bi bi-check2"></i>
                      </button>
                    )}
                    {item.status === 'diproses_ga' && (
                      <>
                        <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleSetujui(item.id)} title="Setujui">
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger me-1" onClick={() => handleTolak(item.id)} title="Tolak">
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </>
                    )}
                    {item.status === 'disetujui_spv' && (
                      <button className="btn btn-sm btn-outline-warning" onClick={() => handleAjukanFinance(item.id)} title="Ajukan ke Finance">
                        <i className="bi bi-send"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
