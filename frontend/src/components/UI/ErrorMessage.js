import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ 
  type = 'error', 
  message, 
  onClose, 
  autoClose = false,
  duration = 5000 
}) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!visible) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: 'text-green-400',
          button: 'text-green-500 hover:bg-green-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-400',
          button: 'text-yellow-500 hover:bg-yellow-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-400',
          button: 'text-blue-500 hover:bg-blue-100'
        };
      default: // error
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-400',
          button: 'text-red-500 hover:bg-red-100'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'warning':
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
  };

  const styles = getStyles();

  return (
    <div className={`rounded-lg border p-4 mb-4 ${styles.bg}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => {
                  setVisible(false);
                  onClose();
                }}
                className={`inline-flex rounded-md p-1.5 ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type}-50 focus:ring-${type}-600`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;