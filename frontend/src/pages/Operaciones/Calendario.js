import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  CalendarIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  BellIcon,
  CurrencyDollarIcon,
  UserIcon,
  DocumentTextIcon,
  ClockIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

// ============================================
// MODAL PARA DETALLE DE EVENTO
// ============================================
const EventoModal = ({ isOpen, onClose, evento }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventoIcon = (tipo) => {
    switch(tipo) {
      case 'pago': return CurrencyDollarIcon;
      case 'recordatorio': return BellIcon;
      case 'prestamo': return DocumentTextIcon;
      case 'notificacion': return ChatBubbleLeftRightIcon;
      case 'llamada': return PhoneIcon;
      case 'email': return EnvelopeIcon;
      default: return CalendarIcon;
    }
  };

  const getEventoColor = (tipo) => {
    switch(tipo) {
      case 'pago': return 'from-green-500 to-green-700';
      case 'recordatorio': return 'from-yellow-500 to-yellow-700';
      case 'prestamo': return 'from-blue-500 to-blue-700';
      case 'notificacion': return 'from-purple-500 to-purple-700';
      case 'llamada': return 'from-indigo-500 to-indigo-700';
      case 'email': return 'from-cyan-500 to-cyan-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const Icono = getEventoIcon(evento?.tipo);
  const color = getEventoColor(evento?.tipo);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur-xl opacity-75`} />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
                  <Icono className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Detalle del Evento
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {evento?.tipo?.charAt(0).toUpperCase() + evento?.tipo?.slice(1)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Título y fecha */}
              <div>
                <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {evento?.titulo}
                </h4>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatearFecha(evento?.fecha)}
                </p>
              </div>

              {/* Información del cliente */}
              {evento?.cliente && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Cliente
                    </h5>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {evento.cliente}
                  </p>
                  {evento.clienteContacto && (
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Contacto: {evento.clienteContacto}
                    </p>
                  )}
                </div>
              )}

              {/* Descripción */}
              {evento?.descripcion && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border`}>
                  <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Descripción
                  </h5>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {evento.descripcion}
                  </p>
                </div>
              )}

              {/* Información adicional según tipo */}
              {evento?.tipo === 'pago' && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border`}>
                  <h5 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Detalles del Pago
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Monto</p>
                      <p className={`font-semibold text-green-600`}>{formatearMonto(evento.monto)}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Estado</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        evento.estado === 'completado'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {evento.estado}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {evento?.tipo === 'prestamo' && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border`}>
                  <h5 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Detalles del Préstamo
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Monto</p>
                      <p className={`font-semibold text-blue-600`}>{formatearMonto(evento.monto)}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Plazo</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {evento.plazo} meses
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Interés</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {evento.interes}%
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Estado</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        evento.estado === 'activo'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {evento.estado}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Estado y acciones */}
              <div className="flex justify-between items-center pt-4">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    evento?.completado
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {evento?.completado ? 'Completado' : 'Pendiente'}
                  </span>
                  {evento?.recordatorio && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Recordatorio enviado
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
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
// COMPONENTE DE CALENDARIO
// ============================================
const CalendarioMensual = ({ eventos, onEventoClick }) => {
  const { theme } = useTheme();
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diasMes, setDiasMes] = useState([]);

  useEffect(() => {
    generarDiasMes();
  }, [fechaActual, eventos]);

  const generarDiasMes = () => {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    const dias = [];
    
    // Días del mes anterior
    const diasMesAnterior = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;
    const mesAnterior = new Date(year, month, 0);
    const diasEnMesAnterior = mesAnterior.getDate();
    
    for (let i = diasMesAnterior - 1; i >= 0; i--) {
      const dia = diasEnMesAnterior - i;
      const fecha = new Date(year, month - 1, dia);
      dias.push({
        dia,
        fecha,
        esMesActual: false,
        eventos: eventos?.filter(e => {
          const fechaEvento = new Date(e.fecha);
          return fechaEvento.toDateString() === fecha.toDateString();
        }) || []
      });
    }
    
    // Días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(year, month, i);
      dias.push({
        dia: i,
        fecha,
        esMesActual: true,
        eventos: eventos?.filter(e => {
          const fechaEvento = new Date(e.fecha);
          return fechaEvento.toDateString() === fecha.toDateString();
        }) || []
      });
    }
    
    // Días del mes siguiente para completar la cuadrícula
    const totalDiasMostrados = 42; // 6 semanas
    const diasRestantes = totalDiasMostrados - dias.length;
    
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(year, month + 1, i);
      dias.push({
        dia: i,
        fecha,
        esMesActual: false,
        eventos: eventos?.filter(e => {
          const fechaEvento = new Date(e.fecha);
          return fechaEvento.toDateString() === fecha.toDateString();
        }) || []
      });
    }
    
    setDiasMes(dias);
  };

  const cambiarMes = (incremento) => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + incremento, 1));
  };

  const irHoy = () => {
    setFechaActual(new Date());
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getEventoColor = (tipo) => {
    switch(tipo) {
      case 'pago': return 'bg-green-500';
      case 'recordatorio': return 'bg-yellow-500';
      case 'prestamo': return 'bg-blue-500';
      case 'notificacion': return 'bg-purple-500';
      case 'llamada': return 'bg-indigo-500';
      case 'email': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`rounded-xl border ${
      theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
    } shadow-lg overflow-hidden`}>
      {/* Cabecera del calendario */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => cambiarMes(-1)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => cambiarMes(1)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
          </div>
          <button
            onClick={irHoy}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Hoy
          </button>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pagos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Recordatorios</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Notificaciones</span>
          </div>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        {diasSemana.map((dia, index) => (
          <div
            key={index}
            className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7">
        {diasMes.map((dia, index) => (
          <div
            key={index}
            className={`min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 ${
              !dia.esMesActual ? 'bg-gray-50 dark:bg-gray-900/50' : ''
            }`}
          >
            <div className={`text-sm font-medium mb-1 ${
              !dia.esMesActual 
                ? 'text-gray-400 dark:text-gray-600' 
                : theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {dia.dia}
            </div>
            
            <div className="space-y-1">
              {dia.eventos.slice(0, 3).map((evento, i) => (
                <button
                  key={i}
                  onClick={() => onEventoClick(evento)}
                  className={`w-full text-left p-1 rounded text-xs text-white ${getEventoColor(evento.tipo)} hover:opacity-90 transition-opacity truncate`}
                  title={evento.titulo}
                >
                  {evento.titulo}
                </button>
              ))}
              {dia.eventos.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                  +{dia.eventos.length - 3} más
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// TARJETA DE ESTADÍSTICA
// ============================================
const StatCard = ({ icon: Icon, label, value, color }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl p-4 border ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-8 -mt-8`} />
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// LISTA DE PRÓXIMOS EVENTOS
// ============================================
const ProximosEventos = ({ eventos, onEventoClick }) => {
  const { theme } = useTheme();

  const getEventoIcon = (tipo) => {
    switch(tipo) {
      case 'pago': return CurrencyDollarIcon;
      case 'recordatorio': return BellIcon;
      case 'prestamo': return DocumentTextIcon;
      case 'notificacion': return ChatBubbleLeftRightIcon;
      default: return CalendarIcon;
    }
  };

  const getEventoColor = (tipo) => {
    switch(tipo) {
      case 'pago': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'recordatorio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'prestamo': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'notificacion': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`rounded-xl border ${
      theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
    } shadow-lg overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Próximos Eventos
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {eventos.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No hay eventos programados
            </p>
          </div>
        ) : (
          eventos.slice(0, 10).map((evento, index) => {
            const Icono = getEventoIcon(evento.tipo);
            return (
              <button
                key={index}
                onClick={() => onEventoClick(evento)}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getEventoColor(evento.tipo)}`}>
                    <Icono className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {evento.titulo}
                    </p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatearFecha(evento.fecha)}
                    </p>
                    {evento.cliente && (
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Cliente: {evento.cliente}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    evento.completado
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {evento.completado ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Calendario = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Cargar eventos desde Firebase
  const cargarEventos = async () => {
    try {
      setLoading(true);
      
      const eventosPromises = [
        // Cargar pagos
        (async () => {
          const pagosRef = collection(db, 'pagos');
          const pagosQuery = query(pagosRef, orderBy('fecha', 'desc'), limit(50));
          const pagosSnap = await getDocs(pagosQuery);
          return pagosSnap.docs.map(doc => ({
            id: doc.id,
            tipo: 'pago',
            titulo: `Pago de ${doc.data().cliente || 'cliente'}`,
            fecha: doc.data().fecha,
            cliente: doc.data().cliente,
            monto: doc.data().monto,
            estado: doc.data().estado,
            completado: doc.data().estado === 'completado',
            ...doc.data()
          }));
        })(),

        // Cargar préstamos
        (async () => {
          const prestamosRef = collection(db, 'prestamos');
          const prestamosQuery = query(prestamosRef, orderBy('fechaCreacion', 'desc'), limit(50));
          const prestamosSnap = await getDocs(prestamosQuery);
          return prestamosSnap.docs.map(doc => ({
            id: doc.id,
            tipo: 'prestamo',
            titulo: `Préstamo - ${doc.data().cliente || 'cliente'}`,
            fecha: doc.data().fechaCreacion,
            cliente: doc.data().cliente,
            monto: doc.data().monto,
            plazo: doc.data().plazo,
            interes: doc.data().interes,
            estado: doc.data().estado,
            completado: doc.data().estado === 'completado',
            ...doc.data()
          }));
        })(),

        // Cargar recordatorios (simulados por ahora)
        Promise.resolve([
          {
            id: 'rec1',
            tipo: 'recordatorio',
            titulo: 'Recordatorio de pago',
            fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            cliente: 'Juan Pérez',
            descripcion: 'Recordatorio de pago de cuota',
            completado: false
          },
          {
            id: 'rec2',
            tipo: 'recordatorio',
            titulo: 'Llamada de seguimiento',
            fecha: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            cliente: 'María Rodríguez',
            descripcion: 'Seguimiento de solicitud de préstamo',
            completado: false
          },
          {
            id: 'rec3',
            tipo: 'notificacion',
            titulo: 'Notificación de aprobación',
            fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            cliente: 'Carlos López',
            descripcion: 'Préstamo aprobado',
            completado: true
          }
        ])
      ];

      const [pagos, prestamos, recordatorios] = await Promise.all(eventosPromises);
      
      const todosEventos = [...pagos, ...prestamos, ...recordatorios].sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha)
      );

      setEventos(todosEventos);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  // Filtrar eventos
  const eventosFiltrados = eventos.filter(evento => {
    if (filtroTipo !== 'todos' && evento.tipo !== filtroTipo) return false;
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      return (
        evento.titulo?.toLowerCase().includes(busquedaLower) ||
        evento.cliente?.toLowerCase().includes(busquedaLower) ||
        evento.descripcion?.toLowerCase().includes(busquedaLower)
      );
    }
    return true;
  });

  // Estadísticas
  const hoy = new Date().toISOString().split('T')[0];
  const manana = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const eventosHoy = eventos.filter(e => e.fecha?.startsWith(hoy)).length;
  const eventosManana = eventos.filter(e => e.fecha?.startsWith(manana)).length;
  const eventosPendientes = eventos.filter(e => !e.completado).length;
  const eventosMes = eventos.filter(e => {
    const fechaEvento = new Date(e.fecha);
    const hoy = new Date();
    return fechaEvento.getMonth() === hoy.getMonth() && fechaEvento.getFullYear() === hoy.getFullYear();
  }).length;

  const handleEventoClick = (evento) => {
    setEventoSeleccionado(evento);
    setModalAbierto(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Calendario
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Visualiza y gestiona todos los eventos del sistema
            </p>
          </div>
        </div>

        <button
          onClick={cargarEventos}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Actualizar"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Mensajes de error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl shadow-lg flex items-center space-x-3"
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarIcon}
          label="Eventos Hoy"
          value={eventosHoy}
          color="from-red-500 to-red-700"
        />
        <StatCard
          icon={ClockIcon}
          label="Eventos Mañana"
          value={eventosManana}
          color="from-yellow-500 to-yellow-700"
        />
        <StatCard
          icon={BellIcon}
          label="Pendientes"
          value={eventosPendientes}
          color="from-blue-500 to-blue-700"
        />
        <StatCard
          icon={ChartBarIcon}
          label="Eventos del Mes"
          value={eventosMes}
          color="from-green-500 to-green-700"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
            />
          </div>
        </div>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all`}
        >
          <option value="todos">Todos los eventos</option>
          <option value="pago">Pagos</option>
          <option value="prestamo">Préstamos</option>
          <option value="recordatorio">Recordatorios</option>
          <option value="notificacion">Notificaciones</option>
        </select>
      </div>

      {/* Calendario y lista de eventos */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarioMensual 
              eventos={eventosFiltrados}
              onEventoClick={handleEventoClick}
            />
          </div>
          <div>
            <ProximosEventos 
              eventos={eventosFiltrados.filter(e => !e.completado)}
              onEventoClick={handleEventoClick}
            />
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      <EventoModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setEventoSeleccionado(null);
        }}
        evento={eventoSeleccionado}
      />
    </div>
  );
};

export default Calendario;