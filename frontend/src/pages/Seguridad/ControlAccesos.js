import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LockClosedIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const GlassCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const TechToggle = ({ label, description, checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked || false);

  useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(newValue);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-red-600/20 hover:border-red-600/50 transition-all cursor-pointer group"
      onClick={handleToggle}
    >
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isChecked ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <motion.div
          animate={{ x: isChecked ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </div>
    </motion.div>
  );
};

const AccessRule = ({ rule, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const isActive = rule.activo === true;

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'ip': return <ComputerDesktopIcon className="h-5 w-5 text-white" />;
      case 'horario': return <ClockIcon className="h-5 w-5 text-white" />;
      case 'ubicacion': return <GlobeAltIcon className="h-5 w-5 text-white" />;
      case 'dispositivo': return <LockClosedIcon className="h-5 w-5 text-white" />;
      default: return <ShieldCheckIcon className="h-5 w-5 text-white" />;
    }
  };

  const getTipoColor = (tipo) => {
    const colores = {
      ip: 'bg-blue-600',
      horario: 'bg-yellow-600',
      ubicacion: 'bg-green-600',
      dispositivo: 'bg-purple-600'
    };
    return colores[tipo] || 'bg-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between p-4 rounded-lg border ${
        isActive 
          ? 'bg-gray-50 dark:bg-gray-900/50 border-red-600/20' 
          : 'bg-gray-100 dark:bg-gray-800/30 border-gray-300 dark:border-gray-600 opacity-60'
      }`}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className={`p-2 rounded-lg ${getTipoColor(rule.tipo)}`}>
          {getTipoIcon(rule.tipo)}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <p className="font-medium text-gray-900 dark:text-white">{rule.nombre}</p>
            {!isActive && (
              <span className="text-xs px-2 py-0.5 bg-gray-400 text-white rounded-full">Inactiva</span>
            )}
            {rule.accion === 'denegar' && (
              <span className="text-xs px-2 py-0.5 bg-red-600 text-white rounded-full">🚫 Bloquear</span>
            )}
            {rule.accion === 'permitir' && (
              <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">✅ Permitir</span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rule.descripcion}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {rule.tipo === 'horario' ? '🕐 Horario: ' : '📌 Valor: '}{rule.valor}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Estado: {isActive ? '✅ Activa' : '⏸️ Inactiva'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit({ ...rule, activo: !isActive })}
          className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
            isActive 
              ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30' 
              : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={isActive ? 'Desactivar regla' : 'Activar regla'}
        >
          <ShieldCheckIcon className="h-5 w-5" />
          <span className="text-xs font-medium hidden sm:inline">{isActive ? 'Activa' : 'Inactiva'}</span>
        </button>
        <button
          onClick={() => onEdit(rule)}
          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          title="Editar regla"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(rule.id)}
          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          title="Eliminar regla"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

const RuleModal = ({ isOpen, onClose, rule, onGuardar }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'horario',
    valor: '',
    accion: 'denegar',
    activo: true
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        nombre: rule.nombre || '',
        descripcion: rule.descripcion || '',
        tipo: rule.tipo || 'horario',
        valor: rule.valor || '',
        accion: rule.accion || 'denegar',
        activo: rule.activo === true
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: 'horario',
        valor: '',
        accion: 'denegar',
        activo: true
      });
    }
  }, [rule, isOpen]);

  if (!isOpen) return null;

  const tipos = [
    { value: 'ip', label: 'Restricción por IP', icon: ComputerDesktopIcon },
    { value: 'horario', label: 'Restricción por Horario', icon: ClockIcon },
    { value: 'ubicacion', label: 'Restricción por Ubicación', icon: GlobeAltIcon },
    { value: 'dispositivo', label: 'Restricción por Dispositivo', icon: LockClosedIcon }
  ];

  const getPlaceholder = (tipo) => {
    switch(tipo) {
      case 'ip': return '192.168.1.100 o 192.168.1.0/24';
      case 'horario': return '08:00-18:00 o 00:00-23:59';
      case 'ubicacion': return 'Santo Domingo, República Dominicana';
      case 'dispositivo': return 'Móvil, Escritorio, Tablet';
      default: return '';
    }
  };

  const getHelpText = (tipo) => {
    switch(tipo) {
      case 'ip': return 'Ejemplos: 192.168.1.100 (IP exacta), 192.168.1.0/24 (rango CIDR)';
      case 'horario': return 'Formato: HH:MM-HH:MM. Use 00:00-23:59 para 24/7';
      case 'ubicacion': return 'Escribe el nombre del país o ciudad a restringir';
      case 'dispositivo': return 'Tipo de dispositivo a restringir';
      default: return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur-xl opacity-75" />
        
        <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className={`p-6 border-b ${theme === 'dark' ? 'border-red-600/20' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {rule ? '✏️ Editar Regla' : '➕ Nueva Regla de Acceso'}
            </h3>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo de Restricción
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tipos.map((tipo) => {
                  const Icon = tipo.icon;
                  return (
                    <button
                      key={tipo.value}
                      onClick={() => setFormData({ ...formData, tipo: tipo.value })}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${
                        formData.tipo === tipo.value
                          ? 'border-red-600 bg-red-600/10 text-red-600'
                          : theme === 'dark'
                            ? 'border-gray-700 hover:border-red-600/50 text-gray-400'
                            : 'border-gray-200 hover:border-red-600/50 text-gray-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs text-center">{tipo.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre de la Regla
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                placeholder="Ej: Bloquear acceso fuera de horario"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows="2"
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none`}
                placeholder="Descripción de la regla"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Valor / Condición
              </label>
              <input
                type="text"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                placeholder={getPlaceholder(formData.tipo)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {getHelpText(formData.tipo)}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Acción
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFormData({ ...formData, accion: 'permitir' })}
                  className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                    formData.accion === 'permitir'
                      ? 'border-green-600 bg-green-600/10 text-green-600'
                      : theme === 'dark'
                        ? 'border-gray-700 text-gray-400'
                        : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-sm">✅ Permitir</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, accion: 'denegar' })}
                  className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                    formData.accion === 'denegar'
                      ? 'border-red-600 bg-red-600/10 text-red-600'
                      : theme === 'dark'
                        ? 'border-gray-700 text-gray-400'
                        : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-sm">🚫 Denegar</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formData.accion === 'denegar' 
                  ? '🔴 Denegar: Bloquea cuando se cumple la condición' 
                  : '🟢 Permitir: Bloquea cuando NO se cumple la condición'}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Regla Activa
                </p>
                <p className="text-xs text-gray-400">La regla se aplicará inmediatamente</p>
              </div>
              <div
                onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer ${
                  formData.activo ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{ x: formData.activo ? 28 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </div>
          </div>

          <div className={`p-6 border-t flex justify-end space-x-3 ${
            theme === 'dark' ? 'border-red-600/20 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onGuardar(formData);
                onClose();
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              {rule ? 'Actualizar' : 'Crear'} Regla
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ControlAccesos = ({ configuracion, handleInputChange, onGuardar }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [reglas, setReglas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reglaEditando, setReglaEditando] = useState(null);

  const cargarReglas = async () => {
    try {
      console.log('🔄 [CONTROLACCESOS] Cargando reglas desde Firebase...');
      const reglasRef = collection(db, 'ReglasAcceso');
      const reglasSnap = await getDocs(reglasRef);
      const reglasList = [];
      reglasSnap.forEach(doc => {
        const data = doc.data();
        reglasList.push({ 
          id: doc.id, 
          ...data,
          activo: data.activo === true
        });
      });
      console.log(`📋 [CONTROLACCESOS] ${reglasList.length} reglas cargadas`);
      setReglas(reglasList);
    } catch (error) {
      console.error('❌ [CONTROLACCESOS] Error cargando reglas:', error);
    }
  };

  useEffect(() => {
    cargarReglas();
  }, []);

  const guardarConfiguracion = async () => {
    try {
      setGuardando(true);
      setError('');
      
      const configRef = doc(db, 'Configuracion', 'controlAccesos');
      const datos = {
        bloqueoIP: configuracion?.controlAccesos?.bloqueoIP || false,
        restriccionHorario: configuracion?.controlAccesos?.restriccionHorario || false,
        geolocalizacion: configuracion?.controlAccesos?.geolocalizacion || false,
        dispositivosConfiables: configuracion?.controlAccesos?.dispositivosConfiables || false,
        actualizadoPor: user?.email || 'admin',
        fechaActualizacion: new Date().toISOString()
      };
      
      console.log('📝 [CONTROLACCESOS] Guardando configuración:', datos);
      await setDoc(configRef, datos, { merge: true });
      
      if (onGuardar) {
        console.log('🔄 [CONTROLACCESOS] Notificando al padre para recargar configuración...');
        await onGuardar();
      }
      
      setExito('✅ Configuración guardada exitosamente');
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('❌ [CONTROLACCESOS] Error guardando configuración:', error);
      setError('❌ Error al guardar la configuración: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // 🔥 CORREGIDO - SIN DUPLICACIÓN
  const handleGuardarRegla = async (regla) => {
    try {
      // Usar el ID existente si es edición, o generar uno nuevo
      const reglaId = regla.id || Date.now().toString();
      const reglaRef = doc(db, 'ReglasAcceso', reglaId);
      
      const datosRegla = {
        nombre: regla.nombre || 'Regla sin nombre',
        descripcion: regla.descripcion || '',
        tipo: regla.tipo || 'horario',
        valor: regla.valor || '',
        accion: regla.accion || 'denegar',
        activo: regla.activo === true,
        creadoPor: user?.email || 'admin',
        fechaCreacion: regla.fechaCreacion || new Date().toISOString()
      };

      console.log('📝 [CONTROLACCESOS] Guardando regla:', datosRegla);

      await setDoc(reglaRef, datosRegla);
      await cargarReglas();
      
      setExito('✅ Regla guardada exitosamente');
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('❌ [CONTROLACCESOS] Error guardando regla:', error);
      setError('❌ Error al guardar la regla: ' + error.message);
    }
  };

  const handleEliminarRegla = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta regla?')) return;
    
    try {
      console.log(`🗑️ [CONTROLACCESOS] Eliminando regla: ${id}`);
      await deleteDoc(doc(db, 'ReglasAcceso', id));
      setReglas(prev => prev.filter(r => r.id !== id));
      setExito('✅ Regla eliminada');
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('❌ [CONTROLACCESOS] Error eliminando regla:', error);
      setError('❌ Error al eliminar la regla: ' + error.message);
    }
  };

  const handleEditarRegla = (regla) => {
    console.log('✏️ [CONTROLACCESOS] Editando regla:', regla);
    if (regla.id && regla.activo !== undefined && Object.keys(regla).length === 2) {
      handleToggleActivarRegla(regla.id, regla.activo);
      return;
    }
    setReglaEditando(regla);
    setModalAbierto(true);
  };

  const handleToggleActivarRegla = async (id, activo) => {
    try {
      console.log(`🔄 [CONTROLACCESOS] Toggle regla ${id} -> ${activo}`);
      const reglaRef = doc(db, 'ReglasAcceso', id);
      await setDoc(reglaRef, {
        activo: activo
      }, { merge: true });
      
      setReglas(prev => prev.map(r => 
        r.id === id ? { ...r, activo: activo } : r
      ));
      
      setExito(activo ? '✅ Regla activada' : '⏸️ Regla desactivada');
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('❌ [CONTROLACCESOS] Error togglando regla:', error);
      setError('❌ Error al cambiar estado de la regla');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400 flex items-start space-x-3"
        >
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {exito && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400 flex items-start space-x-3"
        >
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{exito}</p>
        </motion.div>
      )}

      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
              <LockClosedIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configuración General</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Opciones globales de control de accesos</p>
            </div>
          </div>

          <div className="space-y-4">
            <TechToggle
              label="Bloqueo por IP"
              description="Bloquear accesos desde IPs no autorizadas"
              checked={configuracion?.controlAccesos?.bloqueoIP || false}
              onChange={(value) => handleInputChange('controlAccesos', 'bloqueoIP', value)}
            />

            <TechToggle
              label="Restricción por Horario"
              description="Limitar accesos según horarios configurados"
              checked={configuracion?.controlAccesos?.restriccionHorario || false}
              onChange={(value) => handleInputChange('controlAccesos', 'restriccionHorario', value)}
            />

            <TechToggle
              label="Geolocalización"
              description="Restringir accesos por ubicación geográfica"
              checked={configuracion?.controlAccesos?.geolocalizacion || false}
              onChange={(value) => handleInputChange('controlAccesos', 'geolocalizacion', value)}
            />

            <TechToggle
              label="Dispositivos Confiables"
              description="Solo permitir accesos desde dispositivos registrados"
              checked={configuracion?.controlAccesos?.dispositivosConfiables || false}
              onChange={(value) => handleInputChange('controlAccesos', 'dispositivosConfiables', value)}
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reglas Personalizadas</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona reglas específicas de acceso</p>
              </div>
            </div>
            <button
              onClick={() => {
                setReglaEditando(null);
                setModalAbierto(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nueva Regla</span>
            </button>
          </div>

          <div className="space-y-3">
            {reglas.length === 0 ? (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No hay reglas de acceso configuradas
              </p>
            ) : (
              reglas.map((regla) => (
                <AccessRule
                  key={regla.id}
                  rule={regla}
                  onEdit={handleEditarRegla}
                  onDelete={handleEliminarRegla}
                />
              ))
            )}
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={guardarConfiguracion}
          disabled={guardando}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {guardando ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              <span>Guardar Configuración</span>
            </>
          )}
        </motion.button>
      </div>

      <RuleModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        rule={reglaEditando}
        onGuardar={handleGuardarRegla}
      />
    </motion.div>
  );
};

export default ControlAccesos;