import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <span className="error-icon">😕</span>
            <h2>Algo deu errado</h2>
            <p>Ocorreu um erro inesperado. Por favor, tente novamente.</p>
            <button 
              onClick={this.handleRetry} 
              className="btn-primary"
            >
              Tentar novamente
            </button>
          </div>
          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 300px;
              padding: 40px;
            }
            .error-boundary-content {
              text-align: center;
              max-width: 400px;
            }
            .error-icon {
              font-size: 4rem;
              display: block;
              margin-bottom: 20px;
            }
            .error-boundary h2 {
              margin: 0 0 10px;
              color: #374151;
            }
            .error-boundary p {
              color: #6b7280;
              margin: 0 0 20px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
