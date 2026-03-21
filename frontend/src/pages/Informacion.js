import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeftIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CodeBracketIcon,
  ServerIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';

// Versión del sistema
const SISTEMA_VERSION = {
  version: '2.0.0',
  fecha: '2024-03-20',
  nombre: 'EYS Inversiones - Sistema de Gestión de Préstamos',
  descripcion: 'Plataforma integral para la gestión de préstamos personales, seguimiento de pagos y análisis financiero. Diseñada para optimizar los procesos de préstamos y mejorar la experiencia del usuario.',
  tecnologias: [
    { nombre: 'React 18', descripcion: 'Biblioteca para interfaces de usuario' },
    { nombre: 'Tailwind CSS', descripcion: 'Framework de CSS utilitario' },
    { nombre: 'Firebase', descripcion: 'Autenticación y base de datos en tiempo real' },
    { nombre: 'Chart.js', descripcion: 'Gráficos interactivos' },
    { nombre: 'Framer Motion', descripcion: 'Animaciones fluidas' },
    { nombre: 'Heroicons', descripcion: 'Iconos profesionales' }
  ],
  modulos: [
    { nombre: 'Dashboard', descripcion: 'Panel de control con métricas y gráficos en tiempo real', icono: ChartBarIcon },
    { nombre: 'Clientes', descripcion: 'Gestión completa de clientes y sus datos personales', icono: UserGroupIcon },
    { nombre: 'Préstamos', descripcion: 'Administración de préstamos, pagos y vencimientos', icono: CurrencyDollarIcon },
    { nombre: 'Pagos', descripcion: 'Registro y seguimiento de pagos de capital e intereses', icono: DocumentTextIcon },
    { nombre: 'Solicitudes', descripcion: 'Gestión de solicitudes de préstamos', icono: RocketLaunchIcon },
    { nombre: 'Garantes', descripcion: 'Administración de garantes y avales', icono: ShieldCheckIcon }
  ],
  caracteristicas: [
    'Registro de inicio de sesión con IP y navegador',
    'Dashboard interactivo con filtros avanzados',
    'Gráficos personalizables en tiempo real',
    'Gestión completa de clientes y préstamos',
    'Seguimiento de pagos y vencimientos',
    'Reportes y análisis financieros',
    'Tema oscuro/claro',
    'Diseño responsive para móviles y tablets'
  ]
};

const Informacion = () => {
  const { theme } = useTheme();

  // Efecto de partículas
  const particles = Array.from({ length: 20 });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo con efecto gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-red-600/5 animate-gradient-xy"></div>
      
      {/* Cuadrícula de fondo */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${
          theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
        } 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Partículas flotantes */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-red-600/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            y: [null, -30, 30, -30],
            x: [null, 30, -30, 30],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      {/* Contenido principal */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Botón de regreso */}
          <Link
            to="/"
            className={`inline-flex items-center space-x-2 mb-6 px-4 py-2 rounded-lg transition-all ${
              theme === 'dark' 
                ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50' 
                : 'bg-gray-100/50 text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver al inicio</span>
          </Link>

          {/* Tarjeta principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`relative overflow-hidden rounded-3xl shadow-2xl border ${
              theme === 'dark' 
                ? 'bg-gray-900/90 border-red-600/30' 
                : 'bg-white/90 border-red-600/20'
            } backdrop-blur-xl`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            
            <div className="relative p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex p-4 bg-red-600/20 rounded-2xl mb-4"
                >
                  <InformationCircleIcon className="h-12 w-12 text-red-600" />
                </motion.div>
                <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Información del Sistema
                </h1>
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {SISTEMA_VERSION.nombre}
                </p>
              </div>

              {/* Grid de información - Versión y Empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`p-6 rounded-2xl ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                } border border-red-600/20`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <TagIcon className="h-6 w-6 text-red-600" />
                    <h2 className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Versión
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span className="font-semibold">Versión:</span> v{SISTEMA_VERSION.version}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span className="font-semibold">Fecha de lanzamiento:</span> {new Date(SISTEMA_VERSION.fecha).toLocaleDateString('es-DO')}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span className="font-semibold">Estado:</span> 
                      <span className="ml-1 px-2 py-0.5 bg-green-600/20 text-green-600 rounded-full text-xs">Estable</span>
                    </p>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                } border border-red-600/20`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <BuildingOfficeIcon className="h-6 w-6 text-red-600" />
                    <h2 className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Empresa
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span className="font-semibold">Nombre:</span> EYS Inversiones
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span className="font-semibold">Sector:</span> Servicios Financieros
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span className="font-semibold">Especialidad:</span> Préstamos Personales
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className={`p-6 rounded-2xl mb-8 ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
              } border border-red-600/20`}>
                <div className="flex items-center space-x-3 mb-4">
                  <SparklesIcon className="h-6 w-6 text-red-600" />
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Descripción
                  </h2>
                </div>
                <p className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {SISTEMA_VERSION.descripcion}
                </p>
              </div>

              {/* Tecnologías utilizadas */}
              <div className={`p-6 rounded-2xl mb-8 ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
              } border border-red-600/20`}>
                <div className="flex items-center space-x-3 mb-4">
                  <ServerIcon className="h-6 w-6 text-red-600" />
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Tecnologías Utilizadas
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {SISTEMA_VERSION.tecnologias.map((tech, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200/50'
                      }`}
                    >
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <div>
                        <p className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {tech.nombre}
                        </p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {tech.descripcion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Características del sistema */}
              <div className={`p-6 rounded-2xl mb-8 ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
              } border border-red-600/20`}>
                <div className="flex items-center space-x-3 mb-4">
                  <RocketLaunchIcon className="h-6 w-6 text-red-600" />
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Características Principales
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SISTEMA_VERSION.caracteristicas.map((caracteristica, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-2 rounded-lg ${
                        theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'
                      } transition-colors`}
                    >
                      <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {caracteristica}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Módulos del sistema */}
              <div className={`p-6 rounded-2xl mb-8 ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
              } border border-red-600/20`}>
                <div className="flex items-center space-x-3 mb-4">
                  <RocketLaunchIcon className="h-6 w-6 text-red-600" />
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Módulos del Sistema
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SISTEMA_VERSION.modulos.map((modulo, index) => {
                    const IconComponent = modulo.icono;
                    return (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 p-3 rounded-xl ${
                          theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'
                        } transition-colors`}
                      >
                        <div className="p-2 bg-red-600/20 rounded-lg">
                          <IconComponent className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {modulo.nombre}
                          </h3>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {modulo.descripcion}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer de información */}
              <div className="mt-8 text-center pt-6 border-t border-red-600/20">
                <div className="flex justify-center space-x-6 mb-4">
                  <div className="flex items-center space-x-2">
                    <DevicePhoneMobileIcon className="h-4 w-4 text-red-600" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Responsive
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ComputerDesktopIcon className="h-4 w-4 text-red-600" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Multiplataforma
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-4 w-4 text-red-600" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Seguro
                    </span>
                  </div>
                </div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  © {new Date().getFullYear()} EYS Inversiones. Todos los derechos reservados.
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Versión v{SISTEMA_VERSION.version} | Última actualización: {new Date(SISTEMA_VERSION.fecha).toLocaleDateString('es-DO')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
        }
      `}</style>
    </div>
  );
};

export default Informacion;