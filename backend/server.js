const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cron = require('node-cron');
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

// Importar rutas
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const prestamosRoutes = require('./routes/prestamos');
const pagosRoutes = require('./routes/pagos');
const solicitudesRoutes = require('./routes/solicitudes');
const garantesRoutes = require('./routes/garantes');
const dashboardRoutes = require('./routes/dashboard');
const usuarioRoutes = require('./routes/usuario');

// Importar módulo de notificaciones
const { 
  router: notificacionesRoutes, 
  generarRecordatoriosAutomaticos 
} = require('./routes/notificaciones');
app.use('/api/notificaciones', notificacionesRoutes);

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/garantes', garantesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);

// ===========================
// 🔧 CONFIGURACIÓN DE ENVÍO AUTOMÁTICO
// ===========================

async function obtenerConfiguracionNotificaciones() {
  try {
    const doc = await db.collection('configuracion').doc('notificaciones').get();
    if (!doc.exists) {
      console.warn('⚙️ No hay configuración de notificaciones, usando valores por defecto.');
      return {
        habilitado: true,
        diasAntesVencimiento: 1, // enviar 1 día antes
        horaEjecucion: '8:00',   // formato 24h
        zonaHoraria: 'America/Santo_Domingo'
      };
    }
    return doc.data();
  } catch (error) {
    console.error('Error obteniendo configuración de notificaciones:', error);
    return {
      habilitado: true,
      diasAntesVencimiento: 1,
      horaEjecucion: '8:00',
      zonaHoraria: 'America/Santo_Domingo'
    };
  }
}

/**
 * Iniciar el job de notificaciones automáticas
 */
async function iniciarJobNotificaciones() {
  const config = await obtenerConfiguracionNotificaciones();

  if (!config.habilitado) {
    console.log('🔕 Notificaciones automáticas deshabilitadas por configuración.');
    return;
  }

  const [hora, minuto] = config.horaEjecucion.split(':').map(Number);
  const cronExpresion = `${minuto} ${hora} * * *`; // todos los días a la hora configurada

  console.log(`📅 Programando job de notificaciones automáticas a las ${config.horaEjecucion} (${config.zonaHoraria})`);

  cron.schedule(cronExpresion, async () => {
    console.log('⏰ Ejecutando verificación automática de notificaciones...');
    await generarRecordatoriosAutomaticos(config.diasAntesVencimiento);
  }, { timezone: config.zonaHoraria });
}

// ===========================
// 🔄 RUTAS BÁSICAS Y ESTADO
// ===========================

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Sistema de Préstamos EYS Inversiones funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clientes: '/api/clientes',
      prestamos: '/api/prestamos',
      pagos: '/api/pagos',
      solicitudes: '/api/solicitudes',
      garantes: '/api/garantes',
      dashboard: '/api/dashboard',
      notificaciones: '/api/notificaciones'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Firebase Firestore',
    authentication: 'Firebase Auth'
  });
});

// ===========================
// ⚠️ ERRORES GLOBALES
// ===========================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado'
  });
});

app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// ===========================
// 🚀 INICIAR SERVIDOR
// ===========================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 SISTEMA DE PRÉSTAMOS EYS INVERSIONES');
  console.log('='.repeat(50));
  console.log(`🎯 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Firebase Project: eysinversiones-2071c`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log('');
  console.log('📋 ENDPOINTS DISPONIBLES:');
  console.log(`🔐 Auth        → /api/auth`);
  console.log(`👥 Clientes    → /api/clientes`);
  console.log(`💰 Préstamos   → /api/prestamos`);
  console.log(`💳 Pagos       → /api/pagos`);
  console.log(`📋 Solicitudes → /api/solicitudes`);
  console.log(`👨‍👩‍👧‍👦 Garantes   → /api/garantes`);
  console.log(`📊 Dashboard   → /api/dashboard`);
  console.log(`🔔 Notificaciones → /api/notificaciones`);
  console.log('');
  console.log('🎨 Colores: Rojo y Negro');
  console.log('⚡ Modo: Producción');
  console.log('='.repeat(50));
});

// Iniciar job automático al levantar el servidor
iniciarJobNotificaciones();

module.exports = { app, admin };
