// E:\prestamos-eys\backend\services\notificationService.js
const admin = require('firebase-admin');

const db = admin.firestore();

// ============================================
// FUNCIÓN PARA GENERAR ID ÚNICO DE NOTIFICACIÓN
// ============================================
const generarIdNotificacion = () => {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

// ============================================
// FUNCIÓN PRINCIPAL PARA CREAR NOTIFICACIONES
// ============================================
const crearNotificacion = async (tipo, titulo, mensaje, destinatario, clienteID, metadata = {}) => {
  try {
    const notificacion = {
      id: generarIdNotificacion(),
      tipo: tipo,
      titulo: titulo,
      mensaje: mensaje,
      destinatario: destinatario,
      clienteID: clienteID,
      leida: false,
      whatsappEnviado: false,
      enviada: false,
      intentos: 0,
      fechaCreacion: new Date().toISOString(),
      metadata: {
        ...metadata,
        clienteID: clienteID,
        clienteNombre: destinatario
      }
    };
    
    const docRef = db.collection('notificaciones').doc();
    notificacion.id = docRef.id;
    await docRef.set(notificacion);
    
    console.log(`✅ Notificación creada: ${tipo} - ${destinatario}`);
    return notificacion;
  } catch (error) {
    console.error('❌ Error creando notificación:', error);
    return null;
  }
};

// ============================================
// 1. NOTIFICACIÓN DE PRÉSTAMO PRÓXIMO A VENCER
// ============================================
const notificarPrestamoProximoVencer = async (prestamo, cliente, diasRestantes) => {
  const titulo = `📅 Préstamo próximo a vencer`;
  const mensaje = `Estimado(a) ${cliente.nombre}, su préstamo de RD$ ${prestamo.capitalRestante.toLocaleString()} vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}. 
  Fecha límite: ${new Date(prestamo.fechaProximoPago).toLocaleDateString()}
  Interés del período: RD$ ${((prestamo.capitalRestante * prestamo.interesPercent) / 100).toLocaleString()}`;
  
  return await crearNotificacion(
    'pago_proximo',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      prestamoID: prestamo.id,
      capitalRestante: prestamo.capitalRestante,
      interesPeriodo: (prestamo.capitalRestante * prestamo.interesPercent) / 100,
      fechaProximoPago: prestamo.fechaProximoPago,
      diasRestantes: diasRestantes
    }
  );
};

// ============================================
// 2. NOTIFICACIÓN DE PRÉSTAMO VENCIDO (MORA)
// ============================================
const notificarPrestamoVencido = async (prestamo, cliente, diasVencidos, moraCalculada) => {
  const titulo = `⚠️ Préstamo VENCIDO - Acción requerida`;
  const mensaje = `⚠️ ATENCIÓN: El préstamo de ${cliente.nombre} tiene ${diasVencidos} día${diasVencidos !== 1 ? 's' : ''} de VENCIMIENTO.
  Capital pendiente: RD$ ${prestamo.capitalRestante.toLocaleString()}
  Mora acumulada: RD$ ${moraCalculada.toLocaleString()}
  ¡Regularice su situación lo antes posible!`;
  
  return await crearNotificacion(
    'prestamo_vencido',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      prestamoID: prestamo.id,
      capitalRestante: prestamo.capitalRestante,
      diasVencidos: diasVencidos,
      moraCalculada: moraCalculada
    }
  );
};

// ============================================
// 3. NOTIFICACIÓN DE NUEVA SOLICITUD DE PRÉSTAMO
// ============================================
const notificarNuevaSolicitud = async (solicitud, cliente) => {
  const titulo = `📋 Nueva Solicitud de Préstamo`;
  const mensaje = `Se ha recibido una nueva solicitud de préstamo de ${cliente.nombre}.
  Monto solicitado: RD$ ${(solicitud.montoSolicitado || 0).toLocaleString()}
  Fecha de solicitud: ${new Date().toLocaleDateString()}
  Por favor revise los detalles y tome acción.`;
  
  return await crearNotificacion(
    'nueva_solicitud',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      solicitudID: solicitud.id,
      montoSolicitado: solicitud.montoSolicitado,
      fechaSolicitud: new Date().toISOString()
    }
  );
};

// ============================================
// 4. NOTIFICACIÓN DE NUEVO PRÉSTAMO APROBADO
// ============================================
const notificarNuevoPrestamo = async (prestamo, cliente) => {
  const titulo = `✅ Préstamo APROBADO y DESEMBOLSADO`;
  const mensaje = `¡FELICIDADES! El préstamo de ${cliente.nombre} ha sido APROBADO y DESEMBOLSADO.
  Monto: RD$ ${prestamo.montoPrestado.toLocaleString()}
  Plazo: ${prestamo.frecuencia}
  Próximo pago: ${new Date(prestamo.fechaProximoPago).toLocaleDateString()}
  ¡Gracias por confiar en EYS Inversiones!`;
  
  return await crearNotificacion(
    'nuevo_prestamo',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      prestamoID: prestamo.id,
      montoPrestado: prestamo.montoPrestado,
      frecuencia: prestamo.frecuencia,
      fechaProximoPago: prestamo.fechaProximoPago
    }
  );
};

// ============================================
// 5. NOTIFICACIÓN DE PAGO REGISTRADO
// ============================================
const notificarPagoRegistrado = async (pago, prestamo, cliente) => {
  const titulo = `💰 Pago Registrado Correctamente`;
  const mensaje = `Se ha registrado un pago de ${cliente.nombre} por RD$ ${(pago.montoTotal || 0).toLocaleString()}
  Capital restante: RD$ ${(prestamo.capitalRestante || 0).toLocaleString()}
  Fecha de pago: ${new Date(pago.fechaPago).toLocaleDateString()}
  ¡Gracias por su puntualidad!`;
  
  return await crearNotificacion(
    'pago_registrado',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      prestamoID: prestamo.id,
      pagoID: pago.id,
      montoPagado: pago.montoTotal,
      capitalRestante: prestamo.capitalRestante,
      nuevoCapital: pago.capitalNuevo
    }
  );
};

// ============================================
// 6. NOTIFICACIÓN DE COMISIÓN GENERADA
// ============================================
const notificarComisionGenerada = async (comision, garante, cliente) => {
  const titulo = `🎁 Comisión Generada`;
  const mensaje = `Se ha generado una comisión de RD$ ${(comision.montoComision || 0).toLocaleString()} para ${garante.nombre || comision.garanteNombre}
  Cliente referido: ${cliente.nombre}
  Monto base (interés): RD$ ${(comision.montoBase || 0).toLocaleString()}
  ¡Excelente trabajo!`;
  
  return await crearNotificacion(
    'comision_generada',
    titulo,
    mensaje,
    garante.nombre || comision.garanteNombre,
    cliente.id,
    {
      garanteID: comision.garanteID,
      comisionID: comision.id,
      montoComision: comision.montoComision,
      clienteID: cliente.id,
      prestamoID: comision.prestamoID
    }
  );
};

// ============================================
// 7. NOTIFICACIÓN DE SOLICITUD APROBADA
// ============================================
const notificarSolicitudAprobada = async (solicitud, cliente) => {
  const titulo = `✅ Solicitud APROBADA`;
  const mensaje = `¡BUENAS NOTICIAS! La solicitud de préstamo de ${cliente.nombre} ha sido APROBADA.
  Monto aprobado: RD$ ${((solicitud.montoAprobado || solicitud.montoSolicitado) || 0).toLocaleString()}
  Pronto nos comunicaremos para formalizar el desembolso.`;
  
  return await crearNotificacion(
    'solicitud_aprobada',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      solicitudID: solicitud.id,
      montoAprobado: solicitud.montoAprobado || solicitud.montoSolicitado
    }
  );
};

// ============================================
// 8. NOTIFICACIÓN DE SOLICITUD RECHAZADA
// ============================================
const notificarSolicitudRechazada = async (solicitud, cliente, motivo) => {
  const titulo = `❌ Solicitud RECHAZADA`;
  const mensaje = `Lamentamos informarle que la solicitud de préstamo de ${cliente.nombre} ha sido RECHAZADA.
  Motivo: ${motivo || 'No cumple con los requisitos establecidos'}
  Para más información, comuníquese con nuestro equipo de atención al cliente.`;
  
  return await crearNotificacion(
    'solicitud_rechazada',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      solicitudID: solicitud.id,
      motivo: motivo
    }
  );
};

// ============================================
// 9. NOTIFICACIÓN DE PRÉSTAMO COMPLETADO
// ============================================
const notificarPrestamoCompletado = async (prestamo, cliente) => {
  const titulo = `🏆 Préstamo COMPLETADO`;
  const mensaje = `¡FELICITACIONES! ${cliente.nombre} ha COMPLETADO el pago total de su préstamo.
  Monto total pagado: RD$ ${(prestamo.montoPrestado || 0).toLocaleString()}
  ¡Gracias por confiar en EYS Inversiones! Esperamos seguir apoyándole en el futuro.`;
  
  return await crearNotificacion(
    'prestamo_completado',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      prestamoID: prestamo.id,
      montoTotalPagado: prestamo.montoPrestado
    }
  );
};

// ============================================
// 10. NOTIFICACIÓN DE CLIENTE NUEVO REGISTRADO
// ============================================
const notificarClienteNuevo = async (cliente) => {
  const titulo = `👤 Nuevo Cliente Registrado`;
  const mensaje = `Se ha registrado un nuevo cliente en el sistema: ${cliente.nombre}
  Cédula: ${cliente.cedula}
  Teléfono: ${cliente.celular}
  Fecha de registro: ${new Date().toLocaleDateString()}`;
  
  return await crearNotificacion(
    'cliente_nuevo',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      clienteID: cliente.id,
      cedula: cliente.cedula,
      telefono: cliente.celular
    }
  );
};

// ============================================
// 11. NOTIFICACIÓN DE GARANTE ASIGNADO
// ============================================
const notificarGaranteAsignado = async (prestamo, cliente, garante) => {
  const titulo = `🤝 Garante Asignado`;
  const mensaje = `Se ha asignado un garante para el préstamo de ${cliente.nombre}.
  Garante: ${garante.nombre || prestamo.garanteNombre}
  Monto del préstamo: RD$ ${(prestamo.montoPrestado || 0).toLocaleString()}
  El garante recibirá comisiones por los pagos de interés.`;
  
  return await crearNotificacion(
    'garante_asignado',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      prestamoID: prestamo.id,
      garanteID: prestamo.garanteID,
      garanteNombre: garante.nombre || prestamo.garanteNombre
    }
  );
};

// ============================================
// FUNCIÓN PARA GENERAR NOTIFICACIONES MASIVAS
// ============================================
const generarNotificacionesMasivas = async () => {
  console.log('🚀 Generando notificaciones masivas...');
  
  try {
    const hoy = new Date();
    const tresDias = new Date();
    tresDias.setDate(hoy.getDate() + 3);
    
    const prestamosSnapshot = await db.collection('prestamos')
      .where('estado', '==', 'activo')
      .get();
    
    for (const doc of prestamosSnapshot.docs) {
      const prestamo = doc.data();
      const fechaProximoPago = prestamo.fechaProximoPago?.toDate?.() || new Date(prestamo.fechaProximoPago);
      
      if (!fechaProximoPago) continue;
      
      const diasRestantes = Math.ceil((fechaProximoPago - hoy) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes <= 3 && diasRestantes >= 0 && prestamo.capitalRestante > 0) {
        const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
        if (clienteDoc.exists()) {
          await notificarPrestamoProximoVencer(
            { ...prestamo, id: doc.id },
            { id: prestamo.clienteID, ...clienteDoc.data() },
            diasRestantes
          );
        }
      }
      
      if (fechaProximoPago < hoy && prestamo.capitalRestante > 0) {
        const diasVencidos = Math.ceil((hoy - fechaProximoPago) / (1000 * 60 * 60 * 24));
        const interesDiario = (prestamo.capitalRestante * prestamo.interesPercent) / 100 / 30;
        const moraCalculada = interesDiario * diasVencidos * 0.05;
        
        const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
        if (clienteDoc.exists()) {
          await notificarPrestamoVencido(
            { ...prestamo, id: doc.id },
            { id: prestamo.clienteID, ...clienteDoc.data() },
            diasVencidos,
            moraCalculada
          );
        }
      }
    }
    
    console.log('✅ Notificaciones masivas generadas correctamente');
  } catch (error) {
    console.error('❌ Error generando notificaciones masivas:', error);
  }
};

module.exports = {
  crearNotificacion,
  notificarPrestamoProximoVencer,
  notificarPrestamoVencido,
  notificarNuevaSolicitud,
  notificarNuevoPrestamo,
  notificarPagoRegistrado,
  notificarComisionGenerada,
  notificarSolicitudAprobada,
  notificarSolicitudRechazada,
  notificarPrestamoCompletado,
  notificarClienteNuevo,
  notificarGaranteAsignado,
  generarNotificacionesMasivas
};