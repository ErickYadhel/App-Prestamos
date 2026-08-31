const admin = require('firebase-admin');
const axios = require('axios');

// ============================================
// CARGAR CONFIGURACIÓN DESDE FIREBASE
// ============================================
const cargarConfiguracion = async () => {
  try {
    const db = admin.firestore();
    
    const configDoc = await db.collection('Configuracion').doc('controlAccesos').get();
    const controlAccesos = configDoc.exists ? configDoc.data() : {};
    
    const reglasSnapshot = await db.collection('ReglasAcceso').get();
    const reglas = [];
    reglasSnapshot.forEach(doc => {
      const data = doc.data();
      reglas.push({ 
        id: doc.id, 
        nombre: data.nombre || 'Sin nombre',
        descripcion: data.descripcion || '',
        tipo: data.tipo || 'horario',
        valor: data.valor || '',
        accion: data.accion || 'denegar',
        activo: data.activo === true,
        creadoPor: data.creadoPor || '',
        fechaCreacion: data.fechaCreacion || ''
      });
    });
    
    return { controlAccesos, reglas };
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Error cargando configuración:', error);
    return { controlAccesos: {}, reglas: [] };
  }
};

// ============================================
// OBTENER IP DEL CLIENTE
// ============================================
const obtenerIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         '0.0.0.0';
};

// ============================================
// VERIFICAR SI ESTÁ DENTRO DEL HORARIO
// ============================================
const estaEnHorario = (valorHorario) => {
  const ahora = new Date();
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
  
  if (valorHorario === '24h' || valorHorario === '00:00-23:59') {
    return true;
  }
  
  const horarios = valorHorario.split(',').map(h => h.trim());
  
  for (const horario of horarios) {
    try {
      const [inicio, fin] = horario.split('-').map(h => {
        const parts = h.trim().split(':').map(Number);
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
          return null;
        }
        return parts[0] * 60 + parts[1];
      });
      
      if (inicio === null || fin === null) continue;
      
      if (horaActual >= inicio && horaActual <= fin) {
        return true;
      }
    } catch (error) {
      // Ignorar errores de parseo
    }
  }
  
  return false;
};

// ============================================
// VERIFICAR IP (SOPORTA CIDR Y RANGOS)
// ============================================
const verificarIP = (reglaValor, clientIP) => {
  // IP exacta
  if (reglaValor === clientIP) {
    console.log(`  ✅ IP exacta coincide: ${reglaValor}`);
    return true;
  }
  
  // Rango CIDR (192.168.1.0/24)
  if (reglaValor.includes('/')) {
    try {
      const [ip, mask] = reglaValor.split('/');
      const ipParts = ip.split('.').map(Number);
      const clientParts = clientIP.split('.').map(Number);
      const maskBits = parseInt(mask);
      
      if (ipParts.some(isNaN) || clientParts.some(isNaN)) return false;
      
      const maskNum = ~0 << (32 - maskBits);
      const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
      const clientNum = (clientParts[0] << 24) + (clientParts[1] << 16) + (clientParts[2] << 8) + clientParts[3];
      
      const coincide = (ipNum & maskNum) === (clientNum & maskNum);
      if (coincide) console.log(`  ✅ CIDR coincide: ${reglaValor}`);
      return coincide;
    } catch (error) {
      return false;
    }
  }
  
  // Rango (192.168.1.1-192.168.1.254)
  if (reglaValor.includes('-')) {
    try {
      const [start, end] = reglaValor.split('-').map(ip => {
        const parts = ip.split('.').map(Number);
        return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
      });
      const clientParts = clientIP.split('.').map(Number);
      const clientNum = (clientParts[0] << 24) + (clientParts[1] << 16) + (clientParts[2] << 8) + clientParts[3];
      const coincide = clientNum >= start && clientNum <= end;
      if (coincide) console.log(`  ✅ Rango coincide: ${reglaValor}`);
      return coincide;
    } catch (error) {
      return false;
    }
  }
  
  return false;
};

// ============================================
// OBTENER GEOLOCALIZACIÓN
// ============================================
const obtenerGeolocalizacion = async (ip) => {
  // No geolocalizar IPs locales
  if (ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0' || 
      ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    console.log(`  ⚠️ IP local: ${ip} - No se geolocaliza`);
    return null;
  }

  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon`);
    if (response.data.status === 'success') {
      return {
        pais: response.data.country,
        paisCode: response.data.countryCode,
        region: response.data.regionName,
        ciudad: response.data.city,
        lat: response.data.lat,
        lon: response.data.lon
      };
    }
    return null;
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Error obteniendo geolocalización:', error.message);
    return null;
  }
};

// ============================================
// VERIFICAR DISPOSITIVO CONFIABLE
// ============================================
const verificarDispositivo = async (uid, userAgent) => {
  if (!uid) {
    console.log('  ⚠️ No hay UID para verificar dispositivo');
    return false;
  }
  
  try {
    const db = admin.firestore();
    const dispositivosRef = db.collection('DispositivosConfiables');
    const querySnapshot = await dispositivosRef
      .where('uid', '==', uid)
      .where('userAgent', '==', userAgent)
      .limit(1)
      .get();
    
    const registrado = !querySnapshot.empty;
    console.log(`  📱 Dispositivo registrado: ${registrado ? '✅ SI' : '❌ NO'}`);
    return registrado;
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Error verificando dispositivo:', error);
    return false;
  }
};

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================
const controlAccesosMiddleware = async (req, res, next) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔍 [MIDDLEWARE] Petición: ${req.method} ${req.path}`);
  console.log(`${'='.repeat(70)}`);
  
  // Rutas públicas (sin validación)
  const rutasPublicas = [
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/refresh',
    '/api/auth/check-access',
    '/',
    '/health'
  ];
  
  if (rutasPublicas.some(ruta => req.path === ruta || req.path.startsWith(ruta))) {
    console.log(`🔓 [MIDDLEWARE] Ruta pública: ${req.path} - Sin validación`);
    return next();
  }

  try {
    const { controlAccesos, reglas } = await cargarConfiguracion();

    if (!controlAccesos || Object.keys(controlAccesos).length === 0) {
      console.log('⚠️ [MIDDLEWARE] No hay configuración - PERMITIDO');
      return next();
    }

    const clientIP = obtenerIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    console.log(`🌐 [MIDDLEWARE] IP: ${clientIP}`);
    console.log(`🕐 [MIDDLEWARE] Hora: ${ahora.toLocaleTimeString()}`);
    console.log(`📋 [MIDDLEWARE] Configuración:`, {
      bloqueoIP: controlAccesos.bloqueoIP ? '✅' : '❌',
      restriccionHorario: controlAccesos.restriccionHorario ? '✅' : '❌',
      geolocalizacion: controlAccesos.geolocalizacion ? '✅' : '❌',
      dispositivosConfiables: controlAccesos.dispositivosConfiables ? '✅' : '❌'
    });

    // Obtener UID del usuario autenticado
    let uid = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        uid = decodedToken.uid;
        console.log(`👤 [MIDDLEWARE] UID: ${uid}`);
      } catch (error) {
        console.log('⚠️ [MIDDLEWARE] Token inválido o expirado');
      }
    }

    // ============================================
    // 1. VALIDACIÓN DE IP
    // ============================================
    if (controlAccesos.bloqueoIP) {
      console.log(`\n🔍 [MIDDLEWARE] Validando IP...`);
      const reglasIP = reglas.filter(r => r.tipo === 'ip' && r.activo === true);
      console.log(`📋 [MIDDLEWARE] ${reglasIP.length} reglas de IP activas`);
      
      for (const regla of reglasIP) {
        console.log(`  🔎 Regla: "${regla.nombre}" - Valor: ${regla.valor} - Acción: ${regla.accion}`);
        const ipCoincide = verificarIP(regla.valor, clientIP);
        
        if (ipCoincide && regla.accion === 'denegar') {
          console.log(`⛔ [MIDDLEWARE] ACCESO DENEGADO por IP: ${regla.nombre}`);
          return res.status(403).json({
            success: false,
            error: 'Acceso denegado',
            mensaje: `IP bloqueada: ${clientIP}`,
            regla: regla.nombre,
            codigo: 'ACCESO_DENEGADO_IP'
          });
        }
      }
    }

    // ============================================
    // 2. VALIDACIÓN DE HORARIO
    // ============================================
    if (controlAccesos.restriccionHorario) {
      console.log(`\n⏰ [MIDDLEWARE] Validando horario...`);
      const reglasHorario = reglas.filter(r => r.tipo === 'horario' && r.activo === true);
      console.log(`📋 [MIDDLEWARE] ${reglasHorario.length} reglas de horario activas`);
      
      for (const regla of reglasHorario) {
        console.log(`  🔎 Regla: "${regla.nombre}" - Horario: ${regla.valor} - Acción: ${regla.accion}`);
        const dentroHorario = estaEnHorario(regla.valor);
        console.log(`  📊 Dentro de horario: ${dentroHorario ? '✅ SI' : '❌ NO'}`);
        
        if (regla.accion === 'denegar' && dentroHorario) {
          console.log(`⛔ [MIDDLEWARE] ACCESO DENEGADO por horario: ${regla.nombre}`);
          return res.status(403).json({
            success: false,
            error: 'Acceso denegado',
            mensaje: `Acceso bloqueado en este horario: ${regla.valor}`,
            regla: regla.nombre,
            horarioRestringido: regla.valor,
            horaActual: ahora.toLocaleTimeString(),
            codigo: 'ACCESO_DENEGADO_HORARIO'
          });
        }
        
        if (regla.accion === 'permitir' && !dentroHorario) {
          console.log(`⛔ [MIDDLEWARE] ACCESO DENEGADO (fuera de horario permitido): ${regla.nombre}`);
          return res.status(403).json({
            success: false,
            error: 'Acceso denegado',
            mensaje: `Fuera del horario permitido. Horario: ${regla.valor}`,
            regla: regla.nombre,
            horarioPermitido: regla.valor,
            horaActual: ahora.toLocaleTimeString(),
            codigo: 'ACCESO_DENEGADO_HORARIO'
          });
        }
      }
    }

    // ============================================
    // 3. VALIDACIÓN DE GEOLOCALIZACIÓN
    // ============================================
    if (controlAccesos.geolocalizacion) {
      console.log(`\n🌍 [MIDDLEWARE] Validando geolocalización...`);
      const reglasUbicacion = reglas.filter(r => r.tipo === 'ubicacion' && r.activo === true);
      console.log(`📋 [MIDDLEWARE] ${reglasUbicacion.length} reglas de ubicación activas`);
      
      if (reglasUbicacion.length > 0) {
        const geoData = await obtenerGeolocalizacion(clientIP);
        
        if (geoData) {
          console.log(`📍 [MIDDLEWARE] Ubicación detectada: ${geoData.pais} - ${geoData.ciudad}`);
          
          for (const regla of reglasUbicacion) {
            console.log(`  🔎 Regla: "${regla.nombre}" - Valor: ${regla.valor} - Acción: ${regla.accion}`);
            const valorLower = regla.valor.toLowerCase();
            const paisLower = geoData.pais?.toLowerCase() || '';
            const ciudadLower = geoData.ciudad?.toLowerCase() || '';
            const regionLower = geoData.region?.toLowerCase() || '';
            
            const coincide = paisLower.includes(valorLower) || 
                           ciudadLower.includes(valorLower) || 
                           regionLower.includes(valorLower);
            
            console.log(`  📊 Coincide: ${coincide ? '✅ SI' : '❌ NO'}`);
            
            if (coincide && regla.accion === 'denegar') {
              console.log(`⛔ [MIDDLEWARE] ACCESO DENEGADO por ubicación: ${regla.nombre}`);
              return res.status(403).json({
                success: false,
                error: 'Acceso denegado',
                mensaje: `Ubicación restringida: ${geoData.pais} - ${geoData.ciudad}`,
                regla: regla.nombre,
                ubicacion: geoData,
                codigo: 'ACCESO_DENEGADO_UBICACION'
              });
            }
          }
        } else {
          console.log(`⚠️ [MIDDLEWARE] No se pudo determinar la ubicación para IP: ${clientIP}`);
        }
      }
    }

    // ============================================
    // 4. VALIDACIÓN DE DISPOSITIVOS CONFIABLES
    // ============================================
    if (controlAccesos.dispositivosConfiables) {
      console.log(`\n📱 [MIDDLEWARE] Validando dispositivos...`);
      const reglasDispositivo = reglas.filter(r => r.tipo === 'dispositivo' && r.activo === true);
      console.log(`📋 [MIDDLEWARE] ${reglasDispositivo.length} reglas de dispositivo activas`);
      
      if (reglasDispositivo.length > 0 && uid) {
        const dispositivoRegistrado = await verificarDispositivo(uid, userAgent);
        
        for (const regla of reglasDispositivo) {
          console.log(`  🔎 Regla: "${regla.nombre}" - Acción: ${regla.accion}`);
          
          if (regla.accion === 'denegar' && !dispositivoRegistrado) {
            console.log(`⛔ [MIDDLEWARE] ACCESO DENEGADO por dispositivo: ${regla.nombre}`);
            return res.status(403).json({
              success: false,
              error: 'Acceso denegado',
              mensaje: 'Dispositivo no registrado o no confiable',
              regla: regla.nombre,
              codigo: 'ACCESO_DENEGADO_DISPOSITIVO'
            });
          }
        }
      } else if (reglasDispositivo.length > 0 && !uid) {
        console.log(`⚠️ [MIDDLEWARE] No hay UID para verificar dispositivo - Acceso denegado por defecto`);
        const reglaDenegar = reglasDispositivo.find(r => r.accion === 'denegar');
        if (reglaDenegar) {
          return res.status(403).json({
            success: false,
            error: 'Acceso denegado',
            mensaje: 'Debes iniciar sesión para acceder',
            regla: reglaDenegar.nombre,
            codigo: 'ACCESO_DENEGADO_DISPOSITIVO'
          });
        }
      }
    }

    console.log(`\n✅ [MIDDLEWARE] ACCESO PERMITIDO a ${req.path}`);
    console.log(`${'='.repeat(70)}\n`);
    next();
    
  } catch (error) {
    console.error(`❌ [MIDDLEWARE] Error:`, error);
    console.log(`⚠️ [MIDDLEWARE] Error - PERMITIENDO acceso por defecto`);
    next();
  }
};

// ============================================
// ENDPOINT PARA VERIFICAR ACCESO DESDE EL FRONTEND
// ============================================
const verificarAcceso = async (req, res) => {
  try {
    const { controlAccesos, reglas } = await cargarConfiguracion();
    
    if (!controlAccesos || Object.keys(controlAccesos).length === 0) {
      return res.json({
        success: true,
        permitido: true,
        mensaje: 'Acceso permitido'
      });
    }

    const clientIP = obtenerIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    
    let motivo = null;
    let reglaAfectada = null;
    let codigo = null;

    // Obtener UID
    let uid = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        uid = decodedToken.uid;
      } catch (error) {}
    }

    // 1. Verificar IP
    if (!motivo && controlAccesos.bloqueoIP) {
      const reglasIP = reglas.filter(r => r.tipo === 'ip' && r.activo === true);
      for (const regla of reglasIP) {
        const ipCoincide = verificarIP(regla.valor, clientIP);
        if (ipCoincide && regla.accion === 'denegar') {
          motivo = `IP bloqueada: ${clientIP}`;
          reglaAfectada = regla;
          codigo = 'ACCESO_DENEGADO_IP';
          break;
        }
      }
    }

    // 2. Verificar Horario
    if (!motivo && controlAccesos.restriccionHorario) {
      const reglasHorario = reglas.filter(r => r.tipo === 'horario' && r.activo === true);
      for (const regla of reglasHorario) {
        const dentroHorario = estaEnHorario(regla.valor);
        if (regla.accion === 'denegar' && dentroHorario) {
          motivo = `Acceso bloqueado en este horario: ${regla.valor}`;
          reglaAfectada = regla;
          codigo = 'ACCESO_DENEGADO_HORARIO';
          break;
        }
        if (regla.accion === 'permitir' && !dentroHorario) {
          motivo = `Fuera del horario permitido. Horario: ${regla.valor}`;
          reglaAfectada = regla;
          codigo = 'ACCESO_DENEGADO_HORARIO';
          break;
        }
      }
    }

    // 3. Verificar Geolocalización
    if (!motivo && controlAccesos.geolocalizacion) {
      const reglasUbicacion = reglas.filter(r => r.tipo === 'ubicacion' && r.activo === true);
      if (reglasUbicacion.length > 0) {
        const geoData = await obtenerGeolocalizacion(clientIP);
        if (geoData) {
          for (const regla of reglasUbicacion) {
            const valorLower = regla.valor.toLowerCase();
            const paisLower = geoData.pais?.toLowerCase() || '';
            const ciudadLower = geoData.ciudad?.toLowerCase() || '';
            const regionLower = geoData.region?.toLowerCase() || '';
            const coincide = paisLower.includes(valorLower) || ciudadLower.includes(valorLower) || regionLower.includes(valorLower);
            if (coincide && regla.accion === 'denegar') {
              motivo = `Ubicación restringida: ${geoData.pais} - ${geoData.ciudad}`;
              reglaAfectada = regla;
              codigo = 'ACCESO_DENEGADO_UBICACION';
              break;
            }
          }
        }
      }
    }

    // 4. Verificar Dispositivos
    if (!motivo && controlAccesos.dispositivosConfiables && uid) {
      const reglasDispositivo = reglas.filter(r => r.tipo === 'dispositivo' && r.activo === true);
      if (reglasDispositivo.length > 0) {
        const dispositivoRegistrado = await verificarDispositivo(uid, userAgent);
        const reglaDenegar = reglasDispositivo.find(r => r.accion === 'denegar');
        if (reglaDenegar && !dispositivoRegistrado) {
          motivo = 'Dispositivo no registrado o no confiable';
          reglaAfectada = reglaDenegar;
          codigo = 'ACCESO_DENEGADO_DISPOSITIVO';
        }
      }
    }

    if (motivo) {
      console.log(`⛔ [VERIFY] Acceso denegado: ${motivo}`);
      return res.json({
        success: false,
        permitido: false,
        mensaje: motivo,
        regla: reglaAfectada?.nombre || 'Desconocida',
        codigo: codigo || 'ACCESO_DENEGADO'
      });
    }

    res.json({
      success: true,
      permitido: true,
      mensaje: 'Acceso permitido'
    });

  } catch (error) {
    console.error('❌ [VERIFY] Error:', error);
    res.json({
      success: true,
      permitido: true,
      mensaje: 'Error al verificar acceso, permitiendo por defecto'
    });
  }
};

module.exports = {
  controlAccesosMiddleware,
  verificarAcceso
};