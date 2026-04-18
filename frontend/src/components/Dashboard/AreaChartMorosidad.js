import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const AreaChartMorosidad = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [stats, setStats] = useState({ picoMaximo: 0, promedio: 0, tendencia: 0 });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const morosidadData = [2.5, 2.8, 3.2, 4.1, 5.5, 6.2, 5.8, 5.2, 4.8, 4.5, 4.2, 3.9];
      const alertaData = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
      const objetivoData = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
      
      setChartData({
        labels: meses,
        datasets: [
          { label: 'Tasa de Morosidad', data: morosidadData, borderColor: 'rgb(239, 68, 68)', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 3, tension: 0.4, fill: true, pointBackgroundColor: 'rgb(239, 68, 68)', pointRadius: 4, pointHoverRadius: 6 },
          { label: 'Nivel de Alerta', data: alertaData, borderColor: 'rgb(245, 158, 11)', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 2, borderDash: [5, 5], tension: 0.4, fill: false, pointRadius: 0 },
          { label: 'Objetivo', data: objetivoData, borderColor: 'rgb(16, 185, 129)', backgroundColor: 'transparent', borderWidth: 2, borderDash: [5, 5], tension: 0.4, fill: false, pointRadius: 0 }
        ]
      });
      
      setStats({ picoMaximo: 6.2, promedio: 4.6, tendencia: -0.3 });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' } }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%` } } },
    scales: { y: { ticks: { callback: (value) => `${value}%` }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } }, x: { grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } } }
  };

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg"><ExclamationTriangleIcon className="h-4 w-4 text-white" /></div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Evolución de Morosidad</h4>
        </div>
        <div className="h-80"><Line data={chartData} options={options} /></div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center"><p className="text-[9px] text-gray-500">Pico máximo</p><p className="text-sm font-bold text-red-600">{stats.picoMaximo}%</p></div>
          <div className="text-center"><p className="text-[9px] text-gray-500">Promedio anual</p><p className="text-sm font-bold text-orange-600">{stats.promedio}%</p></div>
          <div className="text-center"><p className="text-[9px] text-gray-500">Tendencia</p><p className="text-sm font-bold text-green-600">{stats.tendencia}%</p></div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AreaChartMorosidad;