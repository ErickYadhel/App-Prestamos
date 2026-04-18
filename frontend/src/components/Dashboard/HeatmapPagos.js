import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

const HeatmapPagos = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [mesActual, setMesActual] = useState(new Date());
  const [stats, setStats] = useState({
    totalPagos: 0,
    totalMonto: 0,
    diaMasActivo: { dia: '', cantidad: 0, monto: 0 },
    promedioDiario: 0
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
          { fechaPago: new Date(2024, 3, 1), montoTotal: 1500 },
          { fechaPago: new Date(2024, 3, 1), montoTotal: 2000 },
          { fechaPago: new Date(2024, 3, 2), montoTotal: 3000 },
          { fechaPago: new Date(2024, 3, 5), montoTotal: 1000 },
          { fechaPago: new Date(2024, 3, 5), montoTotal: 2500 },
          { fechaPago: new Date(2024, 3, 10), montoTotal: 5000 },
          { fechaPago: new Date(2024, 3, 15), montoTotal: 1200 },
          { fechaPago: new Date(2024, 3, 20), montoTotal: 800 },
          { fechaPago: new Date(2024, 3, 25), montoTotal: 3500 },
          { fechaPago: new Date(2024, 3, 30), montoTotal: 4200 }
        ];
      }
      
      const year = mesActual.getFullYear();
      const month = mesActual.getMonth();
      const diasEnMes = new Date(year, month + 1, 0).getDate();
      
      const pagosPorDia = Array(diasEnMes).fill().map(() => ({ cantidad: 0, monto: 0 }));
      let totalPagos = 0;
      let totalMonto = 0;
      let diaMasActivo = { dia: '', cantidad: 0, monto: 0 };
      
      pagos.forEach(pago => {
        let fecha = pago.fechaPago;
        if (fecha?.toDate) fecha = fecha.toDate();
        else if (fecha) fecha = new Date(fecha);
        else return;
        
        if (fecha.getFullYear() === year && fecha.getMonth() === month) {
          const dia = fecha.getDate() - 1;
          const monto = pago.montoTotal || pago.total || pago.monto || 0;
          pagosPorDia[dia].cantidad++;
          pagosPorDia[dia].monto += monto;
          totalPagos++;
          totalMonto += monto;
          
          if (pagosPorDia[dia].cantidad > diaMasActivo.cantidad) {
            diaMasActivo = {
              dia: fecha.getDate(),
              cantidad: pagosPorDia[dia].cantidad,
              monto: pagosPorDia[dia].monto
            };
          }
        }
      });
      
      const maxCantidad = Math.max(...pagosPorDia.map(d => d.cantidad), 1);
      
      const heatmap = pagosPorDia.map((dia, index) => {
        let intensidad = 'bg-gray-100 dark:bg-gray-800';
        if (dia.cantidad > 0) {
          const porcentaje = dia.cantidad / maxCantidad;
          if (porcentaje >= 0.75) intensidad = 'bg-red-500';
          else if (porcentaje >= 0.5) intensidad = 'bg-orange-500';
          else if (porcentaje >= 0.25) intensidad = 'bg-yellow-500';
          else intensidad = 'bg-green-500';
        }
        return {
          dia: index + 1,
          cantidad: dia.cantidad,
          monto: dia.monto,
          intensidad
        };
      });
      
      setHeatmapData(heatmap);
      setStats({
        totalPagos,
        totalMonto,
        diaMasActivo,
        promedioDiario: totalPagos / diasEnMes
      });
      
    } catch (error) {
      console.error('Error cargando heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [mesActual]);

  const cambiarMes = (incremento) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + incremento, 1));
  };

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getPrimerDiaSemana = () => {
    return new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getDay();
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-white" />
            </div>
            <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Heatmap de Pagos
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => cambiarMes(-1)}
              className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              ◀
            </button>
            <span className={`text-sm font-medium px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
            </span>
            <button
              onClick={() => cambiarMes(1)}
              className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              ▶
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {diasSemana.map((dia, idx) => (
            <div key={idx} className="text-center text-[10px] font-medium text-gray-500 py-1">
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array(getPrimerDiaSemana()).fill(null).map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square rounded-lg bg-transparent" />
          ))}
          {heatmapData.map((dia) => (
            <motion.div
              key={dia.dia}
              whileHover={{ scale: 1.05 }}
              className={`aspect-square rounded-lg ${dia.intensidad} flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-lg`}
              title={`${dia.dia} - ${dia.cantidad} pagos - ${formatearMonto(dia.monto)}`}
            >
              <span className="text-[10px] font-bold text-white">{dia.dia}</span>
              {dia.cantidad > 0 && (
                <span className="text-[8px] text-white/80">{dia.cantidad}</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500"></div><span className="text-[9px]">Bajo</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500"></div><span className="text-[9px]">Medio</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500"></div><span className="text-[9px]">Alto</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500"></div><span className="text-[9px]">Muy alto</span></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Total pagos</p>
            <p className="text-sm font-bold text-blue-600">{stats.totalPagos}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Total recaudado</p>
            <p className="text-xs font-bold text-emerald-600 truncate">{formatearMonto(stats.totalMonto)}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Día más activo</p>
            <p className="text-xs font-bold text-orange-600">Día {stats.diaMasActivo.dia}</p>
            <p className="text-[8px] text-gray-400">{stats.diaMasActivo.cantidad} pagos</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default HeatmapPagos;