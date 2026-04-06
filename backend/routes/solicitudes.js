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

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Calcular la primera fecha de pago para un préstamo
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

// GET /api/solicitudes/bancos - Obtener lista de bancos
router.get('/bancos', (req, res) => {
  res.json({
    success: true,
    data: BANCOS_DOMINICANOS
  });
});

// GET /api/solicitudes - Listar solicitudes
router.get('/', async (req, res) => {
  try {
    const { estado, empleadoID, fechaDesde, fechaHasta, montoMin, montoMax } = req.query;
    let query = db.collection('solicitudes');

    if (estado && estado !== 'todos') {
      query = query.where('estado', '==', estado);
    }
    if (empleadoID) {
      query = query.where('empleadoID', '==', empleadoID);
    }

    query = query.orderBy('fechaSolicitud', 'desc');

    const solicitudesSnapshot = await query.get();
    
    const solicitudes = [];
    solicitudesSnapshot.forEach(doc => {
      solicitudes.push({ id: doc.id, ...doc.data() });
    });

    let filtradas = solicitudes;
    
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      filtradas = filtradas.filter(s => new Date(s.fechaSolicitud) >= desde);
    }
    
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      filtradas = filtradas.filter(s => new Date(s.fechaSolicitud) <= hasta);
    }
    
    if (montoMin) {
      filtradas = filtradas.filter(s => s.montoSolicitado >= parseFloat(montoMin));
    }
    
    if (montoMax) {
      filtradas = filtradas.filter(s => s.montoSolicitado <= parseFloat(montoMax));
    }

    res.json({
      success: true,
      data: filtradas,
      count: filtradas.length
    });
  } catch (error) {
    console.error('Error fetching solicitudes:', error);
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
    console.error('Error fetching solicitud:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/solicitudes/:id - Actualizar solicitud
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const solicitudRef = db.collection('solicitudes').doc(id);
    const solicitudDoc = await solicitudRef.get();
    
    if (!solicitudDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada'
      });
    }
    
    const solicitudActual = solicitudDoc.data();
    
    if (solicitudActual.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        error: 'No se puede editar una solicitud que ya ha sido procesada'
      });
    }
    
    updateData.fechaActualizacion = new Date().toISOString();
    
    if (updateData.montoSolicitado || updateData.sueldoCliente || updateData.lugarTrabajo || updateData.puestoCliente) {
      const solicitudActualizada = { ...solicitudActual, ...updateData };
      updateData.scoreAnalisis = await calcularScoreSolicitud(solicitudActualizada);
    }
    
    await solicitudRef.update(updateData);
    
    const updatedDoc = await solicitudRef.get();
    
    res.json({
      success: true,
      message: 'Solicitud actualizada correctamente',
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('Error updating solicitud:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/solicitudes - Crear nueva solicitud
router.post('/', async (req, res) => {
  try {
    const solicitudData = req.body;
    const solicitud = new Solicitud(solicitudData);
    
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

    const docRef = db.collection('solicitudes').doc();
    solicitud.id = docRef.id;
    solicitud.fechaSolicitud = new Date();
    solicitud.estado = 'pendiente';
    solicitud.scoreAnalisis = await calcularScoreSolicitud(solicitud);

    await docRef.set({ ...solicitud });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const enlaceSolicitud = `${baseUrl}/solicitudes/${solicitud.id}`;

    const mensajeWhatsApp = `📋 NUEVA SOLICITUD DE PRÉSTAMO

👤 Cliente: ${solicitud.clienteNombre}
📞 Teléfono: ${solicitud.telefono}
🆔 Cédula: ${solicitud.cedula || 'No especificada'}
💰 Monto: RD$ ${solicitud.montoSolicitado?.toLocaleString()}
📅 Plazo: ${solicitud.plazoMeses === 0 ? 'Sin plazo fijo' : `${solicitud.plazoMeses} meses`}
🔄 Frecuencia: ${solicitud.frecuencia}
🏢 Trabajo: ${solicitud.lugarTrabajo}
💼 Puesto: ${solicitud.puestoCliente || 'No especificado'}
💵 Sueldo: RD$ ${solicitud.sueldoCliente?.toLocaleString() || 'No especificado'}
📊 Score: ${solicitud.scoreAnalisis}/100
📅 Fecha de Ingreso: ${solicitud.fechaIngreso ? new Date(solicitud.fechaIngreso).toLocaleDateString() : 'No especificada'}

🔗 Ver solicitud: ${enlaceSolicitud}

- EYS Inversiones`;

    const whatsappLink = `https://api.whatsapp.com/send?phone=18294470640&text=${encodeURIComponent(mensajeWhatsApp)}`;

    console.log(`📧 Notificación: Nueva solicitud de ${solicitud.clienteNombre}`);
    console.log(`📱 WhatsApp Admin: ${whatsappLink}`);
    console.log(`✅ Solicitud creada con ID: ${solicitud.id}`);

    res.status(201).json({
      success: true,
      data: solicitud,
      notificaciones: {
        whatsapp: whatsappLink,
        enlaceSolicitud: enlaceSolicitud
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

// PUT /api/solicitudes/:id/aprobar - Aprobar solicitud y crear préstamo (MODIFICADO CON COMISIONES)
router.put('/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      aprobadoPor, 
      observaciones, 
      montoAprobado, 
      interesPercent, 
      frecuencia,
      // NUEVOS CAMPOS DE COMISIÓN
      generarComision,
      garanteID,
      garanteNombre,
      porcentajeComision
    } = req.body;

    console.log('🚀 [BACKEND] /aprobar llamado');
    console.log('📋 ID Solicitud:', id);
    console.log('📝 Datos recibidos:', { 
      montoAprobado, 
      interesPercent, 
      frecuencia, 
      aprobadoPor,
      generarComision,
      garanteID,
      porcentajeComision 
    });

    const solicitudRef = db.collection('solicitudes').doc(id);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) {
      console.log('❌ Solicitud no encontrada');
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada'
      });
    }

    const solicitudData = solicitudDoc.data();
    console.log('📄 Datos de la solicitud:', {
      id: solicitudData.id,
      cliente: solicitudData.clienteNombre,
      estado: solicitudData.estado,
      montoSolicitado: solicitudData.montoSolicitado
    });

    if (solicitudData.estado !== 'pendiente' && solicitudData.estado !== 'aprobado_cliente') {
      console.log('❌ Estado incorrecto para aprobar:', solicitudData.estado);
      return res.status(400).json({
        success: false,
        error: 'La solicitud no puede ser aprobada en su estado actual'
      });
    }

    // Crear el cliente si no existe
    let clienteID = solicitudData.clienteID;
    if (!clienteID) {
      console.log('🏢 Creando nuevo cliente...');
      const clienteRef = db.collection('clientes').doc();
      clienteID = clienteRef.id;
      
      const clienteData = {
        id: clienteID,
        nombre: solicitudData.clienteNombre,
        cedula: solicitudData.cedula || '',
        telefono: solicitudData.telefono,
        email: solicitudData.email || '',
        trabajo: solicitudData.lugarTrabajo,
        puesto: solicitudData.puestoCliente || '',
        sueldo: solicitudData.sueldoCliente || 0,
        direccion: solicitudData.direccion || '',
        provincia: solicitudData.provincia || '',
        fechaIngreso: solicitudData.fechaIngreso || null,
        activo: true,
        fechaCreacion: new Date()
      };

      await clienteRef.set(clienteData);
      console.log(`✅ Cliente creado con ID: ${clienteID}`);
    } else {
      console.log(`✅ Cliente existente con ID: ${clienteID}`);
    }

    // Crear el préstamo con la fecha correcta
    console.log('💰 Creando préstamo...');
    const prestamoRef = db.collection('prestamos').doc();
    const montoFinal = parseFloat(montoAprobado) || parseFloat(solicitudData.montoSolicitado);
    const interesFinal = parseFloat(interesPercent) || 10;
    const frecuenciaFinal = frecuencia || solicitudData.frecuencia || 'quincenal';
    const fechaPrestamo = new Date();
    
    // Calcular la primera fecha de pago usando la función correcta
    const primeraFechaPago = calcularPrimeraFechaPago(fechaPrestamo, frecuenciaFinal, {});
    
    console.log('📊 Datos del préstamo a crear:');
    console.log('  - Monto:', montoFinal);
    console.log('  - Interés:', interesFinal);
    console.log('  - Frecuencia:', frecuenciaFinal);
    console.log('  - Fecha préstamo:', fechaPrestamo.toLocaleDateString());
    console.log('  - Primera fecha pago:', primeraFechaPago.toLocaleDateString());
    console.log('  - Generar comisión:', generarComision);
    console.log('  - Garante ID:', garanteID);
    console.log('  - Porcentaje comisión:', porcentajeComision);
    
    const prestamoData = {
      id: prestamoRef.id,
      clienteID: clienteID,
      clienteNombre: solicitudData.clienteNombre,
      montoPrestado: montoFinal,
      capitalRestante: montoFinal,
      interesPercent: interesFinal,
      frecuencia: frecuenciaFinal,
      fechaPrestamo: fechaPrestamo,
      estado: 'activo',
      fechaProximoPago: primeraFechaPago,
      fechaUltimoPago: null,
      solicitudID: id,
      telefonoCliente: solicitudData.telefono,
      direccionCliente: solicitudData.direccion,
      lugarTrabajo: solicitudData.lugarTrabajo,
      puestoCliente: solicitudData.puestoCliente,
      bancoCliente: solicitudData.bancoCliente,
      cuentaCliente: solicitudData.cuentaCliente,
      tipoCuenta: solicitudData.tipoCuenta,
      historialPagos: [],
      fechaActualizacion: new Date(),
      // NUEVOS CAMPOS DE COMISIÓN
      generarComision: generarComision || false,
      garanteID: garanteID || null,
      garanteNombre: garanteNombre || null,
      porcentajeComision: porcentajeComision || 50
    };

    await prestamoRef.set(prestamoData);
    console.log(`✅ Préstamo creado con ID: ${prestamoRef.id}`);

    // Actualizar la solicitud
    console.log('🔄 Actualizando solicitud...');
    const actualizaciones = {
      estado: 'aprobada',
      aprobadoPor: aprobadoPor || 'admin',
      fechaDecision: new Date(),
      observaciones: observaciones || '',
      montoAprobado: montoFinal,
      interesAprobado: interesFinal,
      frecuenciaAprobada: frecuenciaFinal,
      clienteID: clienteID,
      prestamoId: prestamoRef.id
    };

    await solicitudRef.update(actualizaciones);
    console.log('✅ Solicitud actualizada');

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
• Próximo pago: ${primeraFechaPago.toLocaleDateString()}

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
        prestamoId: prestamoRef.id,
        clienteID: clienteID
      },
      notificaciones: {
        whatsappCliente: whatsappCliente,
        mensaje: 'Solicitud aprobada y préstamo creado exitosamente'
      },
      message: 'Solicitud aprobada y préstamo creado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error approving solicitud:', error);
    console.error('Stack trace:', error.stack);
    res.status(400).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// PUT /api/solicitudes/:id/rechazar - Rechazar solicitud
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
      aprobadoPor: aprobadoPor || 'admin',
      fechaDecision: new Date(),
      observaciones: observaciones
    };

    await solicitudRef.update(actualizaciones);

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
    console.error('Error rejecting solicitud:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/solicitudes/:id - Eliminar solicitud
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const solicitudRef = db.collection('solicitudes').doc(id);
    const solicitudDoc = await solicitudRef.get();
    
    if (!solicitudDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada'
      });
    }
    
    const solicitudData = solicitudDoc.data();
    
    if (solicitudData.estado === 'aprobada') {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar una solicitud que ya ha sido aprobada'
      });
    }
    
    await solicitudRef.delete();
    
    res.json({
      success: true,
      message: 'Solicitud eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting solicitud:', error);
    res.status(500).json({
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
        rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
        aprobado_cliente: solicitudes.filter(s => s.estado === 'aprobado_cliente').length
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
      },
      porGarantia: {
        hipotecaria: solicitudes.filter(s => s.garantia === 'hipotecaria').length,
        prendaria: solicitudes.filter(s => s.garantia === 'prendaria').length,
        fiduciaria: solicitudes.filter(s => s.garantia === 'fiduciaria').length,
        personal: solicitudes.filter(s => s.garantia === 'personal').length,
        ninguna: solicitudes.filter(s => !s.garantia || s.garantia === 'ninguna').length
      }
    };

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error fetching advanced stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Función para calcular score de la solicitud
async function calcularScoreSolicitud(solicitud) {
  let score = 0;
  
  const monto = Number(solicitud.montoSolicitado) || 0;
  const sueldo = Number(solicitud.sueldoCliente) || 0;
  const ratio = sueldo > 0 ? monto / sueldo : Infinity;
  
  if (ratio <= 0.3) score += 40;
  else if (ratio <= 0.5) score += 30;
  else if (ratio <= 0.7) score += 20;
  else if (ratio <= 1) score += 10;

  if (solicitud.lugarTrabajo && solicitud.puestoCliente) score += 15;
  else if (solicitud.lugarTrabajo) score += 10;

  if (solicitud.bancoCliente && solicitud.cuentaCliente && solicitud.tipoCuenta) score += 15;
  else if (solicitud.bancoCliente) score += 10;

  const garantias = { 'hipotecaria': 15, 'prendaria': 12, 'fiduciaria': 10, 'personal': 8, 'ninguna': 5 };
  score += garantias[solicitud.garantia?.toLowerCase()] || 5;

  const plazo = Number(solicitud.plazoMeses) || 0;
  if (plazo === 0 || plazo <= 12) score += 15;
  else if (plazo <= 24) score += 10;
  else score += 5;

  if (solicitud.fechaIngreso) {
    const fechaIngreso = new Date(solicitud.fechaIngreso);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - fechaIngreso);
    const anosAntiguedad = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    if (anosAntiguedad >= 3) score += 5;
    else if (anosAntiguedad >= 1) score += 3;
    else if (anosAntiguedad > 0) score += 1;
  }

  if (solicitud.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(solicitud.email)) score += 2;
  if (solicitud.direccion && solicitud.direccion.length > 5) score += 2;
  if (solicitud.provincia) score += 1;

  return Math.min(100, Math.max(0, score));
}

module.exports = router;