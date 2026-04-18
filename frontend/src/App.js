import React, { useState, useEffect } from 'react';
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
import Informacion from './pages/Informacion';
import Operaciones from './pages/Operaciones';
import Seguridad from './pages/Seguridad';
import Comisiones from './pages/Operaciones/Comisiones';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './services/firebase';

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

// ============================================
// COMPONENTE DE PROTECCIÓN BASADO EN PERMISOS
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
                      <ProtectedRoute modulo="dashboard" accion="ver">
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Clientes */}
                    <Route path="/clientes" element={
                      <ProtectedRoute modulo="clientes" accion="ver">
                        <Layout>
                          <Clientes />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Préstamos */}
                    <Route path="/prestamos" element={
                      <ProtectedRoute modulo="prestamos" accion="ver">
                        <Layout>
                          <Prestamos />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Pagos */}
                    <Route path="/pagos" element={
                      <ProtectedRoute modulo="pagos" accion="ver">
                        <Layout>
                          <Pagos />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Solicitudes */}
                    <Route path="/solicitudes" element={
                      <ProtectedRoute modulo="solicitudes" accion="ver">
                        <Layout>
                          <Solicitudes />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Garantes */}
                    <Route path="/garantes" element={
                      <ProtectedRoute modulo="garantes" accion="ver">
                        <Layout>
                          <Garantes />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Usuarios */}
                    <Route path="/usuarios" element={
                      <ProtectedRoute modulo="usuarios" accion="ver">
                        <Layout>
                          <Usuarios />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Notificaciones */}
                    <Route path="/notificaciones" element={
                      <ProtectedRoute modulo="notificaciones" accion="ver">
                        <Layout>
                          <Notificaciones />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Comisiones */}
                    <Route path="/comisiones" element={
                      <ProtectedRoute modulo="comisiones" accion="ver">
                        <Layout>
                          <Comisiones />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Operaciones/comisiones (redirección) */}
                    <Route path="/operaciones/comisiones" element={
                      <ProtectedRoute modulo="comisiones" accion="ver">
                        <Layout>
                          <Comisiones />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Operaciones */}
                    <Route path="/operaciones" element={
                      <ProtectedRoute modulo="operaciones" accion="ver">
                        <Layout>
                          <Operaciones />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Seguridad */}
                    <Route path="/seguridad" element={
                      <ProtectedRoute modulo="seguridad" accion="ver">
                        <Layout>
                          <Seguridad />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Configuración */}
                    <Route path="/configuracion" element={
                      <ProtectedRoute modulo="configuracion" accion="ver">
                        <Layout>
                          <Configuracion />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Información del Sistema */}
                    <Route path="/informacion" element={
                      <ProtectedRoute modulo="informacion" accion="ver">
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
                    
                    {/* Ruta para editar usuario específico */}
                    <Route path="/usuarios/editar/:id" element={
                      <ProtectedRoute modulo="usuarios" accion="editar">
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