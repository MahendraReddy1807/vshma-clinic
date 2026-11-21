import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';
import SectionTag from '@/components/ui/luxury/SectionTag';

export const metadata: Metadata = {
  title: 'Privacy Policy & DPDP Compliance | VSHMA Homeopathy Clinic',
  description: 'Learn how VSHMA collects, processes, and protects patient information in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.',
};

export default function PrivacyPage() {
  return (
    <div className="w-full pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="mb-12 text-center space-y-3">
            <SectionTag>DPDP Act 2023 &bull; Patient Data Protection</SectionTag>
            <h1 className="font-serif font-light text-4xl sm:text-5xl text-forest tracking-tight">
              Privacy Policy &amp; Data Ethics
            </h1>
            <p className="text-sm font-sans text-ink/60">
              Effective Date: November 2026 &bull; Data Fiduciary: {SITE_CONFIG.clinic.fullName}, Bengaluru
            </p>
          </div>

          <div className="space-y-8 text-ink/80 text-sm sm:text-base leading-relaxed font-sans font-light">
            <section className="p-8 rounded-3xl bg-cream border border-ink/10 shadow-xs">
              <h2 className="font-serif text-2xl font-light text-forest mb-3">
                1. Data Fiduciary Notice (DPDP Act, 2023)
              </h2>
              <p>
                Under the Digital Personal Data Protection Act, 2023 (India), <strong>{SITE_CONFIG.clinic.fullName}</strong> operates as a Data Fiduciary regarding the personal contact details you provide. We process data strictly with explicit consent, for specified administrative purposes related to clinical healthcare appointment coordination.
              </p>
            </section>

            <section className="p-8 rounded-3xl bg-white border border-ink/10 shadow-xs">
              <h2 className="font-serif text-2xl font-light text-forest mb-3">
                2. Categories of Personal Data Collected
              </h2>
              <p>
                Through our public booking platform, we collect minimal administrative intake parameters:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1.5 text-ink/80">
                <li><strong>Identity Information:</strong> Patient full name, age, and preferred mode of address.</li>
                <li><strong>Contact Identifiers:</strong> 10-digit Indian mobile telephone number and optional email address.</li>
                <li><strong>Appointment Parameters:</strong> Preferred visit date, requested time window, consultation type, and visit format (in-clinic or video).</li>
                <li><strong>Communication Consent:</strong> Timestamped record of WhatsApp messaging opt-in status.</li>
              </ul>
              <div className="mt-4 p-4 rounded-2xl bg-forest/5 border border-forest/15 text-xs text-forest">
                <strong>Medical Confidentiality Standard:</strong> We deliberately do not request detailed medical diagnostic files, lab histories, or intimate constitutional symptom notes through the public intake web form. Those are gathered confidentially in person or via direct 1-on-1 dialogue with {SITE_CONFIG.doctor.name}.
              </div>
            </section>

            <section className="p-8 rounded-3xl bg-cream border border-ink/10 shadow-xs">
              <h2 className="font-serif text-2xl font-light text-forest mb-3">
                3. Lawful Basis &amp; Purpose of Processing
              </h2>
              <p>Your details are processed strictly for:</p>
              <ul className="list-disc pl-5 mt-3 space-y-1.5 text-ink/80">
                <li>Generating unique appointment references and preventing slot collisions.</li>
                <li>Dispatching official appointment acknowledgments, confirmations, and reminders via transactional channels.</li>
                <li>Managing clinical receptionist triage and doctor scheduling.</li>
              </ul>
            </section>

            <section className="p-8 rounded-3xl bg-white border border-ink/10 shadow-xs">
              <h2 className="font-serif text-2xl font-light text-forest mb-3">
                4. WhatsApp Communications &amp; Consent Revocation
              </h2>
              <p>
                WhatsApp notifications are strictly opt-in. We do not engage in marketing broadcasts or cold messaging. You retain the right to withdraw WhatsApp communication consent at any time by replying <strong>STOP</strong> on WhatsApp or emailing <a href={`mailto:${SITE_CONFIG.contact.email}`} className="text-forest font-medium underline">{SITE_CONFIG.contact.email}</a>.
              </p>
            </section>

            <section className="p-8 rounded-3xl bg-cream border border-ink/10 shadow-xs">
              <h2 className="font-serif text-2xl font-light text-forest mb-3">
                5. Data Principal Rights &amp; Grievance Redressal
              </h2>
              <p>
                In accordance with Sections 11–13 of the DPDP Act 2023, you have the right to access your stored records, request rectification of inaccurate data, or request erasure of appointment history.
              </p>
              <div className="mt-4 p-4 rounded-2xl bg-white border border-ink/10 space-y-1 text-xs">
                <p><strong>Grievance Officer:</strong> Clinic Data Administrator, VSHMA Homeopathy Clinic</p>
                <p><strong>Official Email:</strong> <a href={`mailto:${SITE_CONFIG.contact.email}`} className="text-forest underline">{SITE_CONFIG.contact.email}</a></p>
                <p><strong>Location:</strong> Bengaluru, Karnataka, India</p>
                <p><strong>Response Turnaround:</strong> Inquiries are addressed within 7 business working days.</p>
              </div>
            </section>

            <section className="p-8 rounded-3xl bg-forest text-bone shadow-md">
              <h2 className="font-serif text-2xl font-light text-brass mb-3">
                6. Clinical &amp; Emergency Disclaimer
              </h2>
              <p className="text-sage/90 text-sm leading-relaxed">
                Website interaction and digital appointment reservations do not constitute immediate emergency medical intervention. If you or a family member are experiencing acute distress, please contact an emergency medical care facility immediately.
              </p>
            </section>
          </div>
        </div>
    </div>
  );
}
