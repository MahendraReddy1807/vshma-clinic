'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Calendar,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { SITE_CONFIG } from '@/lib/site-config';

export default function FloatingDock() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showBookPill, setShowBookPill] = useState(false);
  const { contact } = SITE_CONFIG;

  // ───────────── 1. Hide dock on admin routes ─────────────
  const isAdmin = pathname?.startsWith('/admin');

  // ───────────── 2. Track in-page booking button visibility ─────────────
  useEffect(() => {
    if (isAdmin) return;

    const checkInPageButtons = () => {
      // Find all in-page booking buttons
      const inPageBtns = document.querySelectorAll('.in-page-book-btn');
      if (inPageBtns.length === 0) {
        // If on /book or /admin, do not show separate book pill
        if (pathname === '/book') {
          setShowBookPill(false);
          return;
        }
        setShowBookPill(window.scrollY > 450);
        return;
      }

      let anyVisible = false;
      const windowHeight = window.innerHeight;

      inPageBtns.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        if (rect.top < windowHeight && rect.bottom > 0) {
          anyVisible = true;
        }
      });

      // Show separate book pill only when NO in-page book button is in view & user has scrolled
      setShowBookPill(!anyVisible && window.scrollY > 450 && pathname !== '/book');
    };

    checkInPageButtons();
    window.addEventListener('scroll', checkInPageButtons, { passive: true });
    window.addEventListener('resize', checkInPageButtons, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkInPageButtons);
      window.removeEventListener('resize', checkInPageButtons);
    };
  }, [pathname, isAdmin]);

  if (isAdmin) return null;

  const handleOpenChat = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('vshma:open-chat'));
  };

  return (
    <>
      {/* ───────────── CONDITIONAL FLOATING BOOK PILL (CENTER-BOTTOM) ───────────── */}
      {/* Visible only when no in-page book button is in view */}
      <AnimatePresence>
        {showBookPill && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-6 sm:left-8 z-40 select-none pointer-events-auto"
          >
            <Link
              href="/book"
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#121A15] text-[#F7F3EC] border border-[#B89B5E]/70 shadow-2xl hover:bg-[#1A261F] transition-all duration-300 font-sans text-xs font-semibold uppercase tracking-wider backdrop-blur-md"
            >
              <Calendar className="w-3.5 h-3.5 text-[#B89B5E]" />
              <span>Book Consultation</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#B89B5E] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────── CONSOLIDATED BOTTOM-RIGHT FLOATING DOCK ───────────── */}
      <aside aria-label="Quick Actions Dock" className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 select-none">
        <div className="relative flex flex-col items-end">
          {/* Expanded Action Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.94 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="mb-3 w-56 sm:w-64 p-2.5 rounded-3xl bg-[#121A15]/95 backdrop-blur-xl border border-[#B89B5E]/40 shadow-2xl text-[#EDE6D3] space-y-1"
              >
                <div className="px-3 py-1.5 border-b border-[#B89B5E]/20 flex items-center justify-between text-[11px] uppercase tracking-wider text-[#B89B5E] font-sans font-semibold">
                  <span>Care Concierge</span>
                  <Sparkles className="w-3 h-3 text-[#B89B5E]" />
                </div>

                {/* 1. WhatsApp Action */}
                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/10 text-xs font-medium font-sans text-[#F7F3EC] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-[#F7F3EC] truncate">WhatsApp Direct</p>
                    <p className="text-[10px] text-[#D4D8BA]/70 truncate">Fast appointment triage</p>
                  </div>
                </a>

                {/* 2. Direct Phone Call */}
                <a
                  href={contact.phoneTelHref}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/10 text-xs font-medium font-sans text-[#F7F3EC] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#B89B5E]/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#B89B5E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-[#F7F3EC] truncate">Call Reception</p>
                    <p className="text-[10px] text-[#D4D8BA]/70 truncate">{contact.phoneDisplay}</p>
                  </div>
                </a>

                {/* 3. Care Assistant (AI Dialogue) */}
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/10 text-xs font-medium font-sans text-[#F7F3EC] transition-colors text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-[#D4D8BA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-[#F7F3EC] truncate">Care Assistant</p>
                    <p className="text-[10px] text-[#D4D8BA]/70 truncate">Clinic questions & guidance</p>
                  </div>
                </button>

                {/* 4. Book Consultation */}
                <Link
                  href="/book"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#B89B5E]/20 hover:bg-[#B89B5E]/30 text-xs font-medium font-sans text-[#EDE6D3] transition-colors border border-[#B89B5E]/30"
                >
                  <div className="w-8 h-8 rounded-full bg-[#B89B5E] text-[#121A15] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-[#EDE6D3] truncate">Request Appointment</p>
                    <p className="text-[10px] text-[#D4D8BA]/70 truncate">In-clinic or online format</p>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Master Trigger: Single circular icon button (P0.3 compliance - no label text, no OMI bug) */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Toggle VSHMA Care Concierge Dock"
            className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#121A15] hover:bg-[#1A261F] text-[#EDE6D3] border border-[#B89B5E]/60 shadow-2xl transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center justify-center hover:scale-105 active:scale-95"
          >
            {/* Pulsing subtle status bead */}
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B89B5E] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#B89B5E]" />
            </span>

            <div className="w-6 h-6 flex items-center justify-center text-[#B89B5E] transition-transform duration-300">
              {isOpen ? (
                <X className="w-5 h-5 text-[#B89B5E]" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#B89B5E] group-hover:rotate-12 transition-transform duration-300" />
              )}
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
