import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { HomePage }     from './pages/HomePage';
import { VehiclesPage } from './pages/VehiclesPage';
import { ComparePage }  from './pages/ComparePage';
import { AnalyzePage }  from './pages/AnalyzePage';
import { GaragePage }   from './pages/GaragePage';
import { HistoryPage }  from './pages/HistoryPage';
import { ReportsPage }  from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage }    from './pages/AdminPage';
import { GeneratePage } from './pages/GeneratePage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/"          element={<HomePage />} />
                <Route path="/vehicles"  element={<VehiclesPage />} />
                <Route path="/compare"   element={<ComparePage />} />
                <Route path="/analyze"   element={<AnalyzePage />} />
                <Route path="/garage"    element={<GaragePage />} />
                <Route path="/history"   element={<HistoryPage />} />
                <Route path="/reports"   element={<ReportsPage />} />
                <Route path="/settings"  element={<SettingsPage />} />
                <Route path="/admin"     element={<AdminPage />} />
                <Route path="/generate" element={<GeneratePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}