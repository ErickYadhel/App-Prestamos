import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useError } from '../context/ErrorContext';
import ClienteForm from '../components/Clientes/ClienteForm';
import ClienteDetails from '../components/Clientes/ClienteDetails';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [editingCliente, setEditingCliente] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);
  
  const { showError, showSuccess, showWarning } = useError();

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

  // CÁLCULOS CORREGIDOS - Solo con clientes activos y asegurando que sean números
  const sueldosActivos = clientesActivos
    .map(c => {
      // Convertir sueldo a número si es string
      const sueldo = c.sueldo;
      if (typeof sueldo === 'string') {
        // Remover "RD$" y cualquier caracter no numérico, luego convertir a número
        return parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0;
      }
      return Number(sueldo) || 0;
    })
    .filter(sueldo => sueldo > 0); // Solo sueldos mayores a 0

  // Cálculos corregidos
  const totalSueldos = sueldosActivos.reduce((sum, sueldo) => sum + sueldo, 0);
  const sueldoPromedio = sueldosActivos.length > 0 ? Math.round(totalSueldos / sueldosActivos.length) : 0;
  const sueldoMaximo = sueldosActivos.length > 0 ? Math.max(...sueldosActivos) : 0;

  console.log('🔢 DEBUG CÁLCULOS:', {
    clientesActivos: clientesActivos.length,
    sueldosActivosCount: sueldosActivos.length,
    sueldosActivosValores: sueldosActivos,
    totalSueldos,
    sueldoPromedio,
    sueldoMaximo
  });

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

  const handleRowClick = (cliente, action = 'view') => {
    if (action === 'view') {
      handleViewCliente(cliente);
    } else if (action === 'edit') {
      handleEditCliente(cliente);
    }
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
        console.log('Actualizando cliente:', editingCliente.id, clienteData);
        await api.put(`/clientes/${editingCliente.id}`, clienteData);
        showSuccess('Cliente actualizado exitosamente');
      } else {
        console.log('Creando nuevo cliente:', clienteData);
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
        console.log('Eliminando cliente:', clienteId);
        await api.delete(`/clientes/${clienteId}`);
        
        showSuccess('Cliente eliminado exitosamente');
        await fetchClientes();
        
      } catch (error) {
        console.error('Error deleting client:', error);
        showError(error.message || 'Error al eliminar el cliente');
      }
    }
  };

  // Función para formatear el sueldo - MEJORADA
  const formatSueldo = (sueldo) => {
    // Asegurar que sea número
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return 'No especificado';
    return `RD$ ${sueldoNum.toLocaleString('es-DO')}`;
  };

  // Función para obtener el color del sueldo según el monto
  const getSueldoColor = (sueldo) => {
    const sueldoNum = typeof sueldo === 'string' 
      ? parseFloat(sueldo.replace(/[^\d.,]/g, '').replace(',', '')) || 0
      : Number(sueldo) || 0;
    
    if (!sueldoNum || sueldoNum === 0) return 'text-gray-500';
    if (sueldoNum >= 50000) return 'text-green-600 font-semibold';
    if (sueldoNum >= 30000) return 'text-blue-600';
    if (sueldoNum >= 15000) return 'text-yellow-600';
    return 'text-red-600';
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

  return (
    <div className="space-y-6">
      {/* Header Mejorado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">
            {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''} activos
            {searchTerm && ` • ${filteredClientes.length} encontrados`}
          </p>
        </div>
        
        {/* Botones de Acción Mejorados */}
        <div className="flex items-center space-x-2">
          {/* Botón de Búsqueda */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="btn-secondary flex items-center space-x-2 p-3"
            title="Buscar clientes"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          
          {/* Botón de Nuevo Cliente con + */}
          <button
            onClick={handleCreateCliente}
            className="btn-primary flex items-center space-x-2 p-3"
            title="Nuevo cliente"
          >
            <UserPlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* API Connection Status */}
      {!apiConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="text-yellow-800">
              Modo offline: Usando datos locales. Verifica la conexión con el servidor.
            </span>
          </div>
        </div>
      )}

      {/* Search Bar - Ahora se muestra/oculta */}
      {showSearch && (
        <div className="bg-white rounded-lg shadow-sm p-4 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className="input-primary pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Resumen de Sueldos CORREGIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Sueldo Promedio</p>
              <p className="text-xl font-bold text-gray-900">
                {formatSueldo(sueldoPromedio)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {sueldosActivos.length} clientes con sueldo
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Sueldo Más Alto</p>
              <p className="text-xl font-bold text-gray-900">
                {formatSueldo(sueldoMaximo)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Máximo en cartera
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Sueldos</p>
              <p className="text-xl font-bold text-gray-900">
                {formatSueldo(totalSueldos)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sumatoria total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table Mejorada */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600">Cargando clientes...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cédula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trabajo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sueldo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClientes.map((cliente) => (
                    <tr 
                      key={cliente.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(cliente, 'view')}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cliente.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cliente.edad} años • {cliente.provincia}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cliente.cedula}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cliente.celular}</div>
                        <div className="text-sm text-gray-500">{cliente.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{cliente.trabajo}</div>
                        <div className="text-xs text-gray-500">{cliente.puesto}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getSueldoColor(cliente.sueldo)}`}>
                          {formatSueldo(cliente.sueldo)}
                        </div>
                        {cliente.sueldo && cliente.sueldo > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Capacidad: {getCapacidadPago(cliente.sueldo)}
                          </div>
                        )}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        onClick={(e) => e.stopPropagation()} // Evita que el click en botones active el row click
                      >
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => handleViewCliente(cliente)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                            title="Ver detalles"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditCliente(cliente)}
                            className="text-yellow-600 hover:text-yellow-900 p-2 rounded hover:bg-yellow-50 transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCliente(cliente.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredClientes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  {searchTerm ? 'No se encontraron clientes con esos criterios' : 'No hay clientes registrados'}
                </div>
                {!searchTerm && (
                  <button
                    onClick={handleCreateCliente}
                    className="btn-primary flex items-center space-x-2 mx-auto"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    <span>Crear Primer Cliente</span>
                  </button>
                )}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn-secondary mt-2"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Actions Footer */}
      {filteredClientes.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''} mostrados
            {searchTerm && ` de ${clientesActivos.length} activos`}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>{showSearch ? 'Ocultar' : 'Buscar'}</span>
            </button>
            <button
              onClick={handleCreateCliente}
              className="btn-primary flex items-center space-x-2 text-sm"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;