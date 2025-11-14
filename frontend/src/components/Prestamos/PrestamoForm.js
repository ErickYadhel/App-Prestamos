import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const PrestamoForm = ({ prestamo, clientes = [], onSave, onCancel, error }) => {
  const [formData, setFormData] = useState({
    clienteID: '',
    clienteNombre: '',
    montoPrestado: '',
    interesPercent: '',
    frecuencia: 'quincenal',
    fechaPrestamo: new Date().toISOString().split('T')[0],
    estado: 'activo',
    nota: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    if (prestamo) {
      // Cargar datos del préstamo existente
      setFormData({
        clienteID: prestamo.clienteID || '',
        clienteNombre: prestamo.clienteNombre || '',
        montoPrestado: prestamo.montoPrestado || '',
        interesPercent: prestamo.interesPercent || '',
        frecuencia: prestamo.frecuencia || 'quincenal',
        fechaPrestamo: prestamo.fechaPrestamo ? 
          new Date(prestamo.fechaPrestamo).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        estado: prestamo.estado || 'activo',
        nota: prestamo.nota || ''
      });

      // Buscar información del cliente si está disponible
      if (prestamo.clienteID && clientes.length > 0) {
        const cliente = clientes.find(c => c.id === prestamo.clienteID);
        if (cliente) {
          setClienteSeleccionado(cliente);
        }
      }
    }
  }, [prestamo, clientes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si cambia el cliente, actualizar nombre automáticamente
    if (name === 'clienteID') {
      const cliente = clientes.find(c => c.id === value);
      if (cliente) {
        setClienteSeleccionado(cliente);
        setFormData(prev => ({
          ...prev,
          clienteNombre: cliente.nombre
        }));
      } else {
        setClienteSeleccionado(null);
        setFormData(prev => ({
          ...prev,
          clienteNombre: ''
        }));
      }
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clienteID) newErrors.clienteID = 'Selecciona un cliente';
    if (!formData.montoPrestado || formData.montoPrestado <= 0) {
      newErrors.montoPrestado = 'Monto debe ser mayor a 0';
    }
    if (!formData.interesPercent || formData.interesPercent <= 0) {
      newErrors.interesPercent = 'Interés debe ser mayor a 0';
    }
    if (formData.interesPercent > 50) {
      newErrors.interesPercent = 'Interés no puede ser mayor al 50%';
    }
    if (!formData.frecuencia) newErrors.frecuencia = 'Selecciona una frecuencia';
    if (!formData.fechaPrestamo) newErrors.fechaPrestamo = 'Fecha es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calcularInteresQuincenal = () => {
    if (!formData.montoPrestado || !formData.interesPercent) return 0;
    return (parseFloat(formData.montoPrestado) * parseFloat(formData.interesPercent)) / 100;
  };

  const calcularInteresMensual = () => {
    const interesQuincenal = calcularInteresQuincenal();
    return interesQuincenal * 2;
  };

  const calcularPagoTotalPrimeraQuincena = () => {
    if (!formData.montoPrestado) return 0;
    return parseFloat(formData.montoPrestado) + calcularInteresQuincenal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const prestamoData = {
        ...formData,
        montoPrestado: parseFloat(formData.montoPrestado),
        interesPercent: parseFloat(formData.interesPercent),
        capitalRestante: parseFloat(formData.montoPrestado)
      };

      await onSave(prestamoData);
    } catch (error) {
      console.error('Error en el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientesActivos = clientes.filter(cliente => cliente.activo !== false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onCancel}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {prestamo ? 'Editar Préstamo' : 'Nuevo Préstamo'}
          </h1>
          <p className="text-gray-600">
            {prestamo ? 'Actualiza la información del préstamo' : 'Crea un nuevo préstamo para un cliente'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
            <div className="p-6 space-y-6">
              {/* Información del Cliente */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cliente *
                    </label>
                    <select
                      name="clienteID"
                      value={formData.clienteID}
                      onChange={handleChange}
                      className="input-primary"
                      required
                    >
                      <option value="">Seleccionar cliente</option>
                      {clientesActivos.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} - {cliente.cedula} - {cliente.celular}
                        </option>
                      ))}
                    </select>
                    {errors.clienteID && (
                      <p className="text-red-600 text-sm mt-1">{errors.clienteID}</p>
                    )}
                  </div>

                  {clienteSeleccionado && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900">Información del Cliente Seleccionado:</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Cédula:</span>
                          <p className="font-medium">{clienteSeleccionado.cedula}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Teléfono:</span>
                          <p className="font-medium">{clienteSeleccionado.celular}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Trabajo:</span>
                          <p className="font-medium">{clienteSeleccionado.trabajo || 'No especificado'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Sueldo:</span>
                          <p className="font-medium">
                            {clienteSeleccionado.sueldo ? `RD$ ${clienteSeleccionado.sueldo.toLocaleString()}` : 'No especificado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Términos del Préstamo */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Términos del Préstamo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto del Préstamo (RD$) *
                    </label>
                    <input
                      type="number"
                      name="montoPrestado"
                      value={formData.montoPrestado}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: 10000"
                      step="0.01"
                      min="1"
                      required
                    />
                    {errors.montoPrestado && (
                      <p className="text-red-600 text-sm mt-1">{errors.montoPrestado}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tasa de Interés (%) *
                    </label>
                    <input
                      type="number"
                      name="interesPercent"
                      value={formData.interesPercent}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: 10"
                      step="0.1"
                      min="0.1"
                      max="50"
                      required
                    />
                    {errors.interesPercent && (
                      <p className="text-red-600 text-sm mt-1">{errors.interesPercent}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frecuencia de Pago *
                    </label>
                    <select
                      name="frecuencia"
                      value={formData.frecuencia}
                      onChange={handleChange}
                      className="input-primary"
                      required
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                    {errors.frecuencia && (
                      <p className="text-red-600 text-sm mt-1">{errors.frecuencia}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha del Préstamo *
                    </label>
                    <input
                      type="date"
                      name="fechaPrestamo"
                      value={formData.fechaPrestamo}
                      onChange={handleChange}
                      className="input-primary"
                      required
                    />
                    {errors.fechaPrestamo && (
                      <p className="text-red-600 text-sm mt-1">{errors.fechaPrestamo}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Estado y Notas */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Estado y Observaciones</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Préstamo
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="input-primary"
                    >
                      <option value="activo">Activo</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="completado">Completado</option>
                      <option value="moroso">Moroso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas u Observaciones
                    </label>
                    <textarea
                      name="nota"
                      value={formData.nota}
                      onChange={handleChange}
                      rows="3"
                      className="input-primary"
                      placeholder="Observaciones sobre el préstamo, términos especiales, etc."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
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
                {loading ? 'Guardando...' : (prestamo ? 'Actualizar Préstamo' : 'Crear Préstamo')}
              </button>
            </div>
          </form>
        </div>

        {/* Panel de Resumen y Cálculos */}
        <div className="space-y-6">
          {/* Resumen del Préstamo */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Resumen del Préstamo</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Monto Principal:</p>
                  <p className="font-semibold text-lg text-gray-900">
                    RD$ {formData.montoPrestado ? parseFloat(formData.montoPrestado).toLocaleString() : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tasa de Interés:</p>
                  <p className="font-semibold text-lg text-primary-600">
                    {formData.interesPercent || '0'}%
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Proyección de Pagos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interés Quincenal:</span>
                    <span className="font-medium">
                      RD$ {calcularInteresQuincenal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interés Mensual:</span>
                    <span className="font-medium">
                      RD$ {calcularInteresMensual().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-gray-700 font-medium">Primera Quincena:</span>
                    <span className="font-semibold text-primary-600">
                      RD$ {calcularPagoTotalPrimeraQuincena().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {formData.frecuencia && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Frecuencia:</strong> {formData.frecuencia}<br/>
                    <strong>Cliente:</strong> {formData.clienteNombre || 'No seleccionado'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información de Ayuda */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Recomendaciones</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Verifica la información del cliente antes de crear el préstamo</li>
              <li>• Considera la capacidad de pago del cliente al establecer el monto</li>
              <li>• La tasa de interés debe ser competitiva pero rentable</li>
              <li>• Registra observaciones importantes sobre términos especiales</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestamoForm;