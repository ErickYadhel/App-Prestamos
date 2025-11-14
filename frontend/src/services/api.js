import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Configuración global de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  timeoutErrorMessage: 'La solicitud está tomando demasiado tiempo. Verifica tu conexión.',
});

// Interceptor para requests - MEJORADO
api.interceptors.request.use(
  (config) => {
    // Agregar timestamp para evitar cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Agregar token de autenticación
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log para desarrollo (opcional)
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

// Interceptor para responses - MEJORADO
api.interceptors.response.use(
  (response) => {
    // Log para desarrollo (opcional)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response.data;
  },
  (error) => {
    // Log detallado del error
    console.error('❌ API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    let errorMessage = 'Error de conexión';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Error de red. Verifica tu conexión a internet.';
      errorCode = 'NETWORK_ERROR';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'La solicitud tardó demasiado tiempo. Intenta nuevamente.';
      errorCode = 'TIMEOUT_ERROR';
    } else if (error.response) {
      // El servidor respondió con un código de error
      const serverError = error.response.data;
      errorMessage = serverError?.error || serverError?.message || `Error ${error.response.status}`;
      errorCode = `HTTP_${error.response.status}`;
      
      // Manejo específico por código de estado
      switch (error.response.status) {
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          // Opcional: redirigir al login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente.';
          break;
        default:
          break;
      }
    } else if (error.request) {
      // La request fue hecha pero no se recibió respuesta
      errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 5001.';
      errorCode = 'SERVER_UNREACHABLE';
    } else {
      // Algo pasó al configurar la request
      errorMessage = error.message || 'Error de configuración en la solicitud.';
      errorCode = 'REQUEST_ERROR';
    }
    
    // Crear un error más informativo
    const detailedError = new Error(errorMessage);
    detailedError.code = errorCode;
    detailedError.status = error.response?.status;
    detailedError.originalError = error;
    detailedError.timestamp = new Date().toISOString();
    
    return Promise.reject(detailedError);
  }
);

// Funciones helper para métodos HTTP comunes
export const apiClient = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
};

// Función para verificar salud del servidor
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      status: 'connected',
      data: response
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error.message
    };
  }
};

// Función para manejar errores de forma consistente
export const handleApiError = (error, defaultMessage = 'Ocurrió un error inesperado') => {
  console.error('🛑 Handled API Error:', error);
  
  if (error.code === 'NETWORK_ERROR' || error.code === 'SERVER_UNREACHABLE') {
    return {
      success: false,
      error: 'Error de conexión',
      details: 'No se pudo conectar con el servidor. Verifica tu conexión y que el backend esté ejecutándose.',
      code: error.code
    };
  }
  
  return {
    success: false,
    error: error.message || defaultMessage,
    details: error.details,
    code: error.code,
    status: error.status
  };
};

// Función para éxito consistente
export const handleApiSuccess = (data, message = 'Operación exitosa') => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});

/* ============================
   📢 MÓDULO DE NOTIFICACIONES
============================ */

export const notificacionesService = {
  /**
   * Obtener todas las notificaciones o filtradas
   * @param {string} tipo - opcional ('pago_recordatorio', 'mora', etc.)
   * @param {boolean} enviada - opcional (true / false)
   */
  async listar(tipo = '', enviada = undefined) {
    try {
      const params = {};
      if (tipo) params.tipo = tipo;
      if (enviada !== undefined) params.enviada = enviada;

      const response = await api.get('/notificaciones', { params });
      return handleApiSuccess(response.data, 'Notificaciones cargadas correctamente');
    } catch (error) {
      return handleApiError(error, 'Error al obtener las notificaciones');
    }
  },

  /**
   * Crear y generar enlace de WhatsApp
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
   */
  async marcarEnviada(id) {
    try {
      const response = await api.post(`/notificaciones/${id}/marcar-enviada`);
      return handleApiSuccess(response, 'Notificación marcada como enviada');
    } catch (error) {
      return handleApiError(error, 'Error al marcar notificación como enviada');
    }
  },
};


export default api;