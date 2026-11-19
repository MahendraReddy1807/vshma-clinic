'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { NAV_LINKS, CLINIC_INFO } from '@/lib/constants';
import Button from '@/components/ui/Button';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 25);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 bg-white/85 backdrop-blur-md shadow-[0_4px_30px_rgba(24,61,50,0.06)] border-b border-sage/20'
          : 'py-5 bg-transparent'
      }`}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gold"
        style={{ scaleX: progress }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-forest text-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300">
              <Leaf className="w-5 h-5 text-gold transition-transform group-hover:rotate-12" />
            </div>
            <div>
              <span className="font-heading text-2xl font-bold tracking-tight text-forest block leading-none">
                {CLINIC_INFO.name}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-sage font-semibold block mt-0.5">
                Homeopathy Clinic
              </span>
            </div>
          </Link>

          {/* Desktop Links (Floating Capsule Design) */}
          <nav className="hidden lg:flex items-center gap-1 px-5 py-2 rounded-full bg-white/70 backdrop-blur-md border border-sage/30 shadow-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-forest/80 hover:text-forest hover:bg-mint/60 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Direct CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-forest hover:text-emerald-700 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/60 hover:bg-emerald-50 border border-sage/20 transition-all shadow-sm"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>{CLINIC_INFO.phone}</span>
            </a>
            <Link href="/book">
              <Button size="sm" className="shadow-md hover:shadow-lg group">
                <span>Book Consultation</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 rounded-2xl bg-white/80 border border-sage/30 text-forest shadow-sm"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-sage/20 px-6 py-6 shadow-2xl mt-3 mx-4 rounded-3xl"
          >
            <div className="space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-2xl text-sm font-semibold text-forest hover:bg-mint transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-sage/20 space-y-2">
                <Link href="/book" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full justify-center">Book Consultation</Button>
                </Link>
                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-emerald-800 bg-emerald-50 py-2.5 rounded-xl border border-emerald-200"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp: +91 {CLINIC_INFO.phone}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
