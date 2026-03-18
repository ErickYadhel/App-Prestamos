import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  PlusIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  TrashIcon,
  EyeIcon,
  BellIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered, color = 'from-blue-600 via-blue-500 to-blue-600' }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ============================================
// TARJETA DE ESTADÍSTICA
// ============================================
const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BorderGlow isHovered={isHovered} color={color}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-2xl shadow-xl cursor-pointer group ${
          theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'
        } border-2 border-transparent hover:border-blue-600/30 transition-all duration-300`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${color} rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse`} />
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan" />
        </div>

        <div className="relative p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${color} opacity-20 group-hover:opacity-100 transition-opacity`}>
              <CpuChipIcon className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// TARJETA DE NOTIFICACIÓN
// ============================================
const NotificacionCard = ({ notificacion, onReenviar, onEliminar }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getTipoStyles = (tipo) => {
    switch (tipo) {
      case 'pago_recordatorio': return 'from-blue-500 to-blue-700';
      case 'mora': return 'from-red-500 to-red-700';
      case 'pago_confirmacion': return 'from-green-500 to-green-700';
      case 'solicitud_nueva': return 'from-purple-500 to-purple-700';
      default: return 'from-gray-500 to-gray-700';
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

  const tipoColor = getTipoStyles(notificacion.tipo);

  return (
    <BorderGlow isHovered={isHovered} color={tipoColor}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.01, y: -2 }}
        className={`relative overflow-hidden rounded-xl shadow-lg group ${
          theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'
        } border-2 border-transparent hover:border-${tipoColor.split(' ')[0].replace('from-', '')}/30 transition-all duration-300`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${tipoColor}`} />
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan" />
        </div>

        <div className="relative p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${tipoColor}`}>
                <BellIcon className="h-4 w-4 text-white" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${tipoColor} text-white`}>
                {getTipoText(notificacion.tipo)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {notificacion.enviada ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-xs">Enviada</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-xs">Pendiente</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {notificacion.destinatario}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {notificacion.telefono}
            </p>
          </div>

          <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {notificacion.mensaje}
          </p>

          <div className="flex items-center justify-between">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {notificacion.fechaEnvio 
                ? new Date(notificacion.fechaEnvio).toLocaleString()
                : new Date(notificacion.fechaProgramada).toLocaleString()
              }
            </p>
            <div className="flex space-x-2">
              {!notificacion.enviada && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReenviar(notificacion.id)}
                  className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="Reenviar"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEliminar(notificacion.id)}
                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Eliminar"
              >
                <TrashIcon className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {notificacion.intentos > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Intentos: {notificacion.intentos}
            </div>
          )}
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// FORMULARIO DE NUEVA NOTIFICACIÓN (MEJORADO)
// ============================================
const NotificacionForm = ({ onClose, onSubmit, clientes }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    tipo: 'pago_recordatorio',
    clienteID: '',
    mensaje: '',
    telefono: '',
    destinatario: ''
  });

  const tiposNotificacion = [
    { value: 'pago_recordatorio', label: 'Recordatorio de Pago', color: 'from-blue-500 to-blue-700' },
    { value: 'mora', label: 'Alerta de Mora', color: 'from-red-500 to-red-700' },
    { value: 'pago_confirmacion', label: 'Confirmación de Pago', color: 'from-green-500 to-green-700' },
    { value: 'personalizado', label: 'Mensaje Personalizado', color: 'from-purple-500 to-purple-700' }
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
        mensaje: mensajesPredefinidos[prev.tipo]
          ? mensajesPredefinidos[prev.tipo]
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
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative overflow-hidden rounded-2xl shadow-2xl mb-6"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl blur-xl opacity-75" />
      
      <div className={`relative rounded-2xl overflow-hidden border-2 border-blue-600/30 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan" />
        </div>

        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center bg-gradient-to-r ${
          theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
              <BellIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Nueva Notificación
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <XMarkIcon className="h-5 w-5" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo de Notificación
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleTipoChange(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
              >
                {tiposNotificacion.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Cliente (Opcional)
              </label>
              <select
                value={formData.clienteID}
                onChange={(e) => handleClienteChange(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
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
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Teléfono *
              </label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                placeholder="809-123-4567"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Destinatario
              </label>
              <input
                type="text"
                value={formData.destinatario}
                onChange={(e) => setFormData(prev => ({ ...prev, destinatario: e.target.value }))}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                placeholder="Nombre del destinatario"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Mensaje *
            </label>
            <textarea
              value={formData.mensaje}
              onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
              rows="4"
              className={`w-full px-4 py-2 rounded-lg border-2 resize-none ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
              placeholder="Escribe el mensaje que se enviará por WhatsApp..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              <span>Enviar Notificación</span>
            </motion.button>
          </div>
        </form>

        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end bg-gradient-to-r ${
          theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'
        }`}>
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-4 w-4 text-blue-600" />
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Notificaciones vía WhatsApp
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Notificaciones = () => {
  const { theme } = useTheme();
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

  // Estadísticas
  const estadisticas = {
    total: notificaciones.length,
    enviadas: notificaciones.filter(n => n.enviada).length,
    pendientes: notificaciones.filter(n => !n.enviada).length,
    recordatorios: notificaciones.filter(n => n.tipo === 'pago_recordatorio').length,
    mora: notificaciones.filter(n => n.tipo === 'mora').length,
    confirmaciones: notificaciones.filter(n => n.tipo === 'pago_confirmacion').length
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header principal con efecto tecnológico */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        {/* Fondo con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 rounded-2xl blur-3xl animate-gradient-xy" />
        
        {/* Cuadrícula tecnológica */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${
            theme === 'dark' ? '#fff' : '#000'
          } 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
        
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-blue-600/20">
          {/* Línea de escaneo */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent animate-scan" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-4 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 rounded-2xl shadow-xl"
              >
                <BellIcon className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Centro de Notificaciones
                </h1>
                <p className={`text-sm mt-2 flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <SparklesIcon className="h-4 w-4 text-yellow-500 mr-2" />
                  Gestiona y envía notificaciones por WhatsApp a tus clientes
                </p>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Nueva Notificación</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerarManual}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <ClockIcon className="h-5 w-5" />
                <span>Generar Automáticas</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BellIcon}
          label="Total Notificaciones"
          value={estadisticas.total}
          color="from-blue-500 to-blue-700"
          onClick={() => setSelectedTipo('todas')}
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Enviadas"
          value={estadisticas.enviadas}
          color="from-green-500 to-green-700"
          onClick={() => {}}
        />
        <StatCard
          icon={ClockIcon}
          label="Pendientes"
          value={estadisticas.pendientes}
          color="from-yellow-500 to-yellow-700"
          onClick={() => {}}
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="Alertas Mora"
          value={estadisticas.mora}
          color="from-red-500 to-red-700"
          onClick={() => setSelectedTipo('mora')}
        />
      </div>

      {/* Formulario de Nueva Notificación */}
      <AnimatePresence>
        {showForm && (
          <NotificacionForm
            onClose={() => setShowForm(false)}
            onSubmit={handleEnviarNotificacion}
            clientes={clientes}
          />
        )}
      </AnimatePresence>

      {/* Filtros */}
      <div className={`relative overflow-hidden rounded-2xl p-4 ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
      } backdrop-blur-sm border border-blue-600/20`}>
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTipo('todas')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              selectedTipo === 'todas'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTipo('pago_recordatorio')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              selectedTipo === 'pago_recordatorio'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Recordatorios
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTipo('mora')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              selectedTipo === 'mora'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Alertas Mora
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTipo('pago_confirmacion')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              selectedTipo === 'pago_confirmacion'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Confirmaciones
          </motion.button>
        </div>
      </div>

      {/* Grid de notificaciones */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredNotificaciones.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full blur-3xl opacity-20" />
            <EnvelopeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4 relative" />
          </div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay notificaciones
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Crear Primera Notificación
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotificaciones.map((notificacion) => (
            <NotificacionCard
              key={notificacion.id}
              notificacion={notificacion}
              onReenviar={handleReenviar}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      )}

      {/* WhatsApp Integration Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative overflow-hidden rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-blue-50'
        } border-2 border-blue-600/20`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-800/10" />
        
        <div className="relative flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Integración con WhatsApp
            </h4>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Las notificaciones generan enlaces de WhatsApp que puedes abrir para enviar los mensajes manualmente. 
              En una versión futura, se integrará con la API oficial de WhatsApp para envío automático.
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sistema activo
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="h-4 w-4 text-blue-600" />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  v2.0.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Notificaciones;

