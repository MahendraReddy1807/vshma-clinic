'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, GraduationCap, Phone, ShieldCheck } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import SectionTag from '@/components/ui/luxury/SectionTag';
import PillButton from '@/components/ui/luxury/PillButton';

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative scroll-mt-24 overflow-hidden bg-bone py-24 sm:py-32 border-b border-ink/10 text-ink"
      aria-label="Doctor Profile and Story"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Authentic Architectural Portrait Framing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Subtle hairline architectural outline */}
              <div className="absolute -inset-2.5 rounded-t-[148px] rounded-b-[28px] border border-brass/30 -rotate-1 pointer-events-none" />

              {/* Portrait Arch Frame with Clean Centered Focal Point */}
              <div className="relative rounded-t-[140px] rounded-b-[24px] overflow-hidden bg-forest border border-brass/40 shadow-2xl aspect-[3/4]">
                <Image
                  src="/images/dr-chihnitha.jpg"
                  alt={`${SITE_CONFIG.doctor.name}, ${SITE_CONFIG.doctor.degree} Homeopathy Doctor at VSHMA Clinic`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-cover object-center"
                  priority
                />
              </div>

              {/* Clear Identity Plaque Positioned Below Image (No Obscuring Overlay) */}
              <div className="mt-4 p-4 rounded-2xl bg-forest text-bone border border-brass/30 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brass block font-sans">
                    Lead Practitioner &bull; Bengaluru
                  </span>
                  <p className="font-serif font-light text-xl text-bone">
                    {SITE_CONFIG.doctor.name}
                  </p>
                  <p className="text-xs text-sage/80 font-sans mt-0.5">
                    {SITE_CONFIG.doctor.degree} &bull; Classical Homeopathy
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-forest-light/60 border border-brass/40 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-brass" />
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
              <SectionTag>Practitioner Profile • Bengaluru</SectionTag>
              <h2 className="font-serif font-light text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.08] tracking-tight">
                Compassionate clinical care, rooted in personal dialogue.
              </h2>
            </div>

            <div className="space-y-4 text-ink/80 text-base sm:text-lg leading-relaxed font-sans font-light">
              <p>
                {SITE_CONFIG.doctor.name} is a qualified Homeopathic Practitioner holding a{' '}
                <strong className="font-medium text-forest">
                  Bachelor of Homeopathic Medicine and Surgery (BHMS)
                </strong>
                . She founded VSHMA Homeopathy Clinic to provide patients with an unhurried, private clinical environment where classical totality homeopathy is practiced with rigorous individualized attention.
              </p>
              <p>
                Her practice philosophy is grounded in classical case taking: understanding each patient&apos;s physical complaints alongside lifestyle rhythms, sleep, emotional stressors, and environmental triggers to select remedies tailored to the unique constitution.
              </p>
            </div>

            {/* Verified Clinical Credentials & Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-card bg-cream border border-ink/10 flex items-start gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <GraduationCap className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brass block font-sans">
                    Medical Qualification
                  </span>
                  <p className="font-serif font-normal text-forest text-lg">
                    {SITE_CONFIG.doctor.degree}
                  </p>
                  <p className="text-[11px] text-ink/65 font-sans">
                    Bachelor of Homeopathic Medicine &amp; Surgery
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-card bg-cream border border-ink/10 flex items-start gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <ShieldCheck className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brass block font-sans">
                    State Council Registration
                  </span>
                  <p className="font-serif font-normal text-forest text-lg">
                    BHMS Registered
                  </p>
                  <p className="text-[11px] text-ink/65 font-sans">
                    Karnataka Homeopathic Board &bull; On File
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-card bg-cream border border-ink/10 flex items-start gap-3.5 shadow-sm sm:col-span-2">
                <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center shrink-0 text-forest">
                  <MapPin className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brass block font-sans">
                    Clinical Location &bull; Consultations
                  </span>
                  <p className="font-serif font-normal text-forest text-base">
                    {SITE_CONFIG.clinic.city}, {SITE_CONFIG.clinic.state}
                  </p>
                  <p className="text-[11px] text-ink/65 font-sans">
                    {SITE_CONFIG.clinic.operatingHours.weekday} &bull; Consultations by Prior Reservation
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Book, Call, WhatsApp */}
            <div className="pt-4 flex flex-wrap items-center gap-3.5">
              <PillButton
                variant="brass"
                href="/book"
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Request a Consultation
              </PillButton>

              <a
                href={SITE_CONFIG.contact.phoneTelHref}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-cream hover:bg-sage/40 text-ink border border-ink/15 font-sans font-medium text-xs tracking-wider transition-all duration-300"
              >
                <Phone className="w-3.5 h-3.5 text-forest" />
                <span>Call Clinic</span>
              </a>

              <a
                href={SITE_CONFIG.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-cream hover:bg-sage/40 text-ink border border-ink/15 font-sans font-medium text-xs tracking-wider transition-all duration-300"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
