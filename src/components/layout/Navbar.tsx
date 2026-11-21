'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '@/lib/constants';
import { SITE_CONFIG } from '@/lib/site-config';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [navTheme, setNavTheme] = useState<'transparent' | 'dark' | 'light'>('transparent');
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { contact } = SITE_CONFIG;

  // ───────────── 1. Accurately measure --nav-h via ResizeObserver ─────────────
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.round(entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height);
        if (height > 0) {
          document.documentElement.style.setProperty('--nav-h', `${height}px`);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ───────────── 2. Theme-aware Scroll & Section Detection ─────────────
  useEffect(() => {
    const updateTheme = () => {
      const scrollY = window.scrollY;
      const isScrolled = scrollY > 20;
      setScrolled(isScrolled);

      if (!isScrolled && pathname === '/') {
        setNavTheme('transparent');
        return;
      }

      // Check which section is currently under or closest to navbar center
      const sections = document.querySelectorAll<HTMLElement>('section[data-nav-theme]');
      let activeTheme: 'dark' | 'light' = 'light';
      const checkY = scrollY + 100;

      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;
        if (checkY >= top && checkY <= bottom) {
          const themeAttr = sec.getAttribute('data-nav-theme');
          if (themeAttr === 'dark') activeTheme = 'dark';
        }
      });

      setNavTheme(activeTheme);
    };

    updateTheme();
    window.addEventListener('scroll', updateTheme, { passive: true });
    window.addEventListener('resize', updateTheme, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateTheme);
      window.removeEventListener('resize', updateTheme);
    };
  }, [pathname]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  // Determine theme styling with 400ms transition
  const isDark = navTheme === 'dark';
  const isTransparent = navTheme === 'transparent';

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-400 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
        isTransparent
          ? 'py-4 sm:py-5 bg-transparent border-b border-[#D8D0BD]/25 text-[#161815]'
          : isDark
          ? 'py-3 bg-[#121A15]/95 backdrop-blur-md shadow-sm border-b border-[#B89B5E]/30 text-[#F7F3EC]'
          : 'py-3 bg-[#F7F3EC]/95 backdrop-blur-md shadow-2xs border-b border-[#D8D0BD]/70 text-[#161815]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="VSHMA Home" className="shrink-0">
            <BrandLogo
              size="md"
              theme={isDark ? 'light' : 'dark'}
              showSubtitle={true}
            />
          </Link>

          {/* Desktop Floating Navigation Capsule */}
          <nav
            aria-label="Main Navigation"
            className={`hidden lg:flex items-center gap-1 px-5 py-1.5 rounded-full border shadow-2xs backdrop-blur-md transition-all duration-400 ${
              isDark
                ? 'bg-[#18231C]/90 border-[#B89B5E]/40 text-[#EDE6D3]'
                : 'bg-white/85 border-[#D8D0BD] text-[#161815]'
            }`}
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide font-sans transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? 'text-[#121A15] bg-[#D4D8BA] shadow-xs'
                        : 'text-[#F7F3EC] bg-[#121A15] shadow-xs'
                      : isDark
                      ? 'text-[#EDE6D3]/75 hover:text-[#F7F3EC] hover:bg-white/10'
                      : 'text-[#161815]/75 hover:text-[#121A15] hover:bg-[#121A15]/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Direct CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={contact.phoneTelHref}
              className={`text-xs font-medium flex items-center gap-1.5 px-3.5 py-2 rounded-full border shadow-2xs transition-all duration-300 ${
                isDark
                  ? 'bg-[#18231C]/90 border-[#B89B5E]/40 text-[#EDE6D3] hover:bg-[#202E25]'
                  : 'bg-white/85 border-[#D8D0BD] text-[#121A15] hover:bg-[#EDE6D3]'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#B89B5E]" />
              <span className="font-sans">{contact.phoneDisplay}</span>
            </a>

            <Link
              href="/book"
              className={`group inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold font-sans uppercase tracking-wider transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                isDark
                  ? 'bg-[#B89B5E] hover:bg-[#C9AE73] text-[#121A15] border border-[#B89B5E]'
                  : 'bg-[#121A15] hover:bg-[#1F2B23] text-[#F7F3EC] border border-[#B89B5E]/70'
              }`}
            >
              <span>Book</span>
              <ArrowUpRight className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                isDark ? 'text-[#121A15]' : 'text-[#B89B5E]'
              }`} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2.5 rounded-full border shadow-xs cursor-pointer transition-colors duration-300 ${
              isDark
                ? 'bg-[#18231C] border-[#B89B5E]/40 text-[#EDE6D3]'
                : 'bg-white border-[#D8D0BD] text-[#121A15]'
            }`}
            aria-expanded={mobileOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Animated Drawer with Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-[70px] bg-forest-dark/80 backdrop-blur-xl z-50 lg:hidden flex flex-col justify-between p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 bg-white rounded-3xl p-6 shadow-2xl border border-sage/20"
            >
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold text-forest hover:bg-mint/60 transition-colors font-sans"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-sage" />
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-sage/20 space-y-3">
                <Link
                  href="/book"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3.5 rounded-2xl bg-gold hover:bg-gold-light text-forest-deep text-sm font-semibold tracking-wide shadow-md font-sans"
                >
                  Book a Consultation
                </Link>

                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold font-sans"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp: {contact.phoneDisplay}</span>
                </a>
              </div>
            </motion.div>

            <div className="text-center text-xs text-sage-light/70 pt-6 pb-2 font-sans">
              {SITE_CONFIG.clinic.fullName} &bull; {SITE_CONFIG.doctor.name} ({SITE_CONFIG.doctor.degree})
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
