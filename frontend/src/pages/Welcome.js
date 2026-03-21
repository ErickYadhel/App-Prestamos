import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../services/firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import {
  SparklesIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  TagIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Versión del sistema
const SISTEMA_VERSION = {
  version: '2.0.0',
  fecha: '2024-03-20',
  nombre: 'EYS Inversiones - Sistema de Gestión de Préstamos'
};

const Welcome = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [fraseDelDia, setFraseDelDia] = useState('');
  const [sessionLogged, setSessionLogged] = useState(false);
  const [userInfo, setUserInfo] = useState({
    ultimoAcceso: null,
    ultimoNavegador: null,
    ultimaPlataforma: null,
    fechaRegistro: null
  });

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

  // Función para obtener la IP del usuario
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error obteniendo IP:', error);
      return 'No disponible';
    }
  };

  // Función para obtener información del navegador
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Desconocido';
    let plataforma = navigator.platform || 'Desconocida';
    
    // Detectar navegador
    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
      browser = 'Chrome';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      browser = 'Safari';
    } else if (userAgent.indexOf('Edg') > -1) {
      browser = 'Edge';
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      browser = 'Opera';
    } else if (userAgent.indexOf('Brave') > -1) {
      browser = 'Brave';
    }
    
    // Detectar dispositivo
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      plataforma = /iPad|iPhone|iPod/.test(userAgent) ? 'iOS' : 'Android';
    }
    
    return { browser, plataforma, dispositivo: userAgent };
  };

  // Función para formatear fecha local
  const formatLocalDate = (date) => {
    return date.toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Formatear fecha de último acceso para mostrar
  const formatUltimoAcceso = (fecha) => {
    if (!fecha) return 'Primera vez';
    try {
      const date = new Date(fecha);
      return date.toLocaleString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return fecha;
    }
  };

  // Formatear fecha de registro
  const formatFechaRegistro = (fecha) => {
    if (!fecha) return 'No disponible';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  // Cargar información del usuario desde Firestore
  const cargarInfoUsuario = async () => {
    if (!user || !user.id) return;
    
    try {
      const userRef = doc(db, 'usuarios', user.id);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserInfo({
          ultimoAcceso: data.ultimoAcceso || user.ultimoAcceso || null,
          ultimoNavegador: data.ultimoNavegador || user.ultimoNavegador || null,
          ultimaPlataforma: data.ultimaPlataforma || user.ultimaPlataforma || null,
          fechaRegistro: data.fechaCreacion || user.fechaCreacion || null
        });
      } else {
        setUserInfo({
          ultimoAcceso: user.ultimoAcceso || null,
          ultimoNavegador: user.ultimoNavegador || null,
          ultimaPlataforma: user.ultimaPlataforma || null,
          fechaRegistro: user.fechaCreacion || null
        });
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    }
  };

  // Registrar inicio de sesión
  const registrarInicioSesion = async () => {
    if (!user || sessionLogged) return;
    
    try {
      const ip = await getUserIP();
      const { browser, plataforma, dispositivo } = getBrowserInfo();
      const ahora = new Date();
      const fechaISO = ahora.toISOString();
      const fechaLocal = formatLocalDate(ahora);
      const hora = ahora.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      
      // Datos del registro
      const registro = {
        tipo: 'login',
        usuarioId: user.id || user.uid,
        usuarioEmail: user.email,
        usuarioNombre: user.nombre || user.displayName || 'Usuario',
        ip: ip,
        navegador: browser,
        plataforma: plataforma,
        dispositivo: dispositivo,
        fecha: fechaISO,
        fechaLocal: fechaLocal,
        hora: hora,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timestamp: Date.now()
      };
      
      console.log('📝 Registrando inicio de sesión:', registro);
      
      // Guardar en Firebase
      const inicioSesionRef = collection(db, 'Inicio_Sesion');
      await addDoc(inicioSesionRef, registro);
      
      console.log('✅ Inicio de sesión registrado correctamente');
      
      // Actualizar último acceso en el documento del usuario
      if (user.id || user.uid) {
        const userId = user.id || user.uid;
        const userRef = doc(db, 'usuarios', userId);
        await updateDoc(userRef, {
          ultimoAcceso: fechaISO,
          ultimoAccesoLocal: fechaLocal,
          ultimaIP: ip,
          ultimoNavegador: browser,
          ultimaPlataforma: plataforma
        });
        console.log('✅ Último acceso actualizado para el usuario');
        
        // Actualizar estado local
        setUserInfo(prev => ({
          ...prev,
          ultimoAcceso: fechaISO,
          ultimoNavegador: browser,
          ultimaPlataforma: plataforma
        }));
        
        // Actualizar el contexto usando updateUser
        if (updateUser) {
          await updateUser({
            ultimoAcceso: fechaISO,
            ultimoAccesoLocal: fechaLocal,
            ultimaIP: ip,
            ultimoNavegador: browser,
            ultimaPlataforma: plataforma
          });
        }
      }
      
      setSessionLogged(true);
    } catch (error) {
      console.error('❌ Error registrando inicio de sesión:', error);
    }
  };

  // Seleccionar frase al azar al cargar el componente
  useEffect(() => {
    setFraseDelDia(frases[Math.floor(Math.random() * frases.length)]);
  }, []);

  // Cargar información y registrar sesión cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      cargarInfoUsuario();
      
      // Registrar inicio de sesión si no se ha registrado en esta sesión
      if (!sessionLogged) {
        registrarInicioSesion();
      }
    }
  }, [user]);

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

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl w-full"
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

              {/* Primera fila de información */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Último acceso */}
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
                    {formatUltimoAcceso(userInfo.ultimoAcceso || user?.ultimoAcceso)}
                  </p>
                </motion.div>

                {/* Sistema de préstamos */}
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
                      <BuildingOfficeIcon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Sistema de Préstamos
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    EYS Inversiones
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Soluciones financieras
                  </p>
                </motion.div>

                {/* Versión estable */}
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
                      <TagIcon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Versión Estable
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    v{SISTEMA_VERSION.version}
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {new Date(SISTEMA_VERSION.fecha).toLocaleDateString('es-DO')}
                  </p>
                </motion.div>
              </div>

              {/* Segunda fila de información */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Dispositivo */}
                <motion.div
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className={`p-6 rounded-2xl ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                  } border border-red-600/20 text-center`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-red-600/20 rounded-xl">
                      <DevicePhoneMobileIcon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Dispositivo
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {userInfo.ultimaPlataforma || user?.ultimaPlataforma || 'No disponible'}
                  </p>
                </motion.div>

                {/* Navegador */}
                <motion.div
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className={`p-6 rounded-2xl ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                  } border border-red-600/20 text-center`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-red-600/20 rounded-xl">
                      <ComputerDesktopIcon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Navegador
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {userInfo.ultimoNavegador || user?.ultimoNavegador || 'No disponible'}
                  </p>
                </motion.div>

                {/* Botón Acerca de */}
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <Link
                    to="/informacion"
                    className={`block p-6 rounded-2xl border-2 transition-all text-center ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 border-red-600/30 hover:border-red-600/70 hover:bg-gray-800/70' 
                        : 'bg-gray-100/50 border-red-600/20 hover:border-red-600/50 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-red-600/20 rounded-xl">
                        <InformationCircleIcon className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                    <h3 className={`text-lg font-semibold mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Acerca de
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Información del sistema
                    </p>
                    <div className="mt-2 flex justify-center">
                      <QuestionMarkCircleIcon className="h-5 w-5 text-red-600" />
                    </div>
                  </Link>
                </motion.div>
              </div>

              {/* Información adicional del usuario */}
              <div className="grid grid-cols-1 md:grid-cols-100 gap-4 mb-8">
                <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-100/30'
                }`}>
                  <EnvelopeIcon className="h-5 w-5 text-red-600" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>Correo electrónico</p>
                    {user?.email || 'Email no disponible'}
                  </span>
                </div>
              </div>

              {/* Mensaje de navegación */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
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

              {/* Información de sesión registrada */}
              {sessionLogged && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="mt-4 text-center"
                >
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <GlobeAltIcon className="h-3 w-3 inline mr-1" />
                    Sesión registrada exitosamente
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Footer con año y nombre de empresa */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
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