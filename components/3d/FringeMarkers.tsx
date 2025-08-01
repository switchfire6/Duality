import React, { useMemo } from 'react';
import type { FringeMarkersProps } from '../../types/interfaces';

const FringeMarkers: React.FC<FringeMarkersProps> = ({ params }) => {
  const markers = useMemo(() => {
    const { wavelength, slitSeparation, screenDistance } = params;
    if (slitSeparation <= 0) return [];
    
    const fringeSpacing = (wavelength * screenDistance) / slitSeparation;
    const numMarkers = 10;
    const markerPositions = [];
    for (let i = -numMarkers; i <= numMarkers; i++) {
        markerPositions.push(
            <mesh key={i} position={[screenDistance + 0.1, 0, i * fringeSpacing]}>
                <boxGeometry args={[0.05, 1, 0.05]} />
                <meshBasicMaterial color="green" transparent opacity={0.7} />
            </mesh>
        );
    }
    return markerPositions;
  }, [params.wavelength, params.slitSeparation, params.screenDistance]);

  return <group>{markers}</group>;
};

// Custom comparison function - only re-render if relevant physics params change
const arePropsEqual = (prevProps: FringeMarkersProps, nextProps: FringeMarkersProps) => {
  return prevProps.params.wavelength === nextProps.params.wavelength &&
         prevProps.params.slitSeparation === nextProps.params.slitSeparation &&
         prevProps.params.screenDistance === nextProps.params.screenDistance;
};

export default React.memo(FringeMarkers, arePropsEqual);