import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CalculatorIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { formatFecha } from '../../utils/firebaseUtils';

// Componente para el ícono de ordenamiento
const SortIcon = ({ column, currentSort, sortDirection }) => {
  if (currentSort !== column) {
    return <ArrowsUpDownIcon className="h-3 w-3 ml-1 text-gray-400" />;
  }
  return sortDirection === 'asc' 
    ? <ChevronUpIcon className="h-3 w-3 ml-1 text-red-600" />
    : <ChevronDownIcon className="h-3 w-3 ml-1 text-red-600" />;
};

// Componente para el estado del préstamo
const EstadoBadge = ({ estado, theme, diasAtraso, configMora }) => {
  const estados = {
    activo: { 
      color: theme === 'dark' 
        ? 'bg-green-900/50 text-green-300 border-green-700' 
        : 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircleIcon,
      text: 'Activo' 
    },
    completado: { 
      color: theme === 'dark' 
        ? 'bg-blue-900/50 text-blue-300 border-blue-700' 
        : 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircleIcon, 
      text: 'Completado' 
    },
    moroso: { 
      color: theme === 'dark' 
        ? 'bg-red-900/50 text-red-300 border-red-700' 
        : 'bg-red-100 text-red-800 border-red-200',
      icon: ExclamationTriangleIcon, 
      text: 'Moroso' 
    },
    pendiente: { 
      color: theme === 'dark' 
        ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: ClockIcon, 
      text: 'Pendiente' 
    }
  };

  const estadoInfo = estados[estado] || estados.activo;
  const Icon = estadoInfo.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${estadoInfo.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {estadoInfo.text}
      {diasAtraso > 0 && estado === 'activo' && (
        <span className="ml-1 text-red-500">({diasAtraso}d)</span>
      )}
    </span>
  );
};

// Componente principal de la tabla
const PrestamosTable = ({ 
  prestamos, 
  onView, 
  onEdit, 
  onRegistrarPago, 
  onWhatsApp,
  calcularPorcentajeRecuperacion,
  calcularDiasAtraso,
  getFrecuenciaTexto,
  getCedulaCliente,
  getContactoCliente,
  configMora
}) => {
  const { theme } = useTheme();
  const [sortConfig, setSortConfig] = useState({ key: 'fechaPrestamo', direction: 'desc' });
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para ordenar los préstamos
  const sortedPrestamos = useMemo(() => {
    if (!prestamos.length) return [];
    
    const sortable = [...prestamos];
    
    sortable.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'clienteNombre':
          aValue = a.clienteNombre || '';
          bValue = b.clienteNombre || '';
          break;
        case 'montoPrestado':
          aValue = a.montoPrestado || 0;
          bValue = b.montoPrestado || 0;
          break;
        case 'capitalRestante':
          aValue = a.capitalRestante || 0;
          bValue = b.capitalRestante || 0;
          break;
        case 'progreso':
          aValue = calcularPorcentajeRecuperacion(a);
          bValue = calcularPorcentajeRecuperacion(b);
          break;
        case 'fechaProximoPago':
          aValue = a.fechaProximoPago ? new Date(a.fechaProximoPago).getTime() : 0;
          bValue = b.fechaProximoPago ? new Date(b.fechaProximoPago).getTime() : 0;
          break;
        case 'frecuencia':
          aValue = getFrecuenciaTexto(a);
          bValue = getFrecuenciaTexto(b);
          break;
        case 'estado':
          aValue = a.estado || '';
          bValue = b.estado || '';
          break;
        default:
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sortable;
  }, [prestamos, sortConfig, calcularPorcentajeRecuperacion, getFrecuenciaTexto]);

  // Manejar cambio de ordenamiento
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Columnas de la tabla
  const columns = [
    { key: 'clienteNombre', label: 'Cliente', mobile: true, sortable: true },
    { key: 'montoPrestado', label: 'Inversión', mobile: true, sortable: true },
    { key: 'progreso', label: 'Progreso', mobile: false, sortable: true },
    { key: 'fechaProximoPago', label: 'Próximo Pago', mobile: false, sortable: true },
    { key: 'frecuencia', label: 'Frecuencia', mobile: false, sortable: true },
    { key: 'estado', label: 'Estado', mobile: true, sortable: true },
    { key: 'acciones', label: 'Acciones', mobile: true, sortable: false }
  ];

  // Vista para móvil (cards)
  if (isMobile) {
    return (
      <div className="space-y-3 p-2">
        {sortedPrestamos.map((prestamo) => {
          const porcentajeRecuperacion = calcularPorcentajeRecuperacion(prestamo);
          const diasAtraso = calcularDiasAtraso(prestamo);
          const contacto = getContactoCliente(prestamo);
          const isExpanded = expandedRow === prestamo.id;
          
          return (
            <motion.div
              key={prestamo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } ${diasAtraso > 15 ? (theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50') : ''}`}
            >
              {/* Card Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedRow(isExpanded ? null : prestamo.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {prestamo.clienteNombre}
                    </h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                      {getCedulaCliente(prestamo)}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                      📞 {contacto.celular.substring(0, 10)}
                    </p>
                  </div>
                  <div className="text-right">
                    <EstadoBadge 
                      estado={prestamo.estado} 
                      theme={theme} 
                      diasAtraso={diasAtraso}
                      configMora={configMora}
                    />
                    <p className={`text-xs font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      RD$ {prestamo.montoPrestado?.toLocaleString()}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Restante: RD$ {prestamo.capitalRestante?.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{porcentajeRecuperacion.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-green-600 transition-all duration-300"
                      style={{ width: `${Math.min(porcentajeRecuperacion, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Card Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`border-t ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Próximo pago</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {prestamo.fechaProximoPago ? formatFecha(prestamo.fechaProximoPago) : 'Por definir'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Frecuencia</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {getFrecuenciaTexto(prestamo)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Interés</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {prestamo.interesPercent}%
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ROI</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {((prestamo.montoPrestado - prestamo.capitalRestante) / prestamo.montoPrestado * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex justify-around pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => { e.stopPropagation(); onView(prestamo); }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                          }`}
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onWhatsApp(prestamo); }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-green-50 text-green-600'
                          }`}
                          title="Enviar WhatsApp"
                        >
                          <ChatBubbleLeftIcon className="h-5 w-5" />
                        </button>
                        {prestamo.estado === 'activo' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onRegistrarPago(prestamo); }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-green-50 text-green-600'
                            }`}
                            title="Registrar pago"
                          >
                            <CurrencyDollarIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(prestamo); }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-yellow-50 text-yellow-600'
                          }`}
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Vista para desktop (tabla)
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  col.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors' : ''
                }`}
              >
                <div className="flex items-center">
                  {col.label}
                  {col.sortable && (
                    <SortIcon 
                      column={col.key} 
                      currentSort={sortConfig.key} 
                      sortDirection={sortConfig.direction} 
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
        }`}>
          {sortedPrestamos.map((prestamo) => {
            const porcentajeRecuperacion = calcularPorcentajeRecuperacion(prestamo);
            const diasAtraso = calcularDiasAtraso(prestamo);
            const contacto = getContactoCliente(prestamo);
            
            return (
              <motion.tr
                key={prestamo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`transition-all duration-300 ${
                  diasAtraso > 15 
                    ? theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                    : diasAtraso > 5
                    ? theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'
                    : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {prestamo.clienteNombre}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getCedulaCliente(prestamo)}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1 flex items-center`}>
                    <span className="mr-1">📞</span> {contacto.celular.substring(0, 10)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    RD$ {prestamo.montoPrestado?.toLocaleString()}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Restante: RD$ {prestamo.capitalRestante?.toLocaleString()}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {getFrecuenciaTexto(prestamo)} • {prestamo.interesPercent}%
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-green-600 transition-all duration-300"
                        style={{ width: `${Math.min(porcentajeRecuperacion, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {porcentajeRecuperacion.toFixed(0)}%
                    </span>
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    ROI: {((prestamo.montoPrestado - prestamo.capitalRestante) / prestamo.montoPrestado * 100).toFixed(1)}%
                  </div>
                  {diasAtraso > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      {diasAtraso}d atraso
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {prestamo.fechaProximoPago ? formatFecha(prestamo.fechaProximoPago) : 'Por definir'}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getFrecuenciaTexto(prestamo)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {getFrecuenciaTexto(prestamo)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge 
                    estado={prestamo.estado} 
                    theme={theme} 
                    diasAtraso={diasAtraso}
                    configMora={configMora}
                  />
                  {prestamo.configuracionMora?.enabled && diasAtraso > 0 && (
                    <div className="flex items-center mt-1 text-xs text-orange-600 dark:text-orange-400">
                      <CalculatorIcon className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Mora activa</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onView(prestamo)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                      }`}
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onWhatsApp(prestamo)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-green-50 text-green-600'
                      }`}
                      title="Enviar WhatsApp"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                    </button>
                    {prestamo.estado === 'activo' && (
                      <button
                        onClick={() => onRegistrarPago(prestamo)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          theme === 'dark' ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-green-50 text-green-600'
                        }`}
                        title="Registrar pago"
                      >
                        <CurrencyDollarIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(prestamo)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-yellow-50 text-yellow-600'
                      }`}
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      
      {sortedPrestamos.length === 0 && (
        <div className="text-center py-12">
          <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>📊</div>
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            No se encontraron préstamos
          </p>
        </div>
      )}
    </div>
  );
};

export default PrestamosTable;