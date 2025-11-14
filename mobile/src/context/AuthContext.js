import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import api from '../services/api';
import { AsyncStorage } from 'react-native';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Para desarrollo: crear usuario local
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            nombre: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            rol: 'admin'
          };
          setUser(userData);
          await AsyncStorage.setItem('authToken', await firebaseUser.getIdToken());
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error obteniendo datos del usuario:', error);
          // Fallback con datos básicos
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            nombre: 'Administrador',
            rol: 'admin'
          };
          setUser(userData);
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        nombre: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        rol: 'admin'
      };

      setUser(userData);
      await AsyncStorage.setItem('authToken', await firebaseUser.getIdToken());
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas';
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
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
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