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

/**
 * Parameter validation boundaries for physics simulation.
 * Defines min/max values for each parameter to ensure physical validity.
 */
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

/**
 * Validates and clamps a single parameter value to its defined bounds.
 * 
 * @param key - The parameter name to validate
 * @param value - The numeric value to check and clamp
 * @returns The clamped value within valid bounds, or midpoint if invalid
 * 
 * @internal
 */
const validateParam = (key: keyof typeof PARAM_BOUNDS, value: number): number => {
  const bounds = PARAM_BOUNDS[key];
  if (!bounds) return value;
  
  if (isNaN(value) || !isFinite(value)) {
    console.warn(`Invalid value for ${key}: ${value}`);
    return (bounds.min + bounds.max) / 2; // Return middle value as fallback
  }
  
  return Math.max(bounds.min, Math.min(bounds.max, value));
};

/**
 * Validates all physics parameters and enforces physical constraints.
 * Ensures parameters are within bounds and physically valid.
 * 
 * @param params - The complete physics parameters object
 * @returns A new params object with all values validated and constrained
 * 
 * @internal
 */
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

/**
 * Provider component for the double-slit experiment simulation context.
 * Manages all simulation state including physics parameters, animation timing,
 * and particle systems.
 * 
 * @param props - Component props
 * @param props.children - Child components that will have access to simulation context
 * 
 * @example
 * ```typescript
 * function App() {
 *   return (
 *     <SimulationProvider>
 *       <DoubleSlitExperiment />
 *       <ControlPanel />
 *     </SimulationProvider>
 *   );
 * }
 * ```
 * 
 * @remarks
 * This provider:
 * - Validates all physics parameters to ensure physical validity
 * - Manages simulation time with pause/resume capabilities
 * - Handles particle generation and visibility
 * - Provides reset functionality for the entire simulation
 */
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

/**
 * Main hook to access the simulation context.
 * Provides access to all simulation state and control functions.
 * 
 * @returns The complete simulation context including:
 *   - params: Current physics parameters
 *   - setParams: Function to update parameters
 *   - simulationTime: Current simulation time in seconds
 *   - visibleParticles: Array of currently visible particles
 *   - handleReset: Function to reset the simulation
 * 
 * @throws Error if used outside of SimulationProvider
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { params, setParams, simulationTime } = useSimulation();
 *   
 *   const handleWavelengthChange = (wavelength: number) => {
 *     setParams(prev => ({ ...prev, wavelength }));
 *   };
 *   
 *   return <div>Time: {simulationTime.toFixed(2)}s</div>;
 * }
 * ```
 */
export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

/**
 * Hook to access only the physics parameters and their setter.
 * Use when you only need parameter state, not other simulation data.
 * 
 * @returns Object containing params and setParams
 * 
 * @example
 * ```typescript
 * const { params, setParams } = useSimulationParams();
 * ```
 */
export const useSimulationParams = () => {
  const { params, setParams } = useSimulation();
  return { params, setParams };
};

/**
 * Hook to access only the simulation time.
 * Use for components that need to animate based on time.
 * 
 * @returns Current simulation time in seconds
 * 
 * @example
 * ```typescript
 * const simulationTime = useSimulationTime();
 * const phase = simulationTime * frequency;
 * ```
 */
export const useSimulationTime = () => {
  const { simulationTime } = useSimulation();
  return simulationTime;
};

/**
 * Hook to access only the visible particles array.
 * Use for rendering particle visualizations.
 * 
 * @returns Array of currently visible particles
 * 
 * @example
 * ```typescript
 * const particles = useSimulationParticles();
 * return <Particles data={particles} />;
 * ```
 */
export const useSimulationParticles = () => {
  const { visibleParticles } = useSimulation();
  return visibleParticles;
};

/**
 * Hook to access only the simulation control functions.
 * Use for control UI components.
 * 
 * @returns Object containing control functions like handleReset
 * 
 * @example
 * ```typescript
 * const { handleReset } = useSimulationControls();
 * <button onClick={handleReset}>Reset</button>
 * ```
 */
export const useSimulationControls = () => {
  const { handleReset } = useSimulation();
  return { handleReset };
};