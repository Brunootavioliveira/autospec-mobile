import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { reportService, vehicleService } from '../services';
import { Spinner } from '../components/ui/Skeleton';

const DEFAULT_PARAMS = { ENGINE: true, PERFORMANCE: true, PRICE: true, SAFETY: false };
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

function VehicleSearchInput({ label, value, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async () => {
    if (!query.trim()) return;
    try {
      const d = await vehicleService.search(query, 0, 5);
      setResults(d.content || []);
    } catch {}
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <input className="form-input" placeholder={`Buscar ${label}...`} value={query}
          onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
        <button className="btn btn-outline btn-sm" onClick={search}>🔍</button>
      </div>
      {results.length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 6 }}>
          {results.map((v) => (
            <div key={v.id}
              onClick={() => { onSelect(v); setResults([]); setQuery(''); }}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              {v.brand} {v.model} {v.version} · {v.year}
            </div>
          ))}
        </div>
      )}
      {value && <div style={{ fontSize: 12, color: 'var(--orange)' }}>✓ {value.brand} {value.model} {value.year} (ID:{value.id})</div>}
    </div>
  );
}

export function ReportsPage() {
  const toast = useToast();
  const [tab, setTab] = useState('comparison');
  const [vehicleA, setVehicleA] = useState(null);
  const [vehicleB, setVehicleB] = useState(null);
  const [dossierVehicle, setDossierVehicle] = useState(null);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [generating, setGenerating] = useState(false);
  const [reportMeta, setReportMeta] = useState(null);

  const generateComparison = async () => {
    if (!vehicleA || !vehicleB) { toast('Selecione os dois veículos', 'error'); return; }
    setGenerating(true); setReportMeta(null);
    try {
      const data = await reportService.generateComparison(vehicleA.id, vehicleB.id, params);
      setReportMeta(data);
      toast('PDF gerado com sucesso! ✓', 'success');
    } catch (e) { toast(e.message, 'error'); }
    finally { setGenerating(false); }
  };

  const generateDossier = async () => {
    if (!dossierVehicle) { toast('Selecione um veículo', 'error'); return; }
    setGenerating(true); setReportMeta(null);
    try {
      const data = await reportService.generateDossier(dossierVehicle.id);
      setReportMeta(data);
      toast('Dossier gerado com sucesso! ✓', 'success');
    } catch (e) { toast(e.message, 'error'); }
    finally { setGenerating(false); }
  };

  const downloadReport = async () => {
  if (!reportMeta?.downloadUrl) return;
  try {
    let pathname = reportMeta.downloadUrl;
    if (pathname.startsWith('http')) {
      pathname = new URL(pathname).pathname;
    }
    const path = pathname.replace('/api/v1', '');
    console.log('path final:', path);
    const response = await reportService.download(path);
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'report.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.error('ERRO DOWNLOAD:', e);
    toast('Erro ao baixar PDF', 'error');
  }
};

  return (
    <div className="fade-in">
      <div className="page-title">📋 Relatórios</div>
      <div className="page-sub">Gere relatórios PDF detalhados com análise de IA</div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { id: 'comparison', icon: '⚖', title: 'Comparison Report', desc: 'Comparação técnica completa em PDF' },
          { id: 'dossier', icon: '📄', title: 'Vehicle Dossier', desc: 'Dossier completo de um único veículo' },
        ].map((r) => (
          <div key={r.id} className={`report-card ${tab === r.id ? 'selected' : ''}`} style={{ flex: 1 }}
            onClick={() => { setTab(r.id); setReportMeta(null); }}>
            <div className="report-icon">{r.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div>
          {tab === 'comparison' ? (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="report-icon" style={{ margin: 0 }}>⚖</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Comprehensive Comparison Report</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>Comparação técnica completa em PDF</div>
                </div>
              </div>

              <VehicleSearchInput label="Veículo A" value={vehicleA} onSelect={setVehicleA} />
              <VehicleSearchInput label="Veículo B" value={vehicleB} onSelect={setVehicleB} />

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Parâmetros de Comparação</label>
                <div className="param-checks">
                  {Object.keys(params).map((p) => (
                    <label key={p} className="checkbox-label">
                      <input type="checkbox" checked={params[p]} onChange={(e) => setParams((prev) => ({ ...prev, [p]: e.target.checked }))} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
                onClick={generateComparison} disabled={generating || !vehicleA || !vehicleB}>
                {generating ? <><Spinner size={16} /> Gerando PDF...</> : '📋 Gerar Relatório'}
              </button>
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="report-icon" style={{ margin: 0 }}>📄</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Vehicle History Dossier</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>Dossier completo de um único veículo</div>
                </div>
              </div>

              <VehicleSearchInput label="Veículo" value={dossierVehicle} onSelect={setDossierVehicle} />

              <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
                onClick={generateDossier} disabled={generating || !dossierVehicle}>
                {generating ? <><Spinner size={16} /> Gerando PDF...</> : '📋 Gerar Dossier'}
              </button>
            </div>
          )}
        </div>

        <div>
          {generating ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--orange-dim)', border: '1px solid rgba(232,98,42,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spinner size={24} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Gerando relatório PDF...</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>A IA está processando os dados. Aguarde.</div>
              </div>
            </div>
          ) : reportMeta ? (
            <div className="card fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(34,201,122,.07)', border: '1px solid rgba(34,201,122,.2)', borderRadius: 'var(--radius-lg)', marginBottom: 16 }}>
                <div style={{ fontSize: 24 }}>✅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>PDF gerado com sucesso!</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>Pronto para download</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={downloadReport}>⬇ Download PDF</button>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Detalhes do Relatório</div>
                {[
                  ['Título', reportMeta.title],
                  ['Tipo', reportMeta.reportType],
                  ['ID', reportMeta.reportId],
                  ['Gerado em', new Date(reportMeta.generatedAt || Date.now()).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text3)' }}>{k}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--orange-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(232,98,42,.2)', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>URL de Download</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text2)', wordBreak: 'break-all', lineHeight: 1.5 }}>http://localhost:8081{reportMeta.downloadUrl}</div>
              </div>

              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
                ⚠ O link pode expirar após o primeiro download
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={downloadReport}>⬇ Download PDF</button>
                <button className="btn btn-outline btn-sm" onClick={() => setReportMeta(null)}>Novo relatório</button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, border: '2px dashed var(--border)', gap: 12 }}>
              <div style={{ width: 64, height: 64, background: 'var(--bg3)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, opacity: .4 }}>📋</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text2)' }}>Preview do Relatório</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', maxWidth: 240, lineHeight: 1.6 }}>
                Configure os parâmetros ao lado e clique em "Gerar Relatório"
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {['Engine', 'Performance', 'Price', 'Safety'].map((p) => (
                  <span key={p} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                    {params[p.toUpperCase()] ? '✓ ' : ''}{p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
