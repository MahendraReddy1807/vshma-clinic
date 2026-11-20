'use client';

import { motion } from 'framer-motion';
import { UserCheck, MessageCircle, Heart, PhoneCall, Sparkles } from 'lucide-react';
import Link from 'next/link';

const values = [
  {
    icon: UserCheck,
    title: 'Personal Attention',
    subtitle: 'No Rushed Appointments',
    description:
      'We never double-book or rush through appointments. Your consultation is reserved exclusively for you, providing ample time to share your complete health story.',
  },
  {
    icon: MessageCircle,
    title: 'Clear Communication',
    subtitle: 'Transparent & Collaborative',
    description:
      'We demystify your care plan, explain the reasoning behind our homeopathic therapeutics, and provide realistic expectations for progressive recovery.',
  },
  {
    icon: Heart,
    title: 'Welcoming Experience',
    subtitle: 'Tranquil Environment',
    description:
      'Designed to feel calm and restorative. Whether visiting in-clinic in Bengaluru or connecting virtually, your dignity, comfort, and privacy come first.',
  },
  {
    icon: PhoneCall,
    title: 'Follow-Up Discussions',
    subtitle: 'Ongoing Partnership',
    description:
      'Care is a continuous dialogue. We offer responsive follow-up communication to guide you through remedy reactions and track your wellness trajectory.',
  },
];

export default function WhyChooseSection() {
  return (
    <section
      id="why-vshma"
      className="relative scroll-mt-24 py-24 sm:py-32 bg-forest-dark text-white overflow-hidden border-b border-white/10"
      aria-label="Why Choose VSHMA Homeopathy Clinic"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 -left-32 w-[30rem] h-[30rem] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[30rem] h-[30rem] bg-emerald-light/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Statement */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory">
                The VSHMA Standard
              </span>
            </div>

            <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.08] tracking-tight">
              Why patients place their trust in VSHMA.
            </h2>

            <p className="text-sage-light/85 text-base sm:text-lg font-light leading-relaxed font-sans">
              We have redesigned the clinical consultation from the ground up—prioritizing genuine attentiveness, medical ethics, and unhurried doctor-patient relationships.
            </p>

            <div className="pt-4">
              <Link
                href="/book"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-gold hover:bg-gold-light text-forest-deep font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
              >
                Schedule Your Visit
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 4 Editorial Feature Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="p-7 rounded-3xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-gold/40 backdrop-blur-md transition-all duration-300 space-y-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-forest-light/60 flex items-center justify-center text-gold border border-white/15 group-hover:bg-gold group-hover:text-forest transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sage block font-sans">
                      {v.subtitle}
                    </span>
                    <h3 className="font-heading font-semibold text-xl text-ivory">
                      {v.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-sage-light/80 leading-relaxed font-light font-sans">
                    {v.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
