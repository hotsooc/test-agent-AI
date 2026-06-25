import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 1200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Create random particles positions and velocities
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50; // Z
      
      vel[i * 3] = (Math.random() - 0.5) * 0.05;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    return [pos, vel];
  }, [count]);

  // Animate the particles
  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;

    const currentPositions = points.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    // Mouse movement influence
    const mouseX = state.pointer.x * 2;
    const mouseY = state.pointer.y * 2;

    for (let i = 0; i < count; i++) {
      // Basic movement
      currentPositions[i * 3] += velocities[i * 3];
      currentPositions[i * 3 + 1] += velocities[i * 3 + 1];
      currentPositions[i * 3 + 2] += velocities[i * 3 + 2];

      // Bounce back if they go out of bounds
      if (Math.abs(currentPositions[i * 3]) > 25) velocities[i * 3] *= -1;
      if (Math.abs(currentPositions[i * 3 + 1]) > 25) velocities[i * 3 + 1] *= -1;
      if (Math.abs(currentPositions[i * 3 + 2]) > 25) velocities[i * 3 + 2] *= -1;

      // Mouse interactive drift
      currentPositions[i * 3] += Math.sin(time + i) * 0.005 + mouseX * 0.002;
      currentPositions[i * 3 + 1] += Math.cos(time + i) * 0.005 + mouseY * 0.002;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.rotation.y = time * 0.02;
    points.rotation.x = time * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ff4655"
        size={0.12}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ThreeBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at center, #0f1923 0%, #080c10 100%)',
      }}
    >
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <Particles />
      </Canvas>
    </div>
  );
}
