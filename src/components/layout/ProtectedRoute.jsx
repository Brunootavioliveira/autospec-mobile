import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthGate } from './AuthGate';

export function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) return <AuthGate />;
  return <Outlet />;
}
