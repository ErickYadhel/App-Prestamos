import React, { useState } from 'react';
import { 
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  MapPinIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  UserCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { firebaseTimestampToLocalString } from '../../utils/firebaseUtils';

const SolicitudDetails = ({ solicitud, onBack, onEdit, onAprobar, onRechazar }) => {
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showAprobarModal, setShowAprobarModal] = useState(false);
  const [datosAprobacion, setDatosAprobacion] = useState({
    montoAprobado: solicitud.montoSolicitado,
    interesPercent: 10,
    frecuencia: solicitud.frecuencia,
    observaciones: ''
  });

  // 🔥 NUEVA FUNCIÓN: Manejar aprobación con WhatsApp
  const handleAprobarConWhatsApp = () => {
    if (window.confirm('¿Desea enviar un mensaje de WhatsApp al cliente informando la aprobación?')) {
      const mensaje = `✅ SOLICITUD APROBADA - EYS Inversiones

¡Felicidades ${solicitud.clienteNombre}!

Su solicitud de préstamo ha sido *APROBADA*:

• 💰 Monto Aprobado: RD$ ${datosAprobacion.montoAprobado?.toLocaleString()}
• 📈 Tasa de Interés: ${datosAprobacion.interesPercent}%
• 🔄 Frecuencia de Pago: ${datosAprobacion.frecuencia}
• 💵 Pago estimado: RD$ ${((datosAprobacion.montoAprobado * datosAprobacion.interesPercent) / 100)?.toLocaleString()} por ${datosAprobacion.frecuencia}

📞 Nos estaremos comunicando con usted para coordinar la entrega.

¡Gracias por confiar en EYS Inversiones!`;

      const whatsappLink = `https://wa.me/1${solicitud.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
      window.open(whatsappLink, '_blank');
    }
    
    onAprobar(solicitud, datosAprobacion);
    setShowAprobarModal(false);
  };

  // 🔥 NUEVA FUNCIÓN: Manejar rechazo con WhatsApp
  const handleRechazarConWhatsApp = () => {
    if (motivoRechazo.trim()) {
      if (window.confirm('¿Desea enviar un mensaje de WhatsApp al cliente informando el rechazo?')) {
        const mensaje = `❌ SOLICITUD RECHAZADA - EYS Inversiones

Estimado ${solicitud.clienteNombre},

Lamentamos informarle que su solicitud de préstamo ha sido *RECHAZADA*.

📝 Motivo: ${motivoRechazo}

💰 Monto Solicitado: RD$ ${solicitud.montoSolicitado?.toLocaleString()}

Agradecemos su interés en nuestros servicios y le invitamos a aplicar nuevamente en el futuro.

- EYS Inversiones`;

        const whatsappLink = `https://wa.me/1${solicitud.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappLink, '_blank');
      }
      
      onRechazar(solicitud.id, motivoRechazo);
      setShowRechazarModal(false);
      setMotivoRechazo('');
    }
  };

  const InfoRow = ({ label, value, icon: Icon, color = 'text-gray-600', important = false }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100">
      <Icon className={`h-5 w-5 ${color} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${important ? 'text-gray-900' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-sm ${color} mt-1 ${important ? 'font-semibold' : ''}`}>
          {value || 'No especificado'}
        </p>
      </div>
    </div>
  );

  const calcularScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRecomendacion = (score) => {
    if (score >= 80) return { texto: 'ALTA PRIORIDAD - APROBAR', tipo: 'success' };
    if (score >= 70) return { texto: 'RECOMENDADA - APROBAR', tipo: 'info' };
    if (score >= 50) return { texto: 'EVALUAR CON PRECAUCIÓN', tipo: 'warning' };
    if (score >= 30) return { texto: 'RIESGO MODERADO - RECHAZAR', tipo: 'danger' };
    return { texto: 'ALTO RIESGO - RECHAZAR', tipo: 'danger' };
  };

  const calcularPagoEstimado = () => {
    return (datosAprobacion.montoAprobado * datosAprobacion.interesPercent) / 100;
  };

  const score = solicitud.scoreAnalisis || 50;
  const recomendacion = getRecomendacion(score);
  const ratioSueldo = solicitud.sueldoCliente ? (solicitud.montoSolicitado / solicitud.sueldoCliente) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalles de Solicitud</h1>
            <p className="text-gray-600">Evaluación completa para toma de decisiones</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {solicitud.estado === 'pendiente' && (
            <>
              <button
                onClick={() => setShowAprobarModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Aprobar</span>
              </button>
              <button
                onClick={() => setShowRechazarModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <XCircleIcon className="h-4 w-4" />
                <span>Rechazar</span>
              </button>
            </>
          )}
          <button
            onClick={onEdit}
            className="btn-secondary flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score y Recomendación */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Análisis de Riesgo
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Score de Evaluación</h4>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold border ${calcularScoreColor(score)}`}>
                    {score} / 100
                  </div>
                </div>
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  recomendacion.tipo === 'success' ? 'bg-green-100 text-green-800' :
                  recomendacion.tipo === 'info' ? 'bg-blue-100 text-blue-800' :
                  recomendacion.tipo === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {recomendacion.texto}
                </div>
              </div>

              {/* Factores de Evaluación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto/Sueldo:</span>
                    <span className={`font-medium ${
                      ratioSueldo <= 0.5 ? 'text-green-600' :
                      ratioSueldo <= 1 ? 'text-yellow-600' :
                      ratioSueldo <= 2 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {ratioSueldo.toFixed(1)}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frecuencia:</span>
                    <span className="font-medium text-gray-900 capitalize">{solicitud.frecuencia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plazo:</span>
                    <span className="font-medium text-gray-900">
                      {solicitud.plazoMeses === 0 ? 'Sin plazo fijo' : `${solicitud.plazoMeses} meses`}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Información Laboral:</span>
                    <span className={`font-medium ${
                      solicitud.lugarTrabajo && solicitud.puestoCliente ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {solicitud.lugarTrabajo && solicitud.puestoCliente ? 'Completa' : 'Parcial'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Información Bancaria:</span>
                    <span className={`font-medium ${
                      solicitud.bancoCliente && solicitud.cuentaCliente ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {solicitud.bancoCliente && solicitud.cuentaCliente ? 'Completa' : 'Parcial'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contacto:</span>
                    <span className="font-medium text-green-600">Verificado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Información Personal del Cliente
              </h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow label="Nombre Completo" value={solicitud.clienteNombre} icon={UserIcon} important={true} />
              <InfoRow label="Cédula" value={solicitud.cedula} icon={CreditCardIcon} />
              <InfoRow label="Teléfono" value={solicitud.telefono} icon={PhoneIcon} important={true} />
              <InfoRow label="Email" value={solicitud.email} icon={EnvelopeIcon} />
              <InfoRow label="Dirección" value={solicitud.direccion} icon={MapPinIcon} />
              <InfoRow label="Provincia" value={solicitud.provincia} icon={MapPinIcon} />
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
            <div className="p-6 space-y-1">
              <InfoRow label="Banco" value={solicitud.bancoCliente} icon={BanknotesIcon} />
              <InfoRow label="Tipo de Cuenta" value={solicitud.tipoCuenta} icon={CreditCardIcon} />
              <InfoRow label="Número de Cuenta" value={solicitud.cuentaCliente} icon={CreditCardIcon} />
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
            <div className="p-6 space-y-1">
              <InfoRow label="Lugar de Trabajo" value={solicitud.lugarTrabajo} icon={BuildingOfficeIcon} important={true} />
              <InfoRow label="Puesto/Posición" value={solicitud.puestoCliente} icon={UserIcon} />
              <InfoRow label="Sueldo Mensual" value={solicitud.sueldoCliente ? `RD$ ${solicitud.sueldoCliente.toLocaleString()}` : ''} icon={CurrencyDollarIcon} />
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
            <div className="p-6 space-y-1">
              <InfoRow label="Monto Solicitado" value={`RD$ ${solicitud.montoSolicitado?.toLocaleString()}`} icon={CurrencyDollarIcon} important={true} />
              <InfoRow label="Plazo" value={solicitud.plazoMeses === 0 ? 'Sin plazo fijo' : `${solicitud.plazoMeses} meses`} icon={CalendarIcon} />
              <InfoRow label="Frecuencia de Pago" value={solicitud.frecuencia} icon={CalendarIcon} important={true} />
              <InfoRow 
                label="Pago Estimado" 
                value={`RD$ ${((solicitud.montoSolicitado * 10) / 100)?.toLocaleString()} por ${solicitud.frecuencia}`} 
                icon={CurrencyDollarIcon} 
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado y Acciones Rápidas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Estado Actual</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  solicitud.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {solicitud.estado === 'pendiente' && <ClockIcon className="w-4 h-4 mr-1" />}
                  {solicitud.estado === 'aprobada' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                  {solicitud.estado === 'rechazada' && <XCircleIcon className="w-4 h-4 mr-1" />}
                  {solicitud.estado === 'pendiente' ? 'Pendiente' :
                   solicitud.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                </div>
              </div>

              {/* 🔥 ACCIONES RÁPIDAS MEJORADAS */}
              {solicitud.estado === 'pendiente' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAprobarModal(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Aprobar Solicitud</span>
                  </button>
                  <button
                    onClick={() => setShowRechazarModal(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    <span>Rechazar Solicitud</span>
                  </button>
                  <a
                    href={`https://wa.me/1${solicitud.telefono.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    <span>Contactar Cliente</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Información del Empleado */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Empleado Solicitante</h3>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-900">{solicitud.empleadoNombre || 'No especificado'}</p>
              <p className="text-sm text-gray-500 mt-1">ID: {solicitud.empleadoID}</p>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Fechas</h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Solicitud</p>
                <p className="text-sm text-gray-900">
                  {firebaseTimestampToLocalString(solicitud.fechaSolicitud)}
                </p>
              </div>
              {solicitud.fechaDecision && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Decisión</p>
                  <p className="text-sm text-gray-900">
                    {firebaseTimestampToLocalString(solicitud.fechaDecision)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Análisis Rápido */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Análisis Rápido</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• {ratioSueldo <= 1 ? 'Buena' : 'Alta'} relación monto/sueldo</li>
                  <li>• {solicitud.frecuencia === 'quincenal' ? 'Frecuencia óptima' : 'Frecuencia aceptable'}</li>
                  <li>• {solicitud.plazoMeses <= 12 ? 'Plazo conservador' : 'Plazo extendido'}</li>
                  <li>• Información {solicitud.direccion ? 'completa' : 'incompleta'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sistema Sin Plazo Fijo */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Sistema Sin Plazo Fijo</h4>
                <p className="text-sm text-green-700 mt-1">
                  El cliente pagará intereses sobre el capital restante. Cada pago reduce el capital y los intereses se recalculan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      {solicitud.observaciones && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Observaciones</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-700">{solicitud.observaciones}</p>
          </div>
        </div>
      )}

      {/* 🔥 MODAL DE APROBACIÓN MEJORADO */}
      {showAprobarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aprobar Solicitud</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configura los detalles del préstamo para <strong>{solicitud.clienteNombre}</strong>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Aprobado (RD$)
                  </label>
                  <input
                    type="number"
                    value={datosAprobacion.montoAprobado}
                    onChange={(e) => setDatosAprobacion(prev => ({
                      ...prev,
                      montoAprobado: parseFloat(e.target.value)
                    }))}
                    className="input-primary"
                    min="1000"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasa de Interés (%)
                  </label>
                  <input
                    type="number"
                    value={datosAprobacion.interesPercent}
                    onChange={(e) => setDatosAprobacion(prev => ({
                      ...prev,
                      interesPercent: parseFloat(e.target.value)
                    }))}
                    className="input-primary"
                    min="1"
                    max="50"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Pago
                  </label>
                  <select
                    value={datosAprobacion.frecuencia}
                    onChange={(e) => setDatosAprobacion(prev => ({
                      ...prev,
                      frecuencia: e.target.value
                    }))}
                    className="input-primary"
                  >
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Pago Estimado:</strong> RD$ {calcularPagoEstimado()?.toLocaleString()} por {datosAprobacion.frecuencia}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones (Opcional)
                  </label>
                  <textarea
                    value={datosAprobacion.observaciones}
                    onChange={(e) => setDatosAprobacion(prev => ({
                      ...prev,
                      observaciones: e.target.value
                    }))}
                    rows="3"
                    className="input-primary"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAprobarModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAprobarConWhatsApp}
                  className="btn-primary"
                >
                  Aprobar y Notificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rechazo */}
      {showRechazarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rechazar Solicitud</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que quieres rechazar la solicitud de <strong>{solicitud.clienteNombre}</strong>? 
                Por favor proporciona el motivo del rechazo.
              </p>
              
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Motivo del rechazo..."
                rows="4"
                className="input-primary w-full"
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRechazarModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRechazarConWhatsApp}
                  disabled={!motivoRechazo.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Rechazar y Notificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudDetails;