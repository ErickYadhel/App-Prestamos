import React, { useState } from 'react';
import { 
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalculatorIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const AprobarSolicitudModal = ({ solicitud, onClose, onAprobado, onError }) => {
  const [formData, setFormData] = useState({
    montoAprobado: solicitud.montoSolicitado,
    interesPercent: 10,
    frecuencia: solicitud.frecuencia,
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);

  const calcularPagoEstimado = () => {
    const monto = parseFloat(formData.montoAprobado) || 0;
    const plazo = solicitud.plazoMeses;
    const tasaInteres = formData.interesPercent;

    const interesTotal = (monto * tasaInteres * plazo) / 100;
    const totalPagar = monto + interesTotal;

    let pagosPorMes = 1;
    switch (formData.frecuencia) {
      case 'diario': pagosPorMes = 30; break;
      case 'semanal': pagosPorMes = 4; break;
      case 'quincenal': pagosPorMes = 2; break;
      case 'mensual': pagosPorMes = 1; break;
    }

    const pagoPorPeriodo = totalPagar / (plazo * pagosPorMes);

    return {
      interesTotal,
      totalPagar,
      pagoPorPeriodo,
      pagosTotales: plazo * pagosPorMes
    };
  };

  const calculos = calcularPagoEstimado();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put(`/solicitudes/${solicitud.id}/aprobar`, {
        ...formData,
        montoAprobado: parseFloat(formData.montoAprobado),
        interesPercent: parseFloat(formData.interesPercent),
        aprobadoPor: 'admin' // En producción esto vendría del usuario autenticado
      });

      if (response.success) {
        onAprobado();
      } else {
        throw new Error(response.error || 'Error al aprobar la solicitud');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTasaSugerida = () => {
    // Tasas sugeridas basadas en el score y frecuencia
    const baseRate = 8; // Tasa base
    
    // Ajustar según score
    const scoreAdjustment = (100 - (solicitud.scoreAnalisis || 50)) / 100;
    
    // Ajustar según frecuencia
    const frequencyMultiplier = {
      diario: 0.5,
      semanal: 0.8,
      quincenal: 1,
      mensual: 1.2
    };

    return Math.min(20, Math.max(5, baseRate + (scoreAdjustment * 5)) * (frequencyMultiplier[formData.frecuencia] || 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Aprobar Solicitud de Préstamo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información de la Solicitud */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Solicitud Original</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cliente:</span>
                <p className="font-medium">{solicitud.clienteNombre}</p>
              </div>
              <div>
                <span className="text-gray-600">Monto Solicitado:</span>
                <p className="font-medium">RD$ {solicitud.montoSolicitado?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Score:</span>
                <p className="font-medium">{solicitud.scoreAnalisis || 50}/100</p>
              </div>
              <div>
                <span className="text-gray-600">Sueldo:</span>
                <p className="font-medium">RD$ {solicitud.sueldoCliente?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Términos del Préstamo */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Términos del Préstamo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Aprobado (RD$)
                </label>
                <input
                  type="number"
                  name="montoAprobado"
                  value={formData.montoAprobado}
                  onChange={handleChange}
                  className="input-primary"
                  min="1000"
                  max={solicitud.montoSolicitado * 1.2}
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasa de Interés (%)
                </label>
                <input
                  type="number"
                  name="interesPercent"
                  value={formData.interesPercent}
                  onChange={handleChange}
                  className="input-primary"
                  min="5"
                  max="20"
                  step="0.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tasa sugerida: {getTasaSugerida().toFixed(1)}%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia de Pago
                </label>
                <select
                  name="frecuencia"
                  value={formData.frecuencia}
                  onChange={handleChange}
                  className="input-primary"
                >
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                  <option value="semanal">Semanal</option>
                  <option value="diario">Diario</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plazo (Meses)
                </label>
                <input
                  type="number"
                  value={solicitud.plazoMeses}
                  className="input-primary bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Plazo solicitado por el cliente</p>
              </div>
            </div>
          </div>

          {/* Resumen de Cálculos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CalculatorIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-900">Resumen del Préstamo</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Interés Total:</span>
                <p className="font-semibold text-blue-900">
                  RD$ {calculos.interesTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-blue-700">Total a Pagar:</span>
                <p className="font-semibold text-blue-900">
                  RD$ {calculos.totalPagar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-blue-700">Pago por Periodo:</span>
                <p className="font-semibold text-blue-900">
                  RD$ {calculos.pagoPorPeriodo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-blue-700">Total de Pagos:</span>
                <p className="font-semibold text-blue-900">{calculos.pagosTotales}</p>
              </div>
            </div>
          </div>

          {/* Análisis de Riesgo */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Análisis de Riesgo</h4>
                <div className="text-sm text-yellow-700 mt-1 space-y-1">
                  <p>• Ratio Pago/Sueldo: {((calculos.pagoPorPeriodo / (solicitud.sueldoCliente || 1)) * 100).toFixed(1)}%</p>
                  <p>• Capacidad de Pago: {calculos.pagoPorPeriodo <= (solicitud.sueldoCliente * 0.4) ? '✅ Adecuada' : '⚠️ Limitada'}</p>
                  <p>• Riesgo Crediticio: {solicitud.scoreAnalisis >= 70 ? 'Bajo' : solicitud.scoreAnalisis >= 50 ? 'Moderado' : 'Alto'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones para el Cliente
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
              className="input-primary"
              placeholder="Observaciones sobre los términos del préstamo..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Aprobando...' : 'Aprobar y Crear Préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AprobarSolicitudModal;