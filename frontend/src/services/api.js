import axios from 'axios';

// ============================
// CONFIGURACIÓN DE ENTORNO
// ============================

// Detectar entorno: producción o desarrollo
const isProduction = process.env.NODE_ENV === 'production';

// URL base del backend - AHORA usa variables de entorno
// Prioridad: 1. Variable de entorno REACT_APP_API_URL, 2. Fallback por entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (isProduction 
    ? 'https://eys-backend.onrender.com/api'  // Fallback para producción
    : 'http://localhost:5001/api');           // Fallback para desarrollo

console.log(`🔧 API Config: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'} - URL: ${API_BASE_URL}`);

// ============================
// CONFIGURACIÓN DE AXIOS
// ============================

// Configuración global de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Aumentado para producción
  timeoutErrorMessage: 'La solicitud está tomando demasiado tiempo. Verifica tu conexión.',
  withCredentials: false, // Cambiar a true si usas cookies
});

// ============================
// INTERCEPTOR DE SOLICITUDES (REQUEST)
// ============================

api.interceptors.request.use(
  (config) => {
    // Agregar timestamp para evitar cache en peticiones GET
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Agregar token de autenticación si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ============================
// INTERCEPTOR DE RESPUESTAS (RESPONSE)
// ============================

api.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response.data;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      isProduction: isProduction,
      baseURL: API_BASE_URL
    });
    
    let errorMessage = 'Error de conexión';
    let errorCode = 'UNKNOWN_ERROR';
    
    // Manejo de errores de red
    if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Error de red. Verifica tu conexión a internet.';
      errorCode = 'NETWORK_ERROR';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'La solicitud tardó demasiado tiempo. Intenta nuevamente.';
      errorCode = 'TIMEOUT_ERROR';
    } else if (error.response) {
      // Errores con respuesta del servidor
      const serverError = error.response.data;
      errorMessage = serverError?.error || serverError?.message || `Error ${error.response.status}`;
      errorCode = `HTTP_${error.response.status}`;
      
      // Manejo de códigos HTTP específicos
      switch (error.response.status) {
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          // Limpiar token y redirigir
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible. Intenta nuevamente más tarde.';
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Error sin respuesta del servidor
      errorMessage = `No se pudo conectar con el servidor. Verifica que el backend esté corriendo en: ${API_BASE_URL}`;
      errorCode = 'SERVER_UNREACHABLE';
    } else {
      // Otros errores
      errorMessage = error.message || 'Error de configuración en la solicitud.';
      errorCode = 'REQUEST_ERROR';
    }
    
    // Crear objeto de error enriquecido
    const detailedError = new Error(errorMessage);
    detailedError.code = errorCode;
    detailedError.status = error.response?.status;
    detailedError.originalError = error;
    detailedError.timestamp = new Date().toISOString();
    detailedError.baseURL = API_BASE_URL;
    
    return Promise.reject(detailedError);
  }
);

// ============================
// CLIENTE API EXPORTABLE
// ============================

export const apiClient = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
};

// ============================
// FUNCIONES DE UTILIDAD
// ============================

/**
 * Verificar salud del servidor
 * @returns {Promise<{status: string, data?: any, error?: string, url: string}>}
 */
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      status: 'connected',
      data: response,
      url: API_BASE_URL,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error.message,
      url: API_BASE_URL,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Manejar errores de API de forma consistente
 * @param {Error} error - Error capturado
 * @param {string} defaultMessage - Mensaje por defecto
 * @returns {Object} Objeto con formato de error estandarizado
 */
export const handleApiError = (error, defaultMessage = 'Ocurrió un error inesperado') => {
  console.error('🛑 Handled API Error:', error);
  
  if (error.code === 'NETWORK_ERROR' || error.code === 'SERVER_UNREACHABLE') {
    return {
      success: false,
      error: 'Error de conexión',
      details: `No se pudo conectar con el servidor (${API_BASE_URL}). Verifica tu conexión y que el backend esté ejecutándose.`,
      code: error.code,
      timestamp: new Date().toISOString()
    };
  }
  
  return {
    success: false,
    error: error.message || defaultMessage,
    details: error.details || 'Sin detalles adicionales',
    code: error.code || 'UNKNOWN_ERROR',
    status: error.status || null,
    timestamp: new Date().toISOString()
  };
};

/**
 * Manejar respuestas exitosas de API de forma consistente
 * @param {any} data - Datos de la respuesta
 * @param {string} message - Mensaje de éxito
 * @returns {Object} Objeto con formato de éxito estandarizado
 */
export const handleApiSuccess = (data, message = 'Operación exitosa') => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});

// ============================
// MÓDULO DE NOTIFICACIONES
// ============================

export const notificacionesService = {
  /**
   * Obtener todas las notificaciones o filtradas
   * @param {string} tipo - opcional ('pago_recordatorio', 'mora', etc.)
   * @param {boolean} enviada - opcional (true / false)
   * @param {string} prestamoId - opcional (ID del préstamo)
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async listar(tipo = '', enviada = undefined, prestamoId = '') {
    try {
      const params = {};
      if (tipo) params.tipo = tipo;
      if (enviada !== undefined) params.enviada = enviada;
      if (prestamoId) params.prestamoId = prestamoId;

      const response = await api.get('/notificaciones', { params });
      return handleApiSuccess(response.data, 'Notificaciones cargadas correctamente');
    } catch (error) {
      return handleApiError(error, 'Error al obtener las notificaciones');
    }
  },

  /**
   * Crear y generar enlace de WhatsApp para una notificación
   * @param {Object} data - Datos de la notificación
   * @param {string} data.prestamoId - ID del préstamo
   * @param {string} data.mensaje - Mensaje personalizado
   * @param {string} data.numeroTelefono - Número de teléfono
   * @param {string} data.tipo - Tipo de notificación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async crear(data) {
    try {
      const response = await api.post('/notificaciones/whatsapp', data);
      return handleApiSuccess(response.data, 'Notificación creada correctamente');
    } catch (error) {
      return handleApiError(error, 'Error al crear la notificación');
    }
  },

  /**
   * Generar recordatorios automáticos manualmente
   * @param {number} diasAntes - Días antes del vencimiento
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async generarManual(diasAntes = null) {
    try {
      const body = diasAntes ? { diasAntes } : {};
      const response = await api.post('/notificaciones/generar-manual', body);
      return handleApiSuccess(response, 'Recordatorios generados correctamente');
    } catch (error) {
      return handleApiError(error, 'Error al generar recordatorios automáticos');
    }
  },

  /**
   * Marcar notificación como enviada
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async marcarEnviada(id) {
    try {
      const response = await api.post(`/notificaciones/${id}/marcar-enviada`);
      return handleApiSuccess(response, 'Notificación marcada como enviada');
    } catch (error) {
      return handleApiError(error, 'Error al marcar notificación como enviada');
    }
  },

  /**
   * Eliminar notificación
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async eliminar(id) {
    try {
      const response = await api.delete(`/notificaciones/${id}`);
      return handleApiSuccess(response, 'Notificación eliminada correctamente');
    } catch (error) {
      return handleApiError(error, 'Error al eliminar la notificación');
    }
  },

  /**
   * Obtener estadísticas de notificaciones
   * @returns {Promise<Object>} Respuesta estandarizada con estadísticas
   */
  async obtenerEstadisticas() {
    try {
      const response = await api.get('/notificaciones/estadisticas');
      return handleApiSuccess(response.data, 'Estadísticas obtenidas correctamente');
    } catch (error) {
      return handleApiError(error, 'Error al obtener estadísticas');
    }
  }
};

// ============================
// EXPORTAR POR DEFECTO
// ============================

export default api;

// ============================
// INFORMACIÓN DE CONFIGURACIÓN
// ============================

console.log('📦 API Client configurado con:', {
  baseURL: API_BASE_URL,
  environment: isProduction ? 'production' : 'development',
  timeout: 30000,
  useEnvVariable: !!process.env.REACT_APP_API_URL
});