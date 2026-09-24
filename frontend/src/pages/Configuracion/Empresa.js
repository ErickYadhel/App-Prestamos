import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  ArrowsPointingOutIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// MODAL DE VISTA PREVIA DEL LOGO
// ============================================
const LogoPreviewModal = ({ isOpen, onClose, logoUrl, empresaNombre }) => {
  const { theme } = useTheme();
  
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
          className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border-2 ${
            theme === 'dark' 
              ? 'bg-gray-900 border-red-600/30' 
              : 'bg-white border-red-600/30'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`absolute inset-0 pointer-events-none ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-red-600/10 to-red-800/10'
              : 'bg-gradient-to-br from-red-600/5 to-red-800/5'
          }`} />
          
          <div className="relative p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg sm:text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Vista previa del Logo
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-red-900/30 text-gray-400'
                    : 'hover:bg-red-100 text-gray-600'
                }`}
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className={`flex flex-col items-center justify-center p-4 sm:p-8 rounded-xl border-2 border-red-600/20 ${
              theme === 'dark' 
                ? 'bg-gray-800' 
                : 'bg-gray-50'
            }`}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo de la empresa" 
                  className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400?text=Error+al+cargar+imagen';
                  }}
                />
              ) : (
                <div className="text-center p-8 sm:p-12">
                  <PhotoIcon className={`h-16 w-16 sm:h-24 sm:w-24 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay logo disponible
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
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
// MODAL DE MAPA AMPLIADO
// ============================================
const MapaAmpliadoModal = ({ isOpen, onClose, ubicacion, onSeleccionar }) => {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = useState(ubicacion || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const containerId = useRef('mapa-ampliado-container');
  const mapaCargadoRef = useRef(false);
  const leafletRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setBusqueda(ubicacion || '');
      mapaCargadoRef.current = false;
      setLoading(true);
      setTimeout(() => cargarMapa(), 400);
    }
  }, [isOpen, ubicacion]);

  const cargarMapa = async () => {
    if (!isOpen) return;
    
    try {
      setLoading(true);
      setError('');

      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      
      leafletRef.current = L;

      const container = document.getElementById(containerId.current);
      if (!container) {
        setError('No se pudo cargar el mapa');
        setLoading(false);
        return;
      }

      container.innerHTML = '';

      const map = L.map(containerId.current, {
        center: [18.4861, -69.9312],
        zoom: 8,
        zoomControl: true,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      if (busqueda && busqueda.trim() !== '') {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}&limit=1`
          );
          const data = await response.json();
          
          if (data && data[0]) {
            const { lat, lon } = data[0];
            map.setView([parseFloat(lat), parseFloat(lon)], 13);
            L.marker([parseFloat(lat), parseFloat(lon)]).addTo(map)
              .bindPopup(busqueda)
              .openPopup();
          }
        } catch (searchError) {
          console.warn('Error buscando ubicación:', searchError);
        }
      }

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });
        
        const marker = L.marker([lat, lng]).addTo(map);
        marker.openPopup();

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const direccion = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          marker.bindPopup(direccion).openPopup();
          setBusqueda(direccion);
        } catch (error) {
          console.error('Error obteniendo dirección:', error);
          const direccion = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          marker.bindPopup(direccion).openPopup();
          setBusqueda(direccion);
        }
      });

      mapRef.current = map;
      mapaCargadoRef.current = true;
      setLoading(false);

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 300);

    } catch (error) {
      console.error('Error cargando mapa:', error);
      setError('Error al cargar el mapa. Revisa tu conexión.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      mapaCargadoRef.current = false;
      leafletRef.current = null;
    }
  }, [isOpen]);

  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [buscando, setBuscando] = useState(false);

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
    
    if (mapRef.current && leafletRef.current) {
      const L = leafletRef.current;
      const map = mapRef.current;
      map.setView([parseFloat(lugar.lat), parseFloat(lugar.lon)], 13);
      
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      
      L.marker([parseFloat(lugar.lat), parseFloat(lugar.lon)]).addTo(map)
        .bindPopup(nombreLugar)
        .openPopup();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`relative w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border-2 ${
            theme === 'dark' 
              ? 'bg-gray-900 border-red-600/30' 
              : 'bg-white border-red-600/30'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg sm:text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Buscar ubicación en el mapa
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-red-900/30 text-gray-400'
                    : 'hover:bg-red-100 text-gray-600'
                }`}
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {error && (
              <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 text-sm border ${
                theme === 'dark'
                  ? 'bg-red-900/30 border-red-700 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <MapPinIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      buscarLugares(e.target.value);
                    }}
                    onFocus={() => busqueda.length >= 3 && setMostrarSugerencias(true)}
                    placeholder="Buscar dirección, ciudad o lugar..."
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    }`}
                  />
                  {buscando && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>

                {mostrarSugerencias && sugerencias.length > 0 && (
                  <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-xl border max-h-60 overflow-y-auto ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-red-600/20'
                      : 'bg-white border-red-600/20'
                  }`}>
                    {sugerencias.map((lugar, index) => (
                      <button
                        key={index}
                        onClick={() => seleccionarLugar(lugar)}
                        className={`w-full text-left px-4 py-3 flex items-start space-x-3 transition-colors border-b last:border-b-0 ${
                          theme === 'dark'
                            ? 'hover:bg-red-900/20 border-gray-700'
                            : 'hover:bg-red-50 border-gray-100'
                        }`}
                      >
                        <MapPinIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {lugar.display_name.split(',')[0]}
                          </p>
                          <p className={`text-xs truncate ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {lugar.display_name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                <div className={`h-64 sm:h-96 rounded-xl flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cargando mapa...
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  id={containerId.current} 
                  className={`h-64 sm:h-96 rounded-xl overflow-hidden shadow-lg border-2 border-red-600/20 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                ></div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <button
                  onClick={onClose}
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onSeleccionar(busqueda);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
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
// COMPONENTE DE MAPA INTERACTIVO
// ============================================
const MapaInteractivo = ({ ubicacion, onUbicacionChange, readOnly }) => {
  const { theme } = useTheme();
  const [busqueda, setBusqueda] = useState(ubicacion || '');
  const [mapaAmpliadoAbierto, setMapaAmpliadoAbierto] = useState(false);
  const [mapaVisible, setMapaVisible] = useState(false);
  const mapRef = useRef(null);
  const containerId = useRef(`mapa-mini-${Date.now()}`);
  const mapaCargadoRef = useRef(false);
  const leafletRef = useRef(null);

  useEffect(() => {
    if (ubicacion) {
      setBusqueda(ubicacion);
    }
  }, [ubicacion]);

  useEffect(() => {
    if (mapaVisible && busqueda && !mapaCargadoRef.current) {
      cargarMapaMini();
    }
  }, [mapaVisible, busqueda]);

  const cargarMapaMini = async () => {
    if (!mapaVisible || !busqueda) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}&limit=1`
      );
      const data = await response.json();

      if (!data || !data[0]) return;

      const { lat, lon } = data[0];

      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      
      leafletRef.current = L;

      const container = document.getElementById(containerId.current);
      if (!container) return;

      container.innerHTML = '';

      const map = L.map(containerId.current).setView([parseFloat(lat), parseFloat(lon)], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      L.marker([parseFloat(lat), parseFloat(lon)]).addTo(map)
        .bindPopup(busqueda)
        .openPopup();

      mapRef.current = map;
      mapaCargadoRef.current = true;

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 300);

    } catch (error) {
      console.error('Error cargando mapa mini:', error);
    }
  };

  const toggleMapa = () => {
    if (readOnly) return;
    const nuevoEstado = !mapaVisible;
    setMapaVisible(nuevoEstado);
    if (nuevoEstado && busqueda) {
      mapaCargadoRef.current = false;
      setTimeout(() => cargarMapaMini(), 300);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPinIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`} />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => {
            if (!readOnly) {
              setBusqueda(e.target.value);
              onUbicacionChange(e.target.value);
            }
          }}
          placeholder="Dirección, ciudad o lugar..."
          readOnly={readOnly}
          className={`w-full pl-10 pr-12 py-2.5 sm:py-3 border-2 rounded-lg transition-all text-sm sm:text-base outline-none ${
            readOnly 
              ? theme === 'dark'
                ? 'border-gray-700 bg-gray-800/50 text-gray-400 cursor-not-allowed'
                : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
              : theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
          }`}
        />
        <button
          onClick={() => setMapaAmpliadoAbierto(true)}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
          }`}
          title="Ampliar mapa"
        >
          <ArrowsPointingOutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      <div className="flex items-center space-x-2 mt-2">
        <button
          onClick={toggleMapa}
          disabled={readOnly}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            readOnly ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            mapaVisible ? 'bg-red-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
          }`}
        >
          <motion.div
            animate={{ x: mapaVisible ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
          />
        </button>
        <span className={`text-xs sm:text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {readOnly ? 'Mapa bloqueado' : 'Mostrar mapa interactivo'}
        </span>
      </div>

      {mapaVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2"
        >
          <div 
            id={containerId.current} 
            className={`h-40 sm:h-48 rounded-xl overflow-hidden shadow-lg border-2 border-red-600/20 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          ></div>
        </motion.div>
      )}

      <MapaAmpliadoModal
        isOpen={mapaAmpliadoAbierto}
        onClose={() => setMapaAmpliadoAbierto(false)}
        ubicacion={busqueda}
        onSeleccionar={(ubicacionSeleccionada) => {
          if (!readOnly) {
            setBusqueda(ubicacionSeleccionada);
            onUbicacionChange(ubicacionSeleccionada);
            if (mapaVisible) {
              mapaCargadoRef.current = false;
              setTimeout(() => cargarMapaMini(), 300);
            }
          }
        }}
      />
    </div>
  );
};

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
      className={`backdrop-blur-lg rounded-xl shadow-xl border transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/80 border-gray-700/50 hover:border-red-600/40'
          : 'bg-white/95 border-gray-200/80 hover:border-red-600/40 shadow-gray-200/50'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE INPUT TECNOLÓGICO - CORREGIDO PARA MODO CLARO/OSCURO
// ============================================
const TechInput = ({ icon: Icon, label, error, value, onChange, readOnly, ...props }) => {
  const { theme } = useTheme();
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
      className="space-y-1 w-full"
      animate={{ scale: isFocused ? 1.01 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {label && (
        <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                isFocused && !readOnly 
                  ? 'text-red-500' 
                  : theme === 'dark'
                    ? 'text-gray-500'
                    : 'text-gray-400'
              }`} />
            </div>
          )}
          <input
            className={`w-full ${Icon ? 'pl-9 sm:pl-10' : 'pl-3 sm:pl-4'} pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 rounded-lg outline-none transition-all duration-300 text-sm sm:text-base ${
              isFocused && !readOnly
                ? theme === 'dark'
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-gray-800 text-white'
                  : 'border-red-500 ring-2 ring-red-500/20 bg-white text-gray-900'
                : readOnly
                  ? theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'border-gray-700 bg-gray-800 text-white hover:border-gray-600 placeholder-gray-500'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 placeholder-gray-400'
            }`}
            value={localValue}
            onChange={handleChange}
            onFocus={() => !readOnly && setIsFocused(true)}
            onBlur={handleBlur}
            readOnly={readOnly}
            {...props}
          />
        </div>
      </div>
      {error && (
        <p className={`text-xs sm:text-sm mt-1 font-medium ${
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`}>
          {error}
        </p>
      )}
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE SELECT TECNOLÓGICO - CORREGIDO PARA MODO CLARO/OSCURO
// ============================================
const TechSelect = ({ icon: Icon, label, value, onChange, options, readOnly, placeholder }) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${
              isFocused && !readOnly 
                ? 'text-red-500' 
                : theme === 'dark'
                  ? 'text-gray-500'
                  : 'text-gray-400'
            }`} />
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={readOnly}
          className={`w-full ${Icon ? 'pl-9 sm:pl-10' : 'pl-3 sm:pl-4'} pr-8 sm:pr-10 py-2.5 sm:py-3 border-2 rounded-lg outline-none transition-all appearance-none text-sm sm:text-base ${
            isFocused && !readOnly
              ? theme === 'dark'
                ? 'border-red-500 ring-2 ring-red-500/20 bg-gray-800 text-white'
                : 'border-red-500 ring-2 ring-red-500/20 bg-white text-gray-900'
              : readOnly
                ? theme === 'dark'
                  ? 'border-gray-700 bg-gray-800/50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                : theme === 'dark'
                  ? 'border-gray-700 bg-gray-800 text-white hover:border-gray-600 cursor-pointer'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 cursor-pointer'
          }`}
        >
          <option value="" className={theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-500'}>
            {placeholder || 'Seleccionar...'}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className={`absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center h-4 w-4 sm:h-5 sm:w-5 pointer-events-none ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`} />
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE LOGO PREVIEW
// ============================================
const LogoPreview = ({ logoUrl, empresaNombre, onAmpliar }) => {
  const { theme } = useTheme();
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
      <div className={`relative rounded-2xl p-4 sm:p-8 border-2 border-red-600/20 hover:border-red-600/40 transition-all shadow-xl h-full flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="relative mb-4 sm:mb-6">
          <div className={`relative w-32 h-32 sm:w-44 sm:h-44 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-2 border-red-600/20 group-hover:border-red-600/40 transition-all ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo de la empresa" 
                className="w-full h-full object-contain p-3 sm:p-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Error';
                }}
              />
            ) : (
              <div className="text-4xl sm:text-7xl font-bold bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
                {empresaNombre?.charAt(0) || 'E'}
              </div>
            )}
          </div>
          
          {isHovered && logoUrl && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white shadow-xl"
            >
              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
          )}
        </div>

        <div className="text-center">
          <p className={`text-xs sm:text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {logoUrl ? 'Logo personalizado' : 'Logo por defecto'}
          </p>
          {logoUrl && (
            <div className={`mt-2 sm:mt-3 text-xs sm:text-sm font-medium flex items-center justify-center ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Logo cargado correctamente
            </div>
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
      'Tennessee', 'Texas', 'Utah', 'Vermont'
    ]
  },
  'España': {
    codigo: 'ES',
    bandera: '🇪🇸',
    provincias: [
      'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga',
      'Murcia', 'Palma de Mallorca', 'Las Palmas', 'Bilbao', 'Alicante',
      'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet de Llobregat',
      'Vitoria', 'La Coruña', 'Granada', 'Elche', 'Oviedo', 'Badalona', 'Pamplona'
    ]
  },
  'México': {
    codigo: 'MX',
    bandera: '🇲🇽',
    provincias: [
      'Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Estado de México',
      'Guanajuato', 'Veracruz', 'Baja California', 'Coahuila', 'Chihuahua',
      'Sinaloa'
    ]
  }
};

// ============================================
// COMPONENTE PRINCIPAL: EMPRESA
// ============================================
const Empresa = ({ configuracion, handleInputChange }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [paisSeleccionado, setPaisSeleccionado] = useState('República Dominicana');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [nombrePropietario, setNombrePropietario] = useState('');
  const [apellidoPropietario, setApellidoPropietario] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [logoModalAbierto, setLogoModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [valoresIniciales, setValoresIniciales] = useState({});
  const [cambiosPendientes, setCambiosPendientes] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [valoresEditados, setValoresEditados] = useState({});
  const [campos, setCampos] = useState({
    empresaNombre: '',
    rnc: '',
    numero: '',
    dueno: '',
    correo: '',
    sitioWeb: '',
    ubicacion: '',
    logoUrl: ''
  });

  // Cargar configuración inicial
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        setCargando(true);
        const empresaRef = doc(db, 'Configuracion', 'empresa');
        const empresaSnap = await getDoc(empresaRef);
        
        const camposList = ['empresaNombre', 'rnc', 'numero', 'dueno', 'correo', 'sitioWeb', 'ubicacion', 'logoUrl'];
        const inicial = {};
        const valores = {};
        
        if (empresaSnap.exists()) {
          const data = empresaSnap.data();
          
          camposList.forEach(campo => {
            const valor = data[campo] || '';
            inicial[campo] = valor;
            valores[campo] = valor;
            handleInputChange(null, campo, valor);
          });
        } else {
          camposList.forEach(campo => {
            inicial[campo] = '';
            valores[campo] = '';
            handleInputChange(null, campo, '');
          });
        }
        
        setValoresIniciales(inicial);
        setValoresEditados(valores);
        setCampos(valores);
        setCargando(false);
      } catch (error) {
        console.error('Error cargando configuración:', error);
        setCargando(false);
      }
    };

    cargarConfiguracion();
  }, []);

  // Sincronizar nombre completo
  useEffect(() => {
    if (configuracion?.dueno) {
      const partes = configuracion.dueno.split(' ');
      setNombrePropietario(partes[0] || '');
      setApellidoPropietario(partes.slice(1).join(' ') || '');
    }
  }, [configuracion?.dueno]);

  // Inicializar provincia y país desde ubicación
  useEffect(() => {
    if (configuracion?.ubicacion && !provinciaSeleccionada) {
      const parts = configuracion.ubicacion.split(', ');
      if (parts.length === 2) {
        setProvinciaSeleccionada(parts[0]);
        setPaisSeleccionado(parts[1]);
      }
    }
  }, [configuracion?.ubicacion]);

  // Actualizar campos cuando cambia la configuración
  useEffect(() => {
    if (configuracion) {
      setCampos({
        empresaNombre: configuracion.empresaNombre || '',
        rnc: configuracion.rnc || '',
        numero: configuracion.numero || '',
        dueno: configuracion.dueno || '',
        correo: configuracion.correo || '',
        sitioWeb: configuracion.sitioWeb || '',
        ubicacion: configuracion.ubicacion || '',
        logoUrl: configuracion.logoUrl || ''
      });
    }
  }, [configuracion]);

  const actualizarNombreCompleto = (nombre, apellido) => {
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    setCampos(prev => ({ ...prev, dueno: nombreCompleto }));
    setValoresEditados(prev => ({ ...prev, dueno: nombreCompleto }));
    handleInputChange(null, 'dueno', nombreCompleto);
  };

  // Actualizar ubicación cuando cambia provincia o país
  useEffect(() => {
    if (provinciaSeleccionada && paisSeleccionado) {
      const nuevaUbicacion = `${provinciaSeleccionada}, ${paisSeleccionado}`;
      setCampos(prev => ({ ...prev, ubicacion: nuevaUbicacion }));
      setValoresEditados(prev => ({ ...prev, ubicacion: nuevaUbicacion }));
      handleInputChange(null, 'ubicacion', nuevaUbicacion);
    }
  }, [provinciaSeleccionada, paisSeleccionado]);

  const handleCampoChange = (campo, valor) => {
    setCampos(prev => ({ ...prev, [campo]: valor }));
    setValoresEditados(prev => ({ ...prev, [campo]: valor }));
    handleInputChange(null, campo, valor);
    
    if (valoresIniciales[campo] !== valor) {
      setCambiosPendientes(true);
    } else {
      const todosIguales = Object.keys(valoresIniciales).every(key => 
        valoresEditados[key] === valoresIniciales[key]
      );
      setCambiosPendientes(!todosIguales);
    }
  };

  // Activar modo edición
  const activarEdicion = () => {
    const estadoActual = {};
    Object.keys(campos).forEach(key => {
      estadoActual[key] = campos[key];
    });
    setValoresIniciales(estadoActual);
    setValoresEditados(estadoActual);
    setModoEdicion(true);
    setCambiosPendientes(false);
  };

  // Cancelar edición sin guardar
  const cancelarEdicion = () => {
    Object.keys(valoresIniciales).forEach(key => {
      const valor = valoresIniciales[key] || '';
      setCampos(prev => ({ ...prev, [key]: valor }));
      setValoresEditados(prev => ({ ...prev, [key]: valor }));
      handleInputChange(null, key, valor);
    });
    
    if (valoresIniciales.dueno) {
      const partes = valoresIniciales.dueno.split(' ');
      setNombrePropietario(partes[0] || '');
      setApellidoPropietario(partes.slice(1).join(' ') || '');
    }
    
    if (valoresIniciales.ubicacion) {
      const parts = valoresIniciales.ubicacion.split(', ');
      if (parts.length === 2) {
        setProvinciaSeleccionada(parts[0]);
        setPaisSeleccionado(parts[1]);
      }
    }
    
    setCambiosPendientes(false);
    setModoEdicion(false);
    setExito('Edición cancelada');
    setTimeout(() => setExito(''), 3000);
  };

  // Guardar en Firebase
  const guardarEnFirebase = async () => {
    try {
      setGuardando(true);
      setError('');
      
      if (!campos.empresaNombre?.trim()) {
        setError('El nombre de la empresa es requerido');
        setGuardando(false);
        return;
      }

      const empresaRef = doc(db, 'Configuracion', 'empresa');
      
      const datosAGuardar = {
        empresaNombre: campos.empresaNombre || '',
        rnc: campos.rnc || '',
        numero: campos.numero || '',
        dueno: campos.dueno || '',
        correo: campos.correo || '',
        sitioWeb: campos.sitioWeb || '',
        ubicacion: campos.ubicacion || '',
        logoUrl: campos.logoUrl || '',
        actualizadoPor: user?.email || 'sistema',
        fechaActualizacion: new Date().toISOString()
      };

      await setDoc(empresaRef, datosAGuardar, { merge: true });

      const nuevosIniciales = { ...valoresIniciales };
      Object.keys(datosAGuardar).forEach(key => {
        if (key in nuevosIniciales) {
          nuevosIniciales[key] = datosAGuardar[key];
        }
      });
      setValoresIniciales(nuevosIniciales);
      setValoresEditados(nuevosIniciales);
      setCambiosPendientes(false);
      setModoEdicion(false);

      if (campos.logoUrl) {
        localStorage.setItem('empresaLogo', campos.logoUrl);
        window.dispatchEvent(new CustomEvent('logoActualizado', { detail: campos.logoUrl }));
      }
      if (campos.empresaNombre) {
        localStorage.setItem('empresaNombre', campos.empresaNombre);
        window.dispatchEvent(new CustomEvent('empresaNombreActualizado', { detail: campos.empresaNombre }));
      }

      setExito('Configuración guardada exitosamente');
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      console.error('Error guardando:', error);
      setError('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const paisesOptions = Object.keys(paisesData).map(pais => ({
    value: pais,
    label: `${paisesData[pais].bandera} ${pais}`
  }));

  const provinciasOptions = (paisesData[paisSeleccionado]?.provincias || []).map(provincia => ({
    value: provincia,
    label: provincia
  }));

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Cargando configuración...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key="empresa"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 sm:space-y-6"
    >
      <LogoPreviewModal
        isOpen={logoModalAbierto}
        onClose={() => setLogoModalAbierto(false)}
        logoUrl={campos.logoUrl}
        empresaNombre={campos.empresaNombre}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 sm:p-4 border-2 rounded-xl flex items-center space-x-3 text-sm ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-700 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {exito && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 sm:p-4 border-2 rounded-xl flex items-center space-x-3 text-sm ${
              theme === 'dark'
                ? 'bg-green-900/30 border-green-700 text-green-400'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{exito}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard>
        <div className="p-4 sm:p-6">
          {/* Header con botones */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg flex-shrink-0">
                <BuildingStorefrontIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className={`text-base sm:text-xl font-bold truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Información de la Empresa
                </h3>
                <p className={`text-xs sm:text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {modoEdicion ? '✏️ Editando los datos de tu negocio' : '🔒 Datos principales de tu negocio'}
                </p>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {modoEdicion && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelarEdicion}
                  disabled={guardando}
                  className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 disabled:opacity-50 text-xs sm:text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Cancelar</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={modoEdicion ? guardarEnFirebase : activarEdicion}
                disabled={guardando}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm ${
                  modoEdicion
                    ? 'bg-gradient-to-r from-green-600 to-green-800 text-white'
                    : 'bg-gradient-to-r from-red-600 to-red-800 text-white'
                } disabled:opacity-50`}
              >
                {guardando ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : modoEdicion ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Guardar</span>
                  </>
                ) : (
                  <>
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Editar</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            <TechInput
              icon={BuildingStorefrontIcon}
              label="Nombre de la Empresa *"
              value={campos.empresaNombre || ''}
              onChange={(value) => handleCampoChange('empresaNombre', value)}
              placeholder="EYS Inversiones"
              readOnly={!modoEdicion}
            />

            <TechInput
              icon={DocumentTextIcon}
              label="RFC/RNC"
              value={campos.rnc || ''}
              onChange={(value) => handleCampoChange('rnc', value)}
              placeholder="123-456789-0"
              readOnly={!modoEdicion}
            />

            <TechInput
              icon={PhoneIcon}
              label="Teléfono"
              value={campos.numero || ''}
              onChange={(value) => handleCampoChange('numero', value)}
              placeholder="809-123-4567"
              readOnly={!modoEdicion}
            />

            <TechInput
              icon={EnvelopeIcon}
              label="Correo Electrónico"
              type="email"
              value={campos.correo || ''}
              onChange={(value) => handleCampoChange('correo', value)}
              placeholder="info@empresa.com"
              readOnly={!modoEdicion}
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
              readOnly={!modoEdicion}
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
              readOnly={!modoEdicion}
            />

            <TechSelect
              icon={GlobeAltIcon}
              label="País"
              value={paisSeleccionado}
              onChange={(value) => setPaisSeleccionado(value)}
              options={paisesOptions}
              readOnly={!modoEdicion}
            />

            <TechSelect
              icon={MapPinIcon}
              label="Provincia / Ciudad"
              value={provinciaSeleccionada}
              onChange={(value) => setProvinciaSeleccionada(value)}
              options={provinciasOptions}
              readOnly={!modoEdicion}
              placeholder="Seleccionar provincia"
            />

            <div className="md:col-span-2">
              <TechInput
                icon={GlobeAltIcon}
                label="Sitio Web"
                value={campos.sitioWeb || ''}
                onChange={(value) => handleCampoChange('sitioWeb', value)}
                placeholder="https://www.eysinversiones.com"
                readOnly={!modoEdicion}
              />
            </div>

            <div className="space-y-4">
              <TechInput
                icon={PhotoIcon}
                label="URL del Logo"
                value={campos.logoUrl || ''}
                onChange={(value) => handleCampoChange('logoUrl', value)}
                placeholder="https://ejemplo.com/logo.png"
                readOnly={!modoEdicion}
              />
              
              {campos.logoUrl && (
                <div className="w-full">
                  <LogoPreview 
                    logoUrl={campos.logoUrl} 
                    empresaNombre={campos.empresaNombre}
                    onAmpliar={() => setLogoModalAbierto(true)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Ubicación
                </label>
                <MapaInteractivo 
                  ubicacion={campos.ubicacion}
                  onUbicacionChange={(value) => handleCampoChange('ubicacion', value)}
                  readOnly={!modoEdicion}
                />
              </div>
            </div>
          </div>

          {/* Indicador de cambios pendientes */}
          {modoEdicion && cambiosPendientes && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 flex items-center justify-end space-x-2 text-xs sm:text-sm p-3 rounded-lg border ${
                theme === 'dark'
                  ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800'
                  : 'text-yellow-600 bg-yellow-50 border-yellow-200'
              }`}
            >
              <ClockIcon className="h-4 w-4 animate-pulse flex-shrink-0" />
              <span className="font-medium">Hay cambios sin guardar</span>
            </motion.div>
          )}

          {!modoEdicion && (
            <div className={`mt-6 flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm p-3 rounded-lg border ${
              theme === 'dark'
                ? 'text-gray-400 bg-gray-800/50 border-gray-700'
                : 'text-gray-500 bg-gray-50 border-gray-200'
            }`}>
              <span className="font-medium">🔒 Modo de solo lectura</span>
              <span className="text-xs">· Haz clic en "Editar" para modificar</span>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Empresa;