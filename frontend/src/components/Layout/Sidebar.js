import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CogIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [empresaNombre, setEmpresaNombre] = useState('EYS Inversiones');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [permisosUsuario, setPermisosUsuario] = useState({});
  const [loadingPermisos, setLoadingPermisos] = useState(true);
  const [rolReal, setRolReal] = useState(null);
  const [nombreRol, setNombreRol] = useState('');
  const [colorRol, setColorRol] = useState('bg-gradient-to-br from-gray-500 to-gray-700');
  const [iconoRol, setIconoRol] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const sidebarOpen = isFixed || isHovered || isOpen;

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Función para obtener color por defecto según el rol
  const getDefaultRoleColor = (rol) => {
    switch(rol) {
      case 'admin': return 'bg-gradient-to-br from-red-600 to-red-800';
      case 'supervisor': return 'bg-gradient-to-br from-yellow-500 to-yellow-700';
      case 'consultor': return 'bg-gradient-to-br from-green-500 to-green-700';
      case 'solicitante': return 'bg-gradient-to-br from-blue-500 to-blue-700';
      default: return 'bg-gradient-to-br from-purple-600 to-purple-800';
    }
  };

  // Función para obtener icono por defecto según el rol
  const getDefaultRoleIcon = (rol) => {
    switch(rol) {
      case 'admin': return <BriefcaseIcon className="h-5 w-5" />;
      case 'supervisor': return <ShieldCheckIcon className="h-5 w-5" />;
      case 'consultor': return <EyeIcon className="h-5 w-5" />;
      case 'solicitante': return <ClipboardDocumentListIcon className="h-5 w-5" />;
      default: return <UserCircleIcon className="h-5 w-5" />;
    }
  };

  // Cargar el rol REAL del usuario desde Firebase
  useEffect(() => {
    const cargarRolReal = async () => {
      if (!user?.email) {
        console.log('⚠️ No hay usuario');
        setLoadingPermisos(false);
        return;
      }

      try {
        setLoadingPermisos(true);
        console.log('🔄 Buscando usuario en Firebase:', user.email);
        
        // Intentar con diferentes nombres de colección
        const posiblesColecciones = ['Usuarios', 'usuarios', 'Users', 'users'];
        let usuarioEncontrado = null;
        let coleccionUsada = '';

        for (const nombreColeccion of posiblesColecciones) {
          try {
            console.log(`🔍 Buscando en colección: ${nombreColeccion}`);
            const usuariosRef = collection(db, nombreColeccion);
            const q = query(usuariosRef, where('email', '==', user.email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              querySnapshot.forEach(doc => {
                usuarioEncontrado = { id: doc.id, ...doc.data() };
              });
              coleccionUsada = nombreColeccion;
              console.log(`✅ Usuario encontrado en colección: ${nombreColeccion}`);
              break;
            }
          } catch (error) {
            console.log(`⚠️ Error en colección ${nombreColeccion}:`, error.message);
          }
        }

        if (!usuarioEncontrado) {
          console.log('❌ Usuario no encontrado en ninguna colección');
          
          // Intentar buscar en la autenticación directamente
          console.log('🔍 Usando datos del usuario de autenticación:', user);
          
          // Si el usuario tiene un rol en el contexto, usarlo
          if (user.rol && user.rol !== 'admin') {
            console.log('✅ Usando rol del contexto de autenticación:', user.rol);
            const rolId = user.rol;
            setRolReal(rolId);
            
            // Cargar información del rol
            try {
              const rolRef = doc(db, 'Roles', rolId);
              const rolSnap = await getDoc(rolRef);
              
              if (rolSnap.exists()) {
                const data = rolSnap.data();
                setNombreRol(data.nombre || rolId);
                setColorRol(data.color || getDefaultRoleColor(rolId));
                setPermisosUsuario(data.permisos || {});
                setIconoRol(getDefaultRoleIcon(rolId));
              } else {
                setNombreRol(rolId.charAt(0).toUpperCase() + rolId.slice(1));
                setColorRol(getDefaultRoleColor(rolId));
                setPermisosUsuario({});
                setIconoRol(getDefaultRoleIcon(rolId));
              }
            } catch (error) {
              console.error('❌ Error cargando rol:', error);
              setRolReal('solicitante');
              setNombreRol('Solicitante');
              setColorRol('bg-gradient-to-br from-blue-500 to-blue-700');
              setPermisosUsuario({});
              setIconoRol(getDefaultRoleIcon('solicitante'));
            }
            
            setLoadingPermisos(false);
            return;
          }
          
          // Si no, asignar rol por defecto
          setRolReal('solicitante');
          setNombreRol('Solicitante');
          setColorRol('bg-gradient-to-br from-blue-500 to-blue-700');
          setPermisosUsuario({});
          setIconoRol(getDefaultRoleIcon('solicitante'));
          setLoadingPermisos(false);
          return;
        }

        console.log('✅ Usuario encontrado:', usuarioEncontrado);
        
        // Obtener el rol del usuario
        const rolId = usuarioEncontrado.rol || 'solicitante';
        setRolReal(rolId);

        // Cargar información del rol
        const rolRef = doc(db, 'Roles', rolId);
        const rolSnap = await getDoc(rolRef);
        
        if (rolSnap.exists()) {
          const data = rolSnap.data();
          console.log('✅ Información del rol cargada:', data);
          
          setNombreRol(data.nombre || rolId);
          setColorRol(data.color || getDefaultRoleColor(rolId));
          setPermisosUsuario(data.permisos || {});
          
          // Determinar el icono según el rol
          if (data.icon) {
            setIconoRol(data.icon);
          } else {
            setIconoRol(getDefaultRoleIcon(rolId));
          }
        } else {
          console.log('⚠️ No se encontró el documento del rol, usando valores por defecto');
          setNombreRol(rolId.charAt(0).toUpperCase() + rolId.slice(1));
          setColorRol(getDefaultRoleColor(rolId));
          setPermisosUsuario({});
          setIconoRol(getDefaultRoleIcon(rolId));
        }
      } catch (error) {
        console.error('❌ Error cargando rol:', error);
        setRolReal('solicitante');
        setNombreRol('Solicitante');
        setColorRol('bg-gradient-to-br from-blue-500 to-blue-700');
        setPermisosUsuario({});
        setIconoRol(getDefaultRoleIcon('solicitante'));
      } finally {
        setLoadingPermisos(false);
      }
    };

    cargarRolReal();
  }, [user]);

  // 👇 AHORA SÍ, definimos esAdmin después de que rolReal ya tiene un valor
  const esAdmin = rolReal === 'admin';

  // Obtener el icono del rol
  const getRoleIconComponent = () => {
    if (iconoRol && typeof iconoRol === 'function') {
      const IconComponent = iconoRol;
      return <IconComponent className="h-5 w-5" />;
    } else if (iconoRol) {
      return getDefaultRoleIcon(rolReal);
    } else {
      return getDefaultRoleIcon(rolReal);
    }
  };

  // Obtener el color del rol
  const getRoleColorClass = () => {
    return colorRol;
  };

  // Escuchar cambios en el logo y nombre de empresa
  useEffect(() => {
    const handleLogoUpdate = (event) => {
      setLogoUrl(event.detail);
    };

    const handleEmpresaNombreUpdate = (event) => {
      setEmpresaNombre(event.detail);
    };

    const savedLogo = localStorage.getItem('empresaLogo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }

    const savedNombre = localStorage.getItem('empresaNombre');
    if (savedNombre) {
      setEmpresaNombre(savedNombre);
    }

    window.addEventListener('logoActualizado', handleLogoUpdate);
    window.addEventListener('empresaNombreActualizado', handleEmpresaNombreUpdate);
    
    return () => {
      window.removeEventListener('logoActualizado', handleLogoUpdate);
      window.removeEventListener('empresaNombreActualizado', handleEmpresaNombreUpdate);
    };
  }, []);

  // 👇 MODIFICADO: Dashboard ahora apunta a /dashboard
  const todosLosMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, modulo: 'dashboard', accion: 'ver' },
    { name: 'Clientes', path: '/clientes', icon: UsersIcon, modulo: 'clientes', accion: 'ver' },
    { name: 'Préstamos', path: '/prestamos', icon: CurrencyDollarIcon, modulo: 'prestamos', accion: 'ver' },
    { name: 'Pagos', path: '/pagos', icon: CreditCardIcon, modulo: 'pagos', accion: 'ver' },
    { name: 'Solicitudes', path: '/solicitudes', icon: DocumentTextIcon, modulo: 'solicitudes', accion: 'ver' },
    { name: 'Garantes', path: '/garantes', icon: UserGroupIcon, modulo: 'garantes', accion: 'ver' },
    { name: 'Usuarios', path: '/usuarios', icon: UsersIcon, modulo: 'usuarios', accion: 'ver' },
    { name: 'Notificaciones', path: '/notificaciones', icon: BellIcon, modulo: 'notificaciones', accion: 'ver' },
    { name: 'Configuración', path: '/configuracion', icon: CogIcon, modulo: 'configuracion', accion: 'ver' },
  ];

  // Filtrar menú según permisos del usuario
  const filteredMenu = todosLosMenuItems.filter(item => {
    // Si el usuario es admin (por rol real), mostrar todo
    if (esAdmin) {
      return true;
    }
    
    // Si aún no hay permisos cargados, no mostrar nada
    if (loadingPermisos) {
      return false;
    }
    
    // Verificar si el usuario tiene permiso para ver este módulo
    const tienePermiso = permisosUsuario[item.modulo]?.includes(item.accion);
    
    return tienePermiso;
  });

  // 👇 NUEVO: Redirección automática desde la raíz
  useEffect(() => {
    // Si estamos en la ruta raíz y el usuario tiene permisos para dashboard, no redirigir (mostrar bienvenida)
    if (!loadingPermisos && location.pathname === '/') {
      // Verificar si tiene permiso para dashboard
      if (esAdmin || permisosUsuario['dashboard']?.includes('ver')) {
        console.log('👋 Usuario con permisos para dashboard, mostrando bienvenida');
        // Ya está en la bienvenida, no hacer nada
        return;
      }
      
      // Si tiene otros permisos, redirigir al primer módulo disponible
      if (filteredMenu.length > 0) {
        console.log('🔄 Redirigiendo a primer módulo disponible:', filteredMenu[0].path);
        navigate(filteredMenu[0].path);
      }
    }
  }, [loadingPermisos, location.pathname, esAdmin, permisosUsuario, filteredMenu, navigate]);

  // Debug: Mostrar resumen de permisos
  useEffect(() => {
    if (!loadingPermisos) {
      console.log('📊 === RESUMEN DE USUARIO ===');
      console.log('👤 Email:', user?.email);
      console.log('🎭 Rol en Auth:', user?.rol);
      console.log('🎯 Rol Real (desde Firebase):', rolReal);
      console.log('📛 Nombre del Rol:', nombreRol);
      console.log('👑 Es Admin:', esAdmin);
      console.log('📋 Permisos:', permisosUsuario);
      console.log('🔍 Menú visible:', filteredMenu.map(item => item.name));
      console.log('📍 Ruta actual:', location.pathname);
      console.log('=============================');
    }
  }, [loadingPermisos, permisosUsuario, user, filteredMenu, esAdmin, rolReal, nombreRol, location.pathname]);

  // Sidebar para móvil (overlay)
  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Overlay oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar móvil */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-0 h-full w-[280px] z-50 md:hidden ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-black'
            }`}
          >
            {/* Logo en móvil */}
            <div className="h-16 flex items-center px-4 border-b border-gray-800">
              <div className="flex items-center space-x-3 flex-1">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{empresaNombre.charAt(0)}</span>
                  </div>
                )}
                <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent truncate max-w-[180px]">
                  {empresaNombre}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Navegación móvil */}
            <nav className="mt-4 px-3 overflow-y-auto max-h-[calc(100vh-4rem)]">
              {loadingPermisos ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <ul className="space-y-1">
                  {filteredMenu.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.path}
                          className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-red-600 to-red-800 text-white'
                              : theme === 'dark'
                              ? 'text-gray-300 hover:bg-gray-800'
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                  
                  {/* Mensaje si no hay permisos */}
                  {filteredMenu.length === 0 && !loadingPermisos && (
                    <li className="text-center py-8 px-4">
                      <p className="text-gray-500 text-sm">
                        No tienes acceso a ningún módulo
                      </p>
                    </li>
                  )}
                </ul>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Sidebar para desktop (solo visible en md y superior) */}
      {!isMobile && (
        <motion.div
          className={`h-screen relative flex-shrink-0 hidden md:block ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-black'
          }`}
          animate={{ width: sidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setShowUserMenu(false);
          }}
        >
          {/* Logo */}
          <div className={`h-16 flex items-center ${sidebarOpen ? 'justify-start pl-4' : 'justify-center'}`}>
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{empresaNombre.charAt(0)}</span>
                  </div>
                )}
                <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent truncate max-w-[180px]">
                  {empresaNombre}
                </span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                ) : (
                  <span className="text-white text-2xl font-bold bg-gradient-to-br from-red-600 to-red-800 w-full h-full flex items-center justify-center">
                    {empresaNombre.charAt(0)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Botón fijar */}
          <AnimatePresence>
            {isHovered && sidebarOpen && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => setIsFixed(!isFixed)}
                className={`absolute -right-3 top-14 ${
                  isFixed ? 'bg-red-600' : 'bg-gray-600'
                } text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition-colors z-50`}
              >
                {isFixed ? (
                  <ChevronLeftIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Navegación */}
          <nav className="mt-4">
            {loadingPermisos ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <ul className="space-y-1 px-3">
                {filteredMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all relative overflow-hidden group ${
                          isActive
                            ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-600/30'
                            : theme === 'dark'
                            ? 'text-gray-300 hover:text-white'
                            : 'text-gray-300 hover:text-white'
                        } ${!sidebarOpen && 'justify-center'}`}
                      >
                        <span className="absolute inset-0 border-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
                        
                        <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : ''} relative z-10 group-hover:text-white transition-colors`} />
                        
                        <AnimatePresence>
                          {sidebarOpen && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative z-10 group-hover:text-white transition-colors"
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
                
                {/* Mensaje si no hay permisos */}
                {filteredMenu.length === 0 && !loadingPermisos && (
                  <li className="text-center py-8 px-4">
                    <p className="text-gray-500 text-sm">
                      No tienes acceso a ningún módulo
                    </p>
                  </li>
                )}
              </ul>
            )}
          </nav>
        </motion.div>
      )}

      {/* Sidebar móvil */}
      <MobileSidebar />

      {/* Header Superior */}
      <div className={`flex-1 flex flex-col overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <header className={`${
          theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        } border-b sticky top-0 z-10`}>
          <div className="flex justify-between items-center px-4 md:px-6 py-3">
            <div className="flex items-center space-x-3">
              {/* Botón menú móvil */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg transition-colors hover:bg-gray-800"
              >
                <Bars3Icon className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`} />
              </button>
              
              <div>
                <h1 className={`text-lg md:text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {empresaNombre}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Sistema de Gestión de Préstamos
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Toggle tema */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors relative overflow-hidden group ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 text-yellow-500 group-hover:text-red-600 transition-colors" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                )}
                <span className="absolute inset-0 border-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
              </button>

              {/* Notificaciones - Solo visible si tiene permiso o es admin */}
              {!loadingPermisos && (esAdmin || permisosUsuario['notificaciones']?.includes('ver')) && (
                <button 
                  onClick={() => navigate('/notificaciones')}
                  className={`p-2 rounded-lg transition-colors relative overflow-hidden group ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <BellIcon className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  } group-hover:text-red-600 transition-colors`} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                  <span className="absolute inset-0 border-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
                </button>
              )}
              
              {/* Perfil de usuario */}
              <div className="relative"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 p-1 rounded-lg transition-all relative overflow-hidden group ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`${getRoleColorClass()} rounded-lg p-2 text-white relative z-10 shadow-lg transition-all group-hover:shadow-red-600/50 group-hover:scale-110`}>
                    {getRoleIconComponent()}
                  </div>
                  <span className="hidden sm:block absolute inset-0 border-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
                </motion.button>

                {/* Menú desplegable del usuario */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 mt-2 w-64 md:w-72 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-black opacity-95"></div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                      
                      <div className="relative p-5 backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full filter blur-3xl opacity-20"></div>
                        
                        {/* Info del usuario con el rol REAL */}
                        <div className="relative z-10">
                          <div className="flex items-center space-x-4">
                            <div className={`${getRoleColorClass()} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-xl transform -rotate-3 hover:rotate-0 transition-transform`}>
                              <span className="text-2xl font-bold">{user?.nombre?.charAt(0)}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-bold text-lg truncate">
                                {user?.nombre}
                              </p>
                              <div className="flex items-center mt-1">
                                <span className={`w-2 h-2 rounded-full mr-2 ${getRoleColorClass()}`}></span>
                                <p className="text-red-200 text-sm font-medium">
                                  {nombreRol || rolReal}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Separador */}
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-red-500/30"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-3 bg-gradient-to-r from-red-600 to-red-800 text-red-200 text-xs rounded-full py-0.5 shadow-lg">
                              <SparklesIcon className="h-3 w-3 inline mr-1" />
                              OPCIONES
                            </span>
                          </div>
                        </div>

                        {/* Opciones */}
                        <div className="space-y-2">
                          <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => {
                              navigate('/perfil');
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all relative overflow-hidden group bg-black/20 hover:bg-black/40"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <UserCircleIcon className="h-5 w-5 text-red-400 group-hover:text-white transition-colors relative z-10" />
                            <span className="text-gray-200 group-hover:text-white transition-colors relative z-10">Mi Perfil</span>
                            <span className="absolute inset-0 border border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
                          </motion.button>

                          {/* Configuración - Solo si tiene permiso o es admin */}
                          {!loadingPermisos && (esAdmin || permisosUsuario['configuracion']?.includes('ver')) && (
                            <motion.button
                              whileHover={{ x: 5 }}
                              onClick={() => {
                                navigate('/configuracion');
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all relative overflow-hidden group bg-black/20 hover:bg-black/40"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <CogIcon className="h-5 w-5 text-red-400 group-hover:text-white transition-colors relative z-10" />
                              <span className="text-gray-200 group-hover:text-white transition-colors relative z-10">Configuración</span>
                              <span className="absolute inset-0 border border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
                            </motion.button>
                          )}

                          <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-red-500/30"></div>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all relative overflow-hidden group bg-red-600/20 hover:bg-red-600/40"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-400 group-hover:text-white transition-colors relative z-10" />
                            <span className="text-red-200 group-hover:text-white transition-colors relative z-10">Cerrar Sesión</span>
                            <span className="absolute inset-0 border border-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
                          </motion.button>
                        </div>

                        {/* Versión */}
                        <div className="mt-4 text-center relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full border-t border-red-500/30"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-3 bg-gradient-to-r from-red-600 to-red-800 text-red-200 text-xs rounded-full py-1 shadow-lg flex items-center">
                              <RocketLaunchIcon className="h-3 w-3 mr-1" />
                              v2.0.0
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          {children}
        </main>
      </div>
    </>
  );
};

export default Sidebar;