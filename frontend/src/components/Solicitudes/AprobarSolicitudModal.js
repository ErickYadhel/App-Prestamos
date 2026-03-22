import React, { useState } from 'react';  // ← Solo una vez
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';

const AprobarSolicitudModal = ({ solicitud, onClose, onAprobado, onError }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    montoAprobado: solicitud.montoSolicitado,
    interesPercent: 10,
    frecuencia: solicitud.frecuencia,
    plazoMeses: solicitud.plazoMeses,
    observaciones: '',
    enviarWhatsApp: true
  });
  const [loading, setLoading] = useState(false);

  const calcularPagoEstimado = () => {
    const monto = parseFloat(formData.montoAprobado) || 0;
    const plazo = formData.plazoMeses || solicitud.plazoMeses || 12;
    const tasaInteres = formData.interesPercent;

    const interesTotal = (monto * tasaInteres * plazo) / 100;
    const totalPagar = monto + interesTotal;

    let pagosPorMes = 1;
    switch (formData.frecuencia) {
      case 'diario': pagosPorMes = 30; break;
      case 'semanal': pagosPorMes = 4; break;
      case 'quincenal': pagosPorMes = 2; break;
      case 'mensual': pagosPorMes = 1; break;
    }

    const pagoPorPeriodo = totalPagar / (plazo * pagosPorMes);

    return {
      interesTotal,
      totalPagar,
      pagoPorPeriodo,
      pagosTotales: plazo * pagosPorMes
    };
  };

  const calculos = calcularPagoEstimado();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para crear el préstamo automáticamente
  const crearPrestamoAutomatico = async () => {
    const fechaActual = new Date();
    const fechaProximoPago = new Date(fechaActual);
    
    switch(formData.frecuencia) {
      case 'diario':
        fechaProximoPago.setDate(fechaProximoPago.getDate() + 1);
        break;
      case 'semanal':
        fechaProximoPago.setDate(fechaProximoPago.getDate() + 7);
        break;
      case 'quincenal':
        fechaProximoPago.setDate(fechaProximoPago.getDate() + 15);
        break;
      case 'mensual':
        fechaProximoPago.setMonth(fechaProximoPago.getMonth() + 1);
        break;
      default:
        fechaProximoPago.setDate(fechaProximoPago.getDate() + 30);
    }

    const prestamoData = {
      clienteID: solicitud.clienteID || solicitud.id,
      clienteNombre: solicitud.clienteNombre,
      montoPrestado: parseFloat(formData.montoAprobado),
      capitalRestante: parseFloat(formData.montoAprobado),
      interesPercent: parseFloat(formData.interesPercent),
      frecuencia: formData.frecuencia,
      plazoMeses: formData.plazoMeses || 12,
      estado: 'activo',
      fechaPrestamo: fechaActual.toISOString(),
      fechaProximoPago: fechaProximoPago.toISOString(),
      fechaUltimoPago: null,
      fechaActualizacion: fechaActual.toISOString(),
      creadoPor: user?.email,
      solicitudId: solicitud.id
    };

    const prestamosRef = collection(db, 'prestamos');
    const prestamoDoc = await addDoc(prestamosRef, prestamoData);
    
    // Actualizar la solicitud con el ID del préstamo
    const solicitudRef = doc(db, 'solicitudes', solicitud.id);
    await updateDoc(solicitudRef, {
      prestamoId: prestamoDoc.id,
      montoAprobado: parseFloat(formData.montoAprobado),
      interesAprobado: parseFloat(formData.interesPercent),
      frecuenciaAprobada: formData.frecuencia
    });

    return prestamoDoc.id;
  };

  // Función para enviar WhatsApp
  const enviarWhatsAppAprobacion = () => {
    if (!formData.enviarWhatsApp) return;
    
    const mensaje = `✅ SOLICITUD APROBADA - EYS Inversiones

¡Felicidades ${solicitud.clienteNombre}!

Su solicitud de préstamo ha sido *APROBADA*:

• 💰 Monto Aprobado: RD$ ${formData.montoAprobado?.toLocaleString()}
• 📈 Tasa de Interés: ${formData.interesPercent}%
• 🔄 Frecuencia de Pago: ${formData.frecuencia}
• 💵 Pago estimado: RD$ ${Math.round(calculos.pagoPorPeriodo).toLocaleString()} por ${formData.frecuencia}

📋 El contrato ha sido generado y está disponible en el sistema.

📞 Nos estaremos comunicando con usted para coordinar la entrega.

¡Gracias por confiar en EYS Inversiones!`;

    const whatsappLink = `https://wa.me/1${solicitud.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappLink, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear el préstamo en Firebase
      const prestamoId = await crearPrestamoAutomatico();
      
      // 2. Actualizar la solicitud en la API
      const response = await api.put(`/solicitudes/${solicitud.id}/aprobar`, {
        ...formData,
        montoAprobado: parseFloat(formData.montoAprobado),
        interesPercent: parseFloat(formData.interesPercent),
        prestamoId: prestamoId,
        aprobadoPor: user?.email,
        fechaAprobacion: new Date().toISOString()
      });

      if (response.success) {
        // 3. Enviar WhatsApp si está activado
        enviarWhatsAppAprobacion();
        
        onAprobado();
      } else {
        throw new Error(response.error || 'Error al aprobar la solicitud');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTasaSugerida = () => {
    const baseRate = 8;
    const score = solicitud.scoreAnalisis || 50;
    const scoreAdjustment = (100 - score) / 100;
    const frequencyMultiplier = {
      diario: 0.5,
      semanal: 0.8,
      quincenal: 1,
      mensual: 1.2
    };
    return Math.min(20, Math.max(5, baseRate + (scoreAdjustment * 5)) * (frequencyMultiplier[formData.frecuencia] || 1));
  };

  const ratioPagoSueldo = calculos.pagoPorPeriodo / (solicitud.sueldoCliente || 1) * 100;
  const capacidadPagoOk = ratioPagoSueldo <= 40;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl blur-xl opacity-75" />
          
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-2 border-green-600/30 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan" />

            {/* Header */}
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
              theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-green-50 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-600 to-green-800 rounded-lg">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Aprobar Solicitud de Préstamo
                    </h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Configura los términos del préstamo para {solicitud.clienteNombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Información de la Solicitud */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border border-green-600/20`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{solicitud.clienteNombre}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Monto Solicitado:</span>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      RD$ {solicitud.montoSolicitado?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Score:</span>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {solicitud.scoreAnalisis || 50}/100
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Sueldo:</span>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      RD$ {solicitud.sueldoCliente?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Términos del Préstamo */}
              <div>
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Términos del Préstamo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monto Aprobado (RD$)
                    </label>
                    <input
                      type="number"
                      name="montoAprobado"
                      value={formData.montoAprobado}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-green-500'
                      } focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                      min="1000"
                      max={solicitud.montoSolicitado * 1.2}
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tasa de Interés (%)
                    </label>
                    <input
                      type="number"
                      name="interesPercent"
                      value={formData.interesPercent}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-green-500'
                      } focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                      min="5"
                      max="20"
                      step="0.5"
                    />
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Tasa sugerida: {getTasaSugerida().toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Frecuencia de Pago
                    </label>
                    <select
                      name="frecuencia"
                      value={formData.frecuencia}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-green-500'
                      } focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Plazo (Meses)
                    </label>
                    <input
                      type="number"
                      name="plazoMeses"
                      value={formData.plazoMeses}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-green-500'
                      } focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                      min="0"
                      max="60"
                    />
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      0 = Sin plazo fijo (pago flexible)
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen de Cálculos */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} border border-green-600/20`}>
                <div className="flex items-center space-x-2 mb-3">
                  <CalculatorIcon className="h-5 w-5 text-green-600" />
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                    Resumen del Préstamo
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>Interés Total:</span>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                      RD$ {calculos.interesTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>Total a Pagar:</span>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                      RD$ {calculos.totalPagar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>Pago por Periodo:</span>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                      RD$ {calculos.pagoPorPeriodo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>Total de Pagos:</span>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>{calculos.pagosTotales}</p>
                  </div>
                </div>
              </div>

              {/* Análisis de Riesgo */}
              <div className={`p-4 rounded-lg ${ratioPagoSueldo <= 40 ? 
                (theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50') : 
                (theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50')} border ${ratioPagoSueldo <= 40 ? 'border-blue-600/20' : 'border-yellow-600/20'}`}>
                <div className="flex items-start">
                  <ExclamationTriangleIcon className={`h-5 w-5 ${ratioPagoSueldo <= 40 ? 'text-blue-500' : 'text-yellow-500'} mt-0.5 mr-2 flex-shrink-0`} />
                  <div>
                    <h4 className={`text-sm font-medium ${ratioPagoSueldo <= 40 ? 
                      (theme === 'dark' ? 'text-blue-400' : 'text-blue-800') : 
                      (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800')}`}>
                      Análisis de Capacidad de Pago
                    </h4>
                    <div className="text-sm mt-1 space-y-1">
                      <p className={ratioPagoSueldo <= 40 ? 
                        (theme === 'dark' ? 'text-blue-300' : 'text-blue-700') : 
                        (theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700')}>
                        • Ratio Pago/Sueldo: {ratioPagoSueldo.toFixed(1)}%
                      </p>
                      <p className={ratioPagoSueldo <= 40 ? 
                        (theme === 'dark' ? 'text-blue-300' : 'text-blue-700') : 
                        (theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700')}>
                        • Capacidad de Pago: {capacidadPagoOk ? '✅ Adecuada' : '⚠️ Limitada'}
                      </p>
                      <p className={solicitud.scoreAnalisis >= 70 ? 
                        (theme === 'dark' ? 'text-green-300' : 'text-green-700') : 
                        (theme === 'dark' ? 'text-red-300' : 'text-red-700')}>
                        • Riesgo Crediticio: {solicitud.scoreAnalisis >= 70 ? 'Bajo' : solicitud.scoreAnalisis >= 50 ? 'Moderado' : 'Alto'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="enviarWhatsApp"
                  checked={formData.enviarWhatsApp}
                  onChange={(e) => setFormData({ ...formData, enviarWhatsApp: e.target.checked })}
                  className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enviar notificación por WhatsApp al cliente
                </label>
              </div>

              {/* Observaciones */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Observaciones para el Cliente
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="2"
                  className={`w-full px-4 py-2 rounded-lg border-2 text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-green-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-green-500'
                  } focus:ring-2 focus:ring-green-500/20 outline-none transition-all`}
                  placeholder="Observaciones sobre los términos del préstamo..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Aprobar y Crear Préstamo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AprobarSolicitudModal;