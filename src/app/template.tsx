'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCapability } from '@/lib/useCapability';

export default function Template({ children }: { children: React.ReactNode }) {
  const { prefersReducedMotion, tier } = useCapability();
  const [animDone, setAnimDone] = useState(false);

  // On low capability or reduced-motion, render children with zero curtain overhead
  if (prefersReducedMotion || tier === 'low') {
    return <>{children}</>;
  }

  return (
    <>
      {/* ───────────── LUXURY ROUTE CURTAIN TRANSITION (650ms) ───────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key="route-curtain-top"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
          className="fixed inset-0 z-[9995] bg-[#121A15] origin-top pointer-events-none flex items-center justify-center select-none"
        >
          {/* Subtle Golden Emblem on Curtain */}
          <div className="relative w-12 h-12 flex items-center justify-center opacity-60">
            <div className="w-5 h-10 rounded-l-full bg-gradient-to-r from-[#D4D8BA] to-[#B89B5E]" />
            <div className="w-5 h-10 rounded-r-full bg-gradient-to-l from-[#D4D8BA] to-[#B89B5E]" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Render children directly without residual transform once initial entry completes */}
      {animDone ? (
        children
      ) : (
        <motion.div
          initial={{ opacity: 0.92, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setAnimDone(true)}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
