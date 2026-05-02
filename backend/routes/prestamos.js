const express = require('express');
const admin = require('firebase-admin');
const Prestamo = require('../models/Prestamo');
const router = express.Router();
const { notificarNuevoPrestamo, notificarGaranteAsignado } = require('../services/notificationService');

const db = admin.firestore();

// ============================================
// 🔥 FUNCIÓN PARA CONVERTIR FECHA A STRING LOCAL DD-MM-YYYY
// ============================================
function fechaToLocalString(fecha) {
  if (!fecha) return null;
  
  let dateObj;
  if (fecha instanceof Date) {
    dateObj = fecha;
  } else if (typeof fecha === 'string') {
    // Si ya es DD-MM-YYYY, validar
    if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
      return fecha;
    }
    // Si es YYYY-MM-DD, convertir a DD-MM-YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [year, month, day] = fecha.split('-');
      return `${day}-${month}-${year}`;
    }
    dateObj = new Date(fecha);
  } else if (fecha && typeof fecha === 'object') {
    if (fecha._seconds !== undefined) {
      dateObj = new Date(fecha._seconds * 1000);
    } else if (fecha.seconds !== undefined) {
      dateObj = new Date(fecha.seconds * 1000);
    } else if (fecha.toDate) {
      dateObj = fecha.toDate();
    } else {
      dateObj = new Date(fecha);
    }
  } else {
    dateObj = new Date(fecha);
  }
  
  if (isNaN(dateObj.getTime())) {
    const hoy = new Date();
    const day = String(hoy.getDate()).padStart(2, '0');
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const year = hoy.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
}

// ============================================
// FUNCIÓN PARA GENERAR ID PERSONALIZADO
// ============================================
function generarIdPrestamo(clienteNombre, fechaPrestamoStr) {
  // Limpiar el nombre: eliminar espacios, convertir a minúsculas, eliminar acentos
  const nombreLimpio = clienteNombre
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\s+/g, '') // Eliminar espacios
    .replace(/[^a-z0-9]/g, ''); // Solo letras y números
  
  // fechaPrestamoStr es DD-MM-YYYY
  const [day, month, year] = fechaPrestamoStr.split('-');
  const dia = parseInt(day);
  const mes = parseInt(month);
  const año = year.slice(-2);
  
  const fechaFormateada = `${dia}-${mes}-${año}`;
  
  // Combinar nombre + fecha
  let idGenerado = `${nombreLimpio}${fechaFormateada}`;
  
  // Limitar longitud máxima
  if (idGenerado.length > 100) {
    idGenerado = idGenerado.substring(0, 100);
  }
  
  console.log('🔑 ID generado para préstamo:', idGenerado);
  console.log('   Nombre original:', clienteNombre);
  console.log('   Nombre limpio:', nombreLimpio);
  console.log('   Fecha:', fechaFormateada);
  
  return idGenerado;
}

// ============================================
// FUNCIÓN PARA CONVERTIR STRING DD-MM-YYYY A DATE
// ============================================
function stringToDate(fechaStr) {
  if (!fechaStr) return new Date();
  if (fechaStr instanceof Date) return fechaStr;
  
  // Formato DD-MM-YYYY
  if (typeof fechaStr === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(fechaStr)) {
    const [day, month, year] = fechaStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Formato YYYY-MM-DD (compatibilidad)
  if (typeof fechaStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const [year, month, day] = fechaStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  return new Date(fechaStr);
}

// ============================================
// 🔥 FUNCIÓN PARA CALCULAR PRIMERA FECHA DE PAGO (retorna string DD-MM-YYYY)
// ============================================
function calcularPrimeraFechaPagoString(fechaPrestamoStr, frecuencia, config = {}) {
  // Convertir string a Date para cálculos
  const fecha = stringToDate(fechaPrestamoStr);
  const dia = fecha.getDate();
  const mes = fecha.getMonth();
  const año = fecha.getFullYear();
  
  console.log('📅 Calculando primera fecha de pago:');
  console.log('  Fecha préstamo:', fecha.toLocaleDateString());
  console.log('  Día:', dia);
  console.log('  Frecuencia:', frecuencia);
  
  let nuevaFecha;
  
  switch (frecuencia) {
    case 'diario':
      nuevaFecha = new Date(fecha);
      nuevaFecha.setDate(dia + 1);
      console.log('  Resultado (diario):', nuevaFecha.toLocaleDateString());
      break;
      
    case 'semanal':
      nuevaFecha = new Date(fecha);
      nuevaFecha.setDate(dia + 7);
      console.log('  Resultado (semanal):', nuevaFecha.toLocaleDateString());
      break;
      
    case 'quincenal':
      if (dia < 15) {
        nuevaFecha = new Date(año, mes, 15);
        console.log(`  → Día ${dia} < 15, primera fecha: 15 del mismo mes (${nuevaFecha.toLocaleDateString()})`);
      } else if (dia >= 15 && dia < 30) {
        nuevaFecha = new Date(año, mes, 30);
        console.log(`  → Día ${dia} >= 15 y < 30, primera fecha: 30 del mismo mes (${nuevaFecha.toLocaleDateString()})`);
      } else {
        nuevaFecha = new Date(año, mes + 1, 15);
        console.log(`  → Día ${dia} >= 30, primera fecha: 15 del mes siguiente (${nuevaFecha.toLocaleDateString()})`);
      }
      break;
      
    case 'mensual':
      let diaPago = config.diaPagoPersonalizado || dia;
      let mesPrimeraFecha = mes;
      let añoPrimeraFecha = año;
      
      if (diaPago <= dia) {
        mesPrimeraFecha = mes + 1;
        if (mesPrimeraFecha > 11) {
          mesPrimeraFecha = 0;
          añoPrimeraFecha++;
        }
      }
      
      nuevaFecha = new Date(añoPrimeraFecha, mesPrimeraFecha, diaPago);
      
      if (nuevaFecha.getMonth() !== mesPrimeraFecha % 12) {
        nuevaFecha = new Date(añoPrimeraFecha, mesPrimeraFecha + 1, 0);
        console.log(`  → Mensual: día ${diaPago} no existe, ajustado al último día: ${nuevaFecha.toLocaleDateString()}`);
      } else {
        console.log(`  → Mensual (día configurado ${diaPago}): ${nuevaFecha.toLocaleDateString()}`);
      }
      break;
      
    case 'personalizado':
      if (config.fechasPersonalizadas && config.fechasPersonalizadas.length > 0) {
        const fechas = config.fechasPersonalizadas.map(f => stringToDate(f));
        fechas.sort((a, b) => a - b);
        let fechaEncontrada = null;
        for (const fechaPago of fechas) {
          if (fechaPago > fecha) {
            fechaEncontrada = fechaPago;
            break;
          }
        }
        if (fechaEncontrada) {
          nuevaFecha = fechaEncontrada;
          console.log('  Resultado (personalizado):', nuevaFecha.toLocaleDateString());
        } else {
          nuevaFecha = new Date(fechas[0]);
          nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
          console.log('  Resultado (personalizado - próximo año):', nuevaFecha.toLocaleDateString());
        }
      } else {
        nuevaFecha = new Date(fecha);
        nuevaFecha.setDate(dia + 30);
        console.log('  Resultado (default):', nuevaFecha.toLocaleDateString());
      }
      break;
      
    default:
      nuevaFecha = new Date(fecha);
      nuevaFecha.setDate(dia + 30);
  }
  
  // Devolver como string DD-MM-YYYY
  return fechaToLocalString(nuevaFecha);
}

// ============================================
// GET /api/prestamos - Listar préstamos
// ============================================
router.get('/', async (req, res) => {
  try {
    const { estado, clienteID, search } = req.query;
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
      const prestamo = new Prestamo({ id: doc.id, ...data });
      
      // Formatear fechas para mostrar (ya son strings DD-MM-YYYY)
      const fechaPrestamo = data.fechaPrestamo || null;
      const fechaProximoPago = data.fechaProximoPago || null;
      const fechaUltimoPago = data.fechaUltimoPago || null;
      
      prestamos.push({ 
        id: doc.id, 
        ...data,
        resumenDeuda: prestamo.obtenerResumenDeuda(),
        fechaPrestamoFormatted: fechaPrestamo ? fechaPrestamo : 'N/A',
        fechaProximoPagoFormatted: fechaProximoPago ? fechaProximoPago : 'N/A',
        fechaUltimoPagoFormatted: fechaUltimoPago ? fechaUltimoPago : 'N/A'
      });
    });

    let resultado = prestamos;
    if (search) {
      resultado = prestamos.filter(p => 
        p.clienteNombre?.toLowerCase().includes(search.toLowerCase()) ||
        p.id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: resultado,
      count: resultado.length
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/prestamos/:id - Obtener préstamo específico
// ============================================
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
    const prestamo = new Prestamo({ id: doc.id, ...data });

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        resumenDeuda: prestamo.obtenerResumenDeuda(),
        fechaPrestamoFormatted: data.fechaPrestamo || 'N/A',
        fechaProximoPagoFormatted: data.fechaProximoPago || 'N/A',
        fechaUltimoPagoFormatted: data.fechaUltimoPago || 'N/A'
      }
    });
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/prestamos - Crear nuevo préstamo (con DD-MM-YYYY)
// ============================================
router.post('/', async (req, res) => {
  try {
    const prestamoData = req.body;
    
    console.log('📝 Creando nuevo préstamo:', {
      clienteID: prestamoData.clienteID,
      montoPrestado: prestamoData.montoPrestado,
      frecuencia: prestamoData.frecuencia,
      fechaPrestamo: prestamoData.fechaPrestamo,
      generarComision: prestamoData.generarComision || false,
      garanteID: prestamoData.garanteID,
      porcentajeComision: prestamoData.porcentajeComision
    });
    
    // Verificar que el cliente existe
    const clienteDoc = await db.collection('clientes').doc(prestamoData.clienteID).get();
    if (!clienteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    const cliente = clienteDoc.data();

    // Configurar mora
    let configuracionMora = null;
    if (prestamoData.activarMora) {
      configuracionMora = {
        enabled: true,
        porcentaje: parseFloat(prestamoData.porcentajeMora) || 5,
        diasGracia: parseInt(prestamoData.diasGracia) || 3
      };
    }

    // ============================================
    // 🔥 Convertir fecha a STRING DD-MM-YYYY
    // ============================================
    let fechaPrestamoString;
    if (prestamoData.fechaPrestamo) {
      fechaPrestamoString = fechaToLocalString(prestamoData.fechaPrestamo);
    } else {
      const hoy = new Date();
      const day = String(hoy.getDate()).padStart(2, '0');
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const year = hoy.getFullYear();
      fechaPrestamoString = `${day}-${month}-${year}`;
    }
    
    console.log('✅ Fecha préstamo como string DD-MM-YYYY:', fechaPrestamoString);
    
    // Calcular la PRIMERA fecha de pago (retorna string DD-MM-YYYY)
    const primeraFechaPagoString = calcularPrimeraFechaPagoString(
      fechaPrestamoString,
      prestamoData.frecuencia,
      {
        diaPagoPersonalizado: prestamoData.diaPagoPersonalizado ? parseInt(prestamoData.diaPagoPersonalizado) : null,
        fechasPersonalizadas: prestamoData.fechasPersonalizadas
      }
    );

    console.log('✅ Primera fecha de pago calculada:', primeraFechaPagoString);
    console.log('✅ Frecuencia:', prestamoData.frecuencia);

    // Obtener nombre del garante si se seleccionó uno
    let garanteNombre = null;
    let garanteData = null;
    if (prestamoData.garanteID) {
      try {
        const garanteDoc = await db.collection('garantes').doc(prestamoData.garanteID).get();
        if (garanteDoc.exists) {
          garanteNombre = garanteDoc.data().nombre;
          garanteData = garanteDoc.data();
        }
      } catch (error) {
        console.warn('Error obteniendo garante:', error);
      }
    }

    const prestamo = new Prestamo({
      ...prestamoData,
      clienteNombre: cliente.nombre,
      capitalRestante: parseFloat(prestamoData.montoPrestado),
      fechaPrestamo: fechaPrestamoString,
      fechaProximoPago: primeraFechaPagoString,
      estado: 'activo',
      diaPagoPersonalizado: prestamoData.frecuencia === 'mensual' && prestamoData.diaPagoPersonalizado ? 
        parseInt(prestamoData.diaPagoPersonalizado) : null,
      diaSemana: prestamoData.frecuencia === 'semanal' ? prestamoData.diaSemana : null,
      fechasPersonalizadas: prestamoData.frecuencia === 'personalizado' ? prestamoData.fechasPersonalizadas : null,
      configuracionMora,
      nota: prestamoData.nota || '',
      historialPagos: [],
      generarComision: prestamoData.generarComision || false,
      garanteID: prestamoData.garanteID || null,
      garanteNombre: garanteNombre || prestamoData.garanteNombre || null,
      porcentajeComision: prestamoData.porcentajeComision || 50
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

    // ============================================
    // CREAR PRÉSTAMO CON ID PERSONALIZADO
    // ============================================
    const idPersonalizado = generarIdPrestamo(prestamo.clienteNombre, fechaPrestamoString);
    const docRef = db.collection('prestamos').doc(idPersonalizado);
    prestamo.id = docRef.id;

    // 🔥 IMPORTANTE: Guardar fechas como STRINGS DD-MM-YYYY
    await docRef.set({
      id: idPersonalizado,
      clienteID: prestamo.clienteID,
      clienteNombre: prestamo.clienteNombre,
      montoPrestado: prestamo.montoPrestado,
      capitalRestante: prestamo.capitalRestante,
      interesPercent: prestamo.interesPercent,
      frecuencia: prestamo.frecuencia,
      fechaPrestamo: prestamo.fechaPrestamo,
      estado: prestamo.estado,
      fechaUltimoPago: prestamo.fechaUltimoPago,
      fechaProximoPago: prestamo.fechaProximoPago,
      diaPagoPersonalizado: prestamo.diaPagoPersonalizado,
      diaSemana: prestamo.diaSemana,
      fechasPersonalizadas: prestamo.fechasPersonalizadas,
      configuracionMora: prestamo.configuracionMora,
      nota: prestamo.nota,
      historialPagos: prestamo.historialPagos,
      fechaActualizacion: new Date(),
      generarComision: prestamo.generarComision,
      garanteID: prestamo.garanteID,
      garanteNombre: prestamo.garanteNombre,
      porcentajeComision: prestamo.porcentajeComision
    });

    console.log('✅ Préstamo creado con ID personalizado:', idPersonalizado);
    console.log('✅ Comisión configurada:', {
      generarComision: prestamo.generarComision,
      garanteID: prestamo.garanteID,
      garanteNombre: prestamo.garanteNombre,
      porcentajeComision: prestamo.porcentajeComision
    });

    // ============================================
    // NOTIFICACIONES
    // ============================================
    await notificarNuevoPrestamo(prestamo, { id: prestamo.clienteID, nombre: prestamo.clienteNombre });

    if (prestamo.garanteID && garanteData) {
      await notificarGaranteAsignado(prestamo, { nombre: prestamo.clienteNombre }, garanteData);
    }

    res.status(201).json({
      success: true,
      data: { id: prestamo.id, ...prestamo },
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

// ============================================
// PUT /api/prestamos/:id - Actualizar préstamo
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('📝 Actualizando préstamo:', id);
    console.log('📦 Datos recibidos:', JSON.stringify(updates, null, 2));

    const prestamoRef = db.collection('prestamos').doc(id);
    const prestamoDoc = await prestamoRef.get();

    if (!prestamoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    const prestamoActual = prestamoDoc.data();
    const updatesData = {};

    const camposPermitidos = [
      'montoPrestado', 'interesPercent', 'frecuencia', 'estado', 'nota',
      'diaPagoPersonalizado', 'diaSemana', 'fechasPersonalizadas', 'capitalRestante',
      'generarComision', 'garanteID', 'garanteNombre', 'porcentajeComision'
    ];
    
    for (const campo of camposPermitidos) {
      if (updates[campo] !== undefined) {
        updatesData[campo] = updates[campo];
      }
    }

    // 🔥 Convertir fecha préstamo a string DD-MM-YYYY
    if (updates.fechaPrestamo !== undefined) {
      const fechaPrestamoString = fechaToLocalString(updates.fechaPrestamo);
      if (fechaPrestamoString) {
        updatesData.fechaPrestamo = fechaPrestamoString;
        console.log('✅ Fecha préstamo actualizada:', fechaPrestamoString);
      } else {
        console.warn('⚠️ Fecha inválida recibida, omitiendo actualización');
      }
    }

    // Si se actualiza el garanteID, actualizar también el nombre
    if (updates.garanteID && updates.garanteID !== prestamoActual.garanteID) {
      try {
        const garanteDoc = await db.collection('garantes').doc(updates.garanteID).get();
        if (garanteDoc.exists) {
          updatesData.garanteNombre = garanteDoc.data().nombre;
        }
      } catch (error) {
        console.warn('Error obteniendo garante:', error);
      }
    }

    if (updates.activarMora !== undefined) {
      if (updates.activarMora) {
        updatesData.configuracionMora = {
          enabled: true,
          porcentaje: parseFloat(updates.porcentajeMora) || 5,
          diasGracia: parseInt(updates.diasGracia) || 3
        };
      } else {
        updatesData.configuracionMora = null;
      }
    }

    // 🔥 Recalcular fecha próximo pago usando strings
    if (updates.frecuencia || updates.diaPagoPersonalizado || updates.diaSemana || updates.fechasPersonalizadas) {
      const fechaBaseStr = prestamoActual.fechaUltimoPago || prestamoActual.fechaPrestamo;
      if (fechaBaseStr) {
        const nuevaFechaProximoPago = calcularPrimeraFechaPagoString(
          fechaBaseStr,
          updates.frecuencia || prestamoActual.frecuencia,
          {
            diaPagoPersonalizado: updates.diaPagoPersonalizado || prestamoActual.diaPagoPersonalizado,
            fechasPersonalizadas: updates.fechasPersonalizadas || prestamoActual.fechasPersonalizadas
          }
        );
        if (nuevaFechaProximoPago) {
          updatesData.fechaProximoPago = nuevaFechaProximoPago;
          console.log('✅ Nueva fecha próximo pago calculada:', nuevaFechaProximoPago);
        }
      }
    }

    updatesData.fechaActualizacion = new Date();

    console.log('📝 Datos a actualizar en Firestore:', Object.keys(updatesData));

    await prestamoRef.update(updatesData);

    const prestamoActualizadoDoc = await prestamoRef.get();
    const prestamoActualizado = new Prestamo({ id: prestamoActualizadoDoc.id, ...prestamoActualizadoDoc.data() });

    res.json({
      success: true,
      data: {
        id: prestamoActualizado.id,
        ...prestamoActualizado,
        resumenDeuda: prestamoActualizado.obtenerResumenDeuda()
      },
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

// ============================================
// DELETE /api/prestamos/:id - Eliminar préstamo
// ============================================
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

// ============================================
// GET /api/prestamos/:id/resumen - Obtener resumen de deuda
// ============================================
router.get('/:id/resumen', async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaReferencia } = req.query;

    const prestamoDoc = await db.collection('prestamos').doc(id).get();
    
    if (!prestamoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Préstamo no encontrado'
      });
    }

    const prestamo = new Prestamo({ id: prestamoDoc.id, ...prestamoDoc.data() });
    const resumen = prestamo.obtenerResumenDeuda(fechaReferencia ? new Date(fechaReferencia) : new Date());

    res.json({
      success: true,
      data: resumen
    });
  } catch (error) {
    console.error('Error getting loan summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;