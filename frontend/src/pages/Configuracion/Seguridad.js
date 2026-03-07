import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon
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
// COMPONENTE DE TOGGLE TECNOLÓGICO
// ============================================
const TechToggle = ({ label, description, checked, onChange }) => {
  const [isChecked, setIsChecked] = React.useState(checked || false);

  React.useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(newValue);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-red-600/20 hover:border-red-600/50 transition-all cursor-pointer group"
      onClick={handleToggle}
    >
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isChecked ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <motion.div
          animate={{ x: isChecked ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: SEGURIDAD
// ============================================
const Seguridad = ({ configuracion, handleInputChange }) => {
  return (
    <motion.div
      key="seguridad"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Seguridad</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Protege tu sistema y datos</p>
            </div>
          </div>

          <div className="space-y-6">
            <TechToggle
              label="Verificación de Email"
              description="Requerir verificación de email al registrarse"
              checked={configuracion?.seguridad?.requiereVerificacionEmail || false}
              onChange={(value) => handleInputChange('seguridad', 'requiereVerificacionEmail', value)}
            />

            <TechToggle
              label="Autenticación de Dos Factores"
              description="Requerir 2FA para accesos administrativos"
              checked={configuracion?.seguridad?.autenticacionDosFactores || false}
              onChange={(value) => handleInputChange('seguridad', 'autenticacionDosFactores', value)}
            />

            <TechToggle
              label="Sesión Única"
              description="Permitir solo una sesión activa por usuario"
              checked={configuracion?.seguridad?.sesionUnica || false}
              onChange={(value) => handleInputChange('seguridad', 'sesionUnica', value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <TechInput
                icon={KeyIcon}
                label="Intentos Máximos de Login"
                type="number"
                value={configuracion?.seguridad?.intentosLoginMaximos || 5}
                onChange={(value) => handleInputChange('seguridad', 'intentosLoginMaximos', parseInt(value) || 5)}
                min="1"
                max="10"
              />

              <TechInput
                icon={LockClosedIcon}
                label="Longitud Mínima de Contraseña"
                type="number"
                value={configuracion?.seguridad?.longitudMinimaPassword || 6}
                onChange={(value) => handleInputChange('seguridad', 'longitudMinimaPassword', parseInt(value) || 6)}
                min="6"
                max="20"
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Seguridad;