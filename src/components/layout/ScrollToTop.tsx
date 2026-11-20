'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        'fixed bottom-24 right-7 z-40 flex items-center justify-center w-11 h-11',
        'rounded-full bg-forest text-white shadow-lg hover:bg-forest-light border border-white/20',
        'transition-all duration-300',
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none',
      )}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
