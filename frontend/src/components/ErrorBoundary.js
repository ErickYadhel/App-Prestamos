import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  DocumentTextIcon,
  BugAntIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false,
      recoveryAttempts: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error capturado:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Registrar en un servicio de monitoreo si existe
    if (window.errorTracking) {
      window.errorTracking.captureException(error, { extra: errorInfo });
    }
  }

  handleReload = () => {
    const { recoveryAttempts } = this.state;
    this.setState({ recoveryAttempts: recoveryAttempts + 1 });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      alert('✅ Datos locales limpiados. La página se recargará.');
      window.location.reload();
    } catch (error) {
      console.error('Error limpiando storage:', error);
    }
  };

  render() {
    const { hasError, error, errorInfo, showDetails, recoveryAttempts } = this.state;
    const { theme } = this.props;

    if (!hasError) {
      return this.props.children;
    }

    const isDark = theme === 'dark';

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-red-950 to-black' 
          : 'bg-gradient-to-br from-red-50 via-white to-gray-100'
      }`}>
        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-0 right-0 w-96 h-96 rounded-full ${
            isDark ? 'bg-red-600/10' : 'bg-red-600/5'
          } blur-3xl`} />
          <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full ${
            isDark ? 'bg-red-600/10' : 'bg-red-600/5'
          } blur-3xl`} />
        </div>

        {/* Partículas decorativas */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-red-500/30' : 'bg-red-500/20'}`}
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{
                y: [null, -30, 30, -30],
                x: [null, 30, -30, 30],
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 25 }}
          className="relative max-w-2xl w-full"
        >
          {/* Tarjeta principal con glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-3xl blur-xl opacity-75 animate-pulse" />
          
          <div className={`relative rounded-3xl shadow-2xl overflow-hidden border-2 ${
            isDark 
              ? 'bg-gray-900/95 border-red-600/30' 
              : 'bg-white/95 border-red-600/20'
          } backdrop-blur-xl`}>
            {/* Línea de escaneo */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
            
            {/* Contenido */}
            <div className="p-8 sm:p-10 relative">
              {/* Badge de error */}
              <div className="flex justify-between items-start mb-6">
                <div className={`flex items-center space-x-3 px-3 py-1.5 rounded-full ${
                  isDark ? 'bg-red-600/20 border border-red-600/30' : 'bg-red-100 border border-red-200'
                }`}>
                  <ExclamationTriangleIcon className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={`text-xs font-semibold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    ERROR {recoveryAttempts > 0 ? `#${recoveryAttempts}` : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={this.toggleDetails}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                    title="Ver detalles técnicos"
                  >
                    <BugAntIcon className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={this.handleGoBack}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                    title="Volver atrás"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Icono principal */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className={`p-6 rounded-2xl ${
                  isDark ? 'bg-red-600/20' : 'bg-red-100'
                }`}>
                  <ExclamationTriangleIcon className={`h-16 w-16 ${isDark ? 'text-red-500' : 'text-red-600'}`} />
                </div>
              </motion.div>

              {/* Título y descripción */}
              <div className="text-center mb-8">
                <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  ¡Algo salió mal!
                </h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {error?.message || 'Ha ocurrido un error inesperado en la aplicación'}
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Nuestro equipo ha sido notificado del problema
                </p>
              </div>

              {/* Detalles del error */}
              <AnimatePresence>
                {showDetails && error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-6 overflow-hidden rounded-xl ${
                      isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                    } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="p-4 max-h-48 overflow-auto">
                      <p className={`text-xs font-mono break-all ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        <span className="text-red-500 font-semibold">Error:</span> {error.toString()}
                      </p>
                      {errorInfo && (
                        <p className={`text-xs font-mono break-all mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          <span className="text-red-500 font-semibold">Stack:</span> {errorInfo.componentStack || error.stack}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botones de acción */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleReload}
                  className="col-span-2 sm:col-span-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${recoveryAttempts > 0 ? 'animate-spin' : ''}`} />
                  <span>Recargar</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleGoHome}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <HomeIcon className="h-5 w-5" />
                  <span>Inicio</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleClearStorage}
                  className="px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>Limpiar cache</span>
                </motion.button>
              </div>

              {/* Mensaje de ayuda */}
              <div className={`mt-6 p-4 rounded-xl ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
              } border ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}>
                <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                  <ShieldCheckIcon className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Si el problema persiste, contacta a soporte en 
                    <a 
                      href="mailto:soporte@eysinversiones.com" 
                      className={`ml-1 font-semibold ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                    >
                      soporte@eysinversiones.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-center text-xs ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`}>
                <span>Error ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Estilos CSS para animaciones */}
        <style>{`
          @keyframes scan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-scan {
            animation: scan 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }
}

// Hook para usar el ErrorBoundary en componentes funcionales
export const withErrorBoundary = (Component) => {
  return (props) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;