import React, { useState, useEffect, useCallback } from 'react';
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
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  ArrowPathIcon,
  FunnelIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, limit, where, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

// ============================================
// CONSTANTES
// ============================================
const TIPOS_NOTIFICACION = {
  pago_recordatorio: { label: 'Recordatorio de Pago', color: 'from-blue-500 to-blue-700', icon: BellIcon },
  mora: { label: 'Alerta de Mora', color: 'from-red-500 to-red-700', icon: ExclamationTriangleIcon },
  pago_confirmacion: { label: 'Confirmación de Pago', color: 'from-green-500 to-green-700', icon: CheckCircleIcon },
  solicitud_nueva: { label: 'Nueva Solicitud', color: 'from-purple-500 to-purple-700', icon: RocketLaunchIcon },
  personalizado: { label: 'Personalizado', color: 'from-gray-500 to-gray-700', icon: ChatBubbleLeftRightIcon }
};

// ============================================
// FUNCIÓN PARA FORMATEAR NÚMERO DE TELÉFONO
// ============================================
const formatearTelefono = (telefono) => {
  if (!telefono) return '';
  let limpio = telefono.toString().replace(/\D/g, '');
  if (limpio.length === 10) {
    return `${limpio.slice(0, 3)}-${limpio.slice(3, 7)}-${limpio.slice(7)}`;
  }
  return telefono;
};

const limpiarTelefono = (telefono) => {
  if (!telefono) return '';
  return telefono.toString().replace(/\D/g, '');
};

// ============================================
// COMPONENTE DE BORDE LUMINOSO (RESPONSIVE)
// ============================================
const BorderGlow = ({ children, isHovered, color = 'from-blue-600 via-blue-500 to-blue-600' }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl sm:rounded-2xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl sm:rounded-2xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ============================================
// TARJETA DE ESTADÍSTICA (RESPONSIVE)
// ============================================
const StatCard = ({ icon: Icon, label, value, color, onClick, loading }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BorderGlow isHovered={isHovered} color={color}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl cursor-pointer group ${
          theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'
        } border border-transparent hover:border-blue-600/30 transition-all duration-300`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={`absolute -top-20 -right-20 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br ${color} rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse`} />

        <div className="relative p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>
          
          {loading ? (
            <div className={`h-7 sm:h-8 w-12 sm:w-16 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-1`} />
          ) : (
            <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
          )}
          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// TARJETA DE NOTIFICACIÓN (RESPONSIVE)
// ============================================
const NotificacionCard = ({ notificacion, onReenviar, onEliminar, onVerDetalle }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const tipoInfo = TIPOS_NOTIFICACION[notificacion.tipo] || TIPOS_NOTIFICACION.personalizado;
  const Icon = tipoInfo.icon;
  const tipoColor = tipoInfo.color;

  const fechaMostrar = notificacion.fechaEnvio 
    ? new Date(notificacion.fechaEnvio)
    : notificacion.fechaProgramada 
      ? new Date(notificacion.fechaProgramada)
      : null;

  const fechaFormateada = fechaMostrar 
    ? fechaMostrar.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Fecha no disponible';

  return (
    <BorderGlow isHovered={isHovered} color={tipoColor}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.01, y: -2 }}
        className={`relative overflow-hidden rounded-xl shadow-lg group ${
          theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'
        } border border-transparent hover:border-${tipoColor.split(' ')[0].replace('from-', '')}/30 transition-all duration-300`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${tipoColor}`} />

        <div className="relative p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-1">
              <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${tipoColor}`}>
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r ${tipoColor} text-white`}>
                {tipoInfo.label}
              </span>
              {notificacion.enviada ? (
                <span className="flex items-center space-x-0.5 text-[10px] sm:text-xs text-green-600">
                  <CheckCircleIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">Enviada</span>
                </span>
              ) : (
                <span className="flex items-center space-x-0.5 text-[10px] sm:text-xs text-yellow-600">
                  <ClockIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">Pendiente</span>
                </span>
              )}
            </div>
          </div>

          <div className="mb-2 sm:mb-3">
            <p className={`text-sm sm:text-base font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {notificacion.destinatario || 'Sin destinatario'}
            </p>
            <div className="flex items-center space-x-1 mt-0.5">
              <PhoneIcon className="h-3 w-3 text-gray-400" />
              <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatearTelefono(notificacion.telefono)}
              </p>
            </div>
          </div>

          <div className="mb-2 sm:mb-3">
            <p className={`text-xs sm:text-sm ${expanded ? '' : 'line-clamp-2'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {notificacion.mensaje}
            </p>
            {notificacion.mensaje && notificacion.mensaje.length > 100 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 mt-1"
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-200 dark:border-gray-700">
            <p className={`text-[9px] sm:text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {fechaFormateada}
            </p>
            <div className="flex space-x-1 sm:space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onVerDetalle(notificacion)}
                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Ver detalles"
              >
                <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </motion.button>
              {!notificacion.enviada && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReenviar(notificacion)}
                  className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="Enviar ahora"
                >
                  <PaperAirplaneIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEliminar(notificacion.id)}
                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Eliminar"
              >
                <TrashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </motion.button>
            </div>
          </div>

          {notificacion.intentos > 0 && (
            <div className="mt-1 text-[9px] sm:text-xs text-gray-400">
              Intentos: {notificacion.intentos}
            </div>
          )}
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// MODAL DE DETALLE DE NOTIFICACIÓN (RESPONSIVE)
// ============================================
const DetalleNotificacionModal = ({ isOpen, onClose, notificacion }) => {
  const { theme } = useTheme();

  if (!isOpen || !notificacion) return null;

  const tipoInfo = TIPOS_NOTIFICACION[notificacion.tipo] || TIPOS_NOTIFICACION.personalizado;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg mx-3 sm:mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-blue-600/30 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${tipoInfo.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <BellIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold text-white`}>
                      Detalle de Notificación
                    </h3>
                    <p className={`text-xs sm:text-sm text-white/80`}>
                      {tipoInfo.label}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </motion.button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className={`p-3 sm:p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Destinatario</p>
                    <p className={`text-sm sm:text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {notificacion.destinatario || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                    <p className={`text-sm sm:text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatearTelefono(notificacion.telefono)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Estado</p>
                    <div className="flex items-center space-x-2">
                      {notificacion.enviada ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Enviada</span>
                        </>
                      ) : (
                        <>
                          <ClockIcon className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600">Pendiente</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Fecha</p>
                    <p className={`text-sm sm:text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(notificacion.fechaProgramada || notificacion.fechaEnvio).toLocaleString('es-DO')}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-3 sm:p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-2">Mensaje</p>
                <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {notificacion.mensaje}
                </p>
              </div>

              {notificacion.metadata && Object.keys(notificacion.metadata).length > 0 && (
                <div className={`p-3 sm:p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-2">Metadatos</p>
                  <pre className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} overflow-x-auto`}>
                    {JSON.stringify(notificacion.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {notificacion.error && (
                <div className="p-3 sm:p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">Error: {notificacion.error}</p>
                </div>
              )}
            </div>

            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} flex justify-end`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Cerrar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MODAL DE NUEVA NOTIFICACIÓN (RESPONSIVE - MODAL)
// ============================================
const NuevaNotificacionModal = ({ isOpen, onClose, onSubmit, clientes, loading }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    tipo: 'pago_recordatorio',
    clienteID: '',
    mensaje: '',
    telefono: '',
    destinatario: '',
    metadata: {}
  });
  const [enviando, setEnviando] = useState(false);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipo: 'pago_recordatorio',
        clienteID: '',
        mensaje: '',
        telefono: '',
        destinatario: '',
        metadata: {}
      });
      setEnviando(false);
    }
  }, [isOpen]);

  const mensajesPredefinidos = {
    pago_recordatorio: (nombre, fecha) => `📋 *RECORDATORIO DE PAGO* - EYS Inversiones\n\nEstimado(a) *${nombre}*,\n\nLe recordamos que tiene un pago pendiente. Fecha límite: ${fecha}\n\nPor favor, realice su pago a tiempo para evitar cargos adicionales.\n\n- EYS Inversiones`,
    mora: (nombre, diasMora) => `⚠️ *ALERTA DE MORA* - EYS Inversiones\n\nEstimado(a) *${nombre}*,\n\nSu préstamo presenta un atraso de ${diasMora} días. Le invitamos a regularizar su situación lo antes posible.\n\nComuníquese con nosotros para más información.\n\n- EYS Inversiones`,
    pago_confirmacion: (nombre, monto) => `✅ *CONFIRMACIÓN DE PAGO* - EYS Inversiones\n\nEstimado(a) *${nombre}*,\n\nHemos recibido su pago por un monto de *RD$ ${monto}*.\n\n¡Gracias por su puntualidad!\n\n- EYS Inversiones`,
    personalizado: () => ``
  };

  const handleClienteChange = (clienteID) => {
    const cliente = clientes.find(c => c.id === clienteID);
    if (cliente) {
      const fechaHoy = new Date().toLocaleDateString('es-DO');
      let mensajeBase = '';
      if (formData.tipo === 'pago_recordatorio') {
        mensajeBase = mensajesPredefinidos.pago_recordatorio(cliente.nombre, fechaHoy);
      } else if (formData.tipo === 'mora') {
        mensajeBase = mensajesPredefinidos.mora(cliente.nombre, '5');
      } else if (formData.tipo === 'pago_confirmacion') {
        mensajeBase = mensajesPredefinidos.pago_confirmacion(cliente.nombre, '0');
      } else {
        mensajeBase = mensajesPredefinidos.personalizado();
      }

      setFormData(prev => ({
        ...prev,
        clienteID,
        destinatario: cliente.nombre,
        telefono: cliente.telefono || cliente.celular || '',
        mensaje: mensajeBase
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clienteID,
        destinatario: '',
        telefono: '',
        mensaje: ''
      }));
    }
  };

  const handleTipoChange = (tipo) => {
    setFormData(prev => ({
      ...prev,
      tipo,
      mensaje: prev.destinatario 
        ? mensajesPredefinidos[tipo]?.(prev.destinatario, new Date().toLocaleDateString('es-DO')) || ''
        : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.telefono || !formData.mensaje) {
      alert('Por favor complete el teléfono y el mensaje');
      return;
    }

    setEnviando(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error enviando notificación:', error);
      alert('Error al enviar la notificación: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xl overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-3xl mx-3 sm:mx-4 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan" />
            </div>

            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'
            }`}>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
                  <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Nueva Notificación
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Notificación
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleTipoChange(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                    disabled={enviando}
                  >
                    {Object.entries(TIPOS_NOTIFICACION).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cliente (Opcional)
                  </label>
                  <select
                    value={formData.clienteID}
                    onChange={(e) => handleClienteChange(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                    disabled={enviando || loading}
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.telefono || cliente.celular}
                      </option>
                    ))}
                  </select>
                  {loading && (
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Cargando clientes...</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: limpiarTelefono(e.target.value) }))}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                    placeholder="8091234567"
                    required
                    disabled={enviando}
                  />
                  <p className="text-[9px] sm:text-xs text-gray-400 mt-1">Ej: 8091234567 (10 dígitos)</p>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Destinatario
                  </label>
                  <input
                    type="text"
                    value={formData.destinatario}
                    onChange={(e) => setFormData(prev => ({ ...prev, destinatario: e.target.value }))}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                    placeholder="Nombre del destinatario"
                    disabled={enviando}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mensaje *
                </label>
                <textarea
                  value={formData.mensaje}
                  onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
                  rows={6}
                  className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 resize-none text-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                  placeholder="Escribe el mensaje que se enviará por WhatsApp..."
                  required
                  disabled={enviando}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 sm:px-5 py-2 rounded-lg font-medium transition-colors text-sm ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={enviando}
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={enviando}
                  className="px-5 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                >
                  {enviando ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4" />
                      <span>Enviar Notificación</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <div className={`p-3 sm:p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'
            }`}>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Notificaciones vía WhatsApp
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MODAL DE CONFIRMACIÓN DE ENVÍO
// ============================================
const ConfirmacionEnvioModal = ({ isOpen, onClose, onAbrirWhatsApp, telefono, mensaje }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleAbrirWhatsApp = () => {
    if (telefono && mensaje) {
      const url = `https://wa.me/${limpiarTelefono(telefono)}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
      onAbrirWhatsApp();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-green-800 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-green-600/30 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Notificación Preparada
              </h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                El mensaje está listo para ser enviado por WhatsApp.
              </p>
              
              <div className="flex flex-col space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAbrirWhatsApp}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.576 1.949.839 3.149.84 3.18 0 5.767-2.587 5.768-5.766.001-3.18-2.586-5.767-5.768-5.767zm2.298 8.019c-.22.618-1.246 1.139-1.958 1.099-.383-.021-.767-.07-1.126-.15-.44-.098-.86-.274-1.276-.51-.406-.232-.78-.522-1.116-.87-.324-.334-.598-.72-.802-1.155-.294-.623-.404-1.293-.263-1.98.074-.368.257-.719.527-1.005.268-.285.626-.481 1.002-.55.159-.028.293.017.407.146.18.205.327.436.444.676.117.24.207.496.268.762.044.192.006.388-.107.544-.09.119-.192.235-.285.353-.121.149-.252.29-.358.452-.152.227-.115.509.093.714.204.2.434.37.681.504.331.179.691.297 1.06.35.205.03.409.044.616.036.199-.009.392-.036.576-.1.181-.061.343-.169.471-.306.089-.094.159-.207.229-.316.054-.082.127-.143.22-.168.09-.024.177-.009.263.029.197.09.395.175.596.256.08.032.154.075.216.129.058.051.089.112.098.178.022.161-.01.344-.095.525z"/>
                  </svg>
                  <span>Abrir WhatsApp</span>
                </motion.button>
                <button
                  onClick={onClose}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Notificaciones = () => {
  const { theme } = useTheme();
  const [notificaciones, setNotificaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState('todas');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notificacionPendiente, setNotificacionPendiente] = useState(null);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);

  // Cargar clientes desde Firestore
  const cargarClientes = useCallback(async () => {
    try {
      setCargandoClientes(true);
      const clientesRef = collection(db, 'clientes');
      const querySnapshot = await getDocs(clientesRef);
      const clientesList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        clientesList.push({
          id: doc.id,
          nombre: data.nombre || data.clienteNombre || 'Cliente',
          telefono: data.telefono || data.celular || '',
          celular: data.celular || data.telefono || '',
          email: data.email || ''
        });
      });
      setClientes(clientesList);
      console.log(`✅ ${clientesList.length} clientes cargados`);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      setClientes([
        { id: '1', nombre: 'Juan Pérez', telefono: '8091234567', celular: '8091234567' },
        { id: '2', nombre: 'María Rodríguez', telefono: '8099876543', celular: '8099876543' },
        { id: '3', nombre: 'Carlos López', telefono: '8095557890', celular: '8095557890' }
      ]);
    } finally {
      setCargandoClientes(false);
    }
  }, []);

  // Cargar notificaciones desde Firestore
  const cargarNotificaciones = useCallback(async () => {
    try {
      setLoading(true);
      const notificacionesRef = collection(db, 'notificaciones');
      const q = query(notificacionesRef, orderBy('fechaProgramada', 'desc'));
      const querySnapshot = await getDocs(q);
      const notificacionesList = [];
      querySnapshot.forEach((doc) => {
        notificacionesList.push({ id: doc.id, ...doc.data() });
      });
      setNotificaciones(notificacionesList);
      console.log(`✅ ${notificacionesList.length} notificaciones cargadas`);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
    cargarNotificaciones();
  }, [cargarClientes, cargarNotificaciones]);

  const handleEnviarNotificacion = async (notificacionData) => {
    try {
      const nuevaNotificacion = {
        ...notificacionData,
        fechaProgramada: new Date().toISOString(),
        enviada: false,
        intentos: 0,
        error: null
      };
      
      const docRef = await addDoc(collection(db, 'notificaciones'), nuevaNotificacion);
      
      const notificacionCompleta = {
        ...nuevaNotificacion,
        id: docRef.id
      };
      
      setNotificaciones(prev => [notificacionCompleta, ...prev]);
      
      setNotificacionPendiente({
        telefono: notificacionData.telefono,
        mensaje: notificacionData.mensaje,
        notificacionId: docRef.id
      });
      setShowConfirmModal(true);
      
      return true;
    } catch (error) {
      console.error('Error guardando notificación:', error);
      throw error;
    }
  };

  const handleConfirmarEnvio = async () => {
    if (notificacionPendiente) {
      try {
        const notifRef = doc(db, 'notificaciones', notificacionPendiente.notificacionId);
        await updateDoc(notifRef, {
          enviada: true,
          fechaEnvio: new Date().toISOString(),
          intentos: 1
        });
        
        setNotificaciones(prev => 
          prev.map(n => 
            n.id === notificacionPendiente.notificacionId 
              ? { ...n, enviada: true, fechaEnvio: new Date().toISOString(), intentos: 1 }
              : n
          )
        );
      } catch (error) {
        console.error('Error actualizando estado de notificación:', error);
      }
    }
    setShowConfirmModal(false);
    setNotificacionPendiente(null);
  };

  const handleReenviar = async (notificacion) => {
    setNotificacionPendiente({
      telefono: notificacion.telefono,
      mensaje: notificacion.mensaje,
      notificacionId: notificacion.id
    });
    setShowConfirmModal(true);
  };

  const handleEliminar = async (notificacionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      try {
        await deleteDoc(doc(db, 'notificaciones', notificacionId));
        setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
      } catch (error) {
        console.error('Error eliminando notificación:', error);
        alert('Error al eliminar la notificación');
      }
    }
  };

  const handleVerDetalle = (notificacion) => {
    setNotificacionSeleccionada(notificacion);
    setDetalleModalOpen(true);
  };

  const handleGenerarRecordatorios = async () => {
    if (!window.confirm('¿Deseas generar recordatorios automáticos para préstamos con pagos próximos?')) return;
    
    try {
      const prestamosRef = collection(db, 'prestamos');
      const q = query(prestamosRef, where('estado', '==', 'activo'));
      const querySnapshot = await getDocs(q);
      
      const hoy = new Date();
      let recordatoriosGenerados = 0;
      
      for (const docPrestamo of querySnapshot.docs) {
        const prestamo = docPrestamo.data();
        let fechaProximoPago = prestamo.fechaProximoPago;
        
        if (fechaProximoPago) {
          let fechaObj;
          if (typeof fechaProximoPago === 'string' && fechaProximoPago.includes('-')) {
            const parts = fechaProximoPago.split('-');
            if (parts[0].length === 4) {
              fechaObj = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
              fechaObj = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          } else if (fechaProximoPago?.toDate) {
            fechaObj = fechaProximoPago.toDate();
          } else {
            fechaObj = new Date(fechaProximoPago);
          }
          
          if (fechaObj && !isNaN(fechaObj)) {
            const diasRestantes = Math.ceil((fechaObj - hoy) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes >= 0 && diasRestantes <= 3) {
              const notificacionData = {
                tipo: 'pago_recordatorio',
                clienteID: prestamo.clienteID,
                destinatario: prestamo.clienteNombre,
                telefono: prestamo.telefonoCliente,
                mensaje: `📋 *RECORDATORIO DE PAGO* - EYS Inversiones\n\nEstimado(a) *${prestamo.clienteNombre}*,\n\nLe recordamos que tiene un pago pendiente por *RD$ ${prestamo.capitalRestante?.toLocaleString()}*. Fecha límite: ${fechaObj.toLocaleDateString('es-DO')}\n\nPor favor, realice su pago a tiempo para evitar cargos adicionales.\n\n- EYS Inversiones`,
                metadata: {
                  prestamoID: docPrestamo.id,
                  montoPendiente: prestamo.capitalRestante,
                  fechaLimite: fechaObj.toLocaleDateString('es-DO'),
                  diasRestantes
                }
              };
              
              await addDoc(collection(db, 'notificaciones'), {
                ...notificacionData,
                fechaProgramada: new Date().toISOString(),
                enviada: false,
                intentos: 0
              });
              recordatoriosGenerados++;
            }
          }
        }
      }
      
      alert(`✅ Se generaron ${recordatoriosGenerados} recordatorios automáticos`);
      await cargarNotificaciones();
      
    } catch (error) {
      console.error('Error generando recordatorios:', error);
      alert('Error al generar recordatorios automáticos');
    }
  };

  const filteredNotificaciones = notificaciones.filter(notif => {
    if (selectedTipo === 'todas') return true;
    return notif.tipo === selectedTipo;
  });

  const estadisticas = {
    total: notificaciones.length,
    enviadas: notificaciones.filter(n => n.enviada).length,
    pendientes: notificaciones.filter(n => !n.enviada).length,
    recordatorios: notificaciones.filter(n => n.tipo === 'pago_recordatorio').length,
    mora: notificaciones.filter(n => n.tipo === 'mora').length,
    confirmaciones: notificaciones.filter(n => n.tipo === 'pago_confirmacion').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
        {/* Header principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 rounded-2xl blur-3xl animate-gradient-xy" />
          
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-blue-600/20">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent animate-scan" />
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-xl"
                >
                  <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                    Centro de Notificaciones
                  </h1>
                  <p className={`text-xs sm:text-sm mt-1 flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1" />
                    Gestiona y envía notificaciones por WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFormModal(true)}
                  className="flex-1 lg:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Nueva Notificación</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerarRecordatorios}
                  className="flex-1 lg:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm"
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>Generar Recordatorios</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cargarNotificaciones}
                  className="px-3 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center space-x-1 text-xs sm:text-sm"
                  title="Actualizar"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Actualizar</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <StatCard
            icon={BellIcon}
            label="Total"
            value={estadisticas.total}
            color="from-blue-500 to-blue-700"
            onClick={() => setSelectedTipo('todas')}
            loading={loading}
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Enviadas"
            value={estadisticas.enviadas}
            color="from-green-500 to-green-700"
            loading={loading}
          />
          <StatCard
            icon={ClockIcon}
            label="Pendientes"
            value={estadisticas.pendientes}
            color="from-yellow-500 to-yellow-700"
            loading={loading}
          />
          <StatCard
            icon={ExclamationTriangleIcon}
            label="Alertas Mora"
            value={estadisticas.mora}
            color="from-red-500 to-red-700"
            onClick={() => setSelectedTipo('mora')}
            loading={loading}
          />
        </div>

        {/* Filtros */}
        <div className={`relative overflow-hidden rounded-xl p-2 sm:p-3 ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
        } backdrop-blur-sm border border-blue-600/20`}>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { id: 'todas', label: 'Todas', color: 'blue' },
              { id: 'pago_recordatorio', label: 'Recordatorios', color: 'blue' },
              { id: 'mora', label: 'Alertas Mora', color: 'red' },
              { id: 'pago_confirmacion', label: 'Confirmaciones', color: 'green' },
              { id: 'personalizado', label: 'Personalizados', color: 'gray' }
            ].map(tipo => (
              <motion.button
                key={tipo.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTipo(tipo.id)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  selectedTipo === tipo.id
                    ? `bg-gradient-to-r from-${tipo.color}-600 to-${tipo.color}-700 text-white shadow-lg`
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tipo.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Grid de notificaciones */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 sm:h-44 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredNotificaciones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full blur-3xl opacity-20" />
              <EnvelopeIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4 relative" />
            </div>
            <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No hay notificaciones
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFormModal(true)}
              className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm"
            >
              Crear Primera Notificación
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredNotificaciones.map((notificacion) => (
              <NotificacionCard
                key={notificacion.id}
                notificacion={notificacion}
                onReenviar={handleReenviar}
                onEliminar={handleEliminar}
                onVerDetalle={handleVerDetalle}
              />
            ))}
          </div>
        )}

        {/* Info de integración */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`relative overflow-hidden rounded-xl p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-blue-50'
          } border-2 border-blue-600/20`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-800/10" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
              <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Integración con WhatsApp
              </h4>
              <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Las notificaciones generan enlaces de WhatsApp que puedes abrir para enviar los mensajes manualmente.
              </p>
              <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sistema activo
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CpuChipIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    v2.0.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modales */}
        <DetalleNotificacionModal
          isOpen={detalleModalOpen}
          onClose={() => {
            setDetalleModalOpen(false);
            setNotificacionSeleccionada(null);
          }}
          notificacion={notificacionSeleccionada}
        />

        <NuevaNotificacionModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleEnviarNotificacion}
          clientes={clientes}
          loading={cargandoClientes}
        />

        <ConfirmacionEnvioModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setNotificacionPendiente(null);
          }}
          onAbrirWhatsApp={handleConfirmarEnvio}
          telefono={notificacionPendiente?.telefono}
          mensaje={notificacionPendiente?.mensaje}
        />
      </div>

      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Notificaciones;