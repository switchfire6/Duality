import React from 'react';
import { useSimulationParams, useSimulationTime } from '../contexts/SimulationContext';

// Example component demonstrating direct context usage
// This shows how child components can access state without prop drilling
const ExampleContextUsage: React.FC = () => {
  const { params } = useSimulationParams();
  const simulationTime = useSimulationTime();

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold text-cyan-400 mb-2">Simulation Status</h3>
      <p className="text-gray-300">Mode: {params.particleMode ? 'Particle' : 'Wave'}</p>
      <p className="text-gray-300">Time: {simulationTime.toFixed(2)}s</p>
      <p className="text-gray-300">Wavelength: {params.wavelength}μm</p>
      <p className="text-gray-300">Status: {params.isPaused ? 'Paused' : 'Running'}</p>
    </div>
  );
};

export default ExampleContextUsage;