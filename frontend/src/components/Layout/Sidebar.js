import React, { useState, useEffect, useRef } from 'react';
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
  XMarkIcon,
  PresentationChartLineIcon,
  LockClosedIcon,
  InformationCircleIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PerfilModal from './PerfilModal';
import NotificacionesPanel from './NotificacionesPanel';
import { getVersionFormatted } from '../../config/version';

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [empresaNombre, setEmpresaNombre] = useState('EYS Inversiones');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [permisosUsuario, setPermisosUsuario] = useState({});
  const [loadingPermisos, setLoadingPermisos] = useState(true);
  const [rolReal, setRolReal] = useState(null);
  const [nombreRol, setNombreRol] = useState('');
  const [colorRol, setColorRol] = useState('bg-gradient-to-br from-gray-500 to-gray-700');
  const [iconoRol, setIconoRol] = useState(null);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  
  // Refs para detectar clics fuera
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const userContainerRef = useRef(null);
  const notificacionesRef = useRef(null);
  const notificacionesButtonRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const sidebarOpen = isFixed || isHovered || isOpen;

  // Detectar si es móvil o tablet
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      if (width < 1024) {
        setIsFixed(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Cerrar panel de notificaciones al cambiar de ruta
  useEffect(() => {
    setShowNotificaciones(false);
  }, [location]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar menú de usuario si se hace clic fuera
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target) && 
          userButtonRef.current && !userButtonRef.current.contains(event.target) &&
          userContainerRef.current && !userContainerRef.current.contains(event.target)) {
        setShowUserMenu(false);
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          setHoverTimeout(null);
        }
      }
      
      // Cerrar panel de notificaciones si se hace clic fuera
      if (showNotificaciones && notificacionesRef.current && !notificacionesRef.current.contains(event.target) &&
          notificacionesButtonRef.current && !notificacionesButtonRef.current.contains(event.target)) {
        setShowNotificaciones(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotificaciones]);

  // Cargar configuración de la empresa desde Firestore
  useEffect(() => {
    const cargarConfiguracionEmpresa = async () => {
      try {
        const empresaRef = doc(db, 'Configuracion', 'empresa');
        const empresaSnap = await getDoc(empresaRef);
        
        if (empresaSnap.exists()) {
          const data = empresaSnap.data();
          if (data.logoUrl) {
            setLogoUrl(data.logoUrl);
            localStorage.setItem('empresaLogo', data.logoUrl);
          }
          if (data.empresaNombre) {
            setEmpresaNombre(data.empresaNombre);
            localStorage.setItem('empresaNombre', data.empresaNombre);
          }
        }
      } catch (error) {
        console.error('Error cargando configuración de empresa:', error);
      }
    };
    
    cargarConfiguracionEmpresa();
  }, []);

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

  // Cargar notificaciones no leídas
  const cargarNotificacionesNoLeidas = async () => {
    try {
      const notificacionesRef = collection(db, 'notificaciones');
      const q = query(notificacionesRef, where('leida', '==', false));
      const snapshot = await getDocs(q);
      setNotificacionesNoLeidas(snapshot.size);
    } catch (error) {
      console.error('Error cargando notificaciones no leídas:', error);
    }
  };

  // Recargar notificaciones periódicamente
  useEffect(() => {
    if (!loadingPermisos && (esAdmin || permisosUsuario['notificaciones']?.includes('ver'))) {
      cargarNotificacionesNoLeidas();
      const interval = setInterval(cargarNotificacionesNoLeidas, 30000);
      return () => clearInterval(interval);
    }
  }, [loadingPermisos, permisosUsuario]);

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

        if (!usuarioEncontrado) {
          if (user.rol && user.rol !== 'admin') {
            const rolId = user.rol;
            setRolReal(rolId);
            
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
          
          setRolReal('solicitante');
          setNombreRol('Solicitante');
          setColorRol('bg-gradient-to-br from-blue-500 to-blue-700');
          setPermisosUsuario({});
          setIconoRol(getDefaultRoleIcon('solicitante'));
          setLoadingPermisos(false);
          return;
        }

        const rolId = usuarioEncontrado.rol || 'solicitante';
        setRolReal(rolId);
        console.log('✅ Rol del usuario encontrado:', rolId);

        const rolRef = doc(db, 'Roles', rolId);
        const rolSnap = await getDoc(rolRef);
        
        if (rolSnap.exists()) {
          const data = rolSnap.data();
          setNombreRol(data.nombre || rolId);
          setColorRol(data.color || getDefaultRoleColor(rolId));
          setPermisosUsuario(data.permisos || {});
          setIconoRol(getDefaultRoleIcon(rolId));
          console.log('✅ Permisos cargados:', data.permisos);
        } else {
          setNombreRol(rolId.charAt(0).toUpperCase() + rolId.slice(1));
          setColorRol(getDefaultRoleColor(rolId));
          setPermisosUsuario({});
          setIconoRol(getDefaultRoleIcon(rolId));
          console.log('⚠️ Rol no encontrado en Firestore, usando permisos por defecto');
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

  const esAdmin = rolReal === 'admin';

  const getRoleIconComponent = () => {
    if (iconoRol && typeof iconoRol === 'function') {
      const IconComponent = iconoRol;
      return <IconComponent className="h-5 w-5" />;
    }
    return getDefaultRoleIcon(rolReal);
  };

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

  // Cargar foto de perfil del usuario
  useEffect(() => {
    const cargarFotoPerfil = async () => {
      if (user?.id || user?.uid) {
        try {
          const userId = user.id || user.uid;
          const userRef = doc(db, 'usuarios', userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.fotoPerfil || data.foto || data.photoURL) {
              setFotoPerfil(data.fotoPerfil || data.foto || data.photoURL);
              console.log('✅ Foto de perfil cargada');
            }
          }
        } catch (error) {
          console.error('Error cargando foto de perfil:', error);
        }
      }
    };
    
    cargarFotoPerfil();
  }, [user]);

  // Items del menú
  const todosLosMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, modulo: 'dashboard', accion: 'ver' },
    { name: 'Clientes', path: '/clientes', icon: UsersIcon, modulo: 'clientes', accion: 'ver' },
    { name: 'Préstamos', path: '/prestamos', icon: CurrencyDollarIcon, modulo: 'prestamos', accion: 'ver' },
    { name: 'Pagos', path: '/pagos', icon: CreditCardIcon, modulo: 'pagos', accion: 'ver' },
    { name: 'Solicitudes', path: '/solicitudes', icon: DocumentTextIcon, modulo: 'solicitudes', accion: 'ver' },
    { name: 'Comisiones', path: '/comisiones', icon: GiftIcon, modulo: 'comisiones', accion: 'ver' },
    { name: 'Usuarios', path: '/usuarios', icon: UsersIcon, modulo: 'usuarios', accion: 'ver' },
    { name: 'Notificaciones', path: '/notificaciones', icon: BellIcon, modulo: 'notificaciones', accion: 'ver' },
    { name: 'Operaciones', path: '/operaciones', icon: PresentationChartLineIcon, modulo: 'operaciones', accion: 'ver' },
    { name: 'Seguridad', path: '/seguridad', icon: LockClosedIcon, modulo: 'seguridad', accion: 'ver' },
    { name: 'Configuración', path: '/configuracion', icon: CogIcon, modulo: 'configuracion', accion: 'ver' },
    { name: 'Información', path: '/informacion', icon: InformationCircleIcon, modulo: 'informacion', accion: 'ver' },
  ];

  // Filtrar menú según permisos
  const filteredMenu = todosLosMenuItems.filter(item => {
    if (esAdmin) {
      console.log(`🔓 ADMIN: ${item.name} - ACCESO TOTAL`);
      return true;
    }
    
    if (loadingPermisos) return false;
    
    const tienePermiso = permisosUsuario[item.modulo]?.includes(item.accion);
    
    console.log(`🔍 Verificando permiso para ${item.name} (${item.modulo}.${item.accion}):`, tienePermiso);
    
    return tienePermiso;
  });

  console.log('📋 Menú filtrado:', filteredMenu.map(m => m.name));

  // Sidebar para móvil y tablet (overlay con scroll invisible)
  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-[100]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[280px] z-[101] overflow-y-auto scrollbar-hide"
            style={{
              maxHeight: '100vh',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              backgroundColor: theme === 'dark' ? '#111827' : '#000000'
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {/* Logo en móvil */}
            <div className="sticky top-0 z-10 h-16 flex items-center px-4 border-b border-gray-800 bg-inherit">
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

            {/* Navegación móvil con scroll invisible */}
            <nav className="mt-4 px-3 pb-8 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                  
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

  // 🔥 MANEJO DEL MENÚ DE USUARIO - HOVER + CLICK
  const handleMouseEnterUser = () => {
    // Cancelar cualquier cierre programado
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // Abrir el menú
    setShowUserMenu(true);
  };

  const handleMouseLeaveUser = () => {
    // Programar cierre después de 300ms para permitir hover en el menú
    const timeout = setTimeout(() => {
      // Verificar si el mouse está sobre el menú
      if (userMenuRef.current && userMenuRef.current.matches(':hover')) {
        // El mouse está sobre el menú, no cerrar
        return;
      }
      setShowUserMenu(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleMouseEnterMenu = () => {
    // Cancelar cualquier cierre programado
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleMouseLeaveMenu = () => {
    // Programar cierre después de 300ms
    const timeout = setTimeout(() => {
      setShowUserMenu(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  // 🔥 Toggle del menú de usuario (click en el botón)
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    // Cancelar cualquier cierre programado
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  // 🔥 Abrir modal de perfil
  const handleAbrirPerfil = () => {
    setShowUserMenu(false);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setTimeout(() => {
      setShowPerfilModal(true);
    }, 50);
  };

  // 🔥 Cerrar modal de perfil
  const handleCerrarPerfil = () => {
    setShowPerfilModal(false);
  };

  // 🔥 Toggle notificaciones
  const handleToggleNotificaciones = () => {
    setShowNotificaciones(!showNotificaciones);
  };

  // 🔥 Cerrar notificaciones
  const handleCerrarNotificaciones = () => {
    setShowNotificaciones(false);
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <>
      {/* Sidebar para desktop (solo visible en pantallas grandes) */}
      {!isMobile && !isTablet && (
        <motion.div
          className={`h-screen relative flex-shrink-0 hidden lg:block overflow-y-auto scrollbar-hide ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-black'
          }`}
          style={{ zIndex: 50, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          animate={{ width: sidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            // No cerrar el menú de usuario aquí, lo maneja el componente
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
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
                  <div className="text-white text-2xl font-bold bg-gradient-to-br from-red-600 to-red-800 w-full h-full flex items-center justify-center">
                    {empresaNombre.charAt(0)}
                  </div>
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
                className={`absolute -right-0 top-14 ${
                  isFixed ? 'bg-red-600' : 'bg-gray-600'
                } text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition-colors z-[9999]`}
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
          <nav className="mt-4 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide pb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                              className="relative z-10 group-hover:text-white transition-colors whitespace-nowrap"
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
                
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

      {/* Sidebar móvil y tablet */}
      <MobileSidebar />

      {/* Header Superior */}
      <div className={`flex-1 flex flex-col overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <header className={`${
          theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        } border-b sticky top-0 z-40`}>
          <div className="flex justify-between items-center px-4 md:px-6 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-800"
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

              {/* Notificaciones con panel desplegable */}
              {!loadingPermisos && (esAdmin || permisosUsuario['notificaciones']?.includes('ver')) && (
                <div className="relative">
                  <button 
                    ref={notificacionesButtonRef}
                    onClick={handleToggleNotificaciones}
                    className={`p-2 rounded-lg transition-colors relative overflow-hidden group ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <BellIcon className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    } group-hover:text-red-600 transition-colors`} />
                    
                    {/* Indicador de notificaciones no leídas */}
                    {notificacionesNoLeidas > 0 && (
                      <>
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
                      </>
                    )}
                    
                    {/* Contador de notificaciones */}
                    {notificacionesNoLeidas > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full shadow-lg">
                        {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                      </span>
                    )}
                    
                    <span className="absolute inset-0 border-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
                  </button>
                  
                  {/* Panel de notificaciones */}
                  <div ref={notificacionesRef}>
                    <NotificacionesPanel
                      isOpen={showNotificaciones}
                      onClose={handleCerrarNotificaciones}
                    />
                  </div>
                </div>
              )}
              
              {/* 🔥 PERFIL DE USUARIO - CON HOVER Y CLICK CORREGIDOS */}
              <div 
                ref={userContainerRef}
                className="relative"
                onMouseEnter={handleMouseEnterUser}
                onMouseLeave={handleMouseLeaveUser}
              >
                <motion.button
                  ref={userButtonRef}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleUserMenu}
                  className={`flex items-center space-x-2 p-1 rounded-lg transition-all relative overflow-hidden group ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {/* Mostrar foto de perfil si existe */}
                  {fotoPerfil ? (
                    <img
                      src={fotoPerfil}
                      alt={user?.nombre || 'Usuario'}
                      className="w-10 h-10 rounded-lg object-cover border-2 border-white/20 shadow-lg transition-all duration-300 group-hover:shadow-red-600/50 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentNode;
                        if (parent) {
                          const div = document.createElement('div');
                          div.className = `${getRoleColorClass()} rounded-lg p-2 text-white relative z-10 shadow-lg transition-all group-hover:shadow-red-600/50 group-hover:scale-110`;
                          div.innerHTML = getRoleIconComponent().props.children;
                          parent.appendChild(div);
                        }
                      }}
                    />
                  ) : (
                    <div className={`${getRoleColorClass()} rounded-lg p-2 text-white relative z-10 shadow-lg transition-all duration-300 group-hover:shadow-red-600/50 group-hover:scale-110`}>
                      {getRoleIconComponent()}
                    </div>
                  )}
                  <span className="hidden sm:block absolute inset-0 border-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
                  
                  {/* Indicador visual de hover/active */}
                  <motion.div 
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600/20 to-red-800/20 opacity-0"
                    animate={{ opacity: showUserMenu ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                {/* Menú desplegable del usuario */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      ref={userMenuRef}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 mt-2 w-64 md:w-72 rounded-xl shadow-2xl overflow-hidden z-[9999]"
                      onMouseEnter={handleMouseEnterMenu}
                      onMouseLeave={handleMouseLeaveMenu}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-black opacity-95"></div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan"></div>
                      
                      <div className="relative p-5 backdrop-blur-sm">
                        {/* Efecto de brillo decorativo */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-600 rounded-full filter blur-2xl opacity-10"></div>
                        
                        <div className="relative z-10">
                          {/* Header del perfil */}
                          <div className="flex items-center space-x-4">
                            {/* Foto de perfil en el menú */}
                            {fotoPerfil ? (
                              <motion.img
                                src={fotoPerfil}
                                alt={user?.nombre || 'Usuario'}
                                className="w-14 h-14 rounded-xl object-cover border-2 border-white/20 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentNode;
                                  if (parent) {
                                    const div = document.createElement('div');
                                    div.className = `${getRoleColorClass()} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-xl transform -rotate-3 hover:rotate-0 transition-transform`;
                                    div.innerHTML = `<span class="text-2xl font-bold">${user?.nombre?.charAt(0) || 'U'}</span>`;
                                    parent.appendChild(div);
                                  }
                                }}
                                whileHover={{ scale: 1.05, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              />
                            ) : (
                              <motion.div 
                                className={`${getRoleColorClass()} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300`}
                                whileHover={{ scale: 1.05, rotate: 0 }}
                              >
                                <span className="text-2xl font-bold">{user?.nombre?.charAt(0) || 'U'}</span>
                              </motion.div>
                            )}
                            <div className="flex-1">
                              <p className="text-white font-bold text-lg truncate">
                                {user?.nombre}
                              </p>
                              <div className="flex items-center mt-1">
                                <span className="w-2 h-2 rounded-full mr-2 bg-red-500 animate-pulse"></span>
                                <p className="text-red-200 text-sm font-medium">
                                  {nombreRol || rolReal}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Separador decorativo */}
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

                          {/* Opciones del menú */}
                          <div className="space-y-2">
                            {/* Botón Mi Perfil */}
                            <motion.button
                              whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleAbrirPerfil}
                              className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-300 relative overflow-hidden group bg-black/20 hover:bg-black/40"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="p-1.5 rounded-lg bg-red-600/20 group-hover:bg-red-600/40 transition-colors duration-300">
                                <UserCircleIcon className="h-5 w-5 text-red-400 group-hover:text-white transition-colors duration-300 relative z-10" />
                              </div>
                              <span className="text-gray-200 group-hover:text-white transition-colors duration-300 relative z-10">Mi Perfil</span>
                              <span className="absolute inset-0 border border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                            </motion.button>

                            {/* Botón Configuración (solo admin) */}
                            {!loadingPermisos && (esAdmin || permisosUsuario['configuracion']?.includes('ver')) && (
                              <motion.button
                                whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  navigate('/configuracion');
                                  setShowUserMenu(false);
                                }}
                                className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-300 relative overflow-hidden group bg-black/20 hover:bg-black/40"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="p-1.5 rounded-lg bg-red-600/20 group-hover:bg-red-600/40 transition-colors duration-300">
                                  <CogIcon className="h-5 w-5 text-red-400 group-hover:text-white transition-colors duration-300 relative z-10" />
                                </div>
                                <span className="text-gray-200 group-hover:text-white transition-colors duration-300 relative z-10">Configuración</span>
                                <span className="absolute inset-0 border border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                              </motion.button>
                            )}

                            {/* Botón Información del Sistema */}
                            <motion.button
                              whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                navigate('/informacion');
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-300 relative overflow-hidden group bg-black/20 hover:bg-black/40"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="p-1.5 rounded-lg bg-red-600/20 group-hover:bg-red-600/40 transition-colors duration-300">
                                <InformationCircleIcon className="h-5 w-5 text-red-400 group-hover:text-white transition-colors duration-300 relative z-10" />
                              </div>
                              <span className="text-gray-200 group-hover:text-white transition-colors duration-300 relative z-10">Información del Sistema</span>
                              <span className="absolute inset-0 border border-red-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                            </motion.button>

                            {/* Separador */}
                            <div className="relative my-2">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-red-500/30"></div>
                              </div>
                            </div>

                            {/* Botón Cerrar Sesión */}
                            <motion.button
                              whileHover={{ x: 5, backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                logout();
                                setShowUserMenu(false);
                              }}
                              className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-300 relative overflow-hidden group bg-red-600/20 hover:bg-red-600/40"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="p-1.5 rounded-lg bg-red-600/30 group-hover:bg-red-600/50 transition-colors duration-300">
                                <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-400 group-hover:text-white transition-colors duration-300 relative z-10" />
                              </div>
                              <span className="text-red-200 group-hover:text-white transition-colors duration-300 relative z-10">Cerrar Sesión</span>
                              <span className="absolute inset-0 border border-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                            </motion.button>
                          </div>

                          {/* Versión actual */}
                          <div className="mt-4 text-center relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full border-t border-red-500/30"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <motion.span 
                                className="px-3 bg-gradient-to-r from-red-600 to-red-800 text-red-200 text-xs rounded-full py-1 shadow-lg flex items-center"
                                whileHover={{ scale: 1.05 }}
                              >
                                <RocketLaunchIcon className="h-3 w-3 mr-1" />
                                {getVersionFormatted()}
                              </motion.span>
                            </div>
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

      {/* Modal de Perfil */}
      <PerfilModal
        isOpen={showPerfilModal}
        onClose={handleCerrarPerfil}
      />

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Sidebar;