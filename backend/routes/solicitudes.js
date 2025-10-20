const express = require('express');
const admin = require('firebase-admin');
const Solicitud = require('../models/Solicitud');
const router = express.Router();

const db = admin.firestore();

// POST /api/solicitudes - Crear nueva solicitud (empleados)
router.post('/', async (req, res) => {
  try {
    const solicitudData = req.body;
    const solicitud = new Solicitud(solicitudData);
    
    solicitud.validar();

    // Crear en Firestore
    const docRef = db.collection('solicitudes').doc();
    solicitud.id = docRef.id;
    solicitud.fechaSolicitud = new Date();
    solicitud.estado = 'pendiente';

    await docRef.set({ ...solicitud });

    // TODO: Aquí integraríamos el envío de notificación por email
    console.log(`📧 Notificación: Nueva solicitud de ${solicitud.clienteNombre}`);

    res.status(201).json({
      success: true,
      data: solicitud,
      message: 'Solicitud enviada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/solicitudes - Listar solicitudes (con filtros)
router.get('/', async (req, res) => {
  try {
    const { estado, empleadoID } = req.query;
    let query = db.collection('solicitudes');

    // Aplicar filtros
    if (estado) {
      query = query.where('estado', '==', estado);
    }
    if (empleadoID) {
      query = query.where('empleadoID', '==', empleadoID);
    }

    // Ordenar por fecha más reciente
    query = query.orderBy('fechaSolicitud', 'desc');

    const solicitudesSnapshot = await query.get();
    
    const solicitudes = [];
    solicitudesSnapshot.forEach(doc => {
      solicitudes.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: solicitudes,
      count: solicitudes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/solicitudes/:id/aprobar - Aprobar solicitud (admin)
router.put('/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobadoPor, observaciones } = req.body;

    const solicitudRef = db.collection('solicitudes').doc(id);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada'
      });
    }

    const solicitudData = solicitudDoc.data();
    const solicitud = new Solicitud(solicitudData);

    if (!solicitud.puedeSerAprobada()) {
      return res.status(400).json({
        success: false,
        error: 'La solicitud no puede ser aprobada en su estado actual'
      });
    }

    const actualizaciones = {
      estado: 'aprobada',
      aprobadoPor: aprobadoPor,
      fechaDecision: new Date(),
      observaciones: observaciones || solicitudData.observaciones
    };

    await solicitudRef.update(actualizaciones);

    // TODO: Notificar al empleado que la solicitud fue aprobada
    console.log(`✅ Solicitud aprobada: ${solicitud.clienteNombre}`);

    res.json({
      success: true,
      data: { id, ...actualizaciones },
      message: 'Solicitud aprobada exitosamente'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/solicitudes/:id/rechazar - Rechazar solicitud (admin)
router.put('/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobadoPor, observaciones } = req.body;

    const solicitudRef = db.collection('solicitudes').doc(id);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada'
      });
    }

    const actualizaciones = {
      estado: 'rechazada',
      aprobadoPor: aprobadoPor,
      fechaDecision: new Date(),
      observaciones: observaciones
    };

    await solicitudRef.update(actualizaciones);

    // TODO: Notificar al empleado
    console.log(`❌ Solicitud rechazada: ${solicitudDoc.data().clienteNombre}`);

    res.json({
      success: true,
      data: { id, ...actualizaciones },
      message: 'Solicitud rechazada'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;