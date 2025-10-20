class Prestamo {
  constructor({
    id,
    clienteID,
    clienteNombre,
    montoPrestado,
    capitalRestante,
    interesPercent,
    frecuencia, // 'diario', 'quincenal', 'semanal', 'mensual'
    fechaPrestamo = new Date(),
    estado = 'activo', // 'activo', 'completado', 'moroso'
    fechaUltimoPago = null,
    fechaProximoPago = null
  }) {
    this.id = id;
    this.clienteID = clienteID;
    this.clienteNombre = clienteNombre;
    this.montoPrestado = montoPrestado;
    this.capitalRestante = capitalRestante;
    this.interesPercent = interesPercent;
    this.frecuencia = frecuencia;
    this.fechaPrestamo = fechaPrestamo;
    this.estado = estado;
    this.fechaUltimoPago = fechaUltimoPago;
    this.fechaProximoPago = fechaProximoPago;
  }

  // Calcular interés basado en capital restante
  calcularInteres() {
    return (this.capitalRestante * this.interesPercent) / 100;
  }

  // Calcular pago total (capital + interés)
  calcularPagoTotal(montoPago = null) {
    const interes = this.calcularInteres();
    if (montoPago) {
      return {
        interes: Math.min(interes, montoPago),
        capital: montoPago - Math.min(interes, montoPago)
      };
    }
    return interes;
  }

  // Actualizar fechas según frecuencia
  calcularProximaFecha() {
    const fechaBase = this.fechaUltimoPago || this.fechaPrestamo;
    const fecha = new Date(fechaBase);
    
    switch (this.frecuencia) {
      case 'diario':
        fecha.setDate(fecha.getDate() + 1);
        break;
      case 'semanal':
        fecha.setDate(fecha.getDate() + 7);
        break;
      case 'quincenal':
        fecha.setDate(fecha.getDate() + 15);
        break;
      case 'mensual':
        fecha.setMonth(fecha.getMonth() + 1);
        break;
    }
    
    return fecha;
  }
}

module.exports = Prestamo;