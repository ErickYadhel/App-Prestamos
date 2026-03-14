import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  KeyIcon,
  ChartBarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import api from '../services/api';
import { useError } from '../context/ErrorContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Componente de Skeleton Loader
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="grid grid-cols-6 gap-4">
          <div className="h-4 bg-gray-200 rounded col-span-2"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
        </div>
      ))}
    </div>
  </div>
);

// Modal de confirmación mejorado
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                {type === 'danger' ? (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                )}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Componente de filtros avanzados
const AdvancedFilters = ({ filters, onFilterChange, onClose, rolesDisponibles }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-xl p-6 mb-6 border border-gray-200"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros Avanzados</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            value={localFilters.rol || ''}
            onChange={(e) => handleChange('rol', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
          >
            <option value="">Todos los roles</option>
            {rolesDisponibles.map(rol => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre || rol.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={localFilters.estado || ''}
            onChange={(e) => handleChange('estado', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
          <input
            type="text"
            value={localFilters.departamento || ''}
            onChange={(e) => handleChange('departamento', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
            placeholder="Filtrar por departamento"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={() => {
            setLocalFilters({});
            onFilterChange({});
            onClose();
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Limpiar filtros
        </button>
        <button onClick={applyFilters} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Aplicar filtros
        </button>
      </div>
    </motion.div>
  );
};

// Función para obtener color según el rol (para estadísticas)
const getColorForRol = (rolId) => {
  const colorMap = {
    admin: 'purple',
    supervisor: 'blue',
    solicitante: 'green',
    consultor: 'gray'
  };
  return colorMap[rolId] || 'indigo';
};

// Función para obtener estilos del rol
const getRolStyles = (rolId, rolesDisponibles) => {
  const rol = rolesDisponibles.find(r => r.id === rolId);

  if (rol?.color) {
    return rol.color.includes('from-')
      ? `${rol.color} text-white`
      : `${rol.color} text-white`;
  }

  switch (rolId) {
    case 'admin':
      return 'bg-purple-600 text-white';
    case 'supervisor':
      return 'bg-blue-600 text-white';
    case 'solicitante':
      return 'bg-green-600 text-white';
    case 'consultor':
      return 'bg-gray-600 text-white';
    default:
      return 'bg-indigo-600 text-white';
  }
};

// Función para obtener texto del rol
const getRolText = (rolId, rolesDisponibles) => {
  const rol = rolesDisponibles.find(r => r.id === rolId);

  if (rol?.nombre) {
    return rol.nombre;
  }

  const rolesDefault = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    solicitante: 'Solicitante',
    consultor: 'Consultor'
  };

  return rolesDefault[rolId] || rolId;
};

// Componente de tarjeta de estadística
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colors[color] || colors.gray}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Componente de formulario de usuario
const UsuarioForm = ({ editingUsuario, onBack, onSave, rolesDisponibles, loadingRoles }) => {
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    password: '',
    rol: '',
    telefono: '',
    departamento: '',
    activo: true,
    color: undefined,
    foto: '',
    ...(editingUsuario || {})
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [fotoPreview, setFotoPreview] = useState('');

  // Actualizar vista previa cuando cambia la URL de la foto
  useEffect(() => {
    if (formData.foto) {
      setFotoPreview(formData.foto);
    } else {
      setFotoPreview('');
    }
  }, [formData.foto]);

  // Debug: Mostrar roles cuando se renderiza el componente
  useEffect(() => {
    console.log('📋 UsuarioForm - rolesDisponibles:', rolesDisponibles);
  }, [rolesDisponibles]);

  // Establecer rol por defecto cuando se cargan los roles
  useEffect(() => {
    if (!editingUsuario && rolesDisponibles.length > 0 && !formData.rol) {
      const rolDefault = rolesDisponibles.find(r => r.id === 'solicitante') || rolesDisponibles[0];
      if (rolDefault) {
        setFormData(prev => ({ ...prev, rol: rolDefault.id }));
      }
    }
  }, [rolesDisponibles, editingUsuario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email es inválido';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.rol) {
      newErrors.rol = 'Debes seleccionar un rol';
    }

    if (!editingUsuario && !formData.password) {
      newErrors.password = 'La contraseña es requerida para nuevos usuarios';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validación de URL de foto (opcional)
    if (formData.foto && !isValidUrl(formData.foto)) {
      newErrors.foto = 'La URL de la foto no es válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para validar URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSend = editingUsuario && !formData.password
        ? { ...formData, password: undefined }
        : formData;
      onSave(dataToSend);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto mt-8"
    >
      <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700">
        <h3 className="text-lg font-medium text-white">
          {editingUsuario ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda - Información básica */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
                  placeholder="usuario@empresa.com"
                  disabled={editingUsuario}
                />
              </div>
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              {editingUsuario && (
                <p className="text-xs text-gray-500 mt-1">
                  <EnvelopeIcon className="h-3 w-3 inline mr-1" />
                  El email no se puede cambiar (es el identificador único)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña {!editingUsuario && <span className="text-red-600">*</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
                  placeholder={editingUsuario ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              {editingUsuario && (
                <p className="text-xs text-gray-500 mt-1">
                  <KeyIcon className="h-3 w-3 inline mr-1" />
                  Solo completa este campo si deseas cambiar la contraseña
                </p>
              )}
            </div>
          </div>

          {/* Columna derecha - Información adicional */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white appearance-none cursor-pointer"
                  disabled={loadingRoles}
                >
                  <option value="" className="text-gray-500 bg-white">
                    {loadingRoles ? 'Cargando roles...' : '-- Selecciona un rol --'}
                  </option>

                  {rolesDisponibles.length > 0 ? (
                    rolesDisponibles.map(rol => (
                      <option
                        key={rol.id}
                        value={rol.id}
                        className="text-gray-900 bg-white"
                      >
                        {rol.nombre || rol.id}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled className="text-gray-400 bg-white">
                      No hay roles disponibles
                    </option>
                  )}
                </select>

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.rol && <p className="text-red-600 text-sm mt-1">{errors.rol}</p>}
              {loadingRoles && (
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <ArrowPathIcon className="h-3 w-3 animate-spin mr-1" />
                  Cargando roles...
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
                  placeholder="809-123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
                  placeholder="Ej: Ventas, Administración, etc."
                />
              </div>
            </div>
          </div>

          {/* Fila completa para Foto de perfil */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto de perfil (URL)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhotoIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="foto"
                    value={formData.foto}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                  />
                </div>
                {errors.foto && <p className="text-red-600 text-sm mt-1">{errors.foto}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa una URL válida de una imagen (opcional)
                </p>
              </div>
              
              {/* Vista previa de la foto */}
              <div className="flex items-center justify-center md:justify-start">
                {fotoPreview ? (
                  <div className="relative group">
                    <img
                      src={fotoPreview}
                      alt="Vista previa"
                      className="h-20 w-20 rounded-lg object-cover border-2 border-gray-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80?text=Error';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, foto: '' }));
                        setFotoPreview('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar foto"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Color de identificación */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de identificación
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2 flex-wrap gap-2">
                {['bg-red-600', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-600', 'bg-pink-500', 'bg-indigo-500'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-lg ${color} ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      } transition-all hover:scale-110`}
                    title={`Color ${color}`}
                  />
                ))}
              </div>
              {formData.color && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: undefined }))}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Quitar color personalizado
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selecciona un color para identificar rápidamente al usuario en la interfaz
            </p>
          </div>

          {editingUsuario && (
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span className="text-sm text-gray-700">Usuario activo</span>
              </label>
            </div>
          )}
        </div>

        {/* Panel de debug - Solo visible en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p className="font-semibold text-yellow-700">🔍 Debug Info:</p>
            <p>Total roles: {rolesDisponibles.length}</p>
            <p>Rol seleccionado: {formData.rol || 'ninguno'}</p>
            <p>Email: {formData.email}</p>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {editingUsuario ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// Componente principal
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { showError, showSuccess, showWarning } = useError();
  const { user: currentUser } = useAuth();

  // Cargar roles desde Firebase
  const cargarRoles = useCallback(async () => {
    try {
      setLoadingRoles(true);
      console.log('🔄 Cargando roles desde Firebase...');
      const rolesRef = collection(db, 'Roles');
      const rolesSnap = await getDocs(rolesRef);

      const roles = [];
      rolesSnap.forEach(doc => {
        roles.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ Roles cargados desde Firebase:', roles);
      setRolesDisponibles(roles);
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
      showError('Error al cargar los roles');
    } finally {
      setLoadingRoles(false);
    }
  }, [showError]);

  // Cargar usuarios desde API - CORREGIDO
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📡 Cargando usuarios desde API backend...');

      const response = await api.get('/usuarios');
      console.log('✅ Usuarios cargados:', response.data);

      // Verificar diferentes formatos de respuesta
      if (response.data && Array.isArray(response.data)) {
        // Si la API devuelve directamente un array
        setUsuarios(response.data);
        setApiConnected(true);
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Si la API devuelve { success: true, data: [...] }
        setUsuarios(response.data.data);
        setApiConnected(true);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Si la API devuelve { data: [...] } sin success
        setUsuarios(response.data.data);
        setApiConnected(true);
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response.data);
        setUsuarios([]);
      }

    } catch (error) {
      console.error('❌ Error fetching users:', error);

      const errorMessage = error.response?.data?.error || error.message || 'Error al cargar los usuarios';
      showError(errorMessage);

      setApiConnected(false);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarRoles();
    fetchUsuarios();
  }, [cargarRoles, fetchUsuarios]);

  // Debug: Verificar roles cargados
  useEffect(() => {
    console.log('📋 Roles disponibles en el componente principal:', rolesDisponibles);
  }, [rolesDisponibles]);

  // Filtrar y ordenar usuarios
  const filteredAndSortedUsuarios = useMemo(() => {
    let filtered = [...usuarios];

    if (searchTerm) {
      filtered = filtered.filter(usuario =>
        usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.telefono?.includes(searchTerm)
      );
    }

    if (filters.rol) {
      filtered = filtered.filter(u => u.rol === filters.rol);
    }
    if (filters.estado) {
      filtered = filtered.filter(u =>
        filters.estado === 'activo' ? u.activo : !u.activo
      );
    }
    if (filters.departamento) {
      filtered = filtered.filter(u =>
        u.departamento?.toLowerCase().includes(filters.departamento.toLowerCase())
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'fechaCreacion' || sortConfig.key === 'ultimoAcceso') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [usuarios, searchTerm, filters, sortConfig]);

  // Estadísticas
  const stats = useMemo(() => {
    const activos = usuarios.filter(u => u.activo).length;

    const porRol = {};
    rolesDisponibles.forEach(rol => {
      porRol[rol.id] = usuarios.filter(u => u.rol === rol.id).length;
    });

    return {
      total: usuarios.length,
      activos,
      inactivos: usuarios.length - activos,
      porRol,
      conAccesoReciente: usuarios.filter(u => {
        const ultimoAcceso = new Date(u.ultimoAcceso || 0);
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);
        return ultimoAcceso > hace7Dias;
      }).length,
      intentosFallidos: usuarios.reduce((sum, u) => sum + (u.intentosFallidos || 0), 0)
    };
  }, [usuarios, rolesDisponibles]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExport = () => {
    const dataToExport = selectedUsuarios.length > 0
      ? usuarios.filter(u => selectedUsuarios.includes(u.id))
      : filteredAndSortedUsuarios;

    let exportData;
    let filename;
    let mimeType;

    switch (exportFormat) {
      case 'json':
        exportData = JSON.stringify(dataToExport, null, 2);
        filename = 'usuarios.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        const headers = ['ID', 'Nombre', 'Email', 'Rol', 'Departamento', 'Estado', 'Teléfono', 'Color', 'Foto'];
        const rows = dataToExport.map(u => [
          u.id,
          u.nombre,
          u.email,
          u.rol,
          u.departamento || '',
          u.activo ? 'Activo' : 'Inactivo',
          u.telefono || '',
          u.color || '',
          u.foto || ''
        ]);
        exportData = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = 'usuarios.csv';
        mimeType = 'text/csv';
        break;
      default:
        return;
    }

    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess(`Exportados ${dataToExport.length} usuarios correctamente`);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsuarios.length === 0) {
      showWarning('Selecciona al menos un usuario');
      return;
    }

    try {
      setLoading(true);

      switch (action) {
        case 'activate':
          await Promise.all(selectedUsuarios.map(id =>
            api.put(`/usuarios/${id}/reactivar`)
          ));
          showSuccess(`${selectedUsuarios.length} usuarios activados`);
          break;
        case 'deactivate':
          await Promise.all(selectedUsuarios.map(id =>
            api.delete(`/usuarios/${id}`)
          ));
          showSuccess(`${selectedUsuarios.length} usuarios desactivados`);
          break;
        case 'delete':
          if (window.confirm(`¿Eliminar ${selectedUsuarios.length} usuarios permanentemente?`)) {
            await Promise.all(selectedUsuarios.map(id =>
              api.delete(`/usuarios/${id}/permanent`)
            ));
            showSuccess(`${selectedUsuarios.length} usuarios eliminados`);
          }
          break;
      }

      await fetchUsuarios();
      setSelectedUsuarios([]);
      setShowBulkActions(false);

    } catch (error) {
      console.error('Error en acción masiva:', error);
      showError('Error al ejecutar acción masiva');
    } finally {
      setLoading(false);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc'
      ? <ArrowUpIcon className="h-4 w-4 inline ml-1" />
      : <ArrowDownIcon className="h-4 w-4 inline ml-1" />;
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingUsuario(null);
    setSearchTerm('');
    setShowSearch(false);
  };

  // CORREGIDO: Función para guardar usuario
  const handleSaveUsuario = async (usuarioData) => {
    try {
      console.log('💾 Guardando usuario a través de API:', { 
        ...usuarioData, 
        password: usuarioData.password ? '***' : undefined 
      });

      let response;

      if (editingUsuario) {
        // Actualizar usuario existente
        response = await api.put(`/usuarios/${editingUsuario.id}`, usuarioData);
        console.log('✅ Usuario actualizado en backend:', response.data);
        showSuccess('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        response = await api.post('/usuarios', usuarioData);
        console.log('✅ Usuario creado en backend:', response.data);
        showSuccess('Usuario creado exitosamente. Ya puede iniciar sesión.');
      }

      // Recargar la lista de usuarios
      await fetchUsuarios();
      
      // Cerrar el formulario
      setShowForm(false);
      setEditingUsuario(null);

    } catch (error) {
      console.error('❌ Error al guardar usuario:', error);
      
      // Mostrar mensaje de error específico del backend si existe
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar el usuario';
      showError(errorMessage);
    }
  };

  const handleReactivarUsuario = async (usuarioId) => {
    if (window.confirm('¿Estás seguro de que quieres reactivar este usuario?')) {
      try {
        await api.put(`/usuarios/${usuarioId}/reactivar`);
        showSuccess('Usuario reactivado exitosamente');
        await fetchUsuarios();
      } catch (error) {
        console.error('Error al reactivar usuario:', error);
        showError('Error al reactivar el usuario');
      }
    }
  };

  const handleDeleteUsuario = async (usuarioId) => {
    try {
      await api.delete(`/usuarios/${usuarioId}`);
      showSuccess('Usuario eliminado exitosamente');
      await fetchUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showError('Error al eliminar el usuario');
    }
  };

  if (showForm) {
    return (
      <UsuarioForm
        editingUsuario={editingUsuario}
        onBack={handleBackToList}
        onSave={handleSaveUsuario}
        rolesDisponibles={rolesDisponibles}
        loadingRoles={loadingRoles}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="h-8 w-8 text-red-600 mr-3" />
            Usuarios
          </h1>
          <p className="text-gray-600">Gestiona los usuarios del sistema y sus permisos</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 border-2 rounded-lg transition-colors flex items-center space-x-2 ${showFilters
                ? 'border-red-600 bg-red-50 text-red-600'
                : 'border-gray-300 hover:border-red-600 hover:bg-red-50 text-gray-700'
              }`}
            title="Filtros avanzados"
          >
            <FunnelIcon className="h-5 w-5" />
            {Object.keys(filters).length > 0 && (
              <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Object.keys(filters).length}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 text-gray-700"
              title="Exportar datos"
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setExportFormat('json');
                        handleExport();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Exportar como JSON
                    </button>
                    <button
                      onClick={() => {
                        setExportFormat('csv');
                        handleExport();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Exportar como CSV
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => {
              cargarRoles();
              fetchUsuarios();
            }}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 text-gray-700"
            title="Refrescar datos"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              setEditingUsuario(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            filters={filters}
            onFilterChange={setFilters}
            onClose={() => setShowFilters(false)}
            rolesDisponibles={rolesDisponibles}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUsuarios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-wrap items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <span className="text-red-700 font-medium">
                {selectedUsuarios.length} usuario{selectedUsuarios.length !== 1 ? 's' : ''} seleccionado{selectedUsuarios.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedUsuarios([])}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Limpiar selección
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
              >
                Activar
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm"
              >
                Desactivar
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={UserGroupIcon} label="Total" value={stats.total} color="blue" />
        <StatCard icon={CheckCircleIcon} label="Activos" value={stats.activos} color="green" />
        <StatCard icon={XCircleIcon} label="Inactivos" value={stats.inactivos} color="red" />
        <StatCard icon={ChartBarIcon} label="Acceso reciente" value={stats.conAccesoReciente} color="yellow" />
        <StatCard icon={ExclamationTriangleIcon} label="Intentos fallidos" value={stats.intentosFallidos} color="orange" />

        {rolesDisponibles.map(rol => (
          <StatCard
            key={rol.id}
            icon={rol.icon || ShieldCheckIcon}
            label={rol.nombre || rol.id}
            value={stats.porRol[rol.id] || 0}
            color={getColorForRol(rol.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, email, departamento o teléfono..."
                className="w-full pl-10 pr-10 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8">
            <SkeletonLoader />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                      <input
                        type="checkbox"
                        checked={selectedUsuarios.length === filteredAndSortedUsuarios.length && filteredAndSortedUsuarios.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsuarios(filteredAndSortedUsuarios.map(u => u.id));
                          } else {
                            setSelectedUsuarios([]);
                          }
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('nombre')}>
                      Usuario {getSortIcon('nombre')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}>
                      Contacto {getSortIcon('email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('departamento')}>
                      Departamento {getSortIcon('departamento')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('rol')}>
                      Rol {getSortIcon('rol')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('activo')}>
                      Estado {getSortIcon('activo')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('ultimoAcceso')}>
                      Último acceso {getSortIcon('ultimoAcceso')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedUsuarios.map((usuario) => (
                    <motion.tr
                      key={usuario.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-gray-50 transition-colors ${selectedUsuarios.includes(usuario.id) ? 'bg-red-50' : ''
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsuarios.includes(usuario.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsuarios([...selectedUsuarios, usuario.id]);
                            } else {
                              setSelectedUsuarios(selectedUsuarios.filter(id => id !== usuario.id));
                            }
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {usuario.foto ? (
                            <img
                              src={usuario.foto}
                              alt={usuario.nombre}
                              className="h-10 w-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${usuario.nombre}&background=random`;
                              }}
                            />
                          ) : (
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${usuario.color ? usuario.color : getRolStyles(usuario.rol, rolesDisponibles).split(' ')[0]
                              }`}>
                              {usuario.nombre?.charAt(0)}
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.nombre}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {new Date(usuario.fechaCreacion).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{usuario.email}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {usuario.telefono || 'No especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {usuario.departamento || 'No especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRolStyles(usuario.rol, rolesDisponibles)}`}>
                          {getRolText(usuario.rol, rolesDisponibles)}
                        </span>
                        {usuario.intentosFallidos > 3 && (
                          <div className="flex items-center mt-1 text-xs text-red-600">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            {usuario.intentosFallidos} intentos
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {usuario.activo ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-sm text-gray-900">
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {usuario.ultimoAcceso ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(usuario.ultimoAcceso).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(usuario.ultimoAcceso).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Nunca</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingUsuario(usuario);
                              setShowForm(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 p-2 rounded hover:bg-yellow-50 transition-colors"
                            title="Editar usuario"
                            disabled={currentUser?.rol !== 'admin' && usuario.rol === 'admin'}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>

                          {usuario.activo ? (
                            <button
                              onClick={() => {
                                setUsuarioToDelete(usuario);
                                setShowConfirmModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                              title="Desactivar usuario"
                              disabled={currentUser?.id === usuario.id}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivarUsuario(usuario.id)}
                              className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 transition-colors"
                              title="Reactivar usuario"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAndSortedUsuarios.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="text-gray-500 mb-4">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'No se encontraron usuarios con esos criterios'
                    : 'No hay usuarios registrados'}
                </div>
                {!searchTerm && Object.keys(filters).length === 0 && (
                  <button
                    onClick={() => {
                      setEditingUsuario(null);
                      setShowForm(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    <span>Crear Primer Usuario</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {filteredAndSortedUsuarios.length > 0 && (
        <div className="bg-white rounded-lg px-6 py-4 flex flex-wrap items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{filteredAndSortedUsuarios.length}</span> de{' '}
            <span className="font-medium">{usuarios.length}</span> usuarios
            {selectedUsuarios.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedUsuarios.length}</span> seleccionados)
              </span>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 text-sm text-gray-700"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>{showSearch ? 'Ocultar' : 'Buscar'}</span>
            </button>
            <button
              onClick={() => {
                setEditingUsuario(null);
                setShowForm(true);
              }}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setUsuarioToDelete(null);
        }}
        onConfirm={() => {
          if (usuarioToDelete) {
            handleDeleteUsuario(usuarioToDelete.id);
          }
          setShowConfirmModal(false);
          setUsuarioToDelete(null);
        }}
        title="Desactivar Usuario"
        message={`¿Estás seguro de que quieres desactivar a ${usuarioToDelete?.nombre}? El usuario no podrá acceder al sistema hasta que sea reactivado.`}
        type="danger"
      />
    </div>
  );
};

export default Usuarios;