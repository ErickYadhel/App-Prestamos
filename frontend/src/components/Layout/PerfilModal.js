import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PencilIcon,
  CameraIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  CpuChipIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ============================================
// COMPONENTE DE INPUT MEJORADO
// ============================================
const InputField = ({ icon: Icon, label, value, onChange, type = 'text', placeholder, disabled, error }) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="space-y-1"
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
            isFocused ? 'text-red-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm rounded-xl border-2 transition-all ${
            isFocused 
              ? 'border-red-500 ring-2 ring-red-500/20' 
              : disabled
                ? theme === 'dark'
                  ? 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                  : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'border-gray-700 bg-gray-800 text-white'
                  : 'border-gray-200 bg-white text-gray-900'
          } focus:ring-2 focus:ring-red-500/20 outline-none`}
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL DEL MODAL DE PERFIL
// ============================================
const PerfilModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    departamento: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        departamento: user.departamento || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        departamento: formData.departamento
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      // Actualizar vía API
      const response = await api.put(`/usuarios/${user.id}`, updateData);

      if (response.success) {
        // Actualizar el contexto de autenticación
        if (updateUser) {
          updateUser({
            ...user,
            nombre: formData.nombre,
            telefono: formData.telefono,
            departamento: formData.departamento
          });
        }

        setSuccess('Perfil actualizado exitosamente');
        
        // Limpiar campos de contraseña
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
        
        setIsEditing(false);
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.error || 'Error al actualizar');
      }
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nombre: user?.nombre || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      departamento: user?.departamento || '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setError('');
  };

  if (!isOpen) return null;

  const rolInfo = {
    admin: { nombre: 'Administrador', color: 'from-red-600 to-red-800', icon: ShieldCheckIcon },
    supervisor: { nombre: 'Supervisor', color: 'from-yellow-500 to-yellow-700', icon: ShieldCheckIcon },
    consultor: { nombre: 'Consultor', color: 'from-green-500 to-green-700', icon: ShieldCheckIcon },
    solicitante: { nombre: 'Solicitante', color: 'from-blue-500 to-blue-700', icon: ShieldCheckIcon }
  };

  const rolActual = rolInfo[user?.rol] || rolInfo.consultor;
  const RolIcon = rolActual.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
            </div>

            {/* Header */}
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                    <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Mi Perfil
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Administra tu información personal
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Mensajes de éxito/error */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl flex items-center space-x-2 ${
                    theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
                  } border border-green-200 dark:border-green-800`}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="text-sm">{success}</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl flex items-center space-x-2 ${
                    theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
                  } border border-red-200 dark:border-red-800`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Avatar y rol */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${rolActual.color} flex items-center justify-center shadow-xl`}>
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {user?.nombre?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-1.5 bg-gradient-to-br from-red-600 to-red-800 rounded-full shadow-lg">
                    <CameraIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.nombre}
                    </span>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${rolActual.color} text-white`}>
                      {rolActual.nombre}
                    </div>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <CpuChipIcon className="h-3 w-3 text-gray-400" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      ID: {user?.id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    isEditing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>{isEditing ? 'Cancelar Edición' : 'Editar Perfil'}</span>
                </motion.button>
              </div>

              {/* Formulario de información */}
              <div className="space-y-4">
                <InputField
                  icon={UserCircleIcon}
                  label="Nombre Completo"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={errors.nombre}
                  placeholder="Tu nombre completo"
                />

                <InputField
                  icon={EnvelopeIcon}
                  label="Correo Electrónico"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="tu@email.com"
                />

                <InputField
                  icon={PhoneIcon}
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="809-123-4567"
                />

                <InputField
                  icon={BuildingOfficeIcon}
                  label="Departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Ej: Ventas"
                />

                {/* Sección de cambio de contraseña (solo visible en modo edición) */}
                {isEditing && (
                  <div className={`pt-4 mt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center space-x-2 mb-4">
                      <KeyIcon className="h-5 w-5 text-red-600" />
                      <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Cambiar Contraseña
                      </h4>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        (Opcional)
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-2 rounded-xl border-2 text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                          } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                          placeholder="Nueva contraseña (mínimo 6 caracteres)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2 rounded-xl border-2 text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                          } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                          placeholder="Confirmar nueva contraseña"
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-red-600" />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Miembro desde:</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.fechaCreacion ? new Date(user.fechaCreacion).toLocaleDateString() : 'No disponible'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-red-600" />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Último acceso:</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.ultimoAcceso ? new Date(user.ultimoAcceso).toLocaleString() : 'Nunca'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con botones de acción */}
            <div className={`p-4 sm:p-6 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleCancel}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
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
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PerfilModal;