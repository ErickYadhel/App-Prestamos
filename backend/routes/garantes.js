const express = require('express');
const admin = require('firebase-admin');
const Garante = require('../models/Garante');
const router = express.Router();

const db = admin.firestore();

// ============================================
// FUNCIÓN PARA GENERAR ID PERSONALIZADO DEL GARANTE
// ============================================
const generarIdGarante = (nombre) => {
  if (!nombre || nombre.trim().length === 0) {
    return null;
  }
  
  // Limpiar el nombre: eliminar acentos, espacios y caracteres especiales
  const nombreLimpio = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, ' ');
  
  // Convertir a PascalCase (JuanPerez)
  const idGenerado = nombreLimpio
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join('');
  
  console.log('🔑 ID generado para garante:', idGenerado);
  console.log('   Nombre original:', nombre);
  console.log('   Nombre limpio:', nombreLimpio);
  
  return idGenerado;
};

// ============================================
// FUNCIÓN PARA VERIFICAR Y GENERAR ID ÚNICO (con contador si colisión)
// ============================================
const generarIdGaranteUnico = async (nombreBase, contador = 0) => {
  let idBase = generarIdGarante(nombreBase);
  
  if (!idBase) {
    // Fallback a timestamp si no hay nombre
    return `garante-${Date.now()}`;
  }
  
  if (contador > 0) {
    idBase = `${idBase}${contador}`;
  }
  
  // Verificar si ya existe un garante con ese ID
  const garanteRef = db.collection('garantes').doc(idBase);
  const garanteSnap = await garanteRef.get();
  
  if (garanteSnap.exists) {
    // Si existe, intentar con contador +1
    return generarIdGaranteUnico(nombreBase, contador + 1);
  }
  
  return idBase;
};

// GET /api/garantes - Listar todos los garantes con filtros
router.get('/', async (req, res) => {
  try {
    const { clienteID, activo, search, tipoGarante } = req.query;
    let query = db.collection('garantes');

    if (clienteID) {
      query = query.where('clienteID', '==', clienteID);
    }
    if (activo !== undefined) {
      query = query.where('activo', '==', activo === 'true');
    }
    if (tipoGarante) {
      query = query.where('tipoGarante', '==', tipoGarante);
    }

    const garantesSnapshot = await query.get();
    
    const garantes = [];
    garantesSnapshot.forEach(doc => {
      const data = doc.data();
      garantes.push({ 
        id: doc.id, 
        ...data,
        nombre: data.nombre || data.nombreCompleto || 'Sin nombre'
      });
    });

    // Filtro de búsqueda en memoria
    let filteredGarantes = garantes;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredGarantes = garantes.filter(garante =>
        garante.nombre?.toLowerCase().includes(searchLower) ||
        garante.cedula?.includes(search) ||
        garante.celular?.includes(search) ||
        garante.email?.toLowerCase().includes(searchLower) ||
        garante.clienteNombre?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    filteredGarantes.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

    console.log(`✅ Encontrados ${filteredGarantes.length} garantes`);

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

    const garanteData = doc.data();
    let clienteInfo = null;
    
    if (garanteData.clienteID) {
      const clienteDoc = await db.collection('clientes').doc(garanteData.clienteID).get();
      if (clienteDoc.exists) {
        clienteInfo = {
          id: clienteDoc.id,
          nombre: clienteDoc.data().nombre,
          cedula: clienteDoc.data().cedula,
          telefono: clienteDoc.data().telefono
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
    console.error('Error fetching guarantor:', error);
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
    
    console.log('📝 Creando garante:', {
      nombre: garanteData.nombre,
      cedula: garanteData.cedula,
      celular: garanteData.celular,
      clienteID: garanteData.clienteID
    });
    
    // Validar que el nombre existe para generar el ID
    if (!garanteData.nombre || garanteData.nombre.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del garante es requerido'
      });
    }
    
    const garante = new Garante(garanteData);
    
    // Validar datos del garante (ya no valida dígito verificador)
    try {
      garante.validar();
    } catch (validationError) {
      console.error('❌ Error de validación:', validationError.message);
      return res.status(400).json({
        success: false,
        error: validationError.message
      });
    }

    // Verificar que el cliente existe
    if (garante.clienteID) {
      const clienteDoc = await db.collection('clientes').doc(garante.clienteID).get();
      if (!clienteDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }
      
      // Si no se proporcionó clienteNombre, obtenerlo del cliente
      if (!garante.clienteNombre) {
        const cliente = clienteDoc.data();
        garante.clienteNombre = cliente.nombre;
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

    // Calcular capacidad de endeudamiento
    if (garante.sueldo && garante.sueldo > 0) {
      garante.capacidadEndeudamiento = garante.calcularCapacidadEndeudamiento();
    }

    // Generar ID personalizado basado en el nombre
    const idPersonalizado = await generarIdGaranteUnico(garanteData.nombre);
    console.log(`📝 ID generado para garante: ${idPersonalizado}`);
    
    const docRef = db.collection('garantes').doc(idPersonalizado);
    garante.id = idPersonalizado;
    garante.fechaCreacion = new Date();

    await docRef.set({ ...garante });

    console.log(`✅ Garante creado: ${garante.nombre} (${idPersonalizado})`);

    res.status(201).json({
      success: true,
      data: { id: idPersonalizado, ...garante },
      message: 'Garante creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating guarantor:', error);
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

    const garanteActual = garanteDoc.data();

    // Validar nombre
    if (garanteData.nombre !== undefined && !garanteData.nombre.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del garante es requerido'
      });
    }

    // Validar cédula si se está actualizando (solo validar que tenga 11 dígitos)
    if (garanteData.cedula && garanteData.cedula !== garanteActual.cedula) {
      const cedulaLimpia = garanteData.cedula.replace(/\D/g, '');
      if (cedulaLimpia.length !== 11) {
        return res.status(400).json({
          success: false,
          error: 'La cédula debe tener 11 dígitos'
        });
      }
      
      // Verificar que no exista otro garante con esa cédula
      const cedulaExistente = await db.collection('garantes')
        .where('cedula', '==', garanteData.cedula)
        .get();

      if (!cedulaExistente.empty && cedulaExistente.docs[0].id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un garante con esta cédula'
        });
      }
    }

    // Validar celular
    if (garanteData.celular !== undefined) {
      const telefonoLimpio = garanteData.celular.replace(/\D/g, '');
      if (telefonoLimpio.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'El teléfono debe tener al menos 10 dígitos'
        });
      }
    }

    // Recalcular capacidad de endeudamiento si cambió el sueldo
    if (garanteData.sueldo !== undefined && garanteData.sueldo !== garanteActual.sueldo) {
      const garanteTemp = new Garante({ ...garanteActual, ...garanteData });
      garanteData.capacidadEndeudamiento = garanteTemp.calcularCapacidadEndeudamiento();
    }

    // Si el nombre cambió, necesitamos cambiar el ID del documento
    if (garanteData.nombre && garanteData.nombre !== garanteActual.nombre) {
      const nuevoId = await generarIdGaranteUnico(garanteData.nombre);
      console.log(`🔄 Nombre cambiado: ${garanteActual.nombre} → ${garanteData.nombre}`);
      console.log(`📝 Nuevo ID: ${nuevoId} (anterior: ${id})`);
      
      // Crear nuevo documento con el nuevo ID
      const nuevoDocRef = db.collection('garantes').doc(nuevoId);
      const nuevoDocData = {
        ...garanteActual,
        ...garanteData,
        id: nuevoId,
        nombreOriginal: garanteData.nombre,
        fechaModificacion: new Date(),
        idAnterior: id
      };
      
      await nuevoDocRef.set(nuevoDocData);
      
      // Eliminar documento antiguo
      await garanteRef.delete();
      
      console.log(`✅ Garante migrado a nuevo ID: ${nuevoId}`);
      
      return res.json({
        success: true,
        data: { id: nuevoId, ...nuevoDocData },
        message: 'Garante actualizado exitosamente (ID cambiado)'
      });
    }

    // Si el nombre no cambió, solo actualizar
    garanteData.fechaModificacion = new Date();
    await garanteRef.update(garanteData);

    console.log(`✅ Garante actualizado: ${id}`);

    const garanteActualizado = await garanteRef.get();

    res.json({
      success: true,
      data: { id, ...garanteActualizado.data() },
      message: 'Garante actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating guarantor:', error);
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

    console.log(`✅ Garante desactivado: ${id}`);

    res.json({
      success: true,
      message: 'Garante eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting guarantor:', error);
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
    console.error('Error fetching guarantors by client:', error);
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
    const garantesPorTipo = {
      personal: garantes.filter(g => g.tipoGarante === 'personal').length,
      comercial: garantes.filter(g => g.tipoGarante === 'comercial').length
    };

    // Estadísticas por provincia
    const garantesPorProvincia = garantes.reduce((acc, garante) => {
      const provincia = garante.provincia || 'No especificada';
      acc[provincia] = (acc[provincia] || 0) + 1;
      return acc;
    }, {});

    // Capacidad de endeudamiento total
    const capacidadTotal = garantes.reduce((sum, g) => sum + (g.capacidadEndeudamiento || 0), 0);

    res.json({
      success: true,
      data: {
        total: totalGarantes,
        activos: garantesActivos,
        conPrestamosActivos: garantesConPrestamosActivos,
        porTipo: garantesPorTipo,
        porProvincia: garantesPorProvincia,
        capacidadEndeudamientoTotal: capacidadTotal
      }
    });
  } catch (error) {
    console.error('Error fetching guarantor stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/garantes/:id/prestamos - Obtener préstamos garantizados por un garante
router.get('/:id/prestamos', async (req, res) => {
  try {
    const { id } = req.params;
    
    const garanteDoc = await db.collection('garantes').doc(id).get();
    
    if (!garanteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Garante no encontrado'
      });
    }
    
    const garante = garanteDoc.data();
    const prestamosIds = garante.prestamosGarantizados || [];
    
    if (prestamosIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }
    
    // Obtener los préstamos garantizados
    const prestamos = [];
    for (const prestamoId of prestamosIds) {
      const prestamoDoc = await db.collection('prestamos').doc(prestamoId).get();
      if (prestamoDoc.exists) {
        prestamos.push({ id: prestamoDoc.id, ...prestamoDoc.data() });
      }
    }
    
    res.json({
      success: true,
      data: prestamos,
      count: prestamos.length
    });
  } catch (error) {
    console.error('Error fetching guarantor loans:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;