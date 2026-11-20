'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CalendarCheck, MessageSquare, Stethoscope, ArrowRight } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';

const journeySteps = [
  {
    step: '01',
    title: 'Request a consultation',
    subtitle: 'Step One',
    description:
      'Select your preferred consultation type, date, and convenient time window via our online booking form or directly through our WhatsApp concierge.',
    icon: CalendarCheck,
    note: 'Instant booking reference generated',
  },
  {
    step: '02',
    title: 'Connect with VSHMA',
    subtitle: 'Step Two',
    description:
      'Our clinic confirms your scheduled appointment, provides directions or secure virtual session links, and answers preliminary queries.',
    icon: MessageSquare,
    note: 'Prompt confirmation via WhatsApp/phone',
  },
  {
    step: '03',
    title: 'Consult with the doctor',
    subtitle: 'Step Three',
    description:
      'Meet Dr. Chihnitha Reddy T (BHMS) for your detailed, unhurried consultation. Explore your health goals and receive tailored care guidance.',
    icon: Stethoscope,
    note: 'Unhurried 30–60 minute session',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="journey"
      className="relative scroll-mt-24 py-24 sm:py-32 bg-white text-charcoal overflow-hidden border-b border-sage/20"
      aria-label="The Consultation Journey"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest/10 text-forest text-xs font-semibold tracking-widest uppercase font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Process &bull; Simple &amp; Thoughtful</span>
          </div>

          <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.08] tracking-tight">
            The Consultation Journey
          </h2>

          <p className="text-charcoal/75 text-base sm:text-lg font-light leading-relaxed font-sans">
            A seamless three-step experience designed to make booking and attending your appointment effortless.
          </p>
        </div>

        {/* 3-Step Timeline Grid with Visual Connecting Accents */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {/* Subtle connecting line across desktop */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-px bg-gradient-to-r from-sage/30 via-gold/40 to-sage/30 -translate-y-12 z-0"
          />

          {journeySteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col justify-between p-8 rounded-[2rem] bg-ivory border border-sage/25 shadow-sm hover:shadow-xl hover:border-gold/50 transition-all duration-300 group hover:-translate-y-1.5"
              >
                <div className="space-y-6">
                  {/* Top: Step number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-light text-gold">
                      {step.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-forest text-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-sage-dark block font-sans">
                      {step.subtitle}
                    </span>
                    <h3 className="font-heading font-semibold text-xl sm:text-2xl text-forest">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-charcoal/75 text-sm sm:text-base leading-relaxed font-sans font-light">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-sage/20 flex items-center justify-between text-xs text-forest/75 font-sans font-medium">
                  <span>{step.note}</span>
                  <span className="text-gold font-bold">&bull;</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Bar */}
        <div className="mt-16 text-center">
          <Link
            href="/book"
            className="group inline-flex items-center justify-center px-8 py-4 rounded-full bg-forest hover:bg-forest-light text-white font-sans font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Begin Step 01 &mdash; Request a Consultation</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
