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
    if (form.password.length < 8) { setError('Senha mínima: 8 caracteres'); return; }
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
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Criar conta</div>
          <div style={{ fontSize: 14, color: 'var(--text3)' }}>Comece a analisar veículos com IA</div>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input className="form-input" placeholder="João Silva" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="seu@email.com" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input className="form-input" type="password" placeholder="Mínimo 8 caracteres" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>⚠ {error}</div>}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><Spinner size={16} /> Criando...</> : 'Criar conta'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text3)' }}>
          Já tem conta?{' '}
          <span style={{ color: 'var(--orange)', cursor: 'pointer', fontWeight: 600 }} onClick={onSwitch}>Entrar</span>
        </div>
      </div>
    </div>
  );
}