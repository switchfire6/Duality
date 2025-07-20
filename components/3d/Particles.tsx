import React, { useMemo } from 'react';
import type { ParticlesProps } from '../../types/interfaces';

const Particles: React.FC<ParticlesProps> = ({ particles }) => {
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particles.length * 3);
    particles.forEach((p, i) => {
      positions[i * 3] = p.position[0];
      positions[i * 3 + 1] = p.position[1];
      positions[i * 3 + 2] = p.position[2];
    });
    return positions;
  }, [particles]);

  if (particles.length === 0) return null;

  return (
    <points>
      <bufferGeometry key={particles.length}>
        <bufferAttribute
          attach="attributes-position"
          array={particlePositions}
          count={particles.length}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="yellow" size={0.1} sizeAttenuation />
    </points>
  );
};

export default Particles;