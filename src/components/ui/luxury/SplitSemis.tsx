'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface SplitSemisProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspect?: string;
  badgeContent?: React.ReactNode;
}

export default function SplitSemis({
  src,
  alt,
  className = '',
  priority = false,
  aspect = 'aspect-[3/4]',
  badgeContent,
}: SplitSemisProps) {
  return (
    <div className={`relative ${aspect} w-full max-w-md mx-auto ${className}`}>
      {/* Decorative hairline offset frame */}
      <div className="absolute -inset-2.5 rounded-[32px] border border-[#D8D0BD]/40 -rotate-1 pointer-events-none" />

      {/* Main Masked Container */}
      <div className="relative h-full w-full flex flex-col gap-2 overflow-hidden rounded-[28px]">
        {/* Top Semi-Circle (Arch) */}
        <motion.div
          initial={{ y: -16, opacity: 0.8 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative flex-1 w-full rounded-t-[140px] overflow-hidden border border-[#D8D0BD]/70 shadow-sm bg-[#121A15]"
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 90vw, 480px"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#121A15]/20 pointer-events-none" />
        </motion.div>

        {/* Bottom Semi-Circle (Inverted Arch) */}
        <motion.div
          initial={{ y: 16, opacity: 0.8 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
          className="relative flex-1 w-full rounded-b-[140px] overflow-hidden border border-[#D8D0BD]/70 shadow-sm bg-[#121A15]"
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 90vw, 480px"
            className="object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121A15]/40 via-transparent to-transparent pointer-events-none" />

          {/* Optional Badge floating at bottom of container */}
          {badgeContent && (
            <div className="absolute inset-x-4 bottom-4 z-10">
              {badgeContent}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
