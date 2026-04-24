const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.firestore();

// ============================================
// FUNCIÓN PARA CONVERTIR TIMESTAMP A DATE
// ============================================
const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp._seconds) return new Date(timestamp._seconds * 1000);
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
};

// ============================================
// GET /api/dashboard/clientes-top-interes - Top clientes por intereses pagados
// ============================================
router.get('/clientes-top-interes', async (req, res) => {
  try {
    const { periodo, año, fechaInicio, fechaFin } = req.query;
    
    console.log('📊 Calculando top clientes por intereses con filtros:', { periodo, año, fechaInicio, fechaFin });
    
    // Configurar fechas según período
    let inicioPeriodo = null;
    let finPeriodo = null;
    const hoy = new Date();
    
    switch(periodo) {
      case 'hoy':
        inicioPeriodo = new Date(hoy);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'ayer':
        inicioPeriodo = new Date(hoy);
        inicioPeriodo.setDate(hoy.getDate() - 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy);
        finPeriodo.setDate(hoy.getDate() - 1);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'semana':
        inicioPeriodo = new Date(hoy);
        inicioPeriodo.setDate(hoy.getDate() - 7);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'mes':
        inicioPeriodo = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'trimestre':
        const trimestreInicio = Math.floor(hoy.getMonth() / 3) * 3;
        inicioPeriodo = new Date(hoy.getFullYear(), trimestreInicio, 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy.getFullYear(), trimestreInicio + 3, 0);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'año':
        const añoNum = año ? parseInt(año) : hoy.getFullYear();
        inicioPeriodo = new Date(añoNum, 0, 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(añoNum, 11, 31);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'personalizado':
        if (fechaInicio) {
          inicioPeriodo = new Date(fechaInicio);
          inicioPeriodo.setHours(0,0,0,0);
        }
        if (fechaFin) {
          finPeriodo = new Date(fechaFin);
          finPeriodo.setHours(23,59,59,999);
        }
        break;
      default:
        inicioPeriodo = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        finPeriodo.setHours(23,59,59,999);
    }
    
    console.log('📅 Período:', inicioPeriodo?.toLocaleDateString(), '-', finPeriodo?.toLocaleDateString());
    
    // Obtener todos los pagos
    const pagosSnapshot = await db.collection('pagos').get();
    const clientesMap = new Map();
    
    pagosSnapshot.forEach(doc => {
      const pago = doc.data();
      const fechaPago = convertTimestampToDate(pago.fechaPago);
      
      // Verificar si está dentro del período
      if (inicioPeriodo && fechaPago && fechaPago < inicioPeriodo) return;
      if (finPeriodo && fechaPago && fechaPago > finPeriodo) return;
      
      const clienteId = pago.clienteID;
      const interes = parseFloat(pago.montoInteres) || 0;
      const capital = parseFloat(pago.montoCapital) || 0;
      const totalPagado = interes + capital;
      
      if (!clientesMap.has(clienteId)) {
        clientesMap.set(clienteId, {
          id: clienteId,
          nombre: pago.clienteNombre || 'Cliente',
          cedula: '',
          totalInteres: 0,
          totalCapital: 0,
          totalPagado: 0,
          cantidadPagos: 0
        });
      }
      
      const cliente = clientesMap.get(clienteId);
      cliente.totalInteres += interes;
      cliente.totalCapital += capital;
      cliente.totalPagado += totalPagado;
      cliente.cantidadPagos++;
    });
    
    // Convertir a array y ordenar por totalInteres
    const topClientes = Array.from(clientesMap.values())
      .sort((a, b) => b.totalInteres - a.totalInteres)
      .slice(0, 10);
    
    console.log(`✅ Top ${topClientes.length} clientes encontrados`);
    
    res.json({
      success: true,
      data: topClientes,
      filtros: { periodo, año, fechaInicio, fechaFin },
      totalClientes: clientesMap.size
    });
  } catch (error) {
    console.error('❌ Error getting top clients:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/dashboard/estadisticas - Estadísticas generales
router.get('/estadisticas', async (req, res) => {
  try {
    // Obtener datos básicos
    const [clientesSnapshot, prestamosSnapshot, pagosSnapshot, solicitudesSnapshot] = await Promise.all([
      db.collection('clientes').get(),
      db.collection('prestamos').get(),
      db.collection('pagos').get(),
      db.collection('solicitudes').get()
    ]);
    
    const clientes = [];
    clientesSnapshot.forEach(doc => clientes.push(doc.data()));
    
    const prestamos = [];
    prestamosSnapshot.forEach(doc => prestamos.push(doc.data()));
    
    const pagos = [];
    pagosSnapshot.forEach(doc => pagos.push(doc.data()));
    
    const solicitudes = [];
    solicitudesSnapshot.forEach(doc => solicitudes.push(doc.data()));
    
    // Calcular estadísticas básicas
    const stats = {
      clientesActivos: clientes.filter(c => c.activo !== false).length,
      prestamosActivos: prestamos.filter(p => p.estado === 'activo').length,
      pagosHoy: 0,
      solicitudesPendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
      gananciasMes: pagos.reduce((sum, p) => sum + (parseFloat(p.montoInteres) || 0), 0),
      capitalPrestado: prestamos.reduce((sum, p) => sum + (parseFloat(p.montoPrestado) || 0), 0),
      morosidad: 0,
      capitalRecuperado: pagos.reduce((sum, p) => sum + (parseFloat(p.montoCapital) || 0), 0),
      prestamosMes: prestamos.filter(p => {
        const fecha = convertTimestampToDate(p.fechaPrestamo);
        const hoy = new Date();
        return fecha && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
      }).length,
      nuevosClientes: clientes.filter(c => {
        const fecha = convertTimestampToDate(c.fechaCreacion);
        const hoy = new Date();
        return fecha && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
      }).length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/dashboard/actividad-reciente - Actividad reciente
router.get('/actividad-reciente', async (req, res) => {
  try {
    // Obtener actividad reciente (últimos pagos y solicitudes)
    const [pagosSnapshot, solicitudesSnapshot, prestamosSnapshot] = await Promise.all([
      db.collection('pagos').orderBy('fechaPago', 'desc').limit(10).get(),
      db.collection('solicitudes').orderBy('fechaSolicitud', 'desc').limit(10).get(),
      db.collection('prestamos').orderBy('fechaPrestamo', 'desc').limit(10).get()
    ]);
    
    const actividad = [];
    
    pagosSnapshot.forEach(doc => {
      const pago = doc.data();
      actividad.push({
        id: `pago_${doc.id}`,
        tipo: 'pago',
        descripcion: `Pago registrado - ${pago.clienteNombre || 'Cliente'}`,
        monto: (parseFloat(pago.montoCapital) || 0) + (parseFloat(pago.montoInteres) || 0),
        fecha: pago.fechaPago,
        icono: 'cash',
        color: '#10b981'
      });
    });
    
    solicitudesSnapshot.forEach(doc => {
      const solicitud = doc.data();
      actividad.push({
        id: `solicitud_${doc.id}`,
        tipo: 'solicitud',
        descripcion: `${solicitud.estado === 'pendiente' ? 'Nueva' : 'Procesada'} solicitud - ${solicitud.clienteNombre || 'Cliente'}`,
        monto: parseFloat(solicitud.montoSolicitado) || 0,
        fecha: solicitud.fechaSolicitud,
        icono: 'document-text',
        color: '#3b82f6'
      });
    });
    
    prestamosSnapshot.forEach(doc => {
      const prestamo = doc.data();
      actividad.push({
        id: `prestamo_${doc.id}`,
        tipo: 'prestamo',
        descripcion: `Préstamo ${prestamo.estado === 'activo' ? 'aprobado' : 'creado'} - ${prestamo.clienteNombre || 'Cliente'}`,
        monto: parseFloat(prestamo.montoPrestado) || 0,
        fecha: prestamo.fechaPrestamo,
        icono: 'cash',
        color: '#8b5cf6'
      });
    });
    
    // Ordenar por fecha (más reciente primero)
    actividad.sort((a, b) => {
      const fechaA = convertTimestampToDate(a.fecha) || new Date(0);
      const fechaB = convertTimestampToDate(b.fecha) || new Date(0);
      return fechaB - fechaA;
    });
    
    res.json({
      success: true,
      data: actividad.slice(0, 15)
    });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;