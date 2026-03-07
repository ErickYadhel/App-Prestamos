import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  PencilIcon,
  ArrowLeftIcon,
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BellIcon,
  CogIcon,
  FolderIcon,
  PaintBrushIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Módulos disponibles (misma lista que en RolForm)
const MODULOS = [
  { id: 'dashboard', nombre: 'Dashboard', icon: HomeIcon },
  { id: 'clientes', nombre: 'Clientes', icon: UsersIcon },
  { id: 'prestamos', nombre: 'Préstamos', icon: CurrencyDollarIcon },
  { id: 'pagos', nombre: 'Pagos', icon: CreditCardIcon },
  { id: 'solicitudes', nombre: 'Solicitudes', icon: DocumentTextIcon },
  { id: 'usuarios', nombre: 'Usuarios', icon: UsersIcon },
  { id: 'configuracion', nombre: 'Configuración', icon: CogIcon },
  { id: 'reportes', nombre: 'Reportes', icon: ChartBarIcon },
  { id: 'notificaciones', nombre: 'Notificaciones', icon: BellIcon },
  { id: 'backup', nombre: 'Backup', icon: FolderIcon },
  { id: 'apariencia', nombre: 'Apariencia', icon: PaintBrushIcon }
];

// Iconos por rol
const getRolIcon = (rolId) => {
  switch(rolId) {
    case 'admin': return ShieldCheckIcon;
    case 'supervisor': return EyeIcon;
    case 'consultor': return AcademicCapIcon;
    case 'solicitante': return DocumentTextIcon;
    default: return ShieldCheckIcon;
  }
};

// Colores por rol
const getRolColor = (rolId) => {
  switch(rolId) {
    case 'admin': return 'from-red-600 to-red-800';
    case 'supervisor': return 'from-yellow-500 to-yellow-700';
    case 'consultor': return 'from-green-500 to-green-700';
    case 'solicitante': return 'from-blue-500 to-blue-700';
    default: return 'from-purple-600 to-purple-800';
  }
};

const RolDetails = ({ rol, onBack, onEdit }) => {
  const IconoRol = getRolIcon(rol.id);
  const colorRol = getRolColor(rol.id);
  
  const totalPermisos = rol.modulos 
    ? Object.values(rol.modulos).reduce((acc, acciones) => acc + acciones.length, 0)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-2xl max-w-6xl mx-auto overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorRol} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-white" />
            </button>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <IconoRol className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{rol.nombre}</h2>
              <p className="text-white/80">{rol.descripcion}</p>
            </div>
          </div>
          
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Editar Permisos</span>
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">ID del Rol</p>
            <p className="text-lg font-semibold text-gray-900">{rol.id}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Módulos con acceso</p>
            <p className="text-lg font-semibold text-gray-900">
              {rol.modulos ? Object.keys(rol.modulos).length : 0}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total permisos</p>
            <p className="text-lg font-semibold text-gray-900">{totalPermisos}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Usuarios asignados</p>
            <p className="text-lg font-semibold text-gray-900">{rol.totalUsuarios || 0}</p>
          </div>
        </div>
      </div>

      {/* Permisos detallados */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permisos por Módulo</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MODULOS.map(modulo => {
            const ModuloIcon = modulo.icon;
            const permisosModulo = rol.modulos?.[modulo.id] || [];
            
            if (permisosModulo.length === 0) return null;
            
            return (
              <div
                key={modulo.id}
                className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                      <ModuloIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{modulo.nombre}</span>
                    <span className="ml-auto text-sm text-gray-600">
                      {permisosModulo.length} permisos
                    </span>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-2 gap-2">
                  {permisosModulo.map(permiso => (
                    <div
                      key={permiso}
                      className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200"
                    >
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm capitalize text-gray-700">{permiso}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default RolDetails;