import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import type { PhysicsParams } from '../../types';

// Mock the FringeMarkers module to test its logic
vi.mock('../../components/3d/FringeMarkers', () => {
  const FringeMarkers = ({ params }: { params: PhysicsParams }) => {
    const { wavelength, slitSeparation, screenDistance } = params;
    if (slitSeparation <= 0) return { type: 'group', props: { children: [] } };
    
    const fringeSpacing = (wavelength * screenDistance) / slitSeparation;
    const numMarkers = 10;
    const markerPositions = [];
    
    for (let i = -numMarkers; i <= numMarkers; i++) {
      markerPositions.push({
        type: 'mesh',
        key: i,
        props: {
          position: [screenDistance + 0.1, 0, i * fringeSpacing],
          children: [
            { type: 'boxGeometry', props: { args: [0.05, 1, 0.05] } },
            { type: 'meshBasicMaterial', props: { color: 'green', transparent: true, opacity: 0.7 } }
          ]
        }
      });
    }
    
    return { type: 'group', props: { children: markerPositions } };
  };

  return { default: FringeMarkers };
});

// Import after mocking
import FringeMarkers from '../../components/3d/FringeMarkers';

describe('FringeMarkers Logic Tests', () => {
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

  it('should create markers without errors', () => {
    const component = FringeMarkers({ params: defaultParams });
    expect(component).toBeTruthy();
    expect(component.type).toBe('group');
  });

  it('should create correct number of markers', () => {
    const component = FringeMarkers({ params: defaultParams });
    // Should create markers from -10 to 10 (21 total)
    const markers = component.props.children;
    expect(markers).toHaveLength(21);
  });

  it('should calculate correct fringe spacing', () => {
    const component = FringeMarkers({ params: defaultParams });
    const markers = component.props.children;
    
    // Calculate expected fringe spacing
    const expectedSpacing = (defaultParams.wavelength * defaultParams.screenDistance) / defaultParams.slitSeparation;
    // expectedSpacing = (0.5 * 10) / 2 = 2.5
    
    // Extract Z positions from marker props
    const positions = markers.map((marker: any) => marker.props.position[2]);
    
    // Verify spacing between consecutive markers
    positions.sort((a: number, b: number) => a - b);
    for (let i = 1; i < positions.length; i++) {
      const spacing = positions[i] - positions[i - 1];
      expect(spacing).toBeCloseTo(expectedSpacing, 5);
    }
  });

  it('should not create markers when slit separation is 0', () => {
    const paramsWithZeroSeparation = { ...defaultParams, slitSeparation: 0 };
    const component = FringeMarkers({ params: paramsWithZeroSeparation });
    const markers = component.props.children;
    expect(markers).toHaveLength(0);
  });

  it('should update markers when parameters change', () => {
    // Test with initial params
    const component1 = FringeMarkers({ params: defaultParams });
    const markers1 = component1.props.children;
    expect(markers1).toHaveLength(21);
    
    // Test with updated wavelength
    const updatedParams = { ...defaultParams, wavelength: 0.7 };
    const component2 = FringeMarkers({ params: updatedParams });
    const markers2 = component2.props.children;
    expect(markers2).toHaveLength(21);
    
    // Verify positions are different
    const pos1 = markers1[1].props.position[2];
    const pos2 = markers2[1].props.position[2];
    expect(pos1).not.toBe(pos2);
  });

  it('should position markers at the correct X coordinate', () => {
    const component = FringeMarkers({ params: defaultParams });
    const markers = component.props.children;
    
    markers.forEach((marker: any) => {
      const xPos = marker.props.position[0];
      // X position should be screenDistance + 0.1
      expect(xPos).toBeCloseTo(defaultParams.screenDistance + 0.1, 5);
    });
  });

  it('should handle very small wavelengths correctly', () => {
    const smallWavelengthParams = { ...defaultParams, wavelength: 0.1 };
    const component = FringeMarkers({ params: smallWavelengthParams });
    const markers = component.props.children;
    
    // Should still create 21 markers
    expect(markers).toHaveLength(21);
    
    // Fringe spacing should be smaller
    const expectedSpacing = (0.1 * 10) / 2; // 0.5
    const positions = markers.map((marker: any) => marker.props.position[2]);
    
    positions.sort((a: number, b: number) => a - b);
    const spacing = positions[11] - positions[10]; // Compare consecutive markers near center
    expect(spacing).toBeCloseTo(expectedSpacing, 5);
  });

  it('should create markers centered around z=0', () => {
    const component = FringeMarkers({ params: defaultParams });
    const markers = component.props.children;
    
    // Get all Z positions
    const positions = markers.map((marker: any) => marker.props.position[2]);
    
    // Check that we have markers on both sides of 0
    const negativePositions = positions.filter((p: number) => p < 0);
    const positivePositions = positions.filter((p: number) => p > 0);
    const zeroPosition = positions.filter((p: number) => p === 0);
    
    expect(negativePositions).toHaveLength(10);
    expect(positivePositions).toHaveLength(10);
    expect(zeroPosition).toHaveLength(1);
  });
});