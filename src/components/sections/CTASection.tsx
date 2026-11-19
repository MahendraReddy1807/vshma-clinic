'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { CLINIC_INFO } from '@/lib/constants';

export default function CTASection() {
  return (
    <section className="py-20 bg-forest text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-forest-light via-forest to-forest-dark opacity-80" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-gold font-medium uppercase tracking-widest text-xs">
            Begin Your Wellness Journey
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-6 text-white">
            Natural Care. Personal Attention.
          </h2>
          <p className="text-sage-light max-w-2xl mx-auto text-base sm:text-lg mb-8 leading-relaxed">
            Take the first step toward a personalized and holistic health consultation with Dr. Chihnitha Reddy T in Bengaluru.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book">
              <Button variant="gold" size="lg" className="w-full sm:w-auto text-forest font-semibold">
                <span>Book an Appointment</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="secondary" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white">
                <MessageCircle className="w-4 h-4 mr-2 text-[#25D366]" />
                <span>Quick WhatsApp Chat</span>
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
