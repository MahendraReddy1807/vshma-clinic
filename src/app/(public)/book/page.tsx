import type { Metadata } from 'next';
import BookingSection from '@/components/sections/BookingSection';
import { CLINIC_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Book a Consultation | ${CLINIC_INFO.fullName}`,
  description: `Schedule your unhurried consultation with Dr. Chihnitha Reddy T (BHMS) at VSHMA Homeopathy Clinic in Bengaluru. Instant booking reference generated.`,
};

export default function BookPage() {
  return (
    <div className="w-full pt-24 sm:pt-32">
      <BookingSection />
    </div>
  );
}
