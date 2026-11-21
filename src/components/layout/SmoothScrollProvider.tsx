'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from '@/lib/useCapability';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

let activeLenis: Lenis | null = null;

interface SmoothScrollContextType {
  scrollTo: (target: string | HTMLElement, options?: { offset?: number; duration?: number }) => void;
  getLenis: () => Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  scrollTo: () => {},
  getLenis: () => null,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { isTouch, prefersReducedMotion, tier } = useCapability();

  useEffect(() => {
    if (isTouch || prefersReducedMotion || tier === 'low') {
      return;
    }

    const instance = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    activeLenis = instance;
    instance.on('scroll', ScrollTrigger.update);

    const updateRaf = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      instance.destroy();
      gsap.ticker.remove(updateRaf);
      activeLenis = null;
    };
  }, [isTouch, prefersReducedMotion, tier]);

  const scrollTo = useCallback((target: string | HTMLElement, options?: { offset?: number; duration?: number }) => {
    if (activeLenis) {
      activeLenis.scrollTo(target, {
        offset: options?.offset ?? -80,
        duration: options?.duration ?? 1.2,
      });
    } else {
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const getLenis = useCallback(() => activeLenis, []);

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, getLenis }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
