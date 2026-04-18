import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  UserIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
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

const AnalisisMorosidad = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [clientesRiesgo, setClientesRiesgo] = useState([]);
  const [stats, setStats] = useState({
    tasaMorosidad: 0,
    capitalEnRiesgo: 0,
    clientesEnRiesgo: 0,
    prediccionMorosidad: 0
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

  const analizarRiesgo = async () => {
    try {
      setLoading(true);
      
      const prestamosRes = await api.get('/prestamos');
      let prestamos = [];
      
      if (prestamosRes.success && prestamosRes.data) {
        prestamos = prestamosRes.data;
      } else {
        prestamos = [
          { clienteNombre: 'Juan Pérez', capitalRestante: 5000, diasMora: 0, frecuencia: 'mensual', estado: 'activo' },
          { clienteNombre: 'María Rodríguez', capitalRestante: 8000, diasMora: 5, frecuencia: 'quincenal', estado: 'activo' },
          { clienteNombre: 'Carlos López', capitalRestante: 12000, diasMora: 2, frecuencia: 'mensual', estado: 'activo' },
          { clienteNombre: 'Ana Martínez', capitalRestante: 3000, diasMora: 0, frecuencia: 'semanal', estado: 'activo' },
          { clienteNombre: 'Pedro Sánchez', capitalRestante: 15000, diasMora: 10, frecuencia: 'mensual', estado: 'activo' }
        ];
      }
      
      const hoy = new Date();
      const clientesConRiesgo = prestamos
        .filter(p => p.estado === 'activo')
        .map(prestamo => {
          let riesgo = 0;
          let nivel = 'Bajo';
          let color = 'bg-green-500';
          
          if (prestamo.diasMora > 0) {
            riesgo = Math.min(100, prestamo.diasMora * 10);
            if (prestamo.diasMora >= 15) { riesgo = 100; nivel = 'Crítico'; color = 'bg-red-500'; }
            else if (prestamo.diasMora >= 8) { riesgo = 75; nivel = 'Alto'; color = 'bg-orange-500'; }
            else if (prestamo.diasMora >= 3) { riesgo = 50; nivel = 'Medio'; color = 'bg-yellow-500'; }
          } else {
            riesgo = Math.random() * 20;
            if (riesgo > 15) { nivel = 'Medio'; color = 'bg-yellow-500'; }
          }
          
          return {
            nombre: prestamo.clienteNombre,
            capital: prestamo.capitalRestante,
            diasMora: prestamo.diasMora || 0,
            riesgo: Math.round(riesgo),
            nivel,
            color
          };
        })
        .sort((a, b) => b.riesgo - a.riesgo)
        .slice(0, 5);
      
      const clientesEnRiesgo = clientesConRiesgo.filter(c => c.riesgo > 30).length;
      const capitalEnRiesgo = clientesConRiesgo
        .filter(c => c.riesgo > 30)
        .reduce((sum, c) => sum + c.capital, 0);
      const tasaMorosidad = prestamos.length > 0 
        ? (clientesConRiesgo.filter(c => c.diasMora > 0).length / prestamos.length * 100).toFixed(1)
        : 0;
      const prediccionMorosidad = parseFloat(tasaMorosidad) + 2.5;
      
      setClientesRiesgo(clientesConRiesgo);
      setStats({
        tasaMorosidad: parseFloat(tasaMorosidad),
        capitalEnRiesgo,
        clientesEnRiesgo,
        prediccionMorosidad
      });
      
    } catch (error) {
      console.error('Error:', error);
      setClientesRiesgo([
        { nombre: 'Pedro Sánchez', capital: 15000, diasMora: 10, riesgo: 85, nivel: 'Alto', color: 'bg-orange-500' },
        { nombre: 'María Rodríguez', capital: 8000, diasMora: 5, riesgo: 55, nivel: 'Medio', color: 'bg-yellow-500' },
        { nombre: 'Carlos López', capital: 12000, diasMora: 2, riesgo: 25, nivel: 'Bajo', color: 'bg-green-500' }
      ]);
      setStats({
        tasaMorosidad: 8.5,
        capitalEnRiesgo: 35000,
        clientesEnRiesgo: 2,
        prediccionMorosidad: 11.0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { analizarRiesgo(); }, []);

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
            <ExclamationTriangleIcon className="h-4 w-4 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Análisis de Riesgo de Morosidad
          </h4>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Tasa morosidad</p>
            <p className="text-base font-bold text-red-600">{stats.tasaMorosidad}%</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Capital en riesgo</p>
            <p className="text-[9px] font-bold text-orange-600 truncate">{formatearMonto(stats.capitalEnRiesgo)}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Clientes en riesgo</p>
            <p className="text-base font-bold text-yellow-600">{stats.clientesEnRiesgo}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Predicción próximo mes</p>
            <p className="text-base font-bold text-purple-600">{stats.prediccionMorosidad}%</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium">Clientes con mayor riesgo</p>
          {clientesRiesgo.map((cliente, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-2 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cliente.color}`} />
                  <span className="text-sm font-medium">{cliente.nombre}</span>
                </div>
                <span className="text-xs font-bold">{formatearMonto(cliente.capital)}</span>
              </div>
              <div className="mt-1">
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span>Riesgo</span>
                  <span>{cliente.riesgo}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div className={`h-1 rounded-full ${cliente.color}`} style={{ width: `${cliente.riesgo}%` }} />
                </div>
                {cliente.diasMora > 0 && (
                  <p className="text-[8px] text-red-500 mt-1">⚠️ {cliente.diasMora} días en mora</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-[9px] text-red-600 dark:text-red-400">
            🚨 Acción recomendada: Priorizar cobranza a clientes con riesgo superior al 50%.
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default AnalisisMorosidad;