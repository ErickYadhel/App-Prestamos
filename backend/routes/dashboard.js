const express = require('express');
const FirebaseService = require('../services/firebaseService');
const router = express.Router();

// GET /api/dashboard/estadisticas - Estadísticas generales
router.get('/estadisticas', async (req, res) => {
  try {
    const stats = await FirebaseService.getDashboardStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
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
    const [pagos, solicitudes] = await Promise.all([
      FirebaseService.getPagos(),
      FirebaseService.getSolicitudes()
    ]);
    
    // Combinar y ordenar por fecha
    const actividad = [
      ...pagos.slice(0, 5).map(p => ({
        tipo: 'pago',
        descripcion: `Pago de ${p.clienteNombre}`,
        monto: p.montoTotal,
        fecha: p.fechaPago,
        icono: 'cash',
        color: '#10b981'
      })),
      ...solicitudes.slice(0, 5).map(s => ({
        tipo: 'solicitud',
        descripcion: `Nueva solicitud de ${s.clienteNombre}`,
        monto: s.montoSolicitado,
        fecha: s.fechaSolicitud,
        icono: 'document-text',
        color: '#3b82f6'
      }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
     .slice(0, 8); // Últimas 8 actividades
    
    res.json({
      success: true,
      data: actividad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;