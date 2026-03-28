class Pago {
  constructor({
    id,
    prestamoID,
    clienteID,
    clienteNombre,
    fechaPago = new Date(),
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
    this.fechaPago = fechaPago;
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