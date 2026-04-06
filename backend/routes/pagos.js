const express = require('express');
const admin = require('firebase-admin');
const Pago = require('../models/Pago');
const Prestamo = require('../models/Prestamo');
const Comision = require('../models/Comision'); // 👈 NUEVA IMPORTACIÓN
const router = express.Router();

const db = admin.firestore();

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function validarPago(datos) {
  const { prestamoID, montoTotal, modoCalculo, montoInteres, montoCapital, montoMora } = datos;
  
  if (!prestamoID) {
    throw new Error('ID de préstamo es requerido');
  }

  if (modoCalculo === 'manual') {
    const tieneInteres = montoInteres && parseFloat(montoInteres) > 0;
    const tieneCapital = montoCapital && parseFloat(montoCapital) > 0;
    const tieneMora = montoMora && parseFloat(montoMora) > 0;
    
    if (!tieneInteres && !tieneCapital && !tieneMora) {
      throw new Error('Debe especificar al menos interés, capital o mora mayor a 0 en modo manual');
    }
  } else {
    if (!montoTotal || parseFloat(montoTotal) <= 0) {
      throw new Error('Monto total debe ser mayor a 0 en modo automático');
    }
  }
}

function getMensajeExito(modoCalculo, prestamoCompletado, tieneMora = false) {
  if (prestamoCompletado) {
    return '¡Pago registrado y préstamo completado exitosamente!';
  }
  if (tieneMora) {
    return 'Pago registrado con mora incluida. El préstamo ha sido regularizado.';
  }
  return modoCalculo === 'manual' 
    ? 'Pago manual registrado exitosamente' 
    : 'Pago registrado exitosamente';
}

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

async function crearNotificacionCompletado(prestamo) {
  try {
    const notificacion = {
      tipo: 'prestamo_completado',
      destinatario: prestamo.clienteNombre,
      prestamoID: prestamo.id,
      mensaje: `¡Felicitaciones! Has completado el pago total de tu préstamo. Gracias por confiar en EYS Inversiones.`,
      fechaCreacion: new Date(),
      enviada: false
    };
    
    await db.collection('notificaciones').add(notificacion);
  } catch (error) {
    console.error('Error creando notificación de completado:', error);
  }
}

// ============================================
// FUNCIÓN PARA OBTENER DATOS DEL GARANTE
// ============================================

async function obtenerGaranteById(garanteID) {
  try {
    const garanteDoc = await db.collection('garantes').doc(garanteID).get();
    if (garanteDoc.exists) {
      return garanteDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo garante:', error);
    return null;
  }
}

// ============================================
// FUNCIÓN PARA CREAR COMISIÓN AUTOMÁTICAMENTE (MEJORADA)
// ============================================

async function crearComisionAutomatica(prestamo, pagoId, interesPagado, fechaPago) {
  try {
    if (!prestamo.generarComision || !prestamo.garanteID || interesPagado <= 0) {
      console.log('⚠️ No se genera comisión:', {
        generarComision: prestamo.generarComision,
        garanteID: prestamo.garanteID,
        interesPagado
      });
      return null;
    }
    
    // Obtener información completa del garante
    const garanteInfo = await obtenerGaranteById(prestamo.garanteID);
    const garanteNombre = garanteInfo?.nombre || prestamo.garanteNombre || prestamo.garanteID;
    const garanteCedula = garanteInfo?.cedula || '';
    
    const porcentajeComision = prestamo.porcentajeComision || 50;
    const montoComision = (interesPagado * porcentajeComision) / 100;
    
    console.log('💰 Generando comisión automática:');
    console.log('  - Préstamo:', prestamo.id);
    console.log('  - Garante ID:', prestamo.garanteID);
    console.log('  - Garante Nombre:', garanteNombre);
    console.log('  - Garante Cédula:', garanteCedula);
    console.log('  - Interés pagado:', interesPagado);
    console.log('  - Porcentaje comisión:', porcentajeComision);
    console.log('  - Monto comisión:', montoComision);
    
    // Generar ID personalizado con nombre, cédula y fecha
    const idPersonalizado = Comision.generarIdPersonalizado(garanteNombre, garanteCedula, fechaPago);
    
    const comisionData = {
      id: idPersonalizado,
      tipo: 'prestamo',
      garanteID: prestamo.garanteID,
      garanteNombre: garanteNombre,
      prestamoID: prestamo.id,
      clienteID: prestamo.clienteID,
      clienteNombre: prestamo.clienteNombre,
      pagoID: pagoId,
      montoBase: interesPagado,
      porcentaje: porcentajeComision,
      montoComision: montoComision,
      fechaPago: fechaPago,
      fechaGeneracion: new Date(),
      estado: 'pagada', // 👈 CAMBIADO: se marca como pagada inmediatamente
      fechaPagoGarante: new Date(), // 👈 Se registra la fecha de pago al garante
      pagadoPor: 'sistema',
      descripcion: `Comisión automática por pago de interés del préstamo ${prestamo.id} - Cliente: ${prestamo.clienteNombre}`,
      periodo: Comision.prototype._calcularPeriodo(fechaPago),
      creadoPor: 'sistema',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const comisionRef = db.collection('comisiones').doc(idPersonalizado);
    await comisionRef.set(comisionData);
    
    console.log(`✅ Comisión automática creada y marcada como PAGADA: ${idPersonalizado}`);
    
    return { id: idPersonalizado, ...comisionData };
  } catch (error) {
    console.error('Error creando comisión automática:', error);
    return null;
  }
}

// ============================================
// ENDPOINTS
// ============================================

// POST /api/pagos - Registrar un pago
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
      montoCapital,
      montoMora
    } = req.body;

    console.log('📝 Registrando pago:', { prestamoID, montoTotal, fechaPago, modoCalculo });

    validarPago({ prestamoID, montoTotal, modoCalculo, montoInteres, montoCapital, montoMora });

    const prestamoDoc = await db.collection('prestamos').doc(prestamoID).get();
    if (!prestamoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    const prestamoData = prestamoDoc.data();
    
    if (prestamoData.estado !== 'activo') {
      return res.status(400).json({
        success: false,
        error: `No se pueden registrar pagos en préstamos ${prestamoData.estado}`
      });
    }

    const prestamo = new Prestamo({ id: prestamoDoc.id, ...prestamoData });
    const fechaPagoDate = new Date(fechaPago || new Date());
    let distribucion;
    let pagoData;

    if (modoCalculo === 'manual') {
      const interes = parseFloat(montoInteres) || 0;
      const capital = parseFloat(montoCapital) || 0;
      const mora = parseFloat(montoMora) || 0;
      const montoTotalManual = interes + capital + mora;

      if (capital > prestamo.capitalRestante) {
        return res.status(400).json({
          success: false,
          error: `El capital (RD$ ${capital.toLocaleString()}) no puede ser mayor al capital restante (RD$ ${prestamo.capitalRestante.toLocaleString()})`
        });
      }

      distribucion = {
        interes: interes,
        capital: capital,
        mora: mora,
        restoInteres: 0,
        nuevoCapital: prestamo.capitalRestante - capital,
        prestamoCompletado: (prestamo.capitalRestante - capital) <= 0,
        periodosPagados: 0,
        diasCubiertos: 0
      };

      pagoData = {
        prestamoID,
        clienteID: prestamo.clienteID,
        clienteNombre: prestamo.clienteNombre,
        fechaPago: fechaPagoDate,
        montoCapital: distribucion.capital,
        montoInteres: distribucion.interes,
        montoMora: distribucion.mora,
        tipoPago: tipoPago || 'normal',
        nota: nota || '',
        capitalAnterior: prestamo.capitalRestante,
        capitalNuevo: distribucion.nuevoCapital,
        modoManual: true,
        montoTotal: montoTotalManual,
        modoCalculo: 'manual',
        periodosPagados: 0,
        diasCubiertos: 0
      };

    } else {
      distribucion = prestamo.calcularDistribucionPago(parseFloat(montoTotal), fechaPagoDate);
      
      pagoData = {
        prestamoID,
        clienteID: prestamo.clienteID,
        clienteNombre: prestamo.clienteNombre,
        fechaPago: fechaPagoDate,
        montoCapital: distribucion.capital,
        montoInteres: distribucion.interes,
        montoMora: distribucion.mora || 0,
        tipoPago: tipoPago || 'normal',
        nota: nota || '',
        capitalAnterior: prestamo.capitalRestante,
        capitalNuevo: distribucion.nuevoCapital,
        modoManual: false,
        montoTotal: parseFloat(montoTotal),
        modoCalculo: 'automatico',
        periodosPagados: distribucion.periodosPagados || 1,
        diasCubiertos: distribucion.diasCubiertos || 0
      };
    }

    const pago = new Pago(pagoData);
    
    try {
      pago.validar();
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.message
      });
    }

    prestamo.aplicarPago(pagoData.montoTotal, fechaPagoDate, distribucion);
    
    console.log('✅ Pago aplicado correctamente:');
    console.log('  - Capital restante:', prestamo.capitalRestante);
    console.log('  - Nueva fecha próximo pago:', prestamo.fechaProximoPago?.toLocaleDateString());
    console.log('  - Estado:', prestamo.estado);
    console.log('  - Interés pagado:', distribucion.interes);

    const batch = db.batch();
    
    const pagoRef = db.collection('pagos').doc();
    pago.id = pagoRef.id;
    batch.set(pagoRef, { ...pago });

    const prestamoRef = db.collection('prestamos').doc(prestamoID);
    batch.update(prestamoRef, {
      capitalRestante: prestamo.capitalRestante,
      estado: prestamo.estado,
      fechaUltimoPago: prestamo.fechaUltimoPago,
      fechaProximoPago: prestamo.fechaProximoPago,
      historialPagos: prestamo.historialPagos,
      fechaActualizacion: new Date()
    });

    await batch.commit();

    // CREAR COMISIÓN AUTOMÁTICA si aplica (marcada como PAGADA automáticamente)
    let comisionCreada = null;
    if (distribucion.interes > 0 && prestamo.generarComision && prestamo.garanteID) {
      comisionCreada = await crearComisionAutomatica(
        prestamo, 
        pagoRef.id, 
        distribucion.interes, 
        fechaPagoDate
      );
    }

    if (distribucion.restoInteres > 0 && distribucion.restoInteres !== undefined) {
      await crearNotificacionResto(prestamo, distribucion.restoInteres);
    }

    if (prestamo.capitalRestante <= 0) {
      await crearNotificacionCompletado(prestamo);
    }

    const tieneMora = (distribucion.mora || 0) > 0;
    const prestamoCompletado = prestamo.capitalRestante <= 0;

    res.status(201).json({
      success: true,
      data: {
        pago: pago,
        prestamoActualizado: {
          id: prestamo.id,
          capitalRestante: prestamo.capitalRestante,
          estado: prestamo.estado,
          fechaProximoPago: prestamo.fechaProximoPago,
          fechaUltimoPago: prestamo.fechaUltimoPago,
          resumenDeuda: prestamo.obtenerResumenDeuda()
        },
        distribucion: distribucion,
        modo: modoCalculo === 'manual' ? 'manual' : 'automatico',
        mensaje: getMensajeExito(modoCalculo, prestamoCompletado, tieneMora),
        comisionGenerada: comisionCreada ? true : false
      },
      message: getMensajeExito(modoCalculo, prestamoCompletado, tieneMora)
    });

  } catch (error) {
    console.error('Error en registro de pago:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/pagos/prestamo/:prestamoID - Obtener pagos de un préstamo
router.get('/prestamo/:prestamoID', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const prestamoID = req.params.prestamoID;
    
    console.log('📋 Buscando pagos para préstamo:', prestamoID);
    
    const prestamoDoc = await db.collection('prestamos').doc(prestamoID).get();
    if (!prestamoDoc.exists) {
      console.log('❌ Préstamo no encontrado:', prestamoID);
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }
    
    let query = db.collection('pagos')
      .where('prestamoID', '==', prestamoID)
      .orderBy('fechaPago', 'desc')
      .limit(parseInt(limit));

    const pagosSnapshot = await query.get();
    
    console.log(`✅ Encontrados ${pagosSnapshot.size} pagos para préstamo ${prestamoID}`);
    
    const pagos = [];
    let totalMonto = 0, totalInteres = 0, totalCapital = 0, totalMora = 0;

    for (const doc of pagosSnapshot.docs) {
      try {
        const pagoData = doc.data();
        
        let fechaPagoFormatted = 'N/A';
        let fechaPagoISO = null;
        
        if (pagoData.fechaPago) {
          try {
            let fechaDate;
            if (typeof pagoData.fechaPago === 'object') {
              if (pagoData.fechaPago.toDate && typeof pagoData.fechaPago.toDate === 'function') {
                fechaDate = pagoData.fechaPago.toDate();
              } else if (pagoData.fechaPago._seconds !== undefined) {
                fechaDate = new Date(pagoData.fechaPago._seconds * 1000);
              } else if (pagoData.fechaPago.seconds !== undefined) {
                fechaDate = new Date(pagoData.fechaPago.seconds * 1000);
              } else {
                fechaDate = new Date(pagoData.fechaPago);
              }
            } else if (typeof pagoData.fechaPago === 'string') {
              fechaDate = new Date(pagoData.fechaPago);
            } else {
              fechaDate = new Date(pagoData.fechaPago);
            }
            
            if (!isNaN(fechaDate.getTime())) {
              fechaPagoFormatted = fechaDate.toLocaleDateString('es-DO');
              fechaPagoISO = fechaDate.toISOString();
            }
          } catch (e) {
            console.error(`Error formateando fecha para pago ${doc.id}:`, e);
          }
        }
        
        const pago = {
          id: doc.id,
          ...pagoData,
          fechaPagoFormatted,
          fechaPagoISO
        };
        
        pagos.push(pago);
        
        totalMonto += (pagoData.montoCapital || 0) + (pagoData.montoInteres || 0) + (pagoData.montoMora || 0);
        totalInteres += pagoData.montoInteres || 0;
        totalCapital += pagoData.montoCapital || 0;
        totalMora += pagoData.montoMora || 0;
        
      } catch (docError) {
        console.error(`Error procesando documento ${doc.id}:`, docError);
      }
    }

    res.json({
      success: true,
      data: {
        pagos: pagos,
        resumen: {
          totalPagos: pagos.length,
          totalMonto: totalMonto,
          totalInteres: totalInteres,
          totalCapital: totalCapital,
          totalMora: totalMora
        }
      },
      count: pagos.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/pagos - Listar todos los pagos
router.get('/', async (req, res) => {
  try {
    const { 
      prestamoID, 
      clienteID, 
      fechaInicio, 
      fechaFin, 
      limit = 50, 
      offset = 0,
      tipoPago,
      modoCalculo
    } = req.query;
    
    let query = db.collection('pagos');

    if (prestamoID) {
      query = query.where('prestamoID', '==', prestamoID);
    }
    if (clienteID) {
      query = query.where('clienteID', '==', clienteID);
    }
    if (tipoPago) {
      query = query.where('tipoPago', '==', tipoPago);
    }
    if (modoCalculo) {
      query = query.where('modoCalculo', '==', modoCalculo);
    }
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      
      query = query.where('fechaPago', '>=', inicio)
                   .where('fechaPago', '<=', fin);
    }

    query = query.orderBy('fechaPago', 'desc')
                 .limit(parseInt(limit));

    const pagosSnapshot = await query.get();
    
    const pagos = [];
    let estadisticas = {
      totalMonto: 0,
      totalInteres: 0,
      totalCapital: 0,
      totalMora: 0,
      totalPagosManuales: 0,
      totalPagosAutomaticos: 0
    };

    pagosSnapshot.forEach(doc => {
      const pagoData = doc.data();
      const pagoConFormato = { 
        id: doc.id, 
        ...pagoData,
        fechaPagoFormatted: pagoData.fechaPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
        fechaPagoISO: pagoData.fechaPago?.toDate?.().toISOString() || null
      };
      
      pagos.push(pagoConFormato);
      
      estadisticas.totalMonto += (pagoData.montoCapital || 0) + (pagoData.montoInteres || 0) + (pagoData.montoMora || 0);
      estadisticas.totalInteres += pagoData.montoInteres || 0;
      estadisticas.totalCapital += pagoData.montoCapital || 0;
      estadisticas.totalMora += pagoData.montoMora || 0;
      
      if (pagoData.modoManual) {
        estadisticas.totalPagosManuales++;
      } else {
        estadisticas.totalPagosAutomaticos++;
      }
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

// GET /api/pagos/:id - Obtener un pago específico
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
    
    const prestamoDoc = await db.collection('prestamos').doc(pagoData.prestamoID).get();
    let prestamo = null;
    
    if (prestamoDoc.exists) {
      const prestamoData = prestamoDoc.data();
      const prestamoObj = new Prestamo({ id: prestamoDoc.id, ...prestamoData });
      prestamo = {
        id: prestamoDoc.id,
        montoPrestado: prestamoData.montoPrestado,
        interesPercent: prestamoData.interesPercent,
        frecuencia: prestamoData.frecuencia,
        capitalRestante: prestamoData.capitalRestante,
        resumenDeuda: prestamoObj.obtenerResumenDeuda()
      };
    }

    res.json({
      success: true,
      data: {
        ...pagoData,
        prestamo: prestamo,
        fechaPagoFormatted: pagoData.fechaPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
        fechaPagoISO: pagoData.fechaPago?.toDate?.().toISOString() || null
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

// DELETE /api/pagos/:id - Eliminar pago (con reversión)
router.delete('/:id', async (req, res) => {
  try {
    const pagoDoc = await db.collection('pagos').doc(req.params.id).get();
    
    if (!pagoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Pago no encontrado'
      });
    }

    const pago = pagoDoc.data();
    
    const prestamoDoc = await db.collection('prestamos').doc(pago.prestamoID).get();
    if (prestamoDoc.exists) {
      const prestamo = new Prestamo({ id: prestamoDoc.id, ...prestamoDoc.data() });
      
      const nuevoCapital = prestamo.capitalRestante + (pago.montoCapital || 0);
      const nuevaFechaUltimoPago = prestamo.historialPagos?.length > 1 
        ? prestamo.historialPagos[prestamo.historialPagos.length - 2]?.fecha 
        : null;
      
      const actualizaciones = {
        capitalRestante: nuevoCapital,
        estado: nuevoCapital <= 0 ? 'completado' : 'activo',
        fechaActualizacion: new Date()
      };
      
      if (nuevaFechaUltimoPago) {
        actualizaciones.fechaUltimoPago = nuevaFechaUltimoPago;
      }
      
      await db.collection('prestamos').doc(pago.prestamoID).update(actualizaciones);
      
      // También eliminar las comisiones asociadas a este pago
      const comisionesSnapshot = await db.collection('comisiones')
        .where('pagoID', '==', pagoDoc.id)
        .get();
      
      const batch = db.batch();
      comisionesSnapshot.forEach(comDoc => {
        batch.delete(comDoc.ref);
      });
      await batch.commit();
    }

    await pagoDoc.ref.delete();

    res.json({
      success: true,
      message: 'Pago eliminado exitosamente y préstamo revertido'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/pagos/recordatorios - Enviar recordatorios manualmente
router.post('/recordatorios', async (req, res) => {
  try {
    await enviarRecordatoriosAutomaticos();
    res.json({
      success: true,
      message: 'Recordatorios enviados exitosamente'
    });
  } catch (error) {
    console.error('Error enviando recordatorios:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/pagos/resumen/:clienteID - Resumen de pagos por cliente
router.get('/resumen/:clienteID', async (req, res) => {
  try {
    const { clienteID } = req.params;
    
    const pagosSnapshot = await db.collection('pagos')
      .where('clienteID', '==', clienteID)
      .orderBy('fechaPago', 'desc')
      .get();
    
    let resumen = {
      totalPagos: 0,
      totalCapital: 0,
      totalInteres: 0,
      totalMora: 0,
      ultimoPago: null,
      pagosPorTipo: {
        normal: 0,
        adelantado: 0,
        mora: 0
      }
    };
    
    pagosSnapshot.forEach(doc => {
      const pago = doc.data();
      resumen.totalPagos++;
      resumen.totalCapital += pago.montoCapital || 0;
      resumen.totalInteres += pago.montoInteres || 0;
      resumen.totalMora += pago.montoMora || 0;
      
      if (pago.tipoPago && resumen.pagosPorTipo[pago.tipoPago] !== undefined) {
        resumen.pagosPorTipo[pago.tipoPago]++;
      }
      
      if (!resumen.ultimoPago || new Date(pago.fechaPago) > new Date(resumen.ultimoPago)) {
        resumen.ultimoPago = pago.fechaPago;
      }
    });
    
    res.json({
      success: true,
      data: resumen
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Función para enviar recordatorios automáticos
async function enviarRecordatoriosAutomaticos() {
  try {
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
      const prestamoObj = new Prestamo({ id: doc.id, ...prestamo });
      const resumen = prestamoObj.obtenerResumenDeuda();
      
      const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
      
      if (clienteDoc.exists) {
        const cliente = clienteDoc.data();
        
        const mensaje = `Hola ${cliente.nombre}, le recordamos que tiene un pago pendiente de RD$ ${resumen.interesAdeudado.toLocaleString()} correspondiente a los intereses de su préstamo. 
Capital restante: RD$ ${prestamo.capitalRestante.toLocaleString()}
Próximo pago: ${new Date(prestamo.fechaProximoPago).toLocaleDateString()}
¡Gracias por su puntualidad! - EYS Inversiones`;
        
        console.log(`📱 Recordatorio para: ${cliente.nombre} - ${cliente.celular}`);
        
        const notificacion = {
          tipo: 'recordatorio_pago',
          destinatario: cliente.nombre,
          telefono: cliente.celular,
          mensaje: mensaje,
          prestamoID: prestamo.id,
          fechaEnvio: new Date(),
          enviada: true,
          fechaProgramada: hoy,
          resumenDeuda: resumen
        };

        await db.collection('notificaciones').add(notificacion);
      }
    }
  } catch (error) {
    console.error('Error enviando recordatorios:', error);
  }
}

module.exports = router;