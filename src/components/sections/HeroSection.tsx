'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDown, MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[92vh] lg:min-h-screen w-full flex flex-col justify-between bg-[#F6F2E9] text-charcoal pt-28 sm:pt-32 pb-12 sm:pb-16 border-b border-[#D8D0BD]/40 overflow-hidden"
      aria-label="VSHMA Homeopathy Clinic Overview"
    >
      {/* Background Architectural/Botanical Atmospheric Layer */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div className="absolute right-0 top-0 w-full lg:w-7/12 h-full opacity-[0.22] mix-blend-multiply">
          <Image
            src="/images/hero-homeo.jpg"
            alt="Botanical herbs, remedies, and serene natural clinic environment"
            fill
            priority
            quality={90}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center"
          />
        </div>
        {/* Soft Sand & Warm Ivory gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F6F2E9] via-[#F6F2E9]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F6F2E9] via-transparent to-[#F6F2E9]/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Headline & Doctor Introduction */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Location & Status Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#D8D0BD] text-xs font-sans shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-forest" />
              <span className="font-semibold uppercase tracking-widest text-forest text-[11px]">
                Bengaluru, Karnataka &bull; Prior Appointment Only
              </span>
            </motion.div>

            {/* Large Sophisticated Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-light text-4xl sm:text-6xl lg:text-[4.75rem] text-forest leading-[1.06] tracking-tight"
            >
              Constitutional Homeopathy,{' '}
              <span className="italic font-normal text-bronze block sm:inline">
                Practiced with Clinical Time.
              </span>
            </motion.h1>

            {/* Thoughtful Doctor Introduction */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-charcoal/80 text-base sm:text-lg lg:text-xl font-light leading-relaxed max-w-2xl font-sans"
            >
              Led by <strong className="font-semibold text-forest">{CLINIC_INFO.doctor}</strong> ({CLINIC_INFO.qualification}), VSHMA provides personalized, unhurried consultations that look beyond surface symptoms to evaluate your constitutional vitality.
            </motion.p>

            {/* Two Clear CTAs: Primary Appointment + Secondary Doctor Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <Link
                href="/book"
                className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-forest hover:bg-forest-light text-white font-sans font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Request a Consultation</span>
                <ArrowUpRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <a
                href="#about"
                className="inline-flex items-center justify-center px-7 py-4 rounded-xl bg-white hover:bg-white/80 text-forest border border-[#D8D0BD] font-sans font-medium text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>Meet Dr. Chihnitha</span>
              </a>
            </motion.div>

            {/* Three Quiet Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl text-xs text-charcoal/70 font-sans border-t border-[#D8D0BD]/60"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-bronze shrink-0" />
                <span>45–60 Min Initial Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                <span>Individualized Therapeutics</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sage shrink-0" />
                <span>In-Clinic &amp; Secured Video</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Refined Editorial Practitioner Preview Frame */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-6 sm:p-7 rounded-2xl bg-white border border-[#D8D0BD] shadow-xl max-w-sm mx-auto lg:ml-auto space-y-5"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#D8D0BD] shadow-sm shrink-0 aspect-square">
                  <Image
                    src="/images/dr-chihnitha.jpg"
                    alt={`${CLINIC_INFO.doctor}, ${CLINIC_INFO.qualification}`}
                    fill
                    sizes="80px"
                    className="object-cover object-[center_25%]"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-bronze block font-sans">
                    Lead Practitioner
                  </span>
                  <h2 className="font-display font-normal text-xl sm:text-2xl text-forest leading-tight">
                    {CLINIC_INFO.doctor}
                  </h2>
                  <p className="text-xs text-charcoal/70 font-sans">
                    {CLINIC_INFO.qualification} &bull; Homeopathic Medicine
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D8D0BD]/50 space-y-2 text-xs text-charcoal/75 font-sans leading-relaxed">
                <p className="italic font-serif text-charcoal/85 text-sm">
                  &ldquo;A clinical space dedicated to unhurried listening, constitutional totality, and personal care.&rdquo;
                </p>
                <div className="flex items-center justify-between pt-2 text-[11px] text-charcoal/60">
                  <span>Bengaluru Clinic</span>
                  <span className="font-medium text-forest">Prior Reservation</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-Strip */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full pt-6 mt-8 border-t border-[#D8D0BD]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-charcoal/65 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-forest" />
          <span>VSHMA Homeopathy Clinic &bull; Bengaluru, Karnataka, India</span>
        </div>
        <a
          href="#consultations"
          className="inline-flex items-center gap-1.5 text-forest hover:text-bronze font-semibold transition-colors"
        >
          <span>Explore Clinical Consultations</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
}
