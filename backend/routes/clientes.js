const express = require('express');
const admin = require('firebase-admin');
const Cliente = require('../models/Cliente');
const router = express.Router();

const db = admin.firestore();

// GET /api/clientes - Listar todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientesSnapshot = await db.collection('clientes')
      .where('activo', '==', true)
      .get();
    
    const clientes = [];
    clientesSnapshot.forEach(doc => {
      clientes.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: clientes,
      count: clientes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/clientes - Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const clienteData = req.body;
    const cliente = new Cliente(clienteData);
    
    // Validar datos del cliente
    cliente.validar();

    // Verificar si la cédula ya existe
    const cedulaExistente = await db.collection('clientes')
      .where('cedula', '==', cliente.cedula)
      .get();

    if (!cedulaExistente.empty) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un cliente con esta cédula'
      });
    }

    // Crear en Firestore
    const docRef = db.collection('clientes').doc();
    cliente.id = docRef.id;
    cliente.fechaCreacion = new Date();

    await docRef.set({ ...cliente });

    res.status(201).json({
      success: true,
      data: cliente,
      message: 'Cliente creado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/clientes/:id - Obtener cliente específico
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('clientes').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;