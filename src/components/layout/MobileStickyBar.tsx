'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, ArrowUpRight } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { SITE_CONFIG } from '@/lib/site-config';

export default function MobileStickyBar() {
  const { contact } = SITE_CONFIG;

  return (
    <div
      aria-label="Mobile Quick Action Bar"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#F7F3EC]/95 backdrop-blur-xl border-t border-[#D8D0BD]/70 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md mx-auto grid grid-cols-12 gap-2.5 items-center">
        {/* Call Link */}
        <a
          href={contact.phoneTelHref}
          className="col-span-3 py-2.5 px-2 rounded-full border border-[#D8D0BD] bg-white text-[#121A15] hover:bg-[#EDE6D3] flex items-center justify-center gap-1.5 text-xs font-sans font-semibold transition-colors shadow-2xs"
          aria-label="Call VSHMA Clinic"
        >
          <Phone className="w-3.5 h-3.5 text-[#B89B5E]" />
          <span>Call</span>
        </a>

        {/* WhatsApp Link */}
        <a
          href={contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-4 py-2.5 px-2 rounded-full border border-[#D8D0BD] bg-white text-[#121A15] hover:bg-[#EDE6D3] flex items-center justify-center gap-1.5 text-xs font-sans font-semibold transition-colors shadow-2xs"
          aria-label="WhatsApp Concierge"
        >
          <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
          <span>WhatsApp</span>
        </a>

        {/* Book Appointment Pill */}
        <Link
          href="/book"
          className="col-span-5 py-2.5 px-3 rounded-full bg-[#121A15] text-[#F7F3EC] hover:bg-[#1F2B23] border border-[#B89B5E]/50 flex items-center justify-center gap-1 text-xs font-sans font-semibold transition-all shadow-sm active:scale-98"
          aria-label="Book Consultation"
        >
          <span>Book Now</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#B89B5E]" />
        </Link>
      </div>
    </div>
  );
}
