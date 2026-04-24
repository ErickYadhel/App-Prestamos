import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Squares2X2Icon, XMarkIcon, PlusIcon, PencilIcon, TrashIcon, 
  CheckCircleIcon, UserIcon, ClockIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const DashboardManagerModal = ({ isOpen, onClose, dashboards, currentDashboard, onSelect, onSave, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [modo, setModo] = useState('listar');
  const [editandoId, setEditandoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleGuardar = () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      creadoPor: user?.email || 'Usuario',
      fechaCreacion: new Date().toISOString()
    });

    setNombre('');
    setDescripcion('');
    setError('');
    setModo('listar');
  };

  const handleEditar = (dashboard) => {
    setEditandoId(dashboard.id);
    setNombre(dashboard.nombre);
    setDescripcion(dashboard.descripcion || '');
    setModo('editar');
  };

  const handleActualizar = () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    onEdit(editandoId, {
      nombre: nombre.trim(),
      descripcion: descripcion.trim()
    });

    setNombre('');
    setDescripcion('');
    setError('');
    setEditandoId(null);
    setModo('listar');
  };

  const handleEliminar = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el dashboard "${nombre}"?`)) {
      onDelete(id);
    }
  };

  const handleCancelar = () => {
    setNombre('');
    setDescripcion('');
    setError('');
    setEditandoId(null);
    setModo('listar');
  };

  const handleNuevo = () => {
    setNombre('');
    setDescripcion('');
    setError('');
    setModo('crear');
  };

  const dashboardsFiltrados = dashboards.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.descripcion && d.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-3xl max-h-[85vh] mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
            </div>

            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-red-50 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                    <Squares2X2Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {modo === 'listar' && 'Mis Dashboards'}
                      {modo === 'crear' && 'Guardar Nuevo Dashboard'}
                      {modo === 'editar' && 'Editar Dashboard'}
                    </h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {modo === 'listar' && 'Administra tus dashboards personalizados'}
                      {modo === 'crear' && 'Guarda la configuración actual para acceder rápidamente'}
                      {modo === 'editar' && 'Modifica los detalles del dashboard'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {modo === 'listar' && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar dashboards..."
                        className={`w-full px-4 py-2.5 rounded-lg border-2 text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500'
                        } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNuevo}
                      className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Nuevo Dashboard</span>
                    </motion.button>
                  </div>

                  {dashboardsFiltrados.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardsFiltrados.map((d, index) => {
                        const fecha = d.fechaCreacion ? new Date(d.fechaCreacion) : null;
                        const esActual = currentDashboard?.id === d.id;
                        
                        return (
                          <motion.div
                            key={d.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                              esActual
                                ? 'border-red-600 bg-red-50/50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-red-600/50'
                            }`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full transition-transform duration-1000 hover:translate-x-full`} />
                            
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {d.nombre}
                                    </h4>
                                    {esActual && (
                                      <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded-full flex items-center space-x-1">
                                        <CheckCircleIcon className="h-3 w-3" />
                                        <span>Actual</span>
                                      </span>
                                    )}
                                  </div>
                                  
                                  {d.descripcion && (
                                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {d.descripcion}
                                    </p>
                                  )}
                                  
                                  <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      <UserIcon className="h-3 w-3" />
                                      <span>{d.creadoPor || 'Usuario'}</span>
                                    </div>
                                    {fecha && (
                                      <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <ClockIcon className="h-3 w-3" />
                                        <span>{fecha.toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => onSelect(d)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                      esActual
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    {esActual ? 'Actual' : 'Cargar'}
                                  </button>
                                  <button
                                    onClick={() => handleEditar(d)}
                                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                      theme === 'dark'
                                        ? 'hover:bg-gray-700 text-yellow-500 hover:text-yellow-400'
                                        : 'hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700'
                                    }`}
                                    title="Editar"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEliminar(d.id, d.nombre)}
                                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                      theme === 'dark'
                                        ? 'hover:bg-gray-700 text-red-500 hover:text-red-400'
                                        : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                                    }`}
                                    title="Eliminar"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchTerm ? (
                        <>
                          <Squares2X2Icon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium mb-2">No se encontraron dashboards</p>
                          <p className="text-sm mb-4">No hay resultados para "{searchTerm}"</p>
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Limpiar búsqueda
                          </button>
                        </>
                      ) : (
                        <>
                          <Squares2X2Icon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium mb-2">No hay dashboards guardados</p>
                          <p className="text-sm mb-4">Guarda tu configuración actual para acceder rápidamente</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNuevo}
                            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                          >
                            <PlusIcon className="h-4 w-4" />
                            <span>Guardar Dashboard Actual</span>
                          </motion.button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(modo === 'crear' || modo === 'editar') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nombre del Dashboard *
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => {
                          setNombre(e.target.value);
                          setError('');
                        }}
                        className={`w-full px-4 py-2.5 rounded-lg border-2 text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                        } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                        placeholder="Ej: Dashboard Principal"
                        autoFocus
                      />
                      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Descripción
                      </label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows="4"
                        className={`w-full px-4 py-2.5 rounded-lg border-2 resize-none text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                        } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                        placeholder="Breve descripción del dashboard (opcional)..."
                      />
                    </div>

                    <div className={`mt-4 p-4 rounded-lg border-2 ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h5 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Configuración actual que se guardará:
                      </h5>
                      <ul className={`text-xs space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li>• Filtros aplicados</li>
                        <li>• Visibilidad de gráficos</li>
                        <li>• Período seleccionado</li>
                        <li>• Año seleccionado</li>
                      </ul>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={handleCancelar}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          theme === 'dark'
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancelar
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={modo === 'crear' ? handleGuardar : handleActualizar}
                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                      >
                        {modo === 'crear' ? 'Guardar Dashboard' : 'Actualizar Dashboard'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} text-center`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Los dashboards guardados almacenan tu configuración de filtros y visibilidad de gráficos
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardManagerModal;