const express = require('express');
const admin = require('firebase-admin');
const Usuario = require('../models/Usuario');
const router = express.Router();

const db = admin.firestore();

// GET /api/usuarios - Listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuariosSnapshot = await db.collection('usuario').get();
    
    const usuarios = [];
    usuariosSnapshot.forEach(doc => {
      usuarios.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: usuario,
      count: usuario.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;

    // Validar rol
    const rolesValidos = Object.values(User.roles);
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        error: `Rol inválido. Roles válidos: ${rolesValidos.join(', ')}`
      });
    }

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nombre
    });

    // Guardar en Firestore
    const userData = {
      id: userRecord.uid,
      email,
      nombre,
      rol,
      activo: true,
      fechaCreacion: new Date()
    };

    await db.collection('usuario').doc(userRecord.uid).set(userData);

    res.status(201).json({
      success: true,
      data: userData,
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, rol, activo } = req.body;

    const userRef = db.collection('usuario').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const actualizaciones = {};
    if (nombre !== undefined) actualizaciones.nombre = nombre;
    if (rol !== undefined) actualizaciones.rol = rol;
    if (activo !== undefined) actualizaciones.activo = activo;

    await userRef.update(actualizaciones);

    res.json({
      success: true,
      data: { id, ...actualizaciones },
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;