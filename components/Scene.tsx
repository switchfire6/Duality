
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import type { PhysicsParams, Particle } from '../types';
import { waveFieldVertexShader, waveFieldFragmentShader } from '../shaders/WaveFieldShader';
import { detectionScreenVertexShader, detectionScreenFragmentShader } from '../shaders/DetectionScreenShader';

// --- 3D Components ---

const WaveField: React.FC<{ params: PhysicsParams; simulationTime: number }> = ({ params, simulationTime }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uWavelength: { value: params.wavelength },
    uSlitSeparation: { value: params.slitSeparation },
    uAmplitude: { value: params.amplitude },
    uSlitWidth: { value: params.slitWidth },
    uWaveSpeed: { value: params.waveSpeed },
  }), []);
  
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
        key={waveFieldVertexShader + waveFieldFragmentShader}
        vertexShader={waveFieldVertexShader}
        fragmentShader={waveFieldFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const DetectionScreen: React.FC<{ params: PhysicsParams }> = ({ params }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const PLANE_WIDTH_Z = 12;
  const PLANE_HEIGHT_Y = 2;

  const uniforms = useMemo(() => ({
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

const Barrier: React.FC<{ slitSeparation: number; slitWidth: number }> = ({ slitSeparation, slitWidth }) => {
  const barrierThickness = 0.2;
  const barrierHeight = 2;
  const totalWidth = 12; // Total width along Z axis

  const centerPieceWidth = slitSeparation - slitWidth;
  const sidePieceCenterZ = (slitSeparation + slitWidth) / 2.0;

  return (
    <group position={[0, 0, 0]}>
      {/* Center piece between the slits */}
      {centerPieceWidth > 0.001 && 
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[barrierThickness, barrierHeight, centerPieceWidth]} />
          <meshStandardMaterial color="#333333" roughness={0.7} />
        </mesh>
      }
      {/* Outer pieces of the barrier */}
      <mesh position={[0, 0, sidePieceCenterZ + totalWidth / 2.0]}>
        <boxGeometry args={[barrierThickness, barrierHeight, totalWidth]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, -sidePieceCenterZ - totalWidth / 2.0]}>
        <boxGeometry args={[barrierThickness, barrierHeight, totalWidth]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
    </group>
  );
};

const Laser: React.FC = () => (
  // Group is rotated so its local Y axis points along the world X axis
  <group position={[-3.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
    <mesh>
      <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
      <meshStandardMaterial color="#c00000" emissive="#500000" roughness={0.3} metalness={0.8} />
    </mesh>
    <mesh position={[0, 2, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 3, 16]} />
      <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} transparent opacity={0.5} />
    </mesh>
  </group>
);

const FringeMarkers: React.FC<{ params: PhysicsParams }> = ({ params }) => {
  const markers = useMemo(() => {
    const { wavelength, slitSeparation, screenDistance } = params;
    if (slitSeparation <= 0) return [];
    
    const fringeSpacing = (wavelength * screenDistance) / slitSeparation;
    const numMarkers = 10;
    const markerPositions = [];
    for (let i = -numMarkers; i <= numMarkers; i++) {
        markerPositions.push(
            <mesh key={i} position={[screenDistance + 0.1, 0, i * fringeSpacing]}>
                <boxGeometry args={[0.05, 1, 0.05]} />
                <meshBasicMaterial color="green" transparent opacity={0.7} />
            </mesh>
        );
    }
    return markerPositions;
  }, [params.wavelength, params.slitSeparation, params.screenDistance]);

  return <group>{markers}</group>;
};

const Particles: React.FC<{ particles: Particle[] }> = ({ particles }) => {
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particles.length * 3);
    particles.forEach((p, i) => {
      positions[i * 3] = p.position[0];
      positions[i * 3 + 1] = p.position[1];
      positions[i * 3 + 2] = p.position[2];
    });
    return positions;
  }, [particles]);

  if (particles.length === 0) return null;

  return (
    <points>
      <bufferGeometry key={particles.length}>
        <bufferAttribute
          attach="attributes-position"
          array={particlePositions}
          count={particles.length}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="yellow" size={0.1} sizeAttenuation />
    </points>
  );
};


interface SceneComponentProps {
  params: PhysicsParams;
  particles: Particle[];
  simulationTime: number;
}

const SceneComponent: React.FC<SceneComponentProps> = ({ params, particles, simulationTime }) => {
  return (
    <Canvas camera={{ position: [-7, 4, 0], fov: 60 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 0]} intensity={1.0} />
      
      {params.showWaves && <WaveField params={params} simulationTime={simulationTime} />}
      
      <Barrier slitSeparation={params.slitSeparation} slitWidth={params.slitWidth} />
      
      <DetectionScreen params={params} />

      <FringeMarkers params={params} />

      {params.particleMode && <Particles particles={particles} />}

      <Laser />

      <Grid
        position={[params.screenDistance / 2, -1.1, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={1}
        cellColor={new THREE.Color('#666666')}
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor={new THREE.Color('#aaaaaa')}
        fadeDistance={40}
        infiniteGrid
      />
      <OrbitControls makeDefault enablePan={true} />
    </Canvas>
  );
};

export default SceneComponent;
