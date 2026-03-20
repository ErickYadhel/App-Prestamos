// ============================================
// FORMATEADORES DE MONEDA Y NÚMEROS
// ============================================

/**
 * Formatea un monto a moneda dominicana (DOP)
 * @param {number} amount - Monto a formatear
 * @param {boolean} showSymbol - Mostrar símbolo RD$
 * @returns {string} - Monto formateado
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === undefined || amount === null) return showSymbol ? 'RD$ 0' : '0';
  
  // Convertir a número si es string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return showSymbol ? 'RD$ 0' : '0';
  
  // Formatear con separadores de miles
  const formatter = new Intl.NumberFormat('es-DO', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(numAmount);
};

/**
 * Formatea un monto a formato abreviado (K, M, MM)
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado (ej: RD$ 1.5K, RD$ 2.3M)
 */
export const formatCompactCurrency = (amount) => {
  if (!amount && amount !== 0) return 'RD$ 0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'RD$ 0';
  
  if (numAmount >= 1000000) {
    return `RD$ ${(numAmount / 1000000).toFixed(1)}M`;
  }
  if (numAmount >= 1000) {
    return `RD$ ${(numAmount / 1000).toFixed(1)}K`;
  }
  return `RD$ ${numAmount}`;
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} - Número formateado
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '0';
  
  const numNumber = typeof number === 'string' ? parseInt(number, 10) : number;
  
  if (isNaN(numNumber)) return '0';
  
  return new Intl.NumberFormat('es-DO').format(numNumber);
};

/**
 * Formatea un número a formato abreviado (K, M, MM)
 * @param {number} number - Número a formatear
 * @returns {string} - Número formateado (ej: 1.5K, 2.3M)
 */
export const formatCompactNumber = (number) => {
  if (!number && number !== 0) return '0';
  
  const numNumber = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(numNumber)) return '0';
  
  if (numNumber >= 1000000) {
    return `${(numNumber / 1000000).toFixed(1)}M`;
  }
  if (numNumber >= 1000) {
    return `${(numNumber / 1000).toFixed(1)}K`;
  }
  return numNumber.toString();
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor del porcentaje (ej: 25.5)
 * @param {number} decimals - Número de decimales
 * @returns {string} - Porcentaje formateado (ej: 25.5%)
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === undefined || value === null) return '0%';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Formatea una tasa de interés
 * @param {number} rate - Tasa de interés
 * @returns {string} - Tasa formateada (ej: 10% anual)
 */
export const formatInterestRate = (rate) => {
  if (!rate && rate !== 0) return '0%';
  return `${rate}%`;
};

/**
 * Formatea un teléfono dominicano
 * @param {string} phone - Número de teléfono
 * @returns {string} - Teléfono formateado (ej: 809-555-0101)
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Limpiar el número (quitar caracteres no numéricos)
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // Formatear según la longitud
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  }
  
  return phone;
};

/**
 * Formatea una cédula dominicana
 * @param {string} cedula - Número de cédula
 * @returns {string} - Cédula formateada (ej: 001-1234567-8)
 */
export const formatCedula = (cedula) => {
  if (!cedula) return '';
  
  // Limpiar el número
  const cleaned = cedula.toString().replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}-${cleaned.slice(10, 11)}`;
  }
  
  return cedula;
};

/**
 * Formatea un RNC dominicano
 * @param {string} rnc - Número de RNC
 * @returns {string} - RNC formateado
 */
export const formatRNC = (rnc) => {
  if (!rnc) return '';
  
  const cleaned = rnc.toString().replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}`;
  }
  
  return rnc;
};

/**
 * Convierte un número a letras (para cheques)
 * @param {number} numero - Número a convertir
 * @returns {string} - Número en letras
 */
export const numberToLetters = (numero) => {
  if (!numero && numero !== 0) return '';
  
  const num = typeof numero === 'string' ? parseFloat(numero) : numero;
  
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  
  // Función para convertir números de 1 a 99
  const convertirDosDigitos = (n) => {
    if (n < 10) return unidades[n];
    if (n >= 10 && n < 20) return especiales[n - 10];
    if (n >= 20 && n < 30) {
      if (n === 20) return 'VEINTE';
      return `VEINTI${unidades[n - 20]}`;
    }
    const decena = Math.floor(n / 10);
    const unidad = n % 10;
    if (unidad === 0) return decenas[decena];
    return `${decenas[decena]} Y ${unidades[unidad]}`;
  };
  
  // Función para convertir números de 1 a 999
  const convertirTresDigitos = (n) => {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    
    const centena = Math.floor(n / 100);
    const resto = n % 100;
    
    if (resto === 0) return centenas[centena];
    return `${centenas[centena]} ${convertirDosDigitos(resto)}`;
  };
  
  // Separar parte entera y decimal
  const partes = num.toString().split('.');
  const entero = parseInt(partes[0], 10);
  const decimal = partes[1] ? parseInt(partes[1].substring(0, 2), 10) : 0;
  
  if (entero === 0) return 'CERO';
  
  const millones = Math.floor(entero / 1000000);
  const miles = Math.floor((entero % 1000000) / 1000);
  const resto = entero % 1000;
  
  let resultado = '';
  
  if (millones > 0) {
    if (millones === 1) {
      resultado += 'UN MILLÓN';
    } else {
      resultado += `${convertirTresDigitos(millones)} MILLONES`;
    }
    if (miles > 0 || resto > 0) resultado += ' ';
  }
  
  if (miles > 0) {
    if (miles === 1) {
      resultado += 'MIL';
    } else {
      resultado += `${convertirTresDigitos(miles)} MIL`;
    }
    if (resto > 0) resultado += ' ';
  }
  
  if (resto > 0) {
    resultado += convertirTresDigitos(resto);
  }
  
  // Agregar parte decimal
  if (decimal > 0) {
    resultado += ` CON ${decimal.toString().padStart(2, '0')}/100`;
  }
  
  return resultado;
};

/**
 * Formatea un monto para mostrar en cheques
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto en formato de cheque
 */
export const formatCheckAmount = (amount) => {
  if (!amount && amount !== 0) return '';
  
  const letters = numberToLetters(amount);
  const numeric = formatCurrency(amount);
  
  return `${letters} (${numeric})`;
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Formatea un nombre completo
 * @param {string} firstName - Primer nombre
 * @param {string} lastName - Apellido
 * @returns {string} - Nombre formateado
 */
export const formatFullName = (firstName, lastName) => {
  if (!firstName && !lastName) return '';
  if (!firstName) return capitalizeWords(lastName);
  if (!lastName) return capitalizeWords(firstName);
  return `${capitalizeWords(firstName)} ${capitalizeWords(lastName)}`;
};

// Exportar un objeto con todas las funciones
const Formatters = {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  formatInterestRate,
  formatPhone,
  formatCedula,
  formatRNC,
  numberToLetters,
  formatCheckAmount,
  truncateText,
  capitalizeWords,
  formatFullName
};

export default Formatters;