import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  EyeIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BellIcon,
  CogIcon,
  FolderIcon,
  PaintBrushIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Datos de módulos disponibles
const MODULOS = [
  {
    id: 'dashboard',
    nombre: 'Dashboard',
    icon: HomeIcon,
    acciones: ['ver', 'exportar']
  },
  {
    id: 'clientes',
    nombre: 'Clientes',
    icon: UsersIcon,
    acciones: ['ver', 'crear', 'editar', 'eliminar']
  },
  {
    id: 'prestamos',
    nombre: 'Préstamos',
    icon: CurrencyDollarIcon,
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar']
  },
  {
    id: 'pagos',
    nombre: 'Pagos',
    icon: CreditCardIcon,
    acciones: ['ver', 'registrar', 'editar', 'eliminar']
  },
  {
    id: 'solicitudes',
    nombre: 'Solicitudes',
    icon: DocumentTextIcon,
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'rechazar']
  },
  {
    id: 'usuarios',
    nombre: 'Usuarios',
    icon: UsersIcon,
    acciones: ['ver', 'crear', 'editar', 'eliminar']
  },
  {
    id: 'configuracion',
    nombre: 'Configuración',
    icon: CogIcon,
    acciones: ['ver', 'editar']
  },
  {
    id: 'reportes',
    nombre: 'Reportes',
    icon: ChartBarIcon,
    acciones: ['ver', 'generar', 'exportar']
  },
  {
    id: 'notificaciones',
    nombre: 'Notificaciones',
    icon: BellIcon,
    acciones: ['ver', 'enviar']
  },
  {
    id: 'backup',
    nombre: 'Backup',
    icon: FolderIcon,
    acciones: ['ver', 'crear', 'restaurar']
  },
  {
    id: 'apariencia',
    nombre: 'Apariencia',
    icon: PaintBrushIcon,
    acciones: ['ver', 'editar']
  }
];

// Datos de roles predefinidos
const ROLES_PREDEFINIDOS = [
  { id: 'admin', nombre: 'Administrador', color: 'from-red-600 to-red-800', icon: ShieldCheckIcon },
  { id: 'supervisor', nombre: 'Supervisor', color: 'from-yellow-500 to-yellow-700', icon: EyeIcon },
  { id: 'consultor', nombre: 'Consultor', color: 'from-green-500 to-green-700', icon: AcademicCapIcon },
  { id: 'solicitante', nombre: 'Solicitante', color: 'from-blue-500 to-blue-700', icon: DocumentTextIcon }
];

const RolForm = ({ rol, onSave, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    if (rol) {
      return {
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        color: rol.color,
        modulos: rol.modulos || {}
      };
    } else {
      // Nuevo rol por defecto
      return {
        id: '',
        nombre: '',
        descripcion: '',
        color: 'blue',
        modulos: {}
      };
    }
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTogglePermiso = (moduloId, accion) => {
    setFormData(prev => {
      const modulosActuales = { ...prev.modulos };
      if (!modulosActuales[moduloId]) {
        modulosActuales[moduloId] = [];
      }
      
      if (modulosActuales[moduloId].includes(accion)) {
        modulosActuales[moduloId] = modulosActuales[moduloId].filter(a => a !== accion);
      } else {
        modulosActuales[moduloId] = [...modulosActuales[moduloId], accion];
      }
      
      // Si después de quitar permisos el array queda vacío, eliminamos la entrada
      if (modulosActuales[moduloId].length === 0) {
        delete modulosActuales[moduloId];
      }
      
      return {
        ...prev,
        modulos: modulosActuales
      };
    });
  };

  const handleToggleTodos = (moduloId, acciones) => {
    setFormData(prev => {
      const modulosActuales = { ...prev.modulos };
      const tieneTodos = modulosActuales[moduloId]?.length === acciones.length;
      
      if (tieneTodos) {
        delete modulosActuales[moduloId];
      } else {
        modulosActuales[moduloId] = [...acciones];
      }
      
      return {
        ...prev,
        modulos: modulosActuales
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.id.trim()) {
      newErrors.id = 'El ID del rol es requerido';
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del rol es requerido';
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const rolPredefinido = ROLES_PREDEFINIDOS.find(r => r.id === formData.id);
  const RolIcon = rolPredefinido?.icon || ShieldCheckIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-xl shadow-2xl max-w-6xl mx-auto overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${rolPredefinido?.color || 'from-purple-600 to-purple-800'} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <RolIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {rol ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <p className="text-white/80">
                Configura los permisos y accesos del rol
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Información básica del rol */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID del Rol *
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              disabled={!!rol}
              className={`input-primary ${errors.id ? 'border-red-500' : ''}`}
              placeholder="admin, supervisor, etc."
            />
            {errors.id && <p className="text-red-600 text-sm mt-1">{errors.id}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Rol *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`input-primary ${errors.nombre ? 'border-red-500' : ''}`}
              placeholder="Administrador, Supervisor, etc."
            />
            {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <select
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="input-primary"
            >
              <option value="red">Rojo</option>
              <option value="yellow">Amarillo</option>
              <option value="green">Verde</option>
              <option value="blue">Azul</option>
              <option value="purple">Púrpura</option>
            </select>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className={`input-primary ${errors.descripcion ? 'border-red-500' : ''}`}
              placeholder="Breve descripción de las funciones del rol"
            />
            {errors.descripcion && <p className="text-red-600 text-sm mt-1">{errors.descripcion}</p>}
          </div>
        </div>

        {/* Configuración de Permisos */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-red-600 mr-2" />
            Permisos por Módulo
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MODULOS.map(modulo => {
              const ModuloIcon = modulo.icon;
              const permisosModulo = formData.modulos[modulo.id] || [];
              
              return (
                <div
                  key={modulo.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Cabecera del módulo */}
                  <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                          <ModuloIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{modulo.nombre}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleToggleTodos(modulo.id, modulo.acciones)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          permisosModulo.length === modulo.acciones.length
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {permisosModulo.length === modulo.acciones.length ? 'Quitar todos' : 'Todos'}
                      </button>
                    </div>
                  </div>

                  {/* Acciones del módulo */}
                  <div className="p-4 grid grid-cols-2 gap-2">
                    {modulo.acciones.map(accion => {
                      const activo = permisosModulo.includes(accion);
                      
                      return (
                        <button
                          key={accion}
                          type="button"
                          onClick={() => handleTogglePermiso(modulo.id, accion)}
                          className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${
                            activo
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-red-300 text-gray-600'
                          }`}
                        >
                          <span className="text-xs font-medium capitalize">{accion}</span>
                          {activo ? (
                            <CheckCircleIcon className="h-4 w-4 text-red-600" />
                          ) : (
                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            {rol ? 'Actualizar Rol' : 'Crear Rol'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RolForm;