
export interface PhysicsParams {
  wavelength: number;
  slitSeparation: number;
  slitWidth: number;
  screenDistance: number;
  amplitude: number;
  showWaves: boolean;
  particleMode: boolean;
  isPaused: boolean;
  waveSpeed: number;
  particleRate: number;
  timeScale: number;
}

export type Particle = { 
  position: [number, number, number]; 
  startTime: number; // Represents simulation time, not wall-clock time
};