import { useEffect, useRef, useState } from 'react';
import type { AnimationConfig, AnimationState, AnimationControls } from '../types/interfaces';

/**
 * Custom hook that manages a pausable animation loop with adjustable time scaling.
 * Provides simulation time that can be paused, resumed, and scaled independently
 * of wall-clock time.
 * 
 * @param config - Animation configuration object containing:
 *   - isPaused: Whether the animation is currently paused
 *   - timeScale: Multiplier for simulation time progression (1.0 = real-time)
 * 
 * @returns Object containing:
 *   - simulationTime: Current simulation time in seconds
 *   - resetTime: Function to reset simulation time to 0
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { simulationTime, resetTime } = useAnimationLoop({
 *   isPaused: false,
 *   timeScale: 1.0
 * });
 * 
 * // Use in a physics simulation
 * const wavePhase = simulationTime * waveFrequency;
 * 
 * // Slow motion effect
 * const { simulationTime } = useAnimationLoop({
 *   isPaused: false,
 *   timeScale: 0.5  // Half speed
 * });
 * ```
 * 
 * @remarks
 * - Uses requestAnimationFrame for smooth 60fps updates
 * - Automatically handles pause/unpause without time jumps
 * - Time scale changes take effect immediately
 * - Simulation time is preserved across re-renders
 */
export const useAnimationLoop = (config: AnimationConfig): AnimationState & AnimationControls => {
  const [simulationTime, setSimulationTime] = useState(0);
  const timeRef = useRef({ simTime: 0, lastTimestamp: 0 });

  // Reset time function
  const resetTime = () => {
    setSimulationTime(0);
    timeRef.current = { simTime: 0, lastTimestamp: 0 };
  };

  // Main animation loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (config.isPaused) {
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

      const newSimTime = timeRef.current.simTime + delta * config.timeScale;
      timeRef.current.simTime = newSimTime;
      setSimulationTime(newSimTime); // Trigger re-render for consumers

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [config.isPaused, config.timeScale]);

  return {
    simulationTime,
    resetTime,
  };
};