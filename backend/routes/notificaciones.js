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
 * 🔥 FUNCIÓN PARA GENERAR NOTIFICACIONES AUTOMÁTICAS DE RECORDATORIO O MORA
 * Esta función es la que se exporta para ser usada en server.js
 */
async function generarRecordatoriosAutomaticos(diasAntesVencimiento = 1) {
  try {
    console.log(`📱 Generando recordatorios automáticos (${diasAntesVencimiento} días antes de vencimiento)...`);
    
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + diasAntesVencimiento);
    
    const prestamosSnap = await db.collection('prestamos')
      .where('estado', '==', 'activo')
      .get();

    let recordatoriosCreados = 0;
    let morasCreadas = 0;

    for (const prestamoDoc of prestamosSnap.docs) {
      const prestamo = prestamoDoc.data();
      const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
      if (!clienteDoc.exists) continue;

      const cliente = clienteDoc.data();
      
      // Convertir fecha próximo pago
      let fechaProximoPago;
      if (prestamo.fechaProximoPago?.toDate) {
        fechaProximoPago = prestamo.fechaProximoPago.toDate();
      } else if (prestamo.fechaProximoPago) {
        fechaProximoPago = new Date(prestamo.fechaProximoPago);
      } else {
        continue;
      }

      // Normalizar fechas (solo comparar día/mes/año)
      const hoyStr = hoy.toISOString().slice(0, 10);
      const pagoStr = fechaProximoPago.toISOString().slice(0, 10);
      const fechaLimiteStr = fechaLimite.toISOString().slice(0, 10);

      // ============================================
      // 1. RECORDATORIO: si el pago vence hoy o en los próximos días
      // ============================================
      if (pagoStr === hoyStr || pagoStr === fechaLimiteStr || (fechaProximoPago <= fechaLimite && fechaProximoPago >= hoy)) {
        // Verificar si ya se envió recordatorio hoy
        const existeRecordatorio = await db.collection('notificaciones')
          .where('tipo', '==', 'pago_recordatorio')
          .where('metadata.prestamoID', '==', prestamoDoc.id)
          .where('fechaProgramada', '>=', new Date(Date.now() - 1000 * 60 * 60 * 24))
          .get();

        if (existeRecordatorio.empty) {
          const mensaje = `📢 RECORDATORIO - EYS Inversiones

Estimado(a) ${cliente.nombre || prestamo.clienteNombre},

Le recordamos que tiene un pago pendiente de su préstamo:

💰 Capital restante: RD$ ${prestamo.capitalRestante?.toLocaleString()}
📅 Fecha de vencimiento: ${fechaProximoPago.toLocaleDateString('es-DO')}
🔄 Frecuencia: ${prestamo.frecuencia || 'quincenal'}

Para cualquier consulta, contáctenos al 829-447-0640.

¡Gracias por confiar en EYS Inversiones!`;

          const noti = new Notificacion({
            tipo: 'pago_recordatorio',
            destinatario: cliente.nombre || prestamo.clienteNombre,
            telefono: cliente.celular || prestamo.telefonoCliente,
            mensaje,
            fechaProgramada: new Date(),
            metadata: { 
              clienteID: prestamo.clienteID, 
              prestamoID: prestamoDoc.id,
              fechaVencimiento: fechaProximoPago.toISOString()
            }
          });

          const docRef = db.collection('notificaciones').doc();
          noti.id = docRef.id;
          await docRef.set({ ...noti });
          recordatoriosCreados++;
          console.log(`📱 Recordatorio creado para ${cliente.nombre || prestamo.clienteNombre}`);
        }
      }

      // ============================================
      // 2. MORA: si el pago ya venció
      // ============================================
      if (pagoStr < hoyStr) {
        // Verificar si ya se envió notificación de mora hoy
        const existeMora = await db.collection('notificaciones')
          .where('tipo', '==', 'mora')
          .where('metadata.prestamoID', '==', prestamoDoc.id)
          .where('fechaProgramada', '>=', new Date(Date.now() - 1000 * 60 * 60 * 24))
          .get();

        if (existeMora.empty) {
          const mensaje = `⚠️ AVISO DE MORA - EYS Inversiones

Estimado(a) ${cliente.nombre || prestamo.clienteNombre},

Su pago del préstamo ha vencido:

💰 Capital pendiente: RD$ ${prestamo.capitalRestante?.toLocaleString()}
📅 Fecha de vencimiento: ${fechaProximoPago.toLocaleDateString('es-DO')}
⚠️ Días de atraso: ${Math.ceil((hoy - fechaProximoPago) / (1000 * 60 * 60 * 24))}

Le recomendamos regularizar su situación lo antes posible para evitar recargos.

Para cualquier consulta, contáctenos al 829-447-0640.

- EYS Inversiones`;

          const noti = new Notificacion({
            tipo: 'mora',
            destinatario: cliente.nombre || prestamo.clienteNombre,
            telefono: cliente.celular || prestamo.telefonoCliente,
            mensaje,
            fechaProgramada: new Date(),
            metadata: { 
              clienteID: prestamo.clienteID, 
              prestamoID: prestamoDoc.id,
              fechaVencimiento: fechaProximoPago.toISOString(),
              diasAtraso: Math.ceil((hoy - fechaProximoPago) / (1000 * 60 * 60 * 24))
            }
          });

          const docRef = db.collection('notificaciones').doc();
          noti.id = docRef.id;
          await docRef.set({ ...noti });
          morasCreadas++;
          console.log(`⚠️ Notificación de mora creada para ${cliente.nombre || prestamo.clienteNombre}`);
        }
      }
    }

    console.log(`✅ Recordatorios generados: ${recordatoriosCreados}, Moras: ${morasCreadas}`);
    return { recordatoriosCreados, morasCreadas };
    
  } catch (error) {
    console.error('Error generando recordatorios automáticos:', error);
    return { recordatoriosCreados: 0, morasCreadas: 0, error: error.message };
  }
}

/**
 * POST /api/notificaciones/generar-manual
 * Ejecuta GENERAR recordatorios/moras ahora mismo (manualmente)
 */
router.post('/generar-manual', async (req, res) => {
  try {
    const diasAntes = typeof req.body?.diasAntes === 'number' ? req.body.diasAntes : 1;
    const resultado = await generarRecordatoriosAutomaticos(diasAntes);
    
    res.json({ 
      success: true, 
      message: 'Generación manual ejecutada',
      resultado
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// ============================================
// 📤 EXPORTAR router Y FUNCIÓN
// ============================================
module.exports = {
  router,
  generarRecordatoriosAutomaticos
};