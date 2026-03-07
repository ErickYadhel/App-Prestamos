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
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [empresaNombre, setEmpresaNombre] = useState('EYS Inversiones');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const sidebarOpen = isFixed || isHovered || isOpen;

  // Escuchar cambios en el logo y nombre de empresa desde Configuración
  useEffect(() => {
    const handleLogoUpdate = (event) => {
      setLogoUrl(event.detail);
    };

    const handleEmpresaNombreUpdate = (event) => {
      setEmpresaNombre(event.detail);
    };

    // Cargar logo guardado
    const savedLogo = localStorage.getItem('empresaLogo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }

    // Cargar nombre de empresa guardado
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

  const getRoleIcon = (rol) => {
    switch(rol) {
      case 'admin': return <BriefcaseIcon className="h-5 w-5" />;
      case 'supervisor': return <ShieldCheckIcon className="h-5 w-5" />;
      case 'consultor': return <EyeIcon className="h-5 w-5" />;
      case 'solicitante': return <ClipboardDocumentListIcon className="h-5 w-5" />;
      default: return <UserCircleIcon className="h-5 w-5" />;
    }
  };

  const getRoleColor = (rol) => {
    switch(rol) {
      case 'admin': return 'bg-gradient-to-br from-red-600 to-red-800';
      case 'supervisor': return 'bg-gradient-to-br from-yellow-500 to-yellow-700';
      case 'consultor': return 'bg-gradient-to-br from-green-500 to-green-700';
      case 'solicitante': return 'bg-gradient-to-br from-blue-500 to-blue-700';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-700';
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon, roles: ['admin', 'consultor', 'solicitante', 'supervisor'] },
    { name: 'Clientes', path: '/clientes', icon: UsersIcon, roles: ['admin', 'consultor', 'supervisor'] },
    { name: 'Préstamos', path: '/prestamos', icon: CurrencyDollarIcon, roles: ['admin', 'consultor', 'supervisor'] },
    { name: 'Pagos', path: '/pagos', icon: CreditCardIcon, roles: ['admin', 'consultor', 'supervisor'] },
    { name: 'Solicitudes', path: '/solicitudes', icon: DocumentTextIcon, roles: ['admin', 'consultor', 'solicitante'] },
    { name: 'Garantes', path: '/garantes', icon: UserGroupIcon, roles: ['admin', 'consultor'] },
    { name: 'Usuarios', path: '/usuarios', icon: UsersIcon, roles: ['admin'] },
    { name: 'Notificaciones', path: '/notificaciones', icon: BellIcon, roles: ['admin', 'consultor', 'solicitante', 'supervisor'] },
    { name: 'Configuración', path: '/configuracion', icon: CogIcon, roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.rol || 'admin')
  );

  return (
    <>
      {/* Sidebar */}
      <motion.div
        className={`h-screen relative flex-shrink-0 ${
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
        {/* Logo - Versión MEJORADA */}
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

        {/* Botón fijar (solo visible en hover) */}
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
          </ul>
        </nav>
      </motion.div>

      {/* Header Superior */}
      <div className={`flex-1 flex flex-col overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <header className={`${
          theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        } border-b sticky top-0 z-10`}>
          <div className="flex justify-between items-center px-6 py-3">
            <div>
              <h1 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {empresaNombre} {/* El nombre de la empresa en el header */}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sistema de Gestión de Préstamos
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
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

              {/* Notificaciones */}
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
                  <div className={`${getRoleColor(user?.rol)} rounded-lg p-2 text-white relative z-10 shadow-lg transition-all group-hover:shadow-red-600/50 group-hover:scale-110`}>
                    {getRoleIcon(user?.rol)}
                  </div>
                  <span className="absolute inset-0 border-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></span>
                </motion.button>

                {/* Menú desplegable del usuario */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-black opacity-95"></div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                      
                      <div className="relative p-5 backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full filter blur-3xl opacity-20"></div>
                        
                        {/* Info del usuario */}
                        <div className="relative z-10">
                          <div className="flex items-center space-x-4">
                            <div className={`${getRoleColor(user?.rol)} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-xl transform -rotate-3 hover:rotate-0 transition-transform`}>
                              <span className="text-2xl font-bold">{user?.nombre?.charAt(0)}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-bold text-lg truncate">
                                {user?.nombre}
                              </p>
                              <div className="flex items-center mt-1">
                                <span className={`w-2 h-2 rounded-full mr-2 ${getRoleColor(user?.rol)} animate-pulse`}></span>
                                <p className="text-red-200 text-sm font-medium">
                                  {user?.rol?.charAt(0).toUpperCase() + user?.rol?.slice(1)}
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
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          {children}
        </main>
      </div>
    </>
  );
};

export default Sidebar;