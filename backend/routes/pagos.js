const express = require('express');
const admin = require('firebase-admin');
const Pago = require('../models/Pago');
const Prestamo = require('../models/Prestamo');
const router = express.Router();

const db = admin.firestore();

// POST /api/pagos - Registrar un pago
router.post('/', async (req, res) => {
  try {
    const { prestamoID, montoTotal, nota } = req.body;

    // Obtener el préstamo
    const prestamoDoc = await db.collection('prestamos').doc(prestamoID).get();
    if (!prestamoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    const prestamoData = prestamoDoc.data();
    const prestamo = new Prestamo(prestamoData);

    // Calcular distribución del pago (interés primero, luego capital)
    const interesCalculado = prestamo.calcularInteres();
    const distribucion = prestamo.calcularPagoTotal(montoTotal);

    // Crear el registro de pago
    const pagoData = {
      prestamoID,
      clienteID: prestamo.clienteID,
      clienteNombre: prestamo.clienteNombre,
      fechaPago: new Date(),
      montoCapital: distribucion.capital,
      montoInteres: distribucion.interes,
      tipoPago: 'normal',
      nota: nota || '',
      capitalAnterior: prestamo.capitalRestante,
      capitalNuevo: prestamo.capitalRestante - distribucion.capital
    };

    const pago = new Pago(pagoData);
    pago.validar();

    // Actualizar el préstamo
    const nuevoCapital = prestamo.capitalRestante - distribucion.capital;
    const actualizacionesPrestamo = {
      capitalRestante: nuevoCapital,
      fechaUltimoPago: new Date(),
      fechaProximoPago: prestamo.calcularProximaFecha(),
      estado: nuevoCapital <= 0 ? 'completado' : 'activo'
    };

    // Transacción para asegurar consistencia
    const batch = db.batch();
    
    // Agregar pago
    const pagoRef = db.collection('pagos').doc();
    pago.id = pagoRef.id;
    batch.set(pagoRef, { ...pago });

    // Actualizar préstamo
    const prestamoRef = db.collection('prestamos').doc(prestamoID);
    batch.update(prestamoRef, actualizacionesPrestamo);

    await batch.commit();

    res.status(201).json({
      success: true,
      data: {
        pago: pago,
        prestamoActualizado: actualizacionesPrestamo,
        distribucion: distribucion
      },
      message: 'Pago registrado exitosamente'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/pagos/prestamo/:prestamoID - Obtener pagos de un préstamo
router.get('/prestamo/:prestamoID', async (req, res) => {
  try {
    const pagosSnapshot = await db.collection('pagos')
      .where('prestamoID', '==', req.params.prestamoID)
      .orderBy('fechaPago', 'desc')
      .get();
    
    const pagos = [];
    pagosSnapshot.forEach(doc => {
      pagos.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: pagos,
      count: pagos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;