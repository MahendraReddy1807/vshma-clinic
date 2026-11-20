'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, GraduationCap, Award } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative scroll-mt-24 overflow-hidden bg-white py-24 sm:py-32 border-b border-sage/20"
      aria-label="Doctor Profile and Story"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Large Editorial Portrait Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Subtle decorative offset shadow border */}
              <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-tr from-gold/30 to-sage/20 blur-md transform -rotate-1" />

              {/* Portrait Container */}
              <div className="relative rounded-[2.25rem] overflow-hidden bg-forest-dark border-2 border-white shadow-2xl aspect-[3/4]">
                <Image
                  src="/images/dr-chihnitha.jpg"
                  alt={`Dr. Chihnitha Reddy T, BHMS Homeopathy Doctor at VSHMA Clinic`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 450px"
                  className="object-cover object-top hover:scale-[1.02] transition-transform duration-700 ease-out"
                />

                {/* Bottom glass identity ribbon */}
                <div className="absolute inset-x-4 bottom-4 p-4 rounded-2xl bg-forest-dark/85 backdrop-blur-md border border-white/15 text-white shadow-xl">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold block">
                    Lead Practitioner
                  </span>
                  <p className="font-heading font-semibold text-lg sm:text-xl text-ivory">
                    {CLINIC_INFO.doctor}
                  </p>
                  <p className="text-xs text-sage-light font-medium mt-0.5">
                    {CLINIC_INFO.qualification} &bull; Homeopathic Medicine
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Biography & Credentials */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 sm:space-y-8"
          >
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold block font-sans">
                Doctor Profile &bull; Bengaluru
              </span>
              <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.08] tracking-tight">
                Compassionate clinical care, rooted in personal dialogue.
              </h2>
            </div>

            <div className="space-y-4 text-charcoal/80 text-base sm:text-lg leading-relaxed font-sans font-light">
              <p>
                Dr. Chihnitha Reddy T is a dedicated Homeopathy Practitioner holding a{' '}
                <strong className="font-semibold text-forest">
                  Bachelor of Homeopathic Medicine and Surgery (BHMS)
                </strong>
                . She founded VSHMA Homeopathy Clinic to create an unhurried, welcoming clinical environment for patients seeking natural and personalized healthcare.
              </p>
              <p>
                Her practice emphasizes thorough case evaluations—taking the time to understand each patient&apos;s lifestyle, stress factors, emotional disposition, and constitutional characteristics before recommending individualized homeopathic care plans.
              </p>
            </div>

            {/* Verified Credential Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-ivory border border-sage/25 flex items-start gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <GraduationCap className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">
                    Degree &amp; Training
                  </span>
                  <p className="font-heading font-semibold text-forest text-sm sm:text-base">
                    BHMS
                  </p>
                  <p className="text-[11px] text-charcoal/65">
                    Bachelor of Homeopathic Medicine &amp; Surgery
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ivory border border-sage/25 flex items-start gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <MapPin className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">
                    Clinical Location
                  </span>
                  <p className="font-heading font-semibold text-forest text-sm sm:text-base">
                    {CLINIC_INFO.city}
                  </p>
                  <p className="text-[11px] text-charcoal/65">
                    Karnataka, India &bull; Prior Appointment
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons (Fixed nested interactive element issue) */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/book"
                className="group inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-forest hover:bg-forest-light text-white font-sans font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Book Consultation</span>
                <ArrowUpRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <a
                href={CLINIC_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 font-sans font-medium text-sm transition-all duration-300"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
