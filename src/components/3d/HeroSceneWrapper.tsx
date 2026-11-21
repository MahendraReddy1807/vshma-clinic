'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCapability } from '@/lib/useCapability';

// Dynamically import lightweight Three.js scene AFTER browser is idle
const DynamicHeroScene = dynamic(() => import('@/components/3d/HeroScene'), {
  ssr: false,
});

export default function HeroSceneWrapper() {
  const { tier, prefersReducedMotion } = useCapability();
  const [shouldMount3D, setShouldMount3D] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    // Only mount on desktop 1024px+, high tier, without reduced-motion preference
    if (typeof window === 'undefined') return;
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop && tier === 'high' && !prefersReducedMotion) {
      if ('requestIdleCallback' in window) {
        const handle = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(() => {
          setShouldMount3D(true);
        }, { timeout: 1200 });
        return () => {
          if ('cancelIdleCallback' in window) {
            (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
          }
        };
      } else {
        const timer = setTimeout(() => setShouldMount3D(true), 400);
        return () => clearTimeout(timer);
      }
    }
  }, [tier, prefersReducedMotion]);

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* ───────────── STATIC BOTANICAL POSTER (High quality, zero LCP penalty) ───────────── */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
          sceneReady ? 'opacity-20' : 'opacity-100'
        }`}
      >
        <Image
          src="/images/hero-homeo.jpg"
          alt="Homeopathic botanical remedies at VSHMA Clinic"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1280px"
          className="object-cover object-right-top filter contrast-[1.02] brightness-[0.98]"
        />
        {/* Soft bone scrim overlay fading from left over text column */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EC] via-[#F7F3EC]/85 to-transparent" />
      </div>

      {/* ───────────── LIVE 3D WEBGL CANVAS (On right side, mask-faded over text) ───────────── */}
      {shouldMount3D && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            sceneReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 35%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,1) 85%)',
            maskImage: 'linear-gradient(to right, transparent 0%, transparent 35%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,1) 85%)',
          }}
        >
          <DynamicHeroScene onReady={() => setSceneReady(true)} />
        </div>
      )}

      {/* Soft Bottom Dissolve */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F7F3EC] to-transparent pointer-events-none" />
    </div>
  );
}
