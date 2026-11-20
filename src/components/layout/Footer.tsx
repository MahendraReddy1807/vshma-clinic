'use client';

import Link from 'next/link';
import { MapPin, Shield, ArrowUp, Heart } from 'lucide-react';
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
    <footer className="bg-forest-dark text-white border-t border-white/10" aria-label="Clinic Footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
        {/* Top Branding Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10 items-start">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-block" aria-label="VSHMA Home">
              <BrandLogo size="lg" theme="light" showSubtitle={true} />
            </Link>
            <p className="font-display italic text-lg sm:text-xl text-ivory/90 leading-snug">
              &ldquo;Care That Begins With Understanding.&rdquo;
            </p>
            <p className="text-sage-light/80 text-sm leading-relaxed max-w-sm font-sans font-light">
              VSHMA Homeopathy Clinic is dedicated to personalized, compassionate, and evidence-informed classical homeopathic care under Dr. Chihnitha Reddy T (BHMS) in Bengaluru.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-2 space-y-4">
            <p className="font-heading text-sm font-semibold tracking-wider uppercase text-gold">
              Navigation
            </p>
            <ul className="space-y-2.5 text-sm font-sans">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sage-light/80 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/book"
                  className="text-gold hover:text-gold-light font-semibold transition-colors duration-200"
                >
                  Book Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Doctor & Location Info */}
          <div className="lg:col-span-3 space-y-4">
            <p className="font-heading text-sm font-semibold tracking-wider uppercase text-gold">
              Clinical Practice
            </p>
            <div className="space-y-3 text-sm font-sans">
              <div>
                <p className="font-semibold text-white">{CLINIC_INFO.doctor}</p>
                <p className="text-xs text-sage-light/75">{CLINIC_INFO.qualification} &bull; Homeopathy</p>
              </div>

              <div className="flex items-start gap-2.5 text-sage-light/80 text-xs sm:text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>{CLINIC_INFO.location}</span>
              </div>

              <div>
                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#25D366] hover:text-[#20ba5a] transition-colors"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                  <span>+91 {CLINIC_INFO.phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Legal & Administration */}
          <div className="lg:col-span-2 space-y-4">
            <p className="font-heading text-sm font-semibold tracking-wider uppercase text-gold">
              Compliance
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans">
              <li>
                <Link
                  href="/privacy"
                  className="text-sage-light/80 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sage-light/80 hover:text-white transition-colors duration-200"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-gold hover:text-forest-deep text-gold transition-all duration-200"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical Medical Disclaimer */}
        <div className="pt-10 pb-8 text-xs text-sage-light/65 leading-relaxed font-sans font-light border-b border-white/10 space-y-2">
          <p>
            <strong className="text-sage-light font-semibold">Medical Disclaimer: </strong>
            The information presented on this website is for general informational and educational purposes only and is not intended to replace professional medical diagnosis, advice, or treatment. Never disregard or delay seeking conventional medical advice because of something you have read on this website.
          </p>
          <p>
            Homeopathic consultations at VSHMA are elective and non-emergency in nature. For acute, urgent, or life-threatening symptoms, please seek emergency medical attention immediately at your nearest healthcare facility.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sage-light/60 font-sans">
          <p>
            &copy; {new Date().getFullYear()} {CLINIC_INFO.fullName}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 text-sage-light hover:text-gold transition-colors duration-200 cursor-pointer"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-gold group-hover:text-forest-deep flex items-center justify-center transition-all">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
