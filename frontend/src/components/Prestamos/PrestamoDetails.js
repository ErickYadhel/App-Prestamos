import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  firebaseTimestampToLocalString, 
  firebaseTimestampToDate,
  normalizeFirebaseData,
  formatFecha,
  firebaseTimestampToLocalDateTimeString
} from '../../utils/firebaseUtils';
import { 
  calcularPagosAtrasados,
  calcularMora,
  getConfiguracionMora,
  calcularDiasTranscurridos,
  getDescripcionFrecuencia,
  generarFechasPago
} from '../../utils/loanCalculations';

const PrestamoDetails = ({ prestamo, clientes, onBack, onEdit, onRegistrarPago, onEnviarWhatsApp, onPagoRegistrado }) => {
  const { theme } = useTheme();
  const [pagos, setPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [errorPagos, setErrorPagos] = useState(null);
  const [informacionMora, setInformacionMora] = useState(null);
  const [proximasFechas, setProximasFechas] = useState([]);
  const [prestamoActual, setPrestamoActual] = useState(null);

  const prestamoNormalizado = normalizeFirebaseData(prestamo);
  const configMora = getConfiguracionMora();

  useEffect(() => {
    if (prestamoNormalizado.id) {
      setPrestamoActual(prestamoNormalizado);
      fetchPagos();
      calcularInformacionMora();
      generarProximasFechas();
    }
  }, [prestamoNormalizado.id]);

  useEffect(() => {
    if (prestamoActual) {
      calcularInformacionMora();
      generarProximasFechas();
    }
  }, [prestamoActual]);

  const fetchPagos = async () => {
    try {
      setLoadingPagos(true);
      setErrorPagos(null);
      const response = await api.get(`/pagos/prestamo/${prestamoNormalizado.id}`);
      
      let pagosData = [];
      
      if (response.data?.pagos) {
        pagosData = response.data.pagos;
      } else if (Array.isArray(response.data)) {
        pagosData = response.data;
      } else if (response.data?.data?.pagos) {
        pagosData = response.data.data.pagos;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        pagosData = response.data.data;
      }
      
      const pagosNormalizados = pagosData.map(pago => normalizeFirebaseData(pago));
      
      pagosNormalizados.sort((a, b) => {
        const fechaA = a.fechaPago ? new Date(a.fechaPago) : new Date(0);
        const fechaB = b.fechaPago ? new Date(b.fechaPago) : new Date(0);
        return fechaB - fechaA;
      });
      
      setPagos(pagosNormalizados);
      
    } catch (error) {
      console.error('❌ Error fetching pagos:', error);
      setErrorPagos(error);
    } finally {
      setLoadingPagos(false);
    }
  };

  const actualizarPrestamo = async () => {
    try {
      const response = await api.get(`/prestamos/${prestamoNormalizado.id}`);
      if (response.success && response.data) {
        const prestamoActualizado = normalizeFirebaseData(response.data);
        setPrestamoActual(prestamoActualizado);
        
        if (onPagoRegistrado) {
          onPagoRegistrado(prestamoActualizado);
        }
      }
    } catch (error) {
      console.error('Error actualizando préstamo:', error);
    }
  };

  const generarProximasFechas = () => {
    if (prestamoActual) {
      const fechas = generarFechasPago(prestamoActual, 4);
      setProximasFechas(fechas);
    }
  };

  const calcularInformacionMora = () => {
    if (!prestamoActual) return;
    
    const hoy = new Date();
    const fechaEsperada = prestamoActual.fechaProximoPago 
      ? new Date(prestamoActual.fechaProximoPago) 
      : null;
    
    if (fechaEsperada && fechaEsperada < hoy) {
      const diasAtraso = Math.ceil((hoy - fechaEsperada) / (1000 * 60 * 60 * 24));
      const interesDiario = (prestamoActual.capitalRestante * prestamoActual.interesPercent) / 100 / 30;
      const moraCalculada = interesDiario * diasAtraso * (configMora.porcentaje / 100);
      
      setInformacionMora({
        tieneMora: diasAtraso > configMora.diasGracia,
        diasAtraso,
        moraCalculada,
        montoAdeudado: interesDiario * diasAtraso
      });
    } else {
      setInformacionMora(null);
    }
  };

  const handleRegistrarPagoClick = () => {
    if (onRegistrarPago) {
      onRegistrarPago(prestamoActual || prestamoNormalizado, actualizarPrestamo);
    }
  };

  const handlePagoCompletado = async (datosPago) => {
    await actualizarPrestamo();
    await fetchPagos();
    calcularInformacionMora();
    generarProximasFechas();
  };

  const calcularInteresActual = () => {
    if (!prestamoActual) return 0;
    return (prestamoActual.capitalRestante * prestamoActual.interesPercent) / 100;
  };

  const calcularInteresDiario = () => {
    return calcularInteresActual() / 30;
  };

  const getFrecuenciaTexto = () => {
    if (!prestamoActual) return '';
    const config = {
      diaPago: prestamoActual.diaPagoPersonalizado,
      diaSemana: prestamoActual.diaSemana,
      fechasPersonalizadas: prestamoActual.fechasPersonalizadas
    };
    return getDescripcionFrecuencia(prestamoActual.frecuencia, config);
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      activo: { color: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800', text: 'Activo', icon: ShieldCheckIcon },
      completado: { color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800', text: 'Completado', icon: CheckCircleIcon },
      moroso: { color: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800', text: 'En Mora', icon: ExclamationTriangleIcon },
      pendiente: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-800', text: 'Pendiente', icon: ClockIcon }
    };
    return estados[estado] || estados.activo;
  };

  const estadoInfo = prestamoActual ? getEstadoInfo(prestamoActual.estado) : getEstadoInfo('activo');
  const EstadoIcon = estadoInfo.icon;
  const interesActual = calcularInteresActual();
  const interesDiario = calcularInteresDiario();

  const InfoCard = ({ title, value, subtitle, icon: Icon, color = 'text-gray-600' }) => (
    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${color.replace('text', 'bg')} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {subtitle && <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const getCedulaCliente = () => {
    const cliente = clientes.find(c => c.id === prestamoNormalizado.clienteID);
    return cliente?.cedula || 'N/A';
  };

  const formatPagoFecha = (fechaPago) => {
    if (!fechaPago) return 'Fecha no disponible';
    return formatFecha(fechaPago, true);
  };

  if (!prestamoActual && prestamoNormalizado) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className={`ml-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cargando detalles...</span>
      </div>
    );
  }

  const prestamoData = prestamoActual || prestamoNormalizado;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Detalles del Préstamo</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Información completa del préstamo #{prestamoData.id?.slice(-6)}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onEnviarWhatsApp(prestamoData)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span>Enviar WhatsApp</span>
          </button>
          <button
            onClick={handleRegistrarPagoClick}
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <CurrencyDollarIcon className="h-4 w-4" />
            <span>Registrar Pago</span>
          </button>
          <button
            onClick={onEdit}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {informacionMora && informacionMora.tieneMora && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Préstamo con Atraso</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    El préstamo tiene {informacionMora.diasAtraso} días de atraso.
                    {configMora.enabled && (
                      <span> Mora calculada: RD$ {informacionMora.moraCalculada.toLocaleString()}</span>
                    )}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Monto adeudado: RD$ {informacionMora.montoAdeudado.toLocaleString()}
                  </p>
                  <button
                    onClick={handleRegistrarPagoClick}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Registrar Pago y Regularizar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`shadow rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Resumen del Préstamo</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InfoCard
                  title="Capital Prestado"
                  value={`RD$ ${prestamoData.montoPrestado?.toLocaleString()}`}
                  icon={CurrencyDollarIcon}
                  color="text-green-600"
                />
                <InfoCard
                  title="Capital Restante"
                  value={`RD$ ${prestamoData.capitalRestante?.toLocaleString()}`}
                  subtitle={`Pagado: RD$ ${(prestamoData.montoPrestado - prestamoData.capitalRestante).toLocaleString()}`}
                  icon={CurrencyDollarIcon}
                  color="text-blue-600"
                />
                <InfoCard
                  title="Interés Diario"
                  value={`RD$ ${interesDiario.toLocaleString()}`}
                  subtitle={`${(interesDiario * 30).toLocaleString()} mensual`}
                  icon={ArrowTrendingUpIcon}
                  color="text-yellow-600"
                />
                <InfoCard
                  title="Frecuencia de Pago"
                  value={getFrecuenciaTexto()}
                  icon={CalendarIcon}
                  color="text-purple-600"
                />
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}">
                  <span>Progreso del pago</span>
                  <span>{Math.round(((prestamoData.montoPrestado - prestamoData.capitalRestante) / prestamoData.montoPrestado) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((prestamoData.montoPrestado - prestamoData.capitalRestante) / prestamoData.montoPrestado) * 100}%` }}
                  ></div>
                </div>
              </div>

              {proximasFechas.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Próximas fechas de pago:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {proximasFechas.map((fecha, index) => (
                      <span key={index} className={`px-2 py-1 rounded-lg text-xs border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-blue-400 border-gray-600' 
                          : 'bg-white text-blue-600 border-blue-200'
                      }`}>
                        {formatFecha(fecha)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Historial de Pagos */}
          <div className={`shadow rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Historial de Pagos</h3>
              {pagos.length > 0 && (
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Total: {pagos.length} pagos</p>
              )}
            </div>
            <div className="p-6">
              {loadingPagos ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Cargando pagos...</div>
                </div>
              ) : errorPagos ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-3">❌ Error al cargar los pagos</div>
                  <button
                    onClick={fetchPagos}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              ) : pagos.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {pagos.map((pago, index) => {
                    const montoTotal = (pago.montoCapital || 0) + (pago.montoInteres || 0) + (pago.montoMora || 0);
                    const fechaFormateada = formatPagoFecha(pago.fechaPago);
                    const tipoPagoClass = pago.tipoPago === 'mora' ? 'bg-red-500' : 
                                          pago.tipoPago === 'adelantado' ? 'bg-green-500' : 'bg-blue-500';
                    
                    return (
                      <div key={pago.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'border-gray-700 hover:bg-gray-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${tipoPagoClass}`}></div>
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {fechaFormateada}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="capitalize">Pago #{index + 1}</span>
                              <span className="capitalize">• {pago.tipoPago || 'normal'}</span>
                              {pago.modoManual && (
                                <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded-full text-xs">Manual</span>
                              )}
                              {pago.modoCalculo === 'automatico' && !pago.modoManual && (
                                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded-full text-xs">Automático</span>
                              )}
                            </div>
                            {pago.nota && (
                              <p className={`text-xs mt-1 italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>"{pago.nota}"</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            RD$ {montoTotal.toLocaleString()}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <p>Capital: RD$ {(pago.montoCapital || 0).toLocaleString()}</p>
                            <p>Interés: RD$ {(pago.montoInteres || 0).toLocaleString()}</p>
                            {pago.montoMora > 0 && (
                              <p className="text-red-600 dark:text-red-400">Mora: RD$ {pago.montoMora.toLocaleString()}</p>
                            )}
                          </div>
                          {pago.periodosPagados > 1 && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              ✓ {pago.periodosPagados} períodos pagados
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CurrencyDollarIcon className={`h-12 w-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>No hay pagos registrados</p>
                  <button
                    onClick={handleRegistrarPagoClick}
                    className="mt-3 px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all"
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
          <div className={`shadow rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Estado</h3>
            </div>
            <div className="p-6">
              <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${estadoInfo.color}`}>
                <EstadoIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{estadoInfo.text}</span>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cliente:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prestamoData.clienteNombre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cédula:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getCedulaCliente()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Frecuencia:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getFrecuenciaTexto()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Fecha préstamo:</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {prestamoData.fechaPrestamo ? formatFecha(prestamoData.fechaPrestamo) : 'No disponible'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Próximo pago:</span>
                  <span className={`font-medium ${informacionMora?.tieneMora ? 'text-red-600 dark:text-red-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {prestamoData.fechaProximoPago ? formatFecha(prestamoData.fechaProximoPago) : 'Por definir'}
                  </span>
                </div>
                {prestamoData.fechaUltimoPago && (
                  <div className="flex justify-between text-sm">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Último pago:</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatFecha(prestamoData.fechaUltimoPago)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total pagado:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    RD$ {(prestamoData.montoPrestado - prestamoData.capitalRestante).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`shadow rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Acciones Rápidas</h3>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={handleRegistrarPagoClick}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>Registrar Pago</span>
              </button>
              <button
                onClick={() => onEnviarWhatsApp(prestamoData)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Enviar WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Sistema EYS - Calendario de Pagos</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  {prestamoData.frecuencia === 'quincenal' && 'Los pagos se realizan los días 15 y 30 de cada mes.'}
                  {prestamoData.frecuencia === 'mensual' && `Los pagos se realizan el día ${prestamoData.diaPagoPersonalizado || '15'} de cada mes.`}
                  {prestamoData.frecuencia === 'semanal' && `Los pagos se realizan todos los ${prestamoData.diaSemana || 'Lunes'}.`}
                  {prestamoData.frecuencia === 'diario' && 'Los pagos se realizan todos los días.'}
                  {prestamoData.frecuencia === 'personalizado' && 'Los pagos se realizan en las fechas programadas.'}
                  {configMora.enabled && ` La mora es del ${configMora.porcentaje}% sobre el interés adeudado.`}
                </p>
              </div>
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Información Técnica</h4>
            <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
              <div className="flex justify-between">
                <span>ID Préstamo:</span>
                <span className="font-mono text-xs">{prestamoData.id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>ID Cliente:</span>
                <span className="font-mono text-xs">{prestamoData.clienteID?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasa Interés:</span>
                <span>{prestamoData.interesPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span>{informacionMora?.diasAtraso > 0 ? `Atrasado ${informacionMora.diasAtraso} días` : 'Al día'}</span>
              </div>
              <div className="flex justify-between">
                <span>Total pagos:</span>
                <span>{pagos.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestamoDetails;