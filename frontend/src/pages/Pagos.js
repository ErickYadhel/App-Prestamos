import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  ChartBarIcon,
  BanknotesIcon,
  XMarkIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GiftIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  InformationCircleIcon,
  PresentationChartLineIcon,
  PercentBadgeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
  FireIcon,
  NoSymbolIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import RegistrarPagoModal from '../components/Pagos/RegistrarPagoModal';
import DetallesPago from '../components/Pagos/DetallesPago';
import { normalizeFirebaseData, firebaseTimestampToLocalString, firebaseTimestampToDate, toLocalDateString, formatFecha } from '../utils/firebaseUtils';

// ============================================
// IMPORTACIONES PARA GRÁFICOS
// ============================================
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
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

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
  Filler
);

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
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SKELETON LOADER
// ============================================
const PagosSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-64 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className={`h-10 w-40 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
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
    red: 'from-red-600 to-red-800',
    teal: 'from-teal-600 to-teal-800',
    indigo: 'from-indigo-600 to-indigo-800',
    pink: 'from-pink-600 to-pink-800',
    yellow: 'from-yellow-500 to-yellow-700',
    cyan: 'from-cyan-600 to-cyan-800',
    rose: 'from-rose-600 to-rose-800',
    emerald: 'from-emerald-600 to-emerald-800',
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
// COMPONENTE DE SECCIÓN DESPLEGABLE GLOBAL
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
// COMPONENTE DE FILTROS AVANZADOS MEJORADO
// ============================================
const AdvancedFilters = ({ isOpen, onClose, filtros, onFilterChange, clientes }) => {
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState(filtros);

  if (!isOpen) return null;

  const aplicarFiltros = () => {
    onFilterChange('aplicar', localFilters);
    onClose();
  };

  const limpiarFiltros = () => {
    const vacio = {
      tipo: 'todos',
      rangoFecha: 'todos',
      rangoMonto: 'todos',
      montoMin: '',
      montoMax: '',
      fechaInicio: '',
      fechaFin: '',
      clienteID: ''
    };
    setLocalFilters(vacio);
    onFilterChange('reset', vacio);
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
              <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Filtros Avanzados
              </h3>
              {Object.values(localFilters).some(v => v !== '' && v !== 'todos') && (
                <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded-full">
                  Filtros activos
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <CreditCardIcon className="h-4 w-4 inline mr-1" />
                Tipo de Pago
              </label>
              <select
                value={localFilters.tipo}
                onChange={(e) => setLocalFilters({ ...localFilters, tipo: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="todos">Todos</option>
                <option value="normal">Normal</option>
                <option value="adelantado">Adelantado</option>
                <option value="mora">Mora</option>
                <option value="abono">Abono</option>
              </select>
            </div>

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
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todos los clientes</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Rango de Fecha
              </label>
              <select
                value={localFilters.rangoFecha}
                onChange={(e) => setLocalFilters({ ...localFilters, rangoFecha: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border-2 text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="todos">Todo el tiempo</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
                <option value="trimestre">Último trimestre</option>
                <option value="año">Este año</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            {localFilters.rangoFecha === 'personalizado' && (
              <>
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
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    }`}
                  />
                </div>
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
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    }`}
                  />
                </div>
              </>
            )}

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
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                {rangosMontos.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

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
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
            </div>

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
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
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
      </GlassCard>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [selectedPrestamo, setSelectedPrestamo] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatsCards, setShowStatsCards] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  // Estado para ordenamiento de tabla
  const [sortConfig, setSortConfig] = useState({
    key: 'fechaPago',
    direction: 'desc'
  });

  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    rangoFecha: 'todos',
    rangoMonto: 'todos',
    montoMin: '',
    montoMax: '',
    fechaInicio: '',
    fechaFin: '',
    clienteID: ''
  });
  
  const [stats, setStats] = useState({
    totalPagos: 0,
    totalRecaudado: 0,
    totalCapital: 0,
    totalInteres: 0,
    pagosHoy: 0,
    pagosEsteMes: 0
  });

  // Estados adicionales
  const [totalComisiones, setTotalComisiones] = useState(0);
  const [pagosPorMes, setPagosPorMes] = useState([]);
  const [distribucionTipos, setDistribucionTipos] = useState({ normal: 0, adelantado: 0, mora: 0, abono: 0 });
  const [ultimasComisiones, setUltimasComisiones] = useState([]);
  
  // 🔥 ESTADOS PARA CLIENTES
  const [clienteMayorInteres, setClienteMayorInteres] = useState({ nombre: '', totalInteres: 0 });
  
  // 🔥 NUEVAS ESTADÍSTICAS
  const [capitalPagado, setCapitalPagado] = useState(0);
  const [pagadoEsteMes, setPagadoEsteMes] = useState(0);
  const [totalGeneralRecaudado, setTotalGeneralRecaudado] = useState(0);
  const [clientesActivosConPagos, setClientesActivosConPagos] = useState(0);
  const [promedioPago, setPromedioPago] = useState(0);
  const [pagoMaximo, setPagoMaximo] = useState(0);
  const [pagoMinimo, setPagoMinimo] = useState(0);
  
  // 🔥 NUEVAS ESTADÍSTICAS PARA TARJETAS ADICIONALES
  const [pagosConMora, setPagosConMora] = useState(0);
  const [montoEnMora, setMontoEnMora] = useState(0);
  const [tasaRecuperacion, setTasaRecuperacion] = useState(0);
  const [diasSinPagos, setDiasSinPagos] = useState(0);
  const [promedioDiario, setPromedioDiario] = useState(0);

  const { theme } = useTheme();

  // ============================================
  // CARGA INICIAL - TODOS LOS DATOS JUNTOS
  // ============================================
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [pagosRes, prestamosRes, comisionesRes, clientesRes] = await Promise.all([
          api.get('/pagos'),
          api.get('/prestamos'),
          api.get('/comisiones').catch(() => ({ success: false, data: [] })),
          api.get('/clientes').catch(() => ({ success: false, data: [] }))
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
        setPrestamos(prestamosNormalizados.filter(p => p.estado === 'activo'));
        
        // Procesar pagos
        const pagosNormalizados = (pagosRes.data || []).map(pago =>
          normalizeFirebaseData(pago)
        );
        setPagos(pagosNormalizados);
        
        // Procesar comisiones
        if (comisionesRes.success) {
          const comisiones = comisionesRes.data || [];
          const total = comisiones.reduce((sum, com) => sum + (com.montoComision || 0), 0);
          setTotalComisiones(total);
          const ultimas = [...comisiones].sort((a,b) => {
            const fechaA = firebaseTimestampToDate(a.fechaPago);
            const fechaB = firebaseTimestampToDate(b.fechaPago);
            return fechaB - fechaA;
          }).slice(0,5);
          setUltimasComisiones(ultimas);
        }
        
        // Calcular estadísticas
        calcularEstadisticasCompletas(pagosNormalizados);
        procesarDatosGraficos(pagosNormalizados);
        
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        setError('Error al cargar los datos');
        setPagos([]);
        setPrestamos([]);
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatosIniciales();
  }, []);

  // ============================================
  // FUNCIÓN PARA EXTRAER MONTOS DE PAGO
  // ============================================
  const extraerMontoPago = (pago) => {
    const montoTotal = pago.montoTotal ?? pago.total ?? pago.monto ?? 0;
    const montoCapital = pago.montoCapital ?? pago.capital ?? pago.distribucion?.capital ?? 0;
    const montoInteres = pago.montoInteres ?? pago.interes ?? pago.distribucion?.interes ?? 0;
    const montoMora = pago.montoMora ?? pago.mora ?? pago.distribucion?.mora ?? 0;
    return { montoTotal, montoCapital, montoInteres, montoMora };
  };

  // ============================================
  // CALCULAR ESTADÍSTICAS COMPLETAS
  // ============================================
  const calcularEstadisticasCompletas = (pagosData) => {
    if (!pagosData || pagosData.length === 0) {
      setStats({
        totalPagos: 0,
        totalRecaudado: 0,
        totalCapital: 0,
        totalInteres: 0,
        pagosHoy: 0,
        pagosEsteMes: 0
      });
      setCapitalPagado(0);
      setPagadoEsteMes(0);
      setTotalGeneralRecaudado(0);
      setClientesActivosConPagos(0);
      setPromedioPago(0);
      setPagoMaximo(0);
      setPagoMinimo(0);
      setClienteMayorInteres({ nombre: '', totalInteres: 0 });
      setPagosConMora(0);
      setMontoEnMora(0);
      setTasaRecuperacion(0);
      setDiasSinPagos(0);
      setPromedioDiario(0);
      return;
    }

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - 7);
    
    let totalRecaudado = 0, totalCapital = 0, totalInteres = 0;
    let pagosMes = 0;
    let pagosConMoraCount = 0;
    let montoEnMoraTotal = 0;
    let clientesSet = new Set();
    let montos = [];
    let interesPorCliente = {};
    let ultimaFechaPago = null;

    pagosData.forEach(pago => {
      const { montoTotal, montoCapital, montoInteres, montoMora } = extraerMontoPago(pago);
      totalRecaudado += montoTotal;
      totalCapital += montoCapital;
      totalInteres += montoInteres;
      montos.push(montoTotal);

      // Contar pagos con mora
      if (pago.tipoPago === 'mora' || montoMora > 0) {
        pagosConMoraCount++;
        montoEnMoraTotal += montoTotal;
      }

      // OBTENER NOMBRE DEL CLIENTE
      let nombreCliente = pago.clienteNombre || pago.cliente || 'Cliente';
      
      if ((!pago.clienteNombre && !pago.cliente) && pago.clienteID) {
        const clienteEncontrado = clientes.find(c => c.id === pago.clienteID);
        if (clienteEncontrado) {
          nombreCliente = clienteEncontrado.nombre || clienteEncontrado.clienteNombre || 'Cliente';
        }
      }
      
      if (nombreCliente === 'Cliente' && pago.clienteID) {
        const clienteEncontrado = clientes.find(c => c.id === pago.clienteID);
        if (clienteEncontrado) {
          nombreCliente = clienteEncontrado.nombre || clienteEncontrado.clienteNombre || pago.clienteID;
        }
      }

      if (!nombreCliente || nombreCliente === 'Cliente' || nombreCliente === '') {
        nombreCliente = pago.clienteID || `Pago ${pago.id?.substring(0, 6)}`;
      }

      clientesSet.add(nombreCliente);

      // Acumular intereses por cliente
      if (!interesPorCliente[nombreCliente]) interesPorCliente[nombreCliente] = 0;
      interesPorCliente[nombreCliente] += montoInteres;

      // Fecha del pago para estadísticas
      const fechaPago = firebaseTimestampToDate(pago.fechaPago);
      if (fechaPago) {
        if (!ultimaFechaPago || fechaPago > ultimaFechaPago) {
          ultimaFechaPago = fechaPago;
        }
        if (fechaPago >= inicioMes) {
          pagosMes += montoTotal;
        }
      }
    });

    // 🔥 CLIENTE CON MAYOR INTERÉS PAGADO
    let topInteres = { nombre: '', totalInteres: 0 };
    for (const [nombre, total] of Object.entries(interesPorCliente)) {
      if (total > topInteres.totalInteres) {
        topInteres = { nombre, totalInteres: total };
      }
    }

    // 🔥 CALCULAR DÍAS SIN PAGOS
    let diasSinPagosCount = 0;
    if (ultimaFechaPago) {
      const diffTime = Math.abs(hoy - ultimaFechaPago);
      diasSinPagosCount = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // 🔥 CALCULAR TASA DE RECUPERACIÓN
    const totalCapitalPrestado = prestamos.reduce((sum, p) => sum + (p.montoPrestado || 0), 0);
    const tasaRecuperacionCalc = totalCapitalPrestado > 0 ? (totalCapital / totalCapitalPrestado) * 100 : 0;

    // 🔥 CALCULAR PROMEDIO DIARIO (últimos 7 días)
    const pagosUltimaSemana = pagosData.filter(pago => {
      const fecha = firebaseTimestampToDate(pago.fechaPago);
      return fecha && fecha >= inicioSemana;
    });
    const totalSemana = pagosUltimaSemana.reduce((sum, p) => sum + (p.montoTotal || 0), 0);
    const promedioDiarioCalc = totalSemana / 7;

    setCapitalPagado(totalCapital);
    setPagadoEsteMes(pagosMes);
    setClienteMayorInteres(topInteres);
    setTotalGeneralRecaudado(totalRecaudado + totalComisiones);
    setClientesActivosConPagos(clientesSet.size);
    setPagosConMora(pagosConMoraCount);
    setMontoEnMora(montoEnMoraTotal);
    setTasaRecuperacion(tasaRecuperacionCalc);
    setDiasSinPagos(diasSinPagosCount);
    setPromedioDiario(promedioDiarioCalc);
    
    // Calcular estadísticas de montos
    if (montos.length > 0) {
      const totalMontos = montos.reduce((a, b) => a + b, 0);
      setPromedioPago(totalMontos / montos.length);
      setPagoMaximo(Math.max(...montos));
      setPagoMinimo(Math.min(...montos));
    }

    const pagosHoy = pagosData.filter(pago => {
      const fechaPago = firebaseTimestampToDate(pago.fechaPago);
      return fechaPago && fechaPago.toDateString() === hoy.toDateString();
    }).length;

    setStats({
      totalPagos: pagosData.length,
      totalRecaudado,
      totalCapital,
      totalInteres,
      pagosHoy,
      pagosEsteMes: pagosMes
    });
  };

  // ============================================
  // PROCESAR DATOS PARA GRÁFICOS
  // ============================================
  const procesarDatosGraficos = (pagosData) => {
    const meses = {};
    const tipos = { normal: 0, adelantado: 0, mora: 0, abono: 0 };
    
    pagosData.forEach(pago => {
      const fecha = firebaseTimestampToDate(pago.fechaPago);
      if (!fecha || isNaN(fecha.getTime())) return;
      
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = fecha.toLocaleDateString('es-DO', { year: 'numeric', month: 'short' });
      const { montoTotal } = extraerMontoPago(pago);
      
      if (!meses[mesKey]) {
        meses[mesKey] = { mes: mesLabel, total: 0, cantidad: 0 };
      }
      meses[mesKey].total += montoTotal;
      meses[mesKey].cantidad++;
      
      const tipo = pago.tipoPago || 'normal';
      if (tipos[tipo] !== undefined) tipos[tipo]++;
    });
    
    const mesesOrdenados = Object.values(meses).sort((a, b) => {
      const mesesOrden = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return mesesOrden.indexOf(a.mes.substring(0,3)) - mesesOrden.indexOf(b.mes.substring(0,3));
    });
    
    setPagosPorMes(mesesOrdenados);
    setDistribucionTipos(tipos);
  };

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================
  const fetchPagos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/pagos');
      if (response.success) {
        const pagosNormalizados = (response.data || []).map(pago => 
          normalizeFirebaseData(pago)
        );
        setPagos(pagosNormalizados);
        calcularEstadisticasCompletas(pagosNormalizados);
        procesarDatosGraficos(pagosNormalizados);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Error al cargar los pagos');
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrestamosActivos = async () => {
    try {
      const response = await api.get('/prestamos');
      if (response.success) {
        const prestamosNormalizados = (response.data || []).map(prestamo =>
          normalizeFirebaseData(prestamo)
        );
        setPrestamos(prestamosNormalizados.filter(p => p.estado === 'activo'));
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      setPrestamos([]);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await api.get('/clientes');
      if (response.success) {
        const clientesNormalizados = (response.data || []).map(cliente =>
          normalizeFirebaseData(cliente)
        );
        setClientes(clientesNormalizados);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClientes([]);
    }
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
  // FUNCIÓN DE ORDENAMIENTO
  // ============================================
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowsUpDownIcon className="h-3 w-3 inline ml-1" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUpIcon className="h-3 w-3 inline ml-1" />
      : <ArrowDownIcon className="h-3 w-3 inline ml-1" />;
  };

  // ============================================
  // FILTROS Y ORDENAMIENTO
  // ============================================
  const filteredAndSortedPagos = useMemo(() => {
    let result = [...pagos];

    // Búsqueda
    if (searchTerm) {
      result = result.filter(pago => 
        pago.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pago.prestamoID?.includes(searchTerm) ||
        pago.tipoPago?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      result = result.filter(pago => pago.tipoPago === filtroEstado);
    }

    // Filtro por tipo
    if (filtros.tipo !== 'todos') {
      result = result.filter(pago => pago.tipoPago === filtros.tipo);
    }

    // Filtro por cliente
    if (filtros.clienteID) {
      result = result.filter(pago => pago.clienteID === filtros.clienteID);
    }

    // Filtro por fecha
    if (filtros.rangoFecha !== 'todos') {
      const hoy = new Date();
      const fechaPagos = result.map(p => ({
        ...p,
        fechaObj: firebaseTimestampToDate(p.fechaPago)
      }));
      
      if (filtros.rangoFecha === 'hoy') {
        result = fechaPagos.filter(p => p.fechaObj && p.fechaObj.toDateString() === hoy.toDateString());
      } else if (filtros.rangoFecha === 'semana') {
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - 7);
        result = fechaPagos.filter(p => p.fechaObj && p.fechaObj >= inicioSemana);
      } else if (filtros.rangoFecha === 'mes') {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        result = fechaPagos.filter(p => p.fechaObj && p.fechaObj >= inicioMes);
      } else if (filtros.rangoFecha === 'trimestre') {
        const inicioTrimestre = new Date(hoy);
        inicioTrimestre.setMonth(hoy.getMonth() - 3);
        result = fechaPagos.filter(p => p.fechaObj && p.fechaObj >= inicioTrimestre);
      } else if (filtros.rangoFecha === 'año') {
        const inicioAño = new Date(hoy.getFullYear(), 0, 1);
        result = fechaPagos.filter(p => p.fechaObj && p.fechaObj >= inicioAño);
      } else if (filtros.rangoFecha === 'personalizado') {
        const fechaInicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
        const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : null;
        result = fechaPagos.filter(p => {
          if (!p.fechaObj) return false;
          if (fechaInicio && p.fechaObj < fechaInicio) return false;
          if (fechaFin) {
            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);
            if (p.fechaObj > fin) return false;
          }
          return true;
        });
      }
    }

    // Filtro por rango de monto
    result = result.filter(pago => {
      const monto = pago.montoTotal || 0;
      let match = true;
      
      if (filtros.rangoMonto && filtros.rangoMonto !== 'todos' && filtros.rangoMonto !== '') {
        const [min, max] = filtros.rangoMonto.split('-').map(Number);
        if (max) {
          match = monto >= min && monto <= max;
        } else {
          match = monto >= min;
        }
      }
      
      if (filtros.montoMin && !isNaN(filtros.montoMin)) {
        const montoMin = parseFloat(filtros.montoMin);
        if (monto < montoMin) match = false;
      }
      
      if (filtros.montoMax && !isNaN(filtros.montoMax)) {
        const montoMax = parseFloat(filtros.montoMax);
        if (monto > montoMax) match = false;
      }
      
      return match;
    });

    // ORDENAMIENTO
    result.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortConfig.key) {
        case 'clienteNombre':
          aVal = a.clienteNombre || '';
          bVal = b.clienteNombre || '';
          break;
        case 'montoTotal':
          aVal = a.montoTotal || 0;
          bVal = b.montoTotal || 0;
          break;
        case 'fechaPago':
          const aFecha = firebaseTimestampToDate(a.fechaPago);
          const bFecha = firebaseTimestampToDate(b.fechaPago);
          aVal = aFecha ? aFecha.getTime() : 0;
          bVal = bFecha ? bFecha.getTime() : 0;
          break;
        case 'tipoPago':
          aVal = a.tipoPago || '';
          bVal = b.tipoPago || '';
          break;
        case 'capitalPagado':
          aVal = a.montoCapital || 0;
          bVal = b.montoCapital || 0;
          break;
        case 'interesPagado':
          aVal = a.montoInteres || 0;
          bVal = b.montoInteres || 0;
          break;
        default:
          aVal = a[sortConfig.key] || '';
          bVal = b[sortConfig.key] || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [pagos, searchTerm, filtroEstado, filtros, sortConfig]);

  const handleRegistrarPago = () => {
    if (prestamos.length === 0) {
      setError('No hay préstamos activos para registrar pagos');
      return;
    }
    setShowModal(true);
  };

  const handlePagoRegistrado = () => {
    setShowModal(false);
    setSuccess('Pago registrado exitosamente');
    setTimeout(() => setSuccess(''), 3000);
    fetchPagos();
    fetchPrestamosActivos();
    window.dispatchEvent(new CustomEvent('datos-actualizados'));
  };

  const handleViewDetails = (pago) => {
    setSelectedPago(pago);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPago(null);
  };

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFiltros({
        tipo: 'todos',
        rangoFecha: 'todos',
        rangoMonto: 'todos',
        montoMin: '',
        montoMax: '',
        fechaInicio: '',
        fechaFin: '',
        clienteID: ''
      });
      setSearchTerm('');
      setFiltroEstado('todos');
      setSelectedPrestamo('todos');
    } else if (key === 'aplicar') {
      setFiltros(value);
    } else {
      setFiltros(prev => ({ ...prev, [key]: value }));
    }
  };

  const getTipoPagoBadge = (tipoPago) => {
    const tipos = {
      normal: { 
        color: theme === 'dark' 
          ? 'bg-green-900/30 text-green-400 border-green-700' 
          : 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon,
        text: 'Normal' 
      },
      adelantado: { 
        color: theme === 'dark' 
          ? 'bg-blue-900/30 text-blue-400 border-blue-700' 
          : 'bg-blue-100 text-blue-800 border-blue-200',
        icon: ClockIcon,
        text: 'Adelantado' 
      },
      mora: { 
        color: theme === 'dark' 
          ? 'bg-red-900/30 text-red-400 border-red-700' 
          : 'bg-red-100 text-red-800 border-red-200',
        icon: ExclamationTriangleIcon,
        text: 'Con Mora' 
      },
      abono: { 
        color: theme === 'dark' 
          ? 'bg-purple-900/30 text-purple-400 border-purple-700' 
          : 'bg-purple-100 text-purple-800 border-purple-200',
        icon: CurrencyDollarIcon,
        text: 'Abono Capital' 
      }
    };

    const tipo = tipos[tipoPago] || tipos.normal;
    const Icon = tipo.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-2 ${tipo.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {tipo.text}
      </span>
    );
  };

  const getPrestamoInfo = (pago) => {
    const prestamo = prestamos.find(p => p.id === pago.prestamoID);
    return prestamo ? {
      interesPercent: prestamo.interesPercent,
      frecuencia: prestamo.frecuencia,
      capitalAnterior: pago.capitalAnterior,
      capitalNuevo: pago.capitalNuevo
    } : null;
  };

  // Datos para gráficos
  const lineChartData = {
    labels: pagosPorMes.map(p => p.mes),
    datasets: [{
      label: 'Monto Recaudado (RD$)',
      data: pagosPorMes.map(p => p.total),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#ef4444',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const doughnutData = {
    labels: ['Normal', 'Adelantado', 'Mora', 'Abono'],
    datasets: [{
      data: [distribucionTipos.normal, distribucionTipos.adelantado, distribucionTipos.mora, distribucionTipos.abono],
      backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#8b5cf6'],
      borderColor: 'transparent',
      borderWidth: 2,
      hoverOffset: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#9ca3af' : '#4b5563',
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `RD$ ${ctx.raw.toLocaleString()}`
        }
      }
    }
  };

  if (viewMode === 'details' && selectedPago) {
    return (
      <DetallesPago
        pago={selectedPago}
        prestamoInfo={getPrestamoInfo(selectedPago)}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return <PagosSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl blur-3xl"></div>
        <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-red-600/20`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Gestión de Pagos
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Registro y seguimiento de todos los pagos
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-lg transition-all ${
                  showFilters
                    ? 'bg-red-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Filtros avanzados"
              >
                <FunnelIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-3 rounded-lg transition-all ${
                  showSearch
                    ? 'bg-red-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Buscar pagos"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              <button
                onClick={fetchPagos}
                className={`p-3 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Actualizar"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleRegistrarPago}
                className="p-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mensajes */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border-2 flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-700 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border-2 ${
              theme === 'dark'
                ? 'bg-green-900/30 border-green-700 text-green-400'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <p className="text-sm">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros Avanzados */}
      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filtros={filtros}
            onFilterChange={handleFilterChange}
            clientes={clientes}
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
              <div className="p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por cliente, ID de préstamo o tipo..."
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border-2 outline-none transition-all ${
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
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <XMarkIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} hover:text-red-600 transition-colors`} />
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="mt-2 text-xs text-gray-500">
                    {filteredAndSortedPagos.length} resultados encontrados
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards - CON NUEVAS TARJETAS */}
      <StatsCardsContainer 
        title="Métricas del Dashboard" 
        icon={ChartBarIcon}
        isOpen={showStatsCards}
        onToggle={() => setShowStatsCards(!showStatsCards)}
      >
        {/* Fila 1 - Métricas Principales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <StatsCard
            icon={BanknotesIcon}
            label="Total Recaudado"
            value={formatMontoAbreviado(totalGeneralRecaudado)}
            subValue="Capital + Interés + Comisiones"
            gradient="green"
            tooltip="Total recaudado incluyendo capital, intereses y comisiones"
          />
          
          <StatsCard
            icon={CurrencyDollarIcon}
            label="Capital Pagado"
            value={formatMontoAbreviado(capitalPagado)}
            subValue="Capital recuperado"
            gradient="blue"
            tooltip="Total de capital recuperado de los préstamos"
          />

          <StatsCard
            icon={ArrowTrendingUpIcon}
            label="Interés Pagado"
            value={formatMontoAbreviado(stats.totalInteres)}
            subValue="Intereses cobrados"
            gradient="purple"
            tooltip="Total de intereses pagados por los clientes"
          />

          <StatsCard
            icon={CalendarIcon}
            label="Pagos Hoy"
            value={stats.pagosHoy}
            subValue={`${stats.pagosEsteMes} este mes`}
            gradient="orange"
            tooltip="Pagos realizados hoy y en el mes actual"
          />

          <StatsCard
            icon={UsersIcon}
            label="Total Pagos"
            value={stats.totalPagos}
            subValue={`${clientesActivosConPagos} clientes activos`}
            gradient="teal"
            tooltip="Total de pagos registrados"
          />

          <StatsCard
            icon={GiftIcon}
            label="Comisiones"
            value={formatMontoAbreviado(totalComisiones)}
            subValue="A garantes"
            gradient="pink"
            tooltip="Total de comisiones pagadas a garantes"
          />
        </div>

        {/* Fila 2 - Métricas Adicionales (NUEVAS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatsCard
            icon={PresentationChartLineIcon}
            label="Promedio por Pago"
            value={formatMontoAbreviado(promedioPago)}
            subValue={`${filteredAndSortedPagos.length} pagos`}
            gradient="indigo"
            tooltip="Promedio de monto por pago"
          />

          <StatsCard
            icon={TrophyIcon}
            label="Pago Máximo"
            value={formatMontoAbreviado(pagoMaximo)}
            subValue="Monto más alto"
            gradient="amber"
            tooltip="Monto más alto pagado en un solo pago"
          />

          <StatsCard
            icon={FireIcon}
            label="Recaudado Este Mes"
            value={formatMontoAbreviado(pagadoEsteMes)}
            subValue={`${stats.pagosEsteMes > 0 ? 'Actividad positiva' : 'Sin pagos este mes'}`}
            gradient="red"
            tooltip="Total recaudado en el mes actual"
          />

          <StatsCard
            icon={ExclamationTriangleIcon}
            label="Pagos con Mora"
            value={pagosConMora}
            subValue={pagosConMora > 0 ? `RD$ ${formatMontoAbreviado(montoEnMora)} en mora` : 'Sin mora'}
            gradient={pagosConMora > 0 ? "red" : "green"}
            tooltip="Cantidad de pagos registrados con mora"
          />

          <StatsCard
            icon={CheckBadgeIcon}
            label="Tasa Recuperación"
            value={`${tasaRecuperacion.toFixed(1)}%`}
            subValue={`RD$ ${formatMontoAbreviado(capitalPagado)} de ${formatMontoAbreviado(prestamos.reduce((sum, p) => sum + (p.montoPrestado || 0), 0))}`}
            gradient="emerald"
            tooltip="Porcentaje de capital recuperado vs prestado"
          />

          <StatsCard
            icon={ClockIcon}
            label="Días sin Pagos"
            value={diasSinPagos}
            subValue={diasSinPagos === 0 ? '¡Pago hoy!' : 'Último pago hace días'}
            gradient={diasSinPagos <= 1 ? "green" : diasSinPagos <= 3 ? "yellow" : "red"}
            tooltip="Días transcurridos desde el último pago registrado"
          />

          <StatsCard
            icon={ChartBarIcon}
            label="Promedio Diario"
            value={formatMontoAbreviado(promedioDiario)}
            subValue="Últimos 7 días"
            gradient="purple"
            tooltip="Promedio de recaudación diaria en los últimos 7 días"
          />

          <StatsCard
            icon={UserIcon}
            label="Cliente + Interés"
            value={clienteMayorInteres.nombre || 'Ninguno'}
            subValue={clienteMayorInteres.totalInteres > 0 ? `RD$ ${clienteMayorInteres.totalInteres.toLocaleString()} en intereses` : 'Sin datos'}
            gradient="yellow"
            tooltip="Cliente que ha pagado más intereses en total"
          />
        </div>
      </StatsCardsContainer>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="p-4">
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-red-600" />
              Evolución de Pagos
            </h3>
            <div className="h-64">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <ChartPieIcon className="h-5 w-5 mr-2 text-red-600" />
              Distribución por Tipo de Pago
            </h3>
            <div className="h-64 flex justify-center">
              <Doughnut data={doughnutData} options={chartOptions} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filtros Rápidos */}
      <GlassCard>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'todos'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos ({stats.totalPagos})
            </button>
            <button
              onClick={() => setFiltroEstado('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'normal'
                  ? 'bg-green-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ✅ Normal
            </button>
            <button
              onClick={() => setFiltroEstado('adelantado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'adelantado'
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⏰ Adelantado
            </button>
            <button
              onClick={() => setFiltroEstado('mora')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'mora'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⚠️ Con Mora
            </button>
            <button
              onClick={() => setFiltroEstado('abono')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'abono'
                  ? 'bg-purple-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              💰 Abono
            </button>
            <button
              onClick={() => setFiltros({ ...filtros, rangoMonto: '50000-100000' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              📊 50K-100K
            </button>
            <button
              onClick={() => setFiltros({ ...filtros, rangoMonto: '30000-50000' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-cyan-900/30 text-cyan-400 hover:bg-cyan-800/50'
                  : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
              }`}
            >
              📊 30K-50K
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Tabla de Pagos con Ordenamiento */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors"
                  onClick={() => requestSort('clienteNombre')}
                >
                  Cliente {getSortIcon('clienteNombre')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors"
                  onClick={() => requestSort('montoTotal')}
                >
                  Monto {getSortIcon('montoTotal')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors"
                  onClick={() => requestSort('capitalPagado')}
                >
                  Capital {getSortIcon('capitalPagado')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors"
                  onClick={() => requestSort('interesPagado')}
                >
                  Interés {getSortIcon('interesPagado')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors"
                  onClick={() => requestSort('fechaPago')}
                >
                  Fecha {getSortIcon('fechaPago')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors"
                  onClick={() => requestSort('tipoPago')}
                >
                  Tipo {getSortIcon('tipoPago')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
            }`}>
              <AnimatePresence>
                {filteredAndSortedPagos.map((pago) => {
                  const { montoTotal, montoCapital, montoInteres } = extraerMontoPago(pago);
                  const isHovered = hoveredRow === pago.id;
                  
                  return (
                    <motion.tr
                      key={pago.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onHoverStart={() => setHoveredRow(pago.id)}
                      onHoverEnd={() => setHoveredRow(null)}
                      className={`cursor-pointer transition-all duration-300 ${
                        isHovered
                          ? theme === 'dark'
                            ? 'bg-gray-700/50'
                            : 'bg-gray-100'
                          : ''
                      }`}
                      onClick={() => handleViewDetails(pago)}
                    >
                      <td className="px-6 py-4">
                        <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {pago.clienteNombre || pago.cliente || 'N/A'}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          ID: {pago.id?.substring(0, 15) || pago.prestamoID}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          RD$ {montoTotal.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          RD$ {montoCapital.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          RD$ {montoInteres.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {formatFecha(pago.fechaPago)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getTipoPagoBadge(pago.tipoPago)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(pago);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-gray-700 text-blue-400'
                              : 'hover:bg-blue-50 text-blue-600'
                          }`}
                          title="Ver detalles completos"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredAndSortedPagos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>💰</div>
              <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {searchTerm || filtroEstado !== 'todos' 
                  ? 'No se encontraron pagos' 
                  : 'No hay pagos registrados'
                }
              </p>
              {!searchTerm && filtroEstado === 'todos' && (
                <button
                  onClick={handleRegistrarPago}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Registrar Primer Pago</span>
                </button>
              )}
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Últimas comisiones */}
      {ultimasComisiones.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <GiftIcon className="h-5 w-5 mr-2 text-purple-600" />
              Últimas Comisiones
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {ultimasComisiones.map(com => (
                <div key={com.id} className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {com.clienteNombre || 'Cliente'}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Garante: {com.garanteNombre || com.garanteID}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      RD$ {(com.montoComision || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {firebaseTimestampToLocalString(com.fechaPago)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Resumen Ejecutivo - CON NÚMEROS EXACTOS */}
      {filteredAndSortedPagos.length > 0 && (
        <GlassCard>
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
                  Total Recaudado
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {formatMontoExacto(totalGeneralRecaudado)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {stats.totalPagos} pagos registrados
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Capital Recuperado
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {formatMontoExacto(capitalPagado)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {stats.totalCapital > 0 ? `${((capitalPagado / (capitalPagado + stats.totalInteres)) * 100).toFixed(1)}% del total` : 'Sin datos'}
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Interés Generado
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {formatMontoExacto(stats.totalInteres)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {stats.totalCapital > 0 ? `ROI: ${((stats.totalInteres / (capitalPagado + stats.totalInteres)) * 100).toFixed(1)}%` : 'Sin datos'}
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Comisiones Pagadas
                </p>
                <p className={`text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400`}>
                  {formatMontoExacto(totalComisiones)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {totalComisiones > 0 ? `${((totalComisiones / totalGeneralRecaudado) * 100).toFixed(1)}% del total` : 'Sin comisiones'}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Información del Sistema */}
      <GlassCard>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg flex-shrink-0">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Sistema Automático de Cálculos
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                El sistema calcula automáticamente la distribución de los pagos: primero se cubren los intereses 
                basados en el capital restante, y el resto se aplica al capital. Esto asegura que los cálculos 
                sean precisos y consistentes.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Modal para registrar pago */}
      <AnimatePresence>
        {showModal && (
          <RegistrarPagoModal
            prestamos={prestamos}
            onClose={() => setShowModal(false)}
            onPagoRegistrado={handlePagoRegistrado}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pagos;