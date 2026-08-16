import React, { useState, useEffect, useRef } from 'react';
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
  ClockIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  PhotoIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getVersionFormatted } from '../../config/version';

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
const InputField = ({ icon: Icon, label, value, onChange, type = 'text', placeholder, disabled, error, onFocus, onBlur }) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <motion.div 
      className="space-y-1"
      animate={{ scale: isFocused ? 1.01 : 1 }}
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
          name={label.toLowerCase().replace(/\s/g, '')}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
// COMPONENTE DE INPUT DE TEXTO ÁREA
// ============================================
const TextAreaField = ({ icon: Icon, label, value, onChange, placeholder, disabled, rows = 2 }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-1">
      <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
        <textarea
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={rows}
          className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border-2 transition-all resize-none ${
            disabled
              ? theme === 'dark'
                ? 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
              : theme === 'dark'
                ? 'border-gray-700 bg-gray-800 text-white focus:border-red-500'
                : 'border-gray-200 bg-white text-gray-900 focus:border-red-500'
          } focus:ring-2 focus:ring-red-500/20 outline-none`}
          placeholder={placeholder}
        />
      </div>
    </div>
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
  const [userInfo, setUserInfo] = useState({
    ultimoAcceso: null,
    ultimaIP: null,
    ultimoNavegador: null,
    ultimaPlataforma: null,
    fechaRegistro: null
  });
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    departamento: '',
    fotoPerfil: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [fotoPreview, setFotoPreview] = useState(null);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const fileInputRef = useRef(null);
  const modalContentRef = useRef(null);

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        departamento: user.departamento || '',
        fotoPerfil: user.fotoPerfil || user.foto || user.photoURL || '',
        password: '',
        confirmPassword: ''
      });
      setFotoPreview(user.fotoPerfil || user.foto || user.photoURL || null);
      cargarInfoUsuario();
    }
  }, [user, isOpen]);

  const cargarInfoUsuario = async () => {
    if (!user?.id && !user?.uid) return;
    
    try {
      const userId = user.id || user.uid;
      const userRef = doc(db, 'usuarios', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserInfo({
          ultimoAcceso: data.ultimoAcceso || user.ultimoAcceso || null,
          ultimaIP: data.ultimaIP || user.ultimaIP || null,
          ultimoNavegador: data.ultimoNavegador || user.ultimoNavegador || null,
          ultimaPlataforma: data.ultimaPlataforma || user.ultimaPlataforma || null,
          fechaRegistro: data.fechaCreacion || user.fechaCreacion || null
        });
        if (data.fotoPerfil || data.foto || data.photoURL) {
          const foto = data.fotoPerfil || data.foto || data.photoURL;
          setFotoPreview(foto);
          setFormData(prev => ({ ...prev, fotoPerfil: foto }));
        }
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFotoChange = (e) => {
    const url = e.target.value.trim();
    setFormData(prev => ({ ...prev, fotoPerfil: url }));
    setFotoPreview(url);
    if (errors.fotoPerfil) {
      setErrors(prev => ({ ...prev, fotoPerfil: '' }));
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

    if (formData.fotoPerfil && !formData.fotoPerfil.match(/^https?:\/\/.+/)) {
      newErrors.fotoPerfil = 'La URL debe comenzar con http:// o https://';
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
        departamento: formData.departamento,
        fotoPerfil: formData.fotoPerfil || null
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      // Actualizar vía API
      const response = await api.put(`/usuarios/${user.id}`, updateData);

      if (response.success) {
        // Actualizar el contexto de autenticación
        if (updateUser) {
          await updateUser({
            ...user,
            nombre: formData.nombre,
            telefono: formData.telefono,
            departamento: formData.departamento,
            fotoPerfil: formData.fotoPerfil || null
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
      fotoPerfil: user?.fotoPerfil || user?.foto || user?.photoURL || '',
      password: '',
      confirmPassword: ''
    });
    setFotoPreview(user?.fotoPerfil || user?.foto || user?.photoURL || null);
    setErrors({});
    setError('');
  };

  if (!isOpen) return null;

  const rolInfo = {
    admin: { nombre: 'Administrador', color: 'from-red-600 to-red-800', icon: ShieldCheckIcon },
    supervisor: { nombre: 'Supervisor', color: 'from-yellow-500 to-yellow-700', icon: ShieldCheckIcon },
    consultor: { nombre: 'Consultor', color: 'from-green-500 to-green-700', icon: ShieldCheckIcon },
    solicitante: { nombre: 'Solicitante', color: 'from-blue-500 to-blue-700', icon: ShieldCheckIcon },
    garante: { nombre: 'Garante', color: 'from-purple-500 to-purple-700', icon: ShieldCheckIcon },
    agente: { nombre: 'Agente', color: 'from-pink-500 to-pink-700', icon: ShieldCheckIcon }
  };

  const rolActual = rolInfo[user?.rol] || rolInfo.consultor;
  const RolIcon = rolActual.icon;

      // ============================================
    // FUNCIÓN PARA FORMATEAR FECHA EN DD/MM/YYYY HH:MM:SS
    // ============================================
    const formatDate = (date) => {
      if (!date) return 'No disponible';
      try {
        const fecha = new Date(date);
        if (isNaN(fecha.getTime())) return 'No disponible';
        
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const año = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        const segundos = String(fecha.getSeconds()).padStart(2, '0');
        
        return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
      } catch {
        return 'No disponible';
      }
    };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          } max-h-[95vh] sm:max-h-[90vh] flex flex-col`}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
            </div>

            {/* Header */}
            <div className={`flex-shrink-0 p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                    <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Mi Perfil
                    </h3>
                    <p className={`text-xs sm:text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Administra tu información personal
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    theme === 'dark' 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido - Scrollable */}
            <div ref={modalContentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Mensajes de éxito/error */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-xl flex items-center space-x-2 ${
                      theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
                    } border border-green-200 dark:border-green-800`}
                  >
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-xl flex items-center space-x-2 ${
                      theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
                    } border border-red-200 dark:border-red-800`}
                  >
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Avatar y rol */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative flex-shrink-0">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt={user?.nombre || 'Usuario'}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentNode;
                        if (parent) {
                          const div = document.createElement('div');
                          div.className = `w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${rolActual.color} flex items-center justify-center shadow-xl`;
                          div.innerHTML = `<span class="text-3xl sm:text-4xl font-bold text-white">${user?.nombre?.charAt(0) || 'U'}</span>`;
                          parent.appendChild(div);
                        }
                      }}
                    />
                  ) : (
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${rolActual.color} flex items-center justify-center shadow-xl`}>
                      <span className="text-3xl sm:text-4xl font-bold text-white">
                        {user?.nombre?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 p-1.5 bg-gradient-to-br from-red-600 to-red-800 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                      <CameraIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <span className={`text-lg sm:text-xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.nombre}
                    </span>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${rolActual.color} text-white whitespace-nowrap`}>
                      {rolActual.nombre}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                    <CpuChipIcon className="h-3 w-3 text-gray-400" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      ID: {user?.id?.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
                    <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {user?.email}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 flex-shrink-0 ${
                    isEditing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
                </motion.button>
              </div>

              {/* Formulario de información */}
              <div className="space-y-4">
                <InputField
                  icon={UserCircleIcon}
                  label="Nombre Completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={errors.nombre}
                  placeholder="Tu nombre completo"
                />

                <InputField
                  icon={EnvelopeIcon}
                  label="Correo Electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="tu@email.com"
                />

                <InputField
                  icon={PhoneIcon}
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="809-123-4567"
                />

                <InputField
                  icon={BuildingOfficeIcon}
                  label="Departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Ej: Ventas"
                />

                {/* 🔥 Campo para foto de perfil */}
                {isEditing && (
                  <div className="space-y-2">
                    <label className={`block text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <PhotoIcon className="h-4 w-4 inline mr-2" />
                      URL de Foto de Perfil
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        name="fotoPerfil"
                        value={formData.fotoPerfil}
                        onChange={handleFotoChange}
                        className={`flex-1 px-4 py-2 rounded-xl border-2 text-sm ${
                          errors.fotoPerfil
                            ? 'border-red-500 ring-2 ring-red-500/20'
                            : theme === 'dark'
                              ? 'border-gray-700 bg-gray-800 text-white focus:border-red-500'
                              : 'border-gray-200 bg-white text-gray-900 focus:border-red-500'
                        } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                        placeholder="https://ejemplo.com/foto.jpg"
                      />
                      {fotoPreview && (
                        <div className="flex-shrink-0">
                          <img
                            src={fotoPreview}
                            alt="Vista previa"
                            className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {errors.fotoPerfil && <p className="text-xs text-red-500">{errors.fotoPerfil}</p>}
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Ingresa la URL de una imagen para tu foto de perfil
                    </p>
                  </div>
                )}

                {/* Sección de cambio de contraseña (solo visible en modo edición) */}
                {isEditing && (
                  <div className={`pt-4 mt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center space-x-2 mb-4">
                      <KeyIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
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
                            errors.password
                              ? 'border-red-500 ring-2 ring-red-500/20'
                              : theme === 'dark'
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
                            errors.confirmPassword
                              ? 'border-red-500 ring-2 ring-red-500/20'
                              : theme === 'dark'
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

              {/* 🔥 Información adicional mejorada */}
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-2 mb-3">
                  <InformationCircleIcon className="h-4 w-4 text-red-600" />
                  <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Información de la Cuenta
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Miembro desde:</span>
                    <span className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(userInfo.fechaRegistro || user?.fechaCreacion)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Último acceso:</span>
                    <span className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(userInfo.ultimoAcceso || user?.ultimoAcceso)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GlobeAltIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>IP:</span>
                    <span className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {userInfo.ultimaIP || user?.ultimaIP || 'No disponible'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ComputerDesktopIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Navegador:</span>
                    <span className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {userInfo.ultimoNavegador || user?.ultimoNavegador || 'No disponible'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:col-span-2">
                    <DevicePhoneMobileIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Dispositivo:</span>
                    <span className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {userInfo.ultimaPlataforma || user?.ultimaPlataforma || 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge de versión */}
              <div className="flex justify-center">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                  } border`}>
                  <SparklesIcon className="h-3 w-3 text-red-600" />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Sistema EYS Inversiones {getVersionFormatted()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer con botones de acción - Fijo abajo */}
            <div className={`flex-shrink-0 p-4 sm:p-6 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCancel}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors text-sm sm:text-base ${
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
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
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
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
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