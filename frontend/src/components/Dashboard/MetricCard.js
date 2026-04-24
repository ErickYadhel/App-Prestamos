import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import BorderGlow from './BorderGlow';

const MetricCard = ({ title, value, change, changeType, icon: Icon, color, link, description, onClick, tooltip }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { theme } = useTheme();

  const gradientColors = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    red: 'from-red-600 to-red-800',
    indigo: 'from-indigo-600 to-indigo-800',
    teal: 'from-teal-600 to-teal-800',
    emerald: 'from-emerald-600 to-emerald-800',
    cyan: 'from-cyan-600 to-cyan-800',
    yellow: 'from-yellow-600 to-yellow-800',
    pink: 'from-pink-600 to-pink-800',
    orange: 'from-orange-600 to-orange-800',
    amber: 'from-amber-600 to-amber-800'
  };

  const CardContent = () => (
    <BorderGlow isHovered={isHovered} color={`from-${color}-600 via-${color}-500 to-${color}-600`}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-xl p-5 block transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white border-gray-200'
        } border-2 hover:border-${color}-600/40 cursor-pointer`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={`absolute -top-20 -right-20 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br ${gradientColors[color]} rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse`} />
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  {title}
                </p>
                {tooltip && (
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="focus:outline-none"
                    >
                      <InformationCircleIcon className={`h-3 w-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    </button>
                    {showTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 text-xs bg-gray-900 text-white rounded-lg shadow-2xl whitespace-normal min-w-[280px] max-w-[320px] z-[200] break-words border border-gray-700 pointer-events-auto">
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
                        <p className="font-medium text-sm mb-2 text-red-400 flex items-center gap-1">
                          <InformationCircleIcon className="h-4 w-4" />
                          Información
                        </p>
                        <p className="text-gray-300 leading-relaxed text-sm">{tooltip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-baseline flex-wrap">
                <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </p>
                {change && change !== 0 && (
                  <span className={`ml-2 inline-flex items-center text-xs font-medium ${
                    changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {changeType === 'positive' ? 
                      <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    }
                    {change}%
                  </span>
                )}
              </div>
              {description && (
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  {description}
                </p>
              )}
            </div>
            <div className={`p-2 sm:p-3 bg-gradient-to-br ${gradientColors[color]} rounded-xl shadow-lg ml-4 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>
    </BorderGlow>
  );

  return link ? (
    <Link to={link} className="block">
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
};

export default MetricCard;