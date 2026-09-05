import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ReceiptRefundIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
  IdentificationIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShareIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  PercentBadgeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GiftIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  FingerPrintIcon,
  HomeIcon,
  BriefcaseIcon,
  WalletIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { firebaseTimestampToLocalString } from '../../utils/firebaseUtils';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

// ============================================
// COMPONENTE DE TARJETA GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '', gradient = '' }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl shadow-xl border ${
        theme === 'dark' 
          ? 'bg-gray-800/80 backdrop-blur-lg border-gray-700/50' 
          : 'bg-white/90 backdrop-blur-lg border-gray-200/80 shadow-gray-200/50'
      } hover:border-red-600/40 transition-all duration-300 ${className}`}
    >
      {gradient && (
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} ${
          theme === 'dark' ? 'opacity-10' : 'opacity-5'
        } rounded-full blur-3xl`} />
      )}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ============================================
// COMPONENTE DE INFO ROW MEJORADO
// ============================================
const InfoRow = ({ label, value, icon: Icon, color = 'text-gray-600', subValue, badge, copyable }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copyable && value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Colores para modo claro/oscuro
  const getColorClass = (baseColor) => {
    if (theme === 'dark') {
      return baseColor;
    }
    // Modo claro - colores más vivos
    return baseColor.replace('dark:', '');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start space-x-3 py-3 border-b ${
        theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/80'
      } last:border-0 group hover:bg-red-50/30 dark:hover:bg-red-900/10 rounded-lg px-3 -mx-3 transition-all duration-200`}
    >
      <div className={`p-2 rounded-xl bg-gradient-to-br ${color} ${
        theme === 'dark' ? 'bg-opacity-10' : 'bg-opacity-15'
      } shadow-lg flex-shrink-0`}>
        <Icon className={`h-5 w-5 ${getColorClass(color)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-xs font-medium uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {label}
          </p>
          {badge && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.color} ${badge.textColor}`}>
              {badge.text}
            </span>
          )}
          {copyable && (
            <button
              onClick={handleCopy}
              className={`p-1 rounded-lg transition-all ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } opacity-0 group-hover:opacity-100`}
              title="Copiar"
            >
              {copied ? (
                <CheckCircleIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              ) : (
                <DocumentDuplicateIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </button>
          )}
        </div>
        <p className={`text-sm font-semibold mt-1 ${getColorClass(color)}`}>
          {value || 'No especificado'}
        </p>
        {subValue && (
          <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {subValue}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE PROGRESS BAR
// ============================================
const ProgressBar = ({ value, max, label, color }) => {
  const { theme } = useTheme();
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const getColor = () => {
    if (theme === 'dark') {
      return color;
    }
    // Modo claro - colores más vivos
    switch(color) {
      case 'from-green-500 to-emerald-600': return 'from-green-600 to-emerald-700';
      case 'from-blue-500 to-indigo-600': return 'from-blue-600 to-indigo-700';
      case 'from-red-500 to-rose-600': return 'from-red-600 to-rose-700';
      default: return color;
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
        <span className={`font-bold ${
          theme === 'dark' ? color : color.replace('from-', 'text-').split(' ')[0]
        }`}>{percentage.toFixed(1)}%</span>
      </div>
      <div className={`w-full h-2 rounded-full overflow-hidden ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${getColor()}`}
        />
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE STATS CARD
// ============================================
const StatCard = ({ icon: Icon, label, value, color, subValue }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const gradientColors = {
    green: theme === 'dark' ? 'from-green-500 to-emerald-700' : 'from-green-600 to-emerald-800',
    blue: theme === 'dark' ? 'from-blue-500 to-indigo-700' : 'from-blue-600 to-indigo-800',
    purple: theme === 'dark' ? 'from-purple-500 to-violet-700' : 'from-purple-600 to-violet-800',
    red: theme === 'dark' ? 'from-red-500 to-rose-700' : 'from-red-600 to-rose-800',
    orange: theme === 'dark' ? 'from-orange-500 to-amber-700' : 'from-orange-600 to-amber-800',
    teal: theme === 'dark' ? 'from-teal-500 to-cyan-700' : 'from-teal-600 to-cyan-800',
    pink: theme === 'dark' ? 'from-pink-500 to-rose-700' : 'from-pink-600 to-rose-800',
    indigo: theme === 'dark' ? 'from-indigo-500 to-purple-700' : 'from-indigo-600 to-purple-800'
  };

  return (
    <BorderGlow isHovered={isHovered}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -2 }}
        className={`relative overflow-hidden rounded-xl p-4 border-2 ${
          theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200/80 shadow-gray-200/30'
        } shadow-lg transition-all duration-300`}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColors[color]} ${
          theme === 'dark' ? 'opacity-10' : 'opacity-5'
        } rounded-full blur-3xl`} />
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {label}
            </p>
            <p className={`text-xl font-bold mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {subValue && (
              <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {subValue}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientColors[color]} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE BOTÓN PARA WHATSAPP
// ============================================
const WhatsAppShareButton = ({ pago, clienteInfo, onShare }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const generarMensajeWhatsApp = () => {
    const cliente = pago.clienteNombre || clienteInfo?.nombre || 'Cliente';
    const montoTotal = (pago.montoTotal || 0).toLocaleString();
    const montoCapital = (pago.montoCapital || 0).toLocaleString();
    const montoInteres = (pago.montoInteres || 0).toLocaleString();
    const fecha = firebaseTimestampToLocalString(pago.fechaPago);
    const tipo = pago.tipoPago ? pago.tipoPago.charAt(0).toUpperCase() + pago.tipoPago.slice(1) : 'Normal';
    const prestamoID = pago.prestamoID || 'N/A';
    const id = pago.id || 'N/A';
    const cedula = clienteInfo?.cedula || 'N/A';
    const telefono = clienteInfo?.celular || clienteInfo?.telefono || 'N/A';
    
    return `📋 *COMPROBANTE DE PAGO - EYS Inversiones*
    
━━━━━━━━━━━━━━━━━━━━━

🧾 *ID Pago:* ${id}
📅 *Fecha:* ${fecha}
👤 *Cliente:* ${cliente}
📌 *Tipo:* ${tipo}
🔗 *Préstamo ID:* ${prestamoID}
🪪 *Cédula:* ${cedula}
📱 *Teléfono:* ${telefono}

━━━━━━━━━━━━━━━━━━━━━

💰 *Monto Total:* RD$ ${montoTotal}
📊 *Capital Pagado:* RD$ ${montoCapital}
📈 *Interés Pagado:* RD$ ${montoInteres}

━━━━━━━━━━━━━━━━━━━━━

✅ *Estado:* Pago Registrado

*Gracias por confiar en EYS Inversiones*
🏦 *Sistema de Préstamos*`;
  };

  const handleWhatsApp = () => {
    const mensaje = generarMensajeWhatsApp();
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    const numeroCliente = clienteInfo?.celular || clienteInfo?.telefono || '';
    let url;
    
    if (numeroCliente) {
      const numeroLimpio = numeroCliente.replace(/\D/g, '');
      url = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
    } else {
      url = `https://wa.me/?text=${mensajeCodificado}`;
    }
    
    window.open(url, '_blank');
    if (onShare) onShare('whatsapp');
  };

  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleWhatsApp}
      className={`relative overflow-hidden px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 w-full justify-center ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
          : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30'
      }`}
    >
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity" />
      <ShareIcon className="h-5 w-5" />
      <span>Enviar por WhatsApp</span>
      <motion.span
        animate={{ x: isHovered ? 5 : 0 }}
        className="text-xs opacity-70"
      >
        →
      </motion.span>
    </motion.button>
  );
};

// ============================================
// COMPONENTE DE TARJETA DE CLIENTE
// ============================================
const ClienteInfoCard = ({ clienteInfo }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!clienteInfo) return null;

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'RD$ 0';
    return `RD$ ${value.toLocaleString()}`;
  };

  return (
    <GlassCard gradient="from-indigo-600 to-purple-800">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <UserIcon className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
            Información del Cliente
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            {isExpanded ? (
              <ChevronUpIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <ChevronDownIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
        </div>

        <div className="space-y-1">
          <InfoRow 
            label="Nombre Completo" 
            value={clienteInfo.nombre || 'N/A'}
            icon={UserIcon}
            color={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}
          />
          <InfoRow 
            label="Cédula" 
            value={clienteInfo.cedula || 'N/A'}
            icon={IdentificationIcon}
            color={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
            copyable
          />
          <InfoRow 
            label="Teléfono" 
            value={formatPhone(clienteInfo.celular || clienteInfo.telefono)}
            icon={PhoneIcon}
            color={theme === 'dark' ? 'text-green-400' : 'text-green-600'}
            copyable
          />
          <InfoRow 
            label="Email" 
            value={clienteInfo.email || 'N/A'}
            icon={EnvelopeIcon}
            color={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
          />
          <InfoRow 
            label="Dirección" 
            value={clienteInfo.direccion || 'N/A'}
            icon={HomeIcon}
            color={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}
          />
          <InfoRow 
            label="Sector" 
            value={clienteInfo.sector || 'N/A'}
            icon={MapPinIcon}
            color={theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}
          />
          <InfoRow 
            label="Provincia" 
            value={clienteInfo.provincia || 'N/A'}
            icon={MapPinIcon}
            color={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}
          />
          <InfoRow 
            label="País" 
            value={clienteInfo.pais || 'República Dominicana'}
            icon={GlobeAltIcon}
            color={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}
          />
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-700 space-y-1"
          >
            <InfoRow 
              label="Lugar de Trabajo" 
              value={clienteInfo.lugarTrabajo || clienteInfo.trabajo || 'N/A'}
              icon={BriefcaseIcon}
              color={theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}
            />
            <InfoRow 
              label="Puesto" 
              value={clienteInfo.puesto || clienteInfo.puestoCliente || 'N/A'}
              icon={BriefcaseIcon}
              color={theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}
            />
            <InfoRow 
              label="Sueldo" 
              value={formatCurrency(clienteInfo.sueldo || clienteInfo.sueldoCliente)}
              icon={BanknotesIcon}
              color={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}
            />
            <InfoRow 
              label="Banco" 
              value={clienteInfo.bancoCliente || 'N/A'}
              icon={BuildingOfficeIcon}
              color={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
            />
            <InfoRow 
              label="Cuenta Bancaria" 
              value={clienteInfo.cuentaCliente || 'N/A'}
              icon={WalletIcon}
              color={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}
              copyable
            />
            <InfoRow 
              label="Tipo de Cuenta" 
              value={clienteInfo.tipoCuenta || 'N/A'}
              icon={CreditCardIcon}
              color={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
            />
            <InfoRow 
              label="Fecha de Ingreso" 
              value={clienteInfo.fechaIngreso || 'N/A'}
              icon={CalendarIcon}
              color={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            />
            <InfoRow 
              label="Edad" 
              value={clienteInfo.edad || 'N/A'}
              icon={ClockIcon}
              color={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
            />
          </motion.div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
            ID: {clienteInfo.id?.slice(0, 15)}...
          </span>
          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
            {clienteInfo.activo ? (
              <span className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Activo
              </span>
            ) : (
              <span className="flex items-center text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                Inactivo
              </span>
            )}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const DetallesPago = ({ pago, prestamoInfo, onBack }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('info');
  const [clienteInfo, setClienteInfo] = useState(null);
  const [loadingCliente, setLoadingCliente] = useState(false);

  // Cargar información del cliente
  useEffect(() => {
    const cargarCliente = async () => {
      if (!pago?.clienteID) return;
      
      try {
        setLoadingCliente(true);
        const response = await api.get(`/clientes/${pago.clienteID}`);
        if (response.success) {
          setClienteInfo(response.data);
        }
      } catch (error) {
        console.error('Error cargando cliente:', error);
      } finally {
        setLoadingCliente(false);
      }
    };

    cargarCliente();
  }, [pago?.clienteID]);

  // Formatear montos
  const formatearMonto = (valor) => {
    if (!valor && valor !== 0) return 'RD$ 0';
    return `RD$ ${valor.toLocaleString()}`;
  };

  // Calcular distribución
  const montoTotal = pago.montoTotal || 0;
  const montoCapital = pago.montoCapital || 0;
  const montoInteres = pago.montoInteres || 0;
  const montoMora = pago.montoMora || 0;

  const porcentajeCapital = montoTotal > 0 ? (montoCapital / montoTotal) * 100 : 0;
  const porcentajeInteres = montoTotal > 0 ? (montoInteres / montoTotal) * 100 : 0;
  const porcentajeMora = montoTotal > 0 ? (montoMora / montoTotal) * 100 : 0;

  // Reducción de capital
  const reduccionCapital = (pago.capitalAnterior || 0) - (pago.capitalNuevo || 0);

  // Calcular eficiencia del pago
  const eficienciaPago = pago.capitalAnterior > 0 
    ? (reduccionCapital / pago.capitalAnterior) * 100 
    : 0;

  const getTipoPagoColor = (tipo) => {
    if (theme === 'dark') {
      const colores = {
        normal: 'text-blue-400 from-blue-500 to-blue-700',
        adelantado: 'text-green-400 from-green-500 to-green-700',
        mora: 'text-red-400 from-red-500 to-red-700',
        abono: 'text-purple-400 from-purple-500 to-purple-700'
      };
      return colores[tipo] || 'text-gray-400 from-gray-500 to-gray-700';
    }
    const colores = {
      normal: 'text-blue-700 from-blue-600 to-blue-800',
      adelantado: 'text-green-700 from-green-600 to-green-800',
      mora: 'text-red-700 from-red-600 to-red-800',
      abono: 'text-purple-700 from-purple-600 to-purple-800'
    };
    return colores[tipo] || 'text-gray-700 from-gray-600 to-gray-800';
  };

  const getTipoPagoIcon = (tipo) => {
    switch(tipo) {
      case 'normal': return CheckCircleIcon;
      case 'adelantado': return RocketLaunchIcon;
      case 'mora': return ExclamationTriangleIcon;
      case 'abono': return GiftIcon;
      default: return ReceiptRefundIcon;
    }
  };

  const TipoPagoIcon = getTipoPagoIcon(pago.tipoPago);
  const tipoColor = getTipoPagoColor(pago.tipoPago);

  // Tabs
  const tabs = [
    { id: 'info', label: 'Información', icon: InformationCircleIcon },
    { id: 'financiero', label: 'Financiero', icon: CurrencyDollarIcon },
    { id: 'impacto', label: 'Impacto', icon: ArrowTrendingUpIcon }
  ];

  // Colores para modo claro/oscuro del header
  const headerBg = theme === 'dark' 
    ? 'bg-gray-800/80 border-gray-700/50' 
    : 'bg-white/90 border-gray-200/80 shadow-gray-200/30';

  return (
    <div className="space-y-6">
      {/* Header con animación */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 rounded-2xl blur-3xl ${
          theme === 'dark' ? 'opacity-100' : 'opacity-50'
        }`} />
        
        <div className={`relative backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-red-600/20' 
            : 'bg-white/90 border-red-600/20 shadow-red-600/10'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1, x: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                }`}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </motion.button>
              <div>
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tipoColor} shadow-lg`}>
                    <TipoPagoIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Detalle del Pago
                    </h1>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="font-medium">ID:</span> {pago.id?.slice(0, 20)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                theme === 'dark'
                  ? `bg-${tipoColor.split(' ')[0].replace('text-', '')}/20 text-${tipoColor.split(' ')[0].replace('text-', '')}`
                  : `bg-${tipoColor.split(' ')[0].replace('text-', '')}/10 text-${tipoColor.split(' ')[0].replace('text-', '')}`
              } border border-current/20`}>
                {pago.tipoPago ? pago.tipoPago.charAt(0).toUpperCase() + pago.tipoPago.slice(1) : 'Normal'}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                theme === 'dark'
                  ? 'bg-green-900/30 text-green-400 border border-green-700'
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                <CheckCircleIcon className="h-3 w-3 inline mr-1" />
                Confirmado
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {firebaseTimestampToLocalString(pago.fechaPago)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className={`flex flex-wrap gap-1 sm:gap-2 p-1 rounded-xl backdrop-blur-sm border ${
        theme === 'dark' 
          ? 'bg-gray-800/50 border-red-600/10' 
          : 'bg-gray-100/50 border-red-600/10'
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-1.5 ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Tab: Información */}
        {activeTab === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Columna Principal */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard gradient="from-red-600 to-red-800">
                <div className="p-4 sm:p-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <InformationCircleIcon className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                    Información del Pago
                  </h3>
                  <div className="space-y-1">
                    <InfoRow 
                      label="ID del Pago" 
                      value={pago.id} 
                      icon={DocumentTextIcon}
                      color={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                      copyable
                    />
                    <InfoRow 
                      label="Fecha de Pago" 
                      value={firebaseTimestampToLocalString(pago.fechaPago)}
                      icon={CalendarIcon}
                      color={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                    />
                    <InfoRow 
                      label="Tipo de Pago" 
                      value={pago.tipoPago ? pago.tipoPago.charAt(0).toUpperCase() + pago.tipoPago.slice(1) : 'Normal'}
                      icon={ReceiptRefundIcon}
                      color={tipoColor}
                      badge={{
                        text: pago.tipoPago || 'Normal',
                        color: theme === 'dark' ? 'bg-red-600/20' : 'bg-red-100',
                        textColor: theme === 'dark' ? 'text-red-400' : 'text-red-700'
                      }}
                    />
                    <InfoRow 
                      label="Modo de Cálculo" 
                      value={pago.modoManual ? 'Manual' : 'Automático'}
                      icon={FingerPrintIcon}
                      color={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
                    />
                    <InfoRow 
                      label="ID del Préstamo" 
                      value={pago.prestamoID || 'N/A'}
                      icon={BuildingOfficeIcon}
                      color={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}
                      copyable
                    />
                    {pago.nota && (
                      <InfoRow 
                        label="Observaciones" 
                        value={pago.nota}
                        icon={ClipboardDocumentIcon}
                        color={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}
                      />
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Resumen Rápido */}
              <GlassCard gradient="from-blue-600 to-indigo-800">
                <div className="p-4 sm:p-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <SparklesIcon className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    Resumen Rápido
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/80'
                    }`}>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Pagado</p>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatearMonto(montoTotal)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/80'
                    }`}>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Interés Pagado</p>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                        {formatearMonto(montoInteres)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/80'
                    }`}>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Capital Pagado</p>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        {formatearMonto(montoCapital)}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Sidebar - Cliente */}
            <div className="space-y-6">
              {/* Información del Cliente */}
              {loadingCliente ? (
                <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="animate-pulse">Cargando información del cliente...</div>
                </div>
              ) : (
                <ClienteInfoCard clienteInfo={clienteInfo} />
              )}

              {/* WhatsApp Share */}
              <div className="flex justify-center">
                <WhatsAppShareButton pago={pago} clienteInfo={clienteInfo} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: Financiero */}
        {activeTab === 'financiero' && (
          <motion.div
            key="financiero"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                icon={BanknotesIcon}
                label="Monto Total"
                value={formatearMonto(montoTotal)}
                color="green"
                subValue="Total pagado"
              />
              <StatCard
                icon={CurrencyDollarIcon}
                label="Capital"
                value={formatearMonto(montoCapital)}
                color="blue"
                subValue={`${porcentajeCapital.toFixed(1)}% del total`}
              />
              <StatCard
                icon={PercentBadgeIcon}
                label="Interés"
                value={formatearMonto(montoInteres)}
                color="purple"
                subValue={`${porcentajeInteres.toFixed(1)}% del total`}
              />
              {montoMora > 0 && (
                <StatCard
                  icon={ExclamationTriangleIcon}
                  label="Mora"
                  value={formatearMonto(montoMora)}
                  color="red"
                  subValue={`${porcentajeMora.toFixed(1)}% del total`}
                />
              )}
            </div>

            {/* Detalle Financiero */}
            <GlassCard gradient="from-purple-600 to-pink-800">
              <div className="p-4 sm:p-6">
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <DocumentTextIcon className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                  Detalle Financiero
                </h3>
                <div className="space-y-3">
                  <InfoRow 
                    label="Monto Total" 
                    value={formatearMonto(montoTotal)}
                    icon={BanknotesIcon}
                    color={theme === 'dark' ? 'text-green-400' : 'text-green-600'}
                  />
                  <InfoRow 
                    label="Capital Pagado" 
                    value={formatearMonto(montoCapital)}
                    icon={BanknotesIcon}
                    color={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                  />
                  <InfoRow 
                    label="Interés Pagado" 
                    value={formatearMonto(montoInteres)}
                    icon={PercentBadgeIcon}
                    color={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
                  />
                  {montoMora > 0 && (
                    <InfoRow 
                      label="Mora Pagada" 
                      value={formatearMonto(montoMora)}
                      icon={ExclamationTriangleIcon}
                      color={theme === 'dark' ? 'text-red-400' : 'text-red-600'}
                    />
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Tab: Impacto */}
        {activeTab === 'impacto' && prestamoInfo && (
          <motion.div
            key="impacto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Impacto Principal */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard gradient="from-blue-600 to-cyan-800">
                <div className="p-4 sm:p-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <ArrowTrendingUpIcon className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    Impacto en el Préstamo
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/80'
                    }`}>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Capital Anterior</p>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatearMonto(pago.capitalAnterior)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/80'
                    }`}>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Capital Nuevo</p>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        {formatearMonto(pago.capitalNuevo)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/80'
                    }`}>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Reducción</p>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                        {formatearMonto(reduccionCapital)}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Métricas Adicionales */}
              <GlassCard gradient="from-indigo-600 to-purple-800">
                <div className="p-4 sm:p-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <SparklesIcon className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    Métricas del Préstamo
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <InfoRow 
                        label="Tasa de Interés" 
                        value={`${prestamoInfo.interesPercent || 0}%`}
                        icon={PercentBadgeIcon}
                        color={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}
                      />
                    </div>
                    <div>
                      <InfoRow 
                        label="Frecuencia" 
                        value={prestamoInfo.frecuencia || 'N/A'}
                        icon={CalendarIcon}
                        color={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Sidebar Impacto */}
            <div className="space-y-6">
              {/* Eficiencia */}
              <GlassCard gradient="from-emerald-600 to-teal-800">
                <div className="p-4 sm:p-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <ChartBarIcon className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    Eficiencia del Pago
                  </h3>
                  <div className="text-center">
                    <p className={`text-4xl font-bold ${eficienciaPago > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      {eficienciaPago.toFixed(1)}%
                    </p>
                    <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {eficienciaPago > 50 
                        ? '⭐ Excelente reducción de capital' 
                        : eficienciaPago > 25 
                          ? '✅ Buena reducción de capital' 
                          : '📊 Reducción moderada de capital'}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Información del Préstamo */}
              <GlassCard gradient="from-cyan-600 to-blue-800">
                <div className="p-4 sm:p-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <BuildingOfficeIcon className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                    Préstamo
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ID Préstamo</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {pago.prestamoID || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Monto Original</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatearMonto(prestamoInfo.montoPrestado)}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Whatsapp Share en impacto */}
              <div className="flex justify-center">
                <WhatsAppShareButton pago={pago} clienteInfo={clienteInfo} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
        }
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default DetallesPago;