import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon, 
  CalculatorIcon, 
  CogIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  GiftIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  calcularPagosAtrasados,
  calcularDistribucionPago,
  getConfiguracionMora,
  calcularDiasTranscurridos
} from '../../utils/loanCalculations';
import { formatFecha } from '../../utils/firebaseUtils';

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
// COMPONENTE DE DISTRIBUCIÓN DEL PAGO (MEJORADO)
// ============================================
const DistribucionPago = ({ distribucion, configMora, prestamo }) => {
  const { theme } = useTheme();
  
  if (!distribucion) return null;
  
  const comisionGarante = prestamo?.generarComision && prestamo?.garanteID && distribucion.interes > 0
    ? (distribucion.interes * (prestamo.porcentajeComision || 50) / 100)
    : 0;
  
  const mostrarInteres = distribucion.interes > 0;
  const mostrarMora = configMora.enabled && distribucion.mora > 0;
  const mostrarCapital = distribucion.capital > 0;
  
  return (
    <div className={`shadow rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center space-x-2 mb-4">
        <CalculatorIcon className="h-5 w-5 text-primary-600" />
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Distribución del Pago</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monto Total:</span>
          <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            RD$ {formatMonto(distribucion.montoTotal || 0)}
          </span>
        </div>
        
        <div className="space-y-2">
          {mostrarInteres && (
            <div className="flex justify-between items-center">
              <span className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                Aplicado a interés:
              </span>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                RD$ {formatMonto(distribucion.interes)}
              </span>
            </div>
          )}
          
          {mostrarMora && (
            <div className="flex justify-between items-center">
              <span className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                Aplicado a mora:
              </span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                RD$ {formatMonto(distribucion.mora)}
              </span>
            </div>
          )}
          
          {mostrarCapital && (
            <div className="flex justify-between items-center">
              <span className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Aplicado a capital:
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                RD$ {formatMonto(distribucion.capital)}
              </span>
            </div>
          )}
          
          {!mostrarInteres && !mostrarMora && !mostrarCapital && distribucion.montoTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className={`text-sm flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
                Estado:
              </span>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Pago insuficiente para cubrir intereses
              </span>
            </div>
          )}
        </div>

        {/* Comisión del Garante */}
        {comisionGarante > 0 && (
          <div className={`border-t pt-3 mt-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <GiftIcon className="h-4 w-4 text-purple-500" />
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Comisión para garante
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
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
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

        <div className={`border-t pt-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Nuevo capital:</span>
            <span className={`text-sm font-bold ${distribucion.prestamoCompletado ? 'text-green-600 dark:text-green-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              RD$ {formatMonto(Math.max(0, distribucion.nuevoCapital))}
            </span>
          </div>
          {distribucion.restoInteres > 0 && (
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Resto de interés pendiente:
              </span>
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                RD$ {formatMonto(distribucion.restoInteres)}
              </span>
            </div>
          )}
        </div>

        {distribucion.prestamoCompletado && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                ¡Préstamo será completado!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE MODAL DE CONFIRMACIÓN (MEJORADO)
// ============================================
const ConfirmacionPagoModal = ({ isOpen, onClose, pagoData, prestamo }) => {
  const { theme } = useTheme();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
      <div className="relative w-full max-w-md mx-4">
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
            
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const RegistrarPago = ({ prestamo, onSave, onCancel, onClose, onPagoRegistrado }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState({});
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

  // Calcular distribución del pago en modo automático
  useEffect(() => {
    if (prestamo && formData.montoTotal > 0 && formData.modoCalculo === 'automatico') {
      const interesPeriodo = (prestamo.capitalRestante * prestamo.interesPercent) / 100;
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
          capitalAplicado = Math.min(montoRestante, prestamo.capitalRestante);
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
      
      const nuevoCapital = prestamo.capitalRestante - capitalAplicado;
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
  }, [formData.montoTotal, formData.modoCalculo, prestamo, calculosAvanzados.diasAtraso, calculosAvanzados.moraCalculada, configMora]);

  // Calcular atraso y mora
  useEffect(() => {
    if (prestamo && formData.fechaPago) {
      const fechaPagoSeleccionada = new Date(formData.fechaPago);
      const fechaEsperada = prestamo.fechaProximoPago 
        ? new Date(prestamo.fechaProximoPago) 
        : new Date(prestamo.fechaPrestamo);
      
      const diasAtraso = calcularDiasTranscurridos(fechaEsperada, fechaPagoSeleccionada);
      
      let moraCalculada = 0;
      let periodosAtrasados = 0;
      
      if (diasAtraso > 0 && configMora.enabled) {
        const interesDiario = (prestamo.capitalRestante * prestamo.interesPercent) / 100 / 30;
        moraCalculada = interesDiario * diasAtraso * (configMora.porcentaje / 100);
        
        if (prestamo.frecuencia === 'quincenal') {
          periodosAtrasados = Math.floor(diasAtraso / 15);
        } else if (prestamo.frecuencia === 'mensual') {
          periodosAtrasados = Math.floor(diasAtraso / 30);
        } else if (prestamo.frecuencia === 'semanal') {
          periodosAtrasados = Math.floor(diasAtraso / 7);
        }
      }
      
      const interesPeriodo = (prestamo.capitalRestante * prestamo.interesPercent) / 100;
      
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
  }, [prestamo, formData.fechaPago, formData.modoCalculo, configMora]);

  // Actualizar distribución en modo manual
  useEffect(() => {
    if (prestamo && formData.modoCalculo === 'manual') {
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
          nuevoCapital: Math.max(0, prestamo.capitalRestante - capital),
          prestamoCompletado: (prestamo.capitalRestante - capital) <= 0
        }
      }));
      
      setFormData(prev => ({
        ...prev,
        montoTotal: total
      }));
    }
  }, [modoManual, prestamo, formData.modoCalculo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMontoChange = (value) => {
    setFormData(prev => ({
      ...prev,
      montoTotal: value
    }));
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
    const newErrors = {};

    if (formData.modoCalculo === 'automatico') {
      if (!formData.montoTotal || formData.montoTotal <= 0) {
        newErrors.montoTotal = 'El monto debe ser mayor a 0';
      }
    } else {
      const interes = modoManual.montoInteres || 0;
      const capital = modoManual.montoCapital || 0;
      
      if (interes <= 0 && capital <= 0) {
        newErrors.modoManual = 'Debe especificar al menos interés o capital mayor a 0';
      }
      
      if (capital > prestamo.capitalRestante) {
        newErrors.modoManual = `El capital no puede ser mayor al capital restante (RD$ ${formatMonto(prestamo.capitalRestante)})`;
      }
    }

    if (!formData.fechaPago) {
      newErrors.fechaPago = 'La fecha es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      let datosPago = {
        prestamoID: prestamo.id,
        fechaPago: formData.fechaPago,
        nota: formData.nota,
        tipoPago: formData.tipoPago,
        modoCalculo: formData.modoCalculo,
        capitalAnterior: prestamo.capitalRestante
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
        throw new Error(response.error || 'Error al registrar pago');
      }

    } catch (error) {
      console.error('Error registrando pago:', error);
      
      let errorMessage = error.message || 'Error interno del servidor';
      
      if (error.message?.includes('NETWORK_ERROR') || error.message?.includes('SERVER_UNREACHABLE')) {
        errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en el puerto 5001.';
      } else if (error.message?.includes('TIMEOUT_ERROR')) {
        errorMessage = 'La solicitud está tardando demasiado. Verifica tu conexión e intenta nuevamente.';
      }

      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    if (onPagoRegistrado) {
      onPagoRegistrado();
    } else if (onSave) {
      onSave();
    }
    if (onClose) onClose();
  };

  const interesSugerido = prestamo 
    ? (prestamo.capitalRestante * prestamo.interesPercent) / 100
    : 0;

  const tieneMora = calculosAvanzados.diasAtraso > configMora.diasGracia;

  const AlertaMora = () => (
    <div className={`p-4 rounded-lg mb-4 ${
      calculosAvanzados.diasAtraso > configMora.diasGracia 
        ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800' 
        : 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
    }`}>
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
          calculosAvanzados.diasAtraso > configMora.diasGracia ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
        }`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            calculosAvanzados.diasAtraso > configMora.diasGracia ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'
          }`}>
            {calculosAvanzados.diasAtraso > 0 ? 'Préstamo con atraso' : 'Préstamo al día'}
          </p>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
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
  );

  const isModal = onClose !== undefined;

  const renderFormContent = () => (
    <div className="space-y-6">
      {!isModal && (
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            disabled={loading}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Registrar Pago</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Registra un pago para {prestamo?.clienteNombre}
            </p>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      {calculosAvanzados.diasAtraso > 0 && <AlertaMora />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className={`shadow rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Resumen del Préstamo</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Capital restante:</span>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>RD$ {formatMonto(prestamo?.capitalRestante)}</p>
                  </div>
                  <div>
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Interés actual ({prestamo?.interesPercent}%):</span>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>RD$ {formatMonto(interesSugerido)}</p>
                  </div>
                  <div>
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Frecuencia:</span>
                    <p className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prestamo?.frecuencia}</p>
                  </div>
                  <div>
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Próximo pago esperado:</span>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {prestamo?.fechaProximoPago ? formatFecha(prestamo.fechaProximoPago) : 'Por definir'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">Modo de Cálculo</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {formData.modoCalculo === 'automatico' 
                      ? 'El sistema calcula automáticamente según días transcurridos' 
                      : 'Define manualmente los montos'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleModoCalculo}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                  disabled={loading}
                >
                  <CogIcon className="h-4 w-4" />
                  <span>{formData.modoCalculo === 'automatico' ? 'Automático' : 'Manual'}</span>
                </button>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Datos del Pago</h3>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha del Pago *
                  </label>
                  <input
                    type="date"
                    name="fechaPago"
                    value={formData.fechaPago}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    }`}
                    disabled={loading}
                  />
                  {errors.fechaPago && <p className="text-red-600 text-sm mt-1">{errors.fechaPago}</p>}
                </div>

                {formData.modoCalculo === 'automatico' && (
                  <div className="mb-4">
                    <MontoInput
                      label="Monto Total (RD$) *"
                      value={formData.montoTotal}
                      onChange={handleMontoChange}
                      error={errors.montoTotal}
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
                )}

                {formData.modoCalculo === 'manual' && (
                  <div className="space-y-4 mb-4">
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
                        error={modoManual.montoCapital > prestamo?.capitalRestante ? `Máximo: ${formatMonto(prestamo?.capitalRestante)}` : ''}
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
                    
                    {errors.modoManual && (
                      <p className="text-red-600 text-sm mt-2">{errors.modoManual}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo de Pago
                    </label>
                    <select
                      name="tipoPago"
                      value={formData.tipoPago}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      disabled={loading}
                    >
                      <option value="normal">Normal</option>
                      <option value="adelantado">Adelantado</option>
                      <option value="mora">Pago de Mora</option>
                      <option value="abono">Abono Extra a Capital</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nota (Opcional)
                    </label>
                    <textarea
                      name="nota"
                      value={formData.nota}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="Ej: Pago en efectivo, transferencia, pago extra, etc."
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex justify-end space-x-3 ${
              theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <button
                type="button"
                onClick={onCancel || onClose}
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
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrar Pago'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <DistribucionPago 
            distribucion={calculosAvanzados.distribucion}
            configMora={configMora}
            prestamo={prestamo}
          />

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">💡 Sistema EYS - Cómo Funciona</h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• <strong>Automático:</strong> Calcula intereses según días transcurridos</li>
              <li>• <strong>Manual:</strong> Define manualmente interés, capital y mora</li>
              <li>• <strong>Mora:</strong> {configMora.enabled ? `Activada (${configMora.porcentaje}%)` : 'Desactivada'}</li>
              <li>• Días de gracia: {configMora.diasGracia} días</li>
              <li>• <strong>Orden de aplicación:</strong> Mora → Interés → Capital</li>
              <li>• La próxima fecha de pago se calcula automáticamente según el día de pago</li>
              <li>• <strong>ID del pago:</strong> Se genera automáticamente con formato "Nombre-Fecha"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex justify-between items-center p-6 border-b sticky top-0 z-10 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Registrar Pago</h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{prestamo?.clienteNombre}</p>
              </div>
              <button 
                onClick={onClose} 
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                disabled={loading}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {renderFormContent()}
            </div>
          </div>
        </div>
        
        <ConfirmacionPagoModal
          isOpen={showConfirmModal}
          onClose={handleConfirmClose}
          pagoData={ultimoPagoData}
          prestamo={prestamo}
        />
      </>
    );
  }

  return (
    <>
      {renderFormContent()}
      <ConfirmacionPagoModal
        isOpen={showConfirmModal}
        onClose={handleConfirmClose}
        pagoData={ultimoPagoData}
        prestamo={prestamo}
      />
    </>
  );
};

export default RegistrarPago;