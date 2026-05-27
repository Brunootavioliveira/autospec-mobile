import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services';
import { Sk, Spinner } from '../components/ui/Skeleton';

export function SettingsPage() {
  const { user, logout, refreshProfile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tab === 'security') {
      setLoadingSessions(true);
      userService.sessions().then((d) => setSessions(d || [])).catch(() => {}).finally(() => setLoadingSessions(false));
    }
  }, [tab]);

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await userService.update({ name: profile.name });
      await refreshProfile();
      toast('Profile updated!', 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmNewPassword) { toast('Passwords do not match', 'error'); return; }
    if (pwd.newPassword.length < 8) { toast('Minimum password length: 8 characters', 'error'); return; }
    setSaving(true);
    try {
      await userService.changePassword(pwd);
      toast('Password changed! ✓', 'success');
      setPwd({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const revokeSession = async (id) => {
    try {
      await userService.revokeSession(id);
      setSessions((s) => s.filter((x) => x.id !== id));
      toast('Session terminated', 'info');
    } catch (err) { toast(err.message, 'error'); }
  };

  const revokeAll = async () => {
    try {
      await userService.revokeAllSessions();
      setSessions((s) => s.filter((x) => x.currentSession));
      toast('Other sessions terminated', 'info');
    } catch (err) { toast(err.message, 'error'); }
  };

  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fade-in">
      <div className="page-title">Settings</div>
      <div className="page-sub">Manage your profile, security, and active sessions</div>

      <div className="tabs" style={{ maxWidth: 500 }}>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
        <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Password & Sessions</button>
      </div>

      {tab === 'profile' && (
        <div className="grid-2">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,var(--orange),#c44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>{user?.email}</div>
                <span className="badge badge-blue" style={{ marginTop: 4 }}>{user?.role}</span>
              </div>
            </div>
            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  minLength={2} maxLength={100} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" value={user?.email || ''} disabled style={{ opacity: .5, cursor: 'not-allowed' }} />
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Email cannot be changed</div>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" value={user?.role || ''} disabled style={{ opacity: .5, cursor: 'not-allowed' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}> 
                  {saving ? <><Spinner size={14} /> Saving...</> : 'Save changes'}
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={logout}>Log out</button>
              </div>
            </form>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Account Details</div>
            {[
              ['User ID', '•••• (protected)'],
              ['Email Address', user?.email],
              ['Role', user?.role],
              ['Platform', 'AutoSpec AI v1.0'],
              ['Backend Stack', 'Spring Boot 3 + JWT'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--text3)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="grid-2">
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Change Password</div>
            <form onSubmit={changePwd}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={pwd.currentPassword} onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Min. 8 characters"
                  value={pwd.newPassword} onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} required minLength={6} />
                <div className={`pwd-req ${pwd.newPassword.length >= 8 ? 'ok' : ''}`}>
                  {pwd.newPassword.length >= 8 ? '✓' : '○'} Minimum 8 characters
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" placeholder="Repeat new password"
                  value={pwd.confirmNewPassword} onChange={(e) => setPwd((p) => ({ ...p, confirmNewPassword: e.target.value }))} required />
                {pwd.confirmNewPassword && (
                  <div className={`pwd-req ${pwd.newPassword === pwd.confirmNewPassword ? 'ok' : ''}`}>
                    {pwd.newPassword === pwd.confirmNewPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                {saving ? <><Spinner size={14} /> Saving...</> : 'Update password'}
              </button>
            </form>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="section-title">Active Sessions</div>
              {sessions.length > 1 && (
                <button className="btn btn-danger btn-sm" onClick={revokeAll}>Revoke others</button>
              )}
            </div>
            {loadingSessions ? (
              <><Sk h={60} mb={8} /><Sk h={60} /></>
            ) : sessions.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 14 }}>No active sessions found</div>
            ) : sessions.map((s) => (
              <div key={s.id} className="session-row">
                <div className="session-icon">{s.currentSession ? '💻' : '📱'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.deviceInfo || 'Unknown device'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {s.ipAddress} · {s.browserApp} · {new Date(s.lastActive).toLocaleDateString('en-US')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {s.currentSession
                    ? <span className="badge badge-green">Current</span>
                    : <button className="btn btn-danger btn-sm" onClick={() => revokeSession(s.id)}>Revoke</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}