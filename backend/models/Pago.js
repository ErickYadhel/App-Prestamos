class Pago {
  constructor({
    id,
    prestamoID,
    clienteID,
    clienteNombre,
    fechaPago = new Date(),
    montoCapital,
    montoInteres,
    tipoPago = 'normal', // 'normal', 'adelantado', 'mora'
    nota = '',
    capitalAnterior,
    capitalNuevo
  }) {
    this.id = id;
    this.prestamoID = prestamoID;
    this.clienteID = clienteID;
    this.clienteNombre = clienteNombre;
    this.fechaPago = fechaPago;
    this.montoCapital = montoCapital;
    this.montoInteres = montoInteres;
    this.tipoPago = tipoPago;
    this.nota = nota;
    this.capitalAnterior = capitalAnterior;
    this.capitalNuevo = capitalNuevo;
  }

  get montoTotal() {
    return this.montoCapital + this.montoInteres;
  }

  validar() {
    if (!this.prestamoID || !this.clienteID || !this.montoTotal) {
      throw new Error('Préstamo, cliente y monto son obligatorios');
    }
    return true;
  }
}

module.exports = Pago;