import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const StackedBarChart = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});

  const formatearMonto = (valor) => {
    if (valor >= 1000000) return `RD$ ${(valor / 1000000).toFixed(1)}M`;
    if (valor >= 1000) return `RD$ ${(valor / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor);
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      setChartData({
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
          { label: 'Capital', data: [12000, 14000, 16000, 18000, 20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000], backgroundColor: '#3B82F6', borderRadius: 8 },
          { label: 'Interés', data: [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500], backgroundColor: '#10B981', borderRadius: 8 },
          { label: 'Mora', data: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600], backgroundColor: '#EF4444', borderRadius: 8 }
        ]
      });
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const options = {
    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top', labels: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' } }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatearMonto(ctx.raw)}` } } },
    scales: { x: { stacked: true, ticks: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } }, y: { stacked: true, ticks: { callback: (value) => formatearMonto(value), color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } } }
  };

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg"><ChartBarIcon className="h-4 w-4 text-white" /></div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Composición de Pagos (Stacked Bar)</h4>
        </div>
        <div className="h-80"><Bar data={chartData} options={options} /></div>
        <p className={`text-[9px] text-center mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Distribución mensual de capital, intereses y moras</p>
      </div>
    </GlassCard>
  );
};

export default StackedBarChart;