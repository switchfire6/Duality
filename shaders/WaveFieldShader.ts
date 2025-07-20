
export const waveFieldVertexShader = `
  uniform float uTime;
  uniform float uWavelength;
  uniform float uSlitSeparation;
  uniform float uAmplitude;
  uniform float uSlitWidth;
  uniform float uWaveSpeed;

  varying vec3 vColor;

  void main() {
    vec3 pos = position; // Local position

    // Use world coordinates for distance calculations
    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;

    float k = 2.0 * 3.14159 / uWavelength;
    float omega = k * uWaveSpeed; // Angular frequency, now controlled by wave speed

    // Slits are on the Z axis
    vec3 slit1 = vec3(0.0, 0.0, uSlitSeparation / 2.0);
    vec3 slit2 = vec3(0.0, 0.0, -uSlitSeparation / 2.0);

    // We only care about the distance in the XZ plane for r1/r2
    float r1 = distance(worldPos.xz, slit1.xz);
    float r2 = distance(worldPos.xz, slit2.xz);
    
    // Amplitude decay, clamped to prevent division by zero / infinite spikes
    float amp1 = min(3.0, 1.0 / sqrt(max(0.1, r1)));
    float amp2 = min(3.0, 1.0 / sqrt(max(0.1, r2)));

    // Superposition of two waves
    float wave1 = amp1 * cos(k * r1 - omega * uTime);
    float wave2 = amp2 * cos(k * r2 - omega * uTime);

    float totalWave = wave1 + wave2;

    // Displace vertex along the local Z axis, which becomes world Y after mesh rotation.
    pos.z += totalWave * uAmplitude;

    // Color mapping
    vec3 positiveColor = vec3(1.0, 0.6, 0.0);
    vec3 negativeColor = vec3(0.0, 0.6, 1.0);
    
    float mixFactor = clamp(totalWave * 0.5 + 0.5, 0.0, 1.0);
    vec3 mixedColor = mix(negativeColor, positiveColor, mixFactor);
    
    float intensity = clamp(abs(totalWave), 0.0, 1.0);
    
    vColor = mixedColor * intensity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const waveFieldFragmentShader = `
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;
