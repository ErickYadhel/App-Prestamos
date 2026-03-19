import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ClockIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered, color = 'from-red-600 via-red-500 to-red-600' }) => (
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
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE FILA DE INFORMACIÓN (MEJORADO)
// ============================================
const InfoRow = ({ label, value, icon: Icon, color = 'gray' }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className="flex items-start space-x-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
    >
      <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
        <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {label}
        </p>
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-0.5 break-words`}>
          {value || 'No especificado'}
        </p>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE BADGE DE ESTADO
// ============================================
const StatusBadge = ({ activo }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
        activo 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      {activo ? (
        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
      ) : (
        <XCircleIcon className="h-4 w-4 mr-1.5" />
      )}
      {activo ? 'Activo' : 'Inactivo'}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE CABECERA
// ============================================
const HeaderSection = ({ cliente, onBack, onEdit }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BorderGlow isHovered={isHovered}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 blur-3xl" />
        
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${
            theme === 'dark' ? '#fff' : '#000'
          } 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />

        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-red-600/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </motion.button>
              
              <div className="flex items-center space-x-3">
                {cliente.foto ? (
                  <img
                    src={cliente.foto}
                    alt={cliente.nombre}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border-2 border-red-600/30"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <div class="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                          ${cliente.nombre?.charAt(0)}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    {cliente.nombre?.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {cliente.nombre}
                  </h1>
                  <p className={`text-xs sm:text-sm mt-1 flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1" />
                    Detalles del cliente
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Editar Cliente</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE SECCIÓN
// ============================================
const Section = ({ title, icon: Icon, children }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BorderGlow isHovered={isHovered}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative overflow-hidden rounded-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-red-800/5" />
        
        <div className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border-2 border-red-600/20 overflow-hidden`}>
          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
            theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className={`text-sm sm:text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE TARJETA DE ACCIÓN
// ============================================
const ActionCard = ({ icon: Icon, label, description, onClick, color = 'red' }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    red: 'from-red-600 to-red-800',
    green: 'from-green-600 to-green-800',
    blue: 'from-blue-600 to-blue-800',
    purple: 'from-purple-600 to-purple-800'
  };

  return (
    <BorderGlow isHovered={isHovered} color={`from-${color}-600 via-${color}-500 to-${color}-600`}>
      <motion.button
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full text-left relative overflow-hidden rounded-xl"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-5`} />
        
        <div className={`relative p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border-2 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        } hover:border-${color}-600/40 transition-all duration-300`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]} shadow-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {label}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {description}
              </p>
            </div>
            <RocketLaunchIcon className={`h-4 w-4 text-${color}-600 opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        </div>
      </motion.button>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const ClienteDetails = ({ cliente, onBack, onEdit }) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Formatear sueldo
  const formatSueldo = (sueldo) => {
    if (!sueldo) return 'No especificado';
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return 'No especificado';
    return `RD$ ${sueldoNum.toLocaleString('es-DO')}`;
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <HeaderSection cliente={cliente} onBack={onBack} onEdit={onEdit} />

      {/* Grid Principal */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        {/* Columna Principal (2/3 en desktop) */}
        <div className={`${isMobile ? '' : 'lg:col-span-2'} space-y-6`}>
          {/* Información Personal */}
          <Section title="Información Personal" icon={UserCircleIcon}>
            <InfoRow label="Cédula" value={cliente.cedula} icon={IdentificationIcon} color="purple" />
            <InfoRow label="Edad" value={`${cliente.edad} años`} icon={CalendarIcon} color="blue" />
            <InfoRow label="Celular" value={cliente.celular} icon={PhoneIcon} color="green" />
            <InfoRow label="Email" value={cliente.email} icon={EnvelopeIcon} color="red" />
          </Section>

          {/* Información Laboral */}
          <Section title="Información Laboral" icon={BriefcaseIcon}>
            <InfoRow label="Lugar de Trabajo" value={cliente.trabajo} icon={BuildingOfficeIcon} color="orange" />
            <InfoRow label="Puesto" value={cliente.puesto} icon={BuildingOfficeIcon} color="orange" />
            <InfoRow label="Sueldo" value={formatSueldo(cliente.sueldo)} icon={CurrencyDollarIcon} color="green" />
          </Section>

          {/* Dirección */}
          <Section title="Dirección" icon={MapPinIcon}>
            <InfoRow label="Dirección" value={cliente.direccion} icon={MapPinIcon} color="red" />
            <InfoRow label="Sector" value={cliente.sector} icon={MapPinIcon} color="red" />
            <InfoRow label="Provincia" value={cliente.provincia} icon={MapPinIcon} color="red" />
            <InfoRow label="País" value={cliente.pais || 'República Dominicana'} icon={MapPinIcon} color="red" />
          </Section>
        </div>

        {/* Sidebar (1/3 en desktop) */}
        <div className="space-y-6">
          {/* Estado */}
          <Section title="Estado" icon={CheckCircleIcon}>
            <div className="flex flex-col items-center text-center">
              <StatusBadge activo={cliente.activo !== false} />
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-3`}>
                {cliente.activo !== false 
                  ? 'El cliente puede recibir nuevos préstamos'
                  : 'El cliente no puede recibir nuevos préstamos'
                }
              </p>
              
              {cliente.fechaRegistro && (
                <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} w-full`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Registrado</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(cliente.fechaRegistro).toLocaleDateString()}
                    </span>
                  </div>
                  {cliente.ultimoAcceso && (
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Último acceso</span>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(cliente.ultimoAcceso).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Acciones Rápidas */}
          <Section title="Acciones Rápidas" icon={RocketLaunchIcon}>
            <div className="space-y-3">
              <ActionCard
                icon={CurrencyDollarIcon}
                label="Nuevo Préstamo"
                description="Crear un nuevo préstamo para este cliente"
                onClick={() => console.log('Nuevo préstamo')}
                color="green"
              />
              
              <ActionCard
                icon={CheckCircleIcon}
                label="Registrar Pago"
                description="Registrar un pago de préstamo"
                onClick={() => console.log('Registrar pago')}
                color="blue"
              />
              
              <ActionCard
                icon={ClockIcon}
                label="Ver Historial"
                description="Historial de préstamos y pagos"
                onClick={() => console.log('Ver historial')}
                color="purple"
              />
            </div>
          </Section>

          {/* Información Adicional */}
          {cliente.notas && (
            <Section title="Notas" icon={SparklesIcon}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {cliente.notas}
              </p>
            </Section>
          )}
        </div>
      </div>

      {/* Footer con metadatos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex flex-wrap items-center justify-between p-3 sm:p-4 rounded-xl border ${
          theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          <CpuChipIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            ID: {cliente.id}
          </span>
        </div>
        
        {cliente.creadoPor && (
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Creado por: {cliente.creadoPor}
          </div>
        )}
      </motion.div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
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
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ClienteDetails;