import { useState, useEffect, useCallback } from 'react';
import notificacionesService from '../services/notificacionesService';

export const useNotificaciones = (usuarioId = null) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar notificaciones iniciales
  const cargarNotificaciones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificacionesService.getNotificaciones();
      setNotificaciones(data);
      setContadorNoLeidas(data.filter(n => !n.leida).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    cargarNotificaciones();

    // Suscribirse a cambios
    const unsubscribe = notificacionesService.suscribir((nuevas, contador) => {
      setNotificaciones(nuevas);
      setContadorNoLeidas(contador);
    });

    // Iniciar escucha en tiempo real si hay usuarioId
    if (usuarioId) {
      notificacionesService.iniciarEscuchaTiempoReal(usuarioId);
    }

    // Escuchar eventos personalizados
    const handleNuevaNotificacion = (event) => {
      cargarNotificaciones();
    };
    window.addEventListener('nuevaNotificacion', handleNuevaNotificacion);

    return () => {
      unsubscribe();
      notificacionesService.detenerEscucha();
      window.removeEventListener('nuevaNotificacion', handleNuevaNotificacion);
    };
  }, [cargarNotificaciones, usuarioId]);

  // Marcar como leída
  const marcarComoLeida = async (id) => {
    const exito = await notificacionesService.marcarComoLeida(id);
    if (exito) {
      setNotificaciones(prev => prev.map(n => 
        n.id === id ? { ...n, leida: true } : n
      ));
      setContadorNoLeidas(prev => Math.max(0, prev - 1));
    }
    return exito;
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = async () => {
    const exito = await notificacionesService.marcarTodasComoLeidas();
    if (exito) {
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setContadorNoLeidas(0);
    }
    return exito;
  };

  // Eliminar notificación
  const eliminarNotificacion = async (id) => {
    const exito = await notificacionesService.eliminarNotificacion(id);
    if (exito) {
      const notifEliminada = notificaciones.find(n => n.id === id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      if (notifEliminada && !notifEliminada.leida) {
        setContadorNoLeidas(prev => Math.max(0, prev - 1));
      }
    }
    return exito;
  };

  // Crear notificación
  const crearNotificacion = async (notificacion) => {
    const nueva = await notificacionesService.crearNotificacion(notificacion);
    if (nueva) {
      await cargarNotificaciones();
    }
    return nueva;
  };

  return {
    notificaciones,
    contadorNoLeidas,
    loading,
    error,
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    crearNotificacion
  };
};

export default useNotificaciones;