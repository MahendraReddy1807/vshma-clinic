'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import PearlGlobules from './PearlGlobules';
import BotanicalLeaves from './BotanicalLeaves';

function SceneRig({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 7.0));

  useFrame((state) => {
    // Gentle cursor parallax on desktop
    targetCamPos.current.x = mousePos.current.x * 0.45;
    targetCamPos.current.y = mousePos.current.y * 0.3;

    state.camera.position.lerp(targetCamPos.current, 0.035);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

interface HeroSceneProps {
  onReady?: () => void;
}

export default function HeroScene({ onReady }: HeroSceneProps) {
  const [dpr, setDpr] = useState(1.15);
  const [isInView, setIsInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [pearlCount, setPearlCount] = useState(38);
  const [leafCount, setLeafCount] = useState(18);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // Mouse move listener for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Pause rendering when tab is hidden or hero scrolls off screen
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
    };
  }, []);

  // PerformanceMonitor triggers: reduce counts and DPR if FPS drops below 50
  const handleDecline = useCallback(() => {
    setDpr(1.0);
    setPearlCount(26);
    setLeafCount(12);
  }, []);

  const shouldRender = isInView && isTabVisible;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      <Canvas
        frameloop={shouldRender ? 'always' : 'never'}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 0, 7.0], fov: 42 }}
        onCreated={() => {
          if (onReady) onReady();
        }}
      >
        <PerformanceMonitor onDecline={handleDecline} flipflops={2} factor={0.5} />
        <ambientLight intensity={0.9} color="#F5F3EC" />
        <directionalLight position={[4, 5, 5]} intensity={1.2} color="#FFFFFF" />
        <directionalLight position={[-3, -2, 2]} intensity={0.4} color="#D4D8BA" />

        <SceneRig mousePos={mousePos} />
        <PearlGlobules count={pearlCount} />
        <BotanicalLeaves count={leafCount} />
      </Canvas>
    </div>
  );
}
