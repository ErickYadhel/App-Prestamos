import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// ============================================
// COMPONENTE DE BORDE LUMINOSO
// ============================================
const BorderGlow = ({ children, isHovered, color = 'from-red-600 via-red-500 to-red-600' }) => (
  <div className="relative group">
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-0 transition-all duration-500 ${
      isHovered ? 'opacity-75' : 'group-hover:opacity-50'
    }`} />
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur-lg opacity-0 transition-all duration-700 ${
      isHovered ? 'opacity-50' : 'group-hover:opacity-30'
    }`} />
    <div className="relative">
      {children}
    </div>
  </div>
);

// ============================================
// COMPONENTE DE INPUT TECNOLÓGICO
// ============================================
const TechInput = ({ icon: Icon, label, error, value, onChange, type = 'text', placeholder, required, disabled, name, ...props }) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) {
      onChange({ target: { name, value: localValue, type: 'text' } });
    }
  };

  return (
    <motion.div 
      className="space-y-1"
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {label && (
        <motion.label 
          className="block text-xs sm:text-sm font-medium mb-1"
          animate={{ color: isFocused ? '#DC2626' : theme === 'dark' ? '#9CA3AF' : '#374151' }}
        >
          {label} {required && <span className="text-red-600">*</span>}
        </motion.label>
      )}
      <div className="relative group">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
          animate={{ opacity: isFocused ? 0.5 : 0 }}
        />
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                isFocused ? 'text-red-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
          )}
          <input
            type={type}
            name={name}
            value={localValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            disabled={disabled}
            className={`w-full ${Icon ? 'pl-8 sm:pl-10' : 'pl-3 sm:pl-4'} pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm rounded-lg border-2 ${
              isFocused 
                ? 'border-red-500 ring-2 ring-red-500/20' 
                : disabled
                  ? theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'border-gray-700 bg-gray-800 text-white'
                    : 'border-gray-200 bg-white text-gray-900'
            } focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300`}
            placeholder={placeholder}
            {...props}
          />
          <motion.div 
            className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/50 rounded-lg pointer-events-none transition-colors"
            animate={{ borderColor: isFocused ? '#DC262680' : 'transparent' }}
          />
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 dark:text-red-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SELECT TECNOLÓGICO
// ============================================
const TechSelect = ({ icon: Icon, label, error, value, onChange, options, placeholder, required, disabled, name }) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    onChange(e);
  };

  return (
    <motion.div 
      className="space-y-1"
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {label && (
        <motion.label 
          className="block text-xs sm:text-sm font-medium mb-1"
          animate={{ color: isFocused ? '#DC2626' : theme === 'dark' ? '#9CA3AF' : '#374151' }}
        >
          {label} {required && <span className="text-red-600">*</span>}
        </motion.label>
      )}
      <div className="relative group">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
          animate={{ opacity: isFocused ? 0.5 : 0 }}
        />
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                isFocused ? 'text-red-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
          )}
          <select
            name={name}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={`w-full ${Icon ? 'pl-8 sm:pl-10' : 'pl-3 sm:pl-4'} pr-8 sm:pr-10 py-2 sm:py-2.5 text-sm rounded-lg border-2 appearance-none ${
              isFocused 
                ? 'border-red-500 ring-2 ring-red-500/20' 
                : disabled
                  ? theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'border-gray-700 bg-gray-800 text-white'
                    : 'border-gray-200 bg-white text-gray-900'
            } focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 cursor-pointer`}
          >
            <option value="">{placeholder || 'Seleccionar...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
            <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 dark:text-red-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE PREVIEW DE FOTO
// ============================================
const FotoPreview = ({ fotoUrl, onFotoChange, onFotoRemove }) => {
  const { theme } = useTheme();
  const [preview, setPreview] = useState(fotoUrl || '');

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onFotoChange(url);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
      <div className="relative group">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Vista previa"
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover border-2 border-red-600/30"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/80?text=Error';
              }}
            />
            <button
              type="button"
              onClick={() => {
                setPreview('');
                onFotoRemove();
              }}
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white rounded-full p-0.5 sm:p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="h-2 w-2 sm:h-3 sm:w-3" />
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <PhotoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex-1 w-full">
        <label className={`block text-xs sm:text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Foto de perfil (URL)
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
            <PhotoIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <input
            type="url"
            value={fotoUrl || ''}
            onChange={handleUrlChange}
            className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm rounded-lg border-2 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
            } focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Ingresa una URL de imagen
        </p>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const ClienteForm = ({ cliente, onSave, onCancel }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
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
    activo: true,
    foto: '',
    notas: ''
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
        activo: cliente.activo !== undefined ? cliente.activo : true,
        foto: cliente.foto || '',
        notas: cliente.notas || ''
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFotoChange = (fotoUrl) => {
    setFormData(prev => ({ ...prev, foto: fotoUrl }));
  };

  const handleFotoRemove = () => {
    setFormData(prev => ({ ...prev, foto: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida';
    if (!formData.celular.trim()) newErrors.celular = 'El celular es requerido';
    if (!formData.edad || formData.edad < 18) newErrors.edad = 'La edad debe ser mayor a 18 años';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (formData.foto && !isValidUrl(formData.foto)) newErrors.foto = 'La URL de la foto no es válida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSend = {
        ...formData,
        ...(cliente ? {} : { creadoPor: user?.email, fechaRegistro: new Date().toISOString() })
      };
      onSave(dataToSend);
    }
  };

  const provinciasRD = [
    { value: 'Distrito Nacional', label: 'Distrito Nacional' },
    { value: 'Santo Domingo', label: 'Santo Domingo' },
    { value: 'Santiago', label: 'Santiago' },
    { value: 'La Vega', label: 'La Vega' },
    { value: 'San Cristóbal', label: 'San Cristóbal' },
    { value: 'Puerto Plata', label: 'Puerto Plata' },
    { value: 'La Altagracia', label: 'La Altagracia' },
    { value: 'San Pedro de Macorís', label: 'San Pedro de Macorís' },
    { value: 'Duarte', label: 'Duarte' },
    { value: 'Espaillat', label: 'Espaillat' },
    { value: 'Barahona', label: 'Barahona' },
    { value: 'Valverde', label: 'Valverde' },
    { value: 'Azua', label: 'Azua' },
    { value: 'María Trinidad Sánchez', label: 'María Trinidad Sánchez' },
    { value: 'Monte Plata', label: 'Monte Plata' },
    { value: 'Peravia', label: 'Peravia' },
    { value: 'Hato Mayor', label: 'Hato Mayor' },
    { value: 'San Juan', label: 'San Juan' },
    { value: 'Monseñor Nouel', label: 'Monseñor Nouel' },
    { value: 'Monte Cristi', label: 'Monte Cristi' },
    { value: 'Sánchez Ramírez', label: 'Sánchez Ramírez' },
    { value: 'El Seibo', label: 'El Seibo' },
    { value: 'Dajabón', label: 'Dajabón' },
    { value: 'Samaná', label: 'Samaná' },
    { value: 'Santiago Rodríguez', label: 'Santiago Rodríguez' },
    { value: 'Elías Piña', label: 'Elías Piña' },
    { value: 'Independencia', label: 'Independencia' },
    { value: 'Baoruco', label: 'Baoruco' },
    { value: 'Pedernales', label: 'Pedernales' },
    { value: 'San José de Ocoa', label: 'San José de Ocoa' }
  ];

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <BorderGlow isHovered={isHovered}>
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 blur-3xl" />
          
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${
              theme === 'dark' ? '#fff' : '#000'
            } 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />

          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-red-600/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCancel}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 text-white hover:bg-white/20' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </motion.button>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
                    <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent`}>
                      {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h1>
                    <p className={`text-xs sm:text-sm mt-1 flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1" />
                      {cliente ? 'Actualiza la información del cliente' : 'Agrega un nuevo cliente al sistema'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <CpuChipIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {cliente ? 'Editando cliente' : 'Nuevo registro'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </BorderGlow>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <BorderGlow>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-red-800/5" />
            
            <div className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border-2 border-red-600/20 overflow-hidden`}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan" />
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Foto de perfil */}
                <div className="mb-6">
                  <FotoPreview
                    fotoUrl={formData.foto}
                    onFotoChange={handleFotoChange}
                    onFotoRemove={handleFotoRemove}
                  />
                  {errors.foto && <p className="text-xs text-red-600 mt-1">{errors.foto}</p>}
                </div>

                {/* Información Personal */}
                <div>
                  <h3 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TechInput
                      icon={UserIcon}
                      label="Nombre Completo"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Juan Pérez"
                      error={errors.nombre}
                      required
                    />

                    <TechInput
                      icon={IdentificationIcon}
                      label="Cédula"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      placeholder="Ej: 001-1234567-8"
                      error={errors.cedula}
                      required
                    />

                    <TechInput
                      icon={CalendarIcon}
                      label="Edad"
                      name="edad"
                      type="number"
                      value={formData.edad}
                      onChange={handleChange}
                      placeholder="Ej: 30"
                      min="18"
                      error={errors.edad}
                      required
                    />

                    <TechInput
                      icon={PhoneIcon}
                      label="Celular"
                      name="celular"
                      value={formData.celular}
                      onChange={handleChange}
                      placeholder="Ej: 809-123-4567"
                      error={errors.celular}
                      required
                    />

                    <TechInput
                      icon={EnvelopeIcon}
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Ej: cliente@email.com"
                      error={errors.email}
                    />
                  </div>
                </div>

                {/* Información Laboral */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Información Laboral
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TechInput
                      icon={BuildingOfficeIcon}
                      label="Lugar de Trabajo"
                      name="trabajo"
                      value={formData.trabajo}
                      onChange={handleChange}
                      placeholder="Ej: Empresa XYZ"
                    />

                    <TechInput
                      icon={BriefcaseIcon}
                      label="Puesto"
                      name="puesto"
                      value={formData.puesto}
                      onChange={handleChange}
                      placeholder="Ej: Gerente"
                    />

                    <TechInput
                      icon={CurrencyDollarIcon}
                      label="Sueldo (DOP)"
                      name="sueldo"
                      type="number"
                      value={formData.sueldo}
                      onChange={handleChange}
                      placeholder="Ej: 35000"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Dirección
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <TechInput
                        icon={MapPinIcon}
                        label="Dirección Completa"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Ej: Calle Principal #123"
                      />
                    </div>

                    <TechInput
                      icon={MapPinIcon}
                      label="Sector"
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      placeholder="Ej: Sector Norte"
                    />

                    <TechSelect
                      icon={MapPinIcon}
                      label="Provincia"
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleChange}
                      options={provinciasRD}
                      placeholder="Seleccionar provincia"
                    />

                    <TechInput
                      icon={GlobeAltIcon}
                      label="País"
                      name="pais"
                      value={formData.pais}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                {/* Notas adicionales */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Notas adicionales
                  </h3>
                  <div className="relative group">
                    <textarea
                      name="notas"
                      value={formData.notas}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg border-2 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                      } focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none`}
                      placeholder="Información adicional relevante..."
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
                    />
                    <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cliente activo
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className={`p-4 sm:p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 bg-gradient-to-r ${
                theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-white'
              }`}>
                <button
                  type="button"
                  onClick={onCancel}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm rounded-lg font-medium transition-colors ${
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
                  type="submit"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{cliente ? 'Actualizar Cliente' : 'Crear Cliente'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </BorderGlow>
      </form>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ClienteForm;