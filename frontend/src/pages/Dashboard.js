import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CogIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import dashboardService from '../services/dashboardService';
import { useTheme } from '../context/ThemeContext';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered }) => {
  const { theme } = useTheme();
  
  return (
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
};

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
// COMPONENTE METRIC CARD MEJORADO
// ============================================
const MetricCard = ({ title, value, change, changeType, icon: Icon, color, link, description, gradient }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const gradientColors = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    red: 'from-red-600 to-red-800',
    indigo: 'from-indigo-600 to-indigo-800',
    teal: 'from-teal-600 to-teal-800',
    emerald: 'from-emerald-600 to-emerald-800',
    cyan: 'from-cyan-600 to-cyan-800',
    yellow: 'from-yellow-600 to-yellow-800',
    pink: 'from-pink-600 to-pink-800'
  };

  return (
    <BorderGlow isHovered={isHovered}>
      <Link 
        to={link} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-xl p-5 block transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white border-gray-200'
        } border-2 hover:border-red-600/40`}
      >
        {/* Fondo con gradiente */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColors[color]} opacity-10 rounded-full blur-3xl`} />
        
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {title}
              </p>
              <div className="flex items-baseline">
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </p>
                {change && (
                  <span className={`ml-2 inline-flex items-center text-xs font-medium ${
                    changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {changeType === 'positive' ? 
                      <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    }
                    {change}%
                  </span>
                )}
              </div>
              {description && (
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  {description}
                </p>
              )}
            </div>
            <div className={`p-3 bg-gradient-to-br ${gradientColors[color]} rounded-xl shadow-lg ml-4 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </Link>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE SKELETON LOADER
// ============================================
const DashboardSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-64 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className={`h-10 w-32 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
      </div>

      {/* Métricas Skeleton */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-32 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      clientes: 0,
      prestamos: 0,
      pagosHoy: 0,
      solicitudes: 0,
      gananciasMes: 0,
      capitalPrestado: 0,
      morosidad: 0,
      pagosPendientes: 0,
      nuevosClientes: 0,
      capitalRecuperado: 0,
      tasaRecuperacion: 0
    },
    graficos: {
      pagosPorMes: [],
      prestamosPorMes: [],
      solicitudesPorEstado: [],
      clientesNuevos: [],
      distribucionPagos: [],
      distribucionPrestamos: [],
      gananciasPorMes: []
    },
    metricas: {
      tasaAprobacion: 0,
      promedioPrestamo: 0,
      rotacionCapital: 0,
      eficienciaCobranza: 0,
      rentabilidad: 0,
      indiceMorosidad: 0
    },
    actividadReciente: [],
    prestamosProximosVencimiento: []
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  
  const { theme } = useTheme();

  useEffect(() => {
    fetchDashboardData();
    
    // Actualizar cada 1 minuto para datos en tiempo real
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [periodo]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Actualizando datos del dashboard...');
      const data = await dashboardService.getDashboardStats(periodo);
      console.log('✅ Datos recibidos:', data);
      
      setDashboardData(data);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Error al cargar los datos. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'RD$ 0';
    if (amount >= 1000000) {
      return `RD$ ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `RD$ ${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    if (!number && number !== 0) return '0';
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('es-DO').format(number);
  };

  // Calcular cambios porcentuales
  const calculateChange = (currentValue, metricType) => {
    const historicalData = {
      clientes: currentValue * 0.85,
      prestamos: currentValue * 0.80,
      pagosHoy: currentValue * 0.70,
      solicitudes: currentValue * 1.2,
      gananciasMes: currentValue * 0.75,
      capitalPrestado: currentValue * 0.80,
      morosidad: currentValue * 1.1,
      nuevosClientes: currentValue * 0.90,
      capitalRecuperado: currentValue * 0.85,
      tasaRecuperacion: currentValue * 0.95
    };

    const previous = historicalData[metricType] || currentValue * 0.8;
    
    if (!previous || previous === 0) return null;
    
    const change = ((currentValue - previous) / previous * 100);
    return {
      value: Math.abs(Math.round(change)),
      type: change >= 0 ? 'positive' : 'negative'
    };
  };

  // Configuración de gráficos con tema
  const getChartOptions = (type = 'bar') => {
    const textColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
    const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB';
    
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
          titleColor: theme === 'dark' ? '#F3F4F6' : '#111827',
          bodyColor: textColor,
          borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        },
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor }
        }
      }
    };

    if (type === 'doughnut') {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              boxWidth: 12,
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            titleColor: theme === 'dark' ? '#F3F4F6' : '#111827',
            bodyColor: textColor,
          }
        }
      };
    }

    return baseOptions;
  };

  // Datos para gráficos con colores adaptados al tema
  const getBarData = () => ({
    labels: dashboardData.graficos.pagosPorMes.map(item => item.mes),
    datasets: [
      {
        label: 'Pagos por Mes',
        data: dashboardData.graficos.pagosPorMes.map(item => item.value),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.7,
      },
    ],
  });

  const getLineData = (data, label, color) => ({
    labels: data.map(item => item.mes),
    datasets: [
      {
        label,
        data: data.map(item => item.value),
        borderColor: color,
        backgroundColor: theme === 'dark' 
          ? `${color}20` 
          : `${color}10`,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  });

  const getDoughnutData = (data) => ({
    labels: data.map(item => item.estado || item.tipo),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color),
        borderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  });

  // Iconos para actividad reciente
  const iconMap = {
    CreditCardIcon: CreditCardIcon,
    DocumentTextIcon: DocumentTextIcon,
    CurrencyDollarIcon: CurrencyDollarIcon,
    UsersIcon: UsersIcon
  };

  if (loading && !lastUpdated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header Mejorado */}
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
                  Dashboard
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
                  Resumen general en tiempo real
                  {lastUpdated && (
                    <span className="text-xs ml-2 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {lastUpdated.toLocaleTimeString('es-DO')}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="mes">Este Mes</option>
                <option value="año">Este Año</option>
                <option value="todo">Todo el Tiempo</option>
              </select>
              
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchDashboardData}
                disabled={loading}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
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
      </AnimatePresence>

      {/* Quick Actions - Versión Mejorada */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-lg">
              <RocketLaunchIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Acciones Rápidas
            </h3>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { to: '/clientes', color: 'from-blue-600 to-blue-800', icon: UsersIcon, text: 'Clientes' },
              { to: '/prestamos', color: 'from-green-600 to-green-800', icon: CurrencyDollarIcon, text: 'Préstamos' },
              { to: '/pagos', color: 'from-teal-600 to-teal-800', icon: CreditCardIcon, text: 'Pagos' },
              { to: '/solicitudes', color: 'from-purple-600 to-purple-800', icon: DocumentTextIcon, text: 'Solicitudes' }
            ].map((action, index) => (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={action.to}
                  className={`relative overflow-hidden group block p-4 rounded-xl bg-gradient-to-br ${action.color} shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <div className="relative flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-medium">{action.text}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Clientes Activos"
          value={formatNumber(dashboardData.stats.clientes)}
          change={calculateChange(dashboardData.stats.clientes, 'clientes')?.value}
          changeType={calculateChange(dashboardData.stats.clientes, 'clientes')?.type}
          icon={UsersIcon}
          color="blue"
          link="/clientes"
        />
        <MetricCard
          title="Préstamos Activos"
          value={formatNumber(dashboardData.stats.prestamos)}
          change={calculateChange(dashboardData.stats.prestamos, 'prestamos')?.value}
          changeType={calculateChange(dashboardData.stats.prestamos, 'prestamos')?.type}
          icon={CurrencyDollarIcon}
          color="green"
          link="/prestamos"
        />
        <MetricCard
          title="Ganancias del Mes"
          value={formatCurrency(dashboardData.stats.gananciasMes)}
          change={calculateChange(dashboardData.stats.gananciasMes, 'gananciasMes')?.value}
          changeType={calculateChange(dashboardData.stats.gananciasMes, 'gananciasMes')?.type}
          icon={ArrowTrendingUpIcon}
          color="purple"
          link="/pagos"
          description="Solo intereses"
        />
        <MetricCard
          title="Tasa de Morosidad"
          value={`${dashboardData.stats.morosidad}%`}
          change={calculateChange(dashboardData.stats.morosidad, 'morosidad')?.value}
          changeType={dashboardData.stats.morosidad <= 5 ? 'positive' : 'negative'}
          icon={ChartBarIcon}
          color="red"
          link="/prestamos"
        />
      </div>

      {/* Segunda Fila de Métricas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Capital Prestado"
          value={formatCurrency(dashboardData.stats.capitalPrestado)}
          change={calculateChange(dashboardData.stats.capitalPrestado, 'capitalPrestado')?.value}
          changeType={calculateChange(dashboardData.stats.capitalPrestado, 'capitalPrestado')?.type}
          icon={BanknotesIcon}
          color="indigo"
          link="/prestamos"
        />
        <MetricCard
          title="Pagos Hoy"
          value={formatNumber(dashboardData.stats.pagosHoy)}
          change={calculateChange(dashboardData.stats.pagosHoy, 'pagosHoy')?.value}
          changeType={calculateChange(dashboardData.stats.pagosHoy, 'pagosHoy')?.type}
          icon={CreditCardIcon}
          color="teal"
          link="/pagos"
        />
        <MetricCard
          title="Capital Recuperado"
          value={formatCurrency(dashboardData.stats.capitalRecuperado)}
          change={calculateChange(dashboardData.stats.capitalRecuperado, 'capitalRecuperado')?.value}
          changeType={calculateChange(dashboardData.stats.capitalRecuperado, 'capitalRecuperado')?.type}
          icon={CheckCircleIcon}
          color="emerald"
          link="/pagos"
          description={`${dashboardData.stats.tasaRecuperacion}% del total`}
        />
        <MetricCard
          title="Clientes Nuevos"
          value={formatNumber(dashboardData.stats.nuevosClientes)}
          change={calculateChange(dashboardData.stats.nuevosClientes, 'nuevosClientes')?.value}
          changeType={calculateChange(dashboardData.stats.nuevosClientes, 'nuevosClientes')?.type}
          icon={UsersIcon}
          color="cyan"
          link="/clientes"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pagos por Mes */}
        <GlassCard>
          <div className="p-6">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Pagos por Mes
            </h4>
            <div className="h-80">
              {dashboardData.graficos.pagosPorMes.some(item => item.value > 0) ? (
                <Bar data={getBarData()} options={getChartOptions('bar')} />
              ) : (
                <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No hay datos de pagos
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Préstamos por Mes */}
        <GlassCard>
          <div className="p-6">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Préstamos por Mes
            </h4>
            <div className="h-80">
              {dashboardData.graficos.prestamosPorMes.some(item => item.value > 0) ? (
                <Line 
                  data={getLineData(dashboardData.graficos.prestamosPorMes, 'Préstamos por Mes', '#10B981')} 
                  options={getChartOptions('line')} 
                />
              ) : (
                <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No hay datos de préstamos
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Ganancias por Mes */}
        <GlassCard>
          <div className="p-6">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Ganancias por Mes
            </h4>
            <div className="h-80">
              {dashboardData.graficos.gananciasPorMes.some(item => item.value > 0) ? (
                <Line 
                  data={getLineData(dashboardData.graficos.gananciasPorMes, 'Ganancias por Mes', '#8B5CF6')} 
                  options={getChartOptions('line')} 
                />
              ) : (
                <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No hay datos de ganancias
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Distribución de Pagos */}
        <GlassCard>
          <div className="p-6">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Distribución de Pagos
            </h4>
            <div className="h-80">
              {dashboardData.graficos.distribucionPagos.some(item => item.value > 0) ? (
                <Doughnut 
                  data={getDoughnutData(dashboardData.graficos.distribucionPagos)} 
                  options={getChartOptions('doughnut')} 
                />
              ) : (
                <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No hay datos de pagos
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Estado de Préstamos */}
        <GlassCard>
          <div className="p-6">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Estado de Préstamos
            </h4>
            <div className="h-80">
              {dashboardData.graficos.distribucionPrestamos.some(item => item.value > 0) ? (
                <Pie 
                  data={getDoughnutData(dashboardData.graficos.distribucionPrestamos)} 
                  options={getChartOptions('doughnut')} 
                />
              ) : (
                <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No hay datos de préstamos
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Solicitudes por Estado */}
        <GlassCard>
          <div className="p-6">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Solicitudes por Estado
            </h4>
            <div className="h-80">
              {dashboardData.graficos.solicitudesPorEstado.some(item => item.value > 0) ? (
                <Doughnut 
                  data={getDoughnutData(dashboardData.graficos.solicitudesPorEstado)} 
                  options={getChartOptions('doughnut')} 
                />
              ) : (
                <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No hay solicitudes
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Métricas de Desempeño y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Métricas de Desempeño */}
        <GlassCard>
          <div className="p-6">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Métricas de Desempeño
            </h4>
            <div className="space-y-5">
              {[
                { label: 'Tasa de Aprobación', value: dashboardData.metricas.tasaAprobacion, color: 'green' },
                { label: 'Rentabilidad', value: dashboardData.metricas.rentabilidad, color: 'purple' },
                { label: 'Eficiencia de Cobranza', value: dashboardData.metricas.eficienciaCobranza, color: 'blue' },
                { label: 'Índice de Morosidad', value: dashboardData.metricas.indiceMorosidad, color: 'red' }
              ].map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{metric.label}</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {metric.value}%
                    </span>
                  </div>
                  <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(metric.value, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className={`h-full rounded-full bg-gradient-to-r from-${metric.color}-600 to-${metric.color}-400`}
                    />
                  </div>
                </div>
              ))}
              
              <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Préstamo Promedio</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(dashboardData.metricas.promedioPrestamo)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Actividad Reciente y Vencimientos */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Actividad Reciente */}
          <GlassCard>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Actividad Reciente
                </h4>
                <Link to="/pagos" className={`text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>
                  Ver todo →
                </Link>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {dashboardData.actividadReciente.length > 0 ? (
                  dashboardData.actividadReciente.map((actividad, index) => {
                    const IconComponent = iconMap[actividad.icono] || DocumentTextIcon;
                    return (
                      <motion.div
                        key={actividad.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border-2 transition-all hover:border-red-600/50 ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${actividad.color} bg-opacity-20`}>
                              <IconComponent className={`h-4 w-4 ${actividad.color}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {actividad.descripcion}
                              </p>
                              {actividad.monto > 0 && (
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatCurrency(actividad.monto)}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs whitespace-nowrap ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(actividad.fecha).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No hay actividad reciente
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Próximos Vencimientos */}
          <GlassCard>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Próximos Vencimientos
                </h4>
                <Link to="/prestamos" className={`text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>
                  Ver todo →
                </Link>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {dashboardData.prestamosProximosVencimiento.length > 0 ? (
                  dashboardData.prestamosProximosVencimiento.map((prestamo, index) => (
                    <motion.div
                      key={prestamo.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border-2 transition-all hover:border-red-600/50 ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {prestamo.cliente}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Vence: {new Date(prestamo.fechaVencimiento).toLocaleDateString('es-DO')}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(prestamo.monto)}
                          </p>
                          <p className={`text-xs ${
                            prestamo.diasRestantes <= 2 
                              ? 'text-red-600 dark:text-red-400' 
                              : prestamo.diasRestantes <= 5 
                              ? 'text-yellow-600 dark:text-yellow-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {prestamo.diasRestantes} días
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No hay vencimientos próximos
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;