'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCapability } from '@/lib/useCapability';

export default function PublicPageTemplate({ children }: { children: React.ReactNode }) {
  const { prefersReducedMotion, tier } = useCapability();

  // On low capability or reduced-motion, render children instantly with no animation
  if (prefersReducedMotion || tier === 'low') {
    return <>{children}</>;
  }

  // Phase 2: Lightweight fade plus 12px rise on page content only (never wraps fixed/sticky elements)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
