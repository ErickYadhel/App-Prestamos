// ============================
// CONFIGURACIÓN DE FIREBASE
// ============================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================
// CONFIGURACIÓN DESDE VARIABLES DE ENTORNO
// ============================

// Opción 1: Usar variables de entorno (RECOMENDADO PARA PRODUCCIÓN)
// En Render: Configurar REACT_APP_FIREBASE_API_KEY, etc.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBwBA7THL0xOYNqpVnm91RWhuK53bf08J4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "eysinversiones-2071c.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "eysinversiones-2071c",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "eysinversiones-2071c.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "768056000483",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:768056000483:web:1b1999eb276bc4402dead6",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-2KJC0870TD"
};

// ============================
// VALIDACIÓN DE CONFIGURACIÓN
// ============================

// Verificar que la configuración esté completa en producción
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ Advertencia: Faltan variables de entorno de Firebase:', missingKeys);
    console.warn('⚠️ Usando valores de fallback (NO RECOMENDADO en producción)');
  }
}

// ============================
// INICIALIZAR FIREBASE
// ============================

// Inicializar la app de Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ============================
// LOG DE CONFIGURACIÓN
// ============================

console.log('🔥 Firebase inicializado con:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  environment: isProduction ? 'PRODUCCIÓN' : 'DESARROLLO',
  usingEnvVars: !!process.env.REACT_APP_FIREBASE_API_KEY
});

// ============================
// EXPORTAR SERVICIOS
// ============================

export { auth, db, storage, app };

// Exportar también la configuración por si se necesita
export { firebaseConfig };