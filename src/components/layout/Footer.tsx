'use client';

import Link from 'next/link';
import { MapPin, Shield, ArrowUp, Phone, Mail, Clock } from 'lucide-react';
import { NAV_LINKS, CLINIC_INFO } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#1B2A24] text-white border-t border-white/10" aria-label="Clinic Footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10 items-start">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-block" aria-label="VSHMA Home">
              <BrandLogo size="lg" theme="light" showSubtitle={true} />
            </Link>
            <p className="font-display italic text-lg text-sand/90 leading-snug">
              &ldquo;Care That Begins With Understanding.&rdquo;
            </p>
            <p className="text-white/75 text-xs sm:text-sm leading-relaxed max-w-sm font-sans font-light">
              VSHMA Homeopathy Clinic is dedicated to personalized, compassionate, and constitutional classical homeopathic care under Dr. Chihnitha Reddy T (BHMS) in Bengaluru, Karnataka.
            </p>
          </div>

          {/* Navigation Col */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-sand font-sans">
              Navigation
            </p>
            <ul className="space-y-2 text-xs sm:text-sm font-sans">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/book"
                  className="text-sand hover:text-white font-semibold transition-colors"
                >
                  Book Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical Practice Details */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-sand font-sans">
              Clinical Practice
            </p>
            <div className="space-y-2.5 text-xs sm:text-sm font-sans text-white/80">
              <div>
                <p className="font-semibold text-white">{CLINIC_INFO.doctor}</p>
                <p className="text-xs text-sand/80">{CLINIC_INFO.qualification} &bull; Homeopathic Medicine</p>
              </div>

              <div className="flex items-start gap-2 text-white/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-sand" />
                <span>{CLINIC_INFO.location}</span>
              </div>

              <div>
                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#25D366] hover:underline"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>WhatsApp: +91 {CLINIC_INFO.phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Back to Top */}
          <div className="lg:col-span-2 flex flex-col items-start lg:items-end justify-between space-y-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-sans text-white/80 border border-white/15 transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-sand" />
            </button>
          </div>

        </div>

        {/* Medical & Ethical Disclaimer */}
        <div className="py-8 border-b border-white/10 text-[11px] sm:text-xs text-white/60 leading-relaxed font-sans space-y-2">
          <p>
            <strong>Medical Notice:</strong> Information presented on this website is for educational and appointment coordination purposes. Homeopathic treatment is individualized to each patient and is intended to complement, not replace, medical counsel from your primary treating physician. We do not make claims of rapid cures or miraculous outcomes. In an acute medical emergency, please visit your local hospital emergency center immediately.
          </p>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-sans">
          <p>
            &copy; {new Date().getFullYear()} {CLINIC_INFO.fullName}. All rights reserved. Bengaluru, Karnataka.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms &amp; Boundaries
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
