import type { Metadata } from 'next';
import ContactSection from '@/components/sections/ContactSection';
import { CLINIC_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Contact & Appointments | ${CLINIC_INFO.fullName}`,
  description: `Contact VSHMA Homeopathy Clinic in Bengaluru. Reach out via WhatsApp or submit an inquiry to schedule an appointment with Dr. Chihnitha Reddy T.`,
};

export default function ContactPage() {
  return (
    <div className="w-full pt-24 sm:pt-32">
      <ContactSection />
    </div>
  );
}
