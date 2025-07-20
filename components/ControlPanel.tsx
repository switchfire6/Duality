import React, { useMemo } from 'react';
import type { ControlPanelProps, PhysicsParams } from '../types/interfaces';
import AccessibleSlider from './ui/AccessibleSlider';
import AccessibleCheckbox from './ui/AccessibleCheckbox';
import { validateSlitConstraints } from '../utils/validation';

const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParams, onReset }) => {
  const handleSliderChange = (param: keyof PhysicsParams) => (value: number) => {
    setParams(prev => ({ ...prev, [param]: value }));
  };
  
  const handleCheckboxChange = (param: keyof PhysicsParams) => (checked: boolean) => {
    setParams(prev => ({ ...prev, [param]: checked }));
  };

  const fringeSpacing = useMemo(() => {
    if (params.slitSeparation === 0) return '∞';
    return (params.wavelength * params.screenDistance / params.slitSeparation).toFixed(2);
  }, [params.wavelength, params.screenDistance, params.slitSeparation]);

  // Check for slit constraint violations
  const slitConstraintError = useMemo(() => {
    return validateSlitConstraints(params.slitWidth, params.slitSeparation);
  }, [params.slitWidth, params.slitSeparation]);

  return (
    <aside 
      className="w-[320px] h-full bg-gray-900/80 backdrop-blur-sm border-l border-gray-700 p-6 overflow-y-auto flex-shrink-0"
      role="complementary"
      aria-label="Experiment controls"
    >
      <h2 className="text-2xl font-bold mb-6 text-cyan-400" id="controls-heading">Controls</h2>
      
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setParams(p => ({ ...p, isPaused: !p.isPaused }))}
          className="flex-1 text-center py-2 px-4 rounded-lg font-semibold transition-colors bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label={params.isPaused ? 'Play animation' : 'Pause animation'}
        >
          {params.isPaused ? '▶ Play' : '❚❚ Pause'}
        </button>
        <button
          onClick={onReset}
          title="Reset Animation"
          className="flex-1 text-center py-2 px-4 rounded-lg font-semibold transition-colors bg-orange-600 hover:bg-orange-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Reset animation to initial state"
        >
          ↻ Reset
        </button>
      </div>

      <div className="my-4 border-t border-gray-700" role="separator"></div>
      <section aria-labelledby="physics-params-heading">
        <h3 id="physics-params-heading" className="text-lg font-semibold mb-3 text-gray-200">Physics Parameters</h3>
      
      <AccessibleSlider
        label="Wavelength (λ)"
        value={params.wavelength}
        min={0.3} max={1.0} step={0.01}
        onChange={handleSliderChange('wavelength')}
      />
      <AccessibleSlider
        label="Slit Separation (d)"
        value={params.slitSeparation}
        min={1.0} max={4.0} step={0.1}
        onChange={handleSliderChange('slitSeparation')}
      />
      <AccessibleSlider
        label="Slit Width (w)"
        value={params.slitWidth}
        min={0.1} max={0.5} step={0.01}
        onChange={handleSliderChange('slitWidth')}
        error={slitConstraintError}
      />
      <AccessibleSlider
        label="Screen Distance (D)"
        value={params.screenDistance}
        min={5.0} max={20.0} step={0.5}
        onChange={handleSliderChange('screenDistance')}
      />
      </section>
      
      <div className="my-4 border-t border-gray-700" role="separator"></div>
      <section aria-labelledby="animation-speed-heading">
        <h3 id="animation-speed-heading" className="text-lg font-semibold mb-3 text-gray-200">Animation Speed</h3>
      
      <AccessibleSlider
        label="Wave Speed"
        value={params.waveSpeed}
        min={0.5} max={5.0} step={0.1}
        onChange={handleSliderChange('waveSpeed')}
        unit="x"
        disabled={!params.showWaves}
      />
      <AccessibleSlider
        label="Particle Rate"
        value={params.particleRate}
        min={10} max={200} step={10}
        onChange={handleSliderChange('particleRate')}
        unit=" p/s"
        disabled={!params.particleMode}
      />
      <AccessibleSlider
        label="Time Scale"
        value={params.timeScale}
        min={0.1} max={3.0} step={0.1}
        onChange={handleSliderChange('timeScale')}
        unit="x"
      />
      </section>

      <div className="my-6 border-t border-gray-700" role="separator"></div>
      <section aria-labelledby="display-options-heading">
        <h3 id="display-options-heading" className="sr-only">Display Options</h3>

      <AccessibleCheckbox
        label="Show Waves"
        checked={params.showWaves}
        onChange={handleCheckboxChange('showWaves')}
        helpText="Display the wave visualization showing light propagation"
      />
       {params.showWaves && <AccessibleSlider
        label="Wave Amplitude"
        value={params.amplitude}
        min={0.1} max={1.0} step={0.05}
        onChange={handleSliderChange('amplitude')}
      />}
      <AccessibleCheckbox
        label="Particle Mode"
        checked={params.particleMode}
        onChange={handleCheckboxChange('particleMode')}
        helpText="Show individual photons hitting the detection screen"
      />
      </section>
      
      <div className="my-6 border-t border-gray-700" role="separator"></div>

      <section className="bg-gray-800 p-4 rounded-lg mb-6" aria-labelledby="calculated-values-heading">
        <h3 id="calculated-values-heading" className="text-lg font-semibold mb-2 text-gray-200">Calculated Values</h3>
        <p className="text-sm text-gray-400">
          Fringe Spacing (λD/d): 
          <span className="font-mono text-cyan-400" aria-live="polite" aria-atomic="true">
            {fringeSpacing}
          </span>
        </p>
      </section>

      <section className="bg-blue-900/50 border border-blue-700 p-4 rounded-lg" aria-labelledby="physics-tips-heading">
        <h3 id="physics-tips-heading" className="text-lg font-semibold mb-2 text-blue-300">Physics Tips</h3>
        <ul className="list-disc list-inside text-sm text-blue-200 space-y-1" role="list">
          <li>Larger wavelength (λ) increases fringe spacing.</li>
          <li>Smaller slit separation (d) increases fringe spacing.</li>
          <li>Slit width (w) controls the diffraction envelope.</li>
          <li>Enable both modes to see how waves guide particles!</li>
        </ul>
        <p className="text-sm mt-3 text-blue-400 font-semibold" role="note">
          <strong>Try this:</strong> Make slit separation just slightly larger than wavelength.
        </p>
      </section>
      
      {/* Screen reader announcements area */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {/* This area will be used for dynamic announcements */}
      </div>
    </aside>
  );
};

export default ControlPanel;