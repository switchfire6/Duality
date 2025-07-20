import { useState, useCallback, useEffect, useRef } from 'react';
import type { PhysicsParams, Particle, ParticleGenerationConfig } from '../types/interfaces';

interface ParticleSystemState {
  allParticles: Particle[];
  visibleParticles: Particle[];
  simulationTime: number;
}

interface ParticleSystemActions {
  generateParticles: () => void;
  resetParticles: () => void;
}

interface UseParticleSystemReturn extends ParticleSystemState, ParticleSystemActions {}

/**
 * Example usage:
 * 
 * ```typescript
 * // Basic usage (particles appear at detection screen)
 * const { visibleParticles, generateParticles, resetParticles } = useParticleSystem(params, simulationTime);
 * 
 * // With particle motion (particles travel from source to screen)
 * const { visibleParticles, movingParticles, generateParticles } = useParticleSystemWithMotion(params, simulationTime);
 * 
 * // Render both static particles on screen and moving particles
 * <Particles particles={[...visibleParticles, ...movingParticles]} />
 * ```
 */

/**
 * Calculates the interference intensity at a given position on the detection screen
 * using the double-slit interference formula with diffraction envelope
 */
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

/**
 * Custom hook for managing the particle system in the double-slit experiment
 * 
 * @param params - Physics parameters for the simulation
 * @param simulationTime - Current simulation time
 * @returns Particle system state and actions
 */
export function useParticleSystem(
  params: PhysicsParams,
  simulationTime: number
): UseParticleSystemReturn {
  const [allParticles, setAllParticles] = useState<Particle[]>([]);
  const [visibleParticles, setVisibleParticles] = useState<Particle[]>([]);
  const [internalSimTime, setInternalSimTime] = useState(0);
  
  // Track if we're managing our own simulation time
  const isUsingExternalTime = simulationTime !== undefined;

  /**
   * Generates a new set of particles with positions statistically distributed
   * according to the interference pattern
   */
  const generateParticles = useCallback(() => {
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

  /**
   * Resets the particle system
   */
  const resetParticles = useCallback(() => {
    setAllParticles([]);
    setVisibleParticles([]);
    setInternalSimTime(0);
  }, []);

  // Effect to generate new particles when particle mode is activated or physics params change
  useEffect(() => {
    if (params.particleMode) {
      generateParticles();
    } else {
      resetParticles();
    }
  }, [
    params.particleMode,
    params.wavelength,
    params.slitSeparation,
    params.slitWidth,
    params.screenDistance,
    params.particleRate,
    generateParticles,
    resetParticles
  ]);

  // Effect for staggered appearance of particles based on simulation time
  useEffect(() => {
    if (!params.particleMode) return;

    const currentTime = isUsingExternalTime ? simulationTime : internalSimTime;
    const shouldBeVisible = allParticles.filter(p => p.startTime <= currentTime);
    
    if (shouldBeVisible.length > visibleParticles.length) {
      setVisibleParticles(shouldBeVisible);
    }
  }, [
    simulationTime,
    internalSimTime,
    params.particleMode,
    allParticles,
    visibleParticles.length,
    isUsingExternalTime
  ]);

  // Optional: Update particle positions based on physics (if particles move over time)
  // Currently particles are static once placed on the detection screen
  // This could be extended to show particles traveling from source to screen

  return {
    allParticles,
    visibleParticles,
    simulationTime: isUsingExternalTime ? simulationTime : internalSimTime,
    generateParticles,
    resetParticles,
  };
}

/**
 * Extended version of useParticleSystem that includes particle motion
 * from the laser source to the detection screen
 */
export function useParticleSystemWithMotion(
  params: PhysicsParams,
  simulationTime: number
): UseParticleSystemReturn & { movingParticles: Particle[] } {
  const particleSystem = useParticleSystem(params, simulationTime);
  const [movingParticles, setMovingParticles] = useState<Particle[]>([]);
  const activeParticlesRef = useRef<Map<number, { startX: number; targetZ: number; startTime: number }>>(new Map());

  // Calculate particle positions based on time
  useEffect(() => {
    if (!params.particleMode || params.isPaused) return;

    const particleSpeed = params.waveSpeed * 2; // Particles move at twice wave speed for visual effect
    const travelTime = params.screenDistance / particleSpeed;
    
    // Update moving particles
    const newMovingParticles: Particle[] = [];
    const currentActiveParticles = activeParticlesRef.current;
    
    // Check for particles that should start moving
    particleSystem.visibleParticles.forEach((particle, index) => {
      if (!currentActiveParticles.has(index)) {
        // This particle just became visible, start it moving
        currentActiveParticles.set(index, {
          startX: 0, // Start at laser position
          targetZ: particle.position[2],
          startTime: simulationTime,
        });
      }
    });

    // Update positions of all active particles
    currentActiveParticles.forEach((particleData, index) => {
      const elapsed = simulationTime - particleData.startTime;
      const progress = Math.min(elapsed / travelTime, 1);
      
      if (progress < 1) {
        // Particle is still traveling
        const currentX = particleData.startX + progress * params.screenDistance;
        newMovingParticles.push({
          position: [currentX, 0, particleData.targetZ],
          startTime: particleData.startTime,
        });
      } else {
        // Particle has reached the screen, remove from active list
        currentActiveParticles.delete(index);
      }
    });

    setMovingParticles(newMovingParticles);
  }, [
    simulationTime,
    params.particleMode,
    params.isPaused,
    params.screenDistance,
    params.waveSpeed,
    particleSystem.visibleParticles
  ]);

  // Clean up when particle mode is disabled
  useEffect(() => {
    if (!params.particleMode) {
      activeParticlesRef.current.clear();
      setMovingParticles([]);
    }
  }, [params.particleMode]);

  return {
    ...particleSystem,
    movingParticles,
  };
}