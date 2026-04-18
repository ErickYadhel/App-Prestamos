// E:\prestamos-eys\backend\routes\clientes.js
const express = require('express');
const admin = require('firebase-admin');
const Cliente = require('../models/Cliente');
const router = express.Router();

const db = admin.firestore();

// ============================================
// FUNCIÓN PARA GENERAR ID LIMPIO
// ============================================
const generarIdCliente = (nombre) => {
  // Limpiar el nombre: eliminar acentos, espacios y caracteres especiales
  const limpio = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, ' '); // Múltiples espacios a uno solo
  
  // Convertir a PascalCase (JuanPerez)
  const pascalCase = limpio
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join('');
  
  // Añadir timestamp si es necesario para evitar colisiones
  // Opcional: añadir sufijo numérico si hay duplicados
  return pascalCase;
};

// ============================================
// FUNCIÓN PARA VERIFICAR Y GENERAR ID ÚNICO
// ============================================
const generarIdUnico = async (nombreBase, contador = 0) => {
  let idBase = generarIdCliente(nombreBase);
  
  if (contador > 0) {
    idBase = `${idBase}${contador}`;
  }
  
  // Verificar si ya existe un documento con ese ID
  const docRef = db.collection('clientes').doc(idBase);
  const docSnap = await docRef.get();
  
  if (docSnap.exists) {
    // Si existe, intentar con contador +1
    return generarIdUnico(nombreBase, contador + 1);
  }
  
  return idBase;
};

// POST /api/clientes - Crear nuevo cliente (MODIFICADO)
router.post('/', async (req, res) => {
  try {
    const clienteData = req.body;
    console.log('Creando nuevo cliente:', clienteData);

    // Validar nombre
    if (!clienteData.nombre || clienteData.nombre.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es obligatorio y debe tener al menos 2 caracteres'
      });
    }

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

    // 🔥 GENERAR ID PERSONALIZADO BASADO EN EL NOMBRE
    const idPersonalizado = await generarIdUnico(clienteData.nombre);
    console.log(`📝 ID generado: ${idPersonalizado} para cliente: ${clienteData.nombre}`);

    // Crear en Firestore con ID personalizado
    const docRef = db.collection('clientes').doc(idPersonalizado);
    cliente.id = idPersonalizado;
    cliente.fechaCreacion = new Date();
    cliente.activo = true;
    cliente.nombreOriginal = clienteData.nombre; // Guardar nombre original

    await docRef.set({ ...cliente });

    console.log('✅ Cliente creado exitosamente con ID:', idPersonalizado);

    res.status(201).json({
      success: true,
      data: { id: idPersonalizado, ...cliente },
      message: 'Cliente creado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error creando cliente:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/clientes/:id - Actualizar cliente (MODIFICADO)
router.put('/:id', async (req, res) => {
  try {
    const clienteData = req.body;
    const oldId = req.params.id;
    console.log('Actualizando cliente:', oldId, clienteData);

    const clienteRef = db.collection('clientes').doc(oldId);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    const datosActuales = clienteDoc.data();

    // Verificar si la cédula ya existe en otro cliente
    if (clienteData.cedula && clienteData.cedula !== datosActuales.cedula) {
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

    // 🔥 Si el nombre cambió, necesitamos cambiar el ID del documento
    if (clienteData.nombre && clienteData.nombre !== datosActuales.nombre) {
      const nuevoId = await generarIdUnico(clienteData.nombre);
      console.log(`🔄 Nombre cambiado: ${datosActuales.nombre} → ${clienteData.nombre}`);
      console.log(`📝 Nuevo ID: ${nuevoId} (anterior: ${oldId})`);
      
      // Crear nuevo documento con el nuevo ID
      const nuevoDocRef = db.collection('clientes').doc(nuevoId);
      const nuevoDocData = {
        ...datosActuales,
        ...clienteData,
        id: nuevoId,
        nombreOriginal: clienteData.nombre,
        fechaActualizacion: new Date(),
        idAnterior: oldId // Registrar cambio de ID
      };
      
      await nuevoDocRef.set(nuevoDocData);
      
      // Eliminar documento antiguo
      await clienteRef.delete();
      
      console.log('✅ Cliente migrado a nuevo ID:', nuevoId);
      
      return res.json({
        success: true,
        data: { id: nuevoId, ...nuevoDocData },
        message: 'Cliente actualizado exitosamente (ID cambiado)'
      });
    }
    
    // Si el nombre no cambió, solo actualizar
    await clienteRef.update({
      ...clienteData,
      fechaActualizacion: new Date()
    });

    console.log('✅ Cliente actualizado exitosamente:', oldId);

    res.json({
      success: true,
      data: { id: oldId, ...clienteData },
      message: 'Cliente actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error actualizando cliente:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/clientes/:id - Obtener cliente específico (SIN CAMBIOS)
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

// DELETE /api/clientes/:id - Eliminar cliente (SIN CAMBIOS)
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

// GET /api/clientes (MODIFICADO - ordenar correctamente)
router.get('/', async (req, res) => {
  try {
    console.log('Obteniendo lista de clientes...');
    
    const clientesSnapshot = await db.collection('clientes')
      .where('activo', '==', true)
      .get();

    const clientes = [];
    clientesSnapshot.forEach(doc => {
      clientes.push({ id: doc.id, ...doc.data() });
    });

    // Ordenar por nombre manualmente (porque orderBy puede fallar sin índice)
    clientes.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

    console.log(`Se encontraron ${clientes.length} clientes activos`);

    res.json({
      success: true,
      data: clientes,
      count: clientes.length
    });

  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    
    // Fallback sin filtro
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
      
      clientes.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      
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
  }
});

module.exports = router;