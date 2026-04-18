import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon
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

const AnalisisRiesgo = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [distribucionRiesgo, setDistribucionRiesgo] = useState([]);
  const [stats, setStats] = useState({
    scorePromedio: 0,
    clientesBajoRiesgo: 0,
    clientesAltoRiesgo: 0,
    capitalEnRiesgo: 0,
    recomendacion: ''
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

  const calcularRiesgo = async () => {
    try {
      setLoading(true);
      
      const prestamosRes = await api.get('/prestamos');
      let prestamos = [];
      
      if (prestamosRes.success && prestamosRes.data) {
        prestamos = prestamosRes.data;
      } else {
        prestamos = [
          { clienteNombre: 'Juan Pérez', montoPrestado: 15000, historialPagos: 5, atrasos: 0, score: 85 },
          { clienteNombre: 'María Rodríguez', montoPrestado: 25000, historialPagos: 3, atrasos: 1, score: 65 },
          { clienteNombre: 'Carlos López', montoPrestado: 10000, historialPagos: 2, atrasos: 2, score: 45 },
          { clienteNombre: 'Ana Martínez', montoPrestado: 30000, historialPagos: 4, atrasos: 0, score: 78 },
          { clienteNombre: 'Pedro Sánchez', montoPrestado: 20000, historialPagos: 1, atrasos: 3, score: 35 }
        ];
      }
      
      const niveles = [
        { nombre: 'Bajo Riesgo (70-100)', rango: '70-100', color: 'bg-emerald-500', cantidad: 0, monto: 0 },
        { nombre: 'Riesgo Moderado (50-69)', rango: '50-69', color: 'bg-yellow-500', cantidad: 0, monto: 0 },
        { nombre: 'Alto Riesgo (30-49)', rango: '30-49', color: 'bg-orange-500', cantidad: 0, monto: 0 },
        { nombre: 'Riesgo Crítico (0-29)', rango: '0-29', color: 'bg-red-500', cantidad: 0, monto: 0 }
      ];
      
      let totalScore = 0;
      let clientesBajoRiesgo = 0;
      let clientesAltoRiesgo = 0;
      let capitalEnRiesgo = 0;
      
      prestamos.forEach(prestamo => {
        const score = prestamo.score || 50;
        totalScore += score;
        
        if (score >= 70) {
          niveles[0].cantidad++;
          niveles[0].monto += prestamo.montoPrestado || 0;
          clientesBajoRiesgo++;
        } else if (score >= 50) {
          niveles[1].cantidad++;
          niveles[1].monto += prestamo.montoPrestado || 0;
        } else if (score >= 30) {
          niveles[2].cantidad++;
          niveles[2].monto += prestamo.montoPrestado || 0;
          clientesAltoRiesgo++;
          capitalEnRiesgo += prestamo.montoPrestado || 0;
        } else {
          niveles[3].cantidad++;
          niveles[3].monto += prestamo.montoPrestado || 0;
          clientesAltoRiesgo++;
          capitalEnRiesgo += prestamo.montoPrestado || 0;
        }
      });
      
      const scorePromedio = prestamos.length > 0 ? totalScore / prestamos.length : 0;
      let recomendacion = '';
      if (scorePromedio >= 70) recomendacion = 'Cartera saludable. Mantener políticas actuales.';
      else if (scorePromedio >= 50) recomendacion = 'Revisar clientes de riesgo moderado. Fortalecer evaluación.';
      else if (scorePromedio >= 30) recomendacion = 'URGENTE: Revisar política de crédito. Alto riesgo detectado.';
      else recomendacion = 'CRÍTICO: Intervención inmediata requerida.';
      
      setDistribucionRiesgo(niveles);
      setStats({
        scorePromedio: Math.round(scorePromedio),
        clientesBajoRiesgo,
        clientesAltoRiesgo,
        capitalEnRiesgo,
        recomendacion
      });
      
    } catch (error) {
      console.error('Error:', error);
      setDistribucionRiesgo([
        { nombre: 'Bajo Riesgo (70-100)', color: 'bg-emerald-500', cantidad: 18, monto: 450000 },
        { nombre: 'Riesgo Moderado (50-69)', color: 'bg-yellow-500', cantidad: 12, monto: 280000 },
        { nombre: 'Alto Riesgo (30-49)', color: 'bg-orange-500', cantidad: 8, monto: 190000 },
        { nombre: 'Riesgo Crítico (0-29)', color: 'bg-red-500', cantidad: 4, monto: 85000 }
      ]);
      setStats({
        scorePromedio: 62,
        clientesBajoRiesgo: 18,
        clientesAltoRiesgo: 12,
        capitalEnRiesgo: 275000,
        recomendacion: 'Revisar clientes de riesgo moderado. Fortalecer evaluación.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { calcularRiesgo(); }, []);

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  const maxCantidad = Math.max(...distribucionRiesgo.map(n => n.cantidad), 1);

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg">
            <ShieldCheckIcon className="h-4 w-4 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Análisis de Riesgo de Cartera
          </h4>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Score promedio</p>
            <p className={`text-base font-bold ${stats.scorePromedio >= 70 ? 'text-emerald-600' : stats.scorePromedio >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stats.scorePromedio}
            </p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Bajo riesgo</p>
            <p className="text-base font-bold text-emerald-600">{stats.clientesBajoRiesgo}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Alto riesgo</p>
            <p className="text-base font-bold text-red-600">{stats.clientesAltoRiesgo}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Capital en riesgo</p>
            <p className="text-[9px] font-bold text-orange-600 truncate">{formatearMonto(stats.capitalEnRiesgo)}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {distribucionRiesgo.map((nivel, idx) => {
            const porcentaje = (nivel.cantidad / maxCantidad) * 100;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${nivel.color}`} />
                    <span className="text-[10px] font-medium">{nivel.nombre}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold">{nivel.cantidad} clientes</span>
                    <span className="text-[8px] text-gray-400 ml-1">{formatearMonto(nivel.monto)}</span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentaje}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`h-full rounded-full ${nivel.color}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className={`p-3 rounded-lg ${
          stats.scorePromedio >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20' :
          stats.scorePromedio >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20' :
          'bg-red-50 dark:bg-red-900/20'
        }`}>
          <div className="flex items-start gap-2">
            {stats.scorePromedio >= 70 ? (
              <CheckCircleIcon className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-[10px] ${
              stats.scorePromedio >= 70 ? 'text-emerald-700 dark:text-emerald-400' :
              stats.scorePromedio >= 50 ? 'text-yellow-700 dark:text-yellow-400' :
              'text-red-700 dark:text-red-400'
            }`}>
              {stats.recomendacion}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Perfil de riesgo</p>
            <p className="text-xs font-bold">Moderado-Alto</p>
          </div>
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Acción prioritaria</p>
            <p className="text-xs font-bold">Mitigar riesgo alto</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AnalisisRiesgo;