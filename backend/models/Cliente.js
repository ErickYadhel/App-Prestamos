class Cliente {
  constructor({
    id = null,
    nombre,
    cedula,
    edad,
    celular,
    email = '',
    trabajo = '',
    sueldo = 0,
    puesto = '',
    direccion = '',
    sector = '',
    provincia = '',
    pais = 'República Dominicana',
    cedulaFotos = null,
    fotoUrl = null,
    activo = true,
    fechaCreacion = new Date(),
    fechaActualizacion = null,
    fechaEliminacion = null
  }) {
    this.id = id;
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
    this.cedulaFotos = cedulaFotos;
    this.fotoUrl = fotoUrl;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
    this.fechaEliminacion = fechaEliminacion;
  }

  validar() {
    const errors = [];
    
    if (!this.nombre || this.nombre.trim().length < 2) {
      errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
    }
    
    if (!this.cedula || this.cedula.trim().length < 5) {
      errors.push('La cédula es obligatoria');
    }
    
    if (!this.celular || this.celular.trim().length < 10) {
      errors.push('El celular es obligatorio y debe tener al menos 10 dígitos');
    }
    
    if (this.edad && (this.edad < 18 || this.edad > 100)) {
      errors.push('La edad debe estar entre 18 y 100 años');
    }
    
    if (this.email && !/\S+@\S+\.\S+/.test(this.email)) {
      errors.push('El formato del email es inválido');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return true;
  }
}

module.exports = Cliente;