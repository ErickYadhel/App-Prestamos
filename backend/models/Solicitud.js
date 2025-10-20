class Solicitud {
  constructor({
    id,
    clienteNombre,
    telefono,
    email,
    montoSolicitado,
    plazoMeses,
    frecuencia,
    fechaSolicitud = new Date(),
    estado = 'pendiente', // 'pendiente', 'aprobada', 'rechazada'
    aprobadoPor = null,
    fechaDecision = null,
    empleadoID = null,
    empleadoNombre = null,
    cuentaCliente = '',
    lugarTrabajo = '',
    sueldoCliente = 0,
    observaciones = '',
    documentosUrl = []
  }) {
    this.id = id;
    this.clienteNombre = clienteNombre;
    this.telefono = telefono;
    this.email = email;
    this.montoSolicitado = montoSolicitado;
    this.plazoMeses = plazoMeses;
    this.frecuencia = frecuencia;
    this.fechaSolicitud = fechaSolicitud;
    this.estado = estado;
    this.aprobadoPor = aprobadoPor;
    this.fechaDecision = fechaDecision;
    this.empleadoID = empleadoID;
    this.empleadoNombre = empleadoNombre;
    this.cuentaCliente = cuentaCliente;
    this.lugarTrabajo = lugarTrabajo;
    this.sueldoCliente = sueldoCliente;
    this.observaciones = observaciones;
    this.documentosUrl = documentosUrl;
  }

  validar() {
    if (!this.clienteNombre || !this.telefono || !this.montoSolicitado) {
      throw new Error('Nombre, teléfono y monto son obligatorios');
    }
    return true;
  }

  puedeSerAprobada() {
    return this.estado === 'pendiente';
  }
}

module.exports = Solicitud;