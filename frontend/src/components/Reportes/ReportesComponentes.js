// ============================================
// ARCHIVO: ReportesComponentes.js
// PROPÓSITO: Componentes UI reutilizables para Reportes
// ============================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  ChartBarIcon,
  ChartBarSquareIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  TrophyIcon,
  FireIcon,
  GiftIcon,
  PresentationChartLineIcon,
  PercentBadgeIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  ReceiptPercentIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  CalendarDaysIcon,
  SunIcon,
  MoonIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserCircleIcon,
  ScaleIcon,
  ArrowPathRoundedSquareIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

// ============================================
// SECCIÓN 1: COMPONENTE - BOTONES DE EXPORTACIÓN
// ============================================

export const BotonesExportacion = ({ onExportar, theme, tamaño = 'normal' }) => {
  const [abierto, setAbierto] = useState(false);

  const botones = [
    { id: 'pdf', label: 'PDF', icon: DocumentArrowDownIcon, color: 'from-red-500 to-red-700' },
    { id: 'excel', label: 'Excel', icon: TableCellsIcon, color: 'from-green-500 to-green-700' },
    { id: 'csv', label: 'CSV', icon: DocumentDuplicateIcon, color: 'from-blue-500 to-blue-700' },
    { id: 'json', label: 'JSON', icon: DocumentTextIcon, color: 'from-purple-500 to-purple-700' },
  ];

  if (tamaño === 'normal') {
    return (
      <div className="flex flex-wrap gap-2">
        {botones.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => onExportar(btn.id)}
              className={`px-3 py-2 rounded-lg bg-gradient-to-r ${btn.color} text-white text-xs font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-1.5`}
            >
              <Icon className="h-4 w-4" />
              <span>{btn.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onExportar('print')}
          className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} text-xs font-semibold transition-all hover:scale-105 flex items-center space-x-1.5`}
        >
          <PrinterIcon className="h-4 w-4" />
          <span>Imprimir</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Exportar"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
      </button>
      
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute right-0 top-full mt-1 z-50 rounded-lg shadow-2xl border-2 border-red-600/30 overflow-hidden min-w-[140px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
          >
            {botones.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  onClick={() => { onExportar(btn.id); setAbierto(false); }}
                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => { onExportar('print'); setAbierto(false); }}
              className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center space-x-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Imprimir</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// SECCIÓN 2: COMPONENTE - FILTROS AVANZADOS
// ============================================

export const FiltrosPanel = ({ filtros, setFiltros, clientes, garantes, theme, onAplicar, onLimpiar, obtenerRangoQuincena, obtenerRangoMes, obtenerRangoSemana, obtenerRango3Meses, obtenerRango6Meses, obtenerRangoAño }) => {
  
  const setRangoRapido = (rango) => {
    setFiltros({ 
      ...filtros, 
      fechaInicio: rango.inicio.toISOString().split('T')[0], 
      fechaFin: rango.fin.toISOString().split('T')[0] 
    });
  };

  const rangosRapidos = [
    { label: 'Hoy', fn: () => { const h = new Date(); h.setHours(0,0,0,0); setRangoRapido({ inicio: h, fin: h }); } },
    { label: 'Esta Semana', fn: () => setRangoRapido(obtenerRangoSemana()) },
    { label: 'Esta Quincena', fn: () => setRangoRapido(obtenerRangoQuincena()) },
    { label: 'Este Mes', fn: () => setRangoRapido(obtenerRangoMes()) },
    { label: 'Últimos 3 Meses', fn: () => setRangoRapido(obtenerRango3Meses()) },
    { label: 'Últimos 6 Meses', fn: () => setRangoRapido(obtenerRango6Meses()) },
    { label: 'Este Año', fn: () => setRangoRapido(obtenerRangoAño()) },
  ];

  return (
    <div className={`rounded-xl border-2 border-red-600/30 p-4 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-red-50/30'}`}>
      <div className="flex items-center space-x-2 mb-3">
        <FunnelIcon className="h-4 w-4 text-red-600" />
        <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Filtros Avanzados</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' : 'bg-white border-gray-300 focus:border-red-500'} outline-none`}
          />
        </div>
        
        <div>
          <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Fecha Fin
          </label>
          <input
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' : 'bg-white border-gray-300 focus:border-red-500'} outline-none`}
          />
        </div>
        
        <div>
          <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Cliente
          </label>
          <select
            value={filtros.clienteID}
            onChange={(e) => setFiltros({ ...filtros, clienteID: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' : 'bg-white border-gray-300 focus:border-red-500'} outline-none`}
          >
            <option value="">Todos los clientes</option>
            {clientes.slice(0, 200).map(c => (
              <option key={c.id} value={c.id}>{c.nombre || c.clienteNombre || c.id}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Garante
          </label>
          <select
            value={filtros.garanteID}
            onChange={(e) => setFiltros({ ...filtros, garanteID: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' : 'bg-white border-gray-300 focus:border-red-500'} outline-none`}
          >
            <option value="">Todos los garantes</option>
            {garantes.map(g => (
              <option key={g.id} value={g.id}>{g.nombre || g.id}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Estado del Préstamo
          </label>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' : 'bg-white border-gray-300 focus:border-red-500'} outline-none`}
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="completado">Completado</option>
            <option value="mora">En Mora</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Monto Mínimo
          </label>
          <input
            type="number"
            value={filtros.montoMin}
            onChange={(e) => setFiltros({ ...filtros, montoMin: e.target.value })}
            placeholder="0"
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' : 'bg-white border-gray-300 focus:border-red-500'} outline-none`}
          />
        </div>
        
        <div>
          <label className={`block text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Monto Máximo
          </label>
          <input
            type="number"
            value={filtros.montoMax}
            onChange={(e) => setFiltros({ ...filtros, montoMax: e.target.value })}
            placeholder="999999"
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' : 'bg-white border-gray-300 focus:border-red-500'} outline-none`}
          />
        </div>
        
        <div className="flex items-end gap-2">
          <button
            onClick={onAplicar}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            Aplicar
          </button>
          <button
            onClick={onLimpiar}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-red-600/20">
        <p className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          ⚡ Rango rápido:
        </p>
        <div className="flex flex-wrap gap-2">
          {rangosRapidos.map((btn, i) => (
            <button
              key={i}
              onClick={btn.fn}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SECCIÓN 3: COMPONENTE - TARJETA DE REPORTE
// ============================================

export const ReporteCard = ({ reporte, onVer, theme }) => {
  const Icon = reporte.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 ${isHovered ? 'border-red-600 shadow-2xl shadow-red-600/20' : theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'}`}
      onClick={() => onVer(reporte)}
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${reporte.color}`} />
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${reporte.color} ${theme === 'dark' ? 'opacity-10' : 'opacity-5'} rounded-full blur-3xl transition-all duration-500 ${isHovered ? 'scale-150 opacity-20' : ''}`} />
      
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${reporte.color} shadow-lg transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {reporte.badge && (
            <span className={`text-[9px] px-2 py-1 rounded-full font-bold text-white ${reporte.badge.color} shadow-md`}>
              {reporte.badge.text}
            </span>
          )}
        </div>

        <h4 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {reporte.nombre}
        </h4>
        <p className={`text-xs mt-1 mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {reporte.descripcion}
        </p>

        {reporte.estadisticas && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(reporte.estadisticas).slice(0, 4).map(([key, value], i) => (
              <div key={i} className={`text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <p className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </p>
                <p className={`text-[9px] capitalize truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className={`flex items-center justify-between pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <span className={`text-[10px] font-semibold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {reporte.categoria?.toUpperCase()}
          </span>
          <button className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${reporte.color} text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1`}>
            <EyeIcon className="h-3.5 w-3.5" />
            <span>Ver</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// SECCIÓN 4: COMPONENTE - MODAL DE VISTA PREVIA
// ============================================

export const VistaPreviaModal = ({ isOpen, onClose, titulo, columnas, filas, resumen, theme, onExportar, filtrosAplicados }) => {
  const [pagina, setPagina] = useState(1);
  const filasPorPagina = 50;
  
  if (!isOpen) return null;
  
  const totalPaginas = Math.ceil(filas.length / filasPorPagina);
  const filasPaginadas = filas.slice((pagina - 1) * filasPorPagina, pagina * filasPorPagina);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-7xl mx-4 max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600/30 flex flex-col max-h-[95vh] ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`p-4 border-b-2 flex items-center justify-between flex-shrink-0 ${theme === 'dark' ? 'border-red-600/20 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-red-100 bg-gradient-to-r from-red-50 to-white'}`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-md">
                  <DocumentChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {titulo}
                  </h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filas.length} registros encontrados
                    {filtrosAplicados?.length > 0 && ` · ${filtrosAplicados.length} filtros activos`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {resumen && Object.keys(resumen).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(resumen).map(([key, value], i) => (
                    <div key={i} className={`p-3 rounded-xl border-2 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <p className={`text-[10px] font-semibold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {key}
                      </p>
                      <p className={`text-base font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {filas.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No hay datos para mostrar
                  </p>
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Prueba ajustando los filtros
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border-2 border-red-600/20">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-red-50'}>
                      <tr>
                        {columnas.map((col, i) => (
                          <th key={i} className={`px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white'}`}>
                      {filasPaginadas.map((fila, idx) => (
                        <tr key={idx} className={`${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors`}>
                          {columnas.map((col, i) => (
                            <td key={i} className={`px-3 py-2 text-xs whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                              {col.render ? col.render(fila) : (fila[col.key] ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={`p-4 border-t-2 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 ${theme === 'dark' ? 'border-red-600/20 bg-gray-800/50' : 'border-red-100 bg-gray-50'}`}>
              {totalPaginas > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagina(Math.max(1, pagina - 1))}
                    disabled={pagina === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${pagina === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    ← Anterior
                  </button>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {pagina} / {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                    disabled={pagina === totalPaginas}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${pagina === totalPaginas ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
              
              <BotonesExportacion onExportar={onExportar} theme={theme} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// SECCIÓN 5: COMPONENTE - HEADER DE REPORTES
// ============================================

export const HeaderReportes = ({ 
  theme, 
  totalReportes, 
  totalPrestamos, 
  totalPagos, 
  loading, 
  showFiltros, 
  setShowFiltros, 
  filtrosAplicados, 
  showSearch, 
  setShowSearch, 
  onRecargar 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 blur-3xl" />
      <div className={`relative backdrop-blur-xl rounded-2xl shadow-2xl p-5 border-2 border-red-600/20 ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/90'}`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <motion.div 
              whileHover={{ rotate: 360 }} 
              transition={{ duration: 0.6 }} 
              className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg"
            >
              <ChartBarIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Reportes y Análisis
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {totalReportes} reportes disponibles · {totalPrestamos} préstamos · {totalPagos} pagos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 relative shadow-lg hover:shadow-xl hover:scale-105 ${
                showFiltros || filtrosAplicados.length > 0 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                  : theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filtros</span>
              {filtrosAplicados.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                  {filtrosAplicados.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2.5 rounded-xl transition-all hover:scale-105 ${showSearch ? 'bg-red-600 text-white' : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Buscar"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onRecargar}
              className={`p-2.5 rounded-xl transition-all hover:scale-105 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Recargar datos"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// SECCIÓN 6: COMPONENTE - CATEGORÍAS
// ============================================

export const CategoriasSelector = ({ categorias, categoriaActiva, setCategoriaActiva, theme }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categorias.map((cat) => {
        const Icon = cat.icon;
        const activa = categoriaActiva === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 hover:scale-105 ${
              activa 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                : theme === 'dark' 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{cat.nombre}</span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================
// SECCIÓN 7: COMPONENTE - LOADING SKELETON
// ============================================

export const ReportesSkeleton = ({ theme }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div 
          key={i} 
          className={`h-56 rounded-xl animate-pulse ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} 
        />
      ))}
    </div>
  );
};

// ============================================
// SECCIÓN 8: COMPONENTE - MENSAJE VACÍO
// ============================================

export const MensajeVacio = ({ theme, mensaje = 'No se encontraron reportes' }) => {
  return (
    <div className="text-center py-12">
      <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {mensaje}
      </p>
    </div>
  );
};

// ============================================
// SECCIÓN 9: COMPONENTE - MENSAJE DE ERROR
// ============================================

export const MensajeError = ({ error, setError, theme }) => {
  if (!error) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 flex items-center space-x-3"
    >
      <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
      <span>{error}</span>
      <button 
        onClick={() => setError('')} 
        className="ml-auto p-1 rounded hover:bg-red-100 dark:hover:bg-red-800/50"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

// ============================================
// SECCIÓN 10: COMPONENTE - FILTROS ACTIVOS
// ============================================

export const FiltrosActivos = ({ filtrosAplicados, limpiarFiltros, theme }) => {
  if (filtrosAplicados.length === 0) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        Filtros activos:
      </span>
      {filtrosAplicados.map((f, i) => (
        <span 
          key={i} 
          className="text-xs px-2.5 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-medium shadow-md"
        >
          {f}
        </span>
      ))}
      <button 
        onClick={limpiarFiltros} 
        className="text-xs px-2.5 py-1 text-gray-500 hover:text-red-600 font-medium transition-colors"
      >
        <XMarkIcon className="h-3 w-3 inline" /> Limpiar todo
      </button>
    </div>
  );
};

// ============================================
// SECCIÓN 11: COMPONENTE - BARRA DE BÚSQUEDA
// ============================================

export const BarraBusqueda = ({ showSearch, searchTerm, setSearchTerm, theme }) => {
  if (!showSearch) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }} 
      animate={{ opacity: 1, height: 'auto' }} 
      exit={{ opacity: 0, height: 0 }} 
      className="overflow-hidden"
    >
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar reporte por nombre o descripción..."
          autoFocus
          className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 outline-none text-sm ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500' 
              : 'bg-white border-gray-300 focus:border-red-500'
          }`}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// EXPORTAR TODO
// ============================================
export default {
  BotonesExportacion,
  FiltrosPanel,
  ReporteCard,
  VistaPreviaModal,
  HeaderReportes,
  CategoriasSelector,
  ReportesSkeleton,
  MensajeVacio,
  MensajeError,
  FiltrosActivos,
  BarraBusqueda,
};