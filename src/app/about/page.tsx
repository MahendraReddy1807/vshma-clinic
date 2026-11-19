import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import AboutSection from '@/components/sections/AboutSection';
import { CLINIC_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About the Doctor',
  description: `Meet ${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification}) at VSHMA in Bengaluru.`,
};

export default function AboutPage() {
  return <div className="min-h-screen flex flex-col bg-white"><Navbar /><main className="flex-1 pt-16"><AboutSection /></main><Footer /><FloatingWhatsApp /></div>;
}
