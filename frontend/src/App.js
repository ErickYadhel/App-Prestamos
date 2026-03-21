import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
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
import Perfil from './pages/Usuarios';
import ErrorBoundary from './components/ErrorBoundary';
import Informacion from './pages/Informacion'; // 👈 NUEVA IMPORTACIÓN

// 👇 NUEVAS IMPORTACIONES
import Operaciones from './pages/Operaciones';
import Seguridad from './pages/Seguridad';

// Componente de carga mejorado
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-black">
    <div className="text-center">
      <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-white text-xl font-semibold animate-pulse">
        Cargando EYS Inversiones...
      </div>
    </div>
  </div>
);

// Componente para rutas protegidas con manejo de roles
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Verificar si el usuario tiene el rol permitido
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" />; // Redirigir a la bienvenida si no tiene permisos
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <Router>
                <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Routes>
                    {/* Ruta pública */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Ruta de bienvenida */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout>
                          <Welcome />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Dashboard */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute allowedRoles={['admin', 'consultor', 'solicitante', 'supervisor']}>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Rutas de gestión principal */}
                    <Route path="/clientes" element={
                      <ProtectedRoute allowedRoles={['admin', 'consultor', 'supervisor']}>
                        <Layout>
                          <Clientes />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/prestamos" element={
                      <ProtectedRoute allowedRoles={['admin', 'consultor', 'supervisor']}>
                        <Layout>
                          <Prestamos />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/pagos" element={
                      <ProtectedRoute allowedRoles={['admin', 'consultor', 'supervisor']}>
                        <Layout>
                          <Pagos />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/solicitudes" element={
                      <ProtectedRoute allowedRoles={['admin', 'consultor', 'solicitante']}>
                        <Layout>
                          <Solicitudes />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/garantes" element={
                      <ProtectedRoute allowedRoles={['admin', 'consultor']}>
                        <Layout>
                          <Garantes />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/usuarios" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Layout>
                          <Usuarios />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/notificaciones" element={
                      <ProtectedRoute allowedRoles={['admin', 'consultor', 'solicitante', 'supervisor']}>
                        <Layout>
                          <Notificaciones />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* 👇 NUEVAS RUTAS */}
                    
                    {/* Operaciones - Acceso para admin, supervisor y consultor */}
                    <Route path="/operaciones" element={
                      <ProtectedRoute allowedRoles={['admin', 'supervisor', 'consultor']}>
                        <Layout>
                          <Operaciones />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Seguridad - Solo admin */}
                    <Route path="/seguridad" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Layout>
                          <Seguridad />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Configuración - Solo admin */}
                    <Route path="/configuracion" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Layout>
                          <Configuracion />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* 👇 NUEVA RUTA - Información del Sistema */}
                    <Route path="/informacion" element={
                      <ProtectedRoute allowedRoles={['admin', 'consultor', 'solicitante', 'supervisor']}>
                        <Layout>
                          <Informacion />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Perfil de usuario - Accesible para todos */}
                    <Route path="/perfil" element={
                      <ProtectedRoute>
                        <Layout>
                          <Perfil />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Editar perfil */}
                    <Route path="/perfil/editar" element={
                      <ProtectedRoute>
                        <Layout>
                          <Perfil editMode={true} />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Ruta para editar usuario específico (solo admin) */}
                    <Route path="/usuarios/editar/:id" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Layout>
                          <Usuarios editMode={true} />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Ruta 404 - Página no encontrada */}
                    <Route path="*" element={
                      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-black">
                        <div className="text-center text-white">
                          <h1 className="text-9xl font-bold">404</h1>
                          <p className="text-2xl mt-4 mb-8">Página no encontrada</p>
                          <a 
                            href="/" 
                            className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                          >
                            Volver al inicio
                          </a>
                        </div>
                      </div>
                    } />
                  </Routes>
                </div>
              </Router>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;