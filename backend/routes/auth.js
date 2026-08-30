const express = require('express');
const admin = require('firebase-admin');
const Usuario = require('../models/Usuario');
const router = express.Router();

// ============================================
// VALIDACIONES Y SANITIZACIÓN
// ============================================

// Función para sanitizar entrada
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, ''); // Eliminar caracteres peligrosos
  }
  return input;
};

// Función para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para validar contraseña (mínimo 6 caracteres)
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// ============================================
// REGISTRAR NUEVO USUARIO
// ============================================

router.post('/register', async (req, res) => {
  try {
    // 1. Sanitizar y validar entrada
    const { email, password, nombre, rol } = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: email, password, nombre'
      });
    }

    // Validar email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'El formato del email no es válido'
      });
    }

    // Validar contraseña
    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Sanitizar entrada
    const emailSanitizado = sanitizeInput(email).toLowerCase();
    const nombreSanitizado = sanitizeInput(nombre);
    const rolSanitizado = sanitizeInput(rol) || 'consultor';

    // 2. Verificar si el usuario ya existe (prevención)
    try {
      const existingUser = await admin.auth().getUserByEmail(emailSanitizado);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un usuario con este email'
        });
      }
    } catch (error) {
      // El usuario no existe, continuar (error esperado)
      if (error.code !== 'auth/user-not-found') {
        console.error('⚠️ Error al verificar usuario:', error.message);
      }
    }

    // 3. Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: emailSanitizado,
      password,
      displayName: nombreSanitizado,
      disabled: false
    });

    // 4. Guardar datos adicionales en Firestore
    const userData = {
      id: userRecord.uid,
      email: emailSanitizado,
      nombre: nombreSanitizado,
      rol: rolSanitizado,
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    await admin.firestore()
      .collection('usuario')
      .doc(userRecord.uid)
      .set(userData);

    // 5. Respuesta exitosa (sin exponer datos sensibles)
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      user: {
        id: userRecord.uid,
        email: emailSanitizado,
        nombre: nombreSanitizado,
        rol: rolSanitizado
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', {
      code: error.code,
      message: error.message
    });

    // Manejo de errores específicos de Firebase
    let errorMessage = 'Error al registrar usuario';
    let statusCode = 400;

    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Ya existe un usuario con este email';
      statusCode = 400;
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'El formato del email no es válido';
      statusCode = 400;
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      statusCode = 400;
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'El registro de usuarios no está habilitado';
      statusCode = 403;
    } else {
      // Error genérico (no exponer detalles internos)
      statusCode = 500;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

// ============================================
// OBTENER PERFIL DE USUARIO
// ============================================

router.get('/profile', async (req, res) => {
  try {
    // 1. Extraer y validar token
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    // 2. Verificar token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error('❌ Token inválido:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    // 3. Obtener datos del usuario desde Firestore
    const userDoc = await admin.firestore()
      .collection('usuario')
      .doc(decodedToken.uid)
      .get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado en la base de datos'
      });
    }

    const userData = userDoc.data();

    // 4. Responder con datos del usuario (sin exponer información sensible)
    res.json({
      success: true,
      user: {
        id: userData.id || decodedToken.uid,
        email: userData.email,
        nombre: userData.nombre,
        rol: userData.rol,
        activo: userData.activo,
        fechaCreacion: userData.fechaCreacion,
        fechaActualizacion: userData.fechaActualizacion || userData.fechaCreacion
      }
    });

  } catch (error) {
    console.error('❌ Error en perfil:', {
      code: error.code,
      message: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener el perfil del usuario'
    });
  }
});

// ============================================
// ENDPOINT PARA VERIFICAR TOKEN (Útil para frontend)
// ============================================

router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token requerido'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    res.json({
      success: true,
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      error: 'Token inválido'
    });
  }
});

// ============================================
// ENDPOINT PARA CERRAR SESIÓN (Opcional)
// ============================================

router.post('/logout', async (req, res) => {
  try {
    // El cierre de sesión se maneja en el frontend
    // Este endpoint es solo para logging o acciones adicionales
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cerrar sesión'
    });
  }
});

module.exports = router;