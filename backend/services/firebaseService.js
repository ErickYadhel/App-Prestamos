const admin = require('firebase-admin');
const db = admin.firestore();

// ============================================
// VALIDACIONES Y SANITIZACIÓN
// ============================================

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  return /^[0-9+\-\s()]{7,15}$/.test(phone);
};

const isValidCedula = (cedula) => {
  return /^[0-9]{11}$/.test(cedula);
};

const isValidMonto = (monto) => {
  return typeof monto === 'number' && monto > 0 && monto < 1000000000;
};

const isValidFrecuencia = (frecuencia) => {
  const validas = ['diario', 'semanal', 'quincenal', 'mensual'];
  return validas.includes(frecuencia);
};

// ============================================
// LOGS DE AUDITORÍA (SIMPLE)
// ============================================

const logAuditoria = (accion, coleccion, id, datos) => {
  console.log(`📝 AUDITORÍA: ${accion} | ${coleccion} | ${id} | ${new Date().toISOString()}`);
  // Opcional: Guardar en Firestore para auditoría
  // await db.collection('logs_auditoria').add({ accion, coleccion, id, datos, fecha: new Date() });
};

// ============================================
// CLASE FIREBASE SERVICE
// ============================================

class FirebaseService {
  // ============================================
  // CLIENTES
  // ============================================

  static async getClientes(limit = 100) {
    try {
      const snapshot = await db.collection('clientes')
        .where('activo', '==', true)
        .orderBy('fechaCreacion', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error en getClientes:', error.message);
      throw new Error('Error obteniendo clientes');
    }
  }

  static async createCliente(clienteData) {
    try {
      // 1. Validar datos requeridos
      if (!clienteData.nombre || clienteData.nombre.length < 2) {
        throw new Error('El nombre es obligatorio y debe tener al menos 2 caracteres');
      }

      if (!clienteData.cedula || !isValidCedula(clienteData.cedula)) {
        throw new Error('La cédula es obligatoria y debe tener 11 dígitos');
      }

      if (clienteData.email && !isValidEmail(clienteData.email)) {
        throw new Error('El email no tiene un formato válido');
      }

      if (clienteData.celular && !isValidPhone(clienteData.celular)) {
        throw new Error('El celular no tiene un formato válido');
      }

      // 2. Sanitizar datos
      const cliente = {
        nombre: sanitizeString(clienteData.nombre),
        cedula: clienteData.cedula.trim(),
        email: clienteData.email ? sanitizeString(clienteData.email).toLowerCase() : '',
        celular: clienteData.celular ? clienteData.celular.trim() : '',
        telefono: clienteData.telefono ? clienteData.telefono.trim() : '',
        direccion: clienteData.direccion ? sanitizeString(clienteData.direccion) : '',
        referencia: clienteData.referencia ? sanitizeString(clienteData.referencia) : '',
        fechaCreacion: new Date(),
        activo: true,
        // Campos opcionales
        ...(clienteData.fechaNacimiento && { fechaNacimiento: clienteData.fechaNacimiento }),
        ...(clienteData.ocupacion && { ocupacion: sanitizeString(clienteData.ocupacion) }),
        ...(clienteData.ingresos && { ingresos: clienteData.ingresos }),
      };

      // 3. Guardar en Firestore
      const docRef = db.collection('clientes').doc();
      await docRef.set({
        id: docRef.id,
        ...cliente
      });

      logAuditoria('CREATE', 'clientes', docRef.id, { nombre: cliente.nombre, cedula: cliente.cedula });

      return { id: docRef.id, ...cliente };
    } catch (error) {
      console.error('❌ Error en createCliente:', error.message);
      throw new Error(error.message || 'Error creando cliente');
    }
  }

  static async updateCliente(clienteId, clienteData) {
    try {
      // 1. Verificar que el cliente existe
      const docRef = db.collection('clientes').doc(clienteId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Cliente no encontrado');
      }

      // 2. Validar datos
      if (clienteData.nombre && clienteData.nombre.length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }

      if (clienteData.cedula && !isValidCedula(clienteData.cedula)) {
        throw new Error('La cédula debe tener 11 dígitos');
      }

      if (clienteData.email && !isValidEmail(clienteData.email)) {
        throw new Error('El email no tiene un formato válido');
      }

      if (clienteData.celular && !isValidPhone(clienteData.celular)) {
        throw new Error('El celular no tiene un formato válido');
      }

      // 3. Sanitizar y actualizar
      const updateData = {
        ...clienteData,
        nombre: clienteData.nombre ? sanitizeString(clienteData.nombre) : undefined,
        email: clienteData.email ? sanitizeString(clienteData.email).toLowerCase() : undefined,
        direccion: clienteData.direccion ? sanitizeString(clienteData.direccion) : undefined,
        referencia: clienteData.referencia ? sanitizeString(clienteData.referencia) : undefined,
        fechaActualizacion: new Date()
      };

      // Eliminar campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      await docRef.update(updateData);

      logAuditoria('UPDATE', 'clientes', clienteId, { campos: Object.keys(updateData) });

      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('❌ Error en updateCliente:', error.message);
      throw new Error(error.message || 'Error actualizando cliente');
    }
  }

  static async deleteCliente(clienteId) {
    try {
      const docRef = db.collection('clientes').doc(clienteId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Cliente no encontrado');
      }

      await docRef.update({
        activo: false,
        fechaEliminacion: new Date()
      });

      logAuditoria('DELETE', 'clientes', clienteId, { softDelete: true });

      return { success: true, message: 'Cliente eliminado correctamente' };
    } catch (error) {
      console.error('❌ Error en deleteCliente:', error.message);
      throw new Error(error.message || 'Error eliminando cliente');
    }
  }

  // ============================================
  // PRÉSTAMOS
  // ============================================

  static async getPrestamos(limit = 100) {
    try {
      const snapshot = await db.collection('prestamos')
        .orderBy('fechaPrestamo', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error en getPrestamos:', error.message);
      throw new Error('Error obteniendo préstamos');
    }
  }

  static async createPrestamo(prestamoData) {
    try {
      // 1. Validar datos requeridos
      if (!prestamoData.clienteID) {
        throw new Error('Cliente ID es obligatorio');
      }

      if (!isValidMonto(prestamoData.montoPrestado)) {
        throw new Error('El monto debe ser un número positivo');
      }

      if (!isValidMonto(prestamoData.tasaInteres) || prestamoData.tasaInteres > 100) {
        throw new Error('La tasa de interés debe ser un número entre 0 y 100');
      }

      if (!isValidFrecuencia(prestamoData.frecuencia)) {
        throw new Error('Frecuencia inválida. Debe ser: diario, semanal, quincenal o mensual');
      }

      if (!prestamoData.clienteNombre) {
        throw new Error('Nombre del cliente es obligatorio');
      }

      // 2. Calcular datos del préstamo
      const fechaPrestamo = new Date();
      const capitalRestante = prestamoData.montoPrestado;
      
      const prestamo = {
        id: db.collection('prestamos').doc().id,
        ...prestamoData,
        montoPrestado: Number(prestamoData.montoPrestado),
        tasaInteres: Number(prestamoData.tasaInteres),
        capitalRestante: capitalRestante,
        fechaPrestamo: fechaPrestamo,
        estado: 'activo',
        fechaProximoPago: this.calcularProximaFecha(fechaPrestamo, prestamoData.frecuencia),
        activo: true
      };

      // 3. Guardar en Firestore
      const docRef = db.collection('prestamos').doc(prestamo.id);
      await docRef.set(prestamo);

      logAuditoria('CREATE', 'prestamos', prestamo.id, {
        clienteId: prestamo.clienteID,
        monto: prestamo.montoPrestado
      });

      return prestamo;
    } catch (error) {
      console.error('❌ Error en createPrestamo:', error.message);
      throw new Error(error.message || 'Error creando préstamo');
    }
  }

  static calcularProximaFecha(fechaBase, frecuencia) {
    const fecha = new Date(fechaBase);
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
        fecha.setDate(fecha.getDate() + 15);
    }
    return fecha;
  }

  // ============================================
  // PAGOS
  // ============================================

  static async getPagos(limit = 100) {
    try {
      const snapshot = await db.collection('pagos')
        .orderBy('fechaPago', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error en getPagos:', error.message);
      throw new Error('Error obteniendo pagos');
    }
  }

  static async createPago(pagoData) {
    try {
      // 1. Validar datos
      if (!pagoData.prestamoID) {
        throw new Error('Préstamo ID es obligatorio');
      }

      if (!isValidMonto(pagoData.montoCapital)) {
        throw new Error('El monto de capital debe ser un número positivo');
      }

      if (!isValidMonto(pagoData.montoInteres)) {
        throw new Error('El monto de interés debe ser un número positivo');
      }

      // 2. Verificar que el préstamo existe y está activo
      const prestamoRef = db.collection('prestamos').doc(pagoData.prestamoID);
      const prestamoDoc = await prestamoRef.get();
      
      if (!prestamoDoc.exists) {
        throw new Error('Préstamo no encontrado');
      }

      const prestamo = prestamoDoc.data();
      
      if (prestamo.estado === 'completado') {
        throw new Error('Este préstamo ya ha sido completado');
      }

      // 3. Validar que no se pague más de lo debido
      if (pagoData.montoCapital > prestamo.capitalRestante) {
        throw new Error(`El monto de capital no puede exceder el capital restante: ${prestamo.capitalRestante}`);
      }

      // 4. Crear el pago
      const batch = db.batch();
      const pagoRef = db.collection('pagos').doc();
      
      const pago = {
        id: pagoRef.id,
        prestamoID: pagoData.prestamoID,
        clienteID: prestamo.clienteID,
        clienteNombre: prestamo.clienteNombre,
        montoCapital: Number(pagoData.montoCapital),
        montoInteres: Number(pagoData.montoInteres),
        montoTotal: Number(pagoData.montoCapital) + Number(pagoData.montoInteres),
        fechaPago: new Date(),
        metodoPago: pagoData.metodoPago || 'efectivo',
        referencia: pagoData.referencia || '',
        observaciones: pagoData.observaciones ? sanitizeString(pagoData.observaciones) : '',
        creadoPor: pagoData.creadoPor || 'sistema'
      };

      batch.set(pagoRef, pago);

      // 5. Actualizar el préstamo
      const nuevoCapital = prestamo.capitalRestante - pagoData.montoCapital;
      const actualizacionPrestamo = {
        capitalRestante: nuevoCapital,
        fechaUltimoPago: new Date(),
        fechaProximoPago: this.calcularProximaFecha(new Date(), prestamo.frecuencia),
        estado: nuevoCapital <= 0 ? 'completado' : 'activo'
      };

      batch.update(prestamoRef, actualizacionPrestamo);

      // 6. Ejecutar transacción
      await batch.commit();

      logAuditoria('CREATE', 'pagos', pagoRef.id, {
        prestamoId: pagoData.prestamoID,
        montoTotal: pago.montoTotal,
        capitalRestante: nuevoCapital
      });

      return {
        pago,
        prestamoActualizado: { ...prestamo, ...actualizacionPrestamo }
      };
    } catch (error) {
      console.error('❌ Error en createPago:', error.message);
      throw new Error(error.message || 'Error registrando pago');
    }
  }

  static async getPagosPorPrestamo(prestamoID) {
    try {
      const snapshot = await db.collection('pagos')
        .where('prestamoID', '==', prestamoID)
        .orderBy('fechaPago', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error en getPagosPorPrestamo:', error.message);
      throw new Error('Error obteniendo pagos del préstamo');
    }
  }

  // ============================================
  // SOLICITUDES
  // ============================================

  static async getSolicitudes(limit = 100) {
    try {
      const snapshot = await db.collection('solicitudes')
        .orderBy('fechaSolicitud', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error en getSolicitudes:', error.message);
      throw new Error('Error obteniendo solicitudes');
    }
  }

  static async createSolicitud(solicitudData) {
    try {
      // 1. Validar datos
      if (!solicitudData.clienteID) {
        throw new Error('Cliente ID es obligatorio');
      }

      if (!solicitudData.clienteNombre) {
        throw new Error('Nombre del cliente es obligatorio');
      }

      if (!isValidMonto(solicitudData.montoSolicitado)) {
        throw new Error('El monto solicitado debe ser un número positivo');
      }

      // 2. Crear solicitud
      const solicitud = {
        id: db.collection('solicitudes').doc().id,
        ...solicitudData,
        montoSolicitado: Number(solicitudData.montoSolicitado),
        fechaSolicitud: new Date(),
        estado: 'pendiente',
        activo: true
      };

      const docRef = db.collection('solicitudes').doc(solicitud.id);
      await docRef.set(solicitud);

      logAuditoria('CREATE', 'solicitudes', solicitud.id, {
        clienteId: solicitud.clienteID,
        monto: solicitud.montoSolicitado
      });

      return solicitud;
    } catch (error) {
      console.error('❌ Error en createSolicitud:', error.message);
      throw new Error(error.message || 'Error creando solicitud');
    }
  }

  static async actualizarEstadoSolicitud(solicitudId, nuevoEstado, aprobador, observaciones = '') {
    try {
      const estadosValidos = ['pendiente', 'aprobada', 'rechazada', 'en_revision'];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`);
      }

      const docRef = db.collection('solicitudes').doc(solicitudId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Solicitud no encontrada');
      }

      await docRef.update({
        estado: nuevoEstado,
        aprobadoPor: aprobador || 'sistema',
        fechaDecision: new Date(),
        observaciones: observaciones ? sanitizeString(observaciones) : ''
      });

      logAuditoria('UPDATE', 'solicitudes', solicitudId, {
        nuevoEstado,
        aprobador: aprobador || 'sistema'
      });

      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('❌ Error en actualizarEstadoSolicitud:', error.message);
      throw new Error(error.message || 'Error actualizando solicitud');
    }
  }

  // ============================================
  // GARANTES
  // ============================================

  static async getGarantes(limit = 100) {
    try {
      const snapshot = await db.collection('garantes')
        .where('activo', '==', true)
        .orderBy('fechaCreacion', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error en getGarantes:', error.message);
      throw new Error('Error obteniendo garantes');
    }
  }

  static async createGarante(garanteData) {
    try {
      // 1. Validar datos
      if (!garanteData.nombre || garanteData.nombre.length < 2) {
        throw new Error('El nombre es obligatorio y debe tener al menos 2 caracteres');
      }

      if (!garanteData.cedula || !isValidCedula(garanteData.cedula)) {
        throw new Error('La cédula es obligatoria y debe tener 11 dígitos');
      }

      if (garanteData.celular && !isValidPhone(garanteData.celular)) {
        throw new Error('El celular no tiene un formato válido');
      }

      // 2. Sanitizar y crear
      const garante = {
        nombre: sanitizeString(garanteData.nombre),
        cedula: garanteData.cedula.trim(),
        celular: garanteData.celular ? garanteData.celular.trim() : '',
        telefono: garanteData.telefono ? garanteData.telefono.trim() : '',
        direccion: garanteData.direccion ? sanitizeString(garanteData.direccion) : '',
        fechaCreacion: new Date(),
        activo: true
      };

      const docRef = db.collection('garantes').doc();
      await docRef.set({
        id: docRef.id,
        ...garante
      });

      logAuditoria('CREATE', 'garantes', docRef.id, { nombre: garante.nombre });

      return { id: docRef.id, ...garante };
    } catch (error) {
      console.error('❌ Error en createGarante:', error.message);
      throw new Error(error.message || 'Error creando garante');
    }
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================

  static async getDashboardStats() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      const [
        clientesSnapshot,
        prestamosSnapshot,
        pagosHoySnapshot,
        solicitudesSnapshot
      ] = await Promise.all([
        db.collection('clientes').where('activo', '==', true).get(),
        db.collection('prestamos').where('estado', '==', 'activo').get(),
        db.collection('pagos')
          .where('fechaPago', '>=', hoy)
          .where('fechaPago', '<', manana)
          .get(),
        db.collection('solicitudes').where('estado', '==', 'pendiente').get()
      ]);

      const capitalPrestado = prestamosSnapshot.docs.reduce((sum, doc) => {
        const prestamo = doc.data();
        return sum + (prestamo.montoPrestado || 0);
      }, 0);

      const capitalPorCobrar = prestamosSnapshot.docs.reduce((sum, doc) => {
        const prestamo = doc.data();
        return sum + (prestamo.capitalRestante || 0);
      }, 0);

      // Calcular total de intereses cobrados
      const interesesCobrados = prestamosSnapshot.docs.reduce((sum, doc) => {
        const prestamo = doc.data();
        return sum + ((prestamo.montoPrestado || 0) - (prestamo.capitalRestante || 0));
      }, 0);

      return {
        clientes: clientesSnapshot.size,
        prestamosActivos: prestamosSnapshot.size,
        pagosHoy: pagosHoySnapshot.size,
        solicitudes: solicitudesSnapshot.size,
        capitalPrestado,
        capitalPorCobrar,
        interesesCobrados
      };
    } catch (error) {
      console.error('❌ Error en getDashboardStats:', error.message);
      throw new Error('Error obteniendo estadísticas');
    }
  }

  // ============================================
  // MÉTODOS PARA CONSULTAS ESPECÍFICAS
  // ============================================

  static async getClienteById(clienteId) {
    try {
      const doc = await db.collection('clientes').doc(clienteId).get();
      if (!doc.exists) {
        throw new Error('Cliente no encontrado');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('❌ Error en getClienteById:', error.message);
      throw new Error(error.message || 'Error obteniendo cliente');
    }
  }

  static async getPrestamosByCliente(clienteId) {
    try {
      const snapshot = await db.collection('prestamos')
        .where('clienteID', '==', clienteId)
        .orderBy('fechaPrestamo', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error en getPrestamosByCliente:', error.message);
      throw new Error('Error obteniendo préstamos del cliente');
    }
  }

  static async getPrestamoById(prestamoId) {
    try {
      const doc = await db.collection('prestamos').doc(prestamoId).get();
      if (!doc.exists) {
        throw new Error('Préstamo no encontrado');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('❌ Error en getPrestamoById:', error.message);
      throw new Error(error.message || 'Error obteniendo préstamo');
    }
  }

  static async getSolicitudById(solicitudId) {
    try {
      const doc = await db.collection('solicitudes').doc(solicitudId).get();
      if (!doc.exists) {
        throw new Error('Solicitud no encontrada');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('❌ Error en getSolicitudById:', error.message);
      throw new Error(error.message || 'Error obteniendo solicitud');
    }
  }

  // ============================================
  // BÚSQUEDAS
  // ============================================

  static async searchClientes(termino) {
    try {
      const terminoLower = termino.toLowerCase().trim();
      const clientes = await this.getClientes(1000);
      
      return clientes.filter(cliente =>
        (cliente.nombre && cliente.nombre.toLowerCase().includes(terminoLower)) ||
        (cliente.cedula && cliente.cedula.includes(termino)) ||
        (cliente.celular && cliente.celular.includes(termino)) ||
        (cliente.email && cliente.email.toLowerCase().includes(terminoLower))
      );
    } catch (error) {
      console.error('❌ Error en searchClientes:', error.message);
      throw new Error('Error buscando clientes');
    }
  }

  static async searchPrestamos(termino) {
    try {
      const terminoLower = termino.toLowerCase().trim();
      const prestamos = await this.getPrestamos(1000);
      
      return prestamos.filter(prestamo =>
        prestamo.clienteNombre && 
        prestamo.clienteNombre.toLowerCase().includes(terminoLower)
      );
    } catch (error) {
      console.error('❌ Error en searchPrestamos:', error.message);
      throw new Error('Error buscando préstamos');
    }
  }

  // ============================================
  // REPORTES
  // ============================================

  static async getPagosPorRango(fechaInicio, fechaFin) {
    try {
      if (!fechaInicio || !fechaFin) {
        throw new Error('Fechas de inicio y fin son obligatorias');
      }

      const snapshot = await db.collection('pagos')
        .where('fechaPago', '>=', fechaInicio)
        .where('fechaPago', '<=', fechaFin)
        .orderBy('fechaPago', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error en getPagosPorRango:', error.message);
      throw new Error(error.message || 'Error obteniendo pagos por rango');
    }
  }

  static async getPrestamosPorEstado(estado) {
    try {
      const estadosValidos = ['activo', 'completado', 'moroso', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        throw new Error(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`);
      }

      const snapshot = await db.collection('prestamos')
        .where('estado', '==', estado)
        .orderBy('fechaPrestamo', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error en getPrestamosPorEstado:', error.message);
      throw new Error(error.message || 'Error obteniendo préstamos por estado');
    }
  }
}

module.exports = FirebaseService;