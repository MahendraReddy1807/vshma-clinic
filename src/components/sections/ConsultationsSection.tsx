'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  ArrowUpRight,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';
import SectionTag from '@/components/ui/luxury/SectionTag';
import GlyphIcon from '@/components/ui/luxury/GlyphIcon';

export default function ConsultationsSection() {
  const { consultations } = SITE_CONFIG;
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = consultations.length;

  const nextCard = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevCard = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') nextCard();
      else if (e.key === 'ArrowLeft') prevCard();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCard, prevCard]);

  // Plain descriptions tailored to 2 clean lines without truncation
  const shortDescriptions: Record<string, string> = {
    'general-consultation':
      'Comprehensive intake evaluating your physical complaints, lifestyle rhythms, and medical history.',
    'ongoing-review':
      'Focused follow-up sessions tracking remedy response, adjusting potencies, and guiding recovery.',
    'pediatric-care':
      'Gentle, taste-free natural remedies for childhood immunity, sleep rhythms, and gentle growth support.',
    'womens-health':
      'Holistic care for hormonal cycles, menstrual balance, postpartum recovery, and life transitions.',
    'skin-dermatology':
      'Internal constitutional care addressing eczema, allergies, and acne from root sensitivities.',
    'digestive-health':
      'Individualized support restoring gut balance, digestion rhythms, and soothing food sensitivities.',
  };

  return (
    <section
      id="consultations"
      ref={containerRef}
      data-nav-theme="dark"
      className="relative scroll-mt-[var(--nav-h)] bg-[#0A0F0C] text-[#F7F3EC] py-6 lg:py-8 min-h-[calc(100svh-var(--nav-h))] lg:h-[calc(100svh-var(--nav-h))] flex flex-col justify-between overflow-hidden"
      aria-label="Clinical Consultations CoverFlow"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-40 w-80 h-80 rounded-full bg-[#D4D8BA]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-80 h-80 rounded-full bg-[#B89B5E]/8 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full h-full flex flex-col justify-between z-10">
        {/* ───────────── TOP HEADER ROW ───────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1 sm:pt-2">
          <div className="max-w-2xl space-y-1.5 sm:space-y-2">
            <SectionTag variant="dark">Consultations</SectionTag>
            <h2 className="font-serif font-light text-chapter-title text-[#F7F3EC] leading-[1.05] tracking-tight">
              Consultations tailored to your personal health story.
            </h2>
            <p className="text-[#D8D0BD]/80 text-xs sm:text-sm font-light font-sans max-w-xl">
              Each clinical session provides dedicated time to explore your symptoms, lifestyle rhythms, and remedy response.
            </p>
          </div>

          {/* Desktop Arrow Controls */}
          <div className="hidden sm:flex items-center gap-2 pb-1">
            <button
              type="button"
              onClick={prevCard}
              aria-label="Previous consultation"
              className="w-11 h-11 rounded-full border border-white/20 bg-white/5 hover:bg-[#B89B5E] hover:text-[#0A0F0C] hover:border-[#B89B5E] text-[#EDE6D3] flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextCard}
              aria-label="Next consultation"
              className="w-11 h-11 rounded-full border border-white/20 bg-white/5 hover:bg-[#B89B5E] hover:text-[#0A0F0C] hover:border-[#B89B5E] text-[#EDE6D3] flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ───────────── 3D COVERFLOW STAGE ───────────── */}
        <div className="relative w-full my-auto py-3 select-none" style={{ perspective: '1100px' }}>
          {/* Coverflow Flex Track */}
          <div className="relative flex items-center justify-center h-[340px] sm:h-[370px] lg:h-[390px] w-full">
            {consultations.map((item, idx) => {
              // Calculate offset relative to active card (-2, -1, 0, 1, 2)
              let offset = idx - activeIndex;
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;

              const isCenter = offset === 0;
              const isVisible = Math.abs(offset) <= 2;

              if (!isVisible) return null;

              // 3D coverflow transforms
              // Active: rotateY 0, scale 1.0, zIndex 30, dim 1.0
              // Side: rotateY ~32 deg, scale 0.86, zIndex 20/10, dimmed to 0.55
              const rotateY = isCenter ? 0 : offset > 0 ? -32 : 32;
              const scale = isCenter ? 1.0 : 0.86;
              const xTranslation = isCenter
                ? 0
                : offset > 0
                ? offset === 1
                  ? 260
                  : 430
                : offset === -1
                ? -260
                : -430;
              const opacity = isCenter ? 1.0 : Math.abs(offset) === 1 ? 0.65 : 0.3;
              const zIndex = isCenter ? 30 : 20 - Math.abs(offset);

              const desc =
                shortDescriptions[item.id] ||
                item.description ||
                'Personalized clinical homeopathic consultation with comprehensive intake.';

              return (
                <motion.div
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  animate={{
                    x: xTranslation,
                    rotateY,
                    scale,
                    opacity,
                    zIndex,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 26,
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_e, info) => {
                    if (info.offset.x > 50) prevCard();
                    else if (info.offset.x < -50) nextCard();
                  }}
                  className={`absolute w-[300px] sm:w-[350px] lg:w-[380px] h-[320px] sm:h-[350px] lg:h-[365px] rounded-[24px] p-5 sm:p-6 flex flex-col justify-between border cursor-pointer transition-colors duration-300 ${
                    isCenter
                      ? 'bg-[#121A15] border-[#B89B5E]/70 shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-[#B89B5E]/30'
                      : 'bg-[#121A15]/75 border-white/10 shadow-xl hover:border-white/25'
                  }`}
                >
                  {/* Top Bar: Number & Glyph */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-xs tracking-wider text-[#B89B5E]">
                          {item.number}
                        </span>
                        <span className="text-white/20">&bull;</span>
                        <span className="text-[11px] font-sans text-[#D4D8BA]/70 uppercase tracking-wider">
                          {item.category || 'Specialty'}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#B89B5E]">
                        <GlyphIcon name={item.glyph} size={18} />
                      </div>
                    </div>

                    {/* Title & 2-Line Plain Description */}
                    <div className="mt-3.5 space-y-1.5">
                      <h3 className="font-serif font-light text-xl sm:text-2xl text-[#F7F3EC] leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#D8D0BD]/80 font-sans font-light leading-relaxed line-clamp-2">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Metadata & Book Button */}
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    {/* Chips Row: Duration, In-Clinic, Video */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-[11px] font-sans text-[#EDE6D3] border border-white/10">
                        <Clock className="w-3 h-3 text-[#B89B5E]" />
                        <span>{item.durationInitial}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-[11px] font-sans text-[#EDE6D3] border border-white/10">
                        <MapPin className="w-3 h-3 text-[#D4D8BA]" />
                        <span>In-Clinic</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-[11px] font-sans text-[#EDE6D3] border border-white/10">
                        <Video className="w-3 h-3 text-[#D4D8BA]" />
                        <span>Video</span>
                      </span>
                    </div>

                    {/* Book Button: Solid Brass Pill (Prominent, Accessible) */}
                    <div>
                      <Link
                        href={`/book?consultation=${item.id}`}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                          isCenter
                            ? 'bg-[#B89B5E] hover:bg-[#CEB57D] text-[#121A15] shadow-md hover:shadow-lg'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        <span>Book this</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ───────────── BOTTOM CONTROLS & PAGINATION DOTS ───────────── */}
        <div className="pb-1 sm:pb-2 flex items-center justify-between">
          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {consultations.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to consultation ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === idx
                    ? 'w-7 h-2 bg-[#B89B5E]'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Quick Counter */}
          <span className="text-xs font-sans text-[#D4D8BA]/70">
            {activeIndex + 1} of {total}
          </span>
        </div>
      </div>
    </section>
  );
}
