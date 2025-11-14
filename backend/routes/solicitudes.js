const express = require('express');
const admin = require('firebase-admin');
const Solicitud = require('../models/Solicitud');
const Prestamo = require('../models/Prestamo');
const Cliente = require('../models/Cliente');
const router = express.Router();

const db = admin.firestore();

// Lista de bancos dominicanos
const BANCOS_DOMINICANOS = [
  'Banco de Reservas',
  'Banco Popular Dominicano',
  'Scotiabank',
  'Banco BHD León',
  'Banco Santa Cruz',
  'Banco López de Haro',
  'Banco Vimenca',
  'Banco Ademi',
  'Banco Caribe',
  'Banco Promerica',
  'Banco Multiple Activo Dominicana',
  'Banco BDI',
  'Banco Fondesa',
  'Banco de Ahorro y Crédito',
  'Asociación Popular de Ahorros y Préstamos',
  'Banco de Desarrollo Empresarial'
];

// GET /api/solicitudes/bancos - Obtener lista de bancos
router.get('/bancos', (req, res) => {
  res.json({
    success: true,
    data: BANCOS_DOMINICANOS
  });
});

// GET /api/solicitudes - Listar solicitudes (con filtros)
router.get('/', async (req, res) => {
  try {
    const { estado, empleadoID } = req.query;
    let query = db.collection('solicitudes');

    // Aplicar filtros
    if (estado) {
      query = query.where('estado', '==', estado);
    }
    if (empleadoID) {
      query = query.where('empleadoID', '==', empleadoID);
    }

    // Ordenar por fecha más reciente
    query = query.orderBy('fechaSolicitud', 'desc');

    const solicitudesSnapshot = await query.get();
    
    const solicitudes = [];
    solicitudesSnapshot.forEach(doc => {
      solicitudes.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: solicitudes,
      count: solicitudes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/solicitudes/:id - Obtener solicitud específica
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('solicitudes').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada'
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/solicitudes - Crear nueva solicitud (MEJORADO)
router.post('/', async (req, res) => {
  try {
    const solicitudData = req.body;
    const solicitud = new Solicitud(solicitudData);
    
    // Validación más flexible para empleados - NO BLOQUEANTE
    if (!solicitud.clienteNombre || !solicitud.telefono || !solicitud.montoSolicitado) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, teléfono y monto son requeridos'
      });
    }

    if (!solicitud.lugarTrabajo) {
      return res.status(400).json({
        success: false,
        error: 'El lugar de trabajo es requerido'
      });
    }

    // No verificamos cliente existente - el admin decidirá
    // Crear en Firestore
    const docRef = db.collection('solicitudes').doc();
    solicitud.id = docRef.id;
    solicitud.fechaSolicitud = new Date();
    solicitud.estado = 'pendiente';
    solicitud.scoreAnalisis = await calcularScoreSolicitud(solicitud);

    await docRef.set({ ...solicitud });

    // Generar enlaces de notificación para el administrador
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const enlaceAprobar = `${baseUrl}/solicitudes/${solicitud.id}/aprobar`;
    const enlaceRechazar = `${baseUrl}/solicitudes/${solicitud.id}/rechazar`;

    // Notificación por WhatsApp (enlace preconfigurado)
    const mensajeWhatsApp = `📋 NUEVA SOLICITUD DE PRÉSTAMO

👤 Cliente: ${solicitud.clienteNombre}
📞 Teléfono: ${solicitud.telefono}
💰 Monto: RD$ ${solicitud.montoSolicitado?.toLocaleString()}
🏢 Trabajo: ${solicitud.lugarTrabajo}
💼 Puesto: ${solicitud.puestoCliente || 'No especificado'}
📊 Score: ${solicitud.scoreAnalisis}/100

🔗 Ver solicitud: ${baseUrl}/solicitudes

⚡ Acciones rápidas:
✅ Aprobar: ${enlaceAprobar}
❌ Rechazar: ${enlaceRechazar}

- EYS Inversiones`;

    const whatsappLink = `https://api.whatsapp.com/send?phone=1809&text=${encodeURIComponent(mensajeWhatsApp)}`;

    console.log(`📧 Notificación: Nueva solicitud de ${solicitud.clienteNombre}`);
    console.log(`📱 WhatsApp Admin: ${whatsappLink}`);

    res.status(201).json({
      success: true,
      data: solicitud,
      notificaciones: {
        whatsapp: whatsappLink,
        enlaceAprobar: enlaceAprobar,
        enlaceRechazar: enlaceRechazar
      },
      message: 'Solicitud enviada exitosamente'
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/solicitudes/:id/aprobar - Aprobar solicitud (MEJORADO)
router.put('/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobadoPor, observaciones, montoAprobado, interesPercent, frecuencia } = req.body;

    const solicitudRef = db.collection('solicitudes').doc(id);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada'
      });
    }

    const solicitudData = solicitudDoc.data();
    const solicitud = new Solicitud(solicitudData);

    if (!solicitud.puedeSerAprobada()) {
      return res.status(400).json({
        success: false,
        error: 'La solicitud no puede ser aprobada en su estado actual'
      });
    }

    // Crear el cliente si no existe
    let clienteID = solicitudData.clienteID;
    if (!clienteID) {
      const clienteRef = db.collection('clientes').doc();
      clienteID = clienteRef.id;
      
      const clienteData = {
        id: clienteID,
        nombre: solicitudData.clienteNombre,
        cedula: solicitudData.cedula || '',
        edad: solicitudData.edad || 0,
        celular: solicitudData.telefono,
        email: solicitudData.email || '',
        trabajo: solicitudData.lugarTrabajo,
        puesto: solicitudData.puestoCliente || '',
        sueldo: solicitudData.sueldoCliente || 0,
        direccion: solicitudData.direccion || '',
        sector: solicitudData.sector || '',
        provincia: solicitudData.provincia || '',
        pais: 'República Dominicana',
        activo: true,
        fechaCreacion: new Date()
      };

      await clienteRef.set(clienteData);
      console.log(`✅ Cliente creado: ${clienteData.nombre}`);
    }

    // Crear el préstamo SIN PLAZO FIJO (como lo manejas)
    const prestamoRef = db.collection('prestamos').doc();
    const montoFinal = montoAprobado || solicitudData.montoSolicitado;
    const interesFinal = interesPercent || 10;
    const frecuenciaFinal = frecuencia || solicitudData.frecuencia || 'quincenal';
    
    const prestamoData = {
      id: prestamoRef.id,
      clienteID: clienteID,
      clienteNombre: solicitudData.clienteNombre,
      montoPrestado: montoFinal,
      capitalRestante: montoFinal,
      interesPercent: interesFinal,
      frecuencia: frecuenciaFinal,
      fechaPrestamo: new Date(),
      estado: 'activo',
      fechaProximoPago: calcularFechaProximoPago(frecuenciaFinal),
      fechaUltimoPago: null,
      solicitudID: id,
      // Campos adicionales del cliente
      telefonoCliente: solicitudData.telefono,
      direccionCliente: solicitudData.direccion,
      lugarTrabajo: solicitudData.lugarTrabajo,
      puestoCliente: solicitudData.puestoCliente,
      bancoCliente: solicitudData.bancoCliente,
      cuentaCliente: solicitudData.cuentaCliente,
      tipoCuenta: solicitudData.tipoCuenta
    };

    await prestamoRef.set(prestamoData);

    // Actualizar la solicitud
    const actualizaciones = {
      estado: 'aprobada',
      aprobadoPor: aprobadoPor,
      fechaDecision: new Date(),
      observaciones: observaciones || '',
      montoAprobado: montoFinal,
      interesPercent: interesFinal,
      frecuencia: frecuenciaFinal,
      clienteID: clienteID,
      prestamoID: prestamoRef.id
    };

    await solicitudRef.update(actualizaciones);

    // Generar notificación de aprobación para informar al cliente
    const pagoEstimado = (montoFinal * interesFinal) / 100;
    const mensajeCliente = `✅ SOLICITUD APROBADA - EYS INVERSIONES

¡Felicidades Sr(a) ${solicitudData.clienteNombre}!

Su solicitud de préstamo ha sido APROBADA:

💰 Monto Aprobado: RD$ ${montoFinal?.toLocaleString()}
📈 Tasa de Interés: ${interesFinal}%
🔄 Frecuencia de Pago: ${frecuenciaFinal}

📋 Detalles del préstamo:
• Capital Inicial: RD$ ${montoFinal?.toLocaleString()}
• Interés por periodo: RD$ ${pagoEstimado?.toLocaleString()}
• Próximo pago: ${calcularFechaProximoPago(frecuenciaFinal).toLocaleDateString()}

💡 Recuerde: Cada pago cubre primero los intereses y luego reduce el capital.

📞 Para más información, contáctenos.

- EYS Inversiones - Confianza y Servicio`;

    const whatsappCliente = `https://wa.me/1${solicitudData.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensajeCliente)}`;

    console.log(`✅ Solicitud aprobada: ${solicitudData.clienteNombre}`);
    console.log(`📱 WhatsApp Cliente: ${whatsappCliente}`);
    console.log(`💰 Préstamo creado: ${prestamoRef.id}`);

    res.json({
      success: true,
      data: { 
        id, 
        ...actualizaciones,
        prestamoID: prestamoRef.id,
        clienteID: clienteID
      },
      notificaciones: {
        whatsappCliente: whatsappCliente,
        mensaje: 'Solicitud aprobada y préstamo creado exitosamente'
      },
      message: 'Solicitud aprobada y préstamo creado exitosamente'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/solicitudes/:id/rechazar - Rechazar solicitud (MEJORADO)
router.put('/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobadoPor, observaciones } = req.body;

    const solicitudRef = db.collection('solicitudes').doc(id);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada'
      });
    }

    const solicitudData = solicitudDoc.data();

    if (!observaciones) {
      return res.status(400).json({
        success: false,
        error: 'El motivo del rechazo es requerido'
      });
    }

    const actualizaciones = {
      estado: 'rechazada',
      aprobadoPor: aprobadoPor,
      fechaDecision: new Date(),
      observaciones: observaciones
    };

    await solicitudRef.update(actualizaciones);

    // Generar notificación de rechazo para informar al cliente
    const mensajeCliente = `❌ SOLICITUD RECHAZADA - EYS INVERSIONES

Sr(a) ${solicitudData.clienteNombre},

Lamentamos informarle que su solicitud de préstamo por RD$ ${solicitudData.montoSolicitado?.toLocaleString()} ha sido rechazada.

📝 Motivo: ${observaciones}

📅 Fecha: ${new Date().toLocaleDateString()}

Agradecemos su interés en nuestros servicios. Puede volver a solicitar en el futuro.

- EYS Inversiones`;

    const whatsappCliente = `https://wa.me/1${solicitudData.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensajeCliente)}`;

    console.log(`❌ Solicitud rechazada: ${solicitudData.clienteNombre}`);
    console.log(`📱 WhatsApp Cliente: ${whatsappCliente}`);

    res.json({
      success: true,
      data: { id, ...actualizaciones },
      notificaciones: {
        whatsappCliente: whatsappCliente,
        mensaje: 'Solicitud rechazada exitosamente'
      },
      message: 'Solicitud rechazada'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/solicitudes/estadisticas/avanzadas - Estadísticas avanzadas
router.get('/estadisticas/avanzadas', async (req, res) => {
  try {
    const solicitudesSnapshot = await db.collection('solicitudes').get();
    
    const solicitudes = [];
    solicitudesSnapshot.forEach(doc => {
      solicitudes.push(doc.data());
    });

    const estadisticas = {
      total: solicitudes.length,
      porEstado: {
        pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
        aprobadas: solicitudes.filter(s => s.estado === 'aprobada').length,
        rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length
      },
      montoTotalSolicitado: solicitudes.reduce((sum, s) => sum + (s.montoSolicitado || 0), 0),
      montoTotalAprobado: solicitudes
        .filter(s => s.estado === 'aprobada')
        .reduce((sum, s) => sum + (s.montoAprobado || s.montoSolicitado || 0), 0),
      scorePromedio: solicitudes.length > 0 
        ? solicitudes.reduce((sum, s) => sum + (s.scoreAnalisis || 50), 0) / solicitudes.length 
        : 0,
      porFrecuencia: {
        diario: solicitudes.filter(s => s.frecuencia === 'diario').length,
        semanal: solicitudes.filter(s => s.frecuencia === 'semanal').length,
        quincenal: solicitudes.filter(s => s.frecuencia === 'quincenal').length,
        mensual: solicitudes.filter(s => s.frecuencia === 'mensual').length
      }
    };

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Función para calcular score de la solicitud (MEJORADA)
async function calcularScoreSolicitud(solicitud) {
  let score = 50; // Puntuación base

  // Análisis de monto solicitado vs sueldo (más flexible)
  if (solicitud.sueldoCliente && solicitud.montoSolicitado) {
    const ratio = solicitud.montoSolicitado / solicitud.sueldoCliente;
    if (ratio <= 1) score += 20;
    else if (ratio <= 2) score += 10;
    else if (ratio <= 3) score += 5;
    // No penalizamos ratios altos - el admin decide
  }

  // Análisis de frecuencia de pago
  if (solicitud.frecuencia === 'quincenal') score += 10;
  else if (solicitud.frecuencia === 'mensual') score += 5;
  else if (solicitud.frecuencia === 'semanal') score += 3;
  else if (solicitud.frecuencia === 'diario') score += 1;

  // Análisis de información proporcionada (más flexible)
  if (solicitud.lugarTrabajo && solicitud.lugarTrabajo.length > 3) score += 10;
  if (solicitud.puestoCliente && solicitud.puestoCliente.length > 2) score += 5;
  if (solicitud.cuentaCliente) score += 5;
  if (solicitud.bancoCliente) score += 5;
  if (solicitud.direccion && solicitud.direccion.length > 5) score += 5;
  if (solicitud.documentosUrl && solicitud.documentosUrl.length > 0) score += 10;

  // Bonus por información bancaria completa
  if (solicitud.bancoCliente && solicitud.cuentaCliente && solicitud.tipoCuenta) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

// Función para calcular fecha de próximo pago
function calcularFechaProximoPago(frecuencia) {
  const fecha = new Date();
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
      fecha.setDate(fecha.getDate() + 15); // Default quincenal
  }
  return fecha;
}

module.exports = router;