const express = require('express');
const admin = require('firebase-admin');
const Prestamo = require('../models/Prestamo');
const router = express.Router();
const { notificarNuevoPrestamo, notificarGaranteAsignado } = require('../services/notificationService');

const db = admin.firestore();

// ============================================
// FUNCIÓN PARA GENERAR ID PERSONALIZADO
// ============================================
function generarIdPrestamo(clienteNombre, fechaPrestamo) {
  // Limpiar el nombre: eliminar espacios, convertir a minúsculas, eliminar acentos
  const nombreLimpio = clienteNombre
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\s+/g, '') // Eliminar espacios
    .replace(/[^a-z0-9]/g, ''); // Solo letras y números
  
  // Obtener fecha formateada
  let fecha;
  if (fechaPrestamo instanceof Date) {
    fecha = fechaPrestamo;
  } else if (typeof fechaPrestamo === 'string') {
    fecha = new Date(fechaPrestamo);
  } else if (fechaPrestamo?.toDate) {
    fecha = fechaPrestamo.toDate();
  } else {
    fecha = new Date(fechaPrestamo);
  }
  
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const año = fecha.getFullYear().toString().slice(-2);
  
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
// FUNCIONES DE FECHA CORREGIDAS
// ============================================

// Calcular la primera fecha de pago (basada en la fecha del préstamo)
function calcularPrimeraFechaPago(fechaPrestamo, frecuencia, config = {}) {
  const fecha = new Date(fechaPrestamo);
  const dia = fecha.getDate();
  const mes = fecha.getMonth();
  const año = fecha.getFullYear();
  
  console.log('📅 Calculando primera fecha de pago:');
  console.log('  Fecha préstamo:', fecha.toLocaleDateString());
  console.log('  Día:', dia);
  console.log('  Frecuencia:', frecuencia);
  
  switch (frecuencia) {
    case 'diario':
      const fechaDiaria = new Date(fecha);
      fechaDiaria.setDate(dia + 1);
      console.log('  Resultado (diario):', fechaDiaria.toLocaleDateString());
      return fechaDiaria;
      
    case 'semanal':
      const fechaSemanal = new Date(fecha);
      fechaSemanal.setDate(dia + 7);
      console.log('  Resultado (semanal):', fechaSemanal.toLocaleDateString());
      return fechaSemanal;
      
    case 'quincenal':
      if (dia < 15) {
        const fecha15 = new Date(año, mes, 15);
        console.log(`  → Día ${dia} < 15, primera fecha: 15 del mismo mes (${fecha15.toLocaleDateString()})`);
        return fecha15;
      } 
      else if (dia >= 15 && dia < 30) {
        const fecha30 = new Date(año, mes, 30);
        console.log(`  → Día ${dia} >= 15 y < 30, primera fecha: 30 del mismo mes (${fecha30.toLocaleDateString()})`);
        return fecha30;
      } 
      else {
        const fecha15Prox = new Date(año, mes + 1, 15);
        console.log(`  → Día ${dia} >= 30, primera fecha: 15 del mes siguiente (${fecha15Prox.toLocaleDateString()})`);
        return fecha15Prox;
      }
      
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
      
      let fechaMensual = new Date(añoPrimeraFecha, mesPrimeraFecha, diaPago);
      
      if (fechaMensual.getMonth() !== mesPrimeraFecha % 12) {
        fechaMensual = new Date(añoPrimeraFecha, mesPrimeraFecha + 1, 0);
        console.log(`  → Mensual: día ${diaPago} no existe en el mes, ajustado al último día: ${fechaMensual.toLocaleDateString()}`);
      } else {
        console.log(`  → Mensual (día configurado ${diaPago}): ${fechaMensual.toLocaleDateString()}`);
      }
      return fechaMensual;
      
    case 'personalizado':
      if (config.fechasPersonalizadas && config.fechasPersonalizadas.length > 0) {
        const fechas = config.fechasPersonalizadas.map(f => new Date(f));
        fechas.sort((a, b) => a - b);
        for (const fechaPago of fechas) {
          if (fechaPago > fecha) {
            console.log('  Resultado (personalizado):', fechaPago.toLocaleDateString());
            return fechaPago;
          }
        }
        const primeraFecha = new Date(fechas[0]);
        primeraFecha.setFullYear(primeraFecha.getFullYear() + 1);
        console.log('  Resultado (personalizado - próximo año):', primeraFecha.toLocaleDateString());
        return primeraFecha;
      }
      const fechaDefault = new Date(fecha);
      fechaDefault.setDate(dia + 30);
      console.log('  Resultado (default):', fechaDefault.toLocaleDateString());
      return fechaDefault;
      
    default:
      const fechaDefault2 = new Date(fecha);
      fechaDefault2.setDate(dia + 30);
      return fechaDefault2;
  }
}

// ============================================
// ENDPOINTS
// ============================================

// GET /api/prestamos - Listar préstamos
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
      
      prestamos.push({ 
        id: doc.id, 
        ...data,
        resumenDeuda: prestamo.obtenerResumenDeuda(),
        fechaPrestamoFormatted: data.fechaPrestamo?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
        fechaProximoPagoFormatted: data.fechaProximoPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
        fechaUltimoPagoFormatted: data.fechaUltimoPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A'
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
    const prestamo = new Prestamo({ id: doc.id, ...data });

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        resumenDeuda: prestamo.obtenerResumenDeuda(),
        fechaPrestamoFormatted: data.fechaPrestamo?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
        fechaProximoPagoFormatted: data.fechaProximoPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A',
        fechaUltimoPagoFormatted: data.fechaUltimoPago?.toDate?.().toLocaleDateString('es-DO') || 'N/A'
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

// POST /api/prestamos - Crear nuevo préstamo
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

    // Manejo correcto de fecha
    let fechaPrestamo;
    if (prestamoData.fechaPrestamo instanceof Date) {
      fechaPrestamo = prestamoData.fechaPrestamo;
    } else if (typeof prestamoData.fechaPrestamo === 'string') {
      fechaPrestamo = new Date(prestamoData.fechaPrestamo);
    } else if (prestamoData.fechaPrestamo?.toDate) {
      fechaPrestamo = prestamoData.fechaPrestamo.toDate();
    } else {
      fechaPrestamo = new Date(prestamoData.fechaPrestamo);
    }
    
    // Calcular la PRIMERA fecha de pago
    const primeraFechaPago = calcularPrimeraFechaPago(
      fechaPrestamo,
      prestamoData.frecuencia,
      {
        diaPagoPersonalizado: prestamoData.diaPagoPersonalizado ? parseInt(prestamoData.diaPagoPersonalizado) : null,
        fechasPersonalizadas: prestamoData.fechasPersonalizadas
      }
    );

    console.log('✅ Fecha préstamo:', fechaPrestamo.toLocaleDateString());
    console.log('✅ Primera fecha de pago calculada:', primeraFechaPago.toLocaleDateString());
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
      fechaPrestamo: fechaPrestamo,
      fechaProximoPago: primeraFechaPago,
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
    const idPersonalizado = generarIdPrestamo(prestamo.clienteNombre, fechaPrestamo);
    const docRef = db.collection('prestamos').doc(idPersonalizado);
    prestamo.id = docRef.id;

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
      fechaActualizacion: prestamo.fechaActualizacion,
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
    // 🔥 NUEVAS NOTIFICACIONES
    // ============================================
    // Notificar nuevo préstamo
    await notificarNuevoPrestamo(prestamo, { id: prestamo.clienteID, nombre: prestamo.clienteNombre });

    // Si tiene garante, notificar asignación
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

// PUT /api/prestamos/:id - Actualizar préstamo
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

    // Manejo correcto de fecha préstamo
    if (updates.fechaPrestamo !== undefined) {
      let fechaPrestamo;
      if (updates.fechaPrestamo instanceof Date) {
        fechaPrestamo = updates.fechaPrestamo;
      } else if (typeof updates.fechaPrestamo === 'string') {
        fechaPrestamo = new Date(updates.fechaPrestamo);
      } else if (updates.fechaPrestamo?.toDate) {
        fechaPrestamo = updates.fechaPrestamo.toDate();
      } else if (updates.fechaPrestamo?._seconds !== undefined) {
        fechaPrestamo = new Date(updates.fechaPrestamo._seconds * 1000);
      } else if (updates.fechaPrestamo?.seconds !== undefined) {
        fechaPrestamo = new Date(updates.fechaPrestamo.seconds * 1000);
      } else {
        fechaPrestamo = new Date(updates.fechaPrestamo);
      }
      
      if (!isNaN(fechaPrestamo.getTime())) {
        updatesData.fechaPrestamo = fechaPrestamo;
        console.log('✅ Fecha préstamo actualizada:', fechaPrestamo);
      } else {
        console.warn('⚠️ Fecha inválida recibida, omitiendo actualización');
        delete updatesData.fechaPrestamo;
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

    if (updates.frecuencia || updates.diaPagoPersonalizado || updates.diaSemana || updates.fechasPersonalizadas) {
      const fechaBase = updates.fechaUltimoPago || prestamoActual.fechaUltimoPago || prestamoActual.fechaPrestamo;
      let fechaBaseDate;
      
      if (fechaBase instanceof Date) {
        fechaBaseDate = fechaBase;
      } else if (fechaBase?.toDate) {
        fechaBaseDate = fechaBase.toDate();
      } else if (fechaBase?._seconds !== undefined) {
        fechaBaseDate = new Date(fechaBase._seconds * 1000);
      } else if (fechaBase?.seconds !== undefined) {
        fechaBaseDate = new Date(fechaBase.seconds * 1000);
      } else {
        fechaBaseDate = new Date(fechaBase);
      }
      
      if (!isNaN(fechaBaseDate.getTime())) {
        updatesData.fechaProximoPago = calcularPrimeraFechaPago(
          fechaBaseDate,
          updates.frecuencia || prestamoActual.frecuencia,
          {
            diaPagoPersonalizado: updates.diaPagoPersonalizado || prestamoActual.diaPagoPersonalizado,
            fechasPersonalizadas: updates.fechasPersonalizadas || prestamoActual.fechasPersonalizadas
          }
        );
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

// DELETE /api/prestamos/:id - Eliminar préstamo
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

// GET /api/prestamos/:id/resumen - Obtener resumen de deuda
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