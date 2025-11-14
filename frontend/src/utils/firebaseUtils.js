// Utilidades para manejar datos de Firebase

/**
 * Convierte un Timestamp de Firebase a Date de JavaScript
 * @param {Object} timestamp - Timestamp de Firebase {_seconds, _nanoseconds}
 * @returns {Date} Fecha de JavaScript
 */
export const firebaseTimestampToDate = (timestamp) => {
  if (!timestamp) return null;
  
  // Si ya es una fecha, retornarla
  if (timestamp instanceof Date) return timestamp;
  
  // Si es un string de fecha, convertir a Date
  if (typeof timestamp === 'string') return new Date(timestamp);
  
  // Si es un objeto Timestamp de Firebase
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }
  
  // Si es un objeto con toDate method
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  return null;
};

/**
 * Convierte un Timestamp de Firebase a string de fecha local
 * @param {Object} timestamp - Timestamp de Firebase
 * @returns {string} Fecha en formato local
 */
export const firebaseTimestampToLocalString = (timestamp) => {
  const date = firebaseTimestampToDate(timestamp);
  if (!date) return '';
  
  return date.toLocaleDateString();
};

/**
 * Convierte un Timestamp de Firebase a string ISO para inputs date
 * @param {Object} timestamp - Timestamp de Firebase
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const firebaseTimestampToInputDate = (timestamp) => {
  const date = firebaseTimestampToDate(timestamp);
  if (!date) return '';
  
  return date.toISOString().split('T')[0];
};

/**
 * Normaliza un objeto completo de Firebase convirtiendo todos los Timestamps
 * @param {Object} obj - Objeto de Firebase
 * @returns {Object} Objeto normalizado
 */
export const normalizeFirebaseData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const normalized = { ...obj };
  
  Object.keys(normalized).forEach(key => {
    const value = normalized[key];
    
    // Convertir Timestamps
    if (value && typeof value === 'object') {
      if (value._seconds !== undefined) {
        normalized[key] = firebaseTimestampToDate(value);
      }
    }
  });
  
  return normalized;
};

/**
 * Prepara datos para enviar a Firebase (convierte fechas a Timestamps si es necesario)
 * @param {Object} data - Datos a enviar
 * @returns {Object} Datos preparados
 */
export const prepareDataForFirebase = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const prepared = { ...data };
  
  Object.keys(prepared).forEach(key => {
    const value = prepared[key];
    
    // Si es una fecha, mantener como string (Firestore la convierte automáticamente)
    if (value instanceof Date) {
      prepared[key] = value.toISOString();
    }
  });
  
  return prepared;
};