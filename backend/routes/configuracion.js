const express = require('express');
const admin = require('firebase-admin');
const Configuracion = require('../models/Configuracion');
const router = express.Router();

const db = admin.firestore();

// GET /api/configuracion - Obtener configuración
router.get('/', async (req, res) => {
  try {
    const configDoc = await db.collection('configuracion').doc('general').get();
    
    if (!configDoc.exists) {
      // Crear configuración por defecto si no existe
      const configDefault = new Configuracion({});
      await db.collection('configuracion').doc('general').set({ ...configDefault });
      
      return res.json({
        success: true,
        data: configDefault
      });
    }

    res.json({
      success: true,
      data: configDoc.data()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/configuracion - Actualizar configuración
router.put('/', async (req, res) => {
  try {
    const configData = req.body;
    const configuracion = new Configuracion(configData);
    
    configuracion.fechaHoraModificacion = new Date();

    await db.collection('configuracion').doc('general').set({ ...configuracion }, { merge: true });

    res.json({
      success: true,
      data: configuracion,
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;