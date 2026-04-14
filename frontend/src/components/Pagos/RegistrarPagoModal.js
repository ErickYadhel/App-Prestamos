import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CalculatorIcon, 
  InformationCircleIcon,
  CogIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  GiftIcon,
  BanknotesIcon,
  UserIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon  // 👈 NUEVO
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { 
  calcularDistribucionPago, 
  getConfiguracionMora,
  calcularDiasTranscurridos
} from '../../utils/loanCalculations';
import { formatFecha } from '../../utils/firebaseUtils';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// COMPONENTE DE CONFIRMACIÓN POR WHATSAPP (NUEVO)
// ============================================
const ConfirmacionPagoModal = ({ isOpen, onClose, pagoData, prestamo, onEnviarWhatsApp }) => {
  const { theme } = useTheme();
  
  if (!isOpen) return null;
  
  const handleEnviar = () => {
    // Construir mensaje de confirmación
    const mensaje = `✅ *CONFIRMACIÓN DE PAGO* - EYS Inversiones\n\nEstimado(a) *${prestamo.clienteNombre}*,\n\nHemos recibido su pago por un monto de *RD$ ${pagoData.montoTotal?.toLocaleString()}* correspondiente a su préstamo.\n\n📊 *Detalles:*\n• Capital restante: RD$ ${pagoData.nuevoCapital?.toLocaleString()}\n• Fecha: ${new Date().toLocaleDateString()}\n\n¡Gracias por su puntualidad!\n\n- EYS Inversiones`;
    
    // Obtener número de teléfono del cliente (del préstamo o de la información del cliente)
    let telefono = '';
    if (prestamo.telefonoCliente) {
      telefono = prestamo.telefonoCliente;
    } else if (prestamo.clienteTelefono) {
      telefono = prestamo.clienteTelefono;
    } else if (prestamo.clienteInfo?.celular) {
      telefono = prestamo.clienteInfo.celular;
    }
    
    if (telefono) {
      const url = `https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }
    onEnviarWhatsApp && onEnviarWhatsApp();
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl blur-xl opacity-75" />
            <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-green-600/30 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ¡Pago Registrado!
                </h3>
                <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  El pago se ha registrado exitosamente. ¿Desea enviar una confirmación por WhatsApp al cliente?
                </p>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleEnviar}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <span>Enviar Confirmación por WhatsApp</span>
                  </button>
                  <button
                    onClick={onClose}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE PRINCIPAL (MEJORADO)
// ============================================
const RegistrarPagoModal = ({ prestamos, onClose, onPagoRegistrado }) => {
  const { theme } = useTheme();
  
  // Estados principales (sin cambios)
  const [formData, setFormData] = useState({
    prestamoID: '',
    montoTotal: '',
    fechaPago: new Date().toISOString().split('T')[0],
    nota: '',
    tipoPago: 'normal',
    modoCalculo: 'automatico'
  });
  
  const [modoManual, setModoManual] = useState({
    montoInteres: '',
    montoCapital: '',
    montoMora: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [pagosPrestamo, setPagosPrestamo] = useState([]);
  const [cargandoPagos, setCargandoPagos] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [calculosAvanzados, setCalculosAvanzados] = useState({
    diasAtraso: 0,
    moraCalculada: 0,
    periodosAtrasados: 0,
    distribucion: null,
    interesPeriodo: 0
  });

  // 👇 NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ultimoPagoData, setUltimoPagoData] = useState(null);

  const configMora = getConfiguracionMora();

  // Cargar pagos del préstamo seleccionado (sin cambios)
  const cargarPagosPrestamo = async (prestamoId) => {
    if (!prestamoId) return;
    try {
      setCargandoPagos(true);
      const response = await api.get(`/pagos/prestamo/${prestamoId}`);
      if (response.success) {
        const pagosData = response.data?.pagos || response.data?.data?.pagos || [];
        setPagosPrestamo(pagosData);
      }
    } catch (error) {
      console.error('Error cargando pagos:', error);
    } finally {
      setCargandoPagos(false);
    }
  };

  // Cuando se selecciona un préstamo (sin cambios)
  useEffect(() => {
    if (formData.prestamoID) {
      const prestamo = prestamos.find(p => p.id === formData.prestamoID);
      setPrestamoSeleccionado(prestamo);
      cargarPagosPrestamo(formData.prestamoID);
      
      setCalculosAvanzados(prev => ({
        ...prev,
        distribucion: null,
        diasAtraso: 0,
        moraCalculada: 0
      }));
      setFormData(prev => ({ ...prev, montoTotal: '', modoCalculo: 'automatico' }));
      setModoManual({ montoInteres: '', montoCapital: '', montoMora: '' });
    } else {
      setPrestamoSeleccionado(null);
      setPagosPrestamo([]);
    }
  }, [formData.prestamoID, prestamos]);

  // Calcular atraso y mora (sin cambios)
  useEffect(() => {
    if (prestamoSeleccionado && formData.fechaPago) {
      const fechaPagoSeleccionada = new Date(formData.fechaPago);
      const fechaEsperada = prestamoSeleccionado.fechaProximoPago 
        ? new Date(prestamoSeleccionado.fechaProximoPago) 
        : new Date(prestamoSeleccionado.fechaPrestamo);
      
      const diasAtraso = calcularDiasTranscurridos(fechaEsperada, fechaPagoSeleccionada);
      
      let moraCalculada = 0;
      let periodosAtrasados = 0;
      
      if (diasAtraso > 0 && configMora.enabled) {
        const interesDiario = (prestamoSeleccionado.capitalRestante * prestamoSeleccionado.interesPercent) / 100 / 30;
        moraCalculada = interesDiario * diasAtraso * (configMora.porcentaje / 100);
        
        if (prestamoSeleccionado.frecuencia === 'quincenal') {
          periodosAtrasados = Math.floor(diasAtraso / 15);
        } else if (prestamoSeleccionado.frecuencia === 'mensual') {
          periodosAtrasados = Math.floor(diasAtraso / 30);
        } else if (prestamoSeleccionado.frecuencia === 'semanal') {
          periodosAtrasados = Math.floor(diasAtraso / 7);
        }
      }
      
      const interesPeriodo = (prestamoSeleccionado.capitalRestante * prestamoSeleccionado.interesPercent) / 100;
      
      setCalculosAvanzados(prev => ({
        ...prev,
        diasAtraso,
        moraCalculada,
        periodosAtrasados,
        interesPeriodo
      }));
      
      if (formData.modoCalculo === 'automatico') {
        const montoSugerido = interesPeriodo + moraCalculada;
        setFormData(prev => ({
          ...prev,
          montoTotal: montoSugerido.toFixed(2)
        }));
      }
    }
  }, [prestamoSeleccionado, formData.fechaPago, formData.modoCalculo, configMora]);

  // Calcular distribución del pago (sin cambios)
  useEffect(() => {
    if (prestamoSeleccionado && formData.montoTotal && formData.modoCalculo === 'automatico') {
      const monto = parseFloat(formData.montoTotal) || 0;
      const distribucion = calcularDistribucionPago(prestamoSeleccionado, monto);
      
      setCalculosAvanzados(prev => ({
        ...prev,
        distribucion: {
          interes: distribucion.interes,
          capital: distribucion.capital,
          mora: distribucion.mora || 0,
          restoInteres: distribucion.restoInteres,
          nuevoCapital: distribucion.nuevoCapital,
          prestamoCompletado: distribucion.prestamoCompletado
        }
      }));
    }
  }, [formData.montoTotal, formData.modoCalculo, prestamoSeleccionado]);

  // Actualizar distribución en modo manual (sin cambios)
  useEffect(() => {
    if (prestamoSeleccionado && formData.modoCalculo === 'manual') {
      const interes = parseFloat(modoManual.montoInteres) || 0;
      const capital = parseFloat(modoManual.montoCapital) || 0;
      const mora = parseFloat(modoManual.montoMora) || 0;
      
      setCalculosAvanzados(prev => ({
        ...prev,
        distribucion: {
          interes,
          capital,
          mora,
          restoInteres: 0,
          nuevoCapital: Math.max(0, prestamoSeleccionado.capitalRestante - capital),
          prestamoCompletado: (prestamoSeleccionado.capitalRestante - capital) <= 0
        }
      }));
      
      const total = interes + capital + mora;
      setFormData(prev => ({
        ...prev,
        montoTotal: total.toString()
      }));
    }
  }, [modoManual, prestamoSeleccionado, formData.modoCalculo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleModoManualChange = (e) => {
    const { name, value } = e.target;
    const nuevoValor = value === '' ? '' : parseFloat(value) || 0;
    setModoManual(prev => ({
      ...prev,
      [name]: nuevoValor.toString()
    }));
  };

  const toggleModoCalculo = () => {
    const nuevoModo = formData.modoCalculo === 'automatico' ? 'manual' : 'automatico';
    setFormData(prev => ({
      ...prev,
      modoCalculo: nuevoModo,
      montoTotal: ''
    }));
    if (nuevoModo === 'manual') {
      setModoManual({
        montoInteres: '',
        montoCapital: '',
        montoMora: ''
      });
    }
  };

  const validateForm = () => {
    if (!formData.prestamoID) {
      setError('Selecciona un préstamo');
      return false;
    }
    if (!formData.fechaPago) {
      setError('Selecciona una fecha');
      return false;
    }
    
    if (formData.modoCalculo === 'automatico') {
      if (!formData.montoTotal || parseFloat(formData.montoTotal) <= 0) {
        setError('Ingresa un monto válido');
        return false;
      }
    } else {
      const interes = parseFloat(modoManual.montoInteres) || 0;
      const capital = parseFloat(modoManual.montoCapital) || 0;
      
      if (interes <= 0 && capital <= 0) {
        setError('Debe especificar al menos interés o capital mayor a 0');
        return false;
      }
      
      if (capital > prestamoSeleccionado?.capitalRestante) {
        setError(`El capital no puede ser mayor al capital restante (RD$ ${prestamoSeleccionado?.capitalRestante?.toLocaleString()})`);
        return false;
      }
    }
    return true;
  };

  // 👇 HANDLE SUBMIT MODIFICADO (agrega el modal de confirmación)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const datosPago = {
        prestamoID: formData.prestamoID,
        fechaPago: formData.fechaPago,
        nota: formData.nota,
        tipoPago: formData.tipoPago,
        modoCalculo: formData.modoCalculo
      };

      if (formData.modoCalculo === 'automatico') {
        datosPago.montoTotal = parseFloat(formData.montoTotal);
      } else {
        datosPago.montoCapital = parseFloat(modoManual.montoCapital) || 0;
        datosPago.montoInteres = parseFloat(modoManual.montoInteres) || 0;
        datosPago.montoMora = parseFloat(modoManual.montoMora) || 0;
      }

      const response = await api.post('/pagos', datosPago);

      if (response.success) {
        // Guardar datos del pago para el modal de confirmación
        setUltimoPagoData({
          montoTotal: formData.montoTotal,
          nuevoCapital: calculosAvanzados.distribucion?.nuevoCapital,
          pagoId: response.data?.pago?.id || response.data?.id
        });
        // Mostrar modal de confirmación
        setShowConfirmModal(true);
        // No llamar a onPagoRegistrado todavía, esperar a que el usuario cierre el modal
      } else {
        throw new Error(response.error || 'Error al registrar el pago');
      }
    } catch (error) {
      console.error('Error registrando pago:', error);
      setError(error.message || 'Error interno del servidor');
    } finally {
      setLoading(false);
    }
  };

  // 👇 FUNCIÓN PARA CERRAR EL MODAL DE CONFIRMACIÓN Y RECARGAR DATOS
  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    onPagoRegistrado();  // Recargar lista de pagos y préstamos
    onClose();           // Cerrar el modal principal
  };

  const interesSugerido = prestamoSeleccionado 
    ? ((prestamoSeleccionado.capitalRestante * prestamoSeleccionado.interesPercent) / 100).toLocaleString()
    : '0';

  const comisionGarante = calculosAvanzados.distribucion?.interes > 0 && prestamoSeleccionado?.generarComision && prestamoSeleccionado?.garanteID
    ? (calculosAvanzados.distribucion.interes * (prestamoSeleccionado.porcentajeComision || 50) / 100)
    : 0;

  const tieneMora = calculosAvanzados.diasAtraso > configMora.diasGracia;

  return (
    <>
      {/* Modal principal de registro de pago (sin cambios estructurales) */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
            
            <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />

              {/* Header (sin cambios) */}
              <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
                theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Registrar Nuevo Pago
                      </h3>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Complete la información del pago
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {error && (
                  <div className={`mb-4 p-4 rounded-xl border-2 flex items-start space-x-3 ${
                    theme === 'dark'
                      ? 'bg-red-900/30 border-red-700 text-red-400'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Columna Izquierda - Formulario (sin cambios) */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Selección de Préstamo */}
                    <div className={`p-4 rounded-xl border-2 ${
                      theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Seleccionar Préstamo *
                      </label>
                      <select
                        name="prestamoID"
                        value={formData.prestamoID}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-lg border-2 text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                        } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      >
                        <option value="">Seleccionar préstamo</option>
                        {prestamos.map(prestamo => (
                          <option key={prestamo.id} value={prestamo.id}>
                            {prestamo.clienteNombre} - RD$ {prestamo.capitalRestante?.toLocaleString()} (Restante) - {prestamo.frecuencia}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Información del Préstamo Seleccionado (sin cambios) */}
                    {prestamoSeleccionado && (
                      <>
                        <div className={`p-4 rounded-xl border-2 ${
                          theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`text-sm font-semibold flex items-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                              <UserIcon className="h-4 w-4 mr-2" />
                              Información del Préstamo
                            </h4>
                            <button
                              onClick={() => setMostrarHistorial(!mostrarHistorial)}
                              className={`text-xs flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                                theme === 'dark' ? 'hover:bg-blue-800/50 text-blue-300' : 'hover:bg-blue-100 text-blue-600'
                              }`}
                            >
                              <ClockIcon className="h-3 w-3" />
                              <span>{mostrarHistorial ? 'Ocultar historial' : 'Ver historial'}</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Cliente:</span>
                              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {prestamoSeleccionado.clienteNombre}
                              </p>
                            </div>
                            <div>
                              <span className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Capital Restante:</span>
                              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                RD$ {prestamoSeleccionado.capitalRestante?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Interés {prestamoSeleccionado.frecuencia}:</span>
                              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {prestamoSeleccionado.interesPercent}%
                              </p>
                            </div>
                            <div>
                              <span className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Próximo Pago:</span>
                              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {prestamoSeleccionado.fechaProximoPago ? formatFecha(prestamoSeleccionado.fechaProximoPago) : 'Por definir'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Alerta de Mora (sin cambios) */}
                        {calculosAvanzados.diasAtraso > 0 && (
                          <div className={`p-4 rounded-xl border-2 ${
                            tieneMora
                              ? theme === 'dark' ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
                              : theme === 'dark' ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
                          }`}>
                            <div className="flex items-start space-x-3">
                              <ExclamationTriangleIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                                tieneMora ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                              }`} />
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  tieneMora 
                                    ? theme === 'dark' ? 'text-red-300' : 'text-red-800'
                                    : theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                                }`}>
                                  {calculosAvanzados.diasAtraso > 0 ? 'Préstamo con atraso' : 'Préstamo al día'}
                                </p>
                                <div className="text-sm mt-1 space-y-1">
                                  <p>• Días de atraso: {calculosAvanzados.diasAtraso}</p>
                                  {calculosAvanzados.periodosAtrasados > 0 && (
                                    <p>• Períodos atrasados: {calculosAvanzados.periodosAtrasados}</p>
                                  )}
                                  {calculosAvanzados.moraCalculada > 0 && configMora.enabled && (
                                    <p className="text-red-600 dark:text-red-400">• Mora calculada: RD$ {calculosAvanzados.moraCalculada.toLocaleString()}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Modo de Cálculo (sin cambios) */}
                        <div className={`p-4 rounded-xl border-2 ${
                          theme === 'dark' ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
                        }`}>
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                              <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>
                                Modo de Cálculo
                              </h4>
                              <p className={`text-xs ${theme === 'dark' ? 'text-purple-300/70' : 'text-purple-600'}`}>
                                {formData.modoCalculo === 'automatico' 
                                  ? 'El sistema calcula automáticamente según días transcurridos' 
                                  : 'Define manualmente los montos de interés, capital y mora'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={toggleModoCalculo}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                theme === 'dark'
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                              }`}
                              disabled={loading}
                            >
                              <CogIcon className="h-4 w-4" />
                              <span>{formData.modoCalculo === 'automatico' ? 'Cambiar a Manual' : 'Cambiar a Automático'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Datos del Pago (sin cambios) */}
                        <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <h4 className={`text-sm font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <CalendarIcon className="h-4 w-4 mr-2 text-red-600" />
                            Datos del Pago
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Fecha del Pago *
                              </label>
                              <input
                                type="date"
                                name="fechaPago"
                                value={formData.fechaPago}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${
                                  theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                                disabled={loading}
                              />
                            </div>

                            <div>
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Tipo de Pago
                              </label>
                              <select
                                name="tipoPago"
                                value={formData.tipoPago}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${
                                  theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                                disabled={loading}
                              >
                                <option value="normal">Normal</option>
                                <option value="adelantado">Adelantado</option>
                                <option value="mora">Pago de Mora</option>
                                <option value="abono">Abono Extra a Capital</option>
                              </select>
                            </div>
                          </div>

                          {formData.modoCalculo === 'automatico' ? (
                            <div className="mt-4">
                              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Monto Total (RD$) *
                              </label>
                              <input
                                type="number"
                                name="montoTotal"
                                value={formData.montoTotal}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${
                                  theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                                } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                disabled={loading}
                              />
                              <div className="flex items-center space-x-2 mt-2">
                                <InformationCircleIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Monto sugerido: RD$ {((prestamoSeleccionado.capitalRestante * prestamoSeleccionado.interesPercent) / 100 + (calculosAvanzados.moraCalculada || 0)).toLocaleString()}
                                  {calculosAvanzados.moraCalculada > 0 && ` (incluye RD$ ${calculosAvanzados.moraCalculada.toLocaleString()} de mora)`}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Monto a Interés (RD$)
                                  </label>
                                  <input
                                    type="number"
                                    name="montoInteres"
                                    value={modoManual.montoInteres}
                                    onChange={handleModoManualChange}
                                    className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${
                                      theme === 'dark'
                                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    disabled={loading}
                                  />
                                </div>
                                <div>
                                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Monto a Capital (RD$)
                                  </label>
                                  <input
                                    type="number"
                                    name="montoCapital"
                                    value={modoManual.montoCapital}
                                    onChange={handleModoManualChange}
                                    className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${
                                      theme === 'dark'
                                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                                    } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    max={prestamoSeleccionado.capitalRestante}
                                    disabled={loading}
                                  />
                                </div>
                                {configMora.enabled && (
                                  <div>
                                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Monto por Mora (RD$)
                                    </label>
                                    <input
                                      type="number"
                                      name="montoMora"
                                      value={modoManual.montoMora}
                                      onChange={handleModoManualChange}
                                      className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${
                                        theme === 'dark'
                                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                                      } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                                      placeholder="0.00"
                                      step="0.01"
                                      min="0"
                                      disabled={loading}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-4">
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              Nota u Observación
                            </label>
                            <textarea
                              name="nota"
                              value={formData.nota}
                              onChange={handleChange}
                              rows="2"
                              className={`w-full px-3 py-2 rounded-lg border-2 text-sm resize-none ${
                                theme === 'dark'
                                  ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                                  : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                              } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                              placeholder="Observaciones sobre el pago..."
                              disabled={loading}
                            />
                          </div>
                        </div>

                        {/* Botones de acción (sin cambios) */}
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            disabled={loading}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                <span>Registrando...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                <span>Registrar Pago</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Columna Derecha - Distribución y Resumen (sin cambios) */}
                  <div className="space-y-6">
                    {prestamoSeleccionado && (
                      <>
                        {/* Distribución del Pago */}
                        <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="p-2 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
                              <CalculatorIcon className="h-4 w-4 text-white" />
                            </div>
                            <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Distribución del Pago
                            </h4>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monto Total:</span>
                              <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                RD$ {(parseFloat(formData.montoTotal) || 0).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                  A Interés:
                                </span>
                                <span className={`text-sm font-medium text-yellow-600 dark:text-yellow-400`}>
                                  RD$ {calculosAvanzados.distribucion?.interes?.toLocaleString() || 0}
                                </span>
                              </div>

                              {configMora.enabled && (
                                <div className="flex justify-between">
                                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                    A Mora:
                                  </span>
                                  <span className={`text-sm font-medium text-red-600 dark:text-red-400`}>
                                    RD$ {calculosAvanzados.distribucion?.mora?.toLocaleString() || 0}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex justify-between">
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                  A Capital:
                                </span>
                                <span className={`text-sm font-medium text-green-600 dark:text-green-400`}>
                                  RD$ {calculosAvanzados.distribucion?.capital?.toLocaleString() || 0}
                                </span>
                              </div>
                            </div>

                            {/* Comisión del Garante */}
                            {prestamoSeleccionado.generarComision && prestamoSeleccionado.garanteID && calculosAvanzados.distribucion?.interes > 0 && (
                              <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex items-center space-x-2 mb-2">
                                  <GiftIcon className="h-4 w-4 text-purple-500" />
                                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Comisión para Garante
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {prestamoSeleccionado.garanteNombre || prestamoSeleccionado.garanteID}
                                    </p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {prestamoSeleccionado.porcentajeComision || 50}% del interés
                                    </p>
                                  </div>
                                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    RD$ {comisionGarante.toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Para EYS ({(100 - (prestamoSeleccionado.porcentajeComision || 50))}%)
                                  </p>
                                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                    RD$ {(calculosAvanzados.distribucion?.interes - comisionGarante).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className={`pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <div className="flex justify-between">
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  Nuevo Capital:
                                </span>
                                <span className={`text-sm font-bold ${calculosAvanzados.distribucion?.prestamoCompletado ? 'text-green-600 dark:text-green-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  RD$ {Math.max(0, calculosAvanzados.distribucion?.nuevoCapital || prestamoSeleccionado.capitalRestante).toLocaleString()}
                                </span>
                              </div>
                              {calculosAvanzados.distribucion?.restoInteres > 0 && (
                                <div className="flex justify-between mt-1">
                                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Resto de interés pendiente:
                                  </span>
                                  <span className={`text-xs text-yellow-600 dark:text-yellow-400`}>
                                    RD$ {calculosAvanzados.distribucion.restoInteres.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {calculosAvanzados.distribucion?.prestamoCompletado && (
                              <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center">
                                  <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                    ¡Este pago completará el préstamo!
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Información adicional */}
                        <div className={`p-4 rounded-xl border-2 ${
                          theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
                        }`}>
                          <h4 className={`text-sm font-medium mb-2 flex items-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                            <ShieldCheckIcon className="h-4 w-4 mr-2" />
                            Sistema EYS - Información
                          </h4>
                          <ul className={`text-xs space-y-1 ${theme === 'dark' ? 'text-blue-300/70' : 'text-blue-700'}`}>
                            <li>• <strong>Automático:</strong> Calcula intereses según días transcurridos</li>
                            <li>• <strong>Manual:</strong> Define manualmente interés, capital y mora</li>
                            <li>• <strong>Mora:</strong> {configMora.enabled ? `Activada (${configMora.porcentaje}%)` : 'Desactivada'}</li>
                            <li>• Días de gracia: {configMora.diasGracia} días</li>
                            <li>• El pago cubre primero interés, luego mora, luego capital</li>
                            <li>• La próxima fecha de pago se recalcula automáticamente</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Historial de Pagos (expandible) - sin cambios */}
                {mostrarHistorial && prestamoSeleccionado && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center space-x-2 mb-4">
                        <ClockIcon className="h-5 w-5 text-red-600" />
                        <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Historial de Pagos
                        </h4>
                        {cargandoPagos && <ArrowPathIcon className="h-4 w-4 animate-spin text-gray-400" />}
                      </div>
                      
                      {pagosPrestamo.length === 0 ? (
                        <p className={`text-center text-sm py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          No hay pagos registrados para este préstamo
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {pagosPrestamo.map((pago, idx) => {
                            const montoTotal = (pago.montoCapital || 0) + (pago.montoInteres || 0) + (pago.montoMora || 0);
                            return (
                              <div key={pago.id} className={`p-3 rounded-lg border ${
                                theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-100'
                              } transition-colors`}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      Pago #{idx + 1} - {formatFecha(pago.fechaPago)}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        pago.tipoPago === 'normal' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        pago.tipoPago === 'adelantado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                      }`}>
                                        {pago.tipoPago || 'normal'}
                                      </span>
                                      {pago.modoManual && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                          Manual
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      RD$ {montoTotal.toLocaleString()}
                                    </p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      Capital: RD$ {(pago.montoCapital || 0).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} text-center`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Los pagos registrados generan comisiones automáticas si el préstamo tiene configuración de comisión activa
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* 👇 MODAL DE CONFIRMACIÓN POR WHATSAPP (NUEVO) */}
      <ConfirmacionPagoModal
        isOpen={showConfirmModal}
        onClose={handleConfirmClose}
        pagoData={ultimoPagoData}
        prestamo={prestamoSeleccionado}
        onEnviarWhatsApp={() => console.log('Mensaje de confirmación enviado')}
      />
    </>
  );
};

export default RegistrarPagoModal;