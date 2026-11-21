import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import TreatmentDirectory from '@/components/sections/TreatmentDirectory';
import { CLINIC_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Consultations & Treatments Guide',
  description: `Complete guide to homeopathic consultations and clinical care with ${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification}) at ${CLINIC_INFO.fullName} in Bengaluru.`,
};

export default function TreatmentsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <TreatmentDirectory />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
