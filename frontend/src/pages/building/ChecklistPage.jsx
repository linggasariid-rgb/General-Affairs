import { useState, useEffect } from 'react';
import { masterApi, apiFetch } from '../../services/api';

export default function ChecklistPage() {
  const [cabangList, setCabangList] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState('');
  const [template, setTemplate] = useState([]);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingChecklist, setExistingChecklist] = useState(null);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    masterApi.cabang.list({ perPage: '100' }).then((res) => setCabangList(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCabang) return;
    setLoading(true);
    Promise.all([
      apiFetch(`/building/checklist/template?perPage=100`),
      apiFetch(`/building/checklist?tanggal=${today}&id_cabang=${selectedCabang}`),
    ]).then(([tmpl, existing]) => {
      setTemplate(tmpl.data || []);
      const chk = existing.data?.[0];
      setExistingChecklist(chk);
      if (chk) {
        const ans = {};
        const nts = {};
        (chk.checklist_item || []).forEach((item) => {
          ans[item.id_template_item] = item.status;
          nts[item.id_template_item] = item.keterangan || '';
        });
        setAnswers(ans);
        setNotes(nts);
      } else {
        setAnswers({});
        setNotes({});
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedCabang, today]);

  function setStatus(templateItemId, status) {
    setAnswers({ ...answers, [templateItemId]: status });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const items = template.flatMap((k) => k.items || []).map((item) => ({
        id_template_item: item.id,
        status: answers[item.id] || 'ok',
        keterangan: notes[item.id] || '',
      }));
      const method = existingChecklist ? 'PUT' : 'POST';
      const endpoint = existingChecklist ? `/building/checklist/${existingChecklist.id}` : '/building/checklist';
      await apiFetch(endpoint, {
        method,
        body: JSON.stringify({ id_cabang: selectedCabang, tanggal: today, items }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const grouped = template;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Daily Checklist</h4>
          <small className="text-muted">Checklist harian kebersihan dan kerapihan bangunan - {new Date(today).toLocaleDateString('id-ID')}</small>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <label className="form-label mb-0">Cabang</label>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={selectedCabang} onChange={(e) => setSelectedCabang(e.target.value)} required>
                <option value="">-- Pilih Cabang --</option>
                {cabangList.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-4"><div className="spinner-border" /></div>}

      {selectedCabang && !loading && (
        <form onSubmit={handleSubmit}>
          {grouped.length === 0 ? (
            <div className="card shadow-sm">
              <div className="card-body text-center text-muted py-4">Belum ada template checklist</div>
            </div>
          ) : grouped.map((kategori) => (
            <div className="card shadow-sm mb-3" key={kategori.id}>
              <div className="card-header bg-white"><h6 className="mb-0">{kategori.nama}</h6></div>
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr><th>Item</th><th style={{ width: '250px' }}>Status</th><th>Keterangan</th></tr>
                  </thead>
                  <tbody>
                    {(kategori.items || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.nama}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {['ok', 'issue', 'na'].map((s) => (
                              <button type="button" key={s}
                                className={`btn btn-outline-${s === 'ok' ? 'success' : s === 'issue' ? 'danger' : 'secondary'} ${answers[item.id] === s ? 'active' : ''}`}
                                onClick={() => setStatus(item.id, s)}>
                                {s === 'ok' ? 'OK' : s === 'issue' ? 'Issue' : 'N/A'}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td>
                          <input className="form-control form-control-sm" placeholder="Catatan (opsional)"
                            value={notes[item.id] || ''} onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {grouped.length > 0 && (
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                {existingChecklist ? 'Update Checklist' : 'Simpan Checklist'}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
