'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface PearlGlobulesProps {
  count?: number;
}

// Pure deterministic pseudo-random generator (avoids Math.random during render)
function createPrng(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export default function PearlGlobules({ count = 80 }: PearlGlobulesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate stable deterministic positions and bob frequencies
  const particles = useMemo(() => {
    const rand = createPrng(1284);
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = 3.5 + rand() * 5.5;
      const theta = rand() * Math.PI * 2;
      const phi = (rand() - 0.5) * Math.PI * 0.8;

      const x = radius * Math.cos(theta) * Math.cos(phi);
      const y = (rand() - 0.5) * 5.5;
      const z = -2 + rand() * 6.5;

      const scale = 0.55 + rand() * 0.75;
      const speed = 0.4 + rand() * 0.8;
      const offset = rand() * Math.PI * 2;

      data.push({ x, y, z, scale, speed, offset });
    }
    return data;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      // Unhurried vertical bob and gentle horizontal drift
      const yBob = Math.sin(t * p.speed + p.offset) * 0.35;
      const xDrift = Math.cos(t * p.speed * 0.6 + p.offset) * 0.2;

      dummy.position.set(p.x + xDrift, p.y + yBob, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.rotation.x = t * 0.1 * p.speed;
      dummy.rotation.y = t * 0.15 * p.speed;
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.18, 28, 28]} />
      <meshPhysicalMaterial
        color="#FAF8F2"
        roughness={0.14}
        metalness={0.02}
        clearcoat={0.9}
        clearcoatRoughness={0.12}
        reflectivity={0.65}
        ior={1.48}
      />
    </instancedMesh>
  );
}
