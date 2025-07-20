import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface SceneErrorBoundaryProps {
  children: React.ReactNode;
}

const SceneErrorFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
      <div className="text-center p-8">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">3D Rendering Error</h2>
        <p className="text-gray-300 mb-4">
          Unable to render the 3D simulation. This might be due to:
        </p>
        <ul className="text-left text-gray-400 text-sm space-y-1 max-w-xs mx-auto">
          <li>• GPU memory limitations</li>
          <li>• Shader compilation issues</li>
          <li>• WebGL context loss</li>
          <li>• Browser compatibility</li>
        </ul>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
        >
          Reload Simulation
        </button>
      </div>
    </div>
  );
};

const SceneErrorBoundary: React.FC<SceneErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<SceneErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
};

export default SceneErrorBoundary;