import React from 'react';
import { motion } from 'framer-motion';
import { LockClosedIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const AccessBlocked = ({ motivo, regla }) => {
  const { theme } = useTheme();
  
  const handleReintentar = () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #1a0000 100%)'
      }}
    >
      <div className="relative max-w-md w-full">
        {/* Efecto de brillo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur-2xl opacity-75 animate-pulse" />
        
        <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/50 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        } p-8 text-center`}>
          
          {/* Icono de bloqueo */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-600/20 rounded-full border-2 border-red-600 animate-pulse">
              <LockClosedIcon className="h-16 w-16 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-red-600 mb-2">
            ACCESO DENEGADO
          </h1>
          
          <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-red-800 mx-auto rounded-full mb-6" />
          
          <div className="space-y-4">
            {/* Motivo del bloqueo */}
            <div className="p-4 bg-red-600/10 rounded-lg border border-red-600/30">
              <p className="text-gray-300 font-medium">
                {motivo || 'No tienes permisos para acceder al sistema en este momento'}
              </p>
            </div>
            
            {/* Regla aplicada */}
            {regla && (
              <div className="p-3 bg-yellow-600/10 rounded-lg border border-yellow-600/30">
                <p className="text-yellow-400 text-sm">
                  <span className="font-semibold">Regla aplicada:</span> {regla}
                </p>
              </div>
            )}
            
            {/* Información adicional */}
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <p>Contacta al administrador del sistema si crees que es un error</p>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-6 flex flex-col space-y-3">
            <button
              onClick={handleReintentar}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30 flex items-center justify-center space-x-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Reintentar</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-300"
            >
              Cerrar Sesión
            </button>
          </div>
          
          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-4">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AccessBlocked;