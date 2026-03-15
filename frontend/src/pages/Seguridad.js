import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldCheckIcon,
  KeyIcon,
  FingerPrintIcon,
  LockClosedIcon,
  UserGroupIcon,
  ClockIcon,
  XMarkIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Importaciones de los submódulos
import ConfiguracionSeguridad from './Seguridad/ConfiguracionSeguridad';
import ControlAccesos from './Seguridad/ControlAccesos';
import Auditoria from './Seguridad/Auditoria';
import Roles from './Seguridad/Roles';

// ============================================
// MODAL PARA CONFIGURACIÓN
// ============================================
const ConfigModal = ({ isOpen, onClose, titulo, children }) => {
  const { theme } = useTheme();

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
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-red-600/20' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {titulo}
              </h3>
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

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Seguridad = () => {
  const { theme } = useTheme();
  const [modalAbierto, setModalAbierto] = useState(null);
  const [configuracion, setConfiguracion] = useState({
    seguridad: {
      requiereVerificacionEmail: false,
      autenticacionDosFactores: false,
      sesionUnica: false,
      intentosLoginMaximos: 5,
      longitudMinimaPassword: 6,
      bloqueoAutomatico: false,
      minutosInactividad: 30,
      notificarIntentosFallidos: true,
      registroCompleto: true,
      politicaContraseña: 'media',
      requiereCaracteresEspeciales: false,
      requiereMayusculas: false,
      requiereNumeros: false,
      notificarNuevosDispositivos: false
    },
    controlAccesos: {
      bloqueoIP: false,
      restriccionHorario: false,
      geolocalizacion: false,
      dispositivosConfiables: false
    },
    auditoria: {
      registroAccesos: false,
      registroActividades: false,
      registroCambios: false,
      alertasTiempoReal: false,
      exportacionAutomatica: false
    }
  });

  const handleInputChange = (categoria, campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [campo]: valor
      }
    }));
  };

  const modulos = [
    {
      id: 'accesos',
      nombre: 'Control de Accesos',
      descripcion: 'Gestión de permisos y accesos al sistema',
      icon: LockClosedIcon,
      color: 'from-red-600 to-red-800',
      items: ['Matriz de permisos', 'Accesos por rol', 'Restricciones'],
      componente: () => (
        <ControlAccesos 
          configuracion={configuracion}
          handleInputChange={handleInputChange}
        />
      )
    },
    {
      id: 'autenticacion',
      nombre: 'Autenticación',
      descripcion: 'Configuración de métodos de autenticación',
      icon: FingerPrintIcon,
      color: 'from-purple-600 to-purple-800',
      items: ['2FA', 'Políticas de contraseñas', 'Sesiones activas'],
      componente: () => (
        <ConfiguracionSeguridad 
          configuracion={configuracion}
          handleInputChange={handleInputChange}
        />
      )
    },
    {
      id: 'auditoria',
      nombre: 'Auditoría',
      descripcion: 'Registro de actividades y eventos',
      icon: ClockIcon,
      color: 'from-yellow-600 to-yellow-800',
      items: ['Logs de acceso', 'Actividad de usuarios', 'Eventos críticos'],
      componente: () => (
        <Auditoria 
          configuracion={configuracion}
          handleInputChange={handleInputChange}
        />
      )
    },
    {
      id: 'roles',
      nombre: 'Roles y Permisos',
      descripcion: 'Gestión de roles y sus permisos',
      icon: UserGroupIcon,
      color: 'from-green-600 to-green-800',
      items: ['Roles del sistema', 'Permisos por módulo', 'Asignaciones'],
      componente: () => <Roles />
    }
  ];

  const handleConfigurar = (moduloId) => {
    setModalAbierto(moduloId);
  };

  const moduloSeleccionado = modulos.find(m => m.id === modalAbierto);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
          <ShieldCheckIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Módulo de Seguridad
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestión de accesos, autenticación y auditoría del sistema
          </p>
        </div>
      </div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modulos.map((modulo, index) => {
          const Icon = modulo.icon;
          
          return (
            <motion.div
              key={modulo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl shadow-xl border ${
                theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${modulo.color}`} />
              
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${modulo.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {modulo.nombre}
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {modulo.descripcion}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mt-4">
                  {modulo.items.map((item, i) => (
                    <li
                      key={i}
                      className={`flex items-center space-x-2 p-2 rounded-lg ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors cursor-pointer`}
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${modulo.color}`} />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleConfigurar(modulo.id)}
                  className={`mt-6 w-full py-2 px-4 rounded-lg bg-gradient-to-r ${modulo.color} text-white font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2`}
                >
                  <CogIcon className="h-5 w-5" />
                  <span>Configurar</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de configuración */}
      <ConfigModal
        isOpen={modalAbierto !== null}
        onClose={() => setModalAbierto(null)}
        titulo={moduloSeleccionado?.nombre || 'Configuración'}
      >
        {moduloSeleccionado && moduloSeleccionado.componente()}
      </ConfigModal>
    </div>
  );
};

export default Seguridad;