import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

interface ContextLossHandlers {
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

/**
 * Custom hook that monitors and handles WebGL context loss/restoration events.
 * Provides callbacks for gracefully handling GPU crashes or context resets.
 * 
 * @param handlers - Optional callback functions:
 *   - onContextLost: Called when WebGL context is lost
 *   - onContextRestored: Called when WebGL context is restored
 * 
 * @example
 * ```typescript
 * function MyScene() {
 *   const [needsReset, setNeedsReset] = useState(false);
 *   
 *   useWebGLContextLoss({
 *     onContextLost: () => {
 *       console.warn('WebGL context lost - saving state...');
 *       setNeedsReset(true);
 *     },
 *     onContextRestored: () => {
 *       console.log('WebGL context restored - reinitializing...');
 *       // Recreate textures, buffers, etc.
 *       setNeedsReset(false);
 *     }
 *   });
 * 
 *   if (needsReset) {
 *     return <div>Graphics context lost. Attempting recovery...</div>;
 *   }
 * 
 *   return <Canvas>...</Canvas>;
 * }
 * ```
 * 
 * @remarks
 * - Automatically prevents default browser behavior on context loss
 * - Handlers are stored in refs to avoid re-registering listeners
 * - Includes commented debug code to force context loss for testing
 * - Essential for production apps to handle GPU driver crashes gracefully
 */
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

/**
 * Development hook that monitors WebGL memory usage and renderer information.
 * Logs GPU details and memory statistics periodically in development mode.
 * 
 * @example
 * ```typescript
 * function MyApp() {
 *   // Only runs in development mode
 *   useWebGLMemoryMonitor();
 *   
 *   return <Canvas>...</Canvas>;
 * }
 * ```
 * 
 * @remarks
 * - Only active in development mode (NODE_ENV === 'development')
 * - Logs GPU vendor and renderer info on mount
 * - Logs memory usage (geometries, textures, programs) every 30 seconds
 * - Useful for detecting memory leaks during development
 * - Automatically cleans up interval on unmount
 * 
 * Memory info includes:
 * - Number of geometries in memory
 * - Number of textures in memory
 * - Number of shader programs compiled
 */
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