import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  InformationCircleIcon, 
  CalendarIcon, 
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  getDescripcionFrecuencia,
  obtenerFechasPagoPorFrecuencia,
  DIAS_SEMANA
} from '../../utils/loanCalculations';
import { formatFecha } from '../../utils/firebaseUtils';

const PrestamoForm = ({ prestamo, clientes = [], onSave, onCancel, error }) => {
  const { theme } = useTheme();
  const [garantes, setGarantes] = useState([]);
  const [cargandoGarantes, setCargandoGarantes] = useState(false);
  
  const [formData, setFormData] = useState({
    clienteID: '',
    clienteNombre: '',
    montoPrestado: '',
    interesPercent: '',
    frecuencia: 'quincenal',
    fechaPrestamo: new Date().toISOString().split('T')[0],
    diaPagoPersonalizado: '',
    diaSemana: 'Lunes',
    fechasPersonalizadas: [],
    nuevaFechaPersonalizada: '',
    estado: 'activo',
    nota: '',
    activarMora: false,
    porcentajeMora: 5,
    diasGracia: 3,
    generarComision: false,
    garanteID: '',
    garanteNombre: '',
    porcentajeComision: 50
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fechasPagoPreview, setFechasPagoPreview] = useState([]);

  useEffect(() => {
    const fetchGarantes = async () => {
      try {
        setCargandoGarantes(true);
        const response = await api.get('/garantes');
        if (response.success) {
          setGarantes(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching garantes:', error);
      } finally {
        setCargandoGarantes(false);
      }
    };
    fetchGarantes();
  }, []);

  useEffect(() => {
    if (prestamo) {
      setFormData({
        clienteID: prestamo.clienteID || '',
        clienteNombre: prestamo.clienteNombre || '',
        montoPrestado: prestamo.montoPrestado || '',
        interesPercent: prestamo.interesPercent || '',
        frecuencia: prestamo.frecuencia || 'quincenal',
        fechaPrestamo: prestamo.fechaPrestamo ? 
          new Date(prestamo.fechaPrestamo).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        diaPagoPersonalizado: prestamo.diaPagoPersonalizado || '',
        diaSemana: prestamo.diaSemana || 'Lunes',
        fechasPersonalizadas: prestamo.fechasPersonalizadas || [],
        estado: prestamo.estado || 'activo',
        nota: prestamo.nota || '',
        activarMora: prestamo.activarMora || false,
        porcentajeMora: prestamo.porcentajeMora || 5,
        diasGracia: prestamo.diasGracia || 3,
        generarComision: prestamo.generarComision || false,
        garanteID: prestamo.garanteID || '',
        garanteNombre: prestamo.garanteNombre || '',
        porcentajeComision: prestamo.porcentajeComision || 50
      });

      if (prestamo.clienteID && clientes.length > 0) {
        const cliente = clientes.find(c => c.id === prestamo.clienteID);
        if (cliente) {
          setClienteSeleccionado(cliente);
        }
      }
    }
  }, [prestamo, clientes]);

  const handleGaranteChange = (e) => {
    const garanteId = e.target.value;
    const garante = garantes.find(g => g.id === garanteId);
    setFormData(prev => ({
      ...prev,
      garanteID: garanteId,
      garanteNombre: garante?.nombre || ''
    }));
  };

  useEffect(() => {
    if (formData.fechaPrestamo && formData.frecuencia) {
      const fechaInicio = new Date(formData.fechaPrestamo);
      const config = {
        diaPago: formData.diaPagoPersonalizado ? parseInt(formData.diaPagoPersonalizado) : null,
        diaSemana: formData.diaSemana,
        fechasPersonalizadas: formData.fechasPersonalizadas
      };
      
      const fechas = obtenerFechasPagoPorFrecuencia(
        formData.frecuencia,
        fechaInicio,
        config
      );
      
      setFechasPagoPreview(fechas.slice(0, 4));
    }
  }, [formData.fechaPrestamo, formData.frecuencia, formData.diaPagoPersonalizado, formData.diaSemana, formData.fechasPersonalizadas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAgregarFechaPersonalizada = () => {
    if (formData.nuevaFechaPersonalizada) {
      setFormData(prev => ({
        ...prev,
        fechasPersonalizadas: [...prev.fechasPersonalizadas, prev.nuevaFechaPersonalizada],
        nuevaFechaPersonalizada: ''
      }));
    }
  };

  const handleEliminarFechaPersonalizada = (fecha) => {
    setFormData(prev => ({
      ...prev,
      fechasPersonalizadas: prev.fechasPersonalizadas.filter(f => f !== fecha)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clienteID) newErrors.clienteID = 'Selecciona un cliente';
    if (!formData.montoPrestado || parseFloat(formData.montoPrestado) <= 0) {
      newErrors.montoPrestado = 'Monto debe ser mayor a 0';
    }
    if (!formData.interesPercent || parseFloat(formData.interesPercent) <= 0) {
      newErrors.interesPercent = 'Interés debe ser mayor a 0';
    }
    if (parseFloat(formData.interesPercent) > 50) {
      newErrors.interesPercent = 'Interés no puede ser mayor al 50%';
    }
    if (!formData.frecuencia) newErrors.frecuencia = 'Selecciona una frecuencia';
    if (!formData.fechaPrestamo) newErrors.fechaPrestamo = 'Fecha es requerida';
    
    if (formData.frecuencia === 'mensual' && formData.diaPagoPersonalizado) {
      const dia = parseInt(formData.diaPagoPersonalizado);
      if (dia < 1 || dia > 31) {
        newErrors.diaPagoPersonalizado = 'El día debe estar entre 1 y 31';
      }
    }
    
    if (formData.frecuencia === 'personalizado' && formData.fechasPersonalizadas.length === 0) {
      newErrors.fechasPersonalizadas = 'Debes agregar al menos una fecha de pago';
    }

    if (formData.generarComision && !formData.garanteID) {
      newErrors.garanteID = 'Debe seleccionar un garante para generar comisión';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calcularInteresQuincenal = () => {
    if (!formData.montoPrestado || !formData.interesPercent) return 0;
    return (parseFloat(formData.montoPrestado) * parseFloat(formData.interesPercent)) / 100;
  };

  const calcularInteresDiario = () => {
    return calcularInteresQuincenal() / 15;
  };

  // Función para generar el ID de vista previa
  const generarIdPreview = () => {
    const nombre = clienteSeleccionado?.nombre || formData.clienteNombre || 'cliente';
    const fecha = formData.fechaPrestamo ? new Date(formData.fechaPrestamo) : new Date();
    const nombreLimpio = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear().toString().slice(-2);
    return `${nombreLimpio}${dia}-${mes}-${año}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fechaPrestamo = new Date(formData.fechaPrestamo);
      
      console.log('📅 Fecha préstamo seleccionada:', fechaPrestamo);
      console.log('📅 Frecuencia:', formData.frecuencia);
      console.log('💰 Generar comisión:', formData.generarComision);
      console.log('👤 Garante ID:', formData.garanteID);
      console.log('📊 Porcentaje comisión:', formData.porcentajeComision);
      
      const prestamoData = {
        ...formData,
        montoPrestado: parseFloat(formData.montoPrestado),
        interesPercent: parseFloat(formData.interesPercent),
        capitalRestante: parseFloat(formData.montoPrestado),
        fechaPrestamo: fechaPrestamo,
        diaPagoPersonalizado: formData.frecuencia === 'mensual' && formData.diaPagoPersonalizado ? 
          parseInt(formData.diaPagoPersonalizado) : null,
        diaSemana: formData.frecuencia === 'semanal' ? formData.diaSemana : null,
        fechasPersonalizadas: formData.frecuencia === 'personalizado' ? formData.fechasPersonalizadas : null,
        configuracionMora: formData.activarMora ? {
          enabled: true,
          porcentaje: parseFloat(formData.porcentajeMora),
          diasGracia: parseInt(formData.diasGracia)
        } : null,
        generarComision: formData.generarComision,
        garanteID: formData.garanteID || null,
        garanteNombre: formData.garanteNombre || null,
        porcentajeComision: formData.porcentajeComision
      };

      await onSave(prestamoData);
    } catch (error) {
      console.error('Error en el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientesActivos = clientes.filter(cliente => cliente.activo !== false);
  const interesQuincenal = calcularInteresQuincenal();
  const interesDiario = calcularInteresDiario();

  const getDescripcion = () => {
    const config = {
      diaPago: formData.diaPagoPersonalizado,
      diaSemana: formData.diaSemana,
      fechasPersonalizadas: formData.fechasPersonalizadas
    };
    return getDescripcionFrecuencia(formData.frecuencia, config);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onCancel}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {prestamo ? 'Editar Préstamo' : 'Nuevo Préstamo'}
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
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
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className={`shadow rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6 space-y-6">
              {/* Información del Cliente */}
              <div>
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cliente *
                    </label>
                    <select
                      name="clienteID"
                      value={formData.clienteID}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
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
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Información del Cliente Seleccionado:
                      </h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cédula:</span>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {clienteSeleccionado.cedula}
                          </p>
                        </div>
                        <div>
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Teléfono:</span>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {clienteSeleccionado.celular}
                          </p>
                        </div>
                        <div>
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Trabajo:</span>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {clienteSeleccionado.trabajo || 'No especificado'}
                          </p>
                        </div>
                        <div>
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Sueldo:</span>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Términos del Préstamo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monto del Préstamo (RD$) *
                    </label>
                    <input
                      type="number"
                      name="montoPrestado"
                      value={formData.montoPrestado}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
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
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tasa de Interés (%) *
                    </label>
                    <input
                      type="number"
                      name="interesPercent"
                      value={formData.interesPercent}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
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
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Frecuencia de Pago *
                    </label>
                    <select
                      name="frecuencia"
                      value={formData.frecuencia}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      required
                    >
                      <option value="quincenal">Quincenal (Días 15 y 30)</option>
                      <option value="mensual">Mensual (Día específico)</option>
                      <option value="semanal">Semanal (Día específico)</option>
                      <option value="diario">Diario (Todos los días)</option>
                      <option value="personalizado">Personalizado (Fechas específicas)</option>
                    </select>
                    {errors.frecuencia && (
                      <p className="text-red-600 text-sm mt-1">{errors.frecuencia}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha del Préstamo *
                    </label>
                    <input
                      type="date"
                      name="fechaPrestamo"
                      value={formData.fechaPrestamo}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      required
                    />
                    {errors.fechaPrestamo && (
                      <p className="text-red-600 text-sm mt-1">{errors.fechaPrestamo}</p>
                    )}
                  </div>

                  {formData.frecuencia === 'mensual' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Día de Pago *
                      </label>
                      <input
                        type="number"
                        name="diaPagoPersonalizado"
                        value={formData.diaPagoPersonalizado}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                        }`}
                        placeholder="Ej: 15, 24, 30"
                        min="1"
                        max="31"
                      />
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Día del mes en que se realizarán los pagos
                      </p>
                      {errors.diaPagoPersonalizado && (
                        <p className="text-red-600 text-sm mt-1">{errors.diaPagoPersonalizado}</p>
                      )}
                    </div>
                  )}

                  {formData.frecuencia === 'semanal' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Día de la Semana *
                      </label>
                      <select
                        name="diaSemana"
                        value={formData.diaSemana}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                        }`}
                      >
                        {DIAS_SEMANA.map(dia => (
                          <option key={dia} value={dia}>{dia}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.frecuencia === 'personalizado' && (
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Fechas de Pago *
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="date"
                          value={formData.nuevaFechaPersonalizada}
                          onChange={(e) => setFormData(prev => ({ ...prev, nuevaFechaPersonalizada: e.target.value }))}
                          className={`flex-1 px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleAgregarFechaPersonalizada}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.fechasPersonalizadas.map((fecha, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {formatFecha(fecha)}
                            <button
                              type="button"
                              onClick={() => handleEliminarFechaPersonalizada(fecha)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                      {errors.fechasPersonalizadas && (
                        <p className="text-red-600 text-sm mt-1">{errors.fechasPersonalizadas}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Configuración de Mora */}
              <div>
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Configuración de Mora
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="activarMora"
                      checked={formData.activarMora}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Activar cobro de mora
                    </span>
                  </label>

                  {formData.activarMora && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Porcentaje de Mora (%)
                        </label>
                        <input
                          type="number"
                          name="porcentajeMora"
                          value={formData.porcentajeMora}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                          }`}
                          placeholder="Ej: 5"
                          step="0.5"
                          min="0"
                          max="100"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Días de Gracia
                        </label>
                        <input
                          type="number"
                          name="diasGracia"
                          value={formData.diasGracia}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                          }`}
                          placeholder="Ej: 3"
                          min="0"
                          max="30"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Configuración de Comisión */}
              <div>
                <h3 className={`text-lg font-medium mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <GiftIcon className="h-5 w-5 mr-2 text-red-600" />
                  Configuración de Comisión
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="generarComision"
                      checked={formData.generarComision}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Generar comisión para garante
                    </span>
                  </label>

                  {formData.generarComision && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Garante *
                        </label>
                        <select
                          value={formData.garanteID}
                          onChange={handleGaranteChange}
                          className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                            errors.garanteID ? 'border-red-500' :
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                          }`}
                          disabled={cargandoGarantes}
                        >
                          <option value="">Seleccionar garante</option>
                          {garantes.map(garante => (
                            <option key={garante.id} value={garante.id}>
                              {garante.nombre} - {garante.telefono || 'Sin teléfono'}
                            </option>
                          ))}
                        </select>
                        {errors.garanteID && <p className="text-red-500 text-xs mt-1">{errors.garanteID}</p>}
                        {cargandoGarantes && (
                          <p className="text-xs text-gray-500 mt-1">Cargando garantes...</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          El garante recibirá el {formData.porcentajeComision}% del interés pagado por el cliente
                        </p>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Porcentaje de Comisión (%)
                        </label>
                        <input
                          type="number"
                          name="porcentajeComision"
                          value={formData.porcentajeComision}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                          }`}
                          min="0"
                          max="100"
                          step="5"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Porcentaje del interés que recibirá el garante (Ej: 50% = 5% del 10%)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado y Notas */}
              <div>
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Estado y Observaciones
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Estado del Préstamo
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                    >
                      <option value="activo">Activo</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="completado">Completado</option>
                      <option value="moroso">Moroso</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notas u Observaciones
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
                      placeholder="Observaciones sobre el préstamo, términos especiales, etc."
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
                onClick={onCancel}
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
                {loading ? 'Guardando...' : (prestamo ? 'Actualizar Préstamo' : 'Crear Préstamo')}
              </button>
            </div>
          </form>
        </div>

        {/* Panel de Resumen */}
        <div className="space-y-6">
          <div className={`shadow rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Resumen del Préstamo
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monto Principal:</p>
                  <p className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    RD$ {formData.montoPrestado ? parseFloat(formData.montoPrestado).toLocaleString() : '0'}
                  </p>
                </div>
                <div>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tasa de Interés:</p>
                  <p className="font-semibold text-lg text-primary-600">
                    {formData.interesPercent || '0'}%
                  </p>
                </div>
              </div>

              {/* ID del Préstamo - Vista Previa */}
              <div className="flex justify-between border-t pt-2">
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>ID del Préstamo:</span>
                <span className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {generarIdPreview()}
                </span>
              </div>

              <div className={`border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Configuración de Pagos
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Frecuencia:</span>
                    <span className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {getDescripcion()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Interés Diario:</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      RD$ {interesDiario.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Interés Quincenal:</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      RD$ {interesQuincenal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {formData.generarComision && formData.garanteID && (
                <div className={`border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className={`font-medium mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <GiftIcon className="h-4 w-4 mr-1 text-red-600" />
                    Comisión
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Garante:</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formData.garanteNombre || 'Seleccionado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Porcentaje:</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formData.porcentajeComision}% del interés
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Comisión por período:</span>
                      <span className={`font-medium text-purple-600 dark:text-purple-400`}>
                        RD$ {(interesQuincenal * formData.porcentajeComision / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {fechasPagoPreview.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Vista previa de fechas de pago:
                    </span>
                  </div>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    {fechasPagoPreview.map((fecha, index) => (
                      <li key={index}>• {formatFecha(fecha)}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                    * Las fechas reales serán calculadas por el sistema al crear el préstamo
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    {formData.frecuencia === 'quincenal' && 'Los pagos se realizarán los días 15 y 30 de cada mes.'}
                    {formData.frecuencia === 'mensual' && `Los pagos se realizarán el día ${formData.diaPagoPersonalizado || '15'} de cada mes.`}
                    {formData.frecuencia === 'semanal' && `Los pagos se realizarán todos los ${formData.diaSemana}.`}
                    {formData.frecuencia === 'diario' && 'Los pagos se realizarán todos los días.'}
                    {formData.frecuencia === 'personalizado' && 'Los pagos se realizarán en las fechas seleccionadas.'}
                    {formData.activarMora && ` La mora será del ${formData.porcentajeMora}% sobre el interés adeudado después de ${formData.diasGracia} días de gracia.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestamoForm;