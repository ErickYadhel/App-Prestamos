import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  MapPinIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  CurrencyDollarIcon
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

const MapaCalorProvincia = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [provincias, setProvincias] = useState([]);
  const [stats, setStats] = useState({
    totalProvincias: 0,
    provinciaTop: '',
    montoTop: 0,
    cobertura: 0
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
      
      const clientesRes = await api.get('/clientes');
      let clientes = [];
      
      if (clientesRes.success && clientesRes.data) {
        clientes = clientesRes.data;
      } else {
        clientes = [
          { provincia: 'Distrito Nacional', montoPrestado: 250000 },
          { provincia: 'Santiago', montoPrestado: 180000 },
          { provincia: 'Santo Domingo', montoPrestado: 220000 },
          { provincia: 'La Vega', montoPrestado: 95000 },
          { provincia: 'Puerto Plata', montoPrestado: 85000 },
          { provincia: 'San Cristóbal', montoPrestado: 65000 },
          { provincia: 'La Romana', montoPrestado: 55000 },
          { provincia: 'San Pedro de Macorís', montoPrestado: 45000 }
        ];
      }
      
      const provinciasMap = new Map();
      let totalMonto = 0;
      
      clientes.forEach(cliente => {
        const provincia = cliente.provincia || 'No especificada';
        const monto = cliente.montoPrestado || 0;
        
        if (!provinciasMap.has(provincia)) {
          provinciasMap.set(provincia, { nombre: provincia, monto: 0, clientes: 0 });
        }
        
        const prov = provinciasMap.get(provincia);
        prov.monto += monto;
        prov.clientes += 1;
        totalMonto += monto;
      });
      
      let provinciasArray = Array.from(provinciasMap.values())
        .map(p => ({
          ...p,
          porcentaje: totalMonto > 0 ? (p.monto / totalMonto * 100).toFixed(1) : 0,
          intensidad: Math.min(100, (p.monto / totalMonto * 100) * 2)
        }))
        .sort((a, b) => b.monto - a.monto);
      
      const topProvincia = provinciasArray[0];
      const cobertura = (provinciasArray.length / 32) * 100;
      
      setProvincias(provinciasArray);
      setStats({
        totalProvincias: provinciasArray.length,
        provinciaTop: topProvincia?.nombre || 'N/A',
        montoTop: topProvincia?.monto || 0,
        cobertura: Math.min(100, cobertura).toFixed(1)
      });
      
    } catch (error) {
      console.error('Error:', error);
      setProvincias([
        { nombre: 'Distrito Nacional', monto: 250000, clientes: 45, porcentaje: 28.5, intensidad: 85 },
        { nombre: 'Santiago', monto: 180000, clientes: 32, porcentaje: 20.5, intensidad: 65 },
        { nombre: 'Santo Domingo', monto: 220000, clientes: 38, porcentaje: 25.1, intensidad: 75 },
        { nombre: 'La Vega', monto: 95000, clientes: 18, porcentaje: 10.8, intensidad: 35 },
        { nombre: 'Puerto Plata', monto: 85000, clientes: 15, porcentaje: 9.7, intensidad: 30 }
      ]);
      setStats({
        totalProvincias: 5,
        provinciaTop: 'Distrito Nacional',
        montoTop: 250000,
        cobertura: 15.6
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const maxMonto = Math.max(...provincias.map(p => p.monto), 1);

  if (loading) return (<GlassCard><div className="p-4"><div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div></GlassCard>);

  return (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
            <MapPinIcon className="h-4 w-4 text-white" />
          </div>
          <h4 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Mapa de Calor por Provincia
          </h4>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Provincias activas</p>
            <p className="text-base font-bold text-blue-600">{stats.totalProvincias}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Top provincia</p>
            <p className="text-xs font-bold text-yellow-600 truncate">{stats.provinciaTop}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Monto top</p>
            <p className="text-[9px] font-bold text-emerald-600 truncate">{formatearMonto(stats.montoTop)}</p>
          </div>
          <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className="text-[8px] text-gray-500">Cobertura nacional</p>
            <p className="text-base font-bold text-purple-600">{stats.cobertura}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {provincias.map((prov, idx) => {
            const intensidadColor = 
              prov.intensidad >= 80 ? 'bg-red-500' :
              prov.intensidad >= 60 ? 'bg-orange-500' :
              prov.intensidad >= 40 ? 'bg-yellow-500' :
              prov.intensidad >= 20 ? 'bg-green-500' :
              'bg-blue-500';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className={`p-2 rounded-lg text-center cursor-pointer transition-all hover:scale-105 ${intensidadColor} bg-opacity-20 ${theme === 'dark' ? 'bg-opacity-30' : ''}`}
              >
                <p className="text-[10px] font-bold truncate">{prov.nombre}</p>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{formatearMonto(prov.monto)}</p>
                <p className="text-[8px] text-gray-500">{prov.clientes} clientes</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                  <div className={`h-1 rounded-full ${intensidadColor}`} style={{ width: `${prov.porcentaje}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-[9px] text-red-600 dark:text-red-400">
            🔥 Zonas calientes: {provincias.slice(0, 3).map(p => p.nombre).join(', ')} concentran el {provincias.slice(0, 3).reduce((s, p) => s + parseFloat(p.porcentaje), 0).toFixed(1)}% de los préstamos.
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default MapaCalorProvincia;