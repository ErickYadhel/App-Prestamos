import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Importar Firestore
import { auth, db } from '../services/firebase'; // Importar db
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener datos del usuario desde Firestore
  const obtenerUsuarioDesdeFirestore = async (email) => {
    try {
      console.log('🔍 Buscando usuario en Firestore por email:', email);
      
      // Buscar en la colección 'usuarios' por email
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Usuario encontrado en Firestore
        const usuarioDoc = querySnapshot.docs[0];
        const usuarioData = usuarioDoc.data();
        console.log('✅ Usuario encontrado en Firestore:', usuarioData);
        
        return {
          id: usuarioDoc.id,
          ...usuarioData
        };
      }
      
      console.log('⚠️ Usuario no encontrado en Firestore');
      return null;
    } catch (error) {
      console.error('❌ Error buscando usuario en Firestore:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log('👤 Usuario autenticado en Firebase Auth:', firebaseUser.email);
          
          // Obtener datos del usuario desde Firestore
          const firestoreUser = await obtenerUsuarioDesdeFirestore(firebaseUser.email);
          
          if (firestoreUser) {
            // Usuario encontrado en Firestore - usar su rol real
            console.log('✅ Usando datos de Firestore. Rol:', firestoreUser.rol);
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              nombre: firestoreUser.nombre || firebaseUser.displayName || firebaseUser.email.split('@')[0],
              rol: firestoreUser.rol || 'solicitante', // Usar el rol de Firestore
              telefono: firestoreUser.telefono,
              departamento: firestoreUser.departamento,
              color: firestoreUser.color,
              foto: firestoreUser.foto,
              activo: firestoreUser.activo
            });
          } else {
            // Usuario no encontrado en Firestore - usar datos básicos
            console.log('⚠️ Usuario no encontrado en Firestore, usando datos básicos');
            
            // Intentar obtener de la API como fallback
            try {
              const response = await api.get(`/usuarios?email=${firebaseUser.email}`);
              if (response.data && response.data.length > 0) {
                const apiUser = response.data[0];
                setUser({
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  nombre: apiUser.nombre || firebaseUser.email.split('@')[0],
                  rol: apiUser.rol || 'solicitante',
                  telefono: apiUser.telefono,
                  departamento: apiUser.departamento,
                  color: apiUser.color,
                  activo: apiUser.activo
                });
              } else {
                // Usuario por defecto
                setUser({
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  nombre: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                  rol: 'solicitante', // Rol por defecto para usuarios no encontrados
                  activo: true
                });
              }
            } catch (apiError) {
              console.error('❌ Error consultando API:', apiError);
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                nombre: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                rol: 'solicitante',
                activo: true
              });
            }
          }
          
          localStorage.setItem('authToken', await firebaseUser.getIdToken());
        } catch (error) {
          console.error('Error obteniendo datos del usuario:', error);
          // Fallback con datos básicos de Firebase
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            nombre: firebaseUser.displayName || 'Usuario',
            rol: 'solicitante',
            activo: true
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem('authToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Intentando login con:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Obtener datos del usuario desde Firestore después del login
      const firestoreUser = await obtenerUsuarioDesdeFirestore(firebaseUser.email);
      
      let userData;
      
      if (firestoreUser) {
        console.log('✅ Usuario autenticado con rol de Firestore:', firestoreUser.rol);
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          nombre: firestoreUser.nombre || firebaseUser.displayName || firebaseUser.email.split('@')[0],
          rol: firestoreUser.rol || 'solicitante',
          telefono: firestoreUser.telefono,
          departamento: firestoreUser.departamento,
          color: firestoreUser.color,
          foto: firestoreUser.foto,
          activo: firestoreUser.activo
        };
      } else {
        console.log('⚠️ Usuario autenticado pero no encontrado en Firestore');
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          nombre: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          rol: 'solicitante',
          activo: true
        };
      }
      
      setUser(userData);
      localStorage.setItem('authToken', await firebaseUser.getIdToken());
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Error en login:', error);
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado. Por favor verifica tu email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas. Verifica el email y contraseña.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};