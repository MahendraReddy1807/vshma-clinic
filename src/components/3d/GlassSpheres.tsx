'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const SPHERES = [
  { position: [-2.6, 1.2, 0.5] as const, radius: 0.65, speed: 0.4 },
  { position: [2.8, -0.8, -0.5] as const, radius: 0.52, speed: 0.5 },
  { position: [-1.8, -1.6, 1.2] as const, radius: 0.42, speed: 0.35 },
  { position: [2.2, 1.8, 0.8] as const, radius: 0.38, speed: 0.45 },
];

export default function GlassSpheres() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const s = SPHERES[i];
      if (s) {
        child.position.y = s.position[1] + Math.sin(t * s.speed + i) * 0.2;
        child.position.x = s.position[0] + Math.cos(t * s.speed * 0.7 + i) * 0.1;
        child.rotation.x = t * 0.08 * s.speed;
        child.rotation.y = t * 0.12 * s.speed;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {SPHERES.map((sphere, index) => (
        <mesh key={index} position={sphere.position}>
          <sphereGeometry args={[sphere.radius, 36, 36]} />
          <meshPhysicalMaterial
            roughness={0.08}
            transmission={0.92}
            thickness={1.1}
            ior={1.5}
            reflectivity={0.7}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
            attenuationColor="#D4D8BA"
            attenuationDistance={1.4}
            color="#FFFFFF"
          />
        </mesh>
      ))}
    </group>
  );
}
