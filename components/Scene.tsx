
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneComponentProps } from '../types/interfaces';
import WaveField from './3d/WaveField';
import DetectionScreen from './3d/DetectionScreen';
import Barrier from './3d/Barrier';
import FringeMarkers from './3d/FringeMarkers';
import Laser from './3d/Laser';
import Particles from './3d/Particles';

const SceneComponent: React.FC<SceneComponentProps> = ({ params, particles, simulationTime }) => {
  return (
    <Canvas 
      camera={{ position: [-7, 4, 0], fov: 60 }}
      gl={{ preserveDrawingBuffer: true }}
      aria-label="3D visualization canvas"
    >
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
        cellColor={useMemo(() => new THREE.Color('#666666'), [])}
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor={useMemo(() => new THREE.Color('#aaaaaa'), [])}
        fadeDistance={40}
        infiniteGrid
      />
      <OrbitControls makeDefault enablePan={true} />
    </Canvas>
  );
};

export default SceneComponent;
