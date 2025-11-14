import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon, 
  CalculatorIcon, 
  CogIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const RegistrarPago = ({ prestamo, onSave, onCancel, onClose, onPagoRegistrado }) => {
  const [formData, setFormData] = useState({
    montoTotal: '',
    fechaPago: new Date().toISOString().split('T')[0],
    nota: '',
    tipoPago: 'normal',
    modoCalculo: 'automatico'
  });

  const [modoManual, setModoManual] = useState({
    montoInteres: '',
    montoCapital: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [calculos, setCalculos] = useState({
    interesCalculado: 0,
    capitalMaximo: 0,
    distribucion: { interes: 0, capital: 0, restoInteres: 0 },
    nuevoCapital: 0,
    prestamoCompletado: false
  });

  // Inicializar cálculos
  useEffect(() => {
    if (prestamo) {
      const interesCalculado = (prestamo.capitalRestante * prestamo.interesPercent) / 100;
      const capitalMaximo = prestamo.capitalRestante;
      
      setCalculos(prev => ({
        ...prev,
        interesCalculado,
        capitalMaximo,
        nuevoCapital: prestamo.capitalRestante,
        prestamoCompletado: false
      }));

      // Establecer monto total automáticamente en modo automático
      if (formData.modoCalculo === 'automatico' && interesCalculado > 0) {
        setFormData(prev => ({
          ...prev,
          montoTotal: interesCalculado.toString()
        }));

        const distribucion = calcularDistribucionAutomatica(interesCalculado);
        setModoManual({
          montoInteres: distribucion.interes.toFixed(2),
          montoCapital: distribucion.capital.toFixed(2)
        });
      }
    }
  }, [prestamo]);

  // Calcular distribución AUTOMÁTICA según sistema EYS
  const calcularDistribucionAutomatica = (monto) => {
    const interesCalculado = calculos.interesCalculado;
    
    // SISTEMA EYS: Primero se paga TODO el interés, luego lo sobrante va a capital
    if (monto >= interesCalculado) {
      const capital = Math.min(monto - interesCalculado, calculos.capitalMaximo);
      return {
        interes: interesCalculado,
        capital: capital,
        restoInteres: 0
      };
    } else {
      // Si paga menos del interés completo, todo va a interés
      return {
        interes: monto,
        capital: 0,
        restoInteres: interesCalculado - monto
      };
    }
  };

  // Recalcular cuando cambian los datos
  useEffect(() => {
    if (formData.modoCalculo === 'automatico' && formData.montoTotal) {
      const monto = parseFloat(formData.montoTotal) || 0;
      const distribucion = calcularDistribucionAutomatica(monto);
      const nuevoCapital = calculos.capitalMaximo - distribucion.capital;
      
      setCalculos(prev => ({
        ...prev,
        distribucion,
        nuevoCapital,
        prestamoCompletado: nuevoCapital <= 0
      }));

      setModoManual({
        montoInteres: distribucion.interes.toFixed(2),
        montoCapital: distribucion.capital.toFixed(2)
      });
    } else if (formData.modoCalculo === 'manual') {
      const interes = parseFloat(modoManual.montoInteres) || 0;
      const capital = parseFloat(modoManual.montoCapital) || 0;
      const nuevoCapital = calculos.capitalMaximo - capital;
      
      setCalculos(prev => ({
        ...prev,
        distribucion: { interes, capital, restoInteres: 0 },
        nuevoCapital,
        prestamoCompletado: nuevoCapital <= 0
      }));

      setFormData(prev => ({
        ...prev,
        montoTotal: (interes + capital).toString()
      }));
    }
  }, [formData.montoTotal, formData.modoCalculo, modoManual.montoInteres, modoManual.montoCapital]);

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

  const handleModoManualChange = (e) => {
    const { name, value } = e.target;
    const nuevoValor = value === '' ? '' : parseFloat(value) || 0;
    
    setModoManual(prev => ({
      ...prev,
      [name]: nuevoValor.toString()
    }));

    if (errors.modoManual) {
      setErrors(prev => ({
        ...prev,
        modoManual: ''
      }));
    }
  };

  const toggleModoCalculo = () => {
    const nuevoModo = formData.modoCalculo === 'automatico' ? 'manual' : 'automatico';
    
    setFormData(prev => ({
      ...prev,
      modoCalculo: nuevoModo,
      montoTotal: nuevoModo === 'automatico' ? calculos.interesCalculado.toString() : ''
    }));

    if (nuevoModo === 'manual') {
      // Limpiar campos manuales
      setModoManual({
        montoInteres: '',
        montoCapital: ''
      });
    } else {
      // Calcular distribución automática
      const distribucion = calcularDistribucionAutomatica(calculos.interesCalculado);
      setModoManual({
        montoInteres: distribucion.interes.toFixed(2),
        montoCapital: distribucion.capital.toFixed(2)
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
      // Validaciones modo manual
      const interes = parseFloat(modoManual.montoInteres) || 0;
      const capital = parseFloat(modoManual.montoCapital) || 0;
      
      if (interes <= 0 && capital <= 0) {
        newErrors.modoManual = 'Debe especificar al menos interés o capital mayor a 0';
      }
      
      if (capital > calculos.capitalMaximo) {
        newErrors.modoManual = `El capital no puede ser mayor al capital restante (RD$ ${calculos.capitalMaximo.toLocaleString()})`;
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
        modoCalculo: formData.modoCalculo
      };

      if (formData.modoCalculo === 'automatico') {
        datosPago.montoTotal = parseFloat(formData.montoTotal);
      } else {
        datosPago.montoInteres = parseFloat(modoManual.montoInteres) || 0;
        datosPago.montoCapital = parseFloat(modoManual.montoCapital) || 0;
      }

      console.log('Enviando datos de pago:', datosPago);

      const response = await api.post('/pagos', datosPago);

      if (response.success) {
        if (onPagoRegistrado) {
          onPagoRegistrado(response.data);
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

  // Determinar si mostrar como modal o página completa
  const isModal = onClose !== undefined;

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Registrar Pago</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600"
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

  function renderFormContent() {
    return (
      <div className="space-y-6">
        {/* Header para página completa */}
        {!isModal && (
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registrar Pago</h1>
              <p className="text-gray-600">Registra un pago para {prestamo.clienteNombre}</p>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
              <div className="p-6 space-y-6">
                {/* Información del Préstamo */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Resumen del Préstamo</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Capital restante:</span>
                      <p className="font-medium">RD$ {prestamo.capitalRestante?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Interés actual ({prestamo.interesPercent}%):</span>
                      <p className="font-medium">RD$ {calculos.interesCalculado.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Frecuencia:</span>
                      <p className="font-medium capitalize">{prestamo.frecuencia}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Próximo pago:</span>
                      <p className="font-medium">
                        {prestamo.fechaProximoPago ? 
                          new Date(prestamo.fechaProximoPago).toLocaleDateString() : 
                          'Por definir'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selector de Modo */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Modo de Cálculo</h3>
                    <p className="text-xs text-blue-700">
                      {formData.modoCalculo === 'automatico' 
                        ? 'El sistema calcula automáticamente interés y capital' 
                        : 'Tu defines manualmente interés y capital'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleModoCalculo}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                    disabled={loading}
                  >
                    <CogIcon className="h-4 w-4" />
                    <span>{formData.modoCalculo === 'automatico' ? 'Automático' : 'Manual'}</span>
                  </button>
                </div>

                {/* Datos del Pago */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Datos del Pago</h3>
                  
                  {/* Campo Monto Total (solo para modo automático) */}
                  {formData.modoCalculo === 'automatico' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto Total (RD$) *
                      </label>
                      <input
                        type="number"
                        name="montoTotal"
                        value={formData.montoTotal}
                        onChange={handleChange}
                        className="input-primary"
                        placeholder="Ej: 1500"
                        min="1"
                        step="0.01"
                        disabled={loading}
                      />
                      {errors.montoTotal && <p className="text-red-600 text-sm mt-1">{errors.montoTotal}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        El sistema calculará automáticamente interés y capital
                      </p>
                    </div>
                  )}

                  {/* Campos modo manual */}
                  {formData.modoCalculo === 'manual' && (
                    <div className="space-y-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto a Interés (RD$)
                          </label>
                          <input
                            type="number"
                            name="montoInteres"
                            value={modoManual.montoInteres}
                            onChange={handleModoManualChange}
                            className="input-primary"
                            placeholder="Ej: 1000"
                            min="0"
                            step="0.01"
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Interés calculado: RD$ {calculos.interesCalculado.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto a Capital (RD$)
                          </label>
                          <input
                            type="number"
                            name="montoCapital"
                            value={modoManual.montoCapital}
                            onChange={handleModoManualChange}
                            className="input-primary"
                            placeholder="Ej: 500"
                            min="0"
                            max={calculos.capitalMaximo}
                            step="0.01"
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Capital disponible: RD$ {calculos.capitalMaximo.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {errors.modoManual && (
                        <p className="text-red-600 text-sm mt-2">{errors.modoManual}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha del Pago *
                      </label>
                      <input
                        type="date"
                        name="fechaPago"
                        value={formData.fechaPago}
                        onChange={handleChange}
                        className="input-primary"
                        disabled={loading}
                      />
                      {errors.fechaPago && <p className="text-red-600 text-sm mt-1">{errors.fechaPago}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Pago
                      </label>
                      <select
                        name="tipoPago"
                        value={formData.tipoPago}
                        onChange={handleChange}
                        className="input-primary"
                        disabled={loading}
                      >
                        <option value="normal">Normal</option>
                        <option value="adelantado">Adelantado</option>
                        <option value="mora">Pago de Mora</option>
                        <option value="abono">Abono Extra a Capital</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nota (Opcional)
                      </label>
                      <textarea
                        name="nota"
                        value={formData.nota}
                        onChange={handleChange}
                        rows="3"
                        className="input-primary"
                        placeholder="Ej: Pago en efectivo, transferencia, pago extra, etc."
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCancel || onClose}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>

          {/* Distribución y Resumen */}
          <div className="space-y-6">
            {/* Distribución del Pago */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CalculatorIcon className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  {formData.modoCalculo === 'automatico' ? 'Distribución Automática' : 'Distribución Manual'}
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monto total:</span>
                  <span className="text-sm font-medium">
                    RD$ {(
                      parseFloat(formData.montoTotal) || 0
                    ).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Aplicado a interés:</span>
                  <span className="text-sm font-medium text-yellow-600">
                    RD$ {calculos.distribucion.interes.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Aplicado a capital:</span>
                  <span className="text-sm font-medium text-green-600">
                    RD$ {calculos.distribucion.capital.toLocaleString()}
                  </span>
                </div>

                {calculos.distribucion.restoInteres > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interés pendiente:</span>
                    <span className="text-sm font-medium text-red-600">
                      RD$ {calculos.distribucion.restoInteres.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900">Nuevo capital:</span>
                    <span className={`text-sm font-bold ${calculos.prestamoCompletado ? 'text-green-600' : 'text-gray-900'}`}>
                      RD$ {Math.max(0, calculos.nuevoCapital).toLocaleString()}
                    </span>
                  </div>
                </div>

                {calculos.prestamoCompletado && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                      <p className="text-sm font-medium text-green-800">
                        ¡Préstamo será completado!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Sistema EYS */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Sistema EYS - Cómo Funciona</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• <strong>Automático:</strong> Calcula interés completo, sobrante va a capital</li>
                <li>• <strong>Manual:</strong> Tu defines cuánto va a interés y capital</li>
                <li>• El interés se recalcula sobre el nuevo capital</li>
                <li>• Ej: Capital 10,000 al 10% = 1,000 de interés</li>
              </ul>
            </div>

            {/* Estado de Conexión */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Modo Actual</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  formData.modoCalculo === 'automatico' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs text-gray-600 capitalize">{formData.modoCalculo}</span>
              </div>
              {loading && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs text-blue-600">Procesando...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return renderFormContent();
};

export default RegistrarPago;