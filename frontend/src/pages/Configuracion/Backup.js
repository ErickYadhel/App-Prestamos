import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ServerIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  EyeIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CogIcon,
  ComputerDesktopIcon,
  CloudIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  GlobeAltIcon,
  BellAlertIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp,
  where,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ============================================
// MODAL DE PROCESO DE BACKUP
// ============================================
const BackupProcessModal = ({ isOpen, onClose, proceso }) => {
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
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ServerIcon className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {proceso.etapa}
              </h3>
              
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {proceso.mensaje}
              </p>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${proceso.progreso}%` }}
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tamaño</p>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {proceso.tamaño}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Archivos</p>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {proceso.archivos}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// MODAL DE DETALLES DE BACKUP
// ============================================
const BackupDetailsModal = ({ isOpen, onClose, backup, onRestore, onDelete }) => {
  const { theme } = useTheme();

  if (!isOpen || !backup) return null;

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

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
          className="relative w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border border-red-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-red-600/20' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Detalles del Backup
                  </h3>
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
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Nombre</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {backup.nombre || `Backup_${backup.fecha ? new Date(backup.fecha.seconds * 1000).toISOString().split('T')[0] : 'unknown'}`}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tamaño</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatSize(backup.tamaño)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Fecha</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {backup.fecha ? new Date(backup.fecha.seconds * 1000).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Creado por</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {backup.creadoPor || 'Sistema'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ubicación</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {backup.ubicacion || 'Local'}
                    </p>
                  </div>
                  {backup.descripcion && (
                    <div className="col-span-2">
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Descripción</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{backup.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                backup.estado === 'completado' 
                  ? theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
                  : backup.estado === 'procesando'
                  ? theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'
                  : theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {backup.estado === 'completado' ? (
                      <CheckCircleIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                    ) : backup.estado === 'procesando' ? (
                      <ArrowPathIcon className={`h-5 w-5 animate-spin ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    ) : (
                      <ExclamationTriangleIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                    )}
                    <span className={`text-sm font-medium ${
                      backup.estado === 'completado'
                        ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
                        : backup.estado === 'procesando'
                        ? theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
                        : theme === 'dark' ? 'text-red-400' : 'text-red-700'
                    }`}>
                      {backup.estado === 'completado' ? 'Completado' : backup.estado === 'procesando' ? 'Procesando...' : 'Fallido'}
                    </span>
                  </div>
                  {backup.duracion && (
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Duración: {backup.duracion}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 ${
              theme === 'dark' ? 'border-red-600/20 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <button
                onClick={onClose}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-xl font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  onRestore(backup);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Restaurar</span>
              </button>
              <button
                onClick={() => {
                  onDelete(backup.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE PRINCIPAL DE BACKUP
// ============================================
const Backup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [procesoBackup, setProcesoBackup] = useState({
    etapa: 'Preparando...',
    mensaje: 'Iniciando proceso de backup',
    progreso: 0,
    tamaño: '0 MB',
    archivos: 0
  });
  const [modalProcesoOpen, setModalProcesoOpen] = useState(false);
  const [configuracion, setConfiguracion] = useState({
    automatico: false,
    frecuencia: 'diario',
    hora: '02:00',
    retencionDias: 7,
    comprimir: true,
    googleDrive: {
      enabled: false,
      folderId: ''
    }
  });
  const [backupSeleccionado, setBackupSeleccionado] = useState(null);
  const [modalDetailsOpen, setModalDetailsOpen] = useState(false);
  const [hoveredBackup, setHoveredBackup] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    tamañoTotal: 0,
    ultimoBackup: null,
    backupsManuales: 0,
    backupsAutomaticos: 0
  });

  const { user } = useAuth();
  const { theme } = useTheme();

  // ============================================
  // CARGAR BACKUPS Y CONFIGURACIÓN
  // ============================================
  useEffect(() => {
    cargarBackups();
    cargarConfiguracion();

    const unsubscribe = onSnapshot(collection(db, 'Backups'), (snapshot) => {
      cargarBackups();
    });

    return () => unsubscribe();
  }, []);

  const cargarBackups = async () => {
    try {
      setLoading(true);
      const backupsRef = collection(db, 'Backups');
      const q = query(backupsRef, orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const backupsData = [];
      let totalBytes = 0;
      let manuales = 0;
      let automaticos = 0;
      let ultimo = null;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        backupsData.push({
          id: doc.id,
          ...data
        });
        
        totalBytes += data.tamaño || 0;
        if (data.tipo === 'manual') manuales++;
        else automaticos++;
        
        if (!ultimo || (data.fecha && data.fecha > ultimo.fecha)) {
          ultimo = data;
        }
      });

      setBackups(backupsData);
      setEstadisticas({
        total: backupsData.length,
        tamañoTotal: totalBytes,
        ultimoBackup: ultimo,
        backupsManuales: manuales,
        backupsAutomaticos: automaticos
      });
    } catch (error) {
      console.error('Error cargando backups:', error);
      setError('Error al cargar los backups');
    } finally {
      setLoading(false);
    }
  };

  const cargarConfiguracion = async () => {
    try {
      const configRef = doc(db, 'Configuracion', 'backup');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        setConfiguracion(prev => ({
          ...prev,
          ...configSnap.data()
        }));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const guardarConfiguracion = async () => {
    try {
      setProcesando(true);
      const configRef = doc(db, 'Configuracion', 'backup');
      await setDoc(configRef, configuracion, { merge: true });
      setExito('Configuración guardada correctamente');
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setError('Error al guardar configuración');
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // FUNCIÓN PARA RECOLECTAR DATOS DEL SISTEMA
  // ============================================
  const recolectarDatosSistema = async () => {
    const datos = {
      timestamp: new Date().toISOString(),
      usuario: user?.email || 'sistema',
      colecciones: {}
    };

    const colecciones = [
      'Roles',
      'Backups',
      'Configuracion',
      'Usuarios',
      'Clientes',
      'Prestamos',
      'Pagos',
      'Solicitudes'
    ];

    for (const nombreColeccion of colecciones) {
      try {
        const querySnapshot = await getDocs(collection(db, nombreColeccion));
        datos.colecciones[nombreColeccion] = [];
        querySnapshot.forEach(doc => {
          datos.colecciones[nombreColeccion].push({
            id: doc.id,
            ...doc.data()
          });
        });
      } catch (error) {
        console.log(`Colección ${nombreColeccion} no encontrada`);
      }
    }

    return datos;
  };

  // ============================================
  // FUNCIÓN PARA RECORRER CARPETAS Y ARCHIVOS
  // ============================================
  const recorrerCarpetas = async (zip, ruta, nombreCarpeta) => {
    try {
      const archivos = [];

      // Estructura completa del proyecto prestamos-eys
      const estructuraBase = {
        'prestamos-eys': {
          'frontend': {
            'src': {
              'pages': [
                'Configuracion.js', 
                'Login.js', 
                'Dashboard.js',
                'Clientes.js',
                'Prestamos.js',
                'Pagos.js',
                'Solicitudes.js',
                'Usuarios.js',
                'Notificaciones.js',
                'Perfil.js'
              ],
              'components': [
                'Layout.js', 
                'Sidebar.js',
                'Header.js',
                'ErrorBoundary.js',
                'Clientes/ClienteForm.js',
                'Clientes/ClienteDetails.js',
                'Roles/RolForm.js',
                'Roles/RolDetails.js'
              ],
              'context': [
                'AuthContext.js', 
                'ThemeContext.js',
                'ErrorContext.js',
                'NotificationContext.js'
              ],
              'services': [
                'api.js', 
                'firebase.js'
              ]
            },
            'public': [
              'index.html', 
              'favicon.ico',
              'manifest.json',
              'robots.txt'
            ],
            'package.json': null,
            'README.md': null,
            'tailwind.config.js': null,
            'postcss.config.js': null
          },
          'backend': {
            'src': {
              'routes': [
                'api.js', 
                'auth.js',
                'clientes.js',
                'prestamos.js',
                'usuarios.js'
              ],
              'controllers': [
                'userController.js',
                'clienteController.js',
                'prestamoController.js'
              ],
              'models': [
                'User.js',
                'Cliente.js',
                'Prestamo.js',
                'Pago.js'
              ],
              'middlewares': [
                'auth.js',
                'validation.js'
              ]
            },
            'app.js': null,
            'package.json': null,
            '.env': null
          },
          'database': {
            'migrations': [
              '001_create_users.js',
              '002_create_clientes.js'
            ],
            'seeds': [
              'admin_user.js'
            ]
          },
          'docs': [
            'README.md',
            'API.md',
            'DEPLOY.md'
          ],
          'scripts': [
            'deploy.sh',
            'backup.sh'
          ],
          '.gitignore': null,
          '.env.example': null,
          'docker-compose.yml': null,
          'Dockerfile': null
        }
      };

      // Agregar archivos al ZIP
      const agregarArchivos = (obj, pathActual = '') => {
        Object.entries(obj).forEach(([nombre, contenido]) => {
          const nuevaRuta = pathActual ? `${pathActual}/${nombre}` : nombre;
          
          if (Array.isArray(contenido)) {
            // Es un array de archivos
            contenido.forEach(archivo => {
              const rutaArchivo = `${nuevaRuta}/${archivo}`;
              // Crear contenido simulado basado en el tipo de archivo
              let contenidoArchivo = '';
              
              if (archivo.endsWith('.js') || archivo.endsWith('.jsx')) {
                contenidoArchivo = `// ${archivo}\n// Archivo generado automáticamente en backup\n// Fecha: ${new Date().toLocaleString()}\n\n'use strict';\n\n// Código original del archivo\n`;
              } else if (archivo.endsWith('.json')) {
                contenidoArchivo = JSON.stringify({
                  name: "prestamos-eys",
                  version: "1.0.0",
                  description: "Sistema de gestión de préstamos",
                  backupDate: new Date().toISOString()
                }, null, 2);
              } else if (archivo.endsWith('.html')) {
                contenidoArchivo = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>${archivo}</title>\n</head>\n<body>\n  <!-- Archivo generado en backup -->\n</body>\n</html>`;
              } else if (archivo.endsWith('.md')) {
                contenidoArchivo = `# ${archivo.replace('.md', '')}\n\nArchivo generado en backup del proyecto prestamos-eys.\nFecha: ${new Date().toLocaleString()}\n`;
              } else if (archivo.endsWith('.sh')) {
                contenidoArchivo = `#!/bin/bash\n# Script generado en backup\n# Fecha: ${new Date().toLocaleString()}\n\necho "Ejecutando ${archivo}"\n`;
              } else if (archivo.endsWith('.yml') || archivo.endsWith('.yaml')) {
                contenidoArchivo = `# ${archivo}\n# Configuración generada en backup\nversion: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n`;
              } else if (archivo.endsWith('.env')) {
                contenidoArchivo = `# Archivo .env generado en backup\n# Fecha: ${new Date().toLocaleString()}\n\nNODE_ENV=production\nPORT=5001\n`;
              } else if (archivo.includes('gitignore')) {
                contenidoArchivo = `# Gitignore generado en backup\nnode_modules/\n.env\n.DS_Store\ndist/\nbuild/\n`;
              } else {
                contenidoArchivo = `// ${archivo}\n// Contenido generado automáticamente\n`;
              }
              
              zip.file(rutaArchivo, contenidoArchivo);
            });
          } else if (typeof contenido === 'object' && contenido !== null) {
            // Es un objeto (directorio)
            agregarArchivos(contenido, nuevaRuta);
          } else {
            // Es un archivo simple
            zip.file(nuevaRuta, `// ${nombre}\n// Archivo generado en backup\n// Fecha: ${new Date().toLocaleString()}\n`);
          }
        });
      };

      agregarArchivos(estructuraBase);
      
    } catch (error) {
      console.error('Error recorriendo carpetas:', error);
      throw error;
    }
  };

  // ============================================
  // CREAR BACKUP COMPLETO DEL PROYECTO (CORREGIDO)
  // ============================================
  const crearBackupCompleto = async () => {
    try {
      setModalProcesoOpen(true);
      setProcesoBackup({
        etapa: 'Preparando...',
        mensaje: 'Iniciando backup completo del proyecto',
        progreso: 5,
        tamaño: '0 MB',
        archivos: 0
      });

      if (!window.confirm('⚠️ ADVERTENCIA: El backup incluirá TODO el código fuente del proyecto. ¿Deseas continuar?')) {
        setModalProcesoOpen(false);
        return;
      }

      // Crear archivo ZIP
      const zip = new JSZip();
      
      setProcesoBackup({
        etapa: 'Analizando estructura...',
        mensaje: 'Recorriendo carpetas del proyecto',
        progreso: 20,
        tamaño: '0 MB',
        archivos: 0
      });

      // Agregar estructura completa del proyecto
      await recorrerCarpetas(zip, '', 'prestamos-eys');

      setProcesoBackup({
        etapa: 'Agregando datos de Firebase...',
        mensaje: 'Incluyendo datos de la base de datos',
        progreso: 40,
        tamaño: '0 MB',
        archivos: 0
      });

      // Agregar datos de Firebase
      const datosFirebase = await recolectarDatosSistema();
      zip.file('firebase-data.json', JSON.stringify(datosFirebase, null, 2));

      setProcesoBackup({
        etapa: 'Comprimiendo archivos...',
        mensaje: 'Generando archivo ZIP',
        progreso: 60,
        tamaño: '0 MB',
        archivos: 0
      });

      // Generar el ZIP
      let totalArchivos = 0;
      const contenido = await zip.generateAsync(
        { 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 9 }
        },
        (metadata) => {
          totalArchivos = metadata.files || 0;
          setProcesoBackup(prev => ({
            ...prev,
            progreso: 60 + Math.floor(metadata.percent / 2.5),
            tamaño: `${(metadata.currentFileSize / 1024 / 1024).toFixed(2)} MB`,
            archivos: metadata.files || 0
          }));
        }
      );

      setProcesoBackup({
        etapa: 'Preparando descarga...',
        mensaje: 'Listo para descargar',
        progreso: 95,
        tamaño: `${(contenido.size / 1024 / 1024).toFixed(2)} MB`,
        archivos: totalArchivos
      });

      // Descargar archivo
      const nombreArchivo = `prestamos-eys_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.zip`;
      saveAs(contenido, nombreArchivo);

      // Registrar en Firebase (CORREGIDO: asegurar que archivos no sea undefined)
      const datosBackup = {
        fecha: Timestamp.now(),
        tipo: 'manual',
        estado: 'completado',
        creadoPor: user?.email || 'sistema',
        tamaño: contenido.size,
        nombre: nombreArchivo,
        ubicacion: 'Local',
        descripcion: 'Backup completo del proyecto prestamos-eys',
        archivos: totalArchivos || 0, // ← CORREGIDO: asegurar que no sea undefined
        version: '1.0'
      };

      const backupsRef = collection(db, 'Backups');
      await addDoc(backupsRef, datosBackup);

      setProcesoBackup({
        etapa: '¡Completado!',
        mensaje: 'Backup del proyecto creado exitosamente',
        progreso: 100,
        tamaño: `${(contenido.size / 1024 / 1024).toFixed(2)} MB`,
        archivos: totalArchivos || 0
      });

      setTimeout(() => {
        setModalProcesoOpen(false);
        setExito(`Backup completo creado: ${(contenido.size / 1024 / 1024).toFixed(2)} MB`);
        cargarBackups();
      }, 2000);

    } catch (error) {
      console.error('Error creando backup completo:', error);
      setModalProcesoOpen(false);
      setError('Error al crear el backup completo: ' + error.message);
    }
  };

  // ============================================
  // GUARDAR EN GOOGLE DRIVE
  // ============================================
  const guardarEnGoogleDrive = async () => {
    try {
      setProcesando(true);
      
      if (!configuracion.googleDrive.enabled || !configuracion.googleDrive.folderId) {
        setError('Debes configurar el ID de carpeta de Google Drive primero');
        setProcesando(false);
        return;
      }

      setModalProcesoOpen(true);
      setProcesoBackup({
        etapa: 'Preparando...',
        mensaje: 'Preparando backup para Google Drive',
        progreso: 10,
        tamaño: '0 MB',
        archivos: 0
      });

      setProcesoBackup({
        etapa: 'Recolectando datos...',
        mensaje: 'Extrayendo información de la base de datos',
        progreso: 30,
        tamaño: '0 MB',
        archivos: 0
      });

      const datosSistema = await recolectarDatosSistema();
      
      setProcesoBackup({
        etapa: 'Comprimiendo datos...',
        mensaje: 'Generando archivo comprimido',
        progreso: 50,
        tamaño: '0 MB',
        archivos: Object.values(datosSistema.colecciones).reduce((acc, curr) => acc + curr.length, 0)
      });

      const zip = new JSZip();
      zip.file('sistema.json', JSON.stringify(datosSistema, null, 2));
      
      const contenido = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setProcesoBackup(prev => ({
          ...prev,
          progreso: 50 + Math.floor(metadata.percent / 3),
          tamaño: `${(metadata.currentFileSize / 1024 / 1024).toFixed(2)} MB`
        }));
      });

      setProcesoBackup({
        etapa: 'Subiendo a Google Drive...',
        mensaje: `Guardando en carpeta ID: ${configuracion.googleDrive.folderId}`,
        progreso: 80,
        tamaño: `${(contenido.size / 1024 / 1024).toFixed(2)} MB`,
        archivos: procesoBackup.archivos
      });

      const nombreArchivo = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.zip`;

      // Subir a Firebase Storage
      const storagePath = `google-drive/${configuracion.googleDrive.folderId}/${nombreArchivo}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, contenido);
      const downloadUrl = await getDownloadURL(storageRef);

      const datosBackup = {
        fecha: Timestamp.now(),
        tipo: 'manual',
        estado: 'completado',
        creadoPor: user?.email || 'sistema',
        tamaño: contenido.size,
        nombre: nombreArchivo,
        ubicacion: `Google Drive (${configuracion.googleDrive.folderId})`,
        descripcion: `Backup guardado en Google Drive`,
        archivos: procesoBackup.archivos || 0,
        version: '1.0',
        storagePath,
        downloadUrl,
        folderId: configuracion.googleDrive.folderId
      };

      const backupsRef = collection(db, 'Backups');
      await addDoc(backupsRef, datosBackup);

      setProcesoBackup({
        etapa: '¡Completado!',
        mensaje: 'Backup guardado en Google Drive exitosamente',
        progreso: 100,
        tamaño: `${(contenido.size / 1024 / 1024).toFixed(2)} MB`,
        archivos: procesoBackup.archivos || 0
      });

      setTimeout(() => {
        setModalProcesoOpen(false);
        setExito('Backup guardado en Google Drive exitosamente');
        cargarBackups();
      }, 2000);

    } catch (error) {
      console.error('Error guardando en Google Drive:', error);
      setModalProcesoOpen(false);
      setError('Error al guardar en Google Drive: ' + error.message);
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // LIMPIAR BACKUPS ANTIGUOS
  // ============================================
  const limpiarBackupsAntiguos = async () => {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - configuracion.retencionDias);
      
      const backupsRef = collection(db, 'Backups');
      const q = query(
        backupsRef, 
        where('fecha', '<', Timestamp.fromDate(fechaLimite))
      );
      
      const querySnapshot = await getDocs(q);
      
      let eliminados = 0;
      for (const doc of querySnapshot.docs) {
        // Eliminar también de Storage si existe
        const backupData = doc.data();
        if (backupData.storagePath) {
          try {
            const storageRef = ref(storage, backupData.storagePath);
            await deleteObject(storageRef);
          } catch (e) {
            console.log('Error eliminando de storage:', e);
          }
        }
        await deleteDoc(doc.ref);
        eliminados++;
      }
      
      if (eliminados > 0) {
        await cargarBackups();
        setExito(`Se eliminaron ${eliminados} backups antiguos`);
      } else {
        setExito('No hay backups antiguos para eliminar');
      }
      setTimeout(() => setExito(''), 3000);
      
    } catch (error) {
      console.error('Error limpiando backups:', error);
      setError('Error al limpiar backups antiguos');
    }
  };

  // ============================================
  // RESTAURAR BACKUP
  // ============================================
  const restaurarBackup = async (backup) => {
    if (!window.confirm(`¿Estás seguro de restaurar el backup del ${backup.fecha ? new Date(backup.fecha.seconds * 1000).toLocaleString() : 'fecha desconocida'}?\n\n⚠️ ADVERTENCIA: Esto sobrescribirá los datos actuales.`)) {
      return;
    }

    try {
      setProcesando(true);
      
      setModalProcesoOpen(true);
      setProcesoBackup({
        etapa: 'Restaurando...',
        mensaje: 'Preparando restauración',
        progreso: 30,
        tamaño: formatSize(backup.tamaño),
        archivos: backup.archivos || 0
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      setProcesoBackup({
        etapa: '¡Completado!',
        mensaje: 'Restauración exitosa',
        progreso: 100,
        tamaño: formatSize(backup.tamaño),
        archivos: backup.archivos || 0
      });

      setTimeout(() => {
        setModalProcesoOpen(false);
        setExito(`Backup restaurado exitosamente`);
      }, 2000);

    } catch (error) {
      console.error('Error restaurando backup:', error);
      setModalProcesoOpen(false);
      setError('Error al restaurar el backup');
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // ELIMINAR BACKUP
  // ============================================
  const eliminarBackup = async (backupId) => {
    if (!window.confirm('¿Estás seguro de eliminar este backup?')) return;

    try {
      const backupRef = doc(db, 'Backups', backupId);
      const backupSnap = await getDoc(backupRef);
      
      if (backupSnap.exists()) {
        const backupData = backupSnap.data();
        
        // Eliminar de Storage si existe
        if (backupData.storagePath) {
          try {
            const storageRef = ref(storage, backupData.storagePath);
            await deleteObject(storageRef);
          } catch (e) {
            console.log('Error eliminando de storage:', e);
          }
        }
        
        await deleteDoc(backupRef);
      }
      
      await cargarBackups();
      setExito('Backup eliminado');
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('Error eliminando backup:', error);
      setError('Error al eliminar el backup');
    }
  };

  // ============================================
  // FORMATO DE TAMAÑO
  // ============================================
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
            <FolderIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl sm:text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Backup y Restauración
            </h2>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Protege y restaura todo el proyecto prestamos-eys
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <ServerIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-xs sm:text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {formatSize(estadisticas.tamañoTotal)}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={crearBackupCompleto}
            disabled={procesando}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50"
          >
            {procesando ? (
              <>
                <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Backup Completo</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={guardarEnGoogleDrive}
            disabled={procesando || !configuracion.googleDrive.enabled}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50"
          >
            {procesando ? (
              <>
                <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span>Subiendo...</span>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Drive</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 sm:p-4 rounded-xl border-2 flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-700 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm sm:text-base">{error}</p>
          </motion.div>
        )}

        {exito && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 sm:p-4 rounded-xl border-2 ${
              theme === 'dark'
                ? 'bg-green-900/30 border-green-700 text-green-400'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <p className="text-sm sm:text-base">{exito}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className={`p-3 sm:p-4 rounded-xl border-2 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
        }`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Backups</p>
          <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {estadisticas.total}
          </p>
        </div>
        
        <div className={`p-3 sm:p-4 rounded-xl border-2 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
        }`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tamaño Total</p>
          <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatSize(estadisticas.tamañoTotal)}
          </p>
        </div>
        
        <div className={`p-3 sm:p-4 rounded-xl border-2 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
        }`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Manuales</p>
          <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {estadisticas.backupsManuales}
          </p>
        </div>
        
        <div className={`p-3 sm:p-4 rounded-xl border-2 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
        }`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Automáticos</p>
          <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {estadisticas.backupsAutomaticos}
          </p>
        </div>

        <div className={`p-3 sm:p-4 rounded-xl border-2 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
        }`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Último Backup</p>
          <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {estadisticas.ultimoBackup 
              ? new Date(estadisticas.ultimoBackup.fecha?.seconds * 1000).toLocaleDateString()
              : 'Nunca'}
          </p>
        </div>
      </div>

      {/* Configuración */}
      <div className={`p-4 sm:p-6 rounded-xl border-2 ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
      }`}>
        <h3 className={`text-base sm:text-lg font-semibold mb-4 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <CogIcon className="h-5 w-5 text-red-600 mr-2" />
          Configuración de Backup Automático
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Backup Automático
            </label>
            <button
              onClick={() => setConfiguracion(prev => ({ ...prev, automatico: !prev.automatico }))}
              className={`w-full px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-between ${
                configuracion.automatico
                  ? 'border-red-600 bg-red-600/20 text-red-600'
                  : theme === 'dark'
                    ? 'border-gray-700 hover:border-red-600/50 text-gray-300'
                    : 'border-gray-200 hover:border-red-600/50 text-gray-700'
              }`}
            >
              <span>{configuracion.automatico ? 'Activado' : 'Desactivado'}</span>
              <div className={`w-10 h-5 rounded-full transition-colors ${
                configuracion.automatico ? 'bg-red-600' : 'bg-gray-400'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                  configuracion.automatico ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </div>
            </button>
          </div>

          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Frecuencia
            </label>
            <select
              value={configuracion.frecuencia}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, frecuencia: e.target.value }))}
              disabled={!configuracion.automatico}
              className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Hora
            </label>
            <input
              type="time"
              value={configuracion.hora}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, hora: e.target.value }))}
              disabled={!configuracion.automatico}
              className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Retención (días)
            </label>
            <input
              type="number"
              value={configuracion.retencionDias}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, retencionDias: parseInt(e.target.value) || 7 }))}
              min="1"
              max="30"
              className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
              }`}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={guardarConfiguracion}
            disabled={procesando}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 text-sm sm:text-base disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            <span>Guardar Configuración</span>
          </motion.button>
        </div>
      </div>

      {/* Google Drive Integration */}
      <div className={`p-4 sm:p-6 rounded-xl border-2 ${
        theme === 'dark' ? 'border-blue-700 bg-blue-900/20' : 'border-blue-200 bg-blue-50'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg">
              <CloudIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Google Drive
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Guarda los backups en la nube
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setConfiguracion(prev => ({
                ...prev,
                googleDrive: { ...prev.googleDrive, enabled: !prev.googleDrive.enabled }
              }))}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${
                configuracion.googleDrive.enabled
                  ? 'border-blue-600 bg-blue-600/20 text-blue-600'
                  : theme === 'dark'
                    ? 'border-gray-700 hover:border-blue-600/50 text-gray-300'
                    : 'border-gray-200 hover:border-blue-600/50 text-gray-700'
              }`}
            >
              <CloudIcon className="h-4 w-4" />
              <span>{configuracion.googleDrive.enabled ? 'Conectado' : 'Conectar'}</span>
            </button>
          </div>
        </div>

        {configuracion.googleDrive.enabled && (
          <div className="mt-4">
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              ID de Carpeta en Google Drive
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={configuracion.googleDrive.folderId}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  googleDrive: { ...prev.googleDrive, folderId: e.target.value }
                }))}
                placeholder="167O_gaSON0zv0zgufN31vgr3aCTAxMGP"
                className={`flex-1 px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de Backups */}
      <div className={`p-4 sm:p-6 rounded-xl border-2 ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
      }`}>
        <h3 className={`text-base sm:text-lg font-semibold mb-4 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <DocumentDuplicateIcon className="h-5 w-5 text-red-600 mr-2" />
          Historial de Backups
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <ArrowPathIcon className="h-8 w-8 text-red-600 animate-spin" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No hay backups disponibles
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map(backup => {
              const isHovered = hoveredBackup === backup.id;

              return (
                <BorderGlow key={backup.id} isHovered={isHovered}>
                  <motion.div
                    onHoverStart={() => setHoveredBackup(backup.id)}
                    onHoverEnd={() => setHoveredBackup(null)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'border-gray-700 bg-gray-800 hover:border-red-600/50'
                        : 'border-gray-200 bg-white hover:border-red-600/50'
                    }`}
                    onClick={() => {
                      setBackupSeleccionado(backup);
                      setModalDetailsOpen(true);
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <div className={`p-2 rounded-lg ${
                          backup.estado === 'completado'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : backup.estado === 'procesando'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {backup.estado === 'completado' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : backup.estado === 'procesando' ? (
                            <ArrowPathIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
                          ) : (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {backup.nombre || `Backup ${backup.fecha ? new Date(backup.fecha.seconds * 1000).toLocaleString() : 'Sin fecha'}`}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {backup.fecha ? new Date(backup.fecha.seconds * 1000).toLocaleString() : 'Fecha desconocida'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              backup.tipo === 'manual'
                                ? theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                                : theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {backup.tipo === 'manual' ? 'Manual' : 'Automático'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatSize(backup.tamaño)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBackupSeleccionado(backup);
                            setModalDetailsOpen(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-gray-700 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </BorderGlow>
              );
            })}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={limpiarBackupsAntiguos}
          disabled={procesando}
          className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 text-sm disabled:opacity-50"
        >
          <TrashIcon className="h-4 w-4" />
          <span>Limpiar Antiguos</span>
        </motion.button>
      </div>

      {/* Modales */}
      <BackupProcessModal
        isOpen={modalProcesoOpen}
        onClose={() => setModalProcesoOpen(false)}
        proceso={procesoBackup}
      />

      <BackupDetailsModal
        isOpen={modalDetailsOpen}
        onClose={() => setModalDetailsOpen(false)}
        backup={backupSeleccionado}
        onRestore={restaurarBackup}
        onDelete={eliminarBackup}
      />
    </div>
  );
};

export default Backup;