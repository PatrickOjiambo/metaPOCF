import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { AnimatedSphere, ParticleField, GridPlane } from './Scene';
import { Suspense } from 'react';

export const HeroScene = () => {
  return (
    <div className="absolute inset-0 w-full h-full -z-10">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
          
          <AnimatedSphere position={[0, 0, 0]} />
          <ParticleField />
          <GridPlane />
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
