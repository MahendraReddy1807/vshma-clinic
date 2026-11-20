'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, HeartHandshake, Compass } from 'lucide-react';

export default function BrandIntroSection() {
  return (
    <section
      id="brand-intro"
      className="relative py-20 lg:py-32 bg-ivory text-charcoal overflow-hidden border-b border-sage/20"
      aria-label="VSHMA Brand Introduction"
    >
      {/* Subtle organic background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sage/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Oversized Editorial Statement */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/20 text-forest text-xs font-semibold tracking-widest uppercase font-sans">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Our Philosophy</span>
            </div>

            <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.1] tracking-tight">
              &ldquo;Care is personal.{' '}
              <span className="font-normal italic text-forest-light">
                Every conversation
              </span>{' '}
              matters.&rdquo;
            </h2>

            <p className="text-charcoal/80 text-base sm:text-lg leading-relaxed font-sans max-w-xl font-light">
              At VSHMA Homeopathy Clinic, we believe healthcare shouldn&apos;t feel rushed or standardized. Every individual experiences wellness and illness differently. True care begins with dedicated listening, clinical attentiveness, and a collaborative discussion.
            </p>
          </motion.div>

          {/* Right Column: Key Tenets & Context */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-8 bg-white/70 backdrop-blur-sm p-7 sm:p-9 rounded-3xl border border-sage/25 shadow-sm"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <Compass className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-forest text-lg">
                    Individualized Consultations
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed mt-1">
                    Care is tailored to your unique history, lifestyle, and sensitivities, rather than applying generic one-size-fits-all treatments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <HeartHandshake className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-forest text-lg">
                    Transparent Communication
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed mt-1">
                    We clearly explain our assessment, discuss reasonable timelines, and support integrated care alongside your other medical providers.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-sage/20">
              <Link
                href="/about"
                className="group inline-flex items-center text-sm font-semibold text-forest hover:text-forest-light tracking-wide font-sans transition-colors"
              >
                <span>Read Dr. Chihnitha&apos;s story &amp; credentials</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
