'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from '@/lib/useCapability';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ChapterDepthTransitions() {
  const { isTouch, prefersReducedMotion, tier } = useCapability();

  useEffect(() => {
    // Only apply 3D chapter depth transitions on desktop workstations with high tier
    if (isTouch || prefersReducedMotion || tier !== 'high') return;

    const sections = document.querySelectorAll<HTMLElement>('section[data-snap-section]');
    if (sections.length === 0) return;

    const ctx = gsap.context(() => {
      sections.forEach((sec, idx) => {
        // Target the inner container rather than the section itself so fixed/pinned ancestors remain unaffected
        const inner = (sec.querySelector<HTMLElement>('.max-w-7xl') || sec.firstElementChild) as HTMLElement;
        if (!inner) return;

        // Skip ConsultationsSection which has its own horizontal pin-scroll
        if (sec.id === 'consultations') return;

        if (idx < sections.length - 1) {
          const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 88;

          gsap.to(inner, {
            scale: 0.94,
            opacity: 0.82,
            rotateX: 4,
            transformPerspective: 1200,
            transformOrigin: '50% 100%',
            ease: 'none',
            scrollTrigger: {
              trigger: sec,
              start: () => `top top+=${navH}`,
              end: 'bottom top',
              scrub: true,
              onLeave: () => {
                gsap.set(inner, { clearProps: 'transform' });
              },
            },
          });
        }
      });
    });

    return () => ctx.revert();
  }, [isTouch, prefersReducedMotion, tier]);

  return null;
}
