const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const { generarNotificacionesMasivas } = require('../services/notificationService');

const ejecutar = async () => {
  console.log('🕐 Ejecutando generación de notificaciones programadas...');
  await generarNotificacionesMasivas();
  console.log('✅ Proceso completado');
  process.exit(0);
};

ejecutar();