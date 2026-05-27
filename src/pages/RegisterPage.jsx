import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Skeleton';

export function RegisterPage({ onSwitch }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password.length < 8) { setError('Minimum password length: 8 characters'); return; }
    setLoading(true);
    try { await register(form.name, form.email, form.password); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="logo-title"><span className="logo-auto">Auto</span><span className="logo-spec">Spec</span></div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, letterSpacing: '.5px' }}>ADVANCED VEHICLE INTELLIGENCE</div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create account</div>
          <div style={{ fontSize: 14, color: 'var(--text3)' }}>Start analyzing vehicles with AI</div>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="John Doe" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Minimum 8 characters" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>⚠ {error}</div>}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><Spinner size={16} /> Creating account...</> : 'Sign Up'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text3)' }}>
          Already have an account?{' '}
          <span style={{ color: 'var(--orange)', cursor: 'pointer', fontWeight: 600 }} onClick={onSwitch}>Log in</span>
        </div>
      </div>
    </div>
  );
}