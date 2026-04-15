import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  TrophyIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const TopComisionesWidget = ({ prestamos, pagos, comisiones }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [topGarantes, setTopGarantes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalComisiones: 0,
    totalPagadas: 0,
    totalPendientes: 0,
    promedioComision: 0,
    mejorMes: { mes: '', monto: 0 },
    tendencia: 0
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

  const calcularComisionesDesdePagos = () => {
    if (!prestamos || !pagos) {
      setLoading(false);
      return;
    }

    const garantesMap = new Map();
    
    prestamos.forEach(prestamo => {
      if (prestamo.garanteID || prestamo.garanteNombre) {
        const garanteId = prestamo.garanteID || prestamo.garanteNombre;
        const garanteNombre = prestamo.garanteNombre || garanteId;
        const porcentajeComision = prestamo.porcentajeComision || 50;
        
        if (!garantesMap.has(garanteId)) {
          garantesMap.set(garanteId, {
            id: garanteId,
            nombre: garanteNombre,
            porcentaje: porcentajeComision,
            prestamos: [],
            comisiones: [],
            totalComision: 0,
            pagado: 0,
            pendiente: 0,
            cantidadComisiones: 0
          });
        }
        garantesMap.get(garanteId).prestamos.push(prestamo.id);
      }
    });

    pagos.forEach(pago => {
      const montoInteres = pago.montoInteres || 0;
      if (montoInteres <= 0) return;
      
      const prestamo = prestamos.find(p => p.id === pago.prestamoID);
      if (!prestamo) return;
      
      const garanteId = prestamo.garanteID || prestamo.garanteNombre;
      if (!garanteId) return;
      
      const garante = garantesMap.get(garanteId);
      if (!garante) return;
      
      const porcentaje = garante.porcentaje;
      const montoComision = (montoInteres * porcentaje) / 100;
      const estaPagada = pago.comisionPagada === true || pago.tipoPago === 'comision';
      
      garante.comisiones.push({
        id: pago.id,
        montoBase: montoInteres,
        montoComision,
        fecha: pago.fechaPago,
        pagada: estaPagada,
        cliente: pago.clienteNombre
      });
      
      garante.totalComision += montoComision;
      if (estaPagada) {
        garante.pagado += montoComision;
      } else {
        garante.pendiente += montoComision;
      }
      garante.cantidadComisiones++;
    });
    
    const garantesArray = Array.from(garantesMap.values())
      .filter(g => g.totalComision > 0)
      .sort((a, b) => b.totalComision - a.totalComision)
      .slice(0, 5);
    
    const totalComisiones = garantesArray.reduce((sum, g) => sum + g.totalComision, 0);
    const totalPagadas = garantesArray.reduce((sum, g) => sum + g.pagado, 0);
    const totalPendientes = garantesArray.reduce((sum, g) => sum + g.pendiente, 0);
    const promedioComision = garantesArray.length > 0 ? totalComisiones / garantesArray.length : 0;
    
    const hoy = new Date();
    const ultimos3Meses = [];
    const anteriores3Meses = [];
    
    garantesArray.forEach(garante => {
      garante.comisiones.forEach(com => {
        if (!com.fecha) return;
        let fechaCom;
        if (com.fecha.toDate) {
          fechaCom = com.fecha.toDate();
        } else {
          fechaCom = new Date(com.fecha);
        }
        const diffMeses = (hoy.getFullYear() - fechaCom.getFullYear()) * 12 + (hoy.getMonth() - fechaCom.getMonth());
        if (diffMeses <= 3 && diffMeses >= 0) {
          ultimos3Meses.push(com.montoComision);
        } else if (diffMeses <= 6 && diffMeses > 3) {
          anteriores3Meses.push(com.montoComision);
        }
      });
    });
    
    const sumaUltimos = ultimos3Meses.reduce((a, b) => a + b, 0);
    const sumaAnteriores = anteriores3Meses.reduce((a, b) => a + b, 0);
    const tendencia = sumaAnteriores > 0 ? ((sumaUltimos - sumaAnteriores) / sumaAnteriores * 100) : 0;
    
    const comisionesPorMes = new Map();
    garantesArray.forEach(garante => {
      garante.comisiones.forEach(com => {
        if (!com.fecha) return;
        let fecha;
        if (com.fecha.toDate) {
          fecha = com.fecha.toDate();
        } else {
          fecha = new Date(com.fecha);
        }
        const mesNombre = fecha.toLocaleDateString('es-DO', { month: 'short', year: '2-digit' });
        if (!comisionesPorMes.has(mesNombre)) {
          comisionesPorMes.set(mesNombre, 0);
        }
        comisionesPorMes.set(mesNombre, comisionesPorMes.get(mesNombre) + com.montoComision);
      });
    });
    
    let mejorMes = { mes: '', monto: 0 };
    comisionesPorMes.forEach((monto, mes) => {
      if (monto > mejorMes.monto) {
        mejorMes = { mes, monto };
      }
    });
    
    setTopGarantes(garantesArray);
    setEstadisticas({
      totalComisiones,
      totalPagadas,
      totalPendientes,
      promedioComision,
      mejorMes,
      tendencia: parseFloat(tendencia.toFixed(1))
    });
    setLoading(false);
  };

  useEffect(() => {
    calcularComisionesDesdePagos();
  }, [prestamos, pagos]);

  if (loading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (topGarantes.length === 0) {
    return (
      <GlassCard>
        <div className="p-6 text-center">
          <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <GiftIcon className="h-8 w-8 text-white opacity-50" />
          </div>
          <h4 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sin comisiones aún
          </h4>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Las comisiones aparecerán aquí cuando los garantes referidos generen pagos de intereses.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg">
              <TrophyIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Top Garantes por Comisiones
              </h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Basado en intereses pagados por clientes referidos
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
            estadisticas.tendencia >= 0 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {estadisticas.tendencia >= 0 ? (
              <ArrowTrendingUpIcon className="h-3 w-3" />
            ) : (
              <ArrowTrendingDownIcon className="h-3 w-3" />
            )}
            <span>{Math.abs(estadisticas.tendencia)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
            <p className={`text-sm font-bold text-red-600`}>{formatearMonto(estadisticas.totalComisiones)}</p>
          </div>
          <div className={`text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pagadas</p>
            <p className={`text-sm font-bold text-green-600`}>{formatearMonto(estadisticas.totalPagadas)}</p>
          </div>
          <div className={`text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pendientes</p>
            <p className={`text-sm font-bold text-yellow-600`}>{formatearMonto(estadisticas.totalPendientes)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {topGarantes.map((garante, index) => {
            const porcentajeTotal = estadisticas.totalComisiones > 0 
              ? (garante.totalComision / estadisticas.totalComisiones * 100).toFixed(1)
              : 0;
            
            const porcentajePagado = garante.totalComision > 0
              ? (garante.pagado / garante.totalComision * 100).toFixed(1)
              : 0;
            
            return (
              <motion.div
                key={garante.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-lg border ${
                  index === 0 
                    ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
                    : theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {garante.nombre}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {garante.cantidadComisiones} comisiones • {garante.prestamos.length} préstamos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-bold text-red-600 dark:text-red-400`}>
                        {formatearMonto(garante.totalComision)}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {porcentajeTotal}% del total
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Progreso de pago</span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{porcentajePagado}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${porcentajePagado}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-green-600 dark:text-green-400">
                        Pagado: {formatearMonto(garante.pagado)}
                      </span>
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Pendiente: {formatearMonto(garante.pendiente)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className={`mt-4 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <div className="flex items-center space-x-1">
            <ArrowTrendingUpIcon className="h-3 w-3 text-gray-400" />
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Mejor mes: {estadisticas.mejorMes.mes || 'N/A'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="h-3 w-3 text-gray-400" />
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Promedio: {formatearMonto(estadisticas.promedioComision)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TopComisionesWidget;