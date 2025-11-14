import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon, // NUEVO ICONO
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useError } from '../context/ErrorContext';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);
  
  const { showError, showSuccess, showWarning } = useError();

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Cargando usuarios desde API...');
      
      const response = await api.get('/usuarios');
      console.log('Usuarios cargados:', response.data);
      
      setUsuarios(response.data || []);
      setApiConnected(true);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      
      const errorMessage = error.message || 'Error al cargar los usuarios';
      showError(errorMessage);
      
      setApiConnected(false);
      // Datos de ejemplo para desarrollo
      setUsuarios(getMockUsuarios());
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Datos de ejemplo
  const getMockUsuarios = () => {
    return [
      {
        id: '1',
        email: 'admin@eysinversiones.com',
        nombre: 'Administrador Principal',
        rol: 'admin',
        activo: true,
        telefono: '809-123-4567',
        departamento: 'Administración',
        fechaCreacion: new Date().toISOString()
      },
      {
        id: '2',
        email: 'supervisor@eysinversiones.com',
        nombre: 'María Rodríguez',
        rol: 'supervisor',
        activo: true,
        telefono: '809-987-6543',
        departamento: 'Supervisión',
        fechaCreacion: new Date().toISOString()
      },
      {
        id: '3',
        email: 'empleado1@eysinversiones.com',
        nombre: 'Carlos López',
        rol: 'solicitante',
        activo: true,
        telefono: '809-555-7890',
        departamento: 'Ventas',
        fechaCreacion: new Date().toISOString()
      }
    ];
  };

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const usuariosActivos = usuarios.filter(u => u.activo !== false);
  const stats = {
    total: usuarios.length,
    activos: usuariosActivos.length,
    inactivos: usuarios.length - usuariosActivos.length,
    porRol: {
      admin: usuarios.filter(u => u.rol === 'admin').length,
      supervisor: usuarios.filter(u => u.rol === 'supervisor').length,
      solicitante: usuarios.filter(u => u.rol === 'solicitante').length,
      consultor: usuarios.filter(u => u.rol === 'consultor').length
    }
  };

  const handleCreateUsuario = () => {
    setEditingUsuario(null);
    setShowForm(true);
  };

  const handleEditUsuario = (usuario) => {
    setEditingUsuario(usuario);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditingUsuario(null);
    setSearchTerm('');
    setShowSearch(false);
  };

  const handleSaveUsuario = async (usuarioData) => {
    try {
      if (editingUsuario) {
        console.log('Actualizando usuario:', editingUsuario.id, usuarioData);
        await api.put(`/usuarios/${editingUsuario.id}`, usuarioData);
        showSuccess('Usuario actualizado exitosamente');
      } else {
        console.log('Creando nuevo usuario:', usuarioData);
        await api.post('/usuarios', usuarioData);
        showSuccess('Usuario creado exitosamente');
      }
      
      await fetchUsuarios();
      setShowForm(false);
      
    } catch (error) {
      console.error('Error saving user:', error);
      showError(error.message || 'Error al guardar el usuario');
    }
  };

  const handleDeleteUsuario = async (usuarioId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        console.log('Eliminando usuario:', usuarioId);
        await api.delete(`/usuarios/${usuarioId}`);
        
        showSuccess('Usuario eliminado exitosamente');
        await fetchUsuarios();
        
      } catch (error) {
        console.error('Error deleting user:', error);
        showError(error.message || 'Error al eliminar el usuario');
      }
    }
  };

  const handleReactivarUsuario = async (usuarioId) => {
    if (window.confirm('¿Estás seguro de que quieres reactivar este usuario?')) {
      try {
        console.log('Reactivando usuario:', usuarioId);
        await api.put(`/usuarios/${usuarioId}/reactivar`);
        
        showSuccess('Usuario reactivado exitosamente');
        await fetchUsuarios();
        
      } catch (error) {
        console.error('Error reactivating user:', error);
        showError(error.message || 'Error al reactivar el usuario');
      }
    }
  };

  // Funciones de utilidad
  const getRolStyles = (rol) => {
    switch (rol) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'solicitante':
        return 'bg-green-100 text-green-800';
      case 'consultor':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRolText = (rol) => {
    const roles = {
      admin: 'Administrador',
      supervisor: 'Supervisor',
      solicitante: 'Solicitante',
      consultor: 'Consultor'
    };
    return roles[rol] || rol;
  };

  const getEstadoIcon = (activo) => {
    return activo ? 
      <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
      <XCircleIcon className="h-5 w-5 text-red-500" />;
  };

 // Componente de Formulario MEJORADO
const UsuarioForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    password: '', // NUEVO CAMPO
    rol: 'solicitante',
    telefono: '',
    departamento: '',
    activo: true,
    ...(editingUsuario || {})
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // Para mostrar/ocultar contraseña

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email es inválido';
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    // Validar contraseña solo para nuevos usuarios o si se está cambiando
    if (!editingUsuario && !formData.password) {
      newErrors.password = 'La contraseña es requerida para nuevos usuarios';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Si es edición y no se cambió la contraseña, remover el campo
      const dataToSend = editingUsuario && !formData.password 
        ? { ...formData, password: undefined }
        : formData;
      
      handleSaveUsuario(dataToSend);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-primary"
              placeholder="usuario@empresa.com"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="input-primary"
              placeholder="Ej: Juan Pérez"
            />
            {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña {!editingUsuario && '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-primary pr-10"
                placeholder={editingUsuario ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeSlashIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            {editingUsuario && (
              <p className="text-xs text-gray-500 mt-1">
                Solo completa este campo si deseas cambiar la contraseña
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol *
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="input-primary"
            >
              <option value="solicitante">Solicitante</option>
              <option value="supervisor">Supervisor</option>
              <option value="consultor">Consultor</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.rol && <p className="text-red-600 text-sm mt-1">{errors.rol}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="input-primary"
              placeholder="809-123-4567"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento
            </label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              className="input-primary"
              placeholder="Ej: Ventas, Administración, etc."
            />
          </div>

          {editingUsuario && (
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Usuario activo</span>
              </label>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleBackToList}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {editingUsuario ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

  if (showForm) {
    return <UsuarioForm />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gestiona los usuarios del sistema</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Botón de Búsqueda */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="btn-secondary flex items-center space-x-2 p-3"
            title="Buscar usuarios"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          
          {/* Botón de Nuevo Usuario */}
          <button
            onClick={handleCreateUsuario}
            className="btn-primary flex items-center space-x-2 p-3"
            title="Nuevo usuario"
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
              Modo desarrollo: Usando datos de ejemplo. El backend no está conectado.
            </span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-white rounded-lg shadow-sm p-4 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, email o departamento..."
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactivos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.porRol.admin}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600">Cargando usuarios...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
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
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {usuario.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usuario.telefono || 'No especificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usuario.departamento || 'No especificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRolStyles(usuario.rol)}`}>
                          {getRolText(usuario.rol)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getEstadoIcon(usuario.activo)}
                          <span className="text-sm text-gray-900">
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => handleEditUsuario(usuario)}
                            className="text-yellow-600 hover:text-yellow-900 p-2 rounded hover:bg-yellow-50 transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          {usuario.activo ? (
                            <button
                              onClick={() => handleDeleteUsuario(usuario.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                              title="Desactivar"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivarUsuario(usuario.id)}
                              className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 transition-colors"
                              title="Reactivar"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsuarios.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  {searchTerm ? 'No se encontraron usuarios con esos criterios' : 'No hay usuarios registrados'}
                </div>
                {!searchTerm && (
                  <button
                    onClick={handleCreateUsuario}
                    className="btn-primary flex items-center space-x-2 mx-auto"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    <span>Crear Primer Usuario</span>
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
      {filteredUsuarios.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredUsuarios.length} usuario{filteredUsuarios.length !== 1 ? 's' : ''} mostrados
            {searchTerm && ` de ${usuarios.length} en total`}
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
              onClick={handleCreateUsuario}
              className="btn-primary flex items-center space-x-2 text-sm"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;