import { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';

const PerformanceRadar = ({ data, onTypeChange, currentType }) => {
  const { theme } = useTheme();
  const [viewType, setViewType] = useState(currentType || 'cantidad');

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'RD$ 0';
    if (amount >= 1000000) {
      return `RD$ ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `RD$ ${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleTypeChange = (type) => {
    setViewType(type);
    if (onTypeChange) onTypeChange(type);
  };

  const getChartData = () => {
    if (viewType === 'cantidad') {
      const maxValue = Math.max(
        data?.cantidades?.clientes || 0,
        data?.cantidades?.prestamos || 0,
        data?.cantidades?.pagos || 0,
        data?.cantidades?.solicitudes || 0
      );
      const scaleFactor = maxValue > 0 ? 100 / maxValue : 1;
      
      return {
        labels: ['Clientes', 'Préstamos', 'Pagos', 'Solicitudes'],
        datasets: [
          {
            label: 'Cantidad (escala relativa)',
            data: [
              ((data?.cantidades?.clientes || 0) * scaleFactor).toFixed(1),
              ((data?.cantidades?.prestamos || 0) * scaleFactor).toFixed(1),
              ((data?.cantidades?.pagos || 0) * scaleFactor).toFixed(1),
              ((data?.cantidades?.solicitudes || 0) * scaleFactor).toFixed(1)
            ],
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(139, 92, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(139, 92, 246)',
          },
        ],
      };
    } else {
      const maxValue = Math.max(
        data?.montos?.capitalPrestado || 0,
        data?.montos?.capitalRecuperado || 0,
        data?.montos?.ganancias || 0
      );
      const scaleFactor = maxValue > 0 ? 100 / maxValue : 1;
      
      return {
        labels: ['Capital Prestado', 'Capital Recuperado', 'Ganancias'],
        datasets: [
          {
            label: 'Montos (escala relativa)',
            data: [
              ((data?.montos?.capitalPrestado || 0) * scaleFactor).toFixed(1),
              ((data?.montos?.capitalRecuperado || 0) * scaleFactor).toFixed(1),
              ((data?.montos?.ganancias || 0) * scaleFactor).toFixed(1)
            ],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(16, 185, 129)',
          },
        ],
      };
    }
  };

  const getRadarOptions = () => {
    const textColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (viewType === 'montos') {
                const values = [
                  data?.montos?.capitalPrestado || 0,
                  data?.montos?.capitalRecuperado || 0,
                  data?.montos?.ganancias || 0
                ];
                return `${context.label}: ${formatCurrency(values[context.dataIndex])}`;
              }
              const values = [
                data?.cantidades?.clientes || 0,
                data?.cantidades?.prestamos || 0,
                data?.cantidades?.pagos || 0,
                data?.cantidades?.solicitudes || 0
              ];
              return `${context.label}: ${values[context.dataIndex]}`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            backdropColor: 'transparent',
            stepSize: 20
          },
          grid: {
            color: theme === 'dark' ? '#374151' : '#E5E7EB'
          }
        }
      }
    };
  };

  return (
    <GlassCard>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Rendimiento por Área
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeChange('cantidad')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewType === 'cantidad'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cantidad
            </button>
            <button
              onClick={() => handleTypeChange('montos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewType === 'montos'
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Montos
            </button>
          </div>
        </div>
        
        <div className="h-80">
          <Radar data={getChartData()} options={getRadarOptions()} />
        </div>
        
        <div className={`mt-4 grid grid-cols-2 gap-3 ${viewType === 'cantidad' ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {viewType === 'cantidad' ? (
            <>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Clientes</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data?.cantidades?.clientes || 0}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Préstamos</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data?.cantidades?.prestamos || 0}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pagos</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data?.cantidades?.pagos || 0}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Solicitudes</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {data?.cantidades?.solicitudes || 0}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Capital Prestado</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(data?.montos?.capitalPrestado || 0)}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Capital Recuperado</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatCurrency(data?.montos?.capitalRecuperado || 0)}
                </p>
              </div>
              <div className={`p-2 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ganancias</p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  {formatCurrency(data?.montos?.ganancias || 0)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default PerformanceRadar;