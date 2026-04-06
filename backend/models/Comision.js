// E:\prestamos-eys\backend\models\Comision.js

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

  // Generar ID personalizado: NOMBRECEDULA + FECHA
  static generarIdPersonalizado(garanteNombre, garanteCedula, fechaPago) {
    // Limpiar nombre: quitar tildes, espacios, mayúsculas
    const nombreLimpio = garanteNombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '')
      .toUpperCase()
      .substring(0, 15);
    
    const cedulaLimpia = garanteCedula ? garanteCedula.replace(/\D/g, '').substring(0, 11) : 'XXXX';
    
    const fecha = fechaPago ? new Date(fechaPago) : new Date();
    const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getFullYear()}`;
    
    let idBase = `${nombreLimpio}${cedulaLimpia}${fechaStr}`;
    
    // Limitar a 50 caracteres y eliminar caracteres especiales
    idBase = idBase.replace(/[^A-Z0-9]/g, '').substring(0, 50);
    
    // Agregar timestamp para evitar duplicados
    const timestamp = Date.now().toString().slice(-6);
    
    return `${idBase}${timestamp}`;
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