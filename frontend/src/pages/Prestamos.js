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
  BellAlertIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PrestamoForm from '../components/Prestamos/PrestamoForm';
import PrestamoDetails from '../components/Prestamos/PrestamoDetails';
import RegistrarPago from '../components/Prestamos/RegistrarPago';
import { normalizeFirebaseData, firebaseTimestampToLocalString } from '../utils/firebaseUtils';

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
const PrestamosSkeleton = () => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-24 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>

      {/* Table Skeleton */}
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
    teal: 'from-teal-600 to-teal-800'
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
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              {subValue}
            </p>
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
const AdvancedFilters = ({ isOpen, onClose, onFilterChange }) => {
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Estado
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="completado">Completado</option>
                <option value="moroso">Moroso</option>
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
              >
                <option value="">Todos</option>
                <option value="0-50000">0 - 50,000</option>
                <option value="50000-100000">50,000 - 100,000</option>
                <option value="100000+">100,000+</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Frecuencia
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todas</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Prioridad
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
            <button
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

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
    prestamosActivos: 0,
    prestamosCompletados: 0,
    prestamosMorosos: 0
  });

  const { theme } = useTheme();

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

  // Calcular estadísticas detalladas para toma de decisiones
  const calcularEstadisticas = (prestamosData) => {
    const totalPrestamos = prestamosData.length;
    const totalCapitalPrestado = prestamosData.reduce((sum, p) => sum + (p.montoPrestado || 0), 0);
    const totalCapitalRecuperado = prestamosData.reduce((sum, p) => sum + ((p.montoPrestado || 0) - (p.capitalRestante || 0)), 0);
    const totalInteresGenerado = prestamosData.reduce((sum, p) => sum + calcularInteresTotalGenerado(p), 0);
    
    const prestamosActivos = prestamosData.filter(p => p.estado === 'activo').length;
    const prestamosCompletados = prestamosData.filter(p => p.estado === 'completado').length;
    const prestamosMorosos = prestamosData.filter(p => p.estado === 'moroso').length;

    setStats({
      totalPrestamos,
      totalCapitalPrestado,
      totalCapitalRecuperado,
      totalInteresGenerado,
      prestamosActivos,
      prestamosCompletados,
      prestamosMorosos
    });
  };

  // Calcular interés total generado por un préstamo
  const calcularInteresTotalGenerado = (prestamo) => {
    return (prestamo.montoPrestado || 0) - (prestamo.capitalRestante || 0);
  };

  // Calcular porcentaje de recuperación
  const calcularPorcentajeRecuperacion = (prestamo) => {
    if (!prestamo.montoPrestado) return 0;
    const capitalRecuperado = prestamo.montoPrestado - (prestamo.capitalRestante || 0);
    return (capitalRecuperado / prestamo.montoPrestado) * 100;
  };

  const filteredPrestamos = prestamos.filter(prestamo =>
    prestamo.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestamo.id?.includes(searchTerm) ||
    getCedulaCliente(prestamo)?.includes(searchTerm)
  );

  // Calcular intereses según frecuencia
  const calcularInteresQuincenal = (prestamo) => {
    return (prestamo.capitalRestante * prestamo.interesPercent) / 100;
  };

  const calcularInteresMensual = (prestamo) => {
    const interesQuincenal = calcularInteresQuincenal(prestamo);
    return interesQuincenal * 2;
  };

  const calcularCapitalMasIntereses = (prestamo) => {
    return prestamo.capitalRestante + calcularInteresQuincenal(prestamo);
  };

  // Calcular ROI aproximado del préstamo
  const calcularROI = (prestamo) => {
    const interesGenerado = calcularInteresTotalGenerado(prestamo);
    const capitalInvertido = prestamo.montoPrestado;
    if (!capitalInvertido) return 0;
    return (interesGenerado / capitalInvertido) * 100;
  };

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

  const handleRegistrarPago = (prestamo) => {
    setSelectedPrestamo(prestamo);
    setViewMode('pago');
  };

  const handleEnviarWhatsApp = (prestamo) => {
    const cliente = clientes.find(c => c.id === prestamo.clienteID);
    if (!cliente || !cliente.celular) {
      alert('No se encontró el número de teléfono del cliente');
      return;
    }

    const interesQuincenal = calcularInteresQuincenal(prestamo);
    const porcentajeRecuperacion = calcularPorcentajeRecuperacion(prestamo);
    
    const mensaje = `Hola ${prestamo.clienteNombre}, le recordamos que tiene un pago pendiente de RD$ ${interesQuincenal.toLocaleString()} correspondiente a los intereses de su préstamo. 

📊 Resumen de su préstamo:
• Capital restante: RD$ ${prestamo.capitalRestante?.toLocaleString()}
• Progreso: ${porcentajeRecuperacion.toFixed(1)}% pagado
• Próximo pago: ${calcularProximoPago(prestamo)}

¡Gracias por su puntualidad! 🎯
- EYS Inversiones`;
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=1${cliente.celular.replace(/\D/g, '')}&text=${mensajeCodificado}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPrestamo(null);
    setEditingPrestamo(null);
    fetchPrestamos();
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
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-2 ${estado.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {estado.text}
      </span>
    );
  };

  const calcularProximoPago = (prestamo) => {
    if (!prestamo.fechaUltimoPago) {
      return prestamo.fechaProximoPago ? 
        firebaseTimestampToLocalString(prestamo.fechaProximoPago) : 
        'No definido';
    }
    
    const ultimaFecha = prestamo.fechaUltimoPago instanceof Date ? prestamo.fechaUltimoPago : new Date(prestamo.fechaUltimoPago);
    let proximaFecha = new Date(ultimaFecha);
    
    switch (prestamo.frecuencia) {
      case 'diario':
        proximaFecha.setDate(proximaFecha.getDate() + 1);
        break;
      case 'semanal':
        proximaFecha.setDate(proximaFecha.getDate() + 7);
        break;
      case 'quincenal':
        proximaFecha.setDate(proximaFecha.getDate() + 15);
        break;
      case 'mensual':
        proximaFecha.setMonth(proximaFecha.getMonth() + 1);
        break;
    }
    
    return proximaFecha.toLocaleDateString();
  };

  // Obtener cédula del cliente
  const getCedulaCliente = (prestamo) => {
    const cliente = clientes.find(c => c.id === prestamo.clienteID);
    return cliente?.cedula || 'N/A';
  };

  // Obtener información de contacto del cliente
  const getContactoCliente = (prestamo) => {
    const cliente = clientes.find(c => c.id === prestamo.clienteID);
    return {
      celular: cliente?.celular || 'N/A',
      trabajo: cliente?.trabajo || 'N/A'
    };
  };

  // Determinar prioridad del préstamo (para toma de decisiones)
  const getPrioridadPrestamo = (prestamo) => {
    const porcentajeRecuperacion = calcularPorcentajeRecuperacion(prestamo);
    const diasDesdeUltimoPago = prestamo.fechaUltimoPago ? 
      Math.floor((new Date() - new Date(prestamo.fechaUltimoPago)) / (1000 * 60 * 60 * 24)) : 30;
    
    if (porcentajeRecuperacion > 80) return 'alta';
    if (diasDesdeUltimoPago > 15) return 'media';
    return 'baja';
  };

  // Render different views
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
        onRegistrarPago={() => handleRegistrarPago(selectedPrestamo)}
        onEnviarWhatsApp={handleEnviarWhatsApp}
      />
    );
  }

  if (viewMode === 'pago' && selectedPrestamo) {
    return (
      <RegistrarPago
        prestamo={selectedPrestamo}
        onClose={handleBackToList}
        onPagoRegistrado={handleBackToList}
      />
    );
  }

  if (loading) {
    return <PrestamosSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Mejorado */}
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
                  Préstamos
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Dashboard completo para toma de decisiones
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className={`p-3 rounded-lg transition-all ${
                  showSearch
                    ? 'bg-red-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Buscar préstamos"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreatePrestamo}
                className="p-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                title="Nuevo préstamo"
              >
                <PlusIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mensaje de error */}
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
      </AnimatePresence>

      {/* Filtros Avanzados */}
      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
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
                    placeholder="Buscar por cliente, cédula o ID..."
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

      {/* Stats Summary MEJORADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Quick Actions Bar */}
      <GlassCard>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium mr-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Acciones rápidas:
            </span>
            <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Todos ({stats.totalPrestamos})
            </button>
            <button className="px-3 py-1 bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs hover:bg-green-300 dark:hover:bg-green-800/50 transition-colors">
              Activos ({stats.prestamosActivos})
            </button>
            <button className="px-3 py-1 bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs hover:bg-red-300 dark:hover:bg-red-800/50 transition-colors">
              Morosos ({stats.prestamosMorosos})
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Prestamos Table MEJORADA */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                {['Cliente / Contacto', 'Inversión', 'Progreso', 'Rentabilidad', 'Próximo Pago', 'Estado', 'Acciones'].map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
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
                {filteredPrestamos.map((prestamo) => {
                  const contacto = getContactoCliente(prestamo);
                  const porcentajeRecuperacion = calcularPorcentajeRecuperacion(prestamo);
                  const roi = calcularROI(prestamo);
                  const prioridad = getPrioridadPrestamo(prestamo);
                  
                  return (
                    <motion.tr
                      key={prestamo.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onHoverStart={() => setHoveredRow(prestamo.id)}
                      onHoverEnd={() => setHoveredRow(null)}
                      className={`cursor-pointer transition-all duration-300 ${
                        hoveredRow === prestamo.id
                          ? theme === 'dark'
                            ? 'bg-gray-700/50'
                            : 'bg-gray-100'
                          : ''
                      } ${
                        prioridad === 'alta' 
                          ? theme === 'dark'
                            ? 'bg-green-900/20'
                            : 'bg-green-50'
                          : prioridad === 'media'
                          ? theme === 'dark'
                            ? 'bg-yellow-900/20'
                            : 'bg-yellow-50'
                          : ''
                      }`}
                      onClick={() => handleViewPrestamo(prestamo)}
                    >
                      <td className="px-4 py-4">
                        <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {prestamo.clienteNombre}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getCedulaCliente(prestamo)}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1 flex items-center`}>
                          <span className="mr-2">📞</span> {contacto.celular}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          RD$ {prestamo.montoPrestado?.toLocaleString()}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Restante: RD$ {prestamo.capitalRestante?.toLocaleString()}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {prestamo.frecuencia} • {prestamo.interesPercent}%
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(porcentajeRecuperacion, 100)}%` }}
                              transition={{ duration: 1 }}
                              className={`h-full rounded-full ${
                                porcentajeRecuperacion > 66 
                                  ? 'bg-green-600' 
                                  : porcentajeRecuperacion > 33 
                                  ? 'bg-yellow-600' 
                                  : 'bg-red-600'
                              }`}
                            />
                          </div>
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {porcentajeRecuperacion.toFixed(1)}%
                          </span>
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          RD$ {(prestamo.montoPrestado - prestamo.capitalRestante).toLocaleString()} pagado
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {roi.toFixed(1)}% ROI
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          RD$ {calcularInteresTotalGenerado(prestamo).toLocaleString()}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Quincena: RD$ {calcularInteresQuincenal(prestamo).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {calcularProximoPago(prestamo)}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {prestamo.frecuencia}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getEstadoBadge(prestamo)}
                        {prioridad === 'alta' && (
                          <div className="flex items-center mt-1 text-xs text-green-600 dark:text-green-400">
                            <BellAlertIcon className="h-3 w-3 mr-1" />
                            Alta prioridad
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnviarWhatsApp(prestamo);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'hover:bg-gray-700 text-green-400'
                                : 'hover:bg-green-50 text-green-600'
                            }`}
                            title="Enviar recordatorio WhatsApp"
                          >
                            <ChatBubbleLeftIcon className="h-4 w-4" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPrestamo(prestamo);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'hover:bg-gray-700 text-blue-400'
                                : 'hover:bg-blue-50 text-blue-600'
                            }`}
                            title="Ver análisis detallado"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </motion.button>
                          
                          {prestamo.estado === 'activo' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRegistrarPago(prestamo);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-gray-700 text-green-400'
                                  : 'hover:bg-green-50 text-green-600'
                              }`}
                              title="Registrar pago"
                            >
                              <CurrencyDollarIcon className="h-4 w-4" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPrestamo(prestamo);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'hover:bg-gray-700 text-yellow-400'
                                : 'hover:bg-yellow-50 text-yellow-600'
                            }`}
                            title="Editar préstamo"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </motion.button>
                          
                          {prestamo.estado === 'activo' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePrestamo(prestamo.id);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-gray-700 text-red-400'
                                  : 'hover:bg-red-50 text-red-600'
                              }`}
                              title="Eliminar préstamo"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredPrestamos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>📊</div>
              <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {searchTerm ? 'No se encontraron préstamos' : 'No hay préstamos registrados'}
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreatePrestamo}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Crear Primer Préstamo</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Resumen Ejecutivo MEJORADO */}
      {filteredPrestamos.length > 0 && (
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg">
                <RocketLaunchIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Resumen Ejecutivo
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Préstamos de Alta Prioridad
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {filteredPrestamos.filter(p => getPrioridadPrestamo(p) === 'alta').length}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Requieren atención inmediata
                </p>
              </div>

              <div className={`p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Interés Quincenal Total
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  RD$ {filteredPrestamos.reduce((sum, p) => sum + calcularInteresQuincenal(p), 0).toLocaleString()}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Próximo período
                </p>
              </div>

              <div className={`p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  ROI Promedio
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
        </GlassCard>
      )}
    </div>
  );
};

export default Prestamos;