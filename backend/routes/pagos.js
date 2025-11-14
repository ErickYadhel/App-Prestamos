const express = require('express');
const admin = require('firebase-admin');
const Pago = require('../models/Pago');
const Prestamo = require('../models/Prestamo');
const router = express.Router();

const db = admin.firestore();

// Función para calcular próxima fecha (mejorada)
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

// Función para validar datos del pago
function validarPago(datos) {
  const { prestamoID, montoTotal, modoCalculo, montoInteres, montoCapital } = datos;
  
  if (!prestamoID) {
    throw new Error('ID de préstamo es requerido');
  }

  if (modoCalculo === 'manual') {
    if ((montoInteres === undefined && montoCapital === undefined) || 
        (montoInteres <= 0 && montoCapital <= 0)) {
      throw new Error('Debe especificar al menos interés o capital mayor a 0 en modo manual');
    }
  } else {
    if (!montoTotal || montoTotal <= 0) {
      throw new Error('Monto total debe ser mayor a 0 en modo automático');
    }
  }
}

// POST /api/pagos - Registrar un pago (automático o manual) - MEJORADO
router.post('/', async (req, res) => {
  try {
    const { 
      prestamoID, 
      montoTotal, 
      nota, 
      tipoPago, 
      fechaPago, 
      modoCalculo, 
      montoInteres, 
      montoCapital 
    } = req.body;

    // Validar datos básicos
    validarPago({ prestamoID, montoTotal, modoCalculo, montoInteres, montoCapital });

    // Obtener el préstamo
    const prestamoDoc = await db.collection('prestamos').doc(prestamoID).get();
    if (!prestamoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    const prestamoData = prestamoDoc.data();
    
    // Validar que el préstamo esté activo
    if (prestamoData.estado !== 'activo') {
      return res.status(400).json({
        success: false,
        error: 'No se pueden registrar pagos en préstamos ' + prestamoData.estado
      });
    }

    const prestamo = new Prestamo(prestamoData);
    let distribucion;
    let pagoData;

    // MODO MANUAL
    if (modoCalculo === 'manual') {
      const interes = parseFloat(montoInteres) || 0;
      const capital = parseFloat(montoCapital) || 0;
      const montoTotalManual = interes + capital;

      // Validar que no exceda el capital restante
      if (capital > prestamo.capitalRestante) {
        return res.status(400).json({
          success: false,
          error: `El capital (${capital}) no puede ser mayor al capital restante (${prestamo.capitalRestante})`
        });
      }

      distribucion = {
        interes: interes,
        capital: capital,
        resto: 0,
        montoTotal: montoTotalManual
      };

      pagoData = {
        prestamoID,
        clienteID: prestamo.clienteID,
        clienteNombre: prestamo.clienteNombre,
        fechaPago: new Date(fechaPago || new Date()),
        montoCapital: distribucion.capital,
        montoInteres: distribucion.interes,
        tipoPago: tipoPago || 'normal',
        nota: nota || '',
        capitalAnterior: prestamo.capitalRestante,
        capitalNuevo: prestamo.capitalRestante - distribucion.capital,
        modoManual: true,
        montoTotal: distribucion.montoTotal
      };

    } 
    // MODO AUTOMÁTICO
    else {
      // Calcular distribución del pago (interés primero, luego capital) - SISTEMA EYS
      const interesCalculado = prestamo.calcularInteres();
      distribucion = prestamo.calcularPagoTotal(parseFloat(montoTotal));

      // Validar que no exceda el capital restante
      if (distribucion.capital > prestamo.capitalRestante) {
        distribucion.capital = prestamo.capitalRestante;
        distribucion.resto = montoTotal - (distribucion.interes + distribucion.capital);
      }

      pagoData = {
        prestamoID,
        clienteID: prestamo.clienteID,
        clienteNombre: prestamo.clienteNombre,
        fechaPago: new Date(fechaPago || new Date()),
        montoCapital: distribucion.capital,
        montoInteres: distribucion.interes,
        tipoPago: tipoPago || 'normal',
        nota: nota || '',
        capitalAnterior: prestamo.capitalRestante,
        capitalNuevo: prestamo.capitalRestante - distribucion.capital,
        modoManual: false,
        montoTotal: parseFloat(montoTotal)
      };
    }

    const pago = new Pago(pagoData);
    
    // Validar el pago
    try {
      pago.validar();
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.message
      });
    }

    // Actualizar el préstamo
    const nuevoCapital = prestamo.capitalRestante - distribucion.capital;
    const fechaPagoDate = new Date(fechaPago || new Date());
    
    const actualizacionesPrestamo = {
      capitalRestante: nuevoCapital,
      fechaUltimoPago: fechaPagoDate,
      fechaProximoPago: calcularProximaFecha(fechaPagoDate, prestamo.frecuencia),
      estado: nuevoCapital <= 0 ? 'completado' : 'activo',
      fechaActualizacion: new Date()
    };

    // Si el préstamo se completó, agregar fecha de finalización
    if (nuevoCapital <= 0) {
      actualizacionesPrestamo.fechaFinalizacion = new Date();
    }

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

    // Si hay resto en modo automático, crear notificación
    if (distribucion.resto > 0) {
      await crearNotificacionResto(prestamo, distribucion.resto);
    }

    res.status(201).json({
      success: true,
      data: {
        pago: pago,
        prestamoActualizado: actualizacionesPrestamo,
        distribucion: distribucion,
        modo: modoCalculo === 'manual' ? 'manual' : 'automatico',
        mensaje: nuevoCapital <= 0 ? '¡Préstamo completado!' : 'Pago registrado exitosamente'
      },
      message: getMensajeExito(modoCalculo, nuevoCapital <= 0)
    });

  } catch (error) {
    console.error('Error en registro de pago:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Función auxiliar para mensajes de éxito
function getMensajeExito(modoCalculo, prestamoCompletado) {
  if (prestamoCompletado) {
    return '¡Pago registrado y préstamo completado exitosamente!';
  }
  return modoCalculo === 'manual' ? 'Pago manual registrado exitosamente' : 'Pago registrado exitosamente';
}

// Función para crear notificación de resto
async function crearNotificacionResto(prestamo, resto) {
  try {
    const notificacion = {
      tipo: 'pago_sobrante',
      destinatario: prestamo.clienteNombre,
      prestamoID: prestamo.id,
      mensaje: `Se detectó un sobrante de RD$ ${resto.toFixed(2)} en su último pago. Este monto será aplicado a su próximo pago.`,
      fechaCreacion: new Date(),
      enviada: false
    };
    
    await db.collection('notificaciones').add(notificacion);
  } catch (error) {
    console.error('Error creando notificación de resto:', error);
  }
}

// GET /api/pagos/prestamo/:prestamoID - Obtener pagos de un préstamo (MEJORADO)
router.get('/prestamo/:prestamoID', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    let query = db.collection('pagos')
      .where('prestamoID', '==', req.params.prestamoID)
      .orderBy('fechaPago', 'desc')
      .limit(parseInt(limit));

    const pagosSnapshot = await query.get();
    
    const pagos = [];
    let totalMonto = 0;
    let totalInteres = 0;
    let totalCapital = 0;

    pagosSnapshot.forEach(doc => {
      const pagoData = doc.data();
      const pago = { 
        id: doc.id, 
        ...pagoData,
        // Formatear fechas para el frontend
        fechaPagoFormatted: pagoData.fechaPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A'
      };
      
      pagos.push(pago);
      
      totalMonto += (pagoData.montoCapital + pagoData.montoInteres);
      totalInteres += pagoData.montoInteres;
      totalCapital += pagoData.montoCapital;
    });

    // Obtener total de pagos para paginación
    const totalSnapshot = await db.collection('pagos')
      .where('prestamoID', '==', req.params.prestamoID)
      .get();

    res.json({
      success: true,
      data: {
        pagos: pagos,
        resumen: {
          totalPagos: pagos.length,
          totalMonto: totalMonto,
          totalInteres: totalInteres,
          totalCapital: totalCapital,
          totalGeneral: totalSnapshot.size
        }
      },
      count: pagos.length,
      total: totalSnapshot.size
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/pagos - Listar todos los pagos (con filtros MEJORADOS)
router.get('/', async (req, res) => {
  try {
    const { 
      prestamoID, 
      clienteID, 
      fechaInicio, 
      fechaFin, 
      limit = 50, 
      offset = 0,
      tipoPago 
    } = req.query;
    
    let query = db.collection('pagos');

    // Aplicar filtros
    if (prestamoID) {
      query = query.where('prestamoID', '==', prestamoID);
    }
    if (clienteID) {
      query = query.where('clienteID', '==', clienteID);
    }
    if (tipoPago) {
      query = query.where('tipoPago', '==', tipoPago);
    }
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999); // Hasta el final del día
      
      query = query.where('fechaPago', '>=', inicio)
                   .where('fechaPago', '<=', fin);
    }

    // Ordenar por fecha más reciente y aplicar paginación
    query = query.orderBy('fechaPago', 'desc')
                 .limit(parseInt(limit));

    const pagosSnapshot = await query.get();
    
    const pagos = [];
    let estadisticas = {
      totalMonto: 0,
      totalInteres: 0,
      totalCapital: 0
    };

    pagosSnapshot.forEach(doc => {
      const pagoData = doc.data();
      const pagoConFormato = { 
        id: doc.id, 
        ...pagoData,
        fechaPagoFormatted: pagoData.fechaPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A'
      };
      
      pagos.push(pagoConFormato);
      
      // Calcular estadísticas
      estadisticas.totalMonto += (pagoData.montoCapital + pagoData.montoInteres);
      estadisticas.totalInteres += pagoData.montoInteres;
      estadisticas.totalCapital += pagoData.montoCapital;
    });

    res.json({
      success: true,
      data: pagos,
      estadisticas: estadisticas,
      count: pagos.length,
      paginacion: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/pagos/:id - Obtener un pago específico (NUEVO)
router.get('/:id', async (req, res) => {
  try {
    const pagoDoc = await db.collection('pagos').doc(req.params.id).get();
    
    if (!pagoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Pago no encontrado'
      });
    }

    const pagoData = pagoDoc.data();
    
    // Obtener información del préstamo asociado
    const prestamoDoc = await db.collection('prestamos').doc(pagoData.prestamoID).get();
    const prestamo = prestamoDoc.exists ? prestamoDoc.data() : null;

    res.json({
      success: true,
      data: {
        ...pagoData,
        prestamo: prestamo ? {
          montoPrestado: prestamo.montoPrestado,
          interesPercent: prestamo.interesPercent,
          frecuencia: prestamo.frecuencia
        } : null,
        fechaPagoFormatted: pagoData.fechaPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A'
      }
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Función para enviar recordatorios automáticos (MEJORADA)
async function enviarRecordatoriosAutomaticos() {
  try {
    // Obtener préstamos con pagos próximos (próximos 3 días)
    const hoy = new Date();
    const enTresDias = new Date();
    enTresDias.setDate(hoy.getDate() + 3);

    const prestamosSnapshot = await db.collection('prestamos')
      .where('estado', '==', 'activo')
      .where('fechaProximoPago', '>=', hoy)
      .where('fechaProximoPago', '<=', enTresDias)
      .get();

    console.log(`📱 Enviando recordatorios para ${prestamosSnapshot.size} préstamos`);

    for (const doc of prestamosSnapshot.docs) {
      const prestamo = doc.data();
      const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
      
      if (clienteDoc.exists) {
        const cliente = clienteDoc.data();
        const interes = (prestamo.capitalRestante * prestamo.interesPercent) / 100;
        
        const mensaje = `Hola ${cliente.nombre}, le recordamos que tiene un pago pendiente de RD$ ${interes.toLocaleString()} correspondiente a los intereses de su préstamo. Capital restante: RD$ ${prestamo.capitalRestante.toLocaleString()}. Próximo pago: ${new Date(prestamo.fechaProximoPago).toLocaleDateString()}. ¡Gracias por su puntualidad! - EYS Inversiones`;
        
        // Aquí integrarías con tu servicio de WhatsApp
        console.log(`📱 Recordatorio para: ${cliente.nombre} - ${cliente.celular}`);
        console.log(`💬 Mensaje: ${mensaje}`);
        
        // Crear registro de notificación
        const notificacion = {
          tipo: 'recordatorio_pago',
          destinatario: cliente.nombre,
          telefono: cliente.celular,
          mensaje: mensaje,
          prestamoID: prestamo.id,
          fechaEnvio: new Date(),
          enviada: true,
          fechaProgramada: hoy
        };

        await db.collection('notificaciones').add(notificacion);
      }
    }
  } catch (error) {
    console.error('Error enviando recordatorios:', error);
  }
}

module.exports = router;