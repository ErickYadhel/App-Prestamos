/**
 * Rutas: /api/notificaciones
 * --------------------------------------------
 * Maneja el envío, listado y registro de notificaciones (WhatsApp, recordatorios, etc.)
 * Compatible con el modelo Notificacion.js mejorado.
 */

const express = require('express');
const admin = require('firebase-admin');
const Notificacion = require('../models/Notificacion');
const router = express.Router();

const db = admin.firestore();

/**
 * Utilidad: generar link de WhatsApp formateado
 * Acepta números locales (809, 829, 849) y los convierte si es necesario.
 */
function generarLinkWhatsapp(telefono, mensaje) {
  let cleanPhone = String(telefono).replace(/\D/g, '');
  // Ajuste para República Dominicana
  if (cleanPhone.length === 10 && /^(809|829|849)/.test(cleanPhone)) {
    cleanPhone = `1${cleanPhone}`; // agrega prefijo internacional de RD
  }
  const mensajeCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${cleanPhone}?text=${mensajeCodificado}`;
}

/**
 * POST /api/notificaciones/whatsapp
 * Crea una notificación y devuelve el link de WhatsApp (gratuito)
 */
router.post('/whatsapp', async (req, res) => {
  try {
    const { telefono, mensaje, tipo, destinatario, metadata } = req.body;

    if (!telefono || !mensaje) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar teléfono y mensaje'
      });
    }

    // Crear instancia
    const notificacion = new Notificacion({
      tipo: tipo || 'personalizado',
      destinatario: destinatario || '',
      telefono,
      mensaje,
      enviada: false,
      estado: 'pendiente',
      fechaProgramada: new Date(),
      metadata: metadata || {},
      canal: 'whatsapp'
    });

    // Validar datos
    notificacion.validar();

    // Guardar en Firestore
    const docRef = db.collection('notificaciones').doc();
    notificacion.id = docRef.id;
    await docRef.set({ ...notificacion });

    // Generar link de WhatsApp
    const whatsappLink = notificacion.generarLinkWhatsapp();

    res.json({
      success: true,
      data: {
        notificacion,
        whatsappLink,
        mensaje: 'Enlace de WhatsApp generado correctamente. Abre el link para enviar el mensaje.'
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notificaciones
 * Permite filtrar por tipo y estado
 */
router.get('/', async (req, res) => {
  try {
    const { tipo, estado, enviada } = req.query;
    let query = db.collection('notificaciones').orderBy('fechaProgramada', 'desc');

    if (tipo) query = query.where('tipo', '==', tipo);
    if (estado) query = query.where('estado', '==', estado);
    if (enviada !== undefined) query = query.where('enviada', '==', enviada === 'true');

    const snap = await query.limit(100).get();

    const notificaciones = [];
    snap.forEach(doc => notificaciones.push({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      data: notificaciones,
      count: notificaciones.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notificaciones/:id/marcar-enviada
 * Marca la notificación como enviada manualmente (por el usuario o el sistema)
 */
router.post('/:id/marcar-enviada', async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection('notificaciones').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Notificación no encontrada' });
    }

    const fechaEnvio = new Date();
    await docRef.update({
      enviada: true,
      estado: 'enviada',
      fechaEnvio,
      error: null
    });

    res.json({
      success: true,
      message: 'Notificación marcada como enviada',
      fechaEnvio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notificaciones/:id/link
 * Devuelve el enlace de WhatsApp correspondiente
 */
router.get('/:id/link', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await db.collection('notificaciones').doc(id).get();
    if (!doc.exists)
      return res.status(404).json({ success: false, error: 'Notificación no encontrada' });

    const data = doc.data();
    if (!data.telefono || !data.mensaje)
      return res.status(400).json({ success: false, error: 'Datos incompletos' });

    const link = generarLinkWhatsapp(data.telefono, data.mensaje);
    res.json({ success: true, link });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Función para generar notificaciones automáticas de recordatorio o mora.
 * Puede ser llamada desde cron, scheduler o manualmente.
 */
async function generarRecordatoriosAutomaticos() {
  try {
    const hoy = new Date();
    const prestamosSnap = await db.collection('prestamos')
      .where('estado', '==', 'activo')
      .get();

    for (const prestamoDoc of prestamosSnap.docs) {
      const prestamo = prestamoDoc.data();
      const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
      if (!clienteDoc.exists) continue;

      const cliente = clienteDoc.data();

      const fechaProximoPago = prestamo.fechaProximoPago?.toDate
        ? prestamo.fechaProximoPago.toDate()
        : new Date(prestamo.fechaProximoPago);

      // Si el pago vence hoy, creamos recordatorio
      const hoyStr = hoy.toISOString().slice(0, 10);
      const pagoStr = fechaProximoPago.toISOString().slice(0, 10);
      if (pagoStr === hoyStr) {
        const mensaje = `Recordatorio EYS Inversiones: Sr(a) ${cliente.nombre}, tiene un pago pendiente de su préstamo. Capital restante: ${prestamo.capitalRestante} ${prestamo.moneda || 'DOP'}.`;
        const noti = new Notificacion({
          tipo: 'pago_recordatorio',
          destinatario: cliente.nombre,
          telefono: cliente.celular,
          mensaje,
          fechaProgramada: hoy,
          metadata: { clienteID: prestamo.clienteID, prestamoID: prestamoDoc.id }
        });

        const docRef = db.collection('notificaciones').doc();
        noti.id = docRef.id;
        await docRef.set({ ...noti });
        console.log(`📱 Recordatorio creado para ${cliente.nombre}`);
      }

      // Si ya venció, creamos notificación de mora (una sola por día)
      if (pagoStr < hoyStr) {
        const mensaje = `Aviso de mora: Sr(a) ${cliente.nombre}, su pago del préstamo con EYS Inversiones venció el ${pagoStr}. Capital restante: ${prestamo.capitalRestante} ${prestamo.moneda || 'DOP'}.`;
        const noti = new Notificacion({
          tipo: 'mora',
          destinatario: cliente.nombre,
          telefono: cliente.celular,
          mensaje,
          fechaProgramada: hoy,
          metadata: { clienteID: prestamo.clienteID, prestamoID: prestamoDoc.id }
        });

        // Evita duplicados en el mismo día
        const existe = await db.collection('notificaciones')
          .where('tipo', '==', 'mora')
          .where('metadata.prestamoID', '==', prestamoDoc.id)
          .where('fechaProgramada', '>=', new Date(Date.now() - 1000 * 60 * 60 * 24))
          .get();

        if (existe.empty) {
          const docRef = db.collection('notificaciones').doc();
          noti.id = docRef.id;
          await docRef.set({ ...noti });
          console.log(`⚠️ Mora creada para ${cliente.nombre}`);
        }
      }
    }
  } catch (error) {
    console.error('Error generando recordatorios automáticos:', error);
  }
}

/**
 * POST /api/notificaciones/generar-manual
 * Ejecuta GENERAR recordatorios/moras ahora mismo (manualmente).
 * Útil para probar sin esperar al cron.
 * (Protege este endpoint más tarde con autenticación si es necesario)
 */
router.post('/generar-manual', async (req, res) => {
  try {
    // Si quieres forzar diasAntesVencimiento desde body: req.body.diasAntes
    const diasAntes = typeof req.body?.diasAntes === 'number' ? req.body.diasAntes : undefined;
    // llamar a la función exportada (si tu archivo exporta generarRecordatoriosAutomaticos)
    if (typeof generarRecordatoriosAutomaticos === 'function') {
      // si la función acepta parámetro opcional, la pasamos; si no, la función lo ignorará
      await generarRecordatoriosAutomaticos(diasAntes);
      return res.json({ success: true, message: 'Generación manual ejecutada' });
    } else {
      return res.status(500).json({ success: false, error: 'Función generadora no disponible' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});



// Exportar para uso interno (cron/scheduler)
module.exports.generarRecordatoriosAutomaticos = generarRecordatoriosAutomaticos;

// ✅ Exportar el router principal para Express
module.exports = router;
