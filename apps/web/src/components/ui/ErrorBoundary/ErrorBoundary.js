'use client';

import React from 'react';
import styles from './ErrorBoundary.module.css';
import { clsx } from 'clsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      errorId: Date.now().toString(36) 
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Integrate with error monitoring service (e.g., Sentry, LogRocket)
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        errorId: this.state.errorId
      };

      // Example: Send to monitoring service
      // window.gtag && window.gtag('event', 'exception', errorData);
      
      console.error('Error logged:', errorData);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Custom fallback component
      if (this.props.FallbackComponent) {
        const FallbackComponent = this.props.FallbackComponent;
        return (
          <FallbackComponent 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
          />
        );
      }

      // Default fallback UI
      return (
        <div className={clsx(styles.errorBoundary, this.props.className)}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            
            <div className={styles.errorContent}>
              <h2 className={styles.errorTitle}>
                {this.props.title || 'Oops! Algo deu errado'}
              </h2>
              
              <p className={styles.errorMessage}>
                {this.props.message || 
                 'Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.'
                }
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className={styles.errorDetails}>
                  <summary>Detalhes do erro (desenvolvimento)</summary>
                  <pre className={styles.errorStack}>
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className={styles.errorActions}>
                <button 
                  onClick={this.handleRetry}
                  className={styles.retryButton}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M13.83 5A9 9 0 0 1 22 13a9 9 0 0 1-9 9 9 9 0 0 1-9-9A9 9 0 0 1 13.83 5z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Tentar novamente
                </button>
                
                <button 
                  onClick={this.handleReload}
                  className={styles.reloadButton}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Recarregar página
                </button>
              </div>

              {this.state.errorId && (
                <p className={styles.errorId}>
                  ID do erro: {this.state.errorId}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for functional components
export function withErrorBoundary(Component, errorBoundaryConfig = {}) {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}

// Specialized error boundaries for different contexts
export function PageErrorBoundary({ children, ...props }) {
  return (
    <ErrorBoundary
      title="Erro na página"
      message="Não foi possível carregar esta página. Tente recarregar ou volte mais tarde."
      className={styles.pageError}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children, componentName, ...props }) {
  return (
    <ErrorBoundary
      title="Erro no componente"
      message={`O componente ${componentName || 'solicitado'} encontrou um erro e não pôde ser exibido.`}
      className={styles.componentError}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
}

export function AsyncErrorBoundary({ children, ...props }) {
  return (
    <ErrorBoundary
      title="Erro de carregamento"
      message="Houve um problema ao carregar os dados. Verifique sua conexão e tente novamente."
      className={styles.asyncError}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;