import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PhotoIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// ============================================
// COMPONENTE DE MAPA INTERACTIVO
// ============================================
const MapaInteractivo = ({ ubicacion, onUbicacionChange }) => {
  const [mapUrl, setMapUrl] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [busqueda, setBusqueda] = useState(ubicacion || '');

  useEffect(() => {
    if (ubicacion && ubicacion.trim() !== '') {
      actualizarMapa(ubicacion);
    }
  }, [ubicacion]);

  const actualizarMapa = (lugar) => {
    if (lugar && lugar.trim() !== '') {
      const encodedLocation = encodeURIComponent(lugar);
      setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=-180,-90,180,90&layer=mapnik&marker=0,0&q=${encodedLocation}`);
    } else {
      setMapUrl(null);
    }
  };

  const buscarLugares = async (texto) => {
    if (texto.length < 3) {
      setSugerencias([]);
      return;
    }

    setBuscando(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&limit=5&countrycodes=do,us,es,mx`
      );
      const data = await response.json();
      setSugerencias(data);
      setMostrarSugerencias(true);
    } catch (error) {
      console.error('Error buscando lugares:', error);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarLugar = (lugar) => {
    const nombreLugar = lugar.display_name;
    setBusqueda(nombreLugar);
    onUbicacionChange(nombreLugar);
    actualizarMapa(nombreLugar);
    setMostrarSugerencias(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          <div className="relative flex items-center">
            <MapPinIcon className="absolute left-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                buscarLugares(e.target.value);
              }}
              onFocus={() => busqueda.length >= 3 && setMostrarSugerencias(true)}
              placeholder="Buscar dirección, ciudad o lugar..."
              className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 dark:text-white"
            />
            {buscando && (
              <div className="absolute right-3">
                <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {mostrarSugerencias && sugerencias.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-red-600/20 max-h-60 overflow-y-auto">
            {sugerencias.map((lugar, index) => (
              <button
                key={index}
                onClick={() => seleccionarLugar(lugar)}
                className="w-full text-left px-4 py-3 flex items-start space-x-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700"
              >
                <MapPinIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lugar.display_name.split(',')[0]}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{lugar.display_name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {mapUrl ? (
        <div className="h-72 rounded-xl overflow-hidden shadow-lg border-2 border-red-600/20">
          <iframe
            title="Mapa de ubicación"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={mapUrl}
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center border-2 border-red-600/20">
          <MapPinIcon className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Busca y selecciona una ubicación en el mapa</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// ============================================
// COMPONENTE DE INPUT TECNOLÓGICO
// ============================================
const TechInput = ({ icon: Icon, label, error, value, onChange, ...props }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
          )}
          <input
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 dark:text-white`}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/50 rounded-lg pointer-events-none transition-colors"></div>
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE DE LOGO PREVIEW
// ============================================
const LogoPreview = ({ logoUrl, empresaNombre }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border-2 border-red-600/20 hover:border-red-600/40 transition-all shadow-xl">
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
            <div className="relative w-40 h-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-2 border-red-600/20 group-hover:border-red-600/40 transition-all">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo de la empresa" 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-6xl font-bold bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
                  {empresaNombre?.charAt(0) || 'E'}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {empresaNombre || 'EYS Inversiones'}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vista previa del logo - Aparecerá en el sidebar, reportes y documentos
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium">
                {logoUrl ? 'Logo personalizado' : 'Logo por defecto'}
              </span>
              {logoUrl && (
                <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                  ✓ Logo cargado
                </span>
              )}
            </div>
          </div>

          {isHovered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white shadow-xl"
            >
              <SparklesIcon className="h-6 w-6" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// DATOS DE PAÍSES Y PROVINCIAS
// ============================================
const paisesData = {
  'República Dominicana': {
    codigo: 'DO',
    bandera: '🇩🇴',
    provincias: [
      'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Vega', 'Puerto Plata',
      'San Cristóbal', 'San Pedro de Macorís', 'La Romana', 'Duarte', 'Espaillat',
      'Monseñor Nouel', 'Sánchez Ramírez', 'Hermanas Mirabal', 'María Trinidad Sánchez',
      'Samaná', 'Valverde', 'Monte Cristi', 'Dajabón', 'Santiago Rodríguez',
      'Bahoruco', 'Independencia', 'Pedernales', 'Barahona', 'Azua',
      'Peravia', 'San José de Ocoa', 'El Seibo', 'Hato Mayor', 'Monte Plata',
      'Elías Piña', 'San Juan'
    ]
  },
  'Estados Unidos': {
    codigo: 'US',
    bandera: '🇺🇸',
    provincias: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
      'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
      'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
      'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
      'West Virginia', 'Wisconsin', 'Wyoming'
    ]
  },
  'España': {
    codigo: 'ES',
    bandera: '🇪🇸',
    provincias: [
      'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga',
      'Murcia', 'Palma de Mallorca', 'Las Palmas', 'Bilbao', 'Alicante',
      'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet de Llobregat',
      'Vitoria', 'La Coruña', 'Granada', 'Elche', 'Oviedo', 'Badalona',
      'Cartagena', 'Terrassa', 'Jerez de la Frontera', 'Sabadell',
      'Santa Cruz de Tenerife', 'Móstoles', 'Alcalá de Henares', 'Pamplona'
    ]
  },
  'México': {
    codigo: 'MX',
    bandera: '🇲🇽',
    provincias: [
      'Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Estado de México',
      'Guanajuato', 'Veracruz', 'Baja California', 'Coahuila', 'Chihuahua',
      'Sinaloa', 'Sonora', 'Michoacán', 'Tamaulipas', 'Oaxaca', 'Chiapas',
      'Guerrero', 'Querétaro', 'Yucatán', 'Morelos', 'Durango', 'Zacatecas',
      'Aguascalientes', 'Colima', 'Campeche', 'Baja California Sur',
      'Nayarit', 'Tabasco', 'San Luis Potosí', 'Hidalgo', 'Quintana Roo'
    ]
  }
};

// ============================================
// COMPONENTE PRINCIPAL: EMPRESA
// ============================================
const Empresa = ({ configuracion, handleInputChange }) => {
  const [paisSeleccionado, setPaisSeleccionado] = useState('República Dominicana');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [nombrePropietario, setNombrePropietario] = useState('');
  const [apellidoPropietario, setApellidoPropietario] = useState('');

  useEffect(() => {
    if (configuracion?.dueno) {
      const partes = configuracion.dueno.split(' ');
      setNombrePropietario(partes[0] || '');
      setApellidoPropietario(partes.slice(1).join(' ') || '');
    }
  }, [configuracion?.dueno]);

  const actualizarNombreCompleto = (nombre, apellido) => {
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    handleInputChange(null, 'dueno', nombreCompleto);
  };

  useEffect(() => {
    if (provinciaSeleccionada && paisSeleccionado) {
      const nuevaUbicacion = `${provinciaSeleccionada}, ${paisSeleccionado}`;
      handleInputChange(null, 'ubicacion', nuevaUbicacion);
    }
  }, [provinciaSeleccionada, paisSeleccionado]);

  return (
    <motion.div
      key="empresa"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
              <BuildingStorefrontIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Información de la Empresa</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Datos principales de tu negocio</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechInput
              icon={BuildingStorefrontIcon}
              label="Nombre de la Empresa *"
              value={configuracion?.empresaNombre || ''}
              onChange={(value) => handleInputChange(null, 'empresaNombre', value)}
              placeholder="EYS Inversiones"
            />

            <TechInput
              icon={UserIcon}
              label="Nombre del Propietario"
              value={nombrePropietario}
              onChange={(value) => {
                setNombrePropietario(value);
                actualizarNombreCompleto(value, apellidoPropietario);
              }}
              placeholder="Nombre"
            />

            <TechInput
              icon={UserIcon}
              label="Apellido del Propietario"
              value={apellidoPropietario}
              onChange={(value) => {
                setApellidoPropietario(value);
                actualizarNombreCompleto(nombrePropietario, value);
              }}
              placeholder="Apellido"
            />

            <TechInput
              icon={PhoneIcon}
              label="Teléfono"
              value={configuracion?.numero || ''}
              onChange={(value) => handleInputChange(null, 'numero', value)}
              placeholder="809-123-4567"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                País
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative">
                  <GlobeAltIcon className="absolute inset-y-0 left-0 pl-3 flex items-center h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  <select
                    value={paisSeleccionado}
                    onChange={(e) => setPaisSeleccionado(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 appearance-none dark:text-white cursor-pointer"
                  >
                    {Object.keys(paisesData).map(pais => (
                      <option key={pais} value={pais}>
                        {paisesData[pais].bandera} {pais}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute inset-y-0 right-0 pr-3 flex items-center h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Provincia / Ciudad
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative">
                  <MapPinIcon className="absolute inset-y-0 left-0 pl-3 flex items-center h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  <select
                    value={provinciaSeleccionada}
                    onChange={(e) => setProvinciaSeleccionada(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 appearance-none dark:text-white cursor-pointer"
                  >
                    <option value="">Seleccionar provincia</option>
                    {paisesData[paisSeleccionado]?.provincias.map(provincia => (
                      <option key={provincia} value={provincia}>{provincia}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute inset-y-0 right-0 pr-3 flex items-center h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <TechInput
              icon={EnvelopeIcon}
              label="Correo Electrónico"
              type="email"
              value={configuracion?.correo || ''}
              onChange={(value) => handleInputChange(null, 'correo', value)}
              placeholder="info@empresa.com"
            />

            <TechInput
              icon={GlobeAltIcon}
              label="Sitio Web"
              value={configuracion?.sitioWeb || ''}
              onChange={(value) => handleInputChange(null, 'sitioWeb', value)}
              placeholder="https://www.eysinversiones.com"
            />

            <TechInput
              icon={DocumentTextIcon}
              label="RFC/RNC"
              value={configuracion?.rnc || ''}
              onChange={(value) => handleInputChange(null, 'rnc', value)}
              placeholder="123-456789-0"
            />

            <div className="md:col-span-2">
              <TechInput
                icon={PhotoIcon}
                label="URL del Logo"
                value={configuracion?.logoUrl || ''}
                onChange={(value) => handleInputChange(null, 'logoUrl', value)}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </div>

          {configuracion?.logoUrl && (
            <div className="mt-6">
              <LogoPreview 
                logoUrl={configuracion.logoUrl} 
                empresaNombre={configuracion.empresaNombre} 
              />
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <MapPinIcon className="h-4 w-4 text-red-600 mr-2" />
              Ubicación en el mapa
            </h4>
            <MapaInteractivo 
              ubicacion={configuracion?.ubicacion}
              onUbicacionChange={(value) => handleInputChange(null, 'ubicacion', value)}
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Empresa;