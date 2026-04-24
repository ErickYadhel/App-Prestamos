import { useTheme } from '../../context/ThemeContext';

const DashboardSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-64 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className={`h-10 w-32 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-32 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;