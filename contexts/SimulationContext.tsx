import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type { PhysicsParams, Particle } from '../types/interfaces';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { useParticleSystem } from '../hooks/useParticleSystem';

interface SimulationContextType {
  // Physics parameters
  params: PhysicsParams;
  setParams: React.Dispatch<React.SetStateAction<PhysicsParams>>;
  
  // Simulation time
  simulationTime: number;
  
  // Particle system
  visibleParticles: Particle[];
  
  // Control functions
  handleReset: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

interface SimulationProviderProps {
  children: ReactNode;
}

// Parameter validation boundaries
const PARAM_BOUNDS = {
  wavelength: { min: 0.1, max: 2.0 },
  slitSeparation: { min: 0.5, max: 10.0 },
  slitWidth: { min: 0.1, max: 5.0 },
  screenDistance: { min: 1.0, max: 20.0 },
  amplitude: { min: 0.1, max: 1.0 },
  waveSpeed: { min: 0.1, max: 10.0 },
  particleRate: { min: 10, max: 1000 },
  timeScale: { min: 0.1, max: 5.0 },
};

// Validate and clamp parameter values
const validateParam = (key: keyof typeof PARAM_BOUNDS, value: number): number => {
  const bounds = PARAM_BOUNDS[key];
  if (!bounds) return value;
  
  if (isNaN(value) || !isFinite(value)) {
    console.warn(`Invalid value for ${key}: ${value}`);
    return (bounds.min + bounds.max) / 2; // Return middle value as fallback
  }
  
  return Math.max(bounds.min, Math.min(bounds.max, value));
};

// Validate physics constraints
const validatePhysicsConstraints = (params: PhysicsParams): PhysicsParams => {
  const validated = { ...params };
  
  // Ensure slit width doesn't exceed slit separation
  if (validated.slitWidth > validated.slitSeparation) {
    console.warn(`Slit width (${validated.slitWidth}) cannot exceed slit separation (${validated.slitSeparation}). Adjusting...`);
    validated.slitWidth = validated.slitSeparation * 0.8; // Set to 80% of separation
  }
  
  // Validate numeric parameters
  Object.keys(PARAM_BOUNDS).forEach((key) => {
    const paramKey = key as keyof typeof PARAM_BOUNDS;
    if (typeof validated[paramKey] === 'number') {
      validated[paramKey] = validateParam(paramKey, validated[paramKey]);
    }
  });
  
  return validated;
};

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children }) => {
  const [params, setParamsRaw] = useState<PhysicsParams>(() => validatePhysicsConstraints({
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
  }));

  // Wrapped setParams that validates input
  const setParams = useCallback<React.Dispatch<React.SetStateAction<PhysicsParams>>>((action) => {
    setParamsRaw((prevParams) => {
      const newParams = typeof action === 'function' ? action(prevParams) : action;
      return validatePhysicsConstraints(newParams);
    });
  }, []);

  // Use the custom animation hook with memoized config
  const animationConfig = useMemo(() => ({
    isPaused: params.isPaused,
    timeScale: params.timeScale,
  }), [params.isPaused, params.timeScale]);
  
  const { simulationTime, resetTime } = useAnimationLoop(animationConfig);

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

  const value: SimulationContextType = useMemo(() => ({
    params,
    setParams,
    simulationTime,
    visibleParticles,
    handleReset,
  }), [params, setParams, simulationTime, visibleParticles, handleReset]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

// Custom hook to use the simulation context
export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

// Granular hooks for specific parts of the context
export const useSimulationParams = () => {
  const { params, setParams } = useSimulation();
  return { params, setParams };
};

export const useSimulationTime = () => {
  const { simulationTime } = useSimulation();
  return simulationTime;
};

export const useSimulationParticles = () => {
  const { visibleParticles } = useSimulation();
  return visibleParticles;
};

export const useSimulationControls = () => {
  const { handleReset } = useSimulation();
  return { handleReset };
};