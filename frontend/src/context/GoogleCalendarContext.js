import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleCalendarContext = createContext();

export const useGoogleCalendar = () => {
  const context = useContext(GoogleCalendarContext);
  if (!context) {
    throw new Error('useGoogleCalendar must be used within GoogleCalendarProvider');
  }
  return context;
};

export const GoogleCalendarProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calendars, setCalendars] = useState([]);

  // Login con Google
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${codeResponse.access_token}`,
              Accept: 'application/json'
            }
          }
        );

        setUser(response.data);
        setAccessToken(codeResponse.access_token);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('googleUser', JSON.stringify(response.data));
        localStorage.setItem('googleAccessToken', codeResponse.access_token);
        
        // Cargar calendarios después del login
        await loadCalendars(codeResponse.access_token);
        
      } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        setError('Error al iniciar sesión con Google');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Error al iniciar sesión con Google:', error);
      setError('Error al iniciar sesión con Google');
      setLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
  });

  // Cargar calendarios
  const loadCalendars = async (token) => {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setCalendars(response.data.items || []);
      return response.data.items || [];
    } catch (error) {
      console.error('Error al cargar calendarios:', error);
      setError('Error al cargar los calendarios');
      return [];
    }
  };

  // Logout
  const logout = () => {
    googleLogout();
    setUser(null);
    setAccessToken(null);
    setCalendars([]);
    localStorage.removeItem('googleUser');
    localStorage.removeItem('googleAccessToken');
  };

  // Verificar sesión guardada al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('googleUser');
    const savedToken = localStorage.getItem('googleAccessToken');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
      loadCalendars(savedToken);
    }
  }, []);

  // ============================================
  // FUNCIONES DE GOOGLE CALENDAR
  // ============================================

  // ============================================
  // 🔥 CREAR EVENTO EN GOOGLE CALENDAR (VERSIÓN CORREGIDA)
  // Maneja correctamente las horas y fechas
  // ============================================
  const crearEventoGoogle = async (eventoData) => {
    if (!accessToken) {
      setError('No hay sesión activa con Google');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const calendarId = eventoData.calendarId || 'primary';
      
      // 🔥 CONSTRUIR FECHA INICIO CORRECTAMENTE
      const fechaInicio = new Date(eventoData.fecha);
      
      // Si el evento tiene hora específica, aplicarla
      if (eventoData.hora) {
        const [horas, minutos] = eventoData.hora.split(':').map(Number);
        fechaInicio.setHours(horas, minutos, 0, 0);
      } else if (!eventoData.fecha.includes('T')) {
        // Si es solo una fecha sin hora, usar 09:00 por defecto
        fechaInicio.setHours(9, 0, 0, 0);
      }
      
      // 🔥 CONSTRUIR FECHA FIN CORRECTAMENTE
      let fechaFin;
      if (eventoData.fechaFin) {
        fechaFin = new Date(eventoData.fechaFin);
      } else if (eventoData.horaFin) {
        fechaFin = new Date(fechaInicio);
        const [horasFin, minutosFin] = eventoData.horaFin.split(':').map(Number);
        fechaFin.setHours(horasFin, minutosFin, 0, 0);
      } else {
        // Por defecto, el evento dura 1 hora
        fechaFin = new Date(fechaInicio);
        fechaFin.setHours(fechaInicio.getHours() + 1, 0, 0, 0);
      }
      
      const evento = {
        summary: eventoData.titulo || 'Evento sin título',
        description: eventoData.descripcion || '',
        start: {
          dateTime: fechaInicio.toISOString(),
          timeZone: 'America/Santo_Domingo'
        },
        end: {
          dateTime: fechaFin.toISOString(),
          timeZone: 'America/Santo_Domingo'
        },
        attendees: eventoData.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await axios.post(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        evento,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Evento creado en Google Calendar:`, response.data.id);
      return response.data;
    } catch (error) {
      console.error('Error al crear evento en Google Calendar:', error);
      setError('Error al crear el evento en Google Calendar');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener eventos de Google Calendar
  const obtenerEventosGoogle = async (calendarId = 'primary', timeMin = null, timeMax = null) => {
    if (!accessToken) {
      setError('No hay sesión activa con Google');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        timeZone: 'America/Santo_Domingo',
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 2500 // 🔥 Aumentado para traer más eventos
      };

      if (timeMin) {
        params.timeMin = new Date(timeMin).toISOString();
      } else {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        params.timeMin = hoy.toISOString();
      }

      if (timeMax) {
        params.timeMax = new Date(timeMax).toISOString();
      }

      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          params
        }
      );

      return response.data.items || [];
    } catch (error) {
      console.error('Error al obtener eventos de Google Calendar:', error);
      setError('Error al obtener eventos de Google Calendar');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Actualizar evento en Google Calendar
  const actualizarEventoGoogle = async (eventId, eventoData, calendarId = 'primary') => {
    if (!accessToken) {
      setError('No hay sesión activa con Google');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const fechaInicio = new Date(eventoData.fecha);
      if (eventoData.hora) {
        const [horas, minutos] = eventoData.hora.split(':').map(Number);
        fechaInicio.setHours(horas, minutos, 0, 0);
      } else {
        fechaInicio.setHours(9, 0, 0, 0);
      }

      let fechaFin = new Date(fechaInicio);
      if (eventoData.horaFin) {
        const [horasFin, minutosFin] = eventoData.horaFin.split(':').map(Number);
        fechaFin.setHours(horasFin, minutosFin, 0, 0);
      } else {
        fechaFin.setHours(fechaInicio.getHours() + 1, 0, 0, 0);
      }

      const evento = {
        summary: eventoData.titulo,
        description: eventoData.descripcion || '',
        start: {
          dateTime: fechaInicio.toISOString(),
          timeZone: 'America/Santo_Domingo'
        },
        end: {
          dateTime: fechaFin.toISOString(),
          timeZone: 'America/Santo_Domingo'
        }
      };

      const response = await axios.put(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
        evento,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error al actualizar evento en Google Calendar:', error);
      setError('Error al actualizar el evento en Google Calendar');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar evento de Google Calendar
  const eliminarEventoGoogle = async (eventId, calendarId = 'primary') => {
    if (!accessToken) {
      setError('No hay sesión activa con Google');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.delete(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Error al eliminar evento de Google Calendar:', error);
      setError('Error al eliminar el evento de Google Calendar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🔥 SINCRONIZAR EVENTOS DE FIREBASE A GOOGLE CALENDAR
  // VERSIÓN CORREGIDA - Procesa TODOS los eventos del array
  // ============================================
  const sincronizarEventos = async (eventosFirebase, calendarId = 'primary') => {
    if (!accessToken) {
      setError('No hay sesión activa con Google');
      return { success: false, error: 'No hay sesión activa' };
    }

    setLoading(true);
    setError(null);

    console.log(`🔄 [GoogleCalendar] Sincronizando ${eventosFirebase.length} eventos...`);

    const eventosActualizados = [];
    let creados = 0;
    let errores = 0;

    try {
      // 🔥 CARGAR TODOS LOS EVENTOS DE GOOGLE UNA SOLA VEZ (no dentro del loop)
      console.log('📥 Cargando eventos existentes de Google Calendar...');
      const eventosGoogleExistentes = await obtenerEventosGoogle(calendarId);
      console.log(`📊 ${eventosGoogleExistentes.length} eventos existentes en Google Calendar`);

      // 🔥 PROCESAR CADA EVENTO DEL ARRAY
      for (const evento of eventosFirebase) {
        try {
          // 🔥 SI YA TIENE googleEventId, SALTARLO (ya está sincronizado)
          if (evento.googleEventId) {
            console.log(`⏭️ Evento ya sincronizado (tiene googleEventId): ${evento.titulo}`);
            continue;
          }

          // Verificar si el evento ya existe en Google Calendar (por título + fecha)
          const fechaEventoISO = new Date(evento.fecha).toISOString();
          const existeEnGoogle = eventosGoogleExistentes.some(e => {
            const fechaGoogle = e.start?.dateTime || e.start?.date;
            if (!fechaGoogle) return false;
            const fechaGoogleISO = new Date(fechaGoogle).toISOString();
            return e.summary === evento.titulo && fechaGoogleISO === fechaEventoISO;
          });

          if (existeEnGoogle) {
            console.log(`⏭️ Evento ya existe en Google Calendar: ${evento.titulo}`);
            // Buscar el evento existente para obtener su ID
            const eventoExistente = eventosGoogleExistentes.find(e => {
              const fechaGoogle = e.start?.dateTime || e.start?.date;
              if (!fechaGoogle) return false;
              return e.summary === evento.titulo && 
                     new Date(fechaGoogle).toISOString() === fechaEventoISO;
            });
            
            if (eventoExistente) {
              eventosActualizados.push({
                id: evento.id,
                googleEventId: eventoExistente.id,
                titulo: evento.titulo,
                fecha: evento.fecha
              });
            }
            continue;
          }

          // 🔥 CREAR EVENTO EN GOOGLE CALENDAR
          console.log(`➕ Creando evento en Google Calendar: ${evento.titulo}`);
          
          const fechaInicio = new Date(evento.fecha);
          
          // Si tiene hora, usar esa hora; si no, usar 08:00
          if (evento.hora) {
            const [horas, minutos] = evento.hora.split(':').map(Number);
            fechaInicio.setHours(horas, minutos, 0, 0);
          } else {
            fechaInicio.setHours(8, 0, 0, 0);
          }
          
          // Fecha fin
          let fechaFin = new Date(fechaInicio);
          if (evento.horaFin) {
            const [horasFin, minutosFin] = evento.horaFin.split(':').map(Number);
            fechaFin.setHours(horasFin, minutosFin, 0, 0);
          } else {
            fechaFin.setHours(fechaInicio.getHours() + 10, fechaInicio.getMinutes(), 0, 0);
          }

          const eventoGoogle = {
            summary: evento.titulo || 'Evento sin título',
            description: evento.descripcion || '',
            start: {
              dateTime: fechaInicio.toISOString(),
              timeZone: 'America/Santo_Domingo'
            },
            end: {
              dateTime: fechaFin.toISOString(),
              timeZone: 'America/Santo_Domingo'
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 30 }
              ]
            }
          };

          const response = await axios.post(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
            eventoGoogle,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data && response.data.id) {
            console.log(`✅ Evento creado en Google Calendar: ${response.data.id}`);
            eventosActualizados.push({
              id: evento.id,
              googleEventId: response.data.id,
              titulo: evento.titulo,
              fecha: evento.fecha
            });
            creados++;
          } else {
            console.warn(`⚠️ Evento creado pero sin ID: ${evento.titulo}`);
            errores++;
          }

          // 🔥 PEQUEÑA PAUSA ENTRE EVENTOS PARA RESPETAR LA CUOTA
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (eventoError) {
          console.error(`❌ Error sincronizando evento "${evento.titulo}":`, eventoError.message);
          
          // Si es error de cuota, detener todo
          if (eventoError.code === 8 || 
              eventoError.response?.status === 429 ||
              eventoError.response?.data?.error?.message?.includes('Quota exceeded')) {
            console.warn('⚠️ Cuota de Google Calendar excedida, deteniendo sincronización');
            throw new Error('Quota exceeded');
          }
          
          errores++;
        }
      }

      console.log(`📊 Sincronización completada: ${creados} creados, ${errores} errores, ${eventosActualizados.length} actualizados`);

      return { 
        success: true, 
        creados, 
        errores, 
        eventosActualizados,
        total: eventosFirebase.length
      };
      
    } catch (error) {
      console.error('❌ Error al sincronizar eventos:', error);
      
      // Si es error de cuota, retornar lo que se logró sincronizar
      if (error.message === 'Quota exceeded') {
        setError('Se ha excedido la cuota de Google Calendar');
        return { 
          success: true, 
          creados, 
          errores, 
          eventosActualizados,
          quotaExceeded: true
        };
      }
      
      setError('Error al sincronizar eventos');
      return { 
        success: false, 
        error: error.message,
        creados,
        errores,
        eventosActualizados
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    error,
    calendars,
    login,
    logout,
    loadCalendars,
    crearEventoGoogle,
    obtenerEventosGoogle,
    actualizarEventoGoogle,
    eliminarEventoGoogle,
    sincronizarEventos
  };

  return (
    <GoogleCalendarContext.Provider value={value}>
      {children}
    </GoogleCalendarContext.Provider>
  );
};