import React, { createContext, useState, useContext, useCallback } from 'react';
import ErrorMessage from '../components/UI/ErrorMessage';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError debe ser usado dentro de un ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((message, type = 'error', autoClose = true, duration = 5000) => {
    const id = Date.now().toString();
    const error = { id, message, type, autoClose, duration };
    
    setErrors(prev => [...prev, error]);
    
    if (autoClose) {
      setTimeout(() => {
        removeError(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeError = useCallback((id) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const showSuccess = useCallback((message, autoClose = true, duration = 3000) => {
    return addError(message, 'success', autoClose, duration);
  }, [addError]);

  const showError = useCallback((message, autoClose = true, duration = 5000) => {
    return addError(message, 'error', autoClose, duration);
  }, [addError]);

  const showWarning = useCallback((message, autoClose = true, duration = 4000) => {
    return addError(message, 'warning', autoClose, duration);
  }, [addError]);

  const showInfo = useCallback((message, autoClose = true, duration = 4000) => {
    return addError(message, 'info', autoClose, duration);
  }, [addError]);

  const value = {
    errors,
    addError,
    removeError,
    clearErrors,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      
      {/* Error Container - Aparece en la esquina superior derecha */}
      {errors.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {errors.map((error) => (
            <ErrorMessage
              key={error.id}
              type={error.type}
              message={error.message}
              onClose={() => removeError(error.id)}
              autoClose={error.autoClose}
              duration={error.duration}
            />
          ))}
        </div>
      )}
    </ErrorContext.Provider>
  );
};