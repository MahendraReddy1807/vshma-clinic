'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function DesktopFloatingBookPill() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 480);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          className="fixed bottom-8 right-24 z-40 hidden lg:block"
        >
          <Link
            href="/book"
            className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#121A15] hover:bg-[#1F2B23] text-[#F7F3EC] border border-[#B89B5E]/60 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1"
          >
            <span className="w-2 h-2 rounded-full bg-[#B89B5E] animate-pulse" />
            <span className="font-sans font-medium text-xs tracking-wider uppercase">Book Consultation</span>
            <ArrowUpRight className="w-4 h-4 text-[#B89B5E] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
