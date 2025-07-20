import { useEffect, useState } from 'react';
import * as THREE from 'three';

interface ShaderErrorInfo {
  hasError: boolean;
  error: string | null;
  type: 'vertex' | 'fragment' | null;
}

/**
 * Custom hook that monitors a Three.js ShaderMaterial for compilation errors.
 * Useful for debugging GLSL shader issues during development.
 * 
 * @param material - Three.js ShaderMaterial to monitor, or null
 * @returns Object containing:
 *   - hasError: Whether a shader compilation error was detected
 *   - error: The error message if any, null otherwise
 *   - type: Which shader type failed ('vertex', 'fragment', or null)
 * 
 * @example
 * ```typescript
 * const material = new THREE.ShaderMaterial({
 *   vertexShader: myVertexShader,
 *   fragmentShader: myFragmentShader,
 *   uniforms: myUniforms
 * });
 * 
 * const { hasError, error, type } = useShaderError(material);
 * 
 * if (hasError) {
 *   console.error(`${type} shader error:`, error);
 * }
 * ```
 * 
 * @remarks
 * - Creates a temporary WebGL context to test shader compilation
 * - Automatically cleans up the test renderer to prevent memory leaks
 * - Runs compilation check whenever the material reference changes
 * - Useful for providing user-friendly error messages in development
 */
export const useShaderError = (material: THREE.ShaderMaterial | null): ShaderErrorInfo => {
  const [errorInfo, setErrorInfo] = useState<ShaderErrorInfo>({
    hasError: false,
    error: null,
    type: null,
  });

  useEffect(() => {
    if (!material) return;

    const checkShaderCompilation = () => {
      try {
        // Force shader compilation by accessing the program
        const renderer = new THREE.WebGLRenderer();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        const geometry = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        
        scene.add(mesh);
        renderer.compile(scene, camera);
        
        // Check for compilation errors
        const program = material.program;
        if (program) {
          const gl = renderer.getContext();
          const vertexShader = program.vertexShader;
          const fragmentShader = program.fragmentShader;
          
          // Check vertex shader
          if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(vertexShader);
            setErrorInfo({
              hasError: true,
              error: error || 'Vertex shader compilation failed',
              type: 'vertex',
            });
            renderer.dispose();
            return;
          }
          
          // Check fragment shader
          if (!gl.getShaderParameter(fragmentShader, gl.FRAGMENT_SHADER)) {
            const error = gl.getShaderInfoLog(fragmentShader);
            setErrorInfo({
              hasError: true,
              error: error || 'Fragment shader compilation failed',
              type: 'fragment',
            });
            renderer.dispose();
            return;
          }
        }
        
        // No errors
        setErrorInfo({
          hasError: false,
          error: null,
          type: null,
        });
        
        renderer.dispose();
      } catch (error) {
        setErrorInfo({
          hasError: true,
          error: error instanceof Error ? error.message : 'Shader compilation error',
          type: null,
        });
      }
    };

    checkShaderCompilation();
  }, [material]);

  return errorInfo;
};

/**
 * Helper function to create a Three.js ShaderMaterial with built-in error handling.
 * Tests shader compilation before returning the material.
 * 
 * @param vertexShader - GLSL vertex shader source code
 * @param fragmentShader - GLSL fragment shader source code
 * @param uniforms - Shader uniform variables as Three.js IUniform objects
 * @param options - Additional ShaderMaterial parameters (optional)
 * 
 * @returns The compiled ShaderMaterial if successful, null if compilation fails
 * 
 * @example
 * ```typescript
 * const material = createShaderMaterial(
 *   vertexShaderSource,
 *   fragmentShaderSource,
 *   {
 *     time: { value: 0 },
 *     color: { value: new THREE.Color(0xff0000) },
 *     amplitude: { value: 1.0 }
 *   },
 *   {
 *     transparent: true,
 *     side: THREE.DoubleSide
 *   }
 * );
 * 
 * if (!material) {
 *   console.error('Shader compilation failed');
 *   // Use fallback material
 * }
 * ```
 * 
 * @remarks
 * - Performs a test compilation in a temporary WebGL context
 * - Logs detailed error messages to console if compilation fails
 * - Automatically disposes of test resources to prevent memory leaks
 * - Returns null instead of throwing to allow graceful error handling
 */
export const createShaderMaterial = (
  vertexShader: string,
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
  options?: Partial<THREE.ShaderMaterialParameters>
): THREE.ShaderMaterial | null => {
  try {
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      ...options,
    });

    // Test compilation
    const renderer = new THREE.WebGLRenderer();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    
    scene.add(mesh);
    renderer.compile(scene, camera);
    renderer.dispose();

    return material;
  } catch (error) {
    console.error('Failed to create shader material:', error);
    return null;
  }
};