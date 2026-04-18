const express = require('express');
const admin = require('firebase-admin');
const Comision = require('../models/Comision');
const router = express.Router();

const db = admin.firestore();

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Obtener datos del garante desde Firestore
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
// ENDPOINTS
// ============================================

// GET /api/comisiones - Listar todas las comisiones
router.get('/', async (req, res) => {
  try {
    const { garanteID, estado, fechaInicio, fechaFin, limit = 500 } = req.query;
    
    let query = db.collection('comisiones');
    
    if (garanteID) {
      query = query.where('garanteID', '==', garanteID);
    }
    if (estado && estado !== 'todos') {
      query = query.where('estado', '==', estado);
    }
    
    const comisionesSnapshot = await query.get();
    
    let comisiones = [];
    comisionesSnapshot.forEach(doc => {
      comisiones.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar por fecha más reciente
    comisiones.sort((a, b) => {
      const fechaA = a.fechaPago ? new Date(a.fechaPago).getTime() : 0;
      const fechaB = b.fechaPago ? new Date(b.fechaPago).getTime() : 0;
      return fechaB - fechaA;
    });
    
    // Filtrar por fechas
    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      comisiones = comisiones.filter(c => {
        if (!c.fechaPago) return false;
        return new Date(c.fechaPago) >= inicio;
      });
    }
    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      comisiones = comisiones.filter(c => {
        if (!c.fechaPago) return false;
        return new Date(c.fechaPago) <= fin;
      });
    }
    
    // Limitar resultados
    if (comisiones.length > limit) {
      comisiones = comisiones.slice(0, limit);
    }
    
    // Calcular estadísticas
    const estadisticas = {
      total: comisiones.length,
      pendientes: comisiones.filter(c => c.estado === 'pendiente').length,
      pagadas: comisiones.filter(c => c.estado === 'pagada').length,
      canceladas: comisiones.filter(c => c.estado === 'cancelada').length,
      montoTotal: comisiones.reduce((sum, c) => sum + (c.montoComision || 0), 0),
      montoPendiente: comisiones.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + (c.montoComision || 0), 0),
      montoPagado: comisiones.filter(c => c.estado === 'pagada').reduce((sum, c) => sum + (c.montoComision || 0), 0)
    };
    
    console.log(`✅ Encontradas ${comisiones.length} comisiones`);
    
    res.json({
      success: true,
      data: comisiones,
      estadisticas,
      count: comisiones.length
    });
  } catch (error) {
    console.error('Error fetching comisiones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/comisiones/garante/:garanteID - Comisiones por garante específico
router.get('/garante/:garanteID', async (req, res) => {
  try {
    const { garanteID } = req.params;
    const { estado, limit = 500 } = req.query;
    
    let query = db.collection('comisiones')
      .where('garanteID', '==', garanteID);
    
    if (estado && estado !== 'todos') {
      query = query.where('estado', '==', estado);
    }
    
    const comisionesSnapshot = await query.get();
    
    const comisiones = [];
    comisionesSnapshot.forEach(doc => {
      comisiones.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar por fecha más reciente
    comisiones.sort((a, b) => {
      const fechaA = a.fechaPago ? new Date(a.fechaPago).getTime() : 0;
      const fechaB = b.fechaPago ? new Date(b.fechaPago).getTime() : 0;
      return fechaB - fechaA;
    });
    
    // Limitar resultados
    if (comisiones.length > limit) {
      comisiones = comisiones.slice(0, limit);
    }
    
    const estadisticas = {
      total: comisiones.length,
      pendientes: comisiones.filter(c => c.estado === 'pendiente').length,
      pagadas: comisiones.filter(c => c.estado === 'pagada').length,
      canceladas: comisiones.filter(c => c.estado === 'cancelada').length,
      montoTotal: comisiones.reduce((sum, c) => sum + (c.montoComision || 0), 0),
      montoPendiente: comisiones.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + (c.montoComision || 0), 0),
      montoPagado: comisiones.filter(c => c.estado === 'pagada').reduce((sum, c) => sum + (c.montoComision || 0), 0)
    };
    
    // Obtener información del garante
    const garanteInfo = await obtenerGaranteById(garanteID);
    
    res.json({
      success: true,
      data: comisiones,
      estadisticas,
      garanteInfo,
      count: comisiones.length
    });
  } catch (error) {
    console.error('Error fetching comisiones by garante:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/comisiones/:id - Obtener comisión específica
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('comisiones').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Comisión no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Error fetching comision:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/comisiones - Crear comisión manualmente
router.post('/', async (req, res) => {
  try {
    const comisionData = req.body;
    
    // Validar campos requeridos
    if (!comisionData.garanteID) {
      return res.status(400).json({
        success: false,
        error: 'Garante es requerido'
      });
    }
    
    if (!comisionData.montoBase || comisionData.montoBase <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Monto base es requerido y debe ser mayor a 0'
      });
    }
    
    // Obtener información del garante
    const garanteInfo = await obtenerGaranteById(comisionData.garanteID);
    const garanteNombre = garanteInfo?.nombre || comisionData.garanteNombre || comisionData.garanteID;
    const clienteNombre = comisionData.clienteNombre || '';
    
    const porcentaje = parseFloat(comisionData.porcentaje) || 50;
    const montoComision = (parseFloat(comisionData.montoBase) * porcentaje) / 100;
    const fechaPago = comisionData.fechaPago ? new Date(comisionData.fechaPago) : new Date();
    
    // Generar ID personalizado con formato Cliente-Garante-Fecha
    const idPersonalizado = Comision.generarIdPersonalizado(
      clienteNombre,
      garanteNombre,
      fechaPago
    );
    
    const nuevaComision = {
      id: idPersonalizado,
      tipo: comisionData.tipo || 'manual',
      garanteID: comisionData.garanteID,
      garanteNombre: garanteNombre,
      prestamoID: comisionData.prestamoID || null,
      clienteID: comisionData.clienteID || null,
      clienteNombre: clienteNombre,
      pagoID: comisionData.pagoID || null,
      montoBase: parseFloat(comisionData.montoBase),
      porcentaje: porcentaje,
      montoComision: montoComision,
      fechaPago: fechaPago,
      fechaGeneracion: new Date(),
      estado: comisionData.estado || 'pendiente',
      descripcion: comisionData.descripcion || `Comisión manual creada por ${comisionData.creadoPor || 'admin'}`,
      periodo: Comision.prototype._calcularPeriodo(fechaPago),
      creadoPor: comisionData.creadoPor || 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const comisionRef = db.collection('comisiones').doc(idPersonalizado);
    await comisionRef.set(nuevaComision);
    
    console.log(`✅ Comisión manual creada: ${idPersonalizado}`);
    
    res.status(201).json({
      success: true,
      data: nuevaComision,
      message: 'Comisión creada exitosamente'
    });
  } catch (error) {
    console.error('Error creating comision:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/comisiones/:id - Actualizar comisión
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const comisionRef = db.collection('comisiones').doc(id);
    const comisionDoc = await comisionRef.get();
    
    if (!comisionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Comisión no encontrada'
      });
    }
    
    // Recalcular monto de comisión si cambia monto base o porcentaje
    if (updateData.montoBase !== undefined || updateData.porcentaje !== undefined) {
      const montoBase = updateData.montoBase !== undefined ? parseFloat(updateData.montoBase) : comisionDoc.data().montoBase;
      const porcentaje = updateData.porcentaje !== undefined ? parseFloat(updateData.porcentaje) : comisionDoc.data().porcentaje;
      updateData.montoComision = (montoBase * porcentaje) / 100;
    }
    
    updateData.updatedAt = new Date();
    
    await comisionRef.update(updateData);
    
    const updatedDoc = await comisionRef.get();
    
    console.log(`✅ Comisión actualizada: ${id}`);
    
    res.json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Comisión actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating comision:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/comisiones/:id/pagar - Marcar comisión como pagada
router.put('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const { pagadoPor, fechaPagoGarante, nota } = req.body;
    
    const comisionRef = db.collection('comisiones').doc(id);
    const comisionDoc = await comisionRef.get();
    
    if (!comisionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Comisión no encontrada'
      });
    }
    
    const comisionData = comisionDoc.data();
    
    if (comisionData.estado === 'pagada') {
      return res.status(400).json({
        success: false,
        error: 'La comisión ya está pagada'
      });
    }
    
    await comisionRef.update({
      estado: 'pagada',
      fechaPagoGarante: fechaPagoGarante ? new Date(fechaPagoGarante) : new Date(),
      pagadoPor: pagadoPor || 'admin',
      notaPago: nota || '',
      updatedAt: new Date()
    });
    
    const updatedDoc = await comisionRef.get();
    
    console.log(`✅ Comisión marcada como pagada: ${id}`);
    
    res.json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Comisión marcada como pagada exitosamente'
    });
  } catch (error) {
    console.error('Error paying comision:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/comisiones/:id/cancelar - Cancelar comisión
router.put('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    const comisionRef = db.collection('comisiones').doc(id);
    const comisionDoc = await comisionRef.get();
    
    if (!comisionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Comisión no encontrada'
      });
    }
    
    const comisionData = comisionDoc.data();
    
    if (comisionData.estado === 'pagada') {
      return res.status(400).json({
        success: false,
        error: 'No se puede cancelar una comisión ya pagada'
      });
    }
    
    await comisionRef.update({
      estado: 'cancelada',
      motivoCancelacion: motivo || '',
      fechaCancelacion: new Date(),
      updatedAt: new Date()
    });
    
    const updatedDoc = await comisionRef.get();
    
    console.log(`✅ Comisión cancelada: ${id}`);
    
    res.json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Comisión cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error canceling comision:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/comisiones/:id - Eliminar comisión
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const comisionRef = db.collection('comisiones').doc(id);
    const comisionDoc = await comisionRef.get();
    
    if (!comisionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Comisión no encontrada'
      });
    }
    
    await comisionRef.delete();
    
    console.log(`✅ Comisión eliminada: ${id}`);
    
    res.json({
      success: true,
      message: 'Comisión eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting comision:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/comisiones/resumen/garante/:garanteID - Resumen de comisiones por garante
router.get('/resumen/garante/:garanteID', async (req, res) => {
  try {
    const { garanteID } = req.params;
    
    const comisionesSnapshot = await db.collection('comisiones')
      .where('garanteID', '==', garanteID)
      .get();
    
    let comisiones = [];
    comisionesSnapshot.forEach(doc => {
      comisiones.push(doc.data());
    });
    
    // Ordenar por fecha
    comisiones.sort((a, b) => {
      const fechaA = a.fechaPago ? new Date(a.fechaPago).getTime() : 0;
      const fechaB = b.fechaPago ? new Date(b.fechaPago).getTime() : 0;
      return fechaB - fechaA;
    });
    
    const resumen = {
      garanteID,
      totalComisiones: comisiones.length,
      montoTotal: comisiones.reduce((sum, c) => sum + (c.montoComision || 0), 0),
      montoPagado: comisiones.filter(c => c.estado === 'pagada').reduce((sum, c) => sum + (c.montoComision || 0), 0),
      montoPendiente: comisiones.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + (c.montoComision || 0), 0),
      comisionesPagadas: comisiones.filter(c => c.estado === 'pagada').length,
      comisionesPendientes: comisiones.filter(c => c.estado === 'pendiente').length,
      comisionesCanceladas: comisiones.filter(c => c.estado === 'cancelada').length,
      ultimasComisiones: comisiones.slice(0, 10).map(c => ({
        id: c.id,
        clienteNombre: c.clienteNombre,
        montoComision: c.montoComision,
        fechaPago: c.fechaPago,
        estado: c.estado
      }))
    };
    
    res.json({
      success: true,
      data: resumen
    });
  } catch (error) {
    console.error('Error fetching comisiones resumen:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/comisiones/estadisticas/general - Estadísticas generales
router.get('/estadisticas/general', async (req, res) => {
  try {
    const comisionesSnapshot = await db.collection('comisiones').get();
    
    let comisiones = [];
    comisionesSnapshot.forEach(doc => {
      comisiones.push(doc.data());
    });
    
    // Comisiones por mes
    const comisionesPorMes = {};
    comisiones.forEach(c => {
      if (!c.fechaPago) return;
      const fecha = new Date(c.fechaPago);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = fecha.toLocaleDateString('es-DO', { year: 'numeric', month: 'short' });
      if (!comisionesPorMes[mesKey]) {
        comisionesPorMes[mesKey] = { label: mesLabel, total: 0, pagadas: 0, pendientes: 0 };
      }
      comisionesPorMes[mesKey].total += c.montoComision || 0;
      if (c.estado === 'pagada') comisionesPorMes[mesKey].pagadas += c.montoComision || 0;
      if (c.estado === 'pendiente') comisionesPorMes[mesKey].pendientes += c.montoComision || 0;
    });
    
    // Top garantes por comisiones
    const comisionesPorGarante = {};
    comisiones.forEach(c => {
      if (!c.garanteID) return;
      if (!comisionesPorGarante[c.garanteID]) {
        comisionesPorGarante[c.garanteID] = {
          id: c.garanteID,
          nombre: c.garanteNombre || c.garanteID,
          total: 0,
          pagadas: 0,
          pendientes: 0,
          cantidad: 0
        };
      }
      comisionesPorGarante[c.garanteID].total += c.montoComision || 0;
      comisionesPorGarante[c.garanteID].cantidad++;
      if (c.estado === 'pagada') comisionesPorGarante[c.garanteID].pagadas += c.montoComision || 0;
      if (c.estado === 'pendiente') comisionesPorGarante[c.garanteID].pendientes += c.montoComision || 0;
    });
    
    const topGarantes = Object.values(comisionesPorGarante)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    
    res.json({
      success: true,
      data: {
        comisionesPorMes: Object.values(comisionesPorMes).sort((a, b) => {
          const meses = { Ene: 1, Feb: 2, Mar: 3, Abr: 4, May: 5, Jun: 6, Jul: 7, Ago: 8, Sep: 9, Oct: 10, Nov: 11, Dic: 12 };
          return (meses[a.label?.substring(0, 3)] || 0) - (meses[b.label?.substring(0, 3)] || 0);
        }),
        topGarantes,
        totalGeneral: comisiones.reduce((sum, c) => sum + (c.montoComision || 0), 0),
        totalPagado: comisiones.filter(c => c.estado === 'pagada').reduce((sum, c) => sum + (c.montoComision || 0), 0),
        totalPendiente: comisiones.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + (c.montoComision || 0), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching comisiones estadisticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;