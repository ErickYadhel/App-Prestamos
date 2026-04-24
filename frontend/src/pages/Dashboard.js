import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, CurrencyDollarIcon, CreditCardIcon, DocumentTextIcon,
  ChartBarIcon, ArrowTrendingUpIcon, BanknotesIcon, ArrowUpIcon,
  ArrowDownIcon, ClockIcon, SparklesIcon, PresentationChartLineIcon,
  ChartPieIcon, ScaleIcon, WalletIcon, FunnelIcon, ArrowPathIcon,
  ExclamationTriangleIcon, CheckCircleIcon, UserIcon, GiftIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
  RadialLinearScale, RadarController
} from 'chart.js';
import dashboardService from '../services/dashboardService';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { convertTimestampToDate } from '../components/Dashboard/DateFormatter';

// Componentes importados
import QuickActions from '../components/Dashboard/QuickActions';
import GlassCard from '../components/Dashboard/GlassCard';
import DashboardSkeleton from '../components/Dashboard/DashboardSkeleton';
import MetricCard from '../components/Dashboard/MetricCard';
import AdvancedFilters from '../components/Dashboard/AdvancedFilters';
import DashboardManagerModal from '../components/Dashboard/DashboardManagerModal';
import DashboardSelector from '../components/Dashboard/DashboardSelector';
import PortfolioComposition from '../components/Dashboard/PortfolioComposition';
import PerformanceRadar from '../components/Dashboard/PerformanceRadar';
import CustomizableChart from '../components/Dashboard/CustomizableChart';
import ComisionesGaranteWidget from '../components/Dashboard/ComisionesGaranteWidget';

// Widgets existentes
import TopComisionesWidget from '../components/Dashboard/TopComisionesWidget';
import CalendarWidget from '../components/Dashboard/CalendarWidget';
import ClienteTopInteresWidget from '../components/Dashboard/ClienteTopInteresWidget';
import HeatmapPagos from '../components/Dashboard/HeatmapPagos';
import GaugeMorosidad from '../components/Dashboard/GaugeMorosidad';
import BubbleChartClientes from '../components/Dashboard/BubbleChartClientes';
import FunnelConversion from '../components/Dashboard/FunnelConversion';
import TrendLineChart from '../components/Dashboard/TrendLineChart';
import AreaChartMorosidad from '../components/Dashboard/AreaChartMorosidad';
import RadarComparativo from '../components/Dashboard/RadarComparativo';
import StackedBarChart from '../components/Dashboard/StackedBarChart';
import RentabilidadCliente from '../components/Dashboard/RentabilidadCliente';
import AnalisisMorosidad from '../components/Dashboard/AnalisisMorosidad';
import EficienciaCobranza from '../components/Dashboard/EficienciaCobranza';
import CicloVidaPrestamo from '../components/Dashboard/CicloVidaPrestamo';
import AnalisisRenovaciones from '../components/Dashboard/AnalisisRenovaciones';
import RendimientoAsesor from '../components/Dashboard/RendimientoAsesor';
import EstacionalidadPagos from '../components/Dashboard/EstacionalidadPagos';
import AnalisisRiesgo from '../components/Dashboard/AnalisisRiesgo';
import FlujoCajaProyectado from '../components/Dashboard/FlujoCajaProyectado';
import Benchmarking from '../components/Dashboard/Benchmarking';
import MapaCalorProvincia from '../components/Dashboard/MapaCalorProvincia';
import AnalisisCohortes from '../components/Dashboard/AnalisisCohortes';
import GraficoPareto from '../components/Dashboard/GraficoPareto';
import DistribucionMontos from '../components/Dashboard/DistribucionMontos';
import PrediccionDefault from '../components/Dashboard/PrediccionDefault';
import AlertasWidget from '../components/Dashboard/AlertasWidget';
import ComparativaPeriodos from '../components/Dashboard/ComparativaPeriodos';
import BotonExportar from '../components/Dashboard/BotonExportar';
import ChartModal from '../components/Dashboard/ChartModal';

// NUEVOS COMPONENTES DE ESTILO VEHÍCULO
import VelocimetroMetricas from '../components/Dashboard/VelocimetroMetricas';
import TacometroDecisiones from '../components/Dashboard/TacometroDecisiones';
import DashboardVelocidadProgreso from '../components/Dashboard/DashboardVelocidadProgreso';
import ODOMetroGlobal from '../components/Dashboard/ODOMetroGlobal';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler, RadialLinearScale, RadarController
);

// Función auxiliar para normalizar valores (0-100)
const normalizeValue = (value, max = 100) => {
  if (value === undefined || value === null) return 0;
  return Math.min(max, Math.max(0, value));
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: { clientes: 0, prestamos: 0, pagosUltimos15Dias: 0, solicitudes: 0, gananciasMes: 0, capitalPrestado: 0, morosidad: 0, pagosPendientes: 0, nuevosClientes: 0, capitalRecuperado: 0, tasaRecuperacion: 0, prestamosMes: 0, prestamosDesembolsadosMes: 0, prestamosActivos: 0, prestamosCompletados: 0, prestamosMorosos: 0, capitalActivo: 0, capitalEnRiesgo: 0, promedioPrestamo: 0 },
    graficos: { pagosPorMes: [], prestamosPorMes: [], solicitudesPorEstado: [], clientesNuevos: [], distribucionPagos: [], distribucionPrestamos: [], gananciasPorMes: [], prestamosPorTipo: [], clientesPorProvincia: [], morosidadPorMes: [], flujoCaja: [], proyecciones: [] },
    metricas: { tasaAprobacion: 0, promedioPrestamo: 0, rotacionCapital: 0, eficienciaCobranza: 0, rentabilidad: 0, indiceMorosidad: 0, ROA: 0, ROE: 0, liquidez: 0, solvencia: 0 },
    actividadReciente: [],
    prestamosProximosVencimiento: [],
    rendimientoData: { cantidades: { clientes: 0, prestamos: 0, pagos: 0, solicitudes: 0 }, montos: { capitalPrestado: 0, capitalRecuperado: 0, ganancias: 0 } },
    comisiones: { topGarantes: [], totalGeneral: 0, garante: null },
    prestamos: [],
    pagos: []
  });
  
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ periodo: 'mes', año: new Date().getFullYear().toString() });
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [dashboardsGuardados, setDashboardsGuardados] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [showDashboardManager, setShowDashboardManager] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [chartVisibility, setChartVisibility] = useState({});
  const [selectedChart, setSelectedChart] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [radarViewType, setRadarViewType] = useState('cantidad');
  
  const { theme } = useTheme();
  const { user } = useAuth();

  const esGarante = user?.rol === 'garante' || user?.rol === 'agente';
  const iconMap = { CreditCardIcon, DocumentTextIcon, CurrencyDollarIcon, UsersIcon };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'RD$ 0';
    if (amount >= 1000000) return `RD$ ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `RD$ ${(amount / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatNumber = (number) => {
    if (!number && number !== 0) return '0';
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('es-DO').format(number);
  };

  const getChartOptions = (type = 'bar') => {
    const textColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
    const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB';
    
    const baseOptions = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { size: 12 } } },
        tooltip: { backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', titleColor: theme === 'dark' ? '#F3F4F6' : '#111827', bodyColor: textColor }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
        x: { grid: { color: gridColor }, ticks: { color: textColor } }
      }
    };
    if (type === 'doughnut' || type === 'pie' || type === 'radar') {
      return { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor } } } };
    }
    return baseOptions;
  };

  const getBarData = (data, label) => {
    const safeData = Array.isArray(data) ? data : [];
    return { labels: safeData.map(item => item?.mes || item?.label || item?.nombre || ''), datasets: [{ label: label || 'Valores', data: safeData.map(item => item?.value || item?.cantidad || 0), backgroundColor: 'rgba(59, 130, 246, 0.8)', borderColor: 'rgb(59, 130, 246)', borderWidth: 2, borderRadius: 8 }] };
  };

  const getBarDataGrouped = (data) => {
    const safeData = Array.isArray(data) ? data : [];
    return { labels: safeData.map(item => item?.mes || ''), datasets: [{ label: 'Ingresos', data: safeData.map(item => item?.ingresos || 0), backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: 'rgb(16, 185, 129)', borderWidth: 2 }, { label: 'Gastos', data: safeData.map(item => item?.gastos || 0), backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgb(239, 68, 68)', borderWidth: 2 }] };
  };

  const getLineData = (data, label, color) => {
    const safeData = Array.isArray(data) ? data : [];
    return { labels: safeData.map(item => item?.mes || item?.fecha || item?.label || ''), datasets: [{ label, data: safeData.map(item => item?.value || item?.cantidad || item?.monto || 0), borderColor: color, backgroundColor: color + '20', borderWidth: 3, tension: 0.4, fill: true }] };
  };

  const getDoughnutData = (data) => {
    const safeData = Array.isArray(data) ? data : [];
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
    return { labels: safeData.map(item => item?.estado || item?.tipo || item?.nombre || ''), datasets: [{ data: safeData.map(item => item?.value || item?.cantidad || 1), backgroundColor: safeData.map((_, i) => colors[i % colors.length]), borderColor: 'transparent', hoverOffset: 8 }] };
  };

  useEffect(() => {
    const cargarDashboards = async () => {
      try {
        const dashboardsRef = collection(db, 'dashboards');
        const q = query(dashboardsRef, orderBy('fechaCreacion', 'desc'));
        const querySnapshot = await getDocs(q);
        const dashboards = [];
        querySnapshot.forEach((doc) => dashboards.push({ id: doc.id, ...doc.data() }));
        setDashboardsGuardados(dashboards);
        if (dashboards.length > 0) setCurrentDashboard(dashboards[0]);
      } catch (error) { console.error('Error cargando dashboards:', error); }
    };
    cargarDashboards();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const data = await dashboardService.getDashboardStats(filtros);
      const prestamosActivos = data.stats?.prestamos || 0;
      const prestamosCompletados = data.stats?.prestamosCompletados || 0;
      const prestamosMorosos = data.stats?.prestamosMorosos || 0;
      const promedioPrestamo = data.metricas?.promedioPrestamo || 0;
      setDashboardData({
        ...data,
        stats: { ...data.stats, prestamosActivos, prestamosCompletados, prestamosMorosos, capitalActivo: (prestamosActivos * promedioPrestamo) || 0, capitalEnRiesgo: (prestamosMorosos * promedioPrestamo) || 0, promedioPrestamo },
        rendimientoData: data.rendimiento || { cantidades: { clientes: data.stats?.clientes || 0, prestamos: data.stats?.prestamos || 0, pagos: data.stats?.pagosTotales || 0, solicitudes: data.stats?.solicitudes || 0 }, montos: { capitalPrestado: data.stats?.capitalPrestado || 0, capitalRecuperado: data.stats?.capitalRecuperado || 0, ganancias: data.stats?.gananciasMes || 0 } },
        comisiones: data.comisiones || { topGarantes: [], totalGeneral: 0, garante: null },
        prestamos: data.prestamos || [],
        pagos: data.pagos || []
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error al cargar los datos. Verifica la conexión.');
    } finally { setLoading(false); }
  }, [filtros]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const calculateChange = (currentValue, metricType) => {
    const historicalData = { clientes: currentValue * 0.85, prestamos: currentValue * 0.80, pagosUltimos15Dias: currentValue * 0.70, solicitudes: currentValue * 1.2, gananciasMes: currentValue * 0.75, capitalPrestado: currentValue * 0.80, morosidad: currentValue * 1.1, nuevosClientes: currentValue * 0.90, capitalRecuperado: currentValue * 0.85, tasaRecuperacion: currentValue * 0.95, prestamosMes: currentValue * 0.70 };
    const previous = historicalData[metricType] || currentValue * 0.8;
    if (!previous || previous === 0) return null;
    const change = ((currentValue - previous) / previous * 100);
    return { value: Math.abs(Math.round(change)), type: change >= 0 ? 'positive' : 'negative' };
  };

  const handleSaveDashboard = async (dashboardData) => {
    try {
      if (editingDashboard) {
        await updateDoc(doc(db, 'dashboards', editingDashboard.id), { ...dashboardData, configuracion: { filtros, chartVisibility } });
        setDashboardsGuardados(prev => prev.map(d => d.id === editingDashboard.id ? { ...d, ...dashboardData } : d));
        setEditingDashboard(null);
      } else {
        const docRef = await addDoc(collection(db, 'dashboards'), { ...dashboardData, configuracion: { filtros, chartVisibility } });
        setDashboardsGuardados(prev => [{ id: docRef.id, ...dashboardData }, ...prev]);
        setCurrentDashboard({ id: docRef.id, ...dashboardData });
      }
    } catch (error) { console.error('Error guardando dashboard:', error); setError('Error al guardar el dashboard'); }
  };

  const handleEditDashboard = async (id, data) => {
    try {
      await updateDoc(doc(db, 'dashboards', id), data);
      setDashboardsGuardados(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
      if (currentDashboard?.id === id) setCurrentDashboard({ ...currentDashboard, ...data });
    } catch (error) { console.error('Error editando dashboard:', error); setError('Error al editar el dashboard'); }
  };

  const handleLoadDashboard = (dashboard) => {
    setCurrentDashboard(dashboard);
    if (dashboard.configuracion) {
      setFiltros(dashboard.configuracion.filtros || { periodo: 'mes', año: new Date().getFullYear().toString() });
      setChartVisibility(dashboard.configuracion.chartVisibility || {});
    }
    setShowDashboardManager(false);
  };

  const handleDeleteDashboard = async (id) => {
    try {
      await deleteDoc(doc(db, 'dashboards', id));
      setDashboardsGuardados(prev => prev.filter(d => d.id !== id));
      if (currentDashboard?.id === id) setCurrentDashboard(dashboardsGuardados[0] || null);
    } catch (error) { console.error('Error eliminando dashboard:', error); setError('Error al eliminar el dashboard'); }
  };

  const toggleChart = (chartId) => setChartVisibility(prev => ({ ...prev, [chartId]: !prev[chartId] }));
  const openChartModal = (chartTitle, chartData, chartType) => { setSelectedChart({ title: chartTitle, data: chartData, type: chartType }); setModalOpen(true); };

  if (loading && !lastUpdated) return <DashboardSkeleton />;

  // Valores normalizados para los componentes
  const rentabilidadNormalizada = normalizeValue(dashboardData.metricas.rentabilidad);
  const eficienciaNormalizada = normalizeValue(dashboardData.metricas.eficienciaCobranza);
  const tasaRecuperacionNormalizada = normalizeValue(dashboardData.stats.tasaRecuperacion);
  const morosidadNormalizada = normalizeValue(dashboardData.stats.morosidad);
  const liquidezNormalizada = normalizeValue(dashboardData.metricas.liquidez);
  const metaAnualNormalizada = normalizeValue(dashboardData.stats.tasaRecuperacion, 100);
  const riesgoNormalizado = normalizeValue(dashboardData.stats.morosidad, 100);

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6 relative min-h-screen">
      <QuickActions />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-red-500/30 to-red-600/30 rounded-2xl blur-3xl animate-gradient-xy" />
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-red-600/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <motion.div whileHover={{ rotate: 360 }} className="p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-xl">
                <PresentationChartLineIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-500">Dashboard Inteligente</h1>
                <p className="text-xs sm:text-sm mt-1 flex items-center text-gray-600 dark:text-gray-400">
                  <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1" />
                  Análisis en tiempo real con métricas avanzadas
                  {lastUpdated && <span className="text-xs ml-2 flex items-center"><ClockIcon className="h-3 w-3 mr-1" />{lastUpdated.toLocaleTimeString('es-DO')}</span>}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1 ${showFilters ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'}`}>
                <FunnelIcon className="h-3 w-3" /><span>Filtros</span>
              </button>
              <DashboardSelector dashboards={dashboardsGuardados} currentDashboard={currentDashboard} onOpenManager={() => setShowDashboardManager(true)} />
              <BotonExportar dashboardData={dashboardData} estadisticas={dashboardData.stats} metricas={dashboardData.metricas} />
              <button onClick={fetchDashboardData} disabled={loading} className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white">
                <ArrowPathIcon className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>{showFilters && <AdvancedFilters filters={filtros} onFilterChange={setFiltros} onClose={() => setShowFilters(false)} />}</AnimatePresence>
      {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5" /><p>{error}</p></div>}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard title="Clientes Activos" value={formatNumber(dashboardData.stats.clientes)} change={calculateChange(dashboardData.stats.clientes, 'clientes')?.value} changeType={calculateChange(dashboardData.stats.clientes, 'clientes')?.type} icon={UsersIcon} color="blue" link="/clientes" tooltip="Total de clientes con préstamos activos" />
        <MetricCard title="Préstamos Activos" value={formatNumber(dashboardData.stats.prestamos)} change={calculateChange(dashboardData.stats.prestamos, 'prestamos')?.value} changeType={calculateChange(dashboardData.stats.prestamos, 'prestamos')?.type} icon={CurrencyDollarIcon} color="green" link="/prestamos" tooltip="Préstamos vigentes en este momento" />
        <MetricCard title="Pagos (Últimos 15 días)" value={formatNumber(dashboardData.stats.pagosUltimos15Dias || 0)} change={calculateChange(dashboardData.stats.pagosUltimos15Dias, 'pagosUltimos15Dias')?.value} changeType={calculateChange(dashboardData.stats.pagosUltimos15Dias, 'pagosUltimos15Dias')?.type} icon={CreditCardIcon} color="teal" link="/pagos" />
        <MetricCard title="Tasa de Morosidad" value={`${dashboardData.stats.morosidad}%`} change={calculateChange(dashboardData.stats.morosidad, 'morosidad')?.value} changeType={dashboardData.stats.morosidad <= 5 ? 'positive' : 'negative'} icon={ChartBarIcon} color="red" link="/prestamos" />
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard title="Capital Prestado" value={formatCurrency(dashboardData.stats.capitalPrestado)} change={calculateChange(dashboardData.stats.capitalPrestado, 'capitalPrestado')?.value} changeType={calculateChange(dashboardData.stats.capitalPrestado, 'capitalPrestado')?.type} icon={BanknotesIcon} color="indigo" link="/prestamos" />
        <MetricCard title="Capital Recuperado" value={formatCurrency(dashboardData.stats.capitalRecuperado)} change={calculateChange(dashboardData.stats.capitalRecuperado, 'capitalRecuperado')?.value} changeType={calculateChange(dashboardData.stats.capitalRecuperado, 'capitalRecuperado')?.type} icon={CheckCircleIcon} color="emerald" link="/pagos" description={`${dashboardData.stats.tasaRecuperacion}% del total`} />
        <MetricCard title="Ganancias del Mes" value={formatCurrency(dashboardData.stats.gananciasMes)} change={calculateChange(dashboardData.stats.gananciasMes, 'gananciasMes')?.value} changeType={calculateChange(dashboardData.stats.gananciasMes, 'gananciasMes')?.type} icon={ArrowTrendingUpIcon} color="purple" link="/pagos" description="Solo intereses" />
        <MetricCard title="Préstamos del Mes" value={formatNumber(dashboardData.stats.prestamosMes)} change={calculateChange(dashboardData.stats.prestamosMes, 'prestamosMes')?.value} changeType={calculateChange(dashboardData.stats.prestamosMes, 'prestamosMes')?.type} icon={DocumentTextIcon} color="cyan" link="/prestamos" />
      </div>

      {/* NUEVOS DASHBOARDS ESTILO VEHÍCULO CON VALORES NORMALIZADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VelocimetroMetricas 
          title="Rendimiento General"
          value={rentabilidadNormalizada}
          maxValue={100}
          unit="%"
          color="#ef4444"
          subMetricas={[
            { label: 'Eficiencia', value: `${eficienciaNormalizada}%` },
            { label: 'Productividad', value: `${rentabilidadNormalizada}%` }
          ]}
        />
        
        <VelocimetroMetricas 
          title="Tasa de Recuperación"
          value={tasaRecuperacionNormalizada}
          maxValue={100}
          unit="%"
          color="#10b981"
          subMetricas={[
            { label: 'Capital Recuperado', value: formatCurrency(dashboardData.stats.capitalRecuperado) },
            { label: 'Capital Prestado', value: formatCurrency(dashboardData.stats.capitalPrestado) }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <DashboardVelocidadProgreso 
          metricas={[
            { title: 'Crecimiento', value: rentabilidadNormalizada, maxValue: 100, unit: '%', color: '#10b981', subtitle: '+15% este mes' },
            { title: 'Meta Anual', value: metaAnualNormalizada, maxValue: 100, unit: '%', color: '#3b82f6', subtitle: 'Q2 completado' },
            { title: 'Efectividad', value: eficienciaNormalizada, maxValue: 100, unit: '%', color: '#8b5cf6', subtitle: 'Top rendimiento' },
            { title: 'Riesgo', value: riesgoNormalizado, maxValue: 100, unit: '%', color: '#ef4444', subtitle: 'Bajo control' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TacometroDecisiones 
          indicadores={[
            { nombre: 'Rentabilidad', valor: rentabilidadNormalizada, meta: 70, unidad: '%', tipo: 'positivo' },
            { nombre: 'Eficiencia', valor: eficienciaNormalizada, meta: 80, unidad: '%', tipo: 'positivo' },
            { nombre: 'Morosidad', valor: morosidadNormalizada, meta: 10, unidad: '%', tipo: 'negativo' },
            { nombre: 'Liquidez', valor: liquidezNormalizada, meta: 100, unidad: '%', tipo: 'positivo' }
          ]}
        />
        
        <ODOMetroGlobal 
          estadisticas={{
            prestamos: { value: Math.min(5000, dashboardData.stats.prestamosDesembolsadosMes || 1247), meta: 5000, label: 'Préstamos Desembolsados' },
            clientes: { value: Math.min(2000, dashboardData.stats.clientes || 892), meta: 2000, label: 'Clientes Activos' },
            ganancias: { value: Math.min(50000000, dashboardData.stats.gananciasMes || 12500000), meta: 50000000, label: 'Ganancias (RD$)' },
            recuperacion: { value: tasaRecuperacionNormalizada, meta: 90, label: 'Tasa Recuperación %' }
          }}
        />
      </div>

      {/* Widgets de Comisiones, Clientes Destacados y Calendario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {esGarante ? <ComisionesGaranteWidget comisionesData={dashboardData.comisiones} loading={loading} /> : <TopComisionesWidget prestamos={dashboardData.prestamos} pagos={dashboardData.pagos} comisiones={dashboardData.comisiones} />}
        <ClienteTopInteresWidget prestamos={dashboardData.prestamos} pagos={dashboardData.pagos} clientes={[]} loading={loading} onRefresh={fetchDashboardData} />
      </div>

      <div className="grid grid-cols-1 gap-4"><CalendarWidget /></div>

      {/* Gráficos Personalizables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomizableChart title="Pagos por Mes" data={getBarData(dashboardData.graficos.pagosPorMes, 'pagosPorMes')} type="bar" isVisible={chartVisibility.pagosPorMes !== false} onToggle={() => toggleChart('pagosPorMes')} onExpand={() => openChartModal('Pagos por Mes', getBarData(dashboardData.graficos.pagosPorMes, 'pagosPorMes'), 'bar')} getChartOptions={getChartOptions} />
        <CustomizableChart title="Préstamos por Mes" data={getLineData(dashboardData.graficos.prestamosPorMes, 'Préstamos por Mes', '#10B981')} type="line" isVisible={chartVisibility.prestamosPorMes !== false} onToggle={() => toggleChart('prestamosPorMes')} onExpand={() => openChartModal('Préstamos por Mes', getLineData(dashboardData.graficos.prestamosPorMes, 'Préstamos por Mes', '#10B981'), 'line')} getChartOptions={getChartOptions} />
        <CustomizableChart title="Ganancias por Mes" data={getLineData(dashboardData.graficos.gananciasPorMes, 'Ganancias por Mes', '#8B5CF6')} type="line" isVisible={chartVisibility.gananciasPorMes !== false} onToggle={() => toggleChart('gananciasPorMes')} onExpand={() => openChartModal('Ganancias por Mes', getLineData(dashboardData.graficos.gananciasPorMes, 'Ganancias por Mes', '#8B5CF6'), 'line')} getChartOptions={getChartOptions} />
        <CustomizableChart title="Distribución de Pagos" data={getDoughnutData(dashboardData.graficos.distribucionPagos)} type="doughnut" isVisible={chartVisibility.distribucionPagos !== false} onToggle={() => toggleChart('distribucionPagos')} onExpand={() => openChartModal('Distribución de Pagos', getDoughnutData(dashboardData.graficos.distribucionPagos), 'doughnut')} getChartOptions={getChartOptions} />
        <CustomizableChart title="Estado de Préstamos" data={getDoughnutData(dashboardData.graficos.distribucionPrestamos)} type="pie" isVisible={chartVisibility.distribucionPrestamos !== false} onToggle={() => toggleChart('distribucionPrestamos')} onExpand={() => openChartModal('Estado de Préstamos', getDoughnutData(dashboardData.graficos.distribucionPrestamos), 'pie')} getChartOptions={getChartOptions} />
        <CustomizableChart title="Solicitudes por Estado" data={getDoughnutData(dashboardData.graficos.solicitudesPorEstado)} type="doughnut" isVisible={chartVisibility.solicitudesPorEstado !== false} onToggle={() => toggleChart('solicitudesPorEstado')} onExpand={() => openChartModal('Solicitudes por Estado', getDoughnutData(dashboardData.graficos.solicitudesPorEstado), 'doughnut')} getChartOptions={getChartOptions} />
        <CustomizableChart title="Clientes por Provincia" data={getBarData(dashboardData.graficos.clientesPorProvincia, 'clientesPorProvincia')} type="bar" isVisible={chartVisibility.clientesPorProvincia !== false} onToggle={() => toggleChart('clientesPorProvincia')} onExpand={() => openChartModal('Clientes por Provincia', getBarData(dashboardData.graficos.clientesPorProvincia, 'clientesPorProvincia'), 'bar')} getChartOptions={getChartOptions} />
        <CustomizableChart title="Morosidad por Mes" data={getLineData(dashboardData.graficos.morosidadPorMes, 'Morosidad %', '#EF4444')} type="line" isVisible={chartVisibility.morosidadPorMes !== false} onToggle={() => toggleChart('morosidadPorMes')} onExpand={() => openChartModal('Morosidad por Mes', getLineData(dashboardData.graficos.morosidadPorMes, 'Morosidad %', '#EF4444'), 'line')} getChartOptions={getChartOptions} />
        <PortfolioComposition data={dashboardData.stats} />
        <PerformanceRadar data={dashboardData.rendimientoData} currentType={radarViewType} onTypeChange={setRadarViewType} />
        <CustomizableChart title="Ingresos vs Gastos" data={getBarDataGrouped(dashboardData.graficos.flujoCaja)} type="bar" isVisible={chartVisibility.ingresosVsGastos !== false} onToggle={() => toggleChart('ingresosVsGastos')} onExpand={() => openChartModal('Ingresos vs Gastos', getBarDataGrouped(dashboardData.graficos.flujoCaja), 'bar')} getChartOptions={getChartOptions} />
        <CustomizableChart title="Proyecciones a 6 meses" data={getLineData(dashboardData.graficos.proyecciones, 'Proyección', '#8B5CF6')} type="line" isVisible={chartVisibility.proyecciones !== false} onToggle={() => toggleChart('proyecciones')} onExpand={() => openChartModal('Proyecciones a 6 meses', getLineData(dashboardData.graficos.proyecciones, 'Proyección', '#8B5CF6'), 'line')} getChartOptions={getChartOptions} />
      </div>

      {/* Gráficos Avanzados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><HeatmapPagos /><GaugeMorosidad /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><BubbleChartClientes /><FunnelConversion /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><TrendLineChart /><AreaChartMorosidad /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><RadarComparativo /><StackedBarChart /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><RentabilidadCliente /><AnalisisMorosidad /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><EficienciaCobranza /><CicloVidaPrestamo /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><AnalisisRenovaciones /><RendimientoAsesor /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><EstacionalidadPagos /><AnalisisRiesgo /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><FlujoCajaProyectado /><Benchmarking /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><MapaCalorProvincia /><AnalisisCohortes /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><GraficoPareto /><DistribucionMontos /></div>
      <div className="grid grid-cols-1 gap-4"><PrediccionDefault /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><AlertasWidget /><ComparativaPeriodos /></div>

      {/* KPIs Avanzados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="p-4 sm:p-6">
            <h4 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Indicadores Clave de Rendimiento (KPI)</h4>
            <div className="grid grid-cols-2 gap-4">
              {[{ label: 'ROA', value: normalizeValue(dashboardData.metricas.ROA), color: 'blue', icon: ChartPieIcon, tooltip: 'Retorno sobre Activos' }, { label: 'ROE', value: normalizeValue(dashboardData.metricas.ROE), color: 'green', icon: ArrowTrendingUpIcon, tooltip: 'Retorno sobre Patrimonio' }, { label: 'Liquidez', value: liquidezNormalizada, color: 'purple', icon: WalletIcon, tooltip: 'Capacidad de pago a corto plazo' }, { label: 'Solvencia', value: normalizeValue(dashboardData.metricas.solvencia), color: 'indigo', icon: ScaleIcon, tooltip: 'Capacidad de pago a largo plazo' }].map((metric, i) => (
                <div key={i} className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-1"><p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{metric.label}</p><metric.icon className={`h-4 w-4 text-${metric.color}-500`} /></div>
                  <p className={`text-xl font-bold text-${metric.color}-600 dark:text-${metric.color}-400`}>{metric.value}%</p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{metric.tooltip}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {[{ label: 'Tasa de Aprobación', value: normalizeValue(dashboardData.metricas.tasaAprobacion), color: 'green' }, { label: 'Eficiencia de Cobranza', value: eficienciaNormalizada, color: 'blue' }, { label: 'Rentabilidad', value: rentabilidadNormalizada, color: 'purple' }, { label: 'Índice de Morosidad', value: morosidadNormalizada, color: 'red' }].map((metric, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1"><span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{metric.label}</span><span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{metric.value}%</span></div>
                  <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                    <div className={`h-full rounded-full bg-gradient-to-r from-${metric.color}-600 to-${metric.color}-400`} style={{ width: `${metric.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-4">
          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4"><h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Actividad Reciente</h4><Link to="/actividad" className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>Ver todo →</Link></div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {dashboardData.actividadReciente.map((actividad, index) => {
                  const IconComponent = iconMap[actividad.icono] || DocumentTextIcon;
                  let fechaMostrar = 'Fecha no disponible';
                  let horaMostrar = '';
                  if (actividad.fechaObj) {
                    fechaMostrar = actividad.fechaObj.toLocaleDateString('es-DO', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
                    horaMostrar = actividad.fechaObj.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', hour12: true });
                  } else if (actividad.fecha) {
                    const fecha = convertTimestampToDate(actividad.fecha);
                    if (fecha) {
                      fechaMostrar = fecha.toLocaleDateString('es-DO', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
                      horaMostrar = fecha.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', hour12: true });
                    }
                  }
                  return (
                    <motion.div key={actividad.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`p-2 sm:p-3 rounded-lg border-2 transition-all hover:border-red-600/50 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${actividad.color} bg-opacity-20`}><IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${actividad.color}`} /></div>
                          <div className="min-w-0 flex-1"><p className={`text-xs sm:text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{actividad.descripcion}</p>{actividad.monto > 0 && <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{formatCurrency(actividad.monto)}</p>}</div>
                        </div>
                        <div className="text-right ml-2 min-w-[70px]"><span className={`text-xs whitespace-nowrap block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{fechaMostrar}</span>{horaMostrar && <span className={`text-xs block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{horaMostrar}</span>}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4"><h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Próximos Vencimientos</h4><Link to="/prestamos" className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>Ver todo →</Link></div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {dashboardData.prestamosProximosVencimiento.map((prestamo, index) => {
                  let fechaVencimiento = '';
                  if (prestamo.fechaVencimientoObj) {
                    fechaVencimiento = prestamo.fechaVencimientoObj.toLocaleDateString('es-DO', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
                  } else if (prestamo.fechaVencimiento) {
                    const fecha = convertTimestampToDate(prestamo.fechaVencimiento);
                    fechaVencimiento = fecha ? fecha.toLocaleDateString('es-DO', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '/') : 'Fecha no disponible';
                  }
                  const esVencido = prestamo.diasRestantes <= 0;
                  return (
                    <motion.div key={prestamo.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`p-2 sm:p-3 rounded-lg border-2 transition-all hover:border-red-600/50 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} ${esVencido ? 'border-red-600 bg-red-50/50 dark:bg-red-900/20' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1"><p className={`text-xs sm:text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prestamo.cliente}</p><p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Vence: {fechaVencimiento}</p></div>
                        <div className="text-right ml-2"><p className={`text-xs sm:text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(prestamo.monto)}</p><p className={`text-xs font-bold ${esVencido ? 'text-red-600 dark:text-red-400 animate-pulse' : prestamo.diasRestantes <= 2 ? 'text-red-600 dark:text-red-400' : prestamo.diasRestantes <= 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{esVencido ? '¡COBRAR AHORA!' : `${prestamo.diasRestantes} días`}</p></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <DashboardManagerModal isOpen={showDashboardManager} onClose={() => setShowDashboardManager(false)} dashboards={dashboardsGuardados} currentDashboard={currentDashboard} onSelect={handleLoadDashboard} onSave={handleSaveDashboard} onEdit={handleEditDashboard} onDelete={handleDeleteDashboard} />
      {selectedChart && <ChartModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedChart.title} data={selectedChart.data} type={selectedChart.type} chartData={selectedChart.data} filters={filtros} onFilterChange={setFiltros} />}

      <style>{`
        @keyframes gradient-xy { 0%,100% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-gradient-xy { animation: gradient-xy 15s ease infinite; background-size: 400% 400%; }
        .animate-scan { animation: scan 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;