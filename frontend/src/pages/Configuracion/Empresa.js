import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  SparklesIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  ArrowsPointingOutIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

// ============================================
// MODAL DE VISTA PREVIA DEL LOGO
// ============================================
const LogoPreviewModal = ({ isOpen, onClose, logoUrl, empresaNombre }) => {
  const { theme } = useAuth();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-red-600/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-800/10 pointer-events-none" />
          
          <div className="relative p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Vista previa del Logo
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-red-600/20">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo de la empresa" 
                  className="max-w-full max-h-[60vh] object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400?text=Error+al+cargar+imagen';
                  }}
                />
              ) : (
                <div className="text-center p-12">
                  <PhotoIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No hay logo disponible</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
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
// MODAL DE MAPA AMPLIADO (CON BOTONES VISIBLES)
// ============================================
const MapaAmpliadoModal = ({ isOpen, onClose, ubicacion, onSeleccionar }) => {
  const [mapaCargado, setMapaCargado] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [busqueda, setBusqueda] = useState(ubicacion || '');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarMapa();
    }
  }, [isOpen]);

  const cargarMapa = async () => {
    if (!mapaCargado) {
      setLoading(true);
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        setTimeout(() => {
          const container = document.getElementById('mapa-ampliado-container');
          if (!container) return;

          container.innerHTML = '';
          
          const newMap = L.map('mapa-ampliado-container').setView([18.4861, -69.9312], 8);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(newMap);

          const newMarker = L.marker([18.4861, -69.9312]).addTo(newMap)
            .bindPopup('Haz clic para seleccionar')
            .openPopup();

          newMap.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            newMarker.setLatLng([lat, lng]);
            
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
              );
              const data = await response.json();
              const direccion = data.display_name;
              newMarker.bindPopup(direccion).openPopup();
              setBusqueda(direccion);
            } catch (error) {
              console.error('Error obteniendo dirección:', error);
            }
          });

          setMap(newMap);
          setMarker(newMarker);
          setMapaCargado(true);
          setLoading(false);
        }, 100);
      } catch (error) {
        console.error('Error cargando mapa:', error);
        setError('Error al cargar el mapa');
        setLoading(false);
      }
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
    setMostrarSugerencias(false);
    
    if (map && marker) {
      map.setView([parseFloat(lugar.lat), parseFloat(lugar.lon)], 13);
      marker.setLatLng([parseFloat(lugar.lat), parseFloat(lugar.lon)]);
      marker.bindPopup(nombreLugar).openPopup();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-red-600/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-800/10 pointer-events-none" />
          
          <div className="relative p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Buscar ubicación en el mapa
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Mensajes de error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <div className="relative group">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      buscarLugares(e.target.value);
                    }}
                    onFocus={() => busqueda.length >= 3 && setMostrarSugerencias(true)}
                    placeholder="Buscar dirección, ciudad o lugar..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all dark:text-white"
                  />
                  {buscando && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
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

              {loading ? (
                <div className="h-96 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando mapa...</p>
                  </div>
                </div>
              ) : (
                <div 
                  id="mapa-ampliado-container" 
                  className="h-96 rounded-xl overflow-hidden shadow-lg border-2 border-red-600/20"
                ></div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onSeleccionar(busqueda);
                    onClose();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Marcar esta ubicación
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// COMPONENTE DE MAPA INTERACTIVO (MEJORADO)
// ============================================
const MapaInteractivo = ({ ubicacion, onUbicacionChange }) => {
  const [buscando, setBuscando] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [busqueda, setBusqueda] = useState(ubicacion || '');
  const [mapaAmpliadoAbierto, setMapaAmpliadoAbierto] = useState(false);
  const [mapaCargado, setMapaCargado] = useState(false);
  const [mapaError, setMapaError] = useState('');
  const [buscarEnMapa, setBuscarEnMapa] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  // Actualizar búsqueda cuando cambia la ubicación
  useEffect(() => {
    if (ubicacion) {
      setBusqueda(ubicacion);
    }
  }, [ubicacion]);

  // Cargar mapa cuando se activa el checkbox
  useEffect(() => {
    if (buscarEnMapa && busqueda && !mapaCargado) {
      cargarMapaConRetraso();
    }
  }, [buscarEnMapa, busqueda]);

  const cargarMapaConRetraso = () => {
    setTimeout(() => {
      cargarMapaMini();
    }, 500);
  };

  const cargarMapaMini = async () => {
    if (!buscarEnMapa || !busqueda) return;

    try {
      setMapaError('');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        const { lat, lon } = data[0];
        
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        setTimeout(() => {
          const container = document.getElementById('mapa-mini-container');
          if (!container) return;

          container.innerHTML = '';
          
          const newMap = L.map('mapa-mini-container').setView([parseFloat(lat), parseFloat(lon)], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(newMap);

          const newMarker = L.marker([parseFloat(lat), parseFloat(lon)]).addTo(newMap)
            .bindPopup(busqueda)
            .openPopup();

          setMap(newMap);
          setMarker(newMarker);
          setMapaCargado(true);
        }, 100);
      } else {
        setMapaError('No se encontró la ubicación en el mapa');
      }
    } catch (error) {
      console.error('Error cargando mapa mini:', error);
      setMapaError('Error al cargar el mapa');
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
    setMostrarSugerencias(false);
    
    if (buscarEnMapa) {
      setTimeout(() => {
        cargarMapaMini();
      }, 100);
    }
  };

  return (
    <div className="space-y-2">
      {/* Campo de ubicación con botón de ampliar */}
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
            className="w-full pl-10 pr-20 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300 dark:text-white"
          />
          <button
            onClick={() => setMapaAmpliadoAbierto(true)}
            className="absolute right-2 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Ampliar mapa"
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
          {buscando && (
            <div className="absolute right-12">
              <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Checkbox para activar búsqueda en mapa (debajo del campo) */}
      <div className="flex items-center space-x-2 mt-2">
        <button
          onClick={() => {
            setBuscarEnMapa(!buscarEnMapa);
            if (!buscarEnMapa && busqueda) {
              setMapaCargado(false);
              setTimeout(() => {
                cargarMapaMini();
              }, 100);
            }
          }}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            buscarEnMapa ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <motion.div
            animate={{ x: buscarEnMapa ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
          />
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Mostrar mapa interactivo
        </span>
      </div>

      {/* Mapa pequeño (solo si está activado) */}
      {buscarEnMapa && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2"
        >
          {mapaError ? (
            <div className="h-48 rounded-xl bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 flex items-center justify-center">
              <p className="text-red-600 dark:text-red-400 text-sm">{mapaError}</p>
            </div>
          ) : !mapaCargado ? (
            <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cargando mapa...</p>
              </div>
            </div>
          ) : (
            <div 
              id="mapa-mini-container" 
              className="h-48 rounded-xl overflow-hidden shadow-lg border-2 border-red-600/20"
            ></div>
          )}
        </motion.div>
      )}

      {/* Sugerencias de búsqueda */}
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

      {/* Modal de mapa ampliado */}
      <MapaAmpliadoModal
        isOpen={mapaAmpliadoAbierto}
        onClose={() => setMapaAmpliadoAbierto(false)}
        ubicacion={busqueda}
        onSeleccionar={(ubicacion) => {
          onUbicacionChange(ubicacion);
          setBusqueda(ubicacion);
          if (buscarEnMapa) {
            setMapaCargado(false);
            setTimeout(() => {
              cargarMapaMini();
            }, 100);
          }
        }}
      />
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
const TechInput = ({ icon: Icon, label, error, value, onChange, readOnly, ...props }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value && !readOnly) {
      onChange(localValue);
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
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          animate={{ color: isFocused ? '#DC2626' : undefined }}
        >
          {label}
        </motion.label>
      )}
      <div className="relative group">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
          animate={{ opacity: isFocused ? 0.5 : 0 }}
        />
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className={`h-5 w-5 transition-colors duration-300 ${
                isFocused ? 'text-red-500' : 'text-gray-400'
              }`} />
            </div>
          )}
          <input
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white dark:bg-gray-900 border-2 ${
              isFocused 
                ? 'border-red-500 ring-2 ring-red-500/20' 
                : readOnly
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  : 'border-gray-200 dark:border-gray-700'
            } rounded-lg outline-none transition-all duration-300 dark:text-white`}
            value={localValue}
            onChange={handleChange}
            onFocus={() => !readOnly && setIsFocused(true)}
            onBlur={handleBlur}
            readOnly={readOnly}
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
          className="text-sm text-red-600 dark:text-red-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE LOGO PREVIEW CON BOTÓN DE AMPLIAR
// ============================================
const LogoPreview = ({ logoUrl, empresaNombre, onAmpliar }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group h-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onAmpliar}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border-2 border-red-600/20 hover:border-red-600/40 transition-all shadow-xl h-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
          <div className="relative w-44 h-44 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-2 border-red-600/20 group-hover:border-red-600/40 transition-all">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo de la empresa" 
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Error';
                }}
              />
            ) : (
              <div className="text-7xl font-bold bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
                {empresaNombre?.charAt(0) || 'E'}
              </div>
            )}
          </div>
          
          {/* Botón de ampliar (visible al hacer hover) */}
          {isHovered && logoUrl && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white shadow-xl"
            >
              <EyeIcon className="h-5 w-5" />
            </motion.div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {logoUrl ? 'Logo personalizado' : 'Logo por defecto'}
          </p>
          {logoUrl && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-3 text-green-600 dark:text-green-400 text-sm font-medium flex items-center justify-center"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Logo cargado correctamente
            </motion.div>
          )}
        </div>

        {isHovered && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -left-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white shadow-xl"
          >
            <SparklesIcon className="h-5 w-5" />
          </motion.div>
        )}
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
  const { user } = useAuth();
  const [paisSeleccionado, setPaisSeleccionado] = useState('República Dominicana');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [nombrePropietario, setNombrePropietario] = useState('');
  const [apellidoPropietario, setApellidoPropietario] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cambiosPendientes, setCambiosPendientes] = useState(false);
  const [configOriginal, setConfigOriginal] = useState(null);
  const [logoModalAbierto, setLogoModalAbierto] = useState(false);

  // Cargar configuración desde Firebase al iniciar
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const empresaRef = doc(db, 'Configuracion', 'empresa');
        const empresaSnap = await getDoc(empresaRef);
        
        if (empresaSnap.exists()) {
          const data = empresaSnap.data();
          // Actualizar cada campo en la configuración
          Object.keys(data).forEach(key => {
            if (key !== 'actualizadoPor' && key !== 'fechaActualizacion') {
              handleInputChange(null, key, data[key]);
            }
          });
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    };

    cargarConfiguracion();
  }, []);

  // Guardar configuración original para detectar cambios
  useEffect(() => {
    if (configuracion && !configOriginal) {
      setConfigOriginal(JSON.parse(JSON.stringify(configuracion)));
    }
  }, [configuracion]);

  // Detectar cambios
  useEffect(() => {
    if (configOriginal && configuracion) {
      const hayCambios = JSON.stringify(configOriginal) !== JSON.stringify(configuracion);
      setCambiosPendientes(hayCambios);
    }
  }, [configuracion, configOriginal]);

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

  // Guardar en Firebase
  const guardarEnFirebase = async () => {
    try {
      setGuardando(true);
      setError('');
      
      if (!configuracion?.empresaNombre?.trim()) {
        setError('El nombre de la empresa es requerido');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const empresaRef = doc(db, 'Configuracion', 'empresa');
      await setDoc(empresaRef, {
        ...configuracion,
        actualizadoPor: user?.email,
        fechaActualizacion: new Date().toISOString()
      }, { merge: true });

      localStorage.setItem('empresaConfig', JSON.stringify(configuracion));
      
      if (configuracion?.logoUrl) {
        localStorage.setItem('empresaLogo', configuracion.logoUrl);
        window.dispatchEvent(new CustomEvent('logoActualizado', { detail: configuracion.logoUrl }));
      }
      
      if (configuracion?.empresaNombre) {
        localStorage.setItem('empresaNombre', configuracion.empresaNombre);
        window.dispatchEvent(new CustomEvent('empresaNombreActualizado', { detail: configuracion.empresaNombre }));
      }

      setConfigOriginal(JSON.parse(JSON.stringify(configuracion)));
      setExito('Configuración guardada exitosamente');
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('Error guardando en Firestore:', error);
      setError('Error al guardar en Firestore');
    } finally {
      setGuardando(false);
    }
  };

  // Cancelar cambios
  const cancelarCambios = () => {
    if (configOriginal) {
      Object.keys(configOriginal).forEach(key => {
        handleInputChange(null, key, configOriginal[key]);
      });
      
      if (configOriginal.dueno) {
        const partes = configOriginal.dueno.split(' ');
        setNombrePropietario(partes[0] || '');
        setApellidoPropietario(partes.slice(1).join(' ') || '');
      }
      
      setCambiosPendientes(false);
      setExito('Cambios descartados');
      setTimeout(() => setExito(''), 3000);
    }
  };

  return (
    <motion.div
      key="empresa"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Modal de vista previa del logo */}
      <LogoPreviewModal
        isOpen={logoModalAbierto}
        onClose={() => setLogoModalAbierto(false)}
        logoUrl={configuracion?.logoUrl}
        empresaNombre={configuracion?.empresaNombre}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl shadow-lg flex items-center space-x-3"
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {exito && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 rounded-xl shadow-lg flex items-center space-x-3"
          >
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{exito}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
            {/* Fila 1 */}
            <TechInput
              icon={BuildingStorefrontIcon}
              label="Nombre de la Empresa *"
              value={configuracion?.empresaNombre || ''}
              onChange={(value) => handleInputChange(null, 'empresaNombre', value)}
              placeholder="EYS Inversiones"
            />

            <TechInput
              icon={DocumentTextIcon}
              label="RFC/RNC"
              value={configuracion?.rnc || ''}
              onChange={(value) => handleInputChange(null, 'rnc', value)}
              placeholder="123-456789-0"
            />

            {/* Fila 2 */}
            <TechInput
              icon={PhoneIcon}
              label="Teléfono"
              value={configuracion?.numero || ''}
              onChange={(value) => handleInputChange(null, 'numero', value)}
              placeholder="809-123-4567"
            />

            <TechInput
              icon={UserIcon}
              label="Nombre Completo"
              value={configuracion?.dueno || ''}
              onChange={() => {}}
              placeholder="Se genera automáticamente"
              readOnly
            />

            {/* Fila 3 */}
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

            {/* Fila 4 */}
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

            {/* Fila 5 */}
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

            {/* Fila 6: Logo (tamaño grande) y Mapa */}
            <div className="md:col-span-1">
              <TechInput
                icon={PhotoIcon}
                label="URL del Logo"
                value={configuracion?.logoUrl || ''}
                onChange={(value) => handleInputChange(null, 'logoUrl', value)}
                placeholder="https://ejemplo.com/logo.png"
              />
              
              {/* Vista previa del logo (tamaño grande) con botón de ampliar */}
              {configuracion?.logoUrl && (
                <div className="mt-4 h-[320px]">
                  <LogoPreview 
                    logoUrl={configuracion.logoUrl} 
                    empresaNombre={configuracion.empresaNombre}
                    onAmpliar={() => setLogoModalAbierto(true)}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ubicación
              </label>
              <MapaInteractivo 
                ubicacion={configuracion?.ubicacion}
                onUbicacionChange={(value) => handleInputChange(null, 'ubicacion', value)}
              />
            </div>
          </div>

          {/* Barra de acciones */}
          <AnimatePresence>
            {cambiosPendientes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-8 flex justify-end space-x-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelarCambios}
                  disabled={guardando}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                  <XMarkIcon className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Cancelar Cambios</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={guardarEnFirebase}
                  disabled={guardando}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                  {guardando ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin relative z-10" />
                      <span className="relative z-10">Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">Guardar Cambios</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {cambiosPendientes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-end space-x-2 text-sm text-yellow-600 dark:text-yellow-400"
            >
              <ClockIcon className="h-4 w-4 animate-pulse" />
              <span>Hay cambios sin guardar</span>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Empresa;