import React from 'react';
import type { BarrierProps } from '../../types/interfaces';

const Barrier: React.FC<BarrierProps> = ({ slitSeparation, slitWidth }) => {
  const barrierThickness = 0.2;
  const barrierHeight = 2;
  const totalWidth = 12; // Total width along Z axis

  const centerPieceWidth = slitSeparation - slitWidth;
  const sidePieceCenterZ = (slitSeparation + slitWidth) / 2.0;

  return (
    <group position={[0, 0, 0]}>
      {/* Center piece between the slits */}
      {centerPieceWidth > 0.001 && 
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[barrierThickness, barrierHeight, centerPieceWidth]} />
          <meshStandardMaterial color="#333333" roughness={0.7} />
        </mesh>
      }
      {/* Outer pieces of the barrier */}
      <mesh position={[0, 0, sidePieceCenterZ + totalWidth / 2.0]}>
        <boxGeometry args={[barrierThickness, barrierHeight, totalWidth]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, -sidePieceCenterZ - totalWidth / 2.0]}>
        <boxGeometry args={[barrierThickness, barrierHeight, totalWidth]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
    </group>
  );
};

export default Barrier;