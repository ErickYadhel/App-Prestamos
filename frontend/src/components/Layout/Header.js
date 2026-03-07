import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BellIcon } from '@heroicons/react/24/outline';

const Header = ({ user }) => {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex justify-between items-center px-6 py-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Sistema de Préstamos
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>
          
          {/* Botón cerrar sesión */}
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