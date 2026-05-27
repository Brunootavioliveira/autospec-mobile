import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { historyService } from '../services';
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
  ArrowRight,
  Scale,
  Wrench
} from 'lucide-react';

const TYPE_COLOR = { ANALYSIS: 'var(--blue)', COMPARISON: 'var(--orange)', SERVICE_RECORD: 'var(--green)' };
const TYPE_BG    = { ANALYSIS: 'rgba(59,130,246,.1)', COMPARISON: 'rgba(232,98,42,.1)', SERVICE_RECORD: 'rgba(34,201,122,.1)' };
const TYPE_LABEL = { ANALYSIS: 'Analysis', COMPARISON: 'Comparison', SERVICE_RECORD: 'Service' };
const TYPE_ICON  = { 
  ANALYSIS: <Activity size={18} strokeWidth={1.5} />, 
  COMPARISON: <Scale size={18} strokeWidth={1.5} />, 
  SERVICE_RECORD: <Wrench size={18} strokeWidth={1.5} /> 
};

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}

export function HistoryPage() {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ ANALYSIS: 0, COMPARISON: 0, SERVICE_RECORD: 0 });
  const [page, setPage] = useState(0);

  const load = useCallback(async (p = 0, f = 'ALL') => {
    setLoading(true);
    try {
      const data = await historyService.list(p, 15, f);
      if (p === 0) setHistory(data.content || []);
      else setHistory((h) => [...h, ...(data.content || [])]);
      setTotal(data.totalElements || 0);
      if (f === 'ALL' && p === 0) {
        const counts = { ANALYSIS: 0, COMPARISON: 0, SERVICE_RECORD: 0 };
        (data.content || []).forEach((h) => { if (counts[h.actionType] !== undefined) counts[h.actionType]++; });
        setStats(counts);
      }
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { setPage(0); load(0, filter); }, [filter]);

  const deleteEntry = async (id) => {
    try {
      await historyService.delete(id);
      setHistory((h) => h.filter((x) => x.id !== id));
      setTotal((t) => t - 1);
      toast('Entry removed', 'info');
    } catch (e) { toast(e.message, 'error'); }
  };

  const clearAll = async () => {
    if (!confirm('Clear all history? This action cannot be undone.')) return;
    try {
      await historyService.clearAll();
      setHistory([]); setTotal(0);
      toast('History cleared', 'info');
    } catch (e) { toast(e.message, 'error'); }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, filter);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="page-title">History</div>
          <div className="page-sub">All your vehicle analyses, comparisons, and service records</div>
        </div>
        {history.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={clearAll}>Clear all</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { type: 'ANALYSIS',      label: 'Analyses' },
          { type: 'COMPARISON',    label: 'Comparisons' },
          { type: 'SERVICE_RECORD',label: 'Service Records' },
        ].map(({ type, label }) => (
          <div
            key={type}
            onClick={() => setFilter((f) => f === type ? 'ALL' : type)}
            style={{
              background: 'var(--bg2)',
              border: `1px solid ${filter === type ? TYPE_COLOR[type] : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', padding: '14px 16px',
              cursor: 'pointer', transition: 'border-color .15s', userSelect: 'none',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              {TYPE_ICON[type]} {label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Barlow Condensed', color: filter === type ? TYPE_COLOR[type] : 'var(--text)' }}>
              {loading ? '—' : stats[type]}
            </div>
            {filter === type && <div style={{ fontSize: 11, color: TYPE_COLOR[type], marginTop: 4, fontWeight: 600 }}>Filtering ↑</div>}
          </div>
        ))}
        <div
          style={{
            background: 'var(--bg2)',
            border: `1px solid ${filter === 'ALL' ? 'var(--orange)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)', padding: '14px 16px',
            cursor: 'pointer', transition: 'border-color .15s',
          }}
          onClick={() => setFilter('ALL')}
        >
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Total</div>
          <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Barlow Condensed', color: filter === 'ALL' ? 'var(--orange)' : 'var(--text)' }}>
            {loading ? '—' : total}
          </div>
          {filter === 'ALL' && <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 4, fontWeight: 600 }}>All ↑</div>}
        </div>
      </div>

      <div className="table-wrap">
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>
            {total} {filter === 'ALL' ? 'records' : `${filter.toLowerCase().replace('_', ' ')} record${total !== 1 ? 's' : ''}`}
          </span>
          {filter !== 'ALL' && (
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => setFilter('ALL')}>✕ Clear filter</button>
          )}
        </div>

        {loading && page === 0 ? (
          <div style={{ padding: 16 }}>
            {[...Array(5)].map((_, i) => <Sk key={i} h={60} mb={10} />)}
          </div>
        ) : history.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><ClipboardList size={42} strokeWidth={1.5} /></div>
            <div className="empty-title">No records found</div>
          </div>
        ) : (
          <>
            {history.map((h) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, background: TYPE_BG[h.actionType] || 'var(--bg3)' }}>
                  {TYPE_ICON[h.actionType] || <ClipboardList size={18} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{h.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{h.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{relativeTime(h.createdAt)}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: TYPE_COLOR[h.actionType] }}>{TYPE_LABEL[h.actionType]}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteEntry(h.id)}>✕</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}