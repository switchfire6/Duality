import React from 'react';

const Laser: React.FC = () => (
  // Group is rotated so its local Y axis points along the world X axis
  <group position={[-3.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
    <mesh>
      <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
      <meshStandardMaterial color="#c00000" emissive="#500000" roughness={0.3} metalness={0.8} />
    </mesh>
    <mesh position={[0, 2, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 3, 16]} />
      <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} transparent opacity={0.5} />
    </mesh>
  </group>
);

export default Laser;