import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import ScrollToTop from '@/components/layout/ScrollToTop';
import BookingSection from '@/components/sections/BookingSection';
import { CLINIC_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Book a Consultation | ${CLINIC_INFO.fullName}`,
  description: `Schedule your unhurried consultation with Dr. Chihnitha Reddy T (BHMS) at VSHMA Homeopathy Clinic in Bengaluru. Instant booking reference generated.`,
};

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-charcoal">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-32">
        <BookingSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
}
