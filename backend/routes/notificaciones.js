const express = require('express');
const admin = require('firebase-admin');
const Notificacion = require('../models/Notificacion');
const router = express.Router();

const db = admin.firestore();

// POST /api/notificaciones/whatsapp - Enviar notificación WhatsApp
router.post('/whatsapp', async (req, res) => {
  try {
    const { telefono, mensaje, tipo, destinatario, metadata } = req.body;

    // Crear registro de notificación
    const notificacionData = {
      tipo: tipo || 'personalizado',
      destinatario: destinatario || '',
      telefono,
      mensaje,
      enviada: false,
      fechaProgramada: new Date(),
      metadata: metadata || {}
    };

    const notificacion = new Notificacion(notificacionData);

    // Guardar en Firestore
    const docRef = db.collection('notificaciones').doc();
    notificacion.id = docRef.id;

    await docRef.set({ ...notificacion });

    // Generar link de WhatsApp (solución temporal gratuita)
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappLink = `https://wa.me/${telefono}?text=${mensajeCodificado}`;

    res.json({
      success: true,
      data: {
        notificacion,
        whatsappLink,
        mensaje: 'Enlace de WhatsApp generado. Abre el link para enviar el mensaje.'
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/notificaciones - Listar notificaciones
router.get('/', async (req, res) => {
  try {
    const { tipo, enviada } = req.query;
    let query = db.collection('notificaciones').orderBy('fechaProgramada', 'desc');

    if (tipo) query = query.where('tipo', '==', tipo);
    if (enviada !== undefined) query = query.where('enviada', '==', enviada === 'true');

    const notificacionesSnapshot = await query.limit(50).get();
    
    const notificaciones = [];
    notificacionesSnapshot.forEach(doc => {
      notificaciones.push({ id: doc.id, ...doc.data() });
    });

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

// Función para enviar recordatorios automáticos (se ejecutaría periódicamente)
async function enviarRecordatoriosAutomaticos() {
  try {
    // Obtener préstamos con pagos próximos
    const hoy = new Date();
    const prestamosSnapshot = await db.collection('prestamos')
      .where('estado', '==', 'activo')
      .get();

    for (const doc of prestamosSnapshot.docs) {
      const prestamo = doc.data();
      const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
      
      if (clienteDoc.exists) {
        const cliente = clienteDoc.data();
        const mensaje = `Recordatorio EYS Inversiones: Sr(a) ${cliente.nombre}, tiene un pago pendiente de su préstamo. Capital restante: ${prestamo.capitalRestante} ${prestamo.moneda || 'DOP'}`;
        
        // Crear notificación
        const notificacion = new Notificacion({
          tipo: 'pago_recordatorio',
          destinatario: cliente.nombre,
          telefono: cliente.celular,
          mensaje: mensaje,
          fechaProgramada: hoy
        });

        const notifRef = db.collection('notificaciones').doc();
        notificacion.id = notifRef.id;
        await notifRef.set({ ...notificacion });

        console.log(`📱 Recordatorio creado para: ${cliente.nombre}`);
      }
    }
  } catch (error) {
    console.error('Error enviando recordatorios:', error);
  }
}

module.exports = router;