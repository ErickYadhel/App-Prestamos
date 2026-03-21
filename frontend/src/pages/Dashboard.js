import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CogIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CpuChipIcon,
  EyeIcon,
  EyeSlashIcon,
  PresentationChartLineIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ArrowsPointingOutIcon,
  ChevronDoubleRightIcon,
  Squares2X2Icon,
  ChartPieIcon,
  ScaleIcon,
  UserIcon,
  WalletIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  RadarController,
  ScatterController,
  BubbleController
} from 'chart.js';
import { Bar, Line, Doughnut, Pie, Radar, Scatter, Bubble } from 'react-chartjs-2'; 
import dashboardService from '../services/dashboardService';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import ChartModal from '../components/Dashboard/ChartModal';
import DashboardManager from '../components/Dashboard/DashboardManager';
import { formatFirebaseDate, formatShortDate, getRelativeTime, convertTimestampToDate } from '../components/Dashboard/DateFormatter';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  RadarController,
  ScatterController,
  BubbleController
);

// ============================================
// COMPONENTE DE BORDE LUMINOSO MEJORADO
// ============================================
const BorderGlow = ({ children, isHovered, color = 'from-red-600 via-red-500 to-red-600' }) => {
  const { theme } = useTheme();
  
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur opacity-0 transition-all duration-300 ${
        isHovered ? 'opacity-100' : 'group-hover:opacity-70'
      }`} />
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur-lg opacity-0 transition-all duration-500 ${
        isHovered ? 'opacity-60' : 'group-hover:opacity-40'
      }`} />
      <div className="absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-700" />
      <div className="relative transform transition-all duration-300 group-hover:scale-[1.02]">
        {children}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM MEJORADO
// ============================================
const GlassCard = ({ children, className = '', onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border transition-all duration-300 cursor-pointer ${
        isHovered 
          ? 'border-red-600 shadow-2xl shadow-red-600/20 scale-[1.02] z-10' 
          : 'border-red-600/20 hover:border-red-600/40'
      } ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000 ${
        isHovered ? 'translate-x-full' : ''
      }`} />
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SKELETON LOADER
// ============================================
const DashboardSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-64 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className={`h-10 w-32 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-32 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE METRIC CARD CON TOOLTIP MEJORADO
// ============================================
const MetricCard = ({ title, value, change, changeType, icon: Icon, color, link, description, gradient, onClick, tooltip }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { theme } = useTheme();

  const gradientColors = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    red: 'from-red-600 to-red-800',
    indigo: 'from-indigo-600 to-indigo-800',
    teal: 'from-teal-600 to-teal-800',
    emerald: 'from-emerald-600 to-emerald-800',
    cyan: 'from-cyan-600 to-cyan-800',
    yellow: 'from-yellow-600 to-yellow-800',
    pink: 'from-pink-600 to-pink-800',
    orange: 'from-orange-600 to-orange-800',
    amber: 'from-amber-600 to-amber-800'
  };

  const CardContent = () => (
    <BorderGlow isHovered={isHovered} color={`from-${color}-600 via-${color}-500 to-${color}-600`}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-xl p-5 block transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white border-gray-200'
        } border-2 hover:border-${color}-600/40 cursor-pointer`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={`absolute -top-20 -right-20 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br ${gradientColors[color]} rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse`} />
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  {title}
                </p>
                {tooltip && (
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="focus:outline-none"
                    >
                      <InformationCircleIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    </button>
                    {showTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 text-xs bg-gray-900 text-white rounded-lg shadow-2xl whitespace-normal min-w-[280px] max-w-[320px] z-[200] break-words border border-gray-700 pointer-events-auto">
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
                        <p className="font-medium text-sm mb-2 text-red-400 flex items-center gap-1">
                          <InformationCircleIcon className="h-4 w-4" />
                          Información
                        </p>
                        <p className="text-gray-300 leading-relaxed text-sm">{tooltip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-baseline flex-wrap">
                <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </p>
                {change && change !== 0 && (
                  <span className={`ml-2 inline-flex items-center text-xs font-medium ${
                    changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {changeType === 'positive' ? 
                      <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    }
                    {change}%
                  </span>
                )}
              </div>
              {description && (
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  {description}
                </p>
              )}
            </div>
            <div className={`p-2 sm:p-3 bg-gradient-to-br ${gradientColors[color]} rounded-xl shadow-lg ml-4 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>
    </BorderGlow>
  );

  return link ? (
    <Link to={link} className="block">
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
};

// ============================================
// COMPONENTE DE FILTROS AVANZADOS CON AÑO
// ============================================
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

// ============================================
// MODAL PARA GESTIONAR DASHBOARDS
// ============================================
const DashboardManagerModal = ({ isOpen, onClose, dashboards, currentDashboard, onSelect, onSave, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [modo, setModo] = useState('listar');
  const [editandoId, setEditandoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleGuardar = () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      creadoPor: user?.email || 'Usuario',
      fechaCreacion: new Date().toISOString()
    });

    setNombre('');
    setDescripcion('');
    setError('');
    setModo('listar');
  };

  const handleEditar = (dashboard) => {
    setEditandoId(dashboard.id);
    setNombre(dashboard.nombre);
    setDescripcion(dashboard.descripcion || '');
    setModo('editar');
  };

  const handleActualizar = () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    onEdit(editandoId, {
      nombre: nombre.trim(),
      descripcion: descripcion.trim()
    });

    setNombre('');
    setDescripcion('');
    setError('');
    setEditandoId(null);
    setModo('listar');
  };

  const handleEliminar = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el dashboard "${nombre}"?`)) {
      onDelete(id);
    }
  };

  const handleCancelar = () => {
    setNombre('');
    setDescripcion('');
    setError('');
    setEditandoId(null);
    setModo('listar');
  };

  const handleNuevo = () => {
    setNombre('');
    setDescripcion('');
    setError('');
    setModo('crear');
  };

  const dashboardsFiltrados = dashboards.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.descripcion && d.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

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
          className="relative w-full max-w-3xl max-h-[85vh] mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
            </div>

            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                    <Squares2X2Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {modo === 'listar' && 'Mis Dashboards'}
                      {modo === 'crear' && 'Guardar Nuevo Dashboard'}
                      {modo === 'editar' && 'Editar Dashboard'}
                    </h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {modo === 'listar' && 'Administra tus dashboards personalizados'}
                      {modo === 'crear' && 'Guarda la configuración actual para acceder rápidamente'}
                      {modo === 'editar' && 'Modifica los detalles del dashboard'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {modo === 'listar' && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar dashboards..."
                        className={`w-full px-4 py-2.5 rounded-lg border-2 text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500'
                        } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNuevo}
                      className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Nuevo Dashboard</span>
                    </motion.button>
                  </div>

                  {dashboardsFiltrados.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardsFiltrados.map((d, index) => {
                        const fecha = d.fechaCreacion ? new Date(d.fechaCreacion) : null;
                        const esActual = currentDashboard?.id === d.id;
                        
                        return (
                          <motion.div
                            key={d.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                              esActual
                                ? 'border-red-600 bg-red-50/50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-red-600/50'
                            }`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full transition-transform duration-1000 hover:translate-x-full`} />
                            
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {d.nombre}
                                    </h4>
                                    {esActual && (
                                      <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded-full flex items-center space-x-1">
                                        <CheckCircleIcon className="h-3 w-3" />
                                        <span>Actual</span>
                                      </span>
                                    )}
                                  </div>
                                  
                                  {d.descripcion && (
                                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {d.descripcion}
                                    </p>
                                  )}
                                  
                                  <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      <UserIcon className="h-3 w-3" />
                                      <span>{d.creadoPor || 'Usuario'}</span>
                                    </div>
                                    {fecha && (
                                      <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <ClockIcon className="h-3 w-3" />
                                        <span>{fecha.toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => onSelect(d)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                      esActual
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    {esActual ? 'Actual' : 'Cargar'}
                                  </button>
                                  <button
                                    onClick={() => handleEditar(d)}
                                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                      theme === 'dark'
                                        ? 'hover:bg-gray-700 text-yellow-500 hover:text-yellow-400'
                                        : 'hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700'
                                    }`}
                                    title="Editar"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEliminar(d.id, d.nombre)}
                                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                      theme === 'dark'
                                        ? 'hover:bg-gray-700 text-red-500 hover:text-red-400'
                                        : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                                    }`}
                                    title="Eliminar"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchTerm ? (
                        <>
                          <Squares2X2Icon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium mb-2">No se encontraron dashboards</p>
                          <p className="text-sm mb-4">No hay resultados para "{searchTerm}"</p>
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Limpiar búsqueda
                          </button>
                        </>
                      ) : (
                        <>
                          <Squares2X2Icon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium mb-2">No hay dashboards guardados</p>
                          <p className="text-sm mb-4">Guarda tu configuración actual para acceder rápidamente</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNuevo}
                            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                          >
                            <PlusIcon className="h-4 w-4" />
                            <span>Guardar Dashboard Actual</span>
                          </motion.button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(modo === 'crear' || modo === 'editar') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nombre del Dashboard *
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => {
                          setNombre(e.target.value);
                          setError('');
                        }}
                        className={`w-full px-4 py-2.5 rounded-lg border-2 text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                        } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                        placeholder="Ej: Dashboard Principal"
                        autoFocus
                      />
                      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Descripción
                      </label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows="4"
                        className={`w-full px-4 py-2.5 rounded-lg border-2 resize-none text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                        } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                        placeholder="Breve descripción del dashboard (opcional)..."
                      />
                    </div>

                    <div className={`mt-4 p-4 rounded-lg border-2 ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h5 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Configuración actual que se guardará:
                      </h5>
                      <ul className={`text-xs space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li>• Filtros aplicados</li>
                        <li>• Visibilidad de gráficos</li>
                        <li>• Período seleccionado</li>
                        <li>• Año seleccionado</li>
                      </ul>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={handleCancelar}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                        onClick={modo === 'crear' ? handleGuardar : handleActualizar}
                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                      >
                        {modo === 'crear' ? 'Guardar Dashboard' : 'Actualizar Dashboard'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} text-center`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Los dashboards guardados almacenan tu configuración de filtros y visibilidad de gráficos
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE DE SELECTOR DE DASHBOARDS
// ============================================
const DashboardSelector = ({ dashboards, currentDashboard, onOpenManager }) => {
  const { theme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onOpenManager}
      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
        theme === 'dark'
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      title="Gestionar Dashboards"
    >
      <Squares2X2Icon className="h-4 w-4" />
      <span className="max-w-[100px] truncate">{currentDashboard?.nombre || 'Dashboards'}</span>
    </motion.button>
  );
};

// ============================================
// COMPONENTE DE ACCIONES RÁPIDAS MEJORADO (OCULTO EN PC, SOLO VISIBLE AL HOVER)
// ============================================
const QuickActions = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const menuRef = React.useRef(null);
  const touchAreaRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const hoverTimeoutRef = React.useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Tablets también se consideran "móviles"
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Manejar hover en PC
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseEnter = () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsHovering(true);
      setIsOpen(true);
    };
    
    const handleMouseLeave = () => {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovering(false);
        setIsOpen(false);
      }, 300);
    };
    
    const button = buttonRef.current;
    const menu = menuRef.current;
    
    if (button) {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
    }
    if (menu) {
      menu.addEventListener('mouseenter', handleMouseEnter);
      menu.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (button) {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (menu) {
        menu.removeEventListener('mouseenter', handleMouseEnter);
        menu.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [isMobile]);

  // Manejar click fuera para móvil/tablet
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Manejar gestos táctiles para móvil/tablet
  useEffect(() => {
    const touchArea = touchAreaRef.current;
    if (!touchArea || !isMobile) return;

    const handleTouchStart = (e) => {
      setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
      const currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      
      // Detectar deslizamiento desde el borde derecho (touch start cerca del borde)
      if (startX > window.innerWidth - 60) {
        if (diff < -30 && !isOpen) {
          // Deslizar hacia la izquierda - abrir menú
          setIsOpen(true);
        } else if (diff > 30 && isOpen) {
          // Deslizar hacia la derecha - cerrar menú
          setIsOpen(false);
        }
      }
    };

    touchArea.addEventListener('touchstart', handleTouchStart);
    touchArea.addEventListener('touchmove', handleTouchMove);

    return () => {
      touchArea.removeEventListener('touchstart', handleTouchStart);
      touchArea.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen, startX, isMobile]);

  const actions = [
    { to: '/clientes', icon: UsersIcon, text: 'Clientes', color: 'from-blue-600 to-blue-800', description: 'Gestionar clientes' },
    { to: '/prestamos', icon: CurrencyDollarIcon, text: 'Préstamos', color: 'from-green-600 to-green-800', description: 'Ver préstamos activos' },
    { to: '/pagos', icon: CreditCardIcon, text: 'Pagos', color: 'from-teal-600 to-teal-800', description: 'Registrar pagos' },
    { to: '/solicitudes', icon: DocumentTextIcon, text: 'Solicitudes', color: 'from-purple-600 to-purple-800', description: 'Revisar solicitudes' }
  ];

  return (
    <>
      {/* Área táctil para detectar deslizamiento (solo móvil/tablet) */}
      <div 
        ref={touchAreaRef}
        className="fixed right-0 top-0 w-[60px] h-full z-30"
        style={{ pointerEvents: isMobile ? 'auto' : 'none' }}
      />

      {/* Botón flotante - visible solo en PC y con hover */}
      <motion.button
        ref={buttonRef}
        whileHover={!isMobile ? { scale: 1.1 } : {}}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (isMobile) {
            setIsOpen(!isOpen);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`fixed right-6 top-1/2 transform -translate-y-1/2 z-40 p-3 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isMobile 
            ? 'opacity-100 visible pointer-events-auto' 
            : `opacity-0 hover:opacity-100 transition-opacity duration-300 ${isHovering ? 'opacity-100' : ''}`
        } ${
          isOpen
            ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-500/50'
            : theme === 'dark'
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-100'
        } border-2 ${isOpen ? 'border-white' : 'border-red-600/30'}`}
        title="Acciones rápidas"
      >
        <ChevronDoubleRightIcon className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Menú deslizable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full w-80 z-50 shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            } border-l-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            style={{ boxShadow: '-5px 0 25px rgba(0,0,0,0.15)' }}
          >
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                    <RocketLaunchIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Acciones Rápidas
                    </h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isMobile ? 'Desliza desde el borde derecho para cerrar' : 'Pasa el mouse sobre el botón para acceder'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <motion.div
                    key={action.to}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={action.to}
                      onClick={() => setIsOpen(false)}
                      className={`block p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 hover:border-red-600/50'
                          : 'bg-white border-gray-200 hover:border-red-600/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color}`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {action.text}
                          </h4>
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {action.description}
                          </p>
                        </div>
                        <ChevronDoubleRightIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className={`mt-6 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-semibold">Consejo:</span> En PC, pasa el mouse sobre el botón para acceder. En móviles y tablets, desliza desde el borde derecho de la pantalla.
                </p>
              </div>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
              <p className={`text-xs text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Acceso rápido a las funciones principales
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================
// COMPONENTE DE COMPOSICIÓN DE CARTERA MEJORADO (CON DATOS REALES)
// ============================================
const PortfolioComposition = ({ data }) => {
  const { theme } = useTheme();

  // Datos para el gráfico de dona - usando datos reales de la API
  const prestamosActivos = data?.prestamosActivos || data?.prestamos || 0;
  const prestamosCompletados = data?.prestamosCompletados || 0;
  const prestamosMorosos = data?.prestamosMorosos || data?.prestamosEnMora || 0;
  const totalPrestamos = prestamosActivos + prestamosCompletados + prestamosMorosos;

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'RD$ 0';
    if (amount >= 1000000) return `RD$ ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `RD$ ${(amount / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const chartData = {
    labels: ['Préstamos Activos', 'Préstamos Completados', 'Préstamos en Mora'],
    datasets: [
      {
        data: [prestamosActivos, prestamosCompletados, prestamosMorosos],
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
        borderColor: 'transparent',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    }
  };

  const saludCartera = totalPrestamos > 0 ? ((prestamosActivos / totalPrestamos) * 100).toFixed(1) : 0;

  // Calcular capital en riesgo y capital activo basado en datos reales
  const promedioPrestamo = data?.promedioPrestamo || 0;
  const capitalActivo = prestamosActivos * promedioPrestamo;
  const capitalEnRiesgo = prestamosMorosos * promedioPrestamo;

  return (
    <GlassCard>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Composición de Cartera
          </h4>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            saludCartera >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
            saludCartera >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            Salud: {saludCartera}%
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos Activos</span>
                <span className={`text-lg font-bold text-green-600 dark:text-green-400`}>
                  {prestamosActivos}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${totalPrestamos > 0 ? (prestamosActivos / totalPrestamos * 100) : 0}%` }} />
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Préstamos al día y generando intereses
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos Completados</span>
                <span className={`text-lg font-bold text-blue-600 dark:text-blue-400`}>
                  {prestamosCompletados}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${totalPrestamos > 0 ? (prestamosCompletados / totalPrestamos * 100) : 0}%` }} />
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Préstamos pagados exitosamente
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos en Mora</span>
                <span className={`text-lg font-bold text-red-600 dark:text-red-400`}>
                  {prestamosMorosos}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${totalPrestamos > 0 ? (prestamosMorosos / totalPrestamos * 100) : 0}%` }} />
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Préstamos con pagos atrasados
              </p>
            </div>
          </div>
        </div>
        
        <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Capital en Riesgo</p>
              <p className={`text-xl font-bold text-red-600 dark:text-red-400`}>
                {formatCurrency(capitalEnRiesgo)}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {prestamosMorosos} préstamos en mora
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Capital Activo</p>
              <p className={`text-xl font-bold text-green-600 dark:text-green-400`}>
                {formatCurrency(capitalActivo)}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {prestamosActivos} préstamos activos
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Préstamos</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalPrestamos}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tasa de Recuperación</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {totalPrestamos > 0 ? ((prestamosCompletados / totalPrestamos) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// ============================================
// COMPONENTE DE RENDIMIENTO POR ÁREA CORREGIDO
// ============================================
const PerformanceRadar = ({ data, onTypeChange, currentType }) => {
  const { theme } = useTheme();
  const [viewType, setViewType] = useState(currentType || 'cantidad');

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'RD$ 0';
    if (amount >= 1000000) {
      return `RD$ ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `RD$ ${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleTypeChange = (type) => {
    setViewType(type);
    if (onTypeChange) onTypeChange(type);
  };

  // Datos para el radar - usando los datos reales del dashboard
  const getChartData = () => {
    if (viewType === 'cantidad') {
      const maxValue = Math.max(
        data?.cantidades?.clientes || 0,
        data?.cantidades?.prestamos || 0,
        data?.cantidades?.pagos || 0,
        data?.cantidades?.solicitudes || 0
      );
      const scaleFactor = maxValue > 0 ? 100 / maxValue : 1;
      
      return {
        labels: ['Clientes', 'Préstamos', 'Pagos', 'Solicitudes'],
        datasets: [
          {
            label: 'Cantidad (escala relativa)',
            data: [
              ((data?.cantidades?.clientes || 0) * scaleFactor).toFixed(1),
              ((data?.cantidades?.prestamos || 0) * scaleFactor).toFixed(1),
              ((data?.cantidades?.pagos || 0) * scaleFactor).toFixed(1),
              ((data?.cantidades?.solicitudes || 0) * scaleFactor).toFixed(1)
            ],
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(139, 92, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(139, 92, 246)',
          },
        ],
      };
    } else {
      const maxValue = Math.max(
        data?.montos?.capitalPrestado || 0,
        data?.montos?.capitalRecuperado || 0,
        data?.montos?.ganancias || 0
      );
      const scaleFactor = maxValue > 0 ? 100 / maxValue : 1;
      
      return {
        labels: ['Capital Prestado', 'Capital Recuperado', 'Ganancias'],
        datasets: [
          {
            label: 'Montos (escala relativa)',
            data: [
              ((data?.montos?.capitalPrestado || 0) * scaleFactor).toFixed(1),
              ((data?.montos?.capitalRecuperado || 0) * scaleFactor).toFixed(1),
              ((data?.montos?.ganancias || 0) * scaleFactor).toFixed(1)
            ],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(16, 185, 129)',
          },
        ],
      };
    }
  };

  const getRadarOptions = () => {
    const textColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (viewType === 'montos') {
                const values = [
                  data?.montos?.capitalPrestado || 0,
                  data?.montos?.capitalRecuperado || 0,
                  data?.montos?.ganancias || 0
                ];
                return `${context.label}: ${formatCurrency(values[context.dataIndex])}`;
              }
              const values = [
                data?.cantidades?.clientes || 0,
                data?.cantidades?.prestamos || 0,
                data?.cantidades?.pagos || 0,
                data?.cantidades?.solicitudes || 0
              ];
              return `${context.label}: ${values[context.dataIndex]}`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            backdropColor: 'transparent',
            stepSize: 20
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#E5E7EB'
          }
        }
      }
    };
  };

  return (
    <GlassCard>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Rendimiento por Área
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeChange('cantidad')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewType === 'cantidad'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cantidad
            </button>
            <button
              onClick={() => handleTypeChange('montos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewType === 'montos'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Montos
            </button>
          </div>
        </div>
        
        <div className="h-80">
          <Radar data={getChartData()} options={getRadarOptions()} />
        </div>
        
        <div className={`mt-4 grid grid-cols-2 gap-3 ${viewType === 'cantidad' ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {viewType === 'cantidad' ? (
            <>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Clientes</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data?.cantidades?.clientes || 0}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Préstamos</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data?.cantidades?.prestamos || 0}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pagos</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data?.cantidades?.pagos || 0}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Solicitudes</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data?.cantidades?.solicitudes || 0}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Capital Prestado</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(data?.montos?.capitalPrestado || 0)}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Capital Recuperado</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatCurrency(data?.montos?.capitalRecuperado || 0)}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ganancias</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  {formatCurrency(data?.montos?.ganancias || 0)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

// ============================================
// COMPONENTE DE GRÁFICO PERSONALIZABLE
// ============================================
const CustomizableChart = ({ title, data, type, onToggle, isVisible, getChartOptions, onExpand }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getChartComponent = () => {
    switch(type) {
      case 'bar': return Bar;
      case 'line': return Line;
      case 'doughnut': return Doughnut;
      case 'pie': return Pie;
      case 'radar': return Radar;
      default: return Bar;
    }
  };

  const ChartComponent = getChartComponent();

  return (
    <motion.div
      layout
      className={`relative ${isVisible ? '' : 'opacity-40'}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h4>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onExpand}
                className={`p-2 rounded-lg transition-all ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                } ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Ampliar gráfico"
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className={`p-2 rounded-lg transition-all ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                } ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-100'
                }`}
                title={isVisible ? "Ocultar gráfico" : "Mostrar gráfico"}
              >
                {isVisible ? (
                  <EyeIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-red-600" />
                )}
              </motion.button>
            </div>
          </div>
          <div className="h-80 transition-all duration-300">
            {data && data.labels && data.labels.length > 0 ? (
              <ChartComponent data={data} options={getChartOptions(type)} />
            ) : (
              <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      clientes: 0,
      prestamos: 0,
      pagosUltimos15Dias: 0,
      solicitudes: 0,
      gananciasMes: 0,
      capitalPrestado: 0,
      morosidad: 0,
      pagosPendientes: 0,
      nuevosClientes: 0,
      capitalRecuperado: 0,
      tasaRecuperacion: 0,
      prestamosMes: 0,
      prestamosDesembolsadosMes: 0,
      // Datos para composición de cartera
      prestamosActivos: 0,
      prestamosCompletados: 0,
      prestamosMorosos: 0,
      capitalActivo: 0,
      capitalEnRiesgo: 0,
      promedioPrestamo: 0
    },
    graficos: {
      pagosPorMes: [],
      prestamosPorMes: [],
      solicitudesPorEstado: [],
      clientesNuevos: [],
      distribucionPagos: [],
      distribucionPrestamos: [],
      gananciasPorMes: [],
      prestamosPorTipo: [],
      clientesPorProvincia: [],
      morosidadPorMes: [],
      ingresosVsGastos: [],
      flujoCaja: [],
      proyecciones: []
    },
    metricas: {
      tasaAprobacion: 0,
      promedioPrestamo: 0,
      rotacionCapital: 0,
      eficienciaCobranza: 0,
      rentabilidad: 0,
      indiceMorosidad: 0,
      ROA: 0,
      ROE: 0,
      liquidez: 0,
      solvencia: 0
    },
    actividadReciente: [],
    prestamosProximosVencimiento: [],
    rendimientoData: {
      cantidades: { clientes: 0, prestamos: 0, pagos: 0, solicitudes: 0 },
      montos: { capitalPrestado: 0, capitalRecuperado: 0, ganancias: 0 }
    }
  });
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ periodo: 'mes', año: new Date().getFullYear().toString() });
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [dashboardsGuardados, setDashboardsGuardados] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [showDashboardManager, setShowDashboardManager] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [chartVisibility, setChartVisibility] = useState({});
  const [selectedChart, setSelectedChart] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [radarViewType, setRadarViewType] = useState('cantidad');
  
  const { theme } = useTheme();
  const { user } = useAuth();

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'RD$ 0';
    if (amount >= 1000000) {
      return `RD$ ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `RD$ ${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    if (!number && number !== 0) return '0';
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('es-DO').format(number);
  };

  const getChartOptions = (type = 'bar') => {
    const textColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
    const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB';
    
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
          titleColor: theme === 'dark' ? '#F3F4F6' : '#111827',
          bodyColor: textColor,
          borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              if (context.raw && context.raw.monto) {
                return `${context.label}: ${formatCurrency(context.raw.monto)}`;
              }
              return `${context.label}: ${formatNumber(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            callback: function(value) {
              if (type === 'currency') {
                return formatCurrency(value);
              }
              return value;
            }
          }
        },
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor }
        }
      }
    };

    if (type === 'doughnut' || type === 'pie' || type === 'radar') {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              boxWidth: 12,
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            titleColor: theme === 'dark' ? '#F3F4F6' : '#111827',
            bodyColor: textColor,
          }
        }
      };
    }

    return baseOptions;
  };

  const getBarData = (data, label) => {
    const safeData = Array.isArray(data) ? data : [];
    return {
      labels: safeData.map(item => item?.mes || item?.label || item?.nombre || ''),
      datasets: [
        {
          label: label || 'Valores',
          data: safeData.map(item => item?.value || item?.cantidad || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.7,
        },
      ],
    };
  };

  const getBarDataGrouped = (data) => {
    const safeData = Array.isArray(data) ? data : [];
    return {
      labels: safeData.map(item => item?.mes || ''),
      datasets: [
        {
          label: 'Ingresos',
          data: safeData.map(item => item?.ingresos || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Gastos',
          data: safeData.map(item => item?.gastos || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  };

  const getLineData = (data, label, color) => {
    const safeData = Array.isArray(data) ? data : [];
    return {
      labels: safeData.map(item => item?.mes || item?.fecha || item?.label || ''),
      datasets: [
        {
          label,
          data: safeData.map(item => item?.value || item?.cantidad || item?.monto || 0),
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const getDoughnutData = (data) => {
    const safeData = Array.isArray(data) ? data : [];
    
    if (safeData.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#E5E7EB'],
            borderColor: 'transparent',
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      };
    }
    
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];
    
    return {
      labels: safeData.map(item => item?.estado || item?.tipo || item?.nombre || ''),
      datasets: [
        {
          data: safeData.map(item => item?.value || item?.cantidad || 1),
          backgroundColor: safeData.map((item, index) => 
            item?.color || colors[index % colors.length]
          ),
          borderColor: 'transparent',
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  };

  // Iconos para actividad reciente
  const iconMap = {
    CreditCardIcon: CreditCardIcon,
    DocumentTextIcon: DocumentTextIcon,
    CurrencyDollarIcon: CurrencyDollarIcon,
    UsersIcon: UsersIcon
  };

  // Cargar dashboards guardados
  useEffect(() => {
    const cargarDashboards = async () => {
      try {
        const dashboardsRef = collection(db, 'dashboards');
        const q = query(dashboardsRef, orderBy('fechaCreacion', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const dashboards = [];
        querySnapshot.forEach((doc) => {
          dashboards.push({ id: doc.id, ...doc.data() });
        });
        
        setDashboardsGuardados(dashboards);
        if (dashboards.length > 0) {
          setCurrentDashboard(dashboards[0]);
        }
      } catch (error) {
        console.error('Error cargando dashboards:', error);
      }
    };
    
    cargarDashboards();
  }, []);

  // Cargar datos del dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Actualizando datos del dashboard...', filtros);
      const data = await dashboardService.getDashboardStats(filtros);
      console.log('✅ Datos recibidos:', data);
      
      // Extraer datos para composición de cartera
      const prestamosActivos = data.stats?.prestamos || 0;
      const prestamosCompletados = data.stats?.prestamosCompletados || 0;
      const prestamosMorosos = data.stats?.prestamosMorosos || 0;
      const promedioPrestamo = data.metricas?.promedioPrestamo || 0;
      
      setDashboardData({
        ...data,
        stats: {
          ...data.stats,
          prestamosActivos,
          prestamosCompletados,
          prestamosMorosos,
          capitalActivo: (prestamosActivos * promedioPrestamo) || 0,
          capitalEnRiesgo: (prestamosMorosos * promedioPrestamo) || 0,
          promedioPrestamo
        },
        rendimientoData: data.rendimiento || { 
          cantidades: { 
            clientes: data.stats?.clientes || 0,
            prestamos: data.stats?.prestamos || 0,
            pagos: data.stats?.pagosTotales || 0,
            solicitudes: data.stats?.solicitudes || 0
          }, 
          montos: { 
            capitalPrestado: data.stats?.capitalPrestado || 0,
            capitalRecuperado: data.stats?.capitalRecuperado || 0,
            ganancias: data.stats?.gananciasMes || 0
          } 
        }
      });
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Error al cargar los datos. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Calcular cambios porcentuales
  const calculateChange = (currentValue, metricType) => {
    const historicalData = {
      clientes: currentValue * 0.85,
      prestamos: currentValue * 0.80,
      pagosUltimos15Dias: currentValue * 0.70,
      solicitudes: currentValue * 1.2,
      gananciasMes: currentValue * 0.75,
      capitalPrestado: currentValue * 0.80,
      morosidad: currentValue * 1.1,
      nuevosClientes: currentValue * 0.90,
      capitalRecuperado: currentValue * 0.85,
      tasaRecuperacion: currentValue * 0.95,
      prestamosMes: currentValue * 0.70,
      prestamosDesembolsadosMes: currentValue * 0.70
    };

    const previous = historicalData[metricType] || currentValue * 0.8;
    
    if (!previous || previous === 0) return null;
    
    const change = ((currentValue - previous) / previous * 100);
    return {
      value: Math.abs(Math.round(change)),
      type: change >= 0 ? 'positive' : 'negative'
    };
  };

  // Guardar dashboard
  const handleSaveDashboard = async (dashboardData) => {
    try {
      if (editingDashboard) {
        const docRef = doc(db, 'dashboards', editingDashboard.id);
        await updateDoc(docRef, {
          ...dashboardData,
          configuracion: {
            filtros,
            chartVisibility
          }
        });
        
        setDashboardsGuardados(prev => prev.map(d => 
          d.id === editingDashboard.id ? { ...d, ...dashboardData } : d
        ));
        setEditingDashboard(null);
      } else {
        const docRef = await addDoc(collection(db, 'dashboards'), {
          ...dashboardData,
          configuracion: {
            filtros,
            chartVisibility
          }
        });
        
        const nuevoDashboard = { id: docRef.id, ...dashboardData };
        setDashboardsGuardados(prev => [nuevoDashboard, ...prev]);
        setCurrentDashboard(nuevoDashboard);
      }
      
      const dashboardsRef = collection(db, 'dashboards');
      const q = query(dashboardsRef, orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);
      const dashboards = [];
      querySnapshot.forEach((doc) => {
        dashboards.push({ id: doc.id, ...doc.data() });
      });
      setDashboardsGuardados(dashboards);
      
    } catch (error) {
      console.error('Error guardando dashboard:', error);
      setError('Error al guardar el dashboard');
    }
  };

  // Editar dashboard
  const handleEditDashboard = async (id, data) => {
    try {
      const docRef = doc(db, 'dashboards', id);
      await updateDoc(docRef, data);
      
      setDashboardsGuardados(prev => prev.map(d => 
        d.id === id ? { ...d, ...data } : d
      ));
      
      if (currentDashboard?.id === id) {
        setCurrentDashboard({ ...currentDashboard, ...data });
      }
    } catch (error) {
      console.error('Error editando dashboard:', error);
      setError('Error al editar el dashboard');
    }
  };

  // Cargar dashboard guardado
  const handleLoadDashboard = (dashboard) => {
    setCurrentDashboard(dashboard);
    if (dashboard.configuracion) {
      setFiltros(dashboard.configuracion.filtros || { periodo: 'mes', año: new Date().getFullYear().toString() });
      setChartVisibility(dashboard.configuracion.chartVisibility || {});
    }
    setShowDashboardManager(false);
  };

  // Eliminar dashboard
  const handleDeleteDashboard = async (id) => {
    try {
      await deleteDoc(doc(db, 'dashboards', id));
      setDashboardsGuardados(prev => prev.filter(d => d.id !== id));
      if (currentDashboard?.id === id) {
        setCurrentDashboard(dashboardsGuardados[0] || null);
      }
    } catch (error) {
      console.error('Error eliminando dashboard:', error);
      setError('Error al eliminar el dashboard');
    }
  };

  // Toggle visibilidad de gráfico
  const toggleChart = (chartId) => {
    setChartVisibility(prev => ({
      ...prev,
      [chartId]: !prev[chartId]
    }));
  };

  // Abrir modal de gráfico
  const openChartModal = (chartTitle, chartData, chartType) => {
    setSelectedChart({
      title: chartTitle,
      data: chartData,
      type: chartType
    });
    setModalOpen(true);
  };

  if (loading && !lastUpdated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6 relative min-h-screen">
      <QuickActions />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-red-500/30 to-red-600/30 rounded-2xl blur-3xl animate-gradient-xy" />
        
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${
            theme === 'dark' ? '#fff' : '#000'
          } 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
        
        <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-red-600/20`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-red-600 to-red-800 rounded-xl sm:rounded-2xl shadow-xl"
              >
                <PresentationChartLineIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </motion.div>
              <div>
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-500`}>
                  Dashboard Inteligente
                </h1>
                <p className={`text-xs sm:text-sm mt-1 flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1" />
                  Análisis en tiempo real con métricas avanzadas
                  {lastUpdated && (
                    <span className="text-xs ml-2 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {lastUpdated.toLocaleTimeString('es-DO')}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1 sm:space-x-2 relative ${
                  showFilters
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FunnelIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Filtros</span>
                {Object.keys(filtros).length > 2 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {Object.keys(filtros).length - 2}
                  </span>
                )}
              </motion.button>

              <DashboardSelector
                dashboards={dashboardsGuardados}
                currentDashboard={currentDashboard}
                onOpenManager={() => setShowDashboardManager(true)}
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchDashboardData}
                disabled={loading}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Refrescar datos"
              >
                <ArrowPathIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            filters={filtros}
            onFilterChange={setFiltros}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 sm:p-4 rounded-xl border-2 flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-700 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Clientes Activos"
          value={formatNumber(dashboardData.stats.clientes)}
          change={calculateChange(dashboardData.stats.clientes, 'clientes')?.value}
          changeType={calculateChange(dashboardData.stats.clientes, 'clientes')?.type}
          icon={UsersIcon}
          color="blue"
          link="/clientes"
          tooltip="Total de clientes con préstamos activos en el sistema. Se considera activo un cliente que tiene al menos un préstamo vigente."
        />
        <MetricCard
          title="Préstamos Activos"
          value={formatNumber(dashboardData.stats.prestamos)}
          change={calculateChange(dashboardData.stats.prestamos, 'prestamos')?.value}
          changeType={calculateChange(dashboardData.stats.prestamos, 'prestamos')?.type}
          icon={CurrencyDollarIcon}
          color="green"
          link="/prestamos"
          tooltip="Préstamos vigentes en este momento. No incluye préstamos completados o cancelados."
        />
        <MetricCard
          title="Pagos (Últimos 15 días)"
          value={formatNumber(dashboardData.stats.pagosUltimos15Dias || dashboardData.stats.pagosHoy || 0)}
          change={calculateChange(dashboardData.stats.pagosUltimos15Dias || dashboardData.stats.pagosHoy, 'pagosUltimos15Dias')?.value}
          changeType={calculateChange(dashboardData.stats.pagosUltimos15Dias || dashboardData.stats.pagosHoy, 'pagosUltimos15Dias')?.type}
          icon={CreditCardIcon}
          color="teal"
          link="/pagos"
          tooltip="Pagos recibidos en los últimos 15 días. Incluye pagos de capital e intereses."
        />
        <MetricCard
          title="Tasa de Morosidad"
          value={`${dashboardData.stats.morosidad}%`}
          change={calculateChange(dashboardData.stats.morosidad, 'morosidad')?.value}
          changeType={dashboardData.stats.morosidad <= 5 ? 'positive' : 'negative'}
          icon={ChartBarIcon}
          color="red"
          link="/prestamos"
          tooltip="Porcentaje de préstamos en mora sobre el total de préstamos activos. Una tasa superior al 5% requiere atención."
        />
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Capital Prestado"
          value={formatCurrency(dashboardData.stats.capitalPrestado)}
          change={calculateChange(dashboardData.stats.capitalPrestado, 'capitalPrestado')?.value}
          changeType={calculateChange(dashboardData.stats.capitalPrestado, 'capitalPrestado')?.type}
          icon={BanknotesIcon}
          color="indigo"
          link="/prestamos"
          tooltip="Total de capital prestado a todos los clientes, incluyendo préstamos activos y completados."
        />
        <MetricCard
          title="Capital Recuperado"
          value={formatCurrency(dashboardData.stats.capitalRecuperado)}
          change={calculateChange(dashboardData.stats.capitalRecuperado, 'capitalRecuperado')?.value}
          changeType={calculateChange(dashboardData.stats.capitalRecuperado, 'capitalRecuperado')?.type}
          icon={CheckCircleIcon}
          color="emerald"
          link="/pagos"
          description={`${dashboardData.stats.tasaRecuperacion}% del total`}
          tooltip="Capital recuperado del total prestado. Incluye todos los pagos de capital realizados."
        />
        <MetricCard
          title="Ganancias del Mes"
          value={formatCurrency(dashboardData.stats.gananciasMes)}
          change={calculateChange(dashboardData.stats.gananciasMes, 'gananciasMes')?.value}
          changeType={calculateChange(dashboardData.stats.gananciasMes, 'gananciasMes')?.type}
          icon={ArrowTrendingUpIcon}
          color="purple"
          link="/pagos"
          description="Solo intereses"
          tooltip="Intereses generados en el mes actual. No incluye pagos de capital."
        />
        <MetricCard
          title="Préstamos del Mes"
          value={formatNumber(dashboardData.stats.prestamosMes)}
          change={calculateChange(dashboardData.stats.prestamosMes, 'prestamosMes')?.value}
          changeType={calculateChange(dashboardData.stats.prestamosMes, 'prestamosMes')?.type}
          icon={DocumentTextIcon}
          color="cyan"
          link="/prestamos"
          tooltip="Préstamos desembolsados en el mes actual."
        />
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Préstamos Desembolsados"
          value={formatNumber(dashboardData.stats.prestamosDesembolsadosMes)}
          change={calculateChange(dashboardData.stats.prestamosDesembolsadosMes, 'prestamosDesembolsadosMes')?.value}
          changeType={calculateChange(dashboardData.stats.prestamosDesembolsadosMes, 'prestamosDesembolsadosMes')?.type}
          icon={CurrencyDollarIcon}
          color="purple"
          link="/prestamos"
          tooltip="Préstamos desembolsados en el mes actual."
        />
        <MetricCard
          title="Clientes Nuevos"
          value={formatNumber(dashboardData.stats.nuevosClientes)}
          change={calculateChange(dashboardData.stats.nuevosClientes, 'nuevosClientes')?.value}
          changeType={calculateChange(dashboardData.stats.nuevosClientes, 'nuevosClientes')?.type}
          icon={UsersIcon}
          color="blue"
          link="/clientes"
          tooltip="Clientes registrados en el mes actual."
        />
        <MetricCard
          title="Solicitudes Pendientes"
          value={formatNumber(dashboardData.stats.solicitudes)}
          change={calculateChange(dashboardData.stats.solicitudes, 'solicitudes')?.value}
          changeType={calculateChange(dashboardData.stats.solicitudes, 'solicitudes')?.type}
          icon={DocumentTextIcon}
          color="orange"
          link="/solicitudes"
          tooltip="Solicitudes pendientes de aprobación."
        />
        <MetricCard
          title="Tasa Recuperación"
          value={`${dashboardData.stats.tasaRecuperacion}%`}
          change={calculateChange(dashboardData.stats.tasaRecuperacion, 'tasaRecuperacion')?.value}
          changeType={calculateChange(dashboardData.stats.tasaRecuperacion, 'tasaRecuperacion')?.type}
          icon={CheckCircleIcon}
          color="green"
          link="/pagos"
          tooltip="Porcentaje de capital recuperado sobre el total prestado."
        />
      </div>

      {/* Gráficos Personalizables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomizableChart
          title="Pagos por Mes"
          data={getBarData(dashboardData.graficos.pagosPorMes, 'pagosPorMes')}
          type="bar"
          isVisible={chartVisibility.pagosPorMes !== false}
          onToggle={() => toggleChart('pagosPorMes')}
          onExpand={() => openChartModal('Pagos por Mes', getBarData(dashboardData.graficos.pagosPorMes, 'pagosPorMes'), 'bar')}
          getChartOptions={getChartOptions}
        />

        <CustomizableChart
          title="Préstamos por Mes"
          data={getLineData(dashboardData.graficos.prestamosPorMes, 'Préstamos por Mes', '#10B981')}
          type="line"
          isVisible={chartVisibility.prestamosPorMes !== false}
          onToggle={() => toggleChart('prestamosPorMes')}
          onExpand={() => openChartModal('Préstamos por Mes', getLineData(dashboardData.graficos.prestamosPorMes, 'Préstamos por Mes', '#10B981'), 'line')}
          getChartOptions={getChartOptions}
        />

        <CustomizableChart
          title="Ganancias por Mes"
          data={getLineData(dashboardData.graficos.gananciasPorMes, 'Ganancias por Mes', '#8B5CF6')}
          type="line"
          isVisible={chartVisibility.gananciasPorMes !== false}
          onToggle={() => toggleChart('gananciasPorMes')}
          onExpand={() => openChartModal('Ganancias por Mes', getLineData(dashboardData.graficos.gananciasPorMes, 'Ganancias por Mes', '#8B5CF6'), 'line')}
          getChartOptions={getChartOptions}
        />

        <CustomizableChart
          title="Distribución de Pagos"
          data={getDoughnutData(dashboardData.graficos.distribucionPagos)}
          type="doughnut"
          isVisible={chartVisibility.distribucionPagos !== false}
          onToggle={() => toggleChart('distribucionPagos')}
          onExpand={() => openChartModal('Distribución de Pagos', getDoughnutData(dashboardData.graficos.distribucionPagos), 'doughnut')}
          getChartOptions={getChartOptions}
        />

        <CustomizableChart
          title="Estado de Préstamos"
          data={getDoughnutData(dashboardData.graficos.distribucionPrestamos)}
          type="pie"
          isVisible={chartVisibility.distribucionPrestamos !== false}
          onToggle={() => toggleChart('distribucionPrestamos')}
          onExpand={() => openChartModal('Estado de Préstamos', getDoughnutData(dashboardData.graficos.distribucionPrestamos), 'pie')}
          getChartOptions={getChartOptions}
        />

        <CustomizableChart
          title="Solicitudes por Estado"
          data={getDoughnutData(dashboardData.graficos.solicitudesPorEstado)}
          type="doughnut"
          isVisible={chartVisibility.solicitudesPorEstado !== false}
          onToggle={() => toggleChart('solicitudesPorEstado')}
          onExpand={() => openChartModal('Solicitudes por Estado', getDoughnutData(dashboardData.graficos.solicitudesPorEstado), 'doughnut')}
          getChartOptions={getChartOptions}
        />

        <CustomizableChart
          title="Clientes por Provincia"
          data={getBarData(dashboardData.graficos.clientesPorProvincia, 'clientesPorProvincia')}
          type="bar"
          isVisible={chartVisibility.clientesPorProvincia !== false}
          onToggle={() => toggleChart('clientesPorProvincia')}
          onExpand={() => openChartModal('Clientes por Provincia', getBarData(dashboardData.graficos.clientesPorProvincia, 'clientesPorProvincia'), 'bar')}
          getChartOptions={getChartOptions}
        />

        <CustomizableChart
          title="Morosidad por Mes"
          data={getLineData(dashboardData.graficos.morosidadPorMes, 'Morosidad %', '#EF4444')}
          type="line"
          isVisible={chartVisibility.morosidadPorMes !== false}
          onToggle={() => toggleChart('morosidadPorMes')}
          onExpand={() => openChartModal('Morosidad por Mes', getLineData(dashboardData.graficos.morosidadPorMes, 'Morosidad %', '#EF4444'), 'line')}
          getChartOptions={getChartOptions}
        />

        <PortfolioComposition data={dashboardData.stats} />

        <PerformanceRadar 
          data={dashboardData.rendimientoData}
          currentType={radarViewType}
          onTypeChange={setRadarViewType}
        />

        <CustomizableChart
          title="Ingresos vs Gastos"
          data={getBarDataGrouped(dashboardData.graficos.flujoCaja)}
          type="bar"
          isVisible={chartVisibility.ingresosVsGastos !== false}
          onToggle={() => toggleChart('ingresosVsGastos')}
          onExpand={() => openChartModal('Ingresos vs Gastos', getBarDataGrouped(dashboardData.graficos.flujoCaja), 'bar')}
          getChartOptions={getChartOptions}
        />

        <CustomizableChart
          title="Proyecciones a 6 meses"
          data={getLineData(dashboardData.graficos.proyecciones, 'Proyección', '#8B5CF6')}
          type="line"
          isVisible={chartVisibility.proyecciones !== false}
          onToggle={() => toggleChart('proyecciones')}
          onExpand={() => openChartModal('Proyecciones a 6 meses', getLineData(dashboardData.graficos.proyecciones, 'Proyección', '#8B5CF6'), 'line')}
          getChartOptions={getChartOptions}
        />
      </div>

      {/* KPIs Avanzados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="p-4 sm:p-6">
            <h4 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Indicadores Clave de Rendimiento (KPI)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'ROA', value: dashboardData.metricas.ROA, color: 'blue', icon: ChartPieIcon, tooltip: 'Retorno sobre Activos. Mide la rentabilidad de los activos totales.' },
                { label: 'ROE', value: dashboardData.metricas.ROE, color: 'green', icon: ArrowTrendingUpIcon, tooltip: 'Retorno sobre Patrimonio. Mide la rentabilidad del capital propio.' },
                { label: 'Liquidez', value: dashboardData.metricas.liquidez, color: 'purple', icon: WalletIcon, tooltip: 'Capacidad de pago a corto plazo. Mide la disponibilidad de efectivo.' },
                { label: 'Solvencia', value: dashboardData.metricas.solvencia, color: 'indigo', icon: ScaleIcon, tooltip: 'Capacidad de pago a largo plazo. Mide la estabilidad financiera.' }
              ].map((metric, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{metric.label}</p>
                    <metric.icon className={`h-4 w-4 text-${metric.color}-500`} />
                  </div>
                  <p className={`text-xl font-bold text-${metric.color}-600 dark:text-${metric.color}-400`}>
                    {metric.value}%
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {metric.tooltip}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tasa de Aprobación</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.metricas.tasaAprobacion}%
                  </span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, dashboardData.metricas.tasaAprobacion)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400"
                  />
                </div>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Porcentaje de solicitudes aprobadas vs total recibidas
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Eficiencia de Cobranza</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.metricas.eficienciaCobranza}%
                  </span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, dashboardData.metricas.eficienciaCobranza)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                  />
                </div>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Porcentaje de préstamos completados exitosamente
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Rentabilidad</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.metricas.rentabilidad}%
                  </span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, dashboardData.metricas.rentabilidad)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                  />
                </div>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Relación entre ganancias y capital prestado
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Índice de Morosidad</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.metricas.indiceMorosidad}%
                  </span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, dashboardData.metricas.indiceMorosidad)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
                  />
                </div>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Porcentaje de préstamos en mora vs préstamos activos
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-4">
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Actividad Reciente
                </h4>
                <Link to="/actividad" className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>
                  Ver todo →
                </Link>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {dashboardData.actividadReciente.length > 0 ? (
                  dashboardData.actividadReciente.map((actividad, index) => {
                    const IconComponent = iconMap[actividad.icono] || DocumentTextIcon;
                    
                    let fechaMostrar = 'Fecha no disponible';
                    let horaMostrar = '';
                    
                    if (actividad.fechaObj) {
                      fechaMostrar = actividad.fechaObj.toLocaleDateString('es-DO', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit'
                      }).replace(/\//g, '/');
                      horaMostrar = actividad.fechaObj.toLocaleTimeString('es-DO', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });
                    } else if (actividad.fecha) {
                      const fecha = convertTimestampToDate(actividad.fecha);
                      if (fecha) {
                        fechaMostrar = fecha.toLocaleDateString('es-DO', {
                          year: '2-digit',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\//g, '/');
                        horaMostrar = fecha.toLocaleTimeString('es-DO', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        });
                      }
                    }
                    
                    return (
                      <motion.div
                        key={actividad.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all hover:border-red-600/50 ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${actividad.color} bg-opacity-20`}>
                              <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${actividad.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs sm:text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {actividad.descripcion}
                              </p>
                              {actividad.monto > 0 && (
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatCurrency(actividad.monto)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-2 min-w-[70px]">
                            <span className={`text-xs whitespace-nowrap block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {fechaMostrar}
                            </span>
                            {horaMostrar && (
                              <span className={`text-xs block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {horaMostrar}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className={`text-center py-6 text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No hay actividad reciente
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Próximos Vencimientos
                </h4>
                <Link to="/prestamos" className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>
                  Ver todo →
                </Link>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {dashboardData.prestamosProximosVencimiento.length > 0 ? (
                  dashboardData.prestamosProximosVencimiento.map((prestamo, index) => {
                    let fechaVencimiento = '';
                    if (prestamo.fechaVencimientoObj) {
                      fechaVencimiento = prestamo.fechaVencimientoObj.toLocaleDateString('es-DO', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit'
                      }).replace(/\//g, '/');
                    } else if (prestamo.fechaVencimiento) {
                      const fecha = convertTimestampToDate(prestamo.fechaVencimiento);
                      fechaVencimiento = fecha ? fecha.toLocaleDateString('es-DO', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit'
                      }).replace(/\//g, '/') : 'Fecha no disponible';
                    }
                    
                    const esVencido = prestamo.diasRestantes <= 0;
                    
                    return (
                      <motion.div
                        key={prestamo.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all hover:border-red-600/50 ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-gray-50 border-gray-200'
                        } ${esVencido ? 'border-red-600 bg-red-50/50 dark:bg-red-900/20' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs sm:text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {prestamo.cliente}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Vence: {fechaVencimiento}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(prestamo.monto)}
                            </p>
                            <p className={`text-xs font-bold ${
                              esVencido 
                                ? 'text-red-600 dark:text-red-400 animate-pulse' 
                                : prestamo.diasRestantes <= 2 
                                ? 'text-red-600 dark:text-red-400' 
                                : prestamo.diasRestantes <= 5 
                                ? 'text-yellow-600 dark:text-yellow-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {esVencido ? '¡COBRAR AHORA!' : `${prestamo.diasRestantes} días`}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className={`text-center py-6 text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No hay vencimientos próximos
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <DashboardManagerModal
        isOpen={showDashboardManager}
        onClose={() => setShowDashboardManager(false)}
        dashboards={dashboardsGuardados}
        currentDashboard={currentDashboard}
        onSelect={handleLoadDashboard}
        onSave={handleSaveDashboard}
        onEdit={handleEditDashboard}
        onDelete={handleDeleteDashboard}
      />

      {selectedChart && (
        <ChartModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedChart.title}
          data={selectedChart.data}
          type={selectedChart.type}
          chartData={selectedChart.data}
          filters={filtros}
          onFilterChange={setFiltros}
        />
      )}

      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
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

export default Dashboard;