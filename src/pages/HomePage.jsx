import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { garageService, historyService } from '../services';
import { Sk } from '../components/ui/Skeleton';

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
  ArrowRight
} from 'lucide-react';

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

  return (
    <div className="fade-in">
      <div className="hero" style={{ marginBottom: 20 }}>
        <div className="hero-text">
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 10 }}>
            AutoSpec Intelligence Platform
          </div>
          <div className="hero-title">
            WELCOME,<br />
            <span style={{ color: 'var(--orange)' }}>{(user?.name || 'USUÁRIO').toUpperCase()}</span>
          </div>
          <div className="hero-sub" style={{ maxWidth: 380 }}>
            Sua plataforma de inteligência automotiva. Analise, compare e gerencie veículos com IA.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/analyze')}>⚡ Nova Análise</button>
            <button className="btn btn-outline" onClick={() => navigate('/compare')}>⚖ Comparar</button>
            <button className="btn btn-ghost" onClick={() => navigate('/vehicles')}>🔍 Explorar Specs</button>
          </div>
        </div>
        <svg className="hero-svg-car" viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="150" cy="212" rx="62" ry="16" fill="#e8622a" opacity="0.15"/>
          <ellipse cx="450" cy="212" rx="62" ry="16" fill="#e8622a" opacity="0.15"/>
          <path d="M40 182 Q80 172 120 162 L200 108 Q258 68 330 63 Q402 58 462 76 L542 102 Q572 116 582 142 L588 182 Q560 187 40 187 Z" fill="#e8622a" opacity="0.08" stroke="#e8622a" strokeWidth="1.2" strokeOpacity="0.35"/>
          <path d="M202 108 Q258 70 328 65 Q398 60 460 78 L536 104" stroke="#e8622a" strokeWidth="0.8" strokeOpacity="0.5" fill="none"/>
          <line x1="260" y1="68" x2="272" y2="182" stroke="#e8622a" strokeWidth="0.5" strokeOpacity="0.2"/>
          <line x1="380" y1="63" x2="368" y2="182" stroke="#e8622a" strokeWidth="0.5" strokeOpacity="0.2"/>
          <rect x="264" y="78" width="118" height="24" rx="3" fill="#e8622a" fillOpacity="0.06" stroke="#e8622a" strokeWidth="0.5" strokeOpacity="0.3"/>
          <rect x="462" y="110" width="64" height="20" rx="3" fill="#e8622a" fillOpacity="0.06" stroke="#e8622a" strokeWidth="0.5" strokeOpacity="0.25"/>
          <circle cx="150" cy="196" r="32" stroke="#e8622a" strokeWidth="1.5" strokeOpacity="0.4" fill="none"/>
          <circle cx="150" cy="196" r="20" stroke="#e8622a" strokeWidth="0.8" strokeOpacity="0.25" fill="none"/>
          <circle cx="150" cy="196" r="7" fill="#e8622a" fillOpacity="0.2"/>
          <circle cx="450" cy="196" r="32" stroke="#e8622a" strokeWidth="1.5" strokeOpacity="0.4" fill="none"/>
          <circle cx="450" cy="196" r="20" stroke="#e8622a" strokeWidth="0.8" strokeOpacity="0.25" fill="none"/>
          <circle cx="450" cy="196" r="7" fill="#e8622a" fillOpacity="0.2"/>
          <path d="M522 148 L548 138 L550 158 Z" fill="#e8622a" fillOpacity="0.3"/>
        </svg>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Garage', value: garage.length, sub: 'Veículos cadastrados', color: 'var(--text)', path: '/garage' },
          { label: 'Frota Ativa', value: activeVehicles.length, sub: insights?.mostPowerful ? `+ Potente: ${insights.mostPowerful}` : 'Veículos ativos', color: 'var(--green)', path: '/garage' },
          { label: 'Histórico', value: history?.totalElements || 0, sub: 'Ações registradas', color: 'var(--text)', path: '/history' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ cursor: 'pointer', transition: 'border-color .15s' }}
            onClick={() => navigate(s.path)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div className="stat-label">{s.label}</div>
            {loading ? <Sk h={32} w={60} mb={4} /> : <div className="stat-value" style={{ color: s.color }}>{s.value}</div>}
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-label">🛡 Acesso</div>
          <div className="stat-value" style={{ fontSize: 15, marginTop: 6, letterSpacing: 1 }}>{user?.role || '—'}</div>
          <div className="stat-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <div className="section-title">🚗 Veículos Ativos ({activeVehicles.length})</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/garage')}>Ver garage →</button>
          </div>
          {loading ? (<><Sk h={52} mb={8} /><Sk h={52} mb={8} /><Sk h={52} /></>)
            : activeVehicles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{ fontSize: 36, opacity: .2, marginBottom: 10 }}>🏎</div>
                <div style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 14 }}>Garage vazia — adicione veículos</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/garage')}>+ Adicionar</button>
              </div>
            ) : activeVehicles.slice(0, 5).map((v) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 38, height: 38, background: 'var(--bg3)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🚘</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.nickname || `${v.vehicleSpec.brand} ${v.vehicleSpec.model}`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{v.vehicleSpec.year} · {v.vehicleSpec.horsepower}HP · {v.vehicleSpec.engine}</div>
                </div>
                <span className={`badge ${v.fleetType === 'PERSONAL' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize: 10 }}>{v.fleetType}</span>
              </div>
            ))}
          {activeVehicles.length > 5 && <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', paddingTop: 10 }}>+{activeVehicles.length - 5} mais</div>}
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">🕒 Ações Recentes</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>Ver histórico →</button>
          </div>
          {loading ? (<><Sk h={52} mb={8} /><Sk h={52} mb={8} /><Sk h={52} /></>)
            : recentHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{ fontSize: 36, opacity: .2, marginBottom: 10 }}>📋</div>
                <div style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 14 }}>Nenhuma ação registrada</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/analyze')}>⚡ Iniciar análise</button>
              </div>
            ) : recentHistory.map((h) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  background: h.actionType === 'ANALYSIS' ? 'rgba(59,130,246,.1)' : h.actionType === 'COMPARISON' ? 'rgba(232,98,42,.1)' : 'rgba(34,201,122,.1)',
                }}>
                  {h.actionType === 'ANALYSIS' ? '📊' : h.actionType === 'COMPARISON' ? '⚖' : '🔧'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(h.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 2, color: h.actionType === 'ANALYSIS' ? 'var(--blue)' : h.actionType === 'COMPARISON' ? 'var(--orange)' : 'var(--green)' }}>{h.actionType}</div>
                </div>
              </div>
            ))}
          <div style={{ marginTop: 14, background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 14, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 26 }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Comparação rápida</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Compare dois veículos com análise de IA</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/compare')}>Comparar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
