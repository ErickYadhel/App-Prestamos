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
  
  // 👈 REF PARA CONTROLAR QUE SOLO SE VERIFIQUE UNA VEZ
  const yaVerificado = useRef(false);

  const verificarAcceso = async () => {
    // Si ya se verificó, no hacer nada
    if (yaVerificado.current) {
      console.log('⏭️ [FRONTEND] Ya verificado, saltando...');
      return;
    }

    // Si no hay usuario, acceso permitido
    if (!user) {
      console.log('🔓 [FRONTEND] Sin usuario - Acceso permitido');
      setAccesoPermitido(true);
      setVerificando(false);
      yaVerificado.current = true;
      return;
    }

    try {
      setVerificando(true);
      
      console.log('👤 [FRONTEND] Usuario:', user.email || 'Sin email');
      console.log('🔒 [FRONTEND] Verificando acceso al sistema...');
      
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        console.log('⚠️ [FRONTEND] No hay usuario autenticado en Firebase Auth');
        setAccesoPermitido(true);
        setVerificando(false);
        yaVerificado.current = true;
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      console.log('🔑 [FRONTEND] Token obtenido correctamente');
      
      const response = await api.get('/auth/check-access', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📋 [FRONTEND] Respuesta:', response);
      
      if (response && response.permitido === false) {
        console.log('⛔ [FRONTEND] Acceso denegado:', response.mensaje);
        setAccesoPermitido(false);
        setMotivoBloqueo(response.mensaje);
        setReglaBloqueo(response.regla || 'Desconocida');
      } else {
        console.log('✅ [FRONTEND] Acceso permitido');
        setAccesoPermitido(true);
        setMotivoBloqueo(null);
        setReglaBloqueo(null);
      }
      
      // 👈 MARCAR COMO VERIFICADO
      yaVerificado.current = true;
      
    } catch (error) {
      console.error('❌ [FRONTEND] Error verificando acceso:', error.message);
      setAccesoPermitido(true);
      setMotivoBloqueo(null);
      setReglaBloqueo(null);
      yaVerificado.current = true;
    } finally {
      setVerificando(false);
    }
  };

  // Verificar acceso SOLO UNA VEZ cuando el usuario cambie
  useEffect(() => {
    // Si está cargando, esperar
    if (authLoading) return;
    
    // Si ya se verificó, no hacer nada
    if (yaVerificado.current) return;
    
    // Si hay usuario, verificar
    if (user) {
      verificarAcceso();
    } else {
      // Si no hay usuario, permitir acceso y marcar como verificado
      setAccesoPermitido(true);
      setVerificando(false);
      yaVerificado.current = true;
    }
  }, [user, authLoading]);

  // 👈 ELIMINAR EL INTERVALO QUE CAUSA EL BUCLE
  // useEffect con interval eliminado

  const value = {
    accesoPermitido,
    motivoBloqueo,
    reglaBloqueo,
    verificando,
    verificarAcceso
  };

  return (
    <AccessControlContext.Provider value={value}>
      {children}
    </AccessControlContext.Provider>
  );
};