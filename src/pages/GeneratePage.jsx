import { useState } from 'react';
import { vehicleService } from '../services';
import { useToast } from '../context/ToastContext';
import { RadarChart } from '../components/ui/RadarChart';
import { Spinner, Sk } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';

const SPEC_ROWS = [
  ['Engine',            (v) => v.engine],
  ['Power',             (v) => `${v.horsepower} HP`],
  ['Torque',            (v) => `${v.torque} Nm`],
  ['Drivetrain',        (v) => v.drivetrain],
  ['Top Speed',         (v) => `${v.topSpeed} km/h`],
  ['0–100 km/h',        (v) => `${v.acceleration} s`],
  ['Length',            (v) => `${v.length} m`],
  ['Width',             (v) => `${v.width} m`],
  ['Height',            (v) => `${v.height} m`],
  ['Weight',            (v) => `${v.weight} kg`],
  ['EV Range',          (v) => `${v.electricRange || 0} km`],
  ['Price',             (v) => `$ ${Number(v.price || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`],
];

function SpecCard({ v }) {
  const initials = `${v.brand?.[0] || ''}${v.model?.[0] || ''}`.toUpperCase();
  return (
    <div className="fade-in">

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-lg)',
            background: 'var(--orange-dim)', border: '1px solid rgba(232,98,42,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 900, flexShrink: 0,
            fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--orange)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 900, letterSpacing: '-.5px' }}>
              {v.brand} {v.model}
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>
              {v.year} · {v.version}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              {v.engine} · {v.drivetrain}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>
              Estimated Price
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>
              $ {Number(v.price || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Power',      value: v.horsepower, unit: 'HP',  color: 'var(--orange)' },
            { label: 'Torque',     value: v.torque,     unit: 'Nm',  color: 'var(--blue)'   },
            { label: '0–100 km/h', value: v.acceleration, unit: 's', color: 'var(--green)'  },
            { label: 'Top Speed',  value: v.topSpeed,    unit: 'km/h', color: 'var(--text)'  },
          ].map((s) => (
            <div key={s.label} className="stat-card card-sm">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22, color: s.color }}>{s.value}</div>
              <div className="stat-sub">{s.unit}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
              Performance Radar
            </div>
            <RadarChart data={v} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 12 }}>
              🔧 Full Specifications
            </div>
            <div className="grid-2">
              {SPEC_ROWS.map(([label, fn]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13,
                }}>
                  <span style={{ color: 'var(--text3)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{fn(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <Sk h={64} w={64} style={{ borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}><Sk h={28} w={220} mb={8} /><Sk h={14} w={160} /></div>
      </div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <Sk h={80} /><Sk h={80} /><Sk h={80} /><Sk h={80} />
      </div>
      <Sk h={200} />
    </div>
  );
}

export function GeneratePage() {
  const toast  = useToast();
  const { user } = useAuth();
  const canGenerate = user?.role === 'ANALYST' || user?.role === 'ADMIN';

  const [tab, setTab]         = useState('generate');
  const [form, setForm]       = useState({ brand: '', model: '', version: '', year: new Date().getFullYear() });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult]   = useState(null);

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: key === 'year' ? +e.target.value : e.target.value }));

  const generate = async () => {
    if (!form.brand || !form.model || !form.version || !form.year) {
      toast('Please fill in all fields', 'error'); return;
    }
    setGenerating(true); setResult(null);
    try {
      const data = await vehicleService.generate(form);
      setResult(data);
      toast('Specification generated! ✓', 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const search = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await vehicleService.search(searchQuery, 0, 6);
      setSearchResults(data.content || []);
    } catch {} finally { setSearching(false); }
  };

  const selectFromSearch = (v) => {
    setResult(v);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="fade-in">
      <div className="page-title">Generate Specification</div>
      <div className="page-sub">Enter vehicle details and AI will return the full technical specifications</div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="tabs" style={{ marginBottom: 18 }}>
          <button className={`tab ${tab === 'generate' ? 'active' : ''}`} onClick={() => { setTab('generate'); setResult(null); }}>
            Generate with AI
          </button>
          <button className={`tab ${tab === 'search' ? 'active' : ''}`} onClick={() => { setTab('search'); setResult(null); }}>
            Search Existing
          </button>
        </div>

        {tab === 'generate' && (
          <>
            {!canGenerate && (
              <div style={{
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: 'rgba(229,72,72,.08)', border: '1px solid rgba(229,72,72,.2)',
                color: '#e54848', fontSize: 13, marginBottom: 16,
              }}>
                ⚠ Only users with the <strong>ANALYST</strong> or <strong>ADMIN</strong> role can generate specifications. Please contact your administrator.
              </div>
            )}
            <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
              <div>
                <label className="form-label">Brand</label>
                <input className="form-input" placeholder="e.g. Toyota" value={form.brand} onChange={field('brand')} />
              </div>
              <div>
                <label className="form-label">Model</label>
                <input className="form-input" placeholder="e.g. Corolla" value={form.model} onChange={field('model')} />
              </div>
              <div>
                <label className="form-label">Version</label>
                <input className="form-input" placeholder="e.g. XEi 2.0" value={form.version} onChange={field('version')} />
              </div>
              <div>
                <label className="form-label">Year</label>
                <input className="form-input" type="number" min="1950" max="2030" value={form.year} onChange={field('year')} />
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ 
              width: '100%', 
              justifyContent: 'center',                    
              }}
              onClick={generate}
              disabled={generating || !canGenerate}
            >
              {generating ? <><Spinner size={15} /> Generating with AI...</> : 'Generate Specification'}
            </button>
          </>
        )}

        {tab === 'search' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                className="form-input"
                placeholder="Search by brand, model, version..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-outline" onClick={search} disabled={searching}>
                {searching ? <Spinner size={14} /> : 'Search'}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {searchResults.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => selectFromSearch(v)}
                    style={{
                      padding: '10px 14px', background: 'var(--bg2)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                      cursor: 'pointer', transition: 'border-color .15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--orange)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v.brand} {v.model} {v.version}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{v.year} · {v.horsepower} HP · {v.engine}</div>
                  </div>
                ))}
              </div>
            )}
            {searchResults.length === 0 && searchQuery && !searching && (
              <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>
                No results found. Try generating with AI.
              </div>
            )}
          </>
        )}
      </div>

      {generating && <LoadingSkeleton />}

      {result && !generating && <SpecCard v={result} />}
    </div>
  );
}