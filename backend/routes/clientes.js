const express = require('express');
const admin = require('firebase-admin');
const Cliente = require('../models/Cliente');
const router = express.Router();

const db = admin.firestore();

// GET /api/clientes - Listar todos los clientes
router.get('/', async (req, res) => {
  try {
    console.log('Obteniendo lista de clientes...');
    
    const clientesSnapshot = await db.collection('clientes')
      .where('activo', '==', true)
      .orderBy('nombre', 'asc')
      .get();

    const clientes = [];
    clientesSnapshot.forEach(doc => {
      clientes.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Se encontraron ${clientes.length} clientes activos`);

    res.json({
      success: true,
      data: clientes,
      count: clientes.length
    });

  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    
    // Si hay error de índice, intentar sin filtro
    if (error.code === 9) { // FAILED_PRECONDITION - índice requerido
      try {
        console.log('Intentando obtener clientes sin filtro...');
        const clientesSnapshot = await db.collection('clientes').get();
        const clientes = [];
        clientesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.activo !== false) {
            clientes.push({ id: doc.id, ...data });
          }
        });
        
        res.json({
          success: true,
          data: clientes,
          count: clientes.length,
          warning: 'Usando datos sin filtro activo - índice en creación'
        });
      } catch (fallbackError) {
        res.status(500).json({
          success: false,
          error: 'Error obteniendo clientes: ' + fallbackError.message
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo clientes: ' + error.message
      });
    }
  }
});

// POST /api/clientes - Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const clienteData = req.body;
    console.log('Creando nuevo cliente:', clienteData);

    const cliente = new Cliente(clienteData);
    
    // Validar datos del cliente
    cliente.validar();

    // Verificar si la cédula ya existe
    const cedulaExistente = await db.collection('clientes')
      .where('cedula', '==', cliente.cedula)
      .get();

    if (!cedulaExistente.empty) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un cliente con esta cédula'
      });
    }

    // Crear en Firestore
    const docRef = db.collection('clientes').doc();
    cliente.id = docRef.id;
    cliente.fechaCreacion = new Date();
    cliente.activo = true;

    await docRef.set({ ...cliente });

    console.log('Cliente creado exitosamente:', cliente.id);

    res.status(201).json({
      success: true,
      data: cliente,
      message: 'Cliente creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/clientes/:id - Obtener cliente específico
router.get('/:id', async (req, res) => {
  try {
    const clienteDoc = await db.collection('clientes').doc(req.params.id).get();
    
    if (!clienteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: { id: clienteDoc.id, ...clienteDoc.data() }
    });

  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/clientes/:id - Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const clienteData = req.body;
    console.log('Actualizando cliente:', req.params.id, clienteData);

    const clienteRef = db.collection('clientes').doc(req.params.id);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Verificar si la cédula ya existe en otro cliente
    if (clienteData.cedula && clienteData.cedula !== clienteDoc.data().cedula) {
      const cedulaExistente = await db.collection('clientes')
        .where('cedula', '==', clienteData.cedula)
        .get();

      if (!cedulaExistente.empty) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe otro cliente con esta cédula'
        });
      }
    }

    // Actualizar cliente
    await clienteRef.update({
      ...clienteData,
      fechaActualizacion: new Date()
    });

    console.log('Cliente actualizado exitosamente:', req.params.id);

    res.json({
      success: true,
      data: { id: req.params.id, ...clienteData },
      message: 'Cliente actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/clientes/:id - Eliminar cliente (borrado lógico)
router.delete('/:id', async (req, res) => {
  try {
    console.log('Eliminando cliente:', req.params.id);

    const clienteRef = db.collection('clientes').doc(req.params.id);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Borrado lógico en lugar de eliminar físicamente
    await clienteRef.update({
      activo: false,
      fechaEliminacion: new Date()
    });

    console.log('Cliente marcado como inactivo:', req.params.id);

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;