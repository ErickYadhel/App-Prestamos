import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  CalculatorIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TableCellsIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClockIcon,
  PercentBadgeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

// ============================================
// MODAL PARA HERRAMIENTAS DE CÁLCULO
// ============================================
const CalculoModal = ({ isOpen, onClose, titulo, children }) => {
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-yellow-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-yellow-600/20' : 'border-gray-200'} flex justify-between items-center`}>
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
// CALCULADORA DE INTERESES
// ============================================
const CalculadoraIntereses = () => {
  const { theme } = useTheme();
  const [monto, setMonto] = useState(100000);
  const [tasa, setTasa] = useState(15);
  const [plazo, setPlazo] = useState(12);
  const [tipoInteres, setTipoInteres] = useState('simple');
  const [resultados, setResultados] = useState(null);

  const calcular = () => {
    const m = Number(monto);
    const t = Number(tasa) / 100;
    const p = Number(plazo);

    if (tipoInteres === 'simple') {
      const interesTotal = m * t * (p / 12);
      const montoTotal = m + interesTotal;
      const cuotaMensual = montoTotal / p;

      setResultados({
        interesTotal,
        montoTotal,
        cuotaMensual,
        tabla: Array.from({ length: p }, (_, i) => ({
          mes: i + 1,
          capital: m / p,
          interes: interesTotal / p,
          cuota: cuotaMensual,
          saldo: m - (m / p) * (i + 1)
        }))
      });
    } else {
      const tasaMensual = t / 12;
      const factor = Math.pow(1 + tasaMensual, p);
      const cuotaMensual = m * tasaMensual * factor / (factor - 1);
      const montoTotal = cuotaMensual * p;
      const interesTotal = montoTotal - m;

      let saldo = m;
      const tabla = [];
      for (let i = 0; i < p; i++) {
        const interes = saldo * tasaMensual;
        const capital = cuotaMensual - interes;
        saldo -= capital;
        tabla.push({
          mes: i + 1,
          capital,
          interes,
          cuota: cuotaMensual,
          saldo: Math.max(0, saldo)
        });
      }

      setResultados({
        interesTotal,
        montoTotal,
        cuotaMensual,
        tabla
      });
    }
  };

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor || 0);
  };

  useEffect(() => {
    calcular();
  }, [monto, tasa, plazo, tipoInteres]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Monto del Préstamo (RD$)
          </label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300'
            } focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Tasa de Interés Anual (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={tasa}
            onChange={(e) => setTasa(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300'
            } focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Plazo (meses)
          </label>
          <input
            type="number"
            value={plazo}
            onChange={(e) => setPlazo(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300'
            } focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Tipo de Interés
          </label>
          <select
            value={tipoInteres}
            onChange={(e) => setTipoInteres(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300'
            } focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all`}
          >
            <option value="simple">Interés Simple</option>
            <option value="compuesto">Interés Compuesto</option>
          </select>
        </div>
      </div>

      {/* Resultados principales */}
      {resultados && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Interés Total</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {formatearMonto(resultados.interesTotal)}
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400">Monto Total a Pagar</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatearMonto(resultados.montoTotal)}
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400">Cuota Mensual</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatearMonto(resultados.cuotaMensual)}
              </p>
            </div>
          </div>

          {/* Tabla de amortización */}
          <div className="mt-6">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Tabla de Amortización
            </h4>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mes</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Capital</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Interés</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cuota</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Saldo</th>
                  </tr>
                </thead>
                <tbody className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} divide-y divide-gray-200 dark:divide-gray-700`}>
                  {resultados.tabla.slice(0, 12).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{row.mes}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatearMonto(row.capital)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatearMonto(row.interes)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-green-600">{formatearMonto(row.cuota)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatearMonto(row.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {plazo > 12 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Mostrando primeros 12 meses de {plazo} meses totales
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// CALCULADORA DE AMORTIZACIONES
// ============================================
const CalculadoraAmortizaciones = () => {
  const { theme } = useTheme();
  const [monto, setMonto] = useState(100000);
  const [tasa, setTasa] = useState(15);
  const [plazo, setPlazo] = useState(12);
  const [sistema, setSistema] = useState('frances');
  const [resultados, setResultados] = useState(null);

  const calcular = () => {
    const m = Number(monto);
    const t = Number(tasa) / 100 / 12; // tasa mensual
    const p = Number(plazo);

    if (sistema === 'frances') {
      // Sistema Francés (cuota fija)
      const factor = Math.pow(1 + t, p);
      const cuota = m * t * factor / (factor - 1);
      
      let saldo = m;
      const tabla = [];
      for (let i = 0; i < p; i++) {
        const interes = saldo * t;
        const capital = cuota - interes;
        saldo -= capital;
        tabla.push({
          periodo: i + 1,
          capital,
          interes,
          cuota,
          saldo: Math.max(0, saldo)
        });
      }

      setResultados({
        cuota,
        totalIntereses: tabla.reduce((sum, r) => sum + r.interes, 0),
        totalPagar: m + tabla.reduce((sum, r) => sum + r.interes, 0),
        tabla
      });
    } else {
      // Sistema Alemán (capital fijo)
      const capitalFijo = m / p;
      let saldo = m;
      const tabla = [];
      for (let i = 0; i < p; i++) {
        const interes = saldo * t;
        const cuota = capitalFijo + interes;
        tabla.push({
          periodo: i + 1,
          capital: capitalFijo,
          interes,
          cuota,
          saldo: Math.max(0, saldo - capitalFijo)
        });
        saldo -= capitalFijo;
      }

      setResultados({
        cuota: tabla[0].cuota,
        totalIntereses: tabla.reduce((sum, r) => sum + r.interes, 0),
        totalPagar: m + tabla.reduce((sum, r) => sum + r.interes, 0),
        tabla
      });
    }
  };

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  useEffect(() => {
    calcular();
  }, [monto, tasa, plazo, sistema]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Monto del Préstamo (RD$)
          </label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300'
            } focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Tasa de Interés Anual (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={tasa}
            onChange={(e) => setTasa(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300'
            } focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Plazo (meses)
          </label>
          <input
            type="number"
            value={plazo}
            onChange={(e) => setPlazo(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300'
            } focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Sistema de Amortización
          </label>
          <select
            value={sistema}
            onChange={(e) => setSistema(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300'
            } focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all`}
          >
            <option value="frances">Sistema Francés (Cuota Fija)</option>
            <option value="aleman">Sistema Alemán (Capital Fijo)</option>
          </select>
        </div>
      </div>

      {resultados && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400">Cuota Periódica</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatearMonto(resultados.cuota)}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Total Intereses</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {formatearMonto(resultados.totalIntereses)}
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400">Total a Pagar</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatearMonto(resultados.totalPagar)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Tabla de Amortización
            </h4>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Período</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Capital</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Interés</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cuota</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Saldo</th>
                  </tr>
                </thead>
                <tbody className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} divide-y divide-gray-200 dark:divide-gray-700`}>
                  {resultados.tabla.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{row.periodo}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatearMonto(row.capital)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatearMonto(row.interes)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-green-600">{formatearMonto(row.cuota)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatearMonto(row.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// TABLAS DE PAGO
// ============================================
const TablasPago = () => {
  const { theme } = useTheme();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      const pagosRef = collection(db, 'pagos');
      const q = query(pagosRef, orderBy('fecha', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      
      const pagosList = [];
      querySnapshot.forEach((doc) => {
        pagosList.push({ id: doc.id, ...doc.data() });
      });
      setPagos(pagosList);
    } catch (error) {
      console.error('Error cargando pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-DO');
  };

  const calcularResumen = () => {
    const total = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);
    const pendientes = pagos.filter(p => p.estado === 'pendiente').length;
    const completados = pagos.filter(p => p.estado === 'completado').length;
    return { total, pendientes, completados };
  };

  const resumen = calcularResumen();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Últimos Pagos Registrados
        </h4>
        <button
          onClick={cargarPagos}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400">Total Pagado</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {formatearMonto(resumen.total)}
          </p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">Completados</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{resumen.completados}</p>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{resumen.pendientes}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <ArrowPathIcon className="h-8 w-8 text-yellow-600 animate-spin mx-auto" />
        </div>
      ) : pagos.length === 0 ? (
        <div className="text-center py-8">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No hay pagos registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Concepto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} divide-y divide-gray-200 dark:divide-gray-700`}>
              {pagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{pago.cliente}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{pago.concepto}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{formatearFecha(pago.fecha)}</td>
                  <td className="px-4 py-2 text-sm font-medium text-green-600">{formatearMonto(pago.monto)}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      pago.estado === 'completado'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {pago.estado?.charAt(0).toUpperCase() + pago.estado?.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============================================
// TARJETA DE HERRAMIENTA
// ============================================
const HerramientaCard = ({ herramienta, onClick }) => {
  const { theme } = useTheme();
  const Icon = herramienta.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg cursor-pointer`}
      onClick={onClick}
    >
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${herramienta.color}`} />
      
      <div className="p-5">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${herramienta.color} shadow-lg inline-block mb-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>

        <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {herramienta.nombre}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {herramienta.descripcion}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {herramienta.items.map((item, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Calculos = () => {
  const { theme } = useTheme();
  const [modalAbierto, setModalAbierto] = useState(null);

  const herramientas = [
    {
      id: 'intereses',
      nombre: 'Calculadora de Intereses',
      descripcion: 'Calcula intereses simples y compuestos',
      icon: PercentBadgeIcon,
      color: 'from-yellow-500 to-yellow-700',
      items: ['Interés Simple', 'Interés Compuesto', 'Cuotas Mensuales'],
      componente: <CalculadoraIntereses />
    },
    {
      id: 'amortizaciones',
      nombre: 'Amortizaciones',
      descripcion: 'Tablas de amortización de préstamos',
      icon: TableCellsIcon,
      color: 'from-orange-500 to-orange-700',
      items: ['Sistema Francés', 'Sistema Alemán', 'Amortización'],
      componente: <CalculadoraAmortizaciones />
    },
    {
      id: 'tablas',
      nombre: 'Tablas de Pago',
      descripcion: 'Historial y tablas de pagos',
      icon: CalendarIcon,
      color: 'from-amber-500 to-amber-700',
      items: ['Últimos Pagos', 'Resumen', 'Estadísticas'],
      componente: <TablasPago />
    }
  ];

  const herramientaSeleccionada = herramientas.find(h => h.id === modalAbierto);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl shadow-lg">
          <CalculatorIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Herramientas de Cálculo
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Calcula intereses, amortizaciones y genera tablas de pago
          </p>
        </div>
      </div>

      {/* Grid de herramientas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {herramientas.map((herramienta) => (
          <HerramientaCard
            key={herramienta.id}
            herramienta={herramienta}
            onClick={() => setModalAbierto(herramienta.id)}
          />
        ))}
      </div>

      {/* Modal para la herramienta seleccionada */}
      <CalculoModal
        isOpen={modalAbierto !== null}
        onClose={() => setModalAbierto(null)}
        titulo={herramientaSeleccionada?.nombre || 'Herramienta de Cálculo'}
      >
        {herramientaSeleccionada && herramientaSeleccionada.componente}
      </CalculoModal>
    </div>
  );
};

export default Calculos;