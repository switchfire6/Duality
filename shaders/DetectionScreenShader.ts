
export const detectionScreenVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const detectionScreenFragmentShader = `
  uniform float uWavelength;
  uniform float uSlitSeparation;
  uniform float uScreenDistance;
  uniform float uSlitWidth;
  uniform float uMaxWidth; // To scale vUv.x to world units

  varying vec2 vUv;

  void main() {
    // Convert UV x-coordinate to world z-coordinate
    // The screen is rotated, so uv.x corresponds to the world's Z-axis.
    float z = (vUv.x - 0.5) * uMaxWidth;

    float k = 2.0 * 3.14159 / uWavelength;
    float d = uSlitSeparation;
    float D = uScreenDistance;

    // Path difference (approximation for D >> z, d)
    float pathDiff = d * z / D;
    
    // Phase difference
    float phi = k * pathDiff;
    
    // Two-slit interference term: cos²(φ/2)
    float interference = pow(cos(phi / 2.0), 2.0);
    
    // Single-slit diffraction term: sinc²(β/2) where β = k * w * sin(θ)
    // Approximation for small angles: sin(θ) ≈ z/D
    float beta = k * uSlitWidth * z / D;
    float sinc_beta_half = (beta == 0.0) ? 1.0 : sin(beta / 2.0) / (beta / 2.0);
    float diffraction = pow(sinc_beta_half, 2.0);

    // Total intensity is product of both
    float intensity = interference * diffraction;
    
    // Color with a warm tint for bright fringes
    vec3 color = vec3(intensity * 1.5, intensity * 1.2, intensity * 0.8);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
