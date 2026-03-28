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
  InformationCircleIcon
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

const RegistrarPago = ({ prestamo, onSave, onCancel, onClose, onPagoRegistrado }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState({});
  const [mostrarAlertaMora, setMostrarAlertaMora] = useState(false);
  const [calculosAvanzados, setCalculosAvanzados] = useState({
    diasAtraso: 0,
    moraCalculada: 0,
    periodosAtrasados: 0,
    pagosAtrasados: null,
    distribucion: null
  });

  const configMora = getConfiguracionMora();

  useEffect(() => {
    if (prestamo) {
      const fechaPagoSeleccionada = new Date(formData.fechaPago);
      const fechaEsperada = prestamo.fechaProximoPago 
        ? new Date(prestamo.fechaProximoPago) 
        : new Date(prestamo.fechaPrestamo);
      
      const diasAtraso = calcularDiasTranscurridos(fechaEsperada, fechaPagoSeleccionada);
      
      let moraCalculada = 0;
      let periodosAtrasados = 0;
      
      if (diasAtraso > 0) {
        const interesDiario = (prestamo.capitalRestante * prestamo.interesPercent) / 100 / 30;
        moraCalculada = interesDiario * diasAtraso * (configMora.porcentaje / 100);
        
        if (prestamo.frecuencia === 'quincenal') {
          periodosAtrasados = Math.floor(diasAtraso / 15);
        } else if (prestamo.frecuencia === 'mensual') {
          periodosAtrasados = Math.floor(diasAtraso / 30);
        } else if (prestamo.frecuencia === 'semanal') {
          periodosAtrasados = Math.floor(diasAtraso / 7);
        }
        
        setMostrarAlertaMora(diasAtraso > configMora.diasGracia);
      } else {
        setMostrarAlertaMora(false);
      }
      
      setCalculosAvanzados(prev => ({
        ...prev,
        diasAtraso,
        moraCalculada,
        periodosAtrasados,
        pagosAtrasados: null
      }));
      
      if (formData.modoCalculo === 'automatico') {
        const interesBase = (prestamo.capitalRestante * prestamo.interesPercent) / 100;
        const montoSugerido = interesBase + (moraCalculada > 0 ? moraCalculada : 0);
        setFormData(prev => ({
          ...prev,
          montoTotal: montoSugerido.toFixed(2)
        }));
      }
    }
  }, [prestamo, formData.fechaPago]);

  useEffect(() => {
    if (formData.modoCalculo === 'automatico' && formData.montoTotal && prestamo) {
      const monto = parseFloat(formData.montoTotal) || 0;
      const distribucion = calcularDistribucionPago(prestamo, monto);
      
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
  }, [formData.montoTotal, formData.modoCalculo, prestamo]);

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

  const handleModoManualChange = (e) => {
    const { name, value } = e.target;
    const nuevoValor = value === '' ? '' : parseFloat(value) || 0;
    
    setModoManual(prev => ({
      ...prev,
      [name]: nuevoValor.toString()
    }));

    if (prestamo) {
      const interes = parseFloat(modoManual.montoInteres) || 0;
      const capital = parseFloat(modoManual.montoCapital) || 0;
      const mora = parseFloat(modoManual.montoMora) || 0;
      const total = interes + capital + mora;
      
      setFormData(prev => ({
        ...prev,
        montoTotal: total.toString()
      }));
      
      const nuevoCapital = prestamo.capitalRestante - capital;
      setCalculosAvanzados(prev => ({
        ...prev,
        distribucion: {
          interes,
          capital,
          mora,
          restoInteres: 0,
          nuevoCapital: Math.max(0, nuevoCapital),
          prestamoCompletado: nuevoCapital <= 0
        }
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.modoCalculo === 'automatico') {
      if (!formData.montoTotal || parseFloat(formData.montoTotal) <= 0) {
        newErrors.montoTotal = 'El monto debe ser mayor a 0';
      }
    } else {
      const interes = parseFloat(modoManual.montoInteres) || 0;
      const capital = parseFloat(modoManual.montoCapital) || 0;
      
      if (interes <= 0 && capital <= 0) {
        newErrors.modoManual = 'Debe especificar al menos interés o capital mayor a 0';
      }
      
      if (capital > prestamo.capitalRestante) {
        newErrors.modoManual = `El capital no puede ser mayor al capital restante (RD$ ${prestamo.capitalRestante.toLocaleString()})`;
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
        const monto = parseFloat(formData.montoTotal);
        datosPago.montoTotal = monto;
      } else {
        datosPago.montoCapital = parseFloat(modoManual.montoCapital) || 0;
        datosPago.montoInteres = parseFloat(modoManual.montoInteres) || 0;
        datosPago.montoMora = parseFloat(modoManual.montoMora) || 0;
        datosPago.montoTotal = (datosPago.montoCapital + datosPago.montoInteres + datosPago.montoMora);
      }

      const response = await api.post('/pagos', datosPago);

      if (response.success) {
        if (onPagoRegistrado) {
          onPagoRegistrado(response.data?.prestamoActualizado);
        } else if (onSave) {
          onSave();
        }
        if (onClose) onClose();
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

  const isModal = onClose !== undefined;

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
              <p className="text-red-600 dark:text-red-400">• Mora calculada: RD$ {calculosAvanzados.moraCalculada.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>RD$ {prestamo?.capitalRestante?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Interés actual ({prestamo?.interesPercent}%):</span>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>RD$ {((prestamo?.capitalRestante || 0) * (prestamo?.interesPercent || 0) / 100).toLocaleString()}</p>
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
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monto Total (RD$) *
                    </label>
                    <input
                      type="number"
                      name="montoTotal"
                      value={formData.montoTotal}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="Ej: 1500"
                      min="1"
                      step="0.01"
                      disabled={loading}
                    />
                    {errors.montoTotal && <p className="text-red-600 text-sm mt-1">{errors.montoTotal}</p>}
                    <div className="flex items-center space-x-2 mt-2">
                      <InformationCircleIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Monto sugerido: RD$ {(((prestamo?.capitalRestante || 0) * (prestamo?.interesPercent || 0) / 100) + (calculosAvanzados.moraCalculada || 0)).toLocaleString()}
                        {calculosAvanzados.moraCalculada > 0 && ` (incluye RD$ ${calculosAvanzados.moraCalculada.toLocaleString()} de mora)`}
                      </p>
                    </div>
                  </div>
                )}

                {formData.modoCalculo === 'manual' && (
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Monto a Interés (RD$)
                        </label>
                        <input
                          type="number"
                          name="montoInteres"
                          value={modoManual.montoInteres}
                          onChange={handleModoManualChange}
                          className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                          }`}
                          placeholder="Ej: 1000"
                          min="0"
                          step="0.01"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Monto a Capital (RD$)
                        </label>
                        <input
                          type="number"
                          name="montoCapital"
                          value={modoManual.montoCapital}
                          onChange={handleModoManualChange}
                          className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                          }`}
                          placeholder="Ej: 500"
                          min="0"
                          max={prestamo?.capitalRestante}
                          step="0.01"
                          disabled={loading}
                        />
                      </div>

                      {configMora.enabled && (
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Monto por Mora (RD$)
                          </label>
                          <input
                            type="number"
                            name="montoMora"
                            value={modoManual.montoMora}
                            onChange={handleModoManualChange}
                            className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                                : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                            }`}
                            placeholder="Ej: 50"
                            min="0"
                            step="0.01"
                            disabled={loading}
                          />
                        </div>
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
          <div className={`shadow rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center space-x-2 mb-4">
              <CalculatorIcon className="h-5 w-5 text-primary-600" />
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Distribución del Pago</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monto total:</span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  RD$ {(
                    parseFloat(formData.montoTotal) || 0
                  ).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Aplicado a interés:</span>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  RD$ {calculosAvanzados.distribucion?.interes?.toLocaleString() || 0}
                </span>
              </div>

              {configMora.enabled && (
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Aplicado a mora:</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    RD$ {calculosAvanzados.distribucion?.mora?.toLocaleString() || 0}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Aplicado a capital:</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  RD$ {calculosAvanzados.distribucion?.capital?.toLocaleString() || 0}
                </span>
              </div>

              <div className={`border-t pt-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Nuevo capital:</span>
                  <span className={`text-sm font-bold ${calculosAvanzados.distribucion?.prestamoCompletado ? 'text-green-600 dark:text-green-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    RD$ {Math.max(0, calculosAvanzados.distribucion?.nuevoCapital || prestamo?.capitalRestante).toLocaleString()}
                  </span>
                </div>
              </div>

              {calculosAvanzados.distribucion?.prestamoCompletado && (
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

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">💡 Sistema EYS - Cómo Funciona</h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• <strong>Automático:</strong> Calcula intereses según días transcurridos</li>
              <li>• <strong>Manual:</strong> Define manualmente interés, capital y mora</li>
              <li>• <strong>Mora:</strong> {configMora.enabled ? `Activada (${configMora.porcentaje}%)` : 'Desactivada'}</li>
              <li>• Días de gracia: {configMora.diasGracia} días</li>
              <li>• El pago cubre primero interés, luego mora, luego capital</li>
              <li>• La próxima fecha de pago se calcula automáticamente según el día de pago</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
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
    );
  }

  return renderFormContent();
};

export default RegistrarPago;