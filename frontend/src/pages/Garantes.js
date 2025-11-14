import React, { useState, useEffect } from 'react';
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
  ChartBarIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Garantes = () => {
  const [garantes, setGarantes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClienteFilter, setSelectedClienteFilter] = useState('todos');
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [selectedGarante, setSelectedGarante] = useState(null);
  const [editingGarante, setEditingGarante] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    conPrestamos: 0,
    capacidadTotal: 0
  });

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

  // Componente Formulario de Garante
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

      // Obtener nombre del cliente seleccionado
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
      'Conocido', 'Hermano', 'Padre', 'Madre', 'Esposo', 
      'Esposa', 'Primo', 'Tío', 'Otro'
    ];

    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {editingGarante ? 'Editar Garante' : 'Nuevo Garante'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente Principal */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Cliente Principal</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Cliente *
              </label>
              <select
                value={formData.clienteID}
                onChange={(e) => setFormData(prev => ({ ...prev, clienteID: e.target.value }))}
                className="input-primary"
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
          </div>

          {/* Información Personal del Garante */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Información Personal del Garante</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: Roberto Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula *
                </label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData(prev => ({ ...prev, cedula: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: 001-1234567-8"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData(prev => ({ ...prev, edad: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: 35"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Celular *
                </label>
                <input
                  type="tel"
                  value={formData.celular}
                  onChange={(e) => setFormData(prev => ({ ...prev, celular: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: 809-123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: garante@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Garante
                </label>
                <select
                  value={formData.tipoGarante}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoGarante: e.target.value }))}
                  className="input-primary"
                >
                  <option value="personal">Personal</option>
                  <option value="comercial">Comercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relación con el Cliente
                </label>
                <select
                  value={formData.relacionCliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, relacionCliente: e.target.value }))}
                  className="input-primary"
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
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Información Laboral</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar de Trabajo
                </label>
                <input
                  type="text"
                  value={formData.trabajo}
                  onChange={(e) => setFormData(prev => ({ ...prev, trabajo: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: Empresa XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puesto
                </label>
                <input
                  type="text"
                  value={formData.puesto}
                  onChange={(e) => setFormData(prev => ({ ...prev, puesto: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: Gerente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sueldo Mensual (DOP)
                </label>
                <input
                  type="number"
                  value={formData.sueldo}
                  onChange={(e) => setFormData(prev => ({ ...prev, sueldo: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: 35000"
                />
                {formData.sueldo && (
                  <p className="text-xs text-gray-500 mt-1">
                    Capacidad estimada: {formatCurrency((parseFloat(formData.sueldo) || 0) * 0.4 * 12)} anual
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Dirección</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: Calle Principal #123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                  className="input-primary"
                  placeholder="Ej: Sector Norte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <select
                  value={formData.provincia}
                  onChange={(e) => setFormData(prev => ({ ...prev, provincia: e.target.value }))}
                  className="input-primary"
                >
                  <option value="">Seleccionar provincia</option>
                  {provinciasRD.map(provincia => (
                    <option key={provincia} value={provincia}>
                      {provincia}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <input
                  type="text"
                  value={formData.pais}
                  onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value }))}
                  className="input-primary"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              className="input-primary"
              placeholder="Observaciones adicionales sobre el garante..."
              rows="3"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Garante activo</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseForm}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingGarante ? 'Actualizar Garante' : 'Crear Garante'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Componente Detalles del Garante
  const GaranteDetails = () => {
    if (!selectedGarante) return null;

    const InfoRow = ({ label, value, icon: Icon, highlight = false }) => (
      <div className={`flex items-start space-x-3 py-3 border-b border-gray-100 ${highlight ? 'bg-blue-50 rounded-lg p-3' : ''}`}>
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${highlight ? 'text-blue-600' : 'text-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${highlight ? 'text-blue-900' : 'text-gray-500'}`}>{label}</p>
          <p className={`text-sm mt-1 ${highlight ? 'text-blue-800 font-semibold' : 'text-gray-900'}`}>
            {value || 'No especificado'}
          </p>
        </div>
      </div>
    );

    const capacidadEndeudamiento = selectedGarante.capacidadEndeudamiento || 
                                 (selectedGarante.sueldo ? (selectedGarante.sueldo * 0.4 * 12) : 0);

    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Detalles del Garante</h3>
          <button
            onClick={handleCloseView}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {/* Información del Cliente Principal */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Cliente Principal</h4>
                <p className="text-sm text-blue-700">{selectedGarante.clienteNombre}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-3">Información Personal</h5>
              <div className="space-y-1">
                <InfoRow label="Nombre" value={selectedGarante.nombre} icon={UserIcon} />
                <InfoRow label="Cédula" value={selectedGarante.cedula} icon={BuildingOfficeIcon} />
                <InfoRow label="Edad" value={`${selectedGarante.edad} años`} icon={UserIcon} />
                <InfoRow label="Celular" value={selectedGarante.celular} icon={PhoneIcon} />
                <InfoRow label="Email" value={selectedGarante.email} icon={MapPinIcon} />
                <InfoRow label="Tipo de Garante" value={selectedGarante.tipoGarante === 'comercial' ? 'Comercial' : 'Personal'} icon={UserGroupIcon} />
                <InfoRow label="Relación" value={selectedGarante.relacionCliente} icon={UserIcon} />
              </div>
            </div>

            {/* Información Laboral y Financiera */}
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-3">Información Laboral</h5>
              <div className="space-y-1 mb-6">
                <InfoRow label="Lugar de Trabajo" value={selectedGarante.trabajo} icon={BuildingOfficeIcon} />
                <InfoRow label="Puesto" value={selectedGarante.puesto} icon={UserIcon} />
                <InfoRow label="Sueldo" value={selectedGarante.sueldo ? `RD$ ${selectedGarante.sueldo.toLocaleString()}` : ''} icon={BuildingOfficeIcon} />
                <InfoRow 
                  label="Capacidad de Endeudamiento" 
                  value={formatCurrency(capacidadEndeudamiento)} 
                  icon={ChartBarIcon} 
                  highlight 
                />
              </div>

              <h5 className="text-sm font-medium text-gray-500 mb-3">Dirección</h5>
              <div className="space-y-1">
                <InfoRow label="Dirección" value={selectedGarante.direccion} icon={MapPinIcon} />
                <InfoRow label="Sector" value={selectedGarante.sector} icon={MapPinIcon} />
                <InfoRow label="Provincia" value={selectedGarante.provincia} icon={MapPinIcon} />
                <InfoRow label="País" value={selectedGarante.pais} icon={MapPinIcon} />
              </div>
            </div>
          </div>

          {/* Información de Garantías */}
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-500 mb-3">Información de Garantías</h5>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedGarante.prestamosActivos || 0}</div>
                  <div className="text-sm text-gray-600">Préstamos Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedGarante.prestamosGarantizados?.length || 0}</div>
                  <div className="text-sm text-gray-600">Total Garantizados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedGarante.activo ? 'Activo' : 'Inactivo'}
                  </div>
                  <div className="text-sm text-gray-600">Estado</div>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {selectedGarante.observaciones && (
            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-500 mb-3">Observaciones</h5>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">{selectedGarante.observaciones}</p>
              </div>
            </div>
          )}

          {/* Estado y Acciones */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  selectedGarante.activo 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedGarante.activo ? 'Activo' : 'Inactivo'}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  Fecha de registro: {new Date(selectedGarante.fechaCreacion).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleCloseView();
                    handleEditGarante(selectedGarante);
                  }}
                  className="btn-primary"
                >
                  Editar Garante
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Garantes</h1>
          <p className="text-gray-600">Gestiona los garantes de los préstamos</p>
        </div>
        <button
          onClick={handleCreateGarante}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nuevo Garante</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && <GaranteForm />}

      {/* Vista de Detalles */}
      {selectedGarante && <GaranteDetails />}

      {/* Estadísticas */}
      {!showForm && !selectedGarante && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Garantes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-green-500">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Garantes Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activos}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-purple-500">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Con Préstamos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.conPrestamos}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-500">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Capacidad Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(stats.capacidadTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Garante
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre, cédula o cliente..."
                    className="input-primary pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Cliente
                </label>
                <select
                  value={selectedClienteFilter}
                  onChange={(e) => setSelectedClienteFilter(e.target.value)}
                  className="input-primary"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filtroActivo}
                  onChange={(e) => setFiltroActivo(e.target.value)}
                  className="input-primary"
                >
                  <option value="todos">Todos</option>
                  <option value="activos">Solo activos</option>
                  <option value="inactivos">Solo inactivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Garantes */}
          <div className="bg-white shadow rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-600">Cargando garantes...</div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Garante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente Principal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capacidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Préstamos Activos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredGarantes.map((garante) => (
                        <tr key={garante.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {garante.nombre}
                              </div>
                              <div className="text-sm text-gray-500">
                                {garante.cedula}
                              </div>
                              <div className="text-xs text-gray-400">
                                {garante.tipoGarante === 'comercial' ? 'Comercial' : 'Personal'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{garante.clienteNombre}</div>
                            <div className="text-sm text-gray-500">
                              {garante.relacionCliente}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{garante.celular}</div>
                            <div className="text-sm text-gray-500">{garante.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(garante.capacidadEndeudamiento)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              (garante.prestamosActivos || 0) > 0 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {garante.prestamosActivos || 0} activos
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              garante.activo 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {garante.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleViewGarante(garante)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalles"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEditGarante(garante)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Editar"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              {garante.activo ? (
                                <button
                                  onClick={() => handleActivateGarante(garante.id, false)}
                                  className="text-orange-600 hover:text-orange-900"
                                  title="Desactivar"
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateGarante(garante.id, true)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Activar"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteGarante(garante.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredGarantes.length === 0 && (
                  <div className="text-center py-12">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay garantes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || selectedClienteFilter !== 'todos' || filtroActivo !== 'todos'
                        ? 'No se encontraron garantes con los filtros aplicados.'
                        : 'Comienza agregando un nuevo garante.'}
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={handleCreateGarante}
                        className="btn-primary"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Nuevo Garante
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Resumen de Clientes con Garantes */}
          {getClientesConGarantes().some(c => c.cantidadGarantes > 0) && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Resumen por Cliente
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getClientesConGarantes()
                    .filter(c => c.cantidadGarantes > 0)
                    .map(cliente => (
                      <div key={cliente.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{cliente.nombre}</h4>
                            <p className="text-sm text-gray-500">
                              {cliente.cantidadGarantes} garante(s) activo(s)
                            </p>
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {cliente.prestamosActivos || 0} préstamos
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {cliente.garantesActivos.map(garante => (
                            <div key={garante.id} className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">{garante.nombre}</span>
                              <span className="text-gray-500">{garante.relacionCliente}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Garantes;