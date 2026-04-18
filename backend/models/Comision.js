class Comision {
  constructor({
    id,
    tipo = 'prestamo', // prestamo, manual, ajuste
    garanteID,
    garanteNombre,
    prestamoID = null,
    clienteID = null,
    clienteNombre = '',
    pagoID = null,
    montoBase = 0,
    porcentaje = 50,
    montoComision = 0,
    fechaPago = null,
    fechaGeneracion = new Date(),
    estado = 'pendiente', // pendiente, pagada, cancelada
    fechaPagoGarante = null,
    descripcion = '',
    periodo = null,
    creadoPor = 'sistema', // sistema, admin, usuario
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.tipo = tipo;
    this.garanteID = garanteID;
    this.garanteNombre = garanteNombre;
    this.prestamoID = prestamoID;
    this.clienteID = clienteID;
    this.clienteNombre = clienteNombre;
    this.pagoID = pagoID;
    this.montoBase = parseFloat(montoBase) || 0;
    this.porcentaje = parseFloat(porcentaje) || 0;
    this.montoComision = parseFloat(montoComision) || 0;
    this.fechaPago = fechaPago ? (fechaPago instanceof Date ? fechaPago : new Date(fechaPago)) : null;
    this.fechaGeneracion = fechaGeneracion instanceof Date ? fechaGeneracion : new Date(fechaGeneracion);
    this.estado = estado;
    this.fechaPagoGarante = fechaPagoGarante ? (fechaPagoGarante instanceof Date ? fechaPagoGarante : new Date(fechaPagoGarante)) : null;
    this.descripcion = descripcion;
    this.periodo = periodo || this._calcularPeriodo(this.fechaPago);
    this.creadoPor = creadoPor;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  // ============================================
  // MÉTODO PARA GENERAR ID PERSONALIZADO LEGIBLE
  // Formato: ClienteNombre-GaranteNombre-Fecha (ej: JuanPerez-PedritoPerez-18-4-26)
  // ============================================
  static generarIdPersonalizado(clienteNombre, garanteNombre, fechaPago) {
    if (!clienteNombre && !garanteNombre) {
      return `comision-${Date.now()}`;
    }
    
    // Función para limpiar nombre (quitar tildes, espacios, caracteres especiales)
    const limpiarNombre = (nombre) => {
      if (!nombre) return '';
      return nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
        .trim()
        .replace(/\s+/g, '')
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
        .join('');
    };
    
    // Limpiar nombres
    const clienteLimpio = limpiarNombre(clienteNombre);
    const garanteLimpio = limpiarNombre(garanteNombre);
    
    // Formatear fecha: DD-M-YY (ej: 18-4-26)
    let fecha;
    if (fechaPago instanceof Date) {
      fecha = fechaPago;
    } else if (fechaPago?.toDate) {
      fecha = fechaPago.toDate();
    } else {
      fecha = new Date(fechaPago);
    }
    
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const anio = fecha.getFullYear().toString().slice(-2);
    const fechaFormateada = `${dia}-${mes}-${anio}`;
    
    // Construir ID base
    let idBase = '';
    if (clienteLimpio && garanteLimpio) {
      idBase = `${clienteLimpio}-${garanteLimpio}-${fechaFormateada}`;
    } else if (clienteLimpio) {
      idBase = `${clienteLimpio}-${fechaFormateada}`;
    } else if (garanteLimpio) {
      idBase = `${garanteLimpio}-${fechaFormateada}`;
    } else {
      idBase = `comision-${fechaFormateada}`;
    }
    
    // Limitar longitud máxima
    if (idBase.length > 100) {
      idBase = idBase.substring(0, 100);
    }
    
    console.log(`🔑 ID de comisión generado: ${idBase}`);
    console.log(`   Cliente: ${clienteNombre} → ${clienteLimpio}`);
    console.log(`   Garante: ${garanteNombre} → ${garanteLimpio}`);
    console.log(`   Fecha: ${fechaFormateada}`);
    
    return idBase;
  }

  // Método alternativo para compatibilidad con código existente (legacy)
  static generarIdPersonalizadoLegacy(garanteNombre, garanteCedula, fechaPago) {
    const fecha = fechaPago ? new Date(fechaPago) : new Date();
    const fechaStr = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear().toString().slice(-2)}`;
    
    const nombreLimpio = garanteNombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '')
      .toUpperCase()
      .substring(0, 20);
    
    const cedulaLimpia = garanteCedula ? garanteCedula.replace(/\D/g, '').substring(0, 8) : '';
    
    let idBase = `${nombreLimpio}${cedulaLimpia}-${fechaStr}`;
    idBase = idBase.replace(/[^A-Za-z0-9-]/g, '').substring(0, 50);
    
    return idBase;
  }

  _calcularPeriodo(fecha) {
    if (!fecha) return null;
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    const dia = date.getDate();
    const mes = date.getMonth() + 1;
    const año = date.getFullYear();
    
    if (dia <= 15) {
      return `${año}-${mes.toString().padStart(2, '0')}-15`;
    } else {
      const ultimoDia = new Date(año, mes, 0).getDate();
      return `${año}-${mes.toString().padStart(2, '0')}-${ultimoDia}`;
    }
  }

  marcarComoPagada(pagadoPor = 'admin') {
    this.estado = 'pagada';
    this.fechaPagoGarante = new Date();
    this.updatedAt = new Date();
    this.pagadoPor = pagadoPor;
  }

  marcarComoCancelada(motivo = '') {
    this.estado = 'cancelada';
    this.motivoCancelacion = motivo;
    this.updatedAt = new Date();
  }

  toFirestore() {
    return {
      tipo: this.tipo,
      garanteID: this.garanteID,
      garanteNombre: this.garanteNombre,
      prestamoID: this.prestamoID,
      clienteID: this.clienteID,
      clienteNombre: this.clienteNombre,
      pagoID: this.pagoID,
      montoBase: this.montoBase,
      porcentaje: this.porcentaje,
      montoComision: this.montoComision,
      fechaPago: this.fechaPago,
      fechaGeneracion: this.fechaGeneracion,
      estado: this.estado,
      fechaPagoGarante: this.fechaPagoGarante,
      descripcion: this.descripcion,
      periodo: this.periodo,
      creadoPor: this.creadoPor,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Comision({
      id: doc.id,
      ...data
    });
  }
}

module.exports = Comision;