import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ClockIcon,
  CpuChipIcon,
  EllipsisVerticalIcon,
  NoSymbolIcon,
  ArrowUturnLeftIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useError } from '../context/ErrorContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import ClienteForm from '../components/Clientes/ClienteForm';
import ClienteDetails from '../components/Clientes/ClienteDetails';

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

// ============================================
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SKELETON LOADER
// ============================================
const ClientesSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-64 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className="flex space-x-2">
          <div className={`h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-24 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className={`h-96 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
    </div>
  );
};

// ============================================
// COMPONENTE DE TARJETA DE ESTADÍSTICA (MEJORADO)
// ============================================
const StatsCard = ({ icon: Icon, label, value, subValue, color, onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
    orange: 'from-orange-500 to-orange-700',
    purple: 'from-purple-500 to-purple-700',
    red: 'from-red-500 to-red-700'
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

        <div className="relative p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className={`px-2 py-1 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
              <CpuChipIcon className="h-3 w-3" />
            </div>
          </div>
          
          <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            {subValue}
          </p>
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE FILTROS AVANZADOS (MEJORADO)
// ============================================
const AdvancedFilters = ({ isOpen, onClose, filters, onFilterChange }) => {
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState(filters || {});

  if (!isOpen) return null;

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
      className="mb-6"
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Filtros Avanzados
            </h3>
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
                Provincia
              </label>
              <select
                value={localFilters.provincia || ''}
                onChange={(e) => handleChange('provincia', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              >
                <option value="">Todas las provincias</option>
                <option value="Santo Domingo">Santo Domingo</option>
                <option value="Santiago">Santiago</option>
                <option value="La Vega">La Vega</option>
                <option value="Puerto Plata">Puerto Plata</option>
                <option value="San Cristóbal">San Cristóbal</option>
                <option value="La Romana">La Romana</option>
                <option value="San Pedro de Macorís">San Pedro de Macorís</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Rango de Sueldo
              </label>
              <select
                value={localFilters.rangoSueldo || ''}
                onChange={(e) => handleChange('rangoSueldo', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              >
                <option value="">Todos los rangos</option>
                <option value="0-15000">0 - 15,000 DOP</option>
                <option value="15000-30000">15,000 - 30,000 DOP</option>
                <option value="30000-50000">30,000 - 50,000 DOP</option>
                <option value="50000+">50,000+ DOP</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Estado
              </label>
              <select
                value={localFilters.estado || ''}
                onChange={(e) => handleChange('estado', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Capacidad de Pago
              </label>
              <select
                value={localFilters.capacidad || ''}
                onChange={(e) => handleChange('capacidad', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              >
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="muy-alta">Muy Alta</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setLocalFilters({});
                onFilterChange({});
                onClose();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Aplicar Filtros
            </motion.button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE MENÚ DE ACCIONES (3 PUNTOS)
// ============================================
const ActionMenu = ({ cliente, onVer, onEditar, onEliminar }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef(null);

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
            className={`absolute right-0 mt-1 sm:mt-2 w-40 sm:w-48 rounded-xl shadow-2xl overflow-hidden z-50 border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVer(cliente);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <EyeIcon className="h-4 w-4 text-blue-600" />
                <span>Ver detalles</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar(cliente);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <PencilIcon className="h-4 w-4 text-yellow-600" />
                <span>Editar</span>
              </button>

              <div className={`my-1 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`¿Estás seguro de que quieres eliminar a ${cliente.nombre}?`)) {
                    onEliminar(cliente.id);
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
                <span className="text-red-600">Eliminar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// COMPONENTE DE TARJETA DE CLIENTE PARA MÓVIL
// ============================================
const ClienteCardMovil = ({ cliente, onVer, onEditar, onEliminar, onRowClick }) => {
  const { theme } = useTheme();

  const formatSueldo = (sueldo) => {
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return 'No especificado';
    return `RD$ ${sueldoNum.toLocaleString('es-DO')}`;
  };

  const getSueldoColor = (sueldo) => {
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
    if (sueldoNum >= 50000) return 'text-green-600 dark:text-green-400 font-semibold';
    if (sueldoNum >= 30000) return 'text-blue-600 dark:text-blue-400';
    if (sueldoNum >= 15000) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => onRowClick(cliente)}
      className={`relative overflow-hidden rounded-xl border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg mb-3 cursor-pointer hover:shadow-xl transition-all`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-700" />
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {cliente.foto ? (
              <img
                src={cliente.foto}
                alt={cliente.nombre}
                className="h-12 w-12 rounded-lg object-cover border-2 border-red-600/30 flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${cliente.nombre}&background=random`;
                }}
              />
            ) : (
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-red-600 to-red-800 flex-shrink-0`}>
                {cliente.nombre?.charAt(0)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {cliente.nombre}
                </h4>
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    cliente={cliente}
                    onVer={onVer}
                    onEditar={onEditar}
                    onEliminar={onEliminar}
                  />
                </div>
              </div>
              
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                {cliente.cedula}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs font-medium ${getSueldoColor(cliente.sueldo)}`}>
                  {formatSueldo(cliente.sueldo)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Teléfono:</span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {cliente.celular || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Email:</span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                    {cliente.email || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Trabajo:</span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {cliente.trabajo || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Provincia:</span>
                  <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {cliente.provincia || 'N/A'}
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

// ============================================
// FUNCIÓN PARA REGISTRAR AUDITORÍA
// ============================================
const registrarAuditoria = async (accion, entidad, datos, usuario) => {
  try {
    const evento = {
      accion,
      entidad,
      entidadId: datos.id,
      datos: JSON.stringify(datos),
      usuarioId: usuario?.id,
      usuarioEmail: usuario?.email,
      usuarioNombre: usuario?.nombre,
      fecha: new Date().toISOString(),
      fechaLocal: new Date().toLocaleString(),
      ip: await obtenerIP(),
      dispositivo: navigator.userAgent,
      plataforma: navigator.platform,
      navegador: obtenerNavegador()
    };

    const auditoriaRef = collection(db, 'auditoria');
    await addDoc(auditoriaRef, evento);
    console.log(`✅ Auditoría registrada: ${accion} - ${entidad}`);
  } catch (error) {
    console.error('Error registrando auditoría:', error);
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

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [editingCliente, setEditingCliente] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);
  const [filters, setFilters] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  
  const { showError, showSuccess } = useError();
  const { theme } = useTheme();
  const { user } = useAuth();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Cargando clientes desde API...');
      
      const response = await api.get('/clientes');
      console.log('Clientes cargados:', response.data);
      
      setClientes(response.data || []);
      setApiConnected(true);
      
    } catch (error) {
      console.error('Error fetching clients:', error);
      
      const errorMessage = error.message || 'Error al cargar los clientes';
      showError(errorMessage);
      
      setApiConnected(false);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Filtrar solo clientes activos para cálculos
  const clientesActivos = clientes.filter(cliente => cliente.activo !== false);
  
  // Aplicar filtros
  const filteredClientes = clientesActivos.filter(cliente => {
    // Búsqueda por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const match = 
        cliente.nombre?.toLowerCase().includes(searchLower) ||
        cliente.cedula?.toLowerCase().includes(searchLower) ||
        cliente.email?.toLowerCase().includes(searchLower) ||
        cliente.celular?.includes(searchTerm);
      if (!match) return false;
    }

    // Filtro por provincia
    if (filters.provincia && cliente.provincia !== filters.provincia) {
      return false;
    }

    // Filtro por estado
    if (filters.estado) {
      if (filters.estado === 'activo' && cliente.activo === false) return false;
      if (filters.estado === 'inactivo' && cliente.activo !== false) return false;
    }

    // Filtro por rango de sueldo
    if (filters.rangoSueldo) {
      const sueldoNum = typeof cliente.sueldo === 'string' 
        ? parseFloat(cliente.sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
        : Number(cliente.sueldo) || 0;
      
      const [min, max] = filters.rangoSueldo.split('-').map(Number);
      if (max) {
        if (sueldoNum < min || sueldoNum > max) return false;
      } else {
        if (sueldoNum < min) return false;
      }
    }

    return true;
  });

  // Cálculos de sueldos
  const sueldosActivos = filteredClientes
    .map(c => {
      const sueldo = c.sueldo;
      if (typeof sueldo === 'string') {
        return parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0;
      }
      return Number(sueldo) || 0;
    })
    .filter(sueldo => sueldo > 0);

  const totalSueldos = sueldosActivos.reduce((sum, sueldo) => sum + sueldo, 0);
  const sueldoPromedio = sueldosActivos.length > 0 ? Math.round(totalSueldos / sueldosActivos.length) : 0;
  const sueldoMaximo = sueldosActivos.length > 0 ? Math.max(...sueldosActivos) : 0;

  const handleCreateCliente = () => {
    setEditingCliente(null);
    setViewMode('form');
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setViewMode('form');
  };

  const handleViewCliente = (cliente) => {
    setSelectedCliente(cliente);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCliente(null);
    setEditingCliente(null);
    setSearchTerm('');
    setShowSearch(false);
  };

  const handleSaveCliente = async (clienteData) => {
    try {
      let response;
      
      if (editingCliente) {
        response = await api.put(`/clientes/${editingCliente.id}`, clienteData);
        showSuccess('Cliente actualizado exitosamente');
        await registrarAuditoria('actualizar', 'cliente', { id: editingCliente.id, ...clienteData }, user);
      } else {
        response = await api.post('/clientes', clienteData);
        showSuccess('Cliente creado exitosamente');
        await registrarAuditoria('crear', 'cliente', response.data, user);
      }
      
      await fetchClientes();
      setViewMode('list');
      
    } catch (error) {
      console.error('Error saving client:', error);
      showError(error.message || 'Error al guardar el cliente');
    }
  };

  const handleDeleteCliente = async (clienteId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        const cliente = clientes.find(c => c.id === clienteId);
        await api.delete(`/clientes/${clienteId}`);
        showSuccess('Cliente eliminado exitosamente');
        await registrarAuditoria('eliminar', 'cliente', cliente, user);
        await fetchClientes();
      } catch (error) {
        console.error('Error deleting client:', error);
        showError(error.message || 'Error al eliminar el cliente');
      }
    }
  };

  const handleRowClick = (cliente) => {
    setSelectedCliente(cliente);
    setViewMode('details');
  };

  const formatSueldo = (sueldo) => {
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return 'No especificado';
    return `RD$ ${sueldoNum.toLocaleString('es-DO')}`;
  };

  const formatSueldoNumero = (sueldo) => {
    if (!sueldo || sueldo === 0) return 0;
    return sueldo;
  };

  const getSueldoColor = (sueldo) => {
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
    if (sueldoNum >= 50000) return 'text-green-600 dark:text-green-400 font-semibold';
    if (sueldoNum >= 30000) return 'text-blue-600 dark:text-blue-400';
    if (sueldoNum >= 15000) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCapacidadPago = (sueldo) => {
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return 'No especificado';
    if (sueldoNum >= 50000) return 'Muy Alta';
    if (sueldoNum >= 30000) return 'Alta';
    if (sueldoNum >= 15000) return 'Media';
    return 'Baja';
  };

  if (viewMode === 'form') {
    return (
      <ClienteForm
        cliente={editingCliente}
        onSave={handleSaveCliente}
        onCancel={handleBackToList}
      />
    );
  }

  if (viewMode === 'details' && selectedCliente) {
    return (
      <ClienteDetails
        cliente={selectedCliente}
        onBack={handleBackToList}
        onEdit={() => handleEditCliente(selectedCliente)}
      />
    );
  }

  if (loading) {
    return <ClientesSkeleton />;
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header Mejorado */}
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
        
        <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-red-600/20`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-red-600 via-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-xl"
              >
                <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </motion.div>
              <div>
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent`}>
                  Clientes
                </h1>
                <p className={`text-xs sm:text-sm mt-1 flex items-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1 sm:mr-2" />
                  Gestiona la cartera de clientes
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1 sm:space-x-2 ${
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

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1 sm:space-x-2 ${
                  showSearch
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <MagnifyingGlassIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Buscar</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchClientes}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
                onClick={handleCreateCliente}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-1 sm:space-x-2"
              >
                <UserPlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Nuevo</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Connection Status */}
      <AnimatePresence>
        {!apiConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 sm:p-4 rounded-xl border-2 flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400'
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm">Modo offline: Usando datos locales. Verifica la conexión con el servidor.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros Avanzados */}
      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            onFilterChange={setFilters}
          />
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard>
              <div className="p-3 sm:p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, cédula, email o teléfono..."
                    className={`w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 text-sm rounded-lg border-2 outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
                    >
                      <XMarkIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} hover:text-red-600 transition-colors`} />
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatsCard
          icon={CurrencyDollarIcon}
          label="Sueldo Promedio"
          value={formatSueldo(sueldoPromedio)}
          subValue={`${sueldosActivos.length} cliente${sueldosActivos.length !== 1 ? 's' : ''} con sueldo`}
          color="green"
        />
        
        <StatsCard
          icon={CurrencyDollarIcon}
          label="Sueldo Más Alto"
          value={formatSueldo(sueldoMaximo)}
          subValue="Máximo en cartera"
          color="blue"
        />
        
        <StatsCard
          icon={CurrencyDollarIcon}
          label="Total Sueldos"
          value={formatSueldo(totalSueldos)}
          subValue="Sumatoria total"
          color="orange"
        />
      </div>

      {/* Vista para móvil (tarjetas) */}
      {isMobile ? (
        <div className="space-y-3">
          {filteredClientes.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-full blur-3xl opacity-20" />
                <div className={`text-5xl sm:text-6xl mb-4 relative ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>👥</div>
              </div>
              <p className={`text-sm sm:text-base font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {searchTerm || Object.keys(filters).length > 0
                  ? 'No se encontraron clientes'
                  : 'No hay clientes registrados'}
              </p>
              {!searchTerm && Object.keys(filters).length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateCliente}
                  className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Crear Primer Cliente</span>
                </motion.button>
              )}
            </div>
          ) : (
            filteredClientes.map((cliente) => (
              <ClienteCardMovil
                key={cliente.id}
                cliente={cliente}
                onVer={handleViewCliente}
                onEditar={handleEditCliente}
                onEliminar={handleDeleteCliente}
                onRowClick={handleRowClick}
              />
            ))
          )}
        </div>
      ) : (
        /* Vista para desktop (tabla) */
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trabajo
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sueldo
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
              }`}>
                <AnimatePresence>
                  {filteredClientes.map((cliente) => (
                    <motion.tr
                      key={cliente.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => handleRowClick(cliente)}
                      className={`cursor-pointer transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {cliente.foto ? (
                            <img
                              src={cliente.foto}
                              alt={cliente.nombre}
                              className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg object-cover border-2 border-red-600/30"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${cliente.nombre}&background=random`;
                              }}
                            />
                          ) : (
                            <div className={`h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm bg-gradient-to-br from-red-600 to-red-800`}>
                              {cliente.nombre?.charAt(0)}
                            </div>
                          )}
                          <div className="ml-2 sm:ml-3">
                            <div className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {cliente.nombre}
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {cliente.edad} años • {cliente.provincia}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        {cliente.cedula}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{cliente.celular}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{cliente.email}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{cliente.trabajo}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{cliente.puesto}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className={`text-xs sm:text-sm font-medium ${getSueldoColor(cliente.sueldo)}`}>
                          {formatSueldo(cliente.sueldo)}
                        </div>
                        {cliente.sueldo && cliente.sueldo > 0 && (
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            Capacidad: {getCapacidadPago(cliente.sueldo)}
                          </div>
                        )}
                      </td>
                      <td 
                        className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionMenu
                          cliente={cliente}
                          onVer={handleViewCliente}
                          onEditar={handleEditCliente}
                          onEliminar={handleDeleteCliente}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filteredClientes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-full blur-3xl opacity-20" />
                  <div className={`text-5xl sm:text-6xl mb-4 relative ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>👥</div>
                </div>
                <p className={`text-sm sm:text-base font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'No se encontraron clientes'
                    : 'No hay clientes registrados'}
                </p>
                {searchTerm || Object.keys(filters).length > 0 ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({});
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Limpiar filtros
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateCliente}
                    className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    <span>Crear Primer Cliente</span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Footer con acciones rápidas */}
      {filteredClientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 sm:p-4 rounded-xl border-2 ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          } flex flex-wrap justify-between items-center gap-2`}
        >
          <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Mostrando <span className="font-semibold">{filteredClientes.length}</span> de{' '}
            <span className="font-semibold">{clientesActivos.length}</span> clientes activos
            {(searchTerm || Object.keys(filters).length > 0) && (
              <span className="ml-1">(filtrados)</span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <MagnifyingGlassIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{showSearch ? 'Ocultar' : 'Buscar'}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateCliente}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-1"
            >
              <UserPlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Nuevo</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Estilos CSS para animaciones */}
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

export default Clientes;