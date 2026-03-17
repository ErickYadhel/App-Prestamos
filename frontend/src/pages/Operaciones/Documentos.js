import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  DocumentTextIcon,
  FolderIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  ShieldCheckIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  ArchiveBoxIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
  DocumentIcon,
  TableCellsIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

// ============================================
// MODAL PRINCIPAL PARA DOCUMENTOS
// ============================================
const DocumentoModal = ({ isOpen, onClose, titulo, children }) => {
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-purple-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-purple-600/20' : 'border-gray-200'} flex justify-between items-center`}>
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
// MODAL PARA CREAR/EDITAR DOCUMENTO
// ============================================
const DocumentoEditorModal = ({ isOpen, onClose, documento, onSave, tipo }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: tipo || 'contrato',
    categoria: 'contratos',
    descripcion: '',
    cliente: '',
    archivo: '',
    tamano: '',
    formato: '',
    etiquetas: [],
    estado: 'activo',
    fechaCreacion: new Date().toISOString(),
    ...documento
  });

  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [etiquetaInput, setEtiquetaInput] = useState('');

  useEffect(() => {
    if (documento) {
      setFormData(documento);
    }
  }, [documento]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre del documento es requerido';
    }
    if (!formData.cliente?.trim()) {
      newErrors.cliente = 'El cliente es requerido';
    }
    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
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
      console.error('Error guardando documento:', error);
    } finally {
      setGuardando(false);
    }
  };

  const agregarEtiqueta = () => {
    if (etiquetaInput.trim() && !formData.etiquetas.includes(etiquetaInput.trim())) {
      setFormData({
        ...formData,
        etiquetas: [...formData.etiquetas, etiquetaInput.trim()]
      });
      setEtiquetaInput('');
    }
  };

  const eliminarEtiqueta = (etiqueta) => {
    setFormData({
      ...formData,
      etiquetas: formData.etiquetas.filter(e => e !== etiqueta)
    });
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-purple-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-purple-600/20' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {documento ? 'Editar Documento' : 'Nuevo Documento'}
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
                {/* Información básica */}
                <div className="space-y-4">
                  <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Información del Documento
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nombre del Documento *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.nombre ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                        placeholder="Ej: Contrato de préstamo"
                      />
                      {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Categoría
                      </label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                      >
                        <option value="contratos">Contratos</option>
                        <option value="documentos_cliente">Documentos de Clientes</option>
                        <option value="expedientes">Expedientes</option>
                        <option value="garantias">Garantías</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Cliente *
                      </label>
                      <input
                        type="text"
                        value={formData.cliente}
                        onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.cliente ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                        placeholder="Nombre del cliente"
                      />
                      {errors.cliente && <p className="text-red-500 text-xs mt-1">{errors.cliente}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Descripción *
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows="3"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          errors.descripcion ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none`}
                        placeholder="Descripción del documento"
                      />
                      {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
                    </div>
                  </div>
                </div>

                {/* Detalles del archivo */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Detalles del Archivo
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        URL del Archivo
                      </label>
                      <input
                        type="text"
                        value={formData.archivo}
                        onChange={(e) => setFormData({ ...formData, archivo: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                        placeholder="https://ejemplo.com/doc.pdf"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tamaño
                      </label>
                      <input
                        type="text"
                        value={formData.tamano}
                        onChange={(e) => setFormData({ ...formData, tamano: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                        placeholder="2.5 MB"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Formato
                      </label>
                      <select
                        value={formData.formato}
                        onChange={(e) => setFormData({ ...formData, formato: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                        } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                      >
                        <option value="">Seleccionar</option>
                        <option value="PDF">PDF</option>
                        <option value="DOC">DOC</option>
                        <option value="DOCX">DOCX</option>
                        <option value="XLS">XLS</option>
                        <option value="XLSX">XLSX</option>
                        <option value="JPG">JPG</option>
                        <option value="PNG">PNG</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Etiquetas */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Etiquetas
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.etiquetas.map((etiqueta, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm"
                      >
                        {etiqueta}
                        <button
                          onClick={() => eliminarEtiqueta(etiqueta)}
                          className="ml-1 hover:text-purple-900 dark:hover:text-purple-200"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={etiquetaInput}
                      onChange={(e) => setEtiquetaInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && agregarEtiqueta()}
                      className={`flex-1 px-3 py-2 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'
                      } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                      placeholder="Agregar etiqueta..."
                    />
                    <button
                      onClick={agregarEtiqueta}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Estado */}
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
                      } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
                    >
                      <option value="activo">Activo</option>
                      <option value="archivado">Archivado</option>
                      <option value="eliminado">Eliminado</option>
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
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>{documento ? 'Actualizar' : 'Guardar'}</span>
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
// MODAL PARA VER DETALLE DE DOCUMENTO
// ============================================
const DetalleDocumentoModal = ({ isOpen, onClose, documento }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getIconoPorFormato = (formato) => {
    switch(formato?.toLowerCase()) {
      case 'pdf': return DocumentTextIcon;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return PhotoIcon;
      case 'mp3':
      case 'wav': return MusicalNoteIcon;
      case 'mp4':
      case 'avi': return VideoCameraIcon;
      case 'zip':
      case 'rar': return ArchiveBoxIcon;
      default: return DocumentIcon;
    }
  };

  const Icono = getIconoPorFormato(documento?.formato);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-purple-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-purple-600/20' : 'border-gray-200'} flex justify-between items-center`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {documento?.nombre}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    ID: {documento?.id?.slice(0, 8)}...
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

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Icono y tipo */}
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <Icono className="h-12 w-12 text-purple-600" />
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tipo de documento</p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {documento?.categoria === 'contratos' ? 'Contrato' :
                       documento?.categoria === 'documentos_cliente' ? 'Documento de Cliente' :
                       documento?.categoria === 'expedientes' ? 'Expediente' :
                       documento?.categoria === 'garantias' ? 'Garantía' : 'Documento'}
                    </p>
                  </div>
                </div>

                {/* Información del documento */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-purple-600/20`}>
                  <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Información del Documento
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cliente</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{documento?.cliente}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Fecha de creación</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatearFecha(documento?.fechaCreacion)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Descripción</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{documento?.descripcion}</p>
                    </div>
                  </div>
                </div>

                {/* Detalles del archivo */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-purple-600/20`}>
                  <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Detalles del Archivo
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Formato</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{documento?.formato || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tamaño</p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{documento?.tamano || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Estado</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        documento?.estado === 'activo' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : documento?.estado === 'archivado'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {documento?.estado?.charAt(0).toUpperCase() + documento?.estado?.slice(1)}
                      </span>
                    </div>
                  </div>

                  {documento?.archivo && (
                    <div className="mt-4">
                      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>URL del archivo</p>
                      <a
                        href={documento.archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 break-all"
                      >
                        {documento.archivo}
                      </a>
                    </div>
                  )}
                </div>

                {/* Etiquetas */}
                {documento?.etiquetas?.length > 0 && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-purple-600/20`}>
                    <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Etiquetas
                    </h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {documento.etiquetas.map((etiqueta, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm"
                        >
                          {etiqueta}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
              {documento?.archivo && (
                <a
                  href={documento.archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Ver archivo</span>
                </a>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
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
// TARJETA DE DOCUMENTO
// ============================================
const DocumentoCard = ({ documento, onVer, onEditar, onEliminar }) => {
  const { theme } = useTheme();

  const getIconoPorCategoria = (categoria) => {
    switch(categoria) {
      case 'contratos': return DocumentTextIcon;
      case 'documentos_cliente': return FolderIcon;
      case 'expedientes': return FolderOpenIcon;
      case 'garantias': return ShieldCheckIcon;
      default: return DocumentIcon;
    }
  };

  const Icono = getIconoPorCategoria(documento.categoria);
  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border ${
        theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-700" />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg">
            <Icono className="h-5 w-5 text-white" />
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            documento.estado === 'activo'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {documento.estado}
          </span>
        </div>

        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {documento.nombre}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {documento.cliente}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {formatearFecha(documento.fechaCreacion)}
        </p>

        {documento.etiquetas?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {documento.etiquetas.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {documento.etiquetas.length > 2 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{documento.etiquetas.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => onVer(documento)}
            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
            title="Ver detalles"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEditar(documento)}
            className="p-1 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded transition-colors"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEliminar(documento.id)}
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
const Documentos = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [modalAbierto, setModalAbierto] = useState(null);
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Cargar documentos desde Firebase
  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const documentosRef = collection(db, 'documentos');
      const q = query(documentosRef, orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const documentosList = [];
      querySnapshot.forEach((doc) => {
        documentosList.push({ id: doc.id, ...doc.data() });
      });

      setDocumentos(documentosList);
    } catch (error) {
      console.error('Error cargando documentos:', error);
      setError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, []);

  // Guardar documento
  const guardarDocumento = async (formData) => {
    try {
      if (formData.id) {
        // Actualizar
        const documentoRef = doc(db, 'documentos', formData.id);
        await updateDoc(documentoRef, {
          ...formData,
          fechaActualizacion: new Date().toISOString(),
          actualizadoPor: user?.email
        });
        setExito('Documento actualizado exitosamente');
      } else {
        // Crear nuevo
        const documentosRef = collection(db, 'documentos');
        await addDoc(documentosRef, {
          ...formData,
          fechaCreacion: new Date().toISOString(),
          creadoPor: user?.email
        });
        setExito('Documento creado exitosamente');
      }
      
      setTimeout(() => setExito(''), 3000);
      await cargarDocumentos();
    } catch (error) {
      console.error('Error guardando documento:', error);
      setError('Error al guardar el documento');
      throw error;
    }
  };

  // Eliminar documento
  const eliminarDocumento = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      await deleteDoc(doc(db, 'documentos', id));
      setExito('Documento eliminado exitosamente');
      setTimeout(() => setExito(''), 3000);
      await cargarDocumentos();
    } catch (error) {
      console.error('Error eliminando documento:', error);
      setError('Error al eliminar el documento');
    }
  };

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    if (filtroCategoria !== 'todos' && doc.categoria !== filtroCategoria) return false;
    if (filtroEstado !== 'todos' && doc.estado !== filtroEstado) return false;
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      return (
        doc.nombre?.toLowerCase().includes(busquedaLower) ||
        doc.cliente?.toLowerCase().includes(busquedaLower) ||
        doc.descripcion?.toLowerCase().includes(busquedaLower) ||
        doc.etiquetas?.some(tag => tag.toLowerCase().includes(busquedaLower))
      );
    }
    return true;
  });

  const categorias = [
    { id: 'contratos', nombre: 'Contratos', icon: DocumentTextIcon, count: documentos.filter(d => d.categoria === 'contratos').length },
    { id: 'documentos_cliente', nombre: 'Documentos de Clientes', icon: FolderIcon, count: documentos.filter(d => d.categoria === 'documentos_cliente').length },
    { id: 'expedientes', nombre: 'Expedientes', icon: FolderOpenIcon, count: documentos.filter(d => d.categoria === 'expedientes').length },
    { id: 'garantias', nombre: 'Garantías', icon: ShieldCheckIcon, count: documentos.filter(d => d.categoria === 'garantias').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg">
            <DocumentTextIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Gestión Documental
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Administra todos los documentos del sistema
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setDocumentoSeleccionado(null);
            setEditorAbierto(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nuevo Documento</span>
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

      {/* Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categorias.map((categoria) => {
          const Icon = categoria.icon;
          return (
            <motion.div
              key={categoria.id}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
              } shadow-lg cursor-pointer`}
              onClick={() => setFiltroCategoria(categoria.id)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-lg font-bold ${
                    filtroCategoria === categoria.id ? 'text-purple-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {categoria.count}
                  </span>
                </div>
                <h4 className={`mt-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {categoria.nombre}
                </h4>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cliente o etiqueta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
            />
          </div>
        </div>

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
        >
          <option value="todos">Todas las categorías</option>
          <option value="contratos">Contratos</option>
          <option value="documentos_cliente">Documentos de Clientes</option>
          <option value="expedientes">Expedientes</option>
          <option value="garantias">Garantías</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
          } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all`}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="archivado">Archivado</option>
        </select>

        <button
          onClick={cargarDocumentos}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Actualizar"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid de documentos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : documentosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay documentos para mostrar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentosFiltrados.map((documento) => (
            <DocumentoCard
              key={documento.id}
              documento={documento}
              onVer={(doc) => {
                setDocumentoSeleccionado(doc);
                setDetalleAbierto(true);
              }}
              onEditar={(doc) => {
                setDocumentoSeleccionado(doc);
                setEditorAbierto(true);
              }}
              onEliminar={eliminarDocumento}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <DocumentoEditorModal
        isOpen={editorAbierto}
        onClose={() => {
          setEditorAbierto(false);
          setDocumentoSeleccionado(null);
        }}
        documento={documentoSeleccionado}
        onSave={guardarDocumento}
      />

      <DetalleDocumentoModal
        isOpen={detalleAbierto}
        onClose={() => {
          setDetalleAbierto(false);
          setDocumentoSeleccionado(null);
        }}
        documento={documentoSeleccionado}
      />
    </div>
  );
};

export default Documentos;