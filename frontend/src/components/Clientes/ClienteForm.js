import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ClienteForm = ({ cliente, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
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
    activo: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        cedula: cliente.cedula || '',
        edad: cliente.edad || '',
        celular: cliente.celular || '',
        email: cliente.email || '',
        trabajo: cliente.trabajo || '',
        sueldo: cliente.sueldo || '',
        puesto: cliente.puesto || '',
        direccion: cliente.direccion || '',
        sector: cliente.sector || '',
        provincia: cliente.provincia || '',
        pais: cliente.pais || 'República Dominicana',
        activo: cliente.activo !== undefined ? cliente.activo : true
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida';
    if (!formData.celular.trim()) newErrors.celular = 'El celular es requerido';
    if (!formData.edad || formData.edad < 18) newErrors.edad = 'La edad debe ser mayor a 18 años';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const provinciasRD = [
    'Distrito Nacional',
    'Santo Domingo',
    'Santiago',
    'La Vega',
    'San Cristóbal',
    'Puerto Plata',
    'La Altagracia',
    'San Pedro de Macorís',
    'Duarte',
    'Espaillat',
    'Barahona',
    'Valverde',
    'Azua',
    'María Trinidad Sánchez',
    'Monte Plata',
    'Peravia',
    'Hato Mayor',
    'San Juan',
    'Monseñor Nouel',
    'Monte Cristi',
    'Sánchez Ramírez',
    'El Seibo',
    'Dajabón',
    'Samaná',
    'Santiago Rodríguez',
    'Elías Piña',
    'Independencia',
    'Baoruco',
    'Pedernales',
    'San José de Ocoa'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onCancel}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p className="text-gray-600">
            {cliente ? 'Actualiza la información del cliente' : 'Agrega un nuevo cliente al sistema'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Cédula *
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="input-primary"
                  placeholder="Ej: 001-1234567-8"
                />
                {errors.cedula && <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad *
                </label>
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  className="input-primary"
                  placeholder="Ej: 30"
                  min="18"
                />
                {errors.edad && <p className="text-red-600 text-sm mt-1">{errors.edad}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Celular *
                </label>
                <input
                  type="tel"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  className="input-primary"
                  placeholder="Ej: 809-123-4567"
                />
                {errors.celular && <p className="text-red-600 text-sm mt-1">{errors.celular}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-primary"
                  placeholder="Ej: cliente@email.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Laboral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar de Trabajo
                </label>
                <input
                  type="text"
                  name="trabajo"
                  value={formData.trabajo}
                  onChange={handleChange}
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
                  name="puesto"
                  value={formData.puesto}
                  onChange={handleChange}
                  className="input-primary"
                  placeholder="Ej: Gerente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sueldo (DOP)
                </label>
                <input
                  type="number"
                  name="sueldo"
                  value={formData.sueldo}
                  onChange={handleChange}
                  className="input-primary"
                  placeholder="Ej: 35000"
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dirección</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
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
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="input-primary"
                  placeholder="Ej: Sector Norte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <select
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleChange}
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
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  className="input-primary"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Cliente activo</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {cliente ? 'Actualizar Cliente' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClienteForm;