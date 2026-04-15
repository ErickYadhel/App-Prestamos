import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CurrencyDollarIcon,
  BellIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  UserIcon,
  BanknotesIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

// Modal para ver todos los eventos de un día
const EventosDelDiaModal = ({ isOpen, onClose, fecha, eventos }) => {
  const { theme } = useTheme();
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);

  if (!isOpen) return null;

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const getEventoStyles = (tipo) => {
    switch(tipo) {
      case 'pago': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', icon: CurrencyDollarIcon };
      case 'prestamo': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', icon: DocumentTextIcon };
      case 'vencimiento': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: ExclamationTriangleIcon };
      case 'alerta': return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', icon: BellIcon };
      case 'advertencia': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', icon: ExclamationTriangleIcon };
      case 'desembolso': return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', icon: BanknotesIcon };
      default: return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', icon: CalendarIcon };
    }
  };

  const handleVerDetalle = (evento) => {
    setEventoSeleccionado(evento);
    setDetalleAbierto(true);
  };

  const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[80vh] mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
            
            <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Eventos del día
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {fechaFormateada}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {eventos.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No hay eventos programados para este día
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eventos.map((evento, idx) => {
                      const styles = getEventoStyles(evento.tipo);
                      const Icon = styles.icon;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${styles.bg} ${styles.border}`}
                          onClick={() => handleVerDetalle(evento)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-lg ${styles.text} bg-white/50 dark:bg-black/20`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${styles.text}`}>
                                  {evento.titulo}
                                </p>
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {evento.descripcion?.substring(0, 100)}...
                                </p>
                                {evento.monto > 0 && (
                                  <p className={`text-xs font-semibold mt-1 ${styles.text}`}>
                                    Monto: {formatearMonto(evento.monto)}
                                  </p>
                                )}
                                {evento.diasRestantes !== undefined && (
                                  <p className={`text-xs mt-1 ${
                                    evento.diasRestantes <= 0 ? 'text-red-600' : 
                                    evento.diasRestantes <= 2 ? 'text-orange-600' : 'text-yellow-600'
                                  }`}>
                                    {evento.diasRestantes <= 0 ? '⚠️ VENCIDO' : `⏰ Vence en ${evento.diasRestantes} días`}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                              title="Ver detalles"
                            >
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} flex justify-end`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Total de eventos: {eventos.length}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Modal de detalle de evento individual */}
      <EventoDetalleModal
        isOpen={detalleAbierto}
        onClose={() => {
          setDetalleAbierto(false);
          setEventoSeleccionado(null);
        }}
        evento={eventoSeleccionado}
      />
    </>
  );
};

// Modal de detalle de evento individual
const EventoDetalleModal = ({ isOpen, onClose, evento }) => {
  const { theme } = useTheme();
  if (!isOpen || !evento) return null;

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const getEventoColor = (tipo) => {
    switch(tipo) {
      case 'pago': return 'from-green-500 to-green-700';
      case 'prestamo': return 'from-blue-500 to-blue-700';
      case 'vencimiento': return 'from-red-500 to-red-700';
      case 'alerta': return 'from-yellow-500 to-yellow-700';
      case 'advertencia': return 'from-orange-500 to-orange-700';
      case 'desembolso': return 'from-purple-500 to-purple-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getEventoIcon = (tipo) => {
    switch(tipo) {
      case 'pago': return CurrencyDollarIcon;
      case 'prestamo': return DocumentTextIcon;
      case 'vencimiento': return ExclamationTriangleIcon;
      case 'alerta': return BellIcon;
      case 'advertencia': return ExclamationTriangleIcon;
      case 'desembolso': return BanknotesIcon;
      default: return CalendarIcon;
    }
  };

  const color = getEventoColor(evento?.tipo);
  const Icono = getEventoIcon(evento?.tipo);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[450] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur-xl opacity-75`} />
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center bg-gradient-to-r ${color} bg-opacity-10`}>
              <div className="flex items-center space-x-2">
                <Icono className="h-5 w-5 text-white" />
                <h3 className={`font-bold text-white`}>{evento?.titulo}</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{evento?.descripcion}</p>
              {evento?.fecha && (
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  📅 {new Date(evento.fecha).toLocaleDateString('es-DO', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              )}
              {evento?.cliente && (
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>👤 Cliente: {evento.cliente}</p>
              )}
              {evento?.monto > 0 && (
                <p className={`text-sm font-semibold text-green-600`}>💰 Monto: {formatearMonto(evento.monto)}</p>
              )}
              {evento?.montoCapital > 0 && (
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>💵 Capital: {formatearMonto(evento.montoCapital)}</p>
              )}
              {evento?.montoInteres > 0 && (
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>📈 Interés: {formatearMonto(evento.montoInteres)}</p>
              )}
              {evento?.montoMora > 0 && (
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>⚠️ Mora: {formatearMonto(evento.montoMora)}</p>
              )}
              {evento?.diasRestantes !== undefined && (
                <p className={`text-xs font-medium ${evento.diasRestantes <= 0 ? 'text-red-600' : evento.diasRestantes <= 2 ? 'text-orange-600' : 'text-yellow-600'}`}>
                  ⚠️ {evento.diasRestantes <= 0 ? 'VENCIDO' : `Vence en ${evento.diasRestantes} días`}
                </p>
              )}
              <div className="flex justify-end pt-2">
                <button onClick={onClose} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium">Cerrar</button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente para mostrar evento dentro del día
const EventoBadge = ({ evento, onClick }) => {
  const { theme } = useTheme();
  
  const getEventoStyles = (tipo) => {
    switch(tipo) {
      case 'pago':
        return {
          bg: 'bg-green-500',
          bgLight: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-700 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800',
          icon: CurrencyDollarIcon
        };
      case 'prestamo':
        return {
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-700 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800',
          icon: DocumentTextIcon
        };
      case 'vencimiento':
        return {
          bg: 'bg-red-500',
          bgLight: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-700 dark:text-red-400',
          border: 'border-red-200 dark:border-red-800',
          icon: ExclamationTriangleIcon
        };
      case 'alerta':
        return {
          bg: 'bg-yellow-500',
          bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-700 dark:text-yellow-400',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: BellIcon
        };
      case 'advertencia':
        return {
          bg: 'bg-orange-500',
          bgLight: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-700 dark:text-orange-400',
          border: 'border-orange-200 dark:border-orange-800',
          icon: ExclamationTriangleIcon
        };
      case 'desembolso':
        return {
          bg: 'bg-purple-500',
          bgLight: 'bg-purple-100 dark:bg-purple-900/30',
          text: 'text-purple-700 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800',
          icon: BanknotesIcon
        };
      default:
        return {
          bg: 'bg-gray-500',
          bgLight: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
          icon: CalendarIcon
        };
    }
  };

  const styles = getEventoStyles(evento.tipo);
  const Icon = styles.icon;

  const mostrarMonto = evento.monto > 0;
  const montoFormateado = evento.monto ? (evento.monto / 1000).toFixed(0) : null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(evento);
      }}
      className={`w-full text-left px-2 py-1 rounded-lg text-xs font-medium mb-1 transition-all hover:scale-[1.02] ${styles.bgLight} ${styles.border} border`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center space-x-1 min-w-0 flex-1">
          <Icon className={`h-3 w-3 ${styles.text} flex-shrink-0`} />
          <span className={`truncate ${styles.text}`}>{evento.titulo}</span>
        </div>
        {mostrarMonto && (
          <span className={`text-[10px] font-bold ${styles.text} flex-shrink-0`}>
            ${montoFormateado}K
          </span>
        )}
      </div>
    </button>
  );
};

const CalendarWidget = () => {
  const { theme } = useTheme();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalDiaAbierto, setModalDiaAbierto] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [eventosDelDia, setEventosDelDia] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalPagos: 0,
    totalPrestamos: 0,
    totalVencimientos: 0,
    totalAlertas: 0,
    totalRecaudado: 0
  });

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  // Función para calcular el monto total de un pago
  const calcularMontoTotalPago = (pago) => {
    const capital = parseFloat(pago.montoCapital) || 0;
    const interes = parseFloat(pago.montoInteres) || 0;
    const mora = parseFloat(pago.montoMora) || 0;
    const total = pago.montoTotal || pago.total || pago.monto || 0;
    
    if (total > 0) return total;
    return capital + interes + mora;
  };

  const cargarEventos = async () => {
    try {
      setLoading(true);
      
      // Cargar pagos
      const pagosRef = collection(db, 'pagos');
      const pagosQuery = query(pagosRef, orderBy('fechaPago', 'desc'), limit(200));
      const pagosSnap = await getDocs(pagosQuery);
      
      let totalRecaudado = 0;
      
      const pagosEventos = pagosSnap.docs.map(doc => {
        const data = doc.data();
        let fechaEvento = data.fechaPago;
        if (fechaEvento?.toDate) fechaEvento = fechaEvento.toDate();
        else if (fechaEvento) fechaEvento = new Date(fechaEvento);
        else fechaEvento = new Date();
        
        const montoTotal = calcularMontoTotalPago(data);
        const montoCapital = parseFloat(data.montoCapital) || 0;
        const montoInteres = parseFloat(data.montoInteres) || 0;
        const montoMora = parseFloat(data.montoMora) || 0;
        
        totalRecaudado += montoTotal;
        
        let titulo = '';
        if (data.tipoPago === 'mora') {
          titulo = `⚠️ Pago con Mora - ${data.clienteNombre || data.cliente || 'Cliente'}`;
        } else if (data.tipoPago === 'adelantado') {
          titulo = `⏩ Pago Adelantado - ${data.clienteNombre || data.cliente || 'Cliente'}`;
        } else if (data.tipoPago === 'abono') {
          titulo = `💵 Abono a Capital - ${data.clienteNombre || data.cliente || 'Cliente'}`;
        } else {
          titulo = `💰 Pago - ${data.clienteNombre || data.cliente || 'Cliente'}`;
        }
        
        let descripcion = `Pago registrado por un monto total de ${formatearMonto(montoTotal)}.`;
        if (montoCapital > 0) descripcion += ` Capital: ${formatearMonto(montoCapital)}.`;
        if (montoInteres > 0) descripcion += ` Interés: ${formatearMonto(montoInteres)}.`;
        if (montoMora > 0) descripcion += ` Mora: ${formatearMonto(montoMora)}.`;
        
        return {
          id: `pago-${doc.id}`,
          tipo: 'pago',
          titulo: titulo,
          fecha: fechaEvento,
          cliente: data.clienteNombre || data.cliente,
          monto: montoTotal,
          montoCapital: montoCapital,
          montoInteres: montoInteres,
          montoMora: montoMora,
          tipoPago: data.tipoPago || 'normal',
          descripcion: descripcion
        };
      });
      
      // Cargar préstamos
      const prestamosRef = collection(db, 'prestamos');
      const prestamosQuery = query(prestamosRef, orderBy('fechaPrestamo', 'desc'), limit(200));
      const prestamosSnap = await getDocs(prestamosQuery);
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const prestamosEventos = prestamosSnap.docs.map(doc => {
        const data = doc.data();
        let fechaPrestamo = data.fechaPrestamo;
        if (fechaPrestamo?.toDate) fechaPrestamo = fechaPrestamo.toDate();
        else if (fechaPrestamo) fechaPrestamo = new Date(fechaPrestamo);
        else fechaPrestamo = new Date();
        
        let fechaVencimiento = null;
        if (data.fechaProximoPago) {
          if (data.fechaProximoPago.toDate) fechaVencimiento = data.fechaProximoPago.toDate();
          else fechaVencimiento = new Date(data.fechaProximoPago);
        } else if (fechaPrestamo) {
          fechaVencimiento = new Date(fechaPrestamo);
          if (data.frecuencia === 'quincenal') fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
          else if (data.frecuencia === 'mensual') fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
          else fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        }
        
        const eventosDelPrestamo = [];
        const montoPrestamo = parseFloat(data.montoPrestado) || 0;
        
        if (data.estado === 'activo') {
          eventosDelPrestamo.push({
            id: `prestamo-desembolso-${doc.id}`,
            tipo: 'desembolso',
            titulo: `💸 Desembolso - ${data.clienteNombre || 'Cliente'}`,
            fecha: fechaPrestamo,
            cliente: data.clienteNombre,
            monto: montoPrestamo,
            descripcion: `Desembolso de préstamo por ${formatearMonto(montoPrestamo)}. Frecuencia: ${data.frecuencia || 'mensual'}, Interés: ${data.interesPercent || 0}%`
          });
        }
        
        if (fechaVencimiento && data.estado === 'activo') {
          const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
          const capitalRestante = parseFloat(data.capitalRestante) || montoPrestamo;
          
          eventosDelPrestamo.push({
            id: `prestamo-vencimiento-${doc.id}`,
            tipo: diasRestantes <= 0 ? 'vencimiento' : (diasRestantes <= 3 ? 'advertencia' : 'alerta'),
            titulo: diasRestantes <= 0 
              ? `🔴 Pago VENCIDO - ${data.clienteNombre || 'Cliente'}` 
              : `📅 Vencimiento - ${data.clienteNombre || 'Cliente'}`,
            fecha: fechaVencimiento,
            cliente: data.clienteNombre,
            monto: capitalRestante,
            diasRestantes: diasRestantes,
            descripcion: diasRestantes <= 0 
              ? `El pago está VENCIDO hace ${Math.abs(diasRestantes)} días. Debe cobrar ${formatearMonto(capitalRestante)}`
              : `Vence en ${diasRestantes} días. Monto pendiente: ${formatearMonto(capitalRestante)}`
          });
        }
        
        return eventosDelPrestamo;
      }).flat();
      
      // Generar alertas automáticas
      const alertas = [];
      const prestamosProximos = prestamosSnap.docs.filter(doc => {
        const data = doc.data();
        if (data.estado !== 'activo') return false;
        let fechaVencimiento = null;
        if (data.fechaProximoPago) {
          if (data.fechaProximoPago.toDate) fechaVencimiento = data.fechaProximoPago.toDate();
          else fechaVencimiento = new Date(data.fechaProximoPago);
        }
        if (!fechaVencimiento && data.fechaPrestamo) {
          let fp = data.fechaPrestamo;
          if (fp.toDate) fp = fp.toDate();
          else fp = new Date(fp);
          fechaVencimiento = new Date(fp);
          if (data.frecuencia === 'quincenal') fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
          else if (data.frecuencia === 'mensual') fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
          else fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        }
        if (!fechaVencimiento) return false;
        const dias = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        return dias >= 0 && dias <= 3;
      });
      
      prestamosProximos.forEach(doc => {
        const data = doc.data();
        let fechaVencimiento = null;
        if (data.fechaProximoPago) {
          if (data.fechaProximoPago.toDate) fechaVencimiento = data.fechaProximoPago.toDate();
          else fechaVencimiento = new Date(data.fechaProximoPago);
        }
        if (fechaVencimiento) {
          const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
          const capitalRestante = parseFloat(data.capitalRestante) || parseFloat(data.montoPrestado) || 0;
          
          alertas.push({
            id: `alerta-${doc.id}`,
            tipo: fechaVencimiento < hoy ? 'vencimiento' : 'advertencia',
            titulo: fechaVencimiento < hoy 
              ? `🔴 ALERTA: Pago VENCIDO - ${data.clienteNombre || 'Cliente'}` 
              : `🟠 ALERTA: Pago por vencer - ${data.clienteNombre || 'Cliente'}`,
            fecha: fechaVencimiento,
            cliente: data.clienteNombre,
            monto: capitalRestante,
            diasRestantes: diasRestantes,
            descripcion: fechaVencimiento < hoy 
              ? `¡URGENTE! El cliente ${data.clienteNombre} tiene un pago VENCIDO hace ${Math.abs(diasRestantes)} días. Monto pendiente: ${formatearMonto(capitalRestante)}`
              : `El cliente ${data.clienteNombre} tiene un pago que vence en ${diasRestantes} días. Monto pendiente: ${formatearMonto(capitalRestante)}`
          });
        }
      });
      
      const todosEventos = [...pagosEventos, ...prestamosEventos, ...alertas];
      
      const eventosUnicos = [];
      const claveEventos = new Set();
      
      todosEventos.forEach(evento => {
        const fechaKey = evento.fecha ? new Date(evento.fecha).toDateString() : '';
        const clave = `${evento.tipo}-${evento.cliente}-${fechaKey}`;
        if (!claveEventos.has(clave)) {
          claveEventos.add(clave);
          eventosUnicos.push(evento);
        }
      });
      
      const eventosOrdenados = eventosUnicos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      
      setEventos(eventosOrdenados);
      
      setEstadisticas({
        totalPagos: pagosEventos.length,
        totalPrestamos: prestamosSnap.docs.length,
        totalVencimientos: alertas.filter(a => a.tipo === 'vencimiento').length,
        totalAlertas: alertas.length,
        totalRecaudado: totalRecaudado
      });
      
    } catch (error) {
      console.error('Error cargando eventos:', error);
      const hoy = new Date();
      const eventosEjemplo = [
        { id: '1', tipo: 'pago', titulo: '💰 Pago - Juan Pérez', fecha: new Date(), cliente: 'Juan Pérez', monto: 1500, montoCapital: 1000, montoInteres: 500, descripcion: 'Pago de cuota quincenal' },
        { id: '2', tipo: 'prestamo', titulo: '📄 Préstamo - María Rodríguez', fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), cliente: 'María Rodríguez', monto: 25000, descripcion: 'Préstamo aprobado' },
        { id: '3', tipo: 'desembolso', titulo: '💸 Desembolso - Carlos López', fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), cliente: 'Carlos López', monto: 15000, descripcion: 'Desembolso de préstamo' },
        { id: '4', tipo: 'vencimiento', titulo: '⚠️ Pago VENCIDO - Ana Martínez', fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), cliente: 'Ana Martínez', monto: 5000, diasRestantes: -2, descripcion: 'Pago vencido' },
        { id: '5', tipo: 'advertencia', titulo: '🟠 Pago próximo a vencer - Pedro Sánchez', fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), cliente: 'Pedro Sánchez', monto: 3000, diasRestantes: 2, descripcion: 'Vence en 2 días' }
      ];
      setEventos(eventosEjemplo);
      setEstadisticas({ totalPagos: 1, totalPrestamos: 3, totalVencimientos: 1, totalAlertas: 2, totalRecaudado: 1500 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const cambiarMes = (incremento) => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + incremento, 1));
  };

  const irHoy = () => {
    setFechaActual(new Date());
  };

  const handleEventoClick = (evento) => {
    setEventoSeleccionado(evento);
    setModalAbierto(true);
  };

  const handleDiaClick = (fecha, eventosDelDia) => {
    setDiaSeleccionado(fecha);
    setEventosDelDia(eventosDelDia);
    setModalDiaAbierto(true);
  };

  const getDiasDelMes = () => {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();
    
    const dias = [];
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
        eventos: eventos.filter(e => {
          const fechaEvento = new Date(e.fecha);
          return fechaEvento.toDateString() === fecha.toDateString();
        })
      });
    }
    
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(year, month, i);
      dias.push({
        dia: i,
        fecha,
        esMesActual: true,
        eventos: eventos.filter(e => {
          const fechaEvento = new Date(e.fecha);
          return fechaEvento.toDateString() === fecha.toDateString();
        })
      });
    }
    
    const totalDiasMostrados = 42;
    const diasRestantes = totalDiasMostrados - dias.length;
    
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(year, month + 1, i);
      dias.push({
        dia: i,
        fecha,
        esMesActual: false,
        eventos: eventos.filter(e => {
          const fechaEvento = new Date(e.fecha);
          return fechaEvento.toDateString() === fecha.toDateString();
        })
      });
    }
    
    return dias;
  };

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasDelMes = getDiasDelMes();

  return (
    <>
      <GlassCard>
        <div className="p-4">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Calendario de Eventos
                </h4>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Pagos, préstamos, vencimientos y alertas
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button onClick={() => cambiarMes(-1)} className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </span>
              <button onClick={() => cambiarMes(1)} className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button onClick={irHoy} className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Hoy
              </button>
              <button onClick={cargarEventos} className="p-1 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Actualizar">
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-green-500"></div><span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pagos</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-blue-500"></div><span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-purple-500"></div><span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Desembolsos</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-red-500"></div><span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Vencidos</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-orange-500"></div><span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Próximos a vencer</span></div>
            <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-yellow-500"></div><span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Alertas</span></div>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center"><div className="animate-pulse text-gray-400">Cargando eventos...</div></div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {diasSemana.map((dia, idx) => (
                  <div key={idx} className={`text-center text-xs font-medium py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{dia}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {diasDelMes.map((dia, idx) => {
                  const eventosMostrar = dia.eventos.slice(0, 3);
                  const eventosRestantes = dia.eventos.length - 3;
                  const tieneMasEventos = eventosRestantes > 0;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => dia.eventos.length > 0 && handleDiaClick(dia.fecha, dia.eventos)}
                      className={`min-h-[100px] p-1 rounded-lg border cursor-pointer transition-all ${
                        dia.esMesActual
                          ? theme === 'dark' ? 'bg-gray-800/50 border-gray-700 hover:border-red-600/50' : 'bg-white border-gray-200 hover:border-red-600/50'
                          : theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'
                      } ${dia.eventos.length > 0 ? 'hover:shadow-lg' : ''}`}
                    >
                      <div className={`text-xs text-right font-medium mb-1 ${dia.esMesActual ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-600') : 'text-gray-400'}`}>
                        {dia.dia}
                      </div>
                      <div className="space-y-1">
                        {eventosMostrar.map((evento, i) => (
                          <EventoBadge key={i} evento={evento} onClick={handleEventoClick} />
                        ))}
                        {tieneMasEventos && (
                          <div className="text-center text-[10px] font-medium text-gray-400 py-0.5">
                            +{eventosRestantes} más...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className={`text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pagos</p>
                    <p className="text-sm font-bold text-green-600">{estadisticas.totalPagos}</p>
                  </div>
                  <div className={`text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Préstamos</p>
                    <p className="text-sm font-bold text-blue-600">{estadisticas.totalPrestamos}</p>
                  </div>
                  <div className={`text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Vencidos</p>
                    <p className="text-sm font-bold text-red-600">{estadisticas.totalVencimientos}</p>
                  </div>
                  <div className={`text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Alertas</p>
                    <p className="text-sm font-bold text-orange-600">{estadisticas.totalAlertas}</p>
                  </div>
                  <div className={`text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Recaudado</p>
                    <p className="text-sm font-bold text-purple-600">{formatearMonto(estadisticas.totalRecaudado)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </GlassCard>

      <EventoDetalleModal isOpen={modalAbierto} onClose={() => { setModalAbierto(false); setEventoSeleccionado(null); }} evento={eventoSeleccionado} />
      
      <EventosDelDiaModal 
        isOpen={modalDiaAbierto} 
        onClose={() => { setModalDiaAbierto(false); setDiaSeleccionado(null); setEventosDelDia([]); }} 
        fecha={diaSeleccionado} 
        eventos={eventosDelDia} 
      />
    </>
  );
};

export default CalendarWidget;