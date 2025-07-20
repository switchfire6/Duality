import React from 'react';
import ControlPanel from './ControlPanel';
import SceneComponent from './Scene';
import SceneErrorBoundary from './SceneErrorBoundary';
import { SimulationProvider, useSimulation } from '../contexts/SimulationContext';

const DoubleSlitExperimentContent: React.FC = () => {
  const { params, setParams, simulationTime, visibleParticles, handleReset } = useSimulation();

  return (
    <div className="flex w-full h-screen bg-gray-800">
      <div className="flex-1 h-full relative" role="region" aria-label="3D visualization of double slit experiment">
        <SceneErrorBoundary>
          <SceneComponent params={params} particles={visibleParticles} simulationTime={simulationTime} />
        </SceneErrorBoundary>
        {/* Screen reader description of the visualization */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          The visualization shows {params.showWaves ? 'wave patterns' : ''} 
          {params.showWaves && params.particleMode ? ' and ' : ''}
          {params.particleMode ? 'individual particles' : ''} 
          passing through a double slit barrier with slit separation of {params.slitSeparation.toFixed(2)} 
          and wavelength of {params.wavelength.toFixed(2)}.
          {params.isPaused ? ' Animation is paused.' : ' Animation is running.'}
        </div>
      </div>
      <ControlPanel params={params} setParams={setParams} onReset={handleReset} />
    </div>
  );
};

const DoubleSlitExperiment: React.FC = () => {
  return (
    <SimulationProvider>
      <DoubleSlitExperimentContent />
    </SimulationProvider>
  );
};

export default DoubleSlitExperiment;