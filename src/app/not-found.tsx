import Link from 'next/link';
import Image from 'next/image';
import { Home, Calendar, ArrowRight } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-sage/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-96 h-96 bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold/40 shadow-sm">
            <Image
              src="/logo-transparent.png"
              alt="VSHMA Monogram"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <span className="font-heading font-bold text-forest text-xl tracking-tight">
            {CLINIC_INFO.name}
          </span>
        </Link>
        <span className="text-xs uppercase font-semibold tracking-widest text-gold font-sans">
          Error 404
        </span>
      </header>

      {/* Center Hero */}
      <main className="relative z-10 max-w-2xl mx-auto text-center space-y-6 my-auto py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold uppercase tracking-widest font-sans">
          <span>Page Relocated or Not Found</span>
        </div>

        <h1 className="font-display font-light text-5xl sm:text-6xl lg:text-7xl text-forest leading-[1.05] tracking-tight">
          A quiet detour.
        </h1>

        <p className="text-charcoal/75 text-base sm:text-lg font-light leading-relaxed font-sans max-w-md mx-auto">
          The page or treatment guide you requested does not exist or may have been moved. Return to our homepage or schedule an appointment directly.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-forest hover:bg-forest-light text-white text-xs font-semibold uppercase tracking-wider font-sans transition-all shadow-md"
          >
            <Home className="w-4 h-4 mr-2 text-gold" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/book"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white hover:bg-mint/40 text-forest border border-sage/40 text-xs font-semibold uppercase tracking-wider font-sans transition-all shadow-xs"
          >
            <Calendar className="w-4 h-4 mr-2 text-forest" />
            <span>Book Consultation</span>
          </Link>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center text-xs text-charcoal/50 font-sans pt-6 border-t border-sage/20">
        &copy; {new Date().getFullYear()} {CLINIC_INFO.fullName} &bull; Bengaluru, India
      </footer>
    </div>
  );
}
