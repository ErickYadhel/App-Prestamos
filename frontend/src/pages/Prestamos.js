import React, { useState, useEffect } from 'react';
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
  BanknotesIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import PrestamoForm from '../components/Prestamos/PrestamoForm';
import PrestamoDetails from '../components/Prestamos/PrestamoDetails';
import RegistrarPago from '../components/Prestamos/RegistrarPago';
import { normalizeFirebaseData, firebaseTimestampToLocalString } from '../utils/firebaseUtils';

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [editingPrestamo, setEditingPrestamo] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPrestamos: 0,
    totalCapitalPrestado: 0,
    totalCapitalRecuperado: 0,
    totalInteresGenerado: 0,
    prestamosActivos: 0,
    prestamosCompletados: 0,
    prestamosMorosos: 0
  });

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
      activo: { color: 'bg-green-100 text-green-800 border border-green-200', icon: CheckCircleIcon, text: 'Activo' },
      completado: { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: CheckCircleIcon, text: 'Completado' },
      moroso: { color: 'bg-red-100 text-red-800 border border-red-200', icon: ExclamationTriangleIcon, text: 'Moroso' },
      pendiente: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: ClockIcon, text: 'Pendiente' }
    };

    const estado = estados[prestamo.estado] || estados.activo;
    const Icon = estado.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-600">Dashboard completo para toma de decisiones</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 p-3 rounded-lg transition-colors"
            title="Buscar préstamos"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleCreatePrestamo}
            className="btn-primary flex items-center space-x-2 p-3"
            title="Nuevo préstamo"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-white rounded-lg shadow-sm p-4 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente, cédula o ID..."
              className="input-primary pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => setShowSearch(false)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary MEJORADO - MÁS INFORMACIÓN PARA DECISIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Capital Invertido</p>
              <p className="text-xl font-bold text-gray-900">
                RD$ {stats.totalCapitalPrestado.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{stats.totalPrestamos} préstamos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Interés Generado</p>
              <p className="text-xl font-bold text-gray-900">
                RD$ {stats.totalInteresGenerado.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                ROI: {stats.totalCapitalPrestado > 0 ? ((stats.totalInteresGenerado / stats.totalCapitalPrestado) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <DocumentChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Estado Portfolio</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.prestamosActivos} activos
              </p>
              <p className="text-xs text-gray-500">
                {stats.prestamosCompletados} completados • {stats.prestamosMorosos} morosos
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Recuperación</p>
              <p className="text-xl font-bold text-gray-900">
                RD$ {stats.totalCapitalRecuperado.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {stats.totalCapitalPrestado > 0 ? ((stats.totalCapitalRecuperado / stats.totalCapitalPrestado) * 100).toFixed(1) : 0}% recuperado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Acciones rápidas:</span>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
          >
            Todos ({stats.totalPrestamos})
          </button>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-full"
          >
            Activos ({stats.prestamosActivos})
          </button>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full"
          >
            Morosos ({stats.prestamosMorosos})
          </button>
        </div>
      </div>

      {/* Prestamos Table MEJORADA CON MÁS INFORMACIÓN */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600">Cargando préstamos...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente / Contacto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inversión
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progreso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rentabilidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Próximo Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPrestamos.map((prestamo) => {
                    const contacto = getContactoCliente(prestamo);
                    const porcentajeRecuperacion = calcularPorcentajeRecuperacion(prestamo);
                    const roi = calcularROI(prestamo);
                    const prioridad = getPrioridadPrestamo(prestamo);
                    
                    return (
                      <tr key={prestamo.id} className={`hover:bg-gray-50 ${
                        prioridad === 'alta' ? 'bg-green-50' : 
                        prioridad === 'media' ? 'bg-yellow-50' : ''
                      }`}>
                        <td className="px-4 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {prestamo.clienteNombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getCedulaCliente(prestamo)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            📞 {contacto.celular}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            RD$ {prestamo.montoPrestado?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Restante: RD$ {prestamo.capitalRestante?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {prestamo.frecuencia} • {prestamo.interesPercent}%
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(porcentajeRecuperacion, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {porcentajeRecuperacion.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            RD$ {(prestamo.montoPrestado - prestamo.capitalRestante).toLocaleString()} pagado
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {roi.toFixed(1)}% ROI
                          </div>
                          <div className="text-xs text-gray-500">
                            RD$ {calcularInteresTotalGenerado(prestamo).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Quincena: RD$ {calcularInteresQuincenal(prestamo).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {calcularProximoPago(prestamo)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {prestamo.frecuencia}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {getEstadoBadge(prestamo)}
                          {prioridad === 'alta' && (
                            <div className="text-xs text-green-600 mt-1">🔄 Alta prioridad</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <button
                              onClick={() => handleEnviarWhatsApp(prestamo)}
                              className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                              title="Enviar recordatorio WhatsApp"
                            >
                              <ChatBubbleLeftIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleViewPrestamo(prestamo)}
                              className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                              title="Ver análisis detallado"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {prestamo.estado === 'activo' && (
                              <button
                                onClick={() => handleRegistrarPago(prestamo)}
                                className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                                title="Registrar pago"
                              >
                                <CurrencyDollarIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditPrestamo(prestamo)}
                              className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded hover:bg-yellow-50"
                              title="Editar préstamo"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            {prestamo.estado === 'activo' && (
                              <button
                                onClick={() => handleDeletePrestamo(prestamo.id)}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                                title="Eliminar préstamo"
                              >
                                <TrashIcon className="h-4 w-4" />
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

            {filteredPrestamos.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  {searchTerm ? 'No se encontraron préstamos' : 'No hay préstamos registrados'}
                </div>
                {!searchTerm && (
                  <button
                    onClick={handleCreatePrestamo}
                    className="btn-primary mt-4"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Crear Primer Préstamo
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Resumen Ejecutivo para Toma de Decisiones */}
      {filteredPrestamos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Resumen Ejecutivo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Préstamos de Alta Prioridad:</p>
              <p className="text-green-600">
                {filteredPrestamos.filter(p => getPrioridadPrestamo(p) === 'alta').length} préstamos
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Interés Quincenal Total:</p>
              <p className="text-blue-600">
                RD$ {filteredPrestamos.reduce((sum, p) => sum + calcularInteresQuincenal(p), 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">ROI Promedio:</p>
              <p className="text-purple-600">
                {filteredPrestamos.length > 0 ? 
                  (filteredPrestamos.reduce((sum, p) => sum + calcularROI(p), 0) / filteredPrestamos.length).toFixed(1) : 0
                }%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prestamos;