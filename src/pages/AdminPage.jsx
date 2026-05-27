import { useState, useEffect } from 'react';
import { userService } from '../services';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/ui/Skeleton';
import { Search } from 'lucide-react';

const ROLES = ['VIEWER', 'ANALYST', 'ADMIN'];

const ROLE_BADGE = {
  ADMIN:   { bg: 'rgba(229,72,72,0.15)',   color: '#e54848', label: 'Admin' },
  ANALYST: { bg: 'rgba(255,140,50,0.15)',  color: 'var(--orange)', label: 'Analyst' },
  VIEWER:  { bg: 'rgba(100,200,100,0.12)', color: '#6bbf6b', label: 'Viewer' },
};

function RoleBadge({ role }) {
  const s = ROLE_BADGE[role] || ROLE_BADGE.VIEWER;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: '.5px',
    }}>
      {s.label}
    </span>
  );
}

export function AdminPage() {
  const toast = useToast();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    userService.listAll()
      .then(setUsers)
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId);
    try {
      await userService.updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, role: newRole } : u)
      );
      toast('Role updated successfully', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fade-in">
      <div className="page-title">User Management</div>
      <div className="page-sub">Assign roles and permissions to registered users</div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {Object.entries(ROLE_BADGE).map(([role, s]) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div key={role} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{count}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{s.label}s</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div style={{ marginBottom: 20, position: 'relative', width: '100%', maxWidth: 340 }}>
          <span style={{ 
            position: 'absolute', 
            left: 12, 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text3)', 
            display: 'flex', 
            alignItems: 'center',
            pointerEvents: 'none' 
          }}>
            <Search size={16} strokeWidth={1.8} />
          </span>

          <input
            className="form-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              paddingLeft: 36
            }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text3)', padding: 24 }}>
            <Spinner size={18} /> Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ color: 'var(--text3)', padding: 24 }}>No users found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', borderRadius: 10,
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,var(--orange),#c44)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {initials(u.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.email}
                  </div>
                </div>

                <RoleBadge role={u.role} />

                <select
                  className="form-select"
                  value={u.role}
                  disabled={saving === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  style={{ width: 130, fontSize: 13 }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                {saving === u.id && <Spinner size={16} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}