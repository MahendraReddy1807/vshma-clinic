'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCapability } from '@/lib/useCapability';

export interface SageCardProps {
  children: React.ReactNode;
  variant?: 'sage' | 'bone' | 'cream' | 'forest' | 'white';
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  index?: number;
}

export default function SageCard({
  children,
  variant = 'sage',
  className = '',
  hoverEffect = true,
  onClick,
  index = 0,
}: SageCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isTouch, prefersReducedMotion } = useCapability();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverEffect || isTouch || prefersReducedMotion || !cardRef.current) return;
    if (rafId.current !== null) return; // Throttled to display refresh rate

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const xPct = (x / rect.width - 0.5) * 2;
      const yPct = (y / rect.height - 0.5) * 2;

      // Maximum 6 degrees tilt (Phase 2.3 spec)
      const rotateY = xPct * 5.8;
      const rotateX = -yPct * 5.8;

      setTilt({
        rotateX,
        rotateY,
        glowX: (x / rect.width) * 100,
        glowY: (y / rect.height) * 100,
      });
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  };

  const variantStyles = {
    sage: 'bg-[#D4D8BA] text-[#161815] border border-[#161815]/10 shadow-[0_4px_20px_-8px_rgba(18,26,21,0.08)]',
    bone: 'bg-[#E3E4DC] text-[#161815] border border-[#161815]/10 shadow-[0_4px_20px_-8px_rgba(18,26,21,0.06)]',
    cream: 'bg-[#EDE6D3] text-[#161815] border border-[#161815]/10 shadow-[0_4px_20px_-8px_rgba(18,26,21,0.06)]',
    forest: 'bg-[#121A15] text-[#F7F3EC] border border-white/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]',
    white: 'bg-white text-[#161815] border border-[#D8D0BD]/70 shadow-[0_4px_24px_-10px_rgba(18,26,21,0.08)]',
  }[variant];

  return (
    <div style={{ perspective: 1000 }} className="w-full">
      <motion.div
        ref={cardRef}
        onClick={onClick}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
          delay: index * 0.12,
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={
          isHovered
            ? {
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
              y: -6,
              scale: 1.015,
            }
            : {
              rotateX: 0,
              rotateY: 0,
              y: 0,
              scale: 1,
            }
        }
        className={`relative rounded-[18px] p-6 sm:p-8 transition-colors duration-300 overflow-hidden ${variantStyles} ${onClick ? 'cursor-pointer' : ''
          } ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Dynamic radial highlight that follows cursor */}
        {isHovered && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 260px at ${tilt.glowX}% ${tilt.glowY}%, rgba(255, 255, 255, 0.22), transparent 70%)`,
            }}
          />
        )}
        <div style={{ transform: isHovered ? 'translateZ(14px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
