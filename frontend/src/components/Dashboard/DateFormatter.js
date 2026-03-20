// Utilidad para formatear fechas de Firebase Timestamp

/**
 * Convierte cualquier formato de timestamp de Firebase a objeto Date
 * @param {any} timestamp - Timestamp de Firebase, string ISO, o Date
 * @returns {Date|null} - Objeto Date o null si es inválido
 */
export const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return null;
  
  try {
    // Si es timestamp de Firebase (con seconds y nanoseconds)
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
      return new Date(timestamp.seconds * 1000);
    }
    
    // Si es timestamp en milisegundos (número)
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Si es string ISO
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Si ya es Date
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }
    
    return null;
  } catch (error) {
    console.error('Error convirtiendo timestamp:', error);
    return null;
  }
};

/**
 * Formatea una fecha para mostrar en el dashboard
 * @param {any} timestamp - Timestamp de Firebase, string ISO, o Date
 * @returns {Object} - Objeto con fecha, hora y objeto Date
 */
export const formatFirebaseDate = (timestamp) => {
  const date = convertTimestampToDate(timestamp);
  
  if (!date) {
    return { 
      fecha: 'Fecha no disponible', 
      hora: '', 
      dateObj: null,
      fechaCorta: 'N/A',
      timestamp: null
    };
  }
  
  return {
    fecha: date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    hora: date.toLocaleTimeString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    fechaCorta: date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/'),
    dateObj: date,
    timestamp: date.getTime()
  };
};

/**
 * Formato corto de fecha (dd/mm/yyyy)
 * @param {any} timestamp - Timestamp de Firebase, string ISO, o Date
 * @returns {string} - Fecha en formato dd/mm/yyyy
 */
export const formatShortDate = (timestamp) => {
  const date = convertTimestampToDate(timestamp);
  if (!date) return 'N/A';
  
  return date.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');
};

/**
 * Formato de fecha con hora (dd/mm/yyyy HH:MM)
 * @param {any} timestamp - Timestamp de Firebase, string ISO, o Date
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (timestamp) => {
  const date = convertTimestampToDate(timestamp);
  if (!date) return 'N/A';
  
  return date.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Obtiene tiempo relativo (hace X días, hoy, mañana, en X días)
 * @param {any} timestamp - Timestamp de Firebase, string ISO, o Date
 * @returns {string} - Texto descriptivo del tiempo relativo
 */
export const getRelativeTime = (timestamp) => {
  const date = convertTimestampToDate(timestamp);
  if (!date) return '';
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 1) return 'Ayer';
    if (absDays < 7) return `Hace ${absDays} días`;
    if (absDays < 30) return `Hace ${Math.floor(absDays / 7)} semanas`;
    return `Hace ${Math.floor(absDays / 30)} meses`;
  } else if (diffDays === 0) {
    return 'Hoy';
  } else if (diffDays === 1) {
    return 'Mañana';
  } else if (diffDays < 7) {
    return `En ${diffDays} días`;
  } else if (diffDays < 30) {
    return `En ${Math.floor(diffDays / 7)} semanas`;
  } else {
    return `En ${Math.floor(diffDays / 30)} meses`;
  }
};

/**
 * Obtiene el nombre del mes en español
 * @param {number} monthIndex - Índice del mes (0-11)
 * @returns {string} - Nombre del mes
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[monthIndex] || '';
};

/**
 * Obtiene el nombre del mes abreviado
 * @param {number} monthIndex - Índice del mes (0-11)
 * @returns {string} - Nombre abreviado del mes
 */
export const getShortMonthName = (monthIndex) => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  return months[monthIndex] || '';
};

/**
 * Verifica si una fecha es válida
 * @param {any} timestamp - Timestamp a verificar
 * @returns {boolean} - true si la fecha es válida
 */
export const isValidDate = (timestamp) => {
  const date = convertTimestampToDate(timestamp);
  return date !== null && !isNaN(date.getTime());
};

/**
 * Compara dos fechas (ignorando hora)
 * @param {any} date1 - Primera fecha
 * @param {any} date2 - Segunda fecha
 * @returns {number} - -1 si date1 < date2, 0 si iguales, 1 si date1 > date2
 */
export const compareDates = (date1, date2) => {
  const d1 = convertTimestampToDate(date1);
  const d2 = convertTimestampToDate(date2);
  
  if (!d1 || !d2) return 0;
  
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Obtiene el inicio del día para una fecha
 * @param {Date} date - Fecha
 * @returns {Date} - Inicio del día (00:00:00)
 */
export const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Obtiene el fin del día para una fecha
 * @param {Date} date - Fecha
 * @returns {Date} - Fin del día (23:59:59)
 */
export const getEndOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Obtiene el inicio del mes
 * @param {Date} date - Fecha
 * @returns {Date} - Primer día del mes (00:00:00)
 */
export const getStartOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtiene el fin del mes
 * @param {Date} date - Fecha
 * @returns {Date} - Último día del mes (23:59:59)
 */
export const getEndOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Obtiene el inicio del año
 * @param {Date} date - Fecha
 * @returns {Date} - Primer día del año (00:00:00)
 */
export const getStartOfYear = (date) => {
  return new Date(date.getFullYear(), 0, 1);
};

/**
 * Obtiene el fin del año
 * @param {Date} date - Fecha
 * @returns {Date} - Último día del año (23:59:59)
 */
export const getEndOfYear = (date) => {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
};

// Exportar un objeto con todas las funciones para facilitar imports
const DateFormatter = {
  convertTimestampToDate,
  formatFirebaseDate,
  formatShortDate,
  formatDateTime,
  getRelativeTime,
  getMonthName,
  getShortMonthName,
  isValidDate,
  compareDates,
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear
};

export default DateFormatter;