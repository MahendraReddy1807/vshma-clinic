'use client';

import { motion } from 'framer-motion';
import {
  UserCheck,
  MessageCircle,
  Heart,
  PhoneCall,
  Sparkles,
  CalendarCheck,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

const values = [
  {
    icon: UserCheck,
    title: 'Individual Attention',
    subtitle: 'No Rushed Appointments',
    description:
      'We never double-book slots. Each appointment is reserved exclusively for you, providing unhurried time to share your complete health chronology.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Practitioner Dialogue',
    subtitle: 'Transparent & Collaborative',
    description:
      'You communicate directly with Dr. Chihnitha Reddy T. We explain the reasoning behind your care plan and discuss expectations clearly.',
  },
  {
    icon: ClipboardList,
    title: 'Constitutional Totality',
    subtitle: 'In-Depth Case Taking',
    description:
      'We evaluate your physical complaints alongside sleep rhythms, lifestyle pressures, and emotional dispositions to select matching individualized remedies.',
  },
  {
    icon: CalendarCheck,
    title: 'Thoughtful Coordination',
    subtitle: 'Orderly Scheduling',
    description:
      'From prompt booking requests to reminder notifications, appointments are scheduled with care to respect your time and convenience.',
  },
  {
    icon: PhoneCall,
    title: 'Follow-Up Arrangements',
    subtitle: 'Continuous Guidance',
    description:
      'Care is an ongoing partnership. We provide structured review timelines (typically 3–6 weeks) to monitor your vitality and calibrate dosages.',
  },
  {
    icon: Heart,
    title: 'Welcoming Environment',
    subtitle: 'Calm & Restorative',
    description:
      'A serene clinical setting in Bengaluru where your comfort, dignity, and confidentiality are respected at every moment.',
  },
];

export default function WhyChooseSection() {
  return (
    <section
      id="why-vshma"
      className="relative scroll-mt-24 py-24 sm:py-32 bg-[#263B32] text-white overflow-hidden border-b border-white/10"
      aria-label="Why Choose VSHMA Homeopathy Clinic"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Editorial Statement */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 space-y-6 lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-sand" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand font-sans">
                The VSHMA Standard
              </span>
            </div>

            <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-[#F6F2E9] leading-[1.08] tracking-tight">
              Why patients choose VSHMA.
            </h2>

            <p className="text-sand/85 text-base sm:text-lg font-light leading-relaxed font-sans">
              We have shaped our clinic around genuine human attentiveness, medical ethics, and unhurried doctor-patient relationships.
            </p>

            <div className="pt-2">
              <Link
                href="/book"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-sand hover:bg-sand-light text-forest font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-sm"
              >
                Schedule Your Visit
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 6 Feature Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 sm:p-7 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-sand/40 transition-all duration-300 space-y-3.5 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-sand border border-white/15 group-hover:bg-sand group-hover:text-forest transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sand/80 block font-sans">
                      {v.subtitle}
                    </span>
                    <h3 className="font-display font-normal text-xl text-[#F6F2E9]">
                      {v.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-light font-sans">
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
