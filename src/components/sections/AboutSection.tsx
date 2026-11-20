'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, GraduationCap } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative scroll-mt-24 overflow-hidden bg-white py-24 sm:py-32 border-b border-[#D8D0BD]/40 text-charcoal"
      aria-label="Doctor Profile and Story"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Authentic Portrait with Restrained Framing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft Sand architectural offset border */}
              <div className="absolute -inset-2.5 rounded-3xl bg-[#D8D0BD]/35 -rotate-1 pointer-events-none" />

              {/* Portrait Frame */}
              <div className="relative rounded-2xl overflow-hidden bg-[#263B32] border border-[#D8D0BD] shadow-xl aspect-[4/5] sm:aspect-[3/4]">
                <Image
                  src="/images/dr-chihnitha.jpg"
                  alt={`Dr. Chihnitha Reddy T, BHMS Homeopathy Doctor at VSHMA Clinic`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 450px"
                  className="object-cover object-top"
                />

                {/* Bottom Identity Caption */}
                <div className="absolute inset-x-4 bottom-4 p-4 rounded-xl bg-forest-dark/90 backdrop-blur-md border border-white/15 text-white shadow-lg">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-sand block font-sans">
                    Lead Practitioner
                  </span>
                  <p className="font-display font-normal text-xl sm:text-2xl text-ivory">
                    {CLINIC_INFO.doctor}
                  </p>
                  <p className="text-xs text-sand/80 font-sans mt-0.5">
                    {CLINIC_INFO.qualification} &bull; Homeopathic Medicine
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Profile, Philosophy, and Verified Credentials */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 sm:space-y-8"
          >
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze block font-sans">
                Practitioner Profile &bull; Bengaluru
              </span>
              <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.08] tracking-tight">
                Compassionate clinical care, rooted in personal dialogue.
              </h2>
            </div>

            <div className="space-y-4 text-charcoal/80 text-base sm:text-lg leading-relaxed font-sans font-light">
              <p>
                Dr. Chihnitha Reddy T is a qualified Homeopathic Practitioner holding a{' '}
                <strong className="font-semibold text-forest">
                  Bachelor of Homeopathic Medicine and Surgery (BHMS)
                </strong>
                . She founded VSHMA Homeopathy Clinic to provide patients with an unhurried, private clinical environment where natural medicine is practiced with rigorous individualized attention.
              </p>
              <p>
                Her practice philosophy is grounded in classical totality case taking: understanding each patient&apos;s physical complaints alongside lifestyle rhythms, sleep, emotional stressors, and environmental triggers to select remedies tailored to the individual.
              </p>
            </div>

            {/* Verified Clinical Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F6F2E9] border border-[#D8D0BD]/70 flex items-start gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <GraduationCap className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block font-sans">
                    Medical Qualification
                  </span>
                  <p className="font-display font-normal text-forest text-lg">
                    BHMS
                  </p>
                  <p className="text-[11px] text-charcoal/65 font-sans">
                    Bachelor of Homeopathic Medicine &amp; Surgery
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F6F2E9] border border-[#D8D0BD]/70 flex items-start gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <MapPin className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bronze block font-sans">
                    Clinical Location
                  </span>
                  <p className="font-display font-normal text-forest text-lg">
                    {CLINIC_INFO.city}
                  </p>
                  <p className="text-[11px] text-charcoal/65 font-sans">
                    Karnataka, India &bull; By Prior Appointment
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/book"
                className="group inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-forest hover:bg-forest-light text-white font-sans font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span>Request a Consultation</span>
                <ArrowUpRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <a
                href={CLINIC_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-sand/30 text-charcoal border border-[#D8D0BD] font-sans font-medium text-xs uppercase tracking-wider transition-all duration-300 shadow-sm"
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
