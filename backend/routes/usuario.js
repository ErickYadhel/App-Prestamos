const express = require('express');
const admin = require('firebase-admin');
const Usuario = require('../models/Usuario');
const router = express.Router();

const db = admin.firestore();

// GET /api/usuarios - Listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    console.log('Obteniendo lista de usuarios...');
    
    const usuariosSnapshot = await db.collection('usuarios')
      .orderBy('nombre', 'asc')
      .get();

    const usuarios = [];
    usuariosSnapshot.forEach(doc => {
      const userData = doc.data();
      // No enviar la contraseña por seguridad
      const { password, ...userWithoutPassword } = userData;
      usuarios.push({ id: doc.id, ...userWithoutPassword });
    });

    console.log(`Se encontraron ${usuarios.length} usuarios`);

    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo usuarios: ' + error.message
    });
  }
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const usuarioData = req.body;
    console.log('Creando nuevo usuario:', { ...usuarioData, password: '***' }); // No loguear contraseña

    const usuario = new Usuario(usuarioData);
    usuario.validar();

    // Verificar si el email ya existe
    const emailExistente = await db.collection('usuarios')
      .where('email', '==', usuario.email)
      .get();

    if (!emailExistente.empty) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este email'
      });
    }

    // Crear usuario en Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: usuario.email,
        password: usuario.password, // USAR LA CONTRASEÑA PROPORCIONADA
        displayName: usuario.nombre,
        disabled: false
      });
    } catch (authError) {
      return res.status(400).json({
        success: false,
        error: 'Error creando usuario en autenticación: ' + authError.message
      });
    }

    // Crear en Firestore (sin guardar la contraseña en texto plano)
    const docRef = db.collection('usuarios').doc(userRecord.uid);
    usuario.id = userRecord.uid;
    usuario.fechaCreacion = new Date();
    usuario.activo = true;
    
    // Remover la contraseña antes de guardar en Firestore
    const { password, ...usuarioSinPassword } = usuario;

    await docRef.set({ ...usuarioSinPassword });

    console.log('Usuario creado exitosamente:', usuario.id);

    res.status(201).json({
      success: true,
      data: usuarioSinPassword,
      message: 'Usuario creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const usuarioData = req.body;
    console.log('Actualizando usuario:', req.params.id, { ...usuarioData, password: usuarioData.password ? '***' : undefined });

    const usuarioRef = db.collection('usuarios').doc(req.params.id);
    const usuarioDoc = await usuarioRef.get();

    if (!usuarioDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si el email ya existe en otro usuario
    if (usuarioData.email && usuarioData.email !== usuarioDoc.data().email) {
      const emailExistente = await db.collection('usuarios')
        .where('email', '==', usuarioData.email)
        .get();

      if (!emailExistente.empty) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe otro usuario con este email'
        });
      }

      // Actualizar email en Firebase Auth
      try {
        await admin.auth().updateUser(req.params.id, {
          email: usuarioData.email,
          displayName: usuarioData.nombre || usuarioDoc.data().nombre
        });
      } catch (authError) {
        console.error('Error actualizando usuario en auth:', authError);
      }
    }

    // Actualizar contraseña si se proporciona
    if (usuarioData.password) {
      try {
        await admin.auth().updateUser(req.params.id, {
          password: usuarioData.password
        });
        console.log('Contraseña actualizada para usuario:', req.params.id);
      } catch (authError) {
        console.error('Error actualizando contraseña:', authError);
        return res.status(400).json({
          success: false,
          error: 'Error actualizando contraseña: ' + authError.message
        });
      }
    }

    // Preparar actualizaciones (sin incluir la contraseña)
    const { password, ...usuarioSinPassword } = usuarioData;
    const actualizaciones = {
      ...usuarioSinPassword,
      fechaActualizacion: new Date()
    };

    await usuarioRef.update(actualizaciones);

    console.log('Usuario actualizado exitosamente:', req.params.id);

    res.json({
      success: true,
      data: { id: req.params.id, ...actualizaciones },
      message: 'Usuario actualizado exitosamente' + (usuarioData.password ? ' (contraseña actualizada)' : '')
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario (borrado lógico)
router.delete('/:id', async (req, res) => {
  try {
    console.log('Eliminando usuario:', req.params.id);

    const usuarioRef = db.collection('usuarios').doc(req.params.id);
    const usuarioDoc = await usuarioRef.get();

    if (!usuarioDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Borrado lógico en lugar de eliminar físicamente
    await usuarioRef.update({
      activo: false,
      fechaActualizacion: new Date()
    });

    // Deshabilitar usuario en Firebase Auth
    try {
      await admin.auth().updateUser(req.params.id, {
        disabled: true
      });
    } catch (authError) {
      console.error('Error deshabilitando usuario en auth:', authError);
    }

    console.log('Usuario marcado como inactivo:', req.params.id);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/usuarios/:id/reactivar - Reactivar usuario
router.put('/:id/reactivar', async (req, res) => {
  try {
    console.log('Reactivando usuario:', req.params.id);

    const usuarioRef = db.collection('usuarios').doc(req.params.id);
    const usuarioDoc = await usuarioRef.get();

    if (!usuarioDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    await usuarioRef.update({
      activo: true,
      fechaActualizacion: new Date()
    });

    // Reactivar usuario en Firebase Auth
    try {
      await admin.auth().updateUser(req.params.id, {
        disabled: false
      });
    } catch (authError) {
      console.error('Error reactivando usuario en auth:', authError);
    }

    console.log('Usuario reactivado exitosamente:', req.params.id);

    res.json({
      success: true,
      message: 'Usuario reactivado exitosamente'
    });

  } catch (error) {
    console.error('Error reactivando usuario:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;