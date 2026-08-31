const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

// 👇 IMPORTAR MIDDLEWARE DE CONTROL DE ACCESOS
const { controlAccesosMiddleware, verificarAcceso } = require('./middleware/controlAccesos');

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================
// 🛡️ SEGURIDAD - HELMET
// ============================================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));

// ============================================
// 🚦 RATE LIMITING
// ============================================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas peticiones. Intenta nuevamente en 15 minutos.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.'
  }
});

app.use('/api/', globalLimiter);

// ============================================
// 🌐 CONFIGURACIÓN DE CORS
// ============================================

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'https://eys-frontend.onrender.com',
  'https://eys-backend.onrender.com',
  'https://prestamos-eys.vercel.app',
  'https://eysinversiones.com',
  'https://www.eysinversiones.com'
];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS bloqueado para origen: ${origin}`);
      callback(new Error('No permitido por CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));

// ============================================
// 📦 MIDDLEWARES BÁSICOS
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// 🔥 INICIALIZAR FIREBASE ADMIN
// ============================================

const requiredEnvVars = [
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PROJECT_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Variables de entorno faltantes: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// ============================================
// 🔒 RUTA PARA VERIFICAR ACCESO (NUEVA) 👈 AGREGADA
// ============================================
app.get('/api/auth/check-access', verificarAcceso);

// ============================================
// 🛡️ MIDDLEWARE DE CONTROL DE ACCESOS
// ============================================

app.use(controlAccesosMiddleware);

// ============================================
// 📦 IMPORTAR RUTAS
// ============================================

const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const prestamosRoutes = require('./routes/prestamos');
const pagosRoutes = require('./routes/pagos');
const solicitudesRoutes = require('./routes/solicitudes');
const garantesRoutes = require('./routes/garantes');
const dashboardRoutes = require('./routes/dashboard');
const usuarioRoutes = require('./routes/usuario');
const comisionesRoutes = require('./routes/comisiones');

let notificacionesRoutes, generarRecordatoriosAutomaticos;
try {
  const notificacionesModule = require('./routes/notificaciones');
  notificacionesRoutes = notificacionesModule.router;
  generarRecordatoriosAutomaticos = notificacionesModule.generarRecordatoriosAutomaticos;
  console.log('✅ Módulo de notificaciones cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando módulo de notificaciones:', error.message);
  notificacionesRoutes = require('express').Router();
  generarRecordatoriosAutomaticos = async () => {
    console.log('⚠️ Notificaciones no disponibles - módulo no cargado');
  };
}

// ============================================
// 🔗 USAR RUTAS
// ============================================

app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/garantes', garantesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/comisiones', comisionesRoutes);

// ============================================
// 🔧 CONFIGURACIÓN DE NOTIFICACIONES
// ============================================

async function obtenerConfiguracionNotificaciones() {
  try {
    const doc = await db.collection('configuracion').doc('notificaciones').get();
    if (!doc.exists) {
      return {
        habilitado: true,
        diasAntesVencimiento: 1,
        horaEjecucion: '8:00',
        zonaHoraria: 'America/Santo_Domingo'
      };
    }
    return doc.data();
  } catch (error) {
    console.error('❌ Error obteniendo configuración de notificaciones:', error);
    return {
      habilitado: true,
      diasAntesVencimiento: 1,
      horaEjecucion: '8:00',
      zonaHoraria: 'America/Santo_Domingo'
    };
  }
}

async function iniciarJobNotificaciones() {
  const config = await obtenerConfiguracionNotificaciones();
  if (!config.habilitado) {
    console.log('🔕 Notificaciones automáticas deshabilitadas.');
    return;
  }
  const [hora, minuto] = config.horaEjecucion.split(':').map(Number);
  const cronExpresion = `${minuto} ${hora} * * *`;
  console.log(`📅 Programando job de notificaciones a las ${config.horaEjecucion}`);
  cron.schedule(cronExpresion, async () => {
    console.log(`⏰ Ejecutando verificación automática de notificaciones...`);
    try {
      if (generarRecordatoriosAutomaticos) {
        await generarRecordatoriosAutomaticos(config.diasAntesVencimiento);
        console.log(`✅ Recordatorios automáticos ejecutados`);
      }
    } catch (error) {
      console.error('❌ Error ejecutando recordatorios:', error.message);
    }
  }, { timezone: config.zonaHoraria });
}

// ============================================
// 🔄 RUTAS BÁSICAS
// ============================================

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Sistema de Préstamos EYS Inversiones funcionando!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      clientes: '/api/clientes',
      prestamos: '/api/prestamos',
      pagos: '/api/pagos',
      solicitudes: '/api/solicitudes',
      garantes: '/api/garantes',
      dashboard: '/api/dashboard',
      notificaciones: '/api/notificaciones',
      comisiones: '/api/comisiones',
      checkAccess: '/api/auth/check-access' // 👈 NUEVO
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'Firebase Firestore',
    authentication: 'Firebase Auth',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// ⚠️ MANEJO DE ERRORES GLOBALES
// ============================================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((error, req, res, next) => {
  console.error('❌ Error global:', {
    message: error.message,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  if (error.message === 'No permitido por CORS') {
    return res.status(403).json({
      success: false,
      error: 'Acceso no permitido desde este origen',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }

  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Demasiadas peticiones. Por favor, espera antes de intentar nuevamente.'
    });
  }

  if (error.status === 403) {
    return res.status(403).json({
      success: false,
      error: error.message || 'Acceso denegado por políticas de seguridad'
    });
  }

  const statusCode = error.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Error interno del servidor' 
    : error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ============================================
// 🚀 INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 SISTEMA DE PRÉSTAMOS EYS INVERSIONES');
  console.log('='.repeat(60));
  console.log(`🎯 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'eysinversiones-2071c'}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📋 ENDPOINTS DISPONIBLES:');
  console.log(`🔐 Auth        → /api/auth`);
  console.log(`🔒 Check Access → /api/auth/check-access (NUEVO)`);
  console.log(`👥 Clientes    → /api/clientes`);
  console.log(`💰 Préstamos   → /api/prestamos`);
  console.log(`💳 Pagos       → /api/pagos`);
  console.log(`📋 Solicitudes → /api/solicitudes`);
  console.log(`👨‍👩‍👧‍👦 Garantes   → /api/garantes`);
  console.log(`📊 Dashboard   → /api/dashboard`);
  console.log(`🔔 Notificaciones → /api/notificaciones`);
  console.log(`💰 Comisiones  → /api/comisiones`);
  console.log('');
  console.log('🛡️ SEGURIDAD:');
  console.log(`✅ CORS: ${allowedOrigins.length} orígenes permitidos`);
  console.log(`✅ Rate Limiting: 100 peticiones/15min (general), 20/15min (auth)`);
  console.log(`✅ Helmet: Headers de seguridad activados`);
  console.log(`✅ Control de Accesos: Middleware activado`);
  console.log(`✅ Verificación de Acceso: /api/auth/check-access`);
  console.log('='.repeat(60));
});

iniciarJobNotificaciones();

module.exports = { app, admin, db };

// ============================================
// MANEJO DE SEÑALES DE CIERRE
// ============================================

process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Excepción no capturada:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Rechazo de promesa no manejado:', reason);
});