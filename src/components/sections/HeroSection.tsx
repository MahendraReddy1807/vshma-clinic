'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Leaf } from 'lucide-react';
import Button from '@/components/ui/Button';
import { CLINIC_INFO } from '@/lib/constants';
import { useRef } from 'react';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] lg:min-h-screen flex items-center pt-28 pb-16 lg:py-0 overflow-hidden bg-[#FAF9F4]"
    >
      {/* Decorative ambient gradient blooms */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sage/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-gold/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typography & CTAs */}
          <motion.div
            style={{ opacity: opacityText }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 lg:pr-6"
          >
            {/* Pill Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-sage/30 shadow-sm backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-xs font-semibold tracking-wide text-forest uppercase">
                Natural Care &bull; Personal Attention
              </span>
              <Sparkles className="w-3.5 h-3.5 text-gold" />
            </motion.div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl xl:text-6xl font-semibold text-forest leading-[1.04] tracking-[-.035em]">
              Natural care,{' '}
              <span className="italic font-normal text-sage-dark relative">
                personal
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-gold/60 -z-10"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,10 Q50,0 100,10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </span>{' '}
              attention.
            </h1>

            {/* Sub-headline */}
            <p className="text-gray-700 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl font-light">
              Meet <strong className="font-semibold text-forest">{CLINIC_INFO.doctor}</strong> ({CLINIC_INFO.qualification}) at VSHMA in Bengaluru. Get in touch to learn about consultations and appointment availability.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="/book">
                <Button size="lg" className="w-full sm:w-auto shadow-xl hover:shadow-2xl group text-base font-semibold">
                  <span>Schedule Consultation</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-base font-medium border-forest/30 hover:border-forest"
                >
                  <span>Meet Dr. Chihnitha</span>
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-8 border-t border-sage/25 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
              <div className="space-y-0.5">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-forest">BHMS</p>
                <p className="text-xs text-gray-500 font-medium">Doctor&apos;s qualification</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-forest">VSHMA</p>
                <p className="text-xs text-gray-500 font-medium">Homeopathy Clinic</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-forest">Bengaluru</p>
                <p className="text-xs text-gray-500 font-medium">Karnataka, India</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Real Visual Showcase */}
          <motion.div
            style={{ y: yBg }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Visual Frame */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-gold/30 via-sage/20 to-mint blur-xl opacity-70 transform rotate-1 scale-105" />

              {/* Main Image Container */}
              <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-white shadow-2xl bg-white aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src="/images/hero-homeo.jpg"
                  alt="Homeopathic medicine bottle with natural remedies and botanicals"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 42vw"
                  className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-700 ease-out"
                />

                {/* Subtle gradient vignette */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 flex items-center gap-2.5 rounded-full border border-white/25 bg-forest/75 px-4 py-2.5 text-white shadow-lg backdrop-blur-lg sm:bottom-6 sm:left-6">
                  <Leaf className="h-4 w-4 text-[#d8c498]" />
                  <span className="text-[11px] font-medium tracking-wide sm:text-xs">VSHMA <span className="mx-1 text-white/45">·</span> Bengaluru</span>
                </div>
              </div>

              {/* Floating doctor preview card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -top-6 -right-4 sm:-right-6 p-3 sm:p-4 rounded-2xl glass-panel shadow-xl flex items-center gap-3 border border-white animate-float"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-gold shrink-0">
                  <Image
                    src="/images/dr-chihnitha.jpg"
                    alt={CLINIC_INFO.doctor}
                    fill
                    sizes="48px"
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-forest">{CLINIC_INFO.doctor}</p>
                  <p className="text-[10px] text-sage font-medium">{CLINIC_INFO.qualification} &bull; Bengaluru</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
