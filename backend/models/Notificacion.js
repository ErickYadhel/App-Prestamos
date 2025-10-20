class Notificacion {
  constructor({
    id,
    tipo, // 'pago_recordatorio', 'mora', 'pago_confirmacion', 'solicitud_nueva'
    destinatario,
    telefono,
    mensaje,
    enviada = false,
    fechaEnvio = null,
    fechaProgramada = new Date(),
    intentos = 0,
    error = null,
    metadata = {}
  }) {
    this.id = id;
    this.tipo = tipo;
    this.destinatario = destinatario;
    this.telefono = telefono;
    this.mensaje = mensaje;
    this.enviada = enviada;
    this.fechaEnvio = fechaEnvio;
    this.fechaProgramada = fechaProgramada;
    this.intentos = intentos;
    this.error = error;
    this.metadata = metadata;
  }
}

module.exports = Notificacion;