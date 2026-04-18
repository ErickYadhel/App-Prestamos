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
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
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
// FUNCIÓN PARA FORMATEAR MONTO (mejorada)
// ============================================
const formatMonto = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '';
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(numero)) return '';
  return numero.toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseMonto = (valorFormateado) => {
  if (!valorFormateado) return 0;
  const numeroLimpio = valorFormateado.toString().replace(/[^0-9.-]/g, '');
  return parseFloat(numeroLimpio) || 0;
};

// ============================================
// COMPONENTE DE INPUT CON FORMATO DE MONTO
// ============================================
const MontoInput = ({ value, onChange, label, error, disabled, placeholder, className = '' }) => {
  const { theme } = useTheme();
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value ? formatMonto(value) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const numeros = rawValue.replace(/[^0-9]/g, '');
    const numero = parseFloat(numeros) / 100;
    
    if (!isNaN(numero)) {
      const formateado = formatMonto(numero);
      setDisplayValue(formateado);
      onChange(numero);
    } else if (rawValue === '') {
      setDisplayValue('');
      onChange(0);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value) {
      setDisplayValue(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value) {
      setDisplayValue(formatMonto(value));
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || "0.00"}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-mono ${
          error
            ? 'border-red-500 ring-2 ring-red-500/20'
            : disabled
              ? theme === 'dark'
                ? 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
              : theme === 'dark'
                ? 'border-gray-700 bg-gray-800 text-white focus:border-red-500'
                : 'border-gray-200 bg-white text-gray-900 focus:border-red-500'
        } focus:ring-2 focus:ring-red-500/20 outline-none transition-all ${className}`}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
};

// ============================================
// COMPONENTE DE CONFIRMACIÓN POR WHATSAPP
// ============================================
const ConfirmacionPagoModal = ({ isOpen, onClose, pagoData, prestamo, onEnviarWhatsApp }) => {
  const { theme } = useTheme();
  
  if (!isOpen) return null;
  
  const handleEnviar = () => {
    const mensaje = `✅ *CONFIRMACIÓN DE PAGO* - EYS Inversiones\n\nEstimado(a) *${prestamo?.clienteNombre || 'Cliente'}*,\n\nHemos recibido su pago por un monto de *RD$ ${formatMonto(pagoData?.montoTotal)}* correspondiente a su préstamo.\n\n📋 *Comprobante #${pagoData?.idPersonalizado || pagoData?.pagoId || 'N/A'}*\n\n📊 *Detalles:*\n• Capital restante: RD$ ${formatMonto(pagoData?.nuevoCapital)}\n• Fecha: ${new Date().toLocaleDateString()}\n\n¡Gracias por su puntualidad!\n\n- EYS Inversiones`;
    
    let telefono = '';
    if (prestamo?.telefonoCliente) {
      telefono = prestamo.telefonoCliente;
    } else if (prestamo?.clienteTelefono) {
      telefono = prestamo.clienteTelefono;
    } else if (prestamo?.clienteInfo?.celular) {
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
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircleIcon className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ¡Pago Registrado!
                  </h3>
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    El pago se ha registrado exitosamente.
                  </p>
                  
                  {pagoData?.idPersonalizado && (
                    <div className={`mb-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <DocumentTextIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Comprobante / ID del pago:
                        </span>
                      </div>
                      <code className={`text-sm font-mono px-2 py-1 rounded block text-center ${
                        theme === 'dark' ? 'bg-gray-900 text-green-400' : 'bg-white text-green-600'
                      }`}>
                        {pagoData.idPersonalizado}
                      </code>
                      <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        📌 Guarde este número para cualquier consulta
                      </p>
                    </div>
                  )}
                  
                  <div className={`mb-4 p-3 rounded-lg text-left ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Monto pagado:</span>
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        RD$ {formatMonto(pagoData?.montoTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Capital restante:</span>
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        RD$ {formatMonto(pagoData?.nuevoCapital)}
                      </span>
                    </div>
                    {pagoData?.fechaPago && (
                      <div className="flex justify-between mt-1">
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Fecha:</span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(pagoData.fechaPago).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
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
// COMPONENTE DE DISTRIBUCIÓN DEL PAGO (MEJORADO)
// ============================================
const DistribucionPago = ({ distribucion, configMora, prestamo }) => {
  const { theme } = useTheme();
  
  if (!distribucion) return null;
  
  const comisionGarante = prestamo?.generarComision && prestamo?.garanteID && distribucion.interes > 0
    ? (distribucion.interes * (prestamo.porcentajeComision || 50) / 100)
    : 0;
  
  // Solo mostrar si el monto es mayor a 0
  const mostrarInteres = distribucion.interes > 0;
  const mostrarMora = configMora.enabled && distribucion.mora > 0;
  const mostrarCapital = distribucion.capital > 0;
  
  return (
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
            RD$ {formatMonto(distribucion.montoTotal || 0)}
          </span>
        </div>
        
        <div className="space-y-2">
          {/* Solo mostrar interés si es > 0 */}
          {mostrarInteres && (
            <div className="flex justify-between items-center">
              <span className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                A Interés:
              </span>
              <span className={`text-sm font-semibold text-yellow-600 dark:text-yellow-400`}>
                RD$ {formatMonto(distribucion.interes)}
              </span>
            </div>
          )}
          
          {/* Solo mostrar mora si es > 0 */}
          {mostrarMora && (
            <div className="flex justify-between items-center">
              <span className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                A Mora:
              </span>
              <span className={`text-sm font-semibold text-red-600 dark:text-red-400`}>
                RD$ {formatMonto(distribucion.mora)}
              </span>
            </div>
          )}
          
          {/* Solo mostrar capital si es > 0 */}
          {mostrarCapital && (
            <div className="flex justify-between items-center">
              <span className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                A Capital:
              </span>
              <span className={`text-sm font-semibold text-green-600 dark:text-green-400`}>
                RD$ {formatMonto(distribucion.capital)}
              </span>
            </div>
          )}
          
          {/* Si no hay distribución (pago insuficiente) */}
          {!mostrarInteres && !mostrarMora && !mostrarCapital && distribucion.montoTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
                Estado:
              </span>
              <span className={`text-sm font-semibold text-orange-600 dark:text-orange-400`}>
                Pago insuficiente para cubrir intereses
              </span>
            </div>
          )}
        </div>

        {/* Comisión del Garante */}
        {comisionGarante > 0 && (
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
                  {prestamo?.garanteNombre || prestamo?.garanteID}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {prestamo?.porcentajeComision || 50}% del interés
                </p>
              </div>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                RD$ {formatMonto(comisionGarante)}
              </p>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Para EYS ({(100 - (prestamo?.porcentajeComision || 50))}%)
              </p>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                RD$ {formatMonto(distribucion.interes - comisionGarante)}
              </p>
            </div>
          </div>
        )}

        <div className={`pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Nuevo Capital:
            </span>
            <span className={`text-sm font-bold ${distribucion.prestamoCompletado ? 'text-green-600 dark:text-green-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              RD$ {formatMonto(Math.max(0, distribucion.nuevoCapital))}
            </span>
          </div>
          {distribucion.restoInteres > 0 && (
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Resto de interés pendiente:
              </span>
              <span className={`text-xs text-yellow-600 dark:text-yellow-400`}>
                RD$ {formatMonto(distribucion.restoInteres)}
              </span>
            </div>
          )}
        </div>

        {distribucion.prestamoCompletado && (
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
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const RegistrarPagoModal = ({ prestamos, onClose, onPagoRegistrado }) => {
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    prestamoID: '',
    montoTotal: 0,
    fechaPago: new Date().toISOString().split('T')[0],
    nota: '',
    tipoPago: 'normal',
    modoCalculo: 'automatico'
  });
  
  const [modoManual, setModoManual] = useState({
    montoInteres: 0,
    montoCapital: 0,
    montoMora: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [pagosPrestamo, setPagosPrestamo] = useState([]);
  const [cargandoPagos, setCargandoPagos] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ultimoPagoData, setUltimoPagoData] = useState(null);
  const [calculosAvanzados, setCalculosAvanzados] = useState({
    diasAtraso: 0,
    moraCalculada: 0,
    periodosAtrasados: 0,
    distribucion: null,
    interesPeriodo: 0
  });

  const configMora = getConfiguracionMora();

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
      setFormData(prev => ({ ...prev, montoTotal: 0, modoCalculo: 'automatico' }));
      setModoManual({ montoInteres: 0, montoCapital: 0, montoMora: 0 });
    } else {
      setPrestamoSeleccionado(null);
      setPagosPrestamo([]);
    }
  }, [formData.prestamoID, prestamos]);

  // Calcular distribución del pago en modo automático
  useEffect(() => {
    if (prestamoSeleccionado && formData.montoTotal > 0 && formData.modoCalculo === 'automatico') {
      const interesPeriodo = (prestamoSeleccionado.capitalRestante * prestamoSeleccionado.interesPercent) / 100;
      let capitalAplicado = 0;
      let interesAplicado = 0;
      let moraAplicada = 0;
      let restoInteres = 0;
      let montoRestante = formData.montoTotal;
      
      // Primero cubrir mora si hay días de atraso
      if (calculosAvanzados.diasAtraso > 0 && configMora.enabled && calculosAvanzados.moraCalculada > 0) {
        moraAplicada = Math.min(montoRestante, calculosAvanzados.moraCalculada);
        montoRestante -= moraAplicada;
      }
      
      // Luego cubrir interés del período
      if (montoRestante > 0) {
        interesAplicado = Math.min(montoRestante, interesPeriodo);
        montoRestante -= interesAplicado;
        
        // Si sobra después de cubrir interés, va a capital
        if (montoRestante > 0) {
          capitalAplicado = Math.min(montoRestante, prestamoSeleccionado.capitalRestante);
          montoRestante -= capitalAplicado;
        }
        
        // Si no se cubrió completamente el interés, guardar resto
        if (interesAplicado < interesPeriodo) {
          restoInteres = interesPeriodo - interesAplicado;
        }
      } else {
        // Si el pago no cubre ni la mora, no hay interés aplicado
        restoInteres = interesPeriodo;
      }
      
      const nuevoCapital = prestamoSeleccionado.capitalRestante - capitalAplicado;
      const prestamoCompletado = nuevoCapital <= 0;
      
      setCalculosAvanzados(prev => ({
        ...prev,
        distribucion: {
          montoTotal: formData.montoTotal,
          interes: interesAplicado,
          capital: capitalAplicado,
          mora: moraAplicada,
          restoInteres: restoInteres,
          nuevoCapital: Math.max(0, nuevoCapital),
          prestamoCompletado: prestamoCompletado
        }
      }));
    }
  }, [formData.montoTotal, formData.modoCalculo, prestamoSeleccionado, calculosAvanzados.diasAtraso, calculosAvanzados.moraCalculada, configMora]);

  // Calcular atraso y mora
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
          montoTotal: montoSugerido
        }));
      }
    }
  }, [prestamoSeleccionado, formData.fechaPago, formData.modoCalculo, configMora]);

  // Actualizar distribución en modo manual
  useEffect(() => {
    if (prestamoSeleccionado && formData.modoCalculo === 'manual') {
      const interes = modoManual.montoInteres || 0;
      const capital = modoManual.montoCapital || 0;
      const mora = modoManual.montoMora || 0;
      const total = interes + capital + mora;
      
      setCalculosAvanzados(prev => ({
        ...prev,
        distribucion: {
          montoTotal: total,
          interes,
          capital,
          mora,
          restoInteres: 0,
          nuevoCapital: Math.max(0, prestamoSeleccionado.capitalRestante - capital),
          prestamoCompletado: (prestamoSeleccionado.capitalRestante - capital) <= 0
        }
      }));
      
      setFormData(prev => ({
        ...prev,
        montoTotal: total
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

  const handleMontoChange = (value) => {
    setFormData(prev => ({
      ...prev,
      montoTotal: value
    }));
    if (error) setError('');
  };

  const handleModoManualChange = (campo, value) => {
    setModoManual(prev => ({
      ...prev,
      [campo]: value
    }));
  };

  const toggleModoCalculo = () => {
    const nuevoModo = formData.modoCalculo === 'automatico' ? 'manual' : 'automatico';
    setFormData(prev => ({
      ...prev,
      modoCalculo: nuevoModo,
      montoTotal: 0
    }));
    if (nuevoModo === 'manual') {
      setModoManual({
        montoInteres: 0,
        montoCapital: 0,
        montoMora: 0
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
      if (!formData.montoTotal || formData.montoTotal <= 0) {
        setError('Ingresa un monto válido');
        return false;
      }
    } else {
      const interes = modoManual.montoInteres || 0;
      const capital = modoManual.montoCapital || 0;
      
      if (interes <= 0 && capital <= 0) {
        setError('Debe especificar al menos interés o capital mayor a 0');
        return false;
      }
      
      if (capital > prestamoSeleccionado?.capitalRestante) {
        setError(`El capital no puede ser mayor al capital restante (RD$ ${formatMonto(prestamoSeleccionado?.capitalRestante)})`);
        return false;
      }
    }
    return true;
  };

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
        datosPago.montoTotal = formData.montoTotal;
      } else {
        datosPago.montoCapital = modoManual.montoCapital || 0;
        datosPago.montoInteres = modoManual.montoInteres || 0;
        datosPago.montoMora = modoManual.montoMora || 0;
      }

      const response = await api.post('/pagos', datosPago);

      if (response.success) {
        const idPersonalizado = response.data?.pago?.id || response.data?.id;
        
        setUltimoPagoData({
          montoTotal: formData.montoTotal,
          nuevoCapital: calculosAvanzados.distribucion?.nuevoCapital,
          pagoId: idPersonalizado,
          idPersonalizado: idPersonalizado,
          fechaPago: formData.fechaPago
        });
        setShowConfirmModal(true);
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

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    onPagoRegistrado();
    onClose();
  };

  const interesSugerido = prestamoSeleccionado 
    ? (prestamoSeleccionado.capitalRestante * prestamoSeleccionado.interesPercent) / 100
    : 0;

  const tieneMora = calculosAvanzados.diasAtraso > configMora.diasGracia;

  return (
    <>
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
                  <div className="lg:col-span-2 space-y-6">
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
                            {prestamo.clienteNombre} - RD$ {formatMonto(prestamo.capitalRestante)} (Restante) - {prestamo.frecuencia}
                          </option>
                        ))}
                      </select>
                    </div>

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
                                RD$ {formatMonto(prestamoSeleccionado.capitalRestante)}
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
                                    <p className="text-red-600 dark:text-red-400">• Mora calculada: RD$ {formatMonto(calculosAvanzados.moraCalculada)}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

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
                              <MontoInput
                                label="Monto Total (RD$) *"
                                value={formData.montoTotal}
                                onChange={handleMontoChange}
                                disabled={loading}
                                placeholder="0.00"
                              />
                              <div className="flex items-center space-x-2 mt-2">
                                <InformationCircleIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Monto sugerido: RD$ {formatMonto(interesSugerido + (calculosAvanzados.moraCalculada || 0))}
                                  {calculosAvanzados.moraCalculada > 0 && ` (incluye RD$ ${formatMonto(calculosAvanzados.moraCalculada)} de mora)`}
                                </p>
                              </div>
                              
                              {/* 👇 Mostrar cómo se dividirá el pago en modo automático */}
                              {formData.montoTotal > 0 && calculosAvanzados.distribucion && (
                                <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'} border border-blue-200 dark:border-blue-800`}>
                                  <p className={`text-xs font-medium mb-2 flex items-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                                    <CalculatorIcon className="h-3 w-3 mr-1" />
                                    El pago se dividirá de la siguiente manera:
                                  </p>
                                  <div className="space-y-1 text-xs">
                                    {calculosAvanzados.distribucion.mora > 0 && (
                                      <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>• Para cubrir mora:</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">RD$ {formatMonto(calculosAvanzados.distribucion.mora)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>• Para cubrir interés del período:</span>
                                      <span className="font-medium text-yellow-600 dark:text-yellow-400">RD$ {formatMonto(calculosAvanzados.distribucion.interes)}</span>
                                    </div>
                                    {calculosAvanzados.distribucion.capital > 0 && (
                                      <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>• Para reducir capital:</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">RD$ {formatMonto(calculosAvanzados.distribucion.capital)}</span>
                                      </div>
                                    )}
                                    {calculosAvanzados.distribucion.restoInteres > 0 && (
                                      <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>• Resto de interés pendiente:</span>
                                        <span className="font-medium text-orange-600 dark:text-orange-400">RD$ {formatMonto(calculosAvanzados.distribucion.restoInteres)}</span>
                                      </div>
                                    )}
                                    {calculosAvanzados.distribucion.interes === 0 && calculosAvanzados.distribucion.mora === 0 && calculosAvanzados.distribucion.capital === 0 && formData.montoTotal > 0 && (
                                      <div className="flex justify-between">
                                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>• ⚠️ Pago insuficiente:</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">No cubre el interés mínimo del período</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <MontoInput
                                  label="Monto a Interés (RD$)"
                                  value={modoManual.montoInteres}
                                  onChange={(val) => handleModoManualChange('montoInteres', val)}
                                  disabled={loading}
                                />
                                <MontoInput
                                  label="Monto a Capital (RD$)"
                                  value={modoManual.montoCapital}
                                  onChange={(val) => handleModoManualChange('montoCapital', val)}
                                  disabled={loading}
                                  error={modoManual.montoCapital > prestamoSeleccionado?.capitalRestante ? `Máximo: ${formatMonto(prestamoSeleccionado?.capitalRestante)}` : ''}
                                />
                                {configMora.enabled && (
                                  <MontoInput
                                    label="Monto por Mora (RD$)"
                                    value={modoManual.montoMora}
                                    onChange={(val) => handleModoManualChange('montoMora', val)}
                                    disabled={loading}
                                  />
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

                  <div className="space-y-6">
                    {prestamoSeleccionado && (
                      <>
                        <DistribucionPago 
                          distribucion={calculosAvanzados.distribucion}
                          configMora={configMora}
                          prestamo={prestamoSeleccionado}
                        />

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
                            <li>• <strong>Orden de aplicación:</strong> Mora → Interés → Capital</li>
                            <li>• La próxima fecha de pago se recalcula automáticamente</li>
                            <li>• <strong>ID del pago:</strong> Se genera automáticamente con formato "Nombre-Fecha"</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>

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
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Pago #{idx + 1} - {formatFecha(pago.fechaPago)}
                                      </p>
                                      <code className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                                        theme === 'dark' ? 'bg-gray-700 text-green-400' : 'bg-gray-200 text-green-600'
                                      }`}>
                                        {pago.id}
                                      </code>
                                    </div>
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
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                                      {pago.montoInteres > 0 && (
                                        <div className="flex justify-between">
                                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Interés:</span>
                                          <span className="font-medium text-yellow-600 dark:text-yellow-400">RD$ {formatMonto(pago.montoInteres)}</span>
                                        </div>
                                      )}
                                      {pago.montoMora > 0 && (
                                        <div className="flex justify-between">
                                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Mora:</span>
                                          <span className="font-medium text-red-600 dark:text-red-400">RD$ {formatMonto(pago.montoMora)}</span>
                                        </div>
                                      )}
                                      {pago.montoCapital > 0 && (
                                        <div className="flex justify-between">
                                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Capital:</span>
                                          <span className="font-medium text-green-600 dark:text-green-400">RD$ {formatMonto(pago.montoCapital)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      RD$ {formatMonto(montoTotal)}
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
                  Los pagos registrados generan comisiones automáticas y se guardan con ID personalizado (Ej: JuanPerez-18-4-26)
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

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