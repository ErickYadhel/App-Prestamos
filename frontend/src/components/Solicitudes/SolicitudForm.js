import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  MapPinIcon,
  IdentificationIcon,
  BriefcaseIcon,
  CalendarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalculatorIcon,
  XMarkIcon,
  ClockIcon,
  GiftIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SolicitudForm = ({ solicitud, onSave, onCancel, error, bancos = [] }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [garantes, setGarantes] = useState([]);
  const [cargandoGarantes, setCargandoGarantes] = useState(false);
  
  const [formData, setFormData] = useState({
    clienteNombre: '',
    cedula: '',
    telefono: '',
    email: '',
    montoSolicitado: '',
    plazoMeses: 0,
    frecuencia: 'quincenal',
    cuentaCliente: '',
    bancoCliente: '',
    tipoCuenta: 'ahorro',
    lugarTrabajo: '',
    puestoCliente: '',
    sueldoCliente: '',
    fechaIngreso: '',
    direccion: '',
    provincia: '',
    garantia: '',
    observaciones: '',
    empleadoNombre: user?.nombre || '',
    empleadoID: user?.id || 'empleado-1',
    // NUEVOS CAMPOS DE COMISIÓN
    generarComision: false,
    garanteID: '',
    garanteNombre: '',
    porcentajeComision: 50
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [calculos, setCalculos] = useState({
    pagoEstimado: 0,
    interesPorPeriodo: 0,
    capacidadPago: 0,
    ratioDeuda: 0,
    anosAntiguedad: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar garantes al montar el componente
  useEffect(() => {
    const fetchGarantes = async () => {
      try {
        setCargandoGarantes(true);
        const response = await api.get('/garantes');
        if (response.success) {
          setGarantes(response.data);
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
        fechaIngreso: solicitud.fechaIngreso || '',
        direccion: solicitud.direccion || '',
        provincia: solicitud.provincia || '',
        garantia: solicitud.garantia || '',
        observaciones: solicitud.observaciones || '',
        empleadoNombre: solicitud.empleadoNombre || user?.nombre || '',
        empleadoID: solicitud.empleadoID || user?.id || 'empleado-1',
        generarComision: solicitud.generarComision || false,
        garanteID: solicitud.garanteID || '',
        garanteNombre: solicitud.garanteNombre || '',
        porcentajeComision: solicitud.porcentajeComision || 50
      });
    }
  }, [solicitud, user]);

  useEffect(() => {
    calcularEstimaciones();
  }, [formData.montoSolicitado, formData.frecuencia, formData.sueldoCliente, formData.plazoMeses, formData.fechaIngreso]);

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

  const handleGaranteChange = (e) => {
    const garanteId = e.target.value;
    const garante = garantes.find(g => g.id === garanteId);
    setFormData(prev => ({
      ...prev,
      garanteID: garanteId,
      garanteNombre: garante?.nombre || ''
    }));
  };

  const calcularEstimaciones = () => {
    const monto = parseFloat(formData.montoSolicitado) || 0;
    const sueldo = parseFloat(formData.sueldoCliente) || 0;
    const plazo = parseInt(formData.plazoMeses) || 12;
    const tasaInteres = 10;

    const interesPorPeriodo = (monto * tasaInteres) / 100;
    const capacidadPago = sueldo * 0.4;

    let pagosPorMes = 1;
    switch (formData.frecuencia) {
      case 'diario': pagosPorMes = 30; break;
      case 'semanal': pagosPorMes = 4; break;
      case 'quincenal': pagosPorMes = 2; break;
      case 'mensual': pagosPorMes = 1; break;
    }

    const pagoPorPeriodo = interesPorPeriodo;
    const ratioDeuda = sueldo > 0 ? (monto / sueldo) : 0;

    let anosAntiguedad = 0;
    if (formData.fechaIngreso) {
      const fechaIngreso = new Date(formData.fechaIngreso);
      const hoy = new Date();
      const diffTime = Math.abs(hoy - fechaIngreso);
      anosAntiguedad = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    }

    setCalculos({
      pagoEstimado: pagoPorPeriodo,
      interesPorPeriodo,
      capacidadPago,
      ratioDeuda,
      anosAntiguedad
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clienteNombre?.trim()) {
      newErrors.clienteNombre = 'El nombre del cliente es requerido';
    }
    
    if (!formData.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (formData.telefono.replace(/\D/g, '').length < 10) {
      newErrors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }
    
    if (!formData.montoSolicitado || parseFloat(formData.montoSolicitado) < 1000) {
      newErrors.montoSolicitado = 'El monto mínimo es RD$ 1,000';
    }
    
    if (!formData.lugarTrabajo?.trim()) {
      newErrors.lugarTrabajo = 'El lugar de trabajo es requerido';
    }

    if (!formData.cedula?.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar comisión si está activada
    if (formData.generarComision && !formData.garanteID) {
      newErrors.garanteID = 'Debe seleccionar un garante para generar comisión';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para calcular el score de riesgo REAL
  const calcularScoreReal = () => {
    let score = 0;
    const monto = parseFloat(formData.montoSolicitado) || 0;
    const sueldo = parseFloat(formData.sueldoCliente) || 0;
    const ratio = sueldo > 0 ? monto / sueldo : Infinity;

    console.log('📊 Calculando score real:');
    console.log('  - Monto:', monto);
    console.log('  - Sueldo:', sueldo);
    console.log('  - Ratio:', ratio);

    // 1. Capacidad de pago (40% del score)
    if (ratio <= 0.3) {
      score += 40;
      console.log('  ✓ Capacidad de pago: Excelente (+40)');
    } else if (ratio <= 0.5) {
      score += 30;
      console.log('  ✓ Capacidad de pago: Buena (+30)');
    } else if (ratio <= 0.7) {
      score += 20;
      console.log('  ✓ Capacidad de pago: Aceptable (+20)');
    } else if (ratio <= 1) {
      score += 10;
      console.log('  ✓ Capacidad de pago: Limitada (+10)');
    } else {
      console.log('  ✓ Capacidad de pago: Crítica (+0)');
    }

    // 2. Estabilidad laboral (15% del score)
    if (formData.lugarTrabajo && formData.puestoCliente) {
      score += 15;
      console.log('  ✓ Estabilidad laboral: Completa (+15)');
    } else if (formData.lugarTrabajo) {
      score += 10;
      console.log('  ✓ Estabilidad laboral: Parcial (+10)');
    } else {
      console.log('  ✓ Estabilidad laboral: Sin información (+0)');
    }

    // 3. Información bancaria (15% del score)
    if (formData.bancoCliente && formData.cuentaCliente && formData.tipoCuenta) {
      score += 15;
      console.log('  ✓ Información bancaria: Completa (+15)');
    } else if (formData.bancoCliente) {
      score += 10;
      console.log('  ✓ Información bancaria: Parcial (+10)');
    } else {
      console.log('  ✓ Información bancaria: Sin información (+0)');
    }

    // 4. Garantía (15% del score)
    const garantias = { 'hipotecaria': 15, 'prendaria': 12, 'fiduciaria': 10, 'personal': 8, 'ninguna': 5 };
    const puntajeGarantia = garantias[formData.garantia?.toLowerCase()] || 5;
    score += puntajeGarantia;
    console.log(`  ✓ Garantía: ${formData.garantia || 'ninguna'} (+${puntajeGarantia})`);

    // 5. Plazo (15% del score)
    const plazo = parseInt(formData.plazoMeses) || 0;
    if (plazo === 0 || plazo <= 12) {
      score += 15;
      console.log(`  ✓ Plazo: ${plazo === 0 ? 'Flexible' : `${plazo} meses`} (+15)`);
    } else if (plazo <= 24) {
      score += 10;
      console.log(`  ✓ Plazo: ${plazo} meses (+10)`);
    } else {
      score += 5;
      console.log(`  ✓ Plazo: ${plazo} meses (+5)`);
    }

    // 6. Antigüedad laboral (bonus adicional)
    if (calculos.anosAntiguedad >= 3) {
      score += 5;
      console.log(`  ✓ Antigüedad: ${calculos.anosAntiguedad.toFixed(1)} años (+5)`);
    } else if (calculos.anosAntiguedad >= 1) {
      score += 3;
      console.log(`  ✓ Antigüedad: ${calculos.anosAntiguedad.toFixed(1)} años (+3)`);
    } else if (calculos.anosAntiguedad > 0) {
      score += 1;
      console.log(`  ✓ Antigüedad: ${calculos.anosAntiguedad.toFixed(1)} años (+1)`);
    }

    score = Math.min(100, Math.max(0, score));
    console.log('🎯 Score total calculado:', score);
    
    return score;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);
    
    try {
      const scoreCalculado = calcularScoreReal();
      
      const solicitudData = {
        clienteNombre: formData.clienteNombre.trim(),
        cedula: formData.cedula.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        montoSolicitado: parseFloat(formData.montoSolicitado),
        plazoMeses: parseInt(formData.plazoMeses) || 0,
        frecuencia: formData.frecuencia,
        cuentaCliente: formData.cuentaCliente.trim(),
        bancoCliente: formData.bancoCliente,
        tipoCuenta: formData.tipoCuenta,
        lugarTrabajo: formData.lugarTrabajo.trim(),
        puestoCliente: formData.puestoCliente.trim(),
        sueldoCliente: parseFloat(formData.sueldoCliente) || 0,
        fechaIngreso: formData.fechaIngreso || null,
        direccion: formData.direccion.trim(),
        provincia: formData.provincia,
        garantia: formData.garantia,
        observaciones: formData.observaciones.trim(),
        empleadoNombre: formData.empleadoNombre,
        empleadoID: formData.empleadoID,
        scoreAnalisis: scoreCalculado,
        fechaSolicitud: new Date().toISOString(),
        // NUEVOS CAMPOS DE COMISIÓN
        generarComision: formData.generarComision,
        garanteID: formData.garanteID || null,
        garanteNombre: formData.garanteNombre || null,
        porcentajeComision: formData.porcentajeComision
      };

      console.log('📤 Enviando solicitud con todos los campos:', solicitudData);

      await onSave(solicitudData);
      
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error al enviar la solicitud: ' + error.message);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const provinciasRD = [
    'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Vega', 'San Cristóbal',
    'Puerto Plata', 'La Altagracia', 'San Pedro de Macorís', 'Duarte', 'Espaillat',
    'Barahona', 'Valverde', 'Azua', 'María Trinidad Sánchez', 'Monte Plata',
    'Peravia', 'Hato Mayor', 'San Juan', 'Monseñor Nouel', 'Monte Cristi',
    'Sánchez Ramírez', 'El Seibo', 'Dajabón', 'Samaná', 'Santiago Rodríguez',
    'Elías Piña', 'Independencia', 'Baoruco', 'Pedernales', 'San José de Ocoa'
  ];

  const tiposGarantia = [
    { value: 'hipotecaria', label: 'Hipotecaria (Bien inmueble)' },
    { value: 'prendaria', label: 'Prendaria (Vehículo, electrodomésticos)' },
    { value: 'fiduciaria', label: 'Fiduciaria (Confianza personal)' },
    { value: 'personal', label: 'Personal (Aval de persona)' },
    { value: 'ninguna', label: 'Ninguna' }
  ];

  const getAlertaCapacidadPago = () => {
    if (!formData.sueldoCliente || !formData.montoSolicitado) return null;

    const ratio = calculos.ratioDeuda;
    
    if (ratio > 3) {
      return {
        tipo: 'danger',
        mensaje: '⚠️ ALTO RIESGO: El monto solicitado es más de 3 veces el sueldo. Esta solicitud tiene baja probabilidad de aprobación.'
      };
    } else if (ratio > 2) {
      return {
        tipo: 'warning',
        mensaje: '⚠️ ADVERTENCIA: El monto solicitado es más de 2 veces el sueldo. El administrador evaluará con precaución.'
      };
    } else if (ratio > 1) {
      return {
        tipo: 'info',
        mensaje: 'ℹ️ El monto solicitado supera el sueldo del cliente. Solicitud sujeta a evaluación.'
      };
    } else if (ratio > 0.5) {
      return {
        tipo: 'success',
        mensaje: '✅ Buena capacidad de pago. El monto solicitado es razonable respecto al sueldo.'
      };
    } else {
      return {
        tipo: 'success',
        mensaje: '✅ Excelente capacidad de pago. El monto solicitado es muy bajo respecto al sueldo.'
      };
    }
  };

  const alerta = getAlertaCapacidadPago();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          disabled={loading || isSubmitting}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {solicitud ? 'Editar Solicitud' : 'Nueva Solicitud de Préstamo'}
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {solicitud ? 'Actualiza la información de la solicitud' : 'Completa la información para evaluar la solicitud'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal del Cliente */}
            <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <UserIcon className="h-5 w-5 mr-2 text-red-600" />
                  Información Personal del Cliente
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="clienteNombre"
                      value={formData.clienteNombre}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        errors.clienteNombre ? 'border-red-500' : 
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Ej: Juan Pérez García"
                      disabled={loading || isSubmitting}
                    />
                    {errors.clienteNombre && <p className="text-red-500 text-xs mt-1">{errors.clienteNombre}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cédula *
                    </label>
                    <input
                      type="text"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        errors.cedula ? 'border-red-500' : 
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Ej: 001-1234567-8"
                      disabled={loading || isSubmitting}
                    />
                    {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        errors.telefono ? 'border-red-500' : 
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Ej: 809-123-4567"
                      disabled={loading || isSubmitting}
                    />
                    {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        errors.email ? 'border-red-500' : 
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Ej: cliente@email.com"
                      disabled={loading || isSubmitting}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Ej: Calle Principal #123"
                      disabled={loading || isSubmitting}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Provincia
                    </label>
                    <select
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
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
            <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <BanknotesIcon className="h-5 w-5 mr-2 text-red-600" />
                  Información Bancaria
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Banco
                    </label>
                    <select
                      name="bancoCliente"
                      value={formData.bancoCliente}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
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
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo de Cuenta
                    </label>
                    <select
                      name="tipoCuenta"
                      value={formData.tipoCuenta}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      disabled={loading || isSubmitting}
                    >
                      <option value="ahorro">Ahorros</option>
                      <option value="corriente">Corriente</option>
                      <option value="nomina">Nómina</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Número de Cuenta
                    </label>
                    <input
                      type="text"
                      name="cuentaCliente"
                      value={formData.cuentaCliente}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Ej: 123-456789-1"
                      disabled={loading || isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Laboral */}
            <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-red-600" />
                  Información Laboral
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lugar de Trabajo *
                    </label>
                    <input
                      type="text"
                      name="lugarTrabajo"
                      value={formData.lugarTrabajo}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        errors.lugarTrabajo ? 'border-red-500' : 
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Ej: Empresa XYZ, S.A."
                      disabled={loading || isSubmitting}
                    />
                    {errors.lugarTrabajo && <p className="text-red-500 text-xs mt-1">{errors.lugarTrabajo}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Puesto o Posición
                    </label>
                    <input
                      type="text"
                      name="puestoCliente"
                      value={formData.puestoCliente}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Ej: Gerente, Asistente, Vendedor"
                      disabled={loading || isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sueldo Mensual (RD$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">RD$</span>
                      <input
                        type="number"
                        name="sueldoCliente"
                        value={formData.sueldoCliente}
                        onChange={handleChange}
                        step="0.01"
                        className={`w-full pl-12 pr-4 py-2 rounded-lg border-2 text-sm ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                        placeholder="35,000.00"
                        min="0"
                        disabled={loading || isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Ingrese el sueldo mensual del cliente (puede usar decimales)
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha de Ingreso
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="fechaIngreso"
                        value={formData.fechaIngreso}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border-2 text-sm ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                        disabled={loading || isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Fecha en que el cliente comenzó a trabajar en la empresa
                    </p>
                    {calculos.anosAntiguedad > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Antigüedad: {calculos.anosAntiguedad.toFixed(1)} años
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles del Préstamo Solicitado */}
            <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-red-600" />
                  Detalles del Préstamo Solicitado
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monto Solicitado (RD$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">RD$</span>
                      <input
                        type="number"
                        name="montoSolicitado"
                        value={formData.montoSolicitado}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-2 rounded-lg border-2 text-sm ${
                          errors.montoSolicitado ? 'border-red-500' : 
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                        placeholder="50,000"
                        min="1000"
                        step="1000"
                        disabled={loading || isSubmitting}
                      />
                    </div>
                    {errors.montoSolicitado && <p className="text-red-500 text-xs mt-1">{errors.montoSolicitado}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Plazo (Meses)
                    </label>
                    <input
                      type="number"
                      name="plazoMeses"
                      value={formData.plazoMeses}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
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
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Frecuencia de Pago *
                    </label>
                    <select
                      name="frecuencia"
                      value={formData.frecuencia}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      disabled={loading || isSubmitting}
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Garantía
                  </label>
                  <select
                    name="garantia"
                    value={formData.garantia}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    disabled={loading || isSubmitting}
                  >
                    <option value="">Seleccionar garantía</option>
                    {tiposGarantia.map(garantia => (
                      <option key={garantia.value} value={garantia.value}>
                        {garantia.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400">
                        Sistema de Préstamos Sin Plazo Fijo
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        El cliente pagará intereses calculados sobre el capital restante. Cada pago cubre primero los intereses y luego reduce el capital. 
                        <strong> Ejemplo:</strong> RD$ 10,000 al 10% = RD$ 1,000 de interés por período.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* NUEVA SECCIÓN: CONFIGURACIÓN DE COMISIÓN */}
            {/* ============================================ */}
            <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <GiftIcon className="h-5 w-5 mr-2 text-red-600" />
                  Configuración de Comisión
                </h3>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Activa esta opción si el préstamo fue referido por un garante o agente
                </p>
              </div>
              <div className="p-6 space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="generarComision"
                    checked={formData.generarComision}
                    onChange={(e) => setFormData({ ...formData, generarComision: e.target.checked })}
                    className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Generar comisión para garante
                  </span>
                </label>

                {formData.generarComision && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 pt-2">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Garante *
                      </label>
                      <select
                        name="garanteID"
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
                        onChange={(e) => setFormData({ ...formData, porcentajeComision: parseFloat(e.target.value) })}
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

            {/* Observaciones */}
            <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-red-600" />
                  Observaciones Adicionales
                </h3>
              </div>
              <div className="p-6">
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none`}
                  placeholder="Observaciones sobre el cliente, referencias, comentarios adicionales..."
                  disabled={loading || isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Columna Lateral - Cálculos y Resumen (sin cambios) */}
          <div className="space-y-6">
            {/* Score Estimado */}
            <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <ChartBarIcon className="h-5 w-5 mr-2 text-red-600" />
                  Score Estimado
                </h3>
              </div>
              <div className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${
                  calcularScoreReal() >= 70 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                  calcularScoreReal() >= 50 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-red-500 bg-red-50 dark:bg-red-900/20'
                }`}>
                  <span className={`text-4xl font-bold ${
                    calcularScoreReal() >= 70 ? 'text-green-600 dark:text-green-400' :
                    calcularScoreReal() >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {calcularScoreReal()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  Puntaje de evaluación preliminar
                </p>
              </div>
            </div>

            {/* Resumen de Cálculos */}
            <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <CalculatorIcon className="h-5 w-5 mr-2 text-red-600" />
                  Resumen de Cálculos
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pago Estimado por Periodo</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    RD$ {calculos.pagoEstimado?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">cada {formData.frecuencia}</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Capacidad de Pago Estimada</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    RD$ {calculos.capacidadPago?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">40% del sueldo mensual</p>
                </div>

                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Relación Monto/Sueldo</p>
                  <p className={`text-xl font-bold ${
                    calculos.ratioDeuda <= 1 ? 'text-green-600' : 
                    calculos.ratioDeuda <= 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {calculos.ratioDeuda.toFixed(2)}x
                  </p>
                </div>

                {calculos.anosAntiguedad > 0 && (
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Antigüedad Laboral</p>
                    <p className="text-xl font-bold text-blue-600">
                      {calculos.anosAntiguedad.toFixed(1)} años
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Alerta de Capacidad de Pago */}
            {alerta && (
              <div className={`p-4 rounded-lg border ${
                alerta.tipo === 'danger' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' :
                alerta.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400' :
                alerta.tipo === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' :
                'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              }`}>
                <div className="flex items-start">
                  <ExclamationCircleIcon className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">{alerta.mensaje}</p>
                </div>
              </div>
            )}

            {/* Información del Sistema */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} border border-green-600/20`}>
              <div className="flex items-start">
                <SparklesIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'} mt-0.5 mr-2 flex-shrink-0`} />
                <div>
                  <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>
                    ✅ Solicitud Garantizada
                  </h4>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                    Todas las solicitudes son enviadas al administrador para evaluación. No se rechazan automáticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Acciones
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  disabled={loading || isSubmitting}
                >
                  {loading || isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>{isSubmitting ? 'Enviando...' : 'Procesando...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>{solicitud ? 'Actualizar Solicitud' : 'Enviar Solicitud'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
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