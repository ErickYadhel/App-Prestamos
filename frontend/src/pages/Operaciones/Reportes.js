// ============================================
// ARCHIVO: Reportes.js
// PROPÓSITO: Componente principal de Reportes
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  ChartBarIcon,
  ChartBarSquareIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  ReceiptPercentIcon,
  ClockIcon,
  PresentationChartLineIcon,
  GiftIcon,
  PercentBadgeIcon,
  UserPlusIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Importar generadores y utilidades
import generadores from '../../components/Reportes/ReportesGeneradores';

// Importar componentes UI
import {
  FiltrosPanel,
  ReporteCard,
  VistaPreviaModal,
  HeaderReportes,
  CategoriasSelector,
  ReportesSkeleton,
  MensajeVacio,
  MensajeError,
  FiltrosActivos,
  BarraBusqueda
} from '../../components/Reportes/ReportesComponentes';

// Desestructurar utilidades y generadores
const {
  // Utilidades
  formatearMonto,
  formatearMontoCorto,
  obtenerRangoQuincena,
  obtenerRangoMes,
  obtenerRangoSemana,
  obtenerRango3Meses,
  obtenerRango6Meses,
  obtenerRangoAño,
  // Exportaciones
  exportarPDF,
  exportarExcel,
  exportarCSV,
  exportarJSON,
  // Generadores de Préstamos
  generarPrestamosPorPeriodo,
  generarPrestamosActivos,
  generarPrestamosCompletados,
  generarPrestamosPorCliente,
  generarPrestamosPorVencer,
  generarPrestamosPorRango,
  // Generadores de Pagos
  generarPagosDelDia,
  generarDistribucionCapitalInteres,
  generarPagosPorTipo,
  generarPagosPorMes,
  generarPagosPorCliente,
  // Generadores de Clientes
  generarEstadoCuentaCliente,
  generarClientesMorosos,
  generarTopPuntualidad,
  generarClientesNuevos,
  // Generadores Financieros
  generarProyeccionGanancias,
  generarTasaRecuperacion,
  generarTiempoPromedioPago,
  generarReporteDiario,
  generarComparativoMensual,
  generarTopClientes,
  generarComisionesPorGarante,
  generarFlujoCaja,
  generarRentabilidad
} = generadores;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Reportes = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);
  const [vistaPreviaAbierta, setVistaPreviaAbierta] = useState(false);
  const [reporteActivo, setReporteActivo] = useState(null);
  const [datosReporte, setDatosReporte] = useState({ columnas: [], filas: [], resumen: {} });
  
  // Datos desde Firebase
  const [prestamos, setPrestamos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [garantes, setGarantes] = useState([]);
  const [comisiones, setComisiones] = useState([]);
  const [formularios, setFormularios] = useState([]);

  // Filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    clienteID: '',
    garanteID: '',
    estado: '',
    montoMin: '',
    montoMax: ''
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState([]);

  // ============================================
  // CARGAR DATOS DESDE FIREBASE
  // ============================================
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 Cargando datos para reportes...');

      const [
        prestamosSnap,
        pagosSnap,
        clientesSnap,
        garantesSnap,
        comisionesSnap,
        formulariosSnap
      ] = await Promise.all([
        getDocs(query(collection(db, 'prestamos'), limit(1000))),
        getDocs(query(collection(db, 'pagos'), limit(1000))),
        getDocs(collection(db, 'clientes')),
        getDocs(collection(db, 'garantes')).catch(() => ({ forEach: () => {} })),
        getDocs(collection(db, 'comisiones')).catch(() => ({ forEach: () => {} })),
        getDocs(collection(db, 'formularios')).catch(() => ({ forEach: () => {} }))
      ]);

      const listPrestamos = [];
      prestamosSnap.forEach(d => listPrestamos.push({ id: d.id, ...d.data() }));

      const listPagos = [];
      pagosSnap.forEach(d => listPagos.push({ id: d.id, ...d.data() }));

      const listClientes = [];
      clientesSnap.forEach(d => listClientes.push({ id: d.id, ...d.data() }));

      const listGarantes = [];
      garantesSnap.forEach(d => listGarantes.push({ id: d.id, ...d.data() }));

      const listComisiones = [];
      comisionesSnap.forEach(d => listComisiones.push({ id: d.id, ...d.data() }));

      const listFormularios = [];
      formulariosSnap.forEach(d => listFormularios.push({ id: d.id, ...d.data() }));

      console.log('✅ Datos cargados:', {
        prestamos: listPrestamos.length,
        pagos: listPagos.length,
        clientes: listClientes.length,
        garantes: listGarantes.length,
        comisiones: listComisiones.length,
        formularios: listFormularios.length
      });

      setPrestamos(listPrestamos);
      setPagos(listPagos);
      setClientes(listClientes);
      setGarantes(listGarantes);
      setComisiones(listComisiones);
      setFormularios(listFormularios);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError('Error al cargar los datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ============================================
  // MANEJO DE FILTROS
  // ============================================
  const aplicarFiltros = () => {
    const activos = [];
    if (filtros.fechaInicio || filtros.fechaFin) activos.push('Rango de fechas');
    if (filtros.clienteID) activos.push('Cliente');
    if (filtros.garanteID) activos.push('Garante');
    if (filtros.estado) activos.push('Estado');
    if (filtros.montoMin || filtros.montoMax) activos.push('Rango de monto');
    setFiltrosAplicados(activos);
    setShowFiltros(false);
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      clienteID: '',
      garanteID: '',
      estado: '',
      montoMin: '',
      montoMax: ''
    });
    setFiltrosAplicados([]);
  };

  // ============================================
  // DEFINICIÓN DE REPORTES (16 TOTAL)
  // ============================================
  const reportes = useMemo(() => [
    // ═══════════════════════════════════════════
    // 📌 PRÉSTAMOS (6 reportes)
    // ═══════════════════════════════════════════
    {
      id: 'prestamosPeriodo',
      categoria: 'prestamos',
      nombre: 'Préstamos por Período',
      descripcion: 'Préstamos otorgados con filtro de fechas',
      icon: CalendarIcon,
      color: 'from-blue-500 to-blue-700',
      badge: { text: 'FILTROS', color: 'bg-blue-600' },
      estadisticas: {
        Total: prestamos.length,
        Activos: prestamos.filter(p => (p.estado || '').toLowerCase() === 'activo').length
      },
      generar: () => generarPrestamosPorPeriodo(prestamos, filtros)
    },
    {
      id: 'prestamosActivos',
      categoria: 'prestamos',
      nombre: 'Préstamos Activos',
      descripcion: 'Detalle de préstamos vigentes con progreso',
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-green-700',
      estadisticas: {
        Activos: prestamos.filter(p => (p.estado || '').toLowerCase() === 'activo').length,
        Monto: formatearMontoCorto(prestamos.filter(p => (p.estado || '').toLowerCase() === 'activo').reduce((s, p) => s + Number(p.monto || 0), 0))
      },
      generar: () => generarPrestamosActivos(prestamos)
    },
    {
      id: 'prestamosCompletados',
      categoria: 'prestamos',
      nombre: 'Préstamos Completados',
      descripcion: 'Historial de préstamos finalizados',
      icon: CheckCircleIcon,
      color: 'from-emerald-500 to-emerald-700',
      estadisticas: {
        Completados: prestamos.filter(p => (p.estado || '').toLowerCase() === 'completado').length
      },
      generar: () => generarPrestamosCompletados(prestamos)
    },
    {
      id: 'prestamosPorCliente',
      categoria: 'prestamos',
      nombre: 'Préstamos por Cliente',
      descripcion: 'Agrupado por cliente con estados',
      icon: UserGroupIcon,
      color: 'from-purple-500 to-purple-700',
      estadisticas: {
        Clientes: new Set(prestamos.map(p => p.clienteID)).size,
        Total: prestamos.length
      },
      generar: () => generarPrestamosPorCliente(prestamos)
    },
    {
      id: 'prestamosPorVencer',
      categoria: 'prestamos',
      nombre: 'Préstamos por Vencer',
      descripcion: 'Próximos 7 días de vencimiento',
      icon: ClockIcon,
      color: 'from-orange-500 to-orange-700',
      badge: { text: 'URGENTE', color: 'bg-orange-600' },
      estadisticas: {
        'Por Vencer': 'Ver reporte'
      },
      generar: () => generarPrestamosPorVencer(prestamos)
    },
    {
      id: 'prestamosPorRango',
      categoria: 'prestamos',
      nombre: 'Préstamos por Rango',
      descripcion: 'Distribución por montos',
      icon: ChartBarSquareIcon,
      color: 'from-cyan-500 to-cyan-700',
      estadisticas: {
        Rangos: 5
      },
      generar: () => generarPrestamosPorRango(prestamos)
    },

    // ═══════════════════════════════════════════
    // 💰 PAGOS (5 reportes)
    // ═══════════════════════════════════════════
    {
      id: 'pagosDelDia',
      categoria: 'pagos',
      nombre: 'Pagos del Día',
      descripcion: 'Cierre de caja del día actual',
      icon: BanknotesIcon,
      color: 'from-teal-500 to-teal-700',
      badge: { text: 'HOY', color: 'bg-teal-600' },
      estadisticas: {
        Pagos: pagos.filter(p => {
          const f = p.fecha || p.fechaPago;
          if (!f) return false;
          const fecha = new Date(f);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          return fecha >= hoy;
        }).length
      },
      generar: () => generarPagosDelDia(pagos)
    },
    {
      id: 'distribucionCapital',
      categoria: 'pagos',
      nombre: 'Capital vs Interés',
      descripcion: 'Distribución detallada de pagos',
      icon: ChartPieIcon,
      color: 'from-cyan-500 to-cyan-700',
      estadisticas: {
        Pagos: pagos.length
      },
      generar: () => generarDistribucionCapitalInteres(pagos, filtros)
    },
    {
      id: 'pagosPorTipo',
      categoria: 'pagos',
      nombre: 'Pagos por Tipo',
      descripcion: 'Normal, adelantado, mora, abono',
      icon: ReceiptPercentIcon,
      color: 'from-indigo-500 to-indigo-700',
      estadisticas: {
        Tipos: new Set(pagos.map(p => p.tipoPago || 'normal')).size
      },
      generar: () => generarPagosPorTipo(pagos)
    },
    {
      id: 'pagosPorMes',
      categoria: 'pagos',
      nombre: 'Pagos por Mes',
      descripcion: 'Histórico mensual de pagos',
      icon: CalendarIcon,
      color: 'from-violet-500 to-violet-700',
      estadisticas: {
        Meses: 'Ver reporte'
      },
      generar: () => generarPagosPorMes(pagos)
    },
    {
      id: 'pagosPorCliente',
      categoria: 'pagos',
      nombre: 'Pagos por Cliente',
      descripcion: 'Ranking de pagos por cliente',
      icon: UserGroupIcon,
      color: 'from-pink-500 to-pink-700',
      estadisticas: {
        Clientes: new Set(pagos.map(p => p.clienteID)).size
      },
      generar: () => generarPagosPorCliente(pagos)
    },

    // ═══════════════════════════════════════════
    // 👥 CLIENTES (4 reportes)
    // ═══════════════════════════════════════════
    {
      id: 'estadoCuenta',
      categoria: 'clientes',
      nombre: 'Estado de Cuenta',
      descripcion: 'Extracto tipo banco por cliente',
      icon: ClipboardDocumentListIcon,
      color: 'from-amber-500 to-amber-700',
      badge: { text: 'FILTRAR', color: 'bg-amber-600' },
      estadisticas: {
        Clientes: clientes.length
      },
      generar: () => generarEstadoCuentaCliente(filtros.clienteID, prestamos, pagos, clientes)
    },
    {
      id: 'clientesMorosos',
      categoria: 'clientes',
      nombre: 'Clientes Morosos',
      descripcion: 'Listado detallado con días de mora',
      icon: ExclamationTriangleIcon,
      color: 'from-red-500 to-red-700',
      badge: { text: 'CRÍTICO', color: 'bg-red-600' },
      estadisticas: {
        Morosos: prestamos.filter(p => (p.estado || '').toLowerCase() === 'mora').length
      },
      generar: () => generarClientesMorosos(prestamos, clientes)
    },
    {
      id: 'topPuntualidad',
      categoria: 'clientes',
      nombre: 'Top Puntualidad',
      descripcion: 'Clientes más puntuales',
      icon: TrophyIcon,
      color: 'from-yellow-500 to-amber-700',
      estadisticas: {
        Clientes: new Set(pagos.map(p => p.clienteID)).size
      },
      generar: () => generarTopPuntualidad(pagos)
    },
    {
      id: 'clientesNuevos',
      categoria: 'clientes',
      nombre: 'Clientes Nuevos',
      descripcion: 'Registrados en los últimos 30 días',
      icon: UserPlusIcon,
      color: 'from-lime-500 to-lime-700',
      badge: { text: 'NUEVOS', color: 'bg-lime-600' },
      estadisticas: {
        Total: clientes.length
      },
      generar: () => generarClientesNuevos(clientes)
    },

    // ═══════════════════════════════════════════
    // 📊 FINANCIEROS (7 reportes)
    // ═══════════════════════════════════════════
    {
      id: 'proyeccionGanancias',
      categoria: 'finanzas',
      nombre: 'Proyección de Ganancias',
      descripcion: 'Proyección a 6 meses',
      icon: ArrowTrendingUpIcon,
      color: 'from-emerald-500 to-teal-700',
      badge: { text: 'PROYECCIÓN', color: 'bg-emerald-600' },
      estadisticas: {
        Meses: 6
      },
      generar: () => generarProyeccionGanancias(prestamos)
    },
    {
      id: 'tasaRecuperacion',
      categoria: 'finanzas',
      nombre: 'Tasa de Recuperación',
      descripcion: 'Análisis de recuperación de capital',
      icon: PercentBadgeIcon,
      color: 'from-green-500 to-green-700',
      estadisticas: {
        Préstamos: prestamos.length
      },
      generar: () => generarTasaRecuperacion(prestamos, pagos)
    },
    {
      id: 'tiempoPromedioPago',
      categoria: 'finanzas',
      nombre: 'Tiempo Promedio de Pago',
      descripcion: 'Días promedio para completar',
      icon: ClockIcon,
      color: 'from-blue-500 to-blue-700',
      estadisticas: {
        Completados: prestamos.filter(p => (p.estado || '').toLowerCase() === 'completado').length
      },
      generar: () => generarTiempoPromedioPago(prestamos)
    },
    {
      id: 'reporteDiario',
      categoria: 'finanzas',
      nombre: 'Reporte Diario',
      descripcion: 'Cierre del día completo',
      icon: DocumentChartBarIcon,
      color: 'from-red-500 to-red-700',
      badge: { text: 'HOY', color: 'bg-red-600' },
      estadisticas: {
        'Balance': 'En vivo'
      },
      generar: () => generarReporteDiario(prestamos, pagos, comisiones)
    },
    {
      id: 'comparativoMensual',
      categoria: 'finanzas',
      nombre: 'Comparativo Mensual',
      descripcion: 'Mes actual vs anterior con variación',
      icon: PresentationChartLineIcon,
      color: 'from-purple-500 to-purple-700',
      estadisticas: {
        Meses: 2
      },
      generar: () => generarComparativoMensual(prestamos, pagos)
    },
    {
      id: 'flujoCaja',
      categoria: 'finanzas',
      nombre: 'Flujo de Caja',
      descripcion: 'Ingresos y egresos detallados',
      icon: ScaleIcon,
      color: 'from-indigo-500 to-blue-700',
      badge: { text: 'NUEVO', color: 'bg-indigo-600' },
      estadisticas: {
        Pagos: pagos.length,
        Comisiones: comisiones.length
      },
      generar: () => generarFlujoCaja(pagos, comisiones)
    },
    {
      id: 'rentabilidad',
      categoria: 'finanzas',
      nombre: 'Rentabilidad',
      descripcion: 'ROI y análisis de rentabilidad',
      icon: ChartBarIcon,
      color: 'from-cyan-500 to-blue-700',
      badge: { text: 'ROI', color: 'bg-cyan-600' },
      estadisticas: {
        Préstamos: prestamos.length
      },
      generar: () => generarRentabilidad(prestamos, pagos)
    },
    {
      id: 'topClientes',
      categoria: 'clientes',
      nombre: 'Top Clientes',
      descripcion: 'Top 20 por volumen de préstamos',
      icon: TrophyIcon,
      color: 'from-yellow-500 to-orange-700',
      estadisticas: {
        Clientes: new Set(prestamos.map(p => p.clienteID)).size
      },
      generar: () => generarTopClientes(prestamos)
    },
    {
      id: 'comisionesGarante',
      categoria: 'finanzas',
      nombre: 'Comisiones por Garante',
      descripcion: 'Detalle de comisiones por garante',
      icon: GiftIcon,
      color: 'from-purple-500 to-pink-700',
      badge: { text: 'NUEVO', color: 'bg-purple-600' },
      estadisticas: {
        Comisiones: comisiones.length
      },
      generar: () => generarComisionesPorGarante(comisiones)
    }
  ], [prestamos, pagos, clientes, garantes, comisiones, filtros]);

  // ============================================
  // FILTRAR REPORTES
  // ============================================
  const reportesFiltrados = reportes.filter(r => {
    const cumpleCategoria = categoriaActiva === 'todos' || r.categoria === categoriaActiva;
    const cumpleBusqueda = !searchTerm ||
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    return cumpleCategoria && cumpleBusqueda;
  });

  const categorias = [
    { id: 'todos', nombre: 'Todos', icon: ChartBarSquareIcon },
    { id: 'prestamos', nombre: 'Préstamos', icon: CurrencyDollarIcon },
    { id: 'pagos', nombre: 'Pagos', icon: BanknotesIcon },
    { id: 'clientes', nombre: 'Clientes', icon: UserGroupIcon },
    { id: 'finanzas', nombre: 'Financieros', icon: ChartBarIcon },
  ];

  // ============================================
  // HANDLERS
  // ============================================
  const handleVerReporte = (reporte) => {
    try {
      const datos = reporte.generar();
      setReporteActivo(reporte);
      setDatosReporte(datos);
      setVistaPreviaAbierta(true);
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('Error al generar el reporte: ' + err.message);
    }
  };

  const handleExportar = (tipo) => {
    if (!reporteActivo || !datosReporte) return;
    
    const { columnas, filas } = datosReporte;
    const titulo = reporteActivo.nombre;
    const headers = columnas.map(c => c.label);
    const rows = filas.map(f => columnas.map(c => {
      const val = c.render ? c.render(f) : f[c.key];
      return String(val ?? '-');
    }));
    
    try {
      switch (tipo) {
        case 'pdf':
          exportarPDF(titulo, headers, rows, `Filtros: ${filtrosAplicados.join(', ') || 'Ninguno'}`);
          break;
        case 'excel':
          exportarExcel(titulo, headers, rows);
          break;
        case 'csv':
          exportarCSV(titulo, headers, rows);
          break;
        case 'json':
          exportarJSON(titulo, { titulo, filtros: filtrosAplicados, columnas: headers, datos: filas });
          break;
        case 'print':
          window.print();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error exportando:', err);
      setError('Error al exportar: ' + err.message);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header con botón de filtros y recargar */}
      <HeaderReportes
        theme={theme}
        totalReportes={reportes.length}
        totalPrestamos={prestamos.length}
        totalPagos={pagos.length}
        loading={loading}
        showFiltros={showFiltros}
        setShowFiltros={setShowFiltros}
        filtrosAplicados={filtrosAplicados}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        onRecargar={cargarDatos}
      />

      {/* Panel de filtros desplegable */}
      <AnimatePresence>
        {showFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <FiltrosPanel
              filtros={filtros}
              setFiltros={setFiltros}
              clientes={clientes}
              garantes={garantes}
              theme={theme}
              onAplicar={aplicarFiltros}
              onLimpiar={limpiarFiltros}
              obtenerRangoQuincena={obtenerRangoQuincena}
              obtenerRangoMes={obtenerRangoMes}
              obtenerRangoSemana={obtenerRangoSemana}
              obtenerRango3Meses={obtenerRango3Meses}
              obtenerRango6Meses={obtenerRango6Meses}
              obtenerRangoAño={obtenerRangoAño}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de búsqueda */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <BarraBusqueda
              showSearch={showSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros activos */}
      <FiltrosActivos
        filtrosAplicados={filtrosAplicados}
        limpiarFiltros={limpiarFiltros}
        theme={theme}
      />

      {/* Mensaje de error */}
      <MensajeError error={error} setError={setError} theme={theme} />

      {/* Selector de categorías */}
      <CategoriasSelector
        categorias={categorias}
        categoriaActiva={categoriaActiva}
        setCategoriaActiva={setCategoriaActiva}
        theme={theme}
      />

      {/* Grid de reportes */}
      {loading ? (
        <ReportesSkeleton theme={theme} />
      ) : reportesFiltrados.length === 0 ? (
        <MensajeVacio theme={theme} mensaje="No se encontraron reportes" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {reportesFiltrados.map((reporte) => (
            <ReporteCard
              key={reporte.id}
              reporte={reporte}
              onVer={handleVerReporte}
              theme={theme}
            />
          ))}
        </div>
      )}

      {/* Modal de vista previa */}
      <VistaPreviaModal
        isOpen={vistaPreviaAbierta}
        onClose={() => {
          setVistaPreviaAbierta(false);
          setReporteActivo(null);
          setDatosReporte({ columnas: [], filas: [], resumen: {} });
        }}
        titulo={reporteActivo?.nombre || 'Reporte'}
        columnas={datosReporte.columnas || []}
        filas={datosReporte.filas || []}
        resumen={datosReporte.resumen || {}}
        theme={theme}
        onExportar={handleExportar}
        filtrosAplicados={filtrosAplicados}
      />
    </div>
  );
};

export default Reportes;