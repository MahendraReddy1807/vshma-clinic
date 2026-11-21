'use client';

import { motion } from 'framer-motion';
import { CalendarCheck, MessageSquare, Stethoscope, ArrowRight } from 'lucide-react';
import SectionTag from '@/components/ui/luxury/SectionTag';
import PillButton from '@/components/ui/luxury/PillButton';

const JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Request a consultation',
    subtitle: 'Step One • Reservation',
    description:
      'Select your consultation specialty, mode (in-clinic or virtual video), and preferred slot via our calm booking interface.',
    icon: CalendarCheck,
    detail: 'Instant booking reference issued',
  },
  {
    step: '02',
    title: 'Coordination & Intake',
    subtitle: 'Step Two • Preparation',
    description:
      'Our clinic concierge verifies your appointment, provides directions or secure virtual session links, and assists with previous records.',
    icon: MessageSquare,
    detail: 'Prompt confirmation via WhatsApp & Email',
  },
  {
    step: '03',
    title: 'Individualized Dialogue',
    subtitle: 'Step Three • Totality',
    description:
      'Meet Dr. Chihnitha Reddy T (BHMS) for your detailed case exploration, constitutional totality analysis, and tailored remedy plan.',
    icon: Stethoscope,
    detail: '45–60 min initial session • 20–30 min reviews',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="journey"
      className="relative scroll-mt-24 py-24 sm:py-32 bg-cream text-ink overflow-hidden border-b border-ink/10"
      aria-label="The Consultation Journey"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <SectionTag>Process • Simple &amp; Thoughtful</SectionTag>

          <h2 className="font-serif font-light text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.08] tracking-tight">
            The Consultation Journey
          </h2>

          <p className="text-ink/75 text-base sm:text-lg font-light leading-relaxed font-sans">
            A seamless three-step clinical experience designed to make requesting and attending your homeopathic consultation calm and transparent.
          </p>
        </div>

        {/* 3-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {JOURNEY_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col justify-between p-8 rounded-card bg-bone border border-ink/10 shadow-sm hover:shadow-xl hover:border-brass/40 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="space-y-6">
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-light text-brass">
                      {step.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-forest text-brass flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-brass" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brass block font-sans">
                      {step.subtitle}
                    </span>
                    <h3 className="font-serif font-normal text-2xl text-forest">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-ink/75 text-sm sm:text-base leading-relaxed font-sans font-light">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-ink/10 flex items-center justify-between text-xs text-forest/80 font-sans font-medium">
                  <span>{step.detail}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Bar */}
        <div className="mt-16 text-center">
          <PillButton
            variant="brass"
            href="/book"
            icon={<ArrowRight className="w-4 h-4 ml-1" />}
          >
            Begin Step 01 &mdash; Request a Consultation
          </PillButton>
        </div>
      </div>
    </section>
  );
}
