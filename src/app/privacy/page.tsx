import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import type { Metadata } from 'next';
import { CLINIC_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy | VSHMA Homeopathy Clinic',
  description: 'Understand how VSHMA collects, handles, and protects patient contact and appointment details.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="text-xs uppercase tracking-widest text-gold font-bold">Transparency & Compliance</span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest mt-2">
              Privacy Policy
            </h1>
            <p className="text-gray-500 text-sm mt-3">
              Last revised: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
            <section className="p-6 rounded-2xl bg-ivory border border-sage/20">
              <h2 className="font-heading text-xl font-bold text-forest mb-3">1. Information We Collect</h2>
              <p>
                When you initiate an appointment booking or submit an inquiry on the <strong>{CLINIC_INFO.name}</strong> website, we collect only the necessary administrative contact details:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Your full name</li>
                <li>Your 10-digit Indian mobile telephone number</li>
                <li>Preferred appointment date and requested time of consultation</li>
                <li>Selected type of consultation (e.g. General, Follow-up, Online)</li>
                <li>Any administrative message or preference provided in the text field</li>
              </ul>
              <p className="mt-3 text-xs text-gray-500 italic">
                Notice: We deliberately do not request or store sensitive health diagnostics, laboratory records, or comprehensive medical history through the initial public booking form.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white border border-sage/20">
              <h2 className="font-heading text-xl font-bold text-forest mb-3">2. Purpose of Information Collection</h2>
              <p>The details you provide are utilized solely for:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Registering your appointment request and assigning a unique booking reference.</li>
                <li>Generating pre-formatted WhatsApp communications to coordinate directly with the clinic.</li>
                <li>Confirming, rescheduling, or answering inquiries about clinical visits.</li>
                <li>Facilitating authentic doctor-patient correspondence under professional discretion.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-ivory border border-sage/20">
              <h2 className="font-heading text-xl font-bold text-forest mb-3">3. How Information is Stored and Protected</h2>
              <p>
                Appointment records are stored using industry-standard encrypted PostgreSQL infrastructure managed via Supabase, with strict Row-Level Security (RLS) policies. Only authenticated clinic personnel have administrative permissions to review consultation requests.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white border border-sage/20">
              <h2 className="font-heading text-xl font-bold text-forest mb-3">4. Third-Party Disclosures</h2>
              <p>
                We do not sell, rent, commercialize, or broadcast patient contact information to marketers or unauthorized third parties. External messaging occurs exclusively through patient-initiated actions on WhatsApp.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-ivory border border-sage/20">
              <h2 className="font-heading text-xl font-bold text-forest mb-3">5. Data Rectification and Deletion</h2>
              <p>
                To request review, correction, or deletion of a booking record, contact the clinic on WhatsApp at <a href={CLINIC_INFO.whatsappUrl} className="text-forest font-semibold underline">{CLINIC_INFO.phoneFull}</a> and include your booking reference where available.
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-forest text-white">
              <h2 className="font-heading text-xl font-bold text-gold mb-3">6. Medical Disclaimer</h2>
              <p className="text-sage-light text-sm">
                Information presented on this website is for educational and appointment coordination purposes only. It is not a substitute for diagnostic medical consultations or acute emergency healthcare. Do not delay medical attention or alter existing medications without direct oversight from your healthcare providers.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
