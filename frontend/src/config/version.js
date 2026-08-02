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
  version: '1.0.2',
  
  // Fecha de la versión en formato DD-MM-YYYY
  fecha: '01/08/2026'
};
// ============================================
// DATOS DE VERSION DEL SISTEMA
// ============================================
// - la misma version ya muestra la version global del sistema, no es necesario agregarla en cada componente, se obtiene directamente de esta configuración
// - fecha: Fecha de lanzamiento o actualización de la versión ( "09/06/2026")
// - esta fecha se muestra en la información del sistema y en la tarjeta de bienvenida, para que los usuarios sepan cuándo se lanzó la versión actual
// - MODULO DE PRESTAMOS MEJORAS: Se agregaron mejoras en la gestión de préstamos, incluyendo nuevas métricas y filtros para un mejor control y análisis de los préstamos otorgados.
// - MODULO DE PAGOS MEJORAS: Se implementaron mejoras en el módulo de pagos, incluyendo la integración con nuevas pasarelas de pago y la optimización del proceso de conciliación de pagos.
// ============================================
// Función para obtener la versión formateada
export const getVersionFormatted = () => `v${VERSION_CONFIG.version}`;

// Función para obtener la fecha formateada
export const getFechaFormateada = () => VERSION_CONFIG.fecha;

// Exportar la configuración
export default VERSION_CONFIG;