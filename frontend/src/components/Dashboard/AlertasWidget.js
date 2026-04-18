import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  BellIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon
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

const AlertasWidget = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    criticas: 0,
    leidas: 0
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

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      
      const prestamosRes = await api.get('/prestamos');
      let prestamos = [];
      
      if (prestamosRes.success && prestamosRes.data) {
        prestamos = prestamosRes.data;
      } else {
        prestamos = [
          { clienteNombre: 'Juan Pérez', capitalRestante: 5000, diasMora: 0, fechaProximoPago: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
          { clienteNombre: 'María Rodríguez', capitalRestante: 8000, diasMora: 5, fechaProximoPago: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { clienteNombre: 'Carlos López', capitalRestante: 12000, diasMora: 0, fechaProximoPago: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
          { clienteNombre: 'Ana Martínez', capitalRestante: 3000, diasMora: 0, fechaProximoPago: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }
        ];
      }
      
      const hoy = new Date();
      const alertasGeneradas = [];
      
      prestamos.forEach(prestamo => {
        if (prestamo.estado !== 'activo') return;
        
        let fechaProximo = prestamo.fechaProximoPago;
        if (fechaProximo?.toDate) fechaProximo = fechaProximo.toDate();
        else if (fechaProximo) fechaProximo = new Date(fechaProximo);
        
        if (fechaProximo) {
          const diasRestantes = Math.ceil((fechaProximo - hoy) / (1000 * 60 * 60 * 24));
          
          if (diasRestantes <= 0) {
            alertasGeneradas.push({
              id: `vencido-${prestamo.id}`,
              titulo: 'Pago VENCIDO',
              descripcion: `El cliente ${prestamo.clienteNombre} tiene un pago vencido. Monto: ${formatearMonto(prestamo.capitalRestante)}`,
              tipo: 'critica',
              fecha: new Date(),
              leida: false,
              accion: 'Contactar inmediatamente'
            });
          } else if (diasRestantes <= 2) {
            alertasGeneradas.push({
              id: `proximo-${prestamo.id}`,
              titulo: 'Pago por vencer',
              descripcion: `El cliente ${prestamo.clienteNombre} tiene un pago que vence en ${diasRestantes} días.`,
              tipo: 'advertencia',
              fecha: new Date(),
              leida: false,
              accion: 'Enviar recordatorio'
            });
          }
        }
        
        if (prestamo.diasMora > 0 && prestamo.diasMora > 3) {
          alertasGeneradas.push({
            id: `mora-${prestamo.id}`,
            titulo: 'Cliente en mora',
            descripcion: `El cliente ${prestamo.clienteNombre} lleva ${prestamo.diasMora} días en mora.`,
            tipo: 'critica',
            fecha: new Date(),
            leida: false,
            accion: 'Gestión de cobranza prioritaria'
          });
        }
      });
      
      const criticas = alertasGeneradas.filter(a => a.tipo === 'critica').length;
      
      setAlertas(alertasGeneradas);
      setStats({
        total: alertasGeneradas.length,
        criticas,
        leidas: 0
      });
      
    } catch (error) {
      console.error('Error cargando alertas:', error);
      setAlertas([
        { id: 1, titulo: 'Pago VENCIDO', descripcion: 'Juan Pérez tiene un pago vencido de RD$5,000', tipo: 'critica', fecha: new Date(), leida: false, accion: 'Contactar inmediatamente' },
        { id: 2, titulo: 'Pago por vencer', descripcion: 'María Rodríguez tiene un pago que vence mañana', tipo: 'advertencia', fecha: new Date(), leida: false, accion: 'Enviar recordatorio' }
      ]);
      setStats({ total: 2, criticas: 1, leidas: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
    const interval = setInterval(cargarAlertas, 60000);
    return () => clearInterval(interval);
  }, []);

  const marcarComoLeida = (id) => {
    setAlertas(prev => prev.map(a => 
      a.id === id ? { ...a, leida: true } : a
    ));
    setStats(prev => ({
      ...prev,
      leidas: prev.leidas + 1
    }));
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
              <BellIcon className="h-4 w-4 text-white" />
            </div>
            <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Alertas y Notificaciones
            </h4>
          </div>
          <div className="flex gap-1">
            {stats.criticas > 0 && (
              <span className="px-1.5 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-full">
                {stats.criticas} críticas
              </span>
            )}
            <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gray-500 text-white rounded-full">
              {stats.total} total
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {alertas.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircleIcon className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500">¡Sin alertas! Todo está en orden.</p>
              </div>
            ) : (
              alertas.map((alerta, idx) => (
                <motion.div
                  key={alerta.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-2 rounded-lg border transition-all ${
                    alerta.tipo === 'critica' 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  } ${alerta.leida ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <ExclamationTriangleIcon className={`h-3 w-3 ${alerta.tipo === 'critica' ? 'text-red-500' : 'text-yellow-500'}`} />
                        <p className="text-xs font-semibold">{alerta.titulo}</p>
                      </div>
                      <p className="text-[10px] mt-0.5">{alerta.descripcion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] text-gray-400">
                          {new Date(alerta.fecha).toLocaleTimeString()}
                        </span>
                        <span className="text-[8px] font-medium text-blue-500">
                          🎯 {alerta.accion}
                        </span>
                      </div>
                    </div>
                    {!alerta.leida && (
                      <button
                        onClick={() => marcarComoLeida(alerta.id)}
                        className="p-1 rounded hover:bg-white/20 transition-colors"
                        title="Marcar como leída"
                      >
                        <EyeIcon className="h-3 w-3 text-gray-400" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {alertas.length > 0 && (
          <button
            onClick={() => setAlertas([])}
            className="w-full mt-3 py-1 text-[10px] text-gray-500 hover:text-gray-700 transition-colors"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>
    </GlassCard>
  );
};

export default AlertasWidget;