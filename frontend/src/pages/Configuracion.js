import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CogIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  BellIcon,
  FolderIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  ServerIcon,
  PuzzlePieceIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  KeyIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  WrenchScrewdriverIcon,
  SignalIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  CpuChipIcon,
  BoltIcon,
  ShieldCheckIcon as ShieldCheckIconSolid
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getVersionFormatted } from '../config/version';

// Importar las pestañas desde la carpeta Configuracion/
import Empresa from './Configuracion/Empresa.js';
import Finanzas from './Configuracion/Finanzas.js';
import Notificaciones from './Configuracion/Notificaciones.js';
import Apariencia from './Configuracion/Apariencia.js';
import Backup from './Configuracion/Backup.js';

// ============================================
// COMPONENTE DE SKELETON LOADER
// ============================================
const ConfigSkeleton = () => {
  const { theme } = useTheme();
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className={`h-12 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse w-1/3`} />
      <div className={`h-8 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse w-2/3`} />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-24 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl animate-pulse`} />
        ))}
      </div>
      <div className={`h-64 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl animate-pulse`} />
    </div>
  );
};

// ============================================
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl shadow-2xl border transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700/50 hover:border-red-600/30'
          : 'bg-white/80 backdrop-blur-xl border-gray-200/50 hover:border-red-600/30'
      } ${className}`}
    >
      {/* Efecto de brillo superior */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      
      {/* Efecto de escaneo sutíl */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-scan" />
      </div>
      
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered }) => {
  const { theme } = useTheme();
  
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur transition-all duration-500 ${
        isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
      }`} />
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-lg transition-all duration-700 ${
        isHovered ? 'opacity-70' : 'opacity-0 group-hover:opacity-40'
      }`} />
      <div className="relative transform transition-all duration-300 group-hover:scale-[1.01]">
        {children}
      </div>
    </div>
  );
};

// ============================================
// TARJETA DE ESTADÍSTICA DE CONFIGURACIÓN MEJORADA
// ============================================
const ConfigStatCard = ({ icon: Icon, label, value, color, description }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const gradientColors = {
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
    yellow: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700',
    indigo: 'from-indigo-500 to-indigo-700',
    cyan: 'from-cyan-500 to-cyan-700',
    pink: 'from-pink-500 to-pink-700',
    teal: 'from-teal-500 to-teal-700'
  };

  const colorMap = {
    red: { light: 'bg-red-50/80 border-red-200', dark: 'bg-red-950/30 border-red-800/50' },
    green: { light: 'bg-green-50/80 border-green-200', dark: 'bg-green-950/30 border-green-800/50' },
    blue: { light: 'bg-blue-50/80 border-blue-200', dark: 'bg-blue-950/30 border-blue-800/50' },
    yellow: { light: 'bg-yellow-50/80 border-yellow-200', dark: 'bg-yellow-950/30 border-yellow-800/50' },
    purple: { light: 'bg-purple-50/80 border-purple-200', dark: 'bg-purple-950/30 border-purple-800/50' },
    indigo: { light: 'bg-indigo-50/80 border-indigo-200', dark: 'bg-indigo-950/30 border-indigo-800/50' },
    cyan: { light: 'bg-cyan-50/80 border-cyan-200', dark: 'bg-cyan-950/30 border-cyan-800/50' },
    pink: { light: 'bg-pink-50/80 border-pink-200', dark: 'bg-pink-950/30 border-pink-800/50' },
    teal: { light: 'bg-teal-50/80 border-teal-200', dark: 'bg-teal-950/30 border-teal-800/50' }
  };

  const getColorClasses = () => {
    const base = colorMap[color] || colorMap.blue;
    return theme === 'dark' ? base.dark : base.light;
  };

  return (
    <BorderGlow isHovered={isHovered}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 ${getColorClasses()} shadow-lg`}
      >
        {/* Efecto de brillo de fondo */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradientColors[color]} rounded-full filter blur-3xl opacity-10 transition-opacity duration-500 ${
          isHovered ? 'opacity-30' : ''
        }`} />
        
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradientColors[color]} transition-all duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-40'
        }`} />
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className={`text-[10px] font-medium tracking-wider uppercase ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {label}
            </p>
            <p className={`text-xl font-bold mt-1 transition-colors duration-300 ${
              isHovered ? `text-${color}-600 dark:text-${color}-400` : theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {value}
            </p>
            {description && (
              <p className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {description}
              </p>
            )}
          </div>
          <div className={`p-2 rounded-xl bg-gradient-to-br ${gradientColors[color]} shadow-lg transition-all duration-300 ${
            isHovered ? 'scale-110 rotate-6 shadow-xl' : ''
          }`}>
            <Icon className={`h-5 w-5 text-white transition-all duration-300 ${
              isHovered ? 'rotate-3' : ''
            }`} />
          </div>
        </div>

        {/* Efecto de escaneo al hacer hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
          </div>
        )}
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE INDICADOR DE CAMBIOS MEJORADO
// ============================================
const CambiosIndicador = ({ hasChanges, onSave, onCancel, saving }) => {
  const { theme } = useTheme();

  if (!hasChanges) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-auto"
    >
      <div className={`flex flex-wrap items-center justify-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border-2 ${
        theme === 'dark'
          ? 'bg-gray-900/95 backdrop-blur-xl border-yellow-700/50'
          : 'bg-white/95 backdrop-blur-xl border-yellow-500/30'
      }`}>
        {/* Efecto de brillo */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-yellow-500/10 pointer-events-none" />
        
        <div className="relative flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 relative" />
          </div>
          <span className="text-sm font-semibold">Cambios pendientes</span>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

        <button
          onClick={onCancel}
          disabled={saving}
          className={`relative px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 text-sm ${
            theme === 'dark'
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } disabled:opacity-50`}
        >
          <XMarkIcon className="h-4 w-4" />
          <span>Descartar</span>
        </button>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(239, 68, 68, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          disabled={saving}
          className="relative px-5 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all flex items-center space-x-1.5 disabled:opacity-50 text-sm overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          
          {saving ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin relative z-10" />
              <span className="relative z-10">Guardando...</span>
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Guardar</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE TAB MEJORADO
// ============================================
const TabButton = ({ tab, isActive, onClick }) => {
  const { theme } = useTheme();
  const Icon = tab.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(tab.id)}
      className={`relative overflow-hidden group flex-1 min-w-[70px] sm:min-w-[100px] lg:min-w-[120px] rounded-xl transition-all duration-300 ${
        isActive ? 'shadow-lg' : ''
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-xl shadow-xl"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      
      {!isActive && (
        <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
          isHovered
            ? theme === 'dark'
              ? 'bg-gray-700/50'
              : 'bg-gray-100/50'
            : 'bg-transparent'
        }`} />
      )}
      
      <div className={`relative z-10 flex flex-col items-center py-2.5 sm:py-3.5 px-1 sm:px-2 lg:px-4 rounded-xl transition-colors ${
        isActive 
          ? 'text-white' 
          : theme === 'dark'
            ? 'text-gray-400 hover:text-gray-200'
            : 'text-gray-600 hover:text-gray-900'
      }`}>
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 transition-transform duration-300 ${
          isHovered && !isActive ? 'scale-110' : ''
        }`} />
        <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-center leading-tight">
          {tab.name}
        </span>
        {tab.description && (
          <span className={`hidden lg:block text-[8px] mt-0.5 transition-opacity duration-300 ${
            isActive ? 'text-white/70' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {tab.description}
          </span>
        )}
      </div>
    </motion.button>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Configuracion = () => {
  const [configuracion, setConfiguracion] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('empresa');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const { theme } = useTheme();
  const { user } = useAuth();

  // Configuración por defecto
  const mockConfiguracion = {
    empresaNombre: 'EYS Inversiones',
    dueno: user?.nombre || 'Erick Ysabel',
    ubicacion: 'Santo Domingo, República Dominicana',
    numero: '809-123-4567',
    correo: 'info@eysinversiones.com',
    sitioWeb: 'https://www.eysinversiones.com',
    rnc: '123-456789-0',
    logoUrl: '',
    monedaPrincipal: 'DOP',
    monedas: [
      { codigo: 'DOP', nombre: 'Peso Dominicano', capital: 300000, activa: true },
      { codigo: 'USD', nombre: 'Dólar Americano', capital: 10000, activa: true },
      { codigo: 'EUR', nombre: 'Euro', capital: 5000, activa: false }
    ],
    tipoCarga: 'manual',
    sesionTiempo: 60,
    fechaHoraModificacion: new Date().toISOString(),
    colores: {
      primario: '#DC2626',
      secundario: '#000000'
    },
    notificaciones: {
      recordatoriosPago: true,
      alertasMora: true,
      confirmacionesPago: true,
      notificacionesSolicitudes: true,
      emailReportes: false,
      smsAlertas: false
    },
    backup: {
      automatico: true,
      frecuencia: 'diario',
      hora: '02:00',
      retencionDias: 7,
      comprimir: true,
      googleDrive: {
        enabled: false,
        folderId: '',
        accessToken: ''
      }
    }
  };

  // Cargar configuración guardada
  useEffect(() => {
    const savedConfig = localStorage.getItem('empresaConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfiguracion(parsedConfig);
      setOriginalConfig(JSON.parse(JSON.stringify(parsedConfig)));
      
      if (parsedConfig.logoUrl) {
        window.dispatchEvent(new CustomEvent('logoActualizado', { detail: parsedConfig.logoUrl }));
      }
      if (parsedConfig.empresaNombre) {
        window.dispatchEvent(new CustomEvent('empresaNombreActualizado', { detail: parsedConfig.empresaNombre }));
      }
    } else {
      setConfiguracion(mockConfiguracion);
      setOriginalConfig(JSON.parse(JSON.stringify(mockConfiguracion)));
    }
    setLoading(false);
  }, []);

  // Detectar cambios
  const hasChanges = () => {
    if (!configuracion || !originalConfig) return false;
    return JSON.stringify(configuracion) !== JSON.stringify(originalConfig);
  };

  // Función para actualizar configuración
  const handleInputChange = useCallback((section, field, value) => {
    setConfiguracion(prev => {
      if (!prev) return prev;
      
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  }, []);

  // Guardar configuración
  const handleSaveConfiguracion = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      if (!configuracion.empresaNombre.trim()) {
        setError('El nombre de la empresa es requerido');
        setSaving(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1200));
      
      localStorage.setItem('empresaConfig', JSON.stringify(configuracion));
      
      if (configuracion.colores) {
        document.documentElement.style.setProperty('--color-primario', configuracion.colores.primario);
        document.documentElement.style.setProperty('--color-secundario', configuracion.colores.secundario);
      }

      if (configuracion.logoUrl) {
        localStorage.setItem('empresaLogo', configuracion.logoUrl);
        window.dispatchEvent(new CustomEvent('logoActualizado', { detail: configuracion.logoUrl }));
      }
      
      if (configuracion.empresaNombre) {
        localStorage.setItem('empresaNombre', configuracion.empresaNombre);
        window.dispatchEvent(new CustomEvent('empresaNombreActualizado', { detail: configuracion.empresaNombre }));
      }

      setConfiguracion(prev => ({
        ...prev,
        fechaHoraModificacion: new Date().toISOString()
      }));

      setOriginalConfig(JSON.parse(JSON.stringify(configuracion)));
      setSuccess('✅ Configuración guardada exitosamente');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setError('❌ ' + (error.message || 'Error al guardar la configuración'));
    } finally {
      setSaving(false);
    }
  };

  // Cancelar cambios
  const handleCancelChanges = () => {
    setConfiguracion(JSON.parse(JSON.stringify(originalConfig)));
    setSuccess('🔄 Cambios descartados');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Navegar entre pestañas
  const handleNavigate = (newTab) => {
    setActiveTab(newTab);
  };

  // Filtrar pestañas por búsqueda
  const tabs = [
    { id: 'empresa', name: 'Empresa', icon: BuildingStorefrontIcon, description: 'Datos de la empresa' },
    { id: 'finanzas', name: 'Finanzas', icon: CurrencyDollarIcon, description: 'Monedas y capital' },
    { id: 'notificaciones', name: 'Notificaciones', icon: BellIcon, description: 'Alertas y recordatorios' },
    { id: 'apariencia', name: 'Apariencia', icon: PaintBrushIcon, description: 'Colores y diseño' },
    { id: 'backup', name: 'Backup', icon: FolderIcon, description: 'Copias de seguridad' }
  ];

  const filteredTabs = searchTerm 
    ? tabs.filter(tab => 
        tab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tab.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tabs;

  // Estadísticas de configuración
  const configStats = {
    totalSecciones: tabs.length,
    configurada: Object.values(configuracion || {}).filter(v => v && v !== '').length,
    pendientes: hasChanges() ? 1 : 0
  };

  if (loading || !configuracion) {
    return <ConfigSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${
          theme === 'dark' 
            ? 'from-red-600/10 to-red-800/10' 
            : 'from-red-600/10 to-red-800/10'
        } rounded-3xl blur-3xl animate-gradient-xy`} />
        
        <div className={`relative rounded-3xl shadow-2xl p-6 sm:p-8 border-2 transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gray-900/90 backdrop-blur-xl border-red-600/20 hover:border-red-600/40'
            : 'bg-white/90 backdrop-blur-xl border-red-600/20 hover:border-red-600/40'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur-xl opacity-50" />
                <div className="relative p-3 sm:p-4 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl">
                  <CogIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-spin-slow" />
                </div>
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-800 bg-clip-text text-transparent`}>
                  Configuración
                </h1>
                <p className={`text-sm sm:text-base mt-1 flex items-center flex-wrap gap-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <SparklesIcon className="h-4 w-4 text-yellow-500 animate-pulse" />
                  Personaliza todos los aspectos del sistema
                  {hasChanges() && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      theme === 'dark'
                        ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    }`}>
                      <ClockIcon className="h-3 w-3 mr-1 animate-pulse" />
                      Cambios pendientes
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2.5 rounded-xl transition-all ${
                  showSearch
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
                title="Buscar sección"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              <button
                onClick={handleCancelChanges}
                disabled={!hasChanges() || saving}
                className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 text-sm ${
                  hasChanges()
                    ? theme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    : 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                }`}
              >
                <XMarkIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Descartar</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(239, 68, 68, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveConfiguracion}
                disabled={!hasChanges() || saving}
                className={`px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-1.5 text-sm overflow-hidden relative ${
                  hasChanges() && !saving
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                    : 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500'
                }`}
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Guardar</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${
                    theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-100 to-white'
                  } rounded-xl opacity-50`} />
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar sección de configuración..."
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800/80 border-gray-700 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'bg-white/80 border-gray-200 text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      }`}
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-red-600 transition-colors" />
                      </button>
                    )}
                  </div>
                  <p className={`text-xs mt-1.5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {filteredTabs.length} secciones encontradas
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mensajes de éxito/error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl border-2 flex items-center space-x-3 ${
              theme === 'dark'
                ? 'bg-red-950/40 border-red-800/50 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl border-2 flex items-center space-x-3 ${
              theme === 'dark'
                ? 'bg-green-950/40 border-green-800/50 text-green-400'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <GlassCard>
        <div className="p-2 sm:p-3">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {filteredTabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={handleNavigate}
              />
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Contenido de las pestañas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'empresa' && (
            <Empresa
              configuracion={configuracion}
              handleInputChange={handleInputChange}
            />
          )}
          {activeTab === 'finanzas' && (
            <Finanzas
              configuracion={configuracion}
              handleInputChange={handleInputChange}
            />
          )}
          {activeTab === 'notificaciones' && (
            <Notificaciones
              configuracion={configuracion}
              handleInputChange={handleInputChange}
            />
          )}
          {activeTab === 'backup' && (
            <Backup />
          )}
          {activeTab === 'apariencia' && (
            <Apariencia
              configuracion={configuracion}
              handleInputChange={handleInputChange}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex flex-col sm:flex-row justify-between items-center gap-3 p-4 rounded-2xl border-2 ${
          theme === 'dark'
            ? 'bg-gray-800/50 border-gray-700/50'
            : 'bg-gray-50/80 border-gray-200'
        }`}
      >
        <div className={`flex items-center space-x-2 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <ClockIcon className="h-4 w-4" />
          <span>Última modificación:</span>
          <span className={`font-mono font-medium text-xs sm:text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {new Date(configuracion?.fechaHoraModificacion || Date.now()).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {hasChanges() && (
            <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-xs font-medium">Cambios sin guardar</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <RocketLaunchIcon className="h-4 w-4 text-red-600 animate-pulse" />
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {getVersionFormatted()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Indicador flotante de cambios pendientes */}
      <CambiosIndicador
        hasChanges={hasChanges()}
        onSave={handleSaveConfiguracion}
        onCancel={handleCancelChanges}
        saving={saving}
      />

      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Configuracion;