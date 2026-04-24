import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GiftIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';

const ComisionesGaranteWidget = ({ comisionesData, loading }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

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

  if (loading) {
    return (
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!comisionesData || !comisionesData.garante) {
    return (
      <GlassCard>
        <div className="p-6 text-center">
          <GiftIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay comisiones registradas aún
          </p>
        </div>
      </GlassCard>
    );
  }

  const garanteData = comisionesData.garante || {};
  const ultimasComisiones = garanteData.ultimasComisiones || [];
  const mostrarTodas = ultimasComisiones.length > 3 && expanded;

  return (
    <GlassCard>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg">
              <GiftIcon className="h-5 w-5 text-white" />
            </div>
            <h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Mis Comisiones
            </h4>
          </div>
          <Link 
            to="/operaciones/comisiones" 
            className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
          >
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} border border-green-200 dark:border-green-800`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Ganado</p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {formatearMonto(garanteData.montoTotal)}
            </p>
          </div>
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-200 dark:border-blue-800`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Comisiones Pagadas</p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              {formatearMonto(garanteData.montoPagado)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'} border border-yellow-200 dark:border-yellow-800`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pendientes</p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {formatearMonto(garanteData.montoPendiente)}
            </p>
          </div>
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'} border border-purple-200 dark:border-purple-800`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Comisiones</p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
              {garanteData.totalComisiones || 0}
            </p>
          </div>
        </div>

        {ultimasComisiones.length > 0 && (
          <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Últimas comisiones
            </p>
            <div className="space-y-2">
              {(mostrarTodas ? ultimasComisiones : ultimasComisiones.slice(0, 3)).map((comision, idx) => (
                <div key={idx} className={`flex justify-between items-center text-xs p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {comision.clienteNombre}
                    </p>
                    <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {comision.fechaPago ? new Date(comision.fechaPago).toLocaleDateString() : 'Fecha no disponible'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${comision.estado === 'pagada' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {formatearMonto(comision.montoComision)}
                    </p>
                    <p className={`text-xs ${comision.estado === 'pagada' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {comision.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {ultimasComisiones.length > 3 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className={`w-full mt-2 text-xs text-center py-1 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {expanded ? 'Ver menos ↑' : `Ver más (${ultimasComisiones.length - 3}) ↓`}
              </button>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ComisionesGaranteWidget;