import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';

const STATUS_BADGE = { tersedia: 'success', dipakai: 'warning', perbaikan: 'danger', nonaktif: 'secondary' };

export default function VehiclePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daftar');

  const tabs = [
    { key: 'daftar', label: 'Daftar Kendaraan' },
    { key: 'booking', label: 'Booking' },
    { key: 'service', label: 'Service' },
    { key: 'bbm', label: 'BBM' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Manajemen Kendaraan</h4>
          <small className="text-muted">Kelola kendaraan operasional</small>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        {tabs.map((t) => (
          <li className="nav-item" key={t.key}>
            <button className={`nav-link ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
          </li>
        ))}
      </ul>

      {activeTab === 'daftar' && <DaftarKendaraan />}
      {activeTab === 'booking' && <BookingList />}
      {activeTab === 'service' && <ServiceHistory />}
      {activeTab === 'bbm' && <BBMList />}
    </div>
  );
}

function DaftarKendaraan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/vehicle?perPage=100')
      .then((res) => setData(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr><th>Nopol</th><th>Merk</th><th>Tipe</th><th>Tahun</th><th>Warna</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-muted">Belum ada data kendaraan</td></tr>
            ) : data.map((v) => (
              <tr key={v.id}>
                <td><strong>{v.nopol}</strong></td>
                <td>{v.merk}</td>
                <td>{v.tipe || '-'}</td>
                <td>{v.tahun || '-'}</td>
                <td>{v.warna || '-'}</td>
                <td><span className={`badge bg-${STATUS_BADGE[v.status] || 'secondary'}`}>{v.status}</span></td>
                <td><button className="btn btn-sm btn-outline-primary"><i className="bi bi-eye"></i></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/vehicle/booking?perPage=50')
      .then((res) => setData(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/app/vehicle/booking/create')}>
          <i className="bi bi-plus-lg me-1"></i>Booking Baru
        </button>
      </div>
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Kendaraan</th><th>Tujuan</th><th>Mulai</th><th>Selesai</th><th>Driver</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Belum ada booking</td></tr>
              ) : data.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.kendaraan?.nopol || '-'}</strong></td>
                  <td>{b.tujuan}</td>
                  <td className="text-nowrap">{b.tanggal_mulai ? new Date(b.tanggal_mulai).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="text-nowrap">{b.tanggal_selesai ? new Date(b.tanggal_selesai).toLocaleDateString('id-ID') : '-'}</td>
                  <td>{b.driver || '-'}</td>
                  <td><span className={`badge bg-${b.status === 'disetujui' ? 'success' : b.status === 'ditolak' ? 'danger' : 'secondary'}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ServiceHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/vehicle/service?perPage=50')
      .then((res) => setData(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr><th>Tanggal</th><th>Kendaraan</th><th>Tipe Service</th><th>Biaya</th><th>Bengkel</th><th>Status</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">Belum ada riwayat service</td></tr>
            ) : data.map((s) => (
              <tr key={s.id}>
                <td className="text-nowrap">{s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                <td>{s.kendaraan?.nopol || '-'}</td>
                <td>{s.tipe_service || '-'}</td>
                <td>{s.biaya ? `Rp${Number(s.biaya).toLocaleString('id-ID')}` : '-'}</td>
                <td>{s.bengkel || '-'}</td>
                <td><span className={`badge bg-${s.status === 'selesai' ? 'success' : 'secondary'}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BBMList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/vehicle/bbm?perPage=50')
      .then((res) => setData(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr><th>Tanggal</th><th>Kendaraan</th><th>Liter</th><th>Biaya</th><th>Km</th><th>Keterangan</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border spinner-border-sm" /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">Belum ada data BBM</td></tr>
            ) : data.map((b) => (
              <tr key={b.id}>
                <td className="text-nowrap">{b.tanggal ? new Date(b.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                <td>{b.kendaraan?.nopol || '-'}</td>
                <td>{b.liter || '-'}</td>
                <td>{b.biaya ? `Rp${Number(b.biaya).toLocaleString('id-ID')}` : '-'}</td>
                <td>{b.km || '-'}</td>
                <td className="small">{b.keterangan || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
