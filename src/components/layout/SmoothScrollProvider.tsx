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

    // Refresh ScrollTrigger once fonts and DOM layouts settle
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    // ───────────── Soft Section Snapping on Desktop (Proximity Snap) ─────────────
    let snapTrigger: ScrollTrigger | null = null;
    const snapSections = document.querySelectorAll<HTMLElement>('[data-snap-section]');
    if (snapSections.length > 0 && !isTouch && !prefersReducedMotion && tier === 'high') {
      snapTrigger = ScrollTrigger.create({
        snap: {
          snapTo: (progress) => {
            const totalH = document.documentElement.scrollHeight - window.innerHeight;
            if (totalH <= 0) return progress;
            const scrollY = progress * totalH;

            for (const sec of Array.from(snapSections)) {
              const secTop = sec.offsetTop;
              const dist = Math.abs(scrollY - secTop);
              // Only snap if within close proximity (18% of screen height) so it never fights the user
              if (dist < window.innerHeight * 0.18) {
                return secTop / totalH;
              }
            }
            return progress;
          },
          duration: { min: 0.25, max: 0.6 },
          delay: 0.08,
          ease: 'power2.out',
        },
      });
    }

    return () => {
      if (snapTrigger) snapTrigger.kill();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
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
