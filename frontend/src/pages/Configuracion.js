import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CogIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  BellIcon,
  FolderIcon,
  PaintBrushIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext'; 
import { useAuth } from '../context/AuthContext'; 

// Importar las pestañas desde la carpeta Configuracion/
import Empresa from './Configuracion/Empresa.js';
import Finanzas from './Configuracion/Finanzas.js';
import Notificaciones from './Configuracion/Notificaciones.js';
import Apariencia from './Configuracion/Apariencia.js';
import Backup from './Configuracion/Backup.js';

// ============================================
// COMPONENTE DE SKELETON LOADER
// ============================================
const ConfigSkeleton = () => (
  <div className="space-y-6">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      ))}
    </div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
  </div>
);

// ============================================
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

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
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
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

      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      setSuccess('Configuración guardada exitosamente');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setError(error.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar cambios
  const handleCancelChanges = () => {
    setConfiguracion(JSON.parse(JSON.stringify(originalConfig)));
    setShowExitWarning(false);
  };

  // Navegar entre pestañas
  const handleNavigate = (newTab) => {
    if (JSON.stringify(configuracion) !== JSON.stringify(originalConfig)) {
      setPendingAction(() => () => setActiveTab(newTab));
      setShowExitWarning(true);
    } else {
      setActiveTab(newTab);
    }
  };

  // 👇 PESTAÑAS ACTUALIZADAS (sin Seguridad y sin Roles)
  const tabs = [
    { id: 'empresa', name: 'Empresa', icon: BuildingStorefrontIcon },
    { id: 'finanzas', name: 'Finanzas', icon: CurrencyDollarIcon },
    { id: 'notificaciones', name: 'Notificaciones', icon: BellIcon },
    { id: 'backup', name: 'Backup', icon: FolderIcon },
    { id: 'apariencia', name: 'Apariencia', icon: PaintBrushIcon }
  ];

  if (loading || !configuracion) {
    return <ConfigSkeleton />;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl blur-3xl"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-red-600/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl">
                <CogIcon className="h-8 w-8 text-white animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Configuración
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                  <SparklesIcon className="h-4 w-4 text-yellow-500 mr-2" />
                  Personaliza todos los aspectos del sistema
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              {JSON.stringify(configuracion) !== JSON.stringify(originalConfig) && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setShowExitWarning(true)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span>Cancelar Cambios</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveConfiguracion}
                disabled={saving || JSON.stringify(configuracion) === JSON.stringify(originalConfig)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <CogIcon className="h-5 w-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de advertencia */}
      <AnimatePresence>
        {showExitWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4"
            >
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                ¿Salir sin guardar?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Hay cambios sin guardar. ¿Estás seguro de que quieres salir?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleCancelChanges}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Descartar Cambios
                </button>
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Seguir Editando
                </button>
              </div>
              {pendingAction && (
                <button
                  onClick={() => {
                    pendingAction();
                    setShowExitWarning(false);
                    setPendingAction(null);
                  }}
                  className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Guardar y Continuar
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensajes de éxito/error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-600/20 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-600/20 text-green-700 dark:text-green-400 px-6 py-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5" />
              <span>{success}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs - AHORA SOLO 5 PESTAÑAS */}
      <GlassCard className="p-2">
        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigate(tab.id)}
                className={`relative overflow-hidden group flex-1 min-w-[100px] sm:min-w-[120px]`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-xl shadow-lg"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex flex-col items-center py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-colors ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                }`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                  <span className="text-xs sm:text-sm font-medium">{tab.name}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </GlassCard>

      {/* Contenido de las pestañas */}
      <AnimatePresence mode="wait">
        {activeTab === 'empresa' && (
          <Empresa
            key="empresa"
            configuracion={configuracion}
            handleInputChange={handleInputChange}
          />
        )}
        {activeTab === 'finanzas' && (
          <Finanzas
            key="finanzas"
            configuracion={configuracion}
            handleInputChange={handleInputChange}
          />
        )}
        {activeTab === 'notificaciones' && (
          <Notificaciones
            key="notificaciones"
            configuracion={configuracion}
            handleInputChange={handleInputChange}
          />
        )}
        {activeTab === 'backup' && (
          <Backup key="backup" />
        )}
        {activeTab === 'apariencia' && (
          <Apariencia
            key="apariencia"
            configuracion={configuracion}
            handleInputChange={handleInputChange}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <ClockIcon className="h-4 w-4" />
          <span>Última modificación:</span>
          <span className="font-mono font-medium">
            {new Date(configuracion?.fechaHoraModificacion || Date.now()).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <RocketLaunchIcon className="h-4 w-4 text-red-600 animate-pulse" />
          <span className="text-xs text-gray-500 dark:text-gray-500">v2.0.0</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Configuracion;