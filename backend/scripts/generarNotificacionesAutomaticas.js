// E:\prestamos-eys\backend\scripts\generarNotificacionesAutomaticas.js
const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// ============================================
// FUNCIÓN PARA GENERAR ID ÚNICO DE NOTIFICACIÓN
// ============================================
const generarIdNotificacion = () => {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

// ============================================
// FUNCIÓN PRINCIPAL PARA CREAR NOTIFICACIONES
// ============================================
const crearNotificacion = async (tipo, titulo, mensaje, destinatario, clienteID, metadata = {}) => {
  try {
    const notificacion = {
      id: generarIdNotificacion(),
      tipo: tipo,
      titulo: titulo,
      mensaje: mensaje,
      destinatario: destinatario,
      clienteID: clienteID,
      leida: false,
      whatsappEnviado: false,
      enviada: false,
      intentos: 0,
      fechaCreacion: new Date().toISOString(),
      metadata: {
        ...metadata,
        clienteID: clienteID,
        clienteNombre: destinatario
      }
    };
    
    const docRef = db.collection('notificaciones').doc();
    notificacion.id = docRef.id;
    await docRef.set(notificacion);
    
    console.log(`✅ Notificación creada: ${tipo} - ${destinatario}`);
    return notificacion;
  } catch (error) {
    console.error('❌ Error creando notificación:', error);
    return null;
  }
};

// ============================================
// NOTIFICACIÓN DE PRÉSTAMO PRÓXIMO A VENCER
// ============================================
const notificarPrestamoProximoVencer = async (prestamo, cliente, diasRestantes) => {
  const interesPeriodo = (prestamo.capitalRestante * prestamo.interesPercent) / 100;
  
  const titulo = `📅 Préstamo próximo a vencer`;
  const mensaje = `Estimado(a) ${cliente.nombre}, su préstamo de RD$ ${prestamo.capitalRestante.toLocaleString()} vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}. 
  Fecha límite: ${new Date(prestamo.fechaProximoPago).toLocaleDateString()}
  Interés del período: RD$ ${interesPeriodo.toLocaleString()}`;
  
  return await crearNotificacion(
    'pago_proximo',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      prestamoID: prestamo.id,
      capitalRestante: prestamo.capitalRestante,
      interesPeriodo: interesPeriodo,
      fechaProximoPago: prestamo.fechaProximoPago,
      diasRestantes: diasRestantes
    }
  );
};

// ============================================
// NOTIFICACIÓN DE PRÉSTAMO VENCIDO (MORA)
// ============================================
const notificarPrestamoVencido = async (prestamo, cliente, diasVencidos, moraCalculada) => {
  const titulo = `⚠️ Préstamo VENCIDO - Acción requerida`;
  const mensaje = `⚠️ ATENCIÓN: El préstamo de ${cliente.nombre} tiene ${diasVencidos} día${diasVencidos !== 1 ? 's' : ''} de VENCIMIENTO.
  Capital pendiente: RD$ ${prestamo.capitalRestante.toLocaleString()}
  Mora acumulada: RD$ ${moraCalculada.toLocaleString()}
  ¡Regularice su situación lo antes posible!`;
  
  return await crearNotificacion(
    'prestamo_vencido',
    titulo,
    mensaje,
    cliente.nombre,
    cliente.id,
    {
      prestamoID: prestamo.id,
      capitalRestante: prestamo.capitalRestante,
      diasVencidos: diasVencidos,
      moraCalculada: moraCalculada
    }
  );
};

// ============================================
// FUNCIÓN PRINCIPAL PARA GENERAR NOTIFICACIONES MASIVAS
// ============================================
const generarNotificacionesMasivas = async () => {
  console.log('🚀 Iniciando generación de notificaciones automáticas...');
  console.log('=' .repeat(60));
  
  const hoy = new Date();
  const enTresDias = new Date();
  enTresDias.setDate(hoy.getDate() + 3);
  
  console.log(`📅 Fecha actual: ${hoy.toLocaleDateString()}`);
  console.log(`📅 Rango de próxima revisión: hasta ${enTresDias.toLocaleDateString()}`);
  console.log('');
  
  try {
    // Obtener todos los préstamos activos
    const prestamosSnapshot = await db.collection('prestamos')
      .where('estado', '==', 'activo')
      .get();
    
    console.log(`📊 Total de préstamos activos: ${prestamosSnapshot.size}`);
    console.log('');
    
    let notificacionesCreadas = 0;
    let errores = 0;
    
    for (const doc of prestamosSnapshot.docs) {
      const prestamo = doc.data();
      const prestamoId = doc.id;
      
      // Convertir fecha de próximo pago
      let fechaProximoPago;
      if (prestamo.fechaProximoPago?.toDate) {
        fechaProximoPago = prestamo.fechaProximoPago.toDate();
      } else if (prestamo.fechaProximoPago) {
        fechaProximoPago = new Date(prestamo.fechaProximoPago);
      } else {
        console.log(`⚠️ Préstamo ${prestamoId} - Sin fecha de próximo pago, omitido`);
        continue;
      }
      
      // Si el préstamo ya está pagado, omitir
      if (prestamo.capitalRestante <= 0) {
        continue;
      }
      
      // Calcular días restantes para vencimiento
      const diasRestantes = Math.ceil((fechaProximoPago - hoy) / (1000 * 60 * 60 * 24));
      
      // Calcular días vencidos
      const diasVencidos = Math.ceil((hoy - fechaProximoPago) / (1000 * 60 * 60 * 24));
      
      // Obtener datos del cliente
      let cliente = null;
      try {
        const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
        if (clienteDoc.exists()) {
          cliente = { id: clienteDoc.id, ...clienteDoc.data() };
        } else {
          console.log(`⚠️ Préstamo ${prestamoId} - Cliente no encontrado: ${prestamo.clienteID}`);
          continue;
        }
      } catch (err) {
        console.log(`⚠️ Error obteniendo cliente ${prestamo.clienteID}:`, err.message);
        continue;
      }
      
      // ============================================
      // 1. NOTIFICACIONES PARA PRÉSTAMOS PRÓXIMOS A VENCER (3, 2, 1 día antes)
      // ============================================
      if (diasRestantes >= 0 && diasRestantes <= 3 && prestamo.capitalRestante > 0) {
        // Verificar si ya existe notificación reciente para este préstamo
        const notifExistente = await db.collection('notificaciones')
          .where('metadata.prestamoID', '==', prestamoId)
          .where('tipo', '==', 'pago_proximo')
          .where('fechaCreacion', '>=', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
          .get();
        
        if (notifExistente.empty) {
          console.log(`📅 Préstamo próximo a vencer: ${cliente.nombre} - ${diasRestantes} días`);
          await notificarPrestamoProximoVencer(prestamo, cliente, diasRestantes);
          notificacionesCreadas++;
        } else {
          console.log(`⏭️ Ya existe notificación para ${cliente.nombre} - ${diasRestantes} días`);
        }
      }
      
      // ============================================
      // 2. NOTIFICACIONES PARA PRÉSTAMOS VENCIDOS (en mora)
      // ============================================
      if (diasVencidos > 0 && prestamo.capitalRestante > 0) {
        // Verificar si ya existe notificación de vencimiento reciente
        const notifVencidoExistente = await db.collection('notificaciones')
          .where('metadata.prestamoID', '==', prestamoId)
          .where('tipo', '==', 'prestamo_vencido')
          .where('fechaCreacion', '>=', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
          .get();
        
        if (notifVencidoExistente.empty) {
          // Calcular mora
          const interesDiario = (prestamo.capitalRestante * prestamo.interesPercent) / 100 / 30;
          const moraCalculada = interesDiario * diasVencidos * 0.05; // 5% de mora sobre interés diario
          
          console.log(`⚠️ Préstamo VENCIDO: ${cliente.nombre} - ${diasVencidos} días vencido`);
          await notificarPrestamoVencido(prestamo, cliente, diasVencidos, moraCalculada);
          notificacionesCreadas++;
        } else {
          console.log(`⏭️ Ya existe notificación de vencimiento para ${cliente.nombre}`);
        }
      }
    }
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('📊 RESUMEN DE GENERACIÓN DE NOTIFICACIONES');
    console.log('=' .repeat(60));
    console.log(`✅ Notificaciones creadas: ${notificacionesCreadas}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📋 Total préstamos procesados: ${prestamosSnapshot.size}`);
    console.log('=' .repeat(60));
    console.log('🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error generando notificaciones masivas:', error);
    console.error('Stack trace:', error.stack);
  }
  
  process.exit(0);
};

// ============================================
// FUNCIÓN PARA GENERAR NOTIFICACIONES DE COMISIONES PENDIENTES
// ============================================
const generarNotificacionesComisionesPendientes = async () => {
  console.log('💰 Generando notificaciones de comisiones pendientes...');
  
  try {
    const comisionesSnapshot = await db.collection('comisiones')
      .where('estado', '==', 'pendiente')
      .get();
    
    console.log(`📊 Comisiones pendientes: ${comisionesSnapshot.size}`);
    
    let notificacionesCreadas = 0;
    
    for (const doc of comisionesSnapshot.docs) {
      const comision = doc.data();
      
      // Verificar si ya existe notificación para esta comisión
      const notifExistente = await db.collection('notificaciones')
        .where('metadata.comisionID', '==', doc.id)
        .get();
      
      if (notifExistente.empty) {
        // Obtener datos del garante
        let garanteNombre = comision.garanteNombre;
        let garanteTelefono = '';
        
        if (comision.garanteID) {
          try {
            const garanteDoc = await db.collection('garantes').doc(comision.garanteID).get();
            if (garanteDoc.exists()) {
              garanteNombre = garanteDoc.data().nombre || garanteNombre;
              garanteTelefono = garanteDoc.data().celular || '';
            }
          } catch (err) {
            console.log(`⚠️ Error obteniendo garante: ${err.message}`);
          }
        }
        
        const titulo = `💰 Comisión Pendiente de Pago`;
        const mensaje = `Tiene una comisión pendiente de RD$ ${(comision.montoComision || 0).toLocaleString()}
        Cliente: ${comision.clienteNombre || 'N/A'}
        Fecha de generación: ${new Date(comision.fechaGeneracion).toLocaleDateString()}
        Por favor gestione el pago de esta comisión.`;
        
        await crearNotificacion(
          'comision_pendiente',
          titulo,
          mensaje,
          garanteNombre,
          comision.clienteID,
          {
            comisionID: doc.id,
            montoComision: comision.montoComision,
            garanteID: comision.garanteID,
            garanteNombre: garanteNombre
          }
        );
        
        notificacionesCreadas++;
        console.log(`✅ Notificación de comisión pendiente creada para: ${garanteNombre}`);
      }
    }
    
    console.log(`✅ Notificaciones de comisiones creadas: ${notificacionesCreadas}`);
  } catch (error) {
    console.error('❌ Error generando notificaciones de comisiones:', error);
  }
};

// ============================================
// FUNCIÓN PARA LIMPIAR NOTIFICACIONES ANTIGUAS
// ============================================
const limpiarNotificacionesAntiguas = async () => {
  console.log('🗑️ Limpiando notificaciones antiguas...');
  
  const fechaLimite = new Date();
  fechaLimite.setMonth(fechaLimite.getMonth() - 3); // Notificaciones con más de 3 meses
  
  try {
    const notificacionesSnapshot = await db.collection('notificaciones')
      .where('fechaCreacion', '<', fechaLimite.toISOString())
      .get();
    
    console.log(`📊 Notificaciones antiguas a eliminar: ${notificacionesSnapshot.size}`);
    
    let eliminadas = 0;
    for (const doc of notificacionesSnapshot.docs) {
      await doc.ref.delete();
      eliminadas++;
    }
    
    console.log(`✅ Notificaciones antiguas eliminadas: ${eliminadas}`);
  } catch (error) {
    console.error('❌ Error limpiando notificaciones antiguas:', error);
  }
};

// ============================================
// EJECUCIÓN PRINCIPAL
// ============================================
const ejecutar = async () => {
  console.log('');
  console.log('🚀 SISTEMA DE NOTIFICACIONES AUTOMÁTICAS - EYS INVERSIONES');
  console.log('=' .repeat(60));
  console.log(`🕐 Inicio: ${new Date().toLocaleString()}`);
  console.log('');
  
  try {
    // 1. Generar notificaciones de préstamos próximos a vencer y vencidos
    await generarNotificacionesMasivas();
    
    // 2. Generar notificaciones de comisiones pendientes
    await generarNotificacionesComisionesPendientes();
    
    // 3. Limpiar notificaciones antiguas (opcional - descomentar si se desea)
    // await limpiarNotificacionesAntiguas();
    
    console.log('');
    console.log('=' .repeat(60));
    console.log(`✅ PROCESO COMPLETADO - ${new Date().toLocaleString()}`);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Error en la ejecución principal:', error);
  }
  
  process.exit(0);
};

// Ejecutar el script
ejecutar();