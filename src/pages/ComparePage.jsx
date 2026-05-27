import { useState, useEffect } from 'react';
import { VehicleSpecForm } from '../components/shared/VehicleSpecForm';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { vehicleService, comparisonService } from '../services';

const ATTRS = [
  { key: 'horsepower', label: 'Power', unit: 'HP' },
  { key: 'torque', label: 'Torque', unit: 'Nm' },
  { key: 'topSpeed', label: 'Top Speed', unit: 'km/h' },
  { key: 'acceleration', label: '0-100 km/h', unit: 's', lower: true },
  { key: 'weight', label: 'Weight', unit: 'kg', lower: true },
  { key: 'length', label: 'Length', unit: 'm' },
  { key: 'width', label: 'Width', unit: 'm' },
  { key: 'height', label: 'Height', unit: 'm' },
  { key: 'price', label: 'Price', unit: 'USD' },
  { key: 'electricRange', label: 'EV Range', unit: 'km' },
];

export function ComparePage() {
  const toast = useToast();
  const [vehicleA, setVehicleA] = useState(null);
  const [vehicleB, setVehicleB] = useState(null);
  const [result, setResult] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedList, setSavedList] = useState([]);
  const [activeTab, setActiveTab] = useState('compare');

  useEffect(() => {
    comparisonService.savedList().then((d) => setSavedList(d.content || [])).catch(() => {});
  }, []);

  const compare = async () => {
    if (!vehicleA || !vehicleB) { toast('Please select both vehicles', 'error'); return; }
    setComparing(true); setResult(null);
    try {
      const data = vehicleA.id && vehicleB.id
        ? await vehicleService.compare(vehicleA.id, vehicleB.id)
        : await vehicleService.compareBySpec(
            { brand: vehicleA.brand, model: vehicleA.model, version: vehicleA.version, year: vehicleA.year },
            { brand: vehicleB.brand, model: vehicleB.model, version: vehicleB.version, year: vehicleB.year },
          );
      setResult(data);
    } catch (e) { toast(e.message, 'error'); }
    finally { setComparing(false); }
  };

  const saveComparison = async () => {
    if (!vehicleA || !vehicleB) return;
    setSaving(true);
    try {
      const saved = await comparisonService.save({
        vehicleAId: vehicleA.id, vehicleBId: vehicleB.id,
        title: saveTitle || `${vehicleA.brand} ${vehicleA.model} vs ${vehicleB.brand} ${vehicleB.model}`,
      });
      setSavedList((l) => [saved, ...l]);
      setShowSaveModal(false);
      toast('Comparison saved! ✓', 'success');
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const deleteSaved = async (id) => {
    try {
      await comparisonService.delete(id);
      setSavedList((l) => l.filter((x) => x.id !== id));
      toast('Removed', 'info');
    } catch (e) { toast(e.message, 'error'); }
  };

  const winner = result?.comparison?.winner;
  const winnerLabel = winner === 'VEHICLE_A'
    ? `${vehicleA?.brand} ${vehicleA?.model}`
    : winner === 'VEHICLE_B'
    ? `${vehicleB?.brand} ${vehicleB?.model}`
    : 'Technical tie';
  const winnerIcon = winner === 'DRAW' ? '🤝' : '🏆';

  return (
    <div className="fade-in">
      <div className="page-title">Vehicle Comparator</div>
      <div className="page-sub">Compare technical specs side by side with AI analysis</div>

      <div className="tabs" style={{ maxWidth: 380, marginBottom: 20 }}>
        <button className={`tab ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>New Comparison</button>
        <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>Saved ({savedList.length})</button>
      </div>

      {activeTab === 'saved' ? (
        <div>
          {savedList.length === 0 ? (
            <div className="empty">
              <div className="empty-title">No saved comparisons</div>
              <div className="empty-sub">Run a comparison and save it to access it later</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveTab('compare')}>Compare Vehicles</button>
            </div>
          ) : savedList.map((s) => (
            <div key={s.id} className="saved-card" style={{ marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, background: 'var(--orange-dim)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: '1px solid rgba(232,98,42,.2)' }}>⚖</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="saved-vs">SAVED COMPARISON</div>
                <div className="saved-title">{s.title || `${s.vehicleA?.brand || ''} ${s.vehicleA?.model || ''} vs ${s.vehicleB?.brand || ''} ${s.vehicleB?.model || ''}`}</div>
                <div className="saved-time">{new Date(s.savedAt || Date.now()).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => deleteSaved(s.id)}>✕</button>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <VehicleSpecForm label="Vehicle A" selected={vehicleA} onSelect={setVehicleA} onClear={() => { setVehicleA(null); setResult(null); }} />
            <VehicleSpecForm label="Vehicle B" selected={vehicleB} onSelect={setVehicleB} onClear={() => { setVehicleB(null); setResult(null); }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={compare} disabled={comparing || !vehicleA || !vehicleB}>
              {comparing ? <><Spinner size={16} /> Comparing...</> : 'Compare Vehicles'}
            </button>
            {result && <button className="btn btn-outline" onClick={() => setShowSaveModal(true)}>Save Result</button>}
            {(vehicleA || vehicleB) && !comparing && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setVehicleA(null); setVehicleB(null); setResult(null); }}>↺ Reset</button>
            )}
          </div>

          {result && (
            <div className="fade-in">
              <div style={{
                background: winner === 'DRAW' ? 'var(--bg3)' : 'linear-gradient(135deg,rgba(232,98,42,.12),rgba(232,98,42,.04))',
                border: `1px solid ${winner === 'DRAW' ? 'var(--border)' : 'rgba(232,98,42,.3)'}`,
                borderRadius: 'var(--radius-lg)', padding: '18px 24px',
                display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16,
              }}>
                <div style={{ fontSize: 32 }}>{winnerIcon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>
                    {winner === 'DRAW' ? 'Outcome' : 'Overall Winner'}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Barlow Condensed', letterSpacing: '-.3px' }}>{winnerLabel}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {[
                    { key: 'VEHICLE_A', vehicle: vehicleA, score: result.comparison?.scoreA, color: 'var(--green)', bg: 'rgba(34,201,122,.15)' },
                    { key: 'VEHICLE_B', vehicle: vehicleB, score: result.comparison?.scoreB, color: 'var(--blue)', bg: 'rgba(59,130,246,.15)' },
                  ].map((s, i) => (
                    <div key={s.key} style={{ textAlign: 'center' }}>
                      {i === 1 && <div style={{ fontSize: 18, color: 'var(--text3)', fontWeight: 700, marginBottom: 4 }}>vs</div>}
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, fontWeight: 600 }}>{s.vehicle?.brand} {s.vehicle?.model}</div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 52, height: 52, borderRadius: '50%',
                        background: winner === s.key ? s.bg : 'var(--bg3)',
                        border: `2px solid ${winner === s.key ? s.color : 'var(--border2)'}`,
                        fontSize: 22, fontWeight: 900, fontFamily: 'Barlow Condensed',
                        color: winner === s.key ? s.color : 'var(--text2)',
                      }}>{s.score ?? '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {result.summary && (
                <div style={{ padding: '14px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>AI Summary</div>
                    <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65 }}>{result.summary}</div>
                  </div>
                </div>
              )}

              <div className="table-wrap">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', borderBottom: '1px solid var(--border)', padding: '10px 16px', background: 'var(--bg3)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text3)' }}>Attribute</div>
                  <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: winner === 'VEHICLE_A' ? 'var(--green)' : 'var(--text)' }}>
                    {result.vehicleA?.brand} {result.vehicleA?.model}
                    {winner === 'VEHICLE_A' && <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(34,201,122,.15)', color: 'var(--green)', padding: '1px 6px', borderRadius: 99, border: '1px solid rgba(34,201,122,.2)' }}>WIN</span>}
                  </div>
                  <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: winner === 'VEHICLE_B' ? 'var(--blue)' : 'var(--text)' }}>
                    {result.vehicleB?.brand} {result.vehicleB?.model}
                    {winner === 'VEHICLE_B' && <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(59,130,246,.15)', color: 'var(--blue)', padding: '1px 6px', borderRadius: 99, border: '1px solid rgba(59,130,246,.2)' }}>WIN</span>}
                  </div>
                </div>
                {ATTRS.map(({ key, label, unit }) => {
                  const attr = result.comparison?.[key];
                  if (!attr) return null;
                  const aWins = attr.winner === 'VEHICLE_A';
                  const bWins = attr.winner === 'VEHICLE_B';
                  return (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', padding: '11px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{label}</div>
                      <div style={{ textAlign: 'center', fontWeight: aWins ? 700 : 400, color: aWins ? 'var(--green)' : bWins ? 'var(--text3)' : 'var(--text2)', fontSize: 14 }}>
                        {aWins && <span style={{ marginRight: 4, fontSize: 11 }}>✓</span>}{attr.valueA ?? '—'}
                        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 3 }}>{unit}</span>
                      </div>
                      <div style={{ textAlign: 'center', fontWeight: bWins ? 700 : 400, color: bWins ? 'var(--blue)' : aWins ? 'var(--text3)' : 'var(--text2)', fontSize: 14 }}>
                        {bWins && <span style={{ marginRight: 4, fontSize: 11 }}>✓</span>}{attr.valueB ?? '—'}
                        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 3 }}>{unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showSaveModal && (
        <Modal onClose={() => setShowSaveModal(false)} maxWidth={420}>
          <div className="modal-title">Save Comparison</div>
          <div className="modal-sub">Give a name to this comparison</div>
          <div className="form-group">
            <label className="form-label">Title (optional)</label>
            <input className="form-input" placeholder={`${vehicleA?.brand} ${vehicleA?.model} vs ${vehicleB?.brand} ${vehicleB?.model}`}
              value={saveTitle} onChange={(e) => setSaveTitle(e.target.value)} autoFocus />
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowSaveModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveComparison} disabled={saving}>
              {saving ? <><Spinner size={14} /> Saving...</> : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}