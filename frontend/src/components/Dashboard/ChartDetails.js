import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import { formatShortDate } from './DateFormatter';

const ChartDetails = ({ title, type, chartData, filters }) => {
  const { theme } = useTheme();

  const getDetailsContent = () => {
    switch (title) {
      case 'Morosidad por Mes':
        return renderMorosidadDetails();
      case 'Distribución de Pagos':
        return renderPagosDetails();
      case 'Estado de Préstamos':
        return renderPrestamosDetails();
      case 'Solicitudes por Estado':
        return renderSolicitudesDetails();
      case 'Préstamos por Tipo':
        return renderPrestamosTipoDetails();
      case 'Préstamos por Mes':
        return renderPrestamosMesDetails();
      case 'Pagos por Mes':
        return renderPagosMesDetails();
      case 'Ganancias por Mes':
        return renderGananciasDetails();
      case 'Flujo de Caja':
      case 'Ingresos vs Gastos':
        return renderFlujoCajaDetails();
      case 'Rendimiento por Área':
        return renderRendimientoDetails();
      case 'Proyecciones a 6 meses':
        return renderProyeccionesDetails();
      case 'Clientes por Provincia':
        return renderClientesProvinciaDetails();
      default:
        return renderDefaultDetails();
    }
  };

  const renderMorosidadDetails = () => {
    // Aquí deberías pasar los datos reales de préstamos morosos
    // Por ahora usamos datos de ejemplo
    const morosos = [
      { cliente: 'Juan Pérez', monto: 25000, diasMora: 15, telefono: '809-555-0101', fechaVencimiento: '2026-03-15' },
      { cliente: 'María García', monto: 18000, diasMora: 8, telefono: '809-555-0102', fechaVencimiento: '2026-03-22' },
      { cliente: 'Carlos López', monto: 32000, diasMora: 22, telefono: '809-555-0103', fechaVencimiento: '2026-03-08' },
      { cliente: 'Ana Martínez', monto: 15000, diasMora: 12, telefono: '809-555-0104', fechaVencimiento: '2026-03-18' },
      { cliente: 'Pedro Sánchez', monto: 28000, diasMora: 5, telefono: '809-555-0105', fechaVencimiento: '2026-03-25' }
    ];

    const totalPerdida = morosos.reduce((sum, m) => sum + m.monto, 0);
    const promedioMora = morosos.length > 0 ? 
      morosos.reduce((sum, m) => sum + m.diasMora, 0) / morosos.length : 0;

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total en mora
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            {formatCurrency(totalPerdida)}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Promedio: {promedioMora.toFixed(0)} días por préstamo
          </p>
        </div>

        <div>
          <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Préstamos en mora ({morosos.length})
          </h5>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {morosos.map((item, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.cliente}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.diasMora} días de mora
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Vence: {formatShortDate(item.fechaVencimiento)}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.telefono}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      {formatCurrency(item.monto)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPagosDetails = () => {
    const distribucion = chartData?.datasets?.[0]?.data || [];
    const labels = chartData?.labels || [];
    const total = distribucion.reduce((a, b) => a + b, 0);
    
    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total recaudado
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(total)}
          </p>
        </div>

        <div className="space-y-3">
          {labels.map((label, index) => {
            const valor = distribucion[index] || 0;
            const porcentaje = total > 0 ? (valor / total * 100) : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {label}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(valor)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded min-w-[60px] text-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      {porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPrestamosDetails = () => {
    const distribucion = chartData?.datasets?.[0]?.data || [];
    const labels = chartData?.labels || [];
    const total = distribucion.reduce((a, b) => a + b, 0);

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total préstamos
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(total)}
          </p>
        </div>

        <div className="space-y-3">
          {labels.map((label, index) => {
            const valor = distribucion[index] || 0;
            const porcentaje = total > 0 ? (valor / total * 100) : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {label}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(valor)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded min-w-[60px] text-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      {porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSolicitudesDetails = () => {
    const distribucion = chartData?.datasets?.[0]?.data || [];
    const labels = chartData?.labels || [];
    const total = distribucion.reduce((a, b) => a + b, 0);

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total solicitudes
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(total)}
          </p>
        </div>

        <div className="space-y-3">
          {labels.map((label, index) => {
            const valor = distribucion[index] || 0;
            const porcentaje = total > 0 ? (valor / total * 100) : 0;
            const color = index === 0 ? 'green' : index === 1 ? 'yellow' : 'red';
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {label}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(valor)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded min-w-[60px] text-center ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      {porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPrestamosTipoDetails = () => {
    // Como solo tienes préstamos personales por ahora
    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Todos los préstamos
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            100% Personales
          </p>
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Actualmente solo se ofrecen préstamos personales
          </p>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total préstamos
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(chartData?.datasets?.[0]?.data?.[0] || 0)}
          </p>
        </div>
      </div>
    );
  };

  const renderPrestamosMesDetails = () => {
    const data = chartData?.datasets?.[0]?.data || [];
    const labels = chartData?.labels || [];
    const total = data.reduce((a, b) => a + b, 0);
    const promedio = data.length > 0 ? total / data.length : 0;

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total préstamos del período
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(total)}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Promedio mensual: {formatNumber(Math.round(promedio))}
          </p>
        </div>

        <div>
          <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Desglose mensual
          </h5>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {labels.map((label, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {label}
                </span>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(data[index] || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPagosMesDetails = () => {
    const data = chartData?.datasets?.[0]?.data || [];
    const labels = chartData?.labels || [];
    const total = data.reduce((a, b) => a + b, 0);
    const promedio = data.length > 0 ? total / data.length : 0;

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total pagos del período
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(total)}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Promedio mensual: {formatCurrency(Math.round(promedio))}
          </p>
        </div>

        <div>
          <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Desglose mensual
          </h5>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {labels.map((label, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {label}
                </span>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(data[index] || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGananciasDetails = () => {
    const data = chartData?.datasets?.[0]?.data || [];
    const labels = chartData?.labels || [];
    const total = data.reduce((a, b) => a + b, 0);
    const promedio = data.length > 0 ? total / data.length : 0;

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total ganancias
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(total)}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Promedio mensual: {formatCurrency(Math.round(promedio))}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Mejor mes
          </p>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
            {labels[data.indexOf(Math.max(...data))] || 'N/A'} - {formatCurrency(Math.max(...data))}
          </p>
        </div>

        <div>
          <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Desglose mensual
          </h5>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {labels.map((label, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {label}
                </span>
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(data[index] || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFlujoCajaDetails = () => {
    const ingresos = chartData?.datasets?.[0]?.data || [];
    const gastos = chartData?.datasets?.[1]?.data || [];
    const labels = chartData?.labels || [];
    
    const totalIngresos = ingresos.reduce((a, b) => a + b, 0);
    const totalGastos = gastos.reduce((a, b) => a + b, 0);
    const balance = totalIngresos - totalGastos;

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${balance >= 0 ? 
          (theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50') : 
          (theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50')}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Balance del período
          </p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 
            (theme === 'dark' ? 'text-green-400' : 'text-green-600') : 
            (theme === 'dark' ? 'text-red-400' : 'text-red-600')}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex justify-between mb-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Ingresos
            </span>
            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {formatCurrency(totalIngresos)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Gastos
            </span>
            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              {formatCurrency(totalGastos)}
            </span>
          </div>
        </div>

        <div>
          <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Detalle por mes
          </h5>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {labels.map((label, index) => (
              <div key={index} className="p-2 rounded-lg border text-sm">
                <div className="flex justify-between font-medium mb-1">
                  <span>{label}</span>
                  <span className={ingresos[index] - gastos[index] >= 0 ? 
                    'text-green-600' : 'text-red-600'}>
                    {formatCurrency(ingresos[index] - gastos[index])}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">+{formatCurrency(ingresos[index])}</span>
                  <span className="text-red-600">-{formatCurrency(gastos[index])}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRendimientoDetails = () => {
    // Datos de ejemplo - en producción vendrían de las props
    const cantidades = {
      clientes: 150,
      prestamos: 85,
      pagos: 320,
      solicitudes: 45
    };

    const montos = {
      capitalPrestado: 2500000,
      capitalRecuperado: 1850000,
      ganancias: 420000
    };

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Por Cantidad
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Clientes</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(cantidades.clientes)}
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Préstamos</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(cantidades.prestamos)}
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pagos</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(cantidades.pagos)}
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Solicitudes</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(cantidades.solicitudes)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Por Monto
          </p>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Capital Prestado
              </span>
              <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(montos.capitalPrestado)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Capital Recuperado
              </span>
              <span className={`text-sm font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {formatCurrency(montos.capitalRecuperado)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Ganancias
              </span>
              <span className={`text-sm font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                {formatCurrency(montos.ganancias)}
              </span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Indicadores
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tasa Recuperación</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {((montos.capitalRecuperado / montos.capitalPrestado) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Rentabilidad</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                {((montos.ganancias / montos.capitalPrestado) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProyeccionesDetails = () => {
    const data = chartData?.datasets?.[0]?.data || [];
    const labels = chartData?.labels || [];
    const total = data.reduce((a, b) => a + b, 0);
    const promedio = data.length > 0 ? total / data.length : 0;

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Proyección total a 6 meses
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(total)}
          </p>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Promedio mensual proyectado: {formatCurrency(Math.round(promedio))}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Crecimiento estimado
          </p>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
            +5% mensual
          </p>
        </div>

        <div>
          <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Proyección mensual
          </h5>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {labels.map((label, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {label}
                </span>
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(data[index] || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderClientesProvinciaDetails = () => {
    const data = chartData?.datasets?.[0]?.data || [];
    const labels = chartData?.labels || [];
    const total = data.reduce((a, b) => a + b, 0);

    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Total clientes
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(total)}
          </p>
        </div>

        <div>
          <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Distribución por provincia
          </h5>
          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {labels.map((label, index) => {
              const valor = data[index] || 0;
              const porcentaje = total > 0 ? (valor / total * 100) : 0;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {label}
                    </span>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(valor)}
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <p className={`text-xs text-right ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {porcentaje.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultDetails = () => {
    return (
      <div className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>Selecciona un gráfico para ver más detalles</p>
        <p className="text-xs mt-2">Haz clic en el botón de ampliar para ver análisis detallado</p>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h4>
      {getDetailsContent()}
    </div>
  );
};

export default ChartDetails;