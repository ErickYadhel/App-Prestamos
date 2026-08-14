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
  version: '1.0.6',
  
  // Fecha de la versión en formato DD-MM-YYYY
  fecha: '13/08/2026'
};
// ============================================
// DATOS DE VERSION DEL SISTEMA
// ============================================
// - la misma version ya muestra la version global del sistema, no es necesario agregarla en cada componente, se obtiene directamente de esta configuración
// - fecha: Fecha de lanzamiento o actualización de la versión ( "09/06/2026")
// - esta fecha se muestra en la información del sistema y en la tarjeta de bienvenida, para que los usuarios sepan cuándo se lanzó la versión actual
// - MODULO DE PRESTAMOS MEJORAS: Se agregaron mejoras en la gestión de préstamos, incluyendo nuevas métricas y filtros para un mejor control y análisis de los préstamos otorgados.
// - MODULO DE PAGOS MEJORAS: Se implementaron mejoras en el módulo de pagos, incluyendo la integración con nuevas pasarelas de pago y la optimización del proceso de conciliación de pagos.
// - MODULO DE REPORTES MEJORAS: Se añadieron nuevos reportes y gráficos para un análisis más detallado de los datos del sistema, permitiendo a los usuarios generar informes personalizados según sus necesidades.
// - MODULO DE USUARIOS MEJORAS: Se mejoró la gestión de usuarios, incluyendo nuevas opciones de roles y permisos, así como la implementación de un sistema de auditoría para rastrear cambios en la configuración de usuarios.
// - MODULO DE NOTIFICACIONES MEJORAS: Se implementaron mejoras en el sistema de notificaciones, incluyendo la posibilidad de configurar alertas personalizadas y la integración con servicios de mensajería externa para una comunicación más efectiva con los usuarios.
// - MODULO DE PRESTAMOS MEJORAS: Se agrego nuevas tarjetas y nuevo boton de enviar estado de cuenta, para que los usuarios puedan enviar el estado de cuenta a los clientes de manera más rápida y sencilla.
// - MODULO DE PAGOS MEJORAS: Se agrego nuevo botones y forma de no limitar cantidad visible de los prestamos.
// - MODULO DE REPORTES MEJORAS: Se agrego nuevo botones y forma de no limitar cantidad visible de los prestamos.
// - MODULO DE LOGIN: Se agrego el boton de "Olvidé mi contraseña" para que los usuarios puedan recuperar su acceso de manera más sencilla y rápida.
// ============================================
// Función para obtener la versión formateada
export const getVersionFormatted = () => `v${VERSION_CONFIG.version}`;

// Función para obtener la fecha formateada
export const getFechaFormateada = () => VERSION_CONFIG.fecha;

// Exportar la configuración
export default VERSION_CONFIG;