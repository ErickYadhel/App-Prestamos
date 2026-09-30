// ============================================
// ARCHIVO: ReportesGeneradores.js
// PROPÓSITO: Utilidades + Generadores de reportes
// ============================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ============================================
// SECCIÓN 1: UTILIDADES DE FECHAS
// ============================================

export const parseFecha = (fecha) => {
  if (!fecha) return null;
  if (fecha instanceof Date) return fecha;
  
  if (typeof fecha === 'string' && fecha.includes('-')) {
    const parts = fecha.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
  }
  
  if (fecha && typeof fecha === 'object') {
    if (fecha._seconds !== undefined) return new Date(fecha._seconds * 1000);
    if (fecha.seconds !== undefined) return new Date(fecha.seconds * 1000);
    if (fecha.toDate) return fecha.toDate();
  }
  
  const d = new Date(fecha);
  return !isNaN(d.getTime()) ? d : null;
};

export const formatearFecha = (fecha) => {
  const d = parseFecha(fecha);
  if (!d) return 'N/A';
  return d.toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatearFechaHora = (fecha) => {
  const d = parseFecha(fecha);
  if (!d) return 'N/A';
  return d.toLocaleString('es-DO', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatearMonto = (monto) => {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(monto || 0);
};

export const formatearMontoCorto = (valor) => {
  if (!valor && valor !== 0) return 'RD$ 0';
  if (valor >= 1000000) return `RD$ ${(valor / 1000000).toFixed(2)}M`;
  if (valor >= 1000) return `RD$ ${(valor / 1000).toFixed(1)}K`;
  return `RD$ ${valor.toLocaleString()}`;
};

export const estaEnRango = (fecha, fechaInicio, fechaFin) => {
  if (!fechaInicio && !fechaFin) return true;
  const d = parseFecha(fecha);
  if (!d) return false;
  
  if (fechaInicio) {
    const fi = new Date(fechaInicio);
    fi.setHours(0, 0, 0, 0);
    if (d < fi) return false;
  }
  if (fechaFin) {
    const ff = new Date(fechaFin);
    ff.setHours(23, 59, 59, 999);
    if (d > ff) return false;
  }
  return true;
};

export const obtenerRangoQuincena = () => {
  const hoy = new Date();
  const dia = hoy.getDate();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();
  
  if (dia <= 15) {
    return { inicio: new Date(año, mes, 1), fin: new Date(año, mes, 15, 23, 59, 59) };
  }
  return { inicio: new Date(año, mes, 16), fin: new Date(año, mes + 1, 0, 23, 59, 59) };
};

export const obtenerRangoMes = () => {
  const hoy = new Date();
  return {
    inicio: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
    fin: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)
  };
};

export const obtenerRangoSemana = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() - diasHastaLunes);
  inicio.setHours(0, 0, 0, 0);
  return { inicio, fin: hoy };
};

export const obtenerRango3Meses = () => {
  const hoy = new Date();
  return {
    inicio: new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1),
    fin: hoy
  };
};

export const obtenerRango6Meses = () => {
  const hoy = new Date();
  return {
    inicio: new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1),
    fin: hoy
  };
};

export const obtenerRangoAño = () => {
  const hoy = new Date();
  return {
    inicio: new Date(hoy.getFullYear(), 0, 1),
    fin: hoy
  };
};

// ============================================
// SECCIÓN 2: UTILIDADES DE EXPORTACIÓN
// ============================================

export const exportarPDF = (titulo, headers, rows, subtitulo = '') => {
  try {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.text('EYS INVERSIONES', 14, 15);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(titulo, 14, 23);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    if (subtitulo) doc.text(subtitulo, 14, 29);
    doc.text(`Generado: ${new Date().toLocaleString('es-DO')}`, 14, subtitulo ? 34 : 29);
    
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: subtitulo ? 38 : 33,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { top: 40, left: 14, right: 14 }
    });
    
    doc.save(`${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error('Error exportando PDF:', err);
    alert('Error al exportar PDF');
  }
};

export const exportarExcel = (nombreArchivo, headers, rows, nombreHoja = 'Reporte') => {
  try {
    const worksheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    const colWidths = headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] || '').length));
      return { wch: Math.min(maxLen + 2, 40) };
    });
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (err) {
    console.error('Error exportando Excel:', err);
    alert('Error al exportar Excel');
  }
};

export const exportarCSV = (nombreArchivo, headers, rows) => {
  try {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const str = String(cell ?? '');
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`);
  } catch (err) {
    console.error('Error exportando CSV:', err);
    alert('Error al exportar CSV');
  }
};

export const exportarJSON = (nombreArchivo, datos) => {
  try {
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    saveAs(blob, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.json`);
  } catch (err) {
    console.error('Error exportando JSON:', err);
    alert('Error al exportar JSON');
  }
};

// ============================================
// SECCIÓN 3: GENERADORES DE REPORTES DE PRÉSTAMOS
// ============================================

export const generarPrestamosPorPeriodo = (prestamos, filtros) => {
  let datos = [...prestamos];
  
  if (filtros.fechaInicio || filtros.fechaFin) {
    datos = datos.filter(p => estaEnRango(p.fechaCreacion, filtros.fechaInicio, filtros.fechaFin));
  }
  if (filtros.clienteID) datos = datos.filter(p => p.clienteID === filtros.clienteID);
  if (filtros.garanteID) datos = datos.filter(p => p.garanteID === filtros.garanteID);
  if (filtros.estado) datos = datos.filter(p => (p.estado || '').toLowerCase() === filtros.estado.toLowerCase());
  if (filtros.montoMin) datos = datos.filter(p => Number(p.monto || 0) >= Number(filtros.montoMin));
  if (filtros.montoMax) datos = datos.filter(p => Number(p.monto || 0) <= Number(filtros.montoMax));
  
  const columnas = [
    { key: 'id', label: 'ID' },
    { key: 'cliente', label: 'Cliente', render: (f) => f.clienteNombre || f.cliente || '-' },
    { key: 'monto', label: 'Monto', render: (f) => `RD$ ${Number(f.monto || 0).toLocaleString()}` },
    { key: 'interes', label: 'Interés %', render: (f) => `${f.interes || f.interesPercent || 0}%` },
    { key: 'fechaCreacion', label: 'Fecha Otorgado', render: (f) => formatearFecha(f.fechaCreacion) },
    { key: 'estado', label: 'Estado' },
    { key: 'garante', label: 'Garante', render: (f) => f.garanteNombre || '-' },
  ];
  
  const filas = datos.sort((a, b) => {
    const fa = parseFecha(a.fechaCreacion);
    const fb = parseFecha(b.fechaCreacion);
    return fb - fa;
  });
  
  const totalMonto = filas.reduce((s, p) => s + Number(p.monto || 0), 0);
  
  return {
    columnas, filas,
    resumen: {
      'Total Préstamos': filas.length,
      'Monto Total': `RD$ ${totalMonto.toLocaleString()}`,
      'Promedio': `RD$ ${(filas.length > 0 ? totalMonto / filas.length : 0).toFixed(0)}`,
    }
  };
};

export const generarPrestamosActivos = (prestamos) => {
  const activos = prestamos.filter(p => (p.estado || '').toLowerCase() === 'activo');
  
  const columnas = [
    { key: 'cliente', label: 'Cliente', render: (f) => f.clienteNombre || f.cliente || '-' },
    { key: 'monto', label: 'Monto Prestado', render: (f) => `RD$ ${Number(f.monto || 0).toLocaleString()}` },
    { key: 'capitalRestante', label: 'Capital Pendiente', render: (f) => `RD$ ${Number(f.capitalRestante || f.monto || 0).toLocaleString()}` },
    { key: 'interes', label: 'Interés %', render: (f) => `${f.interes || f.interesPercent || 0}%` },
    { key: 'fechaProximoPago', label: 'Próximo Pago', render: (f) => formatearFecha(f.fechaProximoPago) },
    { key: 'frecuencia', label: 'Frecuencia' },
    { key: 'progreso', label: 'Progreso', render: (f) => {
      const total = Number(f.monto || 0);
      const restante = Number(f.capitalRestante || f.monto || 0);
      const pct = total > 0 ? ((total - restante) / total * 100).toFixed(0) : 0;
      return `${pct}%`;
    }},
  ];
  
  const totalMonto = activos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const totalRestante = activos.reduce((s, p) => s + Number(p.capitalRestante || p.monto || 0), 0);
  
  return {
    columnas, filas: activos,
    resumen: {
      'Activos': activos.length,
      'Monto Total': `RD$ ${totalMonto.toLocaleString()}`,
      'Capital Pendiente': `RD$ ${totalRestante.toLocaleString()}`,
      'Recuperado': `RD$ ${(totalMonto - totalRestante).toLocaleString()}`,
    }
  };
};

export const generarPrestamosCompletados = (prestamos) => {
  const completados = prestamos.filter(p => (p.estado || '').toLowerCase() === 'completado');
  
  const columnas = [
    { key: 'cliente', label: 'Cliente', render: (f) => f.clienteNombre || f.cliente || '-' },
    { key: 'monto', label: 'Monto', render: (f) => `RD$ ${Number(f.monto || 0).toLocaleString()}` },
    { key: 'fechaCreacion', label: 'Otorgado', render: (f) => formatearFecha(f.fechaCreacion) },
    { key: 'fechaCompletado', label: 'Completado', render: (f) => formatearFecha(f.fechaCompletado || f.fechaActualizacion) },
    { key: 'interes', label: 'Interés %', render: (f) => `${f.interes || f.interesPercent || 0}%` },
  ];
  
  const totalMonto = completados.reduce((s, p) => s + Number(p.monto || 0), 0);
  
  return {
    columnas, filas: completados,
    resumen: {
      'Completados': completados.length,
      'Monto Total': `RD$ ${totalMonto.toLocaleString()}`,
    }
  };
};

export const generarPrestamosPorCliente = (prestamos) => {
  const grupos = {};
  prestamos.forEach(p => {
    const key = p.clienteNombre || p.cliente || p.clienteID || 'Sin cliente';
    if (!grupos[key]) grupos[key] = { cliente: key, cantidad: 0, totalMonto: 0, activos: 0, completados: 0, mora: 0 };
    grupos[key].cantidad++;
    grupos[key].totalMonto += Number(p.monto || 0);
    const est = (p.estado || '').toLowerCase();
    if (est === 'activo') grupos[key].activos++;
    else if (est === 'completado') grupos[key].completados++;
    else if (est === 'mora') grupos[key].mora++;
  });
  
  const columnas = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'cantidad', label: 'Total Préstamos' },
    { key: 'activos', label: 'Activos' },
    { key: 'completados', label: 'Completados' },
    { key: 'mora', label: 'En Mora' },
    { key: 'totalMonto', label: 'Monto Total', render: (f) => `RD$ ${Number(f.totalMonto).toLocaleString()}` },
  ];
  
  const filas = Object.values(grupos).sort((a, b) => b.totalMonto - a.totalMonto);
  
  return {
    columnas, filas,
    resumen: {
      'Clientes': filas.length,
      'Total Préstamos': prestamos.length,
    }
  };
};

export const generarPrestamosPorVencer = (prestamos) => {
  const hoy = new Date();
  const en7Dias = new Date();
  en7Dias.setDate(hoy.getDate() + 7);
  
  const porVencer = prestamos.filter(p => {
    if ((p.estado || '').toLowerCase() !== 'activo') return false;
    const f = parseFecha(p.fechaProximoPago);
    return f && f >= hoy && f <= en7Dias;
  });
  
  const columnas = [
    { key: 'cliente', label: 'Cliente', render: (f) => f.clienteNombre || f.cliente || '-' },
    { key: 'monto', label: 'Monto', render: (f) => `RD$ ${Number(f.monto || 0).toLocaleString()}` },
    { key: 'capitalRestante', label: 'Pendiente', render: (f) => `RD$ ${Number(f.capitalRestante || f.monto || 0).toLocaleString()}` },
    { key: 'fechaProximoPago', label: 'Vence', render: (f) => formatearFecha(f.fechaProximoPago) },
    { key: 'diasRestantes', label: 'Días', render: (f) => {
      const fp = parseFecha(f.fechaProximoPago);
      if (!fp) return '-';
      return Math.ceil((fp - hoy) / (1000 * 60 * 60 * 24));
    }},
  ];
  
  return {
    columnas, filas: porVencer,
    resumen: {
      'Por Vencer (7 días)': porVencer.length,
      'Total Pendiente': `RD$ ${porVencer.reduce((s, p) => s + Number(p.capitalRestante || p.monto || 0), 0).toLocaleString()}`,
    }
  };
};

export const generarPrestamosPorRango = (prestamos) => {
  const rangos = [
    { rango: 'Menos de RD$ 50,000', min: 0, max: 50000 },
    { rango: 'RD$ 50,000 - RD$ 100,000', min: 50000, max: 100000 },
    { rango: 'RD$ 100,000 - RD$ 200,000', min: 100000, max: 200000 },
    { rango: 'RD$ 200,000 - RD$ 500,000', min: 200000, max: 500000 },
    { rango: 'Más de RD$ 500,000', min: 500000, max: Infinity },
  ];
  
  const filas = rangos.map(r => {
    const enRango = prestamos.filter(p => {
      const monto = Number(p.monto || 0);
      return monto >= r.min && monto < r.max;
    });
    return {
      rango: r.rango,
      cantidad: enRango.length,
      montoTotal: enRango.reduce((s, p) => s + Number(p.monto || 0), 0),
      promedio: enRango.length > 0 ? enRango.reduce((s, p) => s + Number(p.monto || 0), 0) / enRango.length : 0,
    };
  });
  
  const columnas = [
    { key: 'rango', label: 'Rango de Monto' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'montoTotal', label: 'Monto Total', render: (f) => `RD$ ${f.montoTotal.toLocaleString()}` },
    { key: 'promedio', label: 'Promedio', render: (f) => `RD$ ${f.promedio.toFixed(0).toLocaleString()}` },
  ];
  
  return {
    columnas, filas,
    resumen: {
      'Total Préstamos': prestamos.length,
      'Monto Total': `RD$ ${prestamos.reduce((s, p) => s + Number(p.monto || 0), 0).toLocaleString()}`,
    }
  };
};

// ============================================
// SECCIÓN 4: GENERADORES DE REPORTES DE PAGOS
// ============================================

export const generarPagosDelDia = (pagos) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const pagosHoy = pagos.filter(p => {
    const f = parseFecha(p.fecha || p.fechaPago);
    return f && f >= hoy;
  });
  
  const columnas = [
    { key: 'id', label: 'ID Pago' },
    { key: 'cliente', label: 'Cliente', render: (f) => f.clienteNombre || f.cliente || '-' },
    { key: 'montoTotal', label: 'Monto', render: (f) => `RD$ ${Number(f.montoTotal || f.monto || 0).toLocaleString()}` },
    { key: 'montoCapital', label: 'Capital', render: (f) => `RD$ ${Number(f.montoCapital || f.capital || 0).toLocaleString()}` },
    { key: 'montoInteres', label: 'Interés', render: (f) => `RD$ ${Number(f.montoInteres || f.interes || 0).toLocaleString()}` },
    { key: 'tipo', label: 'Tipo', render: (f) => f.tipoPago || 'Normal' },
    { key: 'fecha', label: 'Hora', render: (f) => formatearFechaHora(f.fecha || f.fechaPago) },
  ];
  
  const total = pagosHoy.reduce((s, p) => s + Number(p.montoTotal || p.monto || 0), 0);
  const totalCapital = pagosHoy.reduce((s, p) => s + Number(p.montoCapital || p.capital || 0), 0);
  const totalInteres = pagosHoy.reduce((s, p) => s + Number(p.montoInteres || p.interes || 0), 0);
  
  return {
    columnas, filas: pagosHoy,
    resumen: {
      'Pagos Hoy': pagosHoy.length,
      'Total Recaudado': `RD$ ${total.toLocaleString()}`,
      'Capital': `RD$ ${totalCapital.toLocaleString()}`,
      'Interés': `RD$ ${totalInteres.toLocaleString()}`,
    }
  };
};

export const generarDistribucionCapitalInteres = (pagos, filtros) => {
  let datos = [...pagos];
  
  if (filtros.fechaInicio || filtros.fechaFin) {
    datos = datos.filter(p => estaEnRango(p.fecha || p.fechaPago, filtros.fechaInicio, filtros.fechaFin));
  }
  if (filtros.clienteID) datos = datos.filter(p => p.clienteID === filtros.clienteID);
  
  const columnas = [
    { key: 'cliente', label: 'Cliente', render: (f) => f.clienteNombre || f.cliente || '-' },
    { key: 'fecha', label: 'Fecha', render: (f) => formatearFecha(f.fecha || f.fechaPago) },
    { key: 'total', label: 'Total', render: (f) => `RD$ ${Number(f.montoTotal || f.monto || 0).toLocaleString()}` },
    { key: 'capital', label: 'Capital', render: (f) => `RD$ ${Number(f.montoCapital || f.capital || 0).toLocaleString()}` },
    { key: 'interes', label: 'Interés', render: (f) => `RD$ ${Number(f.montoInteres || f.interes || 0).toLocaleString()}` },
    { key: 'pctCapital', label: '% Capital', render: (f) => {
      const total = Number(f.montoTotal || f.monto || 0);
      const cap = Number(f.montoCapital || f.capital || 0);
      return total > 0 ? `${(cap / total * 100).toFixed(1)}%` : '0%';
    }},
    { key: 'pctInteres', label: '% Interés', render: (f) => {
      const total = Number(f.montoTotal || f.monto || 0);
      const int = Number(f.montoInteres || f.interes || 0);
      return total > 0 ? `${(int / total * 100).toFixed(1)}%` : '0%';
    }},
  ];
  
  const totalCapital = datos.reduce((s, p) => s + Number(p.montoCapital || p.capital || 0), 0);
  const totalInteres = datos.reduce((s, p) => s + Number(p.montoInteres || p.interes || 0), 0);
  const total = totalCapital + totalInteres;
  
  return {
    columnas, filas: datos,
    resumen: {
      'Capital Total': `RD$ ${totalCapital.toLocaleString()}`,
      'Interés Total': `RD$ ${totalInteres.toLocaleString()}`,
      'Gran Total': `RD$ ${total.toLocaleString()}`,
      '% Capital': total > 0 ? `${(totalCapital / total * 100).toFixed(1)}%` : '0%',
    }
  };
};

export const generarPagosPorTipo = (pagos) => {
  const grupos = {};
  pagos.forEach(p => {
    const tipo = p.tipoPago || 'normal';
    if (!grupos[tipo]) grupos[tipo] = { tipo, cantidad: 0, total: 0, capital: 0, interes: 0 };
    grupos[tipo].cantidad++;
    grupos[tipo].total += Number(p.montoTotal || p.monto || 0);
    grupos[tipo].capital += Number(p.montoCapital || p.capital || 0);
    grupos[tipo].interes += Number(p.montoInteres || p.interes || 0);
  });
  
  const columnas = [
    { key: 'tipo', label: 'Tipo de Pago' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'total', label: 'Monto Total', render: (f) => `RD$ ${Number(f.total).toLocaleString()}` },
    { key: 'capital', label: 'Capital', render: (f) => `RD$ ${Number(f.capital).toLocaleString()}` },
    { key: 'interes', label: 'Interés', render: (f) => `RD$ ${Number(f.interes).toLocaleString()}` },
    { key: 'promedio', label: 'Promedio', render: (f) => `RD$ ${(f.total / f.cantidad).toFixed(0).toLocaleString()}` },
  ];
  
  const filas = Object.values(grupos).sort((a, b) => b.total - a.total);
  
  return {
    columnas, filas,
    resumen: {
      'Tipos de Pago': filas.length,
      'Total Pagos': pagos.length,
      'Monto Total': `RD$ ${pagos.reduce((s, p) => s + Number(p.montoTotal || p.monto || 0), 0).toLocaleString()}`,
    }
  };
};

export const generarPagosPorMes = (pagos) => {
  const meses = {};
  pagos.forEach(p => {
    const f = parseFecha(p.fecha || p.fechaPago);
    if (!f) return;
    const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
    const label = f.toLocaleDateString('es-DO', { year: 'numeric', month: 'long' });
    if (!meses[key]) meses[key] = { mes: label, cantidad: 0, total: 0, capital: 0, interes: 0 };
    meses[key].cantidad++;
    meses[key].total += Number(p.montoTotal || p.monto || 0);
    meses[key].capital += Number(p.montoCapital || p.capital || 0);
    meses[key].interes += Number(p.montoInteres || p.interes || 0);
  });
  
  const columnas = [
    { key: 'mes', label: 'Mes' },
    { key: 'cantidad', label: 'Pagos' },
    { key: 'total', label: 'Monto Total', render: (f) => `RD$ ${Number(f.total).toLocaleString()}` },
    { key: 'capital', label: 'Capital', render: (f) => `RD$ ${Number(f.capital).toLocaleString()}` },
    { key: 'interes', label: 'Interés', render: (f) => `RD$ ${Number(f.interes).toLocaleString()}` },
  ];
  
  const filas = Object.entries(meses)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([_, v]) => v);
  
  return {
    columnas, filas,
    resumen: {
      'Meses con Datos': filas.length,
      'Total Pagos': pagos.length,
    }
  };
};

export const generarPagosPorCliente = (pagos) => {
  const grupos = {};
  pagos.forEach(p => {
    const key = p.clienteNombre || p.cliente || p.clienteID || 'Sin cliente';
    if (!grupos[key]) grupos[key] = { cliente: key, cantidad: 0, total: 0, ultimoPago: null };
    grupos[key].cantidad++;
    grupos[key].total += Number(p.montoTotal || p.monto || 0);
    const fecha = parseFecha(p.fecha || p.fechaPago);
    if (fecha && (!grupos[key].ultimoPago || fecha > grupos[key].ultimoPago)) {
      grupos[key].ultimoPago = fecha;
    }
  });
  
  const columnas = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'cantidad', label: 'Cantidad Pagos' },
    { key: 'total', label: 'Monto Total', render: (f) => `RD$ ${Number(f.total).toLocaleString()}` },
    { key: 'promedio', label: 'Promedio', render: (f) => `RD$ ${(f.total / f.cantidad).toFixed(0).toLocaleString()}` },
    { key: 'ultimoPago', label: 'Último Pago', render: (f) => formatearFecha(f.ultimoPago) },
  ];
  
  const filas = Object.values(grupos).sort((a, b) => b.total - a.total);
  
  return {
    columnas, filas,
    resumen: {
      'Clientes': filas.length,
      'Total Pagos': pagos.length,
    }
  };
};

// ============================================
// SECCIÓN 5: GENERADORES DE REPORTES DE CLIENTES
// ============================================

export const generarEstadoCuentaCliente = (clienteID, prestamos, pagos, clientes) => {
  if (!clienteID) {
    return {
      columnas: [{ key: 'mensaje', label: 'Mensaje' }],
      filas: [{ mensaje: '⚠️ Selecciona un cliente en los filtros para ver su estado de cuenta' }],
      resumen: {}
    };
  }
  
  const cliente = clientes.find(c => c.id === clienteID);
  const prestamosCliente = prestamos.filter(p => p.clienteID === clienteID);
  const pagosCliente = pagos.filter(p => p.clienteID === clienteID);
  
  const movimientos = [
    ...prestamosCliente.map(p => ({
      fecha: p.fechaCreacion,
      tipo: '📝 PRÉSTAMO',
      descripcion: `Préstamo otorgado (${p.interes || p.interesPercent || 0}%)`,
      debito: Number(p.monto || 0),
      credito: 0,
      _orden: parseFecha(p.fechaCreacion)?.getTime() || 0
    })),
    ...pagosCliente.map(p => ({
      fecha: p.fecha || p.fechaPago,
      tipo: '💰 PAGO',
      descripcion: `Pago ${p.tipoPago || 'normal'}`,
      debito: 0,
      credito: Number(p.montoTotal || p.monto || 0),
      _orden: parseFecha(p.fecha || p.fechaPago)?.getTime() || 0
    }))
  ].sort((a, b) => a._orden - b._orden);
  
  let saldo = 0;
  const filas = movimientos.map(m => {
    saldo += m.debito - m.credito;
    return { ...m, saldo };
  });
  
  const columnas = [
    { key: 'fecha', label: 'Fecha', render: (f) => formatearFecha(f.fecha) },
    { key: 'tipo', label: 'Tipo' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'debito', label: 'Débito', render: (f) => f.debito > 0 ? `RD$ ${f.debito.toLocaleString()}` : '-' },
    { key: 'credito', label: 'Crédito', render: (f) => f.credito > 0 ? `RD$ ${f.credito.toLocaleString()}` : '-' },
    { key: 'saldo', label: 'Saldo', render: (f) => `RD$ ${f.saldo.toLocaleString()}` },
  ];
  
  return {
    columnas, filas,
    resumen: {
      'Cliente': cliente?.nombre || clienteID,
      'Préstamos': prestamosCliente.length,
      'Pagos': pagosCliente.length,
      'Saldo Actual': `RD$ ${saldo.toLocaleString()}`,
    }
  };
};

export const generarClientesMorosos = (prestamos, clientes) => {
  const hoy = new Date();
  const prestamosMora = prestamos.filter(p => {
    const f = parseFecha(p.fechaProximoPago);
    return (p.estado || '').toLowerCase() === 'mora' || 
           (f && f < hoy && (p.estado || '').toLowerCase() === 'activo');
  });
  
  const columnas = [
    { key: 'cliente', label: 'Cliente', render: (f) => f.clienteNombre || f.cliente || '-' },
    { key: 'telefono', label: 'Teléfono', render: (f) => {
      const cliente = clientes.find(c => c.id === f.clienteID);
      return cliente?.celular || cliente?.telefono || '-';
    }},
    { key: 'monto', label: 'Monto Original', render: (f) => `RD$ ${Number(f.monto || 0).toLocaleString()}` },
    { key: 'capitalRestante', label: 'Capital Pendiente', render: (f) => `RD$ ${Number(f.capitalRestante || f.monto || 0).toLocaleString()}` },
    { key: 'fechaProximoPago', label: 'Vencimiento', render: (f) => formatearFecha(f.fechaProximoPago) },
    { key: 'diasMora', label: 'Días Mora', render: (f) => {
      const fv = parseFecha(f.fechaProximoPago);
      if (!fv) return '-';
      return Math.floor((hoy - fv) / (1000 * 60 * 60 * 24));
    }},
  ];
  
  const totalMora = prestamosMora.reduce((s, p) => s + Number(p.capitalRestante || p.monto || 0), 0);
  
  return {
    columnas, filas: prestamosMora,
    resumen: {
      'Clientes Morosos': prestamosMora.length,
      'Monto en Mora': `RD$ ${totalMora.toLocaleString()}`,
    }
  };
};

export const generarTopPuntualidad = (pagos) => {
  const clientesPagos = {};
  
  pagos.forEach(p => {
    const cid = p.clienteID;
    if (!cid) return;
    if (!clientesPagos[cid]) clientesPagos[cid] = { clienteID: cid, cliente: p.clienteNombre || p.cliente || cid, pagos: 0, montoTotal: 0, pagosATiempo: 0 };
    clientesPagos[cid].pagos++;
    clientesPagos[cid].montoTotal += Number(p.montoTotal || p.monto || 0);
    if ((p.tipoPago || '').toLowerCase() !== 'mora') clientesPagos[cid].pagosATiempo++;
  });
  
  const columnas = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'pagos', label: 'Total Pagos' },
    { key: 'pagosATiempo', label: 'Pagos a Tiempo' },
    { key: 'puntualidad', label: '% Puntualidad', render: (f) => `${f.pagos > 0 ? (f.pagosATiempo / f.pagos * 100).toFixed(0) : 0}%` },
    { key: 'montoTotal', label: 'Monto Total', render: (f) => `RD$ ${f.montoTotal.toLocaleString()}` },
  ];
  
  const filas = Object.values(clientesPagos)
    .sort((a, b) => (b.pagosATiempo / b.pagos) - (a.pagosATiempo / a.pagos))
    .slice(0, 20);
  
  return {
    columnas, filas,
    resumen: {
      'Top Clientes': filas.length,
    }
  };
};

export const generarClientesNuevos = (clientes) => {
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);
  
  const nuevos = clientes.filter(c => {
    const f = parseFecha(c.fechaCreacion);
    return f && f >= hace30Dias;
  });
  
  const columnas = [
    { key: 'nombre', label: 'Nombre', render: (f) => f.nombre || f.clienteNombre || '-' },
    { key: 'cedula', label: 'Cédula' },
    { key: 'telefono', label: 'Teléfono', render: (f) => f.celular || f.telefono || '-' },
    { key: 'email', label: 'Email' },
    { key: 'fechaCreacion', label: 'Registro', render: (f) => formatearFecha(f.fechaCreacion) },
    { key: 'sector', label: 'Sector' },
  ];
  
  return {
    columnas, filas: nuevos,
    resumen: {
      'Nuevos (30 días)': nuevos.length,
      'Total Clientes': clientes.length,
    }
  };
};

// ============================================
// SECCIÓN 6: GENERADORES DE REPORTES FINANCIEROS
// ============================================

export const generarProyeccionGanancias = (prestamos) => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();
  
  const proyecciones = [];
  for (let i = 0; i < 6; i++) {
    const fecha = new Date(año, mes + i, 1);
    const prestamosMes = prestamos.filter(p => {
      const f = parseFecha(p.fechaCreacion);
      return f && f.getMonth() === fecha.getMonth() && f.getFullYear() === fecha.getFullYear();
    });
    
    const gananciaProyectada = prestamosMes.reduce((s, p) => {
      const monto = Number(p.monto || 0);
      const interes = Number(p.interes || p.interesPercent || 0) / 100;
      return s + (monto * interes);
    }, 0);
    
    proyecciones.push({
      mes: fecha.toLocaleDateString('es-DO', { year: 'numeric', month: 'long' }),
      prestamos: prestamosMes.length,
      montoPrestado: prestamosMes.reduce((s, p) => s + Number(p.monto || 0), 0),
      gananciaProyectada
    });
  }
  
  const columnas = [
    { key: 'mes', label: 'Mes' },
    { key: 'prestamos', label: 'Préstamos Otorgados' },
    { key: 'montoPrestado', label: 'Monto Prestado', render: (f) => `RD$ ${f.montoPrestado.toLocaleString()}` },
    { key: 'gananciaProyectada', label: 'Ganancia Proyectada', render: (f) => `RD$ ${f.gananciaProyectada.toFixed(0).toLocaleString()}` },
  ];
  
  const totalProyectado = proyecciones.reduce((s, p) => s + p.gananciaProyectada, 0);
  
  return {
    columnas, filas: proyecciones,
    resumen: {
      'Ganancia Total Proyectada': `RD$ ${totalProyectada.toFixed(0).toLocaleString()}`,
      'Meses Proyectados': proyecciones.length,
    }
  };
};

export const generarTasaRecuperacion = (prestamos, pagos) => {
  const totalPrestado = prestamos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const totalRecuperado = pagos.reduce((s, p) => s + Number(p.montoCapital || p.capital || 0), 0);
  const tasaRecuperacion = totalPrestado > 0 ? (totalRecuperado / totalPrestado * 100) : 0;
  
  const porPrestamo = prestamos.map(p => {
    const pagosPrestamo = pagos.filter(pg => pg.prestamoID === p.id);
    const recuperado = pagosPrestamo.reduce((s, pg) => s + Number(pg.montoCapital || pg.capital || 0), 0);
    const monto = Number(p.monto || 0);
    return {
      cliente: p.clienteNombre || p.cliente || '-',
      monto,
      recuperado,
      pendiente: monto - recuperado,
      tasa: monto > 0 ? (recuperado / monto * 100) : 0,
      estado: p.estado
    };
  });
  
  const columnas = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'monto', label: 'Monto', render: (f) => `RD$ ${f.monto.toLocaleString()}` },
    { key: 'recuperado', label: 'Recuperado', render: (f) => `RD$ ${f.recuperado.toLocaleString()}` },
    { key: 'pendiente', label: 'Pendiente', render: (f) => `RD$ ${f.pendiente.toLocaleString()}` },
    { key: 'tasa', label: 'Tasa %', render: (f) => `${f.tasa.toFixed(1)}%` },
    { key: 'estado', label: 'Estado' },
  ];
  
  return {
    columnas,
    filas: porPrestamo.sort((a, b) => a.tasa - b.tasa),
    resumen: {
      'Tasa Global': `${tasaRecuperacion.toFixed(2)}%`,
      'Total Prestado': `RD$ ${totalPrestado.toLocaleString()}`,
      'Total Recuperado': `RD$ ${totalRecuperado.toLocaleString()}`,
    }
  };
};

export const generarTiempoPromedioPago = (prestamos) => {
  const completados = prestamos.filter(p => (p.estado || '').toLowerCase() === 'completado');
  
  const datos = completados.map(p => {
    const fechaInicio = parseFecha(p.fechaCreacion);
    const fechaFin = parseFecha(p.fechaCompletado || p.fechaActualizacion);
    const dias = (fechaInicio && fechaFin) ? Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) : 0;
    return {
      cliente: p.clienteNombre || p.cliente || '-',
      monto: Number(p.monto || 0),
      fechaInicio: formatearFecha(p.fechaCreacion),
      fechaFin: formatearFecha(p.fechaCompletado || p.fechaActualizacion),
      dias
    };
  }).filter(d => d.dias > 0);
  
  const promedioDias = datos.length > 0 ? datos.reduce((s, d) => s + d.dias, 0) / datos.length : 0;
  
  const columnas = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'monto', label: 'Monto', render: (f) => `RD$ ${f.monto.toLocaleString()}` },
    { key: 'fechaInicio', label: 'Fecha Inicio' },
    { key: 'fechaFin', label: 'Fecha Fin' },
    { key: 'dias', label: 'Días' },
  ];
  
  return {
    columnas, filas: datos,
    resumen: {
      'Préstamos Completados': datos.length,
      'Promedio Días': `${promedioDias.toFixed(0)} días`,
    }
  };
};

export const generarReporteDiario = (prestamos, pagos, comisiones) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const pagosHoy = pagos.filter(p => {
    const f = parseFecha(p.fecha || p.fechaPago);
    return f && f >= hoy;
  });
  
  const prestamosHoy = prestamos.filter(p => {
    const f = parseFecha(p.fechaCreacion);
    return f && f >= hoy;
  });
  
  const totalRecaudado = pagosHoy.reduce((s, p) => s + Number(p.montoTotal || p.monto || 0), 0);
  const totalPrestado = prestamosHoy.reduce((s, p) => s + Number(p.monto || 0), 0);
  const comisionesHoy = comisiones.filter(c => {
    const f = parseFecha(c.fechaPago || c.fechaCreacion);
    return f && f >= hoy;
  }).reduce((s, c) => s + Number(c.montoComision || 0), 0);
  
  const columnas = [
    { key: 'categoria', label: 'Categoría' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'monto', label: 'Monto' },
  ];
  
  const filas = [
    { categoria: '💰 Pagos Recibidos', cantidad: pagosHoy.length, monto: `RD$ ${totalRecaudado.toLocaleString()}` },
    { categoria: '📝 Préstamos Otorgados', cantidad: prestamosHoy.length, monto: `RD$ ${totalPrestado.toLocaleString()}` },
    { categoria: '🎁 Comisiones Generadas', cantidad: comisionesHoy > 0 ? 1 : 0, monto: `RD$ ${comisionesHoy.toLocaleString()}` },
  ];
  
  const balance = totalRecaudado - totalPrestado - comisionesHoy;
  
  return {
    columnas, filas,
    resumen: {
      'Pagos Hoy': pagosHoy.length,
      'Préstamos Hoy': prestamosHoy.length,
      'Total Recaudado': `RD$ ${totalRecaudado.toLocaleString()}`,
      'Balance Neto': `RD$ ${balance.toLocaleString()}`,
    }
  };
};

export const generarComparativoMensual = (prestamos, pagos) => {
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const añoActual = hoy.getFullYear();
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
  const añoAnterior = mesActual === 0 ? añoActual - 1 : añoActual;
  
  const filtrarMes = (items, campoFecha, mes, año) => items.filter(i => {
    const f = parseFecha(i[campoFecha]);
    return f && f.getMonth() === mes && f.getFullYear() === año;
  });
  
  const prestamosActual = filtrarMes(prestamos, 'fechaCreacion', mesActual, añoActual);
  const prestamosAnterior = filtrarMes(prestamos, 'fechaCreacion', mesAnterior, añoAnterior);
  const pagosActual = filtrarMes(pagos, 'fecha', mesActual, añoActual);
  const pagosAnterior = filtrarMes(pagos, 'fecha', mesAnterior, añoAnterior);
  
  const montoActual = prestamosActual.reduce((s, p) => s + Number(p.monto || 0), 0);
  const montoAnterior = prestamosAnterior.reduce((s, p) => s + Number(p.monto || 0), 0);
  const recaudadoActual = pagosActual.reduce((s, p) => s + Number(p.montoTotal || p.monto || 0), 0);
  const recaudadoAnterior = pagosAnterior.reduce((s, p) => s + Number(p.montoTotal || p.monto || 0), 0);
  
  const columnas = [
    { key: 'metrica', label: 'Métrica' },
    { key: 'actual', label: 'Mes Actual' },
    { key: 'anterior', label: 'Mes Anterior' },
    { key: 'variacion', label: 'Variación' },
  ];
  
  const calcVar = (a, b) => {
    if (b === 0) return a > 0 ? '+100%' : '0%';
    const v = ((a - b) / b) * 100;
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
  };
  
  const filas = [
    { metrica: '📝 Préstamos Otorgados', actual: prestamosActual.length, anterior: prestamosAnterior.length, variacion: calcVar(prestamosActual.length, prestamosAnterior.length) },
    { metrica: '💰 Monto Prestado', actual: `RD$ ${montoActual.toLocaleString()}`, anterior: `RD$ ${montoAnterior.toLocaleString()}`, variacion: calcVar(montoActual, montoAnterior) },
    { metrica: '💵 Pagos Recibidos', actual: pagosActual.length, anterior: pagosAnterior.length, variacion: calcVar(pagosActual.length, pagosAnterior.length) },
    { metrica: '💳 Monto Recaudado', actual: `RD$ ${recaudadoActual.toLocaleString()}`, anterior: `RD$ ${recaudadoAnterior.toLocaleString()}`, variacion: calcVar(recaudadoActual, recaudadoAnterior) },
  ];
  
  return {
    columnas, filas,
    resumen: {
      'Mes Actual': `${prestamosActual.length} préstamos · RD$ ${montoActual.toLocaleString()}`,
      'Mes Anterior': `${prestamosAnterior.length} préstamos · RD$ ${montoAnterior.toLocaleString()}`,
    }
  };
};

export const generarTopClientes = (prestamos) => {
  const grupos = {};
  prestamos.forEach(p => {
    const key = p.clienteNombre || p.cliente || p.clienteID || 'Sin cliente';
    if (!grupos[key]) grupos[key] = { cliente: key, prestamos: 0, total: 0 };
    grupos[key].prestamos++;
    grupos[key].total += Number(p.monto || 0);
  });
  
  const columnas = [
    { key: 'ranking', label: '#' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'prestamos', label: 'Préstamos' },
    { key: 'total', label: 'Monto Total', render: (f) => `RD$ ${Number(f.total).toLocaleString()}` },
    { key: 'promedio', label: 'Promedio', render: (f) => `RD$ ${(f.total / f.prestamos).toFixed(0).toLocaleString()}` },
  ];
  
  const filas = Object.values(grupos)
    .sort((a, b) => b.total - a.total)
    .slice(0, 20)
    .map((c, i) => ({ ...c, ranking: i + 1 }));
  
  return {
    columnas, filas,
    resumen: {
      'Top Clientes': filas.length,
    }
  };
};

export const generarComisionesPorGarante = (comisiones) => {
  const grupos = {};
  comisiones.forEach(c => {
    const key = c.garanteNombre || c.garanteID || 'Sin garante';
    if (!grupos[key]) grupos[key] = { garante: key, cantidad: 0, total: 0, pagadas: 0, pendientes: 0 };
    grupos[key].cantidad++;
    grupos[key].total += Number(c.montoComision || 0);
    if (c.estado === 'pagada') grupos[key].pagadas += Number(c.montoComision || 0);
    if (c.estado === 'pendiente') grupos[key].pendientes += Number(c.montoComision || 0);
  });
  
  const columnas = [
    { key: 'garante', label: 'Garante' },
    { key: 'cantidad', label: 'Comisiones' },
    { key: 'total', label: 'Total', render: (f) => `RD$ ${Number(f.total).toLocaleString()}` },
    { key: 'pagadas', label: 'Pagadas', render: (f) => `RD$ ${Number(f.pagadas).toLocaleString()}` },
    { key: 'pendientes', label: 'Pendientes', render: (f) => `RD$ ${Number(f.pendientes).toLocaleString()}` },
  ];
  
  const filas = Object.values(grupos).sort((a, b) => b.total - a.total);
  const totalGeneral = comisiones.reduce((s, c) => s + Number(c.montoComision || 0), 0);
  
  return {
    columnas, filas,
    resumen: {
      'Garantes': filas.length,
      'Total Comisiones': `RD$ ${totalGeneral.toLocaleString()}`,
    }
  };
};

export const generarFlujoCaja = (pagos, comisiones) => {
  const ingresos = {
    capital: pagos.reduce((s, p) => s + Number(p.montoCapital || p.capital || 0), 0),
    intereses: pagos.reduce((s, p) => s + Number(p.montoInteres || p.interes || 0), 0),
    mora: pagos.reduce((s, p) => s + Number(p.montoMora || p.mora || 0), 0)
  };
  ingresos.total = ingresos.capital + ingresos.intereses + ingresos.mora;
  
  const egresos = {
    comisiones: comisiones.filter(c => c.estado === 'pagada').reduce((s, c) => s + Number(c.montoComision || 0), 0),
  };
  egresos.total = egresos.comisiones;
  
  const balance = ingresos.total - egresos.total;
  
  const columnas = [
    { key: 'concepto', label: 'Concepto' },
    { key: 'monto', label: 'Monto' },
  ];
  
  const filas = [
    { concepto: '📈 INGRESOS - Capital', monto: `RD$ ${ingresos.capital.toLocaleString()}` },
    { concepto: '📈 INGRESOS - Intereses', monto: `RD$ ${ingresos.intereses.toLocaleString()}` },
    { concepto: '📈 INGRESOS - Mora', monto: `RD$ ${ingresos.mora.toLocaleString()}` },
    { concepto: '💵 TOTAL INGRESOS', monto: `RD$ ${ingresos.total.toLocaleString()}` },
    { concepto: '📉 EGRESOS - Comisiones', monto: `RD$ ${egresos.comisiones.toLocaleString()}` },
    { concepto: '💸 TOTAL EGRESOS', monto: `RD$ ${egresos.total.toLocaleString()}` },
    { concepto: '📊 BALANCE NETO', monto: `RD$ ${balance.toLocaleString()}` },
  ];
  
  return {
    columnas, filas,
    resumen: {
      'Ingresos': `RD$ ${ingresos.total.toLocaleString()}`,
      'Egresos': `RD$ ${egresos.total.toLocaleString()}`,
      'Balance': `RD$ ${balance.toLocaleString()}`,
    }
  };
};

export const generarRentabilidad = (prestamos, pagos) => {
  const capitalInvertido = prestamos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const ganancias = pagos.reduce((s, p) => s + Number(p.montoInteres || p.interes || 0), 0);
  const capitalRecuperado = pagos.reduce((s, p) => s + Number(p.montoCapital || p.capital || 0), 0);
  const capitalEnCirculacion = capitalInvertido - capitalRecuperado;
  const roi = capitalInvertido > 0 ? ((ganancias / capitalInvertido) * 100) : 0;
  
  const columnas = [
    { key: 'concepto', label: 'Concepto' },
    { key: 'valor', label: 'Valor' },
  ];
  
  const filas = [
    { concepto: '💰 Capital Invertido', valor: `RD$ ${capitalInvertido.toLocaleString()}` },
    { concepto: '📈 Ganancias (Intereses)', valor: `RD$ ${ganancias.toLocaleString()}` },
    { concepto: '💵 Capital Recuperado', valor: `RD$ ${capitalRecuperado.toLocaleString()}` },
    { concepto: '🔄 Capital en Circulación', valor: `RD$ ${capitalEnCirculacion.toLocaleString()}` },
    { concepto: '📊 ROI', valor: `${roi.toFixed(2)}%` },
    { concepto: '📋 Préstamos Activos', valor: prestamos.filter(p => (p.estado || '').toLowerCase() === 'activo').length },
  ];
  
  return {
    columnas, filas,
    resumen: {
      'Capital Invertido': `RD$ ${capitalInvertido.toLocaleString()}`,
      'Ganancias': `RD$ ${ganancias.toLocaleString()}`,
      'ROI': `${roi.toFixed(2)}%`,
    }
  };
};

// ============================================
// EXPORTAR TODO
// ============================================
export default {
  // Utilidades
  parseFecha, formatearFecha, formatearFechaHora, formatearMonto, formatearMontoCorto,
  estaEnRango, obtenerRangoQuincena, obtenerRangoMes, obtenerRangoSemana,
  obtenerRango3Meses, obtenerRango6Meses, obtenerRangoAño,
  // Exportaciones
  exportarPDF, exportarExcel, exportarCSV, exportarJSON,
  // Generadores
  generarPrestamosPorPeriodo, generarPrestamosActivos, generarPrestamosCompletados,
  generarPrestamosPorCliente, generarPrestamosPorVencer, generarPrestamosPorRango,
  generarPagosDelDia, generarDistribucionCapitalInteres, generarPagosPorTipo,
  generarPagosPorMes, generarPagosPorCliente,
  generarEstadoCuentaCliente, generarClientesMorosos, generarTopPuntualidad, generarClientesNuevos,
  generarProyeccionGanancias, generarTasaRecuperacion, generarTiempoPromedioPago,
  generarReporteDiario, generarComparativoMensual, generarTopClientes,
  generarComisionesPorGarante, generarFlujoCaja, generarRentabilidad,
};