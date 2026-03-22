import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserIcon,
  ShieldCheckIcon,
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
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  HomeIcon,
  BriefcaseIcon,
  BanknotesIcon,
  ClockIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

// ============================================
// MODAL PRINCIPAL PARA FORMULARIOS
// ============================================
const FormularioModal = ({ isOpen, onClose, titulo, children }) => {
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-blue-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'} flex justify-between items-center`}>
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
// MODAL PARA CREAR/EDITAR FORMULARIO
// ============================================
const FormularioEditorModal = ({ isOpen, onClose, formulario, onSave, tipo }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tipo: tipo || 'solicitud',
    cliente: '',
    email: '',
    telefono: '',
    direccion: '',
    cedula: '',
    monto: '',
    plazo: '',
    interes: '10',
    garantia: 'personal',
    estado: 'pendiente',
    solicitudId: '',
    fechaCreacion: new Date().toISOString(),
    ...formulario
  });

  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    if (formulario) {
      setFormData(formulario);
    }
    cargarSolicitudes();
  }, [formulario]);

  const cargarSolicitudes = async () => {
    try {
      const solicitudesRef = collection(db, 'solicitudes');
      const q = query(solicitudesRef, orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);
      const solicitudesList = [];
      querySnapshot.forEach((doc) => {
        solicitudesList.push({ id: doc.id, ...doc.data() });
      });
      setSolicitudes(solicitudesList);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cliente?.trim()) {
      newErrors.cliente = 'El nombre del cliente es requerido';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }
    if (!formData.cedula?.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    }
    if (formData.tipo === 'solicitud') {
      if (!formData.monto) {
        newErrors.monto = 'El monto es requerido';
      }
      if (!formData.plazo) {
        newErrors.plazo = 'El plazo es requerido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setGuardando(true);
    try {
      const dataToSave = {
        ...formData,
        monto: formData.monto ? parseFloat(formData.monto) : 0,
        plazo: formData.plazo ? parseInt(formData.plazo) : 0,
        interes: parseFloat(formData.interes),
        fechaActualizacion: new Date().toISOString(),
        actualizadoPor: user?.email
      };
      
      if (!formData.id) {
        dataToSave.fechaCreacion = new Date().toISOString();
        dataToSave.creadoPor = user?.email;
      }
      
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error guardando formulario:', error);
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-blue-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formulario ? 'Editar Formulario' : 'Nuevo Formulario'}
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
                {/* Información del Cliente */}
                <div className="space-y-4">
                  <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Información del Cliente
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.cliente}
                        onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.cliente ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                        placeholder="Ej: Juan Pérez"
                      />
                      {errors.cliente && <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Cédula *
                      </label>
                      <input
                        type="text"
                        value={formData.cedula}
                        onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.cedula ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                        placeholder="001-1234567-8"
                      />
                      {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.email ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                        placeholder="cliente@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.telefono ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                        placeholder="809-123-4567"
                      />
                      {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                        placeholder="Calle, número, sector, ciudad"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Asociado a Solicitud (opcional)
                      </label>
                      <select
                        value={formData.solicitudId}
                        onChange={(e) => setFormData({ ...formData, solicitudId: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                      >
                        <option value="">Ninguna</option>
                        {solicitudes.map(sol => (
                          <option key={sol.id} value={sol.id}>
                            {sol.clienteNombre} - RD$ {sol.montoSolicitado?.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Detalles del Préstamo (solo para solicitudes) */}
                {formData.tipo === 'solicitud' && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Detalles del Préstamo
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Monto Solicitado *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">RD$</span>
                          <input
                            type="number"
                            value={formData.monto}
                            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                            className={`w-full pl-12 pr-3 py-2 rounded-lg border ${
                              errors.monto ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                            } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                            placeholder="50,000"
                          />
                        </div>
                        {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto}</p>}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Plazo (meses) *
                        </label>
                        <input
                          type="number"
                          value={formData.plazo}
                          onChange={(e) => setFormData({ ...formData, plazo: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            errors.plazo ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                          placeholder="12"
                        />
                        {errors.plazo && <p className="text-red-500 text-xs mt-1">{errors.plazo}</p>}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Interés (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.interes}
                          onChange={(e) => setFormData({ ...formData, interes: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                          } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tipo de Garantía
                      </label>
                      <select
                        value={formData.garantia}
                        onChange={(e) => setFormData({ ...formData, garantia: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                      >
                        <option value="">Seleccionar garantía</option>
                        <option value="hipotecaria">Hipotecaria</option>
                        <option value="prendaria">Prendaria</option>
                        <option value="fiduciaria">Fiduciaria</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Estado del Formulario */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Estado:
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className={`px-3 py-1 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="rechazado">Rechazado</option>
                      <option value="completado">Completado</option>
                    </select>
                  </div>
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
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>{formulario ? 'Actualizar' : 'Guardar'}</span>
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
// MODAL PARA VER DETALLE DE FORMULARIO
// ============================================
const DetalleFormularioModal = ({ isOpen, onClose, formulario }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  if (!isOpen) return null;

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'aprobado': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'pendiente': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rechazado': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'completado': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(monto || 0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          className="relative w-full max-w-3xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-blue-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'} flex justify-between items-center`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formulario?.tipo === 'solicitud' ? 'Solicitud de Préstamo' : 'Formulario de Cliente'}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    ID: {formulario?.id?.slice(0, 8)}...
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

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Estado y Fecha */}
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(formulario?.estado)}`}>
                  {formulario?.estado?.charAt(0).toUpperCase() + formulario?.estado?.slice(1)}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {formatearFecha(formulario?.fechaCreacion)}
                </span>
              </div>

              {/* Información del Cliente */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-blue-600/20`}>
                <h4 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Información del Cliente
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Nombre Completo</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario?.cliente}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cédula</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario?.cedula}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario?.email}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Teléfono</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario?.telefono}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Dirección</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario?.direccion || 'No especificada'}</p>
                  </div>
                  {formulario?.solicitudId && (
                    <div className="md:col-span-2">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Solicitud Asociada</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario.solicitudId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles del Préstamo (si aplica) */}
              {formulario?.tipo === 'solicitud' && (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-green-600/20`}>
                  <h4 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                    Detalles del Préstamo
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Monto Solicitado</p>
                      <p className={`text-xl font-bold text-green-600`}>{formatearMonto(formulario?.monto)}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Plazo</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario?.plazo} meses</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Interés</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario?.interes || '0'}%</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Garantía</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario?.garantia || 'No especificada'}</p>
                    </div>
                  </div>

                  {/* Cuota mensual calculada */}
                  {formulario?.monto && formulario?.plazo && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cuota Mensual Estimada</p>
                      <p className={`text-2xl font-bold text-blue-600`}>
                        {formatearMonto(formulario.monto / formulario.plazo)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Información de creación */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-blue-600/20`}>
                <h4 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Información de Creación
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Creado por</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formulario?.creadoPor || 'Sistema'}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Fecha de creación</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatearFecha(formulario?.fechaCreacion)}</p>
                  </div>
                  {formulario?.fechaActualizacion && (
                    <div className="md:col-span-2">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Última actualización</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatearFecha(formulario?.fechaActualizacion)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
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
const StatCard = ({ icon: Icon, label, value, color, change, onClick }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl p-4 border ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg cursor-pointer`}
      onClick={onClick}
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
// COMPONENTE PRINCIPAL
// ============================================
const Formularios = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [formularioSeleccionado, setFormularioSeleccionado] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    solicitudes: { total: 0, pendientes: 0, aprobados: 0 },
    clientes: { total: 0, nuevos: 0 },
    garantias: { total: 0, activas: 0 }
  });

  // Cargar formularios desde Firebase
  const cargarFormularios = async () => {
    try {
      setLoading(true);
      const formulariosRef = collection(db, 'formularios');
      const q = query(formulariosRef, orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const formulariosList = [];
      let stats = {
        solicitudes: { total: 0, pendientes: 0, aprobados: 0 },
        clientes: { total: 0, nuevos: 0 },
        garantias: { total: 0, activas: 0 }
      };

      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        formulariosList.push(data);

        // Actualizar estadísticas
        if (data.tipo === 'solicitud') {
          stats.solicitudes.total++;
          if (data.estado === 'pendiente') stats.solicitudes.pendientes++;
          if (data.estado === 'aprobado') stats.solicitudes.aprobados++;
        } else if (data.tipo === 'cliente') {
          stats.clientes.total++;
          const fechaCreacion = new Date(data.fechaCreacion);
          const hace7Dias = new Date();
          hace7Dias.setDate(hace7Dias.getDate() - 7);
          if (fechaCreacion > hace7Dias) stats.clientes.nuevos++;
        } else if (data.tipo === 'garantia') {
          stats.garantias.total++;
          if (data.estado === 'activa') stats.garantias.activas++;
        }
      });

      setFormularios(formulariosList);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando formularios:', error);
      setError('Error al cargar los formularios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFormularios();
  }, []);

  // Guardar formulario
  const guardarFormulario = async (formData) => {
    try {
      if (formData.id) {
        const formularioRef = doc(db, 'formularios', formData.id);
        await updateDoc(formularioRef, formData);
        setExito('Formulario actualizado exitosamente');
      } else {
        const formulariosRef = collection(db, 'formularios');
        await addDoc(formulariosRef, formData);
        setExito('Formulario creado exitosamente');
      }
      
      setTimeout(() => setExito(''), 3000);
      await cargarFormularios();
    } catch (error) {
      console.error('Error guardando formulario:', error);
      setError('Error al guardar el formulario');
      throw error;
    }
  };

  // Eliminar formulario
  const eliminarFormulario = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este formulario?')) return;

    try {
      await deleteDoc(doc(db, 'formularios', id));
      setExito('Formulario eliminado exitosamente');
      setTimeout(() => setExito(''), 3000);
      await cargarFormularios();
    } catch (error) {
      console.error('Error eliminando formulario:', error);
      setError('Error al eliminar el formulario');
    }
  };

  // Filtrar formularios
  const formulariosFiltrados = formularios.filter(f => {
    if (filtroTipo !== 'todos' && f.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'todos' && f.estado !== filtroEstado) return false;
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      return (
        f.cliente?.toLowerCase().includes(busquedaLower) ||
        f.email?.toLowerCase().includes(busquedaLower) ||
        f.cedula?.includes(busqueda) ||
        f.id?.includes(busqueda)
      );
    }
    return true;
  });

  const tiposFormulario = [
    {
      id: 'solicitudes',
      nombre: 'Solicitudes de Préstamo',
      descripcion: 'Gestiona las solicitudes de préstamo de clientes',
      icon: CurrencyDollarIcon,
      color: 'from-blue-500 to-blue-700',
      estadisticas: estadisticas.solicitudes
    },
    {
      id: 'clientes',
      nombre: 'Formularios de Clientes',
      descripcion: 'Registro y actualización de datos de clientes',
      icon: UserIcon,
      color: 'from-cyan-500 to-cyan-700',
      estadisticas: estadisticas.clientes
    },
    {
      id: 'garantias',
      nombre: 'Garantías',
      descripcion: 'Documentación de garantías y avales',
      icon: ShieldCheckIcon,
      color: 'from-indigo-500 to-indigo-700',
      estadisticas: estadisticas.garantias
    }
  ];

  const getEstadoBadge = (estado) => {
    switch(estado) {
      case 'aprobado':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Aprobado</span>;
      case 'pendiente':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pendiente</span>;
      case 'rechazado':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rechazado</span>;
      case 'completado':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Completado</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
            <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Formularios
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestión de formularios y solicitudes
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setFormularioSeleccionado(null);
            setEditorAbierto(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nuevo Formulario</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiposFormulario.map((tipo) => (
          <StatCard
            key={tipo.id}
            icon={tipo.icon}
            label={tipo.nombre}
            value={tipo.estadisticas.total}
            color={tipo.color}
            onClick={() => setFiltroTipo(tipo.id === 'solicitudes' ? 'solicitud' : tipo.id === 'clientes' ? 'cliente' : 'garantia')}
          />
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, email o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
            />
          </div>
        </div>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
        >
          <option value="todos">Todos los tipos</option>
          <option value="solicitud">Solicitudes</option>
          <option value="cliente">Clientes</option>
          <option value="garantia">Garantías</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
          <option value="completado">Completado</option>
        </select>

        <button
          onClick={cargarFormularios}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Actualizar"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabla de formularios */}
      <div className={`rounded-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} divide-y divide-gray-200 dark:divide-gray-700`}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : formulariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No hay formularios para mostrar
                    </p>
                    <button
                      onClick={() => {
                        setFormularioSeleccionado(null);
                        setEditorAbierto(true);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Crear Primer Formulario</span>
                    </button>
                  </td>
                </tr>
              ) : (
                formulariosFiltrados.map((formulario) => (
                  <motion.tr
                    key={formulario.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                      {formulario.id?.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formulario.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formulario.cliente}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {formulario.email}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(formulario.fechaCreacion).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {getEstadoBadge(formulario.estado)}
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setFormularioSeleccionado(formulario);
                          setDetalleAbierto(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setFormularioSeleccionado(formulario);
                          setEditorAbierto(true);
                        }}
                        className="p-1 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => eliminarFormulario(formulario.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <FormularioEditorModal
        isOpen={editorAbierto}
        onClose={() => {
          setEditorAbierto(false);
          setFormularioSeleccionado(null);
        }}
        formulario={formularioSeleccionado}
        onSave={guardarFormulario}
      />

      <DetalleFormularioModal
        isOpen={detalleAbierto}
        onClose={() => {
          setDetalleAbierto(false);
          setFormularioSeleccionado(null);
        }}
        formulario={formularioSeleccionado}
      />
    </div>
  );
};

export default Formularios;