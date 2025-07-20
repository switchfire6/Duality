import * as THREE from 'three';
import { PhysicsParams, Particle } from '../types';

// ============== Component Props Interfaces ==============

// Main Components
export interface SceneComponentProps {
  params: PhysicsParams;
  particles: Particle[];
  simulationTime: number;
}

export interface ControlPanelProps {
  params: PhysicsParams;
  setParams: React.Dispatch<React.SetStateAction<PhysicsParams>>;
  onReset: () => void;
}

// 3D Component Props
export interface WaveFieldProps {
  params: PhysicsParams;
  simulationTime: number;
}

export interface DetectionScreenProps {
  params: PhysicsParams;
}

export interface BarrierProps {
  slitSeparation: number;
  slitWidth: number;
}

export interface ParticlesProps {
  particles: Particle[];
}

export interface FringeMarkersProps {
  params: PhysicsParams;
}

// Control Panel Sub-components
export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
  disabled?: boolean;
}

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// ============== Shader Uniforms Interfaces ==============

export interface WaveFieldUniforms {
  uTime: THREE.IUniform<number>;
  uWavelength: THREE.IUniform<number>;
  uSlitSeparation: THREE.IUniform<number>;
  uAmplitude: THREE.IUniform<number>;
  uSlitWidth: THREE.IUniform<number>;
  uWaveSpeed: THREE.IUniform<number>;
}

export interface DetectionScreenUniforms {
  uWavelength: THREE.IUniform<number>;
  uSlitSeparation: THREE.IUniform<number>;
  uScreenDistance: THREE.IUniform<number>;
  uSlitWidth: THREE.IUniform<number>;
  uMaxWidth: THREE.IUniform<number>;
}

// ============== Animation State Interfaces ==============

export interface AnimationConfig {
  isPaused: boolean;
  timeScale: number;
}

export interface AnimationState {
  simulationTime: number;
}

export interface AnimationControls {
  resetTime: () => void;
}

export interface TimeReference {
  simTime: number;
  lastTimestamp: number;
}

// ============== Simulation State Interfaces ==============

export interface SimulationState {
  params: PhysicsParams;
  allParticles: Particle[];
  visibleParticles: Particle[];
  simulationTime: number;
}

export interface ParticleGenerationConfig {
  numParticles: number;
  screenWidth: number;
  maxAttempts: number;
}

// ============== Physics Calculation Interfaces ==============

export interface InterferenceCalculation {
  position: number;
  wavelength: number;
  slitSeparation: number;
  screenDistance: number;
  slitWidth: number;
}

export interface FringeCalculation {
  wavelength: number;
  slitSeparation: number;
  screenDistance: number;
}

// ============== 3D Scene Configuration ==============

export interface SceneConfig {
  camera: {
    position: [number, number, number];
    fov: number;
  };
  lights: {
    ambient: {
      intensity: number;
    };
    point: {
      position: [number, number, number];
      intensity: number;
    };
  };
  grid: {
    size: [number, number];
    cellSize: number;
    cellThickness: number;
    cellColor: THREE.Color;
    sectionSize: number;
    sectionThickness: number;
    sectionColor: THREE.Color;
    fadeDistance: number;
  };
}

// ============== Material Configuration ==============

export interface WaveFieldMaterialConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: WaveFieldUniforms;
  transparent?: boolean;
  side?: THREE.Side;
}

export interface DetectionScreenMaterialConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: DetectionScreenUniforms;
  side: THREE.Side;
}

export interface BarrierMaterialConfig {
  color: string | number;
  roughness: number;
  metalness?: number;
}

export interface ParticlesMaterialConfig {
  color: string | number;
  size: number;
  sizeAttenuation: boolean;
}

// ============== Geometry Configuration ==============

export interface PlaneGeometryConfig {
  width: number;
  height: number;
  widthSegments: number;
  heightSegments: number;
}

export interface BoxGeometryConfig {
  width: number;
  height: number;
  depth: number;
}

export interface BufferGeometryAttributes {
  position: {
    array: Float32Array;
    count: number;
    itemSize: number;
  };
}

// ============== UI Event Handlers ==============

export interface ParameterChangeHandler {
  (param: keyof PhysicsParams): (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ButtonClickHandler {
  (): void;
}

// ============== Utility Types ==============

export type Vector3 = [number, number, number];
export type Vector2 = [number, number];

export interface Dimensions {
  width: number;
  height: number;
  depth?: number;
}

export interface ColorConfig {
  positive: Vector3;
  negative: Vector3;
}

// ============== Export all interfaces ==============
export * from '../types'; // Re-export existing types for convenience