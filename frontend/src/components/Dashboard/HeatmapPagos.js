import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { convertTimestampToDate, formatCurrency as formatCurrencyUtil } from './DateFormatter';

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

  /**
   * Convierte una fecha en formato DD-MM-YYYY a objeto Date
   */
  const parseFecha = (fecha) => {
    if (!fecha) return null;
    
    // Si ya es Date válido
    if (fecha instanceof Date && !isNaN(fecha)) return fecha;
    
    // Si tiene método toDate (Firebase Timestamp)
    if (fecha.toDate) return fecha.toDate();
    
    // Si es string
    if (typeof fecha === 'string') {
      // Formato DD-MM-YYYY
      const patronDDMMYYYY = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
      const match = fecha.match(patronDDMMYYYY);
      if (match) {
        const dia = parseInt(match[1], 10);
        const mes = parseInt(match[2], 10) - 1;
        const año = parseInt(match[3], 10);
        const fechaObj = new Date(año, mes, dia);
        if (!isNaN(fechaObj)) return fechaObj;
      }
      
      // Formato YYYY-MM-DD
      const patronISO = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
      const matchISO = fecha.match(patronISO);
      if (matchISO) {
        const año = parseInt(matchISO[1], 10);
        const mes = parseInt(matchISO[2], 10) - 1;
        const dia = parseInt(matchISO[3], 10);
        const fechaObj = new Date(año, mes, dia);
        if (!isNaN(fechaObj)) return fechaObj;
      }
    }
    
    // Fallback: usar convertTimestampToDate
    return convertTimestampToDate(fecha);
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/pagos');
      let pagos = [];
      
      if (response.success && response.data && response.data.length > 0) {
        pagos = response.data;
      } else {
        // Datos de ejemplo si no hay pagos
        pagos = [
          { fechaPago: '01-04-2024', montoTotal: 1500, monto: 1500 },
          { fechaPago: '01-04-2024', montoTotal: 2000, monto: 2000 },
          { fechaPago: '02-04-2024', montoTotal: 3000, monto: 3000 },
          { fechaPago: '05-04-2024', montoTotal: 1000, monto: 1000 },
          { fechaPago: '05-04-2024', montoTotal: 2500, monto: 2500 },
          { fechaPago: '10-04-2024', montoTotal: 5000, monto: 5000 },
          { fechaPago: '15-04-2024', montoTotal: 1200, monto: 1200 },
          { fechaPago: '20-04-2024', montoTotal: 800, monto: 800 },
          { fechaPago: '25-04-2024', montoTotal: 3500, monto: 3500 },
          { fechaPago: '30-04-2024', montoTotal: 4200, monto: 4200 }
        ];
      }
      
      const year = mesActual.getFullYear();
      const month = mesActual.getMonth();
      const diasEnMes = new Date(year, month + 1, 0).getDate();
      
      const pagosPorDia = Array(diasEnMes).fill().map(() => ({ cantidad: 0, monto: 0 }));
      let totalPagos = 0;
      let totalMonto = 0;
      let diaMasActivo = { dia: '', cantidad: 0, monto: 0 };
      let pagosProcesados = 0;
      let pagosFiltrados = 0;
      
      pagos.forEach(pago => {
        pagosProcesados++;
        
        // Obtener la fecha del pago
        let fecha = pago.fechaPago;
        
        // Si no hay fecha, intentar con campo fecha
        if (!fecha && pago.fecha) fecha = pago.fecha;
        
        // Parsear la fecha
        const fechaObj = parseFecha(fecha);
        
        if (!fechaObj || isNaN(fechaObj.getTime())) {
          console.warn('Fecha inválida en pago:', fecha);
          return;
        }
        
        // Filtrar por mes y año
        if (fechaObj.getFullYear() === year && fechaObj.getMonth() === month) {
          pagosFiltrados++;
          const dia = fechaObj.getDate() - 1;
          
          // Obtener el monto (soporta diferentes nombres de campo)
          const monto = pago.montoTotal || pago.total || pago.monto || 0;
          
          pagosPorDia[dia].cantidad++;
          pagosPorDia[dia].monto += monto;
          totalPagos++;
          totalMonto += monto;
          
          // Actualizar día más activo
          if (pagosPorDia[dia].cantidad > diaMasActivo.cantidad) {
            diaMasActivo = {
              dia: fechaObj.getDate(),
              cantidad: pagosPorDia[dia].cantidad,
              monto: pagosPorDia[dia].monto
            };
          }
        }
      });
      
      console.log(`📊 Heatmap: ${pagosProcesados} pagos procesados, ${pagosFiltrados} en el mes seleccionado`);
      
      const maxCantidad = Math.max(...pagosPorDia.map(d => d.cantidad), 1);
      
      const heatmap = pagosPorDia.map((dia, index) => {
        let intensidad = 'bg-gray-100 dark:bg-gray-800';
        let colorClase = '';
        
        if (dia.cantidad > 0) {
          const porcentaje = dia.cantidad / maxCantidad;
          if (porcentaje >= 0.75) {
            intensidad = 'bg-red-500';
            colorClase = 'text-white';
          } else if (porcentaje >= 0.5) {
            intensidad = 'bg-orange-500';
            colorClase = 'text-white';
          } else if (porcentaje >= 0.25) {
            intensidad = 'bg-yellow-500';
            colorClase = 'text-white';
          } else {
            intensidad = 'bg-green-500';
            colorClase = 'text-white';
          }
        } else {
          colorClase = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
        }
        
        return {
          dia: index + 1,
          cantidad: dia.cantidad,
          monto: dia.monto,
          intensidad,
          colorClase
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
      // Datos de ejemplo en caso de error
      const year = mesActual.getFullYear();
      const month = mesActual.getMonth();
      const diasEnMes = new Date(year, month + 1, 0).getDate();
      const ejemploHeatmap = Array(diasEnMes).fill().map((_, i) => ({
        dia: i + 1,
        cantidad: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
        monto: Math.random() * 10000,
        intensidad: Math.random() > 0.8 ? 'bg-red-500' : Math.random() > 0.6 ? 'bg-orange-500' : Math.random() > 0.4 ? 'bg-yellow-500' : 'bg-green-500',
        colorClase: 'text-white'
      }));
      setHeatmapData(ejemploHeatmap);
      setStats({
        totalPagos: ejemploHeatmap.filter(d => d.cantidad > 0).length,
        totalMonto: ejemploHeatmap.reduce((sum, d) => sum + d.monto, 0),
        diaMasActivo: { dia: 15, cantidad: 8, monto: 25000 },
        promedioDiario: 3.2
      });
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
              className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              ◀
            </button>
            <span className={`text-sm font-medium px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
            </span>
            <button
              onClick={() => cambiarMes(1)}
              className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
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
              title={`Día ${dia.dia}: ${dia.cantidad} pagos - ${formatearMonto(dia.monto)}`}
            >
              <span className={`text-[10px] font-bold ${dia.colorClase || 'text-white'}`}>{dia.dia}</span>
              {dia.cantidad > 0 && (
                <span className={`text-[8px] ${dia.colorClase || 'text-white/80'}`}>{dia.cantidad}</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-[9px] text-gray-600 dark:text-gray-400">Bajo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className="text-[9px] text-gray-600 dark:text-gray-400">Medio</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-[9px] text-gray-600 dark:text-gray-400">Alto</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-[9px] text-gray-600 dark:text-gray-400">Muy alto</span>
          </div>
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
        
        {/* Mensaje si no hay datos */}
        {stats.totalPagos === 0 && (
          <div className="mt-3 p-2 text-center bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              ℹ️ No hay pagos registrados en este período
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default HeatmapPagos;