import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  XMarkIcon,
  FunnelIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  InformationCircleIcon,
  CalculatorIcon,
  UserIcon,
  IdentificationIcon,
  PhoneIcon,
  BriefcaseIcon,
  HomeIcon,
  BuildingOfficeIcon,
  TagIcon,
  WalletIcon,
  PresentationChartLineIcon,
  TrophyIcon,
  PercentBadgeIcon,
  GiftIcon,
  ChartPieIcon,
  CreditCardIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PrestamoForm from '../components/Prestamos/PrestamoForm';
import PrestamoDetails from '../components/Prestamos/PrestamoDetails';
import RegistrarPago from '../components/Prestamos/RegistrarPago';
import PrestamosTable from '../components/Prestamos/PrestamosTable';
import { normalizeFirebaseData, firebaseTimestampToLocalString, formatFecha, firebaseTimestampToDate, toLocalDateString } from '../utils/firebaseUtils';
import { 
  calcularInteresPorDias, 
  getConfiguracionMora,
  getDescripcionFrecuencia
} from '../utils/loanCalculations';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl blur-lg opacity-0 transition-all duration-700 ${
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
      className={`rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800/80 backdrop-blur-lg' 
          : 'bg-white shadow-lg'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SKELETON LOADER
// ============================================
const PrestamosSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-64 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className="flex space-x-2">
          <div className={`h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-24 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>
      <div className={`h-96 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
    </div>
  );
};

// ============================================
// COMPONENTE DE STATS CARD MEJORADO
// ============================================
const StatsCard = ({ icon: Icon, label, value, subValue, gradient, trend, tooltip, badge }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const gradientColors = {
    green: 'from-green-600 to-green-800',
    blue: 'from-blue-600 to-blue-800',
    purple: 'from-purple-600 to-purple-800',
    orange: 'from-orange-600 to-orange-800',
    teal: 'from-teal-600 to-teal-800',
    red: 'from-red-600 to-red-800',
    yellow: 'from-yellow-500 to-yellow-700',
    indigo: 'from-indigo-600 to-indigo-800',
    pink: 'from-pink-600 to-pink-800',
    emerald: 'from-emerald-600 to-emerald-800',
    cyan: 'from-cyan-600 to-cyan-800',
    rose: 'from-rose-600 to-rose-800',
    amber: 'from-amber-600 to-amber-800'
  };

  return (
    <BorderGlow isHovered={isHovered}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-xl p-3 sm:p-4 border-2 hover:border-red-600/40 transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white border-gray-200 shadow-md'
        }`}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColors[gradient]} opacity-10 rounded-full blur-3xl`} />
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className={`text-[10px] sm:text-xs font-medium truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {label}
              </p>
              {tooltip && (
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="focus:outline-none"
                >
                  <InformationCircleIcon className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
            <p className={`text-base sm:text-lg font-bold mt-0.5 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {value}
            </p>
            <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-0.5`}>
              {subValue}
            </p>
          </div>
          <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${gradientColors[gradient]} rounded-xl shadow-lg ml-2 flex-shrink-0`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
        
        {badge && (
          <div className="absolute -top-1 -right-1">
            <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full ${badge.color || 'bg-red-600'} text-white`}>
              {badge.text}
            </span>
          </div>
        )}
        
        {trend && (
          <div className="absolute bottom-1 right-2 flex items-center space-x-1">
            <span className={`text-[10px] ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          </div>
        )}

        {showTooltip && tooltip && (
          <div className="absolute bottom-full left-0 mb-2 px-2 py-1 text-[10px] bg-gray-900 text-white rounded whitespace-nowrap z-50 shadow-lg">
            {tooltip}
          </div>
        )}
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE FILTROS AVANZADOS MEJORADO CON RANGOS MANUALES
// ============================================
const AdvancedFilters = ({ isOpen, onClose, onFilterChange, filters, setFilters, clientes }) => {
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState(filters || {
    estado: '',
    rangoMonto: '',
    montoMin: '',
    montoMax: '',
    frecuencia: '',
    prioridad: '',
    clienteID: '',
    fechaInicio: '',
    fechaFin: '',
    mesesVigencia: '',
    tipoInteres: '',
    diasMoraMin: '',
    diasMoraMax: '',
    tieneComision: ''
  });

  if (!isOpen) return null;

  const aplicarFiltros = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const limpiarFiltros = () => {
    const vacio = { 
      estado: '', 
      rangoMonto: '',
      montoMin: '',
      montoMax: '',
      frecuencia: '', 
      prioridad: '',
      clienteID: '',
      fechaInicio: '',
      fechaFin: '',
      mesesVigencia: '',
      tipoInteres: '',
      diasMoraMin: '',
      diasMoraMax: '',
      tieneComision: ''
    };
    setLocalFilters(vacio);
    onFilterChange(vacio);
    onClose();
  };

  const rangosMontos = [
    { value: '', label: 'Todos' },
    { value: '0-5000', label: '0 - 5,000' },
    { value: '5000-10000', label: '5,000 - 10,000' },
    { value: '10000-15000', label: '10,000 - 15,000' },
    { value: '15000-20000', label: '15,000 - 20,000' },
    { value: '20000-30000', label: '20,000 - 30,000' },
    { value: '30000-50000', label: '30,000 - 50,000' },
    { value: '50000-100000', label: '50,000 - 100,000' },
    { value: '100000+', label: '+100,000' }
  ];

  const mesesVigencia = [
    { value: '', label: 'Todos' },
    { value: '0-3', label: '0 - 3 meses' },
    { value: '3-6', label: '3 - 6 meses' },
    { value: '6-12', label: '6 - 12 meses' },
    { value: '12-24', label: '12 - 24 meses' },
    { value: '24+', label: '24+ meses' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <div className={`rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-inherit z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                <FunnelIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Filtros Avanzados
              </h3>
              {Object.values(localFilters).some(v => v !== '') && (
                <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded-full">
                  Filtros activos
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro por Cliente */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <UserIcon className="h-4 w-4 inline mr-1" />
                Cliente
              </label>
              <select
                value={localFilters.clienteID}
                onChange={(e) => setLocalFilters({ ...localFilters, clienteID: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              >
                <option value="">Todos los clientes</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} - {cliente.cedula || 'Sin cédula'}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
                Estado
              </label>
              <select
                value={localFilters.estado}
                onChange={(e) => setLocalFilters({ ...localFilters, estado: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="completado">Completado</option>
                <option value="moroso">Moroso</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            {/* Filtro por Rango de Monto - Predefinido */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Rango de Monto
              </label>
              <select
                value={localFilters.rangoMonto}
                onChange={(e) => setLocalFilters({ ...localFilters, rangoMonto: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              >
                {rangosMontos.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Monto Mínimo - Manual */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <BanknotesIcon className="h-4 w-4 inline mr-1" />
                Monto Mínimo (RD$)
              </label>
              <input
                type="number"
                value={localFilters.montoMin}
                onChange={(e) => setLocalFilters({ ...localFilters, montoMin: e.target.value })}
                placeholder="Ej: 10000"
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              />
            </div>

            {/* Filtro por Monto Máximo - Manual */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <BanknotesIcon className="h-4 w-4 inline mr-1" />
                Monto Máximo (RD$)
              </label>
              <input
                type="number"
                value={localFilters.montoMax}
                onChange={(e) => setLocalFilters({ ...localFilters, montoMax: e.target.value })}
                placeholder="Ej: 50000"
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              />
            </div>

            {/* Filtro por Frecuencia */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Frecuencia
              </label>
              <select
                value={localFilters.frecuencia}
                onChange={(e) => setLocalFilters({ ...localFilters, frecuencia: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              >
                <option value="">Todas</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            {/* Filtro por Prioridad */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                Prioridad
              </label>
              <select
                value={localFilters.prioridad}
                onChange={(e) => setLocalFilters({ ...localFilters, prioridad: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              >
                <option value="">Todas</option>
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Media</option>
                <option value="baja">🟢 Baja</option>
              </select>
            </div>

            {/* Filtro por Meses de Vigencia */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Meses Vigencia
              </label>
              <select
                value={localFilters.mesesVigencia}
                onChange={(e) => setLocalFilters({ ...localFilters, mesesVigencia: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              >
                {mesesVigencia.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Fecha Inicio */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={localFilters.fechaInicio}
                onChange={(e) => setLocalFilters({ ...localFilters, fechaInicio: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              />
            </div>

            {/* Filtro por Fecha Fin */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={localFilters.fechaFin}
                onChange={(e) => setLocalFilters({ ...localFilters, fechaFin: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              />
            </div>

            {/* Filtro por Días de Mora - Mínimo */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                Días Mora Mínimo
              </label>
              <input
                type="number"
                value={localFilters.diasMoraMin}
                onChange={(e) => setLocalFilters({ ...localFilters, diasMoraMin: e.target.value })}
                placeholder="Ej: 5"
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              />
            </div>

            {/* Filtro por Días de Mora - Máximo */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                Días Mora Máximo
              </label>
              <input
                type="number"
                value={localFilters.diasMoraMax}
                onChange={(e) => setLocalFilters({ ...localFilters, diasMoraMax: e.target.value })}
                placeholder="Ej: 30"
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              />
            </div>

            {/* Filtro por Tipo de Interés */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <CalculatorIcon className="h-4 w-4 inline mr-1" />
                Tipo Interés
              </label>
              <select
                value={localFilters.tipoInteres}
                onChange={(e) => setLocalFilters({ ...localFilters, tipoInteres: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              >
                <option value="">Todos</option>
                <option value="fijo">Fijo</option>
                <option value="variable">Variable</option>
                <option value="reducido">Reducido</option>
              </select>
            </div>

            {/* Filtro por Tiene Comisión */}
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <GiftIcon className="h-4 w-4 inline mr-1" />
                Comisión
              </label>
              <select
                value={localFilters.tieneComision}
                onChange={(e) => setLocalFilters({ ...localFilters, tieneComision: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-800 focus:border-red-500'
                }`}
              >
                <option value="">Todos</option>
                <option value="si">Con comisión</option>
                <option value="no">Sin comisión</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <button
              onClick={limpiarFiltros}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <XMarkIcon className="h-4 w-4 inline mr-1" />
              Limpiar todo
            </button>
            <button
              onClick={aplicarFiltros}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <CheckCircleIcon className="h-4 w-4 inline mr-1" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SECCIÓN DESPLEGABLE GLOBAL DE STATS CARDS
// ============================================
const StatsCardsContainer = ({ children, title, icon: Icon, isOpen, onToggle }) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div 
        className={`p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors ${
          !isOpen ? 'border-b-0' : 'border-b border-red-600/20'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-lg">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <h3 className={`text-sm sm:text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {isOpen ? 'Ocultar' : 'Mostrar'}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <ChevronUpIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            ) : (
              <ChevronDownIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 sm:p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatsCards, setShowStatsCards] = useState(true);
  const [filters, setFilters] = useState({ 
    estado: '', 
    rangoMonto: '',
    montoMin: '',
    montoMax: '',
    frecuencia: '', 
    prioridad: '',
    clienteID: '',
    fechaInicio: '',
    fechaFin: '',
    mesesVigencia: '',
    tipoInteres: '',
    diasMoraMin: '',
    diasMoraMax: '',
    tieneComision: ''
  });
  const [viewMode, setViewMode] = useState('list');
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [editingPrestamo, setEditingPrestamo] = useState(null);
  const [error, setError] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [stats, setStats] = useState({
    totalPrestamos: 0,
    totalCapitalPrestado: 0,
    totalCapitalRecuperado: 0,
    totalInteresGenerado: 0,
    totalMoraGenerada: 0,
    prestamosActivos: 0,
    prestamosCompletados: 0,
    prestamosMorosos: 0,
    interesMensualTotal: 0,
    interesQuincenalTotal: 0,
    interesDiarioTotal: 0,
    prestamosConMora: 0,
    capitalEnMora: 0,
    clientesActivos: 0,
    tasaMorosidad: 0,
    recuperacionTotal: 0,
    roiGeneral: 0,
    comisionMensualTotal: 0,
    totalMensualBruto: 0,
    prestamosConComision: 0,
    totalInteresPagado: 0,
    totalCapitalPagado: 0,
    totalPagosRegistrados: 0
  });

  const { theme } = useTheme();
  const configMora = getConfiguracionMora();

  // ============================================
  // 🔥 CARGA INICIAL - TODOS LOS DATOS JUNTOS
  // ============================================
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Cargar préstamos, clientes y pagos en paralelo
        const [prestamosRes, clientesRes, pagosRes] = await Promise.all([
          api.get('/prestamos'),
          api.get('/clientes'),
          api.get('/pagos')
        ]);
        
        // Procesar clientes
        const clientesNormalizados = (clientesRes.data || []).map(cliente =>
          normalizeFirebaseData(cliente)
        );
        setClientes(clientesNormalizados);
        
        // Procesar préstamos
        const prestamosNormalizados = (prestamosRes.data || []).map(prestamo => 
          normalizeFirebaseData(prestamo)
        );
        setPrestamos(prestamosNormalizados);
        
        // Procesar pagos
        const pagosNormalizados = (pagosRes.data || []).map(pago =>
          normalizeFirebaseData(pago)
        );
        setPagos(pagosNormalizados);
        
        // Calcular estadísticas combinadas
        calcularEstadisticasCompletas(prestamosNormalizados, pagosNormalizados);
        
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        setError(error.message || 'Error al cargar los datos');
        setPrestamos([]);
        setClientes([]);
        setPagos([]);
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatosIniciales();
  }, []);

  // ============================================
  // 🔥 FUNCIÓN PARA CALCULAR ESTADÍSTICAS COMPLETAS
  // ============================================
  const calcularEstadisticasCompletas = (prestamosData, pagosData) => {
    // Si no hay datos, usar stats en 0
    if (!prestamosData || prestamosData.length === 0) {
      setStats({
        totalPrestamos: 0,
        totalCapitalPrestado: 0,
        totalCapitalRecuperado: 0,
        totalInteresGenerado: 0,
        totalMoraGenerada: 0,
        prestamosActivos: 0,
        prestamosCompletados: 0,
        prestamosMorosos: 0,
        interesMensualTotal: 0,
        interesQuincenalTotal: 0,
        interesDiarioTotal: 0,
        prestamosConMora: 0,
        capitalEnMora: 0,
        clientesActivos: 0,
        tasaMorosidad: 0,
        recuperacionTotal: 0,
        roiGeneral: 0,
        comisionMensualTotal: 0,
        totalMensualBruto: 0,
        prestamosConComision: 0,
        totalInteresPagado: 0,
        totalCapitalPagado: 0,
        totalPagosRegistrados: 0
      });
      return;
    }

    const totalPrestamos = prestamosData.length;
    const totalCapitalPrestado = prestamosData.reduce((sum, p) => sum + (p.montoPrestado || 0), 0);
    const totalCapitalRecuperado = prestamosData.reduce((sum, p) => sum + ((p.montoPrestado || 0) - (p.capitalRestante || 0)), 0);
    
    let totalInteresGenerado = 0;
    let totalMoraGenerada = 0;
    let interesMensualTotal = 0;
    let interesQuincenalTotal = 0;
    let interesDiarioTotal = 0;
    let prestamosConMora = 0;
    let capitalEnMora = 0;
    let clientesUnicos = new Set();
    let comisionMensualTotal = 0;
    let prestamosConComision = 0;
    let totalInteresPagado = 0;
    let totalCapitalPagado = 0;
    
    // Calcular estadísticas de préstamos
    prestamosData.forEach(p => {
      const interesTotal = (p.montoPrestado || 0) - (p.capitalRestante || 0);
      totalInteresGenerado += interesTotal;
      
      const interesMensual = calcularInteresMensual(p);
      interesMensualTotal += interesMensual;
      interesQuincenalTotal += calcularInteresQuincenal(p);
      interesDiarioTotal += calcularInteresDiario(p);
      
      if (p.generarComision && p.garanteID) {
        prestamosConComision++;
        const porcentajeComision = p.porcentajeComision || 50;
        const comisionMensual = (interesMensual * porcentajeComision) / 100;
        comisionMensualTotal += comisionMensual;
      }
      
      if (p.clienteID) clientesUnicos.add(p.clienteID);
      
      const diasAtraso = calcularDiasAtraso(p);
      if (diasAtraso > 0) {
        prestamosConMora++;
        capitalEnMora += p.capitalRestante || 0;
      }
      
      if (p.configuracionMora?.enabled && p.fechaProximoPago) {
        const hoy = new Date();
        const fechaProximo = firebaseTimestampToDate(p.fechaProximoPago);
        const diasAtrasoCalc = Math.max(0, Math.ceil((hoy - fechaProximo) / (1000 * 60 * 60 * 24)));
        if (diasAtrasoCalc > p.configuracionMora.diasGracia) {
          const interesAdeudado = (p.capitalRestante * p.interesPercent) / 100;
          const diasMora = diasAtrasoCalc - p.configuracionMora.diasGracia;
          const moraDiaria = (interesAdeudado * p.configuracionMora.porcentaje) / 100 / 30;
          totalMoraGenerada += moraDiaria * diasMora;
        }
      }
    });
    
    // Calcular estadísticas de pagos
    if (pagosData && pagosData.length > 0) {
      pagosData.forEach(pago => {
        totalInteresPagado += parseFloat(pago.montoInteres) || 0;
        totalCapitalPagado += parseFloat(pago.montoCapital) || 0;
      });
    }
    
    const totalMensualBruto = interesMensualTotal - comisionMensualTotal;
    
    const prestamosActivos = prestamosData.filter(p => p.estado === 'activo').length;
    const prestamosCompletados = prestamosData.filter(p => p.estado === 'completado').length;
    const prestamosMorosos = prestamosData.filter(p => p.estado === 'moroso' || calcularDiasAtraso(p) > 30).length;
    
    const tasaMorosidad = totalPrestamos > 0 ? (prestamosMorosos / totalPrestamos) * 100 : 0;
    const recuperacionTotal = totalCapitalPrestado > 0 ? (totalCapitalRecuperado / totalCapitalPrestado) * 100 : 0;
    const roiGeneral = totalCapitalPrestado > 0 ? (totalInteresGenerado / totalCapitalPrestado) * 100 : 0;

    setStats({
      totalPrestamos,
      totalCapitalPrestado,
      totalCapitalRecuperado,
      totalInteresGenerado,
      totalMoraGenerada,
      prestamosActivos,
      prestamosCompletados,
      prestamosMorosos,
      interesMensualTotal,
      interesQuincenalTotal,
      interesDiarioTotal,
      prestamosConMora,
      capitalEnMora,
      clientesActivos: clientesUnicos.size,
      tasaMorosidad,
      recuperacionTotal,
      roiGeneral,
      comisionMensualTotal,
      totalMensualBruto,
      prestamosConComision,
      totalInteresPagado,
      totalCapitalPagado,
      totalPagosRegistrados: pagosData ? pagosData.length : 0
    });
  };

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  
  const calcularInteresDiario = (prestamo) => {
    if (!prestamo.capitalRestante || !prestamo.interesPercent) return 0;
    return (prestamo.capitalRestante * prestamo.interesPercent) / 100 / 30;
  };

  const calcularInteresQuincenal = (prestamo) => {
    return calcularInteresDiario(prestamo) * 15;
  };

  const calcularInteresMensual = (prestamo) => {
    return calcularInteresDiario(prestamo) * 30;
  };

  const calcularInteresTotalGenerado = (prestamo) => {
    return (prestamo.montoPrestado || 0) - (prestamo.capitalRestante || 0);
  };

  const calcularPorcentajeRecuperacion = (prestamo) => {
    if (!prestamo.montoPrestado) return 0;
    const capitalRecuperado = prestamo.montoPrestado - (prestamo.capitalRestante || 0);
    return (capitalRecuperado / prestamo.montoPrestado) * 100;
  };

  const calcularROI = (prestamo) => {
    const interesGenerado = calcularInteresTotalGenerado(prestamo);
    const capitalInvertido = prestamo.montoPrestado;
    if (!capitalInvertido) return 0;
    return (interesGenerado / capitalInvertido) * 100;
  };

  const calcularDiasAtraso = (prestamo) => {
    if (!prestamo.fechaProximoPago) return 0;
    const hoy = new Date();
    const fechaProximo = firebaseTimestampToDate(prestamo.fechaProximoPago);
    if (!fechaProximo) return 0;
    return Math.max(0, Math.ceil((hoy - fechaProximo) / (1000 * 60 * 60 * 24)));
  };

  const getFrecuenciaTexto = (prestamo) => {
    const config = {
      diaPago: prestamo.diaPagoPersonalizado,
      diaSemana: prestamo.diaSemana,
      fechasPersonalizadas: prestamo.fechasPersonalizadas
    };
    return getDescripcionFrecuencia(prestamo.frecuencia, config);
  };

  const getCedulaCliente = (prestamo) => {
    const cliente = clientes.find(c => c.id === prestamo.clienteID);
    return cliente?.cedula || 'N/A';
  };

  const getContactoCliente = (prestamo) => {
    const cliente = clientes.find(c => c.id === prestamo.clienteID);
    return {
      celular: cliente?.celular || 'N/A',
      trabajo: cliente?.trabajo || 'N/A'
    };
  };

  const getPrioridadPrestamo = (prestamo) => {
    const diasAtraso = calcularDiasAtraso(prestamo);
    const porcentajeRecuperacion = calcularPorcentajeRecuperacion(prestamo);
    
    if (diasAtraso > 15) return 'alta';
    if (diasAtraso > 5) return 'media';
    if (porcentajeRecuperacion > 80) return 'alta';
    if (porcentajeRecuperacion > 50) return 'media';
    return 'baja';
  };

  const getNombreCliente = (prestamo) => {
    const cliente = clientes.find(c => c.id === prestamo.clienteID);
    return cliente?.nombre || 'N/A';
  };

  const getTelefonoCliente = (prestamo) => {
    const cliente = clientes.find(c => c.id === prestamo.clienteID);
    return cliente?.celular || cliente?.telefono || 'N/A';
  };

  const getMesesVigencia = (prestamo) => {
    if (!prestamo.fechaPrestamo) return 0;
    const fechaInicio = firebaseTimestampToDate(prestamo.fechaPrestamo);
    if (!fechaInicio) return 0;
    const hoy = new Date();
    const diffTime = Math.abs(hoy - fechaInicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  };

  const fetchPrestamos = async () => {
    try {
      const response = await api.get('/prestamos');
      if (response.success) {
        const prestamosNormalizados = (response.data || []).map(prestamo => 
          normalizeFirebaseData(prestamo)
        );
        setPrestamos(prestamosNormalizados);
        // Recalcular con los pagos existentes
        calcularEstadisticasCompletas(prestamosNormalizados, pagos);
      }
    } catch (error) {
      console.error('Error fetching prestamos:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await api.get('/clientes');
      const clientesNormalizados = (response.data || []).map(cliente =>
        normalizeFirebaseData(cliente)
      );
      setClientes(clientesNormalizados);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      setClientes([]);
    }
  };

  const fetchPagos = async () => {
    try {
      const response = await api.get('/pagos');
      if (response.success) {
        const pagosNormalizados = (response.data || []).map(pago =>
          normalizeFirebaseData(pago)
        );
        setPagos(pagosNormalizados);
        // Recalcular con los préstamos existentes
        calcularEstadisticasCompletas(prestamos, pagosNormalizados);
      }
    } catch (error) {
      console.error('Error fetching pagos:', error);
      setPagos([]);
    }
  };

  const aplicarFiltros = (nuevosFiltros) => {
    setFilters(nuevosFiltros);
  };

  // ============================================
  // FORMATO DE MONTO PARA STATS CARDS (ABREVIADO)
  // ============================================
  const formatMontoAbreviado = (valor) => {
    if (!valor && valor !== 0) return 'RD$ 0';
    if (valor >= 1000000) return `RD$ ${(valor / 1000000).toFixed(1)}M`;
    if (valor >= 1000) return `RD$ ${(valor / 1000).toFixed(1)}K`;
    return `RD$ ${valor.toLocaleString()}`;
  };

  // ============================================
  // FORMATO DE MONTO PARA RESUMEN EJECUTIVO (EXACTO)
  // ============================================
  const formatMontoExacto = (valor) => {
    if (!valor && valor !== 0) return 'RD$ 0';
    return `RD$ ${valor.toLocaleString()}`;
  };

  // ============================================
  // FILTRO CORREGIDO
  // ============================================
  const filteredPrestamos = prestamos.filter(prestamo => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      prestamo.clienteNombre?.toLowerCase().includes(searchLower) ||
      prestamo.id?.toLowerCase().includes(searchLower) ||
      getCedulaCliente(prestamo)?.toLowerCase().includes(searchLower) ||
      prestamo.montoPrestado?.toString().includes(searchTerm) ||
      getTelefonoCliente(prestamo)?.toLowerCase().includes(searchLower);
    
    if (!matchSearch) return false;
    
    if (filters.clienteID && prestamo.clienteID !== filters.clienteID) return false;
    
    if (filters.estado) {
      if (filters.estado === 'moroso') {
        const diasAtraso = calcularDiasAtraso(prestamo);
        if (diasAtraso <= 0 && prestamo.estado !== 'moroso') return false;
      } else if (prestamo.estado !== filters.estado) {
        return false;
      }
    }
    
    if (filters.frecuencia && prestamo.frecuencia !== filters.frecuencia) return false;
    
    if (filters.rangoMonto) {
      const monto = prestamo.montoPrestado || 0;
      const [min, max] = filters.rangoMonto.split('-').map(Number);
      if (max) {
        if (monto < min || monto > max) return false;
      } else {
        if (monto < min) return false;
      }
    }
    
    if (filters.montoMin) {
      const montoMin = parseFloat(filters.montoMin);
      if ((prestamo.montoPrestado || 0) < montoMin) return false;
    }
    
    if (filters.montoMax) {
      const montoMax = parseFloat(filters.montoMax);
      if ((prestamo.montoPrestado || 0) > montoMax) return false;
    }
    
    if (filters.prioridad) {
      const prioridad = getPrioridadPrestamo(prestamo);
      if (prioridad !== filters.prioridad) return false;
    }
    
    if (filters.mesesVigencia) {
      const meses = getMesesVigencia(prestamo);
      const [min, max] = filters.mesesVigencia.split('-').map(Number);
      if (max) {
        if (meses < min || meses > max) return false;
      } else {
        if (meses < min) return false;
      }
    }
    
    if (filters.fechaInicio) {
      const fechaInicio = firebaseTimestampToDate(prestamo.fechaPrestamo);
      const fechaFiltro = new Date(filters.fechaInicio);
      if (fechaInicio && fechaInicio < fechaFiltro) return false;
    }
    
    if (filters.fechaFin) {
      const fechaInicio = firebaseTimestampToDate(prestamo.fechaPrestamo);
      const fechaFiltro = new Date(filters.fechaFin);
      fechaFiltro.setHours(23, 59, 59, 999);
      if (fechaInicio && fechaInicio > fechaFiltro) return false;
    }
    
    if (filters.diasMoraMin) {
      const diasMora = calcularDiasAtraso(prestamo);
      if (diasMora < parseFloat(filters.diasMoraMin)) return false;
    }
    
    if (filters.diasMoraMax) {
      const diasMora = calcularDiasAtraso(prestamo);
      if (diasMora > parseFloat(filters.diasMoraMax)) return false;
    }
    
    if (filters.tipoInteres && prestamo.tipoInteres !== filters.tipoInteres) return false;
    
    if (filters.tieneComision === 'si' && !prestamo.generarComision) return false;
    if (filters.tieneComision === 'no' && prestamo.generarComision) return false;
    
    return true;
  });

  const handleCreatePrestamo = () => {
    setEditingPrestamo(null);
    setViewMode('form');
  };

  const handleEditPrestamo = (prestamo) => {
    setEditingPrestamo(prestamo);
    setViewMode('form');
  };

  const handleViewPrestamo = (prestamo) => {
    setSelectedPrestamo(prestamo);
    setViewMode('details');
  };

  const handleRegistrarPago = (prestamo, callback) => {
    setSelectedPrestamo(prestamo);
    setViewMode('pago');
    if (callback) {
      window.pagoCallback = callback;
    }
  };

  const handlePagoRegistrado = async (prestamoActualizado) => {
    console.log('🔄 Actualizando lista de préstamos después de pago...');
    
    if (prestamoActualizado) {
      setPrestamos(prevPrestamos => 
        prevPrestamos.map(p => p.id === prestamoActualizado.id ? prestamoActualizado : p)
      );
      await fetchPagos();
      console.log('✅ Préstamo actualizado:', {
        id: prestamoActualizado.id,
        capitalRestante: prestamoActualizado.capitalRestante,
        fechaProximoPago: prestamoActualizado.fechaProximoPago
      });
    } else {
      await fetchPrestamos();
      await fetchPagos();
    }
    
    if (window.pagoCallback) {
      window.pagoCallback();
      window.pagoCallback = null;
    }
    
    handleBackToList();
  };

  const handleEnviarWhatsApp = (prestamo) => {
    const cliente = clientes.find(c => c.id === prestamo.clienteID);
    if (!cliente || !cliente.celular) {
      alert('No se encontró el número de teléfono del cliente');
      return;
    }

    const interesQuincenal = calcularInteresQuincenal(prestamo);
    const porcentajeRecuperacion = calcularPorcentajeRecuperacion(prestamo);
    const diasAtraso = calcularDiasAtraso(prestamo);
    
    const fechaProximoFormateada = prestamo.fechaProximoPago ? formatFecha(prestamo.fechaProximoPago) : 'Por definir';
    
    let mensaje = `Hola ${prestamo.clienteNombre}, le recordamos que tiene un pago pendiente de RD$ ${interesQuincenal.toLocaleString()} correspondiente a los intereses de su préstamo. 

📊 Resumen de su préstamo:
• Capital restante: RD$ ${prestamo.capitalRestante?.toLocaleString()}
• Progreso: ${porcentajeRecuperacion.toFixed(1)}% pagado
• Próximo pago: ${fechaProximoFormateada}`;

    if (diasAtraso > 0) {
      mensaje += `\n⚠️ Tiene ${diasAtraso} días de atraso.`;
      if (prestamo.configuracionMora?.enabled) {
        const interesDiario = calcularInteresDiario(prestamo);
        const mora = interesDiario * diasAtraso * (prestamo.configuracionMora.porcentaje / 100);
        mensaje += ` Mora: RD$ ${mora.toLocaleString()}`;
      }
    }
    
    mensaje += `\n\n¡Gracias por su puntualidad! 🎯
- EYS Inversiones`;
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=1${cliente.celular.replace(/\D/g, '')}&text=${mensajeCodificado}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPrestamo(null);
    setEditingPrestamo(null);
  };

  const handleRefresh = async () => {
    setError('');
    await fetchPrestamos();
    await fetchClientes();
    await fetchPagos();
  };

  const handleSavePrestamo = async (prestamoData) => {
    try {
      setError('');
      let response;

      if (editingPrestamo) {
        response = await api.put(`/prestamos/${editingPrestamo.id}`, prestamoData);
      } else {
        response = await api.post('/prestamos', prestamoData);
      }

      if (response.success) {
        await fetchPrestamos();
        await fetchPagos();
        window.dispatchEvent(new CustomEvent('datos-actualizados'));
        handleBackToList();
      } else {
        throw new Error(response.error || `Error al ${editingPrestamo ? 'actualizar' : 'crear'} el préstamo`);
      }
    } catch (error) {
      console.error('Error saving loan:', error);
      setError(error.message || 'Error interno del servidor');
    }
  };

  const handleDeletePrestamo = async (prestamoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este préstamo? Esta acción no se puede deshacer.')) {
      try {
        setError('');
        const response = await api.delete(`/prestamos/${prestamoId}`);
        
        if (response.success) {
          fetchPrestamos();
          fetchPagos();
          window.dispatchEvent(new CustomEvent('datos-actualizados'));
        } else {
          throw new Error(response.error || 'Error al eliminar el préstamo');
        }
      } catch (error) {
        console.error('Error deleting loan:', error);
        setError(error.message || 'Error interno del servidor');
      }
    }
  };

  const getEstadoBadge = (prestamo) => {
    const estados = {
      activo: { 
        color: theme === 'dark' 
          ? 'bg-green-900/30 text-green-400 border-green-700' 
          : 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon,
        text: 'Activo' 
      },
      completado: { 
        color: theme === 'dark' 
          ? 'bg-blue-900/30 text-blue-400 border-blue-700' 
          : 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircleIcon, 
        text: 'Completado' 
      },
      moroso: { 
        color: theme === 'dark' 
          ? 'bg-red-900/30 text-red-400 border-red-700' 
          : 'bg-red-100 text-red-800 border-red-200',
        icon: ExclamationTriangleIcon, 
        text: 'Moroso' 
      },
      pendiente: { 
        color: theme === 'dark' 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon, 
        text: 'Pendiente' 
      }
    };

    const estado = estados[prestamo.estado] || estados.activo;
    const Icon = estado.icon;

    return (
      <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium border-2 ${estado.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {estado.text}
      </span>
    );
  };

  if (viewMode === 'form') {
    return (
      <PrestamoForm
        prestamo={editingPrestamo}
        clientes={clientes}
        onSave={handleSavePrestamo}
        onCancel={handleBackToList}
        error={error}
      />
    );
  }

  if (viewMode === 'details' && selectedPrestamo) {
    return (
      <PrestamoDetails
        prestamo={selectedPrestamo}
        clientes={clientes}
        onBack={handleBackToList}
        onEdit={() => handleEditPrestamo(selectedPrestamo)}
        onRegistrarPago={(prestamo) => handleRegistrarPago(prestamo, null)}
        onEnviarWhatsApp={handleEnviarWhatsApp}
        onPagoRegistrado={handlePagoRegistrado}
      />
    );
  }

  if (viewMode === 'pago' && selectedPrestamo) {
    return (
      <RegistrarPago
        prestamo={selectedPrestamo}
        onClose={() => handlePagoRegistrado(null)}
        onPagoRegistrado={handlePagoRegistrado}
      />
    );
  }

  if (loading) {
    return <PrestamosSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl blur-3xl"></div>
        <div className={`relative rounded-2xl shadow-2xl p-4 sm:p-6 border border-red-600/20 ${
          theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-xl' : 'bg-white'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Préstamos
                </h1>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Gestion de los préstamos, pagos y control detallado.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 sm:p-3 rounded-lg transition-all ${
                  showFilters
                    ? 'bg-red-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Filtros avanzados"
              >
                <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 sm:p-3 rounded-lg transition-all ${
                  showSearch
                    ? 'bg-red-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Buscar préstamos"
              >
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className={`p-2 sm:p-3 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Actualizar datos"
              >
                <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreatePrestamo}
                className="p-2 sm:p-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                title="Nuevo préstamo"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mensajes de error */}
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

      {/* Filtros avanzados */}
      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            onFilterChange={aplicarFiltros}
            filters={filters}
            setFilters={setFilters}
            clientes={clientes}
          />
        )}
      </AnimatePresence>

      {/* Barra de búsqueda */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={`rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-3 sm:p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por cliente, cédula, ID, monto o teléfono..."
                    className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-3 rounded-lg border-2 outline-none transition-all text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 placeholder-gray-400'
                        : 'bg-white border-gray-200 text-gray-800 focus:border-red-500 placeholder-gray-400'
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <XMarkIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} hover:text-red-600 transition-colors`} />
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="mt-2 text-xs text-gray-500">
                    {filteredPrestamos.length} resultados encontrados
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* 🔥 STATS CARDS CON OPCION DE OCULTAR/MOSTRAR GLOBAL */}
      {/* ============================================ */}
      <StatsCardsContainer 
        title="Métricas del Dashboard" 
        icon={ChartBarIcon}
        isOpen={showStatsCards}
        onToggle={() => setShowStatsCards(!showStatsCards)}
      >
        {/* Fila 1 - Métricas Principales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <StatsCard
            icon={BanknotesIcon}
            label="Capital Invertido"
            value={formatMontoAbreviado(stats.totalCapitalPrestado)}
            subValue={`${stats.totalPrestamos} préstamos`}
            gradient="green"
            tooltip="Total de capital prestado a todos los clientes"
          />

          <StatsCard
            icon={CurrencyDollarIcon}
            label="Recuperado"
            value={formatMontoAbreviado(stats.totalCapitalRecuperado)}
            subValue={`${stats.recuperacionTotal.toFixed(1)}% recuperado`}
            gradient="emerald"
            tooltip="Capital recuperado de los préstamos"
          />

          <StatsCard
            icon={PresentationChartLineIcon}
            label="Interés Mensual"
            value={formatMontoAbreviado(stats.interesMensualTotal)}
            subValue={`≈ ${formatMontoAbreviado(stats.interesDiarioTotal * 30)}/mes`}
            gradient="purple"
            tooltip="Total de intereses que entran fijos cada mes"
          />

          <StatsCard
            icon={DocumentChartBarIcon}
            label="Cartera Activa"
            value={`${stats.prestamosActivos}`}
            subValue={`${stats.prestamosCompletados} completados`}
            gradient="teal"
            tooltip="Préstamos activos vs completados"
          />

          <StatsCard
            icon={ExclamationTriangleIcon}
            label="Morosidad"
            value={`${stats.prestamosConMora}`}
            subValue={`${stats.tasaMorosidad.toFixed(1)}% de cartera`}
            gradient="red"
            tooltip="Préstamos con días de atraso"
          />
        </div>

        {/* Fila 2 - Rendimiento y Eficiencia */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <StatsCard
            icon={WalletIcon}
            label="Capital en Mora"
            value={formatMontoAbreviado(stats.capitalEnMora)}
            subValue={`${stats.prestamosConMora} clientes en mora`}
            gradient="orange"
            tooltip="Capital total que está en mora"
          />

          <StatsCard
            icon={TrophyIcon}
            label="ROI General"
            value={`${stats.roiGeneral.toFixed(1)}%`}
            subValue={`${formatMontoAbreviado(stats.totalInteresGenerado)} ganados`}
            gradient="indigo"
            tooltip="Retorno sobre la inversión total"
          />

          <StatsCard
            icon={UserIcon}
            label="Clientes Activos"
            value={stats.clientesActivos}
            subValue={`${stats.totalPrestamos} préstamos activos`}
            gradient="pink"
            tooltip="Clientes con préstamos activos"
          />

          <StatsCard
            icon={PercentBadgeIcon}
            label="Tasa Recuperación"
            value={`${stats.recuperacionTotal.toFixed(1)}%`}
            subValue={formatMontoAbreviado(stats.totalCapitalRecuperado)}
            gradient="emerald"
            tooltip="Porcentaje de capital recuperado"
          />

          <StatsCard
            icon={CalculatorIcon}
            label="Interés Diario"
            value={formatMontoAbreviado(stats.interesDiarioTotal)}
            subValue={`≈ ${formatMontoAbreviado(stats.interesDiarioTotal * 7)}/semana`}
            gradient="yellow"
            tooltip="Total de intereses que entran diariamente"
          />

        </div>

        {/* Fila 3 - Comisiones y Pagos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatsCard
            icon={GiftIcon}
            label="Comisión Mensual"
            value={formatMontoAbreviado(stats.comisionMensualTotal)}
            subValue={`${stats.prestamosConComision} préstamos con comisión`}
            gradient="cyan"
            badge={{ text: 'COMISION', color: 'bg-cyan-600' }}
            tooltip="Total de comisiones que se pagan a garantes mensualmente"
          />

          <StatsCard
            icon={ChartPieIcon}
            label="Total Mensual Neto"
            value={formatMontoAbreviado(stats.totalMensualBruto)}
            subValue={`Interés: ${formatMontoAbreviado(stats.interesMensualTotal)} - Comisión: ${formatMontoAbreviado(stats.comisionMensualTotal)}`}
            gradient="rose"
            badge={{ text: 'NETO', color: 'bg-rose-600' }}
            tooltip="Interés Mensual Total - Comisión Mensual Total (Ingreso real para EYS)"
          />

          <StatsCard
            icon={CreditCardIcon}
            label="Total Interés Pagado"
            value={formatMontoAbreviado(stats.totalInteresPagado)}
            subValue={`${stats.totalPagosRegistrados} pagos registrados`}
            gradient="amber"
            badge={{ text: 'PAGADO', color: 'bg-amber-600' }}
            tooltip="Suma de todos los intereses que han pagado los clientes"
          />

        </div>
      </StatsCardsContainer>

      {/* Acciones rápidas */}
      <div className={`rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs sm:text-sm font-medium mr-1 sm:mr-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Acciones rápidas:
            </span>
            <button 
              onClick={() => {
                setFilters({ ...filters, estado: '', rangoMonto: '', prioridad: '', diasMoraMin: '', diasMoraMax: '' });
                setSearchTerm('');
              }}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos ({stats.totalPrestamos})
            </button>
            <button 
              onClick={() => setFilters({ ...filters, estado: 'activo' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              ✅ Activos ({stats.prestamosActivos})
            </button>
            <button 
              onClick={() => setFilters({ ...filters, estado: 'moroso' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              ⚠️ En Mora ({stats.prestamosConMora})
            </button>
            <button 
              onClick={() => setFilters({ ...filters, rangoMonto: '50000-100000' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              📊 50K-100K
            </button>
            <button 
              onClick={() => setFilters({ ...filters, rangoMonto: '5000-50000' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-cyan-900/30 text-cyan-400 hover:bg-cyan-800/50'
                  : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
              }`}
            >
              📊 5K-50K
            </button>
            <button 
              onClick={() => setFilters({ ...filters, prioridad: 'alta' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-800/50'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              🔥 Alta Prioridad
            </button>
            <button 
              onClick={() => setFilters({ ...filters, diasMoraMin: '15' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-orange-900/30 text-orange-400 hover:bg-orange-800/50'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              ⏰ +15 días mora
            </button>
            <button 
              onClick={() => setFilters({ ...filters, diasMoraMin: '30' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-rose-900/30 text-rose-400 hover:bg-rose-800/50'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
            >
              🚨 +30 días mora
            </button>
            <button 
              onClick={() => setFilters({ ...filters, tieneComision: 'si' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-cyan-900/30 text-cyan-400 hover:bg-cyan-800/50'
                  : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
              }`}
            >
              🎁 Con Comisión ({stats.prestamosConComision})
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de préstamos */}
      <div className={`rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <PrestamosTable
          prestamos={filteredPrestamos}
          onView={handleViewPrestamo}
          onEdit={handleEditPrestamo}
          onRegistrarPago={handleRegistrarPago}
          onWhatsApp={handleEnviarWhatsApp}
          calcularPorcentajeRecuperacion={calcularPorcentajeRecuperacion}
          calcularDiasAtraso={calcularDiasAtraso}
          getFrecuenciaTexto={getFrecuenciaTexto}
          getCedulaCliente={getCedulaCliente}
          getContactoCliente={getContactoCliente}
          configMora={configMora}
        />
      </div>

      {/* ============================================ */}
      {/* 🔥 RESUMEN EJECUTIVO CON NÚMEROS EXACTOS */}
      {/* ============================================ */}
      {filteredPrestamos.length > 0 && (
        <div className={`rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg">
                <RocketLaunchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Resumen Ejecutivo
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Préstamos de Alta Prioridad
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {filteredPrestamos.filter(p => getPrioridadPrestamo(p) === 'alta').length}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Requieren atención inmediata
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Interés Mensual Total
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {formatMontoExacto(stats.interesMensualTotal)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Ingreso bruto mensual
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Capital en Riesgo
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {formatMontoExacto(stats.capitalEnMora)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {stats.prestamosConMora} clientes en mora
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Eficiencia General
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {stats.recuperacionTotal.toFixed(1)}%
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Capital recuperado vs prestado
                </p>
              </div>
            </div>
            
            {/* Resumen de comisiones y pagos - CON NÚMEROS EXACTOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Comisión Mensual
                </p>
                <p className={`text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400`}>
                  {formatMontoExacto(stats.comisionMensualTotal)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {stats.prestamosConComision} préstamos con garante
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Mensual Neto (EYS)
                </p>
                <p className={`text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400`}>
                  {formatMontoExacto(stats.totalMensualBruto)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Interés - Comisión
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Interés Pagado
                </p>
                <p className={`text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400`}>
                  {formatMontoExacto(stats.totalInteresPagado)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {stats.totalPagosRegistrados} pagos registrados
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prestamos;