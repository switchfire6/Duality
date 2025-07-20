import { useEffect, useRef, useState } from 'react';
import type { AnimationConfig, AnimationState, AnimationControls } from '../types/interfaces';

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