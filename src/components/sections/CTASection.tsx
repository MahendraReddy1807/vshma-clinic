'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { CLINIC_INFO } from '@/lib/constants';

export default function CTASection() {
  return (
    <section
      className="relative py-28 sm:py-36 bg-forest-dark text-white overflow-hidden border-b border-white/10"
      aria-label="Signature Closing Call to Action"
    >
      {/* Background Photography with Luxurious Dark Grading */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-homeo.jpg"
          alt="Natural botanical medicine and healing flora background"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center opacity-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/90 to-forest-dark/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(185,164,119,0.15),transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-ivory text-xs font-semibold uppercase tracking-[0.2em] font-sans"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Begin Your Wellness Journey</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-light text-4xl sm:text-6xl lg:text-7xl text-ivory leading-[1.05] tracking-tight max-w-4xl mx-auto"
        >
          Your next conversation with care begins here.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-sage-light text-base sm:text-xl font-light leading-relaxed max-w-2xl mx-auto font-sans"
        >
          Schedule an unhurried consultation with Dr. Chihnitha Reddy T (BHMS) at VSHMA Homeopathy Clinic in Bengaluru. In-clinic and virtual appointments available.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
        >
          <Link
            href="/book"
            className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-gold hover:bg-gold-light text-forest-deep font-sans font-semibold text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_10px_35px_-10px_rgba(185,164,119,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(185,164,119,0.65)] hover:-translate-y-0.5"
          >
            <span>Book a Consultation</span>
            <ArrowUpRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <a
            href={CLINIC_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 text-ivory hover:text-white border border-white/20 hover:border-white/35 font-sans font-medium text-sm tracking-wide backdrop-blur-md transition-all duration-300"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>Chat via WhatsApp (+91 {CLINIC_INFO.phone})</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
