import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ user }) => {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Préstamos
          </h1>
          <p className="text-sm text-gray-500">
            EYS Inversiones - Panel de Control
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
          </div>
          
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.nombre?.charAt(0)}
            </span>
          </div>
          
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;