import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'webgl' | 'shader' | 'general' | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Determine error type based on error message
    let errorType: State['errorType'] = 'general';
    
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes('webgl') || errorMessage.includes('context') || errorMessage.includes('gl')) {
      errorType = 'webgl';
    } else if (errorMessage.includes('shader') || errorMessage.includes('glsl')) {
      errorType = 'shader';
    }

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="flex items-center mb-6">
              <svg className="w-12 h-12 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl font-bold">Simulation Error</h1>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-red-400">
                {this.state.errorType === 'webgl' && 'WebGL Error'}
                {this.state.errorType === 'shader' && 'Shader Compilation Error'}
                {this.state.errorType === 'general' && 'Application Error'}
              </h2>
              
              <p className="text-gray-300 mb-4">
                {this.state.errorType === 'webgl' && 
                  'There was an issue with WebGL rendering. This might be due to browser compatibility or GPU limitations.'}
                {this.state.errorType === 'shader' && 
                  'The shader failed to compile. This could be due to GPU compatibility issues.'}
                {this.state.errorType === 'general' && 
                  'An unexpected error occurred in the simulation.'}
              </p>

              {this.state.error && (
                <div className="bg-gray-900 rounded p-4 mb-4">
                  <p className="text-sm font-mono text-red-300">{this.state.error.message}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Troubleshooting Steps:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {this.state.errorType === 'webgl' && (
                  <>
                    <li>Ensure your browser supports WebGL 2.0</li>
                    <li>Try updating your graphics drivers</li>
                    <li>Check if hardware acceleration is enabled in your browser</li>
                    <li>Try using a different browser (Chrome, Firefox, or Edge recommended)</li>
                  </>
                )}
                {this.state.errorType === 'shader' && (
                  <>
                    <li>Try refreshing the page</li>
                    <li>Ensure your GPU supports the required shader features</li>
                    <li>Update your graphics drivers to the latest version</li>
                  </>
                )}
                {this.state.errorType === 'general' && (
                  <>
                    <li>Try refreshing the page</li>
                    <li>Clear your browser cache</li>
                    <li>Check the browser console for more details</li>
                  </>
                )}
              </ul>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                  Developer Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-900 p-4 rounded overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;