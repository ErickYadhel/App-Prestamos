import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

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
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SKELETON LOADER
// ============================================
const GarantesSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-64 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className={`h-10 w-36 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-24 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className={`h-96 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
    </div>
  );
};

// ============================================
// COMPONENTE DE STATS CARD
// ============================================
const StatsCard = ({ icon: Icon, label, value, subValue, gradient }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const gradientColors = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    yellow: 'from-yellow-600 to-yellow-800',
    red: 'from-red-600 to-red-800'
  };

  return (
    <BorderGlow isHovered={isHovered}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-xl p-5 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white border-gray-200'
        } border-2 hover:border-red-600/40 transition-all duration-300`}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColors[gradient]} opacity-10 rounded-full blur-3xl`} />
        
        <div className="relative flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            {subValue && (
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                {subValue}
              </p>
            )}
          </div>
          <div className={`p-3 bg-gradient-to-br ${gradientColors[gradient]} rounded-xl shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE FILTROS AVANZADOS
// ============================================
const AdvancedFilters = ({ isOpen, onClose, filtros, onFilterChange }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Filtros Avanzados
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo de Garante
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todos</option>
                <option value="personal">Personal</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Capacidad Mínima
              </label>
              <input
                type="number"
                placeholder="0"
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Relación
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todas</option>
                <option value="Familiar">Familiar</option>
                <option value="Amigo">Amigo</option>
                <option value="Colega">Colega</option>
                <option value="Socio">Socio</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE TARJETA DE INFORMACIÓN
// ============================================
const InfoCard = ({ icon: Icon, label, value, color }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
    }`}>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
};

const Garantes = () => {
  const [garantes, setGarantes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClienteFilter, setSelectedClienteFilter] = useState('todos');
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedGarante, setSelectedGarante] = useState(null);
  const [editingGarante, setEditingGarante] = useState(null);
  const [error, setError] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    conPrestamos: 0,
    capacidadTotal: 0
  });

  const { theme } = useTheme();

  useEffect(() => {
    fetchGarantes();
    fetchClientes();
  }, []);

  const fetchGarantes = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Intentar obtener datos reales de la API
      let garantesReales = [];
      try {
        const response = await api.get('/garantes');
        garantesReales = response.data || [];
      } catch (apiError) {
        console.log('Usando datos de ejemplo para garantes');
        // Datos de ejemplo como fallback
        garantesReales = getMockGarantes();
      }

      setGarantes(garantesReales);
      
      // Calcular estadísticas mejoradas
      const total = garantesReales.length;
      const activos = garantesReales.filter(g => g.activo !== false).length;
      const conPrestamos = garantesReales.filter(g => (g.prestamosActivos || 0) > 0).length;
      const capacidadTotal = garantesReales.reduce((sum, g) => {
        const sueldo = parseFloat(g.sueldo) || 0;
        return sum + (sueldo * 0.4 * 12); // 40% del sueldo anual
      }, 0);
      
      setStats({ total, activos, conPrestamos, capacidadTotal });
    } catch (error) {
      console.error('Error fetching guarantors:', error);
      setError('Error al cargar los garantes');
    } finally {
      setLoading(false);
    }
  };

  const getMockGarantes = () => {
    return [
      {
        id: '1',
        clienteID: '1',
        clienteNombre: 'Juan Pérez',
        nombre: 'Roberto Pérez',
        cedula: '001-1111111-1',
        edad: 45,
        celular: '809-111-2222',
        email: 'roberto@email.com',
        trabajo: 'Empresa ABC',
        sueldo: 40000,
        puesto: 'Supervisor',
        direccion: 'Calle Principal #123',
        sector: 'Sector Norte',
        provincia: 'Santo Domingo',
        pais: 'República Dominicana',
        cedulaFotoUrl: null,
        fotoUrl: null,
        activo: true,
        fechaCreacion: '2024-01-15T10:00:00',
        tipoGarante: 'personal',
        relacionCliente: 'Hermano',
        capacidadEndeudamiento: 192000,
        observaciones: 'Garante confiable',
        prestamosGarantizados: ['P-001'],
        prestamosActivos: 1,
        historialGarantias: [
          {
            prestamoID: 'P-001',
            monto: 50000,
            fecha: '2024-01-15',
            estado: 'activo'
          }
        ]
      },
      {
        id: '2',
        clienteID: '1',
        clienteNombre: 'Juan Pérez',
        nombre: 'Ana Pérez',
        cedula: '001-2222222-2',
        edad: 42,
        celular: '809-333-4444',
        email: 'ana@email.com',
        trabajo: 'Escuela Nacional',
        sueldo: 35000,
        puesto: 'Maestra',
        direccion: 'Calle Principal #123',
        sector: 'Sector Norte',
        provincia: 'Santo Domingo',
        pais: 'República Dominicana',
        cedulaFotoUrl: null,
        fotoUrl: null,
        activo: true,
        fechaCreacion: '2024-01-15T10:00:00',
        tipoGarante: 'personal',
        relacionCliente: 'Esposa',
        capacidadEndeudamiento: 168000,
        observaciones: '',
        prestamosGarantizados: ['P-001'],
        prestamosActivos: 1,
        historialGarantias: [
          {
            prestamoID: 'P-001',
            monto: 50000,
            fecha: '2024-01-15',
            estado: 'activo'
          }
        ]
      },
      {
        id: '3',
        clienteID: '2',
        clienteNombre: 'María Rodríguez',
        nombre: 'Carlos Rodríguez',
        cedula: '002-3333333-3',
        edad: 50,
        celular: '809-555-6666',
        email: 'carlos@email.com',
        trabajo: 'Constructor Independiente',
        sueldo: 45000,
        puesto: 'Contratista',
        direccion: 'Av. Independencia #456',
        sector: 'Sector Este',
        provincia: 'Santo Domingo',
        pais: 'República Dominicana',
        cedulaFotoUrl: null,
        fotoUrl: null,
        activo: true,
        fechaCreacion: '2024-01-20T14:30:00',
        tipoGarante: 'comercial',
        relacionCliente: 'Socio',
        capacidadEndeudamiento: 216000,
        observaciones: 'Capacidad de endeudamiento alta',
        prestamosGarantizados: ['P-002'],
        prestamosActivos: 1,
        historialGarantias: [
          {
            prestamoID: 'P-002',
            monto: 75000,
            fecha: '2024-01-20',
            estado: 'activo'
          }
        ]
      },
      {
        id: '4',
        clienteID: '3',
        clienteNombre: 'Carlos López',
        nombre: 'Miguel López',
        cedula: '003-4444444-4',
        edad: 38,
        celular: '809-777-8888',
        email: 'miguel@email.com',
        trabajo: 'Taller Mecánico',
        sueldo: 30000,
        puesto: 'Mecánico',
        direccion: 'Calle 27 de Febrero #789',
        sector: 'Sector Oeste',
        provincia: 'Santiago',
        pais: 'República Dominicana',
        cedulaFotoUrl: null,
        fotoUrl: null,
        activo: false,
        fechaCreacion: '2024-02-01T09:15:00',
        tipoGarante: 'personal',
        relacionCliente: 'Primo',
        capacidadEndeudamiento: 144000,
        observaciones: 'Garante inactivo por solicitud',
        prestamosGarantizados: [],
        prestamosActivos: 0,
        historialGarantias: []
      }
    ];
  };

  const fetchClientes = async () => {
    try {
      // Intentar obtener clientes reales
      let clientesReales = [];
      try {
        const response = await api.get('/clientes');
        clientesReales = response.data || [];
      } catch (apiError) {
        console.log('Usando datos de ejemplo para clientes');
        clientesReales = [
          { id: '1', nombre: 'Juan Pérez', prestamosActivos: 1 },
          { id: '2', nombre: 'María Rodríguez', prestamosActivos: 1 },
          { id: '3', nombre: 'Carlos López', prestamosActivos: 1 }
        ];
      }
      setClientes(clientesReales);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const filteredGarantes = garantes.filter(garante => {
    const matchesSearch = 
      garante.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      garante.cedula?.includes(searchTerm) ||
      garante.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCliente = selectedClienteFilter === 'todos' || 
                          garante.clienteID === selectedClienteFilter;

    const matchesActivo = 
      filtroActivo === 'todos' || 
      (filtroActivo === 'activos' && garante.activo !== false) ||
      (filtroActivo === 'inactivos' && garante.activo === false);

    return matchesSearch && matchesCliente && matchesActivo;
  });

  const getClientesConGarantes = () => {
    const clientesConGarantes = clientes.map(cliente => ({
      ...cliente,
      cantidadGarantes: garantes.filter(g => g.clienteID === cliente.id && g.activo).length,
      garantesActivos: garantes.filter(g => g.clienteID === cliente.id && g.activo)
    }));
    return clientesConGarantes;
  };

  const handleCreateGarante = () => {
    setEditingGarante(null);
    setShowForm(true);
  };

  const handleEditGarante = (garante) => {
    setEditingGarante(garante);
    setShowForm(true);
  };

  const handleViewGarante = (garante) => {
    setSelectedGarante(garante);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGarante(null);
    setError('');
  };

  const handleCloseView = () => {
    setSelectedGarante(null);
  };

  const handleSaveGarante = async (garanteData) => {
    try {
      setError('');
      
      // Calcular capacidad de endeudamiento automáticamente
      const sueldo = parseFloat(garanteData.sueldo) || 0;
      const capacidadEndeudamiento = sueldo * 0.4 * 12; // 40% del sueldo anual
      
      const garanteCompleto = {
        ...garanteData,
        capacidadEndeudamiento,
        prestamosActivos: 0,
        prestamosGarantizados: [],
        historialGarantias: []
      };

      if (editingGarante) {
        // Actualizar garante existente
        await api.put(`/garantes/${editingGarante.id}`, garanteCompleto);
      } else {
        // Crear nuevo garante
        await api.post('/garantes', garanteCompleto);
      }
      
      await fetchGarantes(); // Recargar lista
      setShowForm(false);
    } catch (error) {
      console.error('Error saving guarantor:', error);
      // Fallback: actualizar estado local si la API falla
      if (editingGarante) {
        const updatedGarantes = garantes.map(g =>
          g.id === editingGarante.id ? { ...garanteData, id: editingGarante.id } : g
        );
        setGarantes(updatedGarantes);
        setShowForm(false);
      } else {
        const newGarante = {
          ...garanteData,
          id: Date.now().toString(),
          fechaCreacion: new Date().toISOString(),
          capacidadEndeudamiento: (parseFloat(garanteData.sueldo) || 0) * 0.4 * 12,
          prestamosActivos: 0,
          prestamosGarantizados: [],
          historialGarantias: []
        };
        setGarantes(prev => [newGarante, ...prev]);
        setShowForm(false);
      }
    }
  };

  const handleDeleteGarante = async (garanteId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este garante?')) {
      try {
        setError('');
        await api.delete(`/garantes/${garanteId}`);
        await fetchGarantes();
      } catch (error) {
        console.error('Error deleting guarantor:', error);
        // Fallback: eliminar localmente
        const updatedGarantes = garantes.filter(g => g.id !== garanteId);
        setGarantes(updatedGarantes);
      }
    }
  };

  const handleActivateGarante = async (garanteId, activar = true) => {
    try {
      await api.put(`/garantes/${garanteId}`, { activo: activar });
      await fetchGarantes();
    } catch (error) {
      console.error('Error updating guarantor:', error);
      // Fallback: actualizar localmente
      const updatedGarantes = garantes.map(g =>
        g.id === garanteId ? { ...g, activo: activar } : g
      );
      setGarantes(updatedGarantes);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'RD$ 0';
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Componente Formulario de Garante (MEJORADO)
  const GaranteForm = () => {
    const [formData, setFormData] = useState({
      clienteID: '',
      clienteNombre: '',
      nombre: '',
      cedula: '',
      edad: '',
      celular: '',
      email: '',
      trabajo: '',
      sueldo: '',
      puesto: '',
      direccion: '',
      sector: '',
      provincia: '',
      pais: 'República Dominicana',
      tipoGarante: 'personal',
      relacionCliente: '',
      observaciones: '',
      activo: true
    });

    useEffect(() => {
      if (editingGarante) {
        setFormData({
          clienteID: editingGarante.clienteID,
          clienteNombre: editingGarante.clienteNombre,
          nombre: editingGarante.nombre,
          cedula: editingGarante.cedula,
          edad: editingGarante.edad,
          celular: editingGarante.celular,
          email: editingGarante.email,
          trabajo: editingGarante.trabajo,
          sueldo: editingGarante.sueldo,
          puesto: editingGarante.puesto,
          direccion: editingGarante.direccion,
          sector: editingGarante.sector,
          provincia: editingGarante.provincia,
          pais: editingGarante.pais,
          tipoGarante: editingGarante.tipoGarante || 'personal',
          relacionCliente: editingGarante.relacionCliente || '',
          observaciones: editingGarante.observaciones || '',
          activo: editingGarante.activo
        });
      }
    }, [editingGarante]);

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!formData.clienteID || !formData.nombre || !formData.cedula || !formData.celular) {
        setError('Por favor complete los campos obligatorios');
        return;
      }

      const clienteSeleccionado = clientes.find(c => c.id === formData.clienteID);
      const garanteData = {
        ...formData,
        clienteNombre: clienteSeleccionado?.nombre || ''
      };

      handleSaveGarante(garanteData);
    };

    const provinciasRD = [
      'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Vega', 'San Cristóbal',
      'Puerto Plata', 'La Altagracia', 'San Pedro de Macorís', 'Duarte', 'Espaillat',
      'Barahona', 'Valverde', 'Azua', 'María Trinidad Sánchez', 'Monte Plata',
      'Peravia', 'Hato Mayor', 'San Juan', 'Monseñor Nouel', 'Monte Cristi',
      'Sánchez Ramírez', 'El Seibo', 'Dajabón', 'Samaná', 'Santiago Rodríguez',
      'Elías Piña', 'Independencia', 'Baoruco', 'Pedernales', 'San José de Ocoa'
    ];

    const relacionesCliente = [
      'Familiar', 'Amigo', 'Colega', 'Vecino', 'Socio', 
      'Hermano', 'Padre', 'Madre', 'Esposo', 'Esposa', 
      'Primo', 'Tío', 'Otro'
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mb-6"
      >
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingGarante ? 'Editar Garante' : 'Nuevo Garante'}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Complete la información del garante
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cliente Principal */}
              <div className={`p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <UserIcon className="h-4 w-4 mr-2 text-red-600" />
                  Cliente Principal
                </h4>
                <select
                  value={formData.clienteID}
                  onChange={(e) => setFormData(prev => ({ ...prev, clienteID: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                  }`}
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Información Personal */}
              <div className={`p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <UserIcon className="h-4 w-4 mr-2 text-red-600" />
                  Información Personal del Garante
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="Ej: Roberto Pérez"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cédula *
                    </label>
                    <input
                      type="text"
                      value={formData.cedula}
                      onChange={(e) => setFormData(prev => ({ ...prev, cedula: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="001-1234567-8"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Edad
                    </label>
                    <input
                      type="number"
                      value={formData.edad}
                      onChange={(e) => setFormData(prev => ({ ...prev, edad: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="35"
                      min="18"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Celular *
                    </label>
                    <input
                      type="tel"
                      value={formData.celular}
                      onChange={(e) => setFormData(prev => ({ ...prev, celular: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="809-123-4567"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="garante@email.com"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo de Garante
                    </label>
                    <select
                      value={formData.tipoGarante}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipoGarante: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                    >
                      <option value="personal">Personal</option>
                      <option value="comercial">Comercial</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Relación con el Cliente
                    </label>
                    <select
                      value={formData.relacionCliente}
                      onChange={(e) => setFormData(prev => ({ ...prev, relacionCliente: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                    >
                      <option value="">Seleccionar relación</option>
                      {relacionesCliente.map(relacion => (
                        <option key={relacion} value={relacion}>{relacion}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Información Laboral */}
              <div className={`p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <BriefcaseIcon className="h-4 w-4 mr-2 text-red-600" />
                  Información Laboral
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lugar de Trabajo
                    </label>
                    <input
                      type="text"
                      value={formData.trabajo}
                      onChange={(e) => setFormData(prev => ({ ...prev, trabajo: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="Empresa XYZ"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Puesto
                    </label>
                    <input
                      type="text"
                      value={formData.puesto}
                      onChange={(e) => setFormData(prev => ({ ...prev, puesto: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="Gerente"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sueldo Mensual (DOP)
                    </label>
                    <input
                      type="number"
                      value={formData.sueldo}
                      onChange={(e) => setFormData(prev => ({ ...prev, sueldo: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="35000"
                    />
                    {formData.sueldo && (
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Capacidad estimada: {formatCurrency((parseFloat(formData.sueldo) || 0) * 0.4 * 12)} anual
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className={`p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <HomeIcon className="h-4 w-4 mr-2 text-red-600" />
                  Dirección
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Dirección Completa
                    </label>
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="Calle Principal #123"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sector
                    </label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      placeholder="Sector Norte"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Provincia
                    </label>
                    <select
                      value={formData.provincia}
                      onChange={(e) => setFormData(prev => ({ ...prev, provincia: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                    >
                      <option value="">Seleccionar provincia</option>
                      {provinciasRD.map(provincia => (
                        <option key={provincia} value={provincia}>{provincia}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      País
                    </label>
                    <input
                      type="text"
                      value={formData.pais}
                      className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      }`}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className={`p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  rows="3"
                  className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                  }`}
                  placeholder="Observaciones adicionales sobre el garante..."
                />
              </div>

              {/* Estado */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Garante activo
                </span>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleCloseForm}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  {editingGarante ? 'Actualizar Garante' : 'Crear Garante'}
                </motion.button>
              </div>
            </form>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  // Componente Detalles del Garante (MEJORADO)
  const GaranteDetails = () => {
    if (!selectedGarante) return null;

    const capacidadEndeudamiento = selectedGarante.capacidadEndeudamiento || 
                                 (selectedGarante.sueldo ? (selectedGarante.sueldo * 0.4 * 12) : 0);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mb-6"
      >
        <GlassCard>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedGarante.nombre}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedGarante.cedula}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseView}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda - Información Principal */}
              <div className="lg:col-span-2 space-y-4">
                {/* Cliente Principal */}
                <div className={`p-4 rounded-lg border-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className={`text-sm font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <UserIcon className="h-4 w-4 mr-2 text-red-600" />
                    Cliente Principal
                  </h4>
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedGarante.clienteNombre}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Relación: {selectedGarante.relacionCliente || 'No especificada'}
                  </p>
                </div>

                {/* Información Personal */}
                <div className={`p-4 rounded-lg border-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className={`text-sm font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <UserIcon className="h-4 w-4 mr-2 text-red-600" />
                    Información Personal
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard
                      icon={UserIcon}
                      label="Edad"
                      value={`${selectedGarante.edad || 'N/A'} años`}
                      color="bg-blue-600"
                    />
                    <InfoCard
                      icon={PhoneIcon}
                      label="Celular"
                      value={selectedGarante.celular || 'N/A'}
                      color="bg-green-600"
                    />
                    <InfoCard
                      icon={DocumentTextIcon}
                      label="Email"
                      value={selectedGarante.email || 'N/A'}
                      color="bg-purple-600"
                    />
                    <InfoCard
                      icon={BriefcaseIcon}
                      label="Tipo"
                      value={selectedGarante.tipoGarante === 'comercial' ? 'Comercial' : 'Personal'}
                      color="bg-yellow-600"
                    />
                  </div>
                </div>

                {/* Información Laboral */}
                <div className={`p-4 rounded-lg border-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className={`text-sm font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <BriefcaseIcon className="h-4 w-4 mr-2 text-red-600" />
                    Información Laboral
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard
                      icon={BuildingOfficeIcon}
                      label="Trabajo"
                      value={selectedGarante.trabajo || 'N/A'}
                      color="bg-indigo-600"
                    />
                    <InfoCard
                      icon={UserIcon}
                      label="Puesto"
                      value={selectedGarante.puesto || 'N/A'}
                      color="bg-pink-600"
                    />
                    <InfoCard
                      icon={ChartBarIcon}
                      label="Sueldo"
                      value={selectedGarante.sueldo ? `RD$ ${selectedGarante.sueldo.toLocaleString()}` : 'N/A'}
                      color="bg-teal-600"
                    />
                    <InfoCard
                      icon={ShieldCheckIcon}
                      label="Capacidad"
                      value={formatCurrency(capacidadEndeudamiento)}
                      color="bg-orange-600"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div className={`p-4 rounded-lg border-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className={`text-sm font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <HomeIcon className="h-4 w-4 mr-2 text-red-600" />
                    Dirección
                  </h4>
                  <div className="space-y-2">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedGarante.direccion || 'N/A'}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedGarante.sector}, {selectedGarante.provincia}, {selectedGarante.pais}
                    </p>
                  </div>
                </div>

                {/* Observaciones */}
                {selectedGarante.observaciones && (
                  <div className={`p-4 rounded-lg border-2 ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <h4 className={`text-sm font-semibold mb-2 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <DocumentTextIcon className="h-4 w-4 mr-2 text-red-600" />
                      Observaciones
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedGarante.observaciones}
                    </p>
                  </div>
                )}
              </div>

              {/* Columna Derecha - Estadísticas */}
              <div className="space-y-4">
                {/* Estado */}
                <div className={`p-4 rounded-lg border-2 ${
                  selectedGarante.activo
                    ? theme === 'dark' ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50'
                    : theme === 'dark' ? 'border-red-700 bg-red-900/20' : 'border-red-200 bg-red-50'
                }`}>
                  <h4 className={`text-sm font-semibold mb-3 flex items-center ${
                    selectedGarante.activo
                      ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
                      : theme === 'dark' ? 'text-red-400' : 'text-red-700'
                  }`}>
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Estado
                  </h4>
                  <p className={`text-2xl font-bold ${
                    selectedGarante.activo
                      ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
                      : theme === 'dark' ? 'text-red-400' : 'text-red-700'
                  }`}>
                    {selectedGarante.activo ? 'Activo' : 'Inactivo'}
                  </p>
                  <p className={`text-xs mt-2 ${
                    selectedGarante.activo
                      ? theme === 'dark' ? 'text-green-500' : 'text-green-600'
                      : theme === 'dark' ? 'text-red-500' : 'text-red-600'
                  }`}>
                    Fecha de registro: {new Date(selectedGarante.fechaCreacion).toLocaleDateString()}
                  </p>
                </div>

                {/* Préstamos Garantizados */}
                <div className={`p-4 rounded-lg border-2 ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className={`text-sm font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <ChartBarIcon className="h-4 w-4 mr-2 text-red-600" />
                    Préstamos Garantizados
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Activos:</span>
                      <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedGarante.prestamosActivos || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total:</span>
                      <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedGarante.prestamosGarantizados?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleCloseView();
                      handleEditGarante(selectedGarante);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span>Editar Garante</span>
                  </motion.button>

                  {selectedGarante.activo ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActivateGarante(selectedGarante.id, false)}
                      className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      <span>Desactivar Garante</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActivateGarante(selectedGarante.id, true)}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Activar Garante</span>
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteGarante(selectedGarante.id)}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                    <span>Eliminar Garante</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  if (loading) {
    return <GarantesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Mejorado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-2xl blur-3xl"></div>
        <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-red-600/20`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Garantes
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gestiona los garantes de los préstamos
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-lg transition-all ${
                  showFilters
                    ? 'bg-red-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Filtros avanzados"
              >
                <FunnelIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className={`p-3 rounded-lg transition-all ${
                  showSearch
                    ? 'bg-red-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Buscar garantes"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateGarante}
                className="p-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                title="Nuevo garante"
              >
                <PlusIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mensaje de Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border-2 flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-700 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && <GaranteForm />}
      </AnimatePresence>

      {/* Vista de Detalles */}
      <AnimatePresence>
        {selectedGarante && <GaranteDetails />}
      </AnimatePresence>

      {/* Filtros Avanzados */}
      <AnimatePresence>
        {showFilters && (
          <AdvancedFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard>
              <div className="p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, cédula o cliente..."
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border-2 outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <XMarkIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} hover:text-red-600 transition-colors`} />
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solo mostrar el contenido principal si no hay formulario ni detalles */}
      {!showForm && !selectedGarante && (
        <>
          {/* Stats Cards Mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={UserGroupIcon}
              label="Total Garantes"
              value={stats.total}
              subValue="Registrados"
              gradient="blue"
            />

            <StatsCard
              icon={CheckCircleIcon}
              label="Garantes Activos"
              value={stats.activos}
              subValue={`${stats.total > 0 ? ((stats.activos / stats.total) * 100).toFixed(1) : 0}% del total`}
              gradient="green"
            />

            <StatsCard
              icon={ChartBarIcon}
              label="Con Préstamos"
              value={stats.conPrestamos}
              subValue="Garantizando activamente"
              gradient="purple"
            />

            <StatsCard
              icon={BuildingOfficeIcon}
              label="Capacidad Total"
              value={formatCurrency(stats.capacidadTotal)}
              subValue="Endeudamiento anual"
              gradient="yellow"
            />
          </div>

          {/* Filtros Rápidos */}
          <GlassCard>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Filtrar por Cliente
                  </label>
                  <select
                    value={selectedClienteFilter}
                    onChange={(e) => setSelectedClienteFilter(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    }`}
                  >
                    <option value="todos">Todos los clientes</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Estado
                  </label>
                  <select
                    value={filtroActivo}
                    onChange={(e) => setFiltroActivo(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                    }`}
                  >
                    <option value="todos">Todos</option>
                    <option value="activos">Solo activos</option>
                    <option value="inactivos">Solo inactivos</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Resultados
                  </label>
                  <div className={`px-4 py-2 rounded-lg border-2 ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}>
                    {filteredGarantes.length} garantes encontrados
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Tabla de Garantes */}
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    {['Garante', 'Cliente Principal', 'Contacto', 'Capacidad', 'Préstamos', 'Estado', 'Acciones'].map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                }`}>
                  <AnimatePresence>
                    {filteredGarantes.map((garante) => {
                      const isHovered = hoveredRow === garante.id;
                      const capacidad = garante.capacidadEndeudamiento || (garante.sueldo ? garante.sueldo * 0.4 * 12 : 0);
                      
                      return (
                        <motion.tr
                          key={garante.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onHoverStart={() => setHoveredRow(garante.id)}
                          onHoverEnd={() => setHoveredRow(null)}
                          className={`cursor-pointer transition-all duration-300 ${
                            isHovered
                              ? theme === 'dark'
                                ? 'bg-gray-700/50'
                                : 'bg-gray-100'
                              : ''
                          }`}
                          onClick={() => handleViewGarante(garante)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {garante.nombre}
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {garante.cedula}
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                              {garante.tipoGarante === 'comercial' ? '🏢 Comercial' : '👤 Personal'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {garante.clienteNombre}
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {garante.relacionCliente || 'Relación no especificada'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {garante.celular}
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {garante.email || 'Sin email'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${
                              capacidad > 200000 
                                ? 'text-green-600 dark:text-green-400' 
                                : capacidad > 100000 
                                ? 'text-yellow-600 dark:text-yellow-400' 
                                : 'text-orange-600 dark:text-orange-400'
                            }`}>
                              {formatCurrency(capacidad)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              (garante.prestamosActivos || 0) > 0 
                                ? theme === 'dark'
                                  ? 'bg-purple-900/30 text-purple-400'
                                  : 'bg-purple-100 text-purple-800'
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-400'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {garante.prestamosActivos || 0} activos
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              garante.activo 
                                ? theme === 'dark'
                                  ? 'bg-green-900/30 text-green-400'
                                  : 'bg-green-100 text-green-800'
                                : theme === 'dark'
                                  ? 'bg-red-900/30 text-red-400'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {garante.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewGarante(garante);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark'
                                    ? 'hover:bg-gray-700 text-blue-400'
                                    : 'hover:bg-blue-50 text-blue-600'
                                }`}
                                title="Ver detalles"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditGarante(garante);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark'
                                    ? 'hover:bg-gray-700 text-yellow-400'
                                    : 'hover:bg-yellow-50 text-yellow-600'
                                }`}
                                title="Editar"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </motion.button>
                              
                              {garante.activo ? (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleActivateGarante(garante.id, false);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    theme === 'dark'
                                      ? 'hover:bg-gray-700 text-orange-400'
                                      : 'hover:bg-orange-50 text-orange-600'
                                  }`}
                                  title="Desactivar"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleActivateGarante(garante.id, true);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    theme === 'dark'
                                      ? 'hover:bg-gray-700 text-green-400'
                                      : 'hover:bg-green-50 text-green-600'
                                  }`}
                                  title="Activar"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </motion.button>
                              )}
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteGarante(garante.id);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  theme === 'dark'
                                    ? 'hover:bg-gray-700 text-red-400'
                                    : 'hover:bg-red-50 text-red-600'
                                }`}
                                title="Eliminar"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredGarantes.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>👥</div>
                  <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {searchTerm || selectedClienteFilter !== 'todos' || filtroActivo !== 'todos'
                      ? 'No se encontraron garantes con los filtros aplicados.'
                      : 'No hay garantes registrados.'}
                  </p>
                  {!searchTerm && selectedClienteFilter === 'todos' && filtroActivo === 'todos' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreateGarante}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>Nuevo Garante</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </GlassCard>

          {/* Resumen de Clientes con Garantes */}
          {getClientesConGarantes().some(c => c.cantidadGarantes > 0) && (
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg">
                    <UserGroupIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Resumen por Cliente
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getClientesConGarantes()
                    .filter(c => c.cantidadGarantes > 0)
                    .map(cliente => (
                      <motion.div
                        key={cliente.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border-2 ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {cliente.nombre}
                            </h4>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                              {cliente.cantidadGarantes} garante(s) activo(s)
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            theme === 'dark'
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {cliente.prestamosActivos || 0} préstamos
                          </span>
                        </div>
                        
                        <div className="mt-3 space-y-1">
                          {cliente.garantesActivos.map(garante => (
                            <div key={garante.id} className="flex justify-between items-center text-xs">
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                {garante.nombre}
                              </span>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                {garante.relacionCliente}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
};

export default Garantes;