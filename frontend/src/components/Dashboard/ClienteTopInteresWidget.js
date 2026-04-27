import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  TrophyIcon, 
  CurrencyDollarIcon,
  UserIcon,
  ChartBarIcon,
  FireIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
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
    <div className={`rounded-xl shadow-xl border transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/80 backdrop-blur-lg border-red-600/20 hover:border-red-600/40'
        : 'bg-white/80 backdrop-blur-lg border-red-600/20 hover:border-red-600/40'
    } ${className}`}>
      {children}
    </div>
  );
};

const ClienteTopInteresWidget = ({ 
  prestamos = [], 
  pagos = [], 
  clientes = [], 
  loading = false,
  onRefresh 
}) => {
  const { theme } = useTheme();

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

  // Calcular estadísticas de clientes basado en pagos recibidos por props
  const estadisticasClientes = useMemo(() => {
    console.log('📊 ClienteTopInteresWidget - Procesando datos:');
    console.log('  - Pagos recibidos:', pagos?.length || 0);
    console.log('  - Préstamos recibidos:', prestamos?.length || 0);
    console.log('  - Clientes recibidos:', clientes?.length || 0);
    
    if (!pagos || pagos.length === 0) {
      console.log('⚠️ No hay pagos para procesar');
      return { topInteres: [], topPagos: [], stats: { totalClientes: 0, totalInteresGeneral: 0, totalPagosGeneral: 0 } };
    }

    // Crear mapa de clientes para nombres
    const clientesMap = new Map();
    if (clientes && clientes.length > 0) {
      clientes.forEach(cliente => {
        clientesMap.set(cliente.id, cliente);
        clientesMap.set(cliente.id?.toLowerCase(), cliente);
        if (cliente.email) clientesMap.set(cliente.email.toLowerCase(), cliente);
        if (cliente.cedula) clientesMap.set(cliente.cedula, cliente);
        if (cliente.nombre) clientesMap.set(cliente.nombre.toLowerCase(), cliente);
      });
    }

    // Agrupar pagos por cliente
    const pagosPorCliente = new Map();
    
    pagos.forEach((pago, index) => {
      // Buscar el ID del cliente de diferentes formas
      let clienteId = pago.clienteId || pago.cliente_id || pago.cliente;
      let clienteNombre = pago.clienteNombre || pago.nombreCliente || pago.cliente || 'Cliente';
      
      // Si hay un prestamoID, intentar obtener el cliente del préstamo
      if (!clienteId && pago.prestamoID && prestamos && prestamos.length > 0) {
        const prestamoAsociado = prestamos.find(p => p.id === pago.prestamoID);
        if (prestamoAsociado) {
          clienteId = prestamoAsociado.clienteID;
          clienteNombre = prestamoAsociado.clienteNombre || clienteNombre;
        }
      }
      
      // Intentar obtener nombre del cliente desde el mapa de clientes
      if (clienteId && clientesMap.has(clienteId)) {
        const clienteEncontrado = clientesMap.get(clienteId);
        clienteNombre = clienteEncontrado.nombre || clienteEncontrado.nombres || clienteNombre;
      } else if (clienteId && clientesMap.has(clienteId.toLowerCase())) {
        const clienteEncontrado = clientesMap.get(clienteId.toLowerCase());
        clienteNombre = clienteEncontrado.nombre || clienteEncontrado.nombres || clienteNombre;
      }
      
      // Si no hay ID, intentar buscar por nombre
      if (!clienteId && clienteNombre && clientesMap.has(clienteNombre.toLowerCase())) {
        const clienteEncontrado = clientesMap.get(clienteNombre.toLowerCase());
        clienteId = clienteEncontrado.id;
        clienteNombre = clienteEncontrado.nombre || clienteEncontrado.nombres || clienteNombre;
      }
      
      // Capturar montos correctamente
      const montoInteres = pago.interes || 
                           pago.montoInteres || 
                           pago.interesPagado || 
                           pago.intereses || 
                           0;
      
      const montoCapital = pago.capitalPagado || 
                           pago.montoCapital || 
                           pago.capital || 
                           0;
      
      const montoTotalPago = pago.montoTotal || 
                             pago.montoPago || 
                             pago.monto || 
                             0;
      
      let montoPagadoFinal = 0;
      
      if (pago.montoPagado && pago.montoPagado > 0) {
        montoPagadoFinal = pago.montoPagado;
      } else if (montoTotalPago > 0) {
        montoPagadoFinal = montoTotalPago;
      } else if (montoCapital > 0 || montoInteres > 0) {
        montoPagadoFinal = montoCapital + montoInteres;
      } else if (pago.valor && pago.valor > 0) {
        montoPagadoFinal = pago.valor;
      } else if (pago.amount && pago.amount > 0) {
        montoPagadoFinal = pago.amount;
      }
      
      if (montoInteres > 0) {
        const key = clienteId || clienteNombre;
        if (!pagosPorCliente.has(key)) {
          pagosPorCliente.set(key, {
            id: clienteId,
            nombre: clienteNombre || 'Cliente',
            totalInteres: 0,
            totalPagado: 0,
            cantidadPagos: 0
          });
        }
        
        const cliente = pagosPorCliente.get(key);
        cliente.totalInteres += montoInteres;
        cliente.totalPagado += montoPagadoFinal;
        cliente.cantidadPagos += 1;
      }
    });
    
    // Convertir a array y ordenar
    const clientesArray = Array.from(pagosPorCliente.values());
    
    // Top 3 por interés
    const topInteresArray = [...clientesArray]
      .sort((a, b) => b.totalInteres - a.totalInteres)
      .slice(0, 3)
      .map((cliente, index) => {
        const totalInteresGeneral = clientesArray.reduce((sum, c) => sum + c.totalInteres, 0);
        return {
          ...cliente,
          rank: index + 1,
          porcentaje: totalInteresGeneral > 0 
            ? ((cliente.totalInteres / totalInteresGeneral) * 100).toFixed(1)
            : 0
        };
      });
    
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
    
    return {
      topInteres: topInteresArray,
      topPagos: topPagosArray,
      stats: {
        totalClientes: clientesArray.length,
        totalInteresGeneral,
        totalPagosGeneral
      }
    };
  }, [pagos, prestamos, clientes]);

  const { topInteres, topPagos, stats } = estadisticasClientes;

  // Colores eléctricos para los gráficos
  const electricColors = {
    red: '#ef4444',
    redLight: '#f87171',
    green: '#10b981',
    greenLight: '#34d399',
    blue: '#3b82f6',
    blueLight: '#60a5fa',
    purple: '#8b5cf6',
    purpleLight: '#a78bfa',
    orange: '#f97316',
    orangeLight: '#fb923c',
    cyan: '#06b6d4',
    cyanLight: '#22d3ee'
  };

  // Datos para gráfico de barras - COLORES ELÉCTRICOS
  const barChartData = {
    labels: topInteres.map(c => c.nombre?.length > 15 ? c.nombre.substring(0, 12) + '...' : c.nombre || 'Cliente'),
    datasets: [
      {
        label: 'Interés Pagado (RD$)',
        data: topInteres.map(c => c.totalInteres || 0),
        backgroundColor: [electricColors.red, electricColors.green, electricColors.blue],
        borderColor: [electricColors.redLight, electricColors.greenLight, electricColors.blueLight],
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  // Datos para gráfico de doughnut - COLORES ELÉCTRICOS
  const doughnutData = {
    labels: topInteres.map(c => c.nombre || 'Cliente'),
    datasets: [
      {
        data: topInteres.map(c => c.totalInteres || 0),
        backgroundColor: [electricColors.red, electricColors.green, electricColors.blue, electricColors.purple],
        borderColor: 'transparent',
        borderWidth: 2,
        hoverOffset: 8,
        hoverBackgroundColor: [electricColors.redLight, electricColors.greenLight, electricColors.blueLight, electricColors.purpleLight],
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
          font: { size: 11, weight: 'bold' },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
        titleColor: theme === 'dark' ? '#F3F4F6' : '#111827',
        bodyColor: theme === 'dark' ? '#9CA3AF' : '#4B5563',
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatearMonto(context.raw)}`;
          }
        }
      }
    }
  };

  // Mostrar loading
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

  // Mostrar mensaje si no hay datos
  if (topInteres.length === 0 && topPagos.length === 0) {
    return (
      <GlassCard>
        <div className="p-6 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                <TrophyIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Clientes Destacados
                </h4>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ranking de clientes por interés pagado
                </p>
              </div>
            </div>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Actualizar"
              >
                <ArrowPathIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          <div className="py-8">
            <ExclamationTriangleIcon className={`h-12 w-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No hay pagos con intereses registrados
            </p>
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Los datos se mostrarán cuando haya pagos registrados
            </p>
            {pagos && pagos.length > 0 && (
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                📊 Se encontraron {pagos.length} pagos, pero ninguno tiene intereses registrados
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        {/* Header con botón de actualizar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-lg">
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
          <div className="flex items-center gap-2">
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Total pagos: {pagos?.length || 0}
            </span>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Actualizar"
              >
                <ArrowPathIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Top 3 Clientes por Interés */}
        {topInteres.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                <CurrencyDollarIcon className="h-3 w-3 text-white" />
              </div>
              <h5 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Top Clientes por Interés Pagado
              </h5>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} ml-auto`}>
                Total general: {formatearMonto(stats.totalInteresGeneral)}
              </span>
            </div>
            <div className="space-y-3">
              {topInteres.map((cliente, index) => {
                const colores = {
                  1: 'from-red-500 to-red-700',
                  2: 'from-emerald-500 to-emerald-700',
                  3: 'from-blue-500 to-blue-700'
                };
                const bgColores = {
                  1: theme === 'dark' 
                    ? 'bg-gradient-to-r from-red-950/50 to-transparent border-red-800/50' 
                    : 'bg-gradient-to-r from-red-50 to-transparent border-red-200',
                  2: theme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-950/50 to-transparent border-emerald-800/50'
                    : 'bg-gradient-to-r from-emerald-50 to-transparent border-emerald-200',
                  3: theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-950/50 to-transparent border-blue-800/50'
                    : 'bg-gradient-to-r from-blue-50 to-transparent border-blue-200'
                };
                
                return (
                  <motion.div
                    key={cliente.id || cliente.nombre}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-xl border ${bgColores[cliente.rank]} transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10`}
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
                              en {cliente.cantidadPagos} {cliente.cantidadPagos === 1 ? 'pago' : 'pagos'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          theme === 'dark'
                            ? 'bg-emerald-900/50 text-emerald-300'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {cliente.porcentaje}% del total
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 overflow-hidden`}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${cliente.porcentaje}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-red-500 via-emerald-500 to-blue-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top 3 Clientes por Cantidad de Pagos */}
        {topPagos.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700">
                <FireIcon className="h-3 w-3 text-white" />
              </div>
              <h5 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Top Clientes por Cantidad de Pagos
              </h5>
            </div>
            <div className="space-y-3">
              {topPagos.map((cliente, index) => {
                const colores = {
                  1: 'from-orange-500 to-orange-700',
                  2: 'from-cyan-500 to-cyan-700',
                  3: 'from-purple-500 to-purple-700'
                };
                const bgColores = {
                  1: theme === 'dark'
                    ? 'bg-gradient-to-r from-orange-950/50 to-transparent border-orange-800/50'
                    : 'bg-gradient-to-r from-orange-50 to-transparent border-orange-200',
                  2: theme === 'dark'
                    ? 'bg-gradient-to-r from-cyan-950/50 to-transparent border-cyan-800/50'
                    : 'bg-gradient-to-r from-cyan-50 to-transparent border-cyan-200',
                  3: theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-950/50 to-transparent border-purple-800/50'
                    : 'bg-gradient-to-r from-purple-50 to-transparent border-purple-200'
                };
                
                return (
                  <motion.div
                    key={cliente.id || cliente.nombre}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-xl border ${bgColores[cliente.rank]} transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10`}
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
                              total pagado: {formatearMonto(cliente.totalPagado)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          theme === 'dark'
                            ? 'bg-orange-900/50 text-orange-300'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          🔥 Activo
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gráficos de Comparación */}
        {topInteres.length >= 1 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700">
                <ChartBarIcon className="h-3 w-3 text-white" />
              </div>
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
        )}

        {/* Stats adicionales */}
        <div className={`mt-4 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} grid grid-cols-3 gap-2`}>
          <div className={`p-2 rounded-lg text-center transition-all duration-300 hover:scale-105 ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-center gap-1">
              <UserGroupIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Clientes</p>
            </div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.totalClientes}</p>
          </div>
          <div className={`p-2 rounded-lg text-center transition-all duration-300 hover:scale-105 ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-center gap-1">
              <CurrencyDollarIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total intereses</p>
            </div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {formatearMonto(stats.totalInteresGeneral)}
            </p>
          </div>
          <div className={`p-2 rounded-lg text-center transition-all duration-300 hover:scale-105 ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
          }`}>
            <div className="flex items-center justify-center gap-1">
              <ChartBarIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total pagos</p>
            </div>
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{stats.totalPagosGeneral}</p>
          </div>
        </div>
        
        {/* Información de depuración (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && pagos && pagos.length > 0 && (
          <div className={`mt-4 p-2 rounded-lg text-xs ${
            theme === 'dark' ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-100 text-gray-500'
          }`}>
            <details>
              <summary className="cursor-pointer hover:text-red-500 transition-colors">🔧 Datos de depuración ({pagos.length} pagos)</summary>
              <div className="mt-2 space-y-1 max-h-40 overflow-auto">
                {pagos.slice(0, 5).map((pago, i) => (
                  <div key={i} className={`border-t pt-1 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p><strong>Pago {i+1}:</strong> {pago.clienteNombre || 'Sin cliente'}</p>
                    <p>Interés: RD$ {pago.montoInteres || pago.interes || 0}</p>
                    <p>Capital: RD$ {pago.montoCapital || 0}</p>
                    <p>Total: RD$ {(pago.montoCapital || 0) + (pago.montoInteres || pago.interes || 0)}</p>
                  </div>
                ))}
                {pagos.length > 5 && <p>... y {pagos.length - 5} pagos más</p>}
              </div>
            </details>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ClienteTopInteresWidget;