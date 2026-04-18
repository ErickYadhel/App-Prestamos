import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const RadarComparativo = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      setChartData({
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
          { label: 'Año Actual', data: [65, 70, 75, 80, 85, 90, 88, 86, 84, 82, 80, 78], backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgb(16, 185, 129)', borderWidth: 2, pointBackgroundColor: 'rgb(16, 185, 129)', pointBorderColor: '#fff' },
          { label: 'Año Anterior', data: [55, 58, 62, 65, 68, 72, 75, 73, 70, 68, 65, 62], backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgb(59, 130, 246)', borderWidth: 2, pointBackgroundColor: 'rgb(59, 130, 246)', pointBorderColor: '#fff' },
          { label: 'Meta', data: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80], backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgb(239, 68, 68)', borderWidth: 2, borderDash: [5, 5], pointRadius: 0 }
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
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' } } },
    scales: { r: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563', backdropColor: 'transparent' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' }, angleLines: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } } }
  };

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg"><ChartBarIcon className="h-4 w-4 text-white" /></div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Comparativa Anual (Radar)</h4>
        </div>
        <div className="h-80"><Radar data={chartData} options={options} /></div>
        <p className={`text-[9px] text-center mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Comparativa de rendimiento vs año anterior y metas</p>
      </div>
    </GlassCard>
  );
};

export default RadarComparativo;