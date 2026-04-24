import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, Line, Doughnut, Pie, Radar } from 'react-chartjs-2';
import { EyeIcon, EyeSlashIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from './GlassCard';

const CustomizableChart = ({ title, data, type, onToggle, isVisible, getChartOptions, onExpand }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <motion.div
      layout
      className={`relative ${isVisible ? '' : 'opacity-40'}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h4>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onExpand}
                className={`p-2 rounded-lg transition-all ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                } ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Ampliar gráfico"
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className={`p-2 rounded-lg transition-all ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                } ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-100'
                }`}
                title={isVisible ? "Ocultar gráfico" : "Mostrar gráfico"}
              >
                {isVisible ? (
                  <EyeIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-red-600" />
                )}
              </motion.button>
            </div>
          </div>
          <div className="h-80 transition-all duration-300">
            {data && data.labels && data.labels.length > 0 ? (
              <ChartComponent data={data} options={getChartOptions(type)} />
            ) : (
              <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default CustomizableChart;