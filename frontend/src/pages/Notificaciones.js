import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState('todas');
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    fetchNotificaciones();
    fetchClientes();
  }, []);

  // 🔹 Generar recordatorios automáticos (manual desde frontend)
  const handleGenerarManual = async () => {
    if (!window.confirm('¿Deseas generar recordatorios automáticos ahora?')) return;
    try {
      const response = await api.post('/notificaciones/generar-manual');
      if (response?.success) {
        alert('✅ Recordatorios generados correctamente');
        fetchNotificaciones();
      } else {
        alert(response?.error || 'Error generando recordatorios');
      }
    } catch (error) {
      console.error('Error generando recordatorios:', error);
      alert('Error al generar recordatorios.');
    }
  };

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      // 🔹 Intentar traer del backend
      const response = await api.get('/notificaciones').catch(() => null);

      if (response?.success && Array.isArray(response.data)) {
        setNotificaciones(response.data);
      } else {
        // 🔹 Mantener datos de ejemplo si no hay backend disponible
        const mockNotificaciones = [
          {
            id: '1',
            tipo: 'pago_recordatorio',
            destinatario: 'Juan Pérez',
            telefono: '809-123-4567',
            mensaje: 'Recordatorio EYS Inversiones: Sr. Juan Pérez, tiene un pago pendiente de RD$ 1,500. Fecha límite: 15/02/2024',
            enviada: true,
            fechaEnvio: '2024-02-10T10:30:00',
            fechaProgramada: '2024-02-10T10:00:00',
            intentos: 1,
            error: null,
            metadata: {
              clienteID: '1',
              monto: 1500,
              fechaLimite: '2024-02-15'
            }
          },
          {
            id: '2',
            tipo: 'mora',
            destinatario: 'María Rodríguez',
            telefono: '809-987-6543',
            mensaje: 'Alerta EYS Inversiones: Sra. María Rodríguez, su préstamo está en mora. Capital pendiente: RD$ 8,000. Contacte con nosotros.',
            enviada: false,
            fechaEnvio: null,
            fechaProgramada: '2024-02-12T09:00:00',
            intentos: 0,
            error: null,
            metadata: {
              clienteID: '2',
              capitalPendiente: 8000,
              diasMora: 5
            }
          },
          {
            id: '3',
            tipo: 'pago_confirmacion',
            destinatario: 'Carlos López',
            telefono: '809-555-7890',
            mensaje: 'Confirmación EYS Inversiones: Sr. Carlos López, hemos recibido su pago de RD$ 2,000. Nuevo saldo: RD$ 10,000. ¡Gracias!',
            enviada: true,
            fechaEnvio: '2024-02-08T14:20:00',
            fechaProgramada: '2024-02-08T14:15:00',
            intentos: 1,
            error: null,
            metadata: {
              clienteID: '3',
              montoPagado: 2000,
              nuevoSaldo: 10000
            }
          }
        ];
        setNotificaciones(mockNotificaciones);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      // 🔹 En el futuro puedes conectar al backend si tienes la colección de clientes
      const mockClientes = [
        { id: '1', nombre: 'Juan Pérez', celular: '809-123-4567', prestamosActivos: 1 },
        { id: '2', nombre: 'María Rodríguez', celular: '809-987-6543', prestamosActivos: 1 },
        { id: '3', nombre: 'Carlos López', celular: '809-555-7890', prestamosActivos: 1 }
      ];
      setClientes(mockClientes);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const filteredNotificaciones = notificaciones.filter(notif => {
    if (selectedTipo === 'todas') return true;
    return notif.tipo === selectedTipo;
  });

  const getTipoStyles = (tipo) => {
    switch (tipo) {
      case 'pago_recordatorio': return 'bg-blue-100 text-blue-800';
      case 'mora': return 'bg-red-100 text-red-800';
      case 'pago_confirmacion': return 'bg-green-100 text-green-800';
      case 'solicitud_nueva': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoText = (tipo) => {
    const tipos = {
      pago_recordatorio: 'Recordatorio Pago',
      mora: 'Alerta Mora',
      pago_confirmacion: 'Confirmación Pago',
      solicitud_nueva: 'Nueva Solicitud',
      personalizado: 'Personalizado'
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoIcon = (enviada) => {
    return enviada ? 
      <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
      <ClockIcon className="h-5 w-5 text-yellow-500" />;
  };

  const handleEnviarNotificacion = async (notificacionData) => {
    try {
      // 🔹 Intentar enviar realmente al backend
      const response = await api.post('/notificaciones/whatsapp', notificacionData).catch(() => null);

      if (response?.success) {
        if (response.data?.whatsappLink) {
          // Abrir el enlace de WhatsApp generado
          window.open(response.data.whatsappLink, '_blank');
        }
      }

      // 🔹 Mantener tu simulación de envío
      const nuevaNotificacion = {
        ...notificacionData,
        id: Date.now().toString(),
        fechaProgramada: new Date().toISOString(),
        enviada: false,
        intentos: 0
      };

      setNotificaciones(prev => [nuevaNotificacion, ...prev]);
      setShowForm(false);
      
      setTimeout(() => {
        setNotificaciones(prev => 
          prev.map(n => 
            n.id === nuevaNotificacion.id 
              ? { ...n, enviada: true, fechaEnvio: new Date().toISOString() }
              : n
          )
        );
      }, 2000);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleReenviar = async (notificacionId) => {
    try {
      setNotificaciones(prev => 
        prev.map(n => 
          n.id === notificacionId 
            ? { 
                ...n, 
                enviada: false, 
                intentos: n.intentos + 1,
                fechaEnvio: null 
              }
            : n
        )
      );

      setTimeout(() => {
        setNotificaciones(prev => 
          prev.map(n => 
            n.id === notificacionId 
              ? { 
                  ...n, 
                  enviada: true, 
                  fechaEnvio: new Date().toISOString() 
                }
              : n
          )
        );
      }, 2000);

    } catch (error) {
      console.error('Error resending notification:', error);
    }
  };

  const handleEliminar = async (notificacionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      try {
        setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const NotificacionForm = () => {
    const [formData, setFormData] = useState({
      tipo: 'pago_recordatorio',
      clienteID: '',
      mensaje: '',
      telefono: '',
      destinatario: ''
    });

    const tiposNotificacion = [
      { value: 'pago_recordatorio', label: 'Recordatorio de Pago' },
      { value: 'mora', label: 'Alerta de Mora' },
      { value: 'pago_confirmacion', label: 'Confirmación de Pago' },
      { value: 'personalizado', label: 'Mensaje Personalizado' }
    ];

    const mensajesPredefinidos = {
      pago_recordatorio: 'Recordatorio EYS Inversiones: {nombre}, tiene un pago pendiente. Fecha límite: {fecha}',
      mora: 'Alerta EYS Inversiones: {nombre}, su préstamo está en mora. Contacte con nosotros.',
      pago_confirmacion: 'Confirmación EYS Inversiones: {nombre}, hemos recibido su pago. ¡Gracias!'
    };

    const handleClienteChange = (clienteID) => {
      const cliente = clientes.find(c => c.id === clienteID);
      if (cliente) {
        setFormData(prev => ({
          ...prev,
          clienteID,
          destinatario: cliente.nombre,
          telefono: cliente.celular,
          mensaje: mensajesPredefinidos[formData.tipo]
            ? mensajesPredefinidos[formData.tipo]
                .replace('{nombre}', cliente.nombre)
                .replace('{fecha}', new Date().toLocaleDateString())
            : ''
        }));
      }
    };

    const handleTipoChange = (tipo) => {
      setFormData(prev => ({
        ...prev,
        tipo,
        mensaje: mensajesPredefinidos[tipo] 
          ? mensajesPredefinidos[tipo]
              .replace('{nombre}', prev.destinatario || '{nombre}')
              .replace('{fecha}', new Date().toLocaleDateString())
          : prev.mensaje
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.telefono || !formData.mensaje) {
        alert('Por favor complete el teléfono y el mensaje');
        return;
      }
      handleEnviarNotificacion(formData);
    };

    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Nueva Notificación</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Notificación
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => handleTipoChange(e.target.value)}
              className="input-primary"
            >
              {tiposNotificacion.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente (Opcional)
            </label>
            <select
              value={formData.clienteID}
              onChange={(e) => handleClienteChange(e.target.value)}
              className="input-primary"
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.celular}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="text"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              className="input-primary"
              placeholder="809-123-4567"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinatario
            </label>
            <input
              type="text"
              value={formData.destinatario}
              onChange={(e) => setFormData(prev => ({ ...prev, destinatario: e.target.value }))}
              className="input-primary"
              placeholder="Nombre del destinatario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje *
            </label>
            <textarea
              value={formData.mensaje}
              onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
              className="input-primary h-32"
              placeholder="Escribe el mensaje que se enviará por WhatsApp..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              <span>Enviar Notificación</span>
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600">Gestiona las notificaciones por WhatsApp</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nueva Notificación</span>
          </button>
          <button
            onClick={handleGenerarManual}
            className="btn-secondary flex items-center space-x-2"
          >
            <ClockIcon className="h-5 w-5" />
            <span>Generar Automáticamente</span>
          </button>
        </div>
      </div>

      {/* Formulario de Nueva Notificación */}
      {showForm && <NotificacionForm />}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTipo('todas')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedTipo === 'todas'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedTipo('pago_recordatorio')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedTipo === 'pago_recordatorio'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Recordatorios
          </button>
          <button
            onClick={() => setSelectedTipo('mora')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedTipo === 'mora'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Alertas Mora
          </button>
          <button
            onClick={() => setSelectedTipo('pago_confirmacion')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedTipo === 'pago_confirmacion'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Confirmaciones
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600">Cargando notificaciones...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
                           </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotificaciones.map((notificacion) => (
                  <tr key={notificacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notificacion.destinatario}</div>
                        <div className="text-sm text-gray-500">{notificacion.telefono}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoStyles(notificacion.tipo)}`}>
                        {getTipoText(notificacion.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{notificacion.mensaje}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getEstadoIcon(notificacion.enviada)}
                        <span className="text-sm text-gray-900">
                          {notificacion.enviada ? 'Enviada' : 'Pendiente'}
                        </span>
                        {notificacion.intentos > 0 && (
                          <span className="text-xs text-gray-500">
                            ({notificacion.intentos} intento{notificacion.intentos !== 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notificacion.fechaEnvio 
                        ? new Date(notificacion.fechaEnvio).toLocaleString()
                        : new Date(notificacion.fechaProgramada).toLocaleString()
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {!notificacion.enviada && (
                          <button
                            onClick={() => handleReenviar(notificacion.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Reenviar"
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminar(notificacion.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredNotificaciones.length === 0 && (
              <div className="text-center py-8">
                <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500">No hay notificaciones</div>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary mt-4"
                >
                  Crear Primera Notificación
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Integration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Integración con WhatsApp</h4>
            <p className="text-sm text-blue-700 mt-1">
              Las notificaciones generan enlaces de WhatsApp que puedes abrir para enviar los mensajes manualmente. 
              En una versión futura, se integrará con la API oficial de WhatsApp para envío automático.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notificaciones;

