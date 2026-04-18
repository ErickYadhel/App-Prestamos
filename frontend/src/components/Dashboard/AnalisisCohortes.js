import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  CalendarIcon,
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

const AnalisisCohortes = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [cohortes, setCohortes] = useState([]);
  const [stats, setStats] = useState({
    retencionPromedio: 0,
    mejorCohorte: '',
    peorCohorte: '',
    tendencia: 0
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
      const cohortesData = [
        { mes: 'Ene 2024', clientes: 45, mes1: 100, mes2: 85, mes3: 78, mes4: 72, mes5: 68, mes6: 65 },
        { mes: 'Feb 2024', clientes: 52, mes1: 100, mes2: 82, mes3: 75, mes4: 70, mes5: 66, mes6: 62 },
        { mes: 'Mar 2024', clientes: 48, mes1: 100, mes2: 88, mes3: 80, mes4: 74, mes5: 70, mes6: 0 },
        { mes: 'Abr 2024', clientes: 60, mes1: 100, mes2: 85, mes3: 78, mes4: 72, mes5: 0, mes6: 0 },
        { mes: 'May 2024', clientes: 55, mes1: 100, mes2: 90, mes3: 82, mes4: 0, mes5: 0, mes6: 0 },
        { mes: 'Jun 2024', clientes: 50, mes1: 100, mes2: 88, mes3: 0, mes4: 0, mes5: 0, mes6: 0 }
      ];
      
      const retencionPromedio = cohortesData.reduce((sum, c) => {
        const valores = [c.mes1, c.mes2, c.mes3, c.mes4, c.mes5, c.mes6].filter(v => v > 0);
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
        return sum + promedio;
      }, 0) / cohortesData.length;
      
      const mejorCohorte = cohortesData.reduce((best, c) => {
        const retBest = [c.mes2, c.mes3, c.mes4, c.mes5, c.mes6].filter(v => v > 0).reduce((a, b) => a + b, 0) / 5;
        const retCurrent = [best.mes2, best.mes3, best.mes4, best.mes5, best.mes6].filter(v => v > 0).reduce((a, b) => a + b, 0) / 5;
        return retCurrent > retBest ? best : c;
      }, cohortesData[0]);
      
      const peorCohorte = cohortesData.reduce((worst, c) => {
        const retWorst = [c.mes2, c.mes3, c.mes4, c.mes5, c.mes6].filter(v => v > 0).reduce((a, b) => a + b, 0) / 5;
        const retCurrent = [worst.mes2, worst.mes3, worst.mes4, worst.mes5, worst.mes6].filter(v => v > 0).reduce((a, b) => a + b, 0) / 5;
        return retCurrent < retWorst ? worst : c;
      }, cohortesData[0]);
      
      setCohortes(cohortesData);
      setStats({
        retencionPromedio: retencionPromedio.toFixed(1),
        mejorCohorte: mejorCohorte.mes,
        peorCohorte: peorCohorte.mes,
        tendencia: 5.2
      });
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const meses = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'];

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  return (
    <GlassCard>
      <div className="p-4 overflow-x-auto">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg">
            <UserGroupIcon className="h-4 w-4 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Análisis de Cohortes (Retención)
          </h4>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Retención promedio</p>
            <p className="text-base font-bold text-blue-600">{stats.retencionPromedio}%</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Mejor cohorte</p>
            <p className="text-xs font-bold text-emerald-600">{stats.mejorCohorte}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Peor cohorte</p>
            <p className="text-xs font-bold text-red-600">{stats.peorCohorte}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Tendencia</p>
            <p className="text-base font-bold text-green-600">+{stats.tendencia}%</p>
          </div>
        </div>

        <table className="w-full text-[10px]">
          <thead>
            <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
              <th className="p-1 text-left">Cohorte</th>
              <th className="p-1 text-center">Clientes</th>
              {meses.map((m, i) => <th key={i} className="p-1 text-center">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {cohortes.map((cohorte, idx) => (
              <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-1 font-medium">{cohorte.mes}</td>
                <td className="p-1 text-center">{cohorte.clientes}</td>
                <td className="p-1 text-center bg-emerald-100 dark:bg-emerald-900/30">{cohorte.mes1}%</td>
                <td className={`p-1 text-center ${cohorte.mes2 >= 85 ? 'bg-emerald-100 dark:bg-emerald-900/30' : cohorte.mes2 >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>{cohorte.mes2}%</td>
                <td className={`p-1 text-center ${cohorte.mes3 >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30' : cohorte.mes3 >= 65 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>{cohorte.mes3}%</td>
                <td className={`p-1 text-center ${cohorte.mes4 >= 75 ? 'bg-emerald-100 dark:bg-emerald-900/30' : cohorte.mes4 >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>{cohorte.mes4}%</td>
                <td className={`p-1 text-center ${cohorte.mes5 >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30' : cohorte.mes5 >= 55 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>{cohorte.mes5}%</td>
                <td className={`p-1 text-center ${cohorte.mes6 >= 65 ? 'bg-emerald-100 dark:bg-emerald-900/30' : cohorte.mes6 >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>{cohorte.mes6}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
          <p className="text-[9px] text-indigo-600 dark:text-indigo-400">
            💡 La retención a 6 meses es del {stats.retencionPromedio}%. La cohorte de {stats.mejorCohorte} tiene la mejor retención.
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default AnalisisCohortes;