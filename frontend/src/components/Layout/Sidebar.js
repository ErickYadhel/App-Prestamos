import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Clientes', path: '/clientes', icon: UsersIcon },
    { name: 'Préstamos', path: '/prestamos', icon: CurrencyDollarIcon },
    { name: 'Pagos', path: '/pagos', icon: CreditCardIcon },
    { name: 'Solicitudes', path: '/solicitudes', icon: DocumentTextIcon },
    { name: 'Garantes', path: '/garantes', icon: UserGroupIcon },
    { name: 'Usuarios', path: '/usuarios', icon: UsersIcon },
    { name: 'Notificaciones', path: '/notificaciones', icon: BellIcon },
    { name: 'Configuración', path: '/configuracion', icon: CogIcon },
  ];

  return (
    <div className="bg-black w-64 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-red-600">
        <h1 className="text-white text-xl font-bold">EYS Inversiones</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;