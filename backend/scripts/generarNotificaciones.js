const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Función para generar ID de notificación
const generarIdNotificacion = () => {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

// Generar notificaciones de préstamos próximos a vencer
const generarNotificacionesProximosVencer = async () => {
  console.log('📅 Generando notificaciones de préstamos próximos a vencer...');
  
  const hoy = new Date();
  const enTresDias = new Date();
  enTresDias.setDate(hoy.getDate() + 3);
  
  try {
    const prestamosSnapshot = await db.collection('prestamos')
      .where('estado', '==', 'activo')
      .get();
    
    let generadas = 0;
    
    for (const doc of prestamosSnapshot.docs) {
      const prestamo = doc.data();
      const fechaProximoPago = prestamo.fechaProximoPago?.toDate?.() || new Date(prestamo.fechaProximoPago);
      
      if (!fechaProximoPago) continue;
      
      const diasParaVencer = Math.ceil((fechaProximoPago - hoy) / (1000 * 60 * 60 * 24));
      
      // Verificar si vence en 3 días o menos y no está vencido
      if (diasParaVencer <= 3 && diasParaVencer >= 0 && prestamo.capitalRestante > 0) {
        // Verificar si ya existe notificación para este préstamo en los últimos 2 días
        const notifExistente = await db.collection('notificaciones')
          .where('metadata.prestamoID', '==', doc.id)
          .where('tipo', '==', 'pago_proximo')
          .where('fechaCreacion', '>=', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
          .get();
        
        if (!notifExistente.empty) {
          console.log(`  ⏭️ Ya existe notificación para préstamo ${doc.id}`);
          continue;
        }
        
        const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
        const clienteNombre = clienteDoc.exists ? clienteDoc.data().nombre : prestamo.clienteNombre;
        
        const interesPeriodo = (prestamo.capitalRestante * prestamo.interesPercent) / 100;
        
        const notificacion = {
          id: generarIdNotificacion(),
          tipo: 'pago_proximo',
          titulo: '📅 Pago Próximo a Vencer',
          mensaje: `El pago de ${clienteNombre} vence en ${diasParaVencer} día${diasParaVencer !== 1 ? 's' : ''}. Monto sugerido: RD$ ${interesPeriodo.toLocaleString()}`,
          leida: false,
          whatsappEnviado: false,
          fechaCreacion: new Date(),
          metadata: {
            clienteID: prestamo.clienteID,
            clienteNombre: clienteNombre,
            prestamoID: doc.id,
            capitalRestante: prestamo.capitalRestante,
            interesPeriodo: interesPeriodo,
            diasParaVencer: diasParaVencer
          }
        };
        
        await db.collection('notificaciones').doc(notificacion.id).set(notificacion);
        console.log(`  ✅ Notificación creada: ${clienteNombre} - vence en ${diasParaVencer} días`);
        generadas++;
      }
    }
    
    console.log(`✅ Generadas ${generadas} notificaciones de préstamos próximos a vencer`);
  } catch (error) {
    console.error('❌ Error generando notificaciones:', error);
  }
};

// Generar notificaciones de préstamos vencidos
const generarNotificacionesVencidos = async () => {
  console.log('⚠️ Generando notificaciones de préstamos vencidos...');
  
  const hoy = new Date();
  
  try {
    const prestamosSnapshot = await db.collection('prestamos')
      .where('estado', '==', 'activo')
      .get();
    
    let generadas = 0;
    
    for (const doc of prestamosSnapshot.docs) {
      const prestamo = doc.data();
      const fechaProximoPago = prestamo.fechaProximoPago?.toDate?.() || new Date(prestamo.fechaProximoPago);
      
      if (!fechaProximoPago) continue;
      
      const diasVencidos = Math.ceil((hoy - fechaProximoPago) / (1000 * 60 * 60 * 24));
      
      if (diasVencidos > 0 && prestamo.capitalRestante > 0) {
        // Verificar si ya existe notificación de vencimiento en los últimos 2 días
        const notifExistente = await db.collection('notificaciones')
          .where('metadata.prestamoID', '==', doc.id)
          .where('tipo', '==', 'prestamo_vencido')
          .where('fechaCreacion', '>=', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
          .get();
        
        if (!notifExistente.empty) {
          console.log(`  ⏭️ Ya existe notificación de vencimiento para préstamo ${doc.id}`);
          continue;
        }
        
        const clienteDoc = await db.collection('clientes').doc(prestamo.clienteID).get();
        const clienteNombre = clienteDoc.exists ? clienteDoc.data().nombre : prestamo.clienteNombre;
        
        const interesDiario = (prestamo.capitalRestante * prestamo.interesPercent) / 100 / 30;
        const moraCalculada = interesDiario * diasVencidos * 0.05;
        
        const notificacion = {
          id: generarIdNotificacion(),
          tipo: 'prestamo_vencido',
          titulo: '⚠️ Préstamo Vencido',
          mensaje: `El préstamo de ${clienteNombre} tiene ${diasVencidos} día${diasVencidos !== 1 ? 's' : ''} de vencimiento. Mora acumulada: RD$ ${moraCalculada.toLocaleString()}`,
          leida: false,
          whatsappEnviado: false,
          fechaCreacion: new Date(),
          metadata: {
            clienteID: prestamo.clienteID,
            clienteNombre: clienteNombre,
            prestamoID: doc.id,
            capitalRestante: prestamo.capitalRestante,
            diasVencidos: diasVencidos,
            moraCalculada: moraCalculada
          }
        };
        
        await db.collection('notificaciones').doc(notificacion.id).set(notificacion);
        console.log(`  ✅ Notificación creada: ${clienteNombre} - ${diasVencidos} días vencido`);
        generadas++;
      }
    }
    
    console.log(`✅ Generadas ${generadas} notificaciones de préstamos vencidos`);
  } catch (error) {
    console.error('❌ Error generando notificaciones de vencidos:', error);
  }
};

// Generar notificaciones de comisiones
const generarNotificacionesComisiones = async () => {
  console.log('💰 Generando notificaciones de comisiones...');
  
  try {
    const comisionesSnapshot = await db.collection('comisiones')
      .where('estado', '==', 'pendiente')
      .get();
    
    let generadas = 0;
    
    for (const doc of comisionesSnapshot.docs) {
      const comision = doc.data();
      
      // Verificar si ya existe notificación para esta comisión
      const notifExistente = await db.collection('notificaciones')
        .where('metadata.comisionID', '==', doc.id)
        .get();
      
      if (!notifExistente.empty) {
        continue;
      }
      
      const notificacion = {
        id: generarIdNotificacion(),
        tipo: 'comision_generada',
        titulo: '💰 Comisión Generada',
        mensaje: `Se ha generado una comisión de RD$ ${(comision.montoComision || 0).toLocaleString()} para ${comision.garanteNombre || comision.garanteID}`,
        leida: false,
        whatsappEnviado: false,
        fechaCreacion: new Date(),
        metadata: {
          garanteID: comision.garanteID,
          garanteNombre: comision.garanteNombre,
          comisionID: doc.id,
          montoComision: comision.montoComision
        }
      };
      
      await db.collection('notificaciones').doc(notificacion.id).set(notificacion);
      console.log(`  ✅ Notificación de comisión creada para ${comision.garanteNombre}`);
      generadas++;
    }
    
    console.log(`✅ Generadas ${generadas} notificaciones de comisiones`);
  } catch (error) {
    console.error('❌ Error generando notificaciones de comisiones:', error);
  }
};

// Función principal
const generarTodasNotificaciones = async () => {
  console.log('🚀 Iniciando generación de notificaciones...');
  console.log('='.repeat(50));
  
  await generarNotificacionesProximosVencer();
  await generarNotificacionesVencidos();
  await generarNotificacionesComisiones();
  
  console.log('='.repeat(50));
  console.log('✅ Proceso completado');
};

// Ejecutar
generarTodasNotificaciones().then(() => {
  console.log('🎉 Generación de notificaciones finalizada');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});