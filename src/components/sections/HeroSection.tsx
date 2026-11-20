'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowDown, MapPin } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';

const headlineWords = ['Care', 'That', 'Begins', 'With', 'Understanding.'];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.65], [0, 40]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-forest-dark text-white pt-24 pb-10 sm:py-0"
      aria-label="VSHMA Homeopathy Clinic Hero"
    >
      {/* Background Image with Cinematic Grading and Atmospheric Overlay */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-0 select-none pointer-events-none"
      >
        <Image
          src="/images/hero-homeo.jpg"
          alt="Natural homeopathic remedies, botanicals, and healing flora"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center scale-105 transition-transform duration-[2200ms] ease-out will-change-transform"
        />
        {/* Multilayered cinematic dark forest overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/95 via-forest-dark/80 to-forest-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-transparent to-forest-dark/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,164,119,0.18),transparent_65%)]" />
      </motion.div>

      {/* Top spacer to ensure vertical balance */}
      <div className="hidden sm:block h-16 lg:h-20" aria-hidden="true" />

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full my-auto py-10 lg:py-16">
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center"
        >
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Eyebrow Label */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-ivory uppercase font-sans">
                VSHMA &mdash; HOMEOPATHY CLINIC &mdash; BENGALURU
              </span>
            </motion.div>

            {/* Word-by-word Animated Heading */}
            <h1 className="font-display font-light text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] xl:text-[5.75rem] text-ivory leading-[1.04] tracking-tight">
              {headlineWords.map((word, idx) => (
                <span key={word} className="inline-block overflow-hidden mr-[0.26em]">
                  <motion.span
                    className="inline-block"
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.85,
                      delay: 0.15 + idx * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {word === 'Understanding.' ? (
                      <em className="font-normal italic text-gold-light font-display">
                        {word}
                      </em>
                    ) : (
                      word
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Supporting Editorial Copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="text-sage-light/95 text-base sm:text-lg lg:text-xl font-light leading-relaxed max-w-2xl font-sans"
            >
              A more personal approach to your healthcare journey, with{' '}
              <strong className="font-semibold text-white">
                {CLINIC_INFO.doctor}
              </strong>
              , {CLINIC_INFO.qualification}. Comprehensive individualized care in Bengaluru.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5"
            >
              <Link
                href="/book"
                className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full bg-gold hover:bg-gold-light text-forest-deep font-sans font-semibold text-sm tracking-wide transition-all duration-300 shadow-[0_10px_35px_-10px_rgba(185,164,119,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(185,164,119,0.65)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>BOOK A CONSULTATION</span>
                <ArrowUpRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <a
                href="#brand-intro"
                className="group inline-flex items-center justify-center px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 text-ivory hover:text-white border border-white/20 hover:border-white/35 font-sans font-medium text-sm tracking-wide backdrop-blur-md transition-all duration-300"
              >
                <span>DISCOVER VSHMA</span>
                <ArrowDown className="w-4 h-4 ml-2 text-sage transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </motion.div>
          </div>

          {/* Right Column: Doctor Identity & 3D Medallion Artifact */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-6 sm:p-7 rounded-[2rem] bg-gradient-to-b from-white/[0.12] to-white/[0.04] border border-white/20 backdrop-blur-xl shadow-2xl space-y-6 max-w-sm mx-auto lg:ml-auto"
            >
              {/* Doctor Portrait & Monogram Badge */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-gold/60 shadow-lg shrink-0">
                  <Image
                    src="/images/dr-chihnitha.jpg"
                    alt={`${CLINIC_INFO.doctor} - ${CLINIC_INFO.qualification}`}
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold block">
                    Practitioner
                  </span>
                  <p className="font-heading font-semibold text-lg sm:text-xl text-ivory leading-tight">
                    {CLINIC_INFO.doctor}
                  </p>
                  <p className="text-xs text-sage-light font-medium">
                    {CLINIC_INFO.qualification} &bull; Homeopathy
                  </p>
                </div>
              </div>

              {/* Clinic Location & Philosophy Quote */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs text-sage-light/80">
                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>{CLINIC_INFO.location}</span>
                </div>
                <p className="text-xs text-ivory/80 leading-relaxed italic font-serif">
                  &ldquo;A clinical space dedicated to unhurried listening, gentle natural therapeutics, and thoughtful personal care.&rdquo;
                </p>
              </div>

              {/* 3D Medallion Monogram Micro Badge */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-sage-light/70 font-sans border-t border-white/10">
                <span className="uppercase tracking-widest text-[9.5px]">Official Clinic Emblem</span>
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gold/40 shadow-inner">
                  <Image
                    src="/logo-transparent.png"
                    alt="VSHMA 3D Monogram"
                    fill
                    sizes="28px"
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar: Scroll Indicator & Location Accent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.95 }}
        className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full pt-4 border-t border-white/10 flex items-center justify-between text-xs text-sage-light/75 font-sans"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="tracking-wide">Bengaluru Clinical Consultations &bull; In-Clinic &amp; Online</span>
        </div>

        <a
          href="#brand-intro"
          className="group inline-flex items-center gap-2 text-ivory/80 hover:text-gold transition-colors"
          aria-label="Scroll to introduction"
        >
          <span className="uppercase text-[10px] tracking-widest font-semibold">Scroll to Explore</span>
          <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1 group-hover:border-gold transition-colors">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="w-1 h-1.5 rounded-full bg-gold"
            />
          </div>
        </a>
      </motion.div>
    </section>
  );
}
