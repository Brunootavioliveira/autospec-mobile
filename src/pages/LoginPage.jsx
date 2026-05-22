import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/ui/Skeleton';

export function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setError('');
    setLoading(true);
    try { await login(form.email, form.password); }
    catch (err) { setError(err.message || 'Credenciais inválidas'); }
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
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Bem-vindo de volta</div>
          <div style={{ fontSize: 14, color: 'var(--text3)' }}>Acesse sua conta para continuar</div>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="seu@email.com" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>⚠ {error}</div>}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><Spinner size={16} /> Entrando...</> : 'Entrar'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text3)' }}>
          Não tem conta?{' '}
          <span style={{ color: 'var(--orange)', cursor: 'pointer', fontWeight: 600 }} onClick={onSwitch}>Criar conta</span>
        </div>
      </div>
    </div>
  );
}
