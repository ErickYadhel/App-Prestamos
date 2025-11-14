const express = require('express');
const admin = require('firebase-admin');
const Prestamo = require('../models/Prestamo');
const router = express.Router();

const db = admin.firestore();

// Función para calcular próxima fecha
function calcularProximaFecha(fechaBase, frecuencia) {
  const fecha = new Date(fechaBase);
  
  switch (frecuencia) {
    case 'diario':
      fecha.setDate(fecha.getDate() + 1);
      break;
    case 'semanal':
      fecha.setDate(fecha.getDate() + 7);
      break;
    case 'quincenal':
      fecha.setDate(fecha.getDate() + 15);
      break;
    case 'mensual':
      fecha.setMonth(fecha.getMonth() + 1);
      break;
    default:
      fecha.setDate(fecha.getDate() + 30);
  }
  
  return fecha;
}

// GET /api/prestamos - Listar préstamos activos
router.get('/', async (req, res) => {
  try {
    const { estado = 'activo', clienteID } = req.query;
    let query = db.collection('prestamos');

    if (estado) {
      query = query.where('estado', '==', estado);
    }
    if (clienteID) {
      query = query.where('clienteID', '==', clienteID);
    }

    query = query.orderBy('fechaPrestamo', 'desc');

    const prestamosSnapshot = await query.get();
    
    const prestamos = [];
    prestamosSnapshot.forEach(doc => {
      const data = doc.data();
      prestamos.push({ 
        id: doc.id, 
        ...data,
        // Formatear fechas para el frontend
        fechaPrestamoFormatted: data.fechaPrestamo?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
        fechaProximoPagoFormatted: data.fechaProximoPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
        fechaUltimoPagoFormatted: data.fechaUltimoPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A'
      });
    });

    res.json({
      success: true,
      data: prestamos,
      count: prestamos.length
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/prestamos/:id - Obtener préstamo específico
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('prestamos').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    const data = doc.data();
    const prestamo = {
      id: doc.id,
      ...data,
      fechaPrestamoFormatted: data.fechaPrestamo?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
      fechaProximoPagoFormatted: data.fechaProximoPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
      fechaUltimoPagoFormatted: data.fechaUltimoPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A'
    };

    res.json({
      success: true,
      data: prestamo
    });
  } catch (error) {
    console.error('Error fetching loan:', error);
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

    const cliente = clienteDoc.data();

    const prestamo = new Prestamo({
      ...prestamoData,
      clienteNombre: cliente.nombre,
      capitalRestante: parseFloat(prestamoData.montoPrestado),
      fechaPrestamo: new Date(prestamoData.fechaPrestamo || new Date()),
      fechaProximoPago: calcularProximaFecha(new Date(), prestamoData.frecuencia),
      estado: 'activo'
    });

    // Validar datos del préstamo
    if (!prestamo.montoPrestado || prestamo.montoPrestado <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Monto prestado debe ser mayor a 0'
      });
    }

    if (!prestamo.interesPercent || prestamo.interesPercent <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Porcentaje de interés debe ser mayor a 0'
      });
    }

    // Crear en Firestore
    const docRef = db.collection('prestamos').doc();
    prestamo.id = docRef.id;

    await docRef.set({ ...prestamo });

    res.status(201).json({
      success: true,
      data: prestamo,
      message: 'Préstamo creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/prestamos/:id - Actualizar préstamo (CORREGIDO)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const prestamoRef = db.collection('prestamos').doc(id);
    const prestamoDoc = await prestamoRef.get();

    if (!prestamoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    const prestamoActual = prestamoDoc.data();

    // Si se actualiza la frecuencia o fecha último pago, recalcular próxima fecha
    if (updates.frecuencia || updates.fechaUltimoPago) {
      const fechaBase = updates.fechaUltimoPago || prestamoActual.fechaUltimoPago || prestamoActual.fechaPrestamo;
      updates.fechaProximoPago = calcularProximaFecha(new Date(fechaBase), updates.frecuencia || prestamoActual.frecuencia);
    }

    // Si se actualiza el monto prestado, actualizar capital restante proporcionalmente
    if (updates.montoPrestado && updates.montoPrestado !== prestamoActual.montoPrestado) {
      const ratio = updates.montoPrestado / prestamoActual.montoPrestado;
      updates.capitalRestante = prestamoActual.capitalRestante * ratio;
    }

    // Agregar fecha de actualización
    updates.fechaActualizacion = new Date();

    await prestamoRef.update(updates);

    // Obtener el préstamo actualizado
    const prestamoActualizadoDoc = await prestamoRef.get();
    const prestamoActualizado = {
      id: prestamoActualizadoDoc.id,
      ...prestamoActualizadoDoc.data()
    };

    res.json({
      success: true,
      data: prestamoActualizado,
      message: 'Préstamo actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando préstamo:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/prestamos/:id - Eliminar préstamo (NUEVO)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const prestamoRef = db.collection('prestamos').doc(id);
    const prestamoDoc = await prestamoRef.get();

    if (!prestamoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    // Verificar que no tenga pagos asociados
    const pagosSnapshot = await db.collection('pagos')
      .where('prestamoID', '==', id)
      .get();

    if (!pagosSnapshot.empty) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un préstamo que tiene pagos registrados'
      });
    }

    await prestamoRef.delete();

    res.json({
      success: true,
      message: 'Préstamo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando préstamo:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;