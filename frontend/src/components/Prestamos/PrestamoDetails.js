import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { 
  firebaseTimestampToLocalString, 
  firebaseTimestampToDate,
  normalizeFirebaseData 
} from '../../utils/firebaseUtils';

const PrestamoDetails = ({ prestamo, clientes, onBack, onEdit, onRegistrarPago, onEnviarWhatsApp }) => {
  const [pagos, setPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [errorPagos, setErrorPagos] = useState(null);

  // Normalizar el préstamo para asegurar que las fechas sean Dates de JavaScript
  const prestamoNormalizado = normalizeFirebaseData(prestamo);

  useEffect(() => {
    fetchPagos();
  }, [prestamoNormalizado.id]);

  const fetchPagos = async () => {
    try {
      setLoadingPagos(true);
      setErrorPagos(null);
      const response = await api.get(`/pagos/prestamo/${prestamoNormalizado.id}`);
      
      // Normalizar los datos de Firebase
      const pagosNormalizados = (response.data || []).map(pago =>
        normalizeFirebaseData(pago)
      );
      
      setPagos(pagosNormalizados);
    } catch (error) {
      console.error('Error fetching pagos:', error);
      setErrorPagos(error);
      
      if (error.code === 'NETWORK_ERROR' || error.code === 'SERVER_UNREACHABLE') {
        alert('❌ No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en el puerto 5001.');
      } else {
        alert(`❌ Error al cargar los pagos: ${error.message}`);
      }
    } finally {
      setLoadingPagos(false);
    }
  };

  const calcularInteresActual = () => {
    return (prestamoNormalizado.capitalRestante * prestamoNormalizado.interesPercent) / 100;
  };

  const calcularInteresMensual = () => {
    const interesQuincenal = calcularInteresActual();
    // Aproximación: 2 quincenas = 1 mes
    return interesQuincenal * 2;
  };

  const calcularCapitalMasIntereses = () => {
    return prestamoNormalizado.capitalRestante + calcularInteresActual();
  };

  const getFrecuenciaTexto = (frecuencia) => {
    const frecuencias = {
      diario: 'Diario',
      semanal: 'Semanal', 
      quincenal: 'Quincenal (15 días)',
      mensual: 'Mensual'
    };
    return frecuencias[frecuencia] || frecuencia;
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      activo: { color: 'text-green-600 bg-green-50 border-green-200', text: 'Activo' },
      completado: { color: 'text-blue-600 bg-blue-50 border-blue-200', text: 'Completado' },
      moroso: { color: 'text-red-600 bg-red-50 border-red-200', text: 'En Mora' },
      pendiente: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', text: 'Pendiente' }
    };
    return estados[estado] || estados.activo;
  };

  const estadoInfo = getEstadoInfo(prestamoNormalizado.estado);
  const interesActual = calcularInteresActual();
  const interesMensual = calcularInteresMensual();
  const capitalMasIntereses = calcularCapitalMasIntereses();

  const InfoCard = ({ title, value, subtitle, icon: Icon, color = 'text-gray-600' }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${color.replace('text', 'bg')} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  // Obtener cédula del cliente
  const getCedulaCliente = () => {
    const cliente = clientes.find(c => c.id === prestamoNormalizado.clienteID);
    return cliente?.cedula || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalles del Préstamo</h1>
            <p className="text-gray-600">Información completa del préstamo #{prestamoNormalizado.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onEnviarWhatsApp(prestamoNormalizado)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span>Enviar WhatsApp</span>
          </button>
          <button
            onClick={onRegistrarPago}
            className="btn-primary flex items-center space-x-2"
          >
            <CurrencyDollarIcon className="h-4 w-4" />
            <span>Registrar Pago</span>
          </button>
          <button
            onClick={onEdit}
            className="btn-secondary flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumen del Préstamo MEJORADO */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Resumen del Préstamo - Sistema EYS</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InfoCard
                  title="Capital Prestado"
                  value={`RD$ ${prestamoNormalizado.montoPrestado?.toLocaleString()}`}
                  icon={CurrencyDollarIcon}
                  color="text-green-600"
                />
                <InfoCard
                  title="Capital Restante"
                  value={`RD$ ${prestamoNormalizado.capitalRestante?.toLocaleString()}`}
                  subtitle={`Pagado: RD$ ${(prestamoNormalizado.montoPrestado - prestamoNormalizado.capitalRestante).toLocaleString()}`}
                  icon={CurrencyDollarIcon}
                  color="text-blue-600"
                />
                <InfoCard
                  title="Interés Quincenal"
                  value={`RD$ ${interesActual.toLocaleString()}`}
                  subtitle={`${prestamoNormalizado.interesPercent}% sobre capital`}
                  icon={DocumentTextIcon}
                  color="text-yellow-600"
                />
                <InfoCard
                  title="Interés Mensual"
                  value={`RD$ ${interesMensual.toLocaleString()}`}
                  subtitle="Aprox. 2 quincenas"
                  icon={CalendarIcon}
                  color="text-purple-600"
                />
                <InfoCard
                  title="Capital + Intereses"
                  value={`RD$ ${capitalMasIntereses.toLocaleString()}`}
                  subtitle="Total actual adeudado"
                  icon={CurrencyDollarIcon}
                  color="text-red-600"
                />
                <InfoCard
                  title="Próximo Pago"
                  value={prestamoNormalizado.fechaProximoPago ? 
                    firebaseTimestampToLocalString(prestamoNormalizado.fechaProximoPago) : 
                    'No definido'}
                  subtitle={getFrecuenciaTexto(prestamoNormalizado.frecuencia)}
                  icon={ClockIcon}
                  color="text-indigo-600"
                />
              </div>

              {/* Barra de Progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso del pago</span>
                  <span>{Math.round(((prestamoNormalizado.montoPrestado - prestamoNormalizado.capitalRestante) / prestamoNormalizado.montoPrestado) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((prestamoNormalizado.montoPrestado - prestamoNormalizado.capitalRestante) / prestamoNormalizado.montoPrestado) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Pagos */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Historial de Pagos</h3>
            </div>
            <div className="p-6">
              {loadingPagos ? (
                <div className="text-center py-4">
                  <div className="text-gray-500">Cargando pagos...</div>
                </div>
              ) : errorPagos ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-3">
                    ❌ Error al cargar los pagos
                  </div>
                  <button
                    onClick={fetchPagos}
                    className="btn-primary"
                  >
                    Reintentar
                  </button>
                </div>
              ) : pagos.length > 0 ? (
                <div className="space-y-3">
                  {pagos.map((pago) => (
                    <div key={pago.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          pago.modoManual ? 'bg-purple-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {pago.fechaPago ? firebaseTimestampToLocalString(pago.fechaPago) : 'Fecha no disponible'}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="capitalize">{pago.tipoPago || 'normal'}</span>
                            {pago.modoManual && (
                              <span className="bg-purple-100 text-purple-800 px-1 rounded">Manual</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          RD$ {((pago.montoCapital || 0) + (pago.montoInteres || 0)).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Capital: RD$ {(pago.montoCapital || 0).toLocaleString()} | Interés: RD$ {(pago.montoInteres || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No hay pagos registrados</p>
                  <button
                    onClick={onRegistrarPago}
                    className="btn-primary mt-3"
                  >
                    Registrar Primer Pago
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Estado</h3>
            </div>
            <div className="p-6">
              <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${estadoInfo.color}`}>
                <span className="text-sm font-medium">{estadoInfo.text}</span>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{prestamoNormalizado.clienteNombre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cédula:</span>
                  <span className="font-medium">{getCedulaCliente()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frecuencia:</span>
                  <span className="font-medium capitalize">{prestamoNormalizado.frecuencia}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fecha préstamo:</span>
                  <span className="font-medium">
                    {prestamoNormalizado.fechaPrestamo ? 
                      firebaseTimestampToLocalString(prestamoNormalizado.fechaPrestamo) : 
                      'No disponible'}
                  </span>
                </div>
                {prestamoNormalizado.fechaUltimoPago && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Último pago:</span>
                    <span className="font-medium">
                      {firebaseTimestampToLocalString(prestamoNormalizado.fechaUltimoPago)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={onRegistrarPago}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>Registrar Pago</span>
              </button>
              <button
                onClick={() => onEnviarWhatsApp(prestamoNormalizado)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Enviar WhatsApp</span>
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                <DocumentTextIcon className="h-4 w-4" />
                <span>Generar Reporte</span>
              </button>
            </div>
          </div>

          {/* Información del Sistema EYS */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Sistema EYS - Recordatorio</h4>
            <p className="text-xs text-blue-700 mb-2">
              {/* 
                ⚠️ MENSAGE DE WHATSAPP PERSONALIZABLE:
                Puedes editar este mensaje cambiando el texto entre las comillas.
                Ejemplo: "Hola {nombre}, recordatorio de pago..."
              */}
              El mensaje de WhatsApp incluye: Saludo, monto de interés, capital restante y fecha próximo pago.
            </p>
            <button
              onClick={() => onEnviarWhatsApp(prestamoNormalizado)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
            >
              Probar Mensaje
            </button>
          </div>

          {/* Información Técnica */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Información Técnica</h4>
            <div className="text-xs text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>ID Préstamo:</span>
                <span className="font-mono text-xs">{prestamoNormalizado.id}</span>
              </div>
              <div className="flex justify-between">
                <span>ID Cliente:</span>
                <span className="font-mono text-xs">{prestamoNormalizado.clienteID}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="capitalize">{prestamoNormalizado.estado}</span>
              </div>
              <div className="flex justify-between">
                <span>Modo Pago:</span>
                <span>Automático/Manual</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestamoDetails;