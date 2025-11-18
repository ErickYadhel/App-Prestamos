const express = require('express');
const admin = require('firebase-admin');
const Usuario = require('../models/Usuario');
const router = express.Router();

// Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nombre
    });

    // Guardar datos adicionales en Firestore
    const userData = {
      id: userRecord.uid,
      email,
      nombre,
      rol: rol || 'consultor',  // ← FIX REALIZADO AQUÍ
      activo: true,
      fechaCreacion: new Date()
    };

    await admin.firestore().collection('usuario').doc(userRecord.uid).set(userData);

    res.status(201).json({
      success: true,
      user: userData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener perfil de usuario
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userDoc = await admin.firestore().collection('usuario').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user: userDoc.data()
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
});

module.exports = router;
