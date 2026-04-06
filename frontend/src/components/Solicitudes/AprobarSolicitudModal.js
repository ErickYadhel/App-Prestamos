import React, { useState } from 'react';
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
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const AprobarSolicitudModal = ({ solicitud, onClose, onAprobado, onError }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    montoAprobado: solicitud.montoSolicitado,
    interesPercent: 10,
    frecuencia: solicitud.frecuencia || 'quincenal',
    observaciones: '',
    enviarWhatsApp: true
  });
  const [loading, setLoading] = useState(false);

  const calcularPagoEstimado = () => {
    const monto = parseFloat(formData.montoAprobado) || 0;
    const tasaInteres = formData.interesPercent;
    return (monto * tasaInteres) / 100;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const enviarWhatsAppAprobacion = () => {
    if (!formData.enviarWhatsApp) return;
    
    const pagoEstimado = calcularPagoEstimado();
    const mensaje = `✅ SOLICITUD APROBADA - EYS Inversiones

¡Felicidades ${solicitud.clienteNombre}!

Su solicitud de préstamo ha sido *APROBADA*:

• 💰 Monto Aprobado: RD$ ${formData.montoAprobado?.toLocaleString()}
• 📈 Tasa de Interés: ${formData.interesPercent}%
• 🔄 Frecuencia de Pago: ${formData.frecuencia}
• 💵 Pago estimado: RD$ ${Math.round(pagoEstimado).toLocaleString()} por ${formData.frecuencia}

📋 El contrato ha sido generado y está disponible en el sistema.

📞 Nos estaremos comunicando con usted para coordinar la entrega.

¡Gracias por confiar en EYS Inversiones!`;

    const whatsappLink = `https://wa.me/1${solicitud.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappLink, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('🚀 [AprobarSolicitudModal] Iniciando aprobación...');
    console.log('📋 Datos de la solicitud:', {
      id: solicitud.id,
      cliente: solicitud.clienteNombre,
      estadoActual: solicitud.estado,
      generarComision: solicitud.generarComision,
      garanteID: solicitud.garanteID,
      porcentajeComision: solicitud.porcentajeComision
    });
    console.log('📝 Datos del formulario:', formData);
    console.log('👤 Usuario aprobador:', user?.email);

    try {
      console.log('📡 [API] Enviando solicitud a /solicitudes/${solicitud.id}/aprobar');
      const response = await api.put(`/solicitudes/${solicitud.id}/aprobar`, {
        montoAprobado: parseFloat(formData.montoAprobado),
        interesPercent: parseFloat(formData.interesPercent),
        frecuencia: formData.frecuencia,
        observaciones: formData.observaciones,
        aprobadoPor: user?.email,
        // NUEVOS CAMPOS DE COMISIÓN - tomados de la solicitud original
        generarComision: solicitud.generarComision || false,
        garanteID: solicitud.garanteID || null,
        garanteNombre: solicitud.garanteNombre || null,
        porcentajeComision: solicitud.porcentajeComision || 50
      });

      console.log('📡 [API] Respuesta del backend:', response);

      if (response.success) {
        console.log('✅ [Backend] Solicitud aprobada exitosamente');
        console.log('📦 Datos recibidos:', response.data);
        
        if (response.data.prestamoId) {
          console.log('💰 Préstamo creado con ID:', response.data.prestamoId);
          
          const prestamoDoc = await getDoc(doc(db, 'prestamos', response.data.prestamoId));
          if (prestamoDoc.exists()) {
            console.log('✅ Préstamo verificado en Firestore:', prestamoDoc.data());
          } else {
            console.warn('⚠️ Préstamo no encontrado en Firestore después de creación');
          }
        } else {
          console.warn('⚠️ No se recibió prestamoId en la respuesta');
        }
        
        console.log('🔄 Actualizando solicitud en Firestore...');
        const solicitudRef = doc(db, 'solicitudes', solicitud.id);
        await updateDoc(solicitudRef, {
          estado: 'aprobada',
          clienteID: response.data.clienteID,
          prestamoId: response.data.prestamoId,
          montoAprobado: parseFloat(formData.montoAprobado),
          interesAprobado: parseFloat(formData.interesPercent),
          frecuenciaAprobada: formData.frecuencia,
          fechaDecision: new Date().toISOString(),
          aprobadoPor: user?.email
        });
        
        console.log('✅ Solicitud actualizada en Firestore');
        
        enviarWhatsAppAprobacion();
        console.log('📱 WhatsApp enviado al cliente');
        
        console.log('🎉 Proceso completado, cerrando modal y recargando...');
        onAprobado();
      } else {
        console.error('❌ [Backend] Error en la respuesta:', response);
        throw new Error(response.error || 'Error al aprobar la solicitud');
      }
    } catch (error) {
      console.error('❌ [AprobarSolicitudModal] Error en el proceso:', error);
      console.error('Stack trace:', error.stack);
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

  const pagoEstimado = calcularPagoEstimado();
  const ratioPagoSueldo = (pagoEstimado / (solicitud.sueldoCliente || 1)) * 100;
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
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      Estado actual: {solicitud.estado === 'aprobado_cliente' ? '✅ Aprobado por cliente' : '📝 Pendiente'}
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
                </div>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} border border-green-600/20`}>
                <div className="flex items-center space-x-2 mb-3">
                  <CalculatorIcon className="h-5 w-5 text-green-600" />
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                    Resumen del Préstamo
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>Pago por Periodo:</span>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                      RD$ {pagoEstimado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>Frecuencia:</span>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-900'}`}>
                      {formData.frecuencia}
                    </p>
                  </div>
                </div>
              </div>

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