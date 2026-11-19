import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import ScrollToTop from '@/components/layout/ScrollToTop';
import BookingSection from '@/components/sections/BookingSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Consultation | VSHMA Homeopathy Clinic',
  description:
    'Schedule your personalized consultation with Dr. Chihnitha Reddy T (BHMS) at VSHMA Homeopathy Clinic in Bengaluru.',
};

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <BookingSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
}
