import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  MapPinIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  UserCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { firebaseTimestampToLocalString } from '../../utils/firebaseUtils';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SolicitudDetails = ({ solicitud, onBack, onEdit, onAprobar, onRechazar, bancos = [] }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showAprobarModal, setShowAprobarModal] = useState(false);
  const [datosAprobacion, setDatosAprobacion] = useState({
    montoAprobado: solicitud.montoSolicitado,
    interesPercent: 10,
    frecuencia: solicitud.frecuencia,
    observaciones: ''
  });
  const [showClienteAprobado, setShowClienteAprobado] = useState(solicitud.estado === 'aprobado_cliente');
  const [evidenciaFirma, setEvidenciaFirma] = useState(null);
  const [showEvidenciaModal, setShowEvidenciaModal] = useState(false);

  const InfoRow = ({ label, value, icon: Icon, color = 'text-gray-600', important = false }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 dark:border-gray-700">
      <Icon className={`h-5 w-5 ${color} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${important ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{label}</p>
        <p className={`text-sm ${color} mt-1 ${important ? 'font-semibold' : ''}`}>
          {value || 'No especificado'}
        </p>
      </div>
    </div>
  );

  const calcularScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
    if (score >= 40) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-700';
    return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-700';
  };

  const getRecomendacion = (score) => {
    if (score >= 80) return { texto: 'ALTA PRIORIDAD - APROBAR', tipo: 'success' };
    if (score >= 70) return { texto: 'RECOMENDADA - APROBAR', tipo: 'info' };
    if (score >= 50) return { texto: 'EVALUAR CON PRECAUCIÓN', tipo: 'warning' };
    if (score >= 30) return { texto: 'RIESGO MODERADO - RECHAZAR', tipo: 'danger' };
    return { texto: 'ALTO RIESGO - RECHAZAR', tipo: 'danger' };
  };

  const calcularPagoEstimado = () => {
    return (datosAprobacion.montoAprobado * datosAprobacion.interesPercent) / 100;
  };

  const calcularAntiguedad = (fechaIngreso) => {
    if (!fechaIngreso) return null;
    const fecha = new Date(fechaIngreso);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - fecha);
    const anos = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return anos;
  };

  const antiguedad = calcularAntiguedad(solicitud.fechaIngreso);

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(139, 0, 0);
    doc.text('DETALLES DE SOLICITUD DE PRÉSTAMO', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`ID Solicitud: ${solicitud.id}`, 20, 35);
    doc.text(`Fecha: ${firebaseTimestampToLocalString(solicitud.fechaSolicitud)}`, 20, 42);
    doc.text(`Estado: ${solicitud.estado?.toUpperCase()}`, 20, 49);
    
    let y = 60;
    
    // Información del Cliente
    doc.setFontSize(12);
    doc.setTextColor(139, 0, 0);
    doc.text('INFORMACIÓN DEL CLIENTE', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nombre: ${solicitud.clienteNombre}`, 25, y);
    y += 6;
    doc.text(`Cédula: ${solicitud.cedula}`, 25, y);
    y += 6;
    doc.text(`Teléfono: ${solicitud.telefono}`, 25, y);
    y += 6;
    doc.text(`Email: ${solicitud.email}`, 25, y);
    y += 6;
    doc.text(`Dirección: ${solicitud.direccion}`, 25, y);
    y += 6;
    doc.text(`Provincia: ${solicitud.provincia}`, 25, y);
    y += 10;
    
    // Información Laboral
    doc.setFontSize(12);
    doc.setTextColor(139, 0, 0);
    doc.text('INFORMACIÓN LABORAL', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Lugar de Trabajo: ${solicitud.lugarTrabajo}`, 25, y);
    y += 6;
    doc.text(`Puesto: ${solicitud.puestoCliente}`, 25, y);
    y += 6;
    doc.text(`Sueldo: RD$ ${solicitud.sueldoCliente?.toLocaleString()}`, 25, y);
    y += 6;
    if (solicitud.fechaIngreso) {
      doc.text(`Fecha de Ingreso: ${new Date(solicitud.fechaIngreso).toLocaleDateString()}`, 25, y);
      y += 6;
      if (antiguedad) {
        doc.text(`Antigüedad: ${antiguedad.toFixed(1)} años`, 25, y);
        y += 6;
      }
    }
    y += 10;
    
    // Detalles del Préstamo
    doc.setFontSize(12);
    doc.setTextColor(139, 0, 0);
    doc.text('DETALLES DEL PRÉSTAMO', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Monto Solicitado: RD$ ${solicitud.montoSolicitado?.toLocaleString()}`, 25, y);
    y += 6;
    doc.text(`Plazo: ${solicitud.plazoMeses === 0 ? 'Sin plazo fijo' : `${solicitud.plazoMeses} meses`}`, 25, y);
    y += 6;
    doc.text(`Frecuencia: ${solicitud.frecuencia}`, 25, y);
    y += 6;
    if (solicitud.garantia) {
      doc.text(`Garantía: ${solicitud.garantia}`, 25, y);
      y += 6;
    }
    y += 10;
    
    // Análisis de Riesgo
    const score = solicitud.scoreAnalisis || 50;
    const recomendacion = getRecomendacion(score);
    doc.setFontSize(12);
    doc.setTextColor(139, 0, 0);
    doc.text('ANÁLISIS DE RIESGO', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Score: ${score}/100`, 25, y);
    y += 6;
    doc.text(`Recomendación: ${recomendacion.texto}`, 25, y);
    y += 6;
    const ratioSueldo = solicitud.sueldoCliente ? (solicitud.montoSolicitado / solicitud.sueldoCliente) : 0;
    doc.text(`Ratio Monto/Sueldo: ${ratioSueldo.toFixed(2)}x`, 25, y);
    y += 10;
    
    // Información Bancaria
    if (solicitud.bancoCliente) {
      doc.setFontSize(12);
      doc.setTextColor(139, 0, 0);
      doc.text('INFORMACIÓN BANCARIA', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Banco: ${solicitud.bancoCliente}`, 25, y);
      y += 6;
      doc.text(`Tipo de Cuenta: ${solicitud.tipoCuenta}`, 25, y);
      y += 6;
      doc.text(`Número de Cuenta: ${solicitud.cuentaCliente}`, 25, y);
    }
    
    doc.save(`solicitud_${solicitud.id}.pdf`);
  };

  // Exportar a Excel
  const exportarExcel = () => {
    const data = [{
      'ID Solicitud': solicitud.id,
      'Cliente': solicitud.clienteNombre,
      'Cédula': solicitud.cedula,
      'Teléfono': solicitud.telefono,
      'Email': solicitud.email,
      'Dirección': solicitud.direccion,
      'Provincia': solicitud.provincia,
      'Lugar de Trabajo': solicitud.lugarTrabajo,
      'Puesto': solicitud.puestoCliente,
      'Sueldo': solicitud.sueldoCliente,
      'Fecha Ingreso': solicitud.fechaIngreso ? new Date(solicitud.fechaIngreso).toLocaleDateString() : '',
      'Antigüedad (años)': antiguedad ? antiguedad.toFixed(2) : '',
      'Monto Solicitado': solicitud.montoSolicitado,
      'Plazo (meses)': solicitud.plazoMeses === 0 ? 'Sin plazo' : solicitud.plazoMeses,
      'Frecuencia': solicitud.frecuencia,
      'Garantía': solicitud.garantia,
      'Banco': solicitud.bancoCliente,
      'Tipo Cuenta': solicitud.tipoCuenta,
      'Número Cuenta': solicitud.cuentaCliente,
      'Score': solicitud.scoreAnalisis || 50,
      'Estado': solicitud.estado,
      'Fecha Solicitud': firebaseTimestampToLocalString(solicitud.fechaSolicitud),
      'Empleado': solicitud.empleadoNombre
    }];
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitud');
    XLSX.writeFile(wb, `solicitud_${solicitud.id}.xlsx`);
  };

  // Función para marcar que el cliente aprobó el documento
  const handleClienteAprobo = async () => {
    if (!evidenciaFirma) {
      alert('Por favor, suba la evidencia de la firma del cliente');
      return;
    }

    try {
      const solicitudRef = doc(db, 'solicitudes', solicitud.id);
      await updateDoc(solicitudRef, {
        estado: 'aprobado_cliente',
        fechaAprobacionCliente: new Date().toISOString(),
        evidenciaFirma: evidenciaFirma,
        aprobadoPorCliente: user?.email
      });

      setShowClienteAprobado(true);
      
      const mensaje = `✅ SOLICITUD APROBADA POR EL CLIENTE - EYS Inversiones

El cliente ${solicitud.clienteNombre} ha aprobado el contrato.

• 📄 Solicitud ID: ${solicitud.id}
• 💰 Monto: RD$ ${solicitud.montoSolicitado?.toLocaleString()}
• 👤 Cliente: ${solicitud.clienteNombre}
• 📞 Teléfono: ${solicitud.telefono}

Puede revisar la solicitud en el sistema para proceder con la aprobación final.

- Sistema EYS Inversiones`;

      const whatsappLink = `https://wa.me/18294470640?text=${encodeURIComponent(mensaje)}`;
      window.open(whatsappLink, '_blank');
      
      alert('✅ Cliente aprobó el documento. Se ha notificado al administrador.');
      onBack();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado. Intente de nuevo.');
    }
  };

  const score = solicitud.scoreAnalisis || 50;
  const recomendacion = getRecomendacion(score);
  const ratioSueldo = solicitud.sueldoCliente ? (solicitud.montoSolicitado / solicitud.sueldoCliente) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Detalles de Solicitud
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Evaluación completa para toma de decisiones
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2 flex-wrap gap-2">
          <button
            onClick={exportarPDF}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Exportar PDF"
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={exportarExcel}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Exportar Excel"
          >
            <TableCellsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          
          {solicitud.estado === 'pendiente' && (
            <>
              <button
                onClick={() => setShowAprobarModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Aprobar</span>
              </button>
              <button
                onClick={() => setShowRechazarModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <XCircleIcon className="h-4 w-4" />
                <span>Rechazar</span>
              </button>
            </>
          )}
          {solicitud.estado === 'aprobado_cliente' && (
            <button
              onClick={() => onAprobar(solicitud)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>Aprobar Finalmente</span>
            </button>
          )}
          <button
            onClick={onEdit}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <PencilIcon className="h-4 w-4" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score y Recomendación */}
          <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-red-600" />
                Análisis de Riesgo
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Score de Evaluación</h4>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold border mt-1 ${calcularScoreColor(score)}`}>
                    {score} / 100
                  </div>
                </div>
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  recomendacion.tipo === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  recomendacion.tipo === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  recomendacion.tipo === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {recomendacion.texto}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monto/Sueldo:</span>
                    <span className={`font-medium ${
                      ratioSueldo <= 0.5 ? 'text-green-600 dark:text-green-400' :
                      ratioSueldo <= 1 ? 'text-yellow-600 dark:text-yellow-400' :
                      ratioSueldo <= 2 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {ratioSueldo.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Frecuencia:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{solicitud.frecuencia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plazo:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {solicitud.plazoMeses === 0 ? 'Sin plazo fijo' : `${solicitud.plazoMeses} meses`}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Información Laboral:</span>
                    <span className={`font-medium ${
                      solicitud.lugarTrabajo && solicitud.puestoCliente ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {solicitud.lugarTrabajo && solicitud.puestoCliente ? 'Completa' : 'Parcial'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Antigüedad:</span>
                    <span className={`font-medium ${
                      antiguedad && antiguedad >= 3 ? 'text-green-600 dark:text-green-400' :
                      antiguedad && antiguedad >= 1 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-orange-600 dark:text-orange-400'
                    }`}>
                      {antiguedad ? `${antiguedad.toFixed(1)} años` : 'No especificada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Información Bancaria:</span>
                    <span className={`font-medium ${
                      solicitud.bancoCliente && solicitud.cuentaCliente ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {solicitud.bancoCliente && solicitud.cuentaCliente ? 'Completa' : 'Parcial'}
                    </span>
                  </div>
                </div>
              </div>

              {solicitud.factoresRiesgo && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Factores Evaluados:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {solicitud.factoresRiesgo.map((factor, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{factor.nombre}:</span>
                        <span className={`font-medium ${factor.puntaje >= 10 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          {factor.puntaje} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Cliente */}
          <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2 text-red-600" />
                Información Personal del Cliente
              </h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow label="Nombre Completo" value={solicitud.clienteNombre} icon={UserIcon} important={true} />
              <InfoRow label="Cédula" value={solicitud.cedula} icon={IdentificationIcon} />
              <InfoRow label="Teléfono" value={solicitud.telefono} icon={PhoneIcon} important={true} />
              <InfoRow label="Email" value={solicitud.email} icon={EnvelopeIcon} />
              <InfoRow label="Dirección" value={solicitud.direccion} icon={MapPinIcon} />
              <InfoRow label="Provincia" value={solicitud.provincia} icon={MapPinIcon} />
            </div>
          </div>

          {/* Información Laboral */}
          <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-red-600" />
                Información Laboral
              </h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow label="Lugar de Trabajo" value={solicitud.lugarTrabajo} icon={BuildingOfficeIcon} important={true} />
              <InfoRow label="Puesto/Posición" value={solicitud.puestoCliente} icon={BriefcaseIcon} />
              <InfoRow label="Sueldo Mensual" value={solicitud.sueldoCliente ? `RD$ ${solicitud.sueldoCliente.toLocaleString()}` : ''} icon={CurrencyDollarIcon} />
              <InfoRow label="Fecha de Ingreso" value={solicitud.fechaIngreso ? new Date(solicitud.fechaIngreso).toLocaleDateString() : ''} icon={CalendarIcon} />
              {antiguedad && (
                <InfoRow label="Antigüedad" value={`${antiguedad.toFixed(1)} años`} icon={ClockIcon} />
              )}
            </div>
          </div>

          {/* Información Bancaria */}
          <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2 text-red-600" />
                Información Bancaria
              </h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow label="Banco" value={solicitud.bancoCliente} icon={BanknotesIcon} />
              <InfoRow label="Tipo de Cuenta" value={solicitud.tipoCuenta} icon={CreditCardIcon} />
              <InfoRow label="Número de Cuenta" value={solicitud.cuentaCliente} icon={CreditCardIcon} />
            </div>
          </div>

          {/* Detalles del Préstamo Solicitado */}
          <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-red-600" />
                Detalles del Préstamo Solicitado
              </h3>
            </div>
            <div className="p-6 space-y-1">
              <InfoRow label="Monto Solicitado" value={`RD$ ${solicitud.montoSolicitado?.toLocaleString()}`} icon={CurrencyDollarIcon} important={true} />
              <InfoRow label="Plazo" value={solicitud.plazoMeses === 0 ? 'Sin plazo fijo' : `${solicitud.plazoMeses} meses`} icon={CalendarIcon} />
              <InfoRow label="Frecuencia de Pago" value={solicitud.frecuencia} icon={CalendarIcon} important={true} />
              {solicitud.garantia && (
                <InfoRow label="Garantía" value={solicitud.garantia} icon={ShieldCheckIcon} />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado y Acciones Rápidas */}
          <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Estado Actual</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  solicitud.estado === 'aprobada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  solicitud.estado === 'aprobado_cliente' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {solicitud.estado === 'pendiente' && <ClockIcon className="w-4 h-4 mr-1" />}
                  {solicitud.estado === 'aprobada' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                  {solicitud.estado === 'aprobado_cliente' && <ShieldCheckIcon className="w-4 h-4 mr-1" />}
                  {solicitud.estado === 'rechazada' && <XCircleIcon className="w-4 h-4 mr-1" />}
                  {solicitud.estado === 'pendiente' ? 'Pendiente' :
                   solicitud.estado === 'aprobada' ? 'Aprobada' :
                   solicitud.estado === 'aprobado_cliente' ? 'Aprobado por Cliente' : 'Rechazada'}
                </div>
              </div>

              {solicitud.estado === 'pendiente' && !showClienteAprobado && (
                <button
                  onClick={() => setShowEvidenciaModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Marcar como Aprobado por Cliente</span>
                </button>
              )}

              <a
                href={`https://wa.me/1${solicitud.telefono?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 block text-center"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Contactar Cliente</span>
              </a>
            </div>
          </div>

          {/* Información del Empleado */}
          <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Empleado Solicitante</h3>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{solicitud.empleadoNombre || 'No especificado'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {solicitud.empleadoID}</p>
            </div>
          </div>

          {/* Fechas */}
          <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fechas</h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solicitud</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {firebaseTimestampToLocalString(solicitud.fechaSolicitud)}
                </p>
              </div>
              {solicitud.fechaDecision && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Decisión</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {firebaseTimestampToLocalString(solicitud.fechaDecision)}
                  </p>
                </div>
              )}
              {solicitud.fechaAprobacionCliente && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprobación del Cliente</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {firebaseTimestampToLocalString(solicitud.fechaAprobacionCliente)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Análisis Rápido */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-600/20`}>
            <div className="flex items-start">
              <ExclamationCircleIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} mt-0.5 mr-2 flex-shrink-0`} />
              <div>
                <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>Análisis Rápido</h4>
                <ul className={`text-sm mt-1 space-y-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  <li>• {ratioSueldo <= 1 ? 'Buena' : 'Alta'} relación monto/sueldo</li>
                  <li>• {solicitud.frecuencia === 'quincenal' ? 'Frecuencia óptima' : 'Frecuencia aceptable'}</li>
                  <li>• {solicitud.plazoMeses <= 12 ? 'Plazo conservador' : 'Plazo extendido'}</li>
                  <li>• Información {solicitud.direccion ? 'completa' : 'incompleta'}</li>
                  {antiguedad && (
                    <li>• {antiguedad >= 3 ? 'Buena' : antiguedad >= 1 ? 'Aceptable' : 'Baja'} antigüedad laboral</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Sistema Sin Plazo Fijo */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} border border-green-600/20`}>
            <div className="flex items-start">
              <SparklesIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'} mt-0.5 mr-2 flex-shrink-0`} />
              <div>
                <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>Sistema Sin Plazo Fijo</h4>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                  El cliente pagará intereses sobre el capital restante. Cada pago reduce el capital y los intereses se recalculan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      {solicitud.observaciones && (
        <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Observaciones</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">{solicitud.observaciones}</p>
          </div>
        </div>
      )}

      {/* Modal de Aprobación */}
      <AnimatePresence>
        {showAprobarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aprobar Solicitud</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Configura los detalles del préstamo para <strong>{solicitud.clienteNombre}</strong>
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monto Aprobado (RD$)
                    </label>
                    <input
                      type="number"
                      value={datosAprobacion.montoAprobado}
                      onChange={(e) => setDatosAprobacion(prev => ({
                        ...prev,
                        montoAprobado: parseFloat(e.target.value)
                      }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                      min="1000"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tasa de Interés (%)
                    </label>
                    <input
                      type="number"
                      value={datosAprobacion.interesPercent}
                      onChange={(e) => setDatosAprobacion(prev => ({
                        ...prev,
                        interesPercent: parseFloat(e.target.value)
                      }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                      min="1"
                      max="50"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frecuencia de Pago
                    </label>
                    <select
                      value={datosAprobacion.frecuencia}
                      onChange={(e) => setDatosAprobacion(prev => ({
                        ...prev,
                        frecuencia: e.target.value
                      }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>Pago Estimado:</strong> RD$ {calcularPagoEstimado()?.toLocaleString()} por {datosAprobacion.frecuencia}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Observaciones (Opcional)
                    </label>
                    <textarea
                      value={datosAprobacion.observaciones}
                      onChange={(e) => setDatosAprobacion(prev => ({
                        ...prev,
                        observaciones: e.target.value
                      }))}
                      rows="3"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAprobarModal(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowAprobarModal(false);
                      onAprobar(solicitud);
                    }}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Aprobar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Rechazo */}
      <AnimatePresence>
        {showRechazarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Rechazar Solicitud</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ¿Estás seguro de que quieres rechazar la solicitud de <strong>{solicitud.clienteNombre}</strong>? 
                  Por favor proporciona el motivo del rechazo.
                </p>
                
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Motivo del rechazo..."
                  rows="4"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all`}
                />
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowRechazarModal(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowRechazarModal(false);
                      onRechazar(solicitud.id, motivoRechazo);
                    }}
                    disabled={!motivoRechazo.trim()}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para evidencia de firma del cliente */}
      <AnimatePresence>
        {showEvidenciaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Aprobación del Cliente
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sube la evidencia de que el cliente ha firmado y aprobado el documento.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Evidencia (PDF, imagen o documento)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setEvidenciaFirma(e.target.files[0]?.name)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos aceptados: PDF, JPG, PNG
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEvidenciaModal(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleClienteAprobo}
                    disabled={!evidenciaFirma}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    Confirmar Aprobación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SolicitudDetails;