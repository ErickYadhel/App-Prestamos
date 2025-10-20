const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "eysinversiones-2071c",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://eysinversiones-2071c.firebaseio.com"
});

const db = admin.firestore();

// Importar todas las rutas
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const prestamosRoutes = require('./routes/prestamos');
const pagosRoutes = require('./routes/pagos');
const solicitudesRoutes = require('./routes/solicitudes');
const garantesRoutes = require('./routes/garantes');
const usuarioRoutes = require('./routes/usuario');
const configuracionRoutes = require('./routes/configuracion');
const notificacionesRoutes = require('./routes/notificaciones');

// Usar todas las rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/garantes', garantesRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Rutas básicas de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Sistema de Préstamos EYS Inversiones funcionando!',
    version: '1.0.0',
    modules: ['Auth', 'Clientes', 'Préstamos', 'Pagos', 'Solicitudes'],
    endpoints: {
      auth: '/api/auth',
      clientes: '/api/clientes',
      prestamos: '/api/prestamos', 
      pagos: '/api/pagos',
      solicitudes: '/api/solicitudes'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Firebase Firestore',
    authentication: 'Firebase Auth'
  });
});

// Crear usuario admin por defecto (temporal)
async function createDefaultAdmin() {
  try {
    const usersRef = db.collection('usuarios');
    const snapshot = await usersRef.where('email', '==', 'admin@eysinversiones.com').get();
    
    if (snapshot.empty) {
      const adminUser = {
        id: 'admin-default',
        email: 'admin@eysinversiones.com',
        nombre: 'Administrador EYS',
        rol: 'admin',
        activo: true,
        fechaCreacion: new Date()
      };
      
      await usersRef.doc(adminUser.id).set(adminUser);
      console.log('✅ Usuario admin creado por defecto');
      console.log('📧 Email: admin@eysinversiones.com');
      console.log('🔑 Rol: admin');
    } else {
      console.log('✅ Usuario admin ya existe');
    }
  } catch (error) {
    console.log('⚠️  Error creando usuario admin:', error.message);
  }
}

createDefaultAdmin();

// Iniciar servidor
app.listen(PORT, () => {
  console.log('=' .repeat(50));
  console.log('🚀 SISTEMA DE PRÉSTAMOS EYS INVERSIONES');
  console.log('=' .repeat(50));
  console.log(`🎯 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Firebase Project: eysinversiones-2071c`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log('');
  console.log('📋 ENDPOINTS DISPONIBLES:');
  console.log(`🔐 Auth          http://localhost:${PORT}/api/auth`);
  console.log(`👥 Clientes      http://localhost:${PORT}/api/clientes`);
  console.log(`💰 Préstamos     http://localhost:${PORT}/api/prestamos`);
  console.log(`💳 Pagos         http://localhost:${PORT}/api/pagos`);
  console.log(`📋 Solicitudes   http://localhost:${PORT}/api/solicitudes`);
  console.log(`❤️  Health        http://localhost:${PORT}/health`);
  console.log('');
  console.log('🎨 Colores: Rojo y Negro');
  console.log('⚡ Modo: Desarrollo');
  console.log('=' .repeat(50));
});

module.exports = { app, db, admin };