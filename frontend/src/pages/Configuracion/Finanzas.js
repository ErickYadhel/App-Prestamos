import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CurrencyDollarIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  ClockIcon,
  TrashIcon
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
// COMPONENTE DE INPUT TECNOLÓGICO
// ============================================
const TechInput = ({ icon: Icon, label, error, value, onChange, ...props }) => {
  const [localValue, setLocalValue] = React.useState(value || '');

  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
          )}
          <input
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 dark:text-white`}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/50 rounded-lg pointer-events-none transition-colors"></div>
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE DE SELECT TECNOLÓGICO
// ============================================
const TechSelect = ({ icon: Icon, label, value, onChange, options, ...props }) => {
  const [localValue, setLocalValue] = React.useState(value || '');

  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
          )}
          <select
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 appearance-none dark:text-white cursor-pointer`}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE MONEDA TECNOLÓGICO
// ============================================
const CurrencyCard = ({ moneda, index, onChange, onDelete }) => {
  const getFlagEmoji = (codigo) => {
    const flags = {
      DOP: '🇩🇴',
      USD: '🇺🇸',
      EUR: '🇪🇺',
      GBP: '🇬🇧',
      JPY: '🇯🇵',
      CNY: '🇨🇳',
      BRL: '🇧🇷',
      MXN: '🇲🇽',
      COP: '🇨🇴',
      ARS: '🇦🇷'
    };
    return flags[codigo] || '🏦';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-xl border-2 border-red-600/20 hover:border-red-600/40 transition-all p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{getFlagEmoji(moneda.codigo)}</div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Código</label>
              <input
                type="text"
                value={moneda.codigo}
                onChange={(e) => onChange(index, 'codigo', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-mono uppercase"
                placeholder="USD"
                maxLength="3"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
              <input
                type="text"
                value={moneda.nombre}
                onChange={(e) => onChange(index, 'nombre', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                placeholder="Dólar Americano"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Capital</label>
              <input
                type="number"
                value={moneda.capital}
                onChange={(e) => onChange(index, 'capital', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moneda.activa}
                  onChange={(e) => onChange(index, 'activa', e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Activa</span>
              </label>
              <button
                onClick={() => onDelete(index)}
                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Eliminar moneda"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: FINANZAS
// ============================================
const Finanzas = ({ configuracion, handleInputChange }) => {
  const handleMonedaChange = (index, field, value) => {
    const nuevasMonedas = [...configuracion.monedas];
    nuevasMonedas[index] = { ...nuevasMonedas[index], [field]: value };
    handleInputChange(null, 'monedas', nuevasMonedas);
  };

  const handleAgregarMoneda = () => {
    const nuevasMonedas = [
      ...configuracion.monedas,
      { codigo: '', nombre: '', capital: 0, activa: true }
    ];
    handleInputChange(null, 'monedas', nuevasMonedas);
  };

  const handleEliminarMoneda = (index) => {
    const nuevasMonedas = configuracion.monedas.filter((_, i) => i !== index);
    handleInputChange(null, 'monedas', nuevasMonedas);
  };

  return (
    <motion.div
      key="finanzas"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configuración Financiera</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Parámetros económicos del sistema</p>
            </div>
          </div>

          <div className="mb-6">
            <TechSelect
              icon={GlobeAltIcon}
              label="Moneda Principal"
              value={configuracion?.monedaPrincipal || 'DOP'}
              onChange={(value) => handleInputChange(null, 'monedaPrincipal', value)}
              options={configuracion?.monedas
                .filter(m => m.activa)
                .map(m => ({ value: m.codigo, label: m.nombre }))}
            />
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Monedas Disponibles</h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAgregarMoneda}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>Agregar Moneda</span>
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {configuracion?.monedas.map((moneda, index) => (
                  <CurrencyCard
                    key={index}
                    moneda={moneda}
                    index={index}
                    onChange={handleMonedaChange}
                    onDelete={handleEliminarMoneda}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <TechSelect
              icon={ArrowPathIcon}
              label="Tipo de Carga"
              value={configuracion?.tipoCarga || 'manual'}
              onChange={(value) => handleInputChange(null, 'tipoCarga', value)}
              options={[
                { value: 'manual', label: 'Manual' },
                { value: 'automatica', label: 'Automática' }
              ]}
            />

            <TechInput
              icon={ClockIcon}
              label="Tiempo de Sesión (minutos)"
              type="number"
              value={configuracion?.sesionTiempo || 60}
              onChange={(value) => handleInputChange(null, 'sesionTiempo', parseInt(value) || 60)}
              min="5"
              max="480"
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Finanzas;