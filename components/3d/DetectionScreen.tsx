import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { DetectionScreenProps, DetectionScreenUniforms } from '../../types/interfaces';
import { detectionScreenVertexShader, detectionScreenFragmentShader } from '../../shaders/DetectionScreenShader';

const DetectionScreen: React.FC<DetectionScreenProps> = ({ params }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const PLANE_WIDTH_Z = 12;
  const PLANE_HEIGHT_Y = 2;

  const uniforms = useMemo<DetectionScreenUniforms>(() => ({
    uWavelength: { value: params.wavelength },
    uSlitSeparation: { value: params.slitSeparation },
    uScreenDistance: { value: params.screenDistance },
    uSlitWidth: { value: params.slitWidth },
    uMaxWidth: { value: PLANE_WIDTH_Z },
  }), []); 

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uWavelength.value = params.wavelength;
      materialRef.current.uniforms.uSlitSeparation.value = params.slitSeparation;
      materialRef.current.uniforms.uScreenDistance.value = params.screenDistance;
      materialRef.current.uniforms.uSlitWidth.value = params.slitWidth;
    }
  }, [params.wavelength, params.slitSeparation, params.screenDistance, params.slitWidth]);

  return (
    // Rotated to be a vertical plane in the YZ plane
    <mesh position={[params.screenDistance, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[PLANE_WIDTH_Z, PLANE_HEIGHT_Y, 200, 1]} />
      <shaderMaterial
        ref={materialRef}
        key={detectionScreenVertexShader + detectionScreenFragmentShader}
        vertexShader={detectionScreenVertexShader}
        fragmentShader={detectionScreenFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default DetectionScreen;