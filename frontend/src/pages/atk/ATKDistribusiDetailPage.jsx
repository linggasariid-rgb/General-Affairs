import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { atkApi } from '../../services/api';

const STATUS_BADGE = {
  draft: 'secondary', diajukan: 'info', disetujui: 'primary',
  diproses: 'warning', dikirim: 'info', diterima_sebagian: 'warning',
  selesai: 'success', ditolak: 'danger',
};

export default function ATKDistribusiDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  async function fetchData() {
    try {
      const res = await atkApi.distribusi.get(id);
      setData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleSubmit() {
    await atkApi.distribusi.submit(id);
    fetchData();
  }

  async function handleApprove() {
    await atkApi.distribusi.approve(id);
    fetchData();
  }

  async function handleReject() {
    await atkApi.distribusi.reject(id);
    fetchData();
  }

  async function handleKirim() {
    const kirimItems = data.atk_distribusi_item.map((item) => ({
      id: item.id,
      id_item: item.id_item,
      qty_dikirim: item.qty_direncanakan,
    }));
    await atkApi.distribusi.kirim(id, { items: kirimItems });
    fetchData();
  }

  async function handleSelesai() {
    await atkApi.distribusi.selesai(id);
    fetchData();
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (!data) return <div className="text-center py-5"><h5>Data tidak ditemukan</h5></div>;

  const canSubmit = data.status === 'draft';
  const canApprove = data.status === 'diajukan';
  const canKirim = data.status === 'disetujui';
  const canSelesai = data.status === 'dikirim' || data.status === 'diterima_sebagian';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">{data.nomor_distribusi}</h4>
          <small className="text-muted">{data.judul}</small>
        </div>
        <div className="d-flex gap-2">
          {canSubmit && <button className="btn btn-info btn-sm" onClick={handleSubmit}><i className="bi bi-send me-1"></i>Ajukan</button>}
          {canApprove && <button className="btn btn-success btn-sm" onClick={handleApprove}><i className="bi bi-check me-1"></i>Setujui</button>}
          {canApprove && <button className="btn btn-danger btn-sm" onClick={handleReject}><i className="bi bi-x me-1"></i>Tolak</button>}
          {canKirim && <button className="btn btn-primary btn-sm" onClick={handleKirim}><i className="bi bi-truck me-1"></i>Kirim Barang</button>}
          {canSelesai && <button className="btn btn-success btn-sm" onClick={handleSelesai}><i className="bi bi-check-all me-1"></i>Selesai</button>}
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/atk/distribusi')}>Kembali</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small className="text-muted">Status</small>
              <div><span className={`badge bg-${STATUS_BADGE[data.status]} fs-6`}>{data.status}</span></div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small className="text-muted">Cabang Tujuan</small>
              <div className="fw-bold">{data.cabang?.nama || '-'}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small className="text-muted">Gudang Asal</small>
              <div className="fw-bold">{data.gudang?.nama || '-'}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <small className="text-muted">Periode</small>
              <div className="fw-bold">{data.bulan}/{data.tahun}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white"><h6 className="mb-0">Item Distribusi</h6></div>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead className="table-light">
              <tr><th>#</th><th>Item</th><th>Satuan</th><th>Rencana</th><th>Dikirim</th><th>Diterima</th></tr>
            </thead>
            <tbody>
              {(data.atk_distribusi_item || []).map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td><strong>{item.atk_item?.kode_item}</strong> - {item.atk_item?.nama}</td>
                  <td>{item.atk_item?.satuan || '-'}</td>
                  <td>{item.qty_direncanakan}</td>
                  <td>{item.qty_dikirim || '-'}</td>
                  <td>{item.qty_diterima || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.catatan && (
          <div className="card-body border-top">
            <small className="text-muted">Catatan:</small>
            <p className="mb-0">{data.catatan}</p>
          </div>
        )}
      </div>
    </div>
  );
}
