import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vehicleService } from '../../services';
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
  Scale,
  Menu
} from 'lucide-react';

export function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const debounce = useRef(null);

  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await vehicleService.search(searchQuery.trim(), 0, 6);
        setSearchResults(data.content || []);
        setSearchOpen(true);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 320);
    return () => clearTimeout(debounce.current);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.querySelector('input')?.focus(); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const goTo = (path) => { navigate(path); setSearchQuery(''); setSearchOpen(false); };

  return (
    <div className="topbar">
      <button className="hamburger" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={22} />
      </button>

      <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 520 }}>
        <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text3)', display: 'flex', alignItems: 'center' }}>
          {searchLoading ? <Spinner size={13} /> : <Search size={16} />}
        </span>
        <input
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 60px 8px 34px', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, outline: 'none', transition: 'border .15s' }}
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
        />
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text3)', background: 'var(--bg4)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)', pointerEvents: 'none', letterSpacing: '.3px' }}>
          ⌘K
        </span>

        {searchOpen && searchResults.length > 0 && (
          <div className="search-dropdown">
            <div style={{ padding: '7px 14px 5px', fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid var(--border)' }}>
              Vehicles Found
            </div>
            {searchResults.map((v) => (
              <div key={v.id} className="search-result-item" onClick={() => goTo('/vehicles')}>
                <div style={{ width: 32, height: 32, background: 'var(--bg3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CarFront size={16} color="var(--text2)" /> 
                </div>                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.brand} {v.model} {v.version}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{v.year} · {v.horsepower}HP</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--orange)', flexShrink: 0 }}>ID:{v.id}</div>
              </div>
            ))}
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => goTo('/vehicles')}>
                View all →
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSearchOpen(false)}>✕</button>
            </div>
          </div>
        )}
      </div>

      <div className="user-area">
        <div className="user-avatar" onClick={() => goTo('/settings')} title="Settings">
          {initials}
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => goTo('/settings')}>
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
      </div>
    </div>
  );
}