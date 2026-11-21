'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, GraduationCap, Phone, ShieldCheck, Quote } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';
import SectionTag from '@/components/ui/luxury/SectionTag';
import PillButton from '@/components/ui/luxury/PillButton';

export default function AboutSection() {
  return (
    <section
      id="about"
      data-nav-theme="light"
      data-snap-section
      className="relative scroll-mt-[var(--nav-h)] overflow-hidden bg-bone py-6 lg:py-8 min-h-[calc(100svh-var(--nav-h))] lg:h-[calc(100svh-var(--nav-h))] flex flex-col justify-center border-b border-ink/10 text-ink"
      aria-label="Doctor Profile and Story"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Authentic Architectural Portrait Framing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              {/* Subtle hairline architectural outline */}
              <div className="absolute -inset-2 rounded-t-[120px] rounded-b-[24px] border border-brass/30 -rotate-1 pointer-events-none" />

              {/* Portrait Arch Frame with Clean Centered Focal Point */}
              <div className="relative rounded-t-[115px] rounded-b-[20px] overflow-hidden bg-forest border border-brass/40 shadow-xl aspect-[3/4] max-h-[46vh]">
                <Image
                  src="/images/dr-chihnitha.jpg"
                  alt={`${SITE_CONFIG.doctor.name}, ${SITE_CONFIG.doctor.degree} Homeopathy Doctor at VSHMA Clinic`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 420px"
                  className="object-cover object-center"
                  priority
                />
              </div>

              {/* Clear Identity Plaque Positioned Cleanly Below Image */}
              <div className="mt-3 p-3.5 rounded-2xl bg-forest text-bone border border-brass/30 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brass block font-sans">
                    Lead Practitioner &bull; Bengaluru
                  </span>
                  <p className="font-serif font-light text-lg text-bone">
                    {SITE_CONFIG.doctor.name}
                  </p>
                  <p className="text-xs text-sage/80 font-sans mt-0.5">
                    {SITE_CONFIG.doctor.degree} &bull; Classical Homeopathy
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-forest-light/60 border border-brass/40 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-brass" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Profile, Philosophy, and Verified Credentials */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-4 lg:space-y-5"
          >
            <div className="space-y-2">
              <SectionTag>Practitioner Profile &bull; Bengaluru</SectionTag>
              <h2 className="font-serif font-light text-chapter-title text-forest leading-[1.05] tracking-tight">
                Compassionate clinical care, rooted in personal dialogue.
              </h2>
            </div>

            <div className="space-y-2.5 text-ink/80 text-xs sm:text-sm lg:text-base leading-relaxed font-sans font-light">
              <p>
                {SITE_CONFIG.doctor.name} holds a{' '}
                <strong className="font-medium text-forest">
                  Bachelor of Homeopathic Medicine and Surgery (BHMS)
                </strong>
                . She founded VSHMA Homeopathy Clinic to provide patients with a private, focused clinical environment where natural medicine is practiced with rigorous clinical attention.
              </p>
              <p>
                Her practice philosophy is grounded in classical case taking: understanding each patient&apos;s physical complaints alongside lifestyle rhythms, sleep, and emotional stressors to select tailored constitutional remedies.
              </p>
            </div>

            {/* Practitioner Short Philosophy Quote */}
            <div className="p-3.5 rounded-2xl bg-cream border border-ink/10 flex items-start gap-3 text-xs sm:text-sm text-forest italic font-serif">
              <Quote className="w-4 h-4 text-brass shrink-0 mt-0.5" />
              <p>&ldquo;{SITE_CONFIG.doctor.philosophyQuote}&rdquo;</p>
            </div>

            {/* Verified Clinical Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-cream border border-ink/10 flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <GraduationCap className="w-4 h-4 text-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brass block font-sans">
                    Qualification
                  </span>
                  <p className="font-serif text-sm font-medium text-forest">
                    {SITE_CONFIG.doctor.degree} &bull; Classical Homeopathy
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-cream border border-ink/10 flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <MapPin className="w-4 h-4 text-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brass block font-sans">
                    Location
                  </span>
                  <p className="font-serif text-sm font-medium text-forest">
                    {SITE_CONFIG.clinic.city}, Karnataka &bull; Prior Appt
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Book, Call */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <PillButton
                variant="brass"
                size="md"
                href="/book"
                className="in-page-book-btn"
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Request a Consultation
              </PillButton>

              <a
                href={SITE_CONFIG.contact.phoneTelHref}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-cream hover:bg-sage/40 text-ink border border-ink/15 font-sans font-medium text-xs tracking-wider transition-all duration-300"
              >
                <Phone className="w-3.5 h-3.5 text-forest" />
                <span>Call Clinic</span>
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
