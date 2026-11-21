'use client';

import React, { useEffect, useState } from 'react';
import { useCapability } from '@/lib/useCapability';

export default function FloatingGlyphs() {
  const { prefersReducedMotion, tier } = useCapability();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || tier === 'low') return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion, tier]);

  if (prefersReducedMotion || tier === 'low') return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] select-none overflow-hidden"
    >
      {/* Glyph 1: Brass Arc, Upper Left */}
      <div
        className="absolute top-[22%] left-[4%] w-8 h-16 rounded-l-full border border-[#B89B5E]/30 bg-[#B89B5E]/5 shadow-sm"
        style={{
          transform: `translate3d(0, ${scrollY * 0.12}px, 0) rotate(15deg)`,
          willChange: 'transform',
        }}
      />

      {/* Glyph 2: Sage Arch, Mid Right */}
      <div
        className="absolute top-[48%] right-[5%] w-14 h-7 rounded-t-full border border-[#D4D8BA]/40 bg-[#D4D8BA]/10 shadow-sm"
        style={{
          transform: `translate3d(0, ${scrollY * -0.09}px, 0) rotate(-10deg)`,
          willChange: 'transform',
        }}
      />

      {/* Glyph 3: Small Brass Disc, Lower Left */}
      <div
        className="absolute top-[75%] left-[6%] w-6 h-6 rounded-full border border-[#B89B5E]/35 bg-[#B89B5E]/8"
        style={{
          transform: `translate3d(0, ${scrollY * 0.16}px, 0)`,
          willChange: 'transform',
        }}
      />

      {/* Glyph 4: Inverted Sage Arc, Lower Right */}
      <div
        className="absolute top-[88%] right-[8%] w-10 h-5 rounded-b-full border border-[#D4D8BA]/30 bg-[#D4D8BA]/5"
        style={{
          transform: `translate3d(0, ${scrollY * -0.14}px, 0) rotate(20deg)`,
          willChange: 'transform',
        }}
      />
    </div>
  );
}
