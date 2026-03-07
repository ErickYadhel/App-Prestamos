import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useError } from '../context/ErrorContext';
import { useTheme } from '../context/ThemeContext';
import ClienteForm from '../components/Clientes/ClienteForm';
import ClienteDetails from '../components/Clientes/ClienteDetails';

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
const ClientesSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className={`h-8 w-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-4 w-64 rounded-lg mt-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
        <div className="flex space-x-2">
          <div className={`h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          <div className={`h-10 w-10 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
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
const StatsCard = ({ icon: Icon, label, value, subValue, color, gradient }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const gradientColors = {
    green: 'from-green-600 to-green-800',
    blue: 'from-blue-600 to-blue-800',
    orange: 'from-orange-600 to-orange-800',
    purple: 'from-purple-600 to-purple-800'
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
        
        <div className="relative flex items-center">
          <div className={`p-3 bg-gradient-to-br ${gradientColors[gradient]} rounded-xl shadow-lg mr-4`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {label}
            </p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              {subValue}
            </p>
          </div>
        </div>
      </motion.div>
    </BorderGlow>
  );
};

// ============================================
// COMPONENTE DE FILTROS AVANZADOS
// ============================================
const AdvancedFilters = ({ isOpen, onClose, filters, onFilterChange }) => {
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Provincia
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todas</option>
                <option value="SD">Santo Domingo</option>
                <option value="Santiago">Santiago</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Rango de Sueldo
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todos</option>
                <option value="0-15000">0 - 15,000</option>
                <option value="15000-30000">15,000 - 30,000</option>
                <option value="30000-50000">30,000 - 50,000</option>
                <option value="50000+">50,000+</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Estado
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Capacidad de Pago
              </label>
              <select
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                }`}
              >
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="muy-alta">Muy Alta</option>
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

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [editingCliente, setEditingCliente] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const { showError, showSuccess } = useError();
  const { theme } = useTheme();

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Cargando clientes desde API...');
      
      const response = await api.get('/clientes');
      console.log('Clientes cargados:', response.data);
      
      setClientes(response.data || []);
      setApiConnected(true);
      
    } catch (error) {
      console.error('Error fetching clients:', error);
      
      const errorMessage = error.message || 'Error al cargar los clientes';
      showError(errorMessage);
      
      setApiConnected(false);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Filtrar solo clientes activos para cálculos
  const clientesActivos = clientes.filter(cliente => cliente.activo !== false);
  
  const filteredClientes = clientesActivos.filter(cliente =>
    cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cedula?.includes(searchTerm)
  );

  // Cálculos de sueldos
  const sueldosActivos = clientesActivos
    .map(c => {
      const sueldo = c.sueldo;
      if (typeof sueldo === 'string') {
        return parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0;
      }
      return Number(sueldo) || 0;
    })
    .filter(sueldo => sueldo > 0);

  const totalSueldos = sueldosActivos.reduce((sum, sueldo) => sum + sueldo, 0);
  const sueldoPromedio = sueldosActivos.length > 0 ? Math.round(totalSueldos / sueldosActivos.length) : 0;
  const sueldoMaximo = sueldosActivos.length > 0 ? Math.max(...sueldosActivos) : 0;

  const handleCreateCliente = () => {
    setEditingCliente(null);
    setViewMode('form');
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setViewMode('form');
  };

  const handleViewCliente = (cliente) => {
    setSelectedCliente(cliente);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCliente(null);
    setEditingCliente(null);
    setSearchTerm('');
    setShowSearch(false);
  };

  const handleSaveCliente = async (clienteData) => {
    try {
      if (editingCliente) {
        await api.put(`/clientes/${editingCliente.id}`, clienteData);
        showSuccess('Cliente actualizado exitosamente');
      } else {
        await api.post('/clientes', clienteData);
        showSuccess('Cliente creado exitosamente');
      }
      
      await fetchClientes();
      setViewMode('list');
      
    } catch (error) {
      console.error('Error saving client:', error);
      showError(error.message || 'Error al guardar el cliente');
    }
  };

  const handleDeleteCliente = async (clienteId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await api.delete(`/clientes/${clienteId}`);
        showSuccess('Cliente eliminado exitosamente');
        await fetchClientes();
      } catch (error) {
        console.error('Error deleting client:', error);
        showError(error.message || 'Error al eliminar el cliente');
      }
    }
  };

  const formatSueldo = (sueldo) => {
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return 'No especificado';
    return `RD$ ${sueldoNum.toLocaleString('es-DO')}`;
  };

  const getSueldoColor = (sueldo) => {
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
    if (sueldoNum >= 50000) return 'text-green-600 dark:text-green-400 font-semibold';
    if (sueldoNum >= 30000) return 'text-blue-600 dark:text-blue-400';
    if (sueldoNum >= 15000) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCapacidadPago = (sueldo) => {
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return 'No especificado';
    if (sueldoNum >= 50000) return 'Muy Alta';
    if (sueldoNum >= 30000) return 'Alta';
    if (sueldoNum >= 15000) return 'Media';
    return 'Baja';
  };

  if (viewMode === 'form') {
    return (
      <ClienteForm
        cliente={editingCliente}
        onSave={handleSaveCliente}
        onCancel={handleBackToList}
      />
    );
  }

  if (viewMode === 'details' && selectedCliente) {
    return (
      <ClienteDetails
        cliente={selectedCliente}
        onBack={handleBackToList}
        onEdit={() => handleEditCliente(selectedCliente)}
      />
    );
  }

  if (loading) {
    return <ClientesSkeleton />;
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
                  Clientes
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''} activos
                  {searchTerm && ` • ${filteredClientes.length} encontrados`}
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
                title="Buscar clientes"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateCliente}
                className="p-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                title="Nuevo cliente"
              >
                <UserPlusIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Connection Status */}
      <AnimatePresence>
        {!apiConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border-2 flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400'
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Modo offline: Usando datos locales. Verifica la conexión con el servidor.</p>
          </motion.div>
        )}
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
                    placeholder="Buscar por nombre o cédula..."
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={CurrencyDollarIcon}
          label="Sueldo Promedio"
          value={formatSueldo(sueldoPromedio)}
          subValue={`${sueldosActivos.length} clientes con sueldo`}
          gradient="green"
        />
        
        <StatsCard
          icon={CurrencyDollarIcon}
          label="Sueldo Más Alto"
          value={formatSueldo(sueldoMaximo)}
          subValue="Máximo en cartera"
          gradient="blue"
        />
        
        <StatsCard
          icon={CurrencyDollarIcon}
          label="Total Sueldos"
          value={formatSueldo(totalSueldos)}
          subValue="Sumatoria total"
          gradient="orange"
        />
      </div>

      {/* Tabla de Clientes */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                {['Cliente', 'Cédula', 'Contacto', 'Trabajo', 'Sueldo', 'Acciones'].map((header, index) => (
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
                {filteredClientes.map((cliente) => (
                  <motion.tr
                    key={cliente.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onHoverStart={() => setHoveredRow(cliente.id)}
                    onHoverEnd={() => setHoveredRow(null)}
                    className={`cursor-pointer transition-all duration-300 ${
                      hoveredRow === cliente.id
                        ? theme === 'dark'
                          ? 'bg-gray-700/50'
                          : 'bg-gray-100'
                        : ''
                    }`}
                    onClick={() => handleViewCliente(cliente)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${
                          hoveredRow === cliente.id
                            ? 'from-red-600 to-red-800'
                            : 'from-gray-600 to-gray-800'
                        } transition-all duration-300`}>
                          {cliente.nombre?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {cliente.nombre}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {cliente.edad} años • {cliente.provincia}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {cliente.cedula}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{cliente.celular}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{cliente.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{cliente.trabajo}</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{cliente.puesto}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getSueldoColor(cliente.sueldo)}`}>
                        {formatSueldo(cliente.sueldo)}
                      </div>
                      {cliente.sueldo && cliente.sueldo > 0 && (
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          Capacidad: {getCapacidadPago(cliente.sueldo)}
                        </div>
                      )}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewCliente(cliente)}
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
                          onClick={() => handleEditCliente(cliente)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-gray-700 text-yellow-400'
                              : 'hover:bg-yellow-50 text-yellow-600'
                          }`}
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteCliente(cliente.id)}
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
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredClientes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>👥</div>
              <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateCliente}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  <span>Crear Primer Cliente</span>
                </motion.button>
              )}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Limpiar búsqueda
                </button>
              )}
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Footer con acciones rápidas */}
      {filteredClientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border-2 ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          } flex justify-between items-center`}
        >
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Mostrando <span className="font-semibold">{filteredClientes.length}</span> de{' '}
            <span className="font-semibold">{clientesActivos.length}</span> clientes activos
            {searchTerm && ` (filtrados)`}
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>{showSearch ? 'Ocultar' : 'Buscar'}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateCliente}
              className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-1"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Nuevo Cliente</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Clientes;