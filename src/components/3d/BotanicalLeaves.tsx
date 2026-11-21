'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface BotanicalLeavesProps {
  count?: number;
}

function createPrng(seed = 108) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export default function BotanicalLeaves({ count = 18 }: BotanicalLeavesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.4);
    shape.bezierCurveTo(0.25, -0.1, 0.25, 0.3, 0, 0.55);
    shape.bezierCurveTo(-0.25, 0.3, -0.25, -0.1, 0, -0.4);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.015,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  // Position leaves strictly on the RIGHT side of the canvas (x: 1.0 to 4.2)
  const leafData = useMemo(() => {
    const rand = createPrng(924);
    const data = [];
    for (let i = 0; i < count; i++) {
      const x = 1.0 + rand() * 3.4;
      const y = -2.0 + rand() * 4.2;
      const z = -1.2 + rand() * 3.5;

      const scale = 0.35 + rand() * 0.35;
      const speed = 0.25 + rand() * 0.45;
      const rotSpeedX = (rand() - 0.5) * 0.25;
      const rotSpeedY = (rand() - 0.5) * 0.25;
      const rotSpeedZ = (rand() - 0.5) * 0.25;
      const offset = rand() * Math.PI * 2;

      data.push({ x, y, z, scale, speed, rotSpeedX, rotSpeedY, rotSpeedZ, offset });
    }
    return data;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    leafData.forEach((leaf, i) => {
      const ySway = Math.sin(t * leaf.speed + leaf.offset) * 0.35;
      const xDrift = Math.cos(t * leaf.speed * 0.6 + leaf.offset) * 0.18;

      dummy.position.set(leaf.x + xDrift, leaf.y + ySway, leaf.z);
      dummy.scale.setScalar(leaf.scale);
      dummy.rotation.set(
        t * leaf.rotSpeedX + leaf.offset,
        t * leaf.rotSpeedY + leaf.offset * 0.5,
        t * leaf.rotSpeedZ + Math.sin(t * 0.3) * 0.15
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
      {/* Light pale-sage translucent color - NEVER dark or black */}
      <meshStandardMaterial
        color="#8FA89B"
        roughness={0.42}
        metalness={0.04}
      />
    </instancedMesh>
  );
}
