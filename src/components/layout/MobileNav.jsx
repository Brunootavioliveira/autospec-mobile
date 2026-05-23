import { useNavigate, useLocation } from 'react-router-dom';
import { House, Search, GitCompareArrows, CarFront, Menu } from 'lucide-react';

const NAV = [
  { id: '/',         label: 'Home',     icon: House },
  { id: '/vehicles', label: 'Buscar',   icon: Search },
  { id: '/compare',  label: 'Comparar', icon: GitCompareArrows },
  { id: '/garage',   label: 'Garage',   icon: CarFront },
  { id: '/settings', label: 'Mais',     icon: Menu },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="mobile-nav">
      {NAV.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`mobile-nav-item ${isActive(id) ? 'active' : ''}`}
          onClick={() => navigate(id)}
          aria-label={label}
        >
          <span className="mobile-nav-icon">
            <Icon size={20} strokeWidth={1.8} />
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
