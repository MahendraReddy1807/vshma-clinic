'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';

export interface RingsMapProps {
  className?: string;
}

export default function RingsMap({ className = '' }: RingsMapProps) {
  const { clinic } = SITE_CONFIG;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden py-12 ${className}`}>
      {/* Concentric Architectural Rings */}
      <div className="relative w-[340px] sm:w-[460px] lg:w-[540px] h-[340px] sm:h-[460px] lg:h-[540px] flex items-center justify-center">
        {/* Ring 4 (Outermost) */}
        <div className="absolute inset-0 rounded-full border border-[#D8D0BD]/25" />

        {/* Ring 3 */}
        <div className="absolute inset-8 sm:inset-12 rounded-full border border-[#D8D0BD]/40" />

        {/* Ring 2 */}
        <div className="absolute inset-16 sm:inset-24 rounded-full border border-[#D8D0BD]/60 bg-[#D4D8BA]/10" />

        {/* Ring 1 (Innermost Glow Zone) */}
        <div className="absolute inset-24 sm:inset-36 rounded-full border border-[#B89B5E]/50 bg-[#B89B5E]/10" />

        {/* Pulsing Pin Center */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 flex flex-col items-center text-center p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-[#D8D0BD] shadow-xl max-w-xs space-y-3"
        >
          <div className="relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B89B5E] opacity-75" />
            <div className="relative w-12 h-12 rounded-full bg-[#121A15] text-[#D4D8BA] flex items-center justify-center shadow-md">
              <MapPin className="w-6 h-6 text-[#B89B5E]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#B89B5E] block">
              In-Clinic Consultations
            </span>
            <h4 className="font-display font-normal text-xl sm:text-2xl text-[#121A15]">
              {clinic.city}, {clinic.state}
            </h4>
            <p className="text-xs text-[#161815]/70 font-sans leading-relaxed">
              {clinic.landmarks}
            </p>
          </div>

          <a
            href={clinic.googleMapsPlaceUrl || 'https://maps.google.com/?q=Bengaluru+Karnataka+India'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[#121A15] hover:text-[#B89B5E] transition-colors pt-1"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
