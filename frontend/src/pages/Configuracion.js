import React, { useState, useEffect } from 'react';
import { 
  CogIcon,
  BuildingStorefrontIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  FolderIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Configuracion = () => {
  const [configuracion, setConfiguracion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('empresa');

  useEffect(() => {
    fetchConfiguracion();
  }, []);

  const fetchConfiguracion = async () => {
    try {
      setLoading(true);
      setError('');
      // Por ahora usamos datos de ejemplo
      const mockConfiguracion = {
        empresaNombre: 'EYS Inversiones',
        dueno: 'Erick Ysabel',
        ubicacion: 'Santo Domingo, República Dominicana',
        numero: '809-123-4567',
        correo: 'info@eysinversiones.com',
        logoUrl: '',
        moneda: 'DOP',
        capitalDisponible: 300000,
        tipoCarga: 'manual',
        monedasDisponibles: ['DOP', 'USD'],
        backupFolder: '',
        sesionTiempo: 60,
        fechaHoraModificacion: new Date().toISOString(),
        colores: {
          primario: '#DC2626',
          secundario: '#000000'
        },
        notificaciones: {
          recordatoriosPago: true,
          alertasMora: true,
          confirmacionesPago: true,
          notificacionesSolicitudes: true
        },
        seguridad: {
          requiereVerificacionEmail: false,
          intentosLoginMaximos: 5,
          longitudMinimaPassword: 6
        }
      };
      setConfiguracion(mockConfiguracion);
    } catch (error) {
      console.error('Error fetching configuration:', error);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setConfiguracion(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleSaveConfiguracion = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Validaciones básicas
      if (!configuracion.empresaNombre.trim()) {
        setError('El nombre de la empresa es requerido');
        return;
      }

      if (!configuracion.moneda) {
        setError('La moneda principal es requerida');
        return;
      }

      // En un sistema real: await api.put('/configuracion', configuracion);
      
      // Simular guardado
      setTimeout(() => {
        setSuccess('Configuración guardada exitosamente');
        setSaving(false);
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(''), 3000);
      }, 1000);

    } catch (error) {
      console.error('Error saving configuration:', error);
      setError(error.message || 'Error al guardar la configuración');
      setSaving(false);
    }
  };

  const handleResetConfiguracion = () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto? Se perderán todos los cambios no guardados.')) {
      fetchConfiguracion();
      setSuccess('Configuración restaurada a los valores por defecto');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const tabs = [
    { id: 'empresa', name: 'Empresa', icon: BuildingStorefrontIcon },
    { id: 'finanzas', name: 'Finanzas', icon: CurrencyDollarIcon },
    { id: 'notificaciones', name: 'Notificaciones', icon: EnvelopeIcon },
    { id: 'seguridad', name: 'Seguridad', icon: ShieldCheckIcon },
    { id: 'backup', name: 'Backup', icon: FolderIcon }
  ];

  const ConfiguracionEmpresa = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Información de la Empresa</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                value={configuracion.empresaNombre}
                onChange={(e) => handleInputChange(null, 'empresaNombre', e.target.value)}
                className="input-primary"
                placeholder="EYS Inversiones"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propietario/Dueño
              </label>
              <input
                type="text"
                value={configuracion.dueno}
                onChange={(e) => handleInputChange(null, 'dueno', e.target.value)}
                className="input-primary"
                placeholder="Nombre del propietario"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                value={configuracion.ubicacion}
                onChange={(e) => handleInputChange(null, 'ubicacion', e.target.value)}
                className="input-primary"
                placeholder="Dirección de la empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="text"
                value={configuracion.numero}
                onChange={(e) => handleInputChange(null, 'numero', e.target.value)}
                className="input-primary"
                placeholder="809-123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={configuracion.correo}
                onChange={(e) => handleInputChange(null, 'correo', e.target.value)}
                className="input-primary"
                placeholder="info@empresa.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Logo
              </label>
              <input
                type="url"
                value={configuracion.logoUrl}
                onChange={(e) => handleInputChange(null, 'logoUrl', e.target.value)}
                className="input-primary"
                placeholder="https://ejemplo.com/logo.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa la URL de la imagen del logo de tu empresa
              </p>
            </div>
          </div>

          {/* Vista previa del logo */}
          {configuracion.logoUrl && (
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista Previa del Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={configuracion.logoUrl} 
                    alt="Logo preview" 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <PhotoIcon className="h-8 w-8 text-gray-400 hidden" />
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{configuracion.empresaNombre}</div>
                  <div>Aparecerá en el sidebar y reportes</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Colores de la marca */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Colores de la Marca</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Primario
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={configuracion.colores.primario}
                  onChange={(e) => handleInputChange('colores', 'primario', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={configuracion.colores.primario}
                  onChange={(e) => handleInputChange('colores', 'primario', e.target.value)}
                  className="input-primary flex-1 font-mono text-sm"
                  placeholder="#DC2626"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Color principal de la aplicación (botones, encabezados)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Secundario
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={configuracion.colores.secundario}
                  onChange={(e) => handleInputChange('colores', 'secundario', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={configuracion.colores.secundario}
                  onChange={(e) => handleInputChange('colores', 'secundario', e.target.value)}
                  className="input-primary flex-1 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Color secundario (textos, bordes)
              </p>
            </div>
          </div>

          {/* Vista previa de colores */}
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Vista Previa
            </label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div 
                  className="h-10 rounded-lg flex items-center justify-center text-white font-medium mb-2"
                  style={{ backgroundColor: configuracion.colores.primario }}
                >
                  Botón Primario
                </div>
                <div className="text-xs text-center text-gray-600">Primario</div>
              </div>
              <div className="flex-1">
                <div 
                  className="h-10 rounded-lg flex items-center justify-center text-white font-medium mb-2"
                  style={{ backgroundColor: configuracion.colores.secundario }}
                >
                  Texto Secundario
                </div>
                <div className="text-xs text-center text-gray-600">Secundario</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ConfiguracionFinanzas = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Configuración Financiera</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda Principal *
              </label>
              <select
                value={configuracion.moneda}
                onChange={(e) => handleInputChange(null, 'moneda', e.target.value)}
                className="input-primary"
              >
                <option value="DOP">Peso Dominicano (DOP)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital Disponible (RD$)
              </label>
              <input
                type="number"
                value={configuracion.capitalDisponible}
                onChange={(e) => handleInputChange(null, 'capitalDisponible', parseInt(e.target.value) || 0)}
                className="input-primary"
                placeholder="300000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Carga
              </label>
              <select
                value={configuracion.tipoCarga}
                onChange={(e) => handleInputChange(null, 'tipoCarga', e.target.value)}
                className="input-primary"
              >
                <option value="manual">Manual</option>
                <option value="automatica">Automática</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de Sesión (minutos)
              </label>
              <input
                type="number"
                value={configuracion.sesionTiempo}
                onChange={(e) => handleInputChange(null, 'sesionTiempo', parseInt(e.target.value) || 60)}
                className="input-primary"
                placeholder="60"
                min="5"
                max="480"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monedas Disponibles
            </label>
            <div className="space-y-2">
              {configuracion.monedasDisponibles.map((moneda, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded border border-gray-300"></div>
                  <span className="text-sm text-gray-700">{moneda}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ConfiguracionNotificaciones = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Recordatorios de Pago</span>
              <p className="text-xs text-gray-500">Enviar recordatorios automáticos de pagos pendientes</p>
            </div>
            <input
              type="checkbox"
              checked={configuracion.notificaciones.recordatoriosPago}
              onChange={(e) => handleInputChange('notificaciones', 'recordatoriosPago', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Alertas de Mora</span>
              <p className="text-xs text-gray-500">Notificar cuando un préstamo entre en estado de mora</p>
            </div>
            <input
              type="checkbox"
              checked={configuracion.notificaciones.alertasMora}
              onChange={(e) => handleInputChange('notificaciones', 'alertasMora', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Confirmaciones de Pago</span>
              <p className="text-xs text-gray-500">Enviar confirmación cuando se registre un pago</p>
            </div>
            <input
              type="checkbox"
              checked={configuracion.notificaciones.confirmacionesPago}
              onChange={(e) => handleInputChange('notificaciones', 'confirmacionesPago', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Notificaciones de Solicitudes</span>
              <p className="text-xs text-gray-500">Recibir notificaciones de nuevas solicitudes de préstamo</p>
            </div>
            <input
              type="checkbox"
              checked={configuracion.notificaciones.notificacionesSolicitudes}
              onChange={(e) => handleInputChange('notificaciones', 'notificacionesSolicitudes', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const ConfiguracionSeguridad = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Requerir Verificación de Email</span>
              <p className="text-xs text-gray-500">Los usuarios deben verificar su email al registrarse</p>
            </div>
            <input
              type="checkbox"
              checked={configuracion.seguridad.requiereVerificacionEmail}
              onChange={(e) => handleInputChange('seguridad', 'requiereVerificacionEmail', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intentos Máximos de Login
            </label>
            <input
              type="number"
              value={configuracion.seguridad.intentosLoginMaximos}
              onChange={(e) => handleInputChange('seguridad', 'intentosLoginMaximos', parseInt(e.target.value) || 5)}
              className="input-primary"
              min="1"
              max="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Número máximo de intentos fallidos antes de bloquear la cuenta
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitud Mínima de Contraseña
            </label>
            <input
              type="number"
              value={configuracion.seguridad.longitudMinimaPassword}
              onChange={(e) => handleInputChange('seguridad', 'longitudMinimaPassword', parseInt(e.target.value) || 6)}
              className="input-primary"
              min="6"
              max="20"
            />
            <p className="text-xs text-gray-500 mt-1">
              Longitud mínima requerida para las contraseñas de usuarios
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ConfiguracionBackup = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Configuración de Backup</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carpeta de Backup
            </label>
            <input
              type="text"
              value={configuracion.backupFolder}
              onChange={(e) => handleInputChange(null, 'backupFolder', e.target.value)}
              className="input-primary"
              placeholder="/ruta/backup"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ruta donde se guardarán las copias de seguridad automáticas
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Información de Backup</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Las copias de seguridad automáticas se realizan diariamente a las 2:00 AM.
                  Se mantienen los últimos 7 días de backups.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button className="btn-primary">
              Realizar Backup Manual
            </button>
            <button className="btn-secondary">
              Restaurar desde Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading || !configuracion) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600">Configura los datos y preferencias del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleResetConfiguracion}
            className="btn-secondary"
          >
            Restablecer
          </button>
          <button
            onClick={handleSaveConfiguracion}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <CogIcon className="h-5 w-5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      <div>
        {activeTab === 'empresa' && <ConfiguracionEmpresa />}
        {activeTab === 'finanzas' && <ConfiguracionFinanzas />}
        {activeTab === 'notificaciones' && <ConfiguracionNotificaciones />}
        {activeTab === 'seguridad' && <ConfiguracionSeguridad />}
        {activeTab === 'backup' && <ConfiguracionBackup />}
      </div>

      {/* Información de última modificación */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          Última modificación: {new Date(configuracion.fechaHoraModificacion).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default Configuracion;