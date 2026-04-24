import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';
import { TrophyIcon, UserGroupIcon, CheckCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const OdometroDigit = ({ value, label }) => {
  const { theme } = useTheme();
  
  return (
    <div className="text-center">
      <div className={`inline-flex flex-col items-center justify-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} min-w-[80px]`}>
        <div className="flex gap-1">
          {value.toString().split('').map((digit, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`w-8 h-12 flex items-center justify-center rounded-lg text-2xl font-bold ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} shadow-inner`}
            >
              {digit}
            </motion.div>
          ))}
        </div>
        <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      </div>
    </div>
  );
};

const ODOMetroGlobal = ({ estadisticas = {} }) => {
  const { theme } = useTheme();
  const [animatedStats, setAnimatedStats] = useState({
    prestamos: 0,
    clientes: 0,
    ganancias: 0,
    recuperacion: 0
  });
  
  const formatCurrency = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toString();
  };
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setAnimatedStats({
        prestamos: Math.min(estadisticas.prestamos?.value || 0, Math.floor(((estadisticas.prestamos?.value || 0) / steps) * step)),
        clientes: Math.min(estadisticas.clientes?.value || 0, Math.floor(((estadisticas.clientes?.value || 0) / steps) * step)),
        ganancias: Math.min(estadisticas.ganancias?.value || 0, Math.floor(((estadisticas.ganancias?.value || 0) / steps) * step)),
        recuperacion: Math.min(estadisticas.recuperacion?.value || 0, Math.floor(((estadisticas.recuperacion?.value || 0) / steps) * step))
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [estadisticas]);
  
  // Calcular porcentajes normalizados
  const getPorcentaje = (actual, meta) => {
    if (!meta || meta === 0) return 0;
    return Math.min(100, Math.round((actual / meta) * 100));
  };
  
  // Calcular nivel de combustible promedio
  const nivelCombustible = Math.round(
    Object.values(estadisticas).reduce((acc, stat) => acc + getPorcentaje(stat.value, stat.meta), 0) / 
    Math.max(1, Object.keys(estadisticas).length)
  );
  
  // Calcular autonomía basada en el nivel de combustible
  const autonomia = Math.round(nivelCombustible * 52);
  
  return (
    <GlassCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Odómetro de Logros Globales
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Kilometraje recorrido hacia las metas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <RocketLaunchIcon className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">En movimiento</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <OdometroDigit value={formatCurrency(animatedStats.prestamos)} label={estadisticas.prestamos?.label || 'Préstamos'} />
          <OdometroDigit value={animatedStats.clientes.toString()} label={estadisticas.clientes?.label || 'Clientes'} />
          <OdometroDigit value={formatCurrency(animatedStats.ganancias)} label={estadisticas.ganancias?.label || 'Ganancias'} />
          <OdometroDigit value={`${Math.round(animatedStats.recuperacion)}%`} label={estadisticas.recuperacion?.label || 'Recuperación'} />
        </div>
        
        <div className="mt-6 space-y-3">
          {Object.entries(estadisticas).map(([key, stat]) => {
            const porcentaje = getPorcentaje(stat.value, stat.meta);
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{stat.label}</span>
                  <span className="font-medium">{porcentaje}% de meta</span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentaje}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Nivel de combustible para metas</span>
            <span className="text-xs font-bold text-green-600">{nivelCombustible}%</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((_, i) => {
              const filledCount = Math.ceil(nivelCombustible / 20);
              return (
                <div key={i} className={`flex-1 h-2 rounded-full ${i < filledCount ? 'bg-green-500' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
              );
            })}
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            ⛽ Autonomía: {autonomia} km • Próxima estación de servicio: Meta Q3
          </p>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'} border border-yellow-200 dark:border-yellow-800`}>
            <TrophyIcon className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
              {Object.values(estadisticas).filter(stat => stat.value >= stat.meta).length}
            </p>
            <p className="text-[10px] text-gray-500">Metas Alcanzadas</p>
          </div>
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-200 dark:border-blue-800`}>
            <UserGroupIcon className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
              {Object.values(estadisticas).filter(stat => stat.value >= stat.meta * 1.2).length}
            </p>
            <p className="text-[10px] text-gray-500">Récords Rotos</p>
          </div>
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} border border-green-200 dark:border-green-800`}>
            <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs font-bold text-green-700 dark:text-green-400">
              {Object.values(estadisticas).length}
            </p>
            <p className="text-[10px] text-gray-500">Logros Totales</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ODOMetroGlobal;