import { useState } from 'react';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';

export function AuthGate({ children }) {
  const [mode, setMode] = useState('login');

  return mode === 'login'
    ? <LoginPage onSwitch={() => setMode('register')} />
    : <RegisterPage onSwitch={() => setMode('login')} />;
}
