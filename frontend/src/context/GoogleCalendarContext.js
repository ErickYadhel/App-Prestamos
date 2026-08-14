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

  // Crear evento en Google Calendar
  const crearEventoGoogle = async (eventoData) => {
    if (!accessToken) {
      setError('No hay sesión activa con Google');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const calendarId = eventoData.calendarId || 'primary';
      
      const evento = {
        summary: eventoData.titulo,
        description: eventoData.descripcion || '',
        start: {
          dateTime: new Date(eventoData.fecha).toISOString(),
          timeZone: 'America/Santo_Domingo'
        },
        end: {
          dateTime: new Date(eventoData.fechaFin || eventoData.fecha).toISOString(),
          timeZone: 'America/Santo_Domingo'
        },
        attendees: eventoData.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 }
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
        orderBy: 'startTime'
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
      const evento = {
        summary: eventoData.titulo,
        description: eventoData.descripcion || '',
        start: {
          dateTime: new Date(eventoData.fecha).toISOString(),
          timeZone: 'America/Santo_Domingo'
        },
        end: {
          dateTime: new Date(eventoData.fechaFin || eventoData.fecha).toISOString(),
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

  // Sincronizar eventos de Firebase a Google Calendar
  const sincronizarEventos = async (eventosFirebase, calendarId = 'primary') => {
    if (!accessToken) {
      setError('No hay sesión activa con Google');
      return { success: false, error: 'No hay sesión activa' };
    }

    setLoading(true);
    setError(null);

    let creados = 0;
    let errores = 0;

    try {
      for (const evento of eventosFirebase) {
        // Verificar si el evento ya existe en Google Calendar
        const eventosGoogle = await obtenerEventosGoogle(calendarId);
        const existe = eventosGoogle.some(e => 
          e.summary === evento.titulo && 
          e.start?.dateTime === new Date(evento.fecha).toISOString()
        );

        if (!existe) {
          const resultado = await crearEventoGoogle({
            titulo: evento.titulo,
            descripcion: evento.descripcion || '',
            fecha: evento.fecha,
            fechaFin: evento.fechaFin || evento.fecha,
            calendarId
          });

          if (resultado) {
            creados++;
          } else {
            errores++;
          }
        }
      }

      return { success: true, creados, errores };
    } catch (error) {
      console.error('Error al sincronizar eventos:', error);
      setError('Error al sincronizar eventos');
      return { success: false, error: 'Error al sincronizar' };
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