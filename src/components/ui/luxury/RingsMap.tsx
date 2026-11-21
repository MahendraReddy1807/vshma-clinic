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
      {/* Concentric Architectural Rings Drawn with Animated SVG Strokes */}
      <div className="relative w-[340px] sm:w-[460px] lg:w-[540px] h-[340px] sm:h-[460px] lg:h-[540px] flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none select-none" viewBox="0 0 540 540">
          {/* Ring 4 (Outermost) */}
          <motion.circle
            cx="270"
            cy="270"
            r="265"
            fill="none"
            stroke="#D8D0BD"
            strokeOpacity="0.25"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.2, 0.7, 0.2, 1] }}
          />
          {/* Ring 3 */}
          <motion.circle
            cx="270"
            cy="270"
            r="200"
            fill="none"
            stroke="#D8D0BD"
            strokeOpacity="0.4"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
          />
          {/* Ring 2 */}
          <motion.circle
            cx="270"
            cy="270"
            r="145"
            fill="#D4D8BA"
            fillOpacity="0.08"
            stroke="#D8D0BD"
            strokeOpacity="0.6"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          />
          {/* Ring 1 (Inner Gold Accent) */}
          <motion.circle
            cx="270"
            cy="270"
            r="95"
            fill="#B89B5E"
            fillOpacity="0.12"
            stroke="#B89B5E"
            strokeOpacity="0.65"
            strokeWidth="1.2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          />
        </svg>

        {/* Pulsing Pin Center */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
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
            <h4 className="font-serif font-normal text-xl sm:text-2xl text-[#121A15]">
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
            <span>Open Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
