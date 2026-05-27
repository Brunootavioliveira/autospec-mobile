import { useState } from 'react';
import { vehicleService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../ui/Skeleton';

import {
  Zap,
  CarFront,
  ClipboardList,
  Shield,
  Activity,
  Clock3,
  Plus,
  Sparkles,
  Search,
  ArrowRight,
  BarChart, 
  Wrench,   
  Scale
} from 'lucide-react';

export function VehicleSpecForm({ label, onSelect, selected, onClear }) {
  const [form, setForm] = useState({ brand: '', model: '', version: '', year: new Date().getFullYear() });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState('search');
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  const search = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await vehicleService.search(searchQuery, 0, 5);
      setSearchResults(data.content || []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const generate = async () => {
    if (!form.brand || !form.model || !form.version || !form.year) {
      toast('Please fill out all fields', 'error'); return;
    }
    setGenerating(true);
    try {
      const data = await vehicleService.generate(form);
      onSelect(data);
      toast('Spec generated with AI! ✓', 'success');
    } catch (e) { toast(e.message, 'error'); }
    finally { setGenerating(false); }
  };

  if (selected) return (
    <div className="compare-slot filled">
      <div style={{ color: 'var(--orange)', marginBottom: 4 }}>
        <CarFront size={32} strokeWidth={1.5} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.brand} {selected.model}</div>
      <div style={{ fontSize: 13, color: 'var(--orange)' }}>{selected.year} · {selected.version}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{selected.horsepower}HP · {selected.engine}</div>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={onClear}>Change vehicle ↺</button>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}</div>
      <div className="tabs" style={{ marginBottom: 14 }}>
        <button 
          className={`tab ${mode === 'search' ? 'active' : ''}`} 
          onClick={() => setMode('search')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Search size={14} /> Search Existing
        </button>        
        <button className={`tab ${mode === 'generate' ? 'active' : ''}`} onClick={() => setMode('generate')}>Generate with AI</button>
      </div>
      {mode === 'search' ? (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input className="form-input" placeholder="Search by brand, model..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
            <button className="btn btn-primary btn-sm" onClick={search} disabled={searching}>
              {searching ? <Spinner size={14} /> : 'Search'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {searchResults.map((v) => (
                <div key={v.id} onClick={() => onSelect(v)}
                  style={{ padding: '10px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'border-color .15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--orange)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{v.brand} {v.model} {v.version}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{v.year} · {v.horsepower}HP</div>
                </div>
              ))}
            </div>
          )}
          {searchResults.length === 0 && searchQuery && !searching && (
            <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '12px 0' }}>
              No results found. Try generating with AI.
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid-2" style={{ gap: 8, marginBottom: 8 }}>
            <div>
              <label className="form-label">Brand</label>
              <input className="form-input" placeholder="Toyota" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Model</label>
              <input className="form-input" placeholder="Corolla" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
            </div>
          </div>
          <div className="grid-2" style={{ gap: 8, marginBottom: 12 }}>
            <div>
              <label className="form-label">Version</label>
              <input className="form-input" placeholder="XEi" value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Year</label>
              <input className="form-input" type="number" min="1900" max="2030" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={generate} disabled={generating}>
            {generating ? <><Spinner size={14} /> Generating with AI...</> : 'Generate Specification'}
          </button>
        </>
      )}
    </div>
  );
}