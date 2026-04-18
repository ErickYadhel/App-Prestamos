import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  DocumentArrowDownIcon, 
  DocumentTextIcon,
  TableCellsIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  exportDashboardToExcel, 
  exportToPDF, 
  exportChartToImage,
  exportMultipleToPDF
} from '../../utils/exportUtils';

const BotonExportar = ({ dashboardData, estadisticas, metricas }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const mostrarMensaje = (texto, exito = true) => {
    setMensaje({ texto, exito });
    setTimeout(() => setMensaje(null), 3000);
  };

  const handleExportExcel = async () => {
    setExportando(true);
    try {
      const exito = exportDashboardToExcel(dashboardData, estadisticas, metricas);
      if (exito) {
        mostrarMensaje('Excel exportado correctamente');
      } else {
        mostrarMensaje('Error al exportar Excel', false);
      }
    } catch (error) {
      mostrarMensaje('Error al exportar Excel', false);
    } finally {
      setExportando(false);
      setIsOpen(false);
    }
  };

  const handleExportPDF = async () => {
    setExportando(true);
    try {
      const elementos = ['dashboard-metrics', 'dashboard-graficos', 'dashboard-kpis'];
      const exito = await exportMultipleToPDF(elementos, 'Dashboard_Completo', 'Reporte Ejecutivo');
      if (exito) {
        mostrarMensaje('PDF exportado correctamente');
      } else {
        mostrarMensaje('Error al exportar PDF', false);
      }
    } catch (error) {
      mostrarMensaje('Error al exportar PDF', false);
    } finally {
      setExportando(false);
      setIsOpen(false);
    }
  };

  const opciones = [
    { icono: TableCellsIcon, texto: 'Exportar a Excel', accion: handleExportExcel, color: 'from-green-500 to-green-700' },
    { icono: DocumentTextIcon, texto: 'Exportar a PDF', accion: handleExportPDF, color: 'from-red-500 to-red-700' }
  ];

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
        title="Exportar reportes"
      >
        <DocumentArrowDownIcon className="h-4 w-4" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50"
            style={{ top: '100%' }}
          >
            <div className={`rounded-lg overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  onClick={opcion.accion}
                  disabled={exportando}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                  } ${exportando ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <div className={`p-1 rounded bg-gradient-to-r ${opcion.color}`}>
                    <opcion.icono className="h-3 w-3 text-white" />
                  </div>
                  {opcion.texto}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mensaje && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-20 right-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
            mensaje.exito 
              ? 'bg-emerald-500 text-white' 
              : 'bg-red-500 text-white'
          }`}
        >
          {mensaje.exito ? (
            <CheckCircleIcon className="h-4 w-4" />
          ) : (
            <XMarkIcon className="h-4 w-4" />
          )}
          <span className="text-sm">{mensaje.texto}</span>
        </motion.div>
      )}
    </>
  );
};

export default BotonExportar;