import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getAuth } from 'firebase/auth';
import api from '../services/api';

const AccessControlContext = createContext();

export const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl debe usarse dentro de AccessControlProvider');
  }
  return context;
};

export const AccessControlProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [accesoPermitido, setAccesoPermitido] = useState(true);
  const [motivoBloqueo, setMotivoBloqueo] = useState(null);
  const [reglaBloqueo, setReglaBloqueo] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const yaVerificado = useRef(false);

  const verificarAcceso = async (forzado = false) => {
    if (!forzado && yaVerificado.current) {
      return;
    }

    if (!user) {
      setAccesoPermitido(true);
      setVerificando(false);
      yaVerificado.current = true;
      return;
    }

    try {
      setVerificando(true);
      
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        setAccesoPermitido(true);
        setVerificando(false);
        yaVerificado.current = true;
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      
      const response = await api.get('/auth/check-access', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response && response.permitido === false) {
        setAccesoPermitido(false);
        setMotivoBloqueo(response.mensaje);
        setReglaBloqueo(response.regla || 'Desconocida');
      } else {
        setAccesoPermitido(true);
        setMotivoBloqueo(null);
        setReglaBloqueo(null);
      }
      
      yaVerificado.current = true;
      
    } catch (error) {
      console.error('❌ [ACCESS] Error:', error.message);
      setAccesoPermitido(true);
      setMotivoBloqueo(null);
      setReglaBloqueo(null);
      yaVerificado.current = true;
    } finally {
      setVerificando(false);
    }
  };

  const forzarVerificacion = async () => {
    yaVerificado.current = false;
    await verificarAcceso(true);
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      verificarAcceso();
    } else {
      setAccesoPermitido(true);
      setVerificando(false);
    }
  }, [user, authLoading]);

  // Verificar cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !authLoading) {
        verificarAcceso();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [user, authLoading]);

  const value = {
    accesoPermitido,
    motivoBloqueo,
    reglaBloqueo,
    verificando,
    verificarAcceso: forzarVerificacion
  };

  return (
    <AccessControlContext.Provider value={value}>
      {children}
    </AccessControlContext.Provider>
  );
};