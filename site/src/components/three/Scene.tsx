import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, Float } from '@react-three/drei';
import * as THREE from 'three';

export const AnimatedSphere = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Icosahedron ref={meshRef} args={[1, 1]} position={position}>
        <meshBasicMaterial
          color="#00f3ff"
          wireframe
          transparent
          opacity={0.6}
        />
      </Icosahedron>
      {/* Inner core */}
      <Icosahedron args={[0.5, 0]} position={position}>
        <meshBasicMaterial
          color="#ff00ff"
          wireframe
          transparent
          opacity={0.8}
        />
      </Icosahedron>
    </Float>
  );
};

export const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlesCount = 2000;
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  
  const color1 = new THREE.Color("#00f3ff");
  const color2 = new THREE.Color("#ff00ff");

  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 25;
    positions[i3 + 1] = (Math.random() - 0.5) * 25;
    positions[i3 + 2] = (Math.random() - 0.5) * 25;

    const mixedColor = Math.random() > 0.5 ? color1 : color2;
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

export const GridPlane = () => {
  return (
    <gridHelper 
      args={[50, 50, 0x00f3ff, 0x222222]} 
      position={[0, -5, 0]} 
      rotation={[0, 0, 0]}
    />
  );
};

