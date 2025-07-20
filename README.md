# Interactive Double Slit Experiment

**[Live Demo](https://switchfire6.github.io/Duality/)**

A web-based visualization of the double-slit experiment demonstrating wave-particle duality in quantum physics.

## Overview

This application provides a 3D visualization of light passing through two slits, creating interference patterns that demonstrate the fundamental quantum mechanical principle of wave-particle duality. Users can adjust various parameters to explore how different conditions affect the resulting interference pattern.

### Features

- Real-time 3D visualization of wave propagation and interference
- Adjustable physics parameters:
  - Light wavelength (380-780 nm visible spectrum)
  - Slit width and separation
  - Distance to detection screen
  - Animation speed control
- Wave and particle visualization modes
- Calculated fringe spacing and pattern predictions
- GPU-accelerated rendering using WebGL shaders

## Physics Background

The double-slit experiment shows that light exhibits both wave and particle properties. When light passes through two narrow slits, it creates an interference pattern characteristic of waves. The intensity distribution is given by:

```
I(θ) = I₀ × cos²(πd sin(θ)/λ) × sinc²(πa sin(θ)/λ)
```

Where:
- `d` = separation between slits
- `a` = width of each slit
- `λ` = wavelength of light
- `θ` = angle from the central axis

## Architecture

### Component Structure

The application follows a hierarchical component architecture:

```
App.tsx
└── DoubleSlitExperiment.tsx (main state management)
    ├── Scene.tsx (3D visualization container)
    │   ├── WaveField (GPU-accelerated wave visualization)
    │   ├── DetectionScreen (interference pattern display)
    │   ├── Barrier (double slit geometry)
    │   ├── Laser (coherent light source)
    │   ├── FringeMarkers (measurement guides)
    │   └── Particles (quantum particle visualization)
    └── ControlPanel.tsx (parameter controls)
```

### State Management

- **Centralized State**: All simulation parameters managed in `DoubleSlitExperiment.tsx`
- **Immutable Updates**: React state with controlled updates for predictable behavior
- **Props Drilling**: Simple prop passing for clear data flow
- **Memoization**: Strategic use of `useMemo` for expensive calculations

### Performance Optimizations

1. **GPU Acceleration**: Heavy wave calculations offloaded to WebGL shaders
2. **Efficient Rendering**: 
   - BufferGeometry for particle systems
   - Instanced rendering for multiple particles
   - Conditional rendering based on visibility
3. **Animation Optimization**:
   - Custom animation loop with pausable time
   - Staggered particle spawning to prevent frame drops
   - Time-scaled animations independent of frame rate
4. **Memory Management**:
   - Proper cleanup of Three.js resources
   - Limited particle count with object pooling
   - Efficient texture and geometry reuse

### Error Handling Strategy

- **Graceful Degradation**: Falls back to simpler visualizations if WebGL unavailable
- **Parameter Validation**: Input bounds checking prevents invalid physics states
- **Resource Loading**: Handles shader compilation errors with informative messages
- **State Recovery**: Maintains consistent state even after errors

## Technical Implementation

Built with:
- React 19 and TypeScript
- Three.js for 3D graphics with @react-three/fiber
- React Three Fiber for declarative 3D scene management
- Custom GLSL shaders for GPU-accelerated wave field calculations
- Vite for fast development and optimized builds
- WebGL for high-performance rendering

## Installation

Prerequisites: Node.js v16+

```bash
git clone https://github.com/switchfire6/Duality.git
cd Duality
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Building

```bash
npm run build
```

Production files will be in the `dist/` directory.

## Usage Examples

1. **Wavelength dependence**: Adjust wavelength to see how color affects fringe spacing
2. **Single slit diffraction**: Set one slit width to zero to observe single-slit pattern
3. **Near/far field**: Change screen distance to transition between Fresnel and Fraunhofer regimes
4. **Particle accumulation**: Switch to particle mode to see statistical pattern emergence

## Accessibility Features

The application includes several accessibility enhancements:

- **Keyboard Navigation**: All controls accessible via keyboard with visible focus indicators
- **Screen Reader Support**: ARIA labels and live regions for dynamic content
- **Color Accessibility**: High contrast UI with WCAG-compliant color ratios
- **Reduced Motion**: Respects `prefers-reduced-motion` for users sensitive to animations
- **Descriptive Labels**: Clear, informative labels for all interactive elements
- **Status Announcements**: Live regions announce parameter changes and calculations

## Project Structure

```
src/
├── components/
│   ├── DoubleSlitExperiment.tsx  # Main component and state management
│   ├── Scene.tsx                  # 3D scene setup
│   └── ControlPanel.tsx           # UI controls
├── shaders/
│   ├── WaveFieldShader.ts         # GPU wave calculations
│   └── DetectionScreenShader.ts   # Interference pattern rendering
├── types.ts                       # TypeScript definitions
└── App.tsx                        # Application entry
```

## Development Guidelines

### Code Organization Conventions

- **Component Structure**: Each component in its own file with clear, single responsibility
- **Type Definitions**: All interfaces and types centralized in `types.ts`
- **Shader Code**: GLSL shaders isolated in dedicated modules with TypeScript wrappers
- **Constants**: Physics constants and defaults defined at module level
- **Naming**: Descriptive names following React conventions (PascalCase components, camelCase functions)

### TypeScript Usage

- **Strict Mode**: Full TypeScript strict mode enabled for type safety
- **Interface First**: Define interfaces for all props and complex data structures
- **Type Inference**: Leverage TypeScript's inference where possible, explicit where necessary
- **No `any`**: Avoid `any` type; use `unknown` or proper types instead
- **Generics**: Use generic types for reusable components and utilities

### Performance Best Practices

1. **React Optimization**:
   - Use `React.memo` for expensive pure components
   - Implement `useMemo` and `useCallback` for complex calculations
   - Avoid inline function definitions in render
   - Keep component trees shallow

2. **Three.js Optimization**:
   - Dispose of geometries, materials, and textures when unmounting
   - Use `BufferGeometry` over `Geometry` for better performance
   - Minimize draw calls with instanced rendering
   - Cache geometries and materials when possible

3. **Animation Performance**:
   - Use `requestAnimationFrame` for smooth animations
   - Batch DOM updates in animation loops
   - Implement frame rate limiting for consistency
   - Profile with Chrome DevTools for bottlenecks

4. **Bundle Optimization**:
   - Lazy load heavy dependencies when needed
   - Use Vite's code splitting for optimal chunks
   - Minimize shader code size with preprocessing
   - Enable production optimizations in build

## Contributing

Contributions welcome. Please submit pull requests for bug fixes or feature additions.

## License

MIT License - see [LICENSE](LICENSE) file.

## References

- Young, T. (1804). "The Bakerian Lecture: Experiments and calculations relative to physical optics"
- Feynman, R. P., Leighton, R. B., & Sands, M. (1965). The Feynman Lectures on Physics, Vol. 3
- Born, M., & Wolf, E. (1999). Principles of Optics (7th ed.)