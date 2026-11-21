'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface BotanicalLeavesProps {
  count?: number;
}

// Pure deterministic pseudo-random generator (avoids Math.random during render)
function createPrng(seed = 108) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export default function BotanicalLeaves({ count = 30 }: BotanicalLeavesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Sculpt procedural curved leaf geometry using Bezier curves
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.5);
    shape.bezierCurveTo(0.35, -0.15, 0.35, 0.35, 0, 0.7);
    shape.bezierCurveTo(-0.35, 0.35, -0.35, -0.15, 0, -0.5);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  // Generate leaf drift data with deterministic PRNG
  const leafData = useMemo(() => {
    const rand = createPrng(924);
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = 3.0 + rand() * 5.0;
      const angle = rand() * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const y = (rand() - 0.5) * 5.0;
      const z = -1.5 + rand() * 5.0;

      const scale = 0.4 + rand() * 0.45;
      const speed = 0.35 + rand() * 0.6;
      const rotSpeedX = (rand() - 0.5) * 0.4;
      const rotSpeedY = (rand() - 0.5) * 0.4;
      const rotSpeedZ = (rand() - 0.5) * 0.4;
      const offset = rand() * Math.PI * 2;

      data.push({ x, y, z, scale, speed, rotSpeedX, rotSpeedY, rotSpeedZ, offset });
    }
    return data;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    leafData.forEach((leaf, i) => {
      const ySway = Math.sin(t * leaf.speed + leaf.offset) * 0.45;
      const xDrift = Math.cos(t * leaf.speed * 0.7 + leaf.offset) * 0.25;

      dummy.position.set(leaf.x + xDrift, leaf.y + ySway, leaf.z);
      dummy.scale.setScalar(leaf.scale);
      dummy.rotation.set(
        t * leaf.rotSpeedX + leaf.offset,
        t * leaf.rotSpeedY + leaf.offset * 0.5,
        t * leaf.rotSpeedZ + Math.sin(t * 0.5) * 0.2
      );
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[leafGeometry, undefined, count]}
      frustumCulled={false}
    >
      <meshPhysicalMaterial
        color="#2D4A38"
        roughness={0.28}
        metalness={0.05}
        transmission={0.4}
        thickness={0.3}
        ior={1.42}
        clearcoat={0.3}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
