import api from './api';

class DashboardService {
  // Obtener todas las estadísticas del dashboard
  async getDashboardStats(filtros = { periodo: 'mes' }) {
    try {
      console.log('📊 Obteniendo datos para el dashboard...', filtros);
      
      // Obtener todos los datos necesarios en paralelo
      const [clientes, prestamos, pagos, solicitudes] = await Promise.all([
        this.getClientes(),
        this.getPrestamos(),
        this.getPagos(),
        this.getSolicitudes()
      ]);

      console.log('✅ Datos obtenidos:', {
        clientes: clientes.length,
        prestamos: prestamos.length,
        pagos: pagos.length,
        solicitudes: solicitudes.length
      });

      // DEBUG: Mostrar todas las fechas de pagos
      console.log('🔍 DEBUG - FECHAS DE PAGOS:');
      pagos.forEach((pago, index) => {
        const fecha = this.convertTimestampToDate(pago.fechaPago);
        console.log(`  Pago ${index + 1}:`, {
          id: pago.id,
          cliente: pago.clienteNombre,
          monto: (pago.montoCapital || 0) + (pago.montoInteres || 0),
          fecha: fecha ? fecha.toLocaleDateString() : 'Sin fecha',
          fechaOriginal: pago.fechaPago,
          mes: fecha ? fecha.getMonth() + 1 : '?',
          año: fecha ? fecha.getFullYear() : '?'
        });
      });

      // DEBUG: Mostrar todas las fechas de préstamos
      console.log('🔍 DEBUG - FECHAS DE PRÉSTAMOS:');
      prestamos.forEach((prestamo, index) => {
        const fecha = this.convertTimestampToDate(prestamo.fechaPrestamo);
        console.log(`  Préstamo ${index + 1}:`, {
          id: prestamo.id,
          cliente: prestamo.clienteNombre,
          monto: prestamo.montoPrestado,
          fecha: fecha ? fecha.toLocaleDateString() : 'Sin fecha',
          fechaOriginal: prestamo.fechaPrestamo,
          mes: fecha ? fecha.getMonth() + 1 : '?',
          año: fecha ? fecha.getFullYear() : '?'
        });
      });

      // DEBUG: Mostrar todas las fechas de clientes nuevos
      console.log('🔍 DEBUG - FECHAS DE CLIENTES:');
      clientes.forEach((cliente, index) => {
        const fecha = this.convertTimestampToDate(cliente.fechaCreacion);
        console.log(`  Cliente ${index + 1}:`, {
          id: cliente.id,
          nombre: cliente.nombre,
          fecha: fecha ? fecha.toLocaleDateString() : 'Sin fecha',
          fechaOriginal: cliente.fechaCreacion,
          mes: fecha ? fecha.getMonth() + 1 : '?',
          año: fecha ? fecha.getFullYear() : '?'
        });
      });

      // Calcular estadísticas en tiempo real
      const stats = this.calculateStats(clientes, prestamos, pagos, solicitudes, filtros);
      const graficos = this.calculateCharts(pagos, prestamos, solicitudes, clientes, filtros);
      const metricas = this.calculateMetrics(prestamos, pagos, solicitudes, clientes);
      const actividadReciente = this.getRecentActivity(pagos, solicitudes, prestamos);
      const prestamosProximosVencimiento = this.getUpcomingDueLoans(prestamos, pagos);

      console.log('📈 Estadísticas calculadas:', stats);
      console.log('📅 Próximos vencimientos:', prestamosProximosVencimiento);

      return {
        stats,
        graficos,
        metricas,
        actividadReciente,
        prestamosProximosVencimiento
      };

    } catch (error) {
      console.error('❌ Error getting dashboard stats:', error);
      throw error;
    }
  }

  // Obtener clientes
  async getClientes() {
    try {
      const response = await api.get('/clientes');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  // Obtener préstamos
  async getPrestamos() {
    try {
      const response = await api.get('/prestamos');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching loans:', error);
      return [];
    }
  }

  // Obtener pagos
  async getPagos() {
    try {
      const response = await api.get('/pagos');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  // Obtener solicitudes
  async getSolicitudes() {
    try {
      const response = await api.get('/solicitudes');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
  }

  // Función para convertir timestamp a Date - CORREGIDA para manejar _seconds
  convertTimestampToDate(timestamp) {
    if (!timestamp) return null;
    
    try {
      // Si es timestamp de Firebase con _seconds (formato que estás recibiendo)
      if (timestamp && typeof timestamp === 'object' && timestamp._seconds !== undefined) {
        return new Date(timestamp._seconds * 1000);
      }
      // Si es timestamp de Firebase con seconds (formato estándar)
      if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
        return new Date(timestamp.seconds * 1000);
      }
      // Si es string ISO
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
      }
      // Si ya es Date
      if (timestamp instanceof Date) {
        return isNaN(timestamp.getTime()) ? null : timestamp;
      }
      // Si es número (timestamp en milisegundos)
      if (typeof timestamp === 'number') {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    } catch (error) {
      console.error('Error convirtiendo timestamp:', error, timestamp);
      return null;
    }
  }

  // Calcular estadísticas principales
  calculateStats(clientes, prestamos, pagos, solicitudes, filtros) {
    const hoy = new Date();
    const { periodo, fechaInicio, fechaFin } = filtros;
    
    let inicioPeriodo = null;
    let finPeriodo = null;
    
    // Configurar fechas según el período
    switch(periodo) {
      case 'hoy':
        inicioPeriodo = new Date(hoy);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'ayer':
        inicioPeriodo = new Date(hoy);
        inicioPeriodo.setDate(hoy.getDate() - 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy);
        finPeriodo.setDate(hoy.getDate() - 1);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'semana':
        inicioPeriodo = new Date(hoy);
        inicioPeriodo.setDate(hoy.getDate() - 7);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'mes':
        inicioPeriodo = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'trimestre':
        const trimestreInicio = Math.floor(hoy.getMonth() / 3) * 3;
        inicioPeriodo = new Date(hoy.getFullYear(), trimestreInicio, 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy.getFullYear(), trimestreInicio + 3, 0);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'año':
        inicioPeriodo = new Date(hoy.getFullYear(), 0, 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy.getFullYear(), 11, 31);
        finPeriodo.setHours(23,59,59,999);
        break;
      case 'personalizado':
        if (fechaInicio) {
          inicioPeriodo = new Date(fechaInicio);
          inicioPeriodo.setHours(0,0,0,0);
        }
        if (fechaFin) {
          finPeriodo = new Date(fechaFin);
          finPeriodo.setHours(23,59,59,999);
        }
        break;
      case 'todo':
        // Para 'todo', no aplicamos filtro de fechas
        inicioPeriodo = null;
        finPeriodo = null;
        break;
      default:
        inicioPeriodo = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        inicioPeriodo.setHours(0,0,0,0);
        finPeriodo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        finPeriodo.setHours(23,59,59,999);
    }

    console.log('📅 Calculando estadísticas para período:', periodo, 
      inicioPeriodo ? 'desde: ' + inicioPeriodo.toLocaleString() : 'sin filtro inicio',
      finPeriodo ? 'hasta: ' + finPeriodo.toLocaleString() : 'sin filtro fin');

    // Función para filtrar por fecha
    const filtrarPorFecha = (item, fechaCampo) => {
      // Si no hay filtro de fechas (período 'todo'), incluir todos
      if (!inicioPeriodo && !finPeriodo) return true;
      
      if (!item[fechaCampo]) return false;
      
      const fechaItem = this.convertTimestampToDate(item[fechaCampo]);
      if (!fechaItem) {
        console.warn(`⚠️ Fecha inválida en ${fechaCampo}:`, item[fechaCampo]);
        return false;
      }
      
      if (inicioPeriodo && fechaItem < inicioPeriodo) {
        return false;
      }
      if (finPeriodo && fechaItem > finPeriodo) {
        return false;
      }
      
      return true;
    };

    // Filtrar por período
    const pagosPeriodo = pagos.filter(pago => filtrarPorFecha(pago, 'fechaPago'));
    const prestamosPeriodo = prestamos.filter(prestamo => filtrarPorFecha(prestamo, 'fechaPrestamo'));
    const clientesPeriodo = clientes.filter(cliente => filtrarPorFecha(cliente, 'fechaCreacion'));

    // Cálculos
    const clientesActivos = clientes.filter(c => c.activo !== false).length;
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    
    // Pagos de HOY
    const hoyInicio = new Date();
    hoyInicio.setHours(0,0,0,0);
    const hoyFin = new Date();
    hoyFin.setHours(23,59,59,999);
    
    const pagosHoy = pagos.filter(pago => {
      if (!pago.fechaPago) return false;
      const fechaPago = this.convertTimestampToDate(pago.fechaPago);
      return fechaPago && fechaPago >= hoyInicio && fechaPago <= hoyFin;
    }).length;

    const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    
    // Ganancias del período - SOLO intereses
    const gananciasPeriodo = pagosPeriodo.reduce((sum, pago) => {
      const interes = parseFloat(pago.montoInteres) || 0;
      return sum + interes;
    }, 0);

    // Capital prestado - TOTAL de todos los préstamos
    const capitalPrestado = prestamos.reduce((sum, prestamo) => {
      const monto = parseFloat(prestamo.montoPrestado) || 0;
      return sum + monto;
    }, 0);

    // Capital restante - solo de préstamos activos
    const capitalRestante = prestamos
      .filter(p => p.estado === 'activo')
      .reduce((sum, prestamo) => {
        const capital = parseFloat(prestamo.capitalRestante) || parseFloat(prestamo.montoPrestado) || 0;
        return sum + capital;
      }, 0);

    // Capital recuperado - suma total de pagos de capital
    const capitalRecuperado = pagos.reduce((sum, pago) => {
      return sum + (parseFloat(pago.montoCapital) || 0);
    }, 0);

    // Morosidad - porcentaje del capital pendiente
    const morosidad = capitalPrestado > 0 ? 
      (capitalRestante / capitalPrestado * 100) : 0;

    // Préstamos del mes
    const prestamosMes = prestamosPeriodo.length;

    // Clientes nuevos este mes
    const nuevosClientes = clientesPeriodo.length;

    // Préstamos desembolsados este mes
    const prestamosDesembolsadosMes = prestamosPeriodo.length;

    console.log('💰 Ganancias calculadas:', gananciasPeriodo);
    console.log('📅 Pagos hoy:', pagosHoy);
    console.log('💰 Capital recuperado total:', capitalRecuperado);
    console.log('📊 Pagos en período:', pagosPeriodo.length);
    console.log('📊 Préstamos en período:', prestamosPeriodo.length);
    console.log('📊 Clientes nuevos en período:', nuevosClientes);

    return {
      clientes: clientesActivos,
      prestamos: prestamosActivos,
      pagosHoy: pagosHoy,
      solicitudes: solicitudesPendientes,
      gananciasMes: gananciasPeriodo,
      capitalPrestado: capitalPrestado,
      morosidad: parseFloat(morosidad.toFixed(1)),
      pagosPendientes: prestamosActivos,
      nuevosClientes: nuevosClientes,
      capitalRecuperado: capitalRecuperado,
      tasaRecuperacion: capitalPrestado > 0 ? 
        parseFloat(((capitalRecuperado / capitalPrestado) * 100).toFixed(1)) : 0,
      prestamosMes: prestamosMes,
      prestamosDesembolsadosMes: prestamosDesembolsadosMes
    };
  }

  // Calcular datos para gráficos
  calculateCharts(pagos, prestamos, solicitudes, clientes, filtros) {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const { periodo } = filtros;

    let mesesData;
    let añoActual = hoy.getFullYear();

    if (periodo === 'año' || periodo === 'todo') {
      mesesData = meses;
    } else if (periodo === 'trimestre') {
      const trimestreActual = Math.floor(hoy.getMonth() / 3);
      mesesData = meses.slice(trimestreActual * 3, trimestreActual * 3 + 3);
    } else {
      mesesData = meses.slice(0, hoy.getMonth() + 1);
    }

    console.log('📈 Generando gráficos para meses:', mesesData, 'período:', periodo);

    // Función para obtener mes de timestamp
    const getMonthFromTimestamp = (timestamp) => {
      if (!timestamp) return -1;
      const date = this.convertTimestampToDate(timestamp);
      return date ? date.getMonth() : -1;
    };

    const getYearFromTimestamp = (timestamp) => {
      if (!timestamp) return -1;
      const date = this.convertTimestampToDate(timestamp);
      return date ? date.getFullYear() : -1;
    };

    // Pagos por mes - MONTO TOTAL (capital + intereses)
    const pagosPorMes = mesesData.map((mes, index) => {
      const mesIndex = periodo === 'año' || periodo === 'todo' ? index : 
                      periodo === 'trimestre' ? (Math.floor(hoy.getMonth() / 3) * 3) + index : index;
      
      const total = pagos.reduce((sum, pago) => {
        const mesPago = getMonthFromTimestamp(pago.fechaPago);
        const añoPago = getYearFromTimestamp(pago.fechaPago);
        if (mesPago === mesIndex && añoPago === añoActual) {
          const capital = parseFloat(pago.montoCapital) || 0;
          const interes = parseFloat(pago.montoInteres) || 0;
          return sum + capital + interes;
        }
        return sum;
      }, 0);
      return { mes, value: total };
    });

    // Préstamos por mes - CANTIDAD
    const prestamosPorMes = mesesData.map((mes, index) => {
      const mesIndex = periodo === 'año' || periodo === 'todo' ? index : 
                      periodo === 'trimestre' ? (Math.floor(hoy.getMonth() / 3) * 3) + index : index;
      
      const count = prestamos.filter(prestamo => {
        const mesPrestamo = getMonthFromTimestamp(prestamo.fechaPrestamo);
        const añoPrestamo = getYearFromTimestamp(prestamo.fechaPrestamo);
        return mesPrestamo === mesIndex && añoPrestamo === añoActual;
      }).length;
      return { mes, value: count };
    });

    // Solicitudes por estado - CON DATOS REALES
    const solicitudesPorEstado = [
      { 
        estado: 'Aprobadas', 
        value: solicitudes.filter(s => s.estado === 'aprobada' || s.estado === 'aprobado').length, 
        color: '#10B981' 
      },
      { 
        estado: 'Pendientes', 
        value: solicitudes.filter(s => s.estado === 'pendiente').length, 
        color: '#F59E0B' 
      },
      { 
        estado: 'Rechazadas', 
        value: solicitudes.filter(s => s.estado === 'rechazada' || s.estado === 'rechazado').length, 
        color: '#EF4444' 
      }
    ];

    // Clientes nuevos por mes
    const clientesNuevos = mesesData.map((mes, index) => {
      const mesIndex = periodo === 'año' || periodo === 'todo' ? index : 
                      periodo === 'trimestre' ? (Math.floor(hoy.getMonth() / 3) * 3) + index : index;
      
      const count = clientes.filter(cliente => {
        const mesCreacion = getMonthFromTimestamp(cliente.fechaCreacion);
        const añoCreacion = getYearFromTimestamp(cliente.fechaCreacion);
        return mesCreacion === mesIndex && añoCreacion === añoActual;
      }).length;
      return { mes, value: count };
    });

    // Distribución de pagos
    const totalCapital = pagos.reduce((sum, pago) => sum + (parseFloat(pago.montoCapital) || 0), 0);
    const totalIntereses = pagos.reduce((sum, pago) => sum + (parseFloat(pago.montoInteres) || 0), 0);
    
    // Calcular moras basado en pagos con tipo mora
    const totalMoras = pagos.reduce((sum, pago) => {
      const interes = parseFloat(pago.montoInteres) || 0;
      if (pago.tipoPago === 'mora' || (pago.tipoPago && pago.tipoPago.toLowerCase().includes('mora'))) {
        return sum + interes;
      }
      return sum;
    }, 0);

    const distribucionPagos = [
      { tipo: 'Capital', value: totalCapital, color: '#3B82F6' },
      { tipo: 'Intereses', value: totalIntereses, color: '#10B981' },
      { tipo: 'Moras', value: totalMoras, color: '#EF4444' }
    ];

    // Distribución de préstamos por estado
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    const prestamosCompletados = prestamos.filter(p => p.estado === 'completado' || p.estado === 'completados' || p.capitalRestante === 0).length;
    const prestamosMorosos = prestamos.filter(p => p.estado === 'moroso').length;

    const distribucionPrestamos = [
      { tipo: 'Activos', value: prestamosActivos, color: '#10B981' },
      { tipo: 'Completados', value: prestamosCompletados, color: '#3B82F6' },
      { tipo: 'Morosos', value: prestamosMorosos, color: '#EF4444' }
    ];

    // Tendencia de ganancias (solo intereses)
    const gananciasPorMes = mesesData.map((mes, index) => {
      const mesIndex = periodo === 'año' || periodo === 'todo' ? index : 
                      periodo === 'trimestre' ? (Math.floor(hoy.getMonth() / 3) * 3) + index : index;
      
      const total = pagos.reduce((sum, pago) => {
        const mesPago = getMonthFromTimestamp(pago.fechaPago);
        const añoPago = getYearFromTimestamp(pago.fechaPago);
        if (mesPago === mesIndex && añoPago === añoActual) {
          return sum + (parseFloat(pago.montoInteres) || 0);
        }
        return sum;
      }, 0);
      return { mes, value: total };
    });

    // Préstamos por tipo (todos personales por ahora)
    const prestamosPorTipo = [
      { tipo: 'Personales', value: prestamos.length, color: '#3B82F6' }
    ];

    // Clientes por provincia
    const provinciasMap = new Map();
    clientes.forEach(cliente => {
      if (cliente.provincia) {
        const count = provinciasMap.get(cliente.provincia) || 0;
        provinciasMap.set(cliente.provincia, count + 1);
      }
    });

    const clientesPorProvincia = Array.from(provinciasMap.entries())
      .map(([provincia, count]) => ({ 
        nombre: provincia, 
        value: count,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      }))
      .slice(0, 10);

    // Morosidad por mes
    const morosidadPorMes = mesesData.map((mes, index) => {
      const mesIndex = periodo === 'año' || periodo === 'todo' ? index : 
                      periodo === 'trimestre' ? (Math.floor(hoy.getMonth() / 3) * 3) + index : index;
      
      // Obtener préstamos creados en ese mes
      const prestamosMes = prestamos.filter(p => {
        const mesPrestamo = getMonthFromTimestamp(p.fechaPrestamo);
        const añoPrestamo = getYearFromTimestamp(p.fechaPrestamo);
        return mesPrestamo === mesIndex && añoPrestamo === añoActual;
      });

      // De esos préstamos, cuántos están en mora
      const morososMes = prestamosMes.filter(p => p.estado === 'moroso').length;
      const total = prestamosMes.length || 1;
      
      return { 
        mes, 
        value: parseFloat((morososMes / total * 100).toFixed(1))
      };
    });

    // Flujo de caja (ingresos vs egresos)
    const flujoCaja = mesesData.map((mes, index) => {
      const mesIndex = periodo === 'año' || periodo === 'todo' ? index : 
                      periodo === 'trimestre' ? (Math.floor(hoy.getMonth() / 3) * 3) + index : index;
      
      const ingresos = pagos.reduce((sum, pago) => {
        const mesPago = getMonthFromTimestamp(pago.fechaPago);
        const añoPago = getYearFromTimestamp(pago.fechaPago);
        if (mesPago === mesIndex && añoPago === añoActual) {
          return sum + (parseFloat(pago.montoCapital) || 0) + (parseFloat(pago.montoInteres) || 0);
        }
        return sum;
      }, 0);

      const egresos = prestamos.reduce((sum, prestamo) => {
        const mesPrestamo = getMonthFromTimestamp(prestamo.fechaPrestamo);
        const añoPrestamo = getYearFromTimestamp(prestamo.fechaPrestamo);
        if (mesPrestamo === mesIndex && añoPrestamo === añoActual) {
          return sum + (parseFloat(prestamo.montoPrestado) || 0);
        }
        return sum;
      }, 0);

      return { mes, ingresos, gastos: egresos };
    });

    // Proyecciones a 6 meses
    const ultimasGanancias = gananciasPorMes.slice(-3).map(g => g.value);
    const promedioGanancias = ultimasGanancias.length > 0 ? 
      ultimasGanancias.reduce((a, b) => a + b, 0) / ultimasGanancias.length : 0;
    
    const proyecciones = [];
    for (let i = 1; i <= 6; i++) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() + i);
      const mesNombre = meses[fecha.getMonth()];
      // Proyección con crecimiento estimado del 5% mensual
      const valorProyectado = promedioGanancias * Math.pow(1.05, i);
      proyecciones.push({
        mes: mesNombre,
        value: Math.round(valorProyectado)
      });
    }

    console.log('📊 Datos de gráficos generados:', {
      pagosPorMes: pagosPorMes.map(p => p.value),
      prestamosPorMes: prestamosPorMes.map(p => p.value),
      gananciasPorMes: gananciasPorMes.map(g => g.value),
      morosidadPorMes: morosidadPorMes.map(m => m.value),
      distribucionPagos,
      distribucionPrestamos,
      solicitudesPorEstado
    });

    // Datos para el gráfico de rendimiento
    const statsTodo = this.calculateStats(clientes, prestamos, pagos, solicitudes, { periodo: 'todo' });

    return {
      pagosPorMes,
      prestamosPorMes,
      solicitudesPorEstado,
      clientesNuevos,
      distribucionPagos,
      distribucionPrestamos,
      gananciasPorMes,
      prestamosPorTipo,
      clientesPorProvincia,
      morosidadPorMes,
      flujoCaja,
      proyecciones,
      rendimiento: {
        cantidades: {
          clientes: clientes.length,
          prestamos: prestamos.length,
          pagos: pagos.length,
          solicitudes: solicitudes.length
        },
        montos: {
          capitalPrestado: statsTodo.capitalPrestado,
          capitalRecuperado: statsTodo.capitalRecuperado,
          ganancias: statsTodo.gananciasMes
        }
      }
    };
  }

  // Calcular métricas de desempeño
  calculateMetrics(prestamos, pagos, solicitudes, clientes) {
    const totalSolicitudes = solicitudes.length;
    const solicitudesAprobadas = solicitudes.filter(s => s.estado === 'aprobada' || s.estado === 'aprobado').length;
    const tasaAprobacion = totalSolicitudes > 0 ? (solicitudesAprobadas / totalSolicitudes * 100) : 0;

    const totalPrestamos = prestamos.length;
    const promedioPrestamo = totalPrestamos > 0 ? 
      prestamos.reduce((sum, p) => sum + (parseFloat(p.montoPrestado) || 0), 0) / totalPrestamos : 0;

    const totalPagos = pagos.length;
    const totalPrestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    const rotacionCapital = totalPrestamosActivos > 0 ? (totalPagos / totalPrestamosActivos) : 0;

    const pagosCompletados = prestamos.filter(p => p.estado === 'completado' || p.capitalRestante === 0).length;
    const eficienciaCobranza = totalPrestamos > 0 ? (pagosCompletados / totalPrestamos * 100) : 0;

    const totalIntereses = pagos.reduce((sum, pago) => sum + (parseFloat(pago.montoInteres) || 0), 0);
    const rentabilidad = totalPrestamos > 0 ? (totalIntereses / totalPrestamos) : 0;

    const prestamosMorosos = prestamos.filter(p => p.estado === 'moroso').length;
    const indiceMorosidad = totalPrestamos > 0 ? (prestamosMorosos / totalPrestamos * 100) : 0;

    // ROA (Return on Assets) - Basado en ganancias / capital prestado
    const capitalPrestado = prestamos.reduce((sum, p) => sum + (parseFloat(p.montoPrestado) || 0), 0);
    const ROA = capitalPrestado > 0 ? ((totalIntereses / capitalPrestado) * 100) : 0;
    
    // ROE (Return on Equity) - Simulado
    const ROE = ROA * 3;
    
    // Liquidez
    const liquidez = this.calculateLiquidez(pagos, prestamos);
    
    // Solvencia
    const capitalRecuperado = pagos.reduce((sum, pago) => sum + (parseFloat(pago.montoCapital) || 0), 0);
    const solvencia = capitalPrestado > 0 ? (capitalRecuperado / capitalPrestado * 100) : 0;

    return {
      tasaAprobacion: parseFloat(tasaAprobacion.toFixed(1)),
      promedioPrestamo: parseFloat(promedioPrestamo.toFixed(0)),
      rotacionCapital: parseFloat(rotacionCapital.toFixed(1)),
      eficienciaCobranza: parseFloat(eficienciaCobranza.toFixed(1)),
      rentabilidad: parseFloat(rentabilidad.toFixed(1)),
      indiceMorosidad: parseFloat(indiceMorosidad.toFixed(1)),
      ROA: parseFloat(ROA.toFixed(1)),
      ROE: parseFloat(ROE.toFixed(1)),
      liquidez: parseFloat(liquidez.toFixed(1)),
      solvencia: parseFloat(solvencia.toFixed(1))
    };
  }

  // Calcular liquidez
  calculateLiquidez(pagos, prestamos) {
    const hoy = new Date();
    const hace3Meses = new Date(hoy);
    hace3Meses.setMonth(hoy.getMonth() - 3);
    
    const pagosUltimos3Meses = pagos.filter(pago => {
      const fechaPago = this.convertTimestampToDate(pago.fechaPago);
      return fechaPago && fechaPago >= hace3Meses;
    });

    const prestamosUltimos3Meses = prestamos.filter(prestamo => {
      const fechaPrestamo = this.convertTimestampToDate(prestamo.fechaPrestamo);
      return fechaPrestamo && fechaPrestamo >= hace3Meses;
    });

    const totalPagos = pagosUltimos3Meses.reduce((sum, pago) => 
      sum + (parseFloat(pago.montoCapital) || 0) + (parseFloat(pago.montoInteres) || 0), 0);
    
    const totalPrestamos = prestamosUltimos3Meses.reduce((sum, prestamo) => 
      sum + (parseFloat(prestamo.montoPrestado) || 0), 0);

    return totalPrestamos > 0 ? (totalPagos / totalPrestamos * 100) : 0;
  }

  // Obtener actividad reciente
  getRecentActivity(pagos, solicitudes, prestamos) {
    const actividad = [];

    // Agregar pagos recientes
    pagos.slice(0, 10).forEach(pago => {
      const fechaObj = this.convertTimestampToDate(pago.fechaPago) || new Date();
      
      actividad.push({
        id: pago.id || `pago-${Date.now()}-${Math.random()}`,
        tipo: 'pago',
        descripcion: `Pago recibido - ${pago.clienteNombre || 'Cliente'}`,
        monto: (parseFloat(pago.montoCapital) || 0) + (parseFloat(pago.montoInteres) || 0),
        fecha: pago.fechaPago,
        fechaObj: fechaObj,
        icono: 'CreditCardIcon',
        color: 'from-green-600 to-green-400'
      });
    });

    // Agregar solicitudes recientes
    solicitudes
      .slice(0, 5)
      .forEach(solicitud => {
        const fechaObj = this.convertTimestampToDate(solicitud.fechaSolicitud) || new Date();
        
        actividad.push({
          id: solicitud.id || `solicitud-${Date.now()}-${Math.random()}`,
          tipo: 'solicitud',
          descripcion: `Nueva solicitud - ${solicitud.clienteNombre || 'Cliente'}`,
          monto: parseFloat(solicitud.montoSolicitado) || 0,
          fecha: solicitud.fechaSolicitud,
          fechaObj: fechaObj,
          icono: 'DocumentTextIcon',
          color: 'from-blue-600 to-blue-400'
        });
      });

    // Agregar préstamos nuevos
    prestamos
      .slice(0, 5)
      .forEach(prestamo => {
        const fechaObj = this.convertTimestampToDate(prestamo.fechaPrestamo) || new Date();
        
        actividad.push({
          id: prestamo.id || `prestamo-${Date.now()}-${Math.random()}`,
          tipo: 'prestamo',
          descripcion: `Préstamo aprobado - ${prestamo.clienteNombre || 'Cliente'}`,
          monto: parseFloat(prestamo.montoPrestado) || 0,
          fecha: prestamo.fechaPrestamo,
          fechaObj: fechaObj,
          icono: 'CurrencyDollarIcon',
          color: 'from-purple-600 to-purple-400'
        });
      });

    // Ordenar por fecha (más reciente primero) y eliminar duplicados
    const actividadUnica = Array.from(new Map(actividad.map(item => [item.id, item])).values());
    
    return actividadUnica
      .sort((a, b) => {
        const fechaA = a.fechaObj || new Date(0);
        const fechaB = b.fechaObj || new Date(0);
        return fechaB - fechaA;
      })
      .slice(0, 10);
  }

  // Obtener préstamos próximos a vencer
  getUpcomingDueLoans(prestamos, pagos) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const dosSemanasDespues = new Date(hoy);
    dosSemanasDespues.setDate(hoy.getDate() + 14);
    dosSemanasDespues.setHours(23, 59, 59, 999);

    console.log('🔍 Buscando préstamos próximos a vencer entre:', hoy, 'y', dosSemanasDespues);

    // Obtener los últimos pagos por préstamo
    const pagosPorPrestamo = {};
    pagos.forEach(pago => {
      if (pago.prestamoID) {
        if (!pagosPorPrestamo[pago.prestamoID]) {
          pagosPorPrestamo[pago.prestamoID] = [];
        }
        pagosPorPrestamo[pago.prestamoID].push(pago);
      }
    });

    // Ordenar pagos por fecha (más reciente primero)
    Object.keys(pagosPorPrestamo).forEach(key => {
      pagosPorPrestamo[key].sort((a, b) => {
        const fechaA = this.convertTimestampToDate(a.fechaPago) || new Date(0);
        const fechaB = this.convertTimestampToDate(b.fechaPago) || new Date(0);
        return fechaB - fechaA;
      });
    });

    const prestamosProximos = prestamos
      .filter(prestamo => {
        // Solo préstamos activos
        if (prestamo.estado !== 'activo') return false;
        
        let fechaVencimiento = null;
        
        // Si tiene fechaProximoPago, usarla
        if (prestamo.fechaProximoPago) {
          fechaVencimiento = this.convertTimestampToDate(prestamo.fechaProximoPago);
        } 
        
        // Si no, calcular basado en fechaPrestamo
        if (!fechaVencimiento && prestamo.fechaPrestamo) {
          const fechaPrestamo = this.convertTimestampToDate(prestamo.fechaPrestamo);
          if (fechaPrestamo) {
            // Calcular según frecuencia
            if (prestamo.frecuencia === 'quincenal') {
              fechaVencimiento = new Date(fechaPrestamo);
              fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
            } else if (prestamo.frecuencia === 'mensual') {
              fechaVencimiento = new Date(fechaPrestamo);
              fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
            } else {
              // Por defecto, 30 días
              fechaVencimiento = new Date(fechaPrestamo);
              fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
            }
          }
        }
        
        // Si tenemos pagos, recalcular basado en el último pago
        if (pagosPorPrestamo[prestamo.id] && pagosPorPrestamo[prestamo.id].length > 0) {
          const ultimoPago = pagosPorPrestamo[prestamo.id][0];
          const fechaUltimoPago = this.convertTimestampToDate(ultimoPago.fechaPago);
          
          if (fechaUltimoPago) {
            if (prestamo.frecuencia === 'quincenal') {
              fechaVencimiento = new Date(fechaUltimoPago);
              fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
            } else if (prestamo.frecuencia === 'mensual') {
              fechaVencimiento = new Date(fechaUltimoPago);
              fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
            }
          }
        }
        
        if (!fechaVencimiento) return false;
        
        // Ajustar hora para comparación
        fechaVencimiento.setHours(0, 0, 0, 0);
        
        // Verificar si vence en los próximos 14 días
        return fechaVencimiento >= hoy && fechaVencimiento <= dosSemanasDespues;
      })
      .map(prestamo => {
        let fechaVencimiento = null;
        
        // Recalcular fecha (misma lógica que arriba)
        if (prestamo.fechaProximoPago) {
          fechaVencimiento = this.convertTimestampToDate(prestamo.fechaProximoPago);
        } else if (prestamo.fechaPrestamo) {
          const fechaPrestamo = this.convertTimestampToDate(prestamo.fechaPrestamo);
          if (fechaPrestamo) {
            if (prestamo.frecuencia === 'quincenal') {
              fechaVencimiento = new Date(fechaPrestamo);
              fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
            } else if (prestamo.frecuencia === 'mensual') {
              fechaVencimiento = new Date(fechaPrestamo);
              fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
            } else {
              fechaVencimiento = new Date(fechaPrestamo);
              fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
            }
          }
        }
        
        if (pagosPorPrestamo[prestamo.id] && pagosPorPrestamo[prestamo.id].length > 0) {
          const ultimoPago = pagosPorPrestamo[prestamo.id][0];
          const fechaUltimoPago = this.convertTimestampToDate(ultimoPago.fechaPago);
          
          if (fechaUltimoPago) {
            if (prestamo.frecuencia === 'quincenal') {
              fechaVencimiento = new Date(fechaUltimoPago);
              fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
            } else if (prestamo.frecuencia === 'mensual') {
              fechaVencimiento = new Date(fechaUltimoPago);
              fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
            }
          }
        }
        
        fechaVencimiento = fechaVencimiento || new Date();
        fechaVencimiento.setHours(0, 0, 0, 0);
        
        const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        
        return {
          id: prestamo.id,
          cliente: prestamo.clienteNombre || 'Cliente',
          monto: parseFloat(prestamo.capitalRestante) || parseFloat(prestamo.montoPrestado) || 0,
          fechaVencimiento: fechaVencimiento.toISOString(),
          fechaVencimientoObj: fechaVencimiento,
          diasRestantes: Math.max(0, diasRestantes)
        };
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 8);

    console.log('📅 Próximos vencimientos encontrados:', prestamosProximos);

    return prestamosProximos;
  }
}

export default new DashboardService();