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
  PhotoIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  EllipsisVerticalIcon,
  ClockIcon,
  UserIcon,
  NoSymbolIcon,
  ArrowUturnLeftIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import api from '../services/api';
import { useError } from '../context/ErrorContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered, color = 'from-red-600 via-red-500 to-red-600' }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// Componente de Skeleton Loader
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="grid grid-cols-6 gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
        </div>
      ))}
    </div>
  </div>
);

// Modal de confirmación mejorado
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-6 text-center`}>
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                type === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                {type === 'danger' ? (
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                ) : (
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {message}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all ${
                    type === 'danger'
                      ? 'bg-gradient-to-r from-red-600 to-red-700'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-700'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente de filtros avanzados
const AdvancedFilters = ({ filters, onFilterChange, onClose, rolesDisponibles }) => {
  const { theme } = useTheme();
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
      className={`relative overflow-hidden rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-red-800/5" />
      
      <div className="flex justify-between items-center mb-4 relative">
        <h3 className={`text-base sm:text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Filtros Avanzados
        </h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 relative">
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Rol
          </label>
          <select
            value={localFilters.rol || ''}
            onChange={(e) => handleChange('rol', e.target.value)}
            className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 text-sm ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
            } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
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
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Estado
          </label>
          <select
            value={localFilters.estado || ''}
            onChange={(e) => handleChange('estado', e.target.value)}
            className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 text-sm ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
            } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Departamento
          </label>
          <input
            type="text"
            value={localFilters.departamento || ''}
            onChange={(e) => handleChange('departamento', e.target.value)}
            className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 text-sm ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
            } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
            placeholder="Filtrar por departamento"
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 mt-4 relative">
        <button
          onClick={() => {
            setLocalFilters({});
            onFilterChange({});
            onClose();
          }}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Limpiar filtros
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={applyFilters}
          className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Aplicar filtros
        </motion.button>
      </div>
    </motion.div>
  );
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
      return 'bg-red-600 text-white';
    case 'supervisor':
      return 'bg-yellow-600 text-white';
    case 'solicitante':
      return 'bg-blue-600 text-white';
    case 'consultor':
      return 'bg-green-600 text-white';
    default:
      return 'bg-gray-600 text-white';
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
const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
    yellow: 'from-yellow-500 to-yellow-700',
    gray: 'from-gray-500 to-gray-700',
    purple: 'from-purple-500 to-purple-700'
  };

  return (
    <BorderGlow isHovered={isHovered} color={colors[color]}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl cursor-pointer group ${
          theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'
        } border-2 border-transparent hover:border-${color}-600/30 transition-all duration-300`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={`absolute -top-20 -right-20 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br ${colors[color]} rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse`} />
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan" />
        </div>

        <div className="relative p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
              <CpuChipIcon className="h-3 w-3" />
            </div>
          </div>
          
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE MENÚ DE ACCIONES (3 PUNTOS)
// ============================================
const ActionMenu = ({ usuario, onEditar, onDesactivar, onEliminar, onReactivar, onEliminarPermanente }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1.5 sm:p-2 rounded-full transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        }`}
      >
        <EllipsisVerticalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute right-0 mt-1 sm:mt-2 w-48 sm:w-56 rounded-xl shadow-2xl overflow-hidden z-50 border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar(usuario);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <PencilIcon className="h-4 w-4 text-yellow-600" />
                <span>Editar usuario</span>
              </button>

              {usuario.activo ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDesactivar(usuario);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <NoSymbolIcon className="h-4 w-4 text-yellow-600" />
                  <span>Desactivar usuario</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReactivar(usuario.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ArrowUturnLeftIcon className="h-4 w-4 text-green-600" />
                  <span>Reactivar usuario</span>
                </button>
              )}

              <div className={`my-1 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`⚠️ ¿Estás SEGURO de que quieres ELIMINAR PERMANENTEMENTE a ${usuario.nombre}?\n\nEsta acción NO se puede deshacer y eliminará todos los datos del usuario.`)) {
                    onEliminarPermanente(usuario.id);
                  }
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
                <span className="font-bold text-red-600">Eliminar PERMANENTEMENTE</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// FUNCIONES PARA FORMATEAR FECHAS DE MANERA SEGURA
// ============================================
const convertirFechaFirebase = (fecha) => {
  if (!fecha) return null;
  
  try {
    // Si es un Timestamp de Firebase (objeto con _seconds)
    if (fecha && typeof fecha === 'object' && '_seconds' in fecha) {
      return new Date(fecha._seconds * 1000 + (fecha._nanoseconds || 0) / 1000000);
    }
    // Si es un objeto Date
    else if (fecha instanceof Date) {
      return fecha;
    }
    // Si es un string o número
    else {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) return null;
      return fechaObj;
    }
  } catch (error) {
    console.error('Error convirtiendo fecha:', error);
    return null;
  }
};

const formatearFechaSegura = (fecha, formato = 'completo') => {
  if (!fecha) return 'No registrada';
  
  try {
    const fechaObj = convertirFechaFirebase(fecha);
    if (!fechaObj) return 'Fecha inválida';
    
    if (formato === 'corto') {
      return fechaObj.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    
    return fechaObj.toLocaleString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('❌ Error formateando fecha:', error, fecha);
    return 'Error en fecha';
  }
};

const formatearFechaCorta = (fecha) => {
  if (!fecha) return 'No registrada';
  try {
    const fechaObj = convertirFechaFirebase(fecha);
    if (!fechaObj) return 'Inválida';
    return fechaObj.toLocaleDateString();
  } catch {
    return 'Error';
  }
};

// ============================================
// COMPONENTE DE FORMULARIO DE USUARIO
// ============================================
const UsuarioForm = ({ editingUsuario, onBack, onSave, rolesDisponibles, loadingRoles }) => {
  const { theme } = useTheme();
  
  // Función para obtener fecha formateada para mostrar
  const obtenerFechaFormateada = (fecha) => {
    if (!fecha) return null;
    const fechaObj = convertirFechaFirebase(fecha);
    return fechaObj ? fechaObj.toISOString() : null;
  };

  // Inicializar estado con función para evitar problemas de fechas
  const [formData, setFormData] = useState(() => {
    if (editingUsuario) {
      return {
        email: editingUsuario.email || '',
        nombre: editingUsuario.nombre || '',
        password: '',
        rol: editingUsuario.rol || '',
        telefono: editingUsuario.telefono || '',
        departamento: editingUsuario.departamento || '',
        activo: editingUsuario.activo !== undefined ? editingUsuario.activo : true,
        color: editingUsuario.color || undefined,
        foto: editingUsuario.foto || '',
        fechaCreacion: obtenerFechaFormateada(editingUsuario.fechaCreacion),
        ultimoAcceso: obtenerFechaFormateada(editingUsuario.ultimoAcceso),
      };
    }
    return {
      email: '',
      nombre: '',
      password: '',
      rol: '',
      telefono: '',
      departamento: '',
      activo: true,
      color: undefined,
      foto: '',
      fechaCreacion: null,
      ultimoAcceso: null,
    };
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

    if (formData.foto && !isValidUrl(formData.foto)) {
      newErrors.foto = 'La URL de la foto no es válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      const dataToSend = { ...formData };
      
      // Si es un usuario nuevo, establecer fecha de creación AHORA MISMO
      if (!editingUsuario) {
        dataToSend.fechaCreacion = new Date().toISOString();
        console.log('📅 Estableciendo fecha de creación para nuevo usuario:', dataToSend.fechaCreacion);
      }
      
      // Si es edición y NO tiene fecha de creación, establecerla ahora (para usuarios antiguos)
      if (editingUsuario && !editingUsuario.fechaCreacion) {
        dataToSend.fechaCreacion = new Date().toISOString();
        console.log('📅 Usuario antiguo sin fecha, estableciendo fecha ahora:', dataToSend.fechaCreacion);
      }
      
      // Eliminar password si está vacío en edición
      if (editingUsuario && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      onSave(dataToSend);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative overflow-hidden rounded-2xl shadow-2xl max-w-4xl mx-auto mt-4 sm:mt-8"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
      
      <div className={`relative rounded-2xl overflow-hidden border-2 border-red-600/30 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
        </div>

        <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
          theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
              {editingUsuario ? (
                <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              ) : (
                <UserPlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </div>
            <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email <span className="text-red-600">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={editingUsuario}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm rounded-lg border-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all ${
                      editingUsuario ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    placeholder="usuario@empresa.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre Completo <span className="text-red-600">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm rounded-lg border-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contraseña {!editingUsuario && <span className="text-red-600">*</span>}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-12 py-1.5 sm:py-2 text-sm rounded-lg border-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    placeholder={editingUsuario ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rol <span className="text-red-600">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    disabled={loadingRoles}
                    className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 text-sm rounded-lg border-2 appearance-none ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all cursor-pointer`}
                  >
                    <option value="">{loadingRoles ? 'Cargando roles...' : '-- Selecciona un rol --'}</option>
                    {rolesDisponibles.map(rol => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre || rol.id}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.rol && <p className="text-red-500 text-xs mt-1">{errors.rol}</p>}
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Teléfono
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm rounded-lg border-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    placeholder="809-123-4567"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Departamento
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm rounded-lg border-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    placeholder="Ej: Ventas"
                  />
                </div>
              </div>
            </div>

            {/* Fecha de creación */}
            {editingUsuario && (
              <div className="md:col-span-2">
                <div className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border`}>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de creación
                  </label>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formData.fechaCreacion ? formatearFechaSegura(formData.fechaCreacion) : 'No registrada'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {!formData.fechaCreacion && 'Este usuario no tenía fecha de creación registrada.'}
                  </p>
                </div>
              </div>
            )}

            {/* Último acceso (solo lectura) */}
            {editingUsuario && formData.ultimoAcceso && (
              <div className="md:col-span-2">
                <div className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border`}>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Último acceso
                  </label>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatearFechaSegura(formData.ultimoAcceso)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Foto de perfil (URL)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <input
                      type="url"
                      name="foto"
                      value={formData.foto}
                      onChange={handleChange}
                      className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm rounded-lg border-2 ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                      } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>
                  {errors.foto && <p className="text-red-500 text-xs mt-1">{errors.foto}</p>}
                </div>
                
                <div className="flex items-center justify-center sm:justify-start">
                  {fotoPreview ? (
                    <div className="relative group">
                      <img
                        src={fotoPreview}
                        alt="Vista previa"
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover border-2 border-red-600/30"
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
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white rounded-full p-0.5 sm:p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-2 w-2 sm:h-3 sm:w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <PhotoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Color de identificación
              </label>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {['bg-red-600', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-600', 'bg-pink-500', 'bg-indigo-500'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${color} ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-red-600 scale-110' : ''
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
                    Quitar
                  </button>
                )}
              </div>
            </div>

            {editingUsuario && (
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Usuario activo
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className={`p-3 sm:p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3`}>
            <button
              type="button"
              onClick={onBack}
              className={`w-full sm:w-auto px-4 sm:px-6 py-1.5 sm:py-2 text-sm rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>{editingUsuario ? 'Actualizar' : 'Crear'}</span>
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PARA REGISTRAR EVENTO DE ACCESO
// ============================================
const registrarEventoAcceso = async (usuario) => {
  try {
    const ahora = new Date();
    const evento = {
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      usuarioNombre: usuario.nombre,
      fecha: ahora.toISOString(),
      fechaLocal: ahora.toLocaleString(),
      hora: ahora.toLocaleTimeString(),
      tipo: 'login',
      ip: await obtenerIP(),
      dispositivo: navigator.userAgent,
      plataforma: navigator.platform,
      navegador: obtenerNavegador()
    };

    const eventosRef = collection(db, 'eventos_acceso');
    await addDoc(eventosRef, evento);

    const eventosPrevios = JSON.parse(localStorage.getItem('ultimosAccesos') || '[]');
    eventosPrevios.unshift(evento);
    localStorage.setItem('ultimosAccesos', JSON.stringify(eventosPrevios.slice(0, 10)));

    console.log('✅ Evento de acceso registrado:', evento);
    
    try {
      await api.put(`/usuarios/${usuario.id}`, {
        ultimoAcceso: ahora.toISOString()
      });
    } catch (error) {
      console.error('Error actualizando último acceso:', error);
    }
    
    return evento;
  } catch (error) {
    console.error('Error registrando evento de acceso:', error);
  }
};

const obtenerIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'No disponible';
  }
};

const obtenerNavegador = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Otro';
};

// Componente de tarjeta de usuario para móvil
const UsuarioCardMovil = ({ usuario, onEditar, onDesactivar, onEliminar, onReactivar, onEliminarPermanente, onRowClick }) => {
  const { theme } = useTheme();

  // Función para formatear fecha con hora
  const formatearFechaConHora = (fecha) => {
    if (!fecha) return 'Nunca';
    try {
      const fechaObj = convertirFechaFirebase(fecha);
      if (!fechaObj) return 'Inválida';
      return fechaObj.toLocaleString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Error';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => onRowClick(usuario)}
      className={`relative overflow-hidden rounded-xl border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg mb-3 cursor-pointer hover:shadow-xl transition-all`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-700" />
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {usuario.foto ? (
              <img
                src={usuario.foto}
                alt={usuario.nombre}
                className="h-12 w-12 rounded-lg object-cover border-2 border-red-600/30 flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${usuario.nombre}&background=random`;
                }}
              />
            ) : (
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                usuario.color ? usuario.color : getRolStyles(usuario.rol, []).split(' ')[0]
              }`}>
                {usuario.nombre?.charAt(0)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {usuario.nombre}
                </h4>
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    usuario={usuario}
                    onEditar={onEditar}
                    onDesactivar={onDesactivar}
                    onEliminar={onEliminar}
                    onReactivar={onReactivar}
                    onEliminarPermanente={onEliminarPermanente}
                  />
                </div>
              </div>
              
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>{usuario.email}</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getRolStyles(usuario.rol, [])}`}>
                  {getRolText(usuario.rol, [])}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  usuario.activo 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Teléfono:</span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {usuario.telefono || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Depto:</span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {usuario.departamento || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Creado:</span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatearFechaCorta(usuario.fechaCreacion)}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Último acceso:</span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatearFechaConHora(usuario.ultimoAcceso)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal
const Usuarios = () => {
  const { theme } = useTheme();
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
  const [ultimoAcceso, setUltimoAcceso] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const { showError, showSuccess, showWarning } = useError();
  const { user: currentUser } = useAuth();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Registrar evento de acceso al cargar el componente
  useEffect(() => {
    if (currentUser) {
      registrarEventoAcceso(currentUser);
      setUltimoAcceso(new Date().toLocaleString());
    }
  }, [currentUser]);

  // Cargar roles desde Firebase
  const cargarRoles = useCallback(async () => {
    try {
      setLoadingRoles(true);
      const rolesRef = collection(db, 'Roles');
      const rolesSnap = await getDocs(rolesRef);

      const roles = [];
      rolesSnap.forEach(doc => {
        roles.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setRolesDisponibles(roles);
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
      showError('Error al cargar los roles');
    } finally {
      setLoadingRoles(false);
    }
  }, [showError]);

  // Cargar usuarios desde API
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');

      if (response.data && Array.isArray(response.data)) {
        setUsuarios(response.data);
        setApiConnected(true);
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setUsuarios(response.data.data);
        setApiConnected(true);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setUsuarios(response.data.data);
        setApiConnected(true);
      } else {
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
          aVal = aVal ? convertirFechaFirebase(aVal)?.getTime() || 0 : 0;
          bVal = bVal ? convertirFechaFirebase(bVal)?.getTime() || 0 : 0;
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
    const inactivos = usuarios.length - activos;

    return {
      total: usuarios.length,
      activos,
      inactivos,
      roles: rolesDisponibles.length
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
        const headers = ['ID', 'Nombre', 'Email', 'Rol', 'Departamento', 'Estado', 'Teléfono', 'Fecha Creación', 'Último Acceso'];
        const rows = dataToExport.map(u => [
          u.id,
          u.nombre,
          u.email,
          u.rol,
          u.departamento || '',
          u.activo ? 'Activo' : 'Inactivo',
          u.telefono || '',
          u.fechaCreacion ? formatearFechaSegura(u.fechaCreacion, 'completo') : '',
          u.ultimoAcceso ? formatearFechaSegura(u.ultimoAcceso, 'completo') : ''
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
      ? <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 inline ml-1" />
      : <ArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 inline ml-1" />;
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingUsuario(null);
    setSearchTerm('');
    setShowSearch(false);
  };

  const handleSaveUsuario = async (usuarioData) => {
    try {
      // Validar y corregir fechas si es necesario
      const dataToSend = { ...usuarioData };
      
      // Asegurar que fechaCreacion sea un string ISO válido
      if (dataToSend.fechaCreacion) {
        try {
          let fechaObj;
          
          // Si es Timestamp de Firebase
          if (dataToSend.fechaCreacion && typeof dataToSend.fechaCreacion === 'object' && '_seconds' in dataToSend.fechaCreacion) {
            fechaObj = new Date(dataToSend.fechaCreacion._seconds * 1000);
          } else {
            fechaObj = new Date(dataToSend.fechaCreacion);
          }
          
          if (isNaN(fechaObj.getTime())) {
            dataToSend.fechaCreacion = new Date().toISOString();
            console.log('📅 Fecha inválida corregida a actual:', dataToSend.fechaCreacion);
          } else {
            dataToSend.fechaCreacion = fechaObj.toISOString();
          }
        } catch {
          dataToSend.fechaCreacion = new Date().toISOString();
        }
      }
      
      // Para usuarios nuevos sin fecha
      if (!editingUsuario && !dataToSend.fechaCreacion) {
        dataToSend.fechaCreacion = new Date().toISOString();
      }
      
      // Para usuarios editados sin fecha
      if (editingUsuario && !editingUsuario.fechaCreacion && !dataToSend.fechaCreacion) {
        dataToSend.fechaCreacion = new Date().toISOString();
      }
      
      let response;

      if (editingUsuario) {
        response = await api.put(`/usuarios/${editingUsuario.id}`, dataToSend);
        showSuccess('Usuario actualizado exitosamente');
      } else {
        response = await api.post('/usuarios', dataToSend);
        showSuccess('Usuario creado exitosamente. Ya puede iniciar sesión.');
      }

      await fetchUsuarios();
      setShowForm(false);
      setEditingUsuario(null);

    } catch (error) {
      console.error('❌ Error al guardar usuario:', error);
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
      showSuccess('Usuario desactivado exitosamente');
      await fetchUsuarios();
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      showError('Error al desactivar el usuario');
    }
  };

  const handleEliminarPermanente = async (usuarioId) => {
    try {
      await api.delete(`/usuarios/${usuarioId}/permanent`);
      showSuccess('✅ Usuario eliminado PERMANENTEMENTE');
      await fetchUsuarios();
    } catch (error) {
      console.error('Error en eliminación permanente:', error);
      
      try {
        await api.delete(`/usuarios/${usuarioId}`);
        showSuccess('✅ Usuario eliminado (desactivado)');
        await fetchUsuarios();
      } catch (fallbackError) {
        console.error('Error también en fallback:', fallbackError);
        showError('No se pudo eliminar el usuario. Verifica que el endpoint exista en el backend.');
      }
    }
  };

  const handleRowClick = (usuario) => {
    setEditingUsuario(usuario);
    setShowForm(true);
  };

  // Función para formatear último acceso con fecha grande y hora pequeña
  const formatearUltimoAcceso = (fecha) => {
    if (!fecha) return null;
    try {
      const fechaObj = convertirFechaFirebase(fecha);
      if (!fechaObj) return null;
      
      const fechaFormateada = fechaObj.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const horaFormateada = fechaObj.toLocaleTimeString('es-DO', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return { fecha: fechaFormateada, hora: horaFormateada };
    } catch {
      return null;
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6">
      {/* Header principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 rounded-2xl blur-3xl animate-gradient-xy" />
        
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${
            theme === 'dark' ? '#fff' : '#000'
          } 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
        
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border-2 border-red-600/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-red-600 via-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-xl"
              >
                <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent">
                  Gestión de Usuarios
                </h1>
                <p className={`text-xs sm:text-sm mt-1 flex items-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1 sm:mr-2" />
                  Administra los usuarios del sistema y sus permisos
                </p>
                {ultimoAcceso && (
                  <p className={`text-xs mt-1 flex items-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Último acceso: {ultimoAcceso}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1 sm:space-x-2 ${
                  showFilters
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FunnelIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Filtros</span>
                {Object.keys(filters).length > 0 && (
                  <span className="bg-red-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {Object.keys(filters).length}
                  </span>
                )}
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <DocumentDuplicateIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </motion.button>

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 mt-2 w-40 sm:w-48 rounded-xl shadow-2xl overflow-hidden z-50 border ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setExportFormat('json');
                            handleExport();
                            setShowExportMenu(false);
                          }}
                          className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                            theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          } transition-colors`}
                        >
                          Exportar como JSON
                        </button>
                        <button
                          onClick={() => {
                            setExportFormat('csv');
                            handleExport();
                            setShowExportMenu(false);
                          }}
                          className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                            theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          } transition-colors`}
                        >
                          Exportar como CSV
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  cargarRoles();
                  fetchUsuarios();
                }}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Refrescar datos"
              >
                <ArrowPathIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingUsuario(null);
                  setShowForm(true);
                }}
                className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-1 sm:space-x-2"
              >
                <UserPlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Nuevo</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

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
            className={`relative overflow-hidden rounded-xl p-3 sm:p-4 ${
              theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
            } border-2 flex flex-wrap items-center justify-between gap-2`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-800/10" />
            
            <div className="flex items-center space-x-2 sm:space-x-3 relative">
              <span className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                {selectedUsuarios.length} usuario{selectedUsuarios.length !== 1 ? 's' : ''} seleccionado{selectedUsuarios.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedUsuarios([])}
                className={`text-xs underline ${
                  theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                }`}
              >
                Limpiar
              </button>
            </div>
            
            <div className="flex gap-1 sm:gap-2 relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBulkAction('activate')}
                className="px-2 sm:px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-xs font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Activar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBulkAction('deactivate')}
                className="px-2 sm:px-3 py-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg text-xs font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Desactivar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBulkAction('delete')}
                className="px-2 sm:px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Eliminar
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <StatCard icon={UserGroupIcon} label="Total Usuarios" value={stats.total} color="red" />
        <StatCard icon={CheckCircleIcon} label="Activos" value={stats.activos} color="green" />
        <StatCard icon={XCircleIcon} label="Inactivos" value={stats.inactivos} color="gray" />
        <StatCard icon={ShieldCheckIcon} label="Roles" value={stats.roles} color="purple" />
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 ${
              theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'
            } shadow-xl border-2 border-red-600/20`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-red-800/5" />
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, email, departamento o teléfono..."
                className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 text-sm rounded-lg border-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vista para móvil (tarjetas) */}
      {isMobile ? (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredAndSortedUsuarios.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-full blur-3xl opacity-20" />
                <UserGroupIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4 relative" />
              </div>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm || Object.keys(filters).length > 0
                  ? 'No se encontraron usuarios'
                  : 'No hay usuarios registrados'}
              </p>
              {!searchTerm && Object.keys(filters).length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditingUsuario(null);
                    setShowForm(true);
                  }}
                  className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 mx-auto"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Crear Primer Usuario</span>
                </motion.button>
              )}
            </div>
          ) : (
            filteredAndSortedUsuarios.map((usuario) => (
              <UsuarioCardMovil
                key={usuario.id}
                usuario={usuario}
                onEditar={(user) => {
                  setEditingUsuario(user);
                  setShowForm(true);
                }}
                onDesactivar={(user) => {
                  setUsuarioToDelete(user);
                  setShowConfirmModal(true);
                }}
                onEliminar={(id) => handleDeleteUsuario(id)}
                onReactivar={(id) => handleReactivarUsuario(id)}
                onEliminarPermanente={(id) => handleEliminarPermanente(id)}
                onRowClick={handleRowClick}
              />
            ))
          )}
        </div>
      ) : (
        /* Vista para desktop (tabla) - MODIFICADA para mostrar último acceso con fecha grande y hora pequeña */
        <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl border-2 border-red-600/20 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-red-800/5 pointer-events-none" />
          
          {loading ? (
            <div className="p-4 sm:p-6 lg:p-8">
              <SkeletonLoader />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">
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
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort('nombre')}>
                        <div className="flex items-center space-x-1">
                          <span>Usuario</span>
                          {getSortIcon('nombre')}
                        </div>
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fecha Creación
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Último acceso
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} divide-y divide-gray-200 dark:divide-gray-700`}>
                    {filteredAndSortedUsuarios.map((usuario) => {
                      const ultimoAccesoFormateado = formatearUltimoAcceso(usuario.ultimoAcceso);
                      
                      return (
                        <motion.tr
                          key={usuario.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => handleRowClick(usuario)}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                            selectedUsuarios.includes(usuario.id) ? 'bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                        >
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {usuario.foto ? (
                                <img
                                  src={usuario.foto}
                                  alt={usuario.nombre}
                                  className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg object-cover border-2 border-red-600/30"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${usuario.nombre}&background=random`;
                                  }}
                                />
                              ) : (
                                <div className={`h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                                  usuario.color ? usuario.color : getRolStyles(usuario.rol, rolesDisponibles).split(' ')[0]
                                }`}>
                                  {usuario.nombre?.charAt(0)}
                                </div>
                              )}
                              <div className="ml-2 sm:ml-3">
                                <div className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {usuario.nombre}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{usuario.email}</div>
                            <div className={`text-xs flex items-center mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              {usuario.telefono || 'N/A'}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                {usuario.departamento || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getRolStyles(usuario.rol, rolesDisponibles)}`}>
                              {getRolText(usuario.rol, rolesDisponibles)}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              {usuario.activo ? (
                                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                              )}
                              <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {usuario.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm">
                            {usuario.fechaCreacion ? (
                              <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                {formatearFechaCorta(usuario.fechaCreacion)}
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">No registrada</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                            {usuario.ultimoAcceso && ultimoAccesoFormateado ? (
                              <div>
                                <div className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                  {ultimoAccesoFormateado.fecha}
                                </div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {ultimoAccesoFormateado.hora}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">Nunca</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                            <ActionMenu
                              usuario={usuario}
                              onEditar={(user) => {
                                setEditingUsuario(user);
                                setShowForm(true);
                              }}
                              onDesactivar={(user) => {
                                setUsuarioToDelete(user);
                                setShowConfirmModal(true);
                              }}
                              onEliminar={(id) => handleDeleteUsuario(id)}
                              onReactivar={(id) => handleReactivarUsuario(id)}
                              onEliminarPermanente={(id) => handleEliminarPermanente(id)}
                            />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredAndSortedUsuarios.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-full blur-3xl opacity-20" />
                    <UserGroupIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4 relative" />
                  </div>
                  <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {searchTerm || Object.keys(filters).length > 0
                      ? 'No se encontraron usuarios'
                      : 'No hay usuarios registrados'}
                  </p>
                  {!searchTerm && Object.keys(filters).length === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingUsuario(null);
                        setShowForm(true);
                      }}
                      className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 mx-auto"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      <span>Crear Primer Usuario</span>
                    </motion.button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {filteredAndSortedUsuarios.length > 0 && !isMobile && (
        <div className={`flex flex-wrap items-center justify-between p-3 sm:p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        } border-2`}>
          <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Mostrando <span className="font-medium">{filteredAndSortedUsuarios.length}</span> de{' '}
            <span className="font-medium">{usuarios.length}</span> usuarios
            {selectedUsuarios.length > 0 && (
              <span className="ml-2">
                (<span className="font-medium">{selectedUsuarios.length}</span> seleccionados)
              </span>
            )}
          </div>

          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1 sm:space-x-2 ${
                theme === 'dark'
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <MagnifyingGlassIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{showSearch ? 'Ocultar' : 'Buscar'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingUsuario(null);
                setShowForm(true);
              }}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-1 sm:space-x-2"
            >
              <UserPlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Nuevo</span>
            </motion.button>
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

      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Usuarios;