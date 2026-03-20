import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Bar, Line, Doughnut, Pie, Radar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import ChartDetails from './ChartDetails';

const ChartModal = ({ isOpen, onClose, title, data, type, chartData, filters, onFilterChange }) => {
  const { theme } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});

  if (!isOpen) return null;

  const getChartComponent = () => {
    switch(type) {
      case 'bar': return Bar;
      case 'line': return Line;
      case 'doughnut': return Doughnut;
      case 'pie': return Pie;
      case 'radar': return Radar;
      default: return Bar;
    }
  };

  const ChartComponent = getChartComponent();

  const getChartOptions = () => {
    const textColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      }
    };
  };

  const exportChart = () => {
    // Crear CSV con los datos
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Categoría,Valor\n"
      + chartData.labels.map((label, i) => 
          `${label},${chartData.datasets[0].data[i]}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-purple-600 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            {/* Header */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  title="Filtros"
                >
                  <FunnelIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={exportChart}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  title="Exportar datos"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filtros */}
            {showFilters && (
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Período
                    </label>
                    <select
                      value={localFilters.periodo || 'mes'}
                      onChange={(e) => {
                        const newFilters = { ...localFilters, periodo: e.target.value };
                        setLocalFilters(newFilters);
                        onFilterChange?.(newFilters);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="mes">Este Mes</option>
                      <option value="trimestre">Este Trimestre</option>
                      <option value="año">Este Año</option>
                      <option value="todo">Todo el tiempo</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo
                    </label>
                    <select
                      value={localFilters.tipo || 'todos'}
                      onChange={(e) => {
                        const newFilters = { ...localFilters, tipo: e.target.value };
                        setLocalFilters(newFilters);
                        onFilterChange?.(newFilters);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="todos">Todos</option>
                      <option value="activos">Activos</option>
                      <option value="completados">Completados</option>
                      <option value="morosos">Morosos</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido - Gráfico y Detalles */}
            <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-120px)] overflow-auto">
              {/* Gráfico */}
              <div className="lg:w-2/3 p-6">
                <div className="h-96">
                  {data && data.labels && data.labels.length > 0 ? (
                    <ChartComponent data={data} options={getChartOptions()} />
                  ) : (
                    <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      No hay datos disponibles
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles */}
              <div className={`lg:w-1/3 border-t lg:border-t-0 lg:border-l ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <ChartDetails 
                  title={title}
                  type={type}
                  chartData={chartData}
                  filters={localFilters}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChartModal;