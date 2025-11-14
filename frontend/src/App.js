import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout/Layout';
import Clientes from './pages/Clientes';
import Prestamos from './pages/Prestamos';
import Pagos from './pages/Pagos';
import Solicitudes from './pages/Solicitudes';
import Garantes from './pages/Garantes';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import Notificaciones from './pages/Notificaciones';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Cargando...</div>
    </div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/clientes" element={
                <ProtectedRoute>
                  <Layout>
                    <Clientes />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/prestamos" element={
                <ProtectedRoute>
                  <Layout>
                    <Prestamos />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/pagos" element={
                <ProtectedRoute>
                  <Layout>
                    <Pagos />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/solicitudes" element={
                <ProtectedRoute>
                  <Layout>
                    <Solicitudes />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/garantes" element={
                <ProtectedRoute>
                  <Layout>
                    <Garantes />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/usuarios" element={
                <ProtectedRoute>
                  <Layout>
                    <Usuarios />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/configuracion" element={
                <ProtectedRoute>
                  <Layout>
                    <Configuracion />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/notificaciones" element={
                <ProtectedRoute>
                  <Layout>
                    <Notificaciones />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorProvider>
  );
}

export default App;