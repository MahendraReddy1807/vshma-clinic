import type { Metadata } from 'next';
import TreatmentDirectory from '@/components/sections/TreatmentDirectory';
import { CLINIC_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Consultations & Treatments Guide',
  description: `Complete guide to homeopathic consultations and clinical care with ${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification}) at ${CLINIC_INFO.fullName} in Bengaluru.`,
};

export default function TreatmentsPage() {
  return (
    <div className="w-full">
      <TreatmentDirectory />
    </div>
  );
}
