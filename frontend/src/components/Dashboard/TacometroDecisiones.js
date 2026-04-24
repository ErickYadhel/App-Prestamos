import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TacometroDecisiones = ({ indicadores = [] }) => {
  const { theme } = useTheme();
  
  const getColor = (valor, meta, tipo) => {
    const valorNorm = Math.min(100, Math.max(0, valor));
    const metaNorm = Math.min(100, meta);
    
    if (tipo === 'positivo') {
      if (valorNorm >= metaNorm) return '#10b981';
      if (valorNorm >= metaNorm * 0.8) return '#f59e0b';
      return '#ef4444';
    } else {
      if (valorNorm <= metaNorm) return '#10b981';
      if (valorNorm <= metaNorm * 1.2) return '#f59e0b';
      return '#ef4444';
    }
  };
  
  const getRPMColor = (valor, meta, tipo) => {
    const valorNorm = Math.min(100, Math.max(0, valor));
    const metaNorm = Math.min(100, meta);
    
    if (tipo === 'positivo') {
      if (valorNorm >= metaNorm * 1.1) return '#ef4444'; // Zona roja - sobrecalentamiento
      if (valorNorm >= metaNorm) return '#f59e0b'; // Zona amarilla - alta
      if (valorNorm >= metaNorm * 0.7) return '#10b981'; // Zona verde - óptimo
      return '#6b7280'; // Zona gris - bajo
    } else {
      if (valorNorm <= metaNorm * 0.7) return '#ef4444';
      if (valorNorm <= metaNorm) return '#f59e0b';
      if (valorNorm <= metaNorm * 1.3) return '#10b981';
      return '#6b7280';
    }
  };
  
  return (
    <GlassCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Tacómetro de Decisiones
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                RPM - Revoluciones por minuto del negocio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-gray-500">Óptimo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-[10px] text-gray-500">Atención</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] text-gray-500">Crítico</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicadores.map((indicador, idx) => {
            const valorNorm = Math.min(100, Math.max(0, indicador.valor));
            const rpmColor = getRPMColor(indicador.valor, indicador.meta, indicador.tipo);
            const rpmPorcentaje = valorNorm;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: rpmColor }} />
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {indicador.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: rpmColor }}>
                      {Math.round(valorNorm)}{indicador.unidad}
                    </p>
                    <p className="text-[10px] text-gray-500">Meta: {Math.round(indicador.meta)}{indicador.unidad}</p>
                  </div>
                </div>
                
                {/* Tacómetro tipo RPM */}
                <div className="relative h-16 mt-2">
                  {/* Fondo del tacómetro */}
                  <div className="absolute inset-0 flex rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '25%' }} />
                    <div className="h-full bg-green-400" style={{ width: '25%' }} />
                    <div className="h-full bg-yellow-500" style={{ width: '20%' }} />
                    <div className="h-full bg-orange-500" style={{ width: '15%' }} />
                    <div className="h-full bg-red-500" style={{ width: '15%' }} />
                  </div>
                  {/* Aguja del tacómetro */}
                  <motion.div
                    initial={{ left: 0 }}
                    animate={{ left: `${rpmPorcentaje}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                    className="absolute top-0 w-0.5 h-16 bg-white shadow-lg transform -translate-x-1/2"
                    style={{ left: `${rpmPorcentaje}%` }}
                  />
                  {/* Centro */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                </div>
                
                {/* Indicador de zona */}
                <div className="mt-3 flex justify-between text-[10px]">
                  <span className="text-green-600">Óptimo</span>
                  <span className="text-yellow-600">Alerta</span>
                  <span className="text-red-600">Crítico</span>
                </div>
                
                {/* Mensaje de decisión */}
                <div className="mt-3 text-center">
                  {rpmPorcentaje >= 90 ? (
                    <span className="text-xs text-red-600 flex items-center justify-center gap-1">
                      <ArrowTrendingUpIcon className="h-3 w-3" /> ¡Zona Roja! Reducir revoluciones
                    </span>
                  ) : rpmPorcentaje >= 70 ? (
                    <span className="text-xs text-yellow-600 flex items-center justify-center gap-1">
                      <ExclamationTriangleIcon className="h-3 w-3" /> Zona Amarilla - Monitorear
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 flex items-center justify-center gap-1">
                      <CheckCircleIcon className="h-3 w-3" /> Zona Verde - Marcha estable
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Panel de RPM General */}
        <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-red-600 rounded-lg">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Revoluciones del Negocio</p>
              <p className="text-xs text-red-600 dark:text-red-500">
                RPM Actuales: {Math.round(indicadores.reduce((acc, i) => acc + Math.min(100, Math.max(0, i.valor)), 0) / indicadores.length)} / 100
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TacometroDecisiones;