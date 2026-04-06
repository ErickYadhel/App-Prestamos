// src/pages/Operaciones/Comisiones.js

import React, { useState, useEffect } from 'react';
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
  ArrowTrendingDownIcon
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

// Registrar componentes de Chart.js
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
// TARJETA DE ESTADÍSTICA
// ============================================
const StatCard = ({ icon: Icon, label, value, color, subValue, change }) => {
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
          {subValue && (
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{subValue}</p>
          )}
          {change && (
            <p className={`text-xs mt-1 flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
              {Math.abs(change)}% vs período anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MODAL DE DASHBOARD DE COMISIONES (AMPLIAR)
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

  // Datos para gráfico de comisiones por garante
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

  // Datos para gráfico de comisiones por mes
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

  // Datos para gráfico de estado
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
              {/* Resumen de estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={CurrencyDollarIcon}
                  label="Total Comisiones"
                  value={formatearMonto(estadisticas.montoTotal)}
                  color="from-red-500 to-red-700"
                  subValue={`${estadisticas.total} comisiones`}
                />
                <StatCard
                  icon={CheckCircleIcon}
                  label="Pagadas"
                  value={formatearMonto(estadisticas.montoPagado)}
                  color="from-green-500 to-green-700"
                  subValue={`${estadisticas.pagadas} pagadas`}
                />
                <StatCard
                  icon={ClockIcon}
                  label="Pendientes"
                  value={formatearMonto(estadisticas.montoPendiente)}
                  color="from-yellow-500 to-yellow-700"
                  subValue={`${estadisticas.pendientes} pendientes`}
                />
                <StatCard
                  icon={UserGroupIcon}
                  label="Garantes Activos"
                  value={Object.keys(comisionesPorGarante).length}
                  color="from-blue-500 to-blue-700"
                />
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Garantes */}
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

                {/* Evolución mensual */}
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
                {/* Distribución por estado */}
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

                {/* Tabla de top garantes */}
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
// TARJETA DE COMISIÓN
// ============================================
const ComisionCard = ({ comision, onVer }) => {
  const { theme } = useTheme();

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
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border cursor-pointer ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg hover:shadow-xl transition-all`}
      onClick={() => onVer(comision)}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-700" />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-700 rounded-lg">
              <CurrencyDollarIcon className="h-4 w-4 text-white" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(comision.estado)}`}>
              {comision.estado}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatFecha(comision.fechaPago)}
          </span>
        </div>

        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {comision.clienteNombre}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Garante: {comision.garanteNombre || comision.garanteID}
        </p>

        <div className="flex justify-between items-center mt-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monto Base (Interés)</p>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatearMonto(comision.montoBase)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Comisión</p>
            <p className="text-lg font-bold text-red-600">
              {formatearMonto(comision.montoComision)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Comisiones = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

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
  const [garantes, setGarantes] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pagadas: 0,
    pendientes: 0,
    canceladas: 0,
    montoTotal: 0,
    montoPagado: 0,
    montoPendiente: 0
  });

  const esGarante = user?.rol === 'garante' || user?.rol === 'agente';
  const esAdmin = user?.rol === 'admin';

  // Leer garanteID de la URL
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

  const cargarComisiones = async () => {
    try {
      setLoading(true);
      setError('');
      
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
      } else {
        throw new Error(response.error || 'Error al cargar comisiones');
      }
    } catch (error) {
      console.error('Error cargando comisiones:', error);
      setError(error.message || 'Error al cargar las comisiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGarantes();
    cargarComisiones();
  }, [filtroGarante]);

  const aplicarFiltros = () => {
    cargarComisiones();
  };

  const limpiarFiltros = () => {
    setFiltroEstado('todos');
    setFiltroGarante('');
    setFiltroCliente('');
    setFechaInicio('');
    setFechaFin('');
    setMontoMin('');
    setMontoMax('');
    cargarComisiones();
  };

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

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

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDashboardAbierto(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            title="Dashboard de comisiones"
          >
            <ChartBarIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Ampliar</span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={cargarComisiones}
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

      {/* Dashboard según rol */}
      {esGarante && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={CurrencyDollarIcon}
            label="Total Ganado"
            value={formatearMonto(estadisticas.montoTotal)}
            color="from-green-500 to-green-700"
            subValue={`${estadisticas.total} comisiones`}
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Comisiones Pagadas"
            value={formatearMonto(estadisticas.montoPagado)}
            color="from-blue-500 to-blue-700"
            subValue={`${estadisticas.pagadas} pagadas`}
          />
          <StatCard
            icon={ClockIcon}
            label="Comisiones Pendientes"
            value={formatearMonto(estadisticas.montoPendiente)}
            color="from-yellow-500 to-yellow-700"
            subValue={`${estadisticas.pendientes} pendientes`}
          />
        </div>
      )}

      {esAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={CurrencyDollarIcon}
            label="Total Comisiones"
            value={formatearMonto(estadisticas.montoTotal)}
            color="from-red-500 to-red-700"
            subValue={`${estadisticas.total} comisiones`}
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Pagadas"
            value={formatearMonto(estadisticas.montoPagado)}
            color="from-green-500 to-green-700"
            subValue={`${estadisticas.pagadas} pagadas`}
          />
          <StatCard
            icon={ClockIcon}
            label="Pendientes"
            value={formatearMonto(estadisticas.montoPendiente)}
            color="from-yellow-500 to-yellow-700"
            subValue={`${estadisticas.pendientes} pendientes`}
          />
          <StatCard
            icon={BanknotesIcon}
            label="Monto Total"
            value={formatearMonto(estadisticas.montoTotal)}
            color="from-purple-500 to-purple-700"
          />
        </div>
      )}

      {/* Filtros */}
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

      {/* Grid de comisiones */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comisiones.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comisiones.map((comision) => (
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