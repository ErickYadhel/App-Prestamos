// Utilidades para manejar datos de Firebase

/**
 * Convierte un Timestamp de Firebase o string YYYY-MM-DD a Date de JavaScript
 * @param {Object|string} timestamp - Timestamp de Firebase o string YYYY-MM-DD
 * @returns {Date} Fecha de JavaScript
 */
export const firebaseTimestampToDate = (timestamp) => {
  if (!timestamp) return null;
  
  // Si ya es una fecha, retornarla
  if (timestamp instanceof Date) return timestamp;
  
  // 🔥 NUEVO: Si es string en formato YYYY-MM-DD, crear fecha LOCAL
  if (typeof timestamp === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
    const [year, month, day] = timestamp.split('-');
    // Crear fecha en zona horaria local (no UTC)
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Si es un string de fecha ISO, convertir a Date
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) return date;
    return null;
  }
  
  // Si es un objeto con _seconds (Firebase Admin)
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }
  
  // Si tiene seconds (Firestore Timestamp)
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // Si tiene toDate method
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Si es un objeto Date válido
  if (!isNaN(timestamp) || timestamp instanceof Date) {
    return new Date(timestamp);
  }
  
  console.warn('Formato de fecha no reconocido:', timestamp);
  return null;
};

/**
 * 🔥 NUEVA: Convierte una fecha directamente a string YYYY-MM-DD sin zona horaria
 * @param {Date|string|Object} fecha - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const toLocalDateString = (fecha) => {
  const date = firebaseTimestampToDate(fecha);
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convierte un Timestamp de Firebase a string de fecha local
 * @param {Object|string} timestamp - Timestamp de Firebase o string YYYY-MM-DD
 * @returns {string} Fecha en formato local DD/MM/YYYY
 */
export const firebaseTimestampToLocalString = (timestamp) => {
  const date = firebaseTimestampToDate(timestamp);
  if (!date) return '';
  
  return date.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Convierte un Timestamp de Firebase a string de fecha y hora local
 * @param {Object|string} timestamp - Timestamp de Firebase o string YYYY-MM-DD
 * @returns {string} Fecha y hora en formato local
 */
export const firebaseTimestampToLocalDateTimeString = (timestamp) => {
  const date = firebaseTimestampToDate(timestamp);
  if (!date) return '';
  
  return date.toLocaleString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Convierte una fecha a string para inputs date
 * @param {Date|string|Object} fecha - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const firebaseTimestampToInputDate = (fecha) => {
  return toLocalDateString(fecha);
};

/**
 * Formatea una fecha para mostrar en la UI
 * @param {Date|string|Object} fecha - Fecha a formatear
 * @param {boolean} includeTime - Incluir hora
 * @returns {string} Fecha formateada
 */
export const formatFecha = (fecha, includeTime = false) => {
  const date = firebaseTimestampToDate(fecha);
  if (!date) return 'N/A';
  
  if (includeTime) {
    return date.toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Normaliza un objeto completo de Firebase convirtiendo todos los Timestamps
 * 🔥 MODIFICADO: Mantiene strings YYYY-MM-DD como strings, no los convierte a Date
 * @param {Object} obj - Objeto de Firebase
 * @returns {Object} Objeto normalizado
 */
export const normalizeFirebaseData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Si es un array, normalizar cada elemento
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeFirebaseData(item));
  }
  
  const normalized = { ...obj };
  
  Object.keys(normalized).forEach(key => {
    const value = normalized[key];
    
    // 🔥 NUEVO: Si es string YYYY-MM-DD, mantenerlo como string, NO convertir
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Mantener como string, NO convertir a Date
      normalized[key] = value;
    }
    // Convertir Timestamps solo si son objetos timestamp
    else if (value && typeof value === 'object') {
      // Timestamp con _seconds (Firebase Admin)
      if (value._seconds !== undefined) {
        normalized[key] = firebaseTimestampToDate(value);
      }
      // Timestamp con seconds (Firestore)
      else if (value.seconds !== undefined) {
        normalized[key] = firebaseTimestampToDate(value);
      }
      // Timestamp con toDate
      else if (typeof value.toDate === 'function') {
        normalized[key] = firebaseTimestampToDate(value);
      }
      // Objeto normal - recursivo
      else if (!Array.isArray(value) && !(value instanceof Date)) {
        normalized[key] = normalizeFirebaseData(value);
      }
    }
  });
  
  return normalized;
};

/**
 * Prepara datos para enviar a Firebase (convierte fechas a string YYYY-MM-DD)
 * @param {Object} data - Datos a enviar
 * @returns {Object} Datos preparados
 */
export const prepareDataForFirebase = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const prepared = { ...data };
  
  Object.keys(prepared).forEach(key => {
    const value = prepared[key];
    
    // Si es una fecha, convertir a YYYY-MM-DD string
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      prepared[key] = `${year}-${month}-${day}`;
    }
    // Si es un objeto, recursivo
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      prepared[key] = prepareDataForFirebase(value);
    }
    // Si es un array, mapear
    else if (Array.isArray(value)) {
      prepared[key] = value.map(item => prepareDataForFirebase(item));
    }
  });
  
  return prepared;
};

/**
 * Compara dos fechas (para ordenamiento)
 * @param {Date|string|Object} fechaA - Primera fecha
 * @param {Date|string|Object} fechaB - Segunda fecha
 * @returns {number} -1, 0, 1
 */
export const compararFechas = (fechaA, fechaB) => {
  const dateA = firebaseTimestampToDate(fechaA);
  const dateB = firebaseTimestampToDate(fechaB);
  
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;
  
  return dateA - dateB;
};

/**
 * Verifica si una fecha es hoy
 * @param {Date|string|Object} fecha - Fecha a verificar
 * @returns {boolean}
 */
export const esHoy = (fecha) => {
  const date = firebaseTimestampToDate(fecha);
  if (!date) return false;
  
  const hoy = new Date();
  return date.toDateString() === hoy.toDateString();
};

/**
 * Verifica si una fecha está atrasada (menor a hoy)
 * @param {Date|string|Object} fecha - Fecha a verificar
 * @returns {boolean}
 */
export const estaAtrasada = (fecha) => {
  const date = firebaseTimestampToDate(fecha);
  if (!date) return false;
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return date < hoy;
};

/**
 * Obtiene la diferencia en días entre dos fechas
 * @param {Date|string|Object} fechaInicio - Fecha de inicio
 * @param {Date|string|Object} fechaFin - Fecha de fin
 * @returns {number} Días de diferencia
 */
export const diferenciaDias = (fechaInicio, fechaFin) => {
  const inicio = firebaseTimestampToDate(fechaInicio);
  const fin = firebaseTimestampToDate(fechaFin);
  
  if (!inicio || !fin) return 0;
  
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(fin - inicio);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default {
  firebaseTimestampToDate,
  firebaseTimestampToLocalString,
  firebaseTimestampToLocalDateTimeString,
  firebaseTimestampToInputDate,
  formatFecha,
  normalizeFirebaseData,
  prepareDataForFirebase,
  compararFechas,
  esHoy,
  estaAtrasada,
  diferenciaDias,
  toLocalDateString
};