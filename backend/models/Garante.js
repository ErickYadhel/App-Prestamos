class Garante {
  constructor({
    id,
    clienteID, // Cliente principal al que garantiza
    clienteNombre, // Nombre del cliente para fácil referencia
    nombre,
    cedula,
    edad,
    celular,
    email,
    trabajo,
    sueldo,
    puesto,
    direccion,
    sector,
    provincia,
    pais = 'República Dominicana',
    cedulaFotoUrl = null,
    fotoUrl = null,
    activo = true,
    fechaCreacion = new Date(),
    fechaModificacion = null,
    fechaEliminacion = null,
    // Campos adicionales para gestión
    tipoGarante = 'personal', // 'personal', 'comercial'
    relacionCliente = '', // 'Familiar', 'Amigo', 'Colega', etc.
    capacidadEndeudamiento = 0,
    observaciones = '',
    // Historial de garantías
    prestamosGarantizados = [], // Array de IDs de préstamos
    prestamosActivos = 0,
    historialGarantias = [] // Historial de préstamos garantizados
  }) {
    this.id = id;
    this.clienteID = clienteID;
    this.clienteNombre = clienteNombre;
    this.nombre = nombre;
    this.cedula = cedula;
    this.edad = edad;
    this.celular = celular;
    this.email = email;
    this.trabajo = trabajo;
    this.sueldo = sueldo;
    this.puesto = puesto;
    this.direccion = direccion;
    this.sector = sector;
    this.provincia = provincia;
    this.pais = pais;
    this.cedulaFotoUrl = cedulaFotoUrl;
    this.fotoUrl = fotoUrl;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
    this.fechaModificacion = fechaModificacion;
    this.fechaEliminacion = fechaEliminacion;
    this.tipoGarante = tipoGarante;
    this.relacionCliente = relacionCliente;
    this.capacidadEndeudamiento = capacidadEndeudamiento;
    this.observaciones = observaciones;
    this.prestamosGarantizados = prestamosGarantizados;
    this.prestamosActivos = prestamosActivos;
    this.historialGarantias = historialGarantias;
  }

  validar() {
    const errors = [];

    if (!this.nombre?.trim()) {
      errors.push('El nombre es requerido');
    }

    if (!this.cedula?.trim()) {
      errors.push('La cédula es requerida');
    } else if (!this.validarCedula(this.cedula)) {
      errors.push('La cédula no tiene un formato válido');
    }

    if (!this.celular?.trim()) {
      errors.push('El celular es requerido');
    }

    if (!this.clienteID) {
      errors.push('El cliente asociado es requerido');
    }

    if (this.edad && (this.edad < 18 || this.edad > 100)) {
      errors.push('La edad debe estar entre 18 y 100 años');
    }

    if (this.email && !this.validarEmail(this.email)) {
      errors.push('El email no tiene un formato válido');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return true;
  }

  validarCedula(cedula) {
    // Validación básica de cédula dominicana
    const cedulaRegex = /^\d{3}-\d{7}-\d{1}$|^\d{11}$/;
    return cedulaRegex.test(cedula);
  }

  validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Calcular capacidad de endeudamiento basado en sueldo
  calcularCapacidadEndeudamiento() {
    if (!this.sueldo || this.sueldo <= 0) return 0;
    
    // Capacidad típica: 40% del sueldo mensual
    const capacidadMensual = this.sueldo * 0.4;
    
    // Capacidad anual (para préstamos a largo plazo)
    return capacidadMensual * 12;
  }

  // Agregar préstamo garantizado
  agregarPrestamoGarantizado(prestamoID, monto, fecha) {
    this.prestamosGarantizados.push(prestamoID);
    this.prestamosActivos++;
    
    this.historialGarantias.push({
      prestamoID,
      monto,
      fecha: fecha || new Date(),
      estado: 'activo'
    });
  }

  // Completar préstamo garantizado
  completarPrestamoGarantizado(prestamoID) {
    const garantia = this.historialGarantias.find(g => 
      g.prestamoID === prestamoID && g.estado === 'activo'
    );
    
    if (garantia) {
      garantia.estado = 'completado';
      garantia.fechaCompletado = new Date();
      this.prestamosActivos = Math.max(0, this.prestamosActivos - 1);
    }
  }

  // Obtener historial de garantías
  obtenerHistorial() {
    return this.historialGarantias.sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
  }

  // Verificar si puede garantizar un nuevo préstamo
  puedeGarantizar(montoNuevoPrestamo = 0) {
    if (!this.activo) return false;
    
    const capacidadTotal = this.calcularCapacidadEndeudamiento();
    const montoActualGarantizado = this.historialGarantias
      .filter(g => g.estado === 'activo')
      .reduce((sum, g) => sum + (g.monto || 0), 0);
    
    return (montoActualGarantizado + montoNuevoPrestamo) <= capacidadTotal;
  }

  // Obtener resumen para dashboard
  obtenerResumen() {
    return {
      id: this.id,
      nombre: this.nombre,
      cedula: this.cedula,
      clienteNombre: this.clienteNombre,
      prestamosActivos: this.prestamosActivos,
      capacidadEndeudamiento: this.calcularCapacidadEndeudamiento(),
      puedeGarantizar: this.puedeGarantizar(),
      activo: this.activo
    };
  }
}

module.exports = Garante;