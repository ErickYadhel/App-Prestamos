const express = require('express');
const admin = require('firebase-admin');
const Garante = require('../models/Garante');
const router = express.Router();

const db = admin.firestore();

// GET /api/garantes - Listar todos los garantes con filtros
router.get('/', async (req, res) => {
  try {
    const { clienteID, activo, search } = req.query;
    let query = db.collection('garantes');

    // Aplicar filtros
    if (clienteID) {
      query = query.where('clienteID', '==', clienteID);
    }
    if (activo !== undefined) {
      query = query.where('activo', '==', activo === 'true');
    }

    const garantesSnapshot = await query.get();
    
    const garantes = [];
    garantesSnapshot.forEach(doc => {
      garantes.push({ id: doc.id, ...doc.data() });
    });

    // Filtro de búsqueda en memoria (por nombre, cédula, etc.)
    let filteredGarantes = garantes;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredGarantes = garantes.filter(garante =>
        garante.nombre?.toLowerCase().includes(searchLower) ||
        garante.cedula?.includes(search) ||
        garante.celular?.includes(search)
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    filteredGarantes.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

    res.json({
      success: true,
      data: filteredGarantes,
      count: filteredGarantes.length
    });
  } catch (error) {
    console.error('Error fetching guarantors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/garantes/:id - Obtener garante específico
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('garantes').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Garante no encontrado'
      });
    }

    // Obtener información del cliente asociado
    const garanteData = doc.data();
    let clienteInfo = null;
    
    if (garanteData.clienteID) {
      const clienteDoc = await db.collection('clientes').doc(garanteData.clienteID).get();
      if (clienteDoc.exists) {
        clienteInfo = {
          id: clienteDoc.id,
          nombre: clienteDoc.data().nombre,
          cedula: clienteDoc.data().cedula
        };
      }
    }

    res.json({
      success: true,
      data: { 
        id: doc.id, 
        ...garanteData,
        clienteInfo 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/garantes - Crear nuevo garante
router.post('/', async (req, res) => {
  try {
    const garanteData = req.body;
    const garante = new Garante(garanteData);
    
    // Validar datos del garante
    garante.validar();

    // Verificar que el cliente existe
    if (garante.clienteID) {
      const clienteDoc = await db.collection('clientes').doc(garante.clienteID).get();
      if (!clienteDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }
    }

    // Verificar si la cédula ya existe
    const cedulaExistente = await db.collection('garantes')
      .where('cedula', '==', garante.cedula)
      .get();

    if (!cedulaExistente.empty) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un garante con esta cédula'
      });
    }

    // Crear en Firestore
    const docRef = db.collection('garantes').doc();
    garante.id = docRef.id;
    garante.fechaCreacion = new Date();

    await docRef.set({ ...garante });

    res.status(201).json({
      success: true,
      data: garante,
      message: 'Garante creado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/garantes/:id - Actualizar garante
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const garanteData = req.body;

    const garanteRef = db.collection('garantes').doc(id);
    const garanteDoc = await garanteRef.get();

    if (!garanteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Garante no encontrado'
      });
    }

    // Validar datos si se está actualizando la cédula
    if (garanteData.cedula && garanteData.cedula !== garanteDoc.data().cedula) {
      const cedulaExistente = await db.collection('garantes')
        .where('cedula', '==', garanteData.cedula)
        .get();

      if (!cedulaExistente.empty) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un garante con esta cédula'
        });
      }
    }

    // Actualizar fecha de modificación
    garanteData.fechaModificacion = new Date();

    await garanteRef.update(garanteData);

    res.json({
      success: true,
      data: { id, ...garanteData },
      message: 'Garante actualizado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/garantes/:id - Eliminar garante (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const garanteRef = db.collection('garantes').doc(id);
    const garanteDoc = await garanteRef.get();

    if (!garanteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Garante no encontrado'
      });
    }

    // Soft delete - marcar como inactivo en lugar de eliminar
    await garanteRef.update({
      activo: false,
      fechaEliminacion: new Date()
    });

    res.json({
      success: true,
      message: 'Garante eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/garantes/cliente/:clienteID - Obtener garantes de un cliente específico
router.get('/cliente/:clienteID', async (req, res) => {
  try {
    const { clienteID } = req.params;

    const garantesSnapshot = await db.collection('garantes')
      .where('clienteID', '==', clienteID)
      .where('activo', '==', true)
      .get();
    
    const garantes = [];
    garantesSnapshot.forEach(doc => {
      garantes.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: garantes,
      count: garantes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/garantes/stats/estadisticas - Estadísticas de garantes
router.get('/stats/estadisticas', async (req, res) => {
  try {
    const garantesSnapshot = await db.collection('garantes').get();
    
    const garantes = [];
    garantesSnapshot.forEach(doc => {
      garantes.push(doc.data());
    });

    const totalGarantes = garantes.length;
    const garantesActivos = garantes.filter(g => g.activo !== false).length;
    const garantesConPrestamosActivos = garantes.filter(g => g.prestamosActivos > 0).length;

    // Estadísticas por provincia
    const garantesPorProvincia = garantes.reduce((acc, garante) => {
      const provincia = garante.provincia || 'No especificada';
      acc[provincia] = (acc[provincia] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: totalGarantes,
        activos: garantesActivos,
        conPrestamosActivos: garantesConPrestamosActivos,
        porProvincia: garantesPorProvincia
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;