const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.firestore();

// ============================================
// 🔥 FUNCIÓN PARA CONVERTIR FECHA EN FORMATO DD-MM-YYYY A DATE OBJECT
// ============================================
const parseFechaDDMMYYYY = (fechaStr) => {
  if (!fechaStr) return null;
  
  // Si ya es un objeto Date válido
  if (fechaStr instanceof Date && !isNaN(fechaStr)) return fechaStr;
  
  // Si es timestamp de Firebase
  if (fechaStr.toDate) return fechaStr.toDate();
  if (fechaStr._seconds) return new Date(fechaStr._seconds * 1000);
  if (fechaStr.seconds) return new Date(fechaStr.seconds * 1000);
  
  // Si es string en formato DD-MM-YYYY
  if (typeof fechaStr === 'string' && fechaStr.includes('-')) {
    const parts = fechaStr.split('-');
    // Detectar si es DD-MM-YYYY (día primero)
    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      // formato: DD-MM-YYYY
      const dia = parseInt(parts[0], 10);
      const mes = parseInt(parts[1], 10) - 1;
      const año = parseInt(parts[2], 10);
      const fecha = new Date(año, mes, dia);
      if (!isNaN(fecha)) return fecha;
    }
    // Detectar si es YYYY-MM-DD
    if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
      const año = parseInt(parts[0], 10);
      const mes = parseInt(parts[1], 10) - 1;
      const dia = parseInt(parts[2], 10);
      const fecha = new Date(año, mes, dia);
      if (!isNaN(fecha)) return fecha;
    }
  }
  
  // Intentar conversión directa como último recurso
  const fecha = new Date(fechaStr);
  if (!isNaN(fecha)) return fecha;
  
  return null;
};

// ============================================
// FUNCIÓN PARA CONVERTIR TIMESTAMP A DATE (mantener compatibilidad)
// ============================================
const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return null;
  
  // Usar la nueva función de parsing
  const fecha = parseFechaDDMMYYYY(timestamp);
  if (fecha) return fecha;
  
  // Fallback para otros formatos
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
          inicioPeriodo = parseFechaDDMMYYYY(fechaInicio);
          if (inicioPeriodo) inicioPeriodo.setHours(0,0,0,0);
        }
        if (fechaFin) {
          finPeriodo = parseFechaDDMMYYYY(fechaFin);
          if (finPeriodo) finPeriodo.setHours(23,59,59,999);
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
    let pagosProcesados = 0;
    let pagosFiltrados = 0;
    
    pagosSnapshot.forEach(doc => {
      const pago = doc.data();
      pagosProcesados++;
      
      const fechaPago = convertTimestampToDate(pago.fechaPago);
      
      // Verificar si está dentro del período
      if (inicioPeriodo && fechaPago && fechaPago < inicioPeriodo) return;
      if (finPeriodo && fechaPago && fechaPago > finPeriodo) return;
      
      pagosFiltrados++;
      
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
    
    console.log(`📊 Pagos totales: ${pagosProcesados}, Pagos en período: ${pagosFiltrados}, Clientes únicos: ${clientesMap.size}`);
    
    // Convertir a array y ordenar por totalInteres
    const topClientes = Array.from(clientesMap.values())
      .sort((a, b) => b.totalInteres - a.totalInteres)
      .slice(0, 10);
    
    console.log(`✅ Top ${topClientes.length} clientes encontrados`);
    
    res.json({
      success: true,
      data: topClientes,
      filtros: { periodo, año, fechaInicio, fechaFin },
      totalClientes: clientesMap.size,
      totalPagosEnPeriodo: pagosFiltrados
    });
  } catch (error) {
    console.error('❌ Error getting top clients:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// ============================================
// GET /api/dashboard/estadisticas - Estadísticas generales
// ============================================
router.get('/estadisticas', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas generales del dashboard...');
    
    // Obtener datos básicos
    const [clientesSnapshot, prestamosSnapshot, pagosSnapshot, solicitudesSnapshot] = await Promise.all([
      db.collection('clientes').get(),
      db.collection('prestamos').get(),
      db.collection('pagos').get(),
      db.collection('solicitudes').get()
    ]);
    
    const clientes = [];
    clientesSnapshot.forEach(doc => clientes.push({ id: doc.id, ...doc.data() }));
    
    const prestamos = [];
    prestamosSnapshot.forEach(doc => prestamos.push({ id: doc.id, ...doc.data() }));
    
    const pagos = [];
    pagosSnapshot.forEach(doc => pagos.push({ id: doc.id, ...doc.data() }));
    
    const solicitudes = [];
    solicitudesSnapshot.forEach(doc => solicitudes.push({ id: doc.id, ...doc.data() }));
    
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    
    // Calcular prestamos del mes actual
    const prestamosMes = prestamos.filter(p => {
      const fecha = convertTimestampToDate(p.fechaPrestamo);
      return fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    }).length;
    
    // Calcular nuevos clientes del mes actual
    const nuevosClientes = clientes.filter(c => {
      const fecha = convertTimestampToDate(c.fechaCreacion);
      return fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    }).length;
    
    // Calcular prestamos activos
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    
    // Calcular prestamos completados
    const prestamosCompletados = prestamos.filter(p => p.estado === 'completado' || p.estado === 'pagado').length;
    
    // Calcular prestamos morosos (días de retraso > 30)
    const prestamosMorosos = prestamos.filter(p => {
      if (p.estado !== 'activo') return false;
      const fechaProximoPago = convertTimestampToDate(p.fechaProximoPago);
      if (!fechaProximoPago) return false;
      const diasRetraso = Math.floor((hoy - fechaProximoPago) / (1000 * 60 * 60 * 24));
      return diasRetraso > 30;
    }).length;
    
    // Calcular morosidad %
    const morosidad = prestamosActivos > 0 ? (prestamosMorosos / prestamosActivos) * 100 : 0;
    
    // Calcular ganancias totales (intereses de todos los pagos)
    const gananciasMes = pagos.reduce((sum, p) => sum + (parseFloat(p.montoInteres) || 0), 0);
    
    // Calcular capital prestado total
    const capitalPrestado = prestamos.reduce((sum, p) => sum + (parseFloat(p.montoPrestado) || 0), 0);
    
    // Calcular capital recuperado
    const capitalRecuperado = pagos.reduce((sum, p) => sum + (parseFloat(p.montoCapital) || 0), 0);
    
    // Calcular tasa de recuperación
    const tasaRecuperacion = capitalPrestado > 0 ? (capitalRecuperado / capitalPrestado) * 100 : 0;
    
    // Calcular pagos de los últimos 15 días
    const fecha15DiasAtras = new Date(hoy);
    fecha15DiasAtras.setDate(hoy.getDate() - 15);
    const pagosUltimos15Dias = pagos.filter(p => {
      const fecha = convertTimestampToDate(p.fechaPago);
      return fecha && fecha >= fecha15DiasAtras;
    }).length;
    
    const stats = {
      clientes: clientes.length,
      prestamos: prestamosActivos,
      pagosUltimos15Dias: pagosUltimos15Dias,
      solicitudes: solicitudes.filter(s => s.estado === 'pendiente').length,
      gananciasMes: gananciasMes,
      capitalPrestado: capitalPrestado,
      morosidad: morosidad.toFixed(1),
      pagosPendientes: 0,
      nuevosClientes: nuevosClientes,
      capitalRecuperado: capitalRecuperado,
      tasaRecuperacion: tasaRecuperacion.toFixed(1),
      prestamosMes: prestamosMes,
      prestamosDesembolsadosMes: prestamosMes,
      prestamosActivos: prestamosActivos,
      prestamosCompletados: prestamosCompletados,
      prestamosMorosos: prestamosMorosos,
      pagosTotales: pagos.length
    };
    
    console.log('✅ Estadísticas calculadas:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// ============================================
// GET /api/dashboard/actividad-reciente - Actividad reciente
// ============================================
router.get('/actividad-reciente', async (req, res) => {
  try {
    // Obtener actividad reciente (últimos pagos y solicitudes)
    const [pagosSnapshot, solicitudesSnapshot, prestamosSnapshot] = await Promise.all([
      db.collection('pagos').limit(20).get(),
      db.collection('solicitudes').limit(20).get(),
      db.collection('prestamos').limit(20).get()
    ]);
    
    const actividad = [];
    
    // Procesar pagos
    pagosSnapshot.forEach(doc => {
      const pago = doc.data();
      const montoTotal = (parseFloat(pago.montoCapital) || 0) + (parseFloat(pago.montoInteres) || 0);
      actividad.push({
        id: `pago_${doc.id}`,
        tipo: 'pago',
        descripcion: `Pago registrado - ${pago.clienteNombre || 'Cliente'}`,
        monto: montoTotal,
        fecha: pago.fechaPago,
        fechaObj: convertTimestampToDate(pago.fechaPago),
        icono: 'CreditCardIcon',
        color: '#10b981'
      });
    });
    
    // Procesar solicitudes
    solicitudesSnapshot.forEach(doc => {
      const solicitud = doc.data();
      actividad.push({
        id: `solicitud_${doc.id}`,
        tipo: 'solicitud',
        descripcion: `${solicitud.estado === 'pendiente' ? 'Nueva' : 'Procesada'} solicitud - ${solicitud.clienteNombre || 'Cliente'}`,
        monto: parseFloat(solicitud.montoSolicitado) || 0,
        fecha: solicitud.fechaSolicitud,
        fechaObj: convertTimestampToDate(solicitud.fechaSolicitud),
        icono: 'DocumentTextIcon',
        color: '#3b82f6'
      });
    });
    
    // Procesar préstamos
    prestamosSnapshot.forEach(doc => {
      const prestamo = doc.data();
      actividad.push({
        id: `prestamo_${doc.id}`,
        tipo: 'prestamo',
        descripcion: `Préstamo ${prestamo.estado === 'activo' ? 'aprobado' : 'creado'} - ${prestamo.clienteNombre || 'Cliente'}`,
        monto: parseFloat(prestamo.montoPrestado) || 0,
        fecha: prestamo.fechaPrestamo,
        fechaObj: convertTimestampToDate(prestamo.fechaPrestamo),
        icono: 'CurrencyDollarIcon',
        color: '#8b5cf6'
      });
    });
    
    // Ordenar por fecha (más reciente primero) y filtrar nulos
    const actividadValida = actividad.filter(a => a.fechaObj !== null && !isNaN(a.fechaObj));
    actividadValida.sort((a, b) => b.fechaObj - a.fechaObj);
    
    console.log(`✅ Actividad reciente: ${actividadValida.length} elementos`);
    
    res.json({
      success: true,
      data: actividadValida.slice(0, 15)
    });
  } catch (error) {
    console.error('❌ Error getting recent activity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/dashboard/prestamos-proximos-vencimiento - Próximos vencimientos
// ============================================
router.get('/prestamos-proximos-vencimiento', async (req, res) => {
  try {
    const prestamosSnapshot = await db.collection('prestamos').where('estado', '==', 'activo').get();
    const hoy = new Date();
    const prestamosConVencimiento = [];
    
    prestamosSnapshot.forEach(doc => {
      const prestamo = doc.data();
      const fechaProximoPago = convertTimestampToDate(prestamo.fechaProximoPago);
      
      if (fechaProximoPago && !isNaN(fechaProximoPago)) {
        const diasRestantes = Math.ceil((fechaProximoPago - hoy) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= 7) {
          prestamosConVencimiento.push({
            id: doc.id,
            cliente: prestamo.clienteNombre,
            monto: prestamo.montoPrestado,
            fechaVencimiento: prestamo.fechaProximoPago,
            fechaVencimientoObj: fechaProximoPago,
            diasRestantes: diasRestantes
          });
        }
      }
    });
    
    prestamosConVencimiento.sort((a, b) => a.diasRestantes - b.diasRestantes);
    
    res.json({
      success: true,
      data: prestamosConVencimiento.slice(0, 10)
    });
  } catch (error) {
    console.error('❌ Error getting próximos vencimientos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;