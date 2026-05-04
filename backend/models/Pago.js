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
    
    // 🔥 CORREGIDO: Normalizar fecha a string DD-MM-YYYY
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

  // 🔥 CORREGIDO: Ahora acepta DD-MM-YYYY
  _normalizarFecha(fecha) {
    if (!fecha) {
      const hoy = new Date();
      const day = String(hoy.getDate()).padStart(2, '0');
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const year = hoy.getFullYear();
      return `${day}-${month}-${year}`;
    }
    
    // 🔥 Si ya es string DD-MM-YYYY, devolverlo
    if (typeof fecha === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
      console.log('📅 [Pago] Fecha ya es DD-MM-YYYY:', fecha);
      return fecha;
    }
    
    // 🔥 Compatibilidad: Si es string YYYY-MM-DD, convertir a DD-MM-YYYY
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [year, month, day] = fecha.split('-');
      const fechaConvertida = `${day}-${month}-${year}`;
      console.log('📅 [Pago] Convertido de YYYY-MM-DD a DD-MM-YYYY:', fechaConvertida);
      return fechaConvertida;
    }
    
    // Convertir cualquier otra cosa a DD-MM-YYYY
    let dateObj;
    if (fecha instanceof Date) {
      dateObj = fecha;
    } else if (fecha && typeof fecha === 'object') {
      if (fecha._seconds !== undefined) {
        dateObj = new Date(fecha._seconds * 1000);
      } else if (fecha.seconds !== undefined) {
        dateObj = new Date(fecha.seconds * 1000);
      } else if (fecha.toDate && typeof fecha.toDate === 'function') {
        dateObj = fecha.toDate();
      } else {
        dateObj = new Date(fecha);
      }
    } else if (typeof fecha === 'string') {
      dateObj = new Date(fecha);
    } else if (typeof fecha === 'number') {
      dateObj = new Date(fecha);
    } else {
      dateObj = new Date();
    }
    
    if (isNaN(dateObj.getTime())) {
      const hoy = new Date();
      const day = String(hoy.getDate()).padStart(2, '0');
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const year = hoy.getFullYear();
      console.warn('⚠️ [Pago] Fecha inválida, usando hoy:', `${day}-${month}-${year}`);
      return `${day}-${month}-${year}`;
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    const fechaString = `${day}-${month}-${year}`;
    console.log('📅 [Pago] Fecha convertida a DD-MM-YYYY:', fechaString);
    
    return fechaString;
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