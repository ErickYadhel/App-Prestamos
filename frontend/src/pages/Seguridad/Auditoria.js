import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserCircleIcon,
  ComputerDesktopIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { doc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// ============================================
// COMPONENTE DE TOGGLE TECNOLÓGICO
// ============================================
const TechToggle = ({ label, description, checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked || false);

  useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(newValue);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-red-600/20 hover:border-red-600/50 transition-all cursor-pointer group"
      onClick={handleToggle}
    >
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isChecked ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <motion.div
          animate={{ x: isChecked ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE LOG DE AUDITORÍA
// ============================================
const AuditLogEntry = ({ log }) => {
  const { theme } = useTheme();

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'login': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'logout': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'configuracion': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      case 'acceso': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-red-600/20"
    >
      <div className={`p-2 rounded-lg ${getTipoColor(log.tipo)}`}>
        {log.tipo === 'login' && <UserCircleIcon className="h-5 w-5" />}
        {log.tipo === 'logout' && <UserCircleIcon className="h-5 w-5" />}
        {log.tipo === 'error' && <ExclamationTriangleIcon className="h-5 w-5" />}
        {log.tipo === 'warning' && <BellIcon className="h-5 w-5" />}
        {log.tipo === 'configuracion' && <DocumentTextIcon className="h-5 w-5" />}
        {log.tipo === 'acceso' && <ComputerDesktopIcon className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 dark:text-white">{log.evento}</p>
          <span className="text-xs text-gray-500 dark:text-gray-400">{log.fecha}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.descripcion}</p>
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            <UserCircleIcon className="h-3 w-3 inline mr-1" />
            {log.usuario}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            <ComputerDesktopIcon className="h-3 w-3 inline mr-1" />
            {log.ip}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: AUDITORÍA
// ============================================
const Auditoria = ({ configuracion, handleInputChange, onGuardar }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [logs, setLogs] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Cargar logs desde Firebase
  useEffect(() => {
    const cargarLogs = async () => {
      try {
        const logsRef = collection(db, 'Auditoria');
        const q = query(logsRef, orderBy('fecha', 'desc'), limit(50));
        const logsSnap = await getDocs(q);
        const logsList = [];
        logsSnap.forEach(doc => {
          logsList.push({ id: doc.id, ...doc.data() });
        });
        setLogs(logsList);
      } catch (error) {
        console.error('Error cargando logs:', error);
      }
    };
    cargarLogs();
  }, []);

  const guardarConfiguracion = async () => {
    try {
      setGuardando(true);
      setError('');
      
      const configRef = doc(db, 'Configuracion', 'auditoria');
      await setDoc(configRef, {
        ...configuracion,
        actualizadoPor: user?.email,
        fechaActualizacion: new Date().toISOString()
      }, { merge: true });
      
      setExito('Configuración guardada exitosamente');
      setTimeout(() => setExito(''), 3000);
      
      if (onGuardar) onGuardar();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setError('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  // Filtrar logs
  const logsFiltrados = logs.filter(log => {
    if (filtroTipo !== 'todos' && log.tipo !== filtroTipo) return false;
    if (busqueda && !log.evento.toLowerCase().includes(busqueda.toLowerCase()) && 
        !log.descripcion.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (fechaInicio && new Date(log.fecha) < new Date(fechaInicio)) return false;
    if (fechaFin && new Date(log.fecha) > new Date(fechaFin)) return false;
    return true;
  });

  const tiposLog = ['todos', 'login', 'logout', 'acceso', 'configuracion', 'error', 'warning'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Mensajes */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400 flex items-start space-x-3"
        >
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {exito && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400 flex items-start space-x-3"
        >
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{exito}</p>
        </motion.div>
      )}

      {/* Configuración de Auditoría */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl shadow-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configuración de Auditoría</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Opciones de registro y monitoreo</p>
            </div>
          </div>

          <div className="space-y-4">
            <TechToggle
              label="Registro de Accesos"
              description="Registrar todos los inicios y cierres de sesión"
              checked={configuracion?.auditoria?.registroAccesos || false}
              onChange={(value) => handleInputChange('auditoria', 'registroAccesos', value)}
            />

            <TechToggle
              label="Registro de Actividades"
              description="Registrar todas las acciones de los usuarios"
              checked={configuracion?.auditoria?.registroActividades || false}
              onChange={(value) => handleInputChange('auditoria', 'registroActividades', value)}
            />

            <TechToggle
              label="Registro de Cambios"
              description="Registrar modificaciones en la configuración"
              checked={configuracion?.auditoria?.registroCambios || false}
              onChange={(value) => handleInputChange('auditoria', 'registroCambios', value)}
            />

            <TechToggle
              label="Alertas en Tiempo Real"
              description="Notificar eventos críticos inmediatamente"
              checked={configuracion?.auditoria?.alertasTiempoReal || false}
              onChange={(value) => handleInputChange('auditoria', 'alertasTiempoReal', value)}
            />

            <TechToggle
              label="Exportación Automática"
              description="Exportar logs automáticamente"
              checked={configuracion?.auditoria?.exportacionAutomatica || false}
              onChange={(value) => handleInputChange('auditoria', 'exportacionAutomatica', value)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Visor de Logs */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Registro de Actividades</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Últimos 50 eventos</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              />
            </div>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className={`px-4 py-2 rounded-lg border-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
            >
              {tiposLog.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo === 'todos' ? 'Todos los tipos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className={`px-4 py-2 rounded-lg border-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              placeholder="Fecha inicio"
            />

            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={`px-4 py-2 rounded-lg border-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
              placeholder="Fecha fin"
            />
          </div>

          {/* Lista de logs */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {logsFiltrados.length === 0 ? (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No hay registros para mostrar
              </p>
            ) : (
              logsFiltrados.map((log) => (
                <AuditLogEntry key={log.id} log={log} />
              ))
            )}
          </div>

          {/* Botón para exportar */}
          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Exportar Logs</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Botón Guardar */}
      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={guardarConfiguracion}
          disabled={guardando}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {guardando ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              <span>Guardar Configuración</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Auditoria;