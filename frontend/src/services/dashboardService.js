import api from './api';

class DashboardService {
  // Obtener todas las estadísticas del dashboard
  async getDashboardStats(periodo = 'mes') {
    try {
      console.log('📊 Obteniendo datos para el dashboard...');
      
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

      // Calcular estadísticas en tiempo real
      const stats = this.calculateStats(clientes, prestamos, pagos, solicitudes, periodo);
      const graficos = this.calculateCharts(pagos, prestamos, solicitudes, clientes, periodo);
      const metricas = this.calculateMetrics(prestamos, pagos, solicitudes);
      const actividadReciente = this.getRecentActivity(pagos, solicitudes, prestamos);
      const prestamosProximosVencimiento = this.getUpcomingDueLoans(prestamos);

      console.log('📈 Estadísticas calculadas:', stats);

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

  // Calcular estadísticas principales MEJORADO
  calculateStats(clientes, prestamos, pagos, solicitudes, periodo) {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);

    console.log('📅 Calculando estadísticas para período:', periodo);

    // Filtrar por período
    const pagosPeriodo = pagos.filter(pago => {
      if (!pago.fechaPago) return false;
      const fechaPago = new Date(pago.fechaPago);
      if (periodo === 'mes') return fechaPago >= inicioMes;
      if (periodo === 'año') return fechaPago >= inicioAnio;
      return true;
    });

    const prestamosPeriodo = prestamos.filter(prestamo => {
      if (!prestamo.fechaPrestamo) return false;
      const fechaPrestamo = new Date(prestamo.fechaPrestamo);
      if (periodo === 'mes') return fechaPrestamo >= inicioMes;
      if (periodo === 'año') return fechaPrestamo >= inicioAnio;
      return true;
    });

    // Cálculos MEJORADOS
    const clientesActivos = clientes.filter(c => c.activo !== false).length;
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    
    // Pagos de HOY - corregido
    const pagosHoy = pagos.filter(pago => {
      if (!pago.fechaPago) return false;
      const fechaPago = new Date(pago.fechaPago);
      return fechaPago.toDateString() === hoy.toDateString();
    }).length;

    const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    
    // GANANCIAS del período - SOLO intereses
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

    // Morosidad - porcentaje del capital pendiente
    const morosidad = capitalPrestado > 0 ? 
      (capitalRestante / capitalPrestado * 100) : 0;

    // Pagos pendientes - basado en préstamos activos
    const pagosPendientes = prestamosActivos;

    // Clientes nuevos este mes
    const nuevosClientes = clientes.filter(c => {
      if (!c.fechaCreacion) return false;
      const fechaCreacion = new Date(c.fechaCreacion);
      return fechaCreacion >= inicioMes;
    }).length;

    console.log('💰 Ganancias calculadas:', gananciasPeriodo);
    console.log('📅 Pagos hoy:', pagosHoy);

    return {
      clientes: clientesActivos,
      prestamos: prestamosActivos,
      pagosHoy: pagosHoy,
      solicitudes: solicitudesPendientes,
      gananciasMes: gananciasPeriodo,
      capitalPrestado: capitalPrestado,
      morosidad: parseFloat(morosidad.toFixed(1)),
      pagosPendientes: pagosPendientes,
      nuevosClientes: nuevosClientes,
      capitalRecuperado: capitalPrestado - capitalRestante,
      tasaRecuperacion: capitalPrestado > 0 ? 
        parseFloat(((capitalPrestado - capitalRestante) / capitalPrestado * 100).toFixed(1)) : 0
    };
  }

  // Calcular datos para gráficos MEJORADO
  calculateCharts(pagos, prestamos, solicitudes, clientes, periodo) {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const mesesData = periodo === 'año' ? meses : meses.slice(0, hoy.getMonth() + 1);

    console.log('📈 Generando gráficos para meses:', mesesData);

    // Pagos por mes - MONTO TOTAL (capital + intereses)
    const pagosPorMes = mesesData.map((mes, index) => {
      const total = pagos.reduce((sum, pago) => {
        if (!pago.fechaPago) return sum;
        const fechaPago = new Date(pago.fechaPago);
        if (fechaPago.getMonth() === index && fechaPago.getFullYear() === hoy.getFullYear()) {
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
      const count = prestamos.filter(prestamo => {
        if (!prestamo.fechaPrestamo) return false;
        const fechaPrestamo = new Date(prestamo.fechaPrestamo);
        return fechaPrestamo.getMonth() === index && fechaPrestamo.getFullYear() === hoy.getFullYear();
      }).length;
      return { mes, value: count };
    });

    // Solicitudes por estado
    const solicitudesAprobadas = solicitudes.filter(s => s.estado === 'aprobada').length;
    const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
    const solicitudesRechazadas = solicitudes.filter(s => s.estado === 'rechazada').length;

    const solicitudesPorEstado = [
      { estado: 'Aprobadas', value: solicitudesAprobadas, color: '#10B981' },
      { estado: 'Pendientes', value: solicitudesPendientes, color: '#F59E0B' },
      { estado: 'Rechazadas', value: solicitudesRechazadas, color: '#EF4444' }
    ];

    // Clientes nuevos por mes
    const clientesNuevos = mesesData.map((mes, index) => {
      const count = clientes.filter(cliente => {
        if (!cliente.fechaCreacion) return false;
        const fechaCreacion = new Date(cliente.fechaCreacion);
        return fechaCreacion.getMonth() === index && fechaCreacion.getFullYear() === hoy.getFullYear();
      }).length;
      return { mes, value: count };
    });

    // Distribución de pagos - CORREGIDO
    const totalCapital = pagos.reduce((sum, pago) => sum + (parseFloat(pago.montoCapital) || 0), 0);
    const totalIntereses = pagos.reduce((sum, pago) => sum + (parseFloat(pago.montoInteres) || 0), 0);
    
    // Calcular moras basado en pagos con tipo mora o intereses altos
    const totalMoras = pagos.reduce((sum, pago) => {
      const interes = parseFloat(pago.montoInteres) || 0;
      const capital = parseFloat(pago.montoCapital) || 0;
      // Si el interés es más del 20% del pago total, considerar como mora
      if (pago.tipoPago === 'mora' || (capital > 0 && interes / capital > 0.2)) {
        return sum + interes;
      }
      return sum;
    }, 0);

    const distribucionPagos = [
      { tipo: 'Capital', value: totalCapital, color: '#3B82F6' },
      { tipo: 'Intereses', value: totalIntereses, color: '#10B981' },
      { tipo: 'Moras', value: totalMoras, color: '#EF4444' }
    ];

    // NUEVO: Distribución de préstamos por estado
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    const prestamosCompletados = prestamos.filter(p => p.estado === 'completado').length;
    const prestamosMorosos = prestamos.filter(p => p.estado === 'moroso').length;

    const distribucionPrestamos = [
      { tipo: 'Activos', value: prestamosActivos, color: '#10B981' },
      { tipo: 'Completados', value: prestamosCompletados, color: '#3B82F6' },
      { tipo: 'Morosos', value: prestamosMorosos, color: '#EF4444' }
    ];

    // NUEVO: Tendencia de ganancias (solo intereses)
    const gananciasPorMes = mesesData.map((mes, index) => {
      const total = pagos.reduce((sum, pago) => {
        if (!pago.fechaPago) return sum;
        const fechaPago = new Date(pago.fechaPago);
        if (fechaPago.getMonth() === index && fechaPago.getFullYear() === hoy.getFullYear()) {
          return sum + (parseFloat(pago.montoInteres) || 0);
        }
        return sum;
      }, 0);
      return { mes, value: total };
    });

    console.log('📊 Datos de gráficos generados:', {
      pagosPorMes: pagosPorMes.map(p => p.value),
      prestamosPorMes: prestamosPorMes.map(p => p.value),
      gananciasPorMes: gananciasPorMes.map(g => g.value)
    });

    return {
      pagosPorMes,
      prestamosPorMes,
      solicitudesPorEstado,
      clientesNuevos,
      distribucionPagos,
      distribucionPrestamos,
      gananciasPorMes
    };
  }

  // Calcular métricas de desempeño
  calculateMetrics(prestamos, pagos, solicitudes) {
    const totalSolicitudes = solicitudes.length;
    const solicitudesAprobadas = solicitudes.filter(s => s.estado === 'aprobada').length;
    const tasaAprobacion = totalSolicitudes > 0 ? (solicitudesAprobadas / totalSolicitudes * 100) : 0;

    const totalPrestamos = prestamos.length;
    const promedioPrestamo = totalPrestamos > 0 ? 
      prestamos.reduce((sum, p) => sum + (parseFloat(p.montoPrestado) || 0), 0) / totalPrestamos : 0;

    const totalPagos = pagos.length;
    const totalPrestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
    const rotacionCapital = totalPrestamosActivos > 0 ? (totalPagos / totalPrestamosActivos) : 0;

    const pagosCompletados = prestamos.filter(p => p.estado === 'completado').length;
    const eficienciaCobranza = totalPrestamos > 0 ? (pagosCompletados / totalPrestamos * 100) : 0;

    // NUEVAS MÉTRICAS
    const totalIntereses = pagos.reduce((sum, pago) => sum + (parseFloat(pago.montoInteres) || 0), 0);
    const rentabilidad = promedioPrestamo > 0 ? (totalIntereses / promedioPrestamo * 100) : 0;

    const prestamosMorosos = prestamos.filter(p => p.estado === 'moroso').length;
    const indiceMorosidad = totalPrestamos > 0 ? (prestamosMorosos / totalPrestamos * 100) : 0;

    return {
      tasaAprobacion: parseFloat(tasaAprobacion.toFixed(1)),
      promedioPrestamo: parseFloat(promedioPrestamo.toFixed(0)),
      rotacionCapital: parseFloat(rotacionCapital.toFixed(1)),
      eficienciaCobranza: parseFloat(eficienciaCobranza.toFixed(1)),
      rentabilidad: parseFloat(rentabilidad.toFixed(1)),
      indiceMorosidad: parseFloat(indiceMorosidad.toFixed(1))
    };
  }

  // Obtener actividad reciente MEJORADO
  getRecentActivity(pagos, solicitudes, prestamos) {
    const actividad = [];

    // Agregar pagos recientes (últimos 5)
    const pagosRecientes = pagos
      .slice(0, 5)
      .map(pago => ({
        id: pago.id || `pago-${Date.now()}`,
        tipo: 'pago',
        descripcion: `Pago recibido - ${pago.clienteNombre || 'Cliente'}`,
        monto: (parseFloat(pago.montoCapital) || 0) + (parseFloat(pago.montoInteres) || 0),
        fecha: pago.fechaPago || new Date().toISOString(),
        icono: 'CreditCardIcon',
        color: 'text-green-600'
      }));

    // Agregar solicitudes recientes (últimas 3)
    const solicitudesRecientes = solicitudes
      .filter(s => s.estado === 'pendiente')
      .slice(0, 3)
      .map(solicitud => ({
        id: solicitud.id || `solicitud-${Date.now()}`,
        tipo: 'solicitud',
        descripcion: `Nueva solicitud - ${solicitud.clienteNombre || 'Cliente'}`,
        monto: parseFloat(solicitud.montoSolicitado) || 0,
        fecha: solicitud.fechaSolicitud || new Date().toISOString(),
        icono: 'DocumentTextIcon',
        color: 'text-blue-600'
      }));

    // Agregar préstamos aprobados recientemente
    const prestamosRecientes = prestamos
      .filter(p => p.estado === 'activo')
      .slice(0, 2)
      .map(prestamo => ({
        id: prestamo.id || `prestamo-${Date.now()}`,
        tipo: 'prestamo',
        descripcion: `Préstamo aprobado - ${prestamo.clienteNombre || 'Cliente'}`,
        monto: parseFloat(prestamo.montoPrestado) || 0,
        fecha: prestamo.fechaPrestamo || new Date().toISOString(),
        icono: 'CurrencyDollarIcon',
        color: 'text-purple-600'
      }));

    return [...pagosRecientes, ...solicitudesRecientes, ...prestamosRecientes]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 6);
  }

  // Obtener préstamos próximos a vencer MEJORADO
  getUpcomingDueLoans(prestamos) {
    const hoy = new Date();
    const dosSemanasDespues = new Date(hoy.getTime() + 14 * 24 * 60 * 60 * 1000);

    const prestamosProximos = prestamos
      .filter(prestamo => {
        if (prestamo.estado !== 'activo') return false;
        if (!prestamo.fechaProximoPago) {
          // Si no hay fecha próximo pago, calcular basado en fecha préstamo
          if (!prestamo.fechaPrestamo) return false;
          const fechaPrestamo = new Date(prestamo.fechaPrestamo);
          const fechaVencimiento = new Date(fechaPrestamo.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días después
          prestamo.fechaProximoPago = fechaVencimiento.toISOString();
        }
        
        const fechaVencimiento = new Date(prestamo.fechaProximoPago);
        return fechaVencimiento >= hoy && fechaVencimiento <= dosSemanasDespues;
      })
      .map(prestamo => {
        const fechaVencimiento = new Date(prestamo.fechaProximoPago);
        const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        
        return {
          id: prestamo.id,
          cliente: prestamo.clienteNombre || 'Cliente',
          monto: parseFloat(prestamo.capitalRestante) || parseFloat(prestamo.montoPrestado) || 0,
          fechaVencimiento: prestamo.fechaProximoPago,
          diasRestantes: Math.max(0, diasRestantes)
        };
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 5);

    console.log('📅 Próximos vencimientos:', prestamosProximos);

    return prestamosProximos;
  }
}

export default new DashboardService();