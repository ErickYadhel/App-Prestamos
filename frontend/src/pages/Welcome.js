import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  SparklesIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Welcome = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [fraseDelDia, setFraseDelDia] = useState('');

  // Obtener la hora del día para el saludo
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  // Frases inspiradoras rotativas
  const frases = [
    "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.",
    "El único modo de hacer un gran trabajo es amar lo que haces.",
    "Las oportunidades no ocurren, las creas.",
    "El fracaso es la oportunidad de empezar de nuevo con más inteligencia.",
    "La excelencia no es un acto, es un hábito.",
    "Cree en ti mismo y todo será posible.",
    "Los sueños no funcionan a menos que tú lo hagas.",
    "El futuro pertenece a quienes creen en la belleza de sus sueños."
  ];

  // Seleccionar frase al azar al cargar el componente
  useEffect(() => {
    setFraseDelDia(frases[Math.floor(Math.random() * frases.length)]);
  }, []);

  // Efecto de partículas para el fondo
  const particles = Array.from({ length: 30 });

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

      {/* Contenido principal - Z-INDEX REDUCIDO A 1 para que quede por debajo del header */}
      <div className="relative z-1 flex items-center justify-center min-h-screen p-4 md:p-8"> {/* 👈 Z-INDEX 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl w-full"
        >
          {/* Tarjeta de bienvenida principal */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`relative overflow-hidden rounded-3xl shadow-2xl border ${
              theme === 'dark' 
                ? 'bg-gray-900/90 border-red-600/30' 
                : 'bg-white/90 border-red-600/20'
            } backdrop-blur-xl`}
          >
            {/* Efecto de brillo superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            
            {/* Círculos decorativos */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-600 rounded-full filter blur-3xl opacity-20"></div>

            <div className="relative p-8 md:p-12">
              {/* Header con saludo y avatar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                      user?.color || 'from-red-600 to-red-800'
                    } flex items-center justify-center text-white shadow-xl overflow-hidden`}
                  >
                    {user?.foto ? (
                      <img 
                        src={user.foto} 
                        alt={user.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<span class="text-4xl font-bold">${user.nombre?.charAt(0)}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-4xl font-bold">
                        {user?.nombre?.charAt(0) || 'U'}
                      </span>
                    )}
                  </motion.div>
                  
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`text-4xl md:text-5xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {getGreeting()},
                    </motion.h1>
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent`}
                    >
                      {user?.nombre || 'Usuario'}
                    </motion.h2>
                  </div>
                </div>

                {/* Badge de rol */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className={`px-6 py-3 rounded-2xl bg-gradient-to-br ${
                    user?.color || 'from-gray-500 to-gray-700'
                  } shadow-xl flex items-center space-x-2`}
                >
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                  <span className="text-white font-semibold text-lg">
                    {user?.rolNombre || user?.rol || 'Usuario'}
                  </span>
                </motion.div>
              </div>

              {/* Frase inspiradora */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`mb-12 p-6 rounded-2xl ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                } border border-red-600/20`}
              >
                <div className="flex items-start space-x-3">
                  <SparklesIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <p className={`text-lg italic ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    "{fraseDelDia}"
                  </p>
                </div>
              </motion.div>

              {/* Grid de información */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`p-6 rounded-2xl ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                  } border border-red-600/20 text-center`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-red-600/20 rounded-xl">
                      <ClockIcon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Último acceso
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user?.ultimoAcceso 
                      ? new Date(user.ultimoAcceso).toLocaleString()
                      : 'Primera vez'
                    }
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className={`p-6 rounded-2xl ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                  } border border-red-600/20 text-center`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-red-600/20 rounded-xl">
                      <ChartBarIcon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Bienvenido
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Sistema de préstamos
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className={`p-6 rounded-2xl ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                  } border border-red-600/20 text-center`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-red-600/20 rounded-xl">
                      <RocketLaunchIcon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Versión
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    2.0.0 - Estable
                  </p>
                </motion.div>
              </div>

              {/* Mensaje de navegación */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className={`text-center p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-red-600/10' : 'bg-red-600/5'
                }`}
              >
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Utiliza el menú lateral para navegar por las diferentes secciones del sistema.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer con año y nombre de empresa */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8"
          >
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
            }`}>
              © {new Date().getFullYear()} EYS Inversiones. Todos los derechos reservados.
            </p>
          </motion.div>
        </motion.div>
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

export default Welcome;