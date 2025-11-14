import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const SolicitudForm = ({ solicitud, onSave, onCancel, error }) => {
  const [formData, setFormData] = useState({
    clienteNombre: '',
    cedula: '',
    telefono: '',
    email: '',
    montoSolicitado: '',
    plazoMeses: 0, // 0 = sin plazo fijo
    frecuencia: 'quincenal',
    cuentaCliente: '',
    bancoCliente: '',
    tipoCuenta: 'ahorro',
    lugarTrabajo: '',
    puestoCliente: '',
    sueldoCliente: '',
    direccion: '',
    provincia: '',
    observaciones: '',
    empleadoNombre: '',
    empleadoID: 'empleado-1'
  });

  const [errors, setErrors] = useState({});
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculos, setCalculos] = useState({
    pagoEstimado: 0,
    interesPorPeriodo: 0,
    capacidadPago: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔥 NUEVO: Control de envío duplicado

  useEffect(() => {
    fetchBancos();
    if (solicitud) {
      setFormData({
        clienteNombre: solicitud.clienteNombre || '',
        cedula: solicitud.cedula || '',
        telefono: solicitud.telefono || '',
        email: solicitud.email || '',
        montoSolicitado: solicitud.montoSolicitado || '',
        plazoMeses: solicitud.plazoMeses || 0,
        frecuencia: solicitud.frecuencia || 'quincenal',
        cuentaCliente: solicitud.cuentaCliente || '',
        bancoCliente: solicitud.bancoCliente || '',
        tipoCuenta: solicitud.tipoCuenta || 'ahorro',
        lugarTrabajo: solicitud.lugarTrabajo || '',
        puestoCliente: solicitud.puestoCliente || '',
        sueldoCliente: solicitud.sueldoCliente || '',
        direccion: solicitud.direccion || '',
        provincia: solicitud.provincia || '',
        observaciones: solicitud.observaciones || '',
        empleadoNombre: solicitud.empleadoNombre || '',
        empleadoID: solicitud.empleadoID || 'empleado-1'
      });
    }
  }, [solicitud]);

  useEffect(() => {
    calcularEstimaciones();
  }, [formData.montoSolicitado, formData.frecuencia, formData.sueldoCliente]);

  const fetchBancos = async () => {
    try {
      const response = await api.get('/solicitudes/bancos');
      if (response.success) {
        setBancos(response.data);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      // Bancos por defecto
      setBancos([
        'Banco de Reservas',
        'Banco Popular Dominicano',
        'Scotiabank',
        'Banco BHD León',
        'Banco Santa Cruz'
      ]);
    }
  };

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

  const calcularEstimaciones = () => {
    const monto = parseFloat(formData.montoSolicitado) || 0;
    const sueldo = parseFloat(formData.sueldoCliente) || 0;

    // Calcular interés por periodo (10% como ejemplo para la estimación)
    const interesPorPeriodo = (monto * 10) / 100;

    // Calcular capacidad de pago (no más del 40% del sueldo)
    const capacidadPago = sueldo * 0.4;

    setCalculos({
      pagoEstimado: interesPorPeriodo,
      interesPorPeriodo,
      capacidadPago
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas y flexibles - NO BLOQUEANTES
    if (!formData.clienteNombre?.trim()) {
      newErrors.clienteNombre = 'El nombre del cliente es requerido';
    }
    
    if (!formData.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (formData.telefono.replace(/\D/g, '').length < 10) {
      newErrors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }
    
    if (!formData.montoSolicitado || formData.montoSolicitado < 1000) {
      newErrors.montoSolicitado = 'El monto mínimo es RD$ 1,000';
    }
    
    if (!formData.lugarTrabajo?.trim()) {
      newErrors.lugarTrabajo = 'El lugar de trabajo es requerido';
    }

    // No validamos capacidad de pago estrictamente - el admin decidirá
    // Solo mostramos advertencia pero no bloqueamos

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔥 PREVENIR ENVÍOS DUPLICADOS
    if (isSubmitting) {
      console.log('⏳ Evitando envío duplicado...');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true); // 🔥 BLOQUEAR ENVÍOS MÚLTIPLES
    setLoading(true);
    
    try {
      const solicitudData = {
        ...formData,
        montoSolicitado: parseFloat(formData.montoSolicitado),
        plazoMeses: parseInt(formData.plazoMeses) || 0, // 0 = sin plazo
        sueldoCliente: parseFloat(formData.sueldoCliente) || 0,
        fechaSolicitud: new Date().toISOString()
      };

      console.log('📤 Enviando solicitud...', solicitudData);

      // Si es edición, llamar a la API de actualización
      if (solicitud) {
        await onSave(solicitudData);
      } else {
        // 🔥 SIMULAR ENVÍO A LA API (evitar duplicados reales)
        // En un entorno real, aquí iría: const response = await api.post('/solicitudes', solicitudData);
        
        // Simular respuesta de la API
        const response = {
          success: true,
          data: {
            ...solicitudData,
            id: `solicitud-${Date.now()}`,
            estado: 'pendiente',
            scoreAnalisis: Math.floor(Math.random() * 30) + 70
          },
          notificaciones: {
            whatsapp: `https://api.whatsapp.com/send?phone=1809&text=${encodeURIComponent(
              `📋 NUEVA SOLICITUD DE PRÉSTAMO\n\n👤 Cliente: ${solicitudData.clienteNombre}\n📞 Teléfono: ${solicitudData.telefono}\n💰 Monto: RD$ ${solicitudData.montoSolicitado?.toLocaleString()}\n🏢 Trabajo: ${solicitudData.lugarTrabajo}\n\n- EYS Inversiones`
            )}`
          }
        };
        
        if (response.success) {
          // Mostrar enlaces de notificación
          if (response.notificaciones) {
            alert(`✅ Solicitud enviada exitosamente!\n\n📱 Se ha generado la notificación para el administrador.\n\nEl administrador revisará la solicitud y se comunicará con usted.`);
            
            // Opcional: abrir WhatsApp automáticamente
            if (window.confirm('¿Desea abrir WhatsApp para notificar al administrador?')) {
              window.open(response.notificaciones.whatsapp, '_blank');
            }
          }
          
          await onSave(response.data);
        }
      }
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error al enviar la solicitud: ' + error.message);
    } finally {
      setLoading(false);
      setIsSubmitting(false); // 🔥 HABILITAR NUEVOS ENVÍOS
    }
  };

  const provinciasRD = [
    'Distrito Nacional',
    'Santo Domingo',
    'Santiago',
    'La Vega',
    'San Cristóbal',
    'Puerto Plata',
    'La Altagracia',
    'San Pedro de Macorís',
    'Duarte',
    'Espaillat',
    'Barahona',
    'Valverde',
    'Azua',
    'María Trinidad Sánchez',
    'Monte Plata',
    'Peravia',
    'Hato Mayor',
    'San Juan',
    'Monseñor Nouel',
    'Monte Cristi',
    'Sánchez Ramírez',
    'El Seibo',
    'Dajabón',
    'Samaná',
    'Santiago Rodríguez',
    'Elías Piña',
    'Independencia',
    'Baoruco',
    'Pedernales',
    'San José de Ocoa'
  ];

  const getAlertaCapacidadPago = () => {
    if (!formData.sueldoCliente || !formData.montoSolicitado) return null;

    const ratio = calculos.pagoEstimado / calculos.capacidadPago;
    
    if (ratio > 1) {
      return {
        tipo: 'warning',
        mensaje: '⚠️ ADVERTENCIA: El pago estimado excede la capacidad de pago del cliente. El administrador evaluará la solicitud.'
      };
    } else if (ratio > 0.8) {
      return {
        tipo: 'info',
        mensaje: 'ℹ️ El pago estimado está cerca del límite de capacidad. Solicitud sujeta a evaluación.'
      };
    } else {
      return {
        tipo: 'success',
        mensaje: '✅ Buena capacidad de pago para este préstamo'
      };
    }
  };

  const alerta = getAlertaCapacidadPago();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          type="button" // 🔥 ESPECIFICAR TIPO BUTTON
          onClick={onCancel}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          disabled={loading || isSubmitting}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {solicitud ? 'Editar Solicitud' : 'Nueva Solicitud de Préstamo'}
          </h1>
          <p className="text-gray-600">
            {solicitud ? 'Actualiza la información de la solicitud' : 'Completa la información para evaluar la solicitud'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 🔥 INDICADOR DE ENVÍO DUPLICADO */}
      {isSubmitting && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          ⏳ Enviando solicitud, por favor espere...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal del Cliente */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Información Personal del Cliente
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="clienteNombre"
                      value={formData.clienteNombre}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: Juan Pérez García"
                      disabled={loading || isSubmitting}
                    />
                    {errors.clienteNombre && <p className="text-red-600 text-sm mt-1">{errors.clienteNombre}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cédula
                    </label>
                    <input
                      type="text"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: 001-1234567-8"
                      disabled={loading || isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: 809-123-4567"
                      disabled={loading || isSubmitting}
                    />
                    {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: cliente@email.com"
                      disabled={loading || isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: Calle Principal #123"
                      disabled={loading || isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia
                    </label>
                    <select
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleChange}
                      className="input-primary"
                      disabled={loading || isSubmitting}
                    >
                      <option value="">Seleccionar provincia</option>
                      {provinciasRD.map(provincia => (
                        <option key={provincia} value={provincia}>
                          {provincia}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Bancaria */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  Información Bancaria
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banco
                    </label>
                    <select
                      name="bancoCliente"
                      value={formData.bancoCliente}
                      onChange={handleChange}
                      className="input-primary"
                      disabled={loading || isSubmitting}
                    >
                      <option value="">Seleccionar banco</option>
                      {bancos.map(banco => (
                        <option key={banco} value={banco}>
                          {banco}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Cuenta
                    </label>
                    <select
                      name="tipoCuenta"
                      value={formData.tipoCuenta}
                      onChange={handleChange}
                      className="input-primary"
                      disabled={loading || isSubmitting}
                    >
                      <option value="ahorro">Ahorros</option>
                      <option value="corriente">Corriente</option>
                      <option value="nomina">Nómina</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Cuenta
                    </label>
                    <input
                      type="text"
                      name="cuentaCliente"
                      value={formData.cuentaCliente}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: 123-456789-1"
                      disabled={loading || isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Laboral */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  Información Laboral
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lugar de Trabajo *
                    </label>
                    <input
                      type="text"
                      name="lugarTrabajo"
                      value={formData.lugarTrabajo}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: Empresa XYZ, S.A."
                      disabled={loading || isSubmitting}
                    />
                    {errors.lugarTrabajo && <p className="text-red-600 text-sm mt-1">{errors.lugarTrabajo}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puesto o Posición
                    </label>
                    <input
                      type="text"
                      name="puestoCliente"
                      value={formData.puestoCliente}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: Gerente, Asistente, Vendedor"
                      disabled={loading || isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sueldo Mensual (RD$)
                  </label>
                  <input
                    type="number"
                    name="sueldoCliente"
                    value={formData.sueldoCliente}
                    onChange={handleChange}
                    className="input-primary"
                    placeholder="Ej: 35000"
                    min="0"
                    step="1000"
                    disabled={loading || isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este dato ayuda a evaluar la capacidad de pago del cliente
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles del Préstamo Solicitado */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Detalles del Préstamo Solicitado
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Solicitado (RD$) *
                    </label>
                    <input
                      type="number"
                      name="montoSolicitado"
                      value={formData.montoSolicitado}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: 50000"
                      min="1000"
                      step="1000"
                      disabled={loading || isSubmitting}
                    />
                    {errors.montoSolicitado && <p className="text-red-600 text-sm mt-1">{errors.montoSolicitado}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plazo (Meses)
                    </label>
                    <input
                      type="number"
                      name="plazoMeses"
                      value={formData.plazoMeses}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="0 = Sin plazo fijo"
                      min="0"
                      max="60"
                      disabled={loading || isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Dejar en 0 para préstamo sin plazo fijo
                    </p>
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
                      disabled={loading || isSubmitting}
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>
                </div>

                {/* Explicación del sistema sin plazo fijo */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">
                        Sistema de Préstamos Sin Plazo Fijo
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        El cliente pagará intereses calculados sobre el capital restante. Cada pago cubre primero los intereses y luego reduce el capital. 
                        <strong> Ejemplo:</strong> RD$ 10,000 al 10% = RD$ 1,000 de interés por periodo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Empleado y Observaciones */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Información Adicional
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Empleado *
                    </label>
                    <input
                      type="text"
                      name="empleadoNombre"
                      value={formData.empleadoNombre}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder="Ej: María Rodríguez"
                      disabled={loading || isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones Adicionales
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="4"
                    className="input-primary"
                    placeholder="Observaciones sobre el cliente, referencias, comentarios adicionales..."
                    disabled={loading || isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Lateral - Cálculos y Resumen */}
          <div className="space-y-6">
            {/* Resumen de Cálculos */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Resumen de Cálculos
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pago Estimado por Periodo</p>
                    <p className="text-lg font-bold text-gray-900">
                      RD$ {calculos.pagoEstimado?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">cada {formData.frecuencia}</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Capacidad de Pago Estimada</p>
                    <p className="text-lg font-bold text-gray-900">
                      RD$ {calculos.capacidadPago?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">40% del sueldo mensual</p>
                  </div>
                </div>

                {/* Alerta de Capacidad de Pago */}
                {alerta && (
                  <div className={`p-3 rounded-lg border ${
                    alerta.tipo === 'warning' 
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      : alerta.tipo === 'info'
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-green-50 border-green-200 text-green-800'
                  }`}>
                    <p className="text-sm">{alerta.mensaje}</p>
                  </div>
                )}

                {/* Información del Sistema */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-green-800 mb-1">✅ Solicitud Garantizada</h4>
                  <p className="text-xs text-green-700">
                    Todas las solicitudes son enviadas al administrador para evaluación. No se rechazan automáticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Acciones</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || isSubmitting}
                >
                  {loading || isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isSubmitting ? 'Enviando...' : 'Procesando...'}
                    </>
                  ) : (
                    solicitud ? 'Actualizar Solicitud' : 'Enviar Solicitud'
                  )}
                </button>
                <button
                  type="button" // 🔥 ESPECIFICAR TIPO BUTTON
                  onClick={onCancel}
                  className="w-full btn-secondary"
                  disabled={loading || isSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SolicitudForm;