import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  XMarkIcon,
  ShieldCheckIcon,
  UserIcon,
  IdentificationIcon,
  BriefcaseIcon,
  HomeIcon,
  UserGroupIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import SolicitudForm from '../components/Solicitudes/SolicitudForm';
import SolicitudDetails from '../components/Solicitudes/SolicitudDetails';
import AprobarSolicitudModal from '../components/Solicitudes/AprobarSolicitudModal';
import { normalizeFirebaseData, firebaseTimestampToLocalString } from '../utils/firebaseUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ============================================
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SKELETON LOADER
// ============================================
const SolicitudesSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-64 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-80 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className="flex space-x-3">
          <div className={`h-10 w-24 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-10 w-36 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-24 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={`h-64 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE STATS CARD
// ============================================
const StatsCard = ({ icon: Icon, label, value, subValue, gradient, trend }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const gradientColors = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    orange: 'from-orange-600 to-orange-800',
    red: 'from-red-600 to-red-800',
    teal: 'from-teal-600 to-teal-800'
  };

  return (
    <BorderGlow isHovered={isHovered}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-xl p-5 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white border-gray-200'
        } border-2 hover:border-red-600/40 transition-all duration-300`}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColors[gradient]} opacity-10 rounded-full blur-3xl`} />
        
        <div className="relative flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {subValue && (
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                {subValue}
              </p>
            )}
          </div>
          <div className={`p-3 bg-gradient-to-br ${gradientColors[gradient]} rounded-xl shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {trend && (
          <div className="absolute bottom-3 right-3 flex items-center space-x-1">
            <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          </div>
        )}
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE TARJETA DE SOLICITUD (PARA MÓVIL/TABLET)
// ============================================
const SolicitudCard = ({ solicitud, onView, onEdit, onAprobar, onRechazar, getEstadoBadge, getScoreColor, getRecomendacion }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const ratioSueldo = solicitud.sueldoCliente ? (Number(solicitud.montoSolicitado) / Number(solicitud.sueldoCliente)) : 0;
  const recomendacion = getRecomendacion(solicitud);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border-2 ${
        theme === 'dark' 
          ? 'bg-gray-800/90 border-gray-700 hover:border-red-600/50' 
          : 'bg-white border-gray-200 hover:border-red-600/50'
      } shadow-lg transition-all duration-300`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-700" />
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {solicitud.clienteNombre || 'N/A'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <PhoneIcon className="h-3 w-3 mr-1" />
                {solicitud.telefono || 'N/A'}
              </span>
              <span className={`text-xs flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <IdentificationIcon className="h-3 w-3 mr-1" />
                {solicitud.cedula || 'Sin cédula'}
              </span>
            </div>
          </div>
          {getEstadoBadge(solicitud)}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Monto</p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              RD$ {Number(solicitud.montoSolicitado).toLocaleString()}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Score</p>
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-1 ${getScoreColor(solicitud.scoreAnalisis)}`}>
              {Number(solicitud.scoreAnalisis) || 50}/100
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-center space-x-1 py-2 text-xs ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <span>{isExpanded ? 'Ver menos' : 'Ver más'}</span>
          <svg className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Frecuencia</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{solicitud.frecuencia}</p>
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Plazo</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {solicitud.plazoMeses === 0 ? 'Sin plazo' : `${solicitud.plazoMeses} meses`}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Sueldo</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    RD$ {Number(solicitud.sueldoCliente).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ratio</p>
                  <p className={`font-medium ${ratioSueldo <= 1 ? 'text-green-600' : ratioSueldo <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {ratioSueldo.toFixed(2)}x
                  </p>
                </div>
                <div className="col-span-2">
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Recomendación</p>
                  <p className={`text-xs px-2 py-1 rounded inline-block mt-1 ${recomendacion.color}`}>
                    {recomendacion.texto}
                  </p>
                </div>
                {solicitud.lugarTrabajo && (
                  <div className="col-span-2">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Trabajo</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {solicitud.lugarTrabajo}
                      {solicitud.puestoCliente && ` (${solicitud.puestoCliente})`}
                    </p>
                  </div>
                )}
                {solicitud.fechaIngreso && (
                  <div className="col-span-2">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Fecha Ingreso</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(solicitud.fechaIngreso).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onView(solicitud); }}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                {solicitud.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAprobar(solicitud); }}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Aprobar"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRechazar(solicitud.id); }}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Rechazar"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(solicitud); }}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE FILTROS AVANZADOS
// ============================================
const AdvancedFilters = ({ isOpen, onClose, filtros, onFilterChange }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Filtros Avanzados
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha Desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => onFilterChange('fechaDesde', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => onFilterChange('fechaHasta', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Monto Mínimo
              </label>
              <input
                type="number"
                placeholder="0"
                value={filtros.montoMin}
                onChange={(e) => onFilterChange('montoMin', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Monto Máximo
              </label>
              <input
                type="number"
                placeholder="100000"
                value={filtros.montoMax}
                onChange={(e) => onFilterChange('montoMax', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                onFilterChange('reset');
                onClose();
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Limpiar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ============================================
// MODAL DE NOTIFICACIÓN DESPUÉS DE CREAR SOLICITUD
// ============================================
const NotificacionModal = ({ isOpen, onClose, solicitud, onNotificarCliente, onNotificarAdmin }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-green-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-green-50 to-white'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ¡Solicitud Creada!
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                La solicitud de <strong>{solicitud?.clienteNombre}</strong> ha sido creada exitosamente.
              </p>
              <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                ¿Deseas notificar a alguien?
              </p>

              <div className="flex flex-col space-y-3 pt-4">
                <button
                  onClick={() => {
                    onNotificarCliente();
                    onClose();
                  }}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                >
                  <PhoneIcon className="h-5 w-5" />
                  <span>Notificar al Cliente</span>
                </button>
                <button
                  onClick={() => {
                    onNotificarAdmin();
                    onClose();
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Notificar al Administrador</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all hover:bg-gray-300 dark:hover:bg-gray-600"
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
// FUNCIÓN DE ANÁLISIS DE RIESGO REAL
// ============================================
const calcularScoreRiesgo = (solicitud) => {
  let score = 0;
  const factores = [];

  const monto = Number(solicitud.montoSolicitado) || 0;
  const sueldo = Number(solicitud.sueldoCliente) || 0;
  const capacidadPago = sueldo > 0 ? (monto / sueldo) : Infinity;
  
  if (capacidadPago <= 0.3) {
    score += 40;
    factores.push({ nombre: 'Capacidad de pago', puntaje: 40, detalle: 'Excelente' });
  } else if (capacidadPago <= 0.5) {
    score += 30;
    factores.push({ nombre: 'Capacidad de pago', puntaje: 30, detalle: 'Buena' });
  } else if (capacidadPago <= 0.7) {
    score += 20;
    factores.push({ nombre: 'Capacidad de pago', puntaje: 20, detalle: 'Aceptable' });
  } else if (capacidadPago <= 1) {
    score += 10;
    factores.push({ nombre: 'Capacidad de pago', puntaje: 10, detalle: 'Limitada' });
  } else {
    score += 0;
    factores.push({ nombre: 'Capacidad de pago', puntaje: 0, detalle: 'Crítica' });
  }

  if (solicitud.lugarTrabajo && solicitud.puestoCliente) {
    score += 15;
    factores.push({ nombre: 'Estabilidad laboral', puntaje: 15, detalle: 'Completa' });
  } else if (solicitud.lugarTrabajo) {
    score += 10;
    factores.push({ nombre: 'Estabilidad laboral', puntaje: 10, detalle: 'Parcial' });
  } else {
    score += 0;
    factores.push({ nombre: 'Estabilidad laboral', puntaje: 0, detalle: 'Sin información' });
  }

  if (solicitud.bancoCliente && solicitud.cuentaCliente && solicitud.tipoCuenta) {
    score += 15;
    factores.push({ nombre: 'Información bancaria', puntaje: 15, detalle: 'Completa' });
  } else if (solicitud.bancoCliente) {
    score += 10;
    factores.push({ nombre: 'Información bancaria', puntaje: 10, detalle: 'Parcial' });
  } else {
    score += 0;
    factores.push({ nombre: 'Información bancaria', puntaje: 0, detalle: 'Sin información' });
  }

  if (solicitud.garantia) {
    const garantias = { 'hipotecaria': 15, 'prendaria': 12, 'fiduciaria': 10, 'personal': 8, 'ninguna': 5 };
    const puntajeGarantia = garantias[solicitud.garantia?.toLowerCase()] || 5;
    score += puntajeGarantia;
    factores.push({ nombre: 'Garantía', puntaje: puntajeGarantia, detalle: solicitud.garantia });
  } else {
    score += 0;
    factores.push({ nombre: 'Garantía', puntaje: 0, detalle: 'Sin garantía' });
  }

  const plazo = Number(solicitud.plazoMeses) || 0;
  if (plazo === 0 || plazo <= 12) {
    score += 15;
    factores.push({ nombre: 'Plazo', puntaje: 15, detalle: plazo === 0 ? 'Flexible' : `${plazo} meses` });
  } else if (plazo <= 24) {
    score += 10;
    factores.push({ nombre: 'Plazo', puntaje: 10, detalle: `${plazo} meses` });
  } else {
    score += 5;
    factores.push({ nombre: 'Plazo', puntaje: 5, detalle: `${plazo} meses` });
  }

  if (solicitud.fechaIngreso) {
    const fechaIngreso = new Date(solicitud.fechaIngreso);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - fechaIngreso);
    const anosAntiguedad = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    if (anosAntiguedad >= 3) {
      score += 5;
      factores.push({ nombre: 'Antigüedad', puntaje: 5, detalle: `${anosAntiguedad.toFixed(1)} años` });
    } else if (anosAntiguedad >= 1) {
      score += 3;
      factores.push({ nombre: 'Antigüedad', puntaje: 3, detalle: `${anosAntiguedad.toFixed(1)} años` });
    } else if (anosAntiguedad > 0) {
      score += 1;
      factores.push({ nombre: 'Antigüedad', puntaje: 1, detalle: `${anosAntiguedad.toFixed(1)} años` });
    }
  }

  score = Math.min(100, Math.max(0, score));
  
  return { score, factores };
};

// ============================================
// FUNCIÓN PARA CREAR FORMULARIO Y DOCUMENTO AUTOMÁTICAMENTE
// ============================================
const crearFormularioYDocumento = async (solicitudData, solicitudId, user) => {
  try {
    const formularioData = {
      tipo: 'solicitud',
      cliente: solicitudData.clienteNombre,
      email: solicitudData.email,
      telefono: solicitudData.telefono,
      direccion: solicitudData.direccion,
      cedula: solicitudData.cedula,
      monto: solicitudData.montoSolicitado,
      plazo: solicitudData.plazoMeses,
      interes: '10',
      garantia: solicitudData.garantia || 'personal',
      estado: 'pendiente',
      solicitudId: solicitudId,
      fechaCreacion: new Date().toISOString(),
      creadoPor: user?.email || 'sistema',
      observaciones: solicitudData.observaciones
    };

    const formulariosRef = collection(db, 'formularios');
    const formularioDoc = await addDoc(formulariosRef, formularioData);

    const documentoData = {
      tipo: 'contrato',
      nombre: `Contrato de Préstamo - ${solicitudData.clienteNombre}`,
      categoria: 'contratos',
      cliente: solicitudData.clienteNombre,
      descripcion: `Contrato de préstamo por RD$ ${Number(solicitudData.montoSolicitado).toLocaleString()} a ${solicitudData.plazoMeses || 'sin plazo fijo'} meses con interés del 10%`,
      estado: 'pendiente',
      solicitudId: solicitudId,
      formularioId: formularioDoc.id,
      fechaCreacion: new Date().toISOString(),
      creadoPor: user?.email || 'sistema',
      etiquetas: ['préstamo', 'contrato', solicitudData.frecuencia],
      formato: 'PDF',
      tamano: '0 KB',
      archivo: ''
    };

    const documentosRef = collection(db, 'documentos');
    const documentoDoc = await addDoc(documentosRef, documentoData);

    return { formularioId: formularioDoc.id, documentoId: documentoDoc.id };
  } catch (error) {
    console.error('Error creando formulario y documento:', error);
    return null;
  }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Solicitudes = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFrecuencia, setFiltroFrecuencia] = useState('todos');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    fechaDesde: '',
    fechaHasta: '',
    montoMin: '',
    montoMax: ''
  });
  const [viewMode, setViewMode] = useState('list');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [editingSolicitud, setEditingSolicitud] = useState(null);
  const [solicitudParaAprobar, setSolicitudParaAprobar] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNotificacionModal, setShowNotificacionModal] = useState(false);
  const [solicitudReciente, setSolicitudReciente] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    aprobadasCliente: 0,
    montoTotalSolicitado: 0,
    montoTotalAprobado: 0,
    tasaAprobacion: 0
  });
  const [estadisticasAvanzadas, setEstadisticasAvanzadas] = useState(null);
  const [bancos, setBancos] = useState([]);

  const { theme } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const safeToLocaleString = (value, defaultValue = '0') => {
    if (value === null || value === undefined || isNaN(value)) return defaultValue;
    try {
      return Number(value).toLocaleString();
    } catch (error) {
      return defaultValue;
    }
  };

  const safeFirebaseTimestamp = (timestamp, defaultValue = 'N/A') => {
    if (!timestamp) return defaultValue;
    try {
      return firebaseTimestampToLocalString(timestamp);
    } catch (error) {
      return defaultValue;
    }
  };

  useEffect(() => {
    fetchSolicitudes();
    fetchEstadisticasAvanzadas();
    fetchBancos();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
      if (filtrosAvanzados.fechaDesde) params.append('fechaDesde', filtrosAvanzados.fechaDesde);
      if (filtrosAvanzados.fechaHasta) params.append('fechaHasta', filtrosAvanzados.fechaHasta);
      if (filtrosAvanzados.montoMin) params.append('montoMin', filtrosAvanzados.montoMin);
      if (filtrosAvanzados.montoMax) params.append('montoMax', filtrosAvanzados.montoMax);

      const response = await api.get(`/solicitudes?${params}`);
      
      if (response.success) {
        const solicitudesNormalizadas = (response.data || []).map(solicitud => {
          const scoreData = calcularScoreRiesgo(solicitud);
          return {
            ...normalizeFirebaseData(solicitud),
            scoreAnalisis: scoreData.score,
            factoresRiesgo: scoreData.factores
          };
        });
        setSolicitudes(solicitudesNormalizadas);
        calcularEstadisticas(solicitudesNormalizadas);
      } else {
        throw new Error(response.error || 'Error al cargar solicitudes');
      }
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
      setError('Error al cargar las solicitudes. Por favor, intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (solicitudesList) => {
    const total = solicitudesList.length || 0;
    const pendientes = solicitudesList.filter(s => s.estado === 'pendiente').length || 0;
    const aprobadas = solicitudesList.filter(s => s.estado === 'aprobada').length || 0;
    const rechazadas = solicitudesList.filter(s => s.estado === 'rechazada').length || 0;
    const aprobadasCliente = solicitudesList.filter(s => s.estado === 'aprobado_cliente').length || 0;
    
    const montoTotalSolicitado = (solicitudesList || []).reduce((sum, s) => sum + (Number(s.montoSolicitado) || 0), 0);
    const montoTotalAprobado = (solicitudesList || [])
      .filter(s => s.estado === 'aprobada')
      .reduce((sum, s) => sum + (Number(s.montoAprobado) || Number(s.montoSolicitado) || 0), 0);
    
    const tasaAprobacion = total > 0 ? (aprobadas / total) * 100 : 0;

    setStats({
      total,
      pendientes,
      aprobadas,
      rechazadas,
      aprobadasCliente,
      montoTotalSolicitado,
      montoTotalAprobado,
      tasaAprobacion
    });
  };

  const fetchEstadisticasAvanzadas = async () => {
    try {
      const response = await api.get('/solicitudes/estadisticas/avanzadas');
      if (response.success) {
        setEstadisticasAvanzadas(response.data);
      }
    } catch (error) {
      console.error('Error fetching estadísticas avanzadas:', error);
    }
  };

  const fetchBancos = async () => {
    try {
      const response = await api.get('/solicitudes/bancos');
      if (response.success) {
        setBancos(response.data);
      }
    } catch (error) {
      setBancos([
        'Banco de Reservas',
        'Banco Popular Dominicano',
        'Scotiabank',
        'Banco BHD León',
        'Banco Santa Cruz'
      ]);
    }
  };

  const filteredSolicitudes = (solicitudes || []).filter(solicitud => {
    if (!solicitud) return false;

    const matchesSearch = 
      (solicitud.clienteNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (solicitud.telefono || '').includes(searchTerm) ||
      (solicitud.cedula || '').includes(searchTerm) ||
      (solicitud.empleadoNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (solicitud.lugarTrabajo || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = filtroEstado === 'todos' || solicitud.estado === filtroEstado;
    const matchesFrecuencia = filtroFrecuencia === 'todos' || solicitud.frecuencia === filtroFrecuencia;

    const montoSolicitado = Number(solicitud.montoSolicitado) || 0;
    const matchesMonto = 
      (!filtrosAvanzados.montoMin || montoSolicitado >= parseFloat(filtrosAvanzados.montoMin)) &&
      (!filtrosAvanzados.montoMax || montoSolicitado <= parseFloat(filtrosAvanzados.montoMax));

    const fechaSolicitud = solicitud.fechaSolicitud ? new Date(solicitud.fechaSolicitud) : null;
    const matchesFecha = 
      (!filtrosAvanzados.fechaDesde || (fechaSolicitud && fechaSolicitud >= new Date(filtrosAvanzados.fechaDesde))) &&
      (!filtrosAvanzados.fechaHasta || (fechaSolicitud && fechaSolicitud <= new Date(filtrosAvanzados.fechaHasta)));

    return matchesSearch && matchesEstado && matchesFrecuencia && matchesMonto && matchesFecha;
  });

  const handleCreateSolicitud = () => {
    setEditingSolicitud(null);
    setViewMode('form');
  };

  const handleEditSolicitud = (solicitud) => {
    setEditingSolicitud(solicitud);
    setViewMode('form');
  };

  const handleViewSolicitud = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setViewMode('details');
  };

  const handleAprobarSolicitud = (solicitud) => {
    console.log('🚀 [Solicitudes] handleAprobarSolicitud llamado');
    console.log('📋 Solicitud a aprobar:', {
      id: solicitud.id,
      cliente: solicitud.clienteNombre,
      estado: solicitud.estado,
      monto: solicitud.montoSolicitado
    });
    setSolicitudParaAprobar(solicitud);
  };

  const handleRechazarSolicitud = async (solicitudId, observaciones = '') => {
    if (!observaciones.trim()) {
      observaciones = prompt('Ingrese el motivo del rechazo:');
      if (observaciones === null) return;
      if (!observaciones.trim()) {
        alert('Debe ingresar un motivo para rechazar la solicitud');
        return;
      }
    }

    try {
      setError('');
      const response = await api.put(`/solicitudes/${solicitudId}/rechazar`, {
        aprobadoPor: 'admin',
        observaciones: observaciones
      });

      if (response.success) {
        setSuccess('Solicitud rechazada exitosamente');
        
        const solicitud = solicitudes.find(s => s.id === solicitudId);
        if (solicitud && response.notificaciones) {
          setTimeout(() => {
            if (window.confirm('¿Desea abrir WhatsApp para informar al cliente sobre el rechazo?')) {
              window.open(response.notificaciones.whatsappCliente, '_blank');
            }
          }, 1000);
        }

        setTimeout(() => setSuccess(''), 5000);
        fetchSolicitudes();
        fetchEstadisticasAvanzadas();
      } else {
        throw new Error(response.error || 'Error al rechazar la solicitud');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      setError(error.message);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSolicitud(null);
    setEditingSolicitud(null);
    setSolicitudParaAprobar(null);
    fetchSolicitudes();
    fetchEstadisticasAvanzadas();
  };

  const handleSaveSolicitud = async (solicitudData) => {
    try {
      setError('');
      let response;
      let solicitudId;

      if (editingSolicitud) {
        response = await api.put(`/solicitudes/${editingSolicitud.id}`, solicitudData);
        solicitudId = editingSolicitud.id;
      } else {
        response = await api.post('/solicitudes', solicitudData);
        if (response.success && response.data?.id) {
          solicitudId = response.data.id;
        }
      }

      if (response.success) {
        const message = editingSolicitud ? 'Solicitud actualizada exitosamente' : 'Solicitud creada exitosamente';
        setSuccess(message);
        
        if (!editingSolicitud && solicitudId) {
          const resultado = await crearFormularioYDocumento(solicitudData, solicitudId, user);
          
          if (resultado) {
            setSuccess(`${message} - Se ha creado el formulario y documento automáticamente`);
            setSolicitudReciente({
              ...solicitudData,
              id: solicitudId,
              documentoId: resultado.documentoId
            });
            setShowNotificacionModal(true);
          }
        }

        setTimeout(() => setSuccess(''), 5000);
        handleBackToList();
      } else {
        throw new Error(response.error || `Error al ${editingSolicitud ? 'actualizar' : 'crear'} la solicitud`);
      }
    } catch (error) {
      console.error('Error saving application:', error);
      setError(error.message);
    }
  };

  const notificarClienteWhatsApp = () => {
    if (!solicitudReciente) return;
    
    const mensaje = `📋 SOLICITUD DE PRÉSTAMO REGISTRADA - EYS Inversiones

Estimado(a) ${solicitudReciente.clienteNombre},

Hemos recibido su solicitud de préstamo. Por favor, revise y firme el contrato en el siguiente enlace:

https://eysinversiones.com/documentos/${solicitudReciente.documentoId}

Para cualquier consulta, contáctenos al 829-447-0640.

¡Gracias por confiar en EYS Inversiones!`;

    const whatsappLink = `https://wa.me/1${solicitudReciente.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappLink, '_blank');
  };

  const notificarAdminWhatsApp = () => {
    if (!solicitudReciente) return;
    
    const mensaje = `📋 NUEVA SOLICITUD DE PRÉSTAMO - EYS Inversiones

👤 Cliente: ${solicitudReciente.clienteNombre}
📞 Teléfono: ${solicitudReciente.telefono}
💰 Monto: RD$ ${Number(solicitudReciente.montoSolicitado).toLocaleString()}
🏢 Trabajo: ${solicitudReciente.lugarTrabajo}
📅 Fecha: ${new Date().toLocaleDateString()}

Puede revisar la solicitud en el sistema.

- Sistema EYS Inversiones`;

    const whatsappLink = `https://wa.me/18294470640?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappLink, '_blank');
  };

  const handleFiltrosChange = (key, value) => {
    if (key === 'reset') {
      setFiltrosAvanzados({
        fechaDesde: '',
        fechaHasta: '',
        montoMin: '',
        montoMax: ''
      });
      setFiltroEstado('todos');
      setFiltroFrecuencia('todos');
      setSearchTerm('');
    } else {
      setFiltrosAvanzados(prev => ({ ...prev, [key]: value }));
    }
  };

  const exportarPDF = () => {
    if (filteredSolicitudes.length === 0) return;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(139, 0, 0);
    doc.text('Reporte de Solicitudes', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`Total: ${filteredSolicitudes.length} solicitudes`, 20, 37);
    
    const tableData = filteredSolicitudes.map(s => [
      s.clienteNombre || 'N/A',
      s.cedula || 'N/A',
      s.telefono || 'N/A',
      `RD$ ${Number(s.montoSolicitado).toLocaleString()}`,
      s.frecuencia || 'N/A',
      s.estado || 'N/A',
      `${Number(s.scoreAnalisis) || 50}/100`
    ]);

    doc.autoTable({
      head: [['Cliente', 'Cédula', 'Teléfono', 'Monto', 'Frecuencia', 'Estado', 'Score']],
      body: tableData,
      startY: 45,
      theme: 'striped',
      headStyles: { fillColor: [139, 0, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`solicitudes_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportarExcel = () => {
    if (filteredSolicitudes.length === 0) return;

    const data = filteredSolicitudes.map(s => ({
      'Cliente': s.clienteNombre || 'N/A',
      'Cédula': s.cedula || 'N/A',
      'Teléfono': s.telefono || 'N/A',
      'Email': s.email || 'N/A',
      'Monto Solicitado': Number(s.montoSolicitado) || 0,
      'Frecuencia': s.frecuencia || 'N/A',
      'Plazo (Meses)': s.plazoMeses === 0 ? 'Sin plazo' : s.plazoMeses,
      'Estado': s.estado || 'N/A',
      'Score': Number(s.scoreAnalisis) || 50,
      'Empleado': s.empleadoNombre || 'N/A',
      'Fecha Solicitud': safeFirebaseTimestamp(s.fechaSolicitud),
      'Lugar Trabajo': s.lugarTrabajo || 'N/A',
      'Sueldo': Number(s.sueldoCliente) || 0,
      'Fecha Ingreso': s.fechaIngreso ? new Date(s.fechaIngreso).toLocaleDateString() : ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes');
    XLSX.writeFile(wb, `solicitudes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getEstadoBadge = (solicitud) => {
    if (!solicitud) return null;

    const estados = {
      pendiente: { 
        color: theme === 'dark' 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon, 
        text: 'Pendiente' 
      },
      aprobada: { 
        color: theme === 'dark' 
          ? 'bg-green-900/30 text-green-400 border-green-700' 
          : 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon, 
        text: 'Aprobada' 
      },
      rechazada: { 
        color: theme === 'dark' 
          ? 'bg-red-900/30 text-red-400 border-red-700' 
          : 'bg-red-100 text-red-800 border-red-200',
        icon: XCircleIcon, 
        text: 'Rechazada' 
      },
      aprobado_cliente: {
        color: theme === 'dark'
          ? 'bg-blue-900/30 text-blue-400 border-blue-700'
          : 'bg-blue-100 text-blue-800 border-blue-200',
        icon: ShieldCheckIcon,
        text: 'Aprobado por Cliente'
      }
    };

    const estado = estados[solicitud.estado] || estados.pendiente;
    const Icon = estado.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-2 ${estado.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {estado.text}
      </span>
    );
  };

  const getScoreColor = (score) => {
    const safeScore = Number(score) || 50;
    if (safeScore >= 80) return theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50';
    if (safeScore >= 60) return theme === 'dark' ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-50';
    if (safeScore >= 40) return theme === 'dark' ? 'text-orange-400 bg-orange-900/30' : 'text-orange-600 bg-orange-50';
    return theme === 'dark' ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50';
  };

  const getRecomendacion = (solicitud) => {
    if (!solicitud) return { texto: 'SIN DATOS', color: theme === 'dark' ? 'text-gray-400 bg-gray-800' : 'text-gray-700 bg-gray-100' };
    
    const score = Number(solicitud.scoreAnalisis) || 50;
    
    if (score >= 80) return { texto: 'ALTA PRIORIDAD', color: theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-100' };
    if (score >= 70) return { texto: 'RECOMENDADA', color: theme === 'dark' ? 'text-blue-400 bg-blue-900/30' : 'text-blue-700 bg-blue-100' };
    if (score >= 50) return { texto: 'EVALUAR', color: theme === 'dark' ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-700 bg-yellow-100' };
    if (score >= 30) return { texto: 'PRECAUCIÓN', color: theme === 'dark' ? 'text-orange-400 bg-orange-900/30' : 'text-orange-700 bg-orange-100' };
    return { texto: 'NO RECOMENDADA', color: theme === 'dark' ? 'text-red-400 bg-red-900/30' : 'text-red-700 bg-red-100' };
  };

  if (viewMode === 'form') {
    return (
      <SolicitudForm
        solicitud={editingSolicitud}
        onSave={handleSaveSolicitud}
        onCancel={handleBackToList}
        error={error}
        bancos={bancos}
      />
    );
  }

  if (viewMode === 'details' && selectedSolicitud) {
    return (
      <SolicitudDetails
        solicitud={selectedSolicitud}
        onBack={handleBackToList}
        onEdit={() => handleEditSolicitud(selectedSolicitud)}
        onAprobar={handleAprobarSolicitud}
        onRechazar={handleRechazarSolicitud}
        bancos={bancos}
      />
    );
  }

  if (loading) {
    return <SolicitudesSkeleton />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl blur-3xl"></div>
        <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-red-600/20`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Solicitudes de Préstamos
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sistema de evaluación y aprobación de solicitudes
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-lg transition-all ${
                  showFilters
                    ? 'bg-red-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Filtros avanzados"
              >
                <FunnelIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className={`p-3 rounded-lg transition-all ${
                  showSearch
                    ? 'bg-red-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Buscar solicitudes"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportarPDF}
                disabled={filteredSolicitudes.length === 0}
                className={`p-3 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
                title="Exportar PDF"
              >
                <DocumentTextIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportarExcel}
                disabled={filteredSolicitudes.length === 0}
                className={`p-3 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
                title="Exportar Excel"
              >
                <TableCellsIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchSolicitudes}
                className={`p-3 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Refrescar datos"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateSolicitud}
                className="p-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                title="Nueva solicitud"
              >
                <PlusIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border-2 flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-700 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border-2 ${
              theme === 'dark'
                ? 'bg-green-900/30 border-green-700 text-green-400'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <p className="text-sm">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filtros={filtrosAvanzados}
            onFilterChange={handleFiltrosChange}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard>
              <div className="p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por cliente, teléfono, cédula, empleado o lugar de trabajo..."
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border-2 outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <XMarkIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} hover:text-red-600 transition-colors`} />
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={DocumentTextIcon}
          label="Total Solicitudes"
          value={stats.total}
          subValue={`${stats.pendientes} pendientes`}
          gradient="blue"
        />
        
        <StatsCard
          icon={BanknotesIcon}
          label="Monto Solicitado"
          value={`RD$ ${safeToLocaleString(stats.montoTotalSolicitado)}`}
          subValue={`RD$ ${safeToLocaleString(stats.montoTotalAprobado)} aprobado`}
          gradient="green"
        />

        <StatsCard
          icon={ChartBarIcon}
          label="Tasa de Aprobación"
          value={`${Number(stats.tasaAprobacion).toFixed(1)}%`}
          subValue={`${stats.aprobadas} aprobadas`}
          gradient="purple"
        />

        <StatsCard
          icon={UserGroupIcon}
          label="Estado Portfolio"
          value={`${stats.aprobadas} / ${stats.aprobadasCliente} / ${stats.pendientes} / ${stats.rechazadas}`}
          subValue={`Aprobadas / Cliente / Pendientes / Rechazadas`}
          gradient="orange"
        />
      </div>

      <GlassCard>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'todos'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroEstado('pendiente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'pendiente'
                  ? 'bg-yellow-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltroEstado('aprobado_cliente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'aprobado_cliente'
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Aprobadas por Cliente
            </button>
            <button
              onClick={() => setFiltroEstado('aprobada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'aprobada'
                  ? 'bg-green-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Aprobadas
            </button>
            <button
              onClick={() => setFiltroEstado('rechazada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filtroEstado === 'rechazada'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Rechazadas
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Frecuencia:
            </span>
            <button
              onClick={() => setFiltroFrecuencia('todos')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'todos'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroFrecuencia('diario')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'diario'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setFiltroFrecuencia('semanal')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'semanal'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setFiltroFrecuencia('quincenal')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'quincenal'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Quincenal
            </button>
            <button
              onClick={() => setFiltroFrecuencia('mensual')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filtroFrecuencia === 'mensual'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mensual
            </button>
          </div>
        </div>
      </GlassCard>

      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredSolicitudes.length === 0 ? (
            <div className="text-center py-12">
              <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>📋</div>
              <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {searchTerm || filtroEstado !== 'todos' || filtroFrecuencia !== 'todos'
                  ? 'No se encontraron solicitudes' 
                  : 'No hay solicitudes registradas'
                }
              </p>
              {!searchTerm && filtroEstado === 'todos' && filtroFrecuencia === 'todos' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateSolicitud}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Crear Primera Solicitud</span>
                </motion.button>
              )}
            </div>
          ) : (
            filteredSolicitudes.map((solicitud) => (
              <SolicitudCard
                key={solicitud.id}
                solicitud={solicitud}
                onView={handleViewSolicitud}
                onEdit={handleEditSolicitud}
                onAprobar={handleAprobarSolicitud}
                onRechazar={handleRechazarSolicitud}
                getEstadoBadge={getEstadoBadge}
                getScoreColor={getScoreColor}
                getRecomendacion={getRecomendacion}
              />
            ))
          )}
        </div>
      ) : (
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  {['Cliente / Información', 'Solicitud', 'Análisis de Riesgo', 'Empleado / Fecha', 'Estado', 'Acciones'].map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                 </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
              }`}>
                <AnimatePresence>
                  {filteredSolicitudes.map((solicitud) => {
                    if (!solicitud) return null;
                    
                    const recomendacion = getRecomendacion(solicitud);
                    const ratioSueldo = solicitud.sueldoCliente ? (Number(solicitud.montoSolicitado) / Number(solicitud.sueldoCliente)) : 0;
                    
                    return (
                      <motion.tr
                        key={solicitud.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50`}
                        onClick={() => handleViewSolicitud(solicitud)}
                      >
                        <td className="px-6 py-4">
                          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {solicitud.clienteNombre || 'N/A'}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              {solicitud.telefono || 'N/A'}
                            </span>
                            <span className={`text-xs flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              <IdentificationIcon className="h-3 w-3 mr-1" />
                              {solicitud.cedula || 'Sin cédula'}
                            </span>
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                            {solicitud.email || 'Sin email'}
                          </div>
                          {solicitud.lugarTrabajo && (
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-2 flex items-center`}>
                              <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                              {solicitud.lugarTrabajo}
                              {solicitud.puestoCliente && ` (${solicitud.puestoCliente})`}
                            </div>
                          )}
                          {solicitud.fechaIngreso && (
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                              Ingreso: {new Date(solicitud.fechaIngreso).toLocaleDateString()}
                            </div>
                          )}
                         </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            RD$ {safeToLocaleString(solicitud.montoSolicitado)}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            {solicitud.plazoMeses === 0 ? 'Sin plazo' : `${solicitud.plazoMeses} meses`} • {solicitud.frecuencia || 'N/A'}
                          </div>
                          {solicitud.sueldoCliente && (
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                              Sueldo: RD$ {safeToLocaleString(solicitud.sueldoCliente)} 
                              {ratioSueldo > 0 && ` (${ratioSueldo.toFixed(2)}x)`}
                            </div>
                          )}
                          {solicitud.bancoCliente && (
                            <div className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mt-2 flex items-center`}>
                              🏦 {solicitud.bancoCliente}
                            </div>
                          )}
                         </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Score:
                            </span>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(solicitud.scoreAnalisis)}`}>
                              {Number(solicitud.scoreAnalisis) || 50}/100
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${recomendacion.color}`}>
                            {recomendacion.texto}
                          </div>
                          {solicitud.factoresRiesgo && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-500 mb-1">Factores:</div>
                              {solicitud.factoresRiesgo.slice(0, 2).map((factor, idx) => (
                                <div key={idx} className={`text-xs ${factor.puntaje >= 10 ? 'text-green-600' : 'text-yellow-600'} flex items-center`}>
                                  • {factor.nombre}: {factor.puntaje} pts
                                </div>
                              ))}
                            </div>
                          )}
                         </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                            {solicitud.empleadoNombre || 'N/A'}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1 flex items-center`}>
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {safeFirebaseTimestamp(solicitud.fechaSolicitud)}
                          </div>
                         </td>
                        <td className="px-6 py-4">
                          {getEstadoBadge(solicitud)}
                          {solicitud.fechaDecision && (
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                              {safeFirebaseTimestamp(solicitud.fechaDecision)}
                            </div>
                          )}
                         </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSolicitud(solicitud);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-gray-700 text-blue-400'
                                  : 'hover:bg-blue-50 text-blue-600'
                              }`}
                              title="Ver análisis completo"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            
                            {solicitud.estado === 'pendiente' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAprobarSolicitud(solicitud);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    theme === 'dark'
                                      ? 'hover:bg-gray-700 text-green-400'
                                      : 'hover:bg-green-50 text-green-600'
                                  }`}
                                  title="Aprobar solicitud"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRechazarSolicitud(solicitud.id);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    theme === 'dark'
                                      ? 'hover:bg-gray-700 text-red-400'
                                      : 'hover:bg-red-50 text-red-600'
                                  }`}
                                  title="Rechazar solicitud"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSolicitud(solicitud);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    theme === 'dark'
                                      ? 'hover:bg-gray-700 text-yellow-400'
                                      : 'hover:bg-yellow-50 text-yellow-600'
                                  }`}
                                  title="Editar solicitud"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                         </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {filteredSolicitudes.length === 0 && (
              <div className="text-center py-12">
                <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>📋</div>
                <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {searchTerm || filtroEstado !== 'todos' || filtroFrecuencia !== 'todos'
                    ? 'No se encontraron solicitudes' 
                    : 'No hay solicitudes registradas'
                  }
                </p>
                {!searchTerm && filtroEstado === 'todos' && filtroFrecuencia === 'todos' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateSolicitud}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Crear Primera Solicitud</span>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      <AnimatePresence>
        {solicitudParaAprobar && (
          <AprobarSolicitudModal
            solicitud={solicitudParaAprobar}
            onClose={() => {
              console.log('❌ Modal cerrado sin aprobar');
              setSolicitudParaAprobar(null);
            }}
            onAprobado={() => {
              console.log('✅ [Solicitudes] onAprobado ejecutado');
              setSolicitudParaAprobar(null);
              handleBackToList();
              setSuccess('Solicitud aprobada y préstamo creado exitosamente');
              setTimeout(() => setSuccess(''), 5000);
            }}
            onError={(error) => {
              console.error('❌ Error en aprobación:', error);
              setError(error);
            }}
          />
        )}
      </AnimatePresence>

      <NotificacionModal
        isOpen={showNotificacionModal}
        onClose={() => setShowNotificacionModal(false)}
        solicitud={solicitudReciente}
        onNotificarCliente={notificarClienteWhatsApp}
        onNotificarAdmin={notificarAdminWhatsApp}
      />
    </div>
  );
};

export default Solicitudes;