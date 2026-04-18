import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GiftIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UsersIcon,
  HomeIcon,
  CogIcon,
  NoSymbolIcon,
  ArrowUturnLeftIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, orderBy, limit, updateDoc, doc, getDoc, deleteDoc, addDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

// ============================================
// FUNCIÓN PARA FORMATEAR MONTO
// ============================================
const formatMonto = (valor) => {
  if (!valor) return 'RD$ 0.00';
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};

// ============================================
// FUNCIÓN PARA FORMATEAR FECHA RELATIVA
// ============================================
const formatFechaRelativa = (fecha) => {
  if (!fecha) return 'Fecha desconocida';
  const fechaDate = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(fechaDate.getTime())) return 'Fecha inválida';
  
  const ahora = new Date();
  const diffMs = ahora - fechaDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
};

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered, color = 'from-green-600 via-green-500 to-green-600' }) => (
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
// COMPONENTE DE NOTIFICACIÓN INDIVIDUAL (RESPONSIVE)
// ============================================
const NotificacionItem = ({ notificacion, onClick, onEliminar, isSelected }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  const getIcono = () => {
    switch(notificacion.tipo) {
      case 'prestamo_vencido':
        return <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
      case 'pago_proximo':
        return <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
      case 'pago_registrado':
        return <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
      case 'comision_generada':
        return <GiftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />;
      case 'pago_recordatorio':
        return <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
      default:
        return <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
    }
  };
  
  const getColorFondo = () => {
    if (!notificacion.leida) return 'bg-red-900/20 border-l-2 sm:border-l-4 border-l-red-500';
    if (!notificacion.whatsappEnviado) return 'bg-yellow-900/10 border-l-2 sm:border-l-4 border-l-yellow-500';
    return theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01, x: 3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(notificacion)}
      className={`p-3 sm:p-4 cursor-pointer transition-all duration-300 ${getColorFondo()} hover:bg-white/5 relative group ${isSelected ? 'ring-2 ring-green-500' : ''}`}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
            {getIcono()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-1 mb-1">
            <p className={`text-xs sm:text-sm font-semibold ${!notificacion.leida ? 'text-white' : 'text-gray-300'}`}>
              {notificacion.tipo?.replace(/_/g, ' ').toUpperCase() || 'Notificación'}
              {!notificacion.leida && (
                <span className="ml-2 inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </p>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-[10px] sm:text-xs text-gray-500">
                {formatFechaRelativa(notificacion.fechaCreacion)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEliminar(notificacion.id);
                }}
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/20 ${isHovered ? 'opacity-100' : ''}`}
              >
                <TrashIcon className="h-3 w-3 text-gray-400 hover:text-red-400" />
              </button>
            </div>
          </div>
          
          <p className={`text-[11px] sm:text-xs mt-1 ${!notificacion.leida ? 'text-gray-200' : 'text-gray-400'} line-clamp-2 sm:line-clamp-none`}>
            {notificacion.mensaje}
          </p>
          
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
            {!notificacion.whatsappEnviado && notificacion.leida && (
              <div className="flex items-center space-x-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-yellow-500/20">
                <ChatBubbleLeftRightIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500" />
                <span className="text-[9px] sm:text-xs text-yellow-500 font-medium">
                  Pendiente
                </span>
              </div>
            )}
            
            {notificacion.whatsappEnviado && (
              <div className="flex items-center space-x-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-green-500/20">
                <CheckCircleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                <span className="text-[9px] sm:text-xs text-green-500">
                  Enviado
                </span>
              </div>
            )}
            
            {notificacion.destinatario && (
              <div className="flex items-center space-x-1">
                <UserIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                <span className="text-[9px] sm:text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[150px]">
                  {notificacion.destinatario}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MODAL PARA ENVIAR WHATSAPP (CORREGIDO - BUSCA POR NOMBRE)
// ============================================
const WhatsAppModal = ({ isOpen, onClose, notificacion, onEnviar }) => {
  const { theme } = useTheme();
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cargando, setCargando] = useState(false);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (notificacion && isOpen) {
      setMensaje(notificacion.mensaje || '');
      buscarCliente();
    }
  }, [notificacion, isOpen]);

  const buscarCliente = async () => {
    setCargando(true);
    setError('');
    setClienteInfo(null);
    setTelefono('');

    try {
      // OBTENER DATOS DIRECTAMENTE DE LA NOTIFICACIÓN
      const clienteID = notificacion?.clienteID;
      const destinatario = notificacion?.destinatario;
      const telefonoNotificacion = notificacion?.telefono;

      console.log('🔍 === DATOS DE LA NOTIFICACIÓN ===');
      console.log('clienteID:', clienteID);
      console.log('destinatario:', destinatario);
      console.log('telefono en notificación:', telefonoNotificacion);

      let clienteEncontrado = null;
      let clienteData = null;

      // MÉTODO 1: Buscar por clienteID en la colección "clientes"
      if (clienteID) {
        console.log('🔍 Buscando por clienteID:', clienteID);
        const clienteDoc = await getDoc(doc(db, 'clientes', clienteID));
        
        if (clienteDoc.exists()) {
          clienteData = clienteDoc.data();
          clienteEncontrado = { id: clienteDoc.id, ...clienteData };
          console.log('✅ Cliente encontrado por ID:', clienteEncontrado);
        } else {
          console.log('⚠️ No se encontró cliente con ID:', clienteID);
        }
      }

      // MÉTODO 2: Si no se encontró por ID, buscar por NOMBRE (destinatario)
      if (!clienteEncontrado && destinatario) {
        console.log('🔍 Buscando por nombre:', destinatario);
        
        const clientesRef = collection(db, 'clientes');
        const querySnapshot = await getDocs(clientesRef);
        
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const nombreCliente = data.nombre || '';
          
          if (nombreCliente.toLowerCase() === destinatario.toLowerCase() ||
              nombreCliente.toLowerCase().includes(destinatario.toLowerCase()) ||
              destinatario.toLowerCase().includes(nombreCliente.toLowerCase())) {
            clienteEncontrado = { id: doc.id, ...data };
            console.log('✅ Cliente encontrado por nombre:', clienteEncontrado);
          }
        });
      }

      // MÉTODO 3: Si aún no se encuentra, listar todos los clientes para depuración
      if (!clienteEncontrado) {
        console.log('🔍 Listando todos los clientes disponibles:');
        const clientesRef = collection(db, 'clientes');
        const allClientes = await getDocs(clientesRef);
        allClientes.forEach(doc => {
          const data = doc.data();
          console.log(`   - ${doc.id}: ${data.nombre} (${data.celular || 'sin teléfono'})`);
        });
      }

      // Procesar resultados
      if (clienteEncontrado) {
        const telefonoReal = clienteEncontrado.celular || clienteEncontrado.telefono || telefonoNotificacion;
        
        setClienteInfo({
          id: clienteEncontrado.id,
          nombre: clienteEncontrado.nombre || destinatario,
          cedula: clienteEncontrado.cedula,
          telefono: telefonoReal,
          email: clienteEncontrado.email,
          direccion: clienteEncontrado.direccion,
          trabajo: clienteEncontrado.trabajo,
          sueldo: clienteEncontrado.sueldo
        });
        setTelefono(telefonoReal);
        
        if (!telefonoReal) {
          setError(`El cliente "${clienteEncontrado.nombre}" no tiene número de teléfono registrado en Firestore`);
        }
      } else {
        // Usar los datos de la notificación como fallback
        console.log('⚠️ Usando datos de la notificación como fallback');
        setClienteInfo({
          nombre: destinatario || 'Cliente',
          telefono: telefonoNotificacion
        });
        setTelefono(telefonoNotificacion);
        
        if (!telefonoNotificacion) {
          setError(`No hay número de teléfono para ${destinatario || 'el destinatario'}`);
        } else {
          setError(`Cliente no encontrado en Firestore. Se usará el teléfono de la notificación: ${telefonoNotificacion}`);
        }
      }
      
    } catch (err) {
      console.error('Error buscando cliente:', err);
      setError('Error al buscar el cliente: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEnviar = async () => {
    if (!mensaje.trim()) {
      setError('El mensaje no puede estar vacío');
      return;
    }

    if (!telefono) {
      setError('No hay número de teléfono disponible');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      const telefonoLimpio = telefono.replace(/\D/g, '');
      const mensajeCodificado = encodeURIComponent(mensaje);
      const whatsappUrl = `https://wa.me/${telefonoLimpio}?text=${mensajeCodificado}`;
      
      window.open(whatsappUrl, '_blank');
      
      await updateDoc(doc(db, 'notificaciones', notificacion.id), {
        whatsappEnviado: true,
        fechaWhatsappEnviado: new Date().toISOString(),
        mensajeWhatsapp: mensaje,
        telefonoDestino: telefono,
        enviada: true,
        fechaEnvio: new Date().toISOString()
      });

      onEnviar && onEnviar(notificacion.id);
      onClose();
    } catch (err) {
      console.error('Error:', err);
      setError('Error al enviar el mensaje');
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
        className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-[95%] sm:w-full max-w-2xl mx-2 sm:mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <BorderGlow isHovered={isHovered}>
            <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-green-600/30 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan" />
              </div>

              <div className={`p-3 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
                theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-green-50 to-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-green-600 to-green-800 rounded-xl shadow-lg">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-base sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Enviar por WhatsApp
                      </h3>
                      <p className={`text-[10px] sm:text-sm mt-0.5 sm:mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Confirma el mensaje antes de enviar
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all hover:scale-110 ${
                      theme === 'dark' 
                        ? 'bg-white/10 hover:bg-white/20 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
                <div className={`p-3 sm:p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                    <div className="p-1.5 bg-green-600 rounded-lg">
                      <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">Información del Destinatario</span>
                  </div>
                  
                  {cargando ? (
                    <div className="flex items-center space-x-2">
                      <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-green-600" />
                      <span className="text-xs sm:text-sm">Buscando información del cliente...</span>
                    </div>
                  ) : clienteInfo ? (
                    <div className="space-y-1 sm:space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-500">Nombre:</span>
                          <p className="font-semibold text-sm sm:text-base">{clienteInfo.nombre}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Cédula:</span>
                          <p>{clienteInfo.cedula || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Teléfono:</span>
                          <p className="text-green-600 font-mono text-xs sm:text-sm">{clienteInfo.telefono || 'No registrado'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <p className="text-xs sm:text-sm truncate">{clienteInfo.email || 'N/A'}</p>
                        </div>
                        {clienteInfo.trabajo && (
                          <div className="sm:col-span-2">
                            <span className="text-gray-500">Trabajo:</span>
                            <p className="text-xs sm:text-sm">{clienteInfo.trabajo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-500 text-xs sm:text-sm">{error || 'No se encontró información del cliente'}</p>
                  )}
                </div>

                {error && (
                  <div className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                    theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'
                  } border border-red-200 dark:border-red-800`}>
                    <ExclamationTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                    {error}
                  </div>
                )}

                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mensaje
                  </label>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    rows={5}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 text-xs sm:text-sm resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-green-500'
                    } focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                    placeholder="Escribe el mensaje que se enviará por WhatsApp..."
                  />
                </div>

                <div className={`p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-semibold">💡 Tip:</span> El mensaje se abrirá en WhatsApp Web/app. 
                    Solo necesitas presionar "Enviar" para confirmar.
                  </p>
                </div>
              </div>

              <div className={`p-3 sm:p-6 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 ${
                theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <button
                  onClick={onClose}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnviar}
                  disabled={enviando || !telefono}
                  className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
                >
                  {enviando ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span>Abrir WhatsApp</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </BorderGlow>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE DE ESTADÍSTICAS (RESPONSIVE)
// ============================================
const EstadisticasNotificaciones = ({ notificaciones }) => {
  const total = notificaciones.length;
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const pendientesWhatsApp = notificaciones.filter(n => !n.whatsappEnviado && n.leida).length;
  const enviadas = notificaciones.filter(n => n.whatsappEnviado).length;
  
  const stats = [
    { label: 'Total', value: total, icon: BellIcon, color: 'from-blue-500 to-blue-700' },
    { label: 'No leídas', value: noLeidas, icon: EyeIcon, color: 'from-red-500 to-red-700' },
    { label: 'Pendientes WhatsApp', value: pendientesWhatsApp, icon: ChatBubbleLeftRightIcon, color: 'from-yellow-500 to-yellow-700' },
    { label: 'Enviadas', value: enviadas, icon: CheckCircleIcon, color: 'from-green-500 to-green-700' }
  ];
  
  return (
    <div className="grid grid-cols-2 gap-1 sm:gap-2 p-2 sm:p-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[10px] sm:text-xs">{stat.label}</p>
                <p className="text-white text-base sm:text-2xl font-bold">{stat.value}</p>
              </div>
              <Icon className="h-5 w-5 sm:h-8 sm:w-8 text-white/50" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL DEL PANEL DE NOTIFICACIONES (RESPONSIVE - CORREGIDO)
// ============================================
const NotificacionesPanel = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);
  const panelRef = useRef(null);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'notificaciones'), orderBy('fechaCreacion', 'desc'), limit(30));
      const snapshot = await getDocs(q);
      const notis = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        notis.push({
          id: doc.id,
          ...data,
          fechaCreacion: data.fechaCreacion
        });
      });
      setNotificaciones(notis);
      console.log('📋 Notificaciones cargadas:', notis.length);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarNotificaciones();
      const interval = setInterval(cargarNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const marcarComoLeida = async (id) => {
    try {
      await updateDoc(doc(db, 'notificaciones', id), { leida: true });
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const eliminarNotificacion = async (id) => {
    try {
      await deleteDoc(doc(db, 'notificaciones', id));
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      if (selectedNotificacion?.id === id) setSelectedNotificacion(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    const noLeidas = notificaciones.filter(n => !n.leida);
    for (const notif of noLeidas) {
      try {
        await updateDoc(doc(db, 'notificaciones', notif.id), { leida: true });
      } catch (error) {
        console.error('Error:', error);
      }
    }
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const handleNotificacionClick = async (notificacion) => {
    console.log('📱 Notificación clickeada:', notificacion);
    
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion.id);
    }
    
    setSelectedNotificacion(notificacion);
    setNotificacionSeleccionada(notificacion);
    setWhatsappModalOpen(true);
  };

  const notificacionesFiltradas = notificaciones.filter(notif => {
    if (filter === 'no_leidas' && notif.leida) return false;
    if (filter === 'pendientes_whatsapp' && (notif.whatsappEnviado || !notif.leida)) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return notif.tipo?.toLowerCase().includes(searchLower) ||
             notif.mensaje?.toLowerCase().includes(searchLower) ||
             notif.destinatario?.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;
  const notificacionesSinWhatsApp = notificaciones.filter(n => !n.whatsappEnviado && n.leida).length;

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 mx-auto w-[95%] sm:absolute sm:right-4 sm:left-auto sm:mx-0 sm:w-[450px] top-14 rounded-xl shadow-2xl overflow-hidden z-[300]"
          ref={panelRef}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-black opacity-95"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan"></div>
          
          <div className="relative">
            <div className="p-3 sm:p-4 border-b border-red-500/30">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-red-600 rounded-lg">
                    <BellIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-sm sm:text-base">Notificaciones</h3>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {notificacionesNoLeidas > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={marcarTodasComoLeidas}
                      className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] sm:text-xs text-white transition-colors"
                    >
                      Marcar todas
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSearch(!showSearch)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MagnifyingGlassIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </motion.button>
                </div>
              </div>
              
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 sm:mb-3"
                  >
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por cliente o mensaje..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex gap-1 bg-black/20 rounded-lg p-0.5 sm:p-1">
                <button
                  onClick={() => setFilter('todas')}
                  className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all ${
                    filter === 'todas'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Todas ({notificaciones.length})
                </button>
                <button
                  onClick={() => setFilter('no_leidas')}
                  className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all ${
                    filter === 'no_leidas'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  No leídas ({notificacionesNoLeidas})
                </button>
                <button
                  onClick={() => setFilter('pendientes_whatsapp')}
                  className={`flex-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all ${
                    filter === 'pendientes_whatsapp'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Pendientes ({notificacionesSinWhatsApp})
                </button>
              </div>
            </div>

            <EstadisticasNotificaciones notificaciones={notificacionesFiltradas} />

            <div className="max-h-[50vh] sm:max-h-[450px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 animate-spin" />
                </div>
              ) : notificacionesFiltradas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-12"
                >
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-full blur-3xl opacity-20" />
                    <BellIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-500 mx-auto mb-2 relative" />
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm">No hay notificaciones</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1">
                    {searchTerm ? 'Intenta con otra búsqueda' : 'Las notificaciones aparecerán aquí'}
                  </p>
                </motion.div>
              ) : (
                <div className="divide-y divide-red-500/20">
                  <AnimatePresence>
                    {notificacionesFiltradas.map((notificacion) => (
                      <NotificacionItem
                        key={notificacion.id}
                        notificacion={notificacion}
                        onClick={handleNotificacionClick}
                        onEliminar={eliminarNotificacion}
                        isSelected={selectedNotificacion?.id === notificacion.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="p-2 sm:p-3 border-t border-red-500/30">
              <div className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className="text-gray-400">
                  {notificacionesFiltradas.length} de {notificaciones.length} notificaciones
                </span>
                <span className="text-red-400">
                  {notificacionesSinWhatsApp} pendientes por WhatsApp
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <WhatsAppModal
        isOpen={whatsappModalOpen}
        onClose={() => {
          setWhatsappModalOpen(false);
          setNotificacionSeleccionada(null);
          setSelectedNotificacion(null);
          cargarNotificaciones();
        }}
        notificacion={notificacionSeleccionada}
        onEnviar={() => {
          cargarNotificaciones();
        }}
      />
    </>
  );
};

export default NotificacionesPanel;