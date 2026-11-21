'use client';

import { ArrowUpRight, Phone } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { SITE_CONFIG } from '@/lib/site-config';
import SectionTag from '@/components/ui/luxury/SectionTag';
import PillButton from '@/components/ui/luxury/PillButton';
import RingsMap from '@/components/ui/luxury/RingsMap';

export default function CTASection() {
  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 bg-forest text-bone overflow-hidden border-b border-ink/20"
      aria-label="Clinic Contact and Location Coordination"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Heading and Coordination Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <SectionTag variant="dark">Clinic Coordination • Bengaluru</SectionTag>

            <h2 className="font-serif font-light text-4xl sm:text-5xl lg:text-6xl text-bone leading-[1.08] tracking-tight">
              Begin your conversation with thoughtful care.
            </h2>

            <p className="text-sage text-base sm:text-lg font-light leading-relaxed font-sans max-w-2xl">
              Schedule an unhurried consultation with {SITE_CONFIG.doctor.name} ({SITE_CONFIG.doctor.degree}) at VSHMA Homeopathy Clinic. In-clinic consultations in Bengaluru and secured video consultations available across India.
            </p>

            {/* Direct Interaction Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <PillButton
                variant="brass"
                href="/book"
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Request a Consultation
              </PillButton>

              <a
                href={SITE_CONFIG.contact.phoneTelHref}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-forest-light/60 hover:bg-forest-light text-bone border border-brass/30 font-sans font-medium text-xs tracking-wider transition-all duration-300"
              >
                <Phone className="w-3.5 h-3.5 text-brass" />
                <span>Call Clinic</span>
              </a>

              <a
                href={SITE_CONFIG.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-forest-light/60 hover:bg-forest-light text-bone border border-brass/30 font-sans font-medium text-xs tracking-wider transition-all duration-300"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>

            {/* 3 Detail Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-forest-light/40">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brass block font-sans">
                  Working Hours
                </span>
                <p className="font-serif text-bone text-base">{SITE_CONFIG.clinic.operatingHours.weekday}</p>
                <p className="text-[11px] text-sage/70 font-sans">By prior appointment</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brass block font-sans">
                  Direct Telephone
                </span>
                <p className="font-serif text-bone text-base">{SITE_CONFIG.contact.phoneDisplay}</p>
                <p className="text-[11px] text-sage/70 font-sans">Voice &amp; WhatsApp</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brass block font-sans">
                  Email Correspondence
                </span>
                <p className="font-serif text-bone text-base">{SITE_CONFIG.contact.email}</p>
                <p className="text-[11px] text-sage/70 font-sans">Clinical intake &amp; queries</p>
              </div>
            </div>
          </div>

          {/* Right Column: RingsMap of Clinic Location */}
          <div className="lg:col-span-5">
            <RingsMap />
          </div>

        </div>
      </div>
    </section>
  );
}
