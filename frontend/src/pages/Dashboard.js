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
  BriefcaseIcon
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
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered, color = 'from-red-600 via-red-500 to-red-600' }) => {
  const { theme } = useTheme();
  
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur opacity-0 transition-all duration-500 ${
        isHovered ? 'opacity-75' : 'group-hover:opacity-50'
      }`} />
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur-lg opacity-0 transition-all duration-700 ${
        isHovered ? 'opacity-50' : 'group-hover:opacity-30'
      }`} />
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

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
const DashboardSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-64 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className={`h-10 w-32 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
      </div>

      {/* Métricas Skeleton */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-32 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE METRIC CARD MEJORADO
// ============================================
const MetricCard = ({ title, value, change, changeType, icon: Icon, color, link, description, gradient, onClick, tooltip }) => {
  const [isHovered, setIsHovered] = useState(false);
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
                  <div className="group/tooltip relative">
                    <InformationCircleIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                      {tooltip}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-baseline">
                <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </p>
                {change && (
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
// COMPONENTE DE FILTROS AVANZADOS
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

  const periodos = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'ayer', label: 'Ayer' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'mes', label: 'Este Mes' },
    { value: 'trimestre', label: 'Este Trimestre' },
    { value: 'año', label: 'Este Año' },
    { value: 'todo', label: 'Todo el Tiempo' },
    { value: 'personalizado', label: 'Personalizado' }
  ];

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
              <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
                <FunnelIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Filtros Avanzados
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
                <option value="">Todas</option>
                <option value="SD">Santo Domingo</option>
                <option value="Santiago">Santiago</option>
                <option value="La Vega">La Vega</option>
                <option value="Puerto Plata">Puerto Plata</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo de Préstamo
              </label>
              <select
                value={localFilters.tipoPrestamo || ''}
                onChange={(e) => handleChange('tipoPrestamo', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              >
                <option value="">Todos</option>
                <option value="personal">Personal</option>
                <option value="hipotecario">Hipotecario</option>
                <option value="vehicular">Vehicular</option>
                <option value="comercial">Comercial</option>
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
                <option value="">Todos</option>
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
              onClick={() => {
                setLocalFilters({ periodo: 'mes' });
                onFilterChange({ periodo: 'mes' });
                onClose();
              }}
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
// MODAL PARA GUARDAR DASHBOARD
// ============================================
const SaveDashboardModal = ({ isOpen, onClose, onSave, dashboard }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [nombre, setNombre] = useState(dashboard?.nombre || '');
  const [descripcion, setDescripcion] = useState(dashboard?.descripcion || '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      creadoPor: user?.email,
      fechaCreacion: new Date().toISOString()
    });
  };

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
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
            </div>

            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                  <PresentationChartLineIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {dashboard ? 'Editar Dashboard' : 'Guardar Dashboard'}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre del Dashboard *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setError('');
                  }}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
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
                <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows="3"
                  className={`w-full px-4 py-2 rounded-lg border-2 resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                  } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                  placeholder="Breve descripción del dashboard..."
                />
              </div>
            </div>

            <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'
            }`}>
              <button
                type="button"
                onClick={onClose}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Guardar
              </motion.button>
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
const DashboardSelector = ({ dashboards, currentDashboard, onSelectDashboard, onSaveNew, onEdit, onDelete }) => {
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
          theme === 'dark'
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <PresentationChartLineIcon className="h-4 w-4" />
        <span>{currentDashboard?.nombre || 'Dashboards'}</span>
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`absolute left-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-50 border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="py-2">
              {dashboards.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <button
                    onClick={() => {
                      onSelectDashboard(d);
                      setIsOpen(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {d.nombre}
                    </p>
                    {d.descripcion && (
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {d.descripcion}
                      </p>
                    )}
                  </button>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        onEdit(d);
                        setIsOpen(false);
                      }}
                      className="p-1 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        onDelete(d.id);
                        setIsOpen(false);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              
              <button
                onClick={() => {
                  onSaveNew();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Guardar como nuevo dashboard</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// COMPONENTE DE GRÁFICO PERSONALIZABLE (MODIFICADO)
// ============================================
const CustomizableChart = ({ title, data, type, onToggle, isVisible, getChartOptions }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getChartComponent = () => {
    switch(type) {
      case 'bar': return Bar;
      case 'line': return Line;
      case 'doughnut': return Doughnut;
      case 'pie': return Pie;
      case 'radar': return Radar;
      case 'scatter': return Scatter;
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
            <button
              onClick={onToggle}
              className={`p-2 rounded-lg transition-colors ${
                isHovered ? 'opacity-100' : 'opacity-0'
              } ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {isVisible ? (
                <EyeIcon className="h-5 w-5 text-green-600" />
              ) : (
                <EyeSlashIcon className="h-5 w-5 text-red-600" />
              )}
            </button>
          </div>
          <div className="h-80">
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
      pagosHoy: 0,
      solicitudes: 0,
      gananciasMes: 0,
      capitalPrestado: 0,
      morosidad: 0,
      pagosPendientes: 0,
      nuevosClientes: 0,
      capitalRecuperado: 0,
      tasaRecuperacion: 0
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
    prestamosProximosVencimiento: []
  });
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ periodo: 'mes' });
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [dashboardsGuardados, setDashboardsGuardados] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [chartVisibility, setChartVisibility] = useState({});
  
  const { theme } = useTheme();
  const { user } = useAuth();

  // ============================================
  // FUNCIONES AUXILIARES PARA GRÁFICOS (CORREGIDAS CON VALIDACIONES)
  // ============================================
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

  // FUNCIONES DE GRÁFICOS CORREGIDAS CON VALIDACIONES
  const getBarData = (data, label) => {
    // Validar que data exista y sea un array
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
    // Validar que data exista y sea un array
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
    // Validar que data exista y sea un array
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
    // Validar que data exista y sea un array
    const safeData = Array.isArray(data) ? data : [];
    
    // Si no hay datos, retornar estructura vacía pero válida
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

  const getRadarData = (data) => {
    // Validar que data exista
    if (!data || !data.stats) {
      return {
        labels: ['Clientes', 'Préstamos', 'Pagos', 'Ganancias', 'Recuperación', 'Solicitudes'],
        datasets: [
          {
            label: 'Rendimiento',
            data: [0, 0, 0, 0, 0, 0],
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
    }
    
    return {
      labels: ['Clientes', 'Préstamos', 'Pagos', 'Ganancias', 'Recuperación', 'Solicitudes'],
      datasets: [
        {
          label: 'Rendimiento',
          data: [
            data.stats.clientes / 10 || 0,
            data.stats.prestamos / 10 || 0,
            data.stats.pagosHoy * 2 || 0,
            data.stats.gananciasMes / 10000 || 0,
            data.stats.tasaRecuperacion || 0,
            data.stats.solicitudes / 5 || 0,
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
      
      console.log('🔄 Actualizando datos del dashboard...');
      const data = await dashboardService.getDashboardStats(filtros);
      console.log('✅ Datos recibidos:', data);
      
      setDashboardData(data);
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
    
    // Actualizar cada 5 minutos para datos en tiempo real
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Calcular cambios porcentuales
  const calculateChange = (currentValue, metricType) => {
    const historicalData = {
      clientes: currentValue * 0.85,
      prestamos: currentValue * 0.80,
      pagosHoy: currentValue * 0.70,
      solicitudes: currentValue * 1.2,
      gananciasMes: currentValue * 0.75,
      capitalPrestado: currentValue * 0.80,
      morosidad: currentValue * 1.1,
      nuevosClientes: currentValue * 0.90,
      capitalRecuperado: currentValue * 0.85,
      tasaRecuperacion: currentValue * 0.95
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
      
      setShowSaveModal(false);
      setEditingDashboard(null);
    } catch (error) {
      console.error('Error guardando dashboard:', error);
      setError('Error al guardar el dashboard');
    }
  };

  // Cargar dashboard guardado
  const handleLoadDashboard = (dashboard) => {
    setCurrentDashboard(dashboard);
    if (dashboard.configuracion) {
      setFiltros(dashboard.configuracion.filtros || { periodo: 'mes' });
      setChartVisibility(dashboard.configuracion.chartVisibility || {});
    }
  };

  // Eliminar dashboard
  const handleDeleteDashboard = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este dashboard?')) {
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
    }
  };

  // Toggle visibilidad de gráfico
  const toggleChart = (chartId) => {
    setChartVisibility(prev => ({
      ...prev,
      [chartId]: !prev[chartId]
    }));
  };

  if (loading && !lastUpdated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header Ultra Premium */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/20 via-purple-600/20 to-red-600/20 rounded-2xl blur-3xl animate-gradient-xy" />
        
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
                className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-red-600 via-purple-600 to-red-600 rounded-xl sm:rounded-2xl shadow-xl"
              >
                <PresentationChartLineIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </motion.div>
              <div>
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-red-600 bg-clip-text text-transparent`}>
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
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1 sm:space-x-2 ${
                  showFilters
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FunnelIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Filtros</span>
                {Object.keys(filtros).length > 0 && (
                  <span className="bg-red-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {Object.keys(filtros).length}
                  </span>
                )}
              </motion.button>

              <DashboardSelector
                dashboards={dashboardsGuardados}
                currentDashboard={currentDashboard}
                onSelectDashboard={handleLoadDashboard}
                onSaveNew={() => {
                  setEditingDashboard(null);
                  setShowSaveModal(true);
                }}
                onEdit={(d) => {
                  setEditingDashboard(d);
                  setShowSaveModal(true);
                }}
                onDelete={handleDeleteDashboard}
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

      {/* Filtros Avanzados */}
      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            filters={filtros}
            onFilterChange={setFiltros}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Error Message */}
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

      {/* Quick Actions - Versión Mejorada */}
      <GlassCard>
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-lg">
              <RocketLaunchIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Acciones Rápidas
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { to: '/clientes', color: 'from-blue-600 to-blue-800', icon: UsersIcon, text: 'Clientes' },
              { to: '/prestamos', color: 'from-green-600 to-green-800', icon: CurrencyDollarIcon, text: 'Préstamos' },
              { to: '/pagos', color: 'from-teal-600 to-teal-800', icon: CreditCardIcon, text: 'Pagos' },
              { to: '/solicitudes', color: 'from-purple-600 to-purple-800', icon: DocumentTextIcon, text: 'Solicitudes' }
            ].map((action, index) => (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={action.to}
                  className={`relative overflow-hidden group block p-3 sm:p-4 rounded-xl bg-gradient-to-br ${action.color} shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                >
                  <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <div className="relative flex items-center space-x-2">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span className="text-white text-xs sm:text-sm font-medium">{action.text}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Métricas Principales - 8 tarjetas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Clientes Activos"
          value={formatNumber(dashboardData.stats.clientes)}
          change={calculateChange(dashboardData.stats.clientes, 'clientes')?.value}
          changeType={calculateChange(dashboardData.stats.clientes, 'clientes')?.type}
          icon={UsersIcon}
          color="blue"
          link="/clientes"
          tooltip="Total de clientes con préstamos activos"
        />
        <MetricCard
          title="Préstamos Activos"
          value={formatNumber(dashboardData.stats.prestamos)}
          change={calculateChange(dashboardData.stats.prestamos, 'prestamos')?.value}
          changeType={calculateChange(dashboardData.stats.prestamos, 'prestamos')?.type}
          icon={CurrencyDollarIcon}
          color="green"
          link="/prestamos"
          tooltip="Préstamos vigentes en este momento"
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
          tooltip="Intereses generados en el mes"
        />
        <MetricCard
          title="Tasa de Morosidad"
          value={`${dashboardData.stats.morosidad}%`}
          change={calculateChange(dashboardData.stats.morosidad, 'morosidad')?.value}
          changeType={dashboardData.stats.morosidad <= 5 ? 'positive' : 'negative'}
          icon={ChartBarIcon}
          color="red"
          link="/prestamos"
          tooltip="Porcentaje de préstamos en mora"
        />
      </div>

      {/* Segunda Fila de Métricas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Capital Prestado"
          value={formatCurrency(dashboardData.stats.capitalPrestado)}
          change={calculateChange(dashboardData.stats.capitalPrestado, 'capitalPrestado')?.value}
          changeType={calculateChange(dashboardData.stats.capitalPrestado, 'capitalPrestado')?.type}
          icon={BanknotesIcon}
          color="indigo"
          link="/prestamos"
          tooltip="Total de capital prestado"
        />
        <MetricCard
          title="Pagos Hoy"
          value={formatNumber(dashboardData.stats.pagosHoy)}
          change={calculateChange(dashboardData.stats.pagosHoy, 'pagosHoy')?.value}
          changeType={calculateChange(dashboardData.stats.pagosHoy, 'pagosHoy')?.type}
          icon={CreditCardIcon}
          color="teal"
          link="/pagos"
          tooltip="Pagos recibidos hoy"
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
          tooltip="Capital recuperado del total prestado"
        />
        <MetricCard
          title="Clientes Nuevos"
          value={formatNumber(dashboardData.stats.nuevosClientes)}
          change={calculateChange(dashboardData.stats.nuevosClientes, 'nuevosClientes')?.value}
          changeType={calculateChange(dashboardData.stats.nuevosClientes, 'nuevosClientes')?.type}
          icon={UsersIcon}
          color="cyan"
          link="/clientes"
          tooltip="Clientes registrados en el mes"
        />
      </div>

      {/* Gráficos Personalizables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pagos por Mes */}
        <CustomizableChart
          title="Pagos por Mes"
          data={getBarData(dashboardData.graficos.pagosPorMes, 'pagosPorMes')}
          type="bar"
          isVisible={chartVisibility.pagosPorMes !== false}
          onToggle={() => toggleChart('pagosPorMes')}
          getChartOptions={getChartOptions}
        />

        {/* Préstamos por Mes */}
        <CustomizableChart
          title="Préstamos por Mes"
          data={getLineData(dashboardData.graficos.prestamosPorMes, 'Préstamos por Mes', '#10B981')}
          type="line"
          isVisible={chartVisibility.prestamosPorMes !== false}
          onToggle={() => toggleChart('prestamosPorMes')}
          getChartOptions={getChartOptions}
        />

        {/* Ganancias por Mes */}
        <CustomizableChart
          title="Ganancias por Mes"
          data={getLineData(dashboardData.graficos.gananciasPorMes, 'Ganancias por Mes', '#8B5CF6')}
          type="line"
          isVisible={chartVisibility.gananciasPorMes !== false}
          onToggle={() => toggleChart('gananciasPorMes')}
          getChartOptions={getChartOptions}
        />

        {/* Distribución de Pagos */}
        <CustomizableChart
          title="Distribución de Pagos"
          data={getDoughnutData(dashboardData.graficos.distribucionPagos)}
          type="doughnut"
          isVisible={chartVisibility.distribucionPagos !== false}
          onToggle={() => toggleChart('distribucionPagos')}
          getChartOptions={getChartOptions}
        />

        {/* Estado de Préstamos */}
        <CustomizableChart
          title="Estado de Préstamos"
          data={getDoughnutData(dashboardData.graficos.distribucionPrestamos)}
          type="pie"
          isVisible={chartVisibility.distribucionPrestamos !== false}
          onToggle={() => toggleChart('distribucionPrestamos')}
          getChartOptions={getChartOptions}
        />

        {/* Solicitudes por Estado */}
        <CustomizableChart
          title="Solicitudes por Estado"
          data={getDoughnutData(dashboardData.graficos.solicitudesPorEstado)}
          type="doughnut"
          isVisible={chartVisibility.solicitudesPorEstado !== false}
          onToggle={() => toggleChart('solicitudesPorEstado')}
          getChartOptions={getChartOptions}
        />

        {/* Préstamos por Tipo */}
        <CustomizableChart
          title="Préstamos por Tipo"
          data={getDoughnutData(dashboardData.graficos.prestamosPorTipo)}
          type="doughnut"
          isVisible={chartVisibility.prestamosPorTipo !== false}
          onToggle={() => toggleChart('prestamosPorTipo')}
          getChartOptions={getChartOptions}
        />

        {/* Clientes por Provincia */}
        <CustomizableChart
          title="Clientes por Provincia"
          data={getBarData(dashboardData.graficos.clientesPorProvincia, 'clientesPorProvincia')}
          type="bar"
          isVisible={chartVisibility.clientesPorProvincia !== false}
          onToggle={() => toggleChart('clientesPorProvincia')}
          getChartOptions={getChartOptions}
        />

        {/* Morosidad por Mes */}
        <CustomizableChart
          title="Morosidad por Mes"
          data={getLineData(dashboardData.graficos.morosidadPorMes, 'Morosidad %', '#EF4444')}
          type="line"
          isVisible={chartVisibility.morosidadPorMes !== false}
          onToggle={() => toggleChart('morosidadPorMes')}
          getChartOptions={getChartOptions}
        />

        {/* Flujo de Caja */}
        <CustomizableChart
          title="Flujo de Caja"
          data={getLineData(dashboardData.graficos.flujoCaja, 'Flujo de Caja', '#10B981')}
          type="line"
          isVisible={chartVisibility.flujoCaja !== false}
          onToggle={() => toggleChart('flujoCaja')}
          getChartOptions={getChartOptions}
        />

        {/* Radar de Rendimiento */}
        <CustomizableChart
          title="Rendimiento por Área"
          data={getRadarData(dashboardData)}
          type="radar"
          isVisible={chartVisibility.radar !== false}
          onToggle={() => toggleChart('radar')}
          getChartOptions={getChartOptions}
        />

        {/* Ingresos vs Gastos */}
        <CustomizableChart
          title="Ingresos vs Gastos"
          data={getBarDataGrouped(dashboardData.graficos.ingresosVsGastos)}
          type="bar"
          isVisible={chartVisibility.ingresosVsGastos !== false}
          onToggle={() => toggleChart('ingresosVsGastos')}
          getChartOptions={getChartOptions}
        />

        {/* Proyecciones */}
        <CustomizableChart
          title="Proyecciones a 6 meses"
          data={getLineData(dashboardData.graficos.proyecciones, 'Proyección', '#8B5CF6')}
          type="line"
          isVisible={chartVisibility.proyecciones !== false}
          onToggle={() => toggleChart('proyecciones')}
          getChartOptions={getChartOptions}
        />
      </div>

      {/* Métricas de Desempeño Avanzadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KPIs Avanzados */}
        <GlassCard>
          <div className="p-4 sm:p-6">
            <h4 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Indicadores Clave de Rendimiento (KPI)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'ROA', value: dashboardData.metricas.ROA, color: 'blue' },
                { label: 'ROE', value: dashboardData.metricas.ROE, color: 'green' },
                { label: 'Liquidez', value: dashboardData.metricas.liquidez, color: 'purple' },
                { label: 'Solvencia', value: dashboardData.metricas.solvencia, color: 'indigo' }
              ].map((metric, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{metric.label}</p>
                  <p className={`text-xl font-bold text-${metric.color}-600 dark:text-${metric.color}-400`}>
                    {metric.value}%
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
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboardData.metricas.tasaAprobacion}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Rentabilidad</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.metricas.rentabilidad}%
                  </span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboardData.metricas.rentabilidad}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Eficiencia de Cobranza</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.metricas.eficienciaCobranza}%
                  </span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboardData.metricas.eficienciaCobranza}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Índice de Morosidad</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.metricas.indiceMorosidad}%
                  </span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboardData.metricas.indiceMorosidad}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Actividad Reciente y Vencimientos */}
        <div className="grid grid-cols-1 gap-4">
          {/* Actividad Reciente */}
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Actividad Reciente
                </h4>
                <Link to="/pagos" className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>
                  Ver todo →
                </Link>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {dashboardData.actividadReciente.length > 0 ? (
                  dashboardData.actividadReciente.map((actividad, index) => {
                    const IconComponent = iconMap[actividad.icono] || DocumentTextIcon;
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
                          <span className={`text-xs whitespace-nowrap ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(actividad.fecha).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
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

          {/* Próximos Vencimientos */}
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
                  dashboardData.prestamosProximosVencimiento.map((prestamo, index) => (
                    <motion.div
                      key={prestamo.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all hover:border-red-600/50 ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs sm:text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {prestamo.cliente}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Vence: {new Date(prestamo.fechaVencimiento).toLocaleDateString('es-DO')}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(prestamo.monto)}
                          </p>
                          <p className={`text-xs ${
                            prestamo.diasRestantes <= 2 
                              ? 'text-red-600 dark:text-red-400' 
                              : prestamo.diasRestantes <= 5 
                              ? 'text-yellow-600 dark:text-yellow-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {prestamo.diasRestantes} días
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
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

      {/* Modal para guardar dashboard */}
      <SaveDashboardModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setEditingDashboard(null);
        }}
        onSave={handleSaveDashboard}
        dashboard={editingDashboard}
      />

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

export default Dashboard;