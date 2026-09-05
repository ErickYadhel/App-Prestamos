import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  XMarkIcon,
  RocketLaunchIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon,
  BanknotesIcon,
  GiftIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrophyIcon,
  PresentationChartLineIcon,
  PercentBadgeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
  FireIcon,
  ViewColumnsIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { formatFecha } from '../../utils/firebaseUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
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
      className={`rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800/80 backdrop-blur-lg' 
          : 'bg-white shadow-lg'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SECCIÓN DESPLEGABLE GLOBAL
// ============================================
const StatsCardsContainer = ({ children, title, icon: Icon, isOpen, onToggle }) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div 
        className={`p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors ${
          !isOpen ? 'border-b-0' : 'border-b border-red-600/20'
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-lg">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <h3 className={`text-sm sm:text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {isOpen ? 'Ocultar' : 'Mostrar'}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <ChevronUpIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            ) : (
              <ChevronDownIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 sm:p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// TARJETA DE ESTADÍSTICA MEJORADA
// ============================================
const StatCard = ({ icon: Icon, label, value, color, subValue, change, tooltip, badge }) => {
  const { theme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const gradientColors = {
    red: 'from-red-500 to-red-700',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
    yellow: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700',
    pink: 'from-pink-500 to-pink-700',
    indigo: 'from-indigo-500 to-indigo-700',
    teal: 'from-teal-500 to-teal-700',
    orange: 'from-orange-500 to-orange-700',
    emerald: 'from-emerald-500 to-emerald-700'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl p-3 sm:p-4 border-2 hover:border-red-600/40 transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-8 -mt-8`} />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className={`text-[10px] sm:text-xs font-medium truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {label}
            </p>
            {tooltip && (
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="focus:outline-none"
              >
                <InformationCircleIcon className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>
          <p className={`text-lg sm:text-xl font-bold mt-0.5 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {subValue && (
            <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-0.5`}>
              {subValue}
            </p>
          )}
          {change && (
            <p className={`text-[10px] mt-0.5 flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <ArrowTrendingUpIcon className="h-3 w-3 mr-0.5" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-0.5" />}
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${gradientColors[color]} shadow-lg ml-2 flex-shrink-0`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
      </div>

      {badge && (
        <div className="absolute -top-1 -right-1">
          <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full ${badge.color || 'bg-red-600'} text-white`}>
            {badge.text}
          </span>
        </div>
      )}

      {showTooltip && tooltip && (
        <div className="absolute bottom-full left-0 mb-2 px-2 py-1 text-[10px] bg-gray-900 text-white rounded whitespace-nowrap z-50 shadow-lg">
          {tooltip}
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// MODAL DE DASHBOARD DE COMISIONES (AMPLIADO)
// ============================================
const DashboardComisionesModal = ({ isOpen, onClose, comisiones, estadisticas }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const comisionesPorGarante = comisiones.reduce((acc, com) => {
    const nombre = com.garanteNombre || com.garanteID || 'Sin garante';
    if (!acc[nombre]) {
      acc[nombre] = { total: 0, pagadas: 0, pendientes: 0, cantidad: 0 };
    }
    acc[nombre].total += com.montoComision || 0;
    acc[nombre].cantidad++;
    if (com.estado === 'pagada') acc[nombre].pagadas += com.montoComision || 0;
    if (com.estado === 'pendiente') acc[nombre].pendientes += com.montoComision || 0;
    return acc;
  }, {});

  const topGarantes = Object.entries(comisionesPorGarante)
    .map(([nombre, data]) => ({ nombre, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const barChartData = {
    labels: topGarantes.map(g => g.nombre.length > 20 ? g.nombre.substring(0, 20) + '...' : g.nombre),
    datasets: [
      {
        label: 'Total Comisiones',
        data: topGarantes.map(g => g.total),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Pagadas',
        data: topGarantes.map(g => g.pagadas),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  const comisionesPorMes = comisiones.reduce((acc, com) => {
    if (!com.fechaPago) return acc;
    const fecha = new Date(com.fechaPago);
    const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    const mesLabel = fecha.toLocaleDateString('es-DO', { year: 'numeric', month: 'short' });
    if (!acc[mesKey]) {
      acc[mesKey] = { label: mesLabel, total: 0, pagadas: 0, pendientes: 0 };
    }
    acc[mesKey].total += com.montoComision || 0;
    if (com.estado === 'pagada') acc[mesKey].pagadas += com.montoComision || 0;
    if (com.estado === 'pendiente') acc[mesKey].pendientes += com.montoComision || 0;
    return acc;
  }, {});

  const mesesOrdenados = Object.entries(comisionesPorMes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12);

  const lineChartData = {
    labels: mesesOrdenados.map(m => m[1].label),
    datasets: [
      {
        label: 'Total Comisiones',
        data: mesesOrdenados.map(m => m[1].total),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Pagadas',
        data: mesesOrdenados.map(m => m[1].pagadas),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ],
  };

  const doughnutData = {
    labels: ['Pagadas', 'Pendientes', 'Canceladas'],
    datasets: [
      {
        data: [estadisticas.pagadas, estadisticas.pendientes, estadisticas.canceladas || 0],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: 'transparent',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatearMonto(context.raw)}`;
          }
        }
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />

            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Dashboard de Comisiones
                    </h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Análisis detallado de comisiones por garante y período
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

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={CurrencyDollarIcon}
                  label="Total Comisiones"
                  value={formatearMonto(estadisticas.montoTotal)}
                  color="red"
                  subValue={`${estadisticas.total} comisiones`}
                />
                <StatCard
                  icon={CheckCircleIcon}
                  label="Pagadas"
                  value={formatearMonto(estadisticas.montoPagado)}
                  color="green"
                  subValue={`${estadisticas.pagadas} pagadas`}
                />
                <StatCard
                  icon={ClockIcon}
                  label="Pendientes"
                  value={formatearMonto(estadisticas.montoPendiente)}
                  color="yellow"
                  subValue={`${estadisticas.pendientes} pendientes`}
                />
                <StatCard
                  icon={UserGroupIcon}
                  label="Garantes Activos"
                  value={Object.keys(comisionesPorGarante).length}
                  color="blue"
                  subValue="con comisiones"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <div className="p-4">
                    <h4 className={`text-base font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Top Garantes por Comisiones
                    </h4>
                    <div className="h-80">
                      <Bar data={barChartData} options={chartOptions} />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="p-4">
                    <h4 className={`text-base font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Evolución Mensual
                    </h4>
                    <div className="h-80">
                      <Line data={lineChartData} options={chartOptions} />
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <div className="p-4">
                    <h4 className={`text-base font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Distribución por Estado
                    </h4>
                    <div className="h-64 flex justify-center">
                      <div className="w-64">
                        <Doughnut data={doughnutData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="p-4">
                    <h4 className={`text-base font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Detalle por Garante
                    </h4>
                    <div className="overflow-x-auto max-h-64">
                      <table className="min-w-full text-sm">
                        <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                          <tr>
                            <th className="px-3 py-2 text-left">Garante</th>
                            <th className="px-3 py-2 text-right">Total</th>
                            <th className="px-3 py-2 text-right">Pagado</th>
                            <th className="px-3 py-2 text-right">Pendiente</th>
                            <th className="px-3 py-2 text-center">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topGarantes.map((garante, idx) => (
                            <tr key={idx} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="px-3 py-2">{garante.nombre}</td>
                              <td className="px-3 py-2 text-right font-medium text-red-600">
                                {formatearMonto(garante.total)}
                              </td>
                              <td className="px-3 py-2 text-right text-green-600">
                                {formatearMonto(garante.pagadas)}
                              </td>
                              <td className="px-3 py-2 text-right text-yellow-600">
                                {formatearMonto(garante.pendientes)}
                              </td>
                              <td className="px-3 py-2 text-center">{garante.cantidad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} text-center`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Datos actualizados en tiempo real | {comisiones.length} comisiones registradas
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MODAL PARA VER DETALLE DE COMISIÓN
// ============================================
const DetalleComisionModal = ({ isOpen, onClose, comision }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pagada': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'pendiente': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelada': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-red-600/20' : 'border-gray-200'} flex justify-between items-center`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Detalle de Comisión
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    ID: {comision?.id?.slice(0, 8)}...
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
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(comision?.estado)}`}>
                  {comision?.estado?.charAt(0).toUpperCase() + comision?.estado?.slice(1)}
                </span>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} text-center`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monto de Comisión</p>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {formatearMonto(comision?.montoComision)}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-red-600/20`}>
                <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Información de la Comisión
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Garante</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {comision?.garanteNombre || comision?.garanteID}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cliente</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {comision?.clienteNombre}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monto Base (Interés)</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatearMonto(comision?.montoBase)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Porcentaje</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {comision?.porcentaje}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Fecha del Pago</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatFecha(comision?.fechaPago)}
                    </p>
                  </div>
                  {comision?.prestamoID && (
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>ID Préstamo</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {comision.prestamoID.slice(0, 12)}...
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Descripción</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {comision?.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
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
// TARJETA DE COMISIÓN MEJORADA
// ============================================
const ComisionCard = ({ comision, onVer }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pagada': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 ${
        isHovered
          ? 'border-red-600 shadow-xl shadow-red-600/20'
          : theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      }`}
      onClick={() => onVer(comision)}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-700" />
      
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-red-500 to-red-700 rounded-lg">
              <CurrencyDollarIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getEstadoColor(comision.estado)}`}>
              {comision.estado}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {formatFecha(comision.fechaPago)}
          </span>
        </div>

        <h4 className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {comision.clienteNombre}
        </h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          Garante: {comision.garanteNombre || comision.garanteID}
        </p>

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-[9px] text-gray-500 dark:text-gray-400">Monto Base</p>
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatearMonto(comision.montoBase)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-500 dark:text-gray-400">Comisión</p>
            <p className="text-base font-bold text-red-600">
              {formatearMonto(comision.montoComision)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE TABLA DE COMISIONES
// ============================================
const ComisionesTable = ({ comisiones, onVer, sortConfig, requestSort, getSortIcon, theme }) => {
  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pagada': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelada': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
          <tr>
            <th 
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors whitespace-nowrap"
              onClick={() => requestSort('clienteNombre')}
            >
              Cliente {getSortIcon('clienteNombre')}
            </th>
            <th 
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors whitespace-nowrap"
              onClick={() => requestSort('garanteNombre')}
            >
              Garante {getSortIcon('garanteNombre')}
            </th>
            <th 
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors whitespace-nowrap"
              onClick={() => requestSort('montoBase')}
            >
              Monto Base {getSortIcon('montoBase')}
            </th>
            <th 
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors whitespace-nowrap"
              onClick={() => requestSort('montoComision')}
            >
              Comisión {getSortIcon('montoComision')}
            </th>
            <th 
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors whitespace-nowrap"
              onClick={() => requestSort('fechaPago')}
            >
              Fecha {getSortIcon('fechaPago')}
            </th>
            <th 
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-red-600 transition-colors whitespace-nowrap"
              onClick={() => requestSort('estado')}
            >
              Estado {getSortIcon('estado')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
        }`}>
          {comisiones.map((comision) => (
            <motion.tr
              key={comision.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/50`}
              onClick={() => onVer(comision)}
            >
              <td className="px-6 py-4">
                <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {comision.clienteNombre || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {comision.garanteNombre || comision.garanteID || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                  {formatearMonto(comision.montoBase)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`text-sm font-bold text-red-600`}>
                  {formatearMonto(comision.montoComision)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                  {formatFecha(comision.fechaPago)}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(comision.estado)}`}>
                  {comision.estado}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVer(comision);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-blue-400'
                      : 'hover:bg-blue-50 text-blue-600'
                  }`}
                  title="Ver detalles completos"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {comisiones.length === 0 && (
        <div className="text-center py-12">
          <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay comisiones para mostrar
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Comisiones = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [dashboardAbierto, setDashboardAbierto] = useState(false);
  const [comisionSeleccionada, setComisionSeleccionada] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroGarante, setFiltroGarante] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');
  const [showStatsCards, setShowStatsCards] = useState(true);
  const [garantes, setGarantes] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [viewMode, setViewMode] = useState('table');
  
  const [sortConfig, setSortConfig] = useState({
    key: 'fechaPago',
    direction: 'desc'
  });
  
  const [accionRapidaActiva, setAccionRapidaActiva] = useState(null);
  
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pagadas: 0,
    pendientes: 0,
    canceladas: 0,
    montoTotal: 0,
    montoPagado: 0,
    montoPendiente: 0
  });

  // 🔥 CACHÉ EN FRONTEND
  const [cargaInicial, setCargaInicial] = useState(true);
  const yaCargado = useRef(false);

  const esGarante = user?.rol === 'garante' || user?.rol === 'agente';
  const esAdmin = user?.rol === 'admin';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('cards');
      } else {
        setViewMode('table');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const garanteIdFromUrl = queryParams.get('garanteID');
    if (garanteIdFromUrl) {
      setFiltroGarante(garanteIdFromUrl);
    }
  }, [location.search]);

  const cargarGarantes = async () => {
    try {
      const response = await api.get('/garantes');
      if (response.success) {
        setGarantes(response.data || []);
      }
    } catch (error) {
      console.error('Error cargando garantes:', error);
    }
  };

  // ============================================
  // 🔥 CARGAR COMISIONES CON CACHÉ
  // ============================================
  const cargarComisiones = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      
      // Verificar caché en localStorage
      if (!forceRefresh) {
        const cached = localStorage.getItem('comisionesCache');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const edad = Date.now() - parsed.timestamp;
            if (edad < 300000) { // 5 minutos
              console.log('📦 [CACHE] Usando caché de comisiones');
              setComisiones(parsed.comisiones || []);
              setEstadisticas(parsed.estadisticas || {
                total: 0, pagadas: 0, pendientes: 0, canceladas: 0,
                montoTotal: 0, montoPagado: 0, montoPendiente: 0
              });
              setCargaInicial(false);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.log('⚠️ Error leyendo caché de comisiones:', e);
          }
        }
      }
      
      console.log('🔄 [CACHE] Cargando comisiones frescas...');
      
      let url = '/comisiones';
      const params = new URLSearchParams();
      
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
      if (filtroGarante) params.append('garanteID', filtroGarante);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      
      if (response.success) {
        let comisionesData = response.data || [];
        
        if (filtroCliente) {
          comisionesData = comisionesData.filter(c => 
            c.clienteNombre?.toLowerCase().includes(filtroCliente.toLowerCase())
          );
        }
        if (montoMin) {
          comisionesData = comisionesData.filter(c => (c.montoComision || 0) >= parseFloat(montoMin));
        }
        if (montoMax) {
          comisionesData = comisionesData.filter(c => (c.montoComision || 0) <= parseFloat(montoMax));
        }
        
        setComisiones(comisionesData);
        
        const stats = {
          total: comisionesData.length,
          pagadas: comisionesData.filter(c => c.estado === 'pagada').length,
          pendientes: comisionesData.filter(c => c.estado === 'pendiente').length,
          canceladas: comisionesData.filter(c => c.estado === 'cancelada').length,
          montoTotal: comisionesData.reduce((sum, c) => sum + (c.montoComision || 0), 0),
          montoPagado: comisionesData.filter(c => c.estado === 'pagada').reduce((sum, c) => sum + (c.montoComision || 0), 0),
          montoPendiente: comisionesData.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + (c.montoComision || 0), 0)
        };
        
        setEstadisticas(stats);
        
        // Guardar en caché
        try {
          localStorage.setItem('comisionesCache', JSON.stringify({
            comisiones: comisionesData,
            estadisticas: stats,
            timestamp: Date.now()
          }));
          console.log('💾 [CACHE] Comisiones guardadas en caché');
        } catch (e) {
          console.log('⚠️ Error guardando caché de comisiones:', e);
        }
      } else {
        throw new Error(response.error || 'Error al cargar comisiones');
      }
    } catch (error) {
      console.error('Error cargando comisiones:', error);
      setError(error.message || 'Error al cargar las comisiones');
    } finally {
      setLoading(false);
      setCargaInicial(false);
    }
  };

  useEffect(() => {
    if (yaCargado.current) return;
    cargarGarantes();
    cargarComisiones();
    yaCargado.current = true;
  }, []);

  // Recargar cuando cambian filtros (excepto la primera vez)
  const aplicarFiltros = () => {
    cargarComisiones(true);
  };

  const limpiarFiltros = () => {
    setFiltroEstado('todos');
    setFiltroGarante('');
    setFiltroCliente('');
    setFechaInicio('');
    setFechaFin('');
    setMontoMin('');
    setMontoMax('');
    setAccionRapidaActiva(null);
    cargarComisiones(true);
  };

  const formatMontoAbreviado = (valor) => {
    if (!valor && valor !== 0) return 'RD$ 0';
    if (valor >= 1000000) return `RD$ ${(valor / 1000000).toFixed(1)}M`;
    if (valor >= 1000) return `RD$ ${(valor / 1000).toFixed(1)}K`;
    return `RD$ ${valor.toLocaleString()}`;
  };

  const formatMontoExacto = (valor) => {
    if (!valor && valor !== 0) return 'RD$ 0';
    return `RD$ ${valor.toLocaleString()}`;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowsUpDownIcon className="h-3 w-3 inline ml-1" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUpIcon className="h-3 w-3 inline ml-1" />
      : <ArrowDownIcon className="h-3 w-3 inline ml-1" />;
  };

  const filteredAndSortedComisiones = useMemo(() => {
    let result = [...comisiones];

    if (filtroCliente) {
      result = result.filter(c => 
        c.clienteNombre?.toLowerCase().includes(filtroCliente.toLowerCase())
      );
    }

    if (filtroEstado !== 'todos') {
      result = result.filter(c => c.estado === filtroEstado);
    }

    if (filtroGarante) {
      result = result.filter(c => c.garanteID === filtroGarante);
    }

    if (fechaInicio) {
      const fechaInicioObj = new Date(fechaInicio);
      result = result.filter(c => {
        const fecha = new Date(c.fechaPago);
        return fecha >= fechaInicioObj;
      });
    }
    if (fechaFin) {
      const fechaFinObj = new Date(fechaFin);
      fechaFinObj.setHours(23, 59, 59, 999);
      result = result.filter(c => {
        const fecha = new Date(c.fechaPago);
        return fecha <= fechaFinObj;
      });
    }

    if (montoMin) {
      result = result.filter(c => (c.montoComision || 0) >= parseFloat(montoMin));
    }
    if (montoMax) {
      result = result.filter(c => (c.montoComision || 0) <= parseFloat(montoMax));
    }

    result.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortConfig.key) {
        case 'clienteNombre':
          aVal = a.clienteNombre || '';
          bVal = b.clienteNombre || '';
          break;
        case 'garanteNombre':
          aVal = a.garanteNombre || a.garanteID || '';
          bVal = b.garanteNombre || b.garanteID || '';
          break;
        case 'montoBase':
          aVal = a.montoBase || 0;
          bVal = b.montoBase || 0;
          break;
        case 'montoComision':
          aVal = a.montoComision || 0;
          bVal = b.montoComision || 0;
          break;
        case 'estado':
          aVal = a.estado || '';
          bVal = b.estado || '';
          break;
        case 'fechaPago':
        default:
          aVal = new Date(a.fechaPago).getTime();
          bVal = new Date(b.fechaPago).getTime();
          break;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [comisiones, filtroCliente, filtroEstado, filtroGarante, fechaInicio, fechaFin, montoMin, montoMax, sortConfig]);

  const statsAdicionales = useMemo(() => {
    if (comisiones.length === 0) {
      return {
        promedioComision: 0,
        garanteTop: { nombre: '', total: 0, cantidad: 0 },
        montoMaximo: 0,
        montoMinimo: 0,
        eficienciaPago: 0
      };
    }

    const total = comisiones.reduce((sum, c) => sum + (c.montoComision || 0), 0);
    const promedio = total / comisiones.length;

    const garantesMap = comisiones.reduce((acc, c) => {
      const nombre = c.garanteNombre || c.garanteID || 'Sin garante';
      if (!acc[nombre]) {
        acc[nombre] = { total: 0, cantidad: 0 };
      }
      acc[nombre].total += c.montoComision || 0;
      acc[nombre].cantidad++;
      return acc;
    }, {});

    let topGarante = { nombre: '', total: 0, cantidad: 0 };
    for (const [nombre, data] of Object.entries(garantesMap)) {
      if (data.total > topGarante.total) {
        topGarante = { nombre, total: data.total, cantidad: data.cantidad };
      }
    }

    const montos = comisiones.map(c => c.montoComision || 0);
    const maximo = Math.max(...montos);
    const minimo = Math.min(...montos);
    const pagadas = comisiones.filter(c => c.estado === 'pagada').length;
    const eficiencia = comisiones.length > 0 ? (pagadas / comisiones.length) * 100 : 0;

    return {
      promedioComision: promedio,
      garanteTop: topGarante,
      montoMaximo: maximo,
      montoMinimo: minimo,
      eficienciaPago: eficiencia
    };
  }, [comisiones]);

  const handleAccionRapida = (tipo, valor) => {
    if (accionRapidaActiva === tipo) {
      setAccionRapidaActiva(null);
      limpiarFiltros();
      return;
    }
    
    setAccionRapidaActiva(tipo);
    
    setFiltroEstado('todos');
    setFiltroCliente('');
    setFechaInicio('');
    setFechaFin('');
    setMontoMin('');
    setMontoMax('');
    
    if (tipo === 'todos') {
      // Ya está limpio
    } else if (tipo === 'pagadas') {
      setFiltroEstado('pagada');
    } else if (tipo === 'pendientes') {
      setFiltroEstado('pendiente');
    } else if (tipo === 'canceladas') {
      setFiltroEstado('cancelada');
    } else if (tipo === 'mas5k') {
      setMontoMin('5000');
    } else if (tipo === 'esteMes') {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      setFechaInicio(inicioMes.toISOString().split('T')[0]);
      setFechaFin(hoy.toISOString().split('T')[0]);
    }
    
    setTimeout(() => cargarComisiones(true), 50);
  };

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  // 🔥 FUNCIÓN PARA ACTUALIZAR DATOS MANUALMENTE
  const actualizarDatos = () => {
    cargarComisiones(true);
  };

  const mostrarVistaTabla = viewMode === 'table';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
            <CurrencyDollarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {esGarante ? 'Mis Comisiones' : 'Gestión de Comisiones'}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {esGarante 
                ? 'Visualiza tus comisiones generadas por los préstamos referidos'
                : 'Administra las comisiones por préstamos y cobros'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Vista de tarjetas"
            >
              <ViewColumnsIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Vista de tabla"
            >
              <TableCellsIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setDashboardAbierto(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            title="Dashboard de comisiones"
          >
            <ChartBarIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Dashboard</span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={actualizarDatos}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Actualizar"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mensajes */}
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

      {/* Stats Cards */}
      <StatsCardsContainer 
        title={esGarante ? "Resumen de Mis Comisiones" : "Métricas de Comisiones"}
        icon={ChartBarIcon}
        isOpen={showStatsCards}
        onToggle={() => setShowStatsCards(!showStatsCards)}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <StatCard
            icon={CurrencyDollarIcon}
            label="Total Comisiones"
            value={formatMontoAbreviado(estadisticas.montoTotal)}
            subValue={`${estadisticas.total} comisiones`}
            color="red"
            tooltip="Total de comisiones generadas"
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Pagadas"
            value={formatMontoAbreviado(estadisticas.montoPagado)}
            subValue={`${estadisticas.pagadas} pagadas`}
            color="green"
            tooltip="Comisiones que ya han sido pagadas"
          />
          <StatCard
            icon={ClockIcon}
            label="Pendientes"
            value={formatMontoAbreviado(estadisticas.montoPendiente)}
            subValue={`${estadisticas.pendientes} pendientes`}
            color="yellow"
            tooltip="Comisiones pendientes de pago"
          />
          <StatCard
            icon={PresentationChartLineIcon}
            label="Promedio por Comisión"
            value={formatMontoAbreviado(statsAdicionales.promedioComision)}
            subValue={`${comisiones.length} comisiones`}
            color="blue"
            tooltip="Promedio de monto por comisión"
          />
          <StatCard
            icon={TrophyIcon}
            label="Garante Top"
            value={statsAdicionales.garanteTop.nombre || 'Ninguno'}
            subValue={statsAdicionales.garanteTop.total > 0 ? `RD$ ${statsAdicionales.garanteTop.total.toLocaleString()}` : 'Sin comisiones'}
            color="purple"
            tooltip="Garante que ha generado más comisiones"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            icon={FireIcon}
            label="Comisión Máxima"
            value={formatMontoAbreviado(statsAdicionales.montoMaximo)}
            subValue="Monto más alto"
            color="orange"
            tooltip="Monto de comisión más alto registrado"
          />
          <StatCard
            icon={PercentBadgeIcon}
            label="Eficiencia de Pago"
            value={`${statsAdicionales.eficienciaPago.toFixed(1)}%`}
            subValue={`${estadisticas.pagadas} de ${estadisticas.total} pagadas`}
            color="emerald"
            tooltip="Porcentaje de comisiones pagadas vs total"
          />
          <StatCard
            icon={UserGroupIcon}
            label="Garantes Activos"
            value={garantes.filter(g => {
              const tieneComisiones = comisiones.some(c => c.garanteID === g.id);
              return tieneComisiones;
            }).length}
            subValue={`${garantes.length} garantes totales`}
            color="indigo"
            tooltip="Garantes que han generado al menos una comisión"
          />
          <StatCard
            icon={BanknotesIcon}
            label="Monto Base Total"
            value={formatMontoAbreviado(comisiones.reduce((sum, c) => sum + (c.montoBase || 0), 0))}
            subValue="Base para comisiones"
            color="teal"
            tooltip="Suma de todos los montos base (intereses) sobre los que se calculan comisiones"
          />
        </div>
      </StatsCardsContainer>

      {/* Filtros Avanzados */}
      <GlassCard>
        <div className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente..."
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                  } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                />
              </div>
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                showAdvancedFilters
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filtros avanzados</span>
            </button>

            <button
              onClick={aplicarFiltros}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Aplicar filtros
            </button>
          </div>

          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {esAdmin && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Garante
                      </label>
                      <select
                        value={filtroGarante}
                        onChange={(e) => setFiltroGarante(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                        } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      >
                        <option value="">Todos los garantes</option>
                        {garantes.map(garante => (
                          <option key={garante.id} value={garante.id}>
                            {garante.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Rango de Monto
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={montoMin}
                        onChange={(e) => setMontoMin(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                        } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      />
                      <input
                        type="number"
                        placeholder="Máx"
                        value={montoMax}
                        onChange={(e) => setMontoMax(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                        } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={limpiarFiltros}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Acciones rápidas */}
      <GlassCard>
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs sm:text-sm font-medium mr-1 sm:mr-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Acciones rápidas:
            </span>
            <button 
              onClick={() => handleAccionRapida('todos', null)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                accionRapidaActiva === 'todos'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos ({estadisticas.total})
            </button>
            <button 
              onClick={() => handleAccionRapida('pagadas', null)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                accionRapidaActiva === 'pagadas'
                  ? 'bg-green-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ✅ Pagadas ({estadisticas.pagadas})
            </button>
            <button 
              onClick={() => handleAccionRapida('pendientes', null)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                accionRapidaActiva === 'pendientes'
                  ? 'bg-yellow-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⏳ Pendientes ({estadisticas.pendientes})
            </button>
            <button 
              onClick={() => handleAccionRapida('canceladas', null)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                accionRapidaActiva === 'canceladas'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ❌ Canceladas ({estadisticas.canceladas || 0})
            </button>
            <button 
              onClick={() => handleAccionRapida('mas5k', null)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                accionRapidaActiva === 'mas5k'
                  ? 'bg-purple-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              💰 +5K
            </button>
            <button 
              onClick={() => handleAccionRapida('esteMes', null)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs transition-colors ${
                accionRapidaActiva === 'esteMes'
                  ? 'bg-cyan-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📅 Este mes
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Lista de comisiones */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredAndSortedComisiones.length === 0 ? (
        <div className="text-center py-12">
          <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {esGarante 
              ? 'Aún no tienes comisiones registradas'
              : 'No hay comisiones para mostrar'}
          </p>
          {esGarante && (
            <p className="text-sm text-gray-500 mt-2">
              Las comisiones se generan automáticamente cuando los clientes que referiste realizan pagos de intereses.
            </p>
          )}
        </div>
      ) : mostrarVistaTabla ? (
        <GlassCard>
          <ComisionesTable
            comisiones={filteredAndSortedComisiones}
            onVer={(com) => {
              setComisionSeleccionada(com);
              setDetalleAbierto(true);
            }}
            sortConfig={sortConfig}
            requestSort={requestSort}
            getSortIcon={getSortIcon}
            theme={theme}
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedComisiones.map((comision) => (
            <ComisionCard
              key={comision.id}
              comision={comision}
              onVer={(com) => {
                setComisionSeleccionada(com);
                setDetalleAbierto(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Resumen Ejecutivo */}
      {filteredAndSortedComisiones.length > 0 && (
        <GlassCard>
          <div className="p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg">
                <RocketLaunchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Resumen Ejecutivo
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Comisiones
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {formatMontoExacto(estadisticas.montoTotal)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {estadisticas.total} comisiones registradas
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Comisiones Pagadas
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {formatMontoExacto(estadisticas.montoPagado)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {estadisticas.pagadas} de {estadisticas.total} pagadas
                </p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Eficiencia de Pago
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {statsAdicionales.eficienciaPago.toFixed(1)}%
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {estadisticas.pagadas} pagadas de {estadisticas.total}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Modal de detalle */}
      <DetalleComisionModal
        isOpen={detalleAbierto}
        onClose={() => {
          setDetalleAbierto(false);
          setComisionSeleccionada(null);
        }}
        comision={comisionSeleccionada}
      />

      {/* Modal de dashboard ampliado */}
      <DashboardComisionesModal
        isOpen={dashboardAbierto}
        onClose={() => setDashboardAbierto(false)}
        comisiones={comisiones}
        estadisticas={estadisticas}
      />
    </div>
  );
};

export default Comisiones;