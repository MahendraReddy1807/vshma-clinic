'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCapability } from '@/lib/useCapability';

export default function CustomCursor() {
  const { isTouch, prefersReducedMotion, tier } = useCapability();
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only mount on desktop workstations
    if (isTouch || prefersReducedMotion || tier === 'low') return;

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Detect clickable elements to expand cursor ring
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('a, button, input, select, textarea, [data-cursor-hover], .clickable');
      setIsHovered(Boolean(interactive));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousemove', handleElementHover, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Smooth lerp loop
    const renderLoop = () => {
      const ease = 0.18;
      currentX += (mouseX - currentX) * ease;
      currentY += (mouseY - currentY) * ease;

      if (cursorRef.current && dotRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.6 : 1})`;
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleElementHover);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isTouch, prefersReducedMotion, tier, isHovered, isVisible]);

  if (isTouch || prefersReducedMotion || tier === 'low' || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Outer Luxury Ring */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] transition-[border-color,background-color] duration-300 border ${
          isHovered
            ? 'border-[#B89B5E] bg-[#B89B5E]/15'
            : 'border-[#121A15]/40 bg-transparent'
        }`}
        style={{ willChange: 'transform' }}
      />
      {/* Precision Center Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#B89B5E] pointer-events-none z-[9999]"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
