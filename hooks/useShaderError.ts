import { useEffect, useState } from 'react';
import * as THREE from 'three';

interface ShaderErrorInfo {
  hasError: boolean;
  error: string | null;
  type: 'vertex' | 'fragment' | null;
}

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

// Helper to create shader material with error handling
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