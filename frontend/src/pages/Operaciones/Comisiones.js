import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon,
  PercentBadgeIcon,
  BanknotesIcon,
  GiftIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

// ============================================
// MODAL PRINCIPAL PARA COMISIONES
// ============================================
const ComisionModal = ({ isOpen, onClose, titulo, children }) => {
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-red-600/20' : 'border-gray-200'} flex justify-between items-center`}>
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
// MODAL PARA CREAR/EDITAR COMISIÓN
// ============================================
const ComisionEditorModal = ({ isOpen, onClose, comision, onSave }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tipo: 'prestamo',
    asesor: '',
    cliente: '',
    montoBase: '',
    porcentaje: '',
    montoComision: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    descripcion: '',
    prestamoId: '',
    ...comision
  });

  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (comision) {
      setFormData(comision);
    }
  }, [comision]);

  const calcularComision = () => {
    const monto = Number(formData.montoBase) || 0;
    const porcentaje = Number(formData.porcentaje) || 0;
    const comisionCalculada = (monto * porcentaje) / 100;
    setFormData({ ...formData, montoComision: comisionCalculada.toFixed(2) });
  };

  useEffect(() => {
    calcularComision();
  }, [formData.montoBase, formData.porcentaje]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.asesor?.trim()) {
      newErrors.asesor = 'El asesor es requerido';
    }
    if (!formData.cliente?.trim()) {
      newErrors.cliente = 'El cliente es requerido';
    }
    if (!formData.montoBase || formData.montoBase <= 0) {
      newErrors.montoBase = 'El monto base debe ser mayor a 0';
    }
    if (!formData.porcentaje || formData.porcentaje <= 0) {
      newErrors.porcentaje = 'El porcentaje debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setGuardando(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error guardando comisión:', error);
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-3xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-red-600/20' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {comision ? 'Editar Comisión' : 'Nueva Comisión'}
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

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {/* Tipo de comisión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo de Comisión
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    >
                      <option value="prestamo">Comisión por Préstamo</option>
                      <option value="cobro">Comisión por Cobro</option>
                      <option value="liquidacion">Liquidación</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    />
                  </div>
                </div>

                {/* Asesor y Cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Asesor *
                    </label>
                    <input
                      type="text"
                      value={formData.asesor}
                      onChange={(e) => setFormData({ ...formData, asesor: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors.asesor ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Nombre del asesor"
                    />
                    {errors.asesor && <p className="text-red-500 text-xs mt-1">{errors.asesor}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cliente *
                    </label>
                    <input
                      type="text"
                      value={formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors.cliente ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="Nombre del cliente"
                    />
                    {errors.cliente && <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>}
                  </div>
                </div>

                {/* Monto base y porcentaje */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monto Base (RD$) *
                    </label>
                    <input
                      type="number"
                      value={formData.montoBase}
                      onChange={(e) => setFormData({ ...formData, montoBase: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors.montoBase ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="100000"
                    />
                    {errors.montoBase && <p className="text-red-500 text-xs mt-1">{errors.montoBase}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Porcentaje (%) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.porcentaje}
                      onChange={(e) => setFormData({ ...formData, porcentaje: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors.porcentaje ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="2.5"
                    />
                    {errors.porcentaje && <p className="text-red-500 text-xs mt-1">{errors.porcentaje}</p>}
                  </div>
                </div>

                {/* Monto de comisión calculado */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Comisión calculada:
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      RD$ {Number(formData.montoComision || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Estado y descripción */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagada">Pagada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      ID del Préstamo
                    </label>
                    <input
                      type="text"
                      value={formData.prestamoId}
                      onChange={(e) => setFormData({ ...formData, prestamoId: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      placeholder="PR-2024-001"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                    } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none`}
                    placeholder="Descripción de la comisión"
                  />
                </div>
              </div>
            </div>

            <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={guardando}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>{comision ? 'Actualizar' : 'Guardar'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MODAL PARA VER DETALLE DE COMISIÓN
// ============================================
const DetalleComisionModal = ({ isOpen, onClose, comision }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pagada': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'pendiente': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelada': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
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
          className="relative w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-red-600/20' : 'border-gray-200'} flex justify-between items-center`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Detalle de Comisión
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    ID: {comision?.id?.slice(0, 8)}...
                  </p>
                </div>
              </div>
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

            <div className="p-6 space-y-4">
              {/* Estado y tipo */}
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(comision?.estado)}`}>
                  {comision?.estado?.charAt(0).toUpperCase() + comision?.estado?.slice(1)}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {comision?.tipo === 'prestamo' ? 'Comisión por Préstamo' :
                   comision?.tipo === 'cobro' ? 'Comisión por Cobro' : 'Liquidación'}
                </span>
              </div>

              {/* Monto principal */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} text-center`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monto de Comisión</p>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {formatearMonto(comision?.montoComision)}
                </p>
              </div>

              {/* Información detallada */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-red-600/20`}>
                <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Información de la Comisión
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Asesor</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comision?.asesor}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cliente</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comision?.cliente}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monto Base</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatearMonto(comision?.montoBase)}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Porcentaje</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comision?.porcentaje}%</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Fecha</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatearFecha(comision?.fecha)}</p>
                  </div>
                  {comision?.prestamoId && (
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>ID Préstamo</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comision.prestamoId}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Descripción</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comision?.descripcion || 'Sin descripción'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// TARJETA DE ESTADÍSTICA
// ============================================
const StatCard = ({ icon: Icon, label, value, color, change }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl p-4 border ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-8 -mt-8`} />
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% vs mes anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// TARJETA DE COMISIÓN
// ============================================
const ComisionCard = ({ comision, onVer, onEditar, onEliminar }) => {
  const { theme } = useTheme();

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString();

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pagada': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelada': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-700" />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-700 rounded-lg">
              <CurrencyDollarIcon className="h-4 w-4 text-white" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(comision.estado)}`}>
              {comision.estado}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatearFecha(comision.fecha)}
          </span>
        </div>

        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {comision.cliente}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Asesor: {comision.asesor}
        </p>

        <div className="flex justify-between items-center mt-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monto Base</p>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatearMonto(comision.montoBase)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Comisión</p>
            <p className="text-lg font-bold text-red-600">
              {formatearMonto(comision.montoComision)}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => onVer(comision)}
            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
            title="Ver detalles"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEditar(comision)}
            className="p-1 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded transition-colors"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEliminar(comision.id)}
            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Comisiones = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [comisionSeleccionada, setComisionSeleccionada] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pagadas: 0,
    pendientes: 0,
    montoTotal: 0
  });

  // Cargar comisiones desde Firebase
  const cargarComisiones = async () => {
    try {
      setLoading(true);
      const comisionesRef = collection(db, 'comisiones');
      const q = query(comisionesRef, orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const comisionesList = [];
      let stats = {
        total: 0,
        pagadas: 0,
        pendientes: 0,
        montoTotal: 0
      };

      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        comisionesList.push(data);

        // Actualizar estadísticas
        stats.total++;
        stats.montoTotal += Number(data.montoComision) || 0;
        if (data.estado === 'pagada') stats.pagadas++;
        if (data.estado === 'pendiente') stats.pendientes++;
      });

      setComisiones(comisionesList);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando comisiones:', error);
      setError('Error al cargar las comisiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarComisiones();
  }, []);

  // Guardar comisión
  const guardarComision = async (formData) => {
    try {
      if (formData.id) {
        // Actualizar
        const comisionRef = doc(db, 'comisiones', formData.id);
        await updateDoc(comisionRef, {
          ...formData,
          fechaActualizacion: new Date().toISOString(),
          actualizadoPor: user?.email
        });
        setExito('Comisión actualizada exitosamente');
      } else {
        // Crear nuevo
        const comisionesRef = collection(db, 'comisiones');
        await addDoc(comisionesRef, {
          ...formData,
          fechaCreacion: new Date().toISOString(),
          creadoPor: user?.email
        });
        setExito('Comisión creada exitosamente');
      }
      
      setTimeout(() => setExito(''), 3000);
      await cargarComisiones();
    } catch (error) {
      console.error('Error guardando comisión:', error);
      setError('Error al guardar la comisión');
      throw error;
    }
  };

  // Eliminar comisión
  const eliminarComision = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta comisión?')) return;

    try {
      await deleteDoc(doc(db, 'comisiones', id));
      setExito('Comisión eliminada exitosamente');
      setTimeout(() => setExito(''), 3000);
      await cargarComisiones();
    } catch (error) {
      console.error('Error eliminando comisión:', error);
      setError('Error al eliminar la comisión');
    }
  };

  // Filtrar comisiones
  const comisionesFiltradas = comisiones.filter(com => {
    if (filtroTipo !== 'todos' && com.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'todos' && com.estado !== filtroEstado) return false;
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      return (
        com.cliente?.toLowerCase().includes(busquedaLower) ||
        com.asesor?.toLowerCase().includes(busquedaLower) ||
        com.descripcion?.toLowerCase().includes(busquedaLower)
      );
    }
    return true;
  });

  const formatearMonto = (valor) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(valor || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
            <CurrencyDollarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Gestión de Comisiones
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Administra las comisiones por préstamos y cobros
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setComisionSeleccionada(null);
            setEditorAbierto(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nueva Comisión</span>
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

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={CurrencyDollarIcon}
          label="Total Comisiones"
          value={comisiones.length}
          color="from-red-500 to-red-700"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Pagadas"
          value={estadisticas.pagadas}
          color="from-green-500 to-green-700"
        />
        <StatCard
          icon={ClockIcon}
          label="Pendientes"
          value={estadisticas.pendientes}
          color="from-yellow-500 to-yellow-700"
        />
        <StatCard
          icon={BanknotesIcon}
          label="Monto Total"
          value={formatearMonto(estadisticas.montoTotal)}
          color="from-purple-500 to-purple-700"
        />
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente o asesor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
            />
          </div>
        </div>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
        >
          <option value="todos">Todos los tipos</option>
          <option value="prestamo">Por Préstamo</option>
          <option value="cobro">Por Cobro</option>
          <option value="liquidacion">Liquidación</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <button
          onClick={cargarComisiones}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Actualizar"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid de comisiones */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comisionesFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay comisiones para mostrar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comisionesFiltradas.map((comision) => (
            <ComisionCard
              key={comision.id}
              comision={comision}
              onVer={(com) => {
                setComisionSeleccionada(com);
                setDetalleAbierto(true);
              }}
              onEditar={(com) => {
                setComisionSeleccionada(com);
                setEditorAbierto(true);
              }}
              onEliminar={eliminarComision}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <ComisionEditorModal
        isOpen={editorAbierto}
        onClose={() => {
          setEditorAbierto(false);
          setComisionSeleccionada(null);
        }}
        comision={comisionSeleccionada}
        onSave={guardarComision}
      />

      <DetalleComisionModal
        isOpen={detalleAbierto}
        onClose={() => {
          setDetalleAbierto(false);
          setComisionSeleccionada(null);
        }}
        comision={comisionSeleccionada}
      />
    </div>
  );
};

export default Comisiones;