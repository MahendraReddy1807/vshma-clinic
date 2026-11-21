'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';
import SectionTag from '@/components/ui/luxury/SectionTag';
import PillButton from '@/components/ui/luxury/PillButton';
import GridLines from '@/components/ui/luxury/GridLines';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const { doctor, clinic } = SITE_CONFIG;

  return (
    <section
      className="relative min-h-[94vh] lg:min-h-screen w-full flex flex-col justify-center px-4 sm:px-6 lg:px-10 pt-28 sm:pt-32 pb-14 sm:pb-20 overflow-hidden bg-[#F7F3EC]"
      aria-label="VSHMA Homeopathy Clinic Hero"
    >
      {/* ───────────── ARCHITECTURAL FULL-BLEED FRAMED CONTAINER ───────────── */}
      <div className="relative w-full max-w-7xl mx-auto rounded-[28px] border border-[#D8D0BD]/60 bg-gradient-to-b from-[#F7F3EC] via-[#EDE6D3]/40 to-[#F7F3EC] p-6 sm:p-12 lg:p-16 overflow-hidden shadow-[0_12px_40px_-20px_rgba(18,26,21,0.08)]">
        
        {/* Subtle Architectural Hairline Grid Overlay */}
        <GridLines opacity="opacity-40" />

        {/* Ambient Foliage Photography with Slow Zoom Entrance */}
        <motion.div
          initial={{ scale: shouldReduceMotion ? 1 : 1.18, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.22 }}
          transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-0 w-full lg:w-7/12 h-full pointer-events-none select-none mix-blend-multiply overflow-hidden"
        >
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    rotate: [0, 0.5, 0],
                    scale: [1, 1.02, 1],
                  }
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
            className="w-full h-full relative"
          >
            <Image
              src="/images/hero-homeo.jpg"
              alt="Serene natural clinic environment and botanical remedies"
              fill
              priority
              quality={88}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 750px"
              className="object-cover object-center"
            />
          </motion.div>
          {/* Edge Feather Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EC] via-[#F7F3EC]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F7F3EC] via-transparent to-[#F7F3EC]/30" />
        </motion.div>

        {/* Corner Concave Quarter-Circle Accents */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -bottom-6 -left-6 w-14 h-14 rounded-full border border-[#D8D0BD]/80 bg-[#F7F3EC] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -bottom-6 -right-6 w-14 h-14 rounded-full border border-[#D8D0BD]/80 bg-[#F7F3EC] pointer-events-none"
        />

        {/* ───────────── HERO CONTENT ───────────── */}
        <div className="relative z-10 max-w-3xl space-y-7 sm:space-y-9">
          
          {/* Eyebrow Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <SectionTag variant="light" pulseDot={true}>
              {clinic.city}, {clinic.state} &bull; Prior Appointment Only
            </SectionTag>
          </motion.div>

          {/* Three-Line Masked Serif Headline */}
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
              className="font-display font-light text-4xl sm:text-6xl lg:text-[4.75rem] text-[#121A15] leading-[1.05] tracking-tight"
            >
              Homeopathy that starts with listening.
            </motion.h1>
          </div>

          {/* Calm Plain-Language Editorial Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="text-[#161815]/80 text-base sm:text-lg lg:text-xl font-light leading-relaxed max-w-2xl font-sans"
          >
            Led by <strong className="font-semibold text-[#121A15]">{doctor.name}</strong> ({doctor.degree}), VSHMA provides unhurried, private consultations in Bengaluru. We evaluate the whole person alongside lifestyle rhythms, sleep, and environmental triggers to formulate tailored homeopathic care.
          </motion.p>

          {/* Action Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1"
          >
            <PillButton
              variant="dark"
              size="lg"
              href="/book"
              icon={<ArrowUpRight className="w-4 h-4 text-[#B89B5E]" />}
            >
              Request a Consultation
            </PillButton>

            <PillButton
              variant="outline"
              size="lg"
              href="#about"
            >
              Meet {doctor.name.split(' ')[0]} {doctor.name.split(' ')[1]}
            </PillButton>
          </motion.div>

          {/* Quiet Trust Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.65 }}
            className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl text-xs text-[#161815]/75 font-sans border-t border-[#D8D0BD]/50"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#B89B5E] shrink-0" />
              <span>45–60 Min First Sessions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#121A15] shrink-0" />
              <span>Individualized Therapeutics</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#A3AA81] shrink-0" />
              <span>In-Clinic &amp; Virtual Sessions</span>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
