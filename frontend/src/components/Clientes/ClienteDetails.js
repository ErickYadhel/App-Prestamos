import React from 'react';
import { 
  ArrowLeftIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const ClienteDetails = ({ cliente, onBack, onEdit }) => {
  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 mt-1">{value || 'No especificado'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{cliente.nombre}</h1>
            <p className="text-gray-600">Detalles del cliente</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="btn-primary flex items-center space-x-2"
        >
          <PencilIcon className="h-4 w-4" />
          <span>Editar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Personal */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow label="Cédula" value={cliente.cedula} icon={BuildingOfficeIcon} />
              <InfoRow label="Edad" value={`${cliente.edad} años`} icon={BuildingOfficeIcon} />
              <InfoRow label="Celular" value={cliente.celular} icon={PhoneIcon} />
              <InfoRow label="Email" value={cliente.email} icon={EnvelopeIcon} />
            </div>
          </div>

          {/* Información Laboral */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Información Laboral</h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow label="Lugar de Trabajo" value={cliente.trabajo} icon={BuildingOfficeIcon} />
              <InfoRow label="Puesto" value={cliente.puesto} icon={BuildingOfficeIcon} />
              <InfoRow label="Sueldo" value={cliente.sueldo ? `RD$ ${cliente.sueldo.toLocaleString()}` : ''} icon={BuildingOfficeIcon} />
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Dirección</h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow label="Dirección" value={cliente.direccion} icon={MapPinIcon} />
              <InfoRow label="Sector" value={cliente.sector} icon={MapPinIcon} />
              <InfoRow label="Provincia" value={cliente.provincia} icon={MapPinIcon} />
              <InfoRow label="País" value={cliente.pais} icon={MapPinIcon} />
            </div>
          </div>
        </div>

        {/* Sidebar - Estado y Acciones Rápidas */}
        <div className="space-y-6">
          {/* Estado */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Estado</h3>
            </div>
            <div className="p-6">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                cliente.activo 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {cliente.activo ? 'Activo' : 'Inactivo'}
              </span>
              <p className="text-sm text-gray-600 mt-2">
                {cliente.activo 
                  ? 'El cliente puede recibir nuevos préstamos'
                  : 'El cliente no puede recibir nuevos préstamos'
                }
              </p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Acciones</h3>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Nuevo Préstamo
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Registrar Pago
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Ver Historial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDetails;