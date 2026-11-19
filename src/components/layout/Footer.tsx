import Link from 'next/link';
import { MapPin, Shield } from 'lucide-react';
import { NAV_LINKS, CLINIC_INFO } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-forest text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <BrandLogo size="md" theme="light" />
            </div>
            <p className="text-sage text-sm leading-relaxed mb-4">{CLINIC_INFO.tagline}</p>
            <p className="text-sage-light/70 text-xs leading-relaxed">
              Dedicated to providing personalised homeopathic care in a welcoming environment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sage hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/book"
                  className="text-gold hover:text-gold-light text-sm transition-colors font-medium"
                >
                  Book Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sage text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>{CLINIC_INFO.location}</span>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sage hover:text-white text-sm transition-colors"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                  <span>WhatsApp: +91 {CLINIC_INFO.phone}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Portal */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Clinic &amp; Portal</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-sage hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sage hover:text-white text-sm transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-gold hover:text-forest text-gold transition-all"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Staff / Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer + Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sage/70 text-xs leading-relaxed mb-4">
            <strong>Medical Disclaimer:</strong> Information on this website is provided for general
            informational purposes and is not a substitute for professional medical advice, diagnosis,
            or treatment. Patients should consult appropriately qualified healthcare professionals.
            Do not delay or discontinue evidence-based medical care based on information on this website.
          </p>
          <p className="text-sage/50 text-xs">
            © {new Date().getFullYear()} {CLINIC_INFO.fullName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
