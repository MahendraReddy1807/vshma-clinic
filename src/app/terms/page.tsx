import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import type { Metadata } from 'next';
import { CLINIC_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms & Conditions | VSHMA Homeopathy Clinic',
  description: 'Terms governing usage of the VSHMA Homeopathy Clinic website and appointment portal.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="text-xs uppercase tracking-widest text-gold font-bold">Legal Terms</span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest mt-2">
              Terms &amp; Conditions
            </h1>
            <p className="text-gray-500 text-sm mt-3">
              Applicable for visits, digital inquiries, and appointments with VSHMA
            </p>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            <div className="p-6 rounded-2xl bg-ivory border border-sage/20">
              <h2 className="font-heading text-lg font-bold text-forest mb-2">1. Use of the Website</h2>
              <p>
                By visiting and utilizing <strong>{CLINIC_INFO.fullName}</strong>, you agree to access its contents for lawful and personal healthcare information purposes only.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sage/20">
              <h2 className="font-heading text-lg font-bold text-forest mb-2">2. Consultation Bookings</h2>
              <p>
                Online booking requests represent an initial appointment reservation. The clinic reserves the right to confirm, adjust, or reschedule timing based on doctor availability, clinic operational schedules, or unforeseen emergencies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-ivory border border-sage/20">
              <h2 className="font-heading text-lg font-bold text-forest mb-2">3. Medical Disclaimers &amp; Scope</h2>
              <p>
                Consultations provided by {CLINIC_INFO.doctor} ({CLINIC_INFO.qualification}) are governed by established Homeopathic medical ethics and standards in India. Digital submissions or website browsing does not establish an immediate doctor-patient relationship until an active consultation occurs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-sage/20">
              <h2 className="font-heading text-lg font-bold text-forest mb-2">4. Governing Law &amp; Jurisdiction</h2>
              <p>
                These terms are governed by the laws of India. Any legal disputes arising from clinic engagements or website operations shall fall under the competent courts located in Bengaluru, Karnataka, India.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
