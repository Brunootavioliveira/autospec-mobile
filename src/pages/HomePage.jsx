import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { garageService, historyService } from '../services';
import { Sk } from '../components/ui/Skeleton';
import iconeCarro from '../components/assets/vs.png';
import { CarouselHeader } from '../components/ui/CarouselHeader';
import { CarFront, ClipboardList, BarChart, Wrench, Scale } from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [garage, setGarage] = useState([]);
  const [history, setHistory] = useState({ content: [], totalElements: 0 });
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      garageService.list().catch(() => []),
      historyService.list(0, 5).catch(() => ({ content: [], totalElements: 0 })),
      garageService.insights().catch(() => null),
    ]).then(([g, h, i]) => {
      setGarage(Array.isArray(g) ? g : []);
      setHistory(h || { content: [], totalElements: 0 });
      setInsights(i);
    }).finally(() => setLoading(false));
  }, []);

  const activeVehicles = garage.filter((v) => v.active);
  const recentHistory = history?.content || [];

  const stats = [
    { label: 'Garage', value: garage.length, sub: 'Veículos cadastrados', path: '/garage' },
    { label: 'Frota Ativa', value: activeVehicles.length, sub: insights?.mostPowerful ? `+ Potente: ${insights.mostPowerful}` : 'Veículos ativos', path: '/garage' },
    { label: 'Histórico', value: history?.totalElements || 0, sub: 'Ações registradas', path: '/history' },
    { label: 'Acesso', value: user?.role || '—', sub: user?.email, path: '/settings', isText: true },
  ];

  return (
    <div className="fade-in">
      <CarouselHeader />

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ cursor: 'pointer', transition: 'border-color .15s' }}
            onClick={() => navigate(s.path)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div className="stat-label">{s.label}</div>
            {loading ? (
              <Sk h={32} w={60} mb={4} />
            ) : (
              <div className="stat-value" style={s.isText ? { fontSize: 14, marginTop: 6, letterSpacing: 1 } : {}}>
                {s.value}
              </div>
            )}
            <div className="stat-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <div className="section-title">Veículos Ativos ({activeVehicles.length})</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/garage')}>Ver garage →</button>
          </div>
          {loading ? (
            <><Sk h={52} mb={8} /><Sk h={52} mb={8} /><Sk h={52} /></>
          ) : activeVehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 36, opacity: .2, marginBottom: 10 }}>🏎</div>
              <div style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 14 }}>Garage vazia — adicione veículos</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/garage')}>+ Adicionar</button>
            </div>
          ) : activeVehicles.slice(0, 5).map((v) => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 38, height: 38, background: 'var(--bg3)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', flexShrink: 0 }}>
                <CarFront size={20} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.nickname || `${v.vehicleSpec.brand} ${v.vehicleSpec.model}`}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{v.vehicleSpec.year} · {v.vehicleSpec.horsepower}HP</div>
              </div>
              <span className={`badge ${v.fleetType === 'PERSONAL' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize: 10 }}>
                {v.fleetType}
              </span>
            </div>
          ))}
          {activeVehicles.length > 5 && (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', paddingTop: 10 }}>
              +{activeVehicles.length - 5} mais
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">Ações Recentes</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>Ver histórico →</button>
          </div>
          {loading ? (
            <><Sk h={52} mb={8} /><Sk h={52} mb={8} /><Sk h={52} /></>
          ) : recentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 36, opacity: .2, marginBottom: 10 }}><ClipboardList size={42} /></div>
              <div style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 14 }}>Nenhuma ação registrada</div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/analyze')}>Iniciar análise</button>
            </div>
          ) : recentHistory.map((h) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                background: h.actionType === 'ANALYSIS' ? 'rgba(59,130,246,.1)' : h.actionType === 'COMPARISON' ? 'rgba(232,98,42,.1)' : 'rgba(34,201,122,.1)',
              }}>
                {h.actionType === 'ANALYSIS' ? <BarChart size={18} /> : h.actionType === 'COMPARISON' ? <Scale size={18} /> : <Wrench size={18} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.description}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(h.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 2, color: h.actionType === 'ANALYSIS' ? 'var(--blue)' : h.actionType === 'COMPARISON' ? 'var(--orange)' : 'var(--green)' }}>
                  {h.actionType}
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 14, background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 14, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={iconeCarro} alt="Comparativo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Comparação rápida</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Compare dois veículos com análise de IA</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/compare')} style={{ flexShrink: 0 }}>
              Comparar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}