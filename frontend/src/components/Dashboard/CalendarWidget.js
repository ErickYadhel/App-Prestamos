import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  XMarkIcon,
  UserIcon,
  BanknotesIcon,
  ArrowPathIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SparklesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  GiftIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const COLORES_EVENTOS = {
  pago: {
    fondo: 'bg-emerald-500',
    fondoHover: 'hover:bg-emerald-600',
    fondoLight: 'bg-emerald-100 dark:bg-emerald-900/30',
    texto: 'text-emerald-700 dark:text-emerald-400',
    borde: 'border-emerald-200 dark:border-emerald-800',
    gradiente: 'from-emerald-500 to-emerald-700',
    icono: CurrencyDollarIcon,
    nombre: 'Pago'
  },
  prestamo: {
    fondo: 'bg-blue-500',
    fondoHover: 'hover:bg-blue-600',
    fondoLight: 'bg-blue-100 dark:bg-blue-900/30',
    texto: 'text-blue-700 dark:text-blue-400',
    borde: 'border-blue-200 dark:border-blue-800',
    gradiente: 'from-blue-500 to-blue-700',
    icono: DocumentTextIcon,
    nombre: 'Préstamo'
  },
  desembolso: {
    fondo: 'bg-purple-500',
    fondoHover: 'hover:bg-purple-600',
    fondoLight: 'bg-purple-100 dark:bg-purple-900/30',
    texto: 'text-purple-700 dark:text-purple-400',
    borde: 'border-purple-200 dark:border-purple-800',
    gradiente: 'from-purple-500 to-purple-700',
    icono: BanknotesIcon,
    nombre: 'Desembolso'
  },
  vencimiento: {
    fondo: 'bg-red-500',
    fondoHover: 'hover:bg-red-600',
    fondoLight: 'bg-red-100 dark:bg-red-900/30',
    texto: 'text-red-700 dark:text-red-400',
    borde: 'border-red-200 dark:border-red-800',
    gradiente: 'from-red-500 to-red-700',
    icono: ExclamationTriangleIcon,
    nombre: 'Vencido'
  },
  advertencia: {
    fondo: 'bg-orange-500',
    fondoHover: 'hover:bg-orange-600',
    fondoLight: 'bg-orange-100 dark:bg-orange-900/30',
    texto: 'text-orange-700 dark:text-orange-400',
    borde: 'border-orange-200 dark:border-orange-800',
    gradiente: 'from-orange-500 to-orange-700',
    icono: ExclamationTriangleIcon,
    nombre: 'Próximo a vencer'
  },
  alerta: {
    fondo: 'bg-amber-500',
    fondoHover: 'hover:bg-amber-600',
    fondoLight: 'bg-amber-100 dark:bg-amber-900/30',
    texto: 'text-amber-700 dark:text-amber-400',
    borde: 'border-amber-200 dark:border-amber-800',
    gradiente: 'from-amber-500 to-amber-700',
    icono: BellIcon,
    nombre: 'Alerta'
  }
};

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ============================================
// COMPONENTES DE UI
// ============================================

const BorderGlow = ({ children, isHovered, color = 'from-red-600 via-red-500 to-red-600' }) => {
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur opacity-0 transition-all duration-300 ${
        isHovered ? 'opacity-100' : 'group-hover:opacity-70'
      }`} />
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur-lg opacity-0 transition-all duration-500 ${
        isHovered ? 'opacity-60' : 'group-hover:opacity-40'
      }`} />
      <div className="relative transform transition-all duration-300 group-hover:scale-[1.02]">
        {children}
      </div>
    </div>
  );
};

const GlassCard = ({ children, className = '', onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl shadow-xl border transition-all duration-300 cursor-pointer ${
        isHovered 
          ? 'border-red-500 shadow-2xl shadow-red-500/20 scale-[1.01]' 
          : theme === 'dark' 
            ? 'bg-gray-800/80 backdrop-blur-lg border-gray-700 hover:border-red-500/50' 
            : 'bg-white/80 backdrop-blur-lg border-gray-200 hover:border-red-500/50'
      } ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000 ${
        isHovered ? 'translate-x-full' : ''
      }`} />
      {children}
    </motion.div>
  );
};

// Botón con efectos modernos
const IconButton = ({ onClick, children, title, disabled, className = '' }) => {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-xl transition-all duration-200 ${
        theme === 'dark' 
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
      } shadow-md hover:shadow-lg ${isPressed ? 'scale-95' : ''} ${className}`}
      title={title}
    >
      {children}
    </motion.button>
  );
};

// ============================================
// MODAL DE PANTALLA COMPLETA
// ============================================
const FullscreenModal = ({ isOpen, onClose, children }) => {
  const { theme } = useTheme();
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl overflow-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="min-h-screen p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-end mb-6">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 bg-gradient-to-r from-red-600 to-red-800 rounded-full text-white shadow-lg hover:shadow-xl transition-all"
              >
                <ArrowsPointingInIcon className="h-6 w-6" />
              </motion.button>
            </div>
            <div className={`rounded-2xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} p-6 shadow-2xl`}>
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MODAL DE EVENTOS DEL DÍA
// ============================================
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

  const fechaFormateada = fecha ? new Date(fecha).toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  const totalRecaudado = eventos
    .filter(e => e.tipo === 'pago')
    .reduce((sum, e) => sum + (e.monto || 0), 0);

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
            className="relative w-full max-w-3xl max-h-[85vh] mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
            
            <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-500/30 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
              <div className={`p-5 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                      <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Eventos del día
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>
                        {fechaFormateada}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className={`p-2 rounded-xl transition-all ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              <div className="p-5 max-h-[55vh] overflow-y-auto">
                {eventos.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-full blur-xl opacity-50 animate-pulse" />
                      <div className="relative p-5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full">
                        <SparklesIcon className="h-20 w-20 text-gray-400" />
                      </div>
                    </div>
                    <h3 className={`text-2xl font-bold mt-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ¡Sin eventos!
                    </h3>
                    <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No hay eventos programados para este día
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-800 rounded-full text-white text-xs font-medium">
                        Día tranquilo ✨
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {eventos.map((evento, idx) => {
                      const estilo = COLORES_EVENTOS[evento.tipo] || COLORES_EVENTOS.pago;
                      const Icon = estilo.icono;
                      
                      return (
                        <motion.div
                          key={evento.id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${estilo.fondoLight} ${estilo.borde} hover:shadow-xl`}
                          onClick={() => {
                            setEventoSeleccionado(evento);
                            setDetalleAbierto(true);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className={`p-2.5 rounded-xl ${estilo.texto} bg-white/50 dark:bg-black/20 shadow-md`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className={`text-base font-semibold ${estilo.texto}`}>
                                    {evento.titulo}
                                  </p>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${estilo.fondo} text-white`}>
                                    {estilo.nombre}
                                  </span>
                                </div>
                                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {evento.descripcion}
                                </p>
                                <div className="flex flex-wrap gap-4 mt-3">
                                  {evento.monto > 0 && (
                                    <div className="flex items-center gap-1">
                                      <CurrencyDollarIcon className="h-3.5 w-3.5 text-emerald-500" />
                                      <span className={`text-sm font-semibold text-emerald-600 dark:text-emerald-400`}>
                                        {formatearMonto(evento.monto)}
                                      </span>
                                    </div>
                                  )}
                                  {evento.montoCapital > 0 && (
                                    <div className="flex items-center gap-1">
                                      <BanknotesIcon className="h-3.5 w-3.5 text-blue-500" />
                                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Capital: {formatearMonto(evento.montoCapital)}
                                      </span>
                                    </div>
                                  )}
                                  {evento.montoInteres > 0 && (
                                    <div className="flex items-center gap-1">
                                      <ChartBarIcon className="h-3.5 w-3.5 text-purple-500" />
                                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Interés: {formatearMonto(evento.montoInteres)}
                                      </span>
                                    </div>
                                  )}
                                  {evento.diasRestantes !== undefined && (
                                    <div className={`flex items-center gap-1 ${evento.diasRestantes <= 0 ? 'text-red-500' : evento.diasRestantes <= 2 ? 'text-orange-500' : 'text-amber-500'}`}>
                                      <ClockIcon className="h-3.5 w-3.5" />
                                      <span className="text-xs font-medium">
                                        {evento.diasRestantes <= 0 ? 'VENCIDO' : `Vence en ${evento.diasRestantes} días`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {evento.cliente && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <UserIcon className="h-3 w-3 text-gray-400" />
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      Cliente: {evento.cliente}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                              title="Ver detalles completos"
                            >
                              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} flex justify-between items-center`}>
                <div className="flex gap-4">
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    📊 Total eventos: {eventos.length}
                  </p>
                  {totalRecaudado > 0 && (
                    <p className={`text-xs font-medium text-emerald-600`}>
                      💰 Total recaudado: {formatearMonto(totalRecaudado)}
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Cerrar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

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

// ============================================
// MODAL DE DETALLE DE EVENTO INDIVIDUAL
// ============================================
const EventoDetalleModal = ({ isOpen, onClose, evento }) => {
  const { theme } = useTheme();
  if (!isOpen || !evento) return null;

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const estilo = COLORES_EVENTOS[evento?.tipo] || COLORES_EVENTOS.pago;
  const Icon = estilo.icono;

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
          className="relative w-full max-w-lg mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${estilo.gradiente} rounded-2xl blur-xl opacity-75`} />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`p-5 border-b flex justify-between items-center bg-gradient-to-r ${estilo.gradiente}`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold text-white`}>{evento?.titulo}</h3>
                  <p className={`text-sm text-white/80 mt-0.5`}>{estilo.nombre}</p>
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

            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-xl ${estilo.fondoLight} ${estilo.borde} border`}>
                <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {evento?.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {evento?.fecha && (
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Fecha</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(evento.fecha).toLocaleDateString('es-DO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(evento.fecha).toLocaleTimeString('es-DO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                {evento?.cliente && (
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Cliente</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {evento.cliente}
                    </p>
                  </div>
                )}
              </div>

              {(evento?.monto > 0 || evento?.montoCapital > 0 || evento?.montoInteres > 0 || evento?.montoMora > 0) && (
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border ${estilo.borde}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Desglose del monto</p>
                  <div className="space-y-2">
                    {evento?.monto > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {formatearMonto(evento.monto)}
                        </span>
                      </div>
                    )}
                    {evento?.montoCapital > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Capital</span>
                        <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                          {formatearMonto(evento.montoCapital)}
                        </span>
                      </div>
                    )}
                    {evento?.montoInteres > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Interés</span>
                        <span className="text-base font-semibold text-purple-600 dark:text-purple-400">
                          {formatearMonto(evento.montoInteres)}
                        </span>
                      </div>
                    )}
                    {evento?.montoMora > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Mora</span>
                        <span className="text-base font-semibold text-red-600 dark:text-red-400">
                          {formatearMonto(evento.montoMora)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {evento?.diasRestantes !== undefined && (
                <div className={`p-4 rounded-xl text-center ${
                  evento.diasRestantes <= 0 ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' :
                  evento.diasRestantes <= 2 ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800' :
                  'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                } border`}>
                  <p className={`text-sm font-bold ${
                    evento.diasRestantes <= 0 ? 'text-red-600 dark:text-red-400' :
                    evento.diasRestantes <= 2 ? 'text-orange-600 dark:text-orange-400' :
                    'text-amber-600 dark:text-amber-400'
                  }`}>
                    {evento.diasRestantes <= 0 ? '⚠️ PAGO VENCIDO' : `⏰ Vence en ${evento.diasRestantes} días`}
                  </p>
                  {evento.diasRestantes <= 0 && (
                    <p className="text-xs mt-1 text-red-500 dark:text-red-400">
                      ¡Requiere atención inmediata!
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Cerrar
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE DE BADGE DE EVENTO
// ============================================
const EventoBadge = ({ evento, onClick, isHovered }) => {
  const estilo = COLORES_EVENTOS[evento.tipo] || COLORES_EVENTOS.pago;
  const Icon = estilo.icono;
  const mostrarMonto = evento.monto > 0;
  const montoFormateado = evento.monto ? (evento.monto / 1000).toFixed(0) : null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(evento);
      }}
      className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold text-white transition-all shadow-md ${estilo.fondo} ${estilo.fondoHover}`}
      title={evento.titulo}
    >
      <Icon className="h-3 w-3" />
      {mostrarMonto && <span>${montoFormateado}K</span>}
    </motion.button>
  );
};

// ============================================
// COMPONENTE DE TARJETA DE ESTADÍSTICA
// ============================================
const StatCard = ({ label, value, color, icon: Icon, tooltip }) => {
  const { theme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative p-3 rounded-xl text-center transition-all hover:scale-105 ${color} bg-opacity-10 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        {tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="focus:outline-none"
            >
              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-[10px] bg-gray-900 text-white rounded whitespace-nowrap z-50">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const CalendarWidget = () => {
  const { theme } = useTheme();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalDiaAbierto, setModalDiaAbierto] = useState(false);
  const [modalFullscreenAbierto, setModalFullscreenAbierto] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [eventosDelDia, setEventosDelDia] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoyMarcado, setHoyMarcado] = useState(null);
  const [animandoHoy, setAnimandoHoy] = useState(false);
  const [mostrarLupa, setMostrarLupa] = useState(false);
  const calendarRef = useRef(null);
  
  const [estadisticas, setEstadisticas] = useState({
    totalPagos: 0,
    totalPrestamos: 0,
    totalVencimientos: 0,
    totalAlertas: 0,
    totalRecaudado: 0,
    totalDesembolsos: 0
  });

  const formatearMonto = (valor) => {
    if (!valor && valor !== 0) return 'RD$ 0';
    if (valor >= 1000000) return `RD$ ${(valor / 1000000).toFixed(1)}M`;
    if (valor >= 1000) return `RD$ ${(valor / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor);
  };

  const calcularMontoTotalPago = (pago) => {
    const capital = parseFloat(pago.montoCapital) || 0;
    const interes = parseFloat(pago.montoInteres) || 0;
    const mora = parseFloat(pago.montoMora) || 0;
    const total = pago.montoTotal || pago.total || pago.monto || 0;
    if (total > 0) return total;
    return capital + interes + mora;
  };

  // Función para ir al día de hoy con lupa palpitante y marcado mejorado
  const irAlDiaDeHoy = async () => {
    setAnimandoHoy(true);
    setMostrarLupa(true);
    
    const hoy = new Date();
    const mesActual = fechaActual.getMonth();
    const mesHoy = hoy.getMonth();
    const añoActual = fechaActual.getFullYear();
    const añoHoy = hoy.getFullYear();
    
    // Si no estamos en el mes actual, cambiar de mes con animación
    if (mesActual !== mesHoy || añoActual !== añoHoy) {
      setFechaActual(hoy);
      
      setTimeout(() => {
        setHoyMarcado(hoy.toDateString());
        
        const elementos = document.querySelectorAll('[data-day-date]');
        for (const el of elementos) {
          if (el.getAttribute('data-day-date') === hoy.toDateString()) {
            el.classList.add('animate-ping-once');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
        }
        
        setTimeout(() => {
          setHoyMarcado(null);
          setAnimandoHoy(false);
          setMostrarLupa(false);
        }, 3000);
      }, 300);
    } else {
      setHoyMarcado(hoy.toDateString());
      
      setTimeout(() => {
        const elementos = document.querySelectorAll('[data-day-date]');
        for (const el of elementos) {
          if (el.getAttribute('data-day-date') === hoy.toDateString()) {
            el.classList.add('animate-ping-once');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
        }
        
        setTimeout(() => {
          setHoyMarcado(null);
          setAnimandoHoy(false);
          setMostrarLupa(false);
        }, 3000);
      }, 100);
    }
  };

  const cargarEventos = useCallback(async () => {
    try {
      setLoading(true);
      
      const pagosRef = collection(db, 'pagos');
      const pagosSnap = await getDocs(pagosRef);
      
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
        
        let titulo = '';
        if (data.tipoPago === 'mora') titulo = `Pago con Mora`;
        else if (data.tipoPago === 'adelantado') titulo = `Pago Adelantado`;
        else if (data.tipoPago === 'abono') titulo = `Abono a Capital`;
        else titulo = `Pago`;
        
        let descripcion = `Pago registrado por un monto total de ${formatearMonto(montoTotal)}.`;
        if (montoCapital > 0) descripcion += ` Capital: ${formatearMonto(montoCapital)}.`;
        if (montoInteres > 0) descripcion += ` Interés: ${formatearMonto(montoInteres)}.`;
        if (montoMora > 0) descripcion += ` Mora: ${formatearMonto(montoMora)}.`;
        
        return {
          id: doc.id,
          tipo: 'pago',
          titulo: titulo,
          fecha: fechaEvento,
          cliente: data.clienteNombre || data.cliente,
          monto: montoTotal,
          montoCapital: montoCapital,
          montoInteres: montoInteres,
          montoMora: montoMora,
          descripcion: descripcion
        };
      });
      
      const prestamosRef = collection(db, 'prestamos');
      const prestamosSnap = await getDocs(prestamosRef);
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const prestamosEventos = [];
      const desembolsosEventos = [];
      
      prestamosSnap.docs.forEach(doc => {
        const data = doc.data();
        let fechaPrestamo = data.fechaPrestamo;
        if (fechaPrestamo?.toDate) fechaPrestamo = fechaPrestamo.toDate();
        else if (fechaPrestamo) fechaPrestamo = new Date(fechaPrestamo);
        else fechaPrestamo = new Date();
        
        if (data.estado === 'activo') {
          desembolsosEventos.push({
            id: `desembolso-${doc.id}`,
            tipo: 'desembolso',
            titulo: `Desembolso`,
            fecha: fechaPrestamo,
            cliente: data.clienteNombre,
            monto: parseFloat(data.montoPrestado) || 0,
            descripcion: `Desembolso de préstamo por ${formatearMonto(parseFloat(data.montoPrestado) || 0)}. Frecuencia: ${data.frecuencia || 'mensual'}, Interés: ${data.interesPercent || 0}%`
          });
        }
        
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
        
        if (fechaVencimiento && data.estado === 'activo') {
          const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
          const capitalRestante = parseFloat(data.capitalRestante) || parseFloat(data.montoPrestado) || 0;
          
          prestamosEventos.push({
            id: `vencimiento-${doc.id}`,
            tipo: diasRestantes <= 0 ? 'vencimiento' : (diasRestantes <= 3 ? 'advertencia' : 'alerta'),
            titulo: diasRestantes <= 0 ? `Pago VENCIDO` : `Próximo vencimiento`,
            fecha: fechaVencimiento,
            cliente: data.clienteNombre,
            monto: capitalRestante,
            diasRestantes: diasRestantes,
            descripcion: diasRestantes <= 0 
              ? `El pago está VENCIDO hace ${Math.abs(diasRestantes)} días. Debe cobrar ${formatearMonto(capitalRestante)}`
              : `Vence en ${diasRestantes} días. Monto pendiente: ${formatearMonto(capitalRestante)}`
          });
        }
      });
      
      const todosEventos = [...pagosEventos, ...prestamosEventos, ...desembolsosEventos];
      
      const eventosUnicos = [];
      const claves = new Set();
      todosEventos.forEach(evento => {
        const clave = `${evento.tipo}-${evento.cliente}-${evento.fecha?.toDateString()}`;
        if (!claves.has(clave)) {
          claves.add(clave);
          eventosUnicos.push(evento);
        }
      });
      
      const eventosOrdenados = eventosUnicos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setEventos(eventosOrdenados);
      
      const year = fechaActual.getFullYear();
      const month = fechaActual.getMonth();
      const eventosDelMes = eventosOrdenados.filter(e => {
        const fecha = new Date(e.fecha);
        return fecha.getFullYear() === year && fecha.getMonth() === month;
      });
      
      setEstadisticas({
        totalPagos: eventosDelMes.filter(e => e.tipo === 'pago').length,
        totalPrestamos: eventosDelMes.filter(e => e.tipo === 'prestamo').length,
        totalVencimientos: eventosDelMes.filter(e => e.tipo === 'vencimiento').length,
        totalAlertas: eventosDelMes.filter(e => e.tipo === 'advertencia' || e.tipo === 'alerta').length,
        totalRecaudado: eventosDelMes.filter(e => e.tipo === 'pago').reduce((sum, e) => sum + (e.monto || 0), 0),
        totalDesembolsos: eventosDelMes.filter(e => e.tipo === 'desembolso').length
      });
      
    } catch (error) {
      console.error('Error cargando eventos:', error);
      const hoy = new Date();
      setEventos([
        { id: '1', tipo: 'pago', titulo: 'Pago', fecha: hoy, cliente: 'Juan Pérez', monto: 1500, descripcion: 'Pago de cuota quincenal' },
        { id: '2', tipo: 'desembolso', titulo: 'Desembolso', fecha: new Date(hoy.setDate(hoy.getDate() - 5)), cliente: 'María Rodríguez', monto: 25000, descripcion: 'Desembolso de préstamo' },
        { id: '3', tipo: 'vencimiento', titulo: 'VENCIDO', fecha: new Date(hoy.setDate(hoy.getDate() - 2)), cliente: 'Ana Martínez', monto: 5000, diasRestantes: -2, descripcion: 'Pago vencido' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [fechaActual]);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const cambiarMes = (incremento) => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + incremento, 1));
  };

  const getDiasDelMes = useMemo(() => {
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
        dia, fecha, esMesActual: false,
        eventos: eventos.filter(e => new Date(e.fecha).toDateString() === fecha.toDateString())
      });
    }
    
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(year, month, i);
      const esHoy = fecha.toDateString() === new Date().toDateString();
      dias.push({
        dia: i, fecha, esMesActual: true, esHoy,
        eventos: eventos.filter(e => new Date(e.fecha).toDateString() === fecha.toDateString())
      });
    }
    
    const totalDiasMostrados = 42;
    const diasRestantes = totalDiasMostrados - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(year, month + 1, i);
      dias.push({
        dia: i, fecha, esMesActual: false,
        eventos: eventos.filter(e => new Date(e.fecha).toDateString() === fecha.toDateString())
      });
    }
    
    return dias;
  }, [fechaActual, eventos]);

  useEffect(() => {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const eventosDelMes = eventos.filter(e => {
      const fecha = new Date(e.fecha);
      return fecha.getFullYear() === year && fecha.getMonth() === month;
    });
    
    setEstadisticas({
      totalPagos: eventosDelMes.filter(e => e.tipo === 'pago').length,
      totalPrestamos: eventosDelMes.filter(e => e.tipo === 'prestamo').length,
      totalVencimientos: eventosDelMes.filter(e => e.tipo === 'vencimiento').length,
      totalAlertas: eventosDelMes.filter(e => e.tipo === 'advertencia' || e.tipo === 'alerta').length,
      totalRecaudado: eventosDelMes.filter(e => e.tipo === 'pago').reduce((sum, e) => sum + (e.monto || 0), 0),
      totalDesembolsos: eventosDelMes.filter(e => e.tipo === 'desembolso').length
    });
  }, [fechaActual, eventos]);

  const handleEventoClick = (evento) => {
    setEventoSeleccionado(evento);
    setModalAbierto(true);
  };

  const handleDiaClick = (fecha, eventosDelDia) => {
    setDiaSeleccionado(fecha);
    setEventosDelDia(eventosDelDia);
    setModalDiaAbierto(true);
  };

  const calendarioContent = (
    <>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Calendario de Eventos
            </h3>
            <p className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Pagos, préstamos, vencimientos y alertas
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <IconButton onClick={() => cambiarMes(-1)} title="Mes anterior">
            <ChevronLeftIcon className="h-4 w-4" />
          </IconButton>
          
          <motion.span
            key={`${fechaActual.getMonth()}-${fechaActual.getFullYear()}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-sm font-semibold px-3 py-1.5 rounded-xl ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
          >
            {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
          </motion.span>
          
          <IconButton onClick={() => cambiarMes(1)} title="Mes siguiente">
            <ChevronRightIcon className="h-4 w-4" />
          </IconButton>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={irAlDiaDeHoy}
            disabled={animandoHoy}
            className={`px-3 py-1.5 text-[11px] font-medium bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${animandoHoy ? 'opacity-90' : ''}`}
          >
            {animandoHoy && mostrarLupa ? (
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex items-center gap-1"
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                <span>Buscando</span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-[10px]"
                >
                  ...
                </motion.span>
              </motion.div>
            ) : (
              'Hoy'
            )}
          </motion.button>
          
          <IconButton onClick={cargarEventos} title="Actualizar" disabled={loading}>
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </IconButton>
          
          <IconButton onClick={() => setModalFullscreenAbierto(true)} title="Pantalla completa">
            <ArrowsPointingOutIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-3 mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
        {Object.entries(COLORES_EVENTOS).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${value.fondo}`}></div>
            <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {value.nombre}
            </span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <ArrowPathIcon className="h-8 w-8 text-red-500" />
          </motion.div>
          <p className={`text-sm mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Cargando eventos...</p>
        </div>
      ) : (
        <>
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {DIAS_SEMANA.map((dia, idx) => (
              <div
                key={idx}
                className={`text-center text-xs font-semibold py-2 rounded-xl ${theme === 'dark' ? 'text-gray-400 bg-gray-800/50' : 'text-gray-600 bg-gray-100'}`}
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Calendario */}
          <div className="grid grid-cols-7 gap-1.5">
            {getDiasDelMes.map((dia, idx) => {
              const eventosMostrar = dia.eventos.slice(0, 2);
              const eventosRestantes = dia.eventos.length - 2;
              const tieneMasEventos = eventosRestantes > 0;
              const isHovered = hoveredDay === idx;
              const esHoy = dia.esHoy && dia.esMesActual;
              const estaMarcado = hoyMarcado === dia.fecha.toDateString();
              
              return (
                <BorderGlow key={idx} isHovered={isHovered} color="from-red-600 via-red-500 to-red-600">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => setHoveredDay(idx)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => handleDiaClick(dia.fecha, dia.eventos)}
                    data-day-date={dia.fecha.toDateString()}
                    className={`relative min-h-[95px] p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      estaMarcado
                        ? 'border-red-500 shadow-lg shadow-red-500/30 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/30'
                        : dia.esMesActual
                          ? theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 hover:border-red-500'
                            : 'bg-white border-gray-200 hover:border-red-500'
                          : theme === 'dark'
                            ? 'bg-gray-900/50 border-gray-800 opacity-50'
                            : 'bg-gray-50 border-gray-100 opacity-50'
                    } ${dia.eventos.length > 0 ? 'shadow-sm' : ''}`}
                  >
                    {/* Efecto de brillo para el día marcado */}
                    {estaMarcado && (
                      <>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-red-500 opacity-20 animate-pulse" />
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-red-500 opacity-30 blur-sm animate-pulse" />
                        <div className="absolute inset-0 rounded-xl border-2 border-red-500 animate-ping-once" />
                      </>
                    )}
                    
                    <div className={`relative text-right text-sm font-bold mb-2 ${
                      estaMarcado
                        ? 'text-red-600 dark:text-red-400'
                        : dia.esMesActual
                          ? theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                          : 'text-gray-400'
                    }`}>
                      {dia.dia}
                      {estaMarcado && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      )}
                    </div>
                    <div className="relative flex flex-col gap-1.5">
                      {eventosMostrar.map((evento, i) => (
                        <EventoBadge key={i} evento={evento} onClick={handleEventoClick} isHovered={isHovered} />
                      ))}
                      {tieneMasEventos && (
                        <div className="text-center text-[9px] font-semibold text-red-500 py-0.5 animate-pulse">
                          +{eventosRestantes} más
                        </div>
                      )}
                    </div>
                  </motion.div>
                </BorderGlow>
              );
            })}
          </div>

          {/* Estadísticas del mes */}
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <StatCard
                label="Pagos"
                value={estadisticas.totalPagos}
                color="text-emerald-600"
                icon={CurrencyDollarIcon}
                tooltip="Total de pagos registrados este mes"
              />
              <StatCard
                label="Desembolsos"
                value={estadisticas.totalDesembolsos}
                color="text-purple-600"
                icon={BanknotesIcon}
                tooltip="Total de desembolsos realizados este mes"
              />
              <StatCard
                label="Vencidos"
                value={estadisticas.totalVencimientos}
                color="text-red-600"
                icon={ExclamationTriangleIcon}
                tooltip="Pagos vencidos este mes"
              />
              <StatCard
                label="Alertas"
                value={estadisticas.totalAlertas}
                color="text-orange-600"
                icon={BellIcon}
                tooltip="Alertas de pagos próximos a vencer"
              />
              <StatCard
                label="Préstamos"
                value={estadisticas.totalPrestamos}
                color="text-blue-600"
                icon={DocumentTextIcon}
                tooltip="Préstamos gestionados este mes"
              />
              <StatCard
                label="Recaudado"
                value={formatearMonto(estadisticas.totalRecaudado)}
                color="text-emerald-600"
                icon={GiftIcon}
                tooltip="Total recaudado este mes"
              />
            </div>
          </div>
        </>
      )}
    </>
  );

  // CSS para la animación ping-once
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ping-once {
        0% { transform: scale(1); opacity: 1; border-color: #ef4444; }
        30% { transform: scale(1.05); opacity: 0.8; border-color: #f87171; box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); }
        70% { transform: scale(1.02); opacity: 0.9; border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
        100% { transform: scale(1); opacity: 1; border-color: #ef4444; }
      }
      @keyframes lupa-buscando {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.2) rotate(10deg); }
        50% { transform: scale(1.1) rotate(-10deg); }
        75% { transform: scale(1.15) rotate(5deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      .animate-ping-once {
        animation: ping-once 0.8s ease-out;
      }
      .animate-lupa {
        animation: lupa-buscando 0.8s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div ref={calendarRef}>
      <GlassCard className="p-4">
        {calendarioContent}
      </GlassCard>

      <EventoDetalleModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setEventoSeleccionado(null);
        }}
        evento={eventoSeleccionado}
      />
      
      <EventosDelDiaModal
        isOpen={modalDiaAbierto}
        onClose={() => {
          setModalDiaAbierto(false);
          setDiaSeleccionado(null);
          setEventosDelDia([]);
        }}
        fecha={diaSeleccionado}
        eventos={eventosDelDia}
      />

      <FullscreenModal isOpen={modalFullscreenAbierto} onClose={() => setModalFullscreenAbierto(false)}>
        <GlassCard className="p-6">
          {calendarioContent}
        </GlassCard>
      </FullscreenModal>
    </div>
  );
};

export default CalendarWidget;