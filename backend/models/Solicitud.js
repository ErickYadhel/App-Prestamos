class Solicitud {
  constructor({
    id,
    clienteNombre,
    telefono,
    email,
    montoSolicitado,
    plazoMeses = 0, // 0 significa sin plazo fijo
    frecuencia,
    fechaSolicitud = new Date(),
    estado = 'pendiente',
    aprobadoPor = null,
    fechaDecision = null,
    empleadoID = null,
    empleadoNombre = null,
    cuentaCliente = '',
    bancoCliente = '',
    tipoCuenta = 'ahorro',
    lugarTrabajo = '',
    puestoCliente = '',
    sueldoCliente = 0,
    observaciones = '',
    documentosUrl = [],
    direccion = '',
    provincia = '',
    scoreAnalisis = 50
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
    this.bancoCliente = bancoCliente;
    this.tipoCuenta = tipoCuenta;
    this.lugarTrabajo = lugarTrabajo;
    this.puestoCliente = puestoCliente;
    this.sueldoCliente = sueldoCliente;
    this.observaciones = observaciones;
    this.documentosUrl = documentosUrl;
    this.direccion = direccion;
    this.provincia = provincia;
    this.scoreAnalisis = scoreAnalisis;
  }

  validar() {
    if (!this.clienteNombre || !this.telefono || !this.montoSolicitado) {
      throw new Error('Nombre, teléfono y monto son obligatorios');
    }
    
    if (this.montoSolicitado < 1000) {
      throw new Error('El monto mínimo es RD$ 1,000');
    }
    
    if (!this.lugarTrabajo) {
      throw new Error('El lugar de trabajo es obligatorio');
    }
    
    return true;
  }

  puedeSerAprobada() {
    return this.estado === 'pendiente';
  }
}

module.exports = Solicitud;