import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  ChartBarIcon,
  BanknotesIcon,
  XMarkIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import RegistrarPagoModal from '../components/Pagos/RegistrarPagoModal';
import DetallesPago from '../components/Pagos/DetallesPago';
import { normalizeFirebaseData, firebaseTimestampToLocalString } from '../utils/firebaseUtils';

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
  const [stats, setStats] = useState({
    totalPagos: 0,
    totalRecaudado: 0,
    totalCapital: 0,
    totalInteres: 0,
    pagosHoy: 0,
    pagosEsteMes: 0
  });

  useEffect(() => {
    fetchPagos();
    fetchPrestamosActivos();
  }, []);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Primero intentamos con la API real
      try {
        const response = await api.get('/pagos');
        if (response.success) {
          const pagosNormalizados = (response.data || []).map(pago => 
            normalizeFirebaseData(pago)
          );
          setPagos(pagosNormalizados);
          calcularEstadisticas(pagosNormalizados);
          return;
        }
      } catch (apiError) {
        console.log('Usando datos de ejemplo - API no disponible');
      }

      // Fallback a datos de ejemplo
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
      // Primero intentamos con la API real
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

      // Fallback a datos de ejemplo
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

  const calcularEstadisticas = (pagosData) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    const totalPagos = pagosData.length;
    const totalRecaudado = pagosData.reduce((sum, p) => sum + (p.montoTotal || 0), 0);
    const totalCapital = pagosData.reduce((sum, p) => sum + (p.montoCapital || 0), 0);
    const totalInteres = pagosData.reduce((sum, p) => sum + (p.montoInteres || 0), 0);
    
    const pagosHoy = pagosData.filter(pago => {
      const fechaPago = pago.fechaPago instanceof Date ? pago.fechaPago : new Date(pago.fechaPago);
      return fechaPago.toDateString() === hoy.toDateString();
    }).length;

    const pagosEsteMes = pagosData.filter(pago => {
      const fechaPago = pago.fechaPago instanceof Date ? pago.fechaPago : new Date(pago.fechaPago);
      return fechaPago >= inicioMes;
    }).length;

    setStats({
      totalPagos,
      totalRecaudado,
      totalCapital,
      totalInteres,
      pagosHoy,
      pagosEsteMes
    });
  };

  const filteredPagos = pagos.filter(pago => {
    const matchSearch = 
      pago.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.prestamoID?.includes(searchTerm) ||
      pago.tipoPago?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filtroEstado === 'todos' || pago.tipoPago === filtroEstado;
    const matchPrestamo = selectedPrestamo === 'todos' || pago.prestamoID === selectedPrestamo;

    return matchSearch && matchEstado && matchPrestamo;
  });

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
  };

  const handleViewDetails = (pago) => {
    setSelectedPago(pago);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPago(null);
  };

  const getTipoPagoBadge = (tipoPago) => {
    const tipos = {
      normal: { color: 'bg-green-100 text-green-800 border border-green-200', text: 'Normal' },
      adelantado: { color: 'bg-blue-100 text-blue-800 border border-blue-200', text: 'Adelantado' },
      mora: { color: 'bg-red-100 text-red-800 border border-red-200', text: 'Con Mora' },
      abono: { color: 'bg-purple-100 text-purple-800 border border-purple-200', text: 'Abono Capital' }
    };

    const tipo = tipos[tipoPago] || tipos.normal;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipo.color}`}>
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

  if (viewMode === 'details' && selectedPago) {
    return (
      <DetallesPago
        pago={selectedPago}
        prestamoInfo={getPrestamoInfo(selectedPago)}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-gray-600">Registro y seguimiento de todos los pagos</p>
        </div>
        <button
          onClick={handleRegistrarPago}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Registrar Pago</span>
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Stats Summary MEJORADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Recaudado</p>
              <p className="text-xl font-bold text-gray-900">
                RD$ {stats.totalRecaudado.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Composición</p>
              <p className="text-sm font-bold text-gray-900">
                Capital: RD$ {stats.totalCapital.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Interés: RD$ {stats.totalInteres.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pagos Hoy</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.pagosHoy}
              </p>
              <p className="text-xs text-gray-500">
                {stats.pagosEsteMes} este mes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <ReceiptRefundIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Pagos</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalPagos}
              </p>
              <p className="text-xs text-gray-500">
                Registrados en sistema
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
                placeholder="Buscar por cliente, ID de préstamo o tipo..."
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
              <option value="todos">Todos los tipos</option>
              <option value="normal">Normal</option>
              <option value="adelantado">Adelantado</option>
              <option value="mora">Mora</option>
              <option value="abono">Abono</option>
            </select>
            <select
              value={selectedPrestamo}
              onChange={(e) => setSelectedPrestamo(e.target.value)}
              className="input-primary"
            >
              <option value="todos">Todos los préstamos</option>
              {prestamos.map(prestamo => (
                <option key={prestamo.id} value={prestamo.id}>
                  {prestamo.clienteNombre} - {prestamo.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pagos MEJORADA */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600">Cargando pagos...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente / Préstamo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distribución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPagos.map((pago) => {
                    const prestamoInfo = getPrestamoInfo(pago);
                    return (
                      <tr key={pago.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {pago.clienteNombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            Préstamo: {pago.prestamoID}
                          </div>
                          {prestamoInfo && (
                            <div className="text-xs text-gray-400">
                              {prestamoInfo.frecuencia} • {prestamoInfo.interesPercent}%
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            RD$ {(pago.montoTotal || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            Capital: RD$ {(pago.montoCapital || 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Interés: RD$ {(pago.montoInteres || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {firebaseTimestampToLocalString(pago.fechaPago)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {pago.fechaPago && new Date(pago.fechaPago).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getTipoPagoBadge(pago.tipoPago)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(pago)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                            title="Ver detalles completos"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredPagos.length === 0 && (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 text-lg mb-2">
                  {searchTerm || filtroEstado !== 'todos' || selectedPrestamo !== 'todos'
                    ? 'No se encontraron pagos' 
                    : 'No hay pagos registrados'
                  }
                </div>
                {!searchTerm && filtroEstado === 'todos' && selectedPrestamo === 'todos' && (
                  <button
                    onClick={handleRegistrarPago}
                    className="btn-primary mt-4"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Registrar Primer Pago
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Información sobre el Sistema de Pagos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Sistema Automático de Cálculos</h4>
            <p className="text-sm text-blue-700 mt-1">
              El sistema calcula automáticamente la distribución de los pagos: primero se cubren los intereses 
              basados en el capital restante, y el resto se aplica al capital. Esto asegura que los cálculos 
              sean precisos y consistentes.
            </p>
          </div>
        </div>
      </div>

      {/* Modal para registrar pago */}
      {showModal && (
        <RegistrarPagoModal
          prestamos={prestamos}
          onClose={() => setShowModal(false)}
          onPagoRegistrado={handlePagoRegistrado}
        />
      )}
    </div>
  );
};

export default Pagos;