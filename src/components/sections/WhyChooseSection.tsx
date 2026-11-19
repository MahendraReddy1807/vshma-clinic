'use client';

import { motion } from 'framer-motion';
import { UserCheck, Heart, Home, MessageCircle, PhoneCall } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { WHY_CHOOSE } from '@/lib/constants';

const iconMap: Record<string, React.ElementType> = {
  UserCheck,
  Heart,
  Home,
  MessageCircle,
  PhoneCall,
};

export default function WhyChooseSection() {
  return (
    <section id="why-vshma" className="py-24 lg:py-32 bg-forest text-white relative overflow-hidden">
      {/* Decorative radial glows */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-sage/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gold/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          title="Why VSHMA"
          subtitle="A patient-focused experience with space for questions, clear next steps, and personal attention."
          light
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
          {WHY_CHOOSE.map((item, idx) => {
            const Icon = iconMap[item.icon] || Heart;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group relative p-8 rounded-3xl bg-forest-light/50 border border-sage/20 backdrop-blur-md hover:border-gold/60 transition-all duration-300 hover:-translate-y-1.5 shadow-lg"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-gold flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold group-hover:text-forest transition-all duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sage-light text-sm leading-relaxed font-light">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
