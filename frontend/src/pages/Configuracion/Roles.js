import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BellIcon,
  CogIcon,
  FolderIcon,
  PaintBrushIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ============================================
// MODAL PARA CREAR/EDITAR ROL (RESPONSIVE)
// ============================================
const RolModal = ({ isOpen, onClose, rol, onGuardar, modo }) => {
  const [nombre, setNombre] = useState(rol?.nombre || '');
  const [descripcion, setDescripcion] = useState(rol?.descripcion || '');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (rol) {
      setNombre(rol.nombre);
      setDescripcion(rol.descripcion);
    } else {
      setNombre('');
      setDescripcion('');
    }
  }, [rol, isOpen]);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setGuardando(true);
    
    const id = nombre.toLowerCase().replace(/\s+/g, '_');
    
    await onGuardar({
      id,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || 'Sin descripción',
      color: 'from-purple-600 to-purple-800',
      icon: CpuChipIcon
    });
    
    setGuardando(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-red-600/20' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                    {modo === 'crear' ? (
                      <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    ) : (
                      <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    )}
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {modo === 'crear' ? 'Crear Nuevo Rol' : 'Editar Rol'}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setError('');
                  }}
                  className={`w-full px-4 py-2 sm:py-3 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-2 border-gray-700 text-white focus:border-red-500'
                      : 'bg-white border-2 border-gray-200 text-gray-900 focus:border-red-500'
                  }`}
                  placeholder="Ej: Gerente de Ventas"
                  autoFocus
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  ID: {nombre.toLowerCase().replace(/\s+/g, '_')}
                </p>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows="3"
                  className={`w-full px-4 py-2 sm:py-3 rounded-lg resize-none transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-2 border-gray-700 text-white focus:border-red-500'
                      : 'bg-white border-2 border-gray-200 text-gray-900 focus:border-red-500'
                  }`}
                  placeholder="Breve descripción de las funciones del rol"
                />
              </div>
            </div>

            <div className={`p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 ${
              theme === 'dark' ? 'bg-gray-800/50 border-red-600/20' : 'bg-gray-50 border-gray-200'
            }`}>
              <button
                onClick={onClose}
                className={`w-full sm:w-auto px-6 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={guardando}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>{modo === 'crear' ? 'Crear Rol' : 'Guardar Cambios'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MODAL DE CONFIGURACIÓN DE PERMISOS (RESPONSIVE)
// ============================================
const PermisosModal = ({ isOpen, onClose, rol, permisos, onGuardar, modulos }) => {
  const [permisosEdit, setPermisosEdit] = useState({});
  const [guardando, setGuardando] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setPermisosEdit(permisos || {});
  }, [permisos, isOpen]);

  const togglePermiso = (moduloId, accion) => {
    setPermisosEdit(prev => {
      const moduloActual = prev[moduloId] || [];
      const nuevoModulo = moduloActual.includes(accion)
        ? moduloActual.filter(a => a !== accion)
        : [...moduloActual, accion];
      
      return {
        ...prev,
        [moduloId]: nuevoModulo
      };
    });
  };

  const toggleTodos = (moduloId, acciones) => {
    setPermisosEdit(prev => {
      const moduloActual = prev[moduloId] || [];
      const tieneTodos = moduloActual.length === acciones.length;
      
      return {
        ...prev,
        [moduloId]: tieneTodos ? [] : [...acciones]
      };
    });
  };

  const calcularProgreso = () => {
    const totalAcciones = modulos.reduce((acc, m) => acc + m.acciones.length, 0);
    const activas = Object.values(permisosEdit).reduce((acc, arr) => acc + arr.length, 0);
    return { activas, total: totalAcciones };
  };

  if (!isOpen || !rol) return null;

  const progreso = calcularProgreso();
  const IconoRol = rol.icon || ShieldCheckIcon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
            </div>

            {/* Header responsive */}
            <div className={`p-4 sm:p-6 border-b ${
              theme === 'dark' ? 'border-red-600/20 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`p-3 sm:p-4 bg-gradient-to-br ${rol.color || 'from-purple-600 to-purple-800'} rounded-xl sm:rounded-2xl shadow-xl flex-shrink-0`}
                  >
                    <IconoRol className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </motion.div>
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {rol.nombre}
                      <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-normal ${
                        theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        ID: {rol.id}
                      </span>
                    </h2>
                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {rol.descripcion}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-initial text-right">
                    <div className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {progreso.activas}
                      <span className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>/{progreso.total}</span>
                    </div>
                    <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Permisos activos</div>
                  </div>
                  <div className="flex-1 sm:flex-initial w-full sm:w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(progreso.activas / progreso.total) * 100}%` }}
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                    />
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid de módulos responsive */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 gap-4">
                {modulos.map(modulo => {
                  const ModuloIcon = modulo.icon;
                  const permisosModulo = permisosEdit[modulo.id] || [];
                  const progresoModulo = permisosModulo.length;

                  return (
                    <motion.div
                      key={modulo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative group"
                    >
                      <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur`} />
                      <div className={`relative rounded-xl border overflow-hidden ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-red-600/20'
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className={`p-3 sm:p-4 border-b ${
                          theme === 'dark' ? 'border-red-600/20 bg-gray-800' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                                <ModuloIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className={`text-sm sm:text-base font-semibold ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>{modulo.nombre}</h3>
                                <div className="flex items-center space-x-2 mt-0.5">
                                  <div className="w-16 sm:w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(progresoModulo / modulo.acciones.length) * 100}%` }}
                                      className="h-full bg-gradient-to-r from-red-600 to-red-400"
                                    />
                                  </div>
                                  <span className={`text-xs ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {progresoModulo}/{modulo.acciones.length}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => toggleTodos(modulo.id, modulo.acciones.map(a => a))}
                              className={`w-full sm:w-auto px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                progresoModulo === modulo.acciones.length
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : theme === 'dark'
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {progresoModulo === modulo.acciones.length ? 'Quitar todos' : 'Todos'}
                            </button>
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {modulo.acciones.map(accion => {
                            const activo = permisosModulo.includes(accion);
                            
                            return (
                              <motion.button
                                key={accion}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => togglePermiso(modulo.id, accion)}
                                className={`relative group/accion p-2 sm:p-3 rounded-lg border-2 transition-all ${
                                  activo
                                    ? 'border-red-600 bg-red-600/20'
                                    : theme === 'dark'
                                      ? 'border-gray-700 hover:border-red-600/50'
                                      : 'border-gray-200 hover:border-red-600/50'
                                }`}
                              >
                                <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 transition-opacity duration-300 blur ${
                                  activo ? 'opacity-50' : 'group-hover/accion:opacity-30'
                                }`} />
                                
                                <div className="relative flex items-center justify-between">
                                  <span className={`text-xs sm:text-sm font-medium capitalize ${
                                    activo
                                      ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {accion}
                                  </span>
                                  {activo ? (
                                    <CheckCircleIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                    }`} />
                                  ) : (
                                    <div className={`h-3 w-3 sm:h-4 sm:w-4 border-2 rounded-full ${
                                      theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                                    }`} />
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer responsive */}
            <div className={`p-4 sm:p-6 border-t flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4 ${
              theme === 'dark' ? 'border-red-600/20 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <button
                onClick={onClose}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setGuardando(true);
                  onGuardar(permisosEdit);
                  setTimeout(() => setGuardando(false), 1000);
                }}
                disabled={guardando}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE PRINCIPAL (RESPONSIVE)
// ============================================
const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [permisos, setPermisos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalPermisosOpen, setModalPermisosOpen] = useState(false);
  const [rolEditando, setRolEditando] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  
  const { user } = useAuth();
  const { theme } = useTheme();

  const ROLES_FIJOS = [
    { 
      id: 'admin', 
      nombre: 'Administrador', 
      descripcion: 'Control total del sistema',
      color: 'from-red-600 to-red-800',
      icon: ShieldCheckIcon,
      fijo: true
    },
    { 
      id: 'supervisor', 
      nombre: 'Supervisor', 
      descripcion: 'Supervisión y aprobaciones',
      color: 'from-yellow-500 to-yellow-700',
      icon: EyeIcon,
      fijo: true
    },
    { 
      id: 'consultor', 
      nombre: 'Consultor', 
      descripcion: 'Consulta y análisis',
      color: 'from-green-500 to-green-700',
      icon: AcademicCapIcon,
      fijo: true
    },
    { 
      id: 'solicitante', 
      nombre: 'Solicitante', 
      descripcion: 'Gestión de solicitudes',
      color: 'from-blue-500 to-blue-700',
      icon: DocumentTextIcon,
      fijo: true
    }
  ];

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
      id: 'configuracion',
      nombre: 'Configuración',
      icon: CogIcon,
      acciones: ['ver', 'editar']
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

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!user) {
          setError('Debes iniciar sesión');
          return;
        }

        const rolesRef = collection(db, 'Roles');
        const rolesSnap = await getDocs(rolesRef);
        
        const rolesCargados = [];
        const permisosCargados = {};

        for (const rolFijo of ROLES_FIJOS) {
          const docRef = doc(db, 'Roles', rolFijo.id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            permisosCargados[rolFijo.id] = docSnap.data().permisos || {};
            rolesCargados.push({
              ...rolFijo,
              ...docSnap.data()
            });
          } else {
            permisosCargados[rolFijo.id] = {};
            rolesCargados.push(rolFijo);
          }
        }

        rolesSnap.forEach(doc => {
          const rolId = doc.id;
          if (!ROLES_FIJOS.find(r => r.id === rolId)) {
            const data = doc.data();
            permisosCargados[rolId] = data.permisos || {};
            rolesCargados.push({
              id: rolId,
              nombre: data.nombre || rolId,
              descripcion: data.descripcion || 'Rol personalizado',
              color: 'from-purple-600 to-purple-800',
              icon: CpuChipIcon,
              ...data
            });
          }
        });

        setRoles(rolesCargados);
        setPermisos(permisosCargados);
      } catch (error) {
        console.error('Error:', error);
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [user]);

  const handleGuardarNuevoRol = async (nuevoRol) => {
    try {
      const docRef = doc(db, 'Roles', nuevoRol.id);
      await setDoc(docRef, {
        nombre: nuevoRol.nombre,
        descripcion: nuevoRol.descripcion,
        permisos: {},
        creadoPor: user.email,
        fechaCreacion: new Date().toISOString()
      });

      setRoles(prev => [...prev, nuevoRol]);
      setPermisos(prev => ({ ...prev, [nuevoRol.id]: {} }));
      
      setExito(`Rol "${nuevoRol.nombre}" creado exitosamente`);
      setModalCrearOpen(false);
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al crear el rol');
    }
  };

  const handleGuardarEdicion = async (rolEditado) => {
    try {
      if (rolEditando.id !== rolEditado.id) {
        const newDocRef = doc(db, 'Roles', rolEditado.id);
        await setDoc(newDocRef, {
          nombre: rolEditado.nombre,
          descripcion: rolEditado.descripcion,
          permisos: permisos[rolEditando.id] || {},
          editadoPor: user.email,
          fechaEdicion: new Date().toISOString()
        });

        await deleteDoc(doc(db, 'Roles', rolEditando.id));

        setPermisos(prev => {
          const nuevos = { ...prev };
          nuevos[rolEditado.id] = nuevos[rolEditando.id];
          delete nuevos[rolEditando.id];
          return nuevos;
        });

        setRoles(prev => prev.map(r => 
          r.id === rolEditando.id 
            ? { ...rolEditado, permisos: permisos[rolEditando.id] }
            : r
        ));
      } else {
        const docRef = doc(db, 'Roles', rolEditado.id);
        await setDoc(docRef, {
          nombre: rolEditado.nombre,
          descripcion: rolEditado.descripcion,
          editadoPor: user.email,
          fechaEdicion: new Date().toISOString()
        }, { merge: true });

        setRoles(prev => prev.map(r => 
          r.id === rolEditado.id ? { ...r, ...rolEditado } : r
        ));
      }

      setExito(`Rol actualizado exitosamente`);
      setModalEditarOpen(false);
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al actualizar el rol');
    }
  };

  const handleEliminarRol = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este rol?')) return;

    try {
      await deleteDoc(doc(db, 'Roles', id));
      
      setRoles(prev => prev.filter(r => r.id !== id));
      setPermisos(prev => {
        const nuevos = { ...prev };
        delete nuevos[id];
        return nuevos;
      });
      
      setExito('Rol eliminado');
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar el rol');
    }
  };

  const handleGuardarPermisos = async (nuevosPermisos) => {
    if (!rolSeleccionado) return;
    
    try {
      const docRef = doc(db, 'Roles', rolSeleccionado.id);
      await setDoc(docRef, {
        permisos: nuevosPermisos,
        actualizadoPor: user.email,
        fechaActualizacion: new Date().toISOString()
      }, { merge: true });
      
      setPermisos(prev => ({
        ...prev,
        [rolSeleccionado.id]: nuevosPermisos
      }));
      
      setExito(`Permisos de ${rolSeleccionado.nombre} guardados`);
      setModalPermisosOpen(false);
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar permisos');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg">
            <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl sm:text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Roles y Permisos
            </h2>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestiona los roles y sus accesos
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <span className={`text-xs sm:text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {roles.length} Roles
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalCrearOpen(true)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Nuevo Rol</span>
            <span className="xs:hidden">Nuevo</span>
          </motion.button>
        </div>
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 sm:p-4 rounded-xl border-2 flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-700 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm sm:text-base">{error}</p>
          </motion.div>
        )}

        {exito && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 sm:p-4 rounded-xl border-2 ${
              theme === 'dark'
                ? 'bg-green-900/30 border-green-700 text-green-400'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <p className="text-sm sm:text-base">{exito}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Roles responsive */}
      {loading ? (
        <div className="flex justify-center py-12">
          <ArrowPathIcon className="h-8 w-8 text-red-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {roles.map(rol => {
            const Icon = rol.icon || ShieldCheckIcon;
            const totalPermisos = permisos[rol.id] 
              ? Object.values(permisos[rol.id]).reduce((acc, arr) => acc + arr.length, 0)
              : 0;
            const totalModulos = permisos[rol.id] 
              ? Object.keys(permisos[rol.id]).length 
              : 0;
            const totalAcciones = MODULOS.reduce((acc, m) => acc + m.acciones.length, 0);
            const isHovered = hoveredRole === rol.id;

            return (
              <BorderGlow key={rol.id} isHovered={isHovered}>
                <motion.div
                  onHoverStart={() => setHoveredRole(rol.id)}
                  onHoverEnd={() => setHoveredRole(null)}
                  className={`relative overflow-hidden rounded-xl p-4 sm:p-6 bg-gradient-to-br ${rol.color || 'from-purple-600 to-purple-800'} shadow-lg cursor-pointer group`}
                  onClick={() => {
                    setRolSeleccionado(rol);
                    setModalPermisosOpen(true);
                  }}
                >
                  <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-black/10 rounded-full blur-xl" />
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex space-x-1 sm:space-x-2">
                      {!rol.fijo && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRolEditando(rol);
                              setModalEditarOpen(true);
                            }}
                            className="p-1.5 sm:p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
                          >
                            <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminarRol(rol.id);
                            }}
                            className="p-1.5 sm:p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
                          >
                            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      {rol.fijo && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm text-white">
                          Fijo
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">{rol.nombre}</h3>
                    <p className="text-xs sm:text-sm text-white/80 mb-3 sm:mb-4 line-clamp-2">{rol.descripcion}</p>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-white/70">Módulos</span>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="text-white font-bold">{totalModulos}</span>
                          <span className="text-white/50">/{MODULOS.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-white/70">Permisos</span>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="text-white font-bold">{totalPermisos}</span>
                          <span className="text-white/50">/{totalAcciones}</span>
                        </div>
                      </div>

                      <div className="pt-1 sm:pt-2">
                        <div className="h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(totalPermisos / totalAcciones) * 100}%` }}
                            className="h-full bg-white rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </BorderGlow>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <RolModal
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onGuardar={handleGuardarNuevoRol}
        modo="crear"
      />

      <RolModal
        isOpen={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
        rol={rolEditando}
        onGuardar={handleGuardarEdicion}
        modo="editar"
      />

      <PermisosModal
        isOpen={modalPermisosOpen}
        onClose={() => setModalPermisosOpen(false)}
        rol={rolSeleccionado}
        permisos={permisos[rolSeleccionado?.id] || {}}
        onGuardar={handleGuardarPermisos}
        modulos={MODULOS}
      />
    </div>
  );
};

export default Roles;