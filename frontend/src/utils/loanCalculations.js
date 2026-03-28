import { firebaseTimestampToDate } from './firebaseUtils';

export const DIAS_QUINCENALES = [15, 30];
export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

let CONFIG_MORA = { enabled: false, porcentaje: 5, diasGracia: 3 };

export const calcularDiasTranscurridos = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  if (isNaN(inicio) || isNaN(fin)) return 0;
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
};

export const getDiaSemana = (fecha) => {
  const date = new Date(fecha);
  let dia = date.getDay();
  return dia === 0 ? 7 : dia;
};

export const getNombreDiaSemana = (fecha) => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[new Date(fecha).getDay()];
};

export const calcularInteresDiario = (capital, interesPercent) => {
  if (!capital || !interesPercent) return 0;
  return (capital * interesPercent) / 100 / 30;
};

export const calcularInteresPorDias = (capital, interesPercent, dias) => {
  return calcularInteresDiario(capital, interesPercent) * dias;
};

export const calcularInteresPeriodo = (prestamo, diasPeriodo = null) => {
  if (!prestamo || !prestamo.capitalRestante || !prestamo.interesPercent) return 0;
  const interesDiario = calcularInteresDiario(prestamo.capitalRestante, prestamo.interesPercent);
  if (diasPeriodo) return interesDiario * diasPeriodo;
  switch (prestamo.frecuencia) {
    case 'diario': return interesDiario;
    case 'semanal': return interesDiario * 7;
    case 'quincenal': return interesDiario * 15;
    case 'mensual': return interesDiario * 30;
    default: return interesDiario * 30;
  }
};

export const calcularMora = (interesAdeudado, diasAtraso, configMora = CONFIG_MORA) => {
  if (!configMora.enabled) return 0;
  if (diasAtraso <= configMora.diasGracia) return 0;
  const diasMora = diasAtraso - configMora.diasGracia;
  const moraDiaria = (interesAdeudado * configMora.porcentaje) / 100 / 30;
  return moraDiaria * diasMora;
};

export const getDescripcionFrecuencia = (frecuencia, config = {}) => {
  switch (frecuencia) {
    case 'diario': return 'Todos los días';
    case 'semanal': return `Cada semana (${config.diaSemana || 'Lunes'})`;
    case 'quincenal': return 'Días 15 y 30 de cada mes';
    case 'mensual': return `Día ${config.diaPago || '15'} de cada mes`;
    case 'personalizado': return 'Fechas personalizadas';
    default: return frecuencia;
  }
};

export const generarFechasPago = (prestamo, cantidad = 4) => {
  if (!prestamo || !prestamo.fechaProximoPago) return [];
  const fechas = [];
  let fechaActual = firebaseTimestampToDate(prestamo.fechaProximoPago);
  if (!fechaActual) return [];
  fechas.push(new Date(fechaActual));
  for (let i = 1; i < cantidad; i++) {
    const siguienteFecha = new Date(fechaActual);
    switch (prestamo.frecuencia) {
      case 'diario': siguienteFecha.setDate(siguienteFecha.getDate() + i); break;
      case 'semanal': siguienteFecha.setDate(siguienteFecha.getDate() + (i * 7)); break;
      case 'quincenal': siguienteFecha.setDate(siguienteFecha.getDate() + (i * 15)); break;
      case 'mensual': siguienteFecha.setMonth(siguienteFecha.getMonth() + i); break;
      default: siguienteFecha.setDate(siguienteFecha.getDate() + (i * 30));
    }
    fechas.push(siguienteFecha);
  }
  return fechas;
};

export const obtenerFechasPagoPorFrecuencia = (frecuencia, fechaInicio, config = {}) => {
  const fechas = [];
  const fechaBase = new Date(fechaInicio);
  const año = fechaBase.getFullYear();
  const mes = fechaBase.getMonth();
  const dia = fechaBase.getDate();
  
  switch (frecuencia) {
    case 'diario':
      for (let i = 1; i <= 5; i++) { const fecha = new Date(fechaBase); fecha.setDate(dia + i); fechas.push(fecha); }
      break;
    case 'semanal':
      for (let i = 1; i <= 4; i++) { const fecha = new Date(fechaBase); fecha.setDate(dia + (i * 7)); fechas.push(fecha); }
      break;
    case 'quincenal':
      const fecha15 = new Date(año, mes, 15);
      const fecha30 = new Date(año, mes, 30);
      if (fecha15 > fechaBase) fechas.push(fecha15);
      if (fecha30 > fechaBase) fechas.push(fecha30);
      if (fechas.length < 4) {
        for (let i = 1; i <= 2; i++) {
          const fecha15Prox = new Date(año, mes + i, 15);
          const fecha30Prox = new Date(año, mes + i, 30);
          if (fecha15Prox > fechaBase) fechas.push(fecha15Prox);
          if (fecha30Prox > fechaBase) fechas.push(fecha30Prox);
        }
      }
      break;
    case 'mensual':
      const diaPago = config.diaPago || dia;
      let fechaMensual = new Date(año, mes, diaPago);
      if (fechaMensual <= fechaBase) fechaMensual = new Date(año, mes + 1, diaPago);
      fechas.push(fechaMensual);
      for (let i = 1; i <= 3; i++) fechas.push(new Date(año, mes + i, diaPago));
      break;
    case 'personalizado':
      if (config.fechasPersonalizadas) {
        config.fechasPersonalizadas.forEach(f => { const fecha = new Date(f); if (fecha > fechaBase) fechas.push(fecha); });
        fechas.sort((a, b) => a - b);
      }
      break;
  }
  const fechasUnicas = [...new Map(fechas.map(f => [f.getTime(), f])).values()];
  fechasUnicas.sort((a, b) => a - b);
  return fechasUnicas.slice(0, 4);
};

export const calcularDistribucionPago = (prestamo, montoPagado) => {
  if (!prestamo || !prestamo.capitalRestante || !prestamo.interesPercent) {
    return { interes: 0, capital: 0, mora: 0, restoInteres: 0, nuevoCapital: prestamo?.capitalRestante || 0, prestamoCompletado: false };
  }
  const interesCalculado = (prestamo.capitalRestante * prestamo.interesPercent) / 100;
  if (montoPagado >= interesCalculado) {
    const capital = Math.min(montoPagado - interesCalculado, prestamo.capitalRestante);
    return { interes: interesCalculado, capital, mora: 0, restoInteres: 0, nuevoCapital: prestamo.capitalRestante - capital, prestamoCompletado: prestamo.capitalRestante - capital <= 0 };
  } else {
    return { interes: montoPagado, capital: 0, mora: 0, restoInteres: interesCalculado - montoPagado, nuevoCapital: prestamo.capitalRestante, prestamoCompletado: false };
  }
};

export const getConfiguracionMora = () => CONFIG_MORA;
export const setConfiguracionMora = (nuevaConfig) => { CONFIG_MORA = { ...CONFIG_MORA, ...nuevaConfig }; };

export default {
  calcularDiasTranscurridos, getDiaSemana, getNombreDiaSemana,
  calcularInteresDiario, calcularInteresPorDias, calcularInteresPeriodo,
  calcularMora, getDescripcionFrecuencia, generarFechasPago,
  obtenerFechasPagoPorFrecuencia, calcularDistribucionPago,
  getConfiguracionMora, setConfiguracionMora,
  DIAS_QUINCENALES, DIAS_SEMANA, MESES
};