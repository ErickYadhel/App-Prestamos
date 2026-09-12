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
  TableCellsIcon,
  StarIcon,
  ListBulletIcon,
  ChartBarSquareIcon,
  CalendarDaysIcon,
  SunIcon,
  MoonIcon,
  BoltIcon
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
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line, Doughnut, PolarArea } from 'react-chartjs-2';

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
  Filler,
  RadialLinearScale
);

// ============================================
// 🔥 FUNCIÓN PARA CONVERTIR DD-MM-YYYY A DATE
// ============================================
const parseFechaDDMMYYYY = (fechaStr) => {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return fechaStr;
  
  if (typeof fechaStr === 'string' && fechaStr.includes('-')) {
    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
  }
  
  if (fechaStr && typeof fechaStr === 'object') {
    if (fechaStr._seconds !== undefined) {
      return new Date(fechaStr._seconds * 1000);
    }
    if (fechaStr.seconds !== undefined) {
      return new Date(fechaStr.seconds * 1000);
    }
    if (fechaStr.toDate) {
      return fechaStr.toDate();
    }
  }
  
  const date = new Date(fechaStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
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
      className={`rounded-2xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800/80 backdrop-blur-lg' 
          : 'bg-white shadow-lg shadow-gray-200/50'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE STATS CARD MEJORADO
// ============================================
const StatsCard = ({ icon: Icon, label, value, color, subValue, change, tooltip, badge, trend, detail }) => {
  const { theme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    emerald: 'from-emerald-500 to-emerald-700',
    cyan: 'from-cyan-500 to-cyan-700',
    rose: 'from-rose-500 to-rose-700',
    amber: 'from-amber-500 to-amber-700',
    lime: 'from-lime-500 to-lime-700'
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden rounded-xl p-3 sm:p-4 border-2 hover:border-red-600/40 transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg cursor-pointer`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} ${
        theme === 'dark' ? 'opacity-10' : 'opacity-5'
      } rounded-full -mr-8 -mt-8 transition-all duration-500 ${isHovered ? 'scale-150 opacity-20' : ''}`} />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className={`text-[10px] sm:text-xs font-medium truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
            {badge && (
              <span className={`ml-1 px-1.5 py-0.5 text-[8px] font-bold rounded-full ${badge.color || 'bg-red-600'} text-white`}>
                {badge.text}
              </span>
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
          {detail && (
            <p className={`text-[9px] truncate ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} mt-0.5`}>
              {detail}
            </p>
          )}
          {trend && (
            <p className={`text-[10px] mt-0.5 flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowTrendingUpIcon className="h-3 w-3 mr-0.5" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-0.5" />}
              {Math.abs(trend)}% {trend > 0 ? '↑' : '↓'}
            </p>
          )}
          {change && (
            <div className="mt-1 flex items-center space-x-1">
              <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${
                change > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${gradientColors[color]} shadow-lg ml-2 flex-shrink-0 transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {showTooltip && tooltip && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 text-xs bg-gray-900 text-white rounded-lg whitespace-nowrap z-50 shadow-xl max-w-xs">
          {tooltip}
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SECCIÓN DESPLEGABLE GLOBAL
// ============================================
const StatsCardsContainer = ({ children, title, icon: Icon, isOpen, onToggle, badge, subtitle }) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-2xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${
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
          <div>
            <h3 className={`text-sm sm:text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {title}
            </h3>
            {subtitle && (
              <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {badge && (
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${badge.color} ${badge.textColor}`}>
              {badge.text}
            </span>
          )}
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
// SECCIÓN DE GANANCIAS POR PERÍODO (NUEVA)
// ============================================
const GananciasSection = ({ comisiones, theme }) => {
  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const formatearMontoCorto = (valor) => {
    if (!valor && valor !== 0) return 'RD$ 0';
    if (valor >= 1000000) return `RD$ ${(valor / 1000000).toFixed(2)}M`;
    if (valor >= 1000) return `RD$ ${(valor / 1000).toFixed(1)}K`;
    return `RD$ ${valor.toLocaleString()}`;
  };

  // 🔥 CALCULAR PERÍODOS
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();
  const dia = hoy.getDate();

  // Hoy
  const inicioHoy = new Date(año, mes, dia);
  inicioHoy.setHours(0, 0, 0, 0);

  // Ayer
  const inicioAyer = new Date(año, mes, dia - 1);
  inicioAyer.setHours(0, 0, 0, 0);
  const finAyer = new Date(año, mes, dia);
  finAyer.setHours(0, 0, 0, 0);

  // Esta semana (Lunes a hoy)
  const diaSemana = hoy.getDay();
  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const inicioSemana = new Date(año, mes, dia - diasHastaLunes);
  inicioSemana.setHours(0, 0, 0, 0);

  // Semana pasada
  const inicioSemanaPasada = new Date(año, mes, dia - diasHastaLunes - 7);
  inicioSemanaPasada.setHours(0, 0, 0, 0);
  const finSemanaPasada = new Date(año, mes, dia - diasHastaLunes);
  finSemanaPasada.setHours(0, 0, 0, 0);

  // Quincena actual (1-15 o 16-fin de mes)
  let inicioQuincena, finQuincena;
  if (dia <= 15) {
    inicioQuincena = new Date(año, mes, 1);
    finQuincena = new Date(año, mes, 15, 23, 59, 59, 999);
  } else {
    inicioQuincena = new Date(año, mes, 16);
    finQuincena = new Date(año, mes + 1, 0, 23, 59, 59, 999);
  }
  inicioQuincena.setHours(0, 0, 0, 0);

  // Quincena anterior
  let inicioQuincenaAnterior, finQuincenaAnterior;
  if (dia <= 15) {
    inicioQuincenaAnterior = new Date(año, mes - 1, 16);
    finQuincenaAnterior = new Date(año, mes, 0, 23, 59, 59, 999);
  } else {
    inicioQuincenaAnterior = new Date(año, mes, 1);
    finQuincenaAnterior = new Date(año, mes, 15, 23, 59, 59, 999);
  }
  inicioQuincenaAnterior.setHours(0, 0, 0, 0);

  // Este mes
  const inicioMes = new Date(año, mes, 1);
  inicioMes.setHours(0, 0, 0, 0);

  // Mes anterior
  const inicioMesAnterior = new Date(año, mes - 1, 1);
  inicioMesAnterior.setHours(0, 0, 0, 0);
  const finMesAnterior = new Date(año, mes, 0, 23, 59, 59, 999);

  // Últimos 3 meses
  const inicio3Meses = new Date(año, mes - 2, 1);
  inicio3Meses.setHours(0, 0, 0, 0);

  // Últimos 6 meses
  const inicio6Meses = new Date(año, mes - 5, 1);
  inicio6Meses.setHours(0, 0, 0, 0);

  // Este año
  const inicioAño = new Date(año, 0, 1);
  inicioAño.setHours(0, 0, 0, 0);

  // 🔥 CALCULAR TOTALES POR PERÍODO
  const calcularTotal = (fechaInicio, fechaFin = null) => {
    return comisiones
      .filter(c => {
        const fecha = parseFechaDDMMYYYY(c.fechaPago);
        if (!fecha) return false;
        if (fechaFin) {
          return fecha >= fechaInicio && fecha <= fechaFin;
        }
        return fecha >= fechaInicio;
      })
      .reduce((sum, c) => sum + (c.montoComision || 0), 0);
  };

  const calcularCantidad = (fechaInicio, fechaFin = null) => {
    return comisiones.filter(c => {
      const fecha = parseFechaDDMMYYYY(c.fechaPago);
      if (!fecha) return false;
      if (fechaFin) {
        return fecha >= fechaInicio && fecha <= fechaFin;
      }
      return fecha >= fechaInicio;
    }).length;
  };

  const hoyTotal = calcularTotal(inicioHoy);
  const hoyCantidad = calcularCantidad(inicioHoy);
  const ayerTotal = calcularTotal(inicioAyer, finAyer);
  const ayerCantidad = calcularCantidad(inicioAyer, finAyer);
  const semanaTotal = calcularTotal(inicioSemana);
  const semanaCantidad = calcularCantidad(inicioSemana);
  const semanaAnteriorTotal = calcularTotal(inicioSemanaPasada, finSemanaPasada);
  const semanaAnteriorCantidad = calcularCantidad(inicioSemanaPasada, finSemanaPasada);
  const quincenaTotal = calcularTotal(inicioQuincena, finQuincena);
  const quincenaCantidad = calcularCantidad(inicioQuincena, finQuincena);
  const quincenaAnteriorTotal = calcularTotal(inicioQuincenaAnterior, finQuincenaAnterior);
  const quincenaAnteriorCantidad = calcularCantidad(inicioQuincenaAnterior, finQuincenaAnterior);
  const mesTotal = calcularTotal(inicioMes);
  const mesCantidad = calcularCantidad(inicioMes);
  const mesAnteriorTotal = calcularTotal(inicioMesAnterior, finMesAnterior);
  const mesAnteriorCantidad = calcularCantidad(inicioMesAnterior, finMesAnterior);
  const total3Meses = calcularTotal(inicio3Meses);
  const cantidad3Meses = calcularCantidad(inicio3Meses);
  const total6Meses = calcularTotal(inicio6Meses);
  const cantidad6Meses = calcularCantidad(inicio6Meses);
  const totalAño = calcularTotal(inicioAño);
  const cantidadAño = calcularCantidad(inicioAño);

  // 🔥 CALCULAR TENDENCIAS
  const calcularTendencia = (actual, anterior) => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
  };

  const tendenciaSemana = calcularTendencia(semanaTotal, semanaAnteriorTotal);
  const tendenciaQuincena = calcularTendencia(quincenaTotal, quincenaAnteriorTotal);
  const tendenciaMes = calcularTendencia(mesTotal, mesAnteriorTotal);
  const tendenciaDia = calcularTendencia(hoyTotal, ayerTotal);

  // Promedios
  const promedioDiaSemana = semanaCantidad > 0 ? semanaTotal / (diasHastaLunes + 1) : 0;
  const promedioDiaMes = mesCantidad > 0 ? mesTotal / dia : 0;
  const promedioPorComision = mesCantidad > 0 ? mesTotal / mesCantidad : 0;

  // Proyección mensual
  const proyeccionMensual = promedioDiaMes * new Date(año, mes + 1, 0).getDate();

  return (
    <div className="space-y-4">
      {/* ============================================ */}
      {/* FILA 1: PERÍODOS CORTOS (HOY, AYER, SEMANA, QUINCENA) */}
      {/* ============================================ */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <div className="p-1.5 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
            <BoltIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className={`text-sm sm:text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Ganancias por Período
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
            {comisiones.length} comisiones
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatsCard
            icon={SunIcon}
            label="Ganancias Hoy"
            value={formatearMontoCorto(hoyTotal)}
            subValue={`${hoyCantidad} comisiones`}
            color="amber"
            tooltip="Comisiones generadas hoy"
            trend={tendenciaDia !== 0 ? tendenciaDia : null}
            detail={`Ayer: ${formatearMontoCorto(ayerTotal)}`}
          />
          <StatsCard
            icon={MoonIcon}
            label="Ganancias Ayer"
            value={formatearMontoCorto(ayerTotal)}
            subValue={`${ayerCantidad} comisiones`}
            color="indigo"
            tooltip="Comisiones generadas ayer"
          />
          <StatsCard
            icon={CalendarDaysIcon}
            label="Esta Semana"
            value={formatearMontoCorto(semanaTotal)}
            subValue={`${semanaCantidad} comisiones`}
            color="cyan"
            tooltip="Comisiones de esta semana (lunes a hoy)"
            trend={tendenciaSemana !== 0 ? tendenciaSemana : null}
            detail={`Prom: ${formatearMontoCorto(promedioDiaSemana)}/día`}
          />
          <StatsCard
            icon={CalendarIcon}
            label={`Quincena Actual (${dia <= 15 ? '1-15' : '16-30'})`}
            value={formatearMontoCorto(quincenaTotal)}
            subValue={`${quincenaCantidad} comisiones`}
            color="lime"
            tooltip={`Comisiones de la quincena actual (${dia <= 15 ? 'días 1-15' : 'días 16 al final del mes'})`}
            trend={tendenciaQuincena !== 0 ? tendenciaQuincena : null}
            detail={`Anterior: ${formatearMontoCorto(quincenaAnteriorTotal)}`}
            badge={{ text: `Q${dia <= 15 ? '1' : '2'}`, color: 'bg-lime-600' }}
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* FILA 2: PERÍODOS MEDIOS (MES, 3 MESES, 6 MESES, AÑO) */}
      {/* ============================================ */}
      <div>
        <div className="flex items-center space-x-2 mb-3 mt-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
            <PresentationChartLineIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className={`text-sm sm:text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Análisis Temporal
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatsCard
            icon={CalendarIcon}
            label="Este Mes"
            value={formatearMontoCorto(mesTotal)}
            subValue={`${mesCantidad} comisiones`}
            color="red"
            tooltip="Comisiones del mes actual (Septiembre 2026)"
            trend={tendenciaMes !== 0 ? tendenciaMes : null}
            detail={`Prom: ${formatearMontoCorto(promedioDiaMes)}/día`}
            badge={{ text: 'Mes Actual', color: 'bg-red-600' }}
          />
          <StatsCard
            icon={CalendarIcon}
            label="Mes Anterior"
            value={formatearMontoCorto(mesAnteriorTotal)}
            subValue={`${mesAnteriorCantidad} comisiones`}
            color="rose"
            tooltip="Comisiones del mes anterior (Agosto 2026)"
          />
          <StatsCard
            icon={ChartBarIcon}
            label="Últimos 3 Meses"
            value={formatearMontoCorto(total3Meses)}
            subValue={`${cantidad3Meses} comisiones`}
            color="purple"
            tooltip="Comisiones de los últimos 3 meses (Julio, Agosto, Septiembre)"
            detail={`Prom: ${formatearMontoCorto(cantidad3Meses > 0 ? total3Meses / cantidad3Meses : 0)}/comisión`}
          />
          <StatsCard
            icon={ChartBarSquareIcon}
            label="Últimos 6 Meses"
            value={formatearMontoCorto(total6Meses)}
            subValue={`${cantidad6Meses} comisiones`}
            color="teal"
            tooltip="Comisiones de los últimos 6 meses"
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* FILA 3: PROYECCIONES Y PROMEDIOS */}
      {/* ============================================ */}
      <div>
        <div className="flex items-center space-x-2 mb-3 mt-2">
          <div className="p-1.5 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg">
            <ArrowTrendingUpIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className={`text-sm sm:text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Proyecciones y Promedios
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatsCard
            icon={RocketLaunchIcon}
            label="Proyección del Mes"
            value={formatearMontoCorto(proyeccionMensual)}
            subValue="Estimado fin de mes"
            color="emerald"
            tooltip="Proyección de comisiones para fin de mes basada en el promedio diario"
            detail={`Basado en ${dia} días`}
            badge={{ text: 'Proyección', color: 'bg-emerald-600' }}
          />
          <StatsCard
            icon={FireIcon}
            label="Promedio por Comisión"
            value={formatearMontoCorto(promedioPorComision)}
            subValue={`${mesCantidad} comisiones este mes`}
            color="orange"
            tooltip="Promedio de monto por comisión este mes"
          />
          <StatsCard
            icon={BanknotesIcon}
            label="Promedio Diario"
            value={formatearMontoCorto(promedioDiaMes)}
            subValue="Este mes"
            color="blue"
            tooltip="Promedio de comisiones generadas por día este mes"
          />
          <StatsCard
            icon={TrophyIcon}
            label="Total del Año"
            value={formatearMontoCorto(totalAño)}
            subValue={`${cantidadAño} comisiones`}
            color="purple"
            tooltip="Total de comisiones generadas en el año actual"
            detail={`Año ${año}`}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================
// DASHBOARD DE COMISIONES
// ============================================
const DashboardComisionesModal = ({ isOpen, onClose, comisiones, estadisticas }) => {
  const { theme } = useTheme();
  const [graficoView, setGraficoView] = useState('barras');

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

  const comisionesPorMes = comisiones.reduce((acc, com) => {
    if (!com.fechaPago) return acc;
    const fecha = parseFechaDDMMYYYY(com.fechaPago);
    if (!fecha) return acc;
    
    const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    const mesLabel = fecha.toLocaleDateString('es-DO', { year: 'numeric', month: 'short' });
    if (!acc[mesKey]) {
      acc[mesKey] = { label: mesLabel, total: 0, pagadas: 0, pendientes: 0, cantidad: 0 };
    }
    acc[mesKey].total += com.montoComision || 0;
    acc[mesKey].cantidad++;
    if (com.estado === 'pagada') acc[mesKey].pagadas += com.montoComision || 0;
    if (com.estado === 'pendiente') acc[mesKey].pendientes += com.montoComision || 0;
    return acc;
  }, {});

  const mesesOrdenados = Object.entries(comisionesPorMes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12);

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

  const barChartData = {
    labels: topGarantes.map(g => g.nombre.length > 15 ? g.nombre.substring(0, 15) + '...' : g.nombre),
    datasets: [
      {
        label: 'Total Comisiones',
        data: topGarantes.map(g => g.total),
        backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Pagadas',
        data: topGarantes.map(g => g.pagadas),
        backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.7)' : 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

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

  const polarData = {
    labels: topGarantes.slice(0, 6).map(g => g.nombre.length > 12 ? g.nombre.substring(0, 12) + '...' : g.nombre),
    datasets: [
      {
        data: topGarantes.slice(0, 6).map(g => g.total),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: 'transparent',
        borderWidth: 2,
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

  const chartOptionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatearMonto(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
          callback: function(value) {
            return formatearMonto(value);
          }
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
        }
      }
    }
  };

  const totalGarantes = Object.keys(comisionesPorGarante).length;
  const eficienciaGeneral = estadisticas.total > 0 ? (estadisticas.pagadas / estadisticas.total) * 100 : 0;
  const montoPromedioComision = estadisticas.total > 0 ? estadisticas.montoTotal / estadisticas.total : 0;
  const topGarante = topGarantes.length > 0 ? topGarantes[0] : null;

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
          className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden mx-4"
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
                      {comisiones.length} comisiones · {totalGarantes} garantes activos
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    eficienciaGeneral > 70 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : eficienciaGeneral > 40
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    Eficiencia: {eficienciaGeneral.toFixed(1)}%
                  </span>
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
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Comisiones</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatearMonto(estadisticas.montoTotal)}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {estadisticas.total} comisiones
                      </p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-700 rounded-lg">
                      <CurrencyDollarIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Promedio por Comisión</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatearMonto(montoPromedioComision)}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Por comisión
                      </p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Eficiencia de Pago</p>
                      <p className={`text-2xl font-bold ${
                        eficienciaGeneral > 70 ? 'text-green-600' : eficienciaGeneral > 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {eficienciaGeneral.toFixed(1)}%
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {estadisticas.pagadas} de {estadisticas.total} pagadas
                      </p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg">
                      <PercentBadgeIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Top Garante</p>
                      <p className={`text-lg font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {topGarante?.nombre || 'Ninguno'}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {topGarante ? `${formatearMonto(topGarante.total)} - ${topGarante.cantidad} comisiones` : 'Sin datos'}
                      </p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg">
                      <TrophyIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GlassCard>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`text-base font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <UserGroupIcon className="h-4 w-4 mr-2 text-red-600" />
                          Top Garantes por Comisiones
                        </h4>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setGraficoView('barras')}
                            className={`p-1 rounded-lg transition-all ${
                              graficoView === 'barras'
                                ? 'bg-red-600 text-white'
                                : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            title="Barras"
                          >
                            <ChartBarSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setGraficoView('lineas')}
                            className={`p-1 rounded-lg transition-all ${
                              graficoView === 'lineas'
                                ? 'bg-red-600 text-white'
                                : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            title="Líneas"
                          >
                            <PresentationChartLineIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setGraficoView('polar')}
                            className={`p-1 rounded-lg transition-all ${
                              graficoView === 'polar'
                                ? 'bg-red-600 text-white'
                                : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            title="Polar"
                          >
                            <ChartPieIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="h-80">
                        {graficoView === 'barras' && <Bar data={barChartData} options={chartOptionsBar} />}
                        {graficoView === 'lineas' && <Line data={barChartData} options={chartOptions} />}
                        {graficoView === 'polar' && <PolarArea data={polarData} options={chartOptions} />}
                      </div>
                    </div>
                  </GlassCard>
                </div>

                <div>
                  <GlassCard>
                    <div className="p-4">
                      <h4 className={`text-base font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <ChartPieIcon className="h-4 w-4 mr-2 text-red-600" />
                        Distribución por Estado
                      </h4>
                      <div className="h-64 flex justify-center">
                        <div className="w-64">
                          <Doughnut data={doughnutData} options={chartOptions} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="text-center">
                          <p className="text-xs text-green-600">Pagadas</p>
                          <p className="text-sm font-bold">{estadisticas.pagadas}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-yellow-600">Pendientes</p>
                          <p className="text-sm font-bold">{estadisticas.pendientes}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-red-600">Canceladas</p>
                          <p className="text-sm font-bold">{estadisticas.canceladas || 0}</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <div className="p-4">
                    <h4 className={`text-base font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-2 text-red-600" />
                      Evolución Mensual
                    </h4>
                    <div className="h-64">
                      <Line data={lineChartData} options={chartOptions} />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="p-4">
                    <h4 className={`text-base font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <DocumentTextIcon className="h-4 w-4 mr-2 text-red-600" />
                      Detalle por Garante
                    </h4>
                    <div className="overflow-x-auto max-h-64">
                      <table className="min-w-full text-sm">
                        <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium">Garante</th>
                            <th className="px-3 py-2 text-right text-xs font-medium">Total</th>
                            <th className="px-3 py-2 text-right text-xs font-medium">Pagado</th>
                            <th className="px-3 py-2 text-right text-xs font-medium">Pendiente</th>
                            <th className="px-3 py-2 text-center text-xs font-medium">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topGarantes.map((garante, idx) => (
                            <tr key={idx} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="px-3 py-2 text-xs font-medium">{garante.nombre}</td>
                              <td className="px-3 py-2 text-right font-medium text-red-600 text-xs">
                                {formatearMonto(garante.total)}
                              </td>
                              <td className="px-3 py-2 text-right text-green-600 text-xs">
                                {formatearMonto(garante.pagadas)}
                              </td>
                              <td className="px-3 py-2 text-right text-yellow-600 text-xs">
                                {formatearMonto(garante.pendientes)}
                              </td>
                              <td className="px-3 py-2 text-center text-xs">{garante.cantidad}</td>
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
                Datos actualizados en tiempo real | {comisiones.length} comisiones registradas | {totalGarantes} garantes
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
// ACCIONES RÁPIDAS
// ============================================
const AccionesRapidas = ({ onAccion, activa, theme, estadisticas }) => {
  const acciones = [
    { 
      id: 'todos', 
      label: 'Todos', 
      icon: ListBulletIcon, 
      badge: estadisticas.total,
      color: 'text-gray-600 dark:text-gray-300',
      description: 'Mostrar todas las comisiones'
    },
    { 
      id: 'pagadas', 
      label: 'Pagadas', 
      icon: CheckCircleIcon, 
      badge: estadisticas.pagadas,
      color: 'text-green-600',
      description: 'Comisiones que ya fueron pagadas'
    },
    { 
      id: 'pendientes', 
      label: 'Pendientes', 
      icon: ClockIcon, 
      badge: estadisticas.pendientes,
      color: 'text-yellow-600',
      description: 'Comisiones pendientes de pago'
    },
    { 
      id: 'esteMes', 
      label: 'Este mes', 
      icon: CalendarIcon, 
      color: 'text-cyan-600',
      description: 'Comisiones del mes actual (Septiembre 2026)'
    },
    { 
      id: 'ultimos3Meses', 
      label: 'Últimos 3 meses', 
      icon: CalendarIcon, 
      color: 'text-blue-600',
      description: 'Julio, Agosto, Septiembre 2026'
    },
    { 
      id: 'top5', 
      label: 'Top 5', 
      icon: TrophyIcon, 
      color: 'text-purple-600',
      description: 'Las 5 comisiones más altas'
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {acciones.map((accion) => {
        const Icon = accion.icon;
        const isActive = activa === accion.id;
        
        return (
          <button
            key={accion.id}
            onClick={() => onAccion(accion.id)}
            title={accion.description}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${
              isActive
                ? `bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20`
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Icon className={`h-3 w-3 ${isActive ? 'text-white' : accion.color}`} />
            <span>{accion.label}</span>
            {accion.badge !== undefined && accion.badge > 0 && (
              <span className={`ml-0.5 px-1.5 py-0.5 text-[8px] font-bold rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-400/20 text-gray-600 dark:text-gray-300'
              }`}>
                {accion.badge}
              </span>
            )}
          </button>
        );
      })}
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
  const [showGanancias, setShowGanancias] = useState(true);
  const [garantes, setGarantes] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
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

  const cargarComisiones = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      
      if (!forceRefresh) {
        const cached = localStorage.getItem('comisionesCache');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const edad = Date.now() - parsed.timestamp;
            if (edad < 300000) {
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
        
        try {
          localStorage.setItem('comisionesCache', JSON.stringify({
            comisiones: comisionesData,
            estadisticas: stats,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.log('⚠️ Error guardando caché:', e);
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

  const aplicarFiltros = () => {
    setShowAdvancedFilters(false);
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
    setShowAdvancedFilters(false);
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
      const fechaInicioObj = parseFechaDDMMYYYY(fechaInicio);
      if (fechaInicioObj) {
        fechaInicioObj.setHours(0, 0, 0, 0);
        result = result.filter(c => {
          const fecha = parseFechaDDMMYYYY(c.fechaPago);
          return fecha && fecha >= fechaInicioObj;
        });
      }
    }
    if (fechaFin) {
      const fechaFinObj = parseFechaDDMMYYYY(fechaFin);
      if (fechaFinObj) {
        fechaFinObj.setHours(23, 59, 59, 999);
        result = result.filter(c => {
          const fecha = parseFechaDDMMYYYY(c.fechaPago);
          return fecha && fecha <= fechaFinObj;
        });
      }
    }

    if (montoMin) {
      result = result.filter(c => (c.montoComision || 0) >= parseFloat(montoMin));
    }
    if (montoMax) {
      result = result.filter(c => (c.montoComision || 0) <= parseFloat(montoMax));
    }

    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = hoy.getMonth();

    if (accionRapidaActiva === 'top5') {
      result = result.sort((a, b) => (b.montoComision || 0) - (a.montoComision || 0)).slice(0, 5);
    }

    if (accionRapidaActiva === 'ultimos3Meses') {
      const fechaInicio = new Date(año, mes - 2, 1);
      fechaInicio.setHours(0, 0, 0, 0);
      
      result = result.filter(c => {
        const fecha = parseFechaDDMMYYYY(c.fechaPago);
        return fecha && fecha >= fechaInicio;
      });
    }

    if (accionRapidaActiva === 'esteMes') {
      const inicioMes = new Date(año, mes, 1);
      inicioMes.setHours(0, 0, 0, 0);
      
      result = result.filter(c => {
        const fecha = parseFechaDDMMYYYY(c.fechaPago);
        return fecha && fecha >= inicioMes;
      });
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
          const fechaA = parseFechaDDMMYYYY(a.fechaPago);
          const fechaB = parseFechaDDMMYYYY(b.fechaPago);
          aVal = fechaA ? fechaA.getTime() : 0;
          bVal = fechaB ? fechaB.getTime() : 0;
          break;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [comisiones, filtroCliente, filtroEstado, filtroGarante, fechaInicio, fechaFin, montoMin, montoMax, sortConfig, accionRapidaActiva]);

  const statsAdicionales = useMemo(() => {
    if (comisiones.length === 0) {
      return {
        promedioComision: 0,
        garanteTop: { nombre: '', total: 0, cantidad: 0 },
        montoMaximo: 0,
        montoMinimo: 0,
        eficienciaPago: 0,
        totalGarantes: 0,
        montoPromedioPorGarante: 0
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
    const totalGarantes = Object.keys(garantesMap).length;

    return {
      promedioComision: promedio,
      garanteTop: topGarante,
      montoMaximo: maximo,
      montoMinimo: minimo,
      eficienciaPago: eficiencia,
      totalGarantes: totalGarantes,
      montoPromedioPorGarante: totalGarantes > 0 ? total / totalGarantes : 0
    };
  }, [comisiones]);

  const handleAccionRapida = (tipo) => {
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
    
    setTimeout(() => cargarComisiones(true), 50);
  };

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const actualizarDatos = () => {
    cargarComisiones(true);
  };

  const mostrarVistaTabla = viewMode === 'table';

  const filtrosActivos = () => {
    const activos = [];
    if (filtroEstado !== 'todos') activos.push(`Estado: ${filtroEstado}`);
    if (filtroGarante) activos.push('Garante específico');
    if (filtroCliente) activos.push('Cliente específico');
    if (fechaInicio || fechaFin) activos.push('Rango de fechas');
    if (montoMin || montoMax) activos.push('Rango de montos');
    if (accionRapidaActiva) {
      const nombres = {
        todos: 'Todos',
        pagadas: 'Pagadas',
        pendientes: 'Pendientes',
        esteMes: 'Este mes',
        ultimos3Meses: 'Últimos 3 meses',
        top5: 'Top 5'
      };
      activos.push(`Acción: ${nombres[accionRapidaActiva] || accionRapidaActiva}`);
    }
    return activos;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl blur-3xl" />
        <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border border-red-600/20`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {esGarante ? 'Mis Comisiones' : 'Gestión de Comisiones'}
                </h1>
                <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {esGarante 
                    ? 'Visualiza tus comisiones generadas por los préstamos referidos'
                    : 'Administra las comisiones por préstamos y cobros'}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {comisiones.length} comisiones
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-2">
              {/* 🔥 NUEVO BOTÓN DE FILTROS */}
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 relative ${
                  showFilterPanel || filtrosActivos().length > 0
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Mostrar/Ocultar filtros"
              >
                <FunnelIcon className="h-4 w-4" />
                <span></span>
                {filtrosActivos().length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                    {filtrosActivos().length}
                  </span>
                )}
              </button>

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
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
                title="Dashboard de comisiones"
              >
                <ChartBarIcon className="h-5 w-5" />
                <span className="hidden sm:inline"></span>
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
        </div>
      </motion.div>

      {/* 🔥 NUEVO: PANEL DE FILTROS DESPLEGABLE */}
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <GlassCard>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-lg">
                      <FunnelIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-base sm:text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Filtros de Búsqueda
                      </h3>
                      <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aplica filtros para encontrar comisiones específicas
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Búsqueda por cliente */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                      Buscar Cliente
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del cliente..."
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                      Estado
                    </label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="pagada">Pagada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  {/* Garante */}
                  {esAdmin && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <UserGroupIcon className="h-4 w-4 inline mr-1" />
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

                  {/* Fecha Inicio */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <CalendarIcon className="h-4 w-4 inline mr-1" />
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

                  {/* Fecha Fin */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <CalendarIcon className="h-4 w-4 inline mr-1" />
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

                  {/* Rango de Monto */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <BanknotesIcon className="h-4 w-4 inline mr-1" />
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

                {/* Filtros activos */}
                {filtrosActivos().length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Filtros activos:
                    </span>
                    {filtrosActivos().map((filtro, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                        {filtro}
                      </span>
                    ))}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={limpiarFiltros}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <XMarkIcon className="h-4 w-4 inline mr-1" />
                    Limpiar
                  </button>
                  <button
                    onClick={() => {
                      aplicarFiltros();
                      setShowFilterPanel(false);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Stats Cards Generales */}
      <StatsCardsContainer 
        title={esGarante ? "Resumen de Mis Comisiones" : "Métricas de Comisiones"}
        icon={ChartBarIcon}
        isOpen={showStatsCards}
        onToggle={() => setShowStatsCards(!showStatsCards)}
        badge={{ text: `${estadisticas.total} comisiones`, color: 'bg-red-100', textColor: 'text-red-700 dark:bg-red-900/30 dark:text-red-400' }}
        subtitle="Análisis detallado de comisiones"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <StatsCard
            icon={CurrencyDollarIcon}
            label="Total Comisiones"
            value={formatMontoAbreviado(estadisticas.montoTotal)}
            subValue={`${estadisticas.total} comisiones`}
            color="red"
            tooltip="Total de comisiones generadas"
            detail={`${statsAdicionales.totalGarantes} garantes activos`}
          />
          <StatsCard
            icon={CheckCircleIcon}
            label="Pagadas"
            value={formatMontoAbreviado(estadisticas.montoPagado)}
            subValue={`${estadisticas.pagadas} pagadas`}
            color="green"
            tooltip="Comisiones que ya han sido pagadas"
            badge={{ text: `${((estadisticas.pagadas / (estadisticas.total || 1)) * 100).toFixed(0)}%`, color: 'bg-green-600' }}
          />
          <StatsCard
            icon={ClockIcon}
            label="Pendientes"
            value={formatMontoAbreviado(estadisticas.montoPendiente)}
            subValue={`${estadisticas.pendientes} pendientes`}
            color="yellow"
            tooltip="Comisiones pendientes de pago"
            badge={{ text: `${((estadisticas.pendientes / (estadisticas.total || 1)) * 100).toFixed(0)}%`, color: 'bg-yellow-600' }}
          />
          <StatsCard
            icon={PresentationChartLineIcon}
            label="Promedio por Comisión"
            value={formatMontoAbreviado(statsAdicionales.promedioComision)}
            subValue={`${comisiones.length} comisiones`}
            color="blue"
            tooltip="Promedio de monto por comisión"
          />
          <StatsCard
            icon={TrophyIcon}
            label="Garante Top"
            value={statsAdicionales.garanteTop.nombre || 'Ninguno'}
            subValue={statsAdicionales.garanteTop.total > 0 ? `RD$ ${statsAdicionales.garanteTop.total.toLocaleString()}` : 'Sin comisiones'}
            color="purple"
            tooltip="Garante que ha generado más comisiones"
            badge={statsAdicionales.garanteTop.cantidad > 0 ? { text: `${statsAdicionales.garanteTop.cantidad} comisiones`, color: 'bg-purple-600' } : null}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatsCard
            icon={FireIcon}
            label="Comisión Máxima"
            value={formatMontoAbreviado(statsAdicionales.montoMaximo)}
            subValue="Monto más alto"
            color="orange"
            tooltip="Monto de comisión más alto registrado"
          />
          <StatsCard
            icon={PercentBadgeIcon}
            label="Eficiencia de Pago"
            value={`${statsAdicionales.eficienciaPago.toFixed(1)}%`}
            subValue={`${estadisticas.pagadas} de ${estadisticas.total} pagadas`}
            color="emerald"
            tooltip="Porcentaje de comisiones pagadas vs total"
            badge={{ text: statsAdicionales.eficienciaPago > 70 ? 'Excelente' : statsAdicionales.eficienciaPago > 40 ? 'Regular' : 'Mejorable', color: statsAdicionales.eficienciaPago > 70 ? 'bg-green-600' : statsAdicionales.eficienciaPago > 40 ? 'bg-yellow-600' : 'bg-red-600' }}
          />
          <StatsCard
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
          <StatsCard
            icon={BanknotesIcon}
            label="Monto Base Total"
            value={formatMontoAbreviado(comisiones.reduce((sum, c) => sum + (c.montoBase || 0), 0))}
            subValue="Base para comisiones"
            color="teal"
            tooltip="Suma de todos los montos base (intereses) sobre los que se calculan comisiones"
            detail={`Promedio: ${formatMontoAbreviado(statsAdicionales.montoPromedioPorGarante)} por garante`}
          />
        </div>
      </StatsCardsContainer>

      {/* 🔥 NUEVA SECCIÓN: GANANCIAS POR PERÍODO */}
      <StatsCardsContainer 
        title="Ganancias por Período"
        icon={CalendarDaysIcon}
        isOpen={showGanancias}
        onToggle={() => setShowGanancias(!showGanancias)}
        badge={{ text: 'Análisis Temporal', color: 'bg-purple-100', textColor: 'text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }}
        subtitle="Comisiones por hoy, semana, quincena, mes y más"
      >
        <GananciasSection comisiones={comisiones} theme={theme} />
      </StatsCardsContainer>

      {/* Acciones rápidas */}
      <GlassCard>
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              ⚡ Acciones rápidas:
            </span>
            <AccionesRapidas 
              onAccion={handleAccionRapida}
              activa={accionRapidaActiva}
              theme={theme}
              estadisticas={estadisticas}
            />
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
          <button
            onClick={actualizarDatos}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Actualizar datos
          </button>
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

// Componente ComisionCard
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

// Componente DetalleComisionModal
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
      case 'pagada': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'pendiente': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'cancelada': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(comision?.estado)}`}>
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
                        {comision.prestamoID?.slice(0, 12)}...
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

export default Comisiones;