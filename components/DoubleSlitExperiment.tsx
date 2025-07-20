import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PhysicsParams, Particle } from '../types';
import ControlPanel from './ControlPanel';
import SceneComponent from './Scene';

const getInterferenceIntensity = (posOnScreen: number, params: PhysicsParams): number => {
  const { wavelength, slitSeparation, screenDistance, slitWidth } = params;
  const k = (2 * Math.PI) / wavelength;
  const D = screenDistance;
  const d = slitSeparation;
  const w = slitWidth;

  if (D <= 0 || wavelength <= 0) return 0;

  // With a horizontal layout, the position on screen is along the Z axis
  const z = posOnScreen;

  // Interference term from two slits
  const pathDiff = (d * z) / D;
  const phi = k * pathDiff;
  const interference = Math.pow(Math.cos(phi / 2.0), 2.0);

  // Diffraction envelope from single slit
  const beta = (k * w * z) / D;
  // Handle beta = 0 case to avoid division by zero
  const sinc_beta_half = beta === 0.0 ? 1.0 : Math.sin(beta / 2.0) / (beta / 2.0);
  const diffraction = Math.pow(sinc_beta_half, 2.0);

  return interference * diffraction;
};

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

  const [allParticles, setAllParticles] = useState<Particle[]>([]);
  const [visibleParticles, setVisibleParticles] = useState<Particle[]>([]);
  const [simulationTime, setSimulationTime] = useState(0);

  const timeRef = useRef({ simTime: 0, lastTimestamp: 0 });

  const generateParticles = useCallback(() => {
    // Reset simulation time when generating a new particle set
    setSimulationTime(0);
    timeRef.current = { simTime: 0, lastTimestamp: 0 };
    
    const newParticles: Particle[] = [];
    const numParticles = 500;
    const screenWidth = 12; // Corresponds to detection screen width on Z axis
    let attempts = 0;
    const maxAttempts = numParticles * 200;

    // Total duration for all particles to appear, in seconds of simulation time
    const totalDuration = numParticles / params.particleRate;

    while (newParticles.length < numParticles && attempts < maxAttempts) {
      const z = (Math.random() - 0.5) * screenWidth;
      const probability = getInterferenceIntensity(z, params);
      
      if (Math.random() < probability) {
        newParticles.push({
          position: [params.screenDistance, 0, z], // Particles are on the XZ plane
          startTime: Math.random() * totalDuration, // Stagger appearance over the calculated duration
        });
      }
      attempts++;
    }
    setAllParticles(newParticles);
    setVisibleParticles([]);
  }, [params]);

  // Effect to generate new particles when mode or relevant physics params change
  useEffect(() => {
    if (params.particleMode) {
      generateParticles();
    } else {
      setAllParticles([]);
      setVisibleParticles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.particleMode, params.wavelength, params.slitSeparation, params.slitWidth, params.screenDistance, params.particleRate]);

  // Main animation loop to update simulation time
  useEffect(() => {
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (params.isPaused) {
        // Reset timestamp to avoid large jump when unpausing
        timeRef.current.lastTimestamp = 0;
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (timeRef.current.lastTimestamp === 0) {
        timeRef.current.lastTimestamp = timestamp;
      }
      
      const delta = (timestamp - timeRef.current.lastTimestamp) / 1000.0; // seconds
      timeRef.current.lastTimestamp = timestamp;

      const newSimTime = timeRef.current.simTime + delta * params.timeScale;
      timeRef.current.simTime = newSimTime;
      setSimulationTime(newSimTime); // Trigger re-render for consumers

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [params.isPaused, params.timeScale]);

  // Effect for staggered appearance of particles, reacting to simulationTime changes
  useEffect(() => {
    if (params.particleMode) {
      const shouldBeVisible = allParticles.filter(p => p.startTime <= simulationTime);
      if (shouldBeVisible.length > visibleParticles.length) {
        setVisibleParticles(shouldBeVisible);
      }
    }
  }, [simulationTime, params.particleMode, allParticles, visibleParticles.length]);

  const handleReset = useCallback(() => {
    if (params.particleMode) {
      generateParticles();
    } else {
      // If not in particle mode, just reset the simulation time for the waves
      setSimulationTime(0);
      timeRef.current = { simTime: 0, lastTimestamp: 0 };
      // Also clear any straggling particles
      setAllParticles([]);
      setVisibleParticles([]);
    }
  }, [params.particleMode, generateParticles]);


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