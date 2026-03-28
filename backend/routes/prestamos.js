const express = require('express');
const admin = require('firebase-admin');
const Prestamo = require('../models/Prestamo');
const router = express.Router();

const db = admin.firestore();

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
      // LOGICA PARA PRIMERA FECHA DE PAGO:
      // Si la fecha del préstamo es menor a 15 -> primera fecha es 15 del mismo mes
      // Si la fecha del préstamo es 15 o mayor pero menor a 30 -> primera fecha es 30 del mismo mes
      // Si la fecha del préstamo es 30 o mayor -> primera fecha es 15 del mes siguiente
      
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
      let fechaMensual = new Date(año, mes + 1, diaPago);
      if (fechaMensual.getMonth() !== (mes + 1) % 12) {
        fechaMensual = new Date(año, mes + 2, 0);
      }
      console.log('  Resultado (mensual):', fechaMensual.toLocaleDateString());
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
      fechaPrestamo: prestamoData.fechaPrestamo
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

    const fechaPrestamo = new Date(prestamoData.fechaPrestamo);
    
    // Calcular la PRIMERA fecha de pago usando la función corregida
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
      historialPagos: []
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

    await docRef.set({
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
      fechaActualizacion: prestamo.fechaActualizacion
    });

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
      'diaPagoPersonalizado', 'diaSemana', 'fechasPersonalizadas', 'capitalRestante'
    ];
    
    for (const campo of camposPermitidos) {
      if (updates[campo] !== undefined) {
        updatesData[campo] = updates[campo];
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
      updatesData.fechaProximoPago = calcularPrimeraFechaPago(
        new Date(fechaBase),
        updates.frecuencia || prestamoActual.frecuencia,
        {
          diaPagoPersonalizado: updates.diaPagoPersonalizado || prestamoActual.diaPagoPersonalizado,
          fechasPersonalizadas: updates.fechasPersonalizadas || prestamoActual.fechasPersonalizadas
        }
      );
    }

    updatesData.fechaActualizacion = new Date();

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