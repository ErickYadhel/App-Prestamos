class Pago {
  constructor({
    id,
    prestamoID,
    clienteID,
    clienteNombre,
    fechaPago = null,
    montoCapital = 0,
    montoInteres = 0,
    montoMora = 0,
    tipoPago = 'normal',
    nota = '',
    capitalAnterior,
    capitalNuevo,
    modoManual = false,
    modoCalculo = 'automatico',
    periodosPagados = 1,
    diasCubiertos = 0
  }) {
    this.id = id;
    this.prestamoID = prestamoID;
    this.clienteID = clienteID;
    this.clienteNombre = clienteNombre;
    
    // 🔥 CORREGIDO: Normalizar fecha a string YYYY-MM-DD
    this.fechaPago = this._normalizarFecha(fechaPago);
    
    this.montoCapital = parseFloat(montoCapital) || 0;
    this.montoInteres = parseFloat(montoInteres) || 0;
    this.montoMora = parseFloat(montoMora) || 0;
    this.tipoPago = tipoPago;
    this.nota = nota;
    this.capitalAnterior = capitalAnterior;
    this.capitalNuevo = capitalNuevo;
    this.modoManual = modoManual;
    this.modoCalculo = modoCalculo;
    this.periodosPagados = periodosPagados;
    this.diasCubiertos = diasCubiertos;
    this.fechaRegistro = new Date();
  }

  // 🔥 NUEVO: Método para normalizar fecha a string local
  _normalizarFecha(fecha) {
    if (!fecha) {
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Si ya es string YYYY-MM-DD, devolverlo
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }
    
    let dateObj;
    if (fecha instanceof Date) {
      dateObj = fecha;
    } else if (fecha.toDate) {
      dateObj = fecha.toDate();
    } else if (typeof fecha === 'string') {
      dateObj = new Date(fecha);
    } else if (fecha._seconds !== undefined) {
      dateObj = new Date(fecha._seconds * 1000);
    } else if (fecha.seconds !== undefined) {
      dateObj = new Date(fecha.seconds * 1000);
    } else {
      dateObj = new Date(fecha);
    }
    
    if (isNaN(dateObj.getTime())) {
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  get montoTotal() {
    return (this.montoCapital || 0) + (this.montoInteres || 0) + (this.montoMora || 0);
  }

  get porcentajeRecuperado() {
    if (!this.capitalAnterior || this.capitalAnterior <= 0) return 0;
    return (this.montoCapital / this.capitalAnterior) * 100;
  }

  validar() {
    if (!this.prestamoID) {
      throw new Error('ID de préstamo es obligatorio');
    }
    if (!this.clienteID) {
      throw new Error('ID de cliente es obligatorio');
    }
    if (this.montoTotal <= 0) {
      throw new Error('El monto total del pago debe ser mayor a 0');
    }
    if (this.montoCapital < 0 || this.montoInteres < 0 || this.montoMora < 0) {
      throw new Error('Los montos no pueden ser negativos');
    }
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      prestamoID: this.prestamoID,
      clienteID: this.clienteID,
      clienteNombre: this.clienteNombre,
      fechaPago: this.fechaPago,
      montoCapital: this.montoCapital,
      montoInteres: this.montoInteres,
      montoMora: this.montoMora,
      montoTotal: this.montoTotal,
      tipoPago: this.tipoPago,
      nota: this.nota,
      capitalAnterior: this.capitalAnterior,
      capitalNuevo: this.capitalNuevo,
      modoManual: this.modoManual,
      modoCalculo: this.modoCalculo,
      periodosPagados: this.periodosPagados,
      diasCubiertos: this.diasCubiertos,
      porcentajeRecuperado: this.porcentajeRecuperado,
      fechaRegistro: this.fechaRegistro
    };
  }
}

module.exports = Pago;