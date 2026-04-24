import { motion } from 'framer-motion';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const DashboardSelector = ({ dashboards, currentDashboard, onOpenManager }) => {
  const { theme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onOpenManager}
      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
        theme === 'dark'
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      title="Gestionar Dashboards"
    >
      <Squares2X2Icon className="h-4 w-4" />
      <span className="max-w-[100px] truncate">{currentDashboard?.nombre || 'Dashboards'}</span>
    </motion.button>
  );
};

export default DashboardSelector;