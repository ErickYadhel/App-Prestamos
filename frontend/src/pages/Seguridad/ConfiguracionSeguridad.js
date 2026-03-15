import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  ClockIcon,
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  const [localValue, setLocalValue] = useState(value || '');
  const { theme } = useTheme();

  useEffect(() => {
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
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 ${
              theme === 'dark' 
                ? 'bg-gray-900 border-gray-700 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
            } border-2 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300`}
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
  const [isChecked, setIsChecked] = useState(checked || false);

  useEffect(() => {
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
      <div className="flex-1">
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
// COMPONENTE DE SELECCIÓN DE POLÍTICAS
// ============================================
const PolicySelector = ({ label, description, options, value, onChange }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-3 rounded-lg border-2 transition-all ${
              value === option.value
                ? 'border-red-600 bg-red-600/10 text-red-600 dark:text-red-400'
                : theme === 'dark'
                  ? 'border-gray-700 hover:border-red-600/50 text-gray-400'
                  : 'border-gray-200 hover:border-red-600/50 text-gray-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: CONFIGURACIÓN DE SEGURIDAD
// ============================================
const ConfiguracionSeguridad = ({ configuracion, handleInputChange, onGuardar }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Guardar configuración en Firebase
  const guardarConfiguracion = async () => {
    try {
      setGuardando(true);
      setError('');
      
      const configRef = doc(db, 'Configuracion', 'seguridad');
      await setDoc(configRef, {
        ...configuracion,
        actualizadoPor: user?.email,
        fechaActualizacion: new Date().toISOString()
      }, { merge: true });
      
      setExito('Configuración guardada exitosamente');
      setTimeout(() => setExito(''), 3000);
      
      if (onGuardar) onGuardar();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setError('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const politicasContraseña = [
    { value: 'basica', label: 'Básica' },
    { value: 'media', label: 'Media' },
    { value: 'fuerte', label: 'Fuerte' },
    { value: 'personalizada', label: 'Personalizada' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Mensajes de error/éxito */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400 flex items-start space-x-3"
        >
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {exito && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400 flex items-start space-x-3"
        >
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{exito}</p>
        </motion.div>
      )}

      {/* Configuración de Autenticación */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg">
              <KeyIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Autenticación</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configuración de métodos de autenticación</p>
            </div>
          </div>

          <div className="space-y-4">
            <TechToggle
              label="Verificación de Email"
              description="Requerir verificación de email al registrarse"
              checked={configuracion?.seguridad?.requiereVerificacionEmail || false}
              onChange={(value) => handleInputChange('seguridad', 'requiereVerificacionEmail', value)}
            />

            <TechToggle
              label="Autenticación de Dos Factores (2FA)"
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
          </div>
        </div>
      </GlassCard>

      {/* Configuración de Contraseñas */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
              <LockClosedIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Políticas de Contraseñas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configuración de seguridad de contraseñas</p>
            </div>
          </div>

          <div className="space-y-6">
            <PolicySelector
              label="Nivel de Seguridad"
              description="Define la complejidad requerida para las contraseñas"
              options={politicasContraseña}
              value={configuracion?.seguridad?.politicaContraseña || 'media'}
              onChange={(value) => handleInputChange('seguridad', 'politicaContraseña', value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <TechToggle
              label="Exigir Caracteres Especiales"
              description="Requerir al menos un carácter especial (!@#$%)"
              checked={configuracion?.seguridad?.requiereCaracteresEspeciales || false}
              onChange={(value) => handleInputChange('seguridad', 'requiereCaracteresEspeciales', value)}
            />

            <TechToggle
              label="Exigir Mayúsculas"
              description="Requerir al menos una letra mayúscula"
              checked={configuracion?.seguridad?.requiereMayusculas || false}
              onChange={(value) => handleInputChange('seguridad', 'requiereMayusculas', value)}
            />

            <TechToggle
              label="Exigir Números"
              description="Requerir al menos un número"
              checked={configuracion?.seguridad?.requiereNumeros || false}
              onChange={(value) => handleInputChange('seguridad', 'requiereNumeros', value)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Configuración de Sesiones */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sesiones</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configuración de tiempo de sesión</p>
            </div>
          </div>

          <div className="space-y-4">
            <TechToggle
              label="Bloqueo Automático"
              description="Bloquear sesión por inactividad"
              checked={configuracion?.seguridad?.bloqueoAutomatico || false}
              onChange={(value) => handleInputChange('seguridad', 'bloqueoAutomatico', value)}
            />

            <TechInput
              icon={ClockIcon}
              label="Minutos de Inactividad"
              type="number"
              value={configuracion?.seguridad?.minutosInactividad || 30}
              onChange={(value) => handleInputChange('seguridad', 'minutosInactividad', parseInt(value) || 30)}
              min="5"
              max="120"
              disabled={!configuracion?.seguridad?.bloqueoAutomatico}
            />
          </div>
        </div>
      </GlassCard>

      {/* Configuración de Notificaciones */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl shadow-lg">
              <BellIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notificaciones de Seguridad</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Alertas y notificaciones</p>
            </div>
          </div>

          <div className="space-y-4">
            <TechToggle
              label="Notificar Intentos Fallidos"
              description="Enviar notificaciones por intentos fallidos de login"
              checked={configuracion?.seguridad?.notificarIntentosFallidos || false}
              onChange={(value) => handleInputChange('seguridad', 'notificarIntentosFallidos', value)}
            />

            <TechToggle
              label="Notificar Nuevos Dispositivos"
              description="Alertar cuando se inicie sesión desde un dispositivo nuevo"
              checked={configuracion?.seguridad?.notificarNuevosDispositivos || false}
              onChange={(value) => handleInputChange('seguridad', 'notificarNuevosDispositivos', value)}
            />

            <TechToggle
              label="Registro Completo"
              description="Registrar todas las actividades del sistema"
              checked={configuracion?.seguridad?.registroCompleto || false}
              onChange={(value) => handleInputChange('seguridad', 'registroCompleto', value)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Botón Guardar */}
      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={guardarConfiguracion}
          disabled={guardando}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {guardando ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              <span>Guardar Configuración</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ConfiguracionSeguridad;