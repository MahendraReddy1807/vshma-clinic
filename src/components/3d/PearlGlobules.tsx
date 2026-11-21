'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface PearlGlobulesProps {
  count?: number;
}

function createPrng(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export default function PearlGlobules({ count = 38 }: PearlGlobulesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Position pearls strictly on the RIGHT 50% of the screen (x: +0.6 to +4.5)
  const particles = useMemo(() => {
    const rand = createPrng(1284);
    const data = [];
    for (let i = 0; i < count; i++) {
      // Clustered towards right side of canvas (x > 0.6)
      const x = 0.8 + rand() * 3.8;
      const y = -2.2 + rand() * 4.6;
      const z = -1.5 + rand() * 4.0;

      const scale = 0.45 + rand() * 0.55;
      const speed = 0.3 + rand() * 0.5;
      const offset = rand() * Math.PI * 2;

      data.push({ x, y, z, scale, speed, offset });
    }
    return data;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      const yBob = Math.sin(t * p.speed + p.offset) * 0.25;
      const xDrift = Math.cos(t * p.speed * 0.5 + p.offset) * 0.15;

      dummy.position.set(p.x + xDrift, p.y + yBob, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.rotation.x = t * 0.08 * p.speed;
      dummy.rotation.y = t * 0.12 * p.speed;
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.15, 24, 24]} />
      {/* MeshStandardMaterial with high smoothness - ZERO transmission overhead */}
      <meshStandardMaterial
        color="#F5F3EC"
        roughness={0.18}
        metalness={0.08}
      />
    </instancedMesh>
  );
}
