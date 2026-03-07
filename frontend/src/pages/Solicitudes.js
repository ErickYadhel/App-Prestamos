import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import SolicitudForm from '../components/Solicitudes/SolicitudForm';
import SolicitudDetails from '../components/Solicitudes/SolicitudDetails';
import AprobarSolicitudModal from '../components/Solicitudes/AprobarSolicitudModal';
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
const SolicitudesSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-64 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-80 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className="flex space-x-3">
          <div className={`h-10 w-24 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-10 w-36 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
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
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    orange: 'from-orange-600 to-orange-800',
    red: 'from-red-600 to-red-800',
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha Desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => onFilterChange('fechaDesde', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => onFilterChange('fechaHasta', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Monto Mínimo
              </label>
              <input
                type="number"
                placeholder="0"
                value={filtros.montoMin}
                onChange={(e) => onFilterChange('montoMin', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Monto Máximo
              </label>
              <input
                type="number"
                placeholder="100000"
                value={filtros.montoMax}
                onChange={(e) => onFilterChange('montoMax', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
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
// COMPONENTE DE TARJETA DE ESTADÍSTICA AVANZADA
// ============================================
const StatCard = ({ title, children }) => {
  const { theme } = useTheme();
  
  return (
    <GlassCard>
      <div className="p-4">
        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {title}
        </h4>
        {children}
      </div>
    </GlassCard>
  );
};

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFrecuencia, setFiltroFrecuencia] = useState('todos');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    fechaDesde: '',
    fechaHasta: '',
    montoMin: '',
    montoMax: ''
  });
  const [viewMode, setViewMode] = useState('list');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [editingSolicitud, setEditingSolicitud] = useState(null);
  const [solicitudParaAprobar, setSolicitudParaAprobar] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    montoTotalSolicitado: 0,
    montoTotalAprobado: 0,
    tasaAprobacion: 0
  });
  const [estadisticasAvanzadas, setEstadisticasAvanzadas] = useState(null);
  const [bancos, setBancos] = useState([]);

  const { theme } = useTheme();

  // Función segura para formatear números
  const safeToLocaleString = (value, defaultValue = '0') => {
    if (value === null || value === undefined || isNaN(value)) {
      return defaultValue;
    }
    try {
      return Number(value).toLocaleString();
    } catch (error) {
      console.error('Error formatting number:', error);
      return defaultValue;
    }
  };

  // Función segura para formatear fechas
  const safeFirebaseTimestamp = (timestamp, defaultValue = 'N/A') => {
    if (!timestamp) return defaultValue;
    try {
      return firebaseTimestampToLocalString(timestamp);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return defaultValue;
    }
  };

  useEffect(() => {
    fetchSolicitudes();
    fetchEstadisticasAvanzadas();
    fetchBancos();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Construir query parameters para filtros
      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
      if (filtrosAvanzados.fechaDesde) params.append('fechaDesde', filtrosAvanzados.fechaDesde);
      if (filtrosAvanzados.fechaHasta) params.append('fechaHasta', filtrosAvanzados.fechaHasta);
      if (filtrosAvanzados.montoMin) params.append('montoMin', filtrosAvanzados.montoMin);
      if (filtrosAvanzados.montoMax) params.append('montoMax', filtrosAvanzados.montoMax);

      const response = await api.get(`/solicitudes?${params}`);
      
      if (response.success) {
        const solicitudesNormalizadas = (response.data || []).map(solicitud => 
          normalizeFirebaseData(solicitud)
        );
        setSolicitudes(solicitudesNormalizadas);
        calcularEstadisticas(solicitudesNormalizadas);
      } else {
        throw new Error(response.error || 'Error al cargar solicitudes');
      }
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
      setError(error.message);
      // Datos de ejemplo para desarrollo
      const mockData = getMockSolicitudes();
      setSolicitudes(mockData);
      calcularEstadisticas(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getMockSolicitudes = () => {
    return [
      {
        id: '1',
        clienteNombre: 'Juan Pérez García',
        cedula: '001-1234567-8',
        telefono: '809-123-4567',
        email: 'juan@email.com',
        montoSolicitado: 50000,
        plazoMeses: 0,
        frecuencia: 'quincenal',
        bancoCliente: 'Banco Popular Dominicano',
        tipoCuenta: 'ahorro',
        cuentaCliente: '123-456789-1',
        lugarTrabajo: 'Empresa XYZ, S.A.',
        puestoCliente: 'Gerente de Ventas',
        sueldoCliente: 45000,
        direccion: 'Calle Principal #123, Sector Norte',
        provincia: 'Santo Domingo',
        estado: 'pendiente',
        fechaSolicitud: new Date('2024-01-15'),
        scoreAnalisis: 85,
        empleadoNombre: 'Carlos Rodríguez',
        observaciones: 'Cliente con buen historial crediticio'
      },
      {
        id: '2',
        clienteNombre: 'María Rodríguez Santos',
        cedula: '002-7654321-9',
        telefono: '809-987-6543',
        email: 'maria@email.com',
        montoSolicitado: 25000,
        plazoMeses: 0,
        frecuencia: 'mensual',
        bancoCliente: 'Banco de Reservas',
        tipoCuenta: 'corriente',
        cuentaCliente: '456-123456-2',
        lugarTrabajo: 'Comerciante Independiente',
        puestoCliente: 'Dueña de Negocio',
        sueldoCliente: 30000,
        direccion: 'Av. Independencia #456',
        provincia: 'Distrito Nacional',
        estado: 'pendiente',
        fechaSolicitud: new Date('2024-01-14'),
        scoreAnalisis: 72,
        empleadoNombre: 'Ana Martínez',
        observaciones: 'Emprendedora con negocio estable'
      }
    ];
  };

  const calcularEstadisticas = (solicitudesList) => {
    const total = solicitudesList.length || 0;
    const pendientes = solicitudesList.filter(s => s.estado === 'pendiente').length || 0;
    const aprobadas = solicitudesList.filter(s => s.estado === 'aprobada').length || 0;
    const rechazadas = solicitudesList.filter(s => s.estado === 'rechazada').length || 0;
    
    const montoTotalSolicitado = (solicitudesList || []).reduce((sum, s) => sum + (Number(s.montoSolicitado) || 0), 0);
    const montoTotalAprobado = (solicitudesList || [])
      .filter(s => s.estado === 'aprobada')
      .reduce((sum, s) => sum + (Number(s.montoAprobado) || Number(s.montoSolicitado) || 0), 0);
    
    const tasaAprobacion = total > 0 ? (aprobadas / total) * 100 : 0;

    setStats({
      total,
      pendientes,
      aprobadas,
      rechazadas,
      montoTotalSolicitado,
      montoTotalAprobado,
      tasaAprobacion
    });
  };

  const fetchEstadisticasAvanzadas = async () => {
    try {
      const response = await api.get('/solicitudes/estadisticas/avanzadas');
      if (response.success) {
        setEstadisticasAvanzadas(response.data);
      }
    } catch (error) {
      console.error('Error fetching estadísticas avanzadas:', error);
      // Datos mock para desarrollo
      setEstadisticasAvanzadas({
        total: 15,
        porEstado: {
          pendientes: 8,
          aprobadas: 5,
          rechazadas: 2
        },
        montoTotalSolicitado: 450000,
        montoTotalAprobado: 280000,
        scorePromedio: 75,
        porFrecuencia: {
          diario: 1,
          semanal: 3,
          quincenal: 8,
          mensual: 3
        }
      });
    }
  };

  const fetchBancos = async () => {
    try {
      const response = await api.get('/solicitudes/bancos');
      if (response.success) {
        setBancos(response.data);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      // Bancos por defecto
      setBancos([
        'Banco de Reservas',
        'Banco Popular Dominicano',
        'Scotiabank',
        'Banco BHD León',
        'Banco Santa Cruz'
      ]);
    }
  };

  const filteredSolicitudes = (solicitudes || []).filter(solicitud => {
    if (!solicitud) return false;

    const matchesSearch = 
      (solicitud.clienteNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (solicitud.telefono || '').includes(searchTerm) ||
      (solicitud.cedula || '').includes(searchTerm) ||
      (solicitud.empleadoNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (solicitud.lugarTrabajo || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = filtroEstado === 'todos' || solicitud.estado === filtroEstado;
    const matchesFrecuencia = filtroFrecuencia === 'todos' || solicitud.frecuencia === filtroFrecuencia;

    // Filtros avanzados
    const montoSolicitado = Number(solicitud.montoSolicitado) || 0;
    const matchesMonto = 
      (!filtrosAvanzados.montoMin || montoSolicitado >= parseFloat(filtrosAvanzados.montoMin)) &&
      (!filtrosAvanzados.montoMax || montoSolicitado <= parseFloat(filtrosAvanzados.montoMax));

    const fechaSolicitud = solicitud.fechaSolicitud ? new Date(solicitud.fechaSolicitud) : null;
    const matchesFecha = 
      (!filtrosAvanzados.fechaDesde || (fechaSolicitud && fechaSolicitud >= new Date(filtrosAvanzados.fechaDesde))) &&
      (!filtrosAvanzados.fechaHasta || (fechaSolicitud && fechaSolicitud <= new Date(filtrosAvanzados.fechaHasta)));

    return matchesSearch && matchesEstado && matchesFrecuencia && matchesMonto && matchesFecha;
  });

  const handleCreateSolicitud = () => {
    setEditingSolicitud(null);
    setViewMode('form');
  };

  const handleEditSolicitud = (solicitud) => {
    setEditingSolicitud(solicitud);
    setViewMode('form');
  };

  const handleViewSolicitud = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setViewMode('details');
  };

  const handleAprobarSolicitud = (solicitud) => {
    setSolicitudParaAprobar(solicitud);
  };

  const handleRechazarSolicitud = async (solicitudId, observaciones = '') => {
    if (!observaciones.trim()) {
      observaciones = prompt('Ingrese el motivo del rechazo:');
      if (observaciones === null) return; // Usuario canceló
      if (!observaciones.trim()) {
        alert('Debe ingresar un motivo para rechazar la solicitud');
        return;
      }
    }

    try {
      setError('');
      const response = await api.put(`/solicitudes/${solicitudId}/rechazar`, {
        aprobadoPor: 'admin',
        observaciones: observaciones
      });

      if (response.success) {
        setSuccess('Solicitud rechazada exitosamente');
        
        // Mostrar enlace de WhatsApp para informar al cliente
        const solicitud = solicitudes.find(s => s.id === solicitudId);
        if (solicitud && response.notificaciones) {
          setTimeout(() => {
            if (window.confirm('¿Desea abrir WhatsApp para informar al cliente sobre el rechazo?')) {
              window.open(response.notificaciones.whatsappCliente, '_blank');
            }
          }, 1000);
        }

        setTimeout(() => setSuccess(''), 5000);
        fetchSolicitudes();
        fetchEstadisticasAvanzadas();
      } else {
        throw new Error(response.error || 'Error al rechazar la solicitud');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      setError(error.message);
      
      // En caso de error, actualizar localmente para desarrollo
      const updatedSolicitudes = solicitudes.map(s =>
        s.id === solicitudId 
          ? { 
              ...s, 
              estado: 'rechazada',
              aprobadoPor: 'Administrador',
              fechaDecision: new Date(),
              observaciones: observaciones
            }
          : s
      );
      setSolicitudes(updatedSolicitudes);
      calcularEstadisticas(updatedSolicitudes);
      setSuccess('Solicitud rechazada (modo desarrollo)');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSolicitud(null);
    setEditingSolicitud(null);
    setSolicitudParaAprobar(null);
    fetchSolicitudes();
    fetchEstadisticasAvanzadas();
  };

  const handleSaveSolicitud = async (solicitudData) => {
    try {
      setError('');
      let response;

      if (editingSolicitud) {
        response = await api.put(`/solicitudes/${editingSolicitud.id}`, solicitudData);
      } else {
        response = await api.post('/solicitudes', solicitudData);
      }

      if (response.success) {
        const message = editingSolicitud ? 'Solicitud actualizada exitosamente' : 'Solicitud creada exitosamente';
        setSuccess(message);
        
        // Mostrar enlaces de notificación para nuevas solicitudes
        if (!editingSolicitud && response.notificaciones) {
          setTimeout(() => {
            if (window.confirm('¿Desea abrir WhatsApp para notificar al administrador?')) {
              window.open(response.notificaciones.whatsapp, '_blank');
            }
          }, 1000);
        }

        setTimeout(() => setSuccess(''), 5000);
        handleBackToList();
      } else {
        throw new Error(response.error || `Error al ${editingSolicitud ? 'actualizar' : 'crear'} la solicitud`);
      }
    } catch (error) {
      console.error('Error saving application:', error);
      setError(error.message);
      
      // En caso de error, actualizar localmente para desarrollo
      if (editingSolicitud) {
        const updatedSolicitudes = solicitudes.map(s =>
          s.id === editingSolicitud.id 
            ? { ...solicitudData, id: editingSolicitud.id, fechaSolicitud: editingSolicitud.fechaSolicitud }
            : s
        );
        setSolicitudes(updatedSolicitudes);
        calcularEstadisticas(updatedSolicitudes);
      } else {
        const newSolicitud = {
          ...solicitudData,
          id: Date.now().toString(),
          fechaSolicitud: new Date(),
          estado: 'pendiente',
          scoreAnalisis: Math.floor(Math.random() * 30) + 70
        };
        const updatedSolicitudes = [newSolicitud, ...solicitudes];
        setSolicitudes(updatedSolicitudes);
        calcularEstadisticas(updatedSolicitudes);
      }
      
      setSuccess(editingSolicitud ? 'Solicitud actualizada (modo desarrollo)' : 'Solicitud creada (modo desarrollo)');
      setTimeout(() => setSuccess(''), 3000);
      handleBackToList();
    }
  };

  const handleFiltrosChange = (key, value) => {
    if (key === 'reset') {
      setFiltrosAvanzados({
        fechaDesde: '',
        fechaHasta: '',
        montoMin: '',
        montoMax: ''
      });
      setFiltroEstado('todos');
      setFiltroFrecuencia('todos');
      setSearchTerm('');
    } else {
      setFiltrosAvanzados(prev => ({ ...prev, [key]: value }));
    }
  };

  const getEstadoBadge = (solicitud) => {
    if (!solicitud) return null;

    const estados = {
      pendiente: { 
        color: theme === 'dark' 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon, 
        text: 'Pendiente' 
      },
      aprobada: { 
        color: theme === 'dark' 
          ? 'bg-green-900/30 text-green-400 border-green-700' 
          : 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon, 
        text: 'Aprobada' 
      },
      rechazada: { 
        color: theme === 'dark' 
          ? 'bg-red-900/30 text-red-400 border-red-700' 
          : 'bg-red-100 text-red-800 border-red-200',
        icon: XCircleIcon, 
        text: 'Rechazada' 
      }
    };

    const estado = estados[solicitud.estado] || estados.pendiente;
    const Icon = estado.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-2 ${estado.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {estado.text}
      </span>
    );
  };

  const getScoreColor = (score) => {
    const safeScore = Number(score) || 50;
    if (safeScore >= 80) return theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50';
    if (safeScore >= 60) return theme === 'dark' ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-50';
    if (safeScore >= 40) return theme === 'dark' ? 'text-orange-400 bg-orange-900/30' : 'text-orange-600 bg-orange-50';
    return theme === 'dark' ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50';
  };

  const getRecomendacion = (solicitud) => {
    if (!solicitud) return { texto: 'SIN DATOS', color: theme === 'dark' ? 'text-gray-400 bg-gray-800' : 'text-gray-700 bg-gray-100' };
    
    const score = Number(solicitud.scoreAnalisis) || 50;
    
    if (score >= 80) return { texto: 'ALTA PRIORIDAD', color: theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-100' };
    if (score >= 70) return { texto: 'RECOMENDADA', color: theme === 'dark' ? 'text-blue-400 bg-blue-900/30' : 'text-blue-700 bg-blue-100' };
    if (score >= 50) return { texto: 'EVALUAR', color: theme === 'dark' ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-700 bg-yellow-100' };
    if (score >= 30) return { texto: 'PRECAUCIÓN', color: theme === 'dark' ? 'text-orange-400 bg-orange-900/30' : 'text-orange-700 bg-orange-100' };
    return { texto: 'NO RECOMENDADA', color: theme === 'dark' ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-100' };
  };

  const exportarSolicitudes = () => {
    if (filteredSolicitudes.length === 0) return;

    const data = filteredSolicitudes.map(s => ({
      'Cliente': s?.clienteNombre || 'N/A',
      'Teléfono': s?.telefono || 'N/A',
      'Cédula': s?.cedula || 'N/A',
      'Monto Solicitado': Number(s?.montoSolicitado) || 0,
      'Frecuencia': s?.frecuencia || 'N/A',
      'Estado': s?.estado || 'N/A',
      'Score': Number(s?.scoreAnalisis) || 0,
      'Empleado': s?.empleadoNombre || 'N/A',
      'Fecha Solicitud': safeFirebaseTimestamp(s?.fechaSolicitud)
    }));

    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solicitudes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  // Render different views
  if (viewMode === 'form') {
    return (
      <SolicitudForm
        solicitud={editingSolicitud}
        onSave={handleSaveSolicitud}
        onCancel={handleBackToList}
        error={error}
        bancos={bancos}
      />
    );
  }

  if (viewMode === 'details' && selectedSolicitud) {
    return (
      <SolicitudDetails
        solicitud={selectedSolicitud}
        onBack={handleBackToList}
        onEdit={() => handleEditSolicitud(selectedSolicitud)}
        onAprobar={handleAprobarSolicitud}
        onRechazar={handleRechazarSolicitud}
        bancos={bancos}
      />
    );
  }

  if (loading) {
    return <SolicitudesSkeleton />;
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
                  Solicitudes de Préstamos
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sistema de evaluación y aprobación de solicitudes
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
                title="Buscar solicitudes"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportarSolicitudes}
                disabled={filteredSolicitudes.length === 0}
                className={`p-3 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
                title="Exportar"
              >
                <DocumentChartBarIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateSolicitud}
                className="p-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                title="Nueva solicitud"
              >
                <PlusIcon className="h-5 w-5" />
              </motion.button>
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
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <p className="text-sm">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros Avanzados */}
      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filtros={filtrosAvanzados}
            onFilterChange={handleFiltrosChange}
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
                    placeholder="Buscar por cliente, teléfono, cédula, empleado o lugar de trabajo..."
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
          icon={DocumentTextIcon}
          label="Total Solicitudes"
          value={stats.total}
          subValue={`${stats.pendientes} pendientes`}
          gradient="blue"
        />
        
        <StatsCard
          icon={BanknotesIcon}
          label="Monto Solicitado"
          value={`RD$ ${safeToLocaleString(stats.montoTotalSolicitado)}`}
          subValue={`RD$ ${safeToLocaleString(stats.montoTotalAprobado)} aprobado`}
          gradient="green"
        />

        <StatsCard
          icon={ChartBarIcon}
          label="Tasa de Aprobación"
          value={`${Number(stats.tasaAprobacion).toFixed(1)}%`}
          subValue={`${stats.aprobadas} aprobadas`}
          gradient="purple"
        />

        <StatsCard
          icon={ArrowTrendingUpIcon}
          label="Estado Portfolio"
          value={`${stats.aprobadas} / ${stats.total}`}
          subValue={`${stats.rechazadas} rechazadas`}
          gradient="orange"
        />
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
              onClick={() => setFiltroEstado('pendiente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'pendiente'
                  ? 'bg-yellow-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltroEstado('aprobada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'aprobada'
                  ? 'bg-green-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Aprobadas
            </button>
            <button
              onClick={() => setFiltroEstado('rechazada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'rechazada'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Rechazadas
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Frecuencia:
            </span>
            <button
              onClick={() => setFiltroFrecuencia('todos')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'todos'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroFrecuencia('diario')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'diario'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setFiltroFrecuencia('semanal')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'semanal'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setFiltroFrecuencia('quincenal')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'quincenal'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Quincenal
            </button>
            <button
              onClick={() => setFiltroFrecuencia('mensual')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'mensual'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mensual
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Lista de Solicitudes MEJORADA */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                {['Cliente / Información', 'Solicitud', 'Análisis de Riesgo', 'Empleado / Fecha', 'Estado', 'Acciones'].map((header, index) => (
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
                {filteredSolicitudes.map((solicitud) => {
                  if (!solicitud) return null;
                  
                  const recomendacion = getRecomendacion(solicitud);
                  const ratioSueldo = solicitud.sueldoCliente ? (Number(solicitud.montoSolicitado) / Number(solicitud.sueldoCliente)) : 0;
                  const isHovered = hoveredRow === solicitud.id;
                  
                  return (
                    <motion.tr
                      key={solicitud.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onHoverStart={() => setHoveredRow(solicitud.id)}
                      onHoverEnd={() => setHoveredRow(null)}
                      className={`cursor-pointer transition-all duration-300 ${
                        isHovered
                          ? theme === 'dark'
                            ? 'bg-gray-700/50'
                            : 'bg-gray-100'
                          : ''
                      }`}
                      onClick={() => handleViewSolicitud(solicitud)}
                    >
                      <td className="px-6 py-4">
                        <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {solicitud.clienteNombre || 'N/A'}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            {solicitud.telefono || 'N/A'}
                          </span>
                          <span className={`text-xs flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            {solicitud.email || 'Sin email'}
                          </span>
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          {solicitud.cedula || 'Sin cédula'}
                        </div>
                        {solicitud.lugarTrabajo && (
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-2 flex items-center`}>
                            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                            {solicitud.lugarTrabajo}
                            {solicitud.puestoCliente && ` (${solicitud.puestoCliente})`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          RD$ {safeToLocaleString(solicitud.montoSolicitado)}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {solicitud.plazoMeses === 0 ? 'Sin plazo' : `${solicitud.plazoMeses} meses`} • {solicitud.frecuencia || 'N/A'}
                        </div>
                        {solicitud.sueldoCliente && (
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                            Sueldo: RD$ {safeToLocaleString(solicitud.sueldoCliente)} 
                            {ratioSueldo > 0 && ` (${ratioSueldo.toFixed(1)}x)`}
                          </div>
                        )}
                        {solicitud.bancoCliente && (
                          <div className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mt-2 flex items-center`}>
                            🏦 {solicitud.bancoCliente}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Score:
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(solicitud.scoreAnalisis)}`}>
                            {Number(solicitud.scoreAnalisis) || 50}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${recomendacion.color}`}>
                          {recomendacion.texto}
                        </div>
                        {solicitud.documentosUrl && solicitud.documentosUrl.length > 0 && (
                          <div className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mt-2 flex items-center`}>
                            <DocumentTextIcon className="h-3 w-3 mr-1" />
                            {solicitud.documentosUrl.length} documento(s)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {solicitud.empleadoNombre || 'N/A'}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1 flex items-center`}>
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {safeFirebaseTimestamp(solicitud.fechaSolicitud)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getEstadoBadge(solicitud)}
                        {solicitud.fechaDecision && (
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                            {safeFirebaseTimestamp(solicitud.fechaDecision)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSolicitud(solicitud);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'hover:bg-gray-700 text-blue-400'
                                : 'hover:bg-blue-50 text-blue-600'
                            }`}
                            title="Ver análisis completo"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </motion.button>
                          
                          {solicitud.estado === 'pendiente' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAprobarSolicitud(solicitud);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark'
                                    ? 'hover:bg-gray-700 text-green-400'
                                    : 'hover:bg-green-50 text-green-600'
                                }`}
                                title="Aprobar solicitud"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRechazarSolicitud(solicitud.id);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark'
                                    ? 'hover:bg-gray-700 text-red-400'
                                    : 'hover:bg-red-50 text-red-600'
                                }`}
                                title="Rechazar solicitud"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSolicitud(solicitud);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark'
                                    ? 'hover:bg-gray-700 text-yellow-400'
                                    : 'hover:bg-yellow-50 text-yellow-600'
                                }`}
                                title="Editar solicitud"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredSolicitudes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>📋</div>
              <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {searchTerm || filtroEstado !== 'todos' || filtroFrecuencia !== 'todos'
                  ? 'No se encontraron solicitudes' 
                  : 'No hay solicitudes registradas'
                }
              </p>
              {!searchTerm && filtroEstado === 'todos' && filtroFrecuencia === 'todos' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateSolicitud}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Crear Primera Solicitud</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Panel de Estadísticas Avanzadas */}
      {estadisticasAvanzadas && (
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Estadísticas Avanzadas
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Distribución por Estado">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Aprobadas:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      {estadisticasAvanzadas.porEstado?.aprobadas || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Pendientes:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {estadisticasAvanzadas.porEstado?.pendientes || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Rechazadas:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      {estadisticasAvanzadas.porEstado?.rechazadas || 0}
                    </span>
                  </div>
                </div>
              </StatCard>
              
              <StatCard title="Análisis de Montos">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Total Solicitado:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      RD$ {safeToLocaleString(estadisticasAvanzadas.montoTotalSolicitado)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Total Aprobado:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      RD$ {safeToLocaleString(estadisticasAvanzadas.montoTotalAprobado)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Score Promedio:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {Number(estadisticasAvanzadas.scorePromedio || 0).toFixed(1)}/100
                    </span>
                  </div>
                </div>
              </StatCard>
              
              <StatCard title="Preferencia de Frecuencia">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Quincenal:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticasAvanzadas.porFrecuencia?.quincenal || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Mensual:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticasAvanzadas.porFrecuencia?.mensual || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Semanal:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticasAvanzadas.porFrecuencia?.semanal || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Diario:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticasAvanzadas.porFrecuencia?.diario || 0}
                    </span>
                  </div>
                </div>
              </StatCard>
              
              <StatCard title="Resumen General">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Total:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticasAvanzadas.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Tasa Aprobación:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      {estadisticasAvanzadas.total > 0 
                        ? ((estadisticasAvanzadas.porEstado?.aprobadas || 0) / estadisticasAvanzadas.total * 100).toFixed(1) 
                        : '0'}%
                    </span>
                  </div>
                </div>
              </StatCard>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Modal para aprobar solicitud */}
      <AnimatePresence>
        {solicitudParaAprobar && (
          <AprobarSolicitudModal
            solicitud={solicitudParaAprobar}
            onClose={() => setSolicitudParaAprobar(null)}
            onAprobado={handleBackToList}
            onError={setError}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Solicitudes;