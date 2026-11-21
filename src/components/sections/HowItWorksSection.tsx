'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, MessageSquare, Stethoscope, ArrowRight } from 'lucide-react';
import SectionTag from '@/components/ui/luxury/SectionTag';
import PillButton from '@/components/ui/luxury/PillButton';

const JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Request Consultation',
    subtitle: 'Step One &bull; Reservation',
    description:
      'Select your clinical specialty, consultation mode (in-clinic or video), and preferred slot via our calm scheduling flow.',
    icon: CalendarCheck,
    detail: 'Instant booking reference issued',
  },
  {
    step: '02',
    title: 'Coordination & Intake',
    subtitle: 'Step Two &bull; Preparation',
    description:
      'Our clinic team confirms your appointment via WhatsApp or email, sharing directions or secure virtual session links.',
    icon: MessageSquare,
    detail: 'Prompt confirmation via WhatsApp',
  },
  {
    step: '03',
    title: 'Clinical Consultation',
    subtitle: 'Step Three &bull; Consultation',
    description:
      'Meet Dr. Chihnitha Reddy T (BHMS) for your detailed case exploration, constitutional evaluation, and tailored remedy plan.',
    icon: Stethoscope,
    detail: '45–60 min initial session',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="journey"
      data-nav-theme="light"
      data-snap-section
      className="relative scroll-mt-[var(--nav-h)] min-h-[calc(100svh-var(--nav-h))] lg:h-[calc(100svh-var(--nav-h))] flex flex-col justify-center py-6 lg:py-8 bg-cream text-ink overflow-hidden border-b border-ink/10"
      aria-label="The Consultation Journey"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8 lg:mb-10">
          <SectionTag>Clinical Journey &bull; Simple &amp; Thoughtful</SectionTag>

          <h2 className="font-serif font-light text-chapter-title text-forest leading-[1.05] tracking-tight">
            The Consultation Journey
          </h2>

          <p className="text-ink/75 text-xs sm:text-sm lg:text-base font-light leading-relaxed font-sans max-w-lg mx-auto">
            A seamless three-step clinical experience designed to make scheduling and attending your consultation calm and transparent.
          </p>
        </div>

        {/* 3-Step Grid with Drawn Connecting Line on Desktop */}
        <div className="relative">
          {/* Subtle connecting line across cards on desktop */}
          <div aria-hidden="true" className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-brass/10 via-brass/40 to-brass/10 z-0 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 relative z-10">
            {JOURNEY_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col justify-between p-5 lg:p-6 rounded-2xl bg-bone border border-ink/10 shadow-sm hover:shadow-lg hover:border-brass/40 transition-all duration-300 group max-h-card-desktop"
                >
                  <div className="space-y-3">
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-2xl font-light text-brass">
                        {step.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-forest text-brass flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                        <Icon className="w-4 h-4 text-brass" />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-brass block font-sans">
                        {step.subtitle}
                      </span>
                      <h3 className="font-serif font-normal text-xl text-forest leading-snug">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-ink/75 text-xs sm:text-sm leading-relaxed font-sans font-light line-clamp-3">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-ink/10 flex items-center justify-between text-[11px] text-forest/80 font-sans font-medium">
                    <span>{step.detail}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-6 lg:pt-8">
          <PillButton
            variant="dark"
            size="md"
            href="/book"
            className="in-page-book-btn"
            icon={<ArrowRight className="w-4 h-4 text-brass" />}
          >
            Start Your Journey
          </PillButton>
        </div>
      </div>
    </section>
  );
}
