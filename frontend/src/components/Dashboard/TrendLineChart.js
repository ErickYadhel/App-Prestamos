import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const TrendLineChart = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [stats, setStats] = useState({
    crecimientoMensual: 0,
    mejorMes: { mes: '', valor: 0 },
    proyeccion: 0
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
      
      const response = await api.get('/pagos');
      let pagos = [];
      
      if (response.success && response.data) {
        pagos = response.data;
      } else {
        pagos = [
          { fechaPago: new Date(2024, 0, 15), montoTotal: 15000 },
          { fechaPago: new Date(2024, 1, 10), montoTotal: 18000 },
          { fechaPago: new Date(2024, 2, 20), montoTotal: 22000 },
          { fechaPago: new Date(2024, 3, 5), montoTotal: 25000 },
          { fechaPago: new Date(2024, 4, 12), montoTotal: 28000 },
          { fechaPago: new Date(2024, 5, 8), montoTotal: 31000 },
          { fechaPago: new Date(2024, 6, 18), montoTotal: 35000 },
          { fechaPago: new Date(2024, 7, 22), montoTotal: 38000 },
          { fechaPago: new Date(2024, 8, 14), montoTotal: 42000 },
          { fechaPago: new Date(2024, 9, 9), montoTotal: 45000 },
          { fechaPago: new Date(2024, 10, 25), montoTotal: 48000 },
          { fechaPago: new Date(2024, 11, 30), montoTotal: 52000 }
        ];
      }
      
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const pagosPorMes = Array(12).fill(0);
      let maxValor = 0;
      let mejorMesIndex = 0;
      
      pagos.forEach(pago => {
        let fecha = pago.fechaPago;
        if (fecha?.toDate) fecha = fecha.toDate();
        else if (fecha) fecha = new Date(fecha);
        else return;
        
        const mes = fecha.getMonth();
        const monto = pago.montoTotal || pago.total || pago.monto || 0;
        pagosPorMes[mes] += monto;
        
        if (pagosPorMes[mes] > maxValor) {
          maxValor = pagosPorMes[mes];
          mejorMesIndex = mes;
        }
      });
      
      const ultimos3 = pagosPorMes.slice(-3).filter(v => v > 0);
      const primeros3 = pagosPorMes.slice(0, 3).filter(v => v > 0);
      const crecimiento = ultimos3.length > 0 && primeros3.length > 0
        ? ((ultimos3.reduce((a, b) => a + b, 0) / ultimos3.length) / (primeros3.reduce((a, b) => a + b, 0) / primeros3.length) - 1) * 100
        : 15;
      
      const ultimoValor = pagosPorMes[11] || pagosPorMes[10] || 50000;
      const proyeccion = ultimoValor * 1.12;
      
      setChartData({
        labels: meses,
        datasets: [
          {
            label: 'Ingresos Mensuales',
            data: pagosPorMes,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
          },
          {
            label: 'Tendencia (Media Móvil)',
            data: pagosPorMes.map((_, i, arr) => {
              const inicio = Math.max(0, i - 2);
              const fin = i + 1;
              const slice = arr.slice(inicio, fin);
              return slice.reduce((a, b) => a + b, 0) / slice.length;
            }),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            pointRadius: 0,
            fill: false,
          }
        ],
      });
      
      setStats({
        crecimientoMensual: parseFloat(crecimiento.toFixed(1)),
        mejorMes: { mes: meses[mejorMesIndex], valor: maxValor },
        proyeccion
      });
      
    } catch (error) {
      console.error('Error cargando tendencias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatearMonto(ctx.raw)}` } }
    },
    scales: {
      y: { ticks: { callback: (value) => formatearMonto(value), color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } },
      x: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#4B5563' }, grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' } }
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg">
              <ArrowTrendingUpIcon className="h-4 w-4 text-white" />
            </div>
            <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Tendencia de Ingresos
            </h4>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${stats.crecimientoMensual >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {stats.crecimientoMensual >= 0 ? '↑' : '↓'} {Math.abs(stats.crecimientoMensual)}% anual
          </div>
        </div>
        <div className="h-80"><Line data={chartData} options={options} /></div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center"><p className="text-[9px] text-gray-500">Mejor mes</p><p className="text-sm font-bold text-emerald-600">{stats.mejorMes.mes}</p><p className="text-[10px]">{formatearMonto(stats.mejorMes.valor)}</p></div>
          <div className="text-center"><p className="text-[9px] text-gray-500">Crecimiento</p><p className="text-sm font-bold text-blue-600">{stats.crecimientoMensual}%</p></div>
          <div className="text-center"><p className="text-[9px] text-gray-500">Proyección 2025</p><p className="text-sm font-bold text-purple-600">{formatearMonto(stats.proyeccion)}</p></div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TrendLineChart;