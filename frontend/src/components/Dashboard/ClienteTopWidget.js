import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  TrophyIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const ClienteTopWidget = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [topInteres, setTopInteres] = useState({ nombre: '', totalInteres: 0, cantidadPagos: 0 });
  const [topPagos, setTopPagos] = useState({ nombre: '', cantidadPagos: 0, totalPagado: 0 });
  const [stats, setStats] = useState({ totalClientes: 0, promedioPagos: 0 });

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
      
      // Intentar cargar desde API
      const response = await api.get('/pagos');
      
      if (response.success && response.data) {
        const pagos = response.data;
        
        // Calcular por cliente
        const clientesData = {};
        
        pagos.forEach(pago => {
          const nombreCliente = pago.clienteNombre || pago.cliente || 'Cliente';
          const montoInteres = pago.montoInteres || pago.interes || 0;
          const montoTotal = pago.montoTotal || pago.total || pago.monto || 0;
          
          if (!clientesData[nombreCliente]) {
            clientesData[nombreCliente] = {
              totalInteres: 0,
              totalPagado: 0,
              cantidadPagos: 0
            };
          }
          
          clientesData[nombreCliente].totalInteres += montoInteres;
          clientesData[nombreCliente].totalPagado += montoTotal;
          clientesData[nombreCliente].cantidadPagos += 1;
        });
        
        // Top por interés
        let topInteresCliente = { nombre: '', totalInteres: 0, cantidadPagos: 0 };
        let topPagosCliente = { nombre: '', cantidadPagos: 0, totalPagado: 0 };
        let totalClientes = 0;
        let totalPagos = 0;
        
        Object.entries(clientesData).forEach(([nombre, data]) => {
          totalClientes++;
          totalPagos += data.cantidadPagos;
          
          if (data.totalInteres > topInteresCliente.totalInteres) {
            topInteresCliente = { nombre, totalInteres: data.totalInteres, cantidadPagos: data.cantidadPagos };
          }
          
          if (data.cantidadPagos > topPagosCliente.cantidadPagos) {
            topPagosCliente = { nombre, cantidadPagos: data.cantidadPagos, totalPagado: data.totalPagado };
          }
        });
        
        setTopInteres(topInteresCliente);
        setTopPagos(topPagosCliente);
        setStats({
          totalClientes,
          promedioPagos: totalClientes > 0 ? (totalPagos / totalClientes).toFixed(1) : 0
        });
      } else {
        // Datos de ejemplo
        setTopInteres({ nombre: 'Juan Pérez', totalInteres: 12500, cantidadPagos: 8 });
        setTopPagos({ nombre: 'María Rodríguez', cantidadPagos: 12, totalPagado: 45000 });
        setStats({ totalClientes: 45, promedioPagos: 5.2 });
      }
    } catch (error) {
      console.error('Error cargando top clientes:', error);
      setTopInteres({ nombre: 'Juan Pérez', totalInteres: 12500, cantidadPagos: 8 });
      setTopPagos({ nombre: 'María Rodríguez', cantidadPagos: 12, totalPagado: 45000 });
      setStats({ totalClientes: 45, promedioPagos: 5.2 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg">
            <TrophyIcon className="h-5 w-5 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Clientes Destacados
          </h4>
        </div>

        {/* Cliente con mayor interés pagado */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-3 rounded-lg mb-3 border-2 ${
            theme === 'dark' 
              ? 'bg-green-900/20 border-green-800' 
              : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-600 rounded-lg">
                <CurrencyDollarIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Mayor interés pagado
                </p>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {topInteres.nombre || 'Sin datos'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatearMonto(topInteres.totalInteres)}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                en {topInteres.cantidadPagos} pagos
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cliente con más pagos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-3 rounded-lg mb-3 border-2 ${
            theme === 'dark' 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <CreditCardIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Más pagos realizados
                </p>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {topPagos.nombre || 'Sin datos'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {topPagos.cantidadPagos} pagos
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                total: {formatearMonto(topPagos.totalPagado)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats adicionales */}
        <div className={`pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <div className="flex items-center space-x-1">
            <UserIcon className="h-3 w-3 text-gray-400" />
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {stats.totalClientes} clientes activos
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowTrendingUpIcon className="h-3 w-3 text-gray-400" />
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              promedio {stats.promedioPagos} pagos/cliente
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export default ClienteTopWidget;