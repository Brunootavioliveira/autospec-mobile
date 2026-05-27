import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { garageService, vehicleService } from '../services';
import { Modal } from '../components/ui/Modal';
import { Sk, Spinner } from '../components/ui/Skeleton';

export function GaragePage() {
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fleetFilter, setFleetFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ fleetType: 'PERSONAL', nickname: '' });
  const [addForm, setAddForm] = useState({ vehicleSpecId: '', fleetType: 'PERSONAL', nickname: '' });
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [g, i] = await Promise.all([garageService.list(), garageService.insights()]);
      setVehicles(Array.isArray(g) ? g : []);
      setInsights(i);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = vehicles.filter((v) => {
    if (fleetFilter === 'PERSONAL') return v.fleetType === 'PERSONAL';
    if (fleetFilter === 'WORK') return v.fleetType === 'WORK';
    return true;
  });

  const removeVehicle = async (id) => {
    if (!confirm('Remove this vehicle from your garage?')) return;
    try {
      await garageService.remove(id);
      setVehicles((l) => l.filter((v) => v.id !== id));
      toast('Vehicle removed', 'info');
      garageService.insights().then(setInsights).catch(() => {});
    } catch (e) { toast(e.message, 'error'); }
  };

  const openEdit = (v) => {
    setEditTarget(v);
    setEditForm({ fleetType: v.fleetType, nickname: v.nickname || '' });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    setEditLoading(true);
    try {
      const updated = await garageService.update(editTarget.id, editForm);
      setVehicles((l) => l.map((v) => v.id === updated.id ? updated : v));
      setShowEditModal(false);
      toast('Vehicle updated! ✓', 'success');
    } catch (e) { toast(e.message, 'error'); }
    finally { setEditLoading(false); }
  };

  const searchVehicles = async () => {
    if (!searchQ) return;
    try {
      const d = await vehicleService.search(searchQ, 0, 6);
      setSearchResults(d.content || []);
    } catch {}
  };

  const addVehicle = async () => {
    if (!addForm.vehicleSpecId) { toast('Please select a vehicle', 'error'); return; }
    setAddLoading(true);
    try {
      await garageService.add({ vehicleSpecId: +addForm.vehicleSpecId, fleetType: addForm.fleetType, nickname: addForm.nickname || null });
      setShowAddModal(false);
      setAddForm({ vehicleSpecId: '', fleetType: 'PERSONAL', nickname: '' });
      setSearchResults([]); setSearchQ('');
      await load();
      toast('Vehicle added to garage! ✓', 'success');
    } catch (e) { toast(e.message, 'error'); }
    finally { setAddLoading(false); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="page-title">Garage</div>
          <div className="page-sub">Manage your personal and work vehicles</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Vehicle</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{insights?.totalVehicles ?? (loading ? '—' : vehicles.length)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Fleet</div>
          <div className="stat-value">{insights?.activeFleet ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Most Powerful</div>
          <div className="stat-value" style={{ fontSize: 15, marginTop: 4 }}>{insights?.mostPowerful || '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Personal</div>
          <div className="stat-value">{vehicles.filter((v) => v.fleetType === 'PERSONAL').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Work</div>
          <div className="stat-value">{vehicles.filter((v) => v.fleetType === 'WORK').length}</div>
        </div>
      </div>

      <div className="pill-filters">
        {['ALL', 'PERSONAL', 'WORK'].map((f) => (
          <button key={f} className={`pill ${fleetFilter === f ? 'active' : ''}`} onClick={() => setFleetFilter(f)}>
            {f === 'ALL' ? 'All' : f === 'PERSONAL' ? 'Personal' : 'Work'}
          </button>
        ))}
        <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 'auto' }}>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="grid-3"><Sk h={260} /><Sk h={260} /><Sk h={260} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏎</div>
          <div className="empty-title">Garage is empty</div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowAddModal(true)}>+ Add Vehicle</button>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((v) => (
            <div key={v.id} className="vehicle-card">
              <div className="vehicle-card-header">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.nickname || `${v.vehicleSpec.brand} ${v.vehicleSpec.model}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{v.vehicleSpec.year} · {v.vehicleSpec.version}</div>
                </div>
                <span className={`badge ${v.fleetType === 'PERSONAL' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize: 10 }}>{v.fleetType}</span>
              </div>
              <div className="vehicle-card-body">
                <div className="spec-grid" style={{ marginBottom: 12 }}>
                  {[['Engine', v.vehicleSpec.engine], ['Power', `${v.vehicleSpec.horsepower} HP`], ['Torque', `${v.vehicleSpec.torque} Nm`], ['Top Speed', `${v.vehicleSpec.topSpeed} km/h`]].map(([k, val]) => (
                    <div key={k} className="spec-item"><div className="spec-key">{k}</div><div className="spec-val">{val}</div></div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span className={`badge ${v.active ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>{v.active ? 'Active' : 'Inactive'}</span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>+{new Date(v.addedAt).toLocaleDateString('en-US')}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(v)}>✏ Edit</button>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => removeVehicle(v.id)}>✕ Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} maxWidth={480}>
          <div className="modal-title">+ Add Vehicle</div>
          <div className="modal-sub">Search an existing specification to add to your garage</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input className="form-input" placeholder="Search by brand, model..." value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchVehicles()} autoFocus />
            <button className="btn btn-outline btn-sm" onClick={searchVehicles}>Search</button>
          </div>
          {searchResults.length > 0 && (
            <div className="inline-results" style={{ marginBottom: 12 }}>
              {searchResults.map((v) => (
                <div key={v.id} className={`inline-result-item ${addForm.vehicleSpecId === v.id ? 'selected-item' : ''}`}
                  onClick={() => setAddForm((f) => ({ ...f, vehicleSpecId: v.id }))}>
                  <span style={{ fontWeight: 600 }}>{v.brand} {v.model} {v.version}</span>
                  <span style={{ color: 'var(--text3)', marginLeft: 8 }}>{v.year} · {v.horsepower}HP</span>
                  {addForm.vehicleSpecId === v.id && <span style={{ marginLeft: 8 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
          {addForm.vehicleSpecId && <div style={{ padding: '7px 12px', background: 'var(--orange-dim)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--orange)', marginBottom: 12, border: '1px solid rgba(232,98,42,.2)' }}>✓ ID {addForm.vehicleSpecId} selected</div>}
          <div className="grid-2" style={{ gap: 10, marginBottom: 4 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fleet Type</label>
              <select className="form-select" value={addForm.fleetType} onChange={(e) => setAddForm((f) => ({ ...f, fleetType: e.target.value }))}>
                <option value="PERSONAL">Personal</option>
                <option value="WORK">Work</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Nickname (optional)</label>
              <input className="form-input" placeholder="e.g. My Daily Car" value={addForm.nickname} onChange={(e) => setAddForm((f) => ({ ...f, nickname: e.target.value }))} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={addVehicle} disabled={addLoading || !addForm.vehicleSpecId}>
              {addLoading ? <><Spinner size={14} /> Adding...</> : '+ Add Vehicle'}
            </button>
          </div>
        </Modal>
      )}

      {showEditModal && editTarget && (
        <Modal onClose={() => setShowEditModal(false)} maxWidth={400}>
          <div className="modal-title">✏ Edit Vehicle</div>
          <div className="modal-sub">{editTarget.vehicleSpec.brand} {editTarget.vehicleSpec.model} {editTarget.vehicleSpec.year}</div>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{editTarget.vehicleSpec.engine}</div>
            <div style={{ color: 'var(--text3)' }}>{editTarget.vehicleSpec.horsepower}HP · {editTarget.vehicleSpec.torque}Nm · {editTarget.vehicleSpec.topSpeed}km/h</div>
          </div>
          <div className="form-group">
            <label className="form-label">Fleet Type</label>
            <select className="form-select" value={editForm.fleetType} onChange={(e) => setEditForm((f) => ({ ...f, fleetType: e.target.value }))}>
              <option value="PERSONAL">Personal</option>
              <option value="WORK">Work</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nickname</label>
            <input className="form-input" placeholder={`${editTarget.vehicleSpec.brand} ${editTarget.vehicleSpec.model}`}
              value={editForm.nickname} onChange={(e) => setEditForm((f) => ({ ...f, nickname: e.target.value }))} autoFocus />
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Leave blank to use the original model name</div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={editLoading}>
              {editLoading ? <><Spinner size={14} /> Saving...</> : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}