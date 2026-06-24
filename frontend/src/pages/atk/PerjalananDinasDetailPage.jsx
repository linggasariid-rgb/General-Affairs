import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { atkApi } from '../../services/api';
import Swal from 'sweetalert2';

export default function PerjalananDinasDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReturn, setShowReturn] = useState(false);
  const [returnForm, setReturnForm] = useState({ tanggal_kembali: new Date().toISOString().split('T')[0] });
  const [expenses, setExpenses] = useState([{ jenis: 'bensin', jumlah: '', keterangan: '' }]);

  useEffect(() => { fetchData(); }, [id]);

  async function fetchData() {
    try {
      const res = await atkApi.perjalananDinas.get(id);
      setData(res.data);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
      navigate('/atk/perjalanan-dinas');
    } finally { setLoading(false); }
  }

  function addExpense() {
    setExpenses([...expenses, { jenis: 'bensin', jumlah: '', keterangan: '' }]);
  }

  function updateExpense(i, field, value) {
    setExpenses(expenses.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  }

  function removeExpense(i) {
    setExpenses(expenses.filter((_, idx) => idx !== i));
  }

  async function handleReturn(e) {
    e.preventDefault();
    const validExpenses = expenses.filter(ex => ex.jenis && Number(ex.jumlah) > 0);
    if (!validExpenses.length) {
      Swal.fire('Error', 'Minimal satu pengeluaran harus diisi', 'error');
      return;
    }

    try {
      await atkApi.perjalananDinas.kembali(id, {
        tanggal_kembali: returnForm.tanggal_kembali,
        pengeluaran: validExpenses.map(ex => ({
          jenis: ex.jenis,
          jumlah: Number(ex.jumlah),
          keterangan: ex.keterangan,
        })),
      });
      Swal.fire('Sukses', 'Pengembalian berhasil dicatat', 'success');
      setShowReturn(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  }

  function statusBadge(s) {
    const map = { dipakai: 'primary', selesai: 'success' };
    return <span className={`badge bg-${map[s] || 'secondary'} fs-6`}>{s}</span>;
  }

  function cardStatusBadge(s) {
    const map = { dipinjam: 'warning', dikembalikan: 'secondary' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (!data) return null;

  const card = data.etoll_peminjaman?.[0];
  const totalPengeluaran = card?.etoll_pengeluaran?.reduce((sum, p) => sum + Number(p.jumlah), 0) || 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">SPK: {data.nomor_spk}</h4>
          <small className="text-muted">Detail perjalanan dinas</small>
        </div>
        <div className="d-flex gap-2">
          {data.status === 'dipakai' && (
            <button className="btn btn-success" onClick={() => { setReturnForm({ tanggal_kembali: new Date().toISOString().split('T')[0] }); setExpenses([{ jenis: 'bensin', jumlah: '', keterangan: '' }]); setShowReturn(true); }}>
              <i className="bi bi-arrow-return-left me-1"></i>Catat Pengembalian
            </button>
          )}
          <button className="btn btn-outline-secondary" onClick={() => navigate('/atk/perjalanan-dinas')}>Kembali</button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white"><h6 className="mb-0">Data SPK</h6></div>
            <div className="card-body">
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{ width: 140 }}>No. SPK</td><td className="fw-bold">{data.nomor_spk}</td></tr>
                  <tr><td className="text-muted">Status</td><td>{statusBadge(data.status)}</td></tr>
                  <tr><td className="text-muted">Pelaksana</td><td>{data.nama_pelaksana}</td></tr>
                  <tr><td className="text-muted">Divisi</td><td>{data.divisi}</td></tr>
                  <tr><td className="text-muted">Tujuan</td><td>{data.tujuan}</td></tr>
                  <tr><td className="text-muted">Berangkat</td><td>{data.tanggal_berangkat}</td></tr>
                  <tr><td className="text-muted">Kembali</td><td>{data.tanggal_kembali}</td></tr>
                  <tr><td className="text-muted">Keterangan</td><td>{data.keterangan || '-'}</td></tr>
                  <tr><td className="text-muted">Dibuat oleh</td><td>{data.creator?.nama}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {card && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white"><h6 className="mb-0">Kartu E-Toll</h6></div>
              <div className="card-body">
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr><td className="text-muted" style={{ width: 140 }}>No. Kartu</td><td className="fw-bold">{card.nomor_kartu}</td></tr>
                    <tr><td className="text-muted">Status</td><td>{cardStatusBadge(card.status)}</td></tr>
                    <tr><td className="text-muted">Tgl Pinjam</td><td>{card.tanggal_pinjam}</td></tr>
                    {card.tanggal_kembali && <tr><td className="text-muted">Tgl Kembali</td><td>{card.tanggal_kembali}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {card?.etoll_pengeluaran?.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-header bg-white"><h6 className="mb-0">Pengeluaran</h6></div>
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr><th>#</th><th>Jenis</th><th>Jumlah</th><th>Keterangan</th></tr>
                  </thead>
                  <tbody>
                    {card.etoll_pengeluaran.map((p, i) => (
                      <tr key={p.id}>
                        <td>{i + 1}</td>
                        <td><span className="badge bg-secondary">{p.jenis}</span></td>
                        <td className="fw-bold">Rp {Number(p.jumlah).toLocaleString()}</td>
                        <td>{p.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr><td colSpan="2" className="text-end fw-bold">Total</td><td className="fw-bold">Rp {totalPengeluaran.toLocaleString()}</td><td></td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white"><h6 className="mb-0">Ringkasan</h6></div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted d-block">Status SPK</small>
                <span className="fs-5">{statusBadge(data.status)}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Kartu E-Toll</small>
                <span className="fs-5">{card ? card.nomor_kartu : '-'}</span>
              </div>
              <div>
                <small className="text-muted d-block">Total Pengeluaran</small>
                <span className="fs-5 fw-bold">Rp {totalPengeluaran.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {showReturn && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Catat Pengembalian E-Toll & Pengeluaran</h5>
                <button type="button" className="btn-close" onClick={() => setShowReturn(false)}></button>
              </div>
              <form onSubmit={handleReturn}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Tanggal Kembali</label>
                      <input className="form-control" type="date" value={returnForm.tanggal_kembali}
                        onChange={(e) => setReturnForm({ ...returnForm, tanggal_kembali: e.target.value })} required />
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Pengeluaran</h6>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={addExpense}>
                      <i className="bi bi-plus-lg me-1"></i>Tambah
                    </button>
                  </div>
                  <table className="table table-sm">
                    <thead className="table-light">
                      <tr><th>Jenis</th><th>Jumlah (Rp)</th><th>Keterangan</th><th></th></tr>
                    </thead>
                    <tbody>
                      {expenses.map((ex, i) => (
                        <tr key={i}>
                          <td>
                            <select className="form-select form-select-sm" value={ex.jenis} onChange={(e) => updateExpense(i, 'jenis', e.target.value)} required>
                              <option value="bensin">Bensin</option>
                              <option value="tol">Tol</option>
                              <option value="parkir">Parkir</option>
                              <option value="lainnya">Lainnya</option>
                            </select>
                          </td>
                          <td>
                            <input className="form-control form-control-sm" type="number" min="0" step="500"
                              value={ex.jumlah} onChange={(e) => updateExpense(i, 'jumlah', e.target.value)} required />
                          </td>
                          <td>
                            <input className="form-control form-control-sm" value={ex.keterangan}
                              onChange={(e) => updateExpense(i, 'keterangan', e.target.value)} />
                          </td>
                          <td>
                            {expenses.length > 1 && (
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeExpense(i)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReturn(false)}>Batal</button>
                  <button type="submit" className="btn btn-success">Simpan Pengembalian</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
