import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { atkApi, masterApi } from '../../services/api';
import Swal from 'sweetalert2';

export default function LaporanStokCabangFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [cabangList, setCabangList] = useState([]);
  const [gudangList, setGudangList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const [form, setForm] = useState({
    id_cabang: '', id_gudang: '', bulan: now.getMonth() + 1, tahun: now.getFullYear(),
    tanggal_laporan: now.toISOString().split('T')[0], catatan: '',
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    Promise.all([
      masterApi.cabang.list({ perPage: '100' }),
      masterApi.gudang.list({ perPage: '100' }),
      atkApi.item.all({ perPage: '100' }),
      isEdit ? atkApi.laporan.get(id) : Promise.resolve(null),
    ]).then(([cabangRes, gudangRes, itemRes, detailRes]) => {
      if (cabangRes.success) setCabangList(cabangRes.data);
      if (gudangRes.success) setGudangList(gudangRes.data);
      if (itemRes.success) setItemList(itemRes.data);

      if (detailRes?.success && detailRes.data) {
        const d = detailRes.data;
        setForm({
          id_cabang: d.id_cabang,
          id_gudang: d.id_gudang,
          bulan: d.bulan,
          tahun: d.tahun,
          tanggal_laporan: d.tanggal_laporan,
          catatan: d.catatan || '',
        });
        setItems(d.atk_laporan_stok_cabang_item?.map((it) => ({
          id_item: it.id_item,
          stok_sistem: it.stok_sistem,
          stok_fisik: it.stok_fisik,
          keterangan: it.keterangan || '',
        })) || []);
      }

      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (itemList.length > 0 && items.length === 0 && !isEdit) {
      setItems(itemList.map(it => ({
        id_item: it.id,
        stok_sistem: 0,
        stok_fisik: 0,
        keterangan: '',
      })));
    }
  }, [itemList, isEdit]);

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.id_cabang || !form.id_gudang) {
      Swal.fire('Error', 'Cabang dan gudang harus diisi', 'error');
      return;
    }

    const filteredItems = items.filter(it => it.stok_fisik > 0 || it.stok_sistem > 0);
    if (!filteredItems.length) {
      Swal.fire('Error', 'Minimal satu item dengan stok > 0', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        bulan: Number(form.bulan),
        tahun: Number(form.tahun),
        items: filteredItems.map(it => ({
          id_item: it.id_item,
          stok_sistem: Number(it.stok_sistem) || 0,
          stok_fisik: Number(it.stok_fisik) || 0,
          keterangan: it.keterangan,
        })),
      };

      if (isEdit) {
        await atkApi.laporan.update(id, payload);
        await atkApi.laporan.submit(id);
        Swal.fire('Sukses', 'Laporan berhasil diupdate dan diajukan', 'success');
      } else {
        const res = await atkApi.laporan.create(payload);
        await atkApi.laporan.submit(res.data.id);
        Swal.fire('Sukses', 'Laporan berhasil dibuat dan diajukan', 'success');
      }
      navigate('/atk/laporan-stok-cabang');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleCabangChange(idCabang) {
    const pusat = gudangList.find(g => g.tipe === 'pusat');
    setForm({ ...form, id_cabang: idCabang, id_gudang: pusat?.id || '' });
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">{isEdit ? 'Edit' : 'Buat'} Laporan Stok Cabang</h4>
          <small className="text-muted">Laporan stok fisik ATK/RTK dari cabang</small>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white"><h6 className="mb-0">Informasi Laporan</h6></div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Cabang <span className="text-danger">*</span></label>
                <select className="form-select" value={form.id_cabang} onChange={(e) => handleCabangChange(e.target.value)} required disabled={isEdit}>
                  <option value="">-- Pilih --</option>
                  {cabangList.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Gudang <span className="text-danger">*</span></label>
                <select className="form-select" value={form.id_gudang} onChange={(e) => setForm({ ...form, id_gudang: e.target.value })} required disabled={isEdit}>
                  <option value="">-- Pilih --</option>
                  {gudangList.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Bulan</label>
                <input className="form-control" type="number" min="1" max="12" value={form.bulan} onChange={(e) => setForm({ ...form, bulan: e.target.value })} required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Tahun</label>
                <input className="form-control" type="number" min="2020" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })} required />
              </div>
              <div className="col-12">
                <label className="form-label">Catatan</label>
                <textarea className="form-control" rows="2" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })}></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Detail Stok Item</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr><th style={{ width: 120 }}>Kode</th><th>Nama Item</th><th style={{ width: 100 }}>Stok Sistem</th><th style={{ width: 100 }}>Stok Fisik</th><th style={{ width: 100 }}>Selisih</th><th>Keterangan</th></tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const item = itemList.find(x => x.id === it.id_item);
                  const selisih = (Number(it.stok_fisik) || 0) - (Number(it.stok_sistem) || 0);
                  return (
                    <tr key={it.id_item} className={selisih !== 0 ? 'table-warning' : ''}>
                      <td><input className="form-control form-control-sm" value={item?.kode_item || ''} disabled /></td>
                      <td><input className="form-control form-control-sm" value={item?.nama || ''} disabled /></td>
                      <td>
                        <input className="form-control form-control-sm text-center" type="number" min="0" value={it.stok_sistem}
                          onChange={(e) => updateItem(i, 'stok_sistem', e.target.value)} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm text-center" type="number" min="0" value={it.stok_fisik}
                          onChange={(e) => updateItem(i, 'stok_fisik', e.target.value)} />
                      </td>
                      <td className={`text-center fw-bold align-middle ${selisih > 0 ? 'text-success' : selisih < 0 ? 'text-danger' : ''}`}>
                        {selisih !== 0 ? (selisih > 0 ? `+${selisih}` : selisih) : '-'}
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={it.keterangan} onChange={(e) => updateItem(i, 'keterangan', e.target.value)} placeholder="-" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-save me-1"></i>}
            {isEdit ? 'Update & Ajukan' : 'Simpan & Ajukan'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/atk/laporan-stok-cabang')}>Batal</button>
        </div>
      </form>
    </div>
  );
}
