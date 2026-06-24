import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assetApi } from '../../services/api';

const STATUS_BADGE = {
  draft: 'secondary', aktif: 'success', rusak: 'danger',
  perbaikan: 'warning', hilang: 'dark', dijual: 'info', dihapus: 'secondary',
};

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => { fetchAsset(); }, [id]);

  async function fetchAsset() {
    setLoading(true);
    try {
      const res = await assetApi.get(id);
      setAsset(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  if (!asset) {
    return <div className="text-center py-5 text-muted">Asset tidak ditemukan</div>;
  }

  const tabs = [
    { key: 'info', label: 'Info Asset' },
    { key: 'history', label: 'History' },
    { key: 'foto', label: 'Foto' },
    { key: 'mutasi', label: 'Mutasi' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">{asset.nama}</h4>
          <small className="text-muted">{asset.kode_asset}</small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/app/asset/${id}/edit`)}>
            <i className="bi bi-pencil me-1"></i>Edit
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/app/asset')}>
            <i className="bi bi-arrow-left me-1"></i>Kembali
          </button>
        </div>
      </div>

      {/* Status Badge Row */}
      <div className="d-flex gap-2 mb-4">
        <span className={`badge bg-${STATUS_BADGE[asset.status] || 'secondary'} fs-6`}>{asset.status}</span>
        {asset.kategori_asset && <span className="badge bg-info fs-6">{asset.kategori_asset.nama}</span>}
        {asset.cabang && <span className="badge bg-primary fs-6">{asset.cabang.nama}</span>}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {tabs.map((t) => (
          <li className="nav-item" key={t.key}>
            <button className={`nav-link ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="row g-4">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-white"><h6 className="mb-0">Detail Asset</h6></div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <tbody>
                    {[
                      ['Kode Asset', asset.kode_asset],
                      ['Nama Asset', asset.nama],
                      ['Kategori', asset.kategori_asset?.nama || '-'],
                      ['Cabang', asset.cabang?.nama || '-'],
                      ['Gudang', asset.gudang?.nama || '-'],
                      ['Lokasi', asset.lokasi?.nama || '-'],
                      ['Merek', asset.merek || '-'],
                      ['Model', asset.model || '-'],
                      ['Nomor Seri', asset.nomor_seri || '-'],
                      ['Tahun Perolehan', asset.tahun_perolehan || '-'],
                      ['Tanggal Perolehan', asset.tanggal_perolehan ? new Date(asset.tanggal_perolehan).toLocaleDateString('id-ID') : '-'],
                      ['Harga Perolehan', asset.harga_perolehan ? `Rp${Number(asset.harga_perolehan).toLocaleString('id-ID')}` : '-'],
                      ['Nilai Residu', asset.nilai_residu ? `Rp${Number(asset.nilai_residu).toLocaleString('id-ID')}` : '-'],
                      ['Nilai Buku', asset.nilai_buku ? `Rp${Number(asset.nilai_buku).toLocaleString('id-ID')}` : '-'],
                      ['Masa Manfaat', asset.masa_manfaat ? `${asset.masa_manfaat} bulan` : '-'],
                      ['Status', asset.status],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td className="text-muted" style={{ width: '200px' }}>{label}</td>
                        <td><strong>{value}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-white"><h6 className="mb-0">QR Code</h6></div>
              <div className="card-body text-center">
                <div className="border rounded bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                  <span className="text-muted">QR Code Placeholder</span>
                </div>
                <button className="btn btn-sm btn-outline-primary mt-2">
                  <i className="bi bi-download me-1"></i>Download QR
                </button>
              </div>
            </div>
            {asset.spesifikasi && (
              <div className="card shadow-sm">
                <div className="card-header bg-white"><h6 className="mb-0">Spesifikasi</h6></div>
                <div className="card-body">
                  <p className="mb-0 small">{asset.spesifikasi}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && <HistoryTab assetId={id} />}

      {/* Tab: Foto */}
      {activeTab === 'foto' && (
        <div className="card shadow-sm">
          <div className="card-header bg-white"><h6 className="mb-0">Galeri Foto</h6></div>
          <div className="card-body">
            <div className="text-center py-5 text-muted">Belum ada foto</div>
          </div>
        </div>
      )}

      {/* Tab: Mutasi */}
      {activeTab === 'mutasi' && <MutasiTab assetId={id} />}
    </div>
  );
}

function HistoryTab({ assetId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assetApi.getHistory(assetId).then((res) => setHistory(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [assetId]);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white"><h6 className="mb-0">Riwayat Asset</h6></div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr><th>Tanggal</th><th>Tipe</th><th>Deskripsi</th><th>User</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-4 text-muted">Belum ada riwayat</td></tr>
            ) : history.map((h, i) => (
              <tr key={i}>
                <td className="text-nowrap">{new Date(h.created_at).toLocaleDateString('id-ID')}</td>
                <td><span className="badge bg-secondary">{h.tipe}</span></td>
                <td>{h.deskripsi || '-'}</td>
                <td>{h.user?.nama || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MutasiTab({ assetId }) {
  const [mutasi, setMutasi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assetApi.mutasi.list({ id_asset: assetId }).then((res) => setMutasi(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [assetId]);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white"><h6 className="mb-0">Riwayat Mutasi</h6></div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr><th>Tanggal</th><th>Tipe</th><th>Dari</th><th>Tujuan</th><th>Status</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
            ) : mutasi.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4 text-muted">Belum ada mutasi</td></tr>
            ) : mutasi.map((m) => (
              <tr key={m.id}>
                <td className="text-nowrap">{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                <td>{m.tipe_mutasi}</td>
                <td>{m.cabang_asal?.nama || m.gudang_asal?.nama || '-'}</td>
                <td>{m.cabang_tujuan?.nama || m.gudang_tujuan?.nama || '-'}</td>
                <td><span className={`badge bg-${m.status === 'disetujui' ? 'success' : m.status === 'ditolak' ? 'danger' : m.status === 'selesai' ? 'primary' : 'secondary'}`}>{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
