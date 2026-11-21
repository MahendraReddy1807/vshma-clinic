import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';
import SectionTag from '@/components/ui/luxury/SectionTag';

export const metadata: Metadata = {
  title: 'Terms & Conditions | VSHMA Homeopathy Clinic',
  description: 'Terms governing clinic engagements, appointment reservations, and professional boundaries at VSHMA Homeopathy Clinic.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bone text-ink">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="mb-12 text-center space-y-3">
            <SectionTag>Clinical Engagement Terms &bull; Bengaluru</SectionTag>
            <h1 className="font-serif font-light text-4xl sm:text-5xl text-forest tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm font-sans text-ink/60">
              Governing Clinical Appointments &amp; Digital Inquiries at {SITE_CONFIG.clinic.fullName}
            </p>
          </div>

          <div className="space-y-6 text-ink/80 leading-relaxed text-sm sm:text-base font-sans font-light">
            <div className="p-8 rounded-3xl bg-cream border border-ink/10 shadow-xs">
              <h2 className="font-serif text-2xl font-light text-forest mb-2">1. Scope of Clinical Services</h2>
              <p>
                {SITE_CONFIG.clinic.fullName} provides individualized classical homeopathic consultations administered by {SITE_CONFIG.doctor.name} ({SITE_CONFIG.doctor.degree}). Browsing this website, submitting an appointment inquiry, or receiving automated transaction notifications does not by itself establish a continuous doctor-patient relationship until an active, verified clinical intake session occurs.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-ink/10 shadow-xs">
              <h2 className="font-serif text-2xl font-light text-forest mb-2">2. Appointment Scheduling &amp; Punctuality</h2>
              <p>
                Due to the unhurried nature of classical constitutional case taking (45–60 minutes for foundation intakes), consultations are scheduled strictly by prior appointment. We request patients to arrive 5–10 minutes prior to scheduled slots. If rescheduling is needed, prompt notice via WhatsApp or phone allows slots to be offered to waiting patients.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-cream border border-ink/10 shadow-xs">
              <h2 className="font-serif text-2xl font-light text-forest mb-2">3. Medical Disclaimers &amp; Concurrent Care</h2>
              <p>
                Homeopathic constitutional therapeutics are non-invasive and natural. Patients under prescribed ongoing allopathic treatments for conditions such as diabetes, cardiovascular disease, hypertension, or thyroid disorders are advised never to discontinue or modify their existing allopathic prescriptions without consulting their treating primary physicians.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-ink/10 shadow-xs">
              <h2 className="font-serif text-2xl font-light text-forest mb-2">4. Fee Schedule &amp; Transparent Billing</h2>
              <p>
                Consultation fees cover professional case analysis, constitutional repertorization, and treatment planning. The exact fee schedule is disclosed transparently upon appointment reservation. Dispensation of remedies and courier dispatch (for online consults) follow standard clinic tariffs.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-forest text-bone shadow-md">
              <h2 className="font-serif text-2xl font-light text-brass mb-2">5. Governing Law &amp; Jurisdiction</h2>
              <p className="text-sage/90 text-sm leading-relaxed">
                All professional engagements, clinic operations, and digital interactions are governed by the laws of India and standard regulations promulgated by the National Commission for Homeopathy (NCH). Any disputes shall be subject exclusively to the jurisdiction of the competent courts in Bengaluru, Karnataka, India.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
