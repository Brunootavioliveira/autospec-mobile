import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MAIN_NAV = [
  { id: '/',          label: 'Home',        icon: '🏠' },
  { id: '/vehicles',  label: 'Veículos',    icon: '🔍' },
  { id: '/generate',  label: 'Gerar Spec',  icon: '⚡' },
  { id: '/compare',   label: 'Comparar',    icon: '⚖'  },
  { id: '/analyze',   label: 'Analisar',    icon: '📊' },
  { id: '/garage',    label: 'Garage',      icon: '🚗' },
  { id: '/history',   label: 'Histórico',   icon: '🕒' },
  { id: '/reports',   label: 'Relatórios',  icon: '📋' },
];

const BOTTOM_NAV = [
  { id: '/settings', label: 'Configurações', icon: '⚙' },
];

const ADMIN_NAV = [
  { id: '/admin', label: 'Usuários', icon: '👥' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'ADMIN';

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-title">
          <span className="logo-auto">Auto</span>
          <span className="logo-spec">Spec</span>
        </div>
        <div className="logo-sub">ADVANCED VEHICLE INTELLIGENCE</div>
      </div>

      <nav className="nav">
        {MAIN_NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${isActive(item.id) ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }} />

        {BOTTOM_NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${isActive(item.id) ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {isAdmin && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }} />
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '.8px', padding: '4px 12px', textTransform: 'uppercase' }}>
              Admin
            </div>
            {ADMIN_NAV.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${isActive(item.id) ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 8px', cursor: 'pointer' }}
          onClick={() => navigate('/settings')}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--orange),#c44)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, flexShrink: 0, letterSpacing: '.5px',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center', marginTop: 2, color: 'var(--red)', opacity: .8 }}
          onClick={logout}
        >
          ↩ Sair
        </button>
      </div>
    </div>
  );
}