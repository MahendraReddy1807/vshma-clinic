'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Share2,
  Printer,
  Home,
  X,
  Copy,
  Check,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { generateGoogleCalendarUrl } from '@/lib/notifications/calendar';

export interface BookingSuccessData {
  reference: string;
  fullName: string;
  phone: string;
  date: string;
  time: string;
  type: string;
  mode?: string;
  whatsappUrl?: string;
}

interface BookingSuccessModalProps {
  data: BookingSuccessData;
  onClose: () => void;
}

export default function BookingSuccessModal({ data, onClose }: BookingSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);
    }
  }, []);

  // Keyboard navigation & accessibility (ESC to close & focus trap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyRef = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(data.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calendarUrl = generateGoogleCalendarUrl({
    title: `VSHMA Homeopathy Consultation - ${data.type}`,
    description: `Consultation with Dr. Chihnitha Reddy T (BHMS) at VSHMA Homeopathy Clinic.\nReference: ${data.reference}\nPatient: ${data.fullName}`,
    location: 'VSHMA Homeopathy Clinic, Bengaluru, Karnataka, India',
    startDate: data.date,
    timeStr: data.time || '10:30 AM',
    referenceNumber: data.reference,
  });

  const whatsappShareText = encodeURIComponent(
    `I have scheduled a homeopathic consultation at VSHMA Clinic for ${data.date} (${data.time}). Reference: ${data.reference}. https://vshma.in`
  );
  const whatsappShareUrl = `https://wa.me/?text=${whatsappShareText}`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        className="fixed inset-0 z-50 overflow-y-auto bg-[#121A15]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8"
      >
        {/* Floating Particles (Restrained pearl & leaf burst) */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50vw',
                  y: '50vh',
                  opacity: 0,
                  scale: 0.2,
                }}
                animate={{
                  x: `${20 + ((i * 19) % 65)}vw`,
                  y: `${15 + ((i * 23) % 70)}vh`,
                  opacity: [0, 0.75, 0],
                  scale: [0.2, 1, 0.4],
                }}
                transition={{
                  duration: 2.5 + (i % 3),
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                className={`absolute rounded-full pointer-events-none ${
                  i % 2 === 0
                    ? 'w-3 h-3 bg-[#FAF8F5]/80 shadow-[0_0_12px_#B89B5E]'
                    : 'w-4 h-2 bg-[#D4D8BA]/70 rounded-full rotate-45'
                }`}
              />
            ))}
          </div>
        )}

        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-[#B89B5E]/40 rounded-[32px] p-6 sm:p-10 shadow-2xl overflow-hidden focus:outline-none"
        >
          {/* Subtle Brass Radial Aura */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#B89B5E]/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close success dialog"
            className="absolute top-6 right-6 p-2 rounded-full bg-forest/5 hover:bg-forest/10 text-forest transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated Signature Closing Mark */}
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {prefersReducedMotion ? (
                <div className="w-16 h-16 rounded-full bg-[#121A15] border-2 border-[#B89B5E] flex items-center justify-center text-[#B89B5E]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <>
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                    className="w-10 h-20 rounded-l-full bg-gradient-to-r from-[#D4D8BA] to-[#B89B5E] shadow-md"
                  />
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                    className="w-10 h-20 rounded-r-full bg-gradient-to-l from-[#D4D8BA] to-[#B89B5E] shadow-md"
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 240, damping: 20 }}
                    className="absolute w-9 h-9 rounded-full bg-[#121A15] text-[#FAF8F2] flex items-center justify-center shadow-xl border border-[#B89B5E]/60"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#B89B5E]" />
                  </motion.div>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.25em] text-[#B89B5E] font-sans">
                Reservation Logged &bull; Bengaluru
              </span>
              <h2 className="font-serif font-light text-3xl sm:text-4xl text-[#121A15] tracking-tight">
                Your appointment request is in.
              </h2>
              <p className="text-xs sm:text-sm text-[#161815]/70 max-w-md mx-auto font-sans font-light">
                We have registered your details in the clinic queue. Confirmation will arrive shortly.
              </p>
            </div>

            {/* Glass Consultation Voucher Card */}
            <div className="bg-[#FAF8F5] border border-[#B89B5E]/30 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#D8D0BD]/50 pb-3">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#B89B5E] font-sans block">
                    Official Reference Code
                  </span>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-[#121A15] tracking-wider">
                    {data.reference}
                  </p>
                </div>
                <button
                  onClick={handleCopyRef}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D8D0BD] text-xs font-semibold text-charcoal hover:bg-forest/5 transition-colors cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#B89B5E]" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Detail Rows */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs font-sans">
                <div>
                  <p className="text-charcoal/50 text-[10px] uppercase font-bold tracking-wider">Doctor</p>
                  <p className="font-semibold text-forest font-serif text-sm mt-0.5">Dr. Chihnitha Reddy T</p>
                  <p className="text-[10px] text-sage">BHMS &bull; Homeopathy</p>
                </div>
                <div>
                  <p className="text-charcoal/50 text-[10px] uppercase font-bold tracking-wider">Specialty</p>
                  <p className="font-semibold text-charcoal mt-0.5">{data.type}</p>
                </div>
                <div>
                  <p className="text-charcoal/50 text-[10px] uppercase font-bold tracking-wider">Date Window</p>
                  <p className="font-semibold text-charcoal mt-0.5">{data.date}</p>
                  <p className="text-[10px] text-charcoal/60">{data.time || '10:30 AM'}</p>
                </div>
                <div>
                  <p className="text-charcoal/50 text-[10px] uppercase font-bold tracking-wider">Location / Mode</p>
                  <p className="font-semibold text-charcoal mt-0.5">{data.mode || 'In-Clinic (Bengaluru)'}</p>
                </div>
              </div>
            </div>

            {/* Three-line What Happens Next */}
            <div className="bg-white/80 border border-[#D8D0BD]/70 rounded-2xl p-4 sm:p-5 text-left space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#121A15] block font-sans">
                What Happens Next
              </span>
              <ul className="space-y-2.5 text-xs text-[#161815]/85 font-sans leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-forest text-[#FAF8F5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong>Clinic Schedule Review:</strong> Dr. Chihnitha&apos;s team verifies calendar availability for your selected window.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-forest text-[#FAF8F5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong>Direct Delivery:</strong> You will receive an official confirmation voucher on your WhatsApp (+91 {data.phone}) and email.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-forest text-[#FAF8F5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong>Pre-Visit Reminders:</strong> Automated reminders arrive 24 hours, 2 hours, and 10 minutes prior to your visit.
                  </div>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold transition-colors shadow-2xs font-sans text-center"
              >
                <Calendar className="w-3.5 h-3.5 text-gold" />
                <span>Add to Cal</span>
              </a>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold transition-colors shadow-2xs font-sans text-center"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                <span>Share WA</span>
              </a>

              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-ivory hover:bg-sage/20 border border-sage/30 text-charcoal text-xs font-semibold transition-colors shadow-2xs font-sans cursor-pointer text-center"
              >
                <Printer className="w-3.5 h-3.5 text-forest" />
                <span>Print Card</span>
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-ivory hover:bg-sage/20 border border-sage/30 text-charcoal text-xs font-semibold transition-colors shadow-2xs font-sans text-center"
              >
                <Home className="w-3.5 h-3.5 text-forest" />
                <span>Home</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
