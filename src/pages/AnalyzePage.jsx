import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { analysisService, vehicleService } from '../services';
import { RadarChart } from '../components/ui/RadarChart';
import { Sk, Spinner } from '../components/ui/Skeleton';
import { CarFront, ClipboardList, BarChart, Wrench, Scale } from 'lucide-react';

export function AnalyzePage() {
  const toast = useToast();
  const [vehicleId, setVehicleId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await vehicleService.search(searchQuery, 0, 6);
      setSearchResults(data.content || []);
    } catch {} finally { setSearching(false); }
  };

  const analyze = async (id) => {
    setLoading(true); setResult(null);
    try {
      const data = await analysisService.analyze(id);
      setResult(data);
      setSearchResults([]);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const v = result?.vehicle;
  const percentiles = result ? [
    { label: 'Potência (HP)', val: result.horsepowerPercentile || 0 },
    { label: 'Vel. Máxima', val: result.topSpeedPercentile || 0 },
    { label: 'Aceleração', val: result.accelerationPercentile || 0 },
  ] : [];

  return (
    <div className="fade-in">
      <div className="page-title">Análise de Veículo</div>
      <div className="page-sub">Power-to-weight, track handling score e percentis populacionais via IA</div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Selecionar Veículo</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input className="form-input" placeholder="Buscar por marca, modelo, versão..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} style={{ flex: 1 }} />
          <button className="btn btn-outline" onClick={search} disabled={searching}>
            {searching ? <Spinner size={14} /> : 'Buscar'}
          </button>
          <input className="form-input" placeholder="ID" type="number" value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)} style={{ width: 90 }} />
          <button className="btn btn-primary" onClick={() => vehicleId && analyze(vehicleId)} disabled={loading || !vehicleId}>
            {loading ? <><Spinner size={14} /> Analisando...</> : 'Analisar'}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="inline-results">
            {searchResults.map((sv) => (
              <div key={sv.id} className="inline-result-item" onClick={() => { setVehicleId(sv.id); analyze(sv.id); }}>
                <span style={{ fontWeight: 600 }}>{sv.brand} {sv.model} {sv.version}</span>
                <span style={{ color: 'var(--text3)', marginLeft: 8 }}>{sv.year} · {sv.horsepower}HP</span>
                <span style={{ float: 'right', color: 'var(--orange)', fontSize: 12 }}>ID:{sv.id} · Analisar →</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="card"><Sk h={28} w={260} mb={16} />
          <div className="grid-4" style={{ marginBottom: 16 }}><Sk h={80} /><Sk h={80} /><Sk h={80} /><Sk h={80} /></div>
          <Sk h={180} />
        </div>
      )}

      {result && v && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, background: 'var(--blue-dim)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,52,120,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CarFront size={28} color="var(--blue)" />
              </div>              
                <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 26, fontWeight: 900, letterSpacing: '-.5px' }}>{v.brand} {v.model}</div>
                <div style={{ color: 'var(--text3)', fontSize: 13 }}>{v.year} · {v.version}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{v.engine} · {v.horsepower}HP · {v.drivetrain}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>Preço</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--orange)' }}>R$ {Number(v.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
              </div>
            </div>

            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                { label: 'Power-to-Weight', val: result.powerToWeightKgKw, unit: 'kg/kW', color: 'var(--orange)' },
                { label: 'Track Handling', val: result.trackHandlingScore, unit: 'score', color: 'var(--blue)' },
                { label: 'Potência', val: `${v.horsepower}`, unit: 'HP', color: 'var(--green)' },
                { label: '0-100 km/h', val: `${v.acceleration}`, unit: 's', color: 'var(--text)' },
              ].map((m) => (
                <div key={m.label} className="stat-card card-sm">
                  <div className="stat-label">{m.label}</div>
                  <div className="stat-value" style={{ fontSize: 22, color: m.color }}>{m.val}</div>
                  <div className="stat-sub">{m.unit}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Radar de Performance</div>
                <RadarChart data={{ ...v, trackHandlingScore: result.trackHandlingScore }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 14 }}>📈 Percentis vs. Frota Global</div>
                {percentiles.map((p) => (
                  <div key={p.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                      <span style={{ color: 'var(--text2)' }}>{p.label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--orange)' }}>Percentil {p.val}°</span>
                    </div>
                    <div className="pbar">
                      <div className="pbar-fill" style={{ width: `${p.val || 0}%`, background: p.val >= 80 ? 'var(--green)' : p.val >= 50 ? 'var(--orange)' : 'var(--red)' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                      {p.val >= 80 ? 'Melhor que a maioria dos veículos da plataforma' : p.val >= 50 ? 'Performance acima da média' : 'Abaixo da média da plataforma'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Especificações Completas</div>
            <div className="grid-2">
              {[
                ['Motor', v.engine], ['Potência', `${v.horsepower} HP`],
                ['Torque', `${v.torque} Nm`], ['Tração', v.drivetrain],
                ['Vel. Máxima', `${v.topSpeed} km/h`], ['0-100 km/h', `${v.acceleration} s`],
                ['Comprimento', `${v.length} m`], ['Largura', `${v.width} m`],
                ['Altura', `${v.height} m`], ['Peso', `${v.weight} kg`],
                ['Autonomia Elétrica', `${v.electricRange || 0} km`], ['Preço', `R$ ${Number(v.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`],
              ].map(([k, val]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text3)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
