import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const FlujoCajaProyectado = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [stats, setStats] = useState({
    flujoActual: 0,
    proyeccionTrimestre: 0,
    crecimientoEstimado: 0,
    mesPico: ''
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

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const ingresosReales = [45000, 52000, 58000, 61000, 65000, 72000, 78000, 82000, 85000, 88000, 92000, 95000];
      const egresosReales = [35000, 38000, 40000, 42000, 45000, 48000, 50000, 52000, 54000, 56000, 58000, 60000];
      
      const ingresosProyectados = [...ingresosReales.slice(-3)];
      for (let i = 0; i < 6; i++) {
        const ultimo = ingresosProyectados[ingresosProyectados.length - 1];
        ingresosProyectados.push(ultimo * 1.05);
      }
      
      const egresosProyectados = [...egresosReales.slice(-3)];
      for (let i = 0; i < 6; i++) {
        const ultimo = egresosProyectados[egresosProyectados.length - 1];
        egresosProyectados.push(ultimo * 1.03);
      }
      
      const todosMeses = [...meses, 'Proy 1', 'Proy 2', 'Proy 3', 'Proy 4', 'Proy 5', 'Proy 6'];
      const todosIngresos = [...ingresosReales, ...ingresosProyectados.slice(1)];
      const todosEgresos = [...egresosReales, ...egresosProyectados.slice(1)];
      
      setChartData({
        labels: todosMeses,
        datasets: [
          {
            label: 'Ingresos',
            data: todosIngresos,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Egresos',
            data: todosEgresos,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgb(239, 68, 68)',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      });
      
      const flujoActual = ingresosReales[ingresosReales.length - 1] - egresosReales[egresosReales.length - 1];
      const proyeccionTrimestre = ingresosProyectados.slice(1, 4).reduce((a, b) => a + b, 0) - egresosProyectados.slice(1, 4).reduce((a, b) => a + b, 0);
      const crecimientoEstimado = ((ingresosProyectados[ingresosProyectados.length - 1] / ingresosReales[ingresosReales.length - 1]) - 1) * 100;
      
      setStats({
        flujoActual,
        proyeccionTrimestre,
        crecimientoEstimado: crecimientoEstimado.toFixed(1),
        mesPico: 'Octubre'
      });
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatearMonto(ctx.raw)}` } }
    },
    scales: {
      y: { ticks: { callback: (v) => formatearMonto(v) }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } },
      x: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } }
    }
  };

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg">
            <CurrencyDollarIcon className="h-4 w-4 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Flujo de Caja Proyectado
          </h4>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Flujo actual</p>
            <p className="text-sm font-bold text-emerald-600">{formatearMonto(stats.flujoActual)}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Proyección trimestre</p>
            <p className="text-sm font-bold text-blue-600">{formatearMonto(stats.proyeccionTrimestre)}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Crecimiento estimado</p>
            <p className="text-base font-bold text-purple-600">+{stats.crecimientoEstimado}%</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Mes pico</p>
            <p className="text-xs font-bold text-orange-600">{stats.mesPico}</p>
          </div>
        </div>

        <div className="h-64"><Line data={chartData} options={options} /></div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Línea sólida: histórico | Línea punteada: proyectado</p>
          </div>
          <div className={`p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20`}>
            <p className="text-[8px] text-emerald-600">💡 Proyección optimista basada en tendencia actual</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default FlujoCajaProyectado;