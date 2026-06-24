import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { atkApi, masterApi } from '../../services/api';
import Swal from 'sweetalert2';

export default function LaporanStokCabangPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [cabangList, setCabangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', id_cabang: '', bulan: String(new Date().getMonth() + 1), tahun: String(new Date().getFullYear()) });
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    masterApi.cabang.list({ perPage: '100' }).then(r => { if (r.success) setCabangList(r.data); }).catch(console.error);
  }, []);

  useEffect(() => { fetchData(); }, [filter]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = { perPage: '100', ...filter };
      if (!params.bulan) delete params.bulan;
      if (!params.tahun) delete params.tahun;
      const res = await atkApi.laporan.list(Object.fromEntries(Object.entries(params).filter(([_, v]) => v)));
      setData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleSubmit(id) {
    const { isConfirmed } = await Swal.fire({ title: 'Ajukan laporan?', text: 'Laporan akan dikirim ke GA Pusat', icon: 'question', showCancelButton: true, confirmButtonText: 'Ya, ajukan' });
    if (!isConfirmed) return;
    try {
      await atkApi.laporan.submit(id);
      Swal.fire('Sukses', 'Laporan berhasil diajukan', 'success');
      fetchData();
    } catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  async function handleVerifikasi(id) {
    const { value: catatan } = await Swal.fire({ title: 'Verifikasi Laporan', input: 'textarea', inputLabel: 'Catatan (opsional)', showCancelButton: true, confirmButtonText: 'Verifikasi' });
    if (catatan === undefined) return;
    try {
      await atkApi.laporan.verifikasi(id, { catatan: catatan || '' });
      Swal.fire('Sukses', 'Laporan berhasil diverifikasi', 'success');
      fetchData();
    } catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  async function openDetail(id) {
    try {
      const res = await atkApi.laporan.get(id);
      setDetail(res.data);
    } catch (err) { Swal.fire('Error', err.message, 'error'); }
  }

  function statusBadge(s) {
    const map = { draft: 'secondary', dilaporkan: 'primary', diverifikasi: 'success' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Laporan Stok Cabang</h4>
          <small className="text-muted">Laporan stok fisik ATK/RTK dari masing-masing cabang</small>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/atk/laporan-stok-cabang/new')}>
          <i className="bi bi-plus-lg me-1"></i>Buat Laporan
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2 align-items-end">
            <div className="col-auto">
              <select className="form-select form-select-sm" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="dilaporkan">Dilaporkan</option>
                <option value="diverifikasi">Diverifikasi</option>
              </select>
            </div>
            <div className="col-auto">
              <select className="form-select form-select-sm" value={filter.id_cabang} onChange={(e) => setFilter({ ...filter, id_cabang: e.target.value })}>
                <option value="">Semua Cabang</option>
                {cabangList.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
            <div className="col-auto">
              <input className="form-control form-control-sm" type="number" min="1" max="12" style={{ width: 80 }} value={filter.bulan} onChange={(e) => setFilter({ ...filter, bulan: e.target.value })} placeholder="Bulan" />
            </div>
            <div className="col-auto">
              <input className="form-control form-control-sm" type="number" min="2020" style={{ width: 90 }} value={filter.tahun} onChange={(e) => setFilter({ ...filter, tahun: e.target.value })} placeholder="Tahun" />
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>No. Laporan</th><th>Cabang</th><th>Gudang</th><th>Bulan</th><th>Tahun</th><th>Status</th><th>Tgl Laporan</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.nomor_laporan}</strong></td>
                  <td>{item.cabang?.nama || '-'}</td>
                  <td>{item.gudang?.nama || '-'}</td>
                  <td>{item.bulan}</td>
                  <td>{item.tahun}</td>
                  <td>{statusBadge(item.status)}</td>
                  <td>{item.tanggal_laporan}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info me-1" onClick={() => openDetail(item.id)} title="Detail">
                      <i className="bi bi-eye"></i>
                    </button>
                    {item.status === 'draft' && (
                      <>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => navigate(`/atk/laporan-stok-cabang/${item.id}/edit`)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleSubmit(item.id)} title="Ajukan">
                          <i className="bi bi-send"></i>
                        </button>
                      </>
                    )}
                    {item.status === 'dilaporkan' && (
                      <button className="btn btn-sm btn-outline-success" onClick={() => handleVerifikasi(item.id)} title="Verifikasi">
                        <i className="bi bi-check-lg"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Laporan: {detail.nomor_laporan}</h5>
                <button type="button" className="btn-close" onClick={() => setDetail(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-4"><strong>Cabang:</strong> {detail.cabang?.nama}</div>
                  <div className="col-md-4"><strong>Gudang:</strong> {detail.gudang?.nama}</div>
                  <div className="col-md-4"><strong>Status:</strong> {statusBadge(detail.status)}</div>
                  <div className="col-md-4 mt-2"><strong>Bulan/Tahun:</strong> {detail.bulan}/{detail.tahun}</div>
                  <div className="col-md-4 mt-2"><strong>Tgl Laporan:</strong> {detail.tanggal_laporan}</div>
                  <div className="col-md-4 mt-2"><strong>Pembuat:</strong> {detail.creator?.nama}</div>
                  {detail.verifier && <div className="col-md-4 mt-2"><strong>Verifikator:</strong> {detail.verifier.nama}</div>}
                  {detail.catatan && <div className="col-12 mt-2"><strong>Catatan:</strong> {detail.catatan}</div>}
                </div>
                <table className="table table-sm">
                  <thead className="table-light">
                    <tr><th>Item</th><th>Stok Sistem</th><th>Stok Fisik</th><th>Selisih</th><th>Keterangan</th></tr>
                  </thead>
                  <tbody>
                    {detail.atk_laporan_stok_cabang_item?.map((it, i) => (
                      <tr key={it.id || i} className={it.selisih !== 0 ? 'table-warning' : ''}>
                        <td><strong>{it.atk_item?.kode_item}</strong><br /><small>{it.atk_item?.nama}</small></td>
                        <td className="text-center">{it.stok_sistem}</td>
                        <td className="text-center">{it.stok_fisik}</td>
                        <td className={`text-center fw-bold ${it.selisih > 0 ? 'text-success' : it.selisih < 0 ? 'text-danger' : ''}`}>{it.selisih > 0 ? `+${it.selisih}` : it.selisih}</td>
                        <td>{it.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDetail(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
