class Garante {
  constructor({
    id,
    clienteID, // Cliente principal al que garantiza
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
    pais,
    cedulaFotoUrl = null,
    fotoUrl = null,
    activo = true,
    fechaCreacion = new Date()
  }) {
    this.id = id;
    this.clienteID = clienteID;
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
  }

  validar() {
    if (!this.nombre || !this.cedula || !this.celular || !this.clienteID) {
      throw new Error('Nombre, cédula, celular y clienteID son obligatorios');
    }
    return true;
  }
}

module.exports = Garante;