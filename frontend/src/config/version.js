// ============================================
// CONFIGURACIÓN GLOBAL DE VERSIÓN DEL SISTEMA
// ============================================
// 🔥 ACTUALIZA LA VERSIÓN AQUÍ Y SE REFLEJARÁ EN:
//    - Login (esquina inferior derecha)
//    - Sidebar (menú desplegable del usuario)
//    - Welcome (tarjeta "Versión estable")
//    - Información del Sistema
// ============================================

const VERSION_CONFIG = {
  // Versión actual del sistema (Ej: 1.0.0, 1.1.5, 2.0.0)
  version: '1.0.0',
  
  // Fecha de la versión en formato DD-MM-YYYY
  fecha: '09/06/2026'
};
// ============================================
// DATOS DE VERSION DEL SISTEMA
// ============================================
// - version: Número de versión actual del sistema (ejemplo: "1.0.0")
// - la misma version ya muestra la version global del sistema, no es necesario agregarla en cada componente, se obtiene directamente de esta configuración
// - fecha: Fecha de lanzamiento o actualización de la versión ( "09/06/2026")
// - esta fecha se muestra en la información del sistema y en la tarjeta de bienvenida, para que los usuarios sepan cuándo se lanzó la versión actual
//    - 
// ============================================
// Función para obtener la versión formateada
export const getVersionFormatted = () => `v${VERSION_CONFIG.version}`;

// Función para obtener la fecha formateada
export const getFechaFormateada = () => VERSION_CONFIG.fecha;

// Exportar la configuración
export default VERSION_CONFIG;