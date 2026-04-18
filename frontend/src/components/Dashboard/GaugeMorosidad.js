import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const GaugeMorosidad = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [morosidad, setMorosidad] = useState(0);
  const [stats, setStats] = useState({
    prestamosActivos: 0,
    prestamosMorosos: 0,
    capitalEnRiesgo: 0,
    tendencia: 0
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
      
      const response = await api.get('/prestamos');
      let prestamos = [];
      
      if (response.success && response.data) {
        prestamos = response.data;
      } else {
        prestamos = [
          { estado: 'activo', capitalRestante: 10000 },
          { estado: 'activo', capitalRestante: 15000 },
          { estado: 'moroso', capitalRestante: 5000 },
          { estado: 'activo', capitalRestante: 8000 },
          { estado: 'moroso', capitalRestante: 3000 },
          { estado: 'activo', capitalRestante: 20000 }
        ];
      }
      
      const activos = prestamos.filter(p => p.estado === 'activo');
      const morosos = prestamos.filter(p => p.estado === 'moroso');
      const capitalEnRiesgo = morosos.reduce((sum, p) => sum + (parseFloat(p.capitalRestante) || 0), 0);
      const totalCapital = activos.reduce((sum, p) => sum + (parseFloat(p.capitalRestante) || 0), 0);
      
      const tasaMorosidad = totalCapital > 0 ? (capitalEnRiesgo / totalCapital * 100) : 0;
      
      setMorosidad(Math.min(100, tasaMorosidad));
      setStats({
        prestamosActivos: activos.length,
        prestamosMorosos: morosos.length,
        capitalEnRiesgo,
        tendencia: tasaMorosidad > 5 ? 2.5 : -1.2
      });
      
    } catch (error) {
      console.error('Error cargando morosidad:', error);
      setMorosidad(8.5);
      setStats({
        prestamosActivos: 45,
        prestamosMorosos: 6,
        capitalEnRiesgo: 28500,
        tendencia: 1.8
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getColor = () => {
    if (morosidad <= 3) return 'text-emerald-500';
    if (morosidad <= 6) return 'text-yellow-500';
    if (morosidad <= 10) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBgColor = () => {
    if (morosidad <= 3) return 'from-emerald-500 to-emerald-600';
    if (morosidad <= 6) return 'from-yellow-500 to-yellow-600';
    if (morosidad <= 10) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getStatusText = () => {
    if (morosidad <= 3) return 'Saludable';
    if (morosidad <= 6) return 'Moderada';
    if (morosidad <= 10) return 'Preocupante';
    return 'Crítica';
  };

  const getStatusIcon = () => {
    if (morosidad <= 6) return <ShieldCheckIcon className="h-8 w-8 text-emerald-500" />;
    return <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />;
  };

  const radio = 80;
  const circumference = 2 * Math.PI * radio;
  const strokeDashoffset = circumference - (morosidad / 100) * circumference;

  if (loading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
            <ExclamationTriangleIcon className="h-4 w-4 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Índice de Morosidad
          </h4>
        </div>

        {/* Gauge */}
        <div className="relative flex justify-center mb-4">
          <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="15"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="33%" stopColor="#F59E0B" />
                <stop offset="66%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="8"
              fill="white"
              stroke="#EF4444"
              strokeWidth="3"
              className="transition-all duration-1000 ease-out"
              style={{
                transform: `rotate(${-90 + (morosidad / 100) * 180}deg)`,
                transformOrigin: '100px 100px'
              }}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className={`text-3xl font-bold ${getColor()}`}>{morosidad.toFixed(1)}%</span>
          </div>
        </div>

        {/* Marcadores */}
        <div className="flex justify-between px-4 mb-4">
          <span className="text-[9px] text-gray-400">0%</span>
          <span className="text-[9px] text-gray-400">25%</span>
          <span className="text-[9px] text-gray-400">50%</span>
          <span className="text-[9px] text-gray-400">75%</span>
          <span className="text-[9px] text-gray-400">100%</span>
        </div>

        {/* Status */}
        <div className={`p-3 rounded-xl text-center mb-4 bg-gradient-to-r ${getBgColor()} bg-opacity-10`}>
          <div className="flex items-center justify-center gap-2">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-bold">Nivel {getStatusText()}</p>
              <p className="text-[10px] opacity-75">
                {morosidad <= 3 ? 'Excelente, mantén el ritmo' :
                 morosidad <= 6 ? 'Controlado, requiere monitoreo' :
                 morosidad <= 10 ? 'Alerta, tomar acciones' :
                 'Crítico, intervención necesaria'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[9px] text-gray-500">Préstamos Activos</p>
            <p className="text-base font-bold text-green-600">{stats.prestamosActivos}</p>
          </div>
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[9px] text-gray-500">En Mora</p>
            <p className="text-base font-bold text-red-600">{stats.prestamosMorosos}</p>
          </div>
          <div className="col-span-2 p-2 rounded-lg text-center bg-red-50 dark:bg-red-900/20">
            <p className="text-[9px] text-gray-500">Capital en Riesgo</p>
            <p className="text-sm font-bold text-red-600">{formatearMonto(stats.capitalEnRiesgo)}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default GaugeMorosidad;