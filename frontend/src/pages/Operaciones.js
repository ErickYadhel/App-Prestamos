import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
  PresentationChartLineIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  XMarkIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// Importar los submódulos
import Formularios from './Operaciones/Formularios';
import Reportes from './Operaciones/Reportes';
import Documentos from './Operaciones/Documentos';
import Calculos from './Operaciones/Calculos';
import Comisiones from './Operaciones/Comisiones';
import Calendario from './Operaciones/Calendario';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered, color }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ============================================
// MODAL PARA CADA MÓDULO (MEJORADO)
// ============================================
const ModuloModal = ({ isOpen, onClose, titulo, children, color, gradientColor }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColor} rounded-2xl blur-xl opacity-75`} />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 ${color.replace('from-', 'border-').split(' ')[0]}/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            {/* Cabecera con gradiente animado */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan" />
            </div>
            
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
                  <PresentationChartLineIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {titulo}
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {children}
            </div>

            {/* Footer con efecto de brillo */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'
            }`}>
              <div className="flex items-center space-x-2">
                <SparklesIcon className={`h-4 w-4 ${color.split(' ')[0].replace('from-', 'text-')}`} />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {titulo} - Gestión avanzada
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// TARJETA DE MÓDULO (REDISEÑADA)
// ============================================
const ModuloCard = ({ modulo, onClick }) => {
  const { theme } = useTheme();
  const Icon = modulo.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BorderGlow isHovered={isHovered} color={modulo.gradientColor}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-2xl shadow-xl cursor-pointer group ${
          theme === 'dark' ? 'bg-gray-800/90' : 'bg-white'
        } border-2 border-transparent hover:border-${modulo.color.split(' ')[0].replace('from-', '')}/30 transition-all duration-300`}
        onClick={onClick}
      >
        {/* Fondo con efecto tecnológico */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Círculos decorativos animados */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${modulo.color} rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse`} />
        <div className={`absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br ${modulo.color} rounded-full filter blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 animate-pulse`} style={{ animationDelay: '1s' }} />
        
        {/* Línea de escaneo tecnológico */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan`} />
        </div>

        <div className="relative p-6">
          {/* Header con icono y título */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`p-3 rounded-xl bg-gradient-to-br ${modulo.color} shadow-lg group-hover:shadow-xl transition-all`}
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} group-hover:bg-gradient-to-r ${modulo.color} group-hover:bg-clip-text group-hover:text-transparent transition-all`}>
                  {modulo.nombre}
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {modulo.descripcion}
                </p>
              </div>
            </div>
            
            {/* Badge tecnológico */}
            <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${modulo.color} opacity-20 group-hover:opacity-100 transition-opacity`}>
              <CpuChipIcon className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Items con efecto de brillo */}
          <ul className="space-y-2 mt-4">
            {modulo.items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center space-x-2 p-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700/50' 
                    : 'hover:bg-gray-100'
                } transition-all group/item`}
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${modulo.color} group-hover/item:scale-150 transition-transform`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} group-hover/item:translate-x-1 transition-transform`}>
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Botón de acceso con efecto */}
          <motion.div
            className="mt-6 overflow-hidden rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button className={`w-full py-3 px-4 bg-gradient-to-r ${modulo.color} text-white font-medium relative group/btn`}>
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>Acceder al módulo</span>
                <RocketLaunchIcon className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity" />
            </button>
          </motion.div>

          {/* Efecto de brillo en el borde */}
          <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${modulo.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Operaciones = () => {
  const { theme } = useTheme();
  const [modalAbierto, setModalAbierto] = useState(null);

  // Configuración de los módulos con gradientes mejorados
  const modulos = [
    {
      id: 'formularios',
      nombre: 'Formularios',
      descripcion: 'Gestión de formularios y solicitudes',
      icon: ClipboardDocumentListIcon,
      color: 'from-blue-500 to-blue-700',
      gradientColor: 'from-blue-600 via-blue-500 to-blue-600',
      items: ['Solicitudes de préstamo', 'Formularios de clientes', 'Garantías'],
      componente: <Formularios />
    },
    {
      id: 'reportes',
      nombre: 'Reportes',
      descripcion: 'Reportes y análisis operativos',
      icon: ChartBarIcon,
      color: 'from-green-500 to-green-700',
      gradientColor: 'from-green-600 via-green-500 to-green-600',
      items: ['Reporte diario', 'Análisis de cartera', 'Estadísticas de pagos'],
      componente: <Reportes />
    },
    {
      id: 'documentos',
      nombre: 'Documentos',
      descripcion: 'Gestión documental',
      icon: DocumentTextIcon,
      color: 'from-purple-500 to-purple-700',
      gradientColor: 'from-purple-600 via-purple-500 to-purple-600',
      items: ['Contratos', 'Documentos de clientes', 'Expedientes'],
      componente: <Documentos />
    },
    {
      id: 'calculos',
      nombre: 'Cálculos',
      descripcion: 'Herramientas de cálculo',
      icon: CalculatorIcon,
      color: 'from-yellow-500 to-yellow-700',
      gradientColor: 'from-yellow-600 via-yellow-500 to-yellow-600',
      items: ['Calculadora de intereses', 'Amortizaciones', 'Tablas de pago'],
      componente: <Calculos />
    },
    {
      id: 'comisiones',
      nombre: 'Comisiones',
      descripcion: 'Gestión de comisiones',
      icon: CurrencyDollarIcon,
      color: 'from-red-500 to-red-700',
      gradientColor: 'from-red-600 via-red-500 to-red-600',
      items: ['Comisiones por préstamos', 'Comisiones por cobros', 'Liquidaciones'],
      componente: <Comisiones />
    },
    {
      id: 'calendario',
      nombre: 'Calendario',
      descripcion: 'Calendario de pagos y eventos',
      icon: CalendarIcon,
      color: 'from-indigo-500 to-indigo-700',
      gradientColor: 'from-indigo-600 via-indigo-500 to-indigo-600',
      items: ['Calendario de pagos', 'Vencimientos', 'Recordatorios'],
      componente: <Calendario />
    }
  ];

  const moduloSeleccionado = modulos.find(m => m.id === modalAbierto);

  // Estadísticas de módulos (para el header)
  const totalModulos = modulos.length;
  const modulosActivos = modulos.length; // Todos están activos

  return (
    <div className="space-y-8 p-6">
      {/* Header principal con efecto tecnológico */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        {/* Fondo con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 rounded-2xl blur-3xl animate-gradient-xy" />
        
        {/* Cuadrícula tecnológica */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${
            theme === 'dark' ? '#fff' : '#000'
          } 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
        
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-red-600/20">
          {/* Línea de escaneo */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-4 bg-gradient-to-br from-red-600 via-red-500 to-red-600 rounded-2xl shadow-xl"
              >
                <PresentationChartLineIcon className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent">
                  Módulo de Operaciones
                </h1>
                <p className={`text-sm mt-2 flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <SparklesIcon className="h-4 w-4 text-yellow-500 mr-2" />
                  Gestión de formularios, reportes, documentos, cálculos, comisiones y calendario
                </p>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="flex space-x-4">
              <div className="text-right">
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {totalModulos}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Módulos totales
                </p>
              </div>
              <div className="w-px h-10 bg-gray-300 dark:bg-gray-600" />
              <div className="text-right">
                <p className={`text-2xl font-bold text-green-600`}>
                  {modulosActivos}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Módulos activos
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid de módulos con diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modulos.map((modulo, index) => (
          <ModuloCard
            key={modulo.id}
            modulo={modulo}
            onClick={() => setModalAbierto(modulo.id)}
          />
        ))}
      </div>

      {/* Modal para el módulo seleccionado */}
      <ModuloModal
        isOpen={modalAbierto !== null}
        onClose={() => setModalAbierto(null)}
        titulo={moduloSeleccionado?.nombre || 'Módulo'}
        color={moduloSeleccionado?.color}
        gradientColor={moduloSeleccionado?.gradientColor}
      >
        {moduloSeleccionado && moduloSeleccionado.componente}
      </ModuloModal>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Operaciones;