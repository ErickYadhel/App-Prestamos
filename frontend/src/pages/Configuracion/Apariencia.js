import React from 'react';
import { motion } from 'framer-motion';
import {
  PaintBrushIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

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
// COMPONENTE DE COLOR PICKER TECNOLÓGICO
// ============================================
const TechColorPicker = ({ label, value, onChange }) => {
  const [localValue, setLocalValue] = React.useState(value || '#DC2626');

  React.useEffect(() => {
    setLocalValue(value || '#DC2626');
  }, [value]);

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-3">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          <input
            type="color"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer relative border-2 border-red-600/20 hover:border-red-600 transition-colors"
          />
        </motion.div>
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 dark:text-white font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: APARIENCIA
// ============================================
const Apariencia = ({ configuracion, handleInputChange }) => {
  return (
    <motion.div
      key="apariencia"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
              <PaintBrushIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Apariencia</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza la interfaz del sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechColorPicker
              label="Color Primario"
              value={configuracion?.colores?.primario || '#DC2626'}
              onChange={(value) => handleInputChange('colores', 'primario', value)}
            />

            <TechColorPicker
              label="Color Secundario"
              value={configuracion?.colores?.secundario || '#000000'}
              onChange={(value) => handleInputChange('colores', 'secundario', value)}
            />
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-600/20">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Vista Previa
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div 
                  className="h-12 rounded-lg flex items-center justify-center text-white font-medium shadow-lg"
                  style={{ backgroundColor: configuracion?.colores?.primario || '#DC2626' }}
                >
                  Botón Primario
                </div>
                <p className="text-xs text-center text-gray-500">Color Primario</p>
              </div>
              <div className="space-y-2">
                <div 
                  className="h-12 rounded-lg flex items-center justify-center text-white font-medium shadow-lg"
                  style={{ backgroundColor: configuracion?.colores?.secundario || '#000000' }}
                >
                  Elemento Secundario
                </div>
                <p className="text-xs text-center text-gray-500">Color Secundario</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Apariencia;