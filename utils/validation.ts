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

/**
 * Checks if a parameter value is within its defined bounds.
 * 
 * @param key - The parameter key to check
 * @param value - The numeric value to validate
 * @returns True if the value is within the min/max bounds for the parameter
 * 
 * @example
 * ```typescript
 * isWithinBounds('wavelength', 0.5); // true (0.5 is between 0.1 and 2.0)
 * isWithinBounds('wavelength', 3.0); // false (3.0 exceeds max of 2.0)
 * ```
 */
export const isWithinBounds = (key: ParamKey, value: number): boolean => {
  const bounds = PARAM_BOUNDS[key];
  return value >= bounds.min && value <= bounds.max;
};

/**
 * Generates an appropriate validation message for parameter values that are out of bounds.
 * 
 * @param key - The parameter key being validated
 * @param value - The numeric value being checked
 * @returns A validation message string if the value is invalid, null if valid
 * 
 * @example
 * ```typescript
 * getValidationMessage('wavelength', -1);    // "Minimum: 0.1μm"
 * getValidationMessage('wavelength', 0.5);   // null (valid)
 * getValidationMessage('wavelength', NaN);   // "Invalid number"
 * getValidationMessage('slitWidth', 10);     // "Maximum: 5.0μm"
 * ```
 * 
 * @remarks
 * The function checks for:
 * - NaN and non-finite values
 * - Values below minimum bounds
 * - Values above maximum bounds
 */
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

/**
 * Validates physical constraints between slit width and slit separation.
 * 
 * @param slitWidth - Width of each individual slit in micrometers
 * @param slitSeparation - Distance between slit centers in micrometers
 * @returns Error message if constraint is violated, null if valid
 * 
 * @example
 * ```typescript
 * validateSlitConstraints(0.3, 2.0);  // null (valid: 0.3 < 2.0)
 * validateSlitConstraints(2.5, 2.0);  // "Slit width must be less than slit separation"
 * validateSlitConstraints(2.0, 2.0);  // "Slit width must be less than slit separation"
 * ```
 * 
 * @remarks
 * This ensures the physical constraint that individual slits cannot overlap.
 * In a real double-slit experiment, the slit width must be smaller than
 * the separation between slits for the interference pattern to form properly.
 */
export const validateSlitConstraints = (slitWidth: number, slitSeparation: number): string | null => {
  if (slitWidth >= slitSeparation) {
    return 'Slit width must be less than slit separation';
  }
  return null;
};

/**
 * Performs comprehensive validation of all physics parameters and returns
 * a collection of any validation errors found.
 * 
 * @param params - Complete physics parameters object to validate
 * @returns Object mapping parameter names to their validation error messages.
 *          Empty object if all parameters are valid.
 * 
 * @example
 * ```typescript
 * const errors = getAllValidationErrors({
 *   wavelength: -1,      // Invalid: negative
 *   slitWidth: 3.0,
 *   slitSeparation: 2.0, // Invalid: width > separation
 *   // ... other params
 * });
 * // Returns: {
 * //   wavelength: "Minimum: 0.1μm",
 * //   slitWidth: "Slit width must be less than slit separation"
 * // }
 * ```
 * 
 * @remarks
 * This function checks:
 * - All numeric parameters against their min/max bounds
 * - Physical constraints (e.g., slit width vs separation)
 * - NaN and infinite values
 */
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

/**
 * Formats a parameter value with appropriate decimal precision based on
 * the parameter's range and typical usage.
 * 
 * @param key - The parameter key determining formatting rules
 * @param value - The numeric value to format
 * @returns Formatted string with appropriate decimal places
 * 
 * @example
 * ```typescript
 * formatParamValue('wavelength', 0.532);    // "0.53" (2 decimals for small range)
 * formatParamValue('screenDistance', 15.7); // "16" (0 decimals for large range)
 * formatParamValue('slitWidth', 0.333);     // "0.33" (2 decimals)
 * formatParamValue('particleRate', 250.5);  // "251" (0 decimals)
 * ```
 * 
 * @remarks
 * Precision is determined by the parameter's range:
 * - Range < 1: 2 decimal places (e.g., wavelength)
 * - Range 1-10: 1 decimal place (e.g., slit parameters)
 * - Range > 10: 0 decimal places (e.g., particle rate)
 */
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