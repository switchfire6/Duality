import { PhysicsParams } from '../types';

// Parameter validation boundaries
export const PARAM_BOUNDS = {
  wavelength: { min: 0.1, max: 2.0, unit: 'μm' },
  slitSeparation: { min: 0.5, max: 10.0, unit: 'μm' },
  slitWidth: { min: 0.1, max: 5.0, unit: 'μm' },
  screenDistance: { min: 1.0, max: 20.0, unit: 'μm' },
  amplitude: { min: 0.1, max: 1.0, unit: '' },
  waveSpeed: { min: 0.1, max: 10.0, unit: 'c' },
  particleRate: { min: 10, max: 1000, unit: '/s' },
  timeScale: { min: 0.1, max: 5.0, unit: 'x' },
} as const;

export type ParamKey = keyof typeof PARAM_BOUNDS;

// Check if a value is within bounds
export const isWithinBounds = (key: ParamKey, value: number): boolean => {
  const bounds = PARAM_BOUNDS[key];
  return value >= bounds.min && value <= bounds.max;
};

// Get validation message
export const getValidationMessage = (key: ParamKey, value: number): string | null => {
  const bounds = PARAM_BOUNDS[key];
  
  if (isNaN(value) || !isFinite(value)) {
    return 'Invalid number';
  }
  
  if (value < bounds.min) {
    return `Minimum: ${bounds.min}${bounds.unit}`;
  }
  
  if (value > bounds.max) {
    return `Maximum: ${bounds.max}${bounds.unit}`;
  }
  
  return null;
};

// Validate slit width doesn't exceed separation
export const validateSlitConstraints = (slitWidth: number, slitSeparation: number): string | null => {
  if (slitWidth >= slitSeparation) {
    return 'Slit width must be less than slit separation';
  }
  return null;
};

// Get all validation errors for current params
export const getAllValidationErrors = (params: PhysicsParams): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Check numeric bounds
  Object.keys(PARAM_BOUNDS).forEach((key) => {
    const paramKey = key as ParamKey;
    const value = params[paramKey];
    if (typeof value === 'number') {
      const error = getValidationMessage(paramKey, value);
      if (error) {
        errors[paramKey] = error;
      }
    }
  });
  
  // Check slit constraints
  const slitError = validateSlitConstraints(params.slitWidth, params.slitSeparation);
  if (slitError) {
    errors.slitWidth = slitError;
  }
  
  return errors;
};

// Format value with appropriate precision
export const formatParamValue = (key: ParamKey, value: number): string => {
  const bounds = PARAM_BOUNDS[key];
  
  // Determine precision based on range
  const range = bounds.max - bounds.min;
  let precision = 1;
  
  if (range < 1) {
    precision = 2;
  } else if (range < 10) {
    precision = 1;
  } else {
    precision = 0;
  }
  
  return value.toFixed(precision);
};