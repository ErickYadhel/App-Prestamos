import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  ClockIcon, 
  ChartBarIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const CicloVidaPrestamo = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [etapas, setEtapas] = useState([]);
  const [stats, setStats] = useState({
    tiempoPromedioTotal: 0,
    etapaMasLenta: '',
    eficiencia: 0
  });

  const formatearTiempo = (dias) => {
    if (dias < 1) return `${Math.round(dias * 24)} horas`;
    if (dias < 30) return `${Math.round(dias)} días`;
    if (dias < 365) return `${Math.round(dias / 30)} meses`;
    return `${Math.round(dias / 365)} años`;
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const etapasData = [
        { nombre: 'Solicitud', tiempo: 2, color: 'bg-blue-500', icon: DocumentTextIcon, promedio: 2.5 },
        { nombre: 'Evaluación', tiempo: 3, color: 'bg-purple-500', icon: ChartBarIcon, promedio: 3.2 },
        { nombre: 'Aprobación', tiempo: 1, color: 'bg-yellow-500', icon: CheckCircleIcon, promedio: 1.5 },
        { nombre: 'Desembolso', tiempo: 2, color: 'bg-emerald-500', icon: ArrowPathIcon, promedio: 2.8 },
        { nombre: 'Pagos', tiempo: 90, color: 'bg-green-500', icon: ClockIcon, promedio: 85 }
      ];
      
      const totalDias = etapasData.reduce((sum, e) => sum + e.tiempo, 0);
      const etapaMasLenta = etapasData.reduce((max, e) => e.tiempo > max.tiempo ? e : max, etapasData[0]);
      const eficiencia = (etapasData[3].tiempo / etapasData[0].tiempo) * 100;
      
      setEtapas(etapasData);
      setStats({
        tiempoPromedioTotal: totalDias,
        etapaMasLenta: etapaMasLenta.nombre,
        eficiencia: Math.round(eficiencia)
      });
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  const maxTiempo = Math.max(...etapas.map(e => e.tiempo));

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg">
            <ClockIcon className="h-4 w-4 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Ciclo de Vida del Préstamo
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Tiempo promedio total</p>
            <p className="text-sm font-bold text-blue-600">{formatearTiempo(stats.tiempoPromedioTotal)}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Etapa más lenta</p>
            <p className="text-xs font-bold text-orange-600">{stats.etapaMasLenta}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Eficiencia</p>
            <p className="text-sm font-bold text-emerald-600">{stats.eficiencia}%</p>
          </div>
        </div>

        <div className="space-y-3">
          {etapas.map((etapa, idx) => {
            const Icon = etapa.icon;
            const ancho = (etapa.tiempo / maxTiempo) * 100;
            const isLenta = etapa.nombre === stats.etapaMasLenta;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-lg ${etapa.color}`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-medium">{etapa.nombre}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold">{formatearTiempo(etapa.tiempo)}</span>
                    {isLenta && (
                      <span className="ml-1 text-[8px] text-red-500">⚠️</span>
                    )}
                  </div>
                </div>
                <div className="relative h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ancho}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={`h-full rounded-full ${etapa.color} flex items-center justify-end pr-2`}
                  >
                    <span className="text-[8px] font-bold text-white">{Math.round(ancho)}%</span>
                  </motion.div>
                </div>
                {idx < etapas.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ArrowPathIcon className="h-3 w-3 text-gray-400 animate-pulse" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-[9px] text-blue-600 dark:text-blue-400">
            💡 Optimizar la etapa de {stats.etapaMasLenta} podría reducir el ciclo total en un 30%.
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default CicloVidaPrestamo;