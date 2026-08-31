import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AccessControlProvider, useAccessControl } from './context/AccessControlContext';
import AccessBlocked from './components/AccessBlocked';
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
import Informacion from './pages/Informacion';
import Operaciones from './pages/Operaciones';
import Seguridad from './pages/Seguridad';
import Comisiones from './pages/Operaciones/Comisiones';
import Calendario from './pages/Operaciones/Calendario';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './services/firebase';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleCalendarProvider } from './context/GoogleCalendarContext';

// ============================================
// CONFIGURACIÓN DE GOOGLE (DESDE VARIABLES DE ENTORNO)
// ============================================

// 🔥 CLIENT ID DE GOOGLE - AHORA desde variable de entorno
// Prioridad: 1. Variable de entorno REACT_APP_GOOGLE_CLIENT_ID
//            2. Fallback con el valor actual (para desarrollo local)
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 
  '768056000483-f8d266gdhd7clu67rcenc4ts340q2d9l.apps.googleusercontent.com';

// Log para verificar configuración en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('🔑 Google Client ID configurado:', GOOGLE_CLIENT_ID ? '✅ Sí' : '❌ No');
}

// ============================================
// COMPONENTE DE CARGA MEJORADO
// ============================================

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

// ============================================
// COMPONENTE DE PROTECCIÓN BASADO EN PERMISOS Y ACCESO
// ============================================

const ProtectedRoute = ({ children, modulo, accion = 'ver' }) => {
  const { user, loading } = useAuth();
  const [permisosUsuario, setPermisosUsuario] = useState({});
  const [loadingPermisos, setLoadingPermisos] = useState(true);
  const [rolReal, setRolReal] = useState(null);

  // Cargar permisos del usuario desde Firestore
  useEffect(() => {
    const cargarPermisos = async () => {
      if (!user?.email) {
        setLoadingPermisos(false);
        return;
      }

      try {
        // Buscar el rol del usuario
        const posiblesColecciones = ['Usuarios', 'usuarios', 'Users', 'users'];
        let usuarioEncontrado = null;

        for (const nombreColeccion of posiblesColecciones) {
          try {
            const usuariosRef = collection(db, nombreColeccion);
            const q = query(usuariosRef, where('email', '==', user.email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              querySnapshot.forEach(doc => {
                usuarioEncontrado = { id: doc.id, ...doc.data() };
              });
              break;
            }
          } catch (error) {
            console.log(`⚠️ Error en colección ${nombreColeccion}:`, error.message);
          }
        }

        const rolId = usuarioEncontrado?.rol || user.rol || 'solicitante';
        setRolReal(rolId);

        // Cargar permisos del rol
        const rolRef = doc(db, 'Roles', rolId);
        const rolSnap = await getDoc(rolRef);
        
        if (rolSnap.exists()) {
          const data = rolSnap.data();
          setPermisosUsuario(data.permisos || {});
          console.log(`✅ Permisos cargados para rol ${rolId}:`, data.permisos);
        } else {
          setPermisosUsuario({});
        }
      } catch (error) {
        console.error('Error cargando permisos:', error);
        setPermisosUsuario({});
      } finally {
        setLoadingPermisos(false);
      }
    };

    cargarPermisos();
  }, [user]);

  if (loading || loadingPermisos) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // ADMIN tiene acceso a TODO
  if (rolReal === 'admin') {
    console.log(`🔓 ADMIN: Acceso permitido a ${modulo || 'ruta'}`);
    return children;
  }

  // Si no hay módulo especificado, permitir acceso (para rutas como /perfil)
  if (!modulo) {
    return children;
  }

  // Verificar si el usuario tiene permiso para este módulo
  const tienePermiso = permisosUsuario[modulo]?.includes(accion);
  
  console.log(`🔍 Verificando permiso para ${modulo}.${accion}:`, tienePermiso);

  if (!tienePermiso) {
    console.log(`⛔ Acceso denegado a ${modulo}`);
    return <Navigate to="/" />;
  }

  return children;
};

// ============================================
// COMPONENTE DE PROTECCIÓN CON VERIFICACIÓN DE ACCESO
// ============================================

const ProtectedRouteWithAccess = ({ children, modulo, accion = 'ver' }) => {
  const { accesoPermitido, motivoBloqueo, reglaBloqueo, verificando } = useAccessControl();
  
  // Si está verificando, mostrar pantalla de carga
  if (verificando) {
    return <LoadingScreen />;
  }
  
  // Si el acceso no está permitido, mostrar pantalla de bloqueo
  if (!accesoPermitido) {
    return <AccessBlocked motivo={motivoBloqueo} regla={reglaBloqueo} />;
  }
  
  // Si el acceso está permitido, verificar permisos del módulo
  return <ProtectedRoute modulo={modulo} accion={accion}>{children}</ProtectedRoute>;
};

// ============================================
// COMPONENTE APP ENVUELTO CON GOOGLE PROVIDERS
// ============================================

function AppContent() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <AccessControlProvider>
                <Router>
                  <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <Routes>
                      {/* Ruta pública - Sin verificación de acceso */}
                      <Route path="/login" element={<Login />} />
                      
                      {/* Ruta de bienvenida - Con verificación de acceso */}
                      <Route path="/" element={
                        <ProtectedRouteWithAccess>
                          <Layout>
                            <Welcome />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Dashboard */}
                      <Route path="/dashboard" element={
                        <ProtectedRouteWithAccess modulo="dashboard" accion="ver">
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Clientes */}
                      <Route path="/clientes" element={
                        <ProtectedRouteWithAccess modulo="clientes" accion="ver">
                          <Layout>
                            <Clientes />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Préstamos */}
                      <Route path="/prestamos" element={
                        <ProtectedRouteWithAccess modulo="prestamos" accion="ver">
                          <Layout>
                            <Prestamos />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Pagos */}
                      <Route path="/pagos" element={
                        <ProtectedRouteWithAccess modulo="pagos" accion="ver">
                          <Layout>
                            <Pagos />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Solicitudes */}
                      <Route path="/solicitudes" element={
                        <ProtectedRouteWithAccess modulo="solicitudes" accion="ver">
                          <Layout>
                            <Solicitudes />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Garantes */}
                      <Route path="/garantes" element={
                        <ProtectedRouteWithAccess modulo="garantes" accion="ver">
                          <Layout>
                            <Garantes />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Usuarios */}
                      <Route path="/usuarios" element={
                        <ProtectedRouteWithAccess modulo="usuarios" accion="ver">
                          <Layout>
                            <Usuarios />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Notificaciones */}
                      <Route path="/notificaciones" element={
                        <ProtectedRouteWithAccess modulo="notificaciones" accion="ver">
                          <Layout>
                            <Notificaciones />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Comisiones */}
                      <Route path="/comisiones" element={
                        <ProtectedRouteWithAccess modulo="comisiones" accion="ver">
                          <Layout>
                            <Comisiones />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Operaciones/comisiones (redirección) */}
                      <Route path="/operaciones/comisiones" element={
                        <ProtectedRouteWithAccess modulo="comisiones" accion="ver">
                          <Layout>
                            <Comisiones />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Operaciones */}
                      <Route path="/operaciones" element={
                        <ProtectedRouteWithAccess modulo="operaciones" accion="ver">
                          <Layout>
                            <Operaciones />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Seguridad */}
                      <Route path="/seguridad" element={
                        <ProtectedRouteWithAccess modulo="seguridad" accion="ver">
                          <Layout>
                            <Seguridad />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Configuración */}
                      <Route path="/configuracion" element={
                        <ProtectedRouteWithAccess modulo="configuracion" accion="ver">
                          <Layout>
                            <Configuracion />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Información del Sistema */}
                      <Route path="/informacion" element={
                        <ProtectedRouteWithAccess modulo="informacion" accion="ver">
                          <Layout>
                            <Informacion />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* 🔥 CALENDARIO - NUEVA RUTA */}
                      <Route path="/calendario" element={
                        <ProtectedRouteWithAccess modulo="calendario" accion="ver">
                          <Layout>
                            <Calendario />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Perfil de usuario - Accesible para todos */}
                      <Route path="/perfil" element={
                        <ProtectedRouteWithAccess>
                          <Layout>
                            <Perfil />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Editar perfil */}
                      <Route path="/perfil/editar" element={
                        <ProtectedRouteWithAccess>
                          <Layout>
                            <Perfil editMode={true} />
                          </Layout>
                        </ProtectedRouteWithAccess>
                      } />
                      
                      {/* Ruta para editar usuario específico */}
                      <Route path="/usuarios/editar/:id" element={
                        <ProtectedRouteWithAccess modulo="usuarios" accion="editar">
                          <Layout>
                            <Usuarios editMode={true} />
                          </Layout>
                        </ProtectedRouteWithAccess>
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
              </AccessControlProvider>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

// ============================================
// APP PRINCIPAL CON GOOGLE PROVIDERS
// ============================================

function App() {
  // Verificar que el Client ID esté configurado
  if (!GOOGLE_CLIENT_ID) {
    console.error('❌ Error: REACT_APP_GOOGLE_CLIENT_ID no está configurado');
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Configuración</h1>
          <p className="text-gray-700">Falta configurar el Client ID de Google.</p>
          <p className="text-sm text-gray-500 mt-2">Contacte al administrador del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleCalendarProvider>
        <AppContent />
      </GoogleCalendarProvider>
    </GoogleOAuthProvider>
  );
}

export default App;