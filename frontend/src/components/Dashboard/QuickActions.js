import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const QuickActions = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const autoHideTimeoutRef = useRef(null);

  // Detectar si es móvil (768px es el breakpoint estándar)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ============================================
  // PC y TABLET: Mostrar/ocultar botón con hover en borde derecho
  // ============================================
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e) => {
      const windowWidth = window.innerWidth;
      const mouseX = e.clientX;
      const triggerZone = windowWidth - 80; // Zona de activación a 80px del borde derecho
      
      if (mouseX > triggerZone) {
        // Mouse cerca del borde derecho - mostrar botón
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        if (!isOpen) {
          setIsVisible(true);
        }
      } else {
        // Mouse lejos - ocultar después de un delay
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
          if (!isOpen) {
            setIsVisible(false);
          }
        }, 300);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isMobile, isOpen]);

  // ============================================
  // MÓVIL: Detectar deslizamiento desde el borde derecho
  // ============================================
  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e) => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - touchStartX;
      const diffY = Math.abs(currentY - touchStartY);
      
      // Detectar deslizamiento desde el borde derecho (dentro de los primeros 60px)
      const isFromRightEdge = touchStartX > window.innerWidth - 60;
      // Deslizamiento hacia la izquierda (negativo) de al menos 30px
      const isSwipeLeft = diffX < -30;
      // Deslizamiento mayormente horizontal (no diagonal)
      const isHorizontal = diffY < 50;
      
      if (isFromRightEdge && isSwipeLeft && isHorizontal && !isOpen) {
        // Abrir menú
        setIsOpen(true);
        setIsVisible(true);
        
        // Auto-ocultar después de 3 segundos si no hay interacción
        if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
        autoHideTimeoutRef.current = setTimeout(() => {
          if (isOpen && !menuRef.current?.matches(':hover')) {
            setIsOpen(false);
            setIsVisible(false);
          }
        }, 3000);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
    };
  }, [isMobile, isOpen]);

  // ============================================
  // MÓVIL: Cerrar menú al tocar fuera
  // ============================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, isOpen]);

  // ============================================
  // MÓVIL: Auto-ocultar después de inactividad
  // ============================================
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    
    // Resetear el timeout cada vez que hay interacción con el menú
    const resetAutoHide = () => {
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
      autoHideTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setIsVisible(false);
      }, 3000);
    };
    
    resetAutoHide();
    
    const menuElement = menuRef.current;
    if (menuElement) {
      menuElement.addEventListener('touchstart', resetAutoHide);
      menuElement.addEventListener('touchmove', resetAutoHide);
      return () => {
        menuElement.removeEventListener('touchstart', resetAutoHide);
        menuElement.removeEventListener('touchmove', resetAutoHide);
      };
    }
  }, [isMobile, isOpen]);

  // Acciones del menú
  const actions = [
    { 
      to: '/clientes', 
      icon: UsersIcon, 
      text: 'Clientes', 
      color: 'from-blue-600 to-blue-800', 
      description: 'Gestionar clientes', 
      bgColor: 'bg-blue-500/20', 
      hoverBg: 'hover:bg-blue-500/30' 
    },
    { 
      to: '/prestamos', 
      icon: CurrencyDollarIcon, 
      text: 'Préstamos', 
      color: 'from-green-600 to-green-800', 
      description: 'Ver préstamos activos', 
      bgColor: 'bg-green-500/20', 
      hoverBg: 'hover:bg-green-500/30' 
    },
    { 
      to: '/pagos', 
      icon: CreditCardIcon, 
      text: 'Pagos', 
      color: 'from-teal-600 to-teal-800', 
      description: 'Registrar pagos', 
      bgColor: 'bg-teal-500/20', 
      hoverBg: 'hover:bg-teal-500/30' 
    },
    { 
      to: '/solicitudes', 
      icon: DocumentTextIcon, 
      text: 'Solicitudes', 
      color: 'from-purple-600 to-purple-800', 
      description: 'Revisar solicitudes', 
      bgColor: 'bg-purple-500/20', 
      hoverBg: 'hover:bg-purple-500/30' 
    }
  ];

  // ============================================
  // RENDERIZADO
  // ============================================
  
  // En móvil: el botón solo es visible cuando el menú está abierto
  // En PC: el botón aparece con hover en el borde derecho
  const buttonPosition = isMobile 
    ? `fixed bottom-6 right-6 transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
      }`
    : `fixed bottom-8 right-8 transition-all duration-300 ease-out transform ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none'
      }`;

  // Botón decorativo en el borde derecho para móvil (indicador visual)
  const edgeIndicator = isMobile && (
    <div 
      className="fixed right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-l-full opacity-70 shadow-lg z-40"
      style={{ boxShadow: '-2px 0 10px rgba(220,38,38,0.3)' }}
    />
  );

  return (
    <>
      {/* Área táctil para detectar deslizamiento en móvil */}
      {isMobile && (
        <div 
          className="fixed right-0 top-0 w-[60px] h-full z-30"
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Indicador visual del borde derecho (solo móvil) */}
      {edgeIndicator}

      {/* Botón de acciones rápidas */}
      <motion.button
        ref={buttonRef}
        initial={!isMobile ? { opacity: 0, x: 100 } : { opacity: 0, scale: 0 }}
        animate={!isMobile 
          ? { 
              opacity: isVisible ? 1 : 0,
              x: isVisible ? 0 : 100,
              scale: isOpen ? 1.1 : 1
            }
          : { 
              opacity: isVisible ? 1 : 0,
              scale: isVisible ? 1 : 0
            }
        }
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 30,
          duration: 0.3
        }}
        whileHover={!isMobile ? { scale: 1.15, rotate: 15 } : {}}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (isMobile) {
            setIsOpen(!isOpen);
            setIsVisible(!isOpen);
            
            // Auto-ocultar después de 3 segundos si se abre
            if (!isOpen) {
              if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
              autoHideTimeoutRef.current = setTimeout(() => {
                setIsOpen(false);
                setIsVisible(false);
              }, 3000);
            }
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`${buttonPosition} z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center overflow-hidden group cursor-pointer`}
        style={{
          background: isOpen 
            ? 'linear-gradient(135deg, #dc2626, #991b1b)'
            : theme === 'dark'
              ? 'linear-gradient(135deg, #1f2937, #111827)'
              : 'linear-gradient(135deg, #ffffff, #f3f4f6)',
          boxShadow: isOpen 
            ? '0 10px 25px -5px rgba(220, 38, 38, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: `2px solid ${isOpen ? '#fff' : theme === 'dark' ? '#374151' : '#e5e7eb'}`
        }}
      >
        {/* Efecto de brillo al hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        {/* Icono de rayo moderno */}
        <motion.div
          animate={{ 
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.2 : 1
          }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={`w-7 h-7 transition-colors duration-300 ${
              isOpen 
                ? 'text-white' 
                : theme === 'dark' 
                  ? 'text-yellow-400 group-hover:text-yellow-300' 
                  : 'text-yellow-500 group-hover:text-yellow-600'
            }`}
          >
            <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
          </svg>
        </motion.div>
        
        {/* Anillo pulsante cuando está abierto */}
        {isOpen && (
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full border-2 border-red-500"
          />
        )}
      </motion.button>

      {/* Menú desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, x: 400, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              staggerChildren: 0.1,
              delayChildren: 0.1
            }}
            className={`fixed ${isMobile ? 'bottom-24 right-4' : 'bottom-24 right-8'} w-80 z-50 rounded-2xl shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'
            } border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Header del menú */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gradient-to-r from-red-50 to-white'}`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                  <RocketLaunchIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Acciones Rápidas
                  </h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isMobile ? 'Desliza desde el borde derecho' : 'Acceso directo a módulos'}
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de acciones con animaciones */}
            <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
              {actions.map((action, index) => (
                <motion.div
                  key={action.to}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={action.to}
                    onClick={() => {
                      setIsOpen(false);
                      setIsVisible(false);
                      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
                    }}
                    className={`block p-3 rounded-xl transition-all duration-300 ${action.bgColor} ${action.hoverBg} ${
                      theme === 'dark' ? 'hover:bg-opacity-30' : ''
                    } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} group`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color} shadow-lg transform transition-transform group-hover:scale-110 duration-300`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {action.text}
                        </h4>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {action.description}
                        </p>
                      </div>
                      <ChevronDoubleRightIcon className={`h-4 w-4 transition-all duration-300 group-hover:translate-x-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer con consejo */}
            <div className={`p-3 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-800/30' : 'border-gray-100 bg-gray-50'}`}>
              <p className={`text-xs text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {isMobile 
                  ? '💡 Desliza desde el borde derecho de la pantalla' 
                  : '💡 Mueve el mouse al borde derecho para mostrar el botón'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickActions;