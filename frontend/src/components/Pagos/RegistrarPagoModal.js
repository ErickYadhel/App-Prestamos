import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const RegistrarPagoModal = ({ prestamos, onClose, onPagoRegistrado }) => {
  const [formData, setFormData] = useState({
    prestamoID: '',
    montoTotal: '',
    nota: '',
    tipoPago: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [calculo, setCalculo] = useState({
    interes: 0,
    capital: 0,
    capitalAnterior: 0,
    capitalNuevo: 0
  });

  useEffect(() => {
    if (formData.prestamoID) {
      const prestamo = prestamos.find(p => p.id === formData.prestamoID);
      setPrestamoSeleccionado(prestamo);
      if (prestamo && formData.montoTotal) {
        calcularDistribucion(prestamo, parseFloat(formData.montoTotal));
      }
    }
  }, [formData.prestamoID, formData.montoTotal, prestamos]);

  const calcularDistribucion = (prestamo, montoTotal) => {
    const interesCalculado = (prestamo.capitalRestante * prestamo.interesPercent) / 100;
    const interes = Math.min(interesCalculado, montoTotal);
    const capital = montoTotal - interes;
    const capitalAnterior = prestamo.capitalRestante;
    const capitalNuevo = Math.max(0, capitalAnterior - capital);

    setCalculo({
      interes,
      capital,
      capitalAnterior,
      capitalNuevo
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.prestamoID) {
      setError('Selecciona un préstamo');
      return false;
    }
    if (!formData.montoTotal || parseFloat(formData.montoTotal) <= 0) {
      setError('Ingresa un monto válido');
      return false;
    }
    if (parseFloat(formData.montoTotal) < calculo.interes) {
      setError('El monto debe cubrir al menos los intereses');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const pagoData = {
        ...formData,
        montoTotal: parseFloat(formData.montoTotal)
      };

      const response = await api.post('/pagos', pagoData);

      if (response.success) {
        onPagoRegistrado();
      } else {
        throw new Error(response.error || 'Error al registrar el pago');
      }
    } catch (error) {
      console.error('Error registering payment:', error);
      setError(error.message || 'Error interno del servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Registrar Nuevo Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Selección de Préstamo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Préstamo *
            </label>
            <select
              name="prestamoID"
              value={formData.prestamoID}
              onChange={handleChange}
              className="input-primary"
              required
            >
              <option value="">Seleccionar préstamo</option>
              {prestamos.map(prestamo => (
                <option key={prestamo.id} value={prestamo.id}>
                  {prestamo.clienteNombre} - RD$ {prestamo.capitalRestante?.toLocaleString()} (Restante)
                </option>
              ))}
            </select>
          </div>

          {/* Información del Préstamo Seleccionado */}
          {prestamoSeleccionado && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Información del Préstamo
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Capital Restante:</span>
                  <p className="font-semibold">RD$ {prestamoSeleccionado.capitalRestante?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-blue-600">Interés {prestamoSeleccionado.frecuencia}:</span>
                  <p className="font-semibold">{prestamoSeleccionado.interesPercent}%</p>
                </div>
                <div>
                  <span className="text-blue-600">Interés a Pagar:</span>
                  <p className="font-semibold">RD$ {((prestamoSeleccionado.capitalRestante * prestamoSeleccionado.interesPercent) / 100).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-blue-600">Frecuencia:</span>
                  <p className="font-semibold capitalize">{prestamoSeleccionado.frecuencia}</p>
                </div>
              </div>
            </div>
          )}

          {/* Monto y Tipo de Pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Total *
              </label>
              <input
                type="number"
                name="montoTotal"
                value={formData.montoTotal}
                onChange={handleChange}
                className="input-primary"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
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
              >
                <option value="normal">Normal</option>
                <option value="adelantado">Adelantado</option>
                <option value="mora">Mora</option>
                <option value="abono">Abono Capital</option>
              </select>
            </div>
          </div>

          {/* Cálculo de Distribución */}
          {formData.montoTotal && prestamoSeleccionado && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CalculatorIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-medium text-green-900">
                  Distribución del Pago
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">A Interés:</span>
                  <p className="font-semibold">RD$ {calculo.interes.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-green-600">A Capital:</span>
                  <p className="font-semibold">RD$ {calculo.capital.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-green-600">Capital Anterior:</span>
                  <p className="font-semibold">RD$ {calculo.capitalAnterior.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-green-600">Nuevo Capital:</span>
                  <p className="font-semibold">RD$ {calculo.capitalNuevo.toLocaleString()}</p>
                </div>
              </div>
              {calculo.capitalNuevo === 0 && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Este pago completará el préstamo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota u Observación
            </label>
            <textarea
              name="nota"
              value={formData.nota}
              onChange={handleChange}
              rows="3"
              className="input-primary"
              placeholder="Observaciones sobre el pago..."
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
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarPagoModal;