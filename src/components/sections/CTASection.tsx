'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles, MapPin, Clock, Phone, Mail } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { CLINIC_INFO } from '@/lib/constants';

export default function CTASection() {
  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 bg-[#263B32] text-white overflow-hidden border-b border-white/10"
      aria-label="Clinic Contact and Appointment Coordination"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Main Banner Heading */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-sand text-xs font-semibold uppercase tracking-[0.2em] font-sans">
            <Sparkles className="w-3.5 h-3.5 text-sand" />
            <span>Clinic Coordination &bull; Bengaluru</span>
          </div>

          <h2 className="font-display font-light text-4xl sm:text-6xl text-[#F6F2E9] leading-[1.08] tracking-tight">
            Begin your conversation with thoughtful care.
          </h2>

          <p className="text-sand/85 text-base sm:text-lg font-light leading-relaxed font-sans">
            Schedule an unhurried consultation with Dr. Chihnitha Reddy T (BHMS) at VSHMA Homeopathy Clinic. In-clinic visits in Bengaluru and secured video consultations available across India.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-sand hover:bg-sand-light text-forest font-sans font-semibold text-xs tracking-widest uppercase transition-all shadow-sm"
            >
              <span>Request a Consultation</span>
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>

            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-sans font-medium text-xs tracking-wider uppercase transition-all"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>Message on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 4 Clinic Information Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-white/15">
          <div className="p-5 rounded-xl bg-white/[0.05] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-sand text-xs font-bold uppercase tracking-wider font-sans">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </div>
            <p className="font-display text-lg text-white">Bengaluru</p>
            <p className="text-xs text-white/70 font-sans">Karnataka, India &bull; Prior Appointment</p>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.05] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-sand text-xs font-bold uppercase tracking-wider font-sans">
              <Clock className="w-4 h-4" />
              <span>Working Hours</span>
            </div>
            <p className="font-display text-lg text-white">Mon &ndash; Sat: 9 AM &ndash; 7 PM</p>
            <p className="text-xs text-white/70 font-sans">Sunday by prior arrangement</p>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.05] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-sand text-xs font-bold uppercase tracking-wider font-sans">
              <Phone className="w-4 h-4" />
              <span>Clinic Phone</span>
            </div>
            <p className="font-display text-lg text-white">+91 {CLINIC_INFO.phone}</p>
            <p className="text-xs text-white/70 font-sans">Direct WhatsApp &amp; voice calls</p>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.05] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-sand text-xs font-bold uppercase tracking-wider font-sans">
              <Mail className="w-4 h-4" />
              <span>Email Enquiries</span>
            </div>
            <p className="font-display text-lg text-white">{CLINIC_INFO.email}</p>
            <p className="text-xs text-white/70 font-sans">General clinical correspondence</p>
          </div>
        </div>

      </div>
    </section>
  );
}
