
import React from 'react';
import DoubleSlitExperiment from './components/DoubleSlitExperiment';
import ErrorBoundary from './components/ErrorBoundary';
import WebGLCheck from './components/WebGLCheck';

function App() {
  return (
    <ErrorBoundary>
      <WebGLCheck>
        <div className="w-screen h-screen bg-gray-900 text-white">
          <main id="main-content" className="h-full">
            <DoubleSlitExperiment />
          </main>
        </div>
      </WebGLCheck>
    </ErrorBoundary>
  );
}

export default App;
