import React, { useState, useCallback } from 'react';
import type { PhysicsParams } from '../types/interfaces';
import ControlPanel from './ControlPanel';
import SceneComponent from './Scene';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { useParticleSystem } from '../hooks/useParticleSystem';


const DoubleSlitExperiment: React.FC = () => {
  const [params, setParams] = useState<PhysicsParams>({
    wavelength: 0.5,
    slitSeparation: 2.0,
    slitWidth: 0.3,
    screenDistance: 10.0,
    amplitude: 0.5,
    showWaves: true,
    particleMode: false,
    isPaused: false,
    waveSpeed: 2.0,
    particleRate: 100,
    timeScale: 1.0,
  });

  // Use the custom animation hook
  const { simulationTime, resetTime } = useAnimationLoop({
    isPaused: params.isPaused,
    timeScale: params.timeScale,
  });

  // Use the particle system hook
  const { visibleParticles, generateParticles, resetParticles } = useParticleSystem(params, simulationTime);

  const handleReset = useCallback(() => {
    resetTime();
    if (params.particleMode) {
      generateParticles();
    } else {
      // If not in particle mode, also clear any straggling particles
      resetParticles();
    }
  }, [params.particleMode, generateParticles, resetParticles, resetTime]);


  return (
    <div className="flex w-full h-screen bg-gray-800">
      <div className="flex-1 h-full relative">
        <SceneComponent params={params} particles={visibleParticles} simulationTime={simulationTime} />
      </div>
      <ControlPanel params={params} setParams={setParams} onReset={handleReset} />
    </div>
  );
};

export default DoubleSlitExperiment;