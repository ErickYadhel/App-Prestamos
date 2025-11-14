const admin = require('firebase-admin');
const db = admin.firestore();

class FirebaseService {
  // ===== CLIENTES =====
  static async getClientes() {
    try {
      const snapshot = await db.collection('clientes')
        .where('activo', '==', true)
        .orderBy('fechaCreacion', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error obteniendo clientes: ${error.message}`);
    }
  }

  static async createCliente(clienteData) {
    try {
      const docRef = db.collection('clientes').doc();
      const cliente = {
        id: docRef.id,
        ...clienteData,
        fechaCreacion: new Date(),
        activo: true
      };
      
      await docRef.set(cliente);
      return cliente;
    } catch (error) {
      throw new Error(`Error creando cliente: ${error.message}`);
    }
  }

  static async updateCliente(clienteId, clienteData) {
    try {
      const docRef = db.collection('clientes').doc(clienteId);
      await docRef.update({
        ...clienteData,
        fechaActualizacion: new Date()
      });
      
      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      throw new Error(`Error actualizando cliente: ${error.message}`);
    }
  }

  static async deleteCliente(clienteId) {
    try {
      await db.collection('clientes').doc(clienteId).update({
        activo: false,
        fechaEliminacion: new Date()
      });
      return { success: true, message: 'Cliente eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error eliminando cliente: ${error.message}`);
    }
  }

  // ===== PRÉSTAMOS =====
  static async getPrestamos() {
    try {
      const snapshot = await db.collection('prestamos')
        .orderBy('fechaPrestamo', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error obteniendo préstamos: ${error.message}`);
    }
  }

  static async createPrestamo(prestamoData) {
    try {
      const docRef = db.collection('prestamos').doc();
      const prestamo = {
        id: docRef.id,
        ...prestamoData,
        capitalRestante: prestamoData.montoPrestado,
        fechaPrestamo: new Date(),
        estado: 'activo',
        fechaProximoPago: this.calcularProximaFecha(new Date(), prestamoData.frecuencia)
      };
      
      await docRef.set(prestamo);
      return prestamo;
    } catch (error) {
      throw new Error(`Error creando préstamo: ${error.message}`);
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
        fecha.setDate(fecha.getDate() + 15); // Por defecto quincenal
    }
    return fecha;
  }

  // ===== PAGOS =====
  static async getPagos() {
    try {
      const snapshot = await db.collection('pagos')
        .orderBy('fechaPago', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error obteniendo pagos: ${error.message}`);
    }
  }

  static async createPago(pagoData) {
    try {
      const batch = db.batch();
      
      // Crear el pago
      const pagoRef = db.collection('pagos').doc();
      const pago = {
        id: pagoRef.id,
        ...pagoData,
        fechaPago: new Date(),
        montoTotal: pagoData.montoCapital + pagoData.montoInteres
      };
      batch.set(pagoRef, pago);

      // Actualizar el préstamo
      const prestamoRef = db.collection('prestamos').doc(pagoData.prestamoID);
      const prestamoDoc = await prestamoRef.get();
      
      if (!prestamoDoc.exists) {
        throw new Error('Préstamo no encontrado');
      }

      const prestamo = prestamoDoc.data();
      const nuevoCapital = prestamo.capitalRestante - pagoData.montoCapital;
      
      const actualizacionPrestamo = {
        capitalRestante: nuevoCapital,
        fechaUltimoPago: new Date(),
        fechaProximoPago: this.calcularProximaFecha(new Date(), prestamo.frecuencia),
        estado: nuevoCapital <= 0 ? 'completado' : 'activo'
      };
      
      batch.update(prestamoRef, actualizacionPrestamo);
      
      await batch.commit();
      return { pago, prestamoActualizado: actualizacionPrestamo };
    } catch (error) {
      throw new Error(`Error registrando pago: ${error.message}`);
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
      throw new Error(`Error obteniendo pagos: ${error.message}`);
    }
  }

  // ===== SOLICITUDES =====
  static async getSolicitudes() {
    try {
      const snapshot = await db.collection('solicitudes')
        .orderBy('fechaSolicitud', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error obteniendo solicitudes: ${error.message}`);
    }
  }

  static async createSolicitud(solicitudData) {
    try {
      const docRef = db.collection('solicitudes').doc();
      const solicitud = {
        id: docRef.id,
        ...solicitudData,
        fechaSolicitud: new Date(),
        estado: 'pendiente'
      };
      
      await docRef.set(solicitud);
      return solicitud;
    } catch (error) {
      throw new Error(`Error creando solicitud: ${error.message}`);
    }
  }

  static async actualizarEstadoSolicitud(solicitudId, nuevoEstado, aprobador, observaciones = '') {
    try {
      const docRef = db.collection('solicitudes').doc(solicitudId);
      await docRef.update({
        estado: nuevoEstado,
        aprobadoPor: aprobador,
        fechaDecision: new Date(),
        observaciones
      });
      
      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      throw new Error(`Error actualizando solicitud: ${error.message}`);
    }
  }

  // ===== GARANTES =====
  static async getGarantes() {
    try {
      const snapshot = await db.collection('garantes')
        .where('activo', '==', true)
        .orderBy('fechaCreacion', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error obteniendo garantes: ${error.message}`);
    }
  }

  static async createGarante(garanteData) {
    try {
      const docRef = db.collection('garantes').doc();
      const garante = {
        id: docRef.id,
        ...garanteData,
        fechaCreacion: new Date(),
        activo: true
      };
      
      await docRef.set(garante);
      return garante;
    } catch (error) {
      throw new Error(`Error creando garante: ${error.message}`);
    }
  }

  // ===== DASHBOARD STATS =====
  static async getDashboardStats() {
    try {
      const [
        clientesSnapshot,
        prestamosSnapshot,
        pagosHoySnapshot,
        solicitudesSnapshot
      ] = await Promise.all([
        db.collection('clientes').where('activo', '==', true).get(),
        db.collection('prestamos').where('estado', '==', 'activo').get(),
        db.collection('pagos')
          .where('fechaPago', '>=', new Date(new Date().setHours(0,0,0,0)))
          .get(),
        db.collection('solicitudes').where('estado', '==', 'pendiente').get()
      ]);

      const capitalPrestado = prestamosSnapshot.docs.reduce((sum, doc) => {
        const prestamo = doc.data();
        return sum + prestamo.montoPrestado;
      }, 0);

      const capitalPorCobrar = prestamosSnapshot.docs.reduce((sum, doc) => {
        const prestamo = doc.data();
        return sum + prestamo.capitalRestante;
      }, 0);

      return {
        clientes: clientesSnapshot.size,
        prestamos: prestamosSnapshot.size,
        pagosHoy: pagosHoySnapshot.size,
        solicitudes: solicitudesSnapshot.size,
        capitalPrestado,
        capitalPorCobrar
      };
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }

  // ===== MÉTODOS ADICIONALES PARA CONSULTAS ESPECÍFICAS =====
  static async getClienteById(clienteId) {
    try {
      const doc = await db.collection('clientes').doc(clienteId).get();
      if (!doc.exists) {
        throw new Error('Cliente no encontrado');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error obteniendo cliente: ${error.message}`);
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
      throw new Error(`Error obteniendo préstamos del cliente: ${error.message}`);
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
      throw new Error(`Error obteniendo préstamo: ${error.message}`);
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
      throw new Error(`Error obteniendo solicitud: ${error.message}`);
    }
  }

  // ===== MÉTODOS PARA BÚSQUEDAS =====
  static async searchClientes(termino) {
    try {
      const clientes = await this.getClientes();
      return clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        cliente.cedula.includes(termino) ||
        cliente.celular.includes(termino)
      );
    } catch (error) {
      throw new Error(`Error buscando clientes: ${error.message}`);
    }
  }

  static async searchPrestamos(termino) {
    try {
      const prestamos = await this.getPrestamos();
      return prestamos.filter(prestamo =>
        prestamo.clienteNombre.toLowerCase().includes(termino.toLowerCase())
      );
    } catch (error) {
      throw new Error(`Error buscando préstamos: ${error.message}`);
    }
  }

  // ===== MÉTODOS PARA REPORTES =====
  static async getPagosPorRango(fechaInicio, fechaFin) {
    try {
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
      throw new Error(`Error obteniendo pagos por rango: ${error.message}`);
    }
  }

  static async getPrestamosPorEstado(estado) {
    try {
      const snapshot = await db.collection('prestamos')
        .where('estado', '==', estado)
        .orderBy('fechaPrestamo', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error obteniendo préstamos por estado: ${error.message}`);
    }
  }
}

module.exports = FirebaseService;