'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCapability } from '@/lib/useCapability';

// Dynamically import Three.js scene AFTER first paint to protect LCP
const DynamicHeroScene = dynamic(() => import('@/components/3d/HeroScene'), {
  ssr: false,
});

export default function HeroSceneWrapper() {
  const { tier, prefersReducedMotion } = useCapability();
  const [shouldMount3D, setShouldMount3D] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    // Only mount 3D on high or mid capability devices
    if (tier !== 'low' && !prefersReducedMotion) {
      // Delay mount slightly after initial paint to guarantee instant headline LCP
      const timer = setTimeout(() => {
        setShouldMount3D(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tier, prefersReducedMotion]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden" aria-hidden="true">
      {/* ───────────── STATIC BOTANICAL POSTER (Zero LCP Penalty) ───────────── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
          sceneReady ? 'opacity-25' : 'opacity-100'
        }`}
      >
        <Image
          src="/images/hero-homeo.jpg"
          alt="Homeopathic apothecary and botanical natural remedies at VSHMA Clinic"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover object-center filter contrast-[1.02] brightness-[0.98]"
        />
        {/* Soft emerald radial vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F3EC] via-[#121A15]/40 to-[#121A15]/65 mix-blend-multiply" />
      </div>

      {/* ───────────── LIVE 3D WEBGL CANVAS (Crossfades in on first frame) ───────────── */}
      {shouldMount3D && (
        <div
          className={`absolute inset-0 transition-opacity duration-1200 ease-out ${
            sceneReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <DynamicHeroScene onReady={() => setSceneReady(true)} />
        </div>
      )}

      {/* Soft Bottom Gradient Dissolve into Our Approach */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#F7F3EC] to-transparent pointer-events-none" />
    </div>
  );
}
