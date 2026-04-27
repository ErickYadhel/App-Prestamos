import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';

const VelocimetroMetricas = ({ title, value, maxValue = 100, unit = '%', color = '#ef4444', subMetricas = [] }) => {
  const { theme } = useTheme();
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverValue, setHoverValue] = useState(0);
  
  // Normalizar valor entre 0 y maxValue
  const normalizedValue = Math.min(maxValue, Math.max(0, value));
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(normalizedValue), 100);
    return () => clearTimeout(timer);
  }, [normalizedValue]);
  
  // Efecto hover: baja la velocidad y luego sube
  useEffect(() => {
    if (isHovered) {
      // Bajar velocidad rápidamente
      let current = animatedValue;
      const downInterval = setInterval(() => {
        if (current > 0) {
          current -= Math.max(1, Math.floor(current / 10));
          setHoverValue(current);
        } else {
          clearInterval(downInterval);
          // Subir velocidad lentamente hasta el valor original
          let upCurrent = 0;
          const upInterval = setInterval(() => {
            if (upCurrent < normalizedValue) {
              upCurrent += Math.max(1, Math.ceil((normalizedValue - upCurrent) / 15));
              setHoverValue(upCurrent);
            } else {
              clearInterval(upInterval);
              setHoverValue(normalizedValue);
            }
          }, 30);
        }
      }, 20);
      return () => clearInterval(downInterval);
    } else {
      setHoverValue(animatedValue);
    }
  }, [isHovered, animatedValue, normalizedValue]);
  
  const displayValue = isHovered ? hoverValue : animatedValue;
  
  // Calcular ángulo de la aguja (0 a 180 grados)
  // 0% = -90 grados (izquierda), 100% = 90 grados (derecha)
  const percentage = (displayValue / maxValue) * 100;
  const angle = (percentage / 100) * 180 - 90;
  
  // Colores para diferentes zonas (como velocímetro real)
  const getZoneColor = (val) => {
    const percent = (val / maxValue) * 100;
    if (percent <= 40) return '#10b981';  // Verde - zona económica
    if (percent <= 70) return '#f59e0b';  // Amarillo - zona de consumo normal
    if (percent <= 85) return '#f97316';  // Naranja - zona de alto consumo
    return '#ef4444';                      // Rojo - zona peligrosa
  };
  
  const zoneColor = getZoneColor(displayValue);
  
  // Velocidad en "km/h" simulada para el efecto
  const velocidadKMH = Math.round((displayValue / maxValue) * 260);
  
  return (
    <GlassCard>
      <div 
        className="p-6 cursor-pointer transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h3 className={`text-lg font-semibold mb-4 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {title}
        </h3>
        
        <div className="relative w-72 h-72 mx-auto">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Fondo del velocímetro con efecto 3D */}
            <circle cx="100" cy="100" r="92" fill={theme === 'dark' ? '#1f2937' : '#f3f4f6'} stroke={theme === 'dark' ? '#FF0000' : '#FF0000'} strokeWidth="4" />
            <circle cx="100" cy="100" r="85" fill="none" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} strokeWidth="2" />
            
            {/* Gradiente del arco del velocímetro */}
            <defs>
              <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
            </defs>
            
            {/* Arco del velocímetro */}
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="url(#speedGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            
            {/* Marcas grandes (cada 20 unidades) */}
            {[0, 20, 40, 60, 80, 100].map((mark) => {
              const markAngle = (mark / 100) * 180 - 180;
              const radian = (markAngle * Math.PI) / 180;
              const x1 = 100 + 78 * Math.cos(radian);
              const y1 = 100 + 78 * Math.sin(radian);
              const x2 = 100 + 68 * Math.cos(radian);
              const y2 = 100 + 68 * Math.sin(radian);
              const xText = 100 + 58 * Math.cos(radian);
              const yText = 100 + 58 * Math.sin(radian);
              return (
                <g key={mark}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} strokeWidth="3" strokeLinecap="round" />
                  <text
                    x={xText}
                    y={yText}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-bold"
                    fill={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                  >
                    {mark}
                  </text>
                </g>
              );
            })}
            
            {/* Marcas pequeñas (cada 10 unidades) */}
            {[10, 30, 50, 70, 90].map((mark) => {
              const markAngle = (mark / 100) * 180 - 180;
              const radian = (markAngle * Math.PI) / 180;
              const x1 = 100 + 78 * Math.cos(radian);
              const y1 = 100 + 78 * Math.sin(radian);
              const x2 = 100 + 73 * Math.cos(radian);
              const y2 = 100 + 73 * Math.sin(radian);
              return (
                <line key={mark} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" />
              );
            })}
            
            {/* Zonas de color con texto */}
            <text x="35" y="115" className="text-[8px] fill-green-500 dark:fill-green-400">ECO</text>
            <text x="65" y="65" className="text-[8px] fill-yellow-500 dark:fill-yellow-400">NORMAL</text>
            <text x="117" y="65" className="text-[8px] fill-orange-500 dark:fill-orange-400">ALTO</text>
            <text x="130" y="120" className="text-[8px] fill-red-500 dark:fill-red-400">PELIGRO</text>
            
            {/* Centro del velocímetro */}
            <circle cx="100" cy="100" r="18" fill={theme === 'dark' ? '#374151' : '#e5e7eb'} stroke={zoneColor} strokeWidth="3" filter="url(#shadow)" />
            <circle cx="100" cy="100" r="10" fill={zoneColor} />
            <circle cx="100" cy="100" r="4" fill="#fff" />
            
            {/* Aguja del velocímetro con efecto glow en hover */}
            <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px' }} className="transition-all duration-700 ease-out">
              {/* Sombra de la aguja */}
              <line x1="100" y1="100" x2="100" y2="28" stroke="rgba(0,0,0,0.3)" strokeWidth="4" strokeLinecap="round" transform="translate(2, 2)" />
              {/* Aguja principal con glow en hover */}
              <line 
                x1="100" y1="100" x2="100" y2="28" 
                stroke={zoneColor} 
                strokeWidth="3" 
                strokeLinecap="round"
                filter={isHovered ? "url(#glow)" : "none"}
              />
              {/* Contorno de la aguja */}
              <line x1="100" y1="100" x2="100" y2="28" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              {/* Centro decorativo */}
              <circle cx="100" cy="100" r="7" fill={zoneColor} />
              <circle cx="100" cy="100" r="2" fill="#fff" />
            </g>
            
            {/* Línea roja intermitente de zona de peligro */}
            <path
              d="M 165 100 A 65 65 0 0 1 150 145"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray="4 4"
              opacity={percentage > 85 ? 0.8 : 0.2}
              className="transition-all duration-300"
            />
          </svg>
          
          {/* Display digital de velocidad */}
          <div className="absolute bottom-9 left-1/2 transform -translate-x-1/2 text-center">
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(displayValue)}
              <span className="text-sm ml-0.5">{unit}</span>
            </div>
            <div className="text-[13px] text-gray-500 mt-3 flex items-center justify-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              {isHovered ? 'ACELERANDO' : `${velocidadKMH} km/h`}
            </div>
          </div>
        </div>
        
        {/* Submétricas */}
        {subMetricas.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {subMetricas.map((sub, idx) => (
              <div key={idx} className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'} transition-all duration-300 hover:scale-105`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{sub.label}</p>
                <p className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{sub.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default VelocimetroMetricas;