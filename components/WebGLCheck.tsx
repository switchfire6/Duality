import React, { useEffect, useState } from 'react';

interface WebGLCheckProps {
  children: React.ReactNode;
}

interface WebGLStatus {
  isSupported: boolean;
  version: 1 | 2 | null;
  error: string | null;
}

const WebGLCheck: React.FC<WebGLCheckProps> = ({ children }) => {
  const [webglStatus, setWebglStatus] = useState<WebGLStatus | null>(null);

  useEffect(() => {
    const checkWebGLSupport = (): WebGLStatus => {
      try {
        const canvas = document.createElement('canvas');
        
        // Check for WebGL 2 (preferred)
        const gl2 = canvas.getContext('webgl2');
        if (gl2) {
          return { isSupported: true, version: 2, error: null };
        }

        // Fall back to WebGL 1
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          return { isSupported: true, version: 1, error: null };
        }

        return {
          isSupported: false,
          version: null,
          error: 'WebGL is not supported in your browser',
        };
      } catch (e) {
        return {
          isSupported: false,
          version: null,
          error: `Error checking WebGL support: ${e instanceof Error ? e.message : 'Unknown error'}`,
        };
      }
    };

    setWebglStatus(checkWebGLSupport());
  }, []);

  // Still checking
  if (!webglStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Checking WebGL support...</p>
        </div>
      </div>
    );
  }

  // WebGL not supported
  if (!webglStatus.isSupported) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex items-center mb-6">
            <svg className="w-12 h-12 text-yellow-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold">WebGL Not Supported</h1>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              This physics simulation requires WebGL to render 3D graphics in your browser.
              Unfortunately, your current browser or device doesn't support WebGL.
            </p>
            {webglStatus.error && (
              <div className="bg-gray-900 rounded p-4">
                <p className="text-sm text-red-400">{webglStatus.error}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">To view this simulation, you can:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Use a modern browser like Chrome, Firefox, Edge, or Safari</li>
              <li>Enable hardware acceleration in your browser settings</li>
              <li>Update your browser to the latest version</li>
              <li>Check if your graphics drivers are up to date</li>
              <li>Try on a different device with better graphics support</li>
            </ul>
          </div>

          <div className="mt-6 bg-blue-900 bg-opacity-30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Browser Compatibility</h4>
            <p className="text-sm text-gray-300">
              For the best experience, we recommend using:
            </p>
            <ul className="text-sm text-gray-300 mt-2 space-y-1">
              <li>• Chrome 56+ or Firefox 51+</li>
              <li>• Safari 15+ on macOS</li>
              <li>• Edge 79+</li>
            </ul>
          </div>

          <div className="mt-6">
            <a 
              href="https://get.webgl.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Learn More About WebGL
            </a>
          </div>
        </div>
      </div>
    );
  }

  // WebGL 1 warning (but still allow)
  if (webglStatus.version === 1) {
    console.warn('WebGL 2 not available, falling back to WebGL 1. Some features may be limited.');
  }

  return <>{children}</>;
};

export default WebGLCheck;