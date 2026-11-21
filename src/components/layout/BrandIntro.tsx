'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCapability } from '@/lib/useCapability';

export default function BrandIntro() {
  const [visible, setVisible] = useState(false);
  const { prefersReducedMotion, tier } = useCapability();

  const handleDismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem('vshma_intro_seen', 'true');
    } catch {
      // Storage access blocked
    }
  }, []);

  useEffect(() => {
    // If reduced motion or low capability tier, do not display intro
    if (prefersReducedMotion || tier === 'low') {
      return;
    }

    try {
      const seen = sessionStorage.getItem('vshma_intro_seen');
      if (!seen) {
        // Show intro once per session
        setTimeout(() => {
          setVisible(true);
        }, 0);

        // Auto-complete under 1.35 seconds
        const timer = setTimeout(() => {
          handleDismiss();
        }, 1300);

        return () => clearTimeout(timer);
      }
    } catch {
      // Storage access blocked or restricted
    }
  }, [prefersReducedMotion, tier, handleDismiss]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="brand-intro-curtain"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', transition: { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] } }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[10000] bg-[#121A15] text-[#FAF8F2] flex flex-col items-center justify-center cursor-pointer select-none"
          aria-label="VSHMA Clinic Brand Introduction (Click to skip)"
        >
          <div className="relative flex flex-col items-center">
            {/* Assembling Geometric Signature Half-Circles */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Left Arch */}
              <motion.div
                initial={{ x: -28, opacity: 0, rotate: -25 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="w-10 h-20 rounded-l-full bg-gradient-to-r from-[#D4D8BA] to-[#B89B5E] shadow-lg"
              />

              {/* Right Arch */}
              <motion.div
                initial={{ x: 28, opacity: 0, rotate: 25 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="w-10 h-20 rounded-r-full bg-gradient-to-l from-[#D4D8BA] to-[#B89B5E] shadow-lg"
              />

              {/* Central Golden Core Glow */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                transition={{ delay: 0.35, duration: 0.45 }}
                className="absolute w-5 h-5 rounded-full bg-[#FAF8F2] blur-[4px]"
              />
            </div>

            {/* Emblem Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
              className="mt-6 text-center space-y-1"
            >
              <span className="font-serif font-light text-2xl tracking-[0.25em] text-[#FAF8F2] uppercase">
                VSHMA
              </span>
              <p className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#B89B5E]">
                Homeopathy Clinic &bull; Bengaluru
              </p>
            </motion.div>

            {/* Skip hint */}
            <span className="absolute -bottom-16 text-[10px] text-[#D4D8BA]/40 tracking-widest uppercase font-sans">
              Press Esc or click to enter
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
