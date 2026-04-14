import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ERROR BOUNDARY CAUGHT:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Error</h1>
            <p className="text-gray-700 mb-4">{this.state.error?.message || 'Error desconocido'}</p>
            <details className="mb-4 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-48">
              <summary className="cursor-pointer font-semibold mb-2">Ver stack trace</summary>
              <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
            </details>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
