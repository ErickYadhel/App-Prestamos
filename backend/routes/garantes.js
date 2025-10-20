const express = require('express');
const admin = require('firebase-admin');
const Garante = require('../models/Garante');
const router = express.Router();

const db = admin.firestore();

// GET /api/garantes/cliente/:clienteID - Obtener garantes de un cliente
router.get('/cliente/:clienteID', async (req, res) => {
  try {
    const garantesSnapshot = await db.collection('garantes')
      .where('clienteID', '==', req.params.clienteID)
      .where('activo', '==', true)
      .get();
    
    const garantes = [];
    garantesSnapshot.forEach(doc => {
      garantes.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: garantes,
      count: garantes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/garantes - Crear nuevo garante
router.post('/', async (req, res) => {
  try {
    const garanteData = req.body;
    const garante = new Garante(garanteData);
    
    garante.validar();

    // Verificar que el cliente existe
    const clienteDoc = await db.collection('clientes').doc(garante.clienteID).get();
    if (!clienteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Crear en Firestore
    const docRef = db.collection('garantes').doc();
    garante.id = docRef.id;
    garante.fechaCreacion = new Date();

    await docRef.set({ ...garante });

    res.status(201).json({
      success: true,
      data: garante,
      message: 'Garante creado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;