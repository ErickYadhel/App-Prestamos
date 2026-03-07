import React from 'react';
import { motion } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';

// ============================================
// COMPONENTE DE TARJETA CON EFECTO GLASSMORPHISM
// ============================================
const GlassCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-red-600/20 hover:border-red-600/40 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// ============================================
// COMPONENTE DE TOGGLE TECNOLÓGICO
// ============================================
const TechToggle = ({ label, description, checked, onChange }) => {
  const [isChecked, setIsChecked] = React.useState(checked || false);

  React.useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(newValue);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-red-600/20 hover:border-red-600/50 transition-all cursor-pointer group"
      onClick={handleToggle}
    >
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isChecked ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <motion.div
          animate={{ x: isChecked ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: NOTIFICACIONES
// ============================================
const Notificaciones = ({ configuracion, handleInputChange }) => {
  return (
    <motion.div
      key="notificaciones"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg">
              <BellIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notificaciones</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configura cómo y cuándo recibir alertas</p>
            </div>
          </div>

          <div className="space-y-4">
            <TechToggle
              label="Recordatorios de Pago"
              description="Enviar recordatorios automáticos de pagos pendientes"
              checked={configuracion?.notificaciones?.recordatoriosPago || false}
              onChange={(value) => handleInputChange('notificaciones', 'recordatoriosPago', value)}
            />

            <TechToggle
              label="Alertas de Mora"
              description="Notificar cuando un préstamo entre en estado de mora"
              checked={configuracion?.notificaciones?.alertasMora || false}
              onChange={(value) => handleInputChange('notificaciones', 'alertasMora', value)}
            />

            <TechToggle
              label="Confirmaciones de Pago"
              description="Enviar confirmación cuando se registre un pago"
              checked={configuracion?.notificaciones?.confirmacionesPago || false}
              onChange={(value) => handleInputChange('notificaciones', 'confirmacionesPago', value)}
            />

            <TechToggle
              label="Notificaciones de Solicitudes"
              description="Recibir notificaciones de nuevas solicitudes de préstamo"
              checked={configuracion?.notificaciones?.notificacionesSolicitudes || false}
              onChange={(value) => handleInputChange('notificaciones', 'notificacionesSolicitudes', value)}
            />

            <TechToggle
              label="Reportes por Email"
              description="Recibir reportes periódicos en tu correo"
              checked={configuracion?.notificaciones?.emailReportes || false}
              onChange={(value) => handleInputChange('notificaciones', 'emailReportes', value)}
            />

            <TechToggle
              label="Alertas SMS"
              description="Recibir alertas importantes vía SMS"
              checked={configuracion?.notificaciones?.smsAlertas || false}
              onChange={(value) => handleInputChange('notificaciones', 'smsAlertas', value)}
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Notificaciones;