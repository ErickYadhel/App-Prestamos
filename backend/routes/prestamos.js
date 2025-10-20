const express = require('express');
const admin = require('firebase-admin');
const Prestamo = require('../models/Prestamo');
const router = express.Router();

const db = admin.firestore();

// GET /api/prestamos - Listar préstamos activos
router.get('/', async (req, res) => {
  try {
    const prestamosSnapshot = await db.collection('prestamos')
      .where('estado', '==', 'activo')
      .get();
    
    const prestamos = [];
    prestamosSnapshot.forEach(doc => {
      prestamos.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: prestamos,
      count: prestamos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/prestamos - Crear nuevo préstamo
router.post('/', async (req, res) => {
  try {
    const prestamoData = req.body;
    
    // Verificar que el cliente existe
    const clienteDoc = await db.collection('clientes').doc(prestamoData.clienteID).get();
    if (!clienteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    const prestamo = new Prestamo({
      ...prestamoData,
      capitalRestante: prestamoData.montoPrestado,
      fechaProximoPago: new Date() // Se calculará después
    });

    // Crear en Firestore
    const docRef = db.collection('prestamos').doc();
    prestamo.id = docRef.id;
    prestamo.fechaProximoPago = prestamo.calcularProximaFecha();

    await docRef.set({ ...prestamo });

    res.status(201).json({
      success: true,
      data: prestamo,
      message: 'Préstamo creado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;