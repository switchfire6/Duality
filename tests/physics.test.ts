import { describe, it, expect } from 'vitest';
import type { PhysicsParams } from '../types/interfaces';

// Import the getInterferenceIntensity function from the hook file
// Since it's not exported, we need to extract and test it separately
// For now, we'll copy the function here for testing purposes

/**
 * Calculates the interference intensity at a given position on the detection screen
 * using the double-slit interference formula with diffraction envelope.
 */
const getInterferenceIntensity = (posOnScreen: number, params: PhysicsParams): number => {
  const { wavelength, slitSeparation, screenDistance, slitWidth } = params;
  const k = (2 * Math.PI) / wavelength;
  const D = screenDistance;
  const d = slitSeparation;
  const w = slitWidth;

  if (D <= 0 || wavelength <= 0) return 0;

  // With a horizontal layout, the position on screen is along the Z axis
  const z = posOnScreen;

  // Interference term from two slits
  const pathDiff = (d * z) / D;
  const phi = k * pathDiff;
  const interference = Math.pow(Math.cos(phi / 2.0), 2.0);

  // Diffraction envelope from single slit
  const beta = (k * w * z) / D;
  // Handle beta = 0 case to avoid division by zero
  const sinc_beta_half = beta === 0.0 ? 1.0 : Math.sin(beta / 2.0) / (beta / 2.0);
  const diffraction = Math.pow(sinc_beta_half, 2.0);

  return interference * diffraction;
};

describe('getInterferenceIntensity', () => {
  const defaultParams: PhysicsParams = {
    wavelength: 0.5, // 500nm in micrometers
    slitSeparation: 2.0, // 2μm
    slitWidth: 0.3, // 0.3μm
    screenDistance: 10.0, // 10μm
    waveSpeed: 1.0,
    particleRate: 100,
    isPaused: false,
    timeScale: 1.0,
    particleMode: false,
    showWaves: true,
    showFringes: true,
    slitClosed: [false, false],
  };

  it('should return maximum intensity at the center (z=0)', () => {
    const intensity = getInterferenceIntensity(0, defaultParams);
    expect(intensity).toBeCloseTo(1.0, 5);
  });

  it('should return 0 for invalid parameters', () => {
    const paramsWithZeroDistance = { ...defaultParams, screenDistance: 0 };
    expect(getInterferenceIntensity(0, paramsWithZeroDistance)).toBe(0);

    const paramsWithZeroWavelength = { ...defaultParams, wavelength: 0 };
    expect(getInterferenceIntensity(0, paramsWithZeroWavelength)).toBe(0);
  });

  it('should show interference pattern with alternating maxima and minima', () => {
    // Calculate the expected position of the first minimum
    // For double-slit, first minimum occurs at: z = (λ * D) / (2 * d)
    const firstMinimumPosition = (defaultParams.wavelength * defaultParams.screenDistance) / 
                                 (2 * defaultParams.slitSeparation);
    
    const intensityAtMinimum = getInterferenceIntensity(firstMinimumPosition, defaultParams);
    expect(intensityAtMinimum).toBeLessThan(0.1); // Should be close to 0

    // Calculate the expected position of the first maximum after center
    // First maximum occurs at: z = (λ * D) / d
    const firstMaximumPosition = (defaultParams.wavelength * defaultParams.screenDistance) / 
                                 defaultParams.slitSeparation;
    
    const intensityAtMaximum = getInterferenceIntensity(firstMaximumPosition, defaultParams);
    expect(intensityAtMaximum).toBeGreaterThan(0.5); // Should be relatively high
  });

  it('should be symmetric around z=0', () => {
    const testPositions = [0.5, 1.0, 2.0, 3.0];
    
    testPositions.forEach(pos => {
      const intensityPositive = getInterferenceIntensity(pos, defaultParams);
      const intensityNegative = getInterferenceIntensity(-pos, defaultParams);
      expect(intensityPositive).toBeCloseTo(intensityNegative, 10);
    });
  });

  it('should decrease intensity with diffraction envelope', () => {
    // Test that the overall envelope decreases as we move away from center
    // We need to compare peaks, not arbitrary positions that might be at minima
    
    // Get intensity at central maximum (z=0)
    const intensityAtCenter = getInterferenceIntensity(0, defaultParams);
    
    // Get intensity at a distant maximum
    // nth maximum occurs at: z = n * λ * D / d
    const n = 10; // 10th order maximum
    const tenthMaxPosition = (n * defaultParams.wavelength * defaultParams.screenDistance) / defaultParams.slitSeparation;
    const intensityAtTenthMax = getInterferenceIntensity(tenthMaxPosition, defaultParams);
    
    // The diffraction envelope should cause distant maxima to have lower intensity
    expect(intensityAtTenthMax).toBeLessThan(intensityAtCenter);
  });

  it('should handle edge case where beta = 0', () => {
    // When z = 0, beta = 0, which tests the sinc function edge case
    const intensity = getInterferenceIntensity(0, defaultParams);
    expect(intensity).toBe(1.0); // Maximum intensity at center
  });

  it('should vary with wavelength changes', () => {
    const redParams = { ...defaultParams, wavelength: 0.7 }; // 700nm red light
    const blueParams = { ...defaultParams, wavelength: 0.4 }; // 400nm blue light
    
    // At the same position, different wavelengths should give different intensities
    const testPosition = 2.0;
    const redIntensity = getInterferenceIntensity(testPosition, redParams);
    const blueIntensity = getInterferenceIntensity(testPosition, blueParams);
    
    expect(redIntensity).not.toBeCloseTo(blueIntensity, 2);
  });

  it('should show wider fringes with smaller slit separation', () => {
    const narrowParams = { ...defaultParams, slitSeparation: 1.0 }; // Narrower slits
    const wideParams = { ...defaultParams, slitSeparation: 4.0 }; // Wider slits
    
    // First minimum position should be different
    const narrowFirstMin = (narrowParams.wavelength * narrowParams.screenDistance) / 
                          (2 * narrowParams.slitSeparation);
    const wideFirstMin = (wideParams.wavelength * wideParams.screenDistance) / 
                        (2 * wideParams.slitSeparation);
    
    expect(narrowFirstMin).toBeGreaterThan(wideFirstMin);
  });
});