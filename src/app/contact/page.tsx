import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import ContactSection from '@/components/sections/ContactSection';
import { CLINIC_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Contact & Appointments | ${CLINIC_INFO.fullName}`,
  description: `Contact VSHMA Homeopathy Clinic in Bengaluru. Reach out via WhatsApp or submit an inquiry to schedule an appointment with Dr. Chihnitha Reddy T.`,
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-32">
        <ContactSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
