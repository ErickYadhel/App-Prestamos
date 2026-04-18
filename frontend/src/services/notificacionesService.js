import api from './api';
import { db } from './firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

// ============================================
// SERVICIO DE NOTIFICACIONES EN TIEMPO REAL
// ============================================

class NotificacionesService {
  constructor() {
    this.listeners = [];
    this.unsubscribe = null;
    this.cache = [];
    this.contador = 0;
  }

  // Obtener todas las notificaciones (API REST)
  async getNotificaciones() {
    try {
      const response = await api.get('/notificaciones');
      if (response.success && response.data) {
        this.cache = response.data;
        this.actualizarContador();
        return response.data;
      }
      return this.cache;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return this.cache;
    }
  }

  // Obtener notificaciones no leídas
  async getNotificacionesNoLeidas() {
    try {
      const response = await api.get('/notificaciones?leida=false');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  // Obtener contador de no leídas
  async getContadorNoLeidas() {
    try {
      const noLeidas = await this.getNotificacionesNoLeidas();
      return noLeidas.length;
    } catch (error) {
      return 0;
    }
  }

  // Marcar notificación como leída
  async marcarComoLeida(id) {
    try {
      const response = await api.put(`/notificaciones/${id}/leer`);
      if (response.success) {
        // Actualizar cache
        this.cache = this.cache.map(n => 
          n.id === id ? { ...n, leida: true } : n
        );
        this.actualizarContador();
        this.notificarCambio();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Marcar todas como leídas
  async marcarTodasComoLeidas() {
    try {
      const response = await api.put('/notificaciones/marcar-todas-leidas');
      if (response.success) {
        this.cache = this.cache.map(n => ({ ...n, leida: true }));
        this.actualizarContador();
        this.notificarCambio();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  // Eliminar notificación
  async eliminarNotificacion(id) {
    try {
      const response = await api.delete(`/notificaciones/${id}`);
      if (response.success) {
        this.cache = this.cache.filter(n => n.id !== id);
        this.actualizarContador();
        this.notificarCambio();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Crear notificación
  async crearNotificacion(notificacion) {
    try {
      const response = await api.post('/notificaciones/whatsapp', notificacion);
      if (response.success) {
        const nueva = {
          id: Date.now().toString(),
          ...notificacion,
          fechaCreacion: new Date().toISOString(),
          leida: false,
          enviada: false
        };
        this.cache = [nueva, ...this.cache];
        this.actualizarContador();
        this.notificarCambio();
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Actualizar contador
  actualizarContador() {
    this.contador = this.cache.filter(n => !n.leida).length;
  }

  // Notificar a los listeners
  notificarCambio() {
    this.listeners.forEach(listener => {
      listener(this.cache, this.contador);
    });
  }

  // Suscribirse a cambios en tiempo real
  suscribir(callback) {
    this.listeners.push(callback);
    callback(this.cache, this.contador);
    
    // Devolver función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Iniciar escucha en tiempo real (Firestore realtime)
  iniciarEscuchaTiempoReal(usuarioId) {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    try {
      const notificacionesRef = collection(db, 'notificaciones');
      const q = query(
        notificacionesRef,
        where('usuarioId', '==', usuarioId),
        orderBy('fechaCreacion', 'desc'),
        limit(50)
      );
      
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        const nuevas = [];
        snapshot.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          if (change.type === 'added') {
            nuevas.push(data);
          } else if (change.type === 'modified') {
            const index = this.cache.findIndex(n => n.id === data.id);
            if (index !== -1) {
              this.cache[index] = data;
            } else {
              nuevas.push(data);
            }
          } else if (change.type === 'removed') {
            this.cache = this.cache.filter(n => n.id !== data.id);
          }
        });
        
        if (nuevas.length > 0) {
          this.cache = [...nuevas, ...this.cache];
        }
        
        this.actualizarContador();
        this.notificarCambio();
      }, (error) => {
        console.error('Error en escucha de notificaciones:', error);
      });
    } catch (error) {
      console.error('Error iniciando escucha:', error);
    }
  }

  // Detener escucha
  detenerEscucha() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Simular notificación entrante (para pruebas)
  simularNotificacion(notificacion) {
    const nueva = {
      id: Date.now().toString(),
      ...notificacion,
      fechaCreacion: new Date().toISOString(),
      leida: false
    };
    this.cache = [nueva, ...this.cache];
    this.actualizarContador();
    this.notificarCambio();
    
    // Emitir evento para que el sidebar se actualice
    window.dispatchEvent(new CustomEvent('nuevaNotificacion', { detail: nueva }));
  }
}

export default new NotificacionesService();