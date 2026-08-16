import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  EnvelopeIcon,
  ArrowPathIcon as RefreshIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  RocketLaunchIcon,
  FireIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, where, limit, Timestamp, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useGoogleCalendar } from '../../context/GoogleCalendarContext';
import ReactDOM from 'react-dom';

// ============================================
// FUNCIÓN PARA CONVERTIR FECHA DD-MM-YYYY A DATE
// ============================================
const parseFecha = (fechaStr) => {
  if (!fechaStr) return null;
  
  if (fechaStr?.toDate) return fechaStr.toDate();
  if (fechaStr?.seconds) return new Date(fechaStr.seconds * 1000);
  if (fechaStr?._seconds) return new Date(fechaStr._seconds * 1000);
  
  if (typeof fechaStr === 'string' && fechaStr.includes('-')) {
    const parts = fechaStr.split('-');
    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  
  return new Date(fechaStr);
};

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const date = fecha instanceof Date ? fecha : parseFecha(fecha);
  if (!date || isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const getClienteNombre = (data) => {
  return data.clienteNombre || data.cliente || data.nombre || 'Cliente';
};

const getMonto = (data) => {
  return data.montoTotal || data.montoPrestado || data.monto || data.total || 0;
};

// ============================================
// CONTROL DE TASA PARA GOOGLE CALENDAR API
// ============================================
class RateLimiter {
  constructor(maxCalls = 10, timeWindow = 1000) {
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindow;
    this.calls = [];
    this.queue = [];
    this.processing = false;
  }

  async wait() {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.timeWindow);
    
    if (this.calls.length >= this.maxCalls) {
      const oldestCall = this.calls[0];
      const waitTime = this.timeWindow - (now - oldestCall) + 100;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.wait();
    }
    
    this.calls.push(now);
    return true;
  }

  async execute(fn) {
    await this.wait();
    return fn();
  }
}

const rateLimiter = new RateLimiter(8, 1000); // 8 llamadas por segundo

// ============================================
// COMPONENTE DE ALERTA TIPO TARJETA
// ============================================
const AlertaTarjeta = ({ isOpen, onClose, title, message, type = 'success', onConfirm, onCancel }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getColors = () => {
    switch(type) {
      case 'success': return {
        bg: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
        border: 'border-green-200 dark:border-green-700',
        icon: CheckCircleIcon,
        iconColor: 'text-green-600 dark:text-green-400',
        btn: 'bg-green-600 hover:bg-green-700'
      };
      case 'error': return {
        bg: 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30',
        border: 'border-red-200 dark:border-red-700',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-red-600 dark:text-red-400',
        btn: 'bg-red-600 hover:bg-red-700'
      };
      case 'warning': return {
        bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30',
        border: 'border-yellow-200 dark:border-yellow-700',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        btn: 'bg-yellow-600 hover:bg-yellow-700'
      };
      default: return {
        bg: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
        border: 'border-blue-200 dark:border-blue-700',
        icon: CheckCircleIcon,
        iconColor: 'text-blue-600 dark:text-blue-400',
        btn: 'bg-blue-600 hover:bg-blue-700'
      };
    }
  };

  const colors = getColors();
  const Icon = colors.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${colors.bg} rounded-2xl blur-xl opacity-75`} />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 ${colors.border} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="p-6 text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colors.bg} border ${colors.border}`}>
                <Icon className={`h-8 w-8 ${colors.iconColor}`} />
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {message}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                )}
                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    className={`px-6 py-2.5 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all ${colors.btn}`}
                  >
                    Confirmar
                  </button>
                )}
                {!onConfirm && (
                  <button
                    onClick={onClose}
                    className={`px-6 py-2.5 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all ${colors.btn}`}
                  >
                    Aceptar
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MODAL DE EVENTOS DEL DÍA (SELECCIÓN DE DÍA)
// ============================================
const EventosDelDiaModal = ({ isOpen, onClose, fecha, eventos, onEventoClick, onEditarEvento, onNuevoEvento }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const formatearFechaCompleta = (fecha) => {
    const date = parseFecha(fecha);
    if (!date || isNaN(date.getTime())) return 'Fecha no disponible';
    return date.toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventoColor = (tipo) => {
    switch(tipo) {
      case 'pago': return 'bg-green-500';
      case 'recordatorio': return 'bg-yellow-500';
      case 'prestamo': return 'bg-blue-500';
      case 'notificacion': return 'bg-purple-500';
      case 'llamada': return 'bg-indigo-500';
      case 'email': return 'bg-cyan-500';
      case 'vencimiento': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventoIcon = (tipo) => {
    switch(tipo) {
      case 'pago': return CurrencyDollarIcon;
      case 'recordatorio': return BellIcon;
      case 'prestamo': return DocumentTextIcon;
      case 'notificacion': return ChatBubbleLeftRightIcon;
      case 'llamada': return PhoneIcon;
      case 'email': return EnvelopeIcon;
      case 'vencimiento': return ExclamationTriangleIcon;
      default: return CalendarIcon;
    }
  };

  const esCompletado = (evento) => {
    return evento.completado || evento.estado === 'completado' || evento.estado === 'pagado';
  };

  const fechaObj = typeof fecha === 'string' ? parseFecha(fecha) : fecha;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl max-h-[85vh] mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                    <CalendarDaysIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Eventos del día
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatearFechaCompleta(fechaObj)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNuevoEvento(fechaObj)}
                    className="p-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-1"
                    title="Crear evento en este día"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">Agregar</span>
                  </motion.button>
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
              </div>
            </div>

            <div className="p-4 sm:p-6 max-h-[55vh] overflow-y-auto">
              {eventos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-full blur-xl opacity-20 animate-pulse" />
                    <div className="relative p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full">
                      <CalendarIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold mt-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ¡Sin eventos!
                  </h3>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No hay eventos programados para este día
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNuevoEvento(fechaObj)}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Crear evento</span>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventos.map((evento, idx) => {
                    const Icono = getEventoIcon(evento.tipo);
                    const colorEvento = getEventoColor(evento.tipo);
                    const completado = esCompletado(evento);
                    
                    return (
                      <motion.div
                        key={evento.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          completado
                            ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                            : theme === 'dark'
                              ? 'bg-gray-800/50 border-gray-700 hover:border-red-500'
                              : 'bg-gray-50 border-gray-200 hover:border-red-500'
                        }`}
                        onClick={() => {
                          onEventoClick(evento);
                          onClose();
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`p-2 rounded-lg ${colorEvento}`}>
                              <Icono className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-sm font-semibold ${completado ? 'line-through' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {evento.titulo}
                                </p>
                                {completado && (
                                  <span className="text-[8px] px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                    ✓ Completado
                                  </span>
                                )}
                                {evento.googleEventId && (
                                  <span className="text-[8px] px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                    🔄 Sincronizado
                                  </span>
                                )}
                              </div>
                              {evento.cliente && (
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <UserIcon className="h-3 w-3 inline mr-1" />
                                  {evento.cliente}
                                </p>
                              )}
                              {evento.monto > 0 && (
                                <p className={`text-xs mt-1 text-green-600`}>
                                  RD$ {evento.monto.toLocaleString()}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${colorEvento} text-white`}>
                                  {evento.tipo}
                                </span>
                                {!completado && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditarEvento(evento);
                                      onClose();
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                                  >
                                    <PencilIcon className="h-3 w-3" />
                                    Editar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          {evento.hora && (
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} ml-2 flex-shrink-0`}>
                              {evento.hora}
                              {evento.horaFin && ` - ${evento.horaFin}`}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} flex justify-between items-center`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                📊 {eventos.length} eventos en este día
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE DE PARTÍCULAS PARA FONDO (ROJO)
// ============================================
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    
    const createParticles = () => {
      particles = [];
      const count = 50;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1
        });
      }
    };
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${p.opacity})`;
        ctx.fill();
      });
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.08 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      animationId = requestAnimationFrame(draw);
    };
    
    resize();
    createParticles();
    draw();
    
    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// ============================================
// MODAL PARA CREAR/EDITAR EVENTO (CON HORA INICIO Y FIN)
// ============================================
const EventoEditorModal = ({ isOpen, onClose, evento, onSave, onDelete, tipos }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    tipo: 'recordatorio',
    titulo: '',
    cliente: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00',
    horaFin: '10:00',
    descripcion: '',
    monto: '',
    completado: false,
    estado: 'pendiente',
    clienteID: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alerta, setAlerta] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    if (evento) {
      const fecha = evento.fecha instanceof Date ? evento.fecha : parseFecha(evento.fecha);
      const hora = evento.hora || '09:00';
      const horaFin = evento.horaFin || '';
      setFormData({
        tipo: evento.tipo || 'recordatorio',
        titulo: evento.titulo || '',
        cliente: evento.cliente || '',
        fecha: fecha ? fecha.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        hora: hora,
        horaFin: horaFin,
        descripcion: evento.descripcion || '',
        monto: evento.monto?.toString() || '',
        completado: evento.completado || false,
        estado: evento.estado || 'pendiente',
        clienteID: evento.clienteID || ''
      });
    } else {
      setFormData({
        tipo: 'recordatorio',
        titulo: '',
        cliente: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '09:00',
        horaFin: '10:00',
        descripcion: '',
        monto: '',
        completado: false,
        estado: 'pendiente',
        clienteID: ''
      });
    }
    setError('');
  }, [evento, isOpen]);

  const mostrarAlerta = (title, message, type = 'success') => {
    setAlerta({ isOpen: true, title, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fechaCompleta = new Date(`${formData.fecha}T${formData.hora}`);
      const fechaFin = formData.horaFin ? new Date(`${formData.fecha}T${formData.horaFin}`) : null;
      
      const dataToSave = {
        ...formData,
        fecha: fechaCompleta,
        fechaFin: fechaFin,
        monto: parseFloat(formData.monto) || 0,
        actualizado: new Date().toISOString()
      };

      await onSave(dataToSave, evento?.id);
      mostrarAlerta('✅ ¡Éxito!', evento ? 'Evento actualizado correctamente' : 'Evento creado correctamente', 'success');
      setTimeout(() => {
        setAlerta({ isOpen: false, title: '', message: '', type: 'success' });
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error guardando evento:', error);
      setError('Error al guardar el evento');
      mostrarAlerta('❌ Error', 'Error al guardar el evento: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!evento?.id) return;
    
    setAlerta({
      isOpen: true,
      title: '⚠️ Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.',
      type: 'warning',
      onConfirm: async () => {
        setLoading(true);
        try {
          await onDelete(evento.id);
          setAlerta({ isOpen: false, title: '', message: '', type: 'success' });
          mostrarAlerta('✅ Eliminado', 'Evento eliminado correctamente', 'success');
          setTimeout(() => {
            setAlerta({ isOpen: false, title: '', message: '', type: 'success' });
            onClose();
          }, 1000);
        } catch (error) {
          console.error('Error eliminando evento:', error);
          mostrarAlerta('❌ Error', 'Error al eliminar el evento', 'error');
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        setAlerta({ isOpen: false, title: '', message: '', type: 'warning' });
      }
    });
  };

  const tiposDisponibles = tipos || [
    { value: 'pago', label: 'Pago', color: 'red' },
    { value: 'prestamo', label: 'Préstamo', color: 'blue' },
    { value: 'vencimiento', label: 'Vencimiento', color: 'red' },
    { value: 'recordatorio', label: 'Recordatorio', color: 'yellow' },
    { value: 'notificacion', label: 'Notificación', color: 'purple' },
    { value: 'llamada', label: 'Llamada', color: 'indigo' },
    { value: 'email', label: 'Email', color: 'cyan' },
    { value: 'reunion', label: 'Reunión', color: 'pink' }
  ];

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
            
            <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />

              <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center bg-gradient-to-r ${
                theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-lg">
                    {evento ? <PencilIcon className="h-5 w-5 text-white" /> : <PlusIcon className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {evento ? 'Editar Evento' : 'Nuevo Evento'}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {evento ? 'Modifica los detalles del evento' : 'Crea un nuevo evento en el calendario'}
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

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo de Evento *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      disabled={loading}
                    >
                      {tiposDisponibles.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="Ej: Reunión con cliente"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cliente
                    </label>
                    <input
                      type="text"
                      value={formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="Nombre del cliente"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monto (RD$)
                    </label>
                    <input
                      type="number"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Hora Inicio
                    </label>
                    <input
                      type="time"
                      value={formData.hora}
                      onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Hora Fin
                    </label>
                    <input
                      type="time"
                      value={formData.horaFin}
                      onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all resize-none ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    }`}
                    placeholder="Descripción detallada del evento..."
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.completado}
                    onChange={(e) => setFormData({ ...formData, completado: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    disabled={loading}
                  />
                  <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Marcar como completado
                  </label>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {evento?.id && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>Eliminar</span>
                    </button>
                  )}
                  <div className="flex space-x-3 ml-auto">
                    <button
                      type="button"
                      onClick={onClose}
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
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>{evento ? 'Actualizar' : 'Crear'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} text-center`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  <SparklesIcon className="h-3 w-3 inline mr-1 text-red-500" />
                  Los eventos se sincronizan automáticamente con Google Calendar
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <AlertaTarjeta
        isOpen={alerta.isOpen}
        onClose={() => setAlerta({ isOpen: false, title: '', message: '', type: 'success' })}
        title={alerta.title}
        message={alerta.message}
        type={alerta.type}
        onConfirm={alerta.onConfirm}
        onCancel={alerta.onCancel}
      />
    </>
  );
};

// ============================================
// MODAL PARA DETALLE DE EVENTO (MEJORADO)
// ============================================
const EventoModal = ({ isOpen, onClose, evento, onEditar, onEliminar }) => {
  const { theme } = useTheme();
  const [alerta, setAlerta] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  if (!isOpen || !evento) return null;

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const formatearFechaCompleta = (fecha) => {
    const date = parseFecha(fecha);
    if (!date || isNaN(date.getTime())) return 'Fecha no disponible';
    return date.toLocaleDateString('es-DO', {
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
      case 'vencimiento': return ExclamationTriangleIcon;
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
      case 'vencimiento': return 'from-red-500 to-red-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const Icono = getEventoIcon(evento?.tipo);
  const color = getEventoColor(evento?.tipo);
  const esCompletado = evento?.completado || evento?.estado === 'completado' || evento?.estado === 'pagado';

  const handleEliminar = () => {
    setAlerta({
      isOpen: true,
      title: '⚠️ Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este evento?',
      type: 'warning',
      onConfirm: async () => {
        await onEliminar(evento.id);
        setAlerta({ isOpen: false, title: '', message: '', type: 'success' });
        onClose();
      },
      onCancel: () => {
        setAlerta({ isOpen: false, title: '', message: '', type: 'warning' });
      }
    });
  };

  const mostrarAlerta = (title, message, type = 'success') => {
    setAlerta({ isOpen: true, title, message, type });
    setTimeout(() => {
      setAlerta({ isOpen: false, title: '', message: '', type: 'success' });
    }, 2000);
  };

  return (
    <>
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
                <div className="flex items-center space-x-2">
                  {!esCompletado && (
                    <button
                      onClick={() => onEditar(evento)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'bg-white/10 hover:bg-white/20 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Editar evento"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  )}
                  {evento?.id && evento?.id.startsWith('personalizado-') && (
                    <button
                      onClick={handleEliminar}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'bg-white/10 hover:bg-white/20 text-red-400 hover:text-red-300' 
                          : 'bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600'
                      }`}
                      title="Eliminar evento"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
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
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {evento?.titulo}
                  </h4>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatearFechaCompleta(evento?.fecha)}
                  </p>
                  {evento?.hora && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      🕐 {evento.hora}{evento.horaFin && ` - ${evento.horaFin}`}
                    </p>
                  )}
                </div>

                {evento?.cliente && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cliente</h5>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {evento.cliente}
                    </p>
                  </div>
                )}

                {evento?.descripcion && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border`}>
                    <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Descripción</h5>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {evento.descripcion}
                    </p>
                  </div>
                )}

                {(evento?.tipo === 'pago' || evento?.tipo === 'vencimiento' || evento?.monto > 0) && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border`}>
                    <h5 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Detalles del {evento?.tipo === 'pago' ? 'Pago' : evento?.tipo === 'vencimiento' ? 'Vencimiento' : 'Evento'}
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      {evento.monto > 0 && (
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Monto</p>
                          <p className={`font-semibold text-green-600`}>{formatearMonto(evento.monto)}</p>
                        </div>
                      )}
                      <div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Estado</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          esCompletado
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {esCompletado ? 'Completado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {evento?.googleEventId && (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} border border-red-200 dark:border-red-800`}>
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon className="h-4 w-4 text-red-600" />
                      <span className={`text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                        ✅ Sincronizado con Google Calendar
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      esCompletado
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {esCompletado ? 'Completado' : 'Pendiente'}
                    </span>
                    {evento?.diasRestantes !== undefined && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        evento.diasRestantes <= 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        evento.diasRestantes <= 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {evento.diasRestantes <= 0 ? 'VENCIDO' : `${evento.diasRestantes} días`}
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

      <AlertaTarjeta
        isOpen={alerta.isOpen}
        onClose={() => setAlerta({ isOpen: false, title: '', message: '', type: 'success' })}
        title={alerta.title}
        message={alerta.message}
        type={alerta.type}
        onConfirm={alerta.onConfirm}
        onCancel={alerta.onCancel}
      />
    </>
  );
};

// ============================================
// COMPONENTE DE CALENDARIO MENSUAL (MEJORADO)
// ============================================
const CalendarioMensual = ({ eventos, onEventoClick, onEventoDrag, onDiaClick }) => {
  const { theme } = useTheme();
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diasMes, setDiasMes] = useState([]);
  const [dragEvento, setDragEvento] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);

  useEffect(() => {
    generarDiasMes();
  }, [fechaActual, eventos]);

  const generarDiasMes = () => {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const hoy = new Date();
    
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
        esHoy: false,
        eventos: eventos?.filter(e => {
          const fechaEvento = parseFecha(e.fecha);
          return fechaEvento && fechaEvento.toDateString() === fecha.toDateString();
        }) || []
      });
    }
    
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(year, month, i);
      const esHoy = fecha.toDateString() === hoy.toDateString();
      dias.push({
        dia: i,
        fecha,
        esMesActual: true,
        esHoy,
        eventos: eventos?.filter(e => {
          const fechaEvento = parseFecha(e.fecha);
          return fechaEvento && fechaEvento.toDateString() === fecha.toDateString();
        }) || []
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
        esHoy: false,
        eventos: eventos?.filter(e => {
          const fechaEvento = parseFecha(e.fecha);
          return fechaEvento && fechaEvento.toDateString() === fecha.toDateString();
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
      case 'vencimiento': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDragStart = (e, evento) => {
    if (evento.completado) return;
    setDragEvento(evento);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, dia) => {
    e.preventDefault();
    setDragOverDay(dia);
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };

  const handleDrop = (e, dia) => {
    e.preventDefault();
    if (dragEvento && onEventoDrag) {
      onEventoDrag(dragEvento, dia.fecha);
    }
    setDragEvento(null);
    setDragOverDay(null);
  };

  const esEventoCompletado = (evento) => {
    return evento.completado || evento.estado === 'completado' || evento.estado === 'pagado';
  };

  return (
    <div className={`rounded-xl border ${
      theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
    } shadow-xl overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50/50 to-red-100/50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
            </h3>
            <div className="flex space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => cambiarMes(-1)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => cambiarMes(1)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={irHoy}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm"
          >
            <CalendarDaysIcon className="h-4 w-4 inline mr-2" />
            Hoy
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pagos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Vencimientos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Recordatorios</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/30"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Otros</span>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-7">
        {diasMes.map((dia, index) => {
          const isDragOver = dragOverDay && dragOverDay.dia === dia.dia && dragOverDay.fecha.toDateString() === dia.fecha.toDateString();
          const eventosDelDia = dia.eventos;
          
          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 transition-all cursor-pointer ${
                !dia.esMesActual ? 'bg-gray-50 dark:bg-gray-900/50' : ''
              } ${
                dia.esHoy ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-950/30 border-red-300 dark:border-red-700' : ''
              } ${
                isDragOver ? 'border-2 border-red-500 bg-red-50 dark:bg-red-950/30' : ''
              } hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors`}
              onDragOver={(e) => handleDragOver(e, dia)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dia)}
              onClick={() => onDiaClick && onDiaClick(dia.fecha, eventosDelDia)}
            >
              <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
                !dia.esMesActual 
                  ? 'text-gray-400 dark:text-gray-600' 
                  : dia.esHoy 
                    ? 'text-red-600 dark:text-red-400 font-bold'
                    : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <span>{dia.dia}</span>
                {dia.esHoy && (
                  <span className="text-[8px] bg-gradient-to-r from-red-600 to-red-700 text-white px-1.5 py-0.5 rounded-full shadow-lg">
                    HOY
                  </span>
                )}
                {eventosDelDia.length > 0 && (
                  <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full shadow-lg">
                    {eventosDelDia.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {eventosDelDia.slice(0, 2).map((evento, i) => {
                  const esCompletado = evento.completado || evento.estado === 'completado' || evento.estado === 'pagado';
                  const isDraggable = !esCompletado && !evento.googleEventId && evento.id?.startsWith('personalizado-');
                  
                  return (
                    <button
                      key={i}
                      draggable={isDraggable}
                      onDragStart={(e) => handleDragStart(e, evento)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventoClick(evento);
                      }}
                      className={`w-full text-left p-1 rounded text-xs text-white transition-all hover:opacity-90 truncate relative group ${
                        getEventoColor(evento.tipo)
                      } ${
                        esCompletado ? 'opacity-60 line-through' : 'shadow-sm'
                      }`}
                      title={evento.titulo}
                    >
                      <span className="flex items-center justify-between">
                        <span>{evento.titulo}</span>
                        {isDraggable && (
                          <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                            ↕
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
                {eventosDelDia.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                    +{eventosDelDia.length - 2} más
                  </div>
                )}
                {eventosDelDia.length === 0 && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 pl-1">
                    Sin eventos
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// TARJETA DE ESTADÍSTICA
// ============================================
const StatCard = ({ icon: Icon, label, value, color, trend }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg cursor-pointer group`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color} transition-all duration-500 ${
        isHovered ? 'opacity-100' : 'opacity-40'
      }`} />
      
      <div className={`absolute inset-0 bg-gradient-to-r ${color} transition-opacity duration-500 ${
        isHovered ? 'opacity-5' : 'opacity-0'
      }`} />

      <div className="relative flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium tracking-wide uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 transition-colors duration-300 ${
            isHovered ? 'text-red-600 dark:text-red-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg transition-all duration-300 ${
          isHovered ? 'scale-110 rotate-6 shadow-xl' : ''
        }`}>
          <Icon className={`h-6 w-6 text-white transition-all duration-300 ${
            isHovered ? 'rotate-3' : ''
          }`} />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// LISTA DE PRÓXIMOS EVENTOS
// ============================================
const ProximosEventos = ({ eventos, onEventoClick, onEditarEvento, eventosSincronizados }) => {
  const { theme } = useTheme();
  const [filtro, setFiltro] = useState('todos');

  const getEventoIcon = (tipo) => {
    switch(tipo) {
      case 'pago': return CurrencyDollarIcon;
      case 'recordatorio': return BellIcon;
      case 'prestamo': return DocumentTextIcon;
      case 'notificacion': return ChatBubbleLeftRightIcon;
      case 'vencimiento': return ExclamationTriangleIcon;
      default: return CalendarIcon;
    }
  };

  const getEventoColor = (tipo) => {
    switch(tipo) {
      case 'pago': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'recordatorio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'prestamo': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'notificacion': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'vencimiento': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatearFechaEvento = (fecha) => {
    const date = parseFecha(fecha);
    if (!date || isNaN(date.getTime())) return 'Fecha no disponible';
    return date.toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const eventosFiltrados = eventos
    .filter(e => {
      if (filtro === 'todos') return true;
      if (filtro === 'pendientes') return !e.completado;
      if (filtro === 'completados') return e.completado;
      return true;
    })
    .sort((a, b) => {
      const fechaA = parseFecha(a.fecha);
      const fechaB = parseFecha(b.fecha);
      return fechaA - fechaB;
    })
    .slice(0, 10);

  const sincronizados = eventos.filter(e => e.googleEventId).length;

  return (
    <div className={`rounded-xl border ${
      theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
    } shadow-lg overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50/50 to-red-100/50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Próximos Eventos
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              sincronizados > 0 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              🔄 {sincronizados} sincronizados
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              filtro === 'todos' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('pendientes')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              filtro === 'pendientes' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFiltro('completados')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              filtro === 'completados' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Completados
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {eventosFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No hay eventos programados
            </p>
          </div>
        ) : (
          eventosFiltrados.map((evento, index) => {
            const Icono = getEventoIcon(evento.tipo);
            const color = getEventoColor(evento.tipo);
            const esCompletado = evento.completado || evento.estado === 'completado' || evento.estado === 'pagado';
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icono className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {evento.titulo}
                      </p>
                      {esCompletado && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          ✓
                        </span>
                      )}
                      {evento.googleEventId && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                          🔄
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatearFechaEvento(evento.fecha)}
                      {evento.hora && ` • ${evento.hora}`}
                      {evento.horaFin && ` - ${evento.horaFin}`}
                    </p>
                    {evento.cliente && (
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Cliente: {evento.cliente}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      esCompletado
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {esCompletado ? 'Completado' : 'Pendiente'}
                    </span>
                    <div className="flex space-x-1">
                      {!esCompletado && (
                        <button
                          onClick={() => onEditarEvento(evento)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => onEventoClick(evento)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE PERFIL DE GOOGLE (CORREGIDO - SIN CUOTA EXCESIVA)
// ============================================
const PerfilGoogle = ({ user, onLogout, onSync, sincronizando }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const menuRef = useRef(null);

  const closeMenuWithDelay = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 1000);
    setHoverTimeout(timeout);
  };

  const cancelCloseMenu = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const openMenu = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 8,
      right: window.innerWidth - rect.right
    });
    cancelCloseMenu();
    setIsOpen(true);
  };

  const handleButtonClick = (e) => {
    if (isOpen) {
      cancelCloseMenu();
      setIsOpen(false);
    } else {
      openMenu(e);
    }
  };

  const handleMouseEnter = (e) => {
    cancelCloseMenu();
    if (!isOpen) {
      openMenu(e);
    }
  };

  const handleMouseLeave = () => {
    closeMenuWithDelay();
  };

  const handleMenuMouseEnter = () => {
    cancelCloseMenu();
  };

  const handleMenuMouseLeave = () => {
    closeMenuWithDelay();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef && !buttonRef.contains(event.target)) {
        cancelCloseMenu();
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, buttonRef]);

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  if (!user) return null;

  const menuContent = isOpen ? (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed w-72 rounded-xl shadow-2xl overflow-hidden"
      style={{
        top: menuPosition.top,
        right: menuPosition.right,
        zIndex: 999999,
        position: 'fixed'
      }}
      onMouseEnter={handleMenuMouseEnter}
      onMouseLeave={handleMenuMouseLeave}
    >
      <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-xl`}>
        <div className="flex items-center space-x-3 mb-4">
          {user.picture ? (
            <img
              src={user.picture}
              alt="Perfil"
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xl font-bold">
              {user.name?.charAt(0) || 'G'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {user.name || 'Usuario Google'}
            </p>
            <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {user.email || 'Sin email'}
            </p>
            <p className={`text-xs mt-0.5 text-green-500`}>
              ✅ Conectado a Google Calendar
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onSync();
              setIsOpen(false);
              cancelCloseMenu();
            }}
            disabled={sincronizando}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50"
          >
            {sincronizando ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Sincronizando...</span>
              </>
            ) : (
              <>
                <RefreshIcon className="h-4 w-4" />
                <span>Sincronizar ahora</span>
              </>
            )}
          </motion.button>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
              cancelCloseMenu();
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span>Cerrar sesión de Google</span>
          </button>
        </div>
      </div>
    </motion.div>
  ) : null;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        ref={setButtonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleButtonClick}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg transition-all"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt="Perfil"
            className="w-8 h-8 rounded-full border-2 border-white"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
            {user.name?.charAt(0) || 'G'}
          </div>
        )}
        <span className="text-sm font-medium hidden sm:block">
          {user.name || 'Usuario Google'}
        </span>
      </motion.button>

      {ReactDOM.createPortal(
        <AnimatePresence>
          {menuContent}
        </AnimatePresence>,
        document.body
      )}
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
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [modoVista, setModoVista] = useState('calendario');
  const [eventosSincronizadosIds, setEventosSincronizadosIds] = useState(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [eventosDelDia, setEventosDelDia] = useState([]);
  const [diaModalAbierto, setDiaModalAbierto] = useState(false);
  const [alerta, setAlerta] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [sincronizacionCompleta, setSincronizacionCompleta] = useState(false);
  const [eventosSincronizadosCount, setEventosSincronizadosCount] = useState(0);
  const [ultimoIntentoSincronizacion, setUltimoIntentoSincronizacion] = useState(null);
  
  const { user, loading: googleLoading, login, logout, sincronizarEventos } = useGoogleCalendar();
  
  const sincronizacionRealizada = useRef(false);
  const eventosSincronizadosRef = useRef(new Set());
  const sincronizandoRef = useRef(false);
  const colaPendiente = useRef([]);

  const tiposEventos = [
    { value: 'pago', label: 'Pago', color: 'red' },
    { value: 'prestamo', label: 'Préstamo', color: 'blue' },
    { value: 'vencimiento', label: 'Vencimiento', color: 'red' },
    { value: 'recordatorio', label: 'Recordatorio', color: 'yellow' },
    { value: 'notificacion', label: 'Notificación', color: 'purple' },
    { value: 'llamada', label: 'Llamada', color: 'indigo' },
    { value: 'email', label: 'Email', color: 'cyan' },
    { value: 'reunion', label: 'Reunión', color: 'pink' },
    { value: 'tarea', label: 'Tarea', color: 'orange' }
  ];

  const mostrarAlerta = (title, message, type = 'success') => {
    setAlerta({ isOpen: true, title, message, type });
    setTimeout(() => {
      setAlerta({ isOpen: false, title: '', message: '', type: 'success' });
    }, 3000);
  };

  const cargarEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const hoy = new Date();
      
      // Cargar pagos
      const pagosRef = collection(db, 'pagos');
      const pagosSnap = await getDocs(pagosRef);
      
      const pagosEventos = pagosSnap.docs.map(doc => {
        const data = doc.data();
        const fechaPago = data.fechaPago || data.fecha;
        const fechaObj = parseFecha(fechaPago);
        const cliente = data.clienteNombre || data.cliente || 'Cliente';
        const monto = getMonto(data);
        const esCompletado = data.estado === 'completado' || data.estado === 'pagado';
        
        return {
          id: `pago-${doc.id}`,
          tipo: 'pago',
          titulo: `Pago de ${cliente}`,
          fecha: fechaObj || new Date(),
          cliente: cliente,
          monto: monto,
          estado: data.estado || 'pendiente',
          completado: esCompletado,
          descripcion: data.nota || `Pago registrado por RD$ ${monto.toLocaleString()}`,
          data: data,
          googleEventId: data.googleEventId || null,
          source: 'firestore'
        };
      });

      // Cargar préstamos
      const prestamosRef = collection(db, 'prestamos');
      const prestamosSnap = await getDocs(prestamosRef);
      
      const prestamosEventos = [];
      const vencimientosEventos = [];
      
      prestamosSnap.docs.forEach(doc => {
        const data = doc.data();
        const cliente = data.clienteNombre || data.cliente || 'Cliente';
        const monto = data.montoPrestado || data.monto || 0;
        const fechaPrestamo = data.fechaPrestamo || data.fechaCreacion;
        const fechaObj = parseFecha(fechaPrestamo);
        const fechaProximoPago = data.fechaProximoPago;
        const esCompletado = data.estado === 'completado' || data.estado === 'pagado';
        
        if (fechaObj && !esCompletado) {
          prestamosEventos.push({
            id: `prestamo-${doc.id}`,
            tipo: 'prestamo',
            titulo: `Préstamo - ${cliente}`,
            fecha: fechaObj,
            cliente: cliente,
            monto: monto,
            estado: data.estado || 'activo',
            completado: esCompletado,
            descripcion: `Préstamo de RD$ ${monto.toLocaleString()} - ${data.frecuencia || 'quincenal'}`,
            data: data,
            googleEventId: data.googleEventId || null,
            source: 'firestore'
          });
        }
        
        if (fechaProximoPago && data.estado === 'activo') {
          const fechaVencimiento = parseFecha(fechaProximoPago);
          if (fechaVencimiento) {
            const diasRestantes = Math.ceil((fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
            const capitalRestante = data.capitalRestante || monto;
            
            vencimientosEventos.push({
              id: `vencimiento-${doc.id}`,
              tipo: 'vencimiento',
              titulo: `Vencimiento - ${cliente}`,
              fecha: fechaVencimiento,
              cliente: cliente,
              monto: capitalRestante,
              diasRestantes: diasRestantes,
              estado: 'pendiente',
              completado: false,
              descripcion: `Pago vence en ${diasRestantes} días. Capital pendiente: RD$ ${capitalRestante.toLocaleString()}`,
              data: data,
              googleEventId: data.googleEventId || null,
              source: 'firestore'
            });
          }
        }
      });

      // Cargar eventos personalizados de Firestore
      const eventosPersonalizadosRef = collection(db, 'eventos');
      const eventosPersonalizadosSnap = await getDocs(eventosPersonalizadosRef);
      
      const eventosPersonalizados = eventosPersonalizadosSnap.docs.map(doc => {
        const data = doc.data();
        const fecha = data.fecha instanceof Date ? data.fecha : parseFecha(data.fecha);
        return {
          id: `personalizado-${doc.id}`,
          tipo: data.tipo || 'recordatorio',
          titulo: data.titulo || 'Evento personalizado',
          fecha: fecha || new Date(),
          cliente: data.cliente || '',
          monto: data.monto || 0,
          estado: data.estado || 'pendiente',
          completado: data.completado || false,
          descripcion: data.descripcion || '',
          data: data,
          googleEventId: data.googleEventId || null,
          source: 'personalizado',
          hora: data.hora || '',
          horaFin: data.horaFin || ''
        };
      });

      const todosEventos = [...pagosEventos, ...prestamosEventos, ...vencimientosEventos, ...eventosPersonalizados];
      const eventosValidos = todosEventos.filter(e => e.fecha && !isNaN(e.fecha.getTime()));
      
      eventosValidos.sort((a, b) => b.fecha - a.fecha);
      
      // Registrar IDs de eventos ya sincronizados
      const sincronizados = new Set();
      eventosValidos.forEach(e => {
        if (e.googleEventId) {
          sincronizados.add(e.id);
        }
      });
      setEventosSincronizadosIds(sincronizados);
      eventosSincronizadosRef.current = sincronizados;
      setEventosSincronizadosCount(sincronizados.size);
      
      setEventos(eventosValidos);
      setUltimaActualizacion(new Date());
      
      console.log(`✅ ${eventosValidos.length} eventos cargados`);
      console.log(`📌 ${sincronizados.size} eventos sincronizados con Google Calendar`);
      
      // Verificar si ya se completó la sincronización
      if (eventosValidos.length > 0 && sincronizados.size === eventosValidos.filter(e => e.source === 'personalizado' && !e.completado).length) {
        setSincronizacionCompleta(true);
      }
      
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setError('Error al cargar los eventos. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  const guardarEvento = async (data, id) => {
    try {
      const eventosRef = collection(db, 'eventos');
      let eventoId = id;
      
      if (id && id.startsWith('personalizado-')) {
        const realId = id.replace('personalizado-', '');
        const docRef = doc(db, 'eventos', realId);
        await updateDoc(docRef, data);
        eventoId = realId;
        console.log('✅ Evento actualizado en Firestore');
        
        // Si hay googleEventId y usuario, actualizar en Google Calendar (con rate limiting)
        const docSnap = await getDoc(docRef);
        const docData = docSnap.data();
        if (docData.googleEventId && user && !sincronizandoRef.current) {
          try {
            await rateLimiter.execute(async () => {
              console.log('🔄 Actualizando evento en Google Calendar...');
              const resultado = await sincronizarEventos([{
                id: `personalizado-${realId}`,
                titulo: data.titulo,
                fecha: data.fecha,
                cliente: data.cliente,
                descripcion: data.descripcion,
                monto: data.monto,
                tipo: data.tipo,
                hora: data.hora,
                horaFin: data.horaFin
              }]);
              if (resultado.success && resultado.eventosActualizados) {
                const actualizado = resultado.eventosActualizados.find(e => e.id === `personalizado-${realId}`);
                if (actualizado && actualizado.googleEventId) {
                  await updateDoc(docRef, { googleEventId: actualizado.googleEventId });
                }
                console.log('✅ Evento actualizado en Google Calendar');
              }
            });
          } catch (syncError) {
            if (syncError.code === 8 || syncError.details?.includes('Quota exceeded')) {
              console.warn('⚠️ Cuota de Google Calendar excedida. Se intentará más tarde.');
              mostrarAlerta('⚠️ Límite de solicitudes', 'Se ha excedido la cuota de Google Calendar. Intenta nuevamente en unos minutos.', 'warning');
            } else {
              console.warn('⚠️ Error actualizando en Google Calendar:', syncError);
            }
          }
        }
      } else {
        const docRef = await addDoc(eventosRef, {
          ...data,
          fechaCreacion: new Date().toISOString()
        });
        eventoId = docRef.id;
        console.log('✅ Nuevo evento creado en Firestore:', docRef.id);
        
        // Sincronizar con Google Calendar con rate limiting
        if (user && !sincronizandoRef.current) {
          try {
            await rateLimiter.execute(async () => {
              console.log('🔄 Sincronizando nuevo evento con Google Calendar...');
              const eventoParaSincronizar = {
                id: `personalizado-${docRef.id}`,
                titulo: data.titulo,
                fecha: data.fecha,
                cliente: data.cliente,
                descripcion: data.descripcion,
                monto: data.monto,
                tipo: data.tipo,
                hora: data.hora,
                horaFin: data.horaFin
              };
              
              const resultado = await sincronizarEventos([eventoParaSincronizar]);
              if (resultado.success && resultado.eventosActualizados) {
                const actualizado = resultado.eventosActualizados.find(e => e.id === `personalizado-${docRef.id}`);
                if (actualizado && actualizado.googleEventId) {
                  await updateDoc(docRef, { googleEventId: actualizado.googleEventId });
                  const nuevosSincronizados = new Set(eventosSincronizadosIds);
                  nuevosSincronizados.add(`personalizado-${docRef.id}`);
                  setEventosSincronizadosIds(nuevosSincronizados);
                  eventosSincronizadosRef.current = nuevosSincronizados;
                  setEventosSincronizadosCount(nuevosSincronizados.size);
                  console.log('✅ Evento sincronizado con Google Calendar');
                }
              }
            });
          } catch (syncError) {
            if (syncError.code === 8 || syncError.details?.includes('Quota exceeded')) {
              console.warn('⚠️ Cuota de Google Calendar excedida. Se sincronizará después.');
              // Guardar en cola para sincronización posterior
              colaPendiente.current.push({
                id: `personalizado-${docRef.id}`,
                ...data
              });
              mostrarAlerta('⏳ Sincronización pendiente', 'El evento se sincronizará con Google Calendar cuando la cuota esté disponible.', 'warning');
            } else {
              console.warn('⚠️ Error sincronizando con Google Calendar:', syncError);
            }
          }
        }
      }
      
      await cargarEventos();
      
    } catch (error) {
      console.error('Error guardando evento:', error);
      throw error;
    }
  };

  const eliminarEvento = async (id) => {
    try {
      if (id && id.startsWith('personalizado-')) {
        const realId = id.replace('personalizado-', '');
        const docRef = doc(db, 'eventos', realId);
        const docSnap = await getDoc(docRef);
        const docData = docSnap.data();
        await deleteDoc(docRef);
        console.log('✅ Evento eliminado de Firestore');
        
        if (docData.googleEventId && user) {
          try {
            // No eliminamos de Google Calendar para evitar cuota adicional
            // Solo marcamos como eliminado localmente
            const nuevosSincronizados = new Set(eventosSincronizadosIds);
            nuevosSincronizados.delete(id);
            setEventosSincronizadosIds(nuevosSincronizados);
            eventosSincronizadosRef.current = nuevosSincronizados;
            setEventosSincronizadosCount(nuevosSincronizados.size);
          } catch (syncError) {
            console.warn('⚠️ Error eliminando de Google Calendar:', syncError);
          }
        }
      } else {
        throw new Error('No se pueden eliminar eventos del sistema');
      }
      
      await cargarEventos();
    } catch (error) {
      console.error('Error eliminando evento:', error);
      throw error;
    }
  };

  const handleSincronizarGoogle = useCallback(async (forzar = false) => {
    if (!user) {
      mostrarAlerta('⚠️ Conexión requerida', 'Primero debes conectar tu cuenta de Google', 'warning');
      return;
    }
    
    if (sincronizandoRef.current) {
      mostrarAlerta('⏳ Sincronizando', 'Ya hay una sincronización en curso. Por favor espera.', 'warning');
      return;
    }
    
    // Verificar límite de tiempo (no más de una sincronización cada 30 segundos)
    if (ultimoIntentoSincronizacion && !forzar) {
      const tiempoTranscurrido = Date.now() - ultimoIntentoSincronizacion;
      if (tiempoTranscurrido < 30000) {
        const segundosRestantes = Math.ceil((30000 - tiempoTranscurrido) / 1000);
        mostrarAlerta('⏳ Espera', `Por favor espera ${segundosRestantes} segundos antes de sincronizar nuevamente.`, 'warning');
        return;
      }
    }
    
    // Si ya se sincronizó y no se fuerza, no hacer nada
    if (sincronizacionCompleta && !forzar) {
      mostrarAlerta('✅ Todo sincronizado', 'Todos los eventos ya están sincronizados con Google Calendar', 'success');
      return;
    }
    
    try {
      sincronizandoRef.current = true;
      setSincronizando(true);
      setUltimoIntentoSincronizacion(Date.now());
      
      // Obtener eventos personalizados no sincronizados
      const eventosNoSincronizados = eventos.filter(e => {
        if (!e.id.startsWith('personalizado-')) return false;
        if (e.googleEventId) return false;
        if (e.completado) return false;
        return true;
      });
      
      // También procesar eventos pendientes en cola
      const eventosPendientes = [...eventosNoSincronizados];
      
      if (eventosPendientes.length === 0 && colaPendiente.current.length === 0) {
        setSincronizacionCompleta(true);
        mostrarAlerta('✅ Todo sincronizado', 'Todos los eventos están sincronizados con Google Calendar', 'success');
        sincronizandoRef.current = false;
        setSincronizando(false);
        return;
      }
      
      console.log(`🔄 Sincronizando ${eventosPendientes.length} eventos con Google Calendar...`);
      
      // Limitar cantidad de eventos por lote (máximo 5 por solicitud)
      const lote = eventosPendientes.slice(0, 5);
      
      try {
        const resultado = await rateLimiter.execute(async () => {
          return await sincronizarEventos(lote);
        });
        
        if (resultado.success) {
          if (resultado.eventosActualizados) {
            const nuevosSincronizados = new Set(eventosSincronizadosIds);
            resultado.eventosActualizados.forEach(ev => {
              nuevosSincronizados.add(ev.id);
            });
            setEventosSincronizadosIds(nuevosSincronizados);
            eventosSincronizadosRef.current = nuevosSincronizados;
            setEventosSincronizadosCount(nuevosSincronizados.size);
            
            setEventos(prev => prev.map(e => {
              const actualizado = resultado.eventosActualizados.find(ev => ev.id === e.id);
              if (actualizado) {
                return { ...e, googleEventId: actualizado.googleEventId };
              }
              return e;
            }));
            
            // Actualizar googleEventId en Firestore
            for (const ev of resultado.eventosActualizados) {
              if (ev.id && ev.id.startsWith('personalizado-')) {
                const realId = ev.id.replace('personalizado-', '');
                const docRef = doc(db, 'eventos', realId);
                await updateDoc(docRef, { googleEventId: ev.googleEventId });
              }
            }
            
            // Remover de la cola pendiente los que ya se sincronizaron
            colaPendiente.current = colaPendiente.current.filter(
              item => !resultado.eventosActualizados.some(ev => ev.id === item.id)
            );
          }
          
          setSincronizacionCompleta(true);
          mostrarAlerta('✅ Sincronización parcial', `${resultado.creados || lote.length} eventos sincronizados con Google Calendar`, 'success');
          sincronizacionRealizada.current = true;
          
          // Si hay más eventos pendientes, programar siguiente lote
          if (eventosPendientes.length > 5 || colaPendiente.current.length > 0) {
            setTimeout(() => {
              handleSincronizarGoogle(true);
            }, 2000);
          }
        } else {
          if (resultado.error?.includes('Quota exceeded') || resultado.code === 8) {
            mostrarAlerta('⚠️ Límite de solicitudes', 'Se ha excedido la cuota de Google Calendar. Intenta nuevamente en unos minutos.', 'warning');
          } else {
            mostrarAlerta('❌ Error al sincronizar', resultado.error || 'Intenta nuevamente', 'error');
          }
        }
      } catch (syncError) {
        if (syncError.code === 8 || syncError.details?.includes('Quota exceeded')) {
          mostrarAlerta('⚠️ Límite de solicitudes', 'Se ha excedido la cuota de Google Calendar. Intenta nuevamente en unos minutos.', 'warning');
        } else {
          console.error('Error sincronizando:', syncError);
          mostrarAlerta('❌ Error', 'Error al sincronizar eventos con Google Calendar', 'error');
        }
      }
    } catch (error) {
      console.error('Error sincronizando:', error);
      mostrarAlerta('❌ Error', 'Error al sincronizar eventos con Google Calendar', 'error');
    } finally {
      sincronizandoRef.current = false;
      setSincronizando(false);
    }
  }, [user, eventos, eventosSincronizadosIds, sincronizacionCompleta, ultimoIntentoSincronizacion, sincronizarEventos]);

  const handleEventoDrag = async (evento, nuevaFecha) => {
    if (evento.completado) {
      mostrarAlerta('⚠️ No permitido', 'No se pueden mover eventos completados', 'warning');
      return;
    }
    
    if (!evento.id.startsWith('personalizado-')) {
      mostrarAlerta('⚠️ No permitido', 'No se pueden mover eventos del sistema', 'warning');
      return;
    }
    
    if (!window.confirm(`¿Mover "${evento.titulo}" al ${nuevaFecha.toLocaleDateString()}?`)) {
      return;
    }
    
    try {
      const realId = evento.id.replace('personalizado-', '');
      const docRef = doc(db, 'eventos', realId);
      
      await updateDoc(docRef, {
        fecha: nuevaFecha,
        actualizado: new Date().toISOString()
      });
      
      console.log('✅ Evento movido a nueva fecha');
      await cargarEventos();
      
    } catch (error) {
      console.error('Error moviendo evento:', error);
      mostrarAlerta('❌ Error', 'Error al mover el evento', 'error');
    }
  };

  const handleDiaClick = (fecha, eventos) => {
    setDiaSeleccionado(fecha);
    setEventosDelDia(eventos);
    setDiaModalAbierto(true);
  };

  const handleNuevoEventoEnDia = (fecha) => {
    setDiaModalAbierto(false);
    setEventoEditando(null);
    const fechaStr = fecha instanceof Date ? fecha.toISOString().split('T')[0] : fecha;
    setEditorAbierto(true);
    setTimeout(() => {
      const event = new CustomEvent('setFechaEvento', { detail: { fecha: fechaStr } });
      window.dispatchEvent(event);
    }, 100);
  };

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // Sincronización automática con control de cuota
  useEffect(() => {
    if (user && eventos.length > 0 && !sincronizacionRealizada.current && !sincronizandoRef.current && !sincronizacionCompleta) {
      const sincronizarAutomatico = async () => {
        // Verificar si hay eventos pendientes
        const eventosPendientes = eventos.filter(e => 
          e.id.startsWith('personalizado-') &&
          !e.completado && 
          !e.googleEventId
        );
        
        if (eventosPendientes.length === 0 && colaPendiente.current.length === 0) {
          console.log('✅ No hay eventos pendientes para sincronizar');
          sincronizacionRealizada.current = true;
          setSincronizacionCompleta(true);
          return;
        }
        
        // Solo sincronizar si hay eventos pendientes y no se ha excedido la cuota
        if (eventosPendientes.length > 0) {
          await handleSincronizarGoogle(true);
        }
      };
      
      const timeoutId = setTimeout(sincronizarAutomatico, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [user, eventos, handleSincronizarGoogle]);

  useEffect(() => {
    const handleSetFecha = (e) => {
      if (e.detail?.fecha && editorAbierto) {
        // El EventoEditorModal manejará la fecha
      }
    };
    window.addEventListener('setFechaEvento', handleSetFecha);
    return () => window.removeEventListener('setFechaEvento', handleSetFecha);
  }, [editorAbierto]);

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

  const hoy = new Date();
  
  const eventosHoy = eventos.filter(e => {
    const fecha = e.fecha instanceof Date ? e.fecha : parseFecha(e.fecha);
    return fecha && fecha.toDateString() === hoy.toDateString();
  }).length;
  
  const eventosManana = eventos.filter(e => {
    const fecha = e.fecha instanceof Date ? e.fecha : parseFecha(e.fecha);
    if (!fecha) return false;
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    return fecha.toDateString() === manana.toDateString();
  }).length;
  
  const eventosPendientes = eventos.filter(e => !e.completado).length;
  const eventosMes = eventos.filter(e => {
    const fecha = e.fecha instanceof Date ? e.fecha : parseFecha(e.fecha);
    return fecha && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
  }).length;
  const eventosVencidos = eventos.filter(e => {
    const fecha = e.fecha instanceof Date ? e.fecha : parseFecha(e.fecha);
    return fecha && fecha < hoy && !e.completado;
  }).length;
  const eventosPersonalizados = eventos.filter(e => e.source === 'personalizado').length;
  const eventosSincronizadosTotal = eventos.filter(e => e.googleEventId).length;

  const handleEventoClick = (evento) => {
    setEventoSeleccionado(evento);
    setModalAbierto(true);
  };

  const handleEditarEvento = (evento) => {
    if (evento.completado) {
      mostrarAlerta('⚠️ No permitido', 'No se pueden editar eventos completados', 'warning');
      return;
    }
    if (!evento.id.startsWith('personalizado-')) {
      mostrarAlerta('⚠️ No permitido', 'No se pueden editar eventos del sistema', 'warning');
      return;
    }
    setEventoEditando(evento);
    setEditorAbierto(true);
  };

  const handleNuevoEvento = () => {
    setEventoEditando(null);
    setEditorAbierto(true);
  };

  const handleLogoutGoogle = async () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión de Google Calendar?')) {
      await logout();
      sincronizacionRealizada.current = false;
      setSincronizacionCompleta(false);
      sincronizandoRef.current = false;
      colaPendiente.current = [];
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <ParticleBackground />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-transparent to-red-100/20 dark:from-red-950/10 dark:via-transparent dark:to-red-950/10 pointer-events-none" />

      <div className="relative z-10 space-y-6 p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 rounded-2xl blur-3xl" />
          
          <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border border-red-600/20`}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-red-600 via-red-700 to-red-600 rounded-xl shadow-lg animate-pulse-slow">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-600 bg-clip-text text-transparent`}>
                    Calendario Inteligente
                  </h1>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Gestiona todos tus eventos de forma interactiva
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {ultimaActualizacion && (
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <ClockIcon className="h-3 w-3 inline mr-1" />
                    {ultimaActualizacion.toLocaleTimeString()}
                  </span>
                )}

                {sincronizacionCompleta && eventosSincronizadosTotal > 0 && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center space-x-1">
                    <CheckCircleIcon className="h-3 w-3" />
                    <span>{eventosSincronizadosTotal} sincronizados</span>
                  </span>
                )}

                {colaPendiente.current.length > 0 && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full flex items-center space-x-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{colaPendiente.current.length} pendientes</span>
                  </span>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2 rounded-lg transition-all ${
                    showSearch
                      ? 'bg-red-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Buscar eventos"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-all ${
                    showFilters
                      ? 'bg-red-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Filtros"
                >
                  <FunnelIcon className="h-5 w-5" />
                </motion.button>

                <PerfilGoogle
                  user={user}
                  onLogout={handleLogoutGoogle}
                  onSync={() => handleSincronizarGoogle(true)}
                  sincronizando={sincronizando}
                />

                {!user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={login}
                    disabled={googleLoading}
                    className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 text-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="hidden sm:inline">Conectar Google</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNuevoEvento}
                  className="p-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                  title="Nuevo evento"
                >
                  <PlusIcon className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={cargarEventos}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Actualizar"
                >
                  <RefreshIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className={`relative rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="p-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Buscar eventos por título, cliente o descripción..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className={`relative rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[150px]">
                      <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Tipo de Evento
                      </label>
                      <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      >
                        <option value="todos">Todos los eventos</option>
                        <option value="pago">Pagos</option>
                        <option value="prestamo">Préstamos</option>
                        <option value="vencimiento">Vencimientos</option>
                        <option value="recordatorio">Recordatorios</option>
                        <option value="notificacion">Notificaciones</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mt-2 sm:mt-0">
                      <button
                        onClick={() => setModoVista('calendario')}
                        className={`p-2 rounded-lg transition-all ${
                          modoVista === 'calendario'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title="Vista de calendario"
                      >
                        <CalendarDaysIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setModoVista('lista')}
                        className={`p-2 rounded-lg transition-all ${
                          modoVista === 'lista'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title="Vista de lista"
                      >
                        <ListBulletIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setFiltroTipo('todos');
                        setShowFilters(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all text-sm"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
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
          <StatCard
            icon={ExclamationTriangleIcon}
            label="Vencidos"
            value={eventosVencidos}
            color="from-red-500 to-red-700"
          />
          <StatCard
            icon={DocumentTextIcon}
            label="Total Eventos"
            value={eventos.length}
            color="from-purple-500 to-purple-700"
          />
          <StatCard
            icon={SparklesIcon}
            label="Personalizados"
            value={eventosPersonalizados}
            color="from-indigo-500 to-indigo-700"
          />
        </div>

        {/* Calendario y lista de eventos */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {modoVista === 'calendario' ? (
              <>
                <div className="lg:col-span-2">
                  <CalendarioMensual 
                    eventos={eventosFiltrados}
                    onEventoClick={handleEventoClick}
                    onEventoDrag={handleEventoDrag}
                    onDiaClick={handleDiaClick}
                  />
                </div>
                <div>
                  <ProximosEventos 
                    eventos={eventosFiltrados.filter(e => !e.completado || e.source === 'personalizado')}
                    onEventoClick={handleEventoClick}
                    onEditarEvento={handleEditarEvento}
                    eventosSincronizados={eventosSincronizadosIds}
                  />
                </div>
              </>
            ) : (
              <div className="lg:col-span-3">
                <ProximosEventos 
                  eventos={eventosFiltrados}
                  onEventoClick={handleEventoClick}
                  onEditarEvento={handleEditarEvento}
                  eventosSincronizados={eventosSincronizadosIds}
                />
              </div>
            )}
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
          onEditar={handleEditarEvento}
          onEliminar={eliminarEvento}
        />

        {/* Modal de editor */}
        <EventoEditorModal
          isOpen={editorAbierto}
          onClose={() => {
            setEditorAbierto(false);
            setEventoEditando(null);
          }}
          evento={eventoEditando}
          onSave={guardarEvento}
          onDelete={eliminarEvento}
          tipos={tiposEventos}
        />

        {/* Modal de eventos del día */}
        <EventosDelDiaModal
          isOpen={diaModalAbierto}
          onClose={() => {
            setDiaModalAbierto(false);
            setDiaSeleccionado(null);
            setEventosDelDia([]);
          }}
          fecha={diaSeleccionado}
          eventos={eventosDelDia}
          onEventoClick={handleEventoClick}
          onEditarEvento={handleEditarEvento}
          onNuevoEvento={handleNuevoEventoEnDia}
        />

        {/* Alerta */}
        <AlertaTarjeta
          isOpen={alerta.isOpen}
          onClose={() => setAlerta({ isOpen: false, title: '', message: '', type: 'success' })}
          title={alerta.title}
          message={alerta.message}
          type={alerta.type}
        />
      </div>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default Calendario;