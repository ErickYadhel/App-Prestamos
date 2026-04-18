import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Formatear moneda
const formatearMonto = (valor) => {
  if (!valor && valor !== 0) return 'RD$ 0';
  if (valor >= 1000000) return `RD$ ${(valor / 1000000).toFixed(1)}M`;
  if (valor >= 1000) return `RD$ ${(valor / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(valor);
};

// Formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-DO');
};

// Exportar a Excel
export const exportToExcel = (data, filename, sheetName = 'Datos') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 19)}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

// Exportar tabla a Excel
export const exportTableToExcel = (tableId, filename) => {
  try {
    const table = document.getElementById(tableId);
    if (!table) return false;
    
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 19)}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting table to Excel:', error);
    return false;
  }
};

// Exportar a PDF
export const exportToPDF = async (elementId, filename, title = 'Reporte') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) return false;
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.setFontSize(16);
    pdf.text(title, 10, 10);
    pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
    pdf.save(`${filename}_${new Date().toISOString().slice(0, 19)}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

// Exportar múltiples elementos a PDF
export const exportMultipleToPDF = async (elements, filename, title = 'Reporte') => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let isFirst = true;
    let pageNum = 1;
    
    pdf.setFontSize(16);
    pdf.text(title, 10, 10);
    pdf.setFontSize(10);
    pdf.text(`Generado: ${new Date().toLocaleString('es-DO')}`, 10, 20);
    
    for (const elementId of elements) {
      const element = document.getElementById(elementId);
      if (!element) continue;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (!isFirst) {
        pdf.addPage();
        pageNum++;
        pdf.setFontSize(10);
        pdf.text(`${title} - Página ${pageNum}`, 10, 10);
      }
      
      pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
      isFirst = false;
    }
    
    pdf.save(`${filename}_${new Date().toISOString().slice(0, 19)}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting multiple to PDF:', error);
    return false;
  }
};

// Exportar dashboard completo a Excel
export const exportDashboardToExcel = (dashboardData, estadisticas, metricas) => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Hoja de métricas principales
    const metricasData = [
      { Métrica: 'Clientes Activos', Valor: dashboardData.stats?.clientes || 0 },
      { Métrica: 'Préstamos Activos', Valor: dashboardData.stats?.prestamos || 0 },
      { Métrica: 'Capital Prestado', Valor: formatearMonto(dashboardData.stats?.capitalPrestado) },
      { Métrica: 'Capital Recuperado', Valor: formatearMonto(dashboardData.stats?.capitalRecuperado) },
      { Métrica: 'Ganancias del Mes', Valor: formatearMonto(dashboardData.stats?.gananciasMes) },
      { Métrica: 'Tasa de Morosidad', Valor: `${dashboardData.stats?.morosidad || 0}%` },
      { Métrica: 'Tasa de Recuperación', Valor: `${dashboardData.stats?.tasaRecuperacion || 0}%` },
      { Métrica: 'Préstamos del Mes', Valor: dashboardData.stats?.prestamosMes || 0 },
      { Métrica: 'Clientes Nuevos', Valor: dashboardData.stats?.nuevosClientes || 0 }
    ];
    
    const wsMetrics = XLSX.utils.json_to_sheet(metricasData);
    XLSX.utils.book_append_sheet(wb, wsMetrics, 'Métricas');
    
    // Hoja de pagos por mes
    if (dashboardData.graficos?.pagosPorMes) {
      const pagosData = dashboardData.graficos.pagosPorMes.map(p => ({
        Mes: p.mes,
        Monto: formatearMonto(p.value),
        Cantidad: p.cantidad || 0
      }));
      const wsPagos = XLSX.utils.json_to_sheet(pagosData);
      XLSX.utils.book_append_sheet(wb, wsPagos, 'Pagos por Mes');
    }
    
    // Hoja de préstamos por mes
    if (dashboardData.graficos?.prestamosPorMes) {
      const prestamosData = dashboardData.graficos.prestamosPorMes.map(p => ({
        Mes: p.mes,
        Cantidad: p.value
      }));
      const wsPrestamos = XLSX.utils.json_to_sheet(prestamosData);
      XLSX.utils.book_append_sheet(wb, wsPrestamos, 'Préstamos por Mes');
    }
    
    XLSX.writeFile(wb, `Dashboard_${new Date().toISOString().slice(0, 19)}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting dashboard to Excel:', error);
    return false;
  }
};

// Exportar gráfico específico a imagen
export const exportChartToImage = async (chartId, filename) => {
  try {
    const element = document.getElementById(chartId);
    if (!element) return false;
    
    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: '#ffffff',
      logging: false
    });
    
    const link = document.createElement('a');
    link.download = `${filename}_${new Date().toISOString().slice(0, 19)}.png`;
    link.href = canvas.toDataURL();
    link.click();
    return true;
  } catch (error) {
    console.error('Error exporting chart to image:', error);
    return false;
  }
};