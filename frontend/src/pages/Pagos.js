// src/pages/Pagos.js
import React, { useState, useEffect } from 'react';
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
  UsersIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import RegistrarPagoModal from '../components/Pagos/RegistrarPagoModal';
import DetallesPago from '../components/Pagos/DetallesPago';
import { normalizeFirebaseData, firebaseTimestampToLocalString } from '../utils/firebaseUtils';

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
// COMPONENTE DE STATS CARD
// ============================================
const StatsCard = ({ icon: Icon, label, value, subValue, gradient, trend }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const gradientColors = {
    green: 'from-green-600 to-green-800',
    blue: 'from-blue-600 to-blue-800',
    purple: 'from-purple-600 to-purple-800',
    orange: 'from-orange-600 to-orange-800',
    red: 'from-red-600 to-red-800',
    teal: 'from-teal-600 to-teal-800',
    indigo: 'from-indigo-600 to-indigo-800',
    pink: 'from-pink-600 to-pink-800',
    yellow: 'from-yellow-600 to-yellow-800'
  };

  return (
    <BorderGlow isHovered={isHovered}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-xl p-5 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white border-gray-200'
        } border-2 hover:border-red-600/40 transition-all duration-300`}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColors[gradient]} opacity-10 rounded-full blur-3xl`} />
        
        <div className="relative flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {subValue && (
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                {subValue}
              </p>
            )}
          </div>
          <div className={`p-3 bg-gradient-to-br ${gradientColors[gradient]} rounded-xl shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {trend && (
          <div className="absolute bottom-3 right-3 flex items-center space-x-1">
            <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          </div>
        )}
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE FILTROS AVANZADOS
// ============================================
const AdvancedFilters = ({ isOpen, onClose, filtros, onFilterChange }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

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
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo de Pago
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
                value={filtros.tipo}
                onChange={(e) => onFilterChange('tipo', e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="normal">Normal</option>
                <option value="adelantado">Adelantado</option>
                <option value="mora">Mora</option>
                <option value="abono">Abono</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Rango de Fecha
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
                value={filtros.rangoFecha}
                onChange={(e) => onFilterChange('rangoFecha', e.target.value)}
              >
                <option value="todos">Todo el tiempo</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
                <option value="trimestre">Último trimestre</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Rango de Monto
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
                value={filtros.rangoMonto}
                onChange={(e) => onFilterChange('rangoMonto', e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="0-1000">0 - 1,000</option>
                <option value="1000-5000">1,000 - 5,000</option>
                <option value="5000-10000">5,000 - 10,000</option>
                <option value="10000+">10,000+</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                onFilterChange('reset');
                onClose();
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Limpiar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
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
  const [hoveredRow, setHoveredRow] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    rangoFecha: 'todos',
    rangoMonto: 'todos'
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
  const [clienteTopInteres, setClienteTopInteres] = useState({ nombre: '', totalInteres: 0 });
  const [clienteTopPagos, setClienteTopPagos] = useState({ nombre: '', cantidadPagos: 0 });
  const [capitalPagado, setCapitalPagado] = useState(0);
  const [pagadoEsteMes, setPagadoEsteMes] = useState(0);
  const [totalGeneralRecaudado, setTotalGeneralRecaudado] = useState(0);

  const { theme } = useTheme();

  useEffect(() => {
    fetchPagos();
    fetchPrestamosActivos();
  }, []);

  // ==================== FUNCIONES AUXILIARES ====================
  const extraerMontoPago = (pago) => {
    const montoTotal = pago.montoTotal ?? pago.total ?? pago.monto ?? 0;
    const montoCapital = pago.montoCapital ?? pago.capital ?? pago.distribucion?.capital ?? 0;
    const montoInteres = pago.montoInteres ?? pago.interes ?? pago.distribucion?.interes ?? 0;
    const montoMora = pago.montoMora ?? pago.mora ?? pago.distribucion?.mora ?? 0;
    return { montoTotal, montoCapital, montoInteres, montoMora };
  };

  const procesarDatosGraficos = (pagosData) => {
    const meses = {};
    const tipos = { normal: 0, adelantado: 0, mora: 0, abono: 0 };
    
    pagosData.forEach(pago => {
      const fecha = new Date(pago.fechaPago);
      if (isNaN(fecha.getTime())) return;
      
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

  const cargarComisionesTotal = async () => {
    try {
      const response = await api.get('/comisiones');
      if (response.success) {
        const comisiones = response.data || [];
        const total = comisiones.reduce((sum, com) => sum + (com.montoComision || 0), 0);
        setTotalComisiones(total);
        const ultimas = [...comisiones].sort((a,b) => new Date(b.fechaPago) - new Date(a.fechaPago)).slice(0,5);
        setUltimasComisiones(ultimas);
      }
    } catch (error) {
      console.error('Error cargando comisiones:', error);
    }
  };

  const calcularEstadisticas = (pagosData) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    let totalRecaudado = 0, totalCapital = 0, totalInteres = 0;
    let pagosMes = 0;
    let interesPorCliente = {};
    let pagosPorCliente = {};

    pagosData.forEach(pago => {
      const { montoTotal, montoCapital, montoInteres } = extraerMontoPago(pago);
      totalRecaudado += montoTotal;
      totalCapital += montoCapital;
      totalInteres += montoInteres;

      const fechaPago = new Date(pago.fechaPago);
      if (fechaPago >= inicioMes) {
        pagosMes += montoTotal;
        const cliente = pago.clienteNombre;
        if (!interesPorCliente[cliente]) interesPorCliente[cliente] = 0;
        if (!pagosPorCliente[cliente]) pagosPorCliente[cliente] = 0;
        interesPorCliente[cliente] += montoInteres;
        pagosPorCliente[cliente] += 1;
      }
    });

    // Cliente con mayor interés pagado
    let topInteres = { nombre: '', totalInteres: 0 };
    for (const [nombre, total] of Object.entries(interesPorCliente)) {
      if (total > topInteres.totalInteres) topInteres = { nombre, totalInteres: total };
    }

    // Cliente con mayor cantidad de pagos
    let topPagos = { nombre: '', cantidadPagos: 0 };
    for (const [nombre, cantidad] of Object.entries(pagosPorCliente)) {
      if (cantidad > topPagos.cantidadPagos) topPagos = { nombre, cantidadPagos: cantidad };
    }

    setCapitalPagado(totalCapital);
    setPagadoEsteMes(pagosMes);
    setClienteTopInteres(topInteres);
    setClienteTopPagos(topPagos);
    setTotalGeneralRecaudado(totalRecaudado + totalComisiones);

    const pagosHoy = pagosData.filter(pago => {
      const fechaPago = pago.fechaPago instanceof Date ? pago.fechaPago : new Date(pago.fechaPago);
      return fechaPago.toDateString() === hoy.toDateString();
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

  const fetchPagos = async () => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const response = await api.get('/pagos');
        if (response.success) {
          const pagosNormalizados = (response.data || []).map(pago => 
            normalizeFirebaseData(pago)
          );
          setPagos(pagosNormalizados);
          calcularEstadisticas(pagosNormalizados);
          procesarDatosGraficos(pagosNormalizados);
          await cargarComisionesTotal();
          return;
        }
      } catch (apiError) {
        console.log('Usando datos de ejemplo - API no disponible');
      }

      const mockPagos = [
        {
          id: '1',
          prestamoID: '1',
          clienteID: '1',
          clienteNombre: 'Juan Pérez',
          fechaPago: new Date('2024-02-01T10:30:00'),
          montoCapital: 500,
          montoInteres: 1000,
          tipoPago: 'normal',
          nota: 'Pago quincenal completo',
          capitalAnterior: 35000,
          capitalNuevo: 34500,
          montoTotal: 1500
        },
        {
          id: '2',
          prestamoID: '1',
          clienteID: '1',
          clienteNombre: 'Juan Pérez',
          fechaPago: new Date('2024-02-15T09:15:00'),
          montoCapital: 600,
          montoInteres: 900,
          tipoPago: 'normal',
          nota: 'Pago con un día de anticipación',
          capitalAnterior: 34500,
          capitalNuevo: 33900,
          montoTotal: 1500
        },
        {
          id: '3',
          prestamoID: '2',
          clienteID: '2',
          clienteNombre: 'María Rodríguez',
          fechaPago: new Date('2024-02-05T14:20:00'),
          montoCapital: 800,
          montoInteres: 600,
          tipoPago: 'normal',
          nota: 'Pago mensual',
          capitalAnterior: 15000,
          capitalNuevo: 14200,
          montoTotal: 1400
        },
        {
          id: '4',
          prestamoID: '1',
          clienteID: '1',
          clienteNombre: 'Juan Pérez',
          fechaPago: new Date('2024-03-01T11:00:00'),
          montoCapital: 700,
          montoInteres: 800,
          tipoPago: 'adelantado',
          nota: 'Pago adelantado de la próxima quincena',
          capitalAnterior: 33900,
          capitalNuevo: 33200,
          montoTotal: 1500
        },
        {
          id: '5',
          prestamoID: '3',
          clienteID: '3',
          clienteNombre: 'Carlos López',
          fechaPago: new Date('2024-02-28T16:45:00'),
          montoCapital: 1200,
          montoInteres: 500,
          tipoPago: 'mora',
          nota: 'Pago con 5 días de mora - recargo aplicado',
          capitalAnterior: 18000,
          capitalNuevo: 16800,
          montoTotal: 1700
        }
      ];
      setPagos(mockPagos);
      calcularEstadisticas(mockPagos);
      procesarDatosGraficos(mockPagos);
      await cargarComisionesTotal();
      
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
      try {
        const response = await api.get('/prestamos');
        if (response.success) {
          const prestamosNormalizados = (response.data || []).map(prestamo =>
            normalizeFirebaseData(prestamo)
          );
          setPrestamos(prestamosNormalizados.filter(p => p.estado === 'activo'));
          return;
        }
      } catch (apiError) {
        console.log('Usando datos de ejemplo para préstamos');
      }

      const mockPrestamos = [
        {
          id: '1',
          clienteNombre: 'Juan Pérez',
          capitalRestante: 33200,
          interesPercent: 10,
          frecuencia: 'quincenal',
          estado: 'activo'
        },
        {
          id: '2',
          clienteNombre: 'María Rodríguez',
          capitalRestante: 14200,
          interesPercent: 8,
          frecuencia: 'mensual',
          estado: 'activo'
        },
        {
          id: '3',
          clienteNombre: 'Carlos López',
          capitalRestante: 16800,
          interesPercent: 12,
          frecuencia: 'semanal',
          estado: 'activo'
        }
      ];
      setPrestamos(mockPrestamos);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setPrestamos([]);
    }
  };

  const filteredPagos = pagos.filter(pago => {
    const matchSearch = 
      pago.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.prestamoID?.includes(searchTerm) ||
      pago.tipoPago?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filtroEstado === 'todos' || pago.tipoPago === filtroEstado;
    const matchPrestamo = selectedPrestamo === 'todos' || pago.prestamoID === selectedPrestamo;
    const matchTipo = filtros.tipo === 'todos' || pago.tipoPago === filtros.tipo;
    
    let matchFecha = true;
    if (filtros.rangoFecha !== 'todos') {
      const fechaPago = pago.fechaPago instanceof Date ? pago.fechaPago : new Date(pago.fechaPago);
      const hoy = new Date();
      
      if (filtros.rangoFecha === 'hoy') {
        matchFecha = fechaPago.toDateString() === hoy.toDateString();
      } else if (filtros.rangoFecha === 'semana') {
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - 7);
        matchFecha = fechaPago >= inicioSemana;
      } else if (filtros.rangoFecha === 'mes') {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        matchFecha = fechaPago >= inicioMes;
      } else if (filtros.rangoFecha === 'trimestre') {
        const inicioTrimestre = new Date(hoy);
        inicioTrimestre.setMonth(hoy.getMonth() - 3);
        matchFecha = fechaPago >= inicioTrimestre;
      }
    }

    let matchMonto = true;
    if (filtros.rangoMonto !== 'todos') {
      const monto = pago.montoTotal || 0;
      if (filtros.rangoMonto === '0-1000') {
        matchMonto = monto >= 0 && monto <= 1000;
      } else if (filtros.rangoMonto === '1000-5000') {
        matchMonto = monto >= 1000 && monto <= 5000;
      } else if (filtros.rangoMonto === '5000-10000') {
        matchMonto = monto >= 5000 && monto <= 10000;
      } else if (filtros.rangoMonto === '10000+') {
        matchMonto = monto >= 10000;
      }
    }

    return matchSearch && matchEstado && matchPrestamo && matchTipo && matchFecha && matchMonto;
  });

  const handleRegistrarPago = () => {
    if (prestamos.length === 0) {
      setError('No hay préstamos activos para registrar pagos');
      return;
    }
    setShowModal(true);
  };

  // ============================================
  // HANDLE PAGO REGISTRADO - CON EVENTO
  // ============================================
  const handlePagoRegistrado = () => {
    setShowModal(false);
    setSuccess('Pago registrado exitosamente');
    setTimeout(() => setSuccess(''), 3000);
    fetchPagos();
    fetchPrestamosActivos();
    // 👇 DISPARAR EVENTO PARA ACTUALIZAR DASHBOARD
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
        rangoMonto: 'todos'
      });
      setSearchTerm('');
      setFiltroEstado('todos');
      setSelectedPrestamo('todos');
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
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary - Fila 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={BanknotesIcon}
          label="Total Recaudado"
          value={`RD$ ${totalGeneralRecaudado.toLocaleString()}`}
          subValue="Capital + Interés + Comisiones"
          gradient="green"
        />
        
        <StatsCard
          icon={ChartBarIcon}
          label="Composición"
          value={`RD$ ${stats.totalCapital.toLocaleString()}`}
          subValue={`Interés: RD$ ${stats.totalInteres.toLocaleString()}`}
          gradient="blue"
        />

        <StatsCard
          icon={CalendarIcon}
          label="Pagos Hoy"
          value={stats.pagosHoy}
          subValue={`${stats.pagosEsteMes} este mes`}
          gradient="purple"
        />

        <StatsCard
          icon={GiftIcon}
          label="Comisiones Pagadas"
          value={`RD$ ${totalComisiones.toLocaleString()}`}
          subValue="A garantes"
          gradient="pink"
        />
      </div>

      {/* Stats Summary - Fila 2 (Nuevas métricas) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={CurrencyDollarIcon}
          label="Pagado este mes"
          value={`RD$ ${pagadoEsteMes.toLocaleString()}`}
          gradient="teal"
        />
        <StatsCard
          icon={BanknotesIcon}
          label="Capital Pagado"
          value={`RD$ ${capitalPagado.toLocaleString()}`}
          subValue="Total capital recuperado"
          gradient="indigo"
        />
        <StatsCard
          icon={UsersIcon}
          label="Total Pagos"
          value={stats.totalPagos}
          subValue="Pagos registrados"
          gradient="yellow"
        />
      </div>

      {/* Stats Summary - Fila 3 (Clientes destacados) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          icon={TrophyIcon}
          label="Cliente con mayor interés"
          value={clienteTopInteres.nombre || 'Ninguno'}
          subValue={clienteTopInteres.totalInteres > 0 ? `RD$ ${clienteTopInteres.totalInteres.toLocaleString()} en intereses` : 'Sin datos'}
          gradient="red"
        />
        <StatsCard
          icon={UserIcon}
          label="Cliente con más pagos"
          value={clienteTopPagos.nombre || 'Ninguno'}
          subValue={clienteTopPagos.cantidadPagos > 0 ? `${clienteTopPagos.cantidadPagos} pagos realizados` : 'Sin datos'}
          gradient="orange"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
              Todos
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
              Normal
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
              Adelantado
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
              Con Mora
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
              Abono
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Tabla de Pagos */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                {['Cliente / Préstamo', 'Monto', 'Distribución', 'Fecha', 'Tipo', 'Acciones'].map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
            }`}>
              <AnimatePresence>
                {filteredPagos.map((pago) => {
                  const prestamoInfo = getPrestamoInfo(pago);
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
                          {pago.clienteNombre}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Préstamo: {pago.prestamoID}
                        </div>
                        {prestamoInfo && (
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                            {prestamoInfo.frecuencia} • {prestamoInfo.interesPercent}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          RD$ {montoTotal.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          Capital: RD$ {montoCapital.toLocaleString()}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Interés: RD$ {montoInteres.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {firebaseTimestampToLocalString(pago.fechaPago)}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {pago.fechaPago && new Date(pago.fechaPago).toLocaleTimeString()}
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

          {filteredPagos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>💰</div>
              <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {searchTerm || filtroEstado !== 'todos' || selectedPrestamo !== 'todos'
                  ? 'No se encontraron pagos' 
                  : 'No hay pagos registrados'
                }
              </p>
              {!searchTerm && filtroEstado === 'todos' && selectedPrestamo === 'todos' && (
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
                    {new Date(com.fechaPago).toLocaleDateString('es-DO')}
                  </div>
                </div>
              ))}
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