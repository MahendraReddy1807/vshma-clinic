'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, ShieldCheck, MapPin, ChevronDown } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';
import SectionTag from '@/components/ui/luxury/SectionTag';
import PillButton from '@/components/ui/luxury/PillButton';
import GridLines from '@/components/ui/luxury/GridLines';
import HeroSceneWrapper from '@/components/3d/HeroSceneWrapper';

export default function HeroSection() {
  const { doctor, clinic } = SITE_CONFIG;

  return (
    <section
      id="hero"
      data-nav-theme="light"
      data-snap-section
      className="relative w-full min-h-[calc(100svh-var(--nav-h))] lg:h-[calc(100svh-var(--nav-h))] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-3 lg:py-4 overflow-hidden bg-[#F7F3EC] scroll-mt-[var(--nav-h)]"
      aria-label="VSHMA Homeopathy Clinic Hero"
    >
      {/* ───────────── ARCHITECTURAL FULL-BLEED FRAMED CONTAINER ───────────── */}
      <div className="relative w-full max-w-7xl mx-auto h-full max-h-[calc(100svh-var(--nav-h)-1.5rem)] rounded-[24px] sm:rounded-[28px] border border-[#D8D0BD]/60 bg-gradient-to-b from-[#F7F3EC] via-[#EDE6D3]/40 to-[#F7F3EC] p-5 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden shadow-[0_12px_40px_-20px_rgba(18,26,21,0.08)]">

        {/* Subtle Architectural Hairline Grid Overlay */}
        <GridLines opacity="opacity-40" />

        {/* ───────────── SIGNATURE 3D HERO SCENE & POSTER BACKDROP ───────────── */}
        <HeroSceneWrapper />

        {/* Corner Concave Quarter-Circle Accents */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -bottom-6 -left-6 w-12 h-12 rounded-full border border-[#D8D0BD]/80 bg-[#F7F3EC] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -bottom-6 -right-6 w-12 h-12 rounded-full border border-[#D8D0BD]/80 bg-[#F7F3EC] pointer-events-none"
        />

        {/* ───────────── TOP EYEBROW STATUS ───────────── */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <SectionTag variant="light" pulseDot={true}>
              {clinic.city}, {clinic.state} &bull; Prior Appointment Only
            </SectionTag>
          </motion.div>
        </div>

        {/* ───────────── MAIN EDITORIAL CONTENT (Centered vertically with soft bone scrim) ───────────── */}
        <div className="relative z-10 max-w-3xl my-auto p-4 sm:p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-[#F7F3EC]/95 via-[#F7F3EC]/85 to-transparent space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Three-Line Masked Serif Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            className="font-display font-light text-chapter-title text-[#121A15] leading-[1.04] tracking-tight"
          >
            Homeopathy that starts with listening.
          </motion.h1>

          {/* Calm Plain-Language Editorial Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="text-[#161815]/90 text-sm sm:text-base lg:text-lg font-light leading-relaxed max-w-2xl font-sans"
          >
            Led by <strong className="font-semibold text-[#121A15]">{doctor.name}</strong> ({doctor.degree}), VSHMA provides focused, private clinical consultations in Bengaluru, listening attentively to your physical symptoms and personal health story.
          </motion.p>

          {/* Action Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="flex flex-wrap items-center gap-3 pt-1"
          >
            <PillButton
              variant="dark"
              size="md"
              href="/book"
              className="in-page-book-btn"
              icon={<ArrowUpRight className="w-4 h-4 text-[#B89B5E]" />}
            >
              Request a Consultation
            </PillButton>

            <PillButton
              variant="outline"
              size="md"
              href="#about"
            >
              Meet the Doctor
            </PillButton>
          </motion.div>
        </div>

        {/* ───────────── BOTTOM BAR: TRUST STRIP & ELEGANT SCROLL CUE ───────────── */}
        <div className="relative z-10 pt-3 border-t border-[#D8D0BD]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#161815]/75 font-sans">
          {/* Trust Strip: Shows values from site-config when populated */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#B89B5E] shrink-0" />
              <span>45–60 Min First Sessions</span>
            </div>

            {doctor.registrationNumber && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#121A15] shrink-0" />
                <span>Reg: {doctor.registrationNumber}</span>
              </div>
            )}

            {doctor.yearsExperience && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#121A15] shrink-0" />
                <span>{doctor.yearsExperience} Experience</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#A3AA81] shrink-0" />
              <span>Bengaluru Clinic &amp; Virtual</span>
            </div>
          </div>

          {/* Elegant Scroll Cue */}
          <a
            href="#approach"
            aria-label="Scroll to Philosophy Chapter"
            className="hidden lg:inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#B89B5E] hover:text-[#121A15] transition-colors group cursor-pointer"
          >
            <span>Scroll to Explore</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
