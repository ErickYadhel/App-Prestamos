import React, { useState, useEffect } from 'react';
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
  UserIcon,
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
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import SolicitudForm from '../components/Solicitudes/SolicitudForm';
import SolicitudDetails from '../components/Solicitudes/SolicitudDetails';
import AprobarSolicitudModal from '../components/Solicitudes/AprobarSolicitudModal';
import { normalizeFirebaseData, firebaseTimestampToLocalString } from '../utils/firebaseUtils';

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFrecuencia, setFiltroFrecuencia] = useState('todos');
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);
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

  const handleFiltrosChange = (newFiltros) => {
    setFiltrosAvanzados(newFiltros);
  };

  const aplicarFiltros = () => {
    fetchSolicitudes();
    setShowFiltrosAvanzados(false);
  };

  const limpiarFiltros = () => {
    setFiltrosAvanzados({
      fechaDesde: '',
      fechaHasta: '',
      montoMin: '',
      montoMax: ''
    });
    setFiltroEstado('todos');
    setFiltroFrecuencia('todos');
    setSearchTerm('');
    fetchSolicitudes();
  };

  const getEstadoBadge = (solicitud) => {
    if (!solicitud) return null;

    const estados = {
      pendiente: { 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
        icon: ClockIcon, 
        text: 'Pendiente' 
      },
      aprobada: { 
        color: 'bg-green-100 text-green-800 border border-green-200', 
        icon: CheckCircleIcon, 
        text: 'Aprobada' 
      },
      rechazada: { 
        color: 'bg-red-100 text-red-800 border border-red-200', 
        icon: XCircleIcon, 
        text: 'Rechazada' 
      }
    };

    const estado = estados[solicitud.estado] || estados.pendiente;
    const Icon = estado.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {estado.text}
      </span>
    );
  };

  const getScoreColor = (score) => {
    const safeScore = Number(score) || 50;
    if (safeScore >= 80) return 'text-green-600 bg-green-50';
    if (safeScore >= 60) return 'text-yellow-600 bg-yellow-50';
    if (safeScore >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getRecomendacion = (solicitud) => {
    if (!solicitud) return { texto: 'SIN DATOS', color: 'text-gray-700 bg-gray-100' };
    
    const score = Number(solicitud.scoreAnalisis) || 50;
    
    if (score >= 80) return { texto: 'ALTA PRIORIDAD', color: 'text-green-700 bg-green-100' };
    if (score >= 70) return { texto: 'RECOMENDADA', color: 'text-blue-700 bg-blue-100' };
    if (score >= 50) return { texto: 'EVALUAR', color: 'text-yellow-700 bg-yellow-100' };
    if (score >= 30) return { texto: 'PRECAUCIÓN', color: 'text-orange-700 bg-orange-100' };
    return { texto: 'NO RECOMENDADA', color: 'text-red-700 bg-red-100' };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Préstamos</h1>
          <p className="text-gray-600">Sistema de evaluación y aprobación de solicitudes</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportarSolicitudes}
            className="btn-secondary flex items-center space-x-2"
            disabled={filteredSolicitudes.length === 0}
          >
            <DocumentChartBarIcon className="h-5 w-5" />
            <span>Exportar</span>
          </button>
          <button
            onClick={handleCreateSolicitud}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      {/* Stats Summary MEJORADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">
                {stats.pendientes} pendientes
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Monto Solicitado</p>
              <p className="text-xl font-bold text-gray-900">
                RD$ {safeToLocaleString(stats.montoTotalSolicitado)}
              </p>
              <p className="text-xs text-gray-500">
                RD$ {safeToLocaleString(stats.montoTotalAprobado)} aprobado
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tasa de Aprobación</p>
              <p className="text-xl font-bold text-gray-900">
                {Number(stats.tasaAprobacion).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                {stats.aprobadas} aprobadas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Estado Portfolio</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.aprobadas} / {stats.total}
              </p>
              <p className="text-xs text-gray-500">
                {stats.rechazadas} rechazadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda MEJORADO */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por cliente, teléfono, cédula, empleado o lugar de trabajo..."
                className="input-primary pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input-primary"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
            <select
              value={filtroFrecuencia}
              onChange={(e) => setFiltroFrecuencia(e.target.value)}
              className="input-primary"
            >
              <option value="todos">Todas las frecuencias</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
              <option value="semanal">Semanal</option>
              <option value="diario">Diario</option>
            </select>
            <button
              onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Filtros Avanzados */}
        {showFiltrosAvanzados && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filtrosAvanzados.fechaDesde}
                  onChange={(e) => handleFiltrosChange({...filtrosAvanzados, fechaDesde: e.target.value})}
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filtrosAvanzados.fechaHasta}
                  onChange={(e) => handleFiltrosChange({...filtrosAvanzados, fechaHasta: e.target.value})}
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Mínimo
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filtrosAvanzados.montoMin}
                  onChange={(e) => handleFiltrosChange({...filtrosAvanzados, montoMin: e.target.value})}
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Máximo
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  value={filtrosAvanzados.montoMax}
                  onChange={(e) => handleFiltrosChange({...filtrosAvanzados, montoMax: e.target.value})}
                  className="input-primary"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={limpiarFiltros}
                className="btn-secondary"
              >
                Limpiar Filtros
              </button>
              <button
                onClick={aplicarFiltros}
                className="btn-primary"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Solicitudes MEJORADA */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Cargando solicitudes...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente / Información
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitud
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Análisis de Riesgo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado / Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSolicitudes.map((solicitud) => {
                    if (!solicitud) return null;
                    
                    const recomendacion = getRecomendacion(solicitud);
                    const ratioSueldo = solicitud.sueldoCliente ? (Number(solicitud.montoSolicitado) / Number(solicitud.sueldoCliente)) : 0;
                    
                    return (
                      <tr key={solicitud.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {solicitud.clienteNombre || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            📞 {solicitud.telefono || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {solicitud.cedula || 'Sin cédula'} • {solicitud.email || 'Sin email'}
                          </div>
                          {solicitud.lugarTrabajo && (
                            <div className="text-xs text-gray-500 mt-1">
                              💼 {solicitud.lugarTrabajo}
                              {solicitud.puestoCliente && ` (${solicitud.puestoCliente})`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            RD$ {safeToLocaleString(solicitud.montoSolicitado)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {solicitud.plazoMeses === 0 ? 'Sin plazo' : `${solicitud.plazoMeses} meses`} • {solicitud.frecuencia || 'N/A'}
                          </div>
                          {solicitud.sueldoCliente && (
                            <div className="text-xs text-gray-500">
                              Sueldo: RD$ {safeToLocaleString(solicitud.sueldoCliente)} 
                              {ratioSueldo > 0 && ` (${ratioSueldo.toFixed(1)}x)`}
                            </div>
                          )}
                          {solicitud.bancoCliente && (
                            <div className="text-xs text-blue-600 mt-1">
                              🏦 {solicitud.bancoCliente}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="text-sm font-medium text-gray-700">
                              Score: 
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(solicitud.scoreAnalisis)}`}>
                              {Number(solicitud.scoreAnalisis) || 50}
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${recomendacion.color}`}>
                            {recomendacion.texto}
                          </div>
                          {solicitud.documentosUrl && solicitud.documentosUrl.length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              📎 {solicitud.documentosUrl.length} documento(s)
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {solicitud.empleadoNombre || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {safeFirebaseTimestamp(solicitud.fechaSolicitud)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getEstadoBadge(solicitud)}
                          {solicitud.fechaDecision && (
                            <div className="text-xs text-gray-500 mt-1">
                              {safeFirebaseTimestamp(solicitud.fechaDecision)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <button
                              onClick={() => handleViewSolicitud(solicitud)}
                              className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                              title="Ver análisis completo"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            
                            {solicitud.estado === 'pendiente' && (
                              <>
                                <button
                                  onClick={() => handleAprobarSolicitud(solicitud)}
                                  className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                                  title="Aprobar solicitud"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRechazarSolicitud(solicitud.id)}
                                  className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                                  title="Rechazar solicitud"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            
                            {solicitud.estado === 'pendiente' && (
                              <button
                                onClick={() => handleEditSolicitud(solicitud)}
                                className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded hover:bg-yellow-50"
                                title="Editar solicitud"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredSolicitudes.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 text-lg mb-2">
                  {searchTerm || filtroEstado !== 'todos' || filtroFrecuencia !== 'todos'
                    ? 'No se encontraron solicitudes' 
                    : 'No hay solicitudes registradas'
                  }
                </div>
                {!searchTerm && filtroEstado === 'todos' && filtroFrecuencia === 'todos' && (
                  <button
                    onClick={handleCreateSolicitud}
                    className="btn-primary mt-4"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Crear Primera Solicitud
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel de Estadísticas Avanzadas */}
      {estadisticasAvanzadas && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Estadísticas Avanzadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Distribución por Estado</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Aprobadas:</span>
                  <span className="font-semibold text-green-600">{estadisticasAvanzadas.porEstado?.aprobadas || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pendientes:</span>
                  <span className="font-semibold text-yellow-600">{estadisticasAvanzadas.porEstado?.pendientes || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rechazadas:</span>
                  <span className="font-semibold text-red-600">{estadisticasAvanzadas.porEstado?.rechazadas || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Análisis de Montos</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Solicitado:</span>
                  <span className="font-semibold">RD$ {safeToLocaleString(estadisticasAvanzadas.montoTotalSolicitado)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Aprobado:</span>
                  <span className="font-semibold text-green-600">RD$ {safeToLocaleString(estadisticasAvanzadas.montoTotalAprobado)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Score Promedio:</span>
                  <span className="font-semibold">{Number(estadisticasAvanzadas.scorePromedio || 0).toFixed(1)}/100</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preferencia de Frecuencia</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quincenal:</span>
                  <span className="font-semibold">{estadisticasAvanzadas.porFrecuencia?.quincenal || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mensual:</span>
                  <span className="font-semibold">{estadisticasAvanzadas.porFrecuencia?.mensual || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Semanal:</span>
                  <span className="font-semibold">{estadisticasAvanzadas.porFrecuencia?.semanal || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Diario:</span>
                  <span className="font-semibold">{estadisticasAvanzadas.porFrecuencia?.diario || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen General</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Solicitudes:</span>
                  <span className="font-semibold">{estadisticasAvanzadas.total || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tasa Aprobación:</span>
                  <span className="font-semibold text-green-600">
                    {estadisticasAvanzadas.total > 0 
                      ? ((estadisticasAvanzadas.porEstado?.aprobadas || 0) / estadisticasAvanzadas.total * 100).toFixed(1) 
                      : '0'
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para aprobar solicitud */}
      {solicitudParaAprobar && (
        <AprobarSolicitudModal
          solicitud={solicitudParaAprobar}
          onClose={() => setSolicitudParaAprobar(null)}
          onAprobado={handleBackToList}
          onError={setError}
        />
      )}
    </div>
  );
};

export default Solicitudes;