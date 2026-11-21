import Link from 'next/link';
import Image from 'next/image';
import { Home, Calendar } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site-config';
import SectionTag from '@/components/ui/luxury/SectionTag';
import PillButton from '@/components/ui/luxury/PillButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bone text-ink flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Decorative ambient background */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-sage/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-96 h-96 bg-brass/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-brass/40 shadow-xs">
            <Image
              src="/logo-transparent.png"
              alt="VSHMA Monogram"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <span className="font-serif font-light text-forest text-2xl tracking-tight">
            {SITE_CONFIG.clinic.name}
          </span>
        </Link>
        <span className="text-xs uppercase font-semibold tracking-widest text-brass font-sans">
          Notice 404
        </span>
      </header>

      {/* Center Hero */}
      <main className="relative z-10 max-w-2xl mx-auto text-center space-y-6 my-auto py-12">
        <div>
          <SectionTag>Page Relocated or Not Found</SectionTag>
        </div>

        <h1 className="font-serif font-light text-5xl sm:text-6xl lg:text-7xl text-forest leading-[1.05] tracking-tight">
          A quiet detour.
        </h1>

        <p className="text-ink/70 text-base sm:text-lg font-light leading-relaxed font-sans max-w-md mx-auto">
          The page or clinical resource you requested does not exist or has been relocated. You are warmly invited to return to our sanctuary homepage or arrange a consultation.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <PillButton
            href="/"
            variant="dark"
            size="md"
          >
            <Home className="w-4 h-4 mr-2" />
            <span>Return to Homepage</span>
          </PillButton>

          <PillButton
            href="/book"
            variant="outline"
            size="md"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span>Book Consultation</span>
          </PillButton>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center text-xs text-ink/50 font-sans pt-6 border-t border-ink/10">
        &copy; {new Date().getFullYear()} {SITE_CONFIG.clinic.fullName} &bull; Bengaluru, India
      </footer>
    </div>
  );
}
