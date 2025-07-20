import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

interface ContextLossHandlers {
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export const useWebGLContextLoss = (handlers?: ContextLossHandlers) => {
  const { gl } = useThree();
  const handlersRef = useRef(handlers);
  
  // Update handlers ref
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!gl) return;

    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
      
      if (handlersRef.current?.onContextLost) {
        handlersRef.current.onContextLost();
      }
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      
      if (handlersRef.current?.onContextRestored) {
        handlersRef.current.onContextRestored();
      }
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    // Force context loss for testing (uncomment if needed)
    // const debugInfo = gl.getExtension('WEBGL_lose_context');
    // if (debugInfo) {
    //   setTimeout(() => {
    //     debugInfo.loseContext();
    //     setTimeout(() => {
    //       debugInfo.restoreContext();
    //     }, 3000);
    //   }, 5000);
    // }

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);
};

// Hook to monitor WebGL memory usage
export const useWebGLMemoryMonitor = () => {
  const { gl } = useThree();

  useEffect(() => {
    if (!gl) return;

    const checkMemory = () => {
      // Get memory info if available
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        console.log('WebGL Renderer:', vendor, renderer);
      }

      // Check for memory pressure
      const memoryInfo = (gl as any).memory;
      if (memoryInfo) {
        console.log('WebGL Memory:', {
          geometries: memoryInfo.geometries,
          textures: memoryInfo.textures,
          programs: memoryInfo.programs,
        });
      }
    };

    // Check memory periodically in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(checkMemory, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [gl]);
};