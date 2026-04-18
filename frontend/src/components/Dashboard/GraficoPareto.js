import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const GraficoPareto = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [topClientes, setTopClientes] = useState([]);
  const [stats, setStats] = useState({
    top20Porcentaje: 0,
    top20Monto: 0,
    clientesNecesarios: 0,
    principioCumple: false
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
      
      const pagosRes = await api.get('/pagos');
      let pagos = [];
      
      if (pagosRes.success && pagosRes.data) {
        pagos = pagosRes.data;
      } else {
        pagos = [
          { clienteNombre: 'Juan Pérez', montoTotal: 15000 },
          { clienteNombre: 'María Rodríguez', montoTotal: 12000 },
          { clienteNombre: 'Carlos López', montoTotal: 10000 },
          { clienteNombre: 'Ana Martínez', montoTotal: 8000 },
          { clienteNombre: 'Pedro Sánchez', montoTotal: 7000 },
          { clienteNombre: 'Luis Fernández', montoTotal: 5000 },
          { clienteNombre: 'Carmen Gómez', montoTotal: 4000 },
          { clienteNombre: 'José Díaz', montoTotal: 3000 },
          { clienteNombre: 'Marta Reyes', montoTotal: 2000 },
          { clienteNombre: 'Rosa Jiménez', montoTotal: 1000 }
        ];
      }
      
      const clientesMap = new Map();
      
      pagos.forEach(pago => {
        const nombre = pago.clienteNombre || pago.cliente;
        if (!nombre) return;
        
        const monto = pago.montoTotal || pago.total || pago.monto || 0;
        
        if (!clientesMap.has(nombre)) {
          clientesMap.set(nombre, { nombre, montoTotal: 0 });
        }
        
        clientesMap.get(nombre).montoTotal += monto;
      });
      
      const clientesArray = Array.from(clientesMap.values())
        .sort((a, b) => b.montoTotal - a.montoTotal);
      
      const totalMonto = clientesArray.reduce((sum, c) => sum + c.montoTotal, 0);
      let acumulado = 0;
      let top20Count = Math.ceil(clientesArray.length * 0.2);
      let top20Monto = 0;
      
      const clientesConPorcentaje = clientesArray.map((cliente, idx) => {
        acumulado += cliente.montoTotal;
        const porcentajeAcumulado = (acumulado / totalMonto) * 100;
        if (idx < top20Count) top20Monto += cliente.montoTotal;
        return {
          ...cliente,
          porcentajeIndividual: (cliente.montoTotal / totalMonto * 100).toFixed(1),
          porcentajeAcumulado: porcentajeAcumulado.toFixed(1)
        };
      });
      
      const top20Porcentaje = (top20Monto / totalMonto) * 100;
      let clientesNecesarios = 0;
      let acumulado80 = 0;
      for (let i = 0; i < clientesConPorcentaje.length; i++) {
        acumulado80 += clientesConPorcentaje[i].montoTotal;
        clientesNecesarios++;
        if (acumulado80 / totalMonto >= 0.8) break;
      }
      
      setTopClientes(clientesConPorcentaje.slice(0, 10));
      setStats({
        top20Porcentaje: top20Porcentaje.toFixed(1),
        top20Monto,
        clientesNecesarios,
        principioCumple: clientesNecesarios <= Math.ceil(clientesArray.length * 0.2)
      });
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const barChartData = {
    labels: topClientes.map(c => c.nombre.length > 12 ? c.nombre.substring(0, 10) + '...' : c.nombre),
    datasets: [
      {
        label: 'Monto por Cliente',
        data: topClientes.map(c => c.montoTotal),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
        yAxisID: 'y',
      },
      {
        label: 'Porcentaje Acumulado (%)',
        data: topClientes.map(c => c.porcentajeAcumulado),
        type: 'line',
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' } },
      tooltip: { callbacks: { label: (ctx) => ctx.dataset.label === 'Monto por Cliente' ? formatearMonto(ctx.raw) : `${ctx.raw}%` } }
    },
    scales: {
      y: { title: { display: true, text: 'Monto (RD$)' }, ticks: { callback: (v) => formatearMonto(v) }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } },
      y1: { position: 'right', title: { display: true, text: 'Porcentaje Acumulado (%)' }, ticks: { callback: (v) => v + '%' }, grid: { drawOnChartArea: false } },
      x: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } }
    }
  };

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg">
            <TrophyIcon className="h-4 w-4 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Principio de Pareto (80/20)
          </h4>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Top 20% genera</p>
            <p className="text-base font-bold text-emerald-600">{stats.top20Porcentaje}%</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Monto top 20%</p>
            <p className="text-[9px] font-bold text-blue-600 truncate">{formatearMonto(stats.top20Monto)}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Clientes para 80%</p>
            <p className="text-base font-bold text-orange-600">{stats.clientesNecesarios}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Cumple Pareto</p>
            <p className="text-base font-bold text-purple-600">{stats.principioCumple ? '✅ Sí' : '❌ No'}</p>
          </div>
        </div>

        <div className="h-64"><Bar data={barChartData} options={options} /></div>

        <div className="mt-3 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <p className="text-[9px] text-yellow-600 dark:text-yellow-400">
            💡 El {stats.top20Porcentaje}% de los ingresos proviene del top 20% de clientes. {stats.principioCumple ? '✅ Se cumple el principio de Pareto.' : '⚠️ No se cumple estrictamente el 80/20.'}
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default GraficoPareto;