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
  CalculatorIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PrestamoForm from '../components/Prestamos/PrestamoForm';
import PrestamoDetails from '../components/Prestamos/PrestamoDetails';
import RegistrarPago from '../components/Prestamos/RegistrarPago';
import PrestamosTable from '../components/Prestamos/PrestamosTable';
import { normalizeFirebaseData, firebaseTimestampToLocalString, formatFecha } from '../utils/firebaseUtils';
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
    teal: 'from-teal-600 to-teal-800',
    red: 'from-red-600 to-red-800'
  };

  return (
    <BorderGlow isHovered={isHovered}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-xl p-4 sm:p-5 border-2 hover:border-red-600/40 transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white border-gray-200 shadow-md'
        }`}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColors[gradient]} opacity-10 rounded-full blur-3xl`} />
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={`text-xs sm:text-sm font-medium truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {label}
            </p>
            <p className={`text-xl sm:text-2xl font-bold mt-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {value}
            </p>
            <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              {subValue}
            </p>
          </div>
          <div className={`p-2 sm:p-3 bg-gradient-to-br ${gradientColors[gradient]} rounded-xl shadow-lg ml-2 flex-shrink-0`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>
        
        {trend && (
          <div className="absolute bottom-2 right-2 flex items-center space-x-1">
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
const AdvancedFilters = ({ isOpen, onClose, onFilterChange, filters, setFilters }) => {
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState(filters || {
    estado: '',
    rangoMonto: '',
    frecuencia: '',
    prioridad: ''
  });

  if (!isOpen) return null;

  const aplicarFiltros = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const limpiarFiltros = () => {
    const vacio = { estado: '', rangoMonto: '', frecuencia: '', prioridad: '' };
    setLocalFilters(vacio);
    onFilterChange(vacio);
    onClose();
  };

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
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Filtros Avanzados
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                <option value="">Todos</option>
                <option value="0-50000">0 - 50,000</option>
                <option value="50000-100000">50,000 - 100,000</option>
                <option value="100000-250000">100,000 - 250,000</option>
                <option value="250000-500000">250,000 - 500,000</option>
                <option value="500000+">500,000+</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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

            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
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
              Limpiar
            </button>
            <button
              onClick={aplicarFiltros}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </motion.div>
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
  const [filters, setFilters] = useState({ estado: '', rangoMonto: '', frecuencia: '', prioridad: '' });
  const [viewMode, setViewMode] = useState('list');
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [editingPrestamo, setEditingPrestamo] = useState(null);
  const [error, setError] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [stats, setStats] = useState({
    totalPrestamos: 0,
    totalCapitalPrestado: 0,
    totalCapitalRecuperado: 0,
    totalInteresGenerado: 0,
    totalMoraGenerada: 0,
    prestamosActivos: 0,
    prestamosCompletados: 0,
    prestamosMorosos: 0
  });

  const { theme } = useTheme();
  const configMora = getConfiguracionMora();

  useEffect(() => {
    fetchPrestamos();
    fetchClientes();
  }, []);

  const fetchPrestamos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/prestamos');
      
      if (response.success) {
        const prestamosNormalizados = (response.data || []).map(prestamo => 
          normalizeFirebaseData(prestamo)
        );
        setPrestamos(prestamosNormalizados);
        calcularEstadisticas(prestamosNormalizados);
      } else {
        throw new Error(response.error || 'Error al cargar préstamos');
      }
    } catch (error) {
      console.error('Error fetching prestamos:', error);
      setError(error.message || 'Error interno del servidor');
      setPrestamos([]);
    } finally {
      setLoading(false);
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

  const calcularEstadisticas = (prestamosData) => {
    const totalPrestamos = prestamosData.length;
    const totalCapitalPrestado = prestamosData.reduce((sum, p) => sum + (p.montoPrestado || 0), 0);
    const totalCapitalRecuperado = prestamosData.reduce((sum, p) => sum + ((p.montoPrestado || 0) - (p.capitalRestante || 0)), 0);
    
    let totalInteresGenerado = 0;
    let totalMoraGenerada = 0;
    
    prestamosData.forEach(p => {
      totalInteresGenerado += (p.montoPrestado || 0) - (p.capitalRestante || 0);
      
      if (p.configuracionMora?.enabled && p.fechaProximoPago) {
        const hoy = new Date();
        const fechaProximo = new Date(p.fechaProximoPago);
        const diasAtraso = Math.max(0, Math.ceil((hoy - fechaProximo) / (1000 * 60 * 60 * 24)));
        if (diasAtraso > p.configuracionMora.diasGracia) {
          const interesAdeudado = (p.capitalRestante * p.interesPercent) / 100;
          const diasMora = diasAtraso - p.configuracionMora.diasGracia;
          const moraDiaria = (interesAdeudado * p.configuracionMora.porcentaje) / 100 / 30;
          totalMoraGenerada += moraDiaria * diasMora;
        }
      }
    });
    
    const prestamosActivos = prestamosData.filter(p => p.estado === 'activo').length;
    const prestamosCompletados = prestamosData.filter(p => p.estado === 'completado').length;
    const prestamosMorosos = prestamosData.filter(p => p.estado === 'moroso').length;

    setStats({
      totalPrestamos,
      totalCapitalPrestado,
      totalCapitalRecuperado,
      totalInteresGenerado,
      totalMoraGenerada,
      prestamosActivos,
      prestamosCompletados,
      prestamosMorosos
    });
  };

  const calcularInteresDiario = (prestamo) => {
    if (!prestamo.capitalRestante || !prestamo.interesPercent) return 0;
    return (prestamo.capitalRestante * prestamo.interesPercent) / 100 / 30;
  };

  const calcularInteresQuincenal = (prestamo) => {
    return calcularInteresDiario(prestamo) * 15;
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
    const fechaProximo = new Date(prestamo.fechaProximoPago);
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

  const aplicarFiltros = (nuevosFiltros) => {
    setFilters(nuevosFiltros);
  };

  const filteredPrestamos = prestamos.filter(prestamo => {
    const matchSearch = prestamo.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestamo.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCedulaCliente(prestamo)?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchSearch) return false;
    
    if (filters.estado && prestamo.estado !== filters.estado) return false;
    if (filters.frecuencia && prestamo.frecuencia !== filters.frecuencia) return false;
    
    if (filters.rangoMonto) {
      const [min, max] = filters.rangoMonto.split('-').map(Number);
      if (max) {
        if (prestamo.montoPrestado < min || prestamo.montoPrestado > max) return false;
      } else {
        if (prestamo.montoPrestado < min) return false;
      }
    }
    
    if (filters.prioridad) {
      const prioridad = getPrioridadPrestamo(prestamo);
      if (prioridad !== filters.prioridad) return false;
    }
    
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
      const nuevosPrestamos = prestamos.map(p => 
        p.id === prestamoActualizado.id ? prestamoActualizado : p
      );
      calcularEstadisticas(nuevosPrestamos);
      console.log('✅ Préstamo actualizado:', {
        id: prestamoActualizado.id,
        capitalRestante: prestamoActualizado.capitalRestante,
        fechaProximoPago: prestamoActualizado.fechaProximoPago
      });
    } else {
      await fetchPrestamos();
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
    
    let mensaje = `Hola ${prestamo.clienteNombre}, le recordamos que tiene un pago pendiente de RD$ ${interesQuincenal.toLocaleString()} correspondiente a los intereses de su préstamo. 

📊 Resumen de su préstamo:
• Capital restante: RD$ ${prestamo.capitalRestante?.toLocaleString()}
• Progreso: ${porcentajeRecuperacion.toFixed(1)}% pagado
• Próximo pago: ${formatFecha(prestamo.fechaProximoPago)}`;

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
  };

  // ============================================
  // HANDLE SAVE PRESTAMO - CON EVENTO
  // ============================================
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
        // 👇 DISPARAR EVENTO PARA ACTUALIZAR DASHBOARD
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

  // ============================================
  // HANDLE DELETE PRESTAMO - CON EVENTO
  // ============================================
  const handleDeletePrestamo = async (prestamoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este préstamo? Esta acción no se puede deshacer.')) {
      try {
        setError('');
        const response = await api.delete(`/prestamos/${prestamoId}`);
        
        if (response.success) {
          fetchPrestamos();
          // 👇 DISPARAR EVENTO PARA ACTUALIZAR DASHBOARD
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
    const porcentajeRecuperacion = calcularPorcentajeRecuperacion(prestamo);
    const diasAtraso = calcularDiasAtraso(prestamo);
    
    if (diasAtraso > 15) return 'alta';
    if (porcentajeRecuperacion > 80) return 'alta';
    if (diasAtraso > 5) return 'media';
    if (porcentajeRecuperacion > 50) return 'media';
    return 'baja';
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
                  Dashboard completo para toma de decisiones
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
                    placeholder="Buscar por cliente, cédula o ID..."
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          icon={BanknotesIcon}
          label="Capital Invertido"
          value={`RD$ ${stats.totalCapitalPrestado.toLocaleString()}`}
          subValue={`${stats.totalPrestamos} préstamos`}
          gradient="green"
        />
        
        <StatsCard
          icon={ArrowTrendingUpIcon}
          label="Interés Generado"
          value={`RD$ ${stats.totalInteresGenerado.toLocaleString()}`}
          subValue={`ROI: ${stats.totalCapitalPrestado > 0 ? ((stats.totalInteresGenerado / stats.totalCapitalPrestado) * 100).toFixed(1) : 0}%`}
          gradient="blue"
        />

        <StatsCard
          icon={DocumentChartBarIcon}
          label="Estado Portfolio"
          value={`${stats.prestamosActivos} activos`}
          subValue={`${stats.prestamosCompletados} completados • ${stats.prestamosMorosos} morosos`}
          gradient="purple"
        />

        <StatsCard
          icon={CurrencyDollarIcon}
          label="Recuperación"
          value={`RD$ ${stats.totalCapitalRecuperado.toLocaleString()}`}
          subValue={`${stats.totalCapitalPrestado > 0 ? ((stats.totalCapitalRecuperado / stats.totalCapitalPrestado) * 100).toFixed(1) : 0}% recuperado`}
          gradient="orange"
        />
      </div>

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
              onClick={() => setFilters({ ...filters, estado: '' })}
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
              Activos ({stats.prestamosActivos})
            </button>
            <button 
              onClick={() => setFilters({ ...filters, estado: 'moroso' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Morosos ({stats.prestamosMorosos})
            </button>
            <button 
              onClick={() => setFilters({ ...filters, prioridad: 'alta' })}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-800/50'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Alta Prioridad
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

      {/* Resumen ejecutivo */}
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
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                  Interés Quincenal Total
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  RD$ {filteredPrestamos.reduce((sum, p) => sum + calcularInteresQuincenal(p), 0).toLocaleString()}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Próximo período
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  ROI Promedio
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {filteredPrestamos.length > 0 ? 
                    (filteredPrestamos.reduce((sum, p) => sum + calcularROI(p), 0) / filteredPrestamos.length).toFixed(1) : 0
                  }%
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Rentabilidad promedio
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