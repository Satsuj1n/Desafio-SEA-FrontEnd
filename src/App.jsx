import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import ClientListPage from './pages/ClientListPage';

export default function App() {
  return (
    <AntApp>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/clients" replace />} />
              <Route path="clients" element={<ClientListPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/clients" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </AntApp>
  );
}
