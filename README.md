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

## Technical Implementation

Built with:
- React 19 and TypeScript
- Three.js for 3D graphics
- React Three Fiber for declarative 3D scene management
- Custom GLSL shaders for wave field calculations
- Vite for development and building

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

## Contributing

Contributions welcome. Please submit pull requests for bug fixes or feature additions.

## License

MIT License - see [LICENSE](LICENSE) file.

## References

- Young, T. (1804). "The Bakerian Lecture: Experiments and calculations relative to physical optics"
- Feynman, R. P., Leighton, R. B., & Sands, M. (1965). The Feynman Lectures on Physics, Vol. 3
- Born, M., & Wolf, E. (1999). Principles of Optics (7th ed.)