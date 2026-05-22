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
    if (!confirm('Remover este veículo da garage?')) return;
    try {
      await garageService.remove(id);
      setVehicles((l) => l.filter((v) => v.id !== id));
      toast('Veículo removido', 'info');
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
      toast('Veículo atualizado! ✓', 'success');
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
    if (!addForm.vehicleSpecId) { toast('Selecione um veículo', 'error'); return; }
    setAddLoading(true);
    try {
      await garageService.add({ vehicleSpecId: +addForm.vehicleSpecId, fleetType: addForm.fleetType, nickname: addForm.nickname || null });
      setShowAddModal(false);
      setAddForm({ vehicleSpecId: '', fleetType: 'PERSONAL', nickname: '' });
      setSearchResults([]); setSearchQ('');
      await load();
      toast('Veículo adicionado à garage! ✓', 'success');
    } catch (e) { toast(e.message, 'error'); }
    finally { setAddLoading(false); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="page-title">🏎 Garage</div>
          <div className="page-sub">Gerencie seus veículos pessoais e de trabalho</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Adicionar Veículo</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">Total</div>
          <div className="stat-value">{insights?.totalVehicles ?? (loading ? '—' : vehicles.length)}</div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">Frota Ativa</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{insights?.activeFleet ?? '—'}</div>
        </div>
        <div className="stat-card" style={{ flex: 2 }}>
          <div className="stat-label">🏆 Mais Potente</div>
          <div className="stat-value" style={{ fontSize: 15, marginTop: 4 }}>{insights?.mostPowerful || '—'}</div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">Pessoal</div>
          <div className="stat-value">{vehicles.filter((v) => v.fleetType === 'PERSONAL').length}</div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">Trabalho</div>
          <div className="stat-value">{vehicles.filter((v) => v.fleetType === 'WORK').length}</div>
        </div>
      </div>

      <div className="pill-filters">
        {['ALL', 'PERSONAL', 'WORK'].map((f) => (
          <button key={f} className={`pill ${fleetFilter === f ? 'active' : ''}`} onClick={() => setFleetFilter(f)}>
            {f === 'ALL' ? '🚗 Todos' : f === 'PERSONAL' ? '👤 Pessoal' : '💼 Trabalho'}
          </button>
        ))}
        <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 'auto' }}>{filtered.length} veículo{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="grid-3"><Sk h={260} /><Sk h={260} /><Sk h={260} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏎</div>
          <div className="empty-title">Garage vazia</div>
          <div className="empty-sub">Adicione veículos para começar a gerenciar sua frota</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddModal(true)}>+ Adicionar Veículo</button>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((v) => (
            <div key={v.id} className="vehicle-card">
              <div className="vehicle-card-header">
                <div className="vehicle-icon">🚘</div>
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
                  {[['Motor', v.vehicleSpec.engine], ['Potência', `${v.vehicleSpec.horsepower} HP`], ['Torque', `${v.vehicleSpec.torque} Nm`], ['Vel. Máx.', `${v.vehicleSpec.topSpeed} km/h`]].map(([k, val]) => (
                    <div key={k} className="spec-item"><div className="spec-key">{k}</div><div className="spec-val">{val}</div></div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span className={`badge ${v.active ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>{v.active ? 'Ativo' : 'Inativo'}</span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>+{new Date(v.addedAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(v)}>✏ Editar</button>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => removeVehicle(v.id)}>✕ Remover</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} maxWidth={480}>
          <div className="modal-title">+ Adicionar Veículo</div>
          <div className="modal-sub">Busque um spec existente para adicionar à garage</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input className="form-input" placeholder="Buscar por marca, modelo..." value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchVehicles()} autoFocus />
            <button className="btn btn-outline btn-sm" onClick={searchVehicles}>Buscar</button>
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
          {addForm.vehicleSpecId && <div style={{ padding: '7px 12px', background: 'var(--orange-dim)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--orange)', marginBottom: 12, border: '1px solid rgba(232,98,42,.2)' }}>✓ ID {addForm.vehicleSpecId} selecionado</div>}
          <div className="grid-2" style={{ gap: 10, marginBottom: 4 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tipo de Frota</label>
              <select className="form-select" value={addForm.fleetType} onChange={(e) => setAddForm((f) => ({ ...f, fleetType: e.target.value }))}>
                <option value="PERSONAL">👤 Pessoal</option>
                <option value="WORK">💼 Trabalho</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Apelido (opcional)</label>
              <input className="form-input" placeholder="Ex: Meu carro" value={addForm.nickname} onChange={(e) => setAddForm((f) => ({ ...f, nickname: e.target.value }))} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={addVehicle} disabled={addLoading || !addForm.vehicleSpecId}>
              {addLoading ? <><Spinner size={14} /> Adicionando...</> : '+ Adicionar'}
            </button>
          </div>
        </Modal>
      )}

      {showEditModal && editTarget && (
        <Modal onClose={() => setShowEditModal(false)} maxWidth={400}>
          <div className="modal-title">✏ Editar Veículo</div>
          <div className="modal-sub">{editTarget.vehicleSpec.brand} {editTarget.vehicleSpec.model} {editTarget.vehicleSpec.year}</div>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{editTarget.vehicleSpec.engine}</div>
            <div style={{ color: 'var(--text3)' }}>{editTarget.vehicleSpec.horsepower}HP · {editTarget.vehicleSpec.torque}Nm · {editTarget.vehicleSpec.topSpeed}km/h</div>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Frota</label>
            <select className="form-select" value={editForm.fleetType} onChange={(e) => setEditForm((f) => ({ ...f, fleetType: e.target.value }))}>
              <option value="PERSONAL">👤 Pessoal</option>
              <option value="WORK">💼 Trabalho</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Apelido</label>
            <input className="form-input" placeholder={`${editTarget.vehicleSpec.brand} ${editTarget.vehicleSpec.model}`}
              value={editForm.nickname} onChange={(e) => setEditForm((f) => ({ ...f, nickname: e.target.value }))} autoFocus />
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Deixe em branco para usar o nome original</div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={editLoading}>
              {editLoading ? <><Spinner size={14} /> Salvando...</> : '💾 Salvar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
