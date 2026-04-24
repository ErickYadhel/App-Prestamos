import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';

const AdvancedFilters = ({ filters, onFilterChange, onClose }) => {
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const emptyFilters = { periodo: 'mes', año: new Date().getFullYear().toString() };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
    onClose();
  };

  const periodos = [
    { value: 'mes', label: 'Este Mes' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'ayer', label: 'Ayer' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'trimestre', label: 'Este Trimestre' },
    { value: 'año', label: 'Este Año' },
    { value: 'todo', label: 'Todo el Tiempo' },
    { value: 'personalizado', label: 'Personalizado' }
  ];

  const años = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(localFilters);
    return filterKeys.some(key => 
      key !== 'periodo' && key !== 'año' && localFilters[key] && localFilters[key] !== ''
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <GlassCard>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                <FunnelIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Filtros Avanzados
                {hasActiveFilters() && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-600 text-white rounded-full">
                    Activos
                  </span>
                )}
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Período
              </label>
              <select
                value={localFilters.periodo || 'mes'}
                onChange={(e) => handleChange('periodo', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              >
                {periodos.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Año
              </label>
              <select
                value={localFilters.año || new Date().getFullYear().toString()}
                onChange={(e) => handleChange('año', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              >
                {años.map(año => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Provincia
              </label>
              <select
                value={localFilters.provincia || ''}
                onChange={(e) => handleChange('provincia', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              >
                <option value="">Todas las provincias</option>
                <option value="SD">Santo Domingo</option>
                <option value="Santiago">Santiago</option>
                <option value="La Vega">La Vega</option>
                <option value="Puerto Plata">Puerto Plata</option>
                <option value="Distrito Nacional">Distrito Nacional</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Rango de Monto
              </label>
              <select
                value={localFilters.rangoMonto || ''}
                onChange={(e) => handleChange('rangoMonto', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              >
                <option value="">Todos los montos</option>
                <option value="0-50000">0 - 50,000</option>
                <option value="50000-100000">50,000 - 100,000</option>
                <option value="100000-250000">100,000 - 250,000</option>
                <option value="250000-500000">250,000 - 500,000</option>
                <option value="500000+">500,000+</option>
              </select>
            </div>

            {localFilters.periodo === 'personalizado' && (
              <>
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={localFilters.fechaInicio || ''}
                    onChange={(e) => handleChange('fechaInicio', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                  />
                </div>
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={localFilters.fechaFin || ''}
                    onChange={(e) => handleChange('fechaFin', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <button
              onClick={clearFilters}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Limpiar filtros
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={applyFilters}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Aplicar Filtros
            </motion.button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default AdvancedFilters;