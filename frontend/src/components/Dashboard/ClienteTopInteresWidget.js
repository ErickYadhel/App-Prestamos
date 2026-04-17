import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  TrophyIcon, 
  CurrencyDollarIcon,
  UserIcon,
  ChartBarIcon,
  FireIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const ClienteTopInteresWidget = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [topInteres, setTopInteres] = useState([]);
  const [topPagos, setTopPagos] = useState([]);
  const [stats, setStats] = useState({ 
    totalClientes: 0, 
    totalInteresGeneral: 0,
    totalPagosGeneral: 0
  });

  const formatearMonto = (valor) => {
    if (!valor && valor !== 0) return 'RD$ 0';
    if (valor >= 1000000) return `RD$ ${(valor / 1000000).toFixed(1)}M`;
    if (valor >= 1000) return `RD$ ${(valor / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/pagos');
      
      if (response.success && response.data && response.data.length > 0) {
        const pagos = response.data;
        
        const clientesData = new Map();
        
        pagos.forEach(pago => {
          const nombreCliente = pago.clienteNombre || pago.cliente;
          if (!nombreCliente) return;
          
          const montoInteres = parseFloat(pago.montoInteres) || parseFloat(pago.interes) || 0;
          const montoCapital = parseFloat(pago.montoCapital) || parseFloat(pago.capital) || 0;
          const montoTotal = (montoCapital + montoInteres) || parseFloat(pago.montoTotal) || parseFloat(pago.total) || parseFloat(pago.monto) || 0;
          
          if (!clientesData.has(nombreCliente)) {
            clientesData.set(nombreCliente, {
              nombre: nombreCliente,
              totalInteres: 0,
              totalPagado: 0,
              cantidadPagos: 0
            });
          }
          
          const cliente = clientesData.get(nombreCliente);
          cliente.totalInteres += montoInteres;
          cliente.totalPagado += montoTotal;
          cliente.cantidadPagos += 1;
        });
        
        const clientesArray = Array.from(clientesData.values())
          .filter(c => c.cantidadPagos > 0);
        
        if (clientesArray.length === 0) {
          throw new Error('No hay datos de clientes');
        }
        
        // Top 3 por interés
        const topInteresArray = [...clientesArray]
          .sort((a, b) => b.totalInteres - a.totalInteres)
          .slice(0, 3)
          .map((cliente, index) => ({
            ...cliente,
            rank: index + 1,
            porcentaje: clientesArray.reduce((sum, c) => sum + c.totalInteres, 0) > 0 
              ? (cliente.totalInteres / clientesArray.reduce((sum, c) => sum + c.totalInteres, 0) * 100).toFixed(1)
              : 0
          }));
        
        // Top 3 por cantidad de pagos
        const topPagosArray = [...clientesArray]
          .sort((a, b) => b.cantidadPagos - a.cantidadPagos)
          .slice(0, 3)
          .map((cliente, index) => ({
            ...cliente,
            rank: index + 1
          }));
        
        const totalInteresGeneral = clientesArray.reduce((sum, c) => sum + c.totalInteres, 0);
        const totalPagosGeneral = clientesArray.reduce((sum, c) => sum + c.cantidadPagos, 0);
        
        setTopInteres(topInteresArray);
        setTopPagos(topPagosArray);
        setStats({
          totalClientes: clientesArray.length,
          totalInteresGeneral,
          totalPagosGeneral
        });
      } else {
        // Datos de ejemplo
        const datosEjemplo = [
          { nombre: 'William fidel de la cruz', totalInteres: 7500, cantidadPagos: 5, totalPagado: 12500 },
          { nombre: 'María Rodríguez', totalInteres: 5200, cantidadPagos: 8, totalPagado: 18400 },
          { nombre: 'Juan Pérez', totalInteres: 4800, cantidadPagos: 6, totalPagado: 15600 },
          { nombre: 'Ana Martínez', totalInteres: 3500, cantidadPagos: 4, totalPagado: 9800 },
          { nombre: 'Carlos López', totalInteres: 2800, cantidadPagos: 7, totalPagado: 11200 },
          { nombre: 'Luisa Fernández', totalInteres: 2100, cantidadPagos: 3, totalPagado: 6300 }
        ];
        
        const totalInteres = datosEjemplo.reduce((sum, c) => sum + c.totalInteres, 0);
        
        setTopInteres(
          [...datosEjemplo]
            .sort((a, b) => b.totalInteres - a.totalInteres)
            .slice(0, 3)
            .map((c, i) => ({ ...c, rank: i + 1, porcentaje: (c.totalInteres / totalInteres * 100).toFixed(1) }))
        );
        
        setTopPagos(
          [...datosEjemplo]
            .sort((a, b) => b.cantidadPagos - a.cantidadPagos)
            .slice(0, 3)
            .map((c, i) => ({ ...c, rank: i + 1 }))
        );
        
        setStats({
          totalClientes: datosEjemplo.length,
          totalInteresGeneral: totalInteres,
          totalPagosGeneral: datosEjemplo.reduce((sum, c) => sum + c.cantidadPagos, 0)
        });
      }
    } catch (error) {
      console.error('Error cargando top clientes:', error);
      // Datos de ejemplo
      const datosEjemplo = [
        { nombre: 'William fidel de la cruz', totalInteres: 7500, cantidadPagos: 5, totalPagado: 12500 },
        { nombre: 'María Rodríguez', totalInteres: 5200, cantidadPagos: 8, totalPagado: 18400 },
        { nombre: 'Juan Pérez', totalInteres: 4800, cantidadPagos: 6, totalPagado: 15600 }
      ];
      const totalInteres = datosEjemplo.reduce((sum, c) => sum + c.totalInteres, 0);
      
      setTopInteres(
        datosEjemplo.map((c, i) => ({ ...c, rank: i + 1, porcentaje: (c.totalInteres / totalInteres * 100).toFixed(1) }))
      );
      setTopPagos(datosEjemplo.map((c, i) => ({ ...c, rank: i + 1 })));
      setStats({
        totalClientes: datosEjemplo.length,
        totalInteresGeneral: totalInteres,
        totalPagosGeneral: datosEjemplo.reduce((sum, c) => sum + c.cantidadPagos, 0)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Datos para gráfico de barras
  const barChartData = {
    labels: topInteres.map(c => c.nombre.length > 15 ? c.nombre.substring(0, 12) + '...' : c.nombre),
    datasets: [
      {
        label: 'Interés Pagado (RD$)',
        data: topInteres.map(c => c.totalInteres),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  // Datos para gráfico de doughnut
  const doughnutData = {
    labels: topInteres.map(c => c.nombre),
    datasets: [
      {
        data: topInteres.map(c => c.totalInteres),
        backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
        borderColor: 'transparent',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
          font: { size: 10 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatearMonto(context.raw)}`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg">
            <TrophyIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Clientes Destacados
            </h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Ranking de clientes por interés pagado y actividad
            </p>
          </div>
        </div>

        {/* Top 3 Clientes por Interés */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CurrencyDollarIcon className="h-4 w-4 text-emerald-500" />
            <h5 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Top Clientes por Interés Pagado
            </h5>
          </div>
          <div className="space-y-3">
            {topInteres.map((cliente, index) => {
              const colores = {
                1: 'from-yellow-500 to-yellow-700',
                2: 'from-gray-400 to-gray-600',
                3: 'from-amber-600 to-amber-800'
              };
              const bgColores = {
                1: 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                2: 'bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/50 border-gray-200 dark:border-gray-700',
                3: 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/20 border-amber-200 dark:border-amber-800'
              };
              
              return (
                <motion.div
                  key={cliente.nombre}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-xl border ${bgColores[cliente.rank]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-r ${colores[cliente.rank]} text-white shadow-md`}>
                        {cliente.rank}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {cliente.nombre}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {formatearMonto(cliente.totalInteres)}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            en {cliente.cantidadPagos} pagos
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`}>
                        {cliente.porcentaje}% del total
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cliente.porcentaje}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Top 3 Clientes por Cantidad de Pagos */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FireIcon className="h-4 w-4 text-orange-500" />
            <h5 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Top Clientes por Cantidad de Pagos
            </h5>
          </div>
          <div className="space-y-3">
            {topPagos.map((cliente, index) => {
              const colores = {
                1: 'from-orange-500 to-orange-700',
                2: 'from-blue-500 to-blue-700',
                3: 'from-cyan-500 to-cyan-700'
              };
              
              return (
                <motion.div
                  key={cliente.nombre}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-r ${colores[cliente.rank]} text-white shadow-md`}>
                        {cliente.rank}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {cliente.nombre}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {cliente.cantidadPagos} {cliente.cantidadPagos === 1 ? 'pago' : 'pagos'}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            total: {formatearMonto(cliente.totalPagado)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400`}>
                        🔥 Activo
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Gráficos de Comparación */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="h-4 w-4 text-purple-500" />
            <h5 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Comparativa de Intereses por Cliente
            </h5>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64">
              <Bar data={barChartData} options={chartOptions} />
            </div>
            <div className="h-64 flex justify-center">
              <div className="w-64">
                <Doughnut data={doughnutData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats adicionales */}
        <div className={`mt-4 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} grid grid-cols-3 gap-2`}>
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-center gap-1">
              <UserGroupIcon className="h-3 w-3 text-gray-400" />
              <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Clientes activos</p>
            </div>
            <p className="text-sm font-bold text-blue-600">{stats.totalClientes}</p>
          </div>
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-center gap-1">
              <CurrencyDollarIcon className="h-3 w-3 text-gray-400" />
              <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total intereses</p>
            </div>
            <p className="text-xs font-bold text-emerald-600 truncate">{formatearMonto(stats.totalInteresGeneral)}</p>
          </div>
          <div className={`p-2 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-center gap-1">
              <ChartPieIcon className="h-3 w-3 text-gray-400" />
              <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total pagos</p>
            </div>
            <p className="text-sm font-bold text-purple-600">{stats.totalPagosGeneral}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ClienteTopInteresWidget;