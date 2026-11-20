'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS, CLINIC_INFO } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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

  const isHeroTransparent = !scrolled && pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3.5 bg-white/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(24,61,50,0.08)] border-b border-sage/20'
          : isHeroTransparent
          ? 'py-6 bg-transparent'
          : 'py-5 bg-white/80 backdrop-blur-md border-b border-sage/15'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="VSHMA Home" className="shrink-0">
            <BrandLogo
              size="md"
              theme={isHeroTransparent ? 'light' : 'dark'}
              showSubtitle={true}
            />
          </Link>

          {/* Desktop Floating Navigation Capsule */}
          <nav
            aria-label="Main Navigation"
            className={`hidden lg:flex items-center gap-1 px-5 py-2 rounded-full backdrop-blur-md transition-all duration-300 ${
              isHeroTransparent
                ? 'bg-white/10 border border-white/20 shadow-lg'
                : 'bg-white/85 border border-sage/30 shadow-sm'
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
                      ? isHeroTransparent
                        ? 'text-white bg-white/20'
                        : 'text-forest bg-forest/10'
                      : isHeroTransparent
                      ? 'text-ivory/85 hover:text-white hover:bg-white/10'
                      : 'text-charcoal/80 hover:text-forest hover:bg-mint/60'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full border border-gold/40 pointer-events-none"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Direct CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs font-semibold flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md transition-all duration-200 border ${
                isHeroTransparent
                  ? 'bg-white/10 hover:bg-white/20 text-ivory border-white/20'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
              }`}
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span className="font-sans">+91 {CLINIC_INFO.phone}</span>
            </a>

            <Link
              href="/book"
              className="group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gold hover:bg-gold-light text-forest-deep text-xs font-semibold font-sans tracking-wide transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Book Consultation</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2.5 rounded-2xl border transition-colors cursor-pointer ${
              isHeroTransparent
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white border-sage/30 text-forest shadow-sm'
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
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold font-sans"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp: +91 {CLINIC_INFO.phone}</span>
                </a>
              </div>
            </motion.div>

            <div className="text-center text-xs text-sage-light/70 pt-6 pb-2 font-sans">
              {CLINIC_INFO.fullName} &bull; {CLINIC_INFO.doctor} ({CLINIC_INFO.qualification})
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
