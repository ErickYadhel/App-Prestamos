import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  ChartBarIcon, 
  TrophyIcon, 
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
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

const Benchmarking = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState([]);
  const [stats, setStats] = useState({
    desempenoGeneral: 0,
    areasFuertes: 0,
    areasMejora: 0,
    ranking: 0
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
      
      const metricasData = [
        { nombre: 'Tasa de aprobación', actual: 68, meta: 75, industria: 65, icon: CheckCircleIcon, color: 'from-blue-500 to-blue-700' },
        { nombre: 'Tasa de morosidad', actual: 8.5, meta: 5, industria: 9, icon: ChartBarIcon, color: 'from-red-500 to-red-700', invertido: true },
        { nombre: 'ROA', actual: 12, meta: 15, industria: 10, icon: CurrencyDollarIcon, color: 'from-emerald-500 to-emerald-700' },
        { nombre: 'Eficiencia cobranza', actual: 85, meta: 90, industria: 78, icon: UserGroupIcon, color: 'from-purple-500 to-purple-700' },
        { nombre: 'Retención clientes', actual: 72, meta: 80, industria: 68, icon: TrophyIcon, color: 'from-orange-500 to-orange-700' },
        { nombre: 'Tiempo aprobación (días)', actual: 3, meta: 2, industria: 5, icon: ArrowTrendingUpIcon, color: 'from-cyan-500 to-cyan-700', invertido: true }
      ];
      
      let areasFuertes = 0;
      let areasMejora = 0;
      let sumaPosicion = 0;
      
      const metricasConComparacion = metricasData.map(metrica => {
        const vsIndustria = metrica.invertido 
          ? ((metrica.industria - metrica.actual) / metrica.industria * 100)
          : ((metrica.actual - metrica.industria) / metrica.industria * 100);
        const vsMeta = metrica.invertido
          ? ((metrica.meta - metrica.actual) / metrica.meta * 100)
          : ((metrica.actual - metrica.meta) / metrica.meta * 100);
        
        let status = '';
        let statusColor = '';
        if (vsIndustria >= 10) { status = 'Excelente'; statusColor = 'text-emerald-600'; areasFuertes++; }
        else if (vsIndustria >= 0) { status = 'Bueno'; statusColor = 'text-blue-600'; areasFuertes++; }
        else if (vsIndustria >= -10) { status = 'Regular'; statusColor = 'text-yellow-600'; areasMejora++; }
        else { status = 'Crítico'; statusColor = 'text-red-600'; areasMejora++; }
        
        sumaPosicion += vsIndustria;
        
        return {
          ...metrica,
          vsIndustria: vsIndustria.toFixed(1),
          vsMeta: vsMeta.toFixed(1),
          status,
          statusColor
        };
      });
      
      const desempenoGeneral = (sumaPosicion / metricasData.length) + 50;
      const ranking = Math.floor(Math.random() * 20) + 1;
      
      setMetricas(metricasConComparacion);
      setStats({
        desempenoGeneral: Math.round(desempenoGeneral),
        areasFuertes,
        areasMejora,
        ranking
      });
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg">
              <TrophyIcon className="h-4 w-4 text-white" />
            </div>
            <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Benchmarking vs Industria
            </h4>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${stats.desempenoGeneral >= 70 ? 'bg-emerald-100 text-emerald-700' : stats.desempenoGeneral >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            Score: {stats.desempenoGeneral}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Ranking vs industria</p>
            <p className="text-base font-bold text-yellow-600">#{stats.ranking}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Áreas fuertes</p>
            <p className="text-base font-bold text-emerald-600">{stats.areasFuertes}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Áreas por mejorar</p>
            <p className="text-base font-bold text-red-600">{stats.areasMejora}</p>
          </div>
        </div>

        <div className="space-y-3">
          {metricas.map((metrica, idx) => {
            const Icon = metrica.icon;
            const porcentaje = Math.min(100, Math.max(0, 50 + parseFloat(metrica.vsIndustria)));
            const barColor = metrica.vsIndustria >= 10 ? 'bg-emerald-500' : metrica.vsIndustria >= 0 ? 'bg-blue-500' : metrica.vsIndustria >= -10 ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-2 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-lg bg-gradient-to-r ${metrica.color}`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[10px] font-medium">{metrica.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold ${metrica.statusColor}`}>{metrica.status}</span>
                    <span className="text-[9px] text-gray-400">{metrica.vsIndustria}% vs industria</span>
                  </div>
                </div>
                <div className="relative h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentaje}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-[8px] text-gray-400">Actual: {metrica.invertido ? metrica.actual : metrica.actual}{!metrica.invertido && metrica.nombre.includes('tasa') ? '%' : metrica.nombre.includes('días') ? ' días' : ''}</p>
                  <p className="text-[8px] text-gray-400">Industria: {metrica.invertido ? metrica.industria : metrica.industria}{!metrica.invertido && metrica.nombre.includes('tasa') ? '%' : metrica.nombre.includes('días') ? ' días' : ''}</p>
                  <p className="text-[8px] text-gray-400">Meta: {metrica.meta}{!metrica.invertido && metrica.nombre.includes('tasa') ? '%' : metrica.nombre.includes('días') ? ' días' : ''}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <p className="text-[9px] text-yellow-600 dark:text-yellow-400">
            💡 Enfoque: Mejorar {metricas.filter(m => m.status === 'Crítico' || m.status === 'Regular').map(m => m.nombre).join(', ')} para alcanzar top 10 del sector.
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default Benchmarking;