const express = require('express');
const admin = require('firebase-admin');
const Pago = require('../models/Pago');
const Prestamo = require('../models/Prestamo');
const Comision = require('../models/Comision');
const router = express.Router();
const { notificarPagoRegistrado, notificarPrestamoCompletado } = require('../services/notificationService');

const db = admin.firestore();

// ============================================
// FUNCIÓN PARA NORMALIZAR FECHA LOCAL (MANTENER DÍA CORRECTO)
// ============================================
function normalizarFechaLocal(fecha) {
  if (!fecha) return new Date();
  if (fecha instanceof Date) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }
  if (typeof fecha === 'string') {
    const parts = fecha.split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  }
  if (fecha && typeof fecha === 'object') {
    if (fecha._seconds !== undefined) {
      const d = new Date(fecha._seconds * 1000);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    if (fecha.seconds !== undefined) {
      const d = new Date(fecha.seconds * 1000);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    if (fecha.toDate) {
      const d = fecha.toDate();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  }
  const d = new Date(fecha);
  if (!isNaN(d.getTime())) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  return new Date();
}

// ============================================
// FUNCIÓN PARA CONVERTIR FECHA A STRING LOCAL YYYY-MM-DD
// (EVITA EL PROBLEMA DE UTC EN FIRESTORE)
// ============================================
function fechaToLocalString(fecha) {
  if (!fecha) return null;
  
  let dateObj;
  if (fecha instanceof Date) {
    dateObj = fecha;
  } else if (typeof fecha === 'string') {
    // Si ya está en formato YYYY-MM-DD, validar y devolver
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }
    dateObj = new Date(fecha);
  } else if (fecha.toDate) {
    dateObj = fecha.toDate();
  } else {
    dateObj = new Date(fecha);
  }
  
  if (isNaN(dateObj.getTime())) {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// ============================================
// FUNCIÓN PARA GENERAR ID PERSONALIZADO DEL PAGO
// ============================================
const generarIdPago = (clienteNombre, fechaPagoStr) => {
  if (!clienteNombre || !fechaPagoStr) return null;
  
  const nombreLimpio = clienteNombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
  
  const nombrePascalCase = nombreLimpio
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join('');
  
  // fechaPagoStr está en YYYY-MM-DD
  const [year, month, day] = fechaPagoStr.split('-');
  const fechaFormateada = `${parseInt(day)}-${parseInt(month)}-${year.slice(-2)}`;
  
  return `${nombrePascalCase}-${fechaFormateada}`;
};

// ============================================
// FUNCIÓN PARA GENERAR ID ÚNICO DE PAGO (con contador si colisión)
// ============================================
const generarIdPagoUnico = async (clienteNombre, fechaPagoStr, contador = 0) => {
  let idBase = generarIdPago(clienteNombre, fechaPagoStr);
  
  if (!idBase) {
    return `pago-${Date.now()}`;
  }
  
  if (contador > 0) {
    idBase = `${idBase}-${contador}`;
  }
  
  const pagoRef = db.collection('pagos').doc(idBase);
  const pagoSnap = await pagoRef.get();
  
  if (pagoSnap.exists) {
    return generarIdPagoUnico(clienteNombre, fechaPagoStr, contador + 1);
  }
  
  return idBase;
};

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
// FUNCIÓN PARA CREAR COMISIÓN AUTOMÁTICA
// ============================================
async function crearComisionAutomatica(prestamo, pagoId, interesPagado, fechaPagoStr) {
  try {
    if (!prestamo.generarComision || !prestamo.garanteID || interesPagado <= 0) {
      console.log('⚠️ No se genera comisión:', {
        generarComision: prestamo.generarComision,
        garanteID: prestamo.garanteID,
        interesPagado
      });
      return null;
    }
    
    const garanteInfo = await obtenerGaranteById(prestamo.garanteID);
    const garanteNombre = garanteInfo?.nombre || prestamo.garanteNombre || prestamo.garanteID;
    
    const porcentajeComision = prestamo.porcentajeComision || 50;
    const montoComision = (interesPagado * porcentajeComision) / 100;
    
    console.log('💰 Generando comisión automática:');
    console.log('  - Préstamo:', prestamo.id);
    console.log('  - Cliente:', prestamo.clienteNombre);
    console.log('  - Garante:', garanteNombre);
    console.log('  - Interés pagado:', interesPagado);
    console.log('  - Porcentaje comisión:', porcentajeComision);
    console.log('  - Monto comisión:', montoComision);
    
    // Usar fechaPagoStr para generar ID legible
    const idPersonalizado = Comision.generarIdPersonalizado
      ? Comision.generarIdPersonalizado(prestamo.clienteNombre, garanteNombre, new Date(fechaPagoStr))
      : `comision-${Date.now()}`;
    
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
      fechaPago: fechaPagoStr,
      fechaGeneracion: new Date(),
      estado: 'pagada',
      fechaPagoGarante: new Date(),
      pagadoPor: 'sistema',
      descripcion: `Comisión automática por pago de interés del préstamo ${prestamo.id} - Cliente: ${prestamo.clienteNombre}`,
      periodo: Comision.prototype?._calcularPeriodo ? Comision.prototype._calcularPeriodo(new Date(fechaPagoStr)) : new Date().toISOString().slice(0, 7),
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
// POST /api/pagos - Registrar un pago (CORREGIDO - FECHA COMO STRING)
// ============================================
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
    
    // 🔧 CORREGIDO: Normalizar fecha pago (sin zona horaria)
    let fechaPagoDate;
    if (fechaPago) {
      if (fechaPago instanceof Date) {
        fechaPagoDate = normalizarFechaLocal(fechaPago);
      } else if (typeof fechaPago === 'string') {
        const parts = fechaPago.split('T')[0].split('-');
        if (parts.length === 3) {
          fechaPagoDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          fechaPagoDate = normalizarFechaLocal(fechaPago);
        }
      } else if (fechaPago?.toDate) {
        const d = fechaPago.toDate();
        fechaPagoDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      } else {
        fechaPagoDate = normalizarFechaLocal(fechaPago);
      }
    } else {
      const hoy = new Date();
      fechaPagoDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    }
    
    console.log('✅ Fecha pago normalizada:', fechaPagoDate.toLocaleDateString());
    
    // 🔥 CONVERTIR A STRING para guardar en Firestore (evita problema UTC)
    const fechaPagoString = fechaToLocalString(fechaPagoDate);
    console.log('📅 Fecha pago como string (se guardará así):', fechaPagoString);
    
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
        fechaPago: fechaPagoString,
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
        fechaPago: fechaPagoString,
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
    
    // Generar ID personalizado para el pago (usando string)
    const idPersonalizado = await generarIdPagoUnico(prestamo.clienteNombre, fechaPagoString);
    console.log(`📝 ID de pago generado: ${idPersonalizado}`);
    
    // 🔥 CRÍTICO: Guardar fechaPago como STRING, no como Date
    const pagoParaFirestore = {
      prestamoID: pago.prestamoID,
      clienteID: pago.clienteID,
      clienteNombre: pago.clienteNombre,
      fechaPago: fechaPagoString,  // ⭐ STRING YYYY-MM-DD
      montoCapital: pago.montoCapital,
      montoInteres: pago.montoInteres,
      montoMora: pago.montoMora,
      tipoPago: pago.tipoPago,
      nota: pago.nota,
      capitalAnterior: pago.capitalAnterior,
      capitalNuevo: pago.capitalNuevo,
      modoManual: pago.modoManual,
      modoCalculo: pago.modoCalculo,
      periodosPagados: pago.periodosPagados,
      diasCubiertos: pago.diasCubiertos,
      fechaRegistro: new Date(),  // Este sí puede ser Date (timestamp administrativo)
      montoTotal: pago.montoTotal
    };
    
    const pagoRef = db.collection('pagos').doc(idPersonalizado);
    batch.set(pagoRef, pagoParaFirestore);

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

    // Crear comisión automática
    let comisionCreada = null;
    if (distribucion.interes > 0 && prestamo.generarComision && prestamo.garanteID) {
      comisionCreada = await crearComisionAutomatica(
        prestamo, 
        idPersonalizado, 
        distribucion.interes, 
        fechaPagoString
      );
    }

    if (distribucion.restoInteres > 0 && distribucion.restoInteres !== undefined) {
      await crearNotificacionResto(prestamo, distribucion.restoInteres);
    }

    // Notificaciones
    const clienteData = { id: prestamo.clienteID, nombre: prestamo.clienteNombre };
    await notificarPagoRegistrado(pagoData, prestamo, clienteData);

    if (prestamo.capitalRestante <= 0) {
      await notificarPrestamoCompletado(prestamo, clienteData);
      await crearNotificacionCompletado(prestamo);
    }

    const tieneMora = (distribucion.mora || 0) > 0;
    const prestamoCompletado = prestamo.capitalRestante <= 0;

    res.status(201).json({
      success: true,
      data: {
        pago: { id: idPersonalizado, ...pagoParaFirestore },
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

// ============================================
// GET /api/pagos/prestamo/:prestamoID - Obtener pagos de un préstamo
// ============================================
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
            // Soporte para string YYYY-MM-DD
            if (typeof pagoData.fechaPago === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(pagoData.fechaPago)) {
              const [y, m, d] = pagoData.fechaPago.split('-');
              fechaDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
              fechaPagoFormatted = fechaDate.toLocaleDateString('es-DO');
              fechaPagoISO = `${y}-${m}-${d}T00:00:00.000Z`;
            } else if (typeof pagoData.fechaPago === 'object') {
              if (pagoData.fechaPago.toDate && typeof pagoData.fechaPago.toDate === 'function') {
                fechaDate = pagoData.fechaPago.toDate();
              } else if (pagoData.fechaPago._seconds !== undefined) {
                fechaDate = new Date(pagoData.fechaPago._seconds * 1000);
              } else if (pagoData.fechaPago.seconds !== undefined) {
                fechaDate = new Date(pagoData.fechaPago.seconds * 1000);
              } else {
                fechaDate = new Date(pagoData.fechaPago);
              }
              if (!isNaN(fechaDate.getTime())) {
                fechaPagoFormatted = fechaDate.toLocaleDateString('es-DO');
                fechaPagoISO = fechaDate.toISOString();
              }
            } else if (typeof pagoData.fechaPago === 'string') {
              fechaDate = new Date(pagoData.fechaPago);
              if (!isNaN(fechaDate.getTime())) {
                fechaPagoFormatted = fechaDate.toLocaleDateString('es-DO');
                fechaPagoISO = fechaDate.toISOString();
              }
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

// ============================================
// GET /api/pagos - Listar todos los pagos
// ============================================
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
      
      let fechaPagoFormatted = 'N/A';
      if (pagoData.fechaPago) {
        if (typeof pagoData.fechaPago === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(pagoData.fechaPago)) {
          const [y, m, d] = pagoData.fechaPago.split('-');
          const fechaDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
          fechaPagoFormatted = fechaDate.toLocaleDateString('es-DO');
        } else if (pagoData.fechaPago?.toDate) {
          fechaPagoFormatted = pagoData.fechaPago.toDate().toLocaleDateString('es-DO');
        } else if (pagoData.fechaPago instanceof Date) {
          fechaPagoFormatted = pagoData.fechaPago.toLocaleDateString('es-DO');
        }
      }
      
      const pagoConFormato = { 
        id: doc.id, 
        ...pagoData,
        fechaPagoFormatted,
        fechaPagoISO: typeof pagoData.fechaPago === 'string' ? `${pagoData.fechaPago}T00:00:00.000Z` : pagoData.fechaPago?.toDate?.().toISOString() || null
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

// ============================================
// GET /api/pagos/:id - Obtener un pago específico
// ============================================
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
    
    let fechaPagoFormatted = 'N/A';
    if (pagoData.fechaPago) {
      if (typeof pagoData.fechaPago === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(pagoData.fechaPago)) {
        const [y, m, d] = pagoData.fechaPago.split('-');
        const fechaDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        fechaPagoFormatted = fechaDate.toLocaleDateString('es-DO');
      } else if (pagoData.fechaPago?.toDate) {
        fechaPagoFormatted = pagoData.fechaPago.toDate().toLocaleDateString('es-DO');
      }
    }

    res.json({
      success: true,
      data: {
        ...pagoData,
        prestamo: prestamo,
        fechaPagoFormatted,
        fechaPagoISO: typeof pagoData.fechaPago === 'string' ? `${pagoData.fechaPago}T00:00:00.000Z` : pagoData.fechaPago?.toDate?.().toISOString() || null
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

// ============================================
// DELETE /api/pagos/:id - Eliminar pago (con reversión)
// ============================================
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

// ============================================
// POST /api/pagos/recordatorios - Enviar recordatorios manualmente
// ============================================
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

// ============================================
// GET /api/pagos/resumen/:clienteID - Resumen de pagos por cliente
// ============================================
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
      
      if (!resumen.ultimoPago || (typeof pago.fechaPago === 'string' ? pago.fechaPago > resumen.ultimoPago : new Date(pago.fechaPago) > new Date(resumen.ultimoPago))) {
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

// ============================================
// Función para enviar recordatorios automáticos
// ============================================
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