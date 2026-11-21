'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import PearlGlobules from './PearlGlobules';
import BotanicalLeaves from './BotanicalLeaves';
import GlassSpheres from './GlassSpheres';
import { useCapability } from '@/lib/useCapability';

function SceneRig({ scrollProgress }: { scrollProgress: number }) {
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 7.5));
  const mousePos = useRef({ x: 0, y: 0 });

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

  useFrame((state) => {
    // Smooth camera cursor parallax
    targetCamPos.current.x = mousePos.current.x * 0.7;
    targetCamPos.current.y = mousePos.current.y * 0.45;

    // Scroll pushes camera forward into the scene and dissolves hero
    const forwardZ = 7.5 - scrollProgress * 5.5;
    targetCamPos.current.z = forwardZ;

    state.camera.position.lerp(targetCamPos.current, 0.04);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

interface HeroSceneProps {
  onReady?: () => void;
}

export default function HeroScene({ onReady }: HeroSceneProps) {
  const { isMobile, tier } = useCapability();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dpr, setDpr] = useState(isMobile ? 1.15 : 1.4);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;
      const progress = Math.min(1, Math.max(0, scrollY / height));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer to pause frameloop when hero scrolls out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Gracefully step down DPR if device struggles
  const handleIncline = useCallback(() => {
    setDpr(isMobile ? 1.25 : 1.5);
  }, [isMobile]);

  const handleDecline = useCallback(() => {
    setDpr(1.0);
  }, []);

  const globuleCount = tier === 'high' ? 90 : 45;
  const leafCount = tier === 'high' ? 32 : 18;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45, near: 0.1, far: 30 }}
        dpr={dpr}
        frameloop={isInView ? 'always' : 'never'}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        onCreated={() => {
          onReady?.();
        }}
      >
        <PerformanceMonitor onIncline={handleIncline} onDecline={handleDecline} />
        <SceneRig scrollProgress={scrollProgress} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.65} color="#FAF8F2" />
        <directionalLight position={[5, 8, 5]} intensity={1.4} color="#FFFBF0" />
        <directionalLight position={[-5, -4, -2]} intensity={0.5} color="#D4D8BA" />

        {/* Drei Pure-Code Procedural Environment (Zero external HDR downloads!) */}
        <Environment resolution={128}>
          <group rotation={[-Math.PI / 4, -0.4, 0]}>
            {/* Top Warm Fill */}
            <Lightformer form="ring" color="#FAF8F2" intensity={2} scale={10} position={[0, 6, 2]} />
            {/* Sage Accent Form */}
            <Lightformer form="rect" color="#D4D8BA" intensity={3} scale={[4, 6]} position={[-6, 2, -2]} />
            {/* Brass Subtle Rim Form */}
            <Lightformer form="circle" color="#B89B5E" intensity={2.5} scale={3} position={[6, -2, -1]} />
            {/* Deep Forest Grounding Form */}
            <Lightformer form="rect" color="#121A15" intensity={1} scale={[12, 12]} position={[0, -6, 0]} />
          </group>
        </Environment>

        {/* Signature Floating Homeopathic Pearl Globules */}
        <PearlGlobules count={globuleCount} />

        {/* Drifting Botanical Leaves */}
        <BotanicalLeaves count={leafCount} />

        {/* Refractive Hero Glass Spheres */}
        <GlassSpheres />
      </Canvas>
    </div>
  );
}
