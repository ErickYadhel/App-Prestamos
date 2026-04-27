import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';

const GaugeWidget = ({ title, value, maxValue, unit, color, subtitle }) => {
  const { theme } = useTheme();
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverValue, setHoverValue] = useState(0);
  
  const normalizedValue = Math.min(maxValue, Math.max(0, value));
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(normalizedValue), 100);
    return () => clearTimeout(timer);
  }, [normalizedValue]);
  
  // Efecto hover para el gauge pequeño
  useEffect(() => {
    if (isHovered) {
      let current = animatedValue;
      const downInterval = setInterval(() => {
        if (current > 0) {
          current -= Math.max(1, Math.floor(current / 8));
          setHoverValue(current);
        } else {
          clearInterval(downInterval);
          let upCurrent = 0;
          const upInterval = setInterval(() => {
            if (upCurrent < normalizedValue) {
              upCurrent += Math.max(1, Math.ceil((normalizedValue - upCurrent) / 12));
              setHoverValue(upCurrent);
            } else {
              clearInterval(upInterval);
              setHoverValue(normalizedValue);
            }
          }, 25);
        }
      }, 15);
      return () => clearInterval(downInterval);
    } else {
      setHoverValue(animatedValue);
    }
  }, [isHovered, animatedValue, normalizedValue]);
  
  const displayValue = isHovered ? hoverValue : animatedValue;
  const percentage = (displayValue / maxValue) * 100;
  const angle = (percentage / 100) * 180 - 90;
  
  const getZoneColor = () => {
    if (percentage <= 40) return '#10b981';
    if (percentage <= 70) return '#f59e0b';
    if (percentage <= 85) return '#f97316';
    return '#ef4444';
  };
  
  const zoneColor = getZoneColor();
  
  return (
    <div 
      className="relative cursor-pointer transition-all duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-center mb-2">
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
        <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {Math.round(displayValue)}<span className="text-sm ml-0.5">{unit}</span>
        </p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} strokeWidth="8" />
          
          <path
            d="M 20 60 A 40 40 0 0 1 100 60"
            fill="none"
            stroke={color || zoneColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset={125.6 - (125.6 * percentage / 100)}
            className="transition-all duration-700 ease-out"
          />
          
          {/* Marcas */}
          {[0, 25, 50, 75, 100].map((mark) => {
            const markAngle = (mark / 100) * 180 - 180;
            const radian = (markAngle * Math.PI) / 180;
            const x1 = 60 + 45 * Math.cos(radian);
            const y1 = 60 + 45 * Math.sin(radian);
            const x2 = 60 + 38 * Math.cos(radian);
            const y2 = 60 + 38 * Math.sin(radian);
            return (
              <line key={mark} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} strokeWidth="2" />
            );
          })}
          
          {/* Centro */}
          <circle cx="60" cy="60" r="10" fill={theme === 'dark' ? '#374151' : '#e5e7eb'} stroke={color || zoneColor} strokeWidth="2" />
          <circle cx="60" cy="60" r="5" fill={color || zoneColor} />
          
          {/* Aguja */}
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '60px 60px' }} className="transition-all duration-700 ease-out">
            <line x1="60" y1="60" x2="60" y2="18" stroke={color || zoneColor} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="60" cy="60" r="6" fill={color || zoneColor} />
            <circle cx="60" cy="60" r="2" fill="#fff" />
          </g>
        </svg>
        
        {/* Velocidad digital pequeña */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-[20px] text-gray-500">{Math.round(percentage)}%</div>
        </div>
      </div>
    </div>
  );
};

const DashboardVelocidadProgreso = ({ metricas = [] }) => {
  const { theme } = useTheme();
  
  const velocidadPromedio = Math.round(metricas.reduce((acc, m) => acc + (m.value / m.maxValue) * 100, 0) / metricas.length);
  const [hoverSpeed, setHoverSpeed] = useState(velocidadPromedio);
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  
  useEffect(() => {
    if (isHoveringBar) {
      let current = velocidadPromedio;
      const downInterval = setInterval(() => {
        if (current > 0) {
          current -= Math.max(1, Math.floor(current / 10));
          setHoverSpeed(current);
        } else {
          clearInterval(downInterval);
          let upCurrent = 0;
          const upInterval = setInterval(() => {
            if (upCurrent < velocidadPromedio) {
              upCurrent += Math.max(1, Math.ceil((velocidadPromedio - upCurrent) / 15));
              setHoverSpeed(upCurrent);
            } else {
              clearInterval(upInterval);
              setHoverSpeed(velocidadPromedio);
            }
          }, 30);
        }
      }, 20);
      return () => clearInterval(downInterval);
    } else {
      setHoverSpeed(velocidadPromedio);
    }
  }, [isHoveringBar, velocidadPromedio]);
  
  return (
    <GlassCard>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Tablero de Instrumentos
            </h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Velocímetros de rendimiento clave • Pasa el mouse para ver el efecto
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metricas.map((metrica, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GaugeWidget {...metrica} />
            </motion.div>
          ))}
        </div>
        
        {/* Velocímetro horizontal con efecto hover */}
        <div 
          className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} cursor-pointer transition-all duration-300`}
          onMouseEnter={() => setIsHoveringBar(true)}
          onMouseLeave={() => setIsHoveringBar(false)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isHoveringBar ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <p className="text-sm font-medium text-green-600 dark:text-green-400">VELOCIDAD DE CRECIMIENTO</p>
            </div>
            <div className="flex items-center gap-1">
              <svg className={`h-4 w-4 ${isHoveringBar ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className={`text-sm font-bold ${isHoveringBar ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {isHoveringBar ? '¡ACELERANDO!' : 'TURBO ACTIVADO'}
              </span>
            </div>
          </div>
          
          {/* Velocímetro horizontal */}
          <div className="relative">
            <div className="flex justify-between text-xs mb-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              {/* Fondo de zonas */}
              <div className="absolute inset-0 flex">
                <div className="h-full bg-green-500" style={{ width: '40%' }} />
                <div className="h-full bg-yellow-500" style={{ width: '30%' }} />
                <div className="h-full bg-orange-500" style={{ width: '15%' }} />
                <div className="h-full bg-red-500" style={{ width: '15%' }} />
              </div>
              {/* Barra de progreso */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hoverSpeed}%` }}
                transition={{ duration: 0.5 }}
                className="absolute h-full bg-white/30 rounded-full"
                style={{ width: `${hoverSpeed}%` }}
              />
              {/* Aguja del velocímetro horizontal */}
              <motion.div
                initial={{ left: 0 }}
                animate={{ left: `${hoverSpeed}%` }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
                className="absolute top-0 w-1 h-6 bg-white shadow-lg transform -translate-x-1/2"
                style={{ boxShadow: isHoveringBar ? '0 0 10px rgba(239,68,68,0.8)' : 'none' }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Velocidad actual</span>
              <span className={`text-sm font-bold ${isHoveringBar ? 'text-red-600 animate-pulse' : 'text-red-600'}`}>
                {hoverSpeed} km/h
              </span>
              <span className="text-xs text-gray-500">Meta: 100 km/h</span>
            </div>
          </div>
          
          {/* Tacómetro pequeño */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">RPM</span>
            <div className="flex-1 mx-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hoverSpeed * 0.8}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #10b981, #f59e0b, #f97316, #ef4444)' }}
              />
            </div>
            <span className="text-xs font-mono font-bold">{Math.round(hoverSpeed * 8)}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default DashboardVelocidadProgreso;