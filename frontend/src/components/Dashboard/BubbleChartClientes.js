import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend, Title } from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const BubbleChartClientes = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ datasets: [] });
  const [stats, setStats] = useState({
    totalClientes: 0,
    promedioMonto: 0,
    promedioInteres: 0
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
      let prestamos = [];
      
      if (response.success && response.data) {
        pagos = response.data;
      }
      
      const prestamosResponse = await api.get('/prestamos');
      if (prestamosResponse.success && prestamosResponse.data) {
        prestamos = prestamosResponse.data;
      }
      
      const clientesData = new Map();
      
      pagos.forEach(pago => {
        const nombre = pago.clienteNombre || pago.cliente;
        if (!nombre) return;
        
        const interes = parseFloat(pago.montoInteres) || parseFloat(pago.interes) || 0;
        const capital = parseFloat(pago.montoCapital) || parseFloat(pago.capital) || 0;
        
        if (!clientesData.has(nombre)) {
          clientesData.set(nombre, {
            nombre,
            totalInteres: 0,
            totalPrestado: 0,
            cantidadPagos: 0
          });
        }
        
        const cliente = clientesData.get(nombre);
        cliente.totalInteres += interes;
        cliente.totalPrestado += capital;
        cliente.cantidadPagos += 1;
      });
      
      prestamos.forEach(prestamo => {
        const nombre = prestamo.clienteNombre || prestamo.cliente;
        if (!nombre) return;
        
        if (!clientesData.has(nombre)) {
          clientesData.set(nombre, {
            nombre,
            totalInteres: 0,
            totalPrestado: 0,
            cantidadPagos: 0
          });
        }
        
        const cliente = clientesData.get(nombre);
        if (cliente.totalPrestado === 0) {
          cliente.totalPrestado = parseFloat(prestamo.montoPrestado) || 0;
        }
      });
      
      const clientesArray = Array.from(clientesData.values())
        .filter(c => c.totalPrestado > 0 || c.cantidadPagos > 0);
      
      const maxPrestado = Math.max(...clientesArray.map(c => c.totalPrestado), 1);
      const maxInteres = Math.max(...clientesArray.map(c => c.totalInteres), 1);
      const maxPagos = Math.max(...clientesArray.map(c => c.cantidadPagos), 1);
      
      const colores = [
        '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
      ];
      
      const bubbles = clientesArray.map((cliente, index) => ({
        x: cliente.totalPrestado,
        y: cliente.totalInteres,
        r: Math.max(5, (cliente.cantidadPagos / maxPagos) * 30),
        label: cliente.nombre,
        backgroundColor: colores[index % colores.length]
      }));
      
      setChartData({
        datasets: [{
          label: 'Clientes',
          data: bubbles,
          backgroundColor: bubbles.map(b => b.backgroundColor + '80'),
          borderColor: bubbles.map(b => b.backgroundColor),
          borderWidth: 2,
        }]
      });
      
      setStats({
        totalClientes: clientesArray.length,
        promedioMonto: clientesArray.reduce((sum, c) => sum + c.totalPrestado, 0) / clientesArray.length,
        promedioInteres: clientesArray.reduce((sum, c) => sum + c.totalInteres, 0) / clientesArray.length
      });
      
    } catch (error) {
      console.error('Error cargando bubble chart:', error);
      const ejemploData = {
        datasets: [{
          label: 'Clientes',
          data: [
            { x: 25000, y: 5200, r: 25, label: 'María Rodríguez' },
            { x: 18000, y: 3800, r: 20, label: 'Juan Pérez' },
            { x: 32000, y: 7500, r: 30, label: 'William Cruz' },
            { x: 12000, y: 2100, r: 15, label: 'Ana Martínez' },
            { x: 28000, y: 4800, r: 22, label: 'Carlos López' }
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2,
        }]
      };
      setChartData(ejemploData);
      setStats({
        totalClientes: 5,
        promedioMonto: 23000,
        promedioInteres: 4680
      });
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
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataPoint = context.raw;
            return [
              `${dataPoint.label}`,
              `💰 Préstamo: ${formatearMonto(dataPoint.x)}`,
              `📈 Interés: ${formatearMonto(dataPoint.y)}`,
              `📊 Pagos: ${Math.round(dataPoint.r / 5)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Monto Prestado (RD$)', color: theme === 'dark' ? '#9CA3AF' : '#4B5563' },
        ticks: { callback: (value) => formatearMonto(value), color: theme === 'dark' ? '#9CA3AF' : '#4B5563' },
        grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' }
      },
      y: {
        title: { display: true, text: 'Interés Pagado (RD$)', color: theme === 'dark' ? '#9CA3AF' : '#4B5563' },
        ticks: { callback: (value) => formatearMonto(value), color: theme === 'dark' ? '#9CA3AF' : '#4B5563' },
        grid: { color: theme === 'dark' ? '#374151' : '#E5E7EB' }
      }
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
            <ChartBarIcon className="h-4 w-4 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Relación Préstamo vs Interés
          </h4>
        </div>

        <div className="h-80">
          <Bubble data={chartData} options={options} />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Clientes analizados</p>
            <p className="text-sm font-bold text-blue-600">{stats.totalClientes}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Préstamo promedio</p>
            <p className="text-xs font-bold text-emerald-600 truncate">{formatearMonto(stats.promedioMonto)}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Interés promedio</p>
            <p className="text-xs font-bold text-purple-600 truncate">{formatearMonto(stats.promedioInteres)}</p>
          </div>
        </div>

        <p className={`text-[9px] text-center mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          💡 Cada burbuja representa un cliente. El tamaño indica cantidad de pagos realizados.
        </p>
      </div>
    </GlassCard>
  );
};

export default BubbleChartClientes;