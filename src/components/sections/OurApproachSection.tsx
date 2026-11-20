'use client';

import { motion } from 'framer-motion';
import { Leaf, Eye, HeartHandshake, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const approachSteps = [
  {
    number: '01',
    title: 'Comprehensive Case Evaluation',
    subtitle: 'Deep Listening',
    description:
      'We dedicate ample time during your initial consultation to explore not just acute symptoms, but your general health history, emotional stress, energy rhythms, and environmental triggers.',
    icon: Eye,
  },
  {
    number: '02',
    title: 'Individualized Therapeutics',
    subtitle: 'Custom Matching',
    description:
      'In classic homeopathic tradition, no two patients receive the exact same prescription for the same complaint. Remedies are carefully selected based on your unique constitutional picture.',
    icon: Leaf,
  },
  {
    number: '03',
    title: 'Continuous Follow-Up Support',
    subtitle: 'Ongoing Guidance',
    description:
      'Care doesn’t end when you leave the clinic. We evaluate shifts in your wellbeing over periodic review sessions and fine-tune your regimen as your vitality responds.',
    icon: HeartHandshake,
  },
  {
    number: '04',
    title: 'Ethical Clinical Boundaries',
    subtitle: 'Responsible Care',
    description:
      'We practice with complete transparency. We never claim miracles or discourage conventional care when necessary, actively supporting integrated approaches to patient safety.',
    icon: ShieldCheck,
  },
];

export default function OurApproachSection() {
  return (
    <section
      id="our-approach"
      className="relative scroll-mt-24 py-24 sm:py-32 bg-forest text-white overflow-hidden"
      aria-label="Our Clinical Approach"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-emerald-light/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-gold/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory">
              Clinical Methodology
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.08] tracking-tight"
          >
            A thoughtful approach to care.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sage-light/85 text-base sm:text-lg font-light leading-relaxed font-sans"
          >
            Rooted in authentic homeopathic principles, practiced with modern clinical rigour and genuine human empathy.
          </motion.p>
        </div>

        {/* 4-Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {approachSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-7 rounded-3xl bg-forest-dark/50 border border-white/10 hover:border-gold/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-light text-gold">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-forest transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-sage block">
                      {step.subtitle}
                    </span>
                    <h3 className="font-heading font-semibold text-lg sm:text-xl text-ivory mt-1">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-sage-light/80 leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-gold/80 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gold" />
                    Individualized Care
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 sm:mt-20 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-forest-dark via-forest-dark/90 to-emerald-dark/60 border border-gold/30 text-center max-w-4xl mx-auto shadow-2xl space-y-4"
        >
          <p className="font-serif italic text-lg sm:text-xl text-ivory/95 max-w-2xl mx-auto">
            &ldquo;We respect the individuality of every case. Homeopathy works with your body&apos;s natural regulatory vitality—not against it.&rdquo;
          </p>
          <div className="pt-2">
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gold hover:bg-gold-light text-forest-deep font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
            >
              Request a Consultation
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
