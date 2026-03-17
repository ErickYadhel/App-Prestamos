import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

// ============================================
// MODAL PARA REPORTES
// ============================================
const ReporteModal = ({ isOpen, onClose, titulo, children }) => {
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
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-green-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
            
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-green-600/20' : 'border-gray-200'} flex justify-between items-center`}>
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
// MODAL PARA VISTA PREVIA DE REPORTE
// ============================================
const VistaPreviaReporteModal = ({ isOpen, onClose, reporte, datos }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(monto || 0);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-5xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-green-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-green-600/20' : 'border-gray-200'} flex justify-between items-center`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {reporte?.nombre}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Generado el {formatearFecha(new Date())}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="Imprimir"
                >
                  <PrinterIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(datos, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = `reporte-${reporte?.tipo}-${new Date().toISOString()}.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Exportar JSON"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Contenido del reporte según el tipo */}
              {reporte?.tipo === 'diario' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-600 dark:text-green-400">Total Operaciones</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{datos?.totalOperaciones || 0}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Monto Total</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatearMonto(datos?.montoTotal)}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes</p>
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{datos?.pendientes || 0}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-600 dark:text-purple-400">Completados</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{datos?.completados || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Operaciones del día</h4>
                    {datos?.operaciones?.map((op, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                      } flex justify-between items-center`}>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{op.cliente}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{op.tipo} • {formatearFecha(op.fecha)}</p>
                        </div>
                        <span className={`font-bold ${
                          op.estado === 'completado' ? 'text-green-600' : 'text-yellow-600'
                        }`}>{formatearMonto(op.monto)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reporte?.tipo === 'cartera' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Cartera</p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatearMonto(datos?.totalCartera)}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-600 dark:text-green-400">Préstamos Activos</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{datos?.prestamosActivos || 0}</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">Morosos</p>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">{datos?.morosos || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Distribución de Cartera</h4>
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Préstamos al día</span>
                            <span className="text-sm font-medium text-green-600">{datos?.porcentajeAlDia || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${datos?.porcentajeAlDia || 0}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Préstamos en mora</span>
                            <span className="text-sm font-medium text-red-600">{datos?.porcentajeMora || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${datos?.porcentajeMora || 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Préstamos por rango</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Menos de RD$100k</p>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{datos?.rango1 || 0}</p>
                      </div>
                      <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">RD$100k - RD$500k</p>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{datos?.rango2 || 0}</p>
                      </div>
                      <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">RD$500k - RD$1M</p>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{datos?.rango3 || 0}</p>
                      </div>
                      <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Más de RD$1M</p>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{datos?.rango4 || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reporte?.tipo === 'pagos' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                      <p className="text-sm text-teal-600 dark:text-teal-400">Pagos Recibidos</p>
                      <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{datos?.pagosRecibidos || 0}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes</p>
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{datos?.pagosPendientes || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-600 dark:text-green-400">Monto Total</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatearMonto(datos?.montoTotalPagos)}</p>
                    </div>
                  </div>

                  <div className="h-64 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ChartBarIcon className="h-12 w-12 text-teal-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">Gráfico de pagos por período</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Últimos pagos</h4>
                    {datos?.ultimosPagos?.map((pago, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                      } flex justify-between items-center`}>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pago.cliente}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{pago.concepto} • {formatearFecha(pago.fecha)}</p>
                        </div>
                        <span className="font-bold text-green-600">{formatearMonto(pago.monto)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reporte?.tipo === 'clientes' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                      <p className="text-sm text-cyan-600 dark:text-cyan-400">Total Clientes</p>
                      <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{datos?.totalClientes || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-600 dark:text-green-400">Activos</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{datos?.clientesActivos || 0}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Nuevos (7 días)</p>
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{datos?.nuevosClientes || 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Inactivos</p>
                      <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{datos?.clientesInactivos || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Por tipo de cliente</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Persona Física</span>
                          <span className="font-medium">{datos?.personaFisica || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Persona Jurídica</span>
                          <span className="font-medium">{datos?.personaJuridica || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Por ubicación</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Santo Domingo</span>
                          <span className="font-medium">{datos?.santoDomingo || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Santiago</span>
                          <span className="font-medium">{datos?.santiago || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Otras provincias</span>
                          <span className="font-medium">{datos?.otrasProvincias || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// TARJETA DE REPORTE
// ============================================
const ReporteCard = ({ reporte, onVer, onGenerar }) => {
  const { theme } = useTheme();
  const Icon = reporte.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg cursor-pointer`}
      onClick={() => onVer(reporte)}
    >
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${reporte.color}`} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${reporte.color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {reporte.ultimo && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {reporte.ultimo}
            </span>
          )}
        </div>

        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {reporte.nombre}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">
          {reporte.descripcion}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {Object.entries(reporte.estadisticas).map(([key, value], i) => (
            <div key={i} className="text-center p-1">
              <p className={`text-sm font-bold ${
                key.includes('monto') || key === 'total' 
                  ? 'text-green-600' 
                  : key.includes('pendientes') || key.includes('morosos')
                  ? 'text-red-600'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onGenerar(reporte);
          }}
          className={`mt-4 w-full py-2 px-3 rounded-lg bg-gradient-to-r ${reporte.color} text-white text-sm font-medium hover:shadow-lg transition-all`}
        >
          Generar Reporte
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Reportes = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [modalAbierto, setModalAbierto] = useState(null);
  const [vistaPreviaAbierta, setVistaPreviaAbierta] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [datosReporte, setDatosReporte] = useState(null);
  const [datosGenerales, setDatosGenerales] = useState({
    prestamos: [],
    pagos: [],
    clientes: [],
    formularios: []
  });

  // Cargar datos desde Firebase
  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar préstamos
      const prestamosRef = collection(db, 'prestamos');
      const prestamosQuery = query(prestamosRef, orderBy('fechaCreacion', 'desc'), limit(100));
      const prestamosSnap = await getDocs(prestamosQuery);
      const prestamosList = [];
      prestamosSnap.forEach((doc) => {
        prestamosList.push({ id: doc.id, ...doc.data() });
      });

      // Cargar pagos
      const pagosRef = collection(db, 'pagos');
      const pagosQuery = query(pagosRef, orderBy('fecha', 'desc'), limit(100));
      const pagosSnap = await getDocs(pagosQuery);
      const pagosList = [];
      pagosSnap.forEach((doc) => {
        pagosList.push({ id: doc.id, ...doc.data() });
      });

      // Cargar clientes
      const clientesRef = collection(db, 'clientes');
      const clientesSnap = await getDocs(clientesRef);
      const clientesList = [];
      clientesSnap.forEach((doc) => {
        clientesList.push({ id: doc.id, ...doc.data() });
      });

      // Cargar formularios
      const formulariosRef = collection(db, 'formularios');
      const formulariosSnap = await getDocs(formulariosRef);
      const formulariosList = [];
      formulariosSnap.forEach((doc) => {
        formulariosList.push({ id: doc.id, ...doc.data() });
      });

      setDatosGenerales({
        prestamos: prestamosList,
        pagos: pagosList,
        clientes: clientesList,
        formularios: formulariosList
      });

    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Generar datos para reporte diario
  const generarReporteDiario = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const operacionesHoy = datosGenerales.formularios.filter(f => 
      f.fechaCreacion?.startsWith(hoy) && f.tipo === 'solicitud'
    );

    const totalMonto = operacionesHoy.reduce((sum, op) => sum + (Number(op.monto) || 0), 0);
    const pendientes = operacionesHoy.filter(op => op.estado === 'pendiente').length;
    const completados = operacionesHoy.filter(op => op.estado === 'completado' || op.estado === 'aprobado').length;

    return {
      totalOperaciones: operacionesHoy.length,
      montoTotal: totalMonto,
      pendientes,
      completados,
      operaciones: operacionesHoy.slice(0, 5).map(op => ({
        cliente: op.cliente,
        tipo: 'Solicitud',
        fecha: op.fechaCreacion,
        estado: op.estado,
        monto: op.monto
      }))
    };
  };

  // Generar datos para reporte de cartera
  const generarReporteCartera = () => {
    const prestamos = datosGenerales.prestamos;
    const totalCartera = prestamos.reduce((sum, p) => sum + (Number(p.monto) || 0), 0);
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    const morosos = prestamos.filter(p => p.estado === 'mora').length;
    
    const total = prestamos.length;
    const alDia = prestamos.filter(p => p.estado === 'activo').length;
    const porcentajeAlDia = total > 0 ? Math.round((alDia / total) * 100) : 0;
    const porcentajeMora = total > 0 ? Math.round((morosos / total) * 100) : 0;

    const rangos = {
      rango1: prestamos.filter(p => p.monto < 100000).length,
      rango2: prestamos.filter(p => p.monto >= 100000 && p.monto < 500000).length,
      rango3: prestamos.filter(p => p.monto >= 500000 && p.monto < 1000000).length,
      rango4: prestamos.filter(p => p.monto >= 1000000).length
    };

    return {
      totalCartera,
      prestamosActivos,
      morosos,
      porcentajeAlDia,
      porcentajeMora,
      ...rangos
    };
  };

  // Generar datos para reporte de pagos
  const generarReportePagos = () => {
    const pagos = datosGenerales.pagos;
    const hoy = new Date().toISOString().split('T')[0];
    
    const pagosRecibidos = pagos.filter(p => p.estado === 'completado').length;
    const pagosPendientes = pagos.filter(p => p.estado === 'pendiente').length;
    const montoTotalPagos = pagos.reduce((sum, p) => sum + (Number(p.monto) || 0), 0);
    
    const ultimosPagos = pagos
      .filter(p => p.estado === 'completado')
      .slice(0, 5)
      .map(p => ({
        cliente: p.cliente || 'Cliente',
        concepto: p.concepto || 'Pago de préstamo',
        fecha: p.fecha,
        monto: p.monto
      }));

    return {
      pagosRecibidos,
      pagosPendientes,
      montoTotalPagos,
      ultimosPagos
    };
  };

  // Generar datos para reporte de clientes
  const generarReporteClientes = () => {
    const clientes = datosGenerales.clientes;
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const totalClientes = clientes.length;
    const clientesActivos = clientes.filter(c => c.activo !== false).length;
    const clientesInactivos = clientes.filter(c => c.activo === false).length;
    const nuevosClientes = clientes.filter(c => {
      const fecha = new Date(c.fechaCreacion);
      return fecha > hace7Dias;
    }).length;

    const personaFisica = clientes.filter(c => c.tipo === 'fisica').length;
    const personaJuridica = clientes.filter(c => c.tipo === 'juridica').length;

    const santoDomingo = clientes.filter(c => c.ciudad?.toLowerCase().includes('santo domingo')).length;
    const santiago = clientes.filter(c => c.ciudad?.toLowerCase().includes('santiago')).length;
    const otrasProvincias = totalClientes - santoDomingo - santiago;

    return {
      totalClientes,
      clientesActivos,
      clientesInactivos,
      nuevosClientes,
      personaFisica,
      personaJuridica,
      santoDomingo,
      santiago,
      otrasProvincias
    };
  };

  const tiposReporte = [
    {
      id: 'diario',
      tipo: 'diario',
      nombre: 'Reporte Diario',
      descripcion: 'Resumen de operaciones del día',
      icon: CalendarIcon,
      color: 'from-green-500 to-green-700',
      estadisticas: {
        operaciones: datosGenerales.formularios.filter(f => {
          const hoy = new Date().toISOString().split('T')[0];
          return f.fechaCreacion?.startsWith(hoy);
        }).length,
        monto: 'RD$' + datosGenerales.formularios
          .filter(f => {
            const hoy = new Date().toISOString().split('T')[0];
            return f.fechaCreacion?.startsWith(hoy);
          })
          .reduce((sum, f) => sum + (Number(f.monto) || 0), 0)
          .toLocaleString(),
        pendientes: datosGenerales.formularios.filter(f => {
          const hoy = new Date().toISOString().split('T')[0];
          return f.fechaCreacion?.startsWith(hoy) && f.estado === 'pendiente';
        }).length
      },
      ultimo: new Date().toLocaleDateString(),
      generar: generarReporteDiario
    },
    {
      id: 'cartera',
      tipo: 'cartera',
      nombre: 'Análisis de Cartera',
      descripcion: 'Estado de la cartera de préstamos',
      icon: CurrencyDollarIcon,
      color: 'from-emerald-500 to-emerald-700',
      estadisticas: {
        total: 'RD$' + datosGenerales.prestamos.reduce((sum, p) => sum + (Number(p.monto) || 0), 0).toLocaleString(),
        activos: datosGenerales.prestamos.filter(p => p.estado === 'activo').length,
        morosos: datosGenerales.prestamos.filter(p => p.estado === 'mora').length
      },
      generar: generarReporteCartera
    },
    {
      id: 'pagos',
      tipo: 'pagos',
      nombre: 'Estadísticas de Pagos',
      descripcion: 'Análisis de pagos recibidos',
      icon: CreditCardIcon,
      color: 'from-teal-500 to-teal-700',
      estadisticas: {
        recibidos: datosGenerales.pagos.filter(p => p.estado === 'completado').length,
        pendientes: datosGenerales.pagos.filter(p => p.estado === 'pendiente').length,
        monto: 'RD$' + datosGenerales.pagos.reduce((sum, p) => sum + (Number(p.monto) || 0), 0).toLocaleString()
      },
      generar: generarReportePagos
    },
    {
      id: 'clientes',
      tipo: 'clientes',
      nombre: 'Reporte de Clientes',
      descripcion: 'Estadísticas de clientes',
      icon: UserGroupIcon,
      color: 'from-cyan-500 to-cyan-700',
      estadisticas: {
        total: datosGenerales.clientes.length,
        activos: datosGenerales.clientes.filter(c => c.activo !== false).length,
        nuevos: datosGenerales.clientes.filter(c => {
          const hace7Dias = new Date();
          hace7Dias.setDate(hace7Dias.getDate() - 7);
          return new Date(c.fechaCreacion) > hace7Dias;
        }).length
      },
      generar: generarReporteClientes
    },
    {
      id: 'historico',
      tipo: 'historico',
      nombre: 'Reporte Histórico',
      descripcion: 'Análisis histórico de operaciones',
      icon: ClockIcon,
      color: 'from-blue-500 to-blue-700',
      estadisticas: {
        total: 'RD$' + datosGenerales.prestamos.reduce((sum, p) => sum + (Number(p.monto) || 0), 0).toLocaleString(),
        operaciones: datosGenerales.prestamos.length + datosGenerales.pagos.length,
        promedio: 'RD$' + Math.round(
          datosGenerales.prestamos.reduce((sum, p) => sum + (Number(p.monto) || 0), 0) / 
          (datosGenerales.prestamos.length || 1)
        ).toLocaleString()
      },
      generar: () => ({
        ...generarReporteCartera(),
        ...generarReportePagos(),
        totalOperaciones: datosGenerales.prestamos.length + datosGenerales.pagos.length
      })
    },
    {
      id: 'detallado',
      tipo: 'detallado',
      nombre: 'Reporte Detallado',
      descripcion: 'Informe completo de operaciones',
      icon: DocumentTextIcon,
      color: 'from-indigo-500 to-indigo-700',
      estadisticas: {
        paginas: 24,
        secciones: 8,
        actualizado: 'Hoy'
      },
      generar: () => ({
        prestamos: datosGenerales.prestamos.slice(0, 10),
        pagos: datosGenerales.pagos.slice(0, 10),
        clientes: datosGenerales.clientes.slice(0, 10),
        formularios: datosGenerales.formularios.slice(0, 10)
      })
    }
  ];

  const handleVerReporte = (reporte) => {
    setReporteSeleccionado(reporte);
    setModalAbierto(reporte.id);
  };

  const handleGenerarReporte = (reporte) => {
    const datos = reporte.generar();
    setReporteSeleccionado(reporte);
    setDatosReporte(datos);
    setVistaPreviaAbierta(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-green-600 to-green-800 rounded-xl shadow-lg">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Reportes y Análisis
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Genera y visualiza reportes operativos en tiempo real
            </p>
          </div>
        </div>

        <button
          onClick={cargarDatos}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Actualizar datos"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl shadow-lg flex items-center space-x-3"
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {exito && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 rounded-xl shadow-lg flex items-center space-x-3"
          >
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{exito}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de reportes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiposReporte.map((reporte) => (
            <ReporteCard
              key={reporte.id}
              reporte={reporte}
              onVer={handleVerReporte}
              onGenerar={handleGenerarReporte}
            />
          ))}
        </div>
      )}

      {/* Modal de información del reporte */}
      <ReporteModal
        isOpen={modalAbierto !== null}
        onClose={() => setModalAbierto(null)}
        titulo={reporteSeleccionado?.nombre || 'Reporte'}
      >
        <div className="space-y-4">
          <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {reporteSeleccionado?.descripcion}
          </h4>
          
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-green-600/20`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Este reporte te permite visualizar {reporteSeleccionado?.descripcion.toLowerCase()}.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Características:
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Datos en tiempo real desde Firebase
              </li>
              <li className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Exportación a JSON
              </li>
              <li className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Vista previa interactiva
              </li>
              <li className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Estadísticas actualizadas automáticamente
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              setModalAbierto(null);
              handleGenerarReporte(reporteSeleccionado);
            }}
            className="w-full mt-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Generar Reporte
          </button>
        </div>
      </ReporteModal>

      {/* Modal de vista previa */}
      <VistaPreviaReporteModal
        isOpen={vistaPreviaAbierta}
        onClose={() => {
          setVistaPreviaAbierta(false);
          setReporteSeleccionado(null);
          setDatosReporte(null);
        }}
        reporte={reporteSeleccionado}
        datos={datosReporte}
      />
    </div>
  );
};

export default Reportes;