'use client';

import { motion } from 'framer-motion';
import { CalendarCheck, Phone, Stethoscope, ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { HOW_IT_WORKS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const iconMap: Record<string, React.ElementType> = {
  CalendarCheck,
  Phone,
  Stethoscope,
};

export default function HowItWorksSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#FAF9F4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="How It Works"
          subtitle="Three straightforward steps to request and arrange a consultation."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 relative">
          {HOW_IT_WORKS.map((item, idx) => {
            const Icon = iconMap[item.icon] || CalendarCheck;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="relative p-8 rounded-3xl bg-white border border-sage/20 shadow-md flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Step badge pill */}
                <div className="absolute -top-5 px-4 py-1.5 rounded-full bg-forest text-gold font-heading font-bold text-sm border-2 border-white shadow-md">
                  Step 0{item.step}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-mint text-forest flex items-center justify-center mt-3 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Icon className="w-8 h-8" />
                </div>

                <h3 className="font-heading text-2xl font-bold text-forest mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link href="/book">
            <Button size="lg" className="shadow-xl group">
              <span>Schedule Your Appointment Now</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
