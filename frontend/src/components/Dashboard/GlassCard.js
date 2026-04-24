import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const GlassCard = ({ children, className = '', onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border transition-all duration-300 cursor-pointer ${
        isHovered 
          ? 'border-red-600 shadow-2xl shadow-red-600/20 scale-[1.02] z-10' 
          : 'border-red-600/20 hover:border-red-600/40'
      } ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000 ${
        isHovered ? 'translate-x-full' : ''
      }`} />
      {children}
    </motion.div>
  );
};

export default GlassCard;