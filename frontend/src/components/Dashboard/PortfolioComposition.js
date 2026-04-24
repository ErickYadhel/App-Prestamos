import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';

const PortfolioComposition = ({ data }) => {
  const { theme } = useTheme();

  const prestamosActivos = data?.prestamosActivos || data?.prestamos || 0;
  const prestamosCompletados = data?.prestamosCompletados || 0;
  const prestamosMorosos = data?.prestamosMorosos || data?.prestamosEnMora || 0;
  const totalPrestamos = prestamosActivos + prestamosCompletados + prestamosMorosos;

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'RD$ 0';
    if (amount >= 1000000) return `RD$ ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `RD$ ${(amount / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const chartData = {
    labels: ['Préstamos Activos', 'Préstamos Completados', 'Préstamos en Mora'],
    datasets: [
      {
        data: [prestamosActivos, prestamosCompletados, prestamosMorosos],
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
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
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    }
  };

  const saludCartera = totalPrestamos > 0 ? ((prestamosActivos / totalPrestamos) * 100).toFixed(1) : 0;

  const promedioPrestamo = data?.promedioPrestamo || 0;
  const capitalActivo = prestamosActivos * promedioPrestamo;
  const capitalEnRiesgo = prestamosMorosos * promedioPrestamo;

  return (
    <GlassCard>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Composición de Cartera
          </h4>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            saludCartera >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
            saludCartera >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            Salud: {saludCartera}%
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos Activos</span>
                <span className={`text-lg font-bold text-green-600 dark:text-green-400`}>
                  {prestamosActivos}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${totalPrestamos > 0 ? (prestamosActivos / totalPrestamos * 100) : 0}%` }} />
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Préstamos al día y generando intereses
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos Completados</span>
                <span className={`text-lg font-bold text-blue-600 dark:text-blue-400`}>
                  {prestamosCompletados}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${totalPrestamos > 0 ? (prestamosCompletados / totalPrestamos * 100) : 0}%` }} />
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Préstamos pagados exitosamente
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Préstamos en Mora</span>
                <span className={`text-lg font-bold text-red-600 dark:text-red-400`}>
                  {prestamosMorosos}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${totalPrestamos > 0 ? (prestamosMorosos / totalPrestamos * 100) : 0}%` }} />
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Préstamos con pagos atrasados
              </p>
            </div>
          </div>
        </div>
        
        <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Capital en Riesgo</p>
              <p className={`text-xl font-bold text-red-600 dark:text-red-400`}>
                {formatCurrency(capitalEnRiesgo)}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {prestamosMorosos} préstamos en mora
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Capital Activo</p>
              <p className={`text-xl font-bold text-green-600 dark:text-green-400`}>
                {formatCurrency(capitalActivo)}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {prestamosActivos} préstamos activos
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Préstamos</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalPrestamos}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tasa de Recuperación</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {totalPrestamos > 0 ? ((prestamosCompletados / totalPrestamos) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default PortfolioComposition;