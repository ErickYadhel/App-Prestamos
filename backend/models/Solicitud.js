class Solicitud {
  constructor({
    id,
    clienteNombre,
    cedula,
    telefono,
    email,
    montoSolicitado,
    plazoMeses = 0,
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
    fechaIngreso = null,
    observaciones = '',
    documentosUrl = [],
    direccion = '',
    provincia = '',
    garantia = '',
    scoreAnalisis = 50,
    prestamoId = null,
    montoAprobado = null,
    interesAprobado = null,
    frecuenciaAprobada = null,
    fechaAprobacionCliente = null,
    evidenciaFirma = null
  }) {
    this.id = id;
    this.clienteNombre = clienteNombre;
    this.cedula = cedula;
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
    this.fechaIngreso = fechaIngreso;
    this.observaciones = observaciones;
    this.documentosUrl = documentosUrl;
    this.direccion = direccion;
    this.provincia = provincia;
    this.garantia = garantia;
    this.scoreAnalisis = scoreAnalisis;
    this.prestamoId = prestamoId;
    this.montoAprobado = montoAprobado;
    this.interesAprobado = interesAprobado;
    this.frecuenciaAprobada = frecuenciaAprobada;
    this.fechaAprobacionCliente = fechaAprobacionCliente;
    this.evidenciaFirma = evidenciaFirma;
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