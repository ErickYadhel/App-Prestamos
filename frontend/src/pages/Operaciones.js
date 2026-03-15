import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

const Operaciones = () => {
  const { theme } = useTheme();

  const modulos = [
    {
      nombre: 'Formularios',
      descripcion: 'Gestión de formularios y solicitudes',
      icon: ClipboardDocumentListIcon,
      color: 'from-blue-500 to-blue-700',
      items: ['Solicitudes de préstamo', 'Formularios de clientes', 'Garantías']
    },
    {
      nombre: 'Reportes',
      descripcion: 'Reportes y análisis operativos',
      icon: ChartBarIcon,
      color: 'from-green-500 to-green-700',
      items: ['Reporte diario', 'Análisis de cartera', 'Estadísticas de pagos']
    },
    {
      nombre: 'Documentos',
      descripcion: 'Gestión documental',
      icon: DocumentTextIcon,
      color: 'from-purple-500 to-purple-700',
      items: ['Contratos', 'Documentos de clientes', 'Expedientes']
    },
    {
      nombre: 'Cálculos',
      descripcion: 'Herramientas de cálculo',
      icon: CalculatorIcon,
      color: 'from-yellow-500 to-yellow-700',
      items: ['Calculadora de intereses', 'Amortizaciones', 'Tablas de pago']
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
          <PresentationChartLineIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Módulo de Operaciones
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestión de formularios, reportes y operaciones diarias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modulos.map((modulo, index) => {
          const Icon = modulo.icon;
          
          return (
            <motion.div
              key={modulo.nombre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl shadow-xl border ${
                theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${modulo.color}`} />
              
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${modulo.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {modulo.nombre}
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {modulo.descripcion}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mt-4">
                  {modulo.items.map((item, i) => (
                    <li
                      key={i}
                      className={`flex items-center space-x-2 p-2 rounded-lg ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors cursor-pointer`}
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${modulo.color}`} />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <button className={`mt-6 w-full py-2 px-4 rounded-lg bg-gradient-to-r ${modulo.color} text-white font-medium hover:shadow-lg transition-all`}>
                  Acceder al módulo
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Operaciones;