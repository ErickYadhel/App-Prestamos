const express = require('express');
const admin = require('firebase-admin');
const Solicitud = require('../models/Solicitud');
const Prestamo = require('../models/Prestamo');
const Cliente = require('../models/Cliente');
const router = express.Router();
const { notificarNuevaSolicitud, notificarSolicitudAprobada, notificarSolicitudRechazada } = require('../services/notificationService');

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
// 🔥 FUNCIÓN PARA GENERAR ID PERSONALIZADO DE CLIENTE
// Formato: "JuanPerez" (sin espacios, sin acentos)
// ============================================
function generarIdCliente(clienteNombre) {
  const nombreLimpio = clienteNombre
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z]/g, '');
  
  // Capitalizar primera letra
  const idGenerado = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1);
  
  console.log('🔑 ID de cliente generado:', idGenerado);
  return idGenerado;
}

// ============================================
// 🔥 FUNCIÓN PARA GENERAR ID PERSONALIZADO DE SOLICITUD
// ============================================
function generarIdSolicitud(clienteNombre, fechaSolicitud) {
  const nombreLimpio = clienteNombre
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
  
  let fecha;
  if (fechaSolicitud instanceof Date) {
    fecha = fechaSolicitud;
  } else if (typeof fechaSolicitud === 'string') {
    fecha = new Date(fechaSolicitud);
  } else {
    fecha = new Date();
  }
  
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const año = fecha.getFullYear().toString().slice(-2);
  
  const fechaFormateada = `${dia}-${mes}-${año}`;
  
  let idGenerado = `${nombreLimpio}${fechaFormateada}`;
  
  if (idGenerado.length > 100) {
    idGenerado = idGenerado.substring(0, 100);
  }
  
  console.log('🔑 ID de solicitud generado:', idGenerado);
  return idGenerado;
}

// ============================================
// 🔥 FUNCIÓN PARA GENERAR ID PERSONALIZADO DE PRÉSTAMO
// ============================================
function generarIdPrestamo(clienteNombre, fechaPrestamo) {
  const nombreLimpio = clienteNombre
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
  
  let fecha;
  if (fechaPrestamo instanceof Date) {
    fecha = fechaPrestamo;
  } else if (typeof fechaPrestamo === 'string') {
    fecha = new Date(fechaPrestamo);
  } else {
    fecha = new Date();
  }
  
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const año = fecha.getFullYear().toString().slice(-2);
  
  const fechaFormateada = `${dia}-${mes}-${año}`;
  
  let idGenerado = `${nombreLimpio}${fechaFormateada}`;
  
  if (idGenerado.length > 100) {
    idGenerado = idGenerado.substring(0, 100);
  }
  
  console.log('🔑 ID de préstamo generado:', idGenerado);
  return idGenerado;
}

// ============================================
// 🔥 FUNCIÓN PARA CONVERTIR FECHA A STRING DD-MM-YYYY
// ============================================
function fechaToLocalString(fecha) {
  if (!fecha) return null;
  
  let dateObj;
  if (fecha instanceof Date) {
    dateObj = fecha;
  } else if (typeof fecha === 'string') {
    if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
      return fecha;
    }
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
// 🔥 FUNCIÓN PARA CALCULAR PRIMERA FECHA DE PAGO (retorna string DD-MM-YYYY)
// ============================================
function calcularPrimeraFechaPagoString(fechaPrestamoStr, frecuencia, config = {}) {
  let fecha;
  if (typeof fechaPrestamoStr === 'string' && fechaPrestamoStr.includes('-')) {
    const parts = fechaPrestamoStr.split('-');
    if (parts[0].length === 4) {
      fecha = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      fecha = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
  } else {
    fecha = new Date(fechaPrestamoStr);
  }
  
  const dia = fecha.getDate();
  const mes = fecha.getMonth();
  const año = fecha.getFullYear();
  
  let nuevaFecha;
  
  switch (frecuencia) {
    case 'diario':
      nuevaFecha = new Date(fecha);
      nuevaFecha.setDate(dia + 1);
      break;
    case 'semanal':
      nuevaFecha = new Date(fecha);
      nuevaFecha.setDate(dia + 7);
      break;
    case 'quincenal':
      if (dia < 15) {
        nuevaFecha = new Date(año, mes, 15);
      } else if (dia >= 15 && dia < 30) {
        nuevaFecha = new Date(año, mes, 30);
      } else {
        nuevaFecha = new Date(año, mes + 1, 15);
      }
      break;
    case 'mensual':
      let diaPago = config.diaPagoPersonalizado || dia;
      let mesNuevo = mes + 1;
      let añoNuevo = año;
      if (mesNuevo > 11) {
        mesNuevo = 0;
        añoNuevo++;
      }
      nuevaFecha = new Date(añoNuevo, mesNuevo, diaPago);
      if (nuevaFecha.getMonth() !== mesNuevo % 12) {
        nuevaFecha = new Date(añoNuevo, mesNuevo + 1, 0);
      }
      break;
    default:
      nuevaFecha = new Date(fecha);
      nuevaFecha.setDate(dia + 30);
  }
  
  const day = String(nuevaFecha.getDate()).padStart(2, '0');
  const month = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
  const year = nuevaFecha.getFullYear();
  
  return `${day}-${month}-${year}`;
}

// ============================================
// FUNCIÓN PARA CALCULAR SCORE
// ============================================
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

// ============================================
// GET /api/solicitudes/bancos - Obtener lista de bancos
// ============================================
router.get('/bancos', (req, res) => {
  res.json({
    success: true,
    data: BANCOS_DOMINICANOS
  });
});

// ============================================
// GET /api/solicitudes - Listar solicitudes
// ============================================
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

// ============================================
// GET /api/solicitudes/:id - Obtener solicitud específica
// ============================================
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

// ============================================
// PUT /api/solicitudes/:id - Actualizar solicitud
// ============================================
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

// ============================================
// POST /api/solicitudes - Crear nueva solicitud (CON ID PERSONALIZADO)
// ============================================
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

    // Generar ID personalizado para la solicitud
    const idPersonalizado = generarIdSolicitud(solicitud.clienteNombre, new Date());
    const docRef = db.collection('solicitudes').doc(idPersonalizado);
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

    const clienteParaNotificacion = { id: null, nombre: solicitud.clienteNombre };
    await notificarNuevaSolicitud(solicitud, clienteParaNotificacion);

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

// ============================================
// PUT /api/solicitudes/:id/aprobar - Aprobar solicitud y crear préstamo (CON ID CLIENTE PERSONALIZADO)
// ============================================
router.put('/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      aprobadoPor, 
      observaciones, 
      montoAprobado, 
      interesPercent, 
      frecuencia,
      generarComision,
      garanteID,
      garanteNombre,
      porcentajeComision
    } = req.body;

    console.log('🚀 [BACKEND] /aprobar llamado');
    console.log('📋 ID Solicitud:', id);

    const solicitudRef = db.collection('solicitudes').doc(id);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada'
      });
    }

    const solicitudData = solicitudDoc.data();

    if (solicitudData.estado !== 'pendiente' && solicitudData.estado !== 'aprobado_cliente') {
      return res.status(400).json({
        success: false,
        error: 'La solicitud no puede ser aprobada en su estado actual'
      });
    }

    // ============================================
    // 🔥 CREAR O ACTUALIZAR CLIENTE CON ID PERSONALIZADO (BASADO EN NOMBRE)
    // ============================================
    let clienteID = solicitudData.clienteID;
    
    if (!clienteID) {
      // Generar ID personalizado para el cliente (ej: "JuanPerez")
      const idClientePersonalizado = generarIdCliente(solicitudData.clienteNombre);
      const clienteRef = db.collection('clientes').doc(idClientePersonalizado);
      clienteID = idClientePersonalizado;
      
      const clienteData = {
        id: clienteID,
        nombre: solicitudData.clienteNombre,
        cedula: solicitudData.cedula || '',
        telefono: solicitudData.telefono || '',
        celular: solicitudData.telefono || '',
        telefono2: solicitudData.telefono2 || '',
        email: solicitudData.email || '',
        direccion: solicitudData.direccion || '',
        provincia: solicitudData.provincia || '',
        trabajo: solicitudData.lugarTrabajo || '',
        puesto: solicitudData.puestoCliente || '',
        sueldo: solicitudData.sueldoCliente || 0,
        fechaIngreso: solicitudData.fechaIngreso || null,
        referenciaNombre: solicitudData.referenciaNombre || '',
        referenciaTelefono: solicitudData.referenciaTelefono || '',
        activo: true,
        fechaCreacion: new Date(),
        lugarTrabajo: solicitudData.lugarTrabajo || '',
        puestoCliente: solicitudData.puestoCliente || '',
        sueldoCliente: solicitudData.sueldoCliente || 0,
        bancoCliente: solicitudData.bancoCliente || '',
        cuentaCliente: solicitudData.cuentaCliente || '',
        tipoCuenta: solicitudData.tipoCuenta || 'ahorro'
      };

      await clienteRef.set(clienteData);
      console.log(`✅ Cliente creado con ID personalizado: ${clienteID}`);
      console.log(`   - Nombre: ${clienteData.nombre}`);
      console.log(`   - Teléfono: ${clienteData.telefono}`);
      console.log(`   - Cédula: ${clienteData.cedula}`);
      console.log(`   - Email: ${clienteData.email}`);
      console.log(`   - Dirección: ${clienteData.direccion}`);
    } else {
      // Verificar si el cliente existente tiene un ID automático, si es así, migrar a ID personalizado
      const clienteExistenteRef = db.collection('clientes').doc(clienteID);
      const clienteExistenteDoc = await clienteExistenteRef.get();
      
      if (clienteExistenteDoc.exists) {
        // Si el ID es automático (ej: contiene caracteres aleatorios), migrar a ID personalizado
        const idPersonalizadoCliente = generarIdCliente(solicitudData.clienteNombre);
        
        // Verificar si ya existe un cliente con el ID personalizado
        const clientePersonalizadoRef = db.collection('clientes').doc(idPersonalizadoCliente);
        const clientePersonalizadoDoc = await clientePersonalizadoRef.get();
        
        if (!clientePersonalizadoDoc.exists) {
          // Migrar datos al nuevo ID personalizado
          const clienteData = clienteExistenteDoc.data();
          await clientePersonalizadoRef.set({ ...clienteData, id: idPersonalizadoCliente });
          
          // Actualizar solicitud con el nuevo clienteID
          await solicitudRef.update({ clienteID: idPersonalizadoCliente });
          clienteID = idPersonalizadoCliente;
          
          // Opcional: eliminar el documento antiguo
          // await clienteExistenteRef.delete();
          
          console.log(`✅ Cliente migrado a ID personalizado: ${clienteID}`);
        } else {
          // Ya existe un cliente con ID personalizado, usar ese
          clienteID = idPersonalizadoCliente;
          await solicitudRef.update({ clienteID: clienteID });
          console.log(`✅ Usando cliente existente con ID personalizado: ${clienteID}`);
        }
      } else {
        console.log(`✅ Cliente existente con ID: ${clienteID}`);
      }
    }

    // ============================================
    // CREAR PRÉSTAMO CON ID PERSONALIZADO, CÉDULA Y TELÉFONO
    // ============================================
    const hoy = new Date();
    const hoyDay = String(hoy.getDate()).padStart(2, '0');
    const hoyMonth = String(hoy.getMonth() + 1).padStart(2, '0');
    const hoyYear = hoy.getFullYear();
    const fechaPrestamoStr = `${hoyDay}-${hoyMonth}-${hoyYear}`;
    
    const montoFinal = parseFloat(montoAprobado) || parseFloat(solicitudData.montoSolicitado);
    const interesFinal = parseFloat(interesPercent) || 10;
    const frecuenciaFinal = frecuencia || solicitudData.frecuencia || 'quincenal';
    
    const primeraFechaPagoStr = calcularPrimeraFechaPagoString(fechaPrestamoStr, frecuenciaFinal, {});
    const idPrestamoPersonalizado = generarIdPrestamo(solicitudData.clienteNombre, hoy);
    
    const prestamoRef = db.collection('prestamos').doc(idPrestamoPersonalizado);
    
    console.log('📊 Datos del préstamo a crear:');
    console.log('  - ID Personalizado:', idPrestamoPersonalizado);
    console.log('  - Monto:', montoFinal);
    console.log('  - Interés:', interesFinal);
    console.log('  - Frecuencia:', frecuenciaFinal);
    console.log('  - Fecha préstamo:', fechaPrestamoStr);
    console.log('  - Primera fecha pago:', primeraFechaPagoStr);
    console.log('  - Cédula cliente:', solicitudData.cedula);
    console.log('  - Teléfono cliente:', solicitudData.telefono);
    console.log('  - ID Cliente personalizado:', clienteID);
    console.log('  - Generar comisión:', generarComision);
    
    const prestamoData = {
      id: idPrestamoPersonalizado,
      clienteID: clienteID,
      clienteNombre: solicitudData.clienteNombre,
      cedula: solicitudData.cedula || '',
      telefonoCliente: solicitudData.telefono || '',
      montoPrestado: montoFinal,
      capitalRestante: montoFinal,
      interesPercent: interesFinal,
      frecuencia: frecuenciaFinal,
      fechaPrestamo: fechaPrestamoStr,
      estado: 'activo',
      fechaProximoPago: primeraFechaPagoStr,
      fechaUltimoPago: null,
      solicitudID: id,
      direccionCliente: solicitudData.direccion || '',
      lugarTrabajo: solicitudData.lugarTrabajo || '',
      puestoCliente: solicitudData.puestoCliente || '',
      bancoCliente: solicitudData.bancoCliente || '',
      cuentaCliente: solicitudData.cuentaCliente || '',
      tipoCuenta: solicitudData.tipoCuenta || 'ahorro',
      historialPagos: [],
      fechaActualizacion: new Date(),
      generarComision: generarComision || false,
      garanteID: garanteID || null,
      garanteNombre: garanteNombre || null,
      porcentajeComision: porcentajeComision || 50
    };

    await prestamoRef.set(prestamoData);
    console.log(`✅ Préstamo creado con ID: ${idPrestamoPersonalizado}`);

    // Actualizar la solicitud
    const actualizaciones = {
      estado: 'aprobada',
      aprobadoPor: aprobadoPor || 'admin',
      fechaDecision: new Date(),
      observaciones: observaciones || '',
      montoAprobado: montoFinal,
      interesAprobado: interesFinal,
      frecuenciaAprobada: frecuenciaFinal,
      clienteID: clienteID,
      prestamoId: idPrestamoPersonalizado
    };

    await solicitudRef.update(actualizaciones);

    // Generar notificación de aprobación
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
• ID Préstamo: ${idPrestamoPersonalizado}

- EYS Inversiones - Confianza y Servicio`;

    const whatsappCliente = `https://wa.me/1${solicitudData.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(mensajeCliente)}`;

    console.log(`✅ Solicitud aprobada: ${solicitudData.clienteNombre}`);
    console.log(`📱 WhatsApp Cliente: ${whatsappCliente}`);
    console.log(`💰 Préstamo creado: ${idPrestamoPersonalizado}`);
    console.log(`👤 Cliente ID personalizado: ${clienteID}`);

    const clienteParaNotificacion = { id: clienteID, nombre: solicitudData.clienteNombre };
    await notificarSolicitudAprobada(solicitudData, clienteParaNotificacion);

    res.json({
      success: true,
      data: { 
        id, 
        ...actualizaciones,
        prestamoId: idPrestamoPersonalizado,
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

// ============================================
// PUT /api/solicitudes/:id/rechazar - Rechazar solicitud
// ============================================
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

    const clienteParaNotificacion = { id: solicitudData.clienteID, nombre: solicitudData.clienteNombre };
    await notificarSolicitudRechazada(solicitudData, clienteParaNotificacion, observaciones);

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

// ============================================
// DELETE /api/solicitudes/:id - Eliminar solicitud
// ============================================
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

// ============================================
// GET /api/solicitudes/estadisticas/avanzadas - Estadísticas avanzadas
// ============================================
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

module.exports = router;