import React from 'react';
import { 
  ArrowLeftIcon,
  ReceiptRefundIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { firebaseTimestampToLocalString } from '../../utils/firebaseUtils';

const DetallesPago = ({ pago, prestamoInfo, onBack }) => {
  const InfoRow = ({ label, value, icon: Icon, color = 'text-gray-600' }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100">
      <Icon className={`h-5 w-5 ${color} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`text-sm ${color} mt-1`}>{value || 'No especificado'}</p>
      </div>
    </div>
  );

  const getTipoPagoColor = (tipo) => {
    const colores = {
      normal: 'text-blue-600',
      adelantado: 'text-green-600',
      mora: 'text-red-600',
      abono: 'text-purple-600'
    };
    return colores[tipo] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalles del Pago</h1>
          <p className="text-gray-600">Información completa del registro de pago</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Pago */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Información del Pago</h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow 
                label="ID del Pago" 
                value={pago.id} 
                icon={DocumentTextIcon}
                color="text-gray-600"
              />
              <InfoRow 
                label="Fecha y Hora" 
                value={`${firebaseTimestampToLocalString(pago.fechaPago)} ${pago.fechaPago ? new Date(pago.fechaPago).toLocaleTimeString() : ''}`}
                icon={CalendarIcon}
                color="text-gray-600"
              />
              <InfoRow 
                label="Tipo de Pago" 
                value={pago.tipoPago ? pago.tipoPago.charAt(0).toUpperCase() + pago.tipoPago.slice(1) : 'Normal'}
                icon={ReceiptRefundIcon}
                color={getTipoPagoColor(pago.tipoPago)}
              />
              {pago.nota && (
                <InfoRow 
                  label="Observaciones" 
                  value={pago.nota}
                  icon={DocumentTextIcon}
                  color="text-gray-600"
                />
              )}
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Desglose Financiero</h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow 
                label="Monto Total" 
                value={`RD$ ${(pago.montoTotal || 0).toLocaleString()}`}
                icon={BanknotesIcon}
                color="text-green-600"
              />
              <InfoRow 
                label="Aplicado a Interés" 
                value={`RD$ ${(pago.montoInteres || 0).toLocaleString()}`}
                icon={ChartBarIcon}
                color="text-blue-600"
              />
              <InfoRow 
                label="Aplicado a Capital" 
                value={`RD$ ${(pago.montoCapital || 0).toLocaleString()}`}
                icon={BanknotesIcon}
                color="text-purple-600"
              />
              <div className="flex items-start space-x-3 py-3 border-b border-gray-100">
                <ChartBarIcon className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500">Distribución</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${pago.montoTotal ? ((pago.montoInteres / pago.montoTotal) * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700">
                      {pago.montoTotal ? ((pago.montoInteres / pago.montoTotal) * 100).toFixed(1) : 0}% Interés
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información del Cliente */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cliente</h3>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-900">{pago.clienteNombre}</p>
              <p className="text-sm text-gray-600 mt-1">ID Préstamo: {pago.prestamoID}</p>
            </div>
          </div>

          {/* Impacto en el Préstamo */}
          {prestamoInfo && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Impacto en Préstamo</h3>
              </div>
              <div className="p-6 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Capital Anterior</p>
                  <p className="text-lg font-bold text-gray-900">
                    RD$ {(pago.capitalAnterior || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Nuevo Capital</p>
                  <p className="text-lg font-bold text-green-600">
                    RD$ {(pago.capitalNuevo || 0).toLocaleString()}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Reducción de Capital</p>
                  <p className="text-lg font-bold text-blue-600">
                    RD$ {((pago.capitalAnterior || 0) - (pago.capitalNuevo || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resumen Rápido */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Resumen</h3>
            </div>
            <div className="p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pagado:</span>
                  <span className="font-semibold">RD$ {(pago.montoTotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interés Pagado:</span>
                  <span className="font-semibold text-blue-600">RD$ {(pago.montoInteres || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capital Reducido:</span>
                  <span className="font-semibold text-green-600">RD$ {(pago.montoCapital || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesPago;
