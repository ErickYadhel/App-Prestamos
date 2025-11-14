/**
 * Modelo: Notificacion
 * -------------------------------------
 * Representa una notificación del sistema de préstamos EYS Inversiones.
 * Soporta tipos: pago_recordatorio, mora, pago_confirmacion, solicitud_nueva, etc.
 * Compatible con cron y envío por WhatsApp.
 */

class Notificacion {
  constructor({
    id,
    tipo, // 'pago_recordatorio', 'mora', 'pago_confirmacion', 'solicitud_nueva'
    destinatario, // nombre del cliente o usuario destino
    telefono, // número sin +, formato local o internacional
    mensaje,
    enviada = false, // booleano si se envió correctamente
    estado = 'pendiente', // 'pendiente', 'enviada', 'fallida'
    fechaEnvio = null, // fecha cuando se envió
    fechaProgramada = new Date(), // fecha programada para enviar
    intentos = 0, // número de intentos de envío
    error = null, // error del último intento
    metadata = {}, // datos extra (prestamoID, clienteID, etc.)
    canal = 'whatsapp', // 'whatsapp', 'email', 'sms'
    prioridad = 'normal' // 'alta', 'normal', 'baja'
  }) {
    this.id = id;
    this.tipo = tipo;
    this.destinatario = destinatario;
    this.telefono = telefono;
    this.mensaje = mensaje;
    this.enviada = enviada;
    this.estado = estado;
    this.fechaEnvio = fechaEnvio;
    this.fechaProgramada = fechaProgramada;
    this.intentos = intentos;
    this.error = error;
    this.metadata = metadata;
    this.canal = canal;
    this.prioridad = prioridad;
  }

  /**
   * Devuelve un resumen textual de la notificación.
   */
  resumen() {
    return `[${this.tipo}] → ${this.destinatario} (${this.telefono}) :: ${this.mensaje.slice(0, 50)}${this.mensaje.length > 50 ? '...' : ''}`;
  }

  /**
   * Valida que los datos mínimos estén completos.
   */
  validar() {
    if (!this.tipo) throw new Error('El tipo de notificación es obligatorio');
    if (!this.telefono) throw new Error('El teléfono del destinatario es obligatorio');
    if (!this.mensaje) throw new Error('El mensaje no puede estar vacío');
    return true;
  }

  /**
   * Genera automáticamente el link de WhatsApp para enviar el mensaje.
   * (Ejemplo: https://api.whatsapp.com/send?phone=8095551234&text=Hola)
   */
  generarLinkWhatsapp() {
    const base = 'https://api.whatsapp.com/send';
    const phoneParam = `phone=${encodeURIComponent(this.telefono)}`;
    const textParam = `text=${encodeURIComponent(this.mensaje)}`;
    return `${base}?${phoneParam}&${textParam}`;
  }

  /**
   * Marca la notificación como enviada exitosamente.
   */
  marcarEnviada() {
    this.enviada = true;
    this.estado = 'enviada';
    this.fechaEnvio = new Date();
    this.error = null;
  }

  /**
   * Marca la notificación como fallida, registrando el error.
   */
  marcarError(errMsg) {
    this.estado = 'fallida';
    this.enviada = false;
    this.error = errMsg;
    this.intentos += 1;
  }
}

module.exports = Notificacion;
