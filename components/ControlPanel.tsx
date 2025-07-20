import React from 'react';
import type { PhysicsParams } from '../types';

interface ControlPanelProps {
  params: PhysicsParams;
  setParams: React.Dispatch<React.SetStateAction<PhysicsParams>>;
  onReset: () => void;
}

const Slider = ({ label, value, min, max, step, onChange, unit = '', disabled = false }: { label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit?: string; disabled?: boolean }) => (
  <div className="mb-4">
    <label className={`block text-sm font-medium mb-1 ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{label}: <span className={`font-mono ${disabled ? 'text-gray-500' : 'text-cyan-400'}`}>{value.toFixed(2)}{unit}</span></label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:accent-gray-600 disabled:cursor-not-allowed"
    />
  </div>
);

const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
  <div className="flex items-center mb-4">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
    />
    <label className="ml-3 text-sm font-medium text-gray-300">{label}</label>
  </div>
);

const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParams, onReset }) => {
  const handleParamChange = (param: keyof PhysicsParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : parseFloat(e.target.value);
    setParams(prev => ({ ...prev, [param]: value }));
  };

  const fringeSpacing = (params.wavelength * params.screenDistance / params.slitSeparation).toFixed(2);

  return (
    <div className="w-[320px] h-full bg-gray-900/80 backdrop-blur-sm border-l border-gray-700 p-6 overflow-y-auto flex-shrink-0">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">Controls</h2>
      
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setParams(p => ({ ...p, isPaused: !p.isPaused }))}
          className="flex-1 text-center py-2 px-4 rounded-lg font-semibold transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {params.isPaused ? '▶ Play' : '❚❚ Pause'}
        </button>
        <button
          onClick={onReset}
          title="Reset Animation"
          className="flex-1 text-center py-2 px-4 rounded-lg font-semibold transition-colors bg-orange-600 hover:bg-orange-700 text-white"
        >
          ↻ Reset
        </button>
      </div>

      <div className="my-4 border-t border-gray-700"></div>
      <h3 className="text-lg font-semibold mb-3 text-gray-200">Physics Parameters</h3>
      
      <Slider
        label="Wavelength (λ)"
        value={params.wavelength}
        min={0.3} max={1.0} step={0.01}
        onChange={handleParamChange('wavelength')}
      />
      <Slider
        label="Slit Separation (d)"
        value={params.slitSeparation}
        min={1.0} max={4.0} step={0.1}
        onChange={handleParamChange('slitSeparation')}
      />
      <Slider
        label="Slit Width (w)"
        value={params.slitWidth}
        min={0.1} max={0.5} step={0.01}
        onChange={handleParamChange('slitWidth')}
      />
      <Slider
        label="Screen Distance (D)"
        value={params.screenDistance}
        min={5.0} max={20.0} step={0.5}
        onChange={handleParamChange('screenDistance')}
      />
      
      <div className="my-4 border-t border-gray-700"></div>
      <h3 className="text-lg font-semibold mb-3 text-gray-200">Animation Speed</h3>
      
      <Slider
        label="Wave Speed"
        value={params.waveSpeed}
        min={0.5} max={5.0} step={0.1}
        onChange={handleParamChange('waveSpeed')}
        unit="x"
        disabled={!params.showWaves}
      />
      <Slider
        label="Particle Rate"
        value={params.particleRate}
        min={10} max={200} step={10}
        onChange={handleParamChange('particleRate')}
        unit=" p/s"
        disabled={!params.particleMode}
      />
      <Slider
        label="Time Scale"
        value={params.timeScale}
        min={0.1} max={3.0} step={0.1}
        onChange={handleParamChange('timeScale')}
        unit="x"
      />


      <div className="my-6 border-t border-gray-700"></div>

      <Checkbox
        label="Show Waves"
        checked={params.showWaves}
        onChange={handleParamChange('showWaves')}
      />
       {params.showWaves && <Slider
        label="Wave Amplitude"
        value={params.amplitude}
        min={0.1} max={1.0} step={0.05}
        onChange={handleParamChange('amplitude')}
      />}
      <Checkbox
        label="Particle Mode"
        checked={params.particleMode}
        onChange={handleParamChange('particleMode')}
      />
      
      <div className="my-6 border-t border-gray-700"></div>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-200">Calculated Values</h3>
        <p className="text-sm text-gray-400">Fringe Spacing (λD/d): <span className="font-mono text-cyan-400">{fringeSpacing}</span></p>
      </div>

      <div className="bg-blue-900/50 border border-blue-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-300">Physics Tips</h3>
        <ul className="list-disc list-inside text-sm text-blue-200 space-y-1">
          <li>Larger wavelength (λ) increases fringe spacing.</li>
          <li>Smaller slit separation (d) increases fringe spacing.</li>
          <li>Slit width (w) controls the diffraction envelope.</li>
          <li>Enable both modes to see how waves guide particles!</li>
        </ul>
        <p className="text-sm mt-3 text-blue-400 font-semibold">Try this: Make slit separation just slightly larger than wavelength.</p>
      </div>
    </div>
  );
};

export default ControlPanel;