import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { WaveFieldProps, WaveFieldUniforms } from '../../types/interfaces';
import { waveFieldVertexShader, waveFieldFragmentShader } from '../../shaders/WaveFieldShader';

const WaveField: React.FC<WaveFieldProps> = ({ params, simulationTime }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Memoize shader key to prevent unnecessary re-renders
  const shaderKey = useMemo(() => waveFieldVertexShader + waveFieldFragmentShader, []);

  const uniforms = useMemo<WaveFieldUniforms>(() => ({
    uTime: { value: 0.0 },
    uWavelength: { value: params.wavelength },
    uSlitSeparation: { value: params.slitSeparation },
    uAmplitude: { value: params.amplitude },
    uSlitWidth: { value: params.slitWidth },
    uWaveSpeed: { value: params.waveSpeed },
  }), []); // Empty deps is correct - we update values via refs in useEffect
  
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uWavelength.value = params.wavelength;
      materialRef.current.uniforms.uSlitSeparation.value = params.slitSeparation;
      materialRef.current.uniforms.uAmplitude.value = params.amplitude;
      materialRef.current.uniforms.uSlitWidth.value = params.slitWidth;
      materialRef.current.uniforms.uWaveSpeed.value = params.waveSpeed;
    }
  }, [params.wavelength, params.slitSeparation, params.amplitude, params.slitWidth, params.waveSpeed]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = simulationTime;
    }
  }, [simulationTime]);

  return (
    // Positioned so that x=0 in local coords corresponds to x=0 in world coords
    <mesh position={[7.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Rotated to lie on the XZ plane */}
      <planeGeometry args={[15, 12, 200, 200]} />
      <shaderMaterial
        ref={materialRef}
        key={shaderKey}
        vertexShader={waveFieldVertexShader}
        fragmentShader={waveFieldFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default WaveField;