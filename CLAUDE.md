# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Double Slit Experiment - A quantum physics visualization demonstrating wave-particle duality built with React, TypeScript, and Three.js.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Create a `.env.local` file with:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

## Architecture

### Technology Stack
- **React 19.1.0** with TypeScript for UI
- **Three.js** with @react-three/fiber for 3D graphics
- **Vite** as build tool
- **Custom GLSL shaders** for GPU-accelerated physics calculations

### Component Hierarchy
```
App.tsx
└── DoubleSlitExperiment.tsx (main state management)
    ├── Scene.tsx (3D visualization container)
    │   ├── WaveField (wave visualization shader)
    │   ├── DetectionScreen (interference pattern)
    │   ├── Barrier (double slit)
    │   ├── Laser (light source)
    │   ├── FringeMarkers (measurement guides)
    │   └── Particles (particle mode visualization)
    └── ControlPanel.tsx (UI controls)
```

### State Management
- All simulation state managed in `DoubleSlitExperiment.tsx`
- Uses local React state with props drilling
- Physics parameters defined in `types.ts` as `PhysicsParams` interface

### Key Files
- `types.ts` - All TypeScript interfaces and types
- `shaders/WaveFieldShader.ts` - GPU wave calculations
- `shaders/DetectionScreenShader.ts` - Interference pattern rendering
- `components/DoubleSlitExperiment.tsx` - Main logic and physics calculations

### Physics Implementation
- Wave calculations performed in GLSL shaders for performance
- Particle system uses Three.js BufferGeometry
- `getInterferenceIntensity()` function calculates theoretical pattern
- Coordinate system: X (propagation), Y (vertical), Z (screen width)

### Animation System
- Custom animation loop with pausable time
- Simulation time separate from wall-clock time
- Time scale adjustable via controls
- Particles spawn staggered to avoid performance spikes

## Important Considerations

### Performance
- Heavy calculations offloaded to GPU via shaders
- Use `useMemo` for expensive calculations
- Particle count limited for performance
- Animation frame updates optimized

### Physics Accuracy
- Wave equations implemented accurately in shaders
- Interference pattern follows double-slit formula
- Physical units (nm for wavelength, μm for dimensions)
- Proper scaling between physical and rendering coordinates

### No Testing Framework
Currently no testing setup. If adding tests, consider:
- Vitest for unit tests (integrates well with Vite)
- React Testing Library for component tests
- Consider adding ESLint and Prettier for code quality