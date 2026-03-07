import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-black">
          <div className="text-center text-white p-8">
            <h1 className="text-4xl font-bold mb-4">¡Algo salió mal!</h1>
            <p className="text-xl mb-8">Ha ocurrido un error inesperado</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;