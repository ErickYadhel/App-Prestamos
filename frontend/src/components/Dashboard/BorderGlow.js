import { useTheme } from '../../context/ThemeContext';

const BorderGlow = ({ children, isHovered, color = 'from-red-600 via-red-500 to-red-600' }) => {
  const { theme } = useTheme();
  
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur opacity-0 transition-all duration-300 ${
        isHovered ? 'opacity-100' : 'group-hover:opacity-70'
      }`} />
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl blur-lg opacity-0 transition-all duration-500 ${
        isHovered ? 'opacity-60' : 'group-hover:opacity-40'
      }`} />
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-700`} />
      <div className="relative transform transition-all duration-300 group-hover:scale-[1.02]">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;